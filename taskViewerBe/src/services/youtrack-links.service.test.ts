import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFile, writeFile } from 'fs/promises';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

const mockGetAllTasks = vi.fn();
vi.mock('./tasks.service.ts', () => ({
  tasksService: {
    getAllTasks: () => mockGetAllTasks(),
  },
}));

const { youtrackLinksService } = await import('./youtrack-links.service.ts');

import { TaskStatusEnum } from '../types/taskStatusEnum.ts';

const defaultTask = {
  id: 't1',
  title: 'Task 1',
  status: TaskStatusEnum.backlog,
  priority: 'medium' as const,
  file: 't1.md',
  createdDate: null,
  completedDate: null,
  branch: null,
  youtrackIssueIds: [] as string[],
};

function manifestWithTasks(tasks: Array<{ id: string; youtrackIssueIds?: string[] }>) {
  return JSON.stringify({
    tasks: tasks.map((t) => ({
      ...defaultTask,
      ...t,
    })),
  });
}

describe('youtrackLinksService', () => {
  beforeEach(() => {
    vi.mocked(readFile).mockReset();
    vi.mocked(writeFile).mockReset();
    mockGetAllTasks.mockReset();
  });

  describe('getTaskFromManifest', () => {
    it('returns task when found', async () => {
      mockGetAllTasks.mockResolvedValue([
        { ...defaultTask, id: 't1' },
        { ...defaultTask, id: 't2' },
      ]);

      const task = await youtrackLinksService.getTaskFromManifest('t2');
      expect(task?.id).toBe('t2');
    });

    it('returns null when task not found', async () => {
      mockGetAllTasks.mockResolvedValue([{ ...defaultTask, id: 't1' }]);

      const task = await youtrackLinksService.getTaskFromManifest('t99');
      expect(task).toBeNull();
    });
  });

  describe('addLink', () => {
    it('adds youtrackIssueId to task and writes manifest', async () => {
      const initial = manifestWithTasks([{ id: 't1', youtrackIssueIds: [] }]);
      vi.mocked(readFile).mockResolvedValue(initial);

      const updated = await youtrackLinksService.addLink('t1', 'VTB-100');

      expect(updated.youtrackIssueIds).toEqual(['VTB-100']);
      expect(writeFile).toHaveBeenCalledTimes(1);
      const written = JSON.parse(vi.mocked(writeFile).mock.calls[0][1] as string);
      expect(written.tasks[0].youtrackIssueIds).toEqual(['VTB-100']);
    });

    it('appends to existing youtrackIssueIds', async () => {
      const initial = manifestWithTasks([
        { id: 't1', youtrackIssueIds: ['VTB-1'] },
      ]);
      vi.mocked(readFile).mockResolvedValue(initial);

      const updated = await youtrackLinksService.addLink('t1', 'VTB-2');

      expect(updated.youtrackIssueIds).toEqual(['VTB-1', 'VTB-2']);
    });

    it('throws when task not found', async () => {
      const initial = manifestWithTasks([{ id: 't1' }]);
      vi.mocked(readFile).mockResolvedValue(initial);

      await expect(
        youtrackLinksService.addLink('t99', 'VTB-100')
      ).rejects.toThrow('Task with id "t99" not found');
    });

    it('throws when link already exists', async () => {
      const initial = manifestWithTasks([
        { id: 't1', youtrackIssueIds: ['VTB-100'] },
      ]);
      vi.mocked(readFile).mockResolvedValue(initial);

      await expect(
        youtrackLinksService.addLink('t1', 'VTB-100')
      ).rejects.toThrow('Link to YouTrack issue "VTB-100" already exists');
    });
  });

  describe('removeLink', () => {
    it('removes youtrackIssueId and writes manifest', async () => {
      const initial = manifestWithTasks([
        { id: 't1', youtrackIssueIds: ['VTB-1', 'VTB-2'] },
      ]);
      vi.mocked(readFile).mockResolvedValue(initial);

      const updated = await youtrackLinksService.removeLink('t1', 'VTB-1');

      expect(updated.youtrackIssueIds).toEqual(['VTB-2']);
      const written = JSON.parse(vi.mocked(writeFile).mock.calls[0][1] as string);
      expect(written.tasks[0].youtrackIssueIds).toEqual(['VTB-2']);
    });

    it('throws when link not found', async () => {
      const initial = manifestWithTasks([
        { id: 't1', youtrackIssueIds: ['VTB-1'] },
      ]);
      vi.mocked(readFile).mockResolvedValue(initial);

      await expect(
        youtrackLinksService.removeLink('t1', 'VTB-99')
      ).rejects.toThrow('Link to YouTrack issue "VTB-99" not found');
    });
  });

  describe('getLinks', () => {
    it('returns youtrackIssueIds when task exists', async () => {
      mockGetAllTasks.mockResolvedValue([
        { ...defaultTask, id: 't1', youtrackIssueIds: ['VTB-1', 'VTB-2'] },
      ]);

      const ids = await youtrackLinksService.getLinks('t1');
      expect(ids).toEqual(['VTB-1', 'VTB-2']);
    });

    it('throws when task not found', async () => {
      mockGetAllTasks.mockResolvedValue([]);

      await expect(youtrackLinksService.getLinks('t99')).rejects.toThrow(
        'Task with id "t99" not found'
      );
    });
  });
});
