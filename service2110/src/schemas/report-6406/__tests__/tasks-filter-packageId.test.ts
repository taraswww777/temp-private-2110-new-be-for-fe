import { describe, it, expect } from 'vitest';
import { getTasksRequestSchema, taskListItemSchema } from '../tasks.schema.ts';

describe('GetTasksRequestSchema / filter packageId', () => {
  it('принимает фильтр packageId (задания в указанном пакете)', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'desc' as const, column: 'createdAt' },
      filter: {
        packageId: 123,
      },
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });

  it('принимает фильтр packageId null (задания без пакета)', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'asc' as const, column: 'branchId' },
      filter: {
        packageId: null,
      },
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });

  it('принимает фильтр branchIds с одним UUID', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'asc' as const, column: 'createdAt' },
      filter: {
        branchIds: [550],
      },
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });

  it('принимает фильтр branchIds с несколькими UUID', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'asc' as const, column: 'createdAt' },
      filter: {
        branchIds: [
          550,
          551,
          552,
        ],
      },
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });

  it('принимает комбинацию нескольких фильтров', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'asc' as const, column: 'createdAt' },
      filter: {
        status: 'created',
        reportType: 'LSOZ',
        format: 'TXT',
        branchIds: [550],
      },
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });

  it('принимает запрос без фильтров (filter опционален)', () => {
    const body = {
      pagination: { number: 1, size: 20 },
      sorting: { direction: 'asc' as const, column: 'createdAt' },
    };
    const result = getTasksRequestSchema.safeParse(body);
    expect(result.success).toBe(true);
  });
});

describe('TaskListItemSchema / packageIds', () => {
  it('содержит поле packageIds (массив uuid)', () => {
    const item = {
      id: 123,
      createdAt: '2026-01-30T12:00:00.000Z',
      createdBy: 'Test',
      branchId: 550,
      branchIds: [550],
      branchName: 'Branch 1',
      branchNames: ['Branch 1'],
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
      id: 123,
      createdAt: '2026-01-30T12:00:00.000Z',
      createdBy: 'Test',
      branchId: 550,
      branchIds: [550],
      branchName: 'Branch 1',
      branchNames: ['Branch 1'],
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
      packageIds: [123],
    };
    const result = taskListItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.packageIds).toHaveLength(1);
    }
  });
});
