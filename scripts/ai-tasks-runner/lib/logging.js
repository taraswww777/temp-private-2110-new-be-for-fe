const path = require('path');
const fs = require('fs');
const { resolveFromRepo } = require('./paths');

/**
 * Ensure logs directory exists.
 * @param {string} logsDir - path relative to repo root or absolute
 * @returns {string} absolute path to logs dir
 */
function ensureLogsDir(logsDir) {
  const absolute = path.isAbsolute(logsDir) ? logsDir : resolveFromRepo(logsDir);
  if (!fs.existsSync(absolute)) {
    fs.mkdirSync(absolute, { recursive: true });
  }
  return absolute;
}

/**
 * Format date for log filename: 2026-01-30T12-00-00
 */
function formatDateForFilename(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Build log filename: {taskName}-{date}-{step}-{agent}-log.md
 * @param {string} taskName - e.g. TASK-017-fe-ui-api2-spec-and-update
 * @param {string} agent - exec | verify | actualize | stop
 * @param {object} options - { attempt?, date? }
 */
function buildLogFilename(taskName, agent, options = {}) {
  const date = options.date ? formatDateForFilename(options.date) : formatDateForFilename();
  const step = options.attempt != null ? `attempt-${options.attempt}` : '';
  const parts = [taskName, date];
  if (step) parts.push(step);
  parts.push(agent, 'log.md');
  return parts.join('-');
}

/**
 * Write log file to logsDir.
 * @param {string} logsDir - relative to repo or absolute
 * @param {string} filename
 * @param {string} content
 * @returns {string} absolute path to written file
 */
function writeLog(logsDir, filename, content) {
  const dir = path.isAbsolute(logsDir) ? logsDir : resolveFromRepo(logsDir);
  ensureLogsDir(dir);
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

/**
 * Append metadata header to log content.
 */
function withMeta(content, meta) {
  const header = [
    '---',
    `taskId: ${meta.taskId || ''}`,
    `attempt: ${meta.attempt ?? ''}`,
    `agent: ${meta.agent || ''}`,
    `startedAt: ${meta.startedAt || new Date().toISOString()}`,
    '---',
    '',
  ].join('\n');
  return header + content;
}

module.exports = {
  ensureLogsDir,
  formatDateForFilename,
  buildLogFilename,
  writeLog,
  withMeta,
};
