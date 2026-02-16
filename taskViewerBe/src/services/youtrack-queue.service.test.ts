import { describe, it, expect, beforeEach } from 'vitest';
import { youtrackQueueService } from './youtrack-queue.service.ts';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { YouTrackTaskStatusEnum } from '../types/queue.types.ts';

const TASKS_DIR = process.env.TASKS_DIR || '';
const QUEUE_FILE = join(TASKS_DIR, 'youtrack-queue', 'queue.json');

async function clearQueueFile() {
  if (existsSync(QUEUE_FILE)) {
    await rm(QUEUE_FILE, { force: true });
  }
}

describe('youtrackQueueService', () => {
  beforeEach(async () => {
    await clearQueueFile();
  });

  it('enqueue adds operation with attempts: 0', async () => {
    const op = await youtrackQueueService.enqueue({
      type: 'link_issue',
      data: { taskId: 't1', youtrackIssueId: 'PROJ-1' },
    });
    expect(op.attempts).toBe(0);
    expect(op.status).toBe('pending');
  });

  it('updateOperationStatus(completed) does not increment attempts', async () => {
    const op = await youtrackQueueService.enqueue({
      type: 'link_issue',
      data: { taskId: 't1', youtrackIssueId: 'PROJ-1' },
    });
    await youtrackQueueService.updateOperationStatus(op.id, YouTrackTaskStatusEnum.processing);
    await youtrackQueueService.updateOperationStatus(op.id, YouTrackTaskStatusEnum.completed, undefined, { success: true });
    const updated = await youtrackQueueService.getOperation(op.id);
    expect(updated?.attempts).toBe(0);
  });

  it('updateOperationStatus(failed) increments attempts', async () => {
    const op = await youtrackQueueService.enqueue({
      type: 'link_issue',
      data: { taskId: 't1', youtrackIssueId: 'PROJ-1' },
    });
    await youtrackQueueService.updateOperationStatus(op.id, 'failed', 'Error');
    const updated = await youtrackQueueService.getOperation(op.id);
    expect(updated?.attempts).toBe(1);
  });

  it('updateOperationStatus(pending) increments attempts', async () => {
    const op = await youtrackQueueService.enqueue({
      type: 'create_issue',
      data: { taskId: 't1', templateId: 'default' },
    });
    await youtrackQueueService.updateOperationStatus(op.id, YouTrackTaskStatusEnum.pending, 'Retry');
    const updated = await youtrackQueueService.getOperation(op.id);
    expect(updated?.attempts).toBe(1);
  });
});
