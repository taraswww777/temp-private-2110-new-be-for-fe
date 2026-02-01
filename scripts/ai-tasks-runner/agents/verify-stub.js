#!/usr/bin/env node
/**
 * Stub for "verify" agent (task verification).
 * Replace with real verifier via AI_TASKS_VERIFY_CMD.
 * Exit 0 = task solved correctly, non-zero = needs more work.
 * Reads: TASK_ID, TASK_PATH, REPO_ROOT, ATTEMPT from env.
 */
const taskId = process.env.TASK_ID || 'unknown';
const taskPath = process.env.TASK_PATH || '';
const attempt = process.env.ATTEMPT || '1';

console.log(`[verify-stub] TASK_ID=${taskId} ATTEMPT=${attempt} TASK_PATH=${taskPath}`);
console.log('[verify-stub] Replace with real verifier; exit 0 = success.');
process.exit(0);
