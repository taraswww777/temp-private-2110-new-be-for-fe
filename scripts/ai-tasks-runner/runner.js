#!/usr/bin/env node
/**
 * AI Tasks Runner — последовательное выполнение заданий из манифеста
 * с запуском агентов (exec, verify, actualize) и фиксацией в git.
 *
 * Все переменные конфигурации можно задать в корневом .env репозитория (префикс AI_TASKS_).
 * См. README и блок ниже.
 *
 * Использование:
 *   node scripts/ai-tasks-runner/runner.js [--dry-run] [--config path] [--task-ids id1,id2] [--start-from id] [--no-push] [--no-pull]
 */

const path = require('path');
const fs = require('fs');
const { REPO_ROOT, resolveFromRepo, getTaskNameFromFile, buildBranchName } = require('./lib/paths');

// Загрузка переменных из корневого .env (до использования process.env в конфиге)
require('dotenv').config({ path: path.join(REPO_ROOT, '.env') });
const {
  ensureLogsDir,
  formatDateForFilename,
  buildLogFilename,
  writeLog,
  withMeta,
} = require('./lib/logging');
const git = require('./lib/git');
const {
  runExecAgent,
  runVerifyAgent,
  runActualizeAgent,
} = require('./lib/agents');

// --- CLI ---
const args = process.argv.slice(2);
const getOpt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const hasOpt = (name) => args.includes(name);
const dryRun = hasOpt('--dry-run');
const configPath = getOpt('--config') || process.env.AI_TASKS_CONFIG;
const taskIdsStr = getOpt('--task-ids');
const startFrom = getOpt('--start-from');
const noPush = hasOpt('--no-push');
const noPull = hasOpt('--no-pull');

