import { db } from '../../db/index.js';
import { report6406Tasks } from '../../db/schema/index.js';
import { and, inArray, gte, lte, desc, asc } from 'drizzle-orm';
import type {
  ExportTasksRequest,
  ExportTasksResponse,
} from '../../schemas/report-6406/export.schema.js';
import { generateTasksCsv, generateCsvFileName } from '../../utils/csv-generator.js';
import { env } from '../../config/env.js';
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
      if (filters.status && filters.status.length > 0) {
        conditions.push(inArray(report6406Tasks.status, filters.status));
      }

      if (filters.branchId) {
        conditions.push(inArray(report6406Tasks.branchId, [filters.branchId]));
      }

      if (filters.reportType && filters.reportType.length > 0) {
        conditions.push(inArray(report6406Tasks.reportType, filters.reportType));
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
    }[sortBy];

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
