import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStatusEnum } from '../types/taskStatusEnum.ts';

import { YouTrackTaskStatusEnum } from '../types/queue.types.ts';

const mockGetIssue = vi.fn();
const mockAddLink = vi.fn();
const mockRemoveLink = vi.fn();
const mockUpdateOperationStatus = vi.fn();

vi.mock('./youtrack-api.service.ts', () => ({
  youtrackApiService: {
    isConfigured: () => true,
    isUnavailable: () => false,
    getIssue: (...args: unknown[]) => mockGetIssue(...args),
  },
}));

vi.mock('./youtrack-queue.service.ts', () => ({
  youtrackQueueService: {
    updateOperationStatus: (...args: unknown[]) =>
      mockUpdateOperationStatus(...args),
  },
}));

vi.mock('./youtrack-links.service.ts', () => ({
  youtrackLinksService: {
    addLink: (...args: unknown[]) => mockAddLink(...args),
    removeLink: (...args: unknown[]) => mockRemoveLink(...args),
  },
}));

const { youtrackProcessorService } = await import(
  './youtrack-processor.service.ts'
);

function linkOperation(overrides: Partial<{ id: string; taskId: string; youtrackIssueId: string }> = {}) {
  return {
    id: 'op-1',
    type: 'link_issue' as const,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    attempts: 0,
    data: {
      taskId: 't1',
      youtrackIssueId: 'VTB-100',
    },
    ...overrides,
  };
}

function unlinkOperation(overrides: Partial<{ id: string; taskId: string; youtrackIssueId: string }> = {}) {
  return {
    id: 'op-2',
    type: 'unlink_issue' as const,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    attempts: 0,
    data: {
      taskId: 't1',
      youtrackIssueId: 'VTB-100',
    },
    ...overrides,
  };
}

describe('youtrackProcessorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateOperationStatus.mockResolvedValue(undefined);
    mockGetIssue.mockResolvedValue({ id: '1-1', idReadable: 'VTB-100', summary: 'Test' });
    mockAddLink.mockResolvedValue({});
    mockRemoveLink.mockResolvedValue({});
  });

  describe('isYouTrackAvailable', () => {
    it('returns true when API is configured and not unavailable', () => {
      expect(youtrackProcessorService.isYouTrackAvailable()).toBe(true);
    });
  });

  describe('processOperation link_issue', () => {
    it('updates status to processing then completed and calls getIssue and addLink', async () => {
      const op = linkOperation();

      await youtrackProcessorService.processOperation(op);

      expect(mockUpdateOperationStatus).toHaveBeenCalledWith(op.id, 'processing');
      expect(mockGetIssue).toHaveBeenCalledWith('VTB-100');
      expect(mockAddLink).toHaveBeenCalledWith('t1', 'VTB-100');
      expect(mockUpdateOperationStatus).toHaveBeenCalledWith(
        op.id,
        YouTrackTaskStatusEnum.completed,
        undefined,
        { success: true }
      );
      expect((op as { result?: { success: boolean } }).result).toEqual({ success: true });
    });

    it('on getIssue error updates status to pending and rethrows', async () => {
      mockGetIssue.mockRejectedValueOnce(new Error('Not found'));
      const op = linkOperation();

      await expect(
        youtrackProcessorService.processOperation(op)
      ).rejects.toThrow('Not found');

      expect(mockUpdateOperationStatus).toHaveBeenCalledWith(op.id, 'processing');
      expect(mockUpdateOperationStatus).toHaveBeenCalledWith(
        op.id,
        'pending',
        'Not found'
      );
    });
  });

  describe('processOperation unlink_issue', () => {
    it('calls removeLink and updates status to completed', async () => {
      const op = unlinkOperation();

      await youtrackProcessorService.processOperation(op);

      expect(mockUpdateOperationStatus).toHaveBeenCalledWith(op.id, 'processing');
      expect(mockRemoveLink).toHaveBeenCalledWith('t1', 'VTB-100');
      expect(mockUpdateOperationStatus).toHaveBeenCalledWith(
        op.id,
        YouTrackTaskStatusEnum.completed,
        undefined,
        { success: true }
      );
      expect((op as { result?: { success: boolean } }).result).toEqual({ success: true });
    });
  });
});