// --- Config (default → config file → .env) ---
function parseBool(value) {
  if (value === undefined || value === '') return undefined;
  const v = String(value).toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function configFromEnv() {
  const env = process.env;
  const out = {};
  if (env.AI_TASKS_MANIFEST_PATH != null) out.manifestPath = env.AI_TASKS_MANIFEST_PATH;
  if (env.AI_TASKS_TASKS_DIR != null) out.tasksDir = env.AI_TASKS_TASKS_DIR;
  if (env.AI_TASKS_LOGS_DIR != null) out.logsDir = env.AI_TASKS_LOGS_DIR;
  if (env.AI_TASKS_BASE_BRANCH != null) out.baseBranch = env.AI_TASKS_BASE_BRANCH;
  if (env.AI_TASKS_BRANCH_TEMPLATE != null) out.branchTemplate = env.AI_TASKS_BRANCH_TEMPLATE;
  if (env.AI_TASKS_MAX_ATTEMPTS != null) out.maxAttempts = parseInt(env.AI_TASKS_MAX_ATTEMPTS, 10);
  if (env.AI_TASKS_STATUS_FILTER != null) out.statusFilter = env.AI_TASKS_STATUS_FILTER;
  if (env.AI_TASKS_COMMIT_LOGS != null) out.commitLogs = parseBool(env.AI_TASKS_COMMIT_LOGS);
  if (env.AI_TASKS_EMPTY_COMMIT_IF_NO_CHANGES != null) out.emptyCommitIfNoChanges = parseBool(env.AI_TASKS_EMPTY_COMMIT_IF_NO_CHANGES);
  if (env.AI_TASKS_REMOTE != null) out.remote = env.AI_TASKS_REMOTE;
  return out;
}

function loadConfig() {
  const defaultPath = path.join(__dirname, 'config.default.json');
  const defaultConfig = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const filePath = configPath ? path.resolve(REPO_ROOT, configPath) : path.join(__dirname, 'config.default.json');
  let fileConfig = {};
  if (fs.existsSync(filePath)) {
    fileConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  const envConfig = configFromEnv();
  const merged = {
    ...defaultConfig,
    ...fileConfig,
    ...envConfig,
  };
  return {
    ...merged,
    commitLogs: merged.commitLogs !== undefined ? merged.commitLogs : defaultConfig.commitLogs,
    emptyCommitIfNoChanges: merged.emptyCommitIfNoChanges !== undefined
      ? merged.emptyCommitIfNoChanges
      : defaultConfig.emptyCommitIfNoChanges,
  };
}

// --- Manifest ---
function loadManifest(manifestPath) {
  const absolute = resolveFromRepo(manifestPath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Manifest not found: ${absolute}`);
  }
  const data = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  return Array.isArray(data.tasks) ? data.tasks : data;
}

function filterTasks(tasks, config) {
  let list = tasks;
  if (taskIdsStr) {
    const ids = taskIdsStr.split(',').map((s) => s.trim()).filter(Boolean);
    list = list.filter((t) => ids.includes(t.id));
  } else if (config.statusFilter) {
    list = list.filter((t) => (t.status || '').toLowerCase() === config.statusFilter.toLowerCase());
  }
  list = list.filter((t) => (t.status || '').toLowerCase() !== 'completed');
  if (startFrom) {
    const idx = list.findIndex((t) => t.id === startFrom);
    list = idx >= 0 ? list.slice(idx) : list;
  }
  return list;
}

// --- Commit helper ---
function doCommit(message, config) {
  if (!git.hasChanges() && !config.emptyCommitIfNoChanges) return;
  const allowEmpty = config.emptyCommitIfNoChanges && !git.hasChanges();
  const exceptPath = config.commitLogs === false ? config.logsDir : null;
  git.commit(message, allowEmpty, exceptPath);
}

// --- Main loop ---
async function main() {
  const config = loadConfig();
  const manifestPath = resolveFromRepo(config.manifestPath);
  const tasksDir = resolveFromRepo(config.tasksDir || 'docs/tasks');
  const logsDir = config.logsDir;
  const maxAttempts = config.maxAttempts || 5;

  ensureLogsDir(logsDir);

  const allTasks = loadManifest(config.manifestPath);
  const tasks = filterTasks(allTasks, config);

  if (tasks.length === 0) {
    console.log('No tasks to run.');
    process.exit(0);
  }

  if (dryRun) {
    console.log('Dry run. Tasks that would be run:');
    tasks.forEach((t) => {
      const branchName = buildBranchName(t, config.branchTemplate);
      console.log(`  ${t.id} ${t.file} -> branch: ${branchName}`);
    });
    process.exit(0);
  }

  if (git.hasChanges()) {
    console.error(
      'Error: there are uncommitted changes. Commit or stash them before running the runner.\n' +
        '  git status\n' +
        '  git stash   # или git add ... && git commit ...'
    );
    process.exit(1);
  }

  if (!noPull) {
    try {
      git.pull(config.baseBranch);
    } catch (e) {
      console.warn('Pull failed (continuing):', e.message);
    }
  }

  for (const task of tasks) {
    const taskName = getTaskNameFromFile(task.file);
    const taskPath = path.join(tasksDir, task.file);
    const branchName = buildBranchName(task, config.branchTemplate);

    console.log(`\n--- ${task.id} ${task.file} ---`);
    git.ensureBranch(branchName, config.baseBranch);

    let attempt = 1;
    let verified = false;

    while (attempt <= maxAttempts) {
      const ts = new Date();
      const dateStr = formatDateForFilename(ts);

      console.log(`  Attempt ${attempt}/${maxAttempts}`);

      const logExecName = buildLogFilename(taskName, 'exec', { attempt, date: ts });
      const logExecPath = path.join(resolveFromRepo(logsDir), logExecName);

      const execResult = await runExecAgent(
        task,
        attempt,
        taskPath,
        logExecPath,
        config
      );
      const execContent = withMeta(
        [execResult.stdout, execResult.stderr].filter(Boolean).join('\n'),
        { taskId: task.id, attempt, agent: 'exec', startedAt: ts.toISOString() }
      );
      writeLog(logsDir, logExecName, execContent);
      doCommit(`[${task.id}] attempt ${attempt}: exec`, config);

      const logVerifyName = buildLogFilename(taskName, 'verify', { attempt, date: ts });
      const logVerifyPath = path.join(resolveFromRepo(logsDir), logVerifyName);

      const verifyResult = await runVerifyAgent(
        task,
        attempt,
        taskPath,
        logVerifyPath,
        config
      );
      const verifyContent = withMeta(
        [verifyResult.stdout, verifyResult.stderr].filter(Boolean).join('\n'),
        { taskId: task.id, attempt, agent: 'verify', startedAt: ts.toISOString() }
      );
      writeLog(logsDir, logVerifyName, verifyContent);
      doCommit(`[${task.id}] attempt ${attempt}: verify`, config);

      if (verifyResult.success) {
        verified = true;
        console.log(`  Verify OK (attempt ${attempt})`);
        break;
      }
      attempt++;
    }

    if (!verified) {
      const ts = new Date();
      const stopLogName = buildLogFilename(taskName, 'stop', { date: ts });
      const stopContent = [
        '# Остановка скрипта',
        '',
        `- **id задачи:** ${task.id}`,
        `- **причина:** задание не решено за ${maxAttempts} попыток`,
        `- **дата/время:** ${ts.toISOString()}`,
        '',
        '## Сводка по попыткам',
        '',
        'См. логи exec/verify в этой папке по имени задания и дате.',
        '',
      ].join('\n');
      writeLog(logsDir, stopLogName, withMeta(stopContent, { taskId: task.id, agent: 'stop', startedAt: ts.toISOString() }));
      doCommit(`[${task.id}] stop: не решено за ${maxAttempts} попыток`, config);
      if (!noPush) git.push(config.remote, branchName);
      console.error(`Stop: task ${task.id} failed after ${maxAttempts} attempts.`);
      process.exit(1);
    }

    const tsActualize = new Date();
    const logActualizeName = buildLogFilename(taskName, 'actualize', { date: tsActualize });
    const logActualizePath = path.join(resolveFromRepo(logsDir), logActualizeName);

    const actualizeResult = await runActualizeAgent(
      task,
      taskPath,
      manifestPath,
      branchName,
      logActualizePath,
      config
    );
    const actualizeContent = withMeta(
      [actualizeResult.stdout, actualizeResult.stderr].filter(Boolean).join('\n'),
      { taskId: task.id, agent: 'actualize', startedAt: tsActualize.toISOString() }
    );
    writeLog(logsDir, logActualizeName, actualizeContent);
    doCommit(`[${task.id}] actualize`, config);

    if (!noPush) git.push(config.remote, branchName);
    console.log(`  Pushed ${branchName}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
