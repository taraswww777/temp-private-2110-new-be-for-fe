const { execSync } = require('child_process');
const path = require('path');
const { REPO_ROOT } = require('./paths');

function runGit(args, cwd = REPO_ROOT) {
  const cmd = ['git', ...args].join(' ');
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function getCurrentBranch() {
  return runGit(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
}

function branchExists(branchName) {
  try {
    runGit(['rev-parse', '--verify', branchName]);
    return true;
  } catch {
    return false;
  }
}

function createBranch(branchName, fromBranch) {
  runGit(['checkout', '-b', branchName, fromBranch]);
  return getCurrentBranch();
}

function checkoutBranch(branchName) {
  runGit(['checkout', branchName]);
  return getCurrentBranch();
}

function ensureBranch(branchName, baseBranch) {
  if (getCurrentBranch() === branchName) return branchName;
  if (branchExists(branchName)) {
    checkoutBranch(branchName);
    return branchName;
  }
  createBranch(branchName, baseBranch);
  return branchName;
}

function hasChanges() {
  const status = runGit(['status', '--porcelain']);
  return status.length > 0;
}

/**
 * Stage all changes; if exceptPath (relative to cwd) is set, reset that path so it's not staged.
 */
function stageForCommit(exceptPath) {
  runGit(['add', '-A']);
  if (exceptPath) {
    try {
      runGit(['reset', '--', exceptPath]);
    } catch (_) {}
  }
}

function commit(message, allowEmpty = false, exceptPath = null) {
  stageForCommit(exceptPath);
  const args = ['commit', '-m', message];
  if (allowEmpty) args.push('--allow-empty');
  runGit(args);
}

function push(remote, branch) {
  runGit(['push', remote || 'origin', branch || getCurrentBranch()]);
}

function pull(branch) {
  try {
    runGit(['pull', '--ff-only', 'origin', branch || getCurrentBranch()]);
  } catch (e) {
    // non-fast-forward or not tracking — caller may decide
    throw e;
  }
}

module.exports = {
  runGit,
  getCurrentBranch,
  branchExists,
  createBranch,
  checkoutBranch,
  ensureBranch,
  hasChanges,
  commit,
  push,
  pull,
};
