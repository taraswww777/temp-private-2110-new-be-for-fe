#!/usr/bin/env node
/**
 * Stub for "exec" agent (task executor).
 * Replace with Cursor CLI/API or custom command via AI_TASKS_EXEC_CMD.
 * Reads: TASK_ID, TASK_PATH, REPO_ROOT, ATTEMPT from env.
 */
const taskId = process.env.TASK_ID || 'unknown';
const taskPath = process.env.TASK_PATH || '';
const attempt = process.env.ATTEMPT || '1';

console.log(`[exec-stub] TASK_ID=${taskId} ATTEMPT=${attempt} TASK_PATH=${taskPath}`);
console.log('[exec-stub] Replace this script with Cursor agent or set AI_TASKS_EXEC_CMD.');
process.exit(0);
