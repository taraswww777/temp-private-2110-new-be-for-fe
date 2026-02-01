const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { REPO_ROOT, resolveFromRepo } = require('./paths');

/**
 * Run a command with env and capture stdout/stderr to a string.
 * @param {object} options - { command, args?, env?, cwd?, timeout? }
 * @returns {Promise<{ stdout: string, stderr: string, code: number }>}
 */
function runAgent(options) {
  const { command, args = [], env = {}, cwd = REPO_ROOT, timeout } = options;
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    const timer = timeout
      ? setTimeout(() => {
          proc.kill('SIGTERM');
          stderr += '\n[Runner] Killed by timeout\n';
        }, timeout)
      : null;
    proc.on('close', (code, signal) => {
      if (timer) clearTimeout(timer);
      resolve({
        stdout,
        stderr,
        code: code != null ? code : (signal ? 143 : 0),
      });
    });
    proc.on('error', (err) => {
      if (timer) clearTimeout(timer);
      resolve({
        stdout,
        stderr: stderr + (err.message || String(err)),
        code: 1,
      });
    });
  });
}

/**
 * Build env for agent: TASK_ID, TASK_FILE, TASK_PATH, REPO_ROOT, ATTEMPT, etc.
 */
function buildAgentEnv(task, attempt, taskPath, logPath, extra = {}) {
  return {
    TASK_ID: task.id,
    TASK_FILE: task.file,
    TASK_PATH: taskPath,
    REPO_ROOT,
    ATTEMPT: String(attempt),
    LOG_PATH: logPath || '',
    ...extra,
  };
}

/**
 * Resolve agent config: env overrides (AI_TASKS_EXEC_CMD etc.) or config.default.
 */
function getAgentCommand(agentKey, config) {
  const envKey = `AI_TASKS_${agentKey.toUpperCase()}_CMD`;
  const fromEnv = process.env[envKey];
  if (fromEnv) {
    const parts = fromEnv.trim().split(/\s+/);
    return { command: parts[0], args: parts.slice(1) };
  }
  const block = config[`${agentKey}Agent`] || config.execAgent;
  if (!block) return null;
  return {
    command: block.command || 'node',
    args: Array.isArray(block.args) ? block.args : [],
  };
}

/**
 * Run exec agent for task/attempt; return { success, stdout, stderr, code }.
 * success = (code === 0).
 */
async function runExecAgent(task, attempt, taskPath, logPath, config) {
  const cmd = getAgentCommand('exec', config);
  if (!cmd) {
    return { success: false, stdout: '', stderr: 'Exec agent not configured', code: 1 };
  }
  const env = buildAgentEnv(task, attempt, taskPath, logPath);
  const result = await runAgent({
    command: cmd.command,
    args: (cmd.args || []).map((a) =>
      a.replace(/\{\{TASK_PATH\}\}/g, taskPath).replace(/\{\{ATTEMPT\}\}/g, String(attempt))
    ),
    env,
    timeout: config.execTimeoutMs,
  });
  return {
    success: result.code === 0,
    stdout: result.stdout,
    stderr: result.stderr,
    code: result.code,
  };
}

/**
 * Run verify agent; return { success, stdout, stderr, code }.
 * Verifier should exit 0 if task is solved correctly.
 */
async function runVerifyAgent(task, attempt, taskPath, logPath, config) {
  const cmd = getAgentCommand('verify', config);
  if (!cmd) {
    return { success: false, stdout: '', stderr: 'Verify agent not configured', code: 1 };
  }
  const env = buildAgentEnv(task, attempt, taskPath, logPath);
  const result = await runAgent({
    command: cmd.command,
    args: (cmd.args || []).map((a) =>
      a.replace(/\{\{TASK_PATH\}\}/g, taskPath).replace(/\{\{ATTEMPT\}\}/g, String(attempt))
    ),
    env,
    timeout: config.verifyTimeoutMs,
  });
  return {
    success: result.code === 0,
    stdout: result.stdout,
    stderr: result.stderr,
    code: result.code,
  };
}

/**
 * Run actualize agent (update task doc and manifest).
 */
async function runActualizeAgent(task, taskPath, manifestPath, branchName, logPath, config) {
  const cmd = getAgentCommand('actualize', config);
  if (!cmd) {
    return { success: false, stdout: '', stderr: 'Actualize agent not configured', code: 1 };
  }
  const env = {
    ...buildAgentEnv(task, null, taskPath, logPath, { ATTEMPT: '' }),
    MANIFEST_PATH: manifestPath,
    BRANCH_NAME: branchName,
  };
  const result = await runAgent({
    command: cmd.command,
    args: (cmd.args || []).map((a) =>
      a
        .replace(/\{\{TASK_PATH\}\}/g, taskPath)
        .replace(/\{\{MANIFEST_PATH\}\}/g, manifestPath)
        .replace(/\{\{BRANCH_NAME\}\}/g, branchName)
    ),
    env,
    timeout: config.actualizeTimeoutMs,
  });
  return {
    success: result.code === 0,
    stdout: result.stdout,
    stderr: result.stderr,
    code: result.code,
  };
}

module.exports = {
  runAgent,
  buildAgentEnv,
  getAgentCommand,
  runExecAgent,
  runVerifyAgent,
  runActualizeAgent,
};
