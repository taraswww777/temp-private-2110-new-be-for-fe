#!/usr/bin/env node
/**
 * AI Tasks Runner — последовательное выполнение заданий из манифеста
 * с запуском агентов (exec, verify, actualize) и фиксацией в git.
 *
 * Использование:
 *   node scripts/ai-tasks-runner/runner.js [--dry-run] [--config path] [--task-ids id1,id2] [--start-from id] [--no-push] [--no-pull]
 *
 * Переменные окружения:
 *   AI_TASKS_EXEC_CMD, AI_TASKS_VERIFY_CMD, AI_TASKS_ACTUALIZE_CMD — переопределение команд агентов
 *   AI_TASKS_CONFIG — путь к конфигу (если не --config)
 */

const path = require('path');
const fs = require('fs');
const { REPO_ROOT, resolveFromRepo, getTaskNameFromFile, buildBranchName } = require('./lib/paths');
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

// --- Config ---
function loadConfig() {
  const defaultPath = path.join(__dirname, 'config.default.json');
  const defaultConfig = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const filePath = configPath ? path.resolve(REPO_ROOT, configPath) : path.join(__dirname, 'config.default.json');
  let fileConfig = {};
  if (fs.existsSync(filePath)) {
    fileConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {
    ...defaultConfig,
    ...fileConfig,
    commitLogs: fileConfig.commitLogs !== undefined ? fileConfig.commitLogs : defaultConfig.commitLogs,
    emptyCommitIfNoChanges: fileConfig.emptyCommitIfNoChanges !== undefined
      ? fileConfig.emptyCommitIfNoChanges
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
