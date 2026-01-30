import { describe, it, expect } from 'vitest';
import { getTasksRequestSchema, taskListItemSchema } from '../tasks.schema.js';

describe('GetTasksRequestSchema / filter packageId', () => {
  it('принимает фильтр packageId notEquals (задания, доступные для добавления в пакет)', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'desc' as const, column: 'createdAt' },
      filter: [
        {
          column: 'packageId',
          operator: 'notEquals' as const,
          value: 'a1b2c3d4-e5f6-4789-a012-345678901234',
        },
      ],
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });

  it('принимает фильтр packageId equals null (задания без пакета)', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'asc' as const, column: 'branchId' },
      filter: [
        {
          column: 'packageId',
          operator: 'equals' as const,
          value: 'null',
        },
      ],
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });
});

describe('TaskListItemSchema / packageIds', () => {
  it('содержит поле packageIds (массив uuid)', () => {
    const item = {
      id: 'a1b2c3d4-e5f6-4789-a012-345678901234',
      createdAt: '2026-01-30T12:00:00.000Z',
      createdBy: 'Test',
      branchId: 'br1',
      branchName: 'Branch 1',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
      status: 'created',
      fileSize: null,
      format: 'TXT',
      reportType: 'LSOZ',
      updatedAt: '2026-01-30T12:00:00.000Z',
      canCancel: true,
      canDelete: true,
      canStart: true,
      packageIds: [],
    };
    const result = taskListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.packageIds).toEqual([]);
    }
  });

  it('принимает packageIds с одним или несколькими uuid', () => {
    const item = {
      id: 'a1b2c3d4-e5f6-4789-a012-345678901234',
      createdAt: '2026-01-30T12:00:00.000Z',
      createdBy: 'Test',
      branchId: 'br1',
      branchName: 'Branch 1',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
      status: 'created',
      fileSize: null,
      format: 'TXT',
      reportType: 'LSOZ',
      updatedAt: '2026-01-30T12:00:00.000Z',
      canCancel: true,
      canDelete: true,
      canStart: true,
      packageIds: ['b2c3d4e5-f6a7-4890-b123-456789012345'],
    };
    const result = taskListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.packageIds).toHaveLength(1);
    }
  });
});
