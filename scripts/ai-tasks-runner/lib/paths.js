const path = require('path');
const fs = require('fs');

/**
 * Find repository root (directory containing .git) from startDir upward.
 * @param {string} startDir
 * @returns {string|null}
 */
function findRepoRoot(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

const REPO_ROOT = findRepoRoot(__dirname) || path.resolve(__dirname, '../../..');

function resolveFromRepo(relativePath) {
  return path.join(REPO_ROOT, relativePath);
}

function getTaskNameFromFile(taskFile) {
  return path.basename(taskFile, '.md');
}

function getBranchSlug(taskId, taskFile) {
  const name = getTaskNameFromFile(taskFile);
  const withoutPrefix = name.replace(/^TASK-\d+-/i, '');
  return withoutPrefix || taskId;
}

/**
 * Build branch name from template: feature/{{id}}-{{slug}}
 */
function buildBranchName(task, template) {
  const slug = getBranchSlug(task.id, task.file);
  return template
    .replace(/\{\{id\}\}/gi, task.id)
    .replace(/\{\{slug\}\}/gi, slug);
}

module.exports = {
  REPO_ROOT,
  findRepoRoot,
  resolveFromRepo,
  getTaskNameFromFile,
  getBranchSlug,
  buildBranchName,
};
