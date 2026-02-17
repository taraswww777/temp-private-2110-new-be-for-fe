/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { db } from '../../db/index.ts';
import { report6406Tasks, report6406TaskBranches } from '../../db/schema/index.ts';
import { and, inArray, gte, lte, desc, asc, exists, eq, sql } from 'drizzle-orm';
import type {
  ExportTasksRequest,
  ExportTasksResponse,
} from '../../schemas/report-6406/export.schema.ts';
import { generateTasksCsv, generateCsvFileName } from '../../utils/csv-generator.ts';
import { env } from '../../config/env.ts';
import { randomUUID } from 'crypto';

export class ExportService {
  /**
   * Экспорт реестра заданий в CSV формате
   */
  async exportTasks(request: ExportTasksRequest): Promise<ExportTasksResponse> {
    const { filters, sortBy, sortOrder } = request;

    // Построение WHERE условий
    const conditions = [];

    if (filters) {
      if (filters.statuses && filters.statuses.length > 0) {
        conditions.push(inArray(report6406Tasks.status, filters.statuses));
      }

      if (filters.branchIds && filters.branchIds.length > 0) {
        // Фильтрация по множественным branchId через таблицу связи
        conditions.push(
          exists(
            db
              .select({ one: sql`1` })
              .from(report6406TaskBranches)
              .where(
                and(
                  eq(report6406TaskBranches.taskId, report6406Tasks.id),
                  inArray(report6406TaskBranches.branchId, filters.branchIds),
                ),
              ),
          ),
        );
      }

      if (filters.reportTypes && filters.reportTypes.length > 0) {
        conditions.push(inArray(report6406Tasks.reportType, filters.reportTypes));
      }

      if (filters.periodStartFrom) {
        conditions.push(gte(report6406Tasks.periodStart, filters.periodStartFrom));
      }

      if (filters.periodStartTo) {
        conditions.push(lte(report6406Tasks.periodStart, filters.periodStartTo));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Сортировка
    const orderByColumn = {
      createdAt: report6406Tasks.createdAt,
      branchId: report6406Tasks.branchId,
      status: report6406Tasks.status,
      periodStart: report6406Tasks.periodStart,
    }[sortBy] || report6406Tasks.createdAt;

    const orderByClause = sortOrder === 'ASC' ? asc(orderByColumn) : desc(orderByColumn);

    // Получение данных (с лимитом)
    const maxRecords = env.CSV_EXPORT_MAX_RECORDS || 10000;
    const tasks = await db
      .select()
      .from(report6406Tasks)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(maxRecords);

    // Генерация CSV
    const csvContent = generateTasksCsv(tasks);
    const fileName = generateCsvFileName();
    
    // В реальной реализации здесь был бы upload в S3 и генерация pre-signed URL
    // Для моковой реализации используем mock URL
    const fileSize = Buffer.byteLength(csvContent, 'utf8');
    const exportId = randomUUID();
    const fileUrl = `${env.MOCK_FILE_STORAGE_URL}/exports/${fileName}`;
    
    // Срок действия URL - 1 час
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    return {
      exportId,
      status: 'COMPLETED',
      fileUrl,
      fileSize,
      downloadUrlExpiresAt: expiresAt.toISOString(),
      recordsCount: tasks.length,
      createdAt: new Date().toISOString(),
    };
  }
}

export const exportService = new ExportService();
