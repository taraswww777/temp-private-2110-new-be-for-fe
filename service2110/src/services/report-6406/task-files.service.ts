import { db } from '../../db/index.ts';
import { report6406TaskFiles, report6406Tasks } from '../../db/schema/index.ts';
import { eq, sql, desc, asc, inArray } from 'drizzle-orm';
import type {
  TaskFilesQuery,
  TaskFilesResponse,
  RetryFileConversionResponse,
} from '../../schemas/report-6406/task-files.schema.ts';
import { FileStatus } from '../../types/status-model.ts';
import { generateMockPresignedUrl } from '../../utils/presigned-url-generator.ts';
import { ID } from '../../schemas/common.schema.ts';

export class TaskFilesService {
  /**
   * Получить список файлов задания
   */
  async getTaskFiles(taskId: ID, query: TaskFilesQuery): Promise<TaskFilesResponse> {
    const { number: pageNumber, size: pageSize, sortBy, sortOrder, status: statusFilter } = query;

    // Проверяем существование задания
    const [task] = await db
      .select()
      .from(report6406Tasks)
      .where(eq(report6406Tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new Error(`Task with id '${taskId}' not found`);
    }

    // Построение WHERE условий
    const conditions = [eq(report6406TaskFiles.taskId, taskId)];

    if (statusFilter && statusFilter.length > 0) {
      conditions.push(inArray(report6406TaskFiles.status, statusFilter));
    }

    // Подсчет общего количества файлов
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(report6406TaskFiles)
      .where(sql`${sql.join(conditions, sql` AND `)}`);

    // Сортировка
    const orderByColumn = {
      status: report6406TaskFiles.status,
      fileName: report6406TaskFiles.fileName,
      fileSize: report6406TaskFiles.fileSize,
      createdAt: report6406TaskFiles.createdAt,
    }[sortBy];

    const orderByClause = sortOrder === 'ASC' ? asc(orderByColumn) : desc(orderByColumn);

    // Получение файлов
    const files = await db
      .select()
      .from(report6406TaskFiles)
      .where(sql`${sql.join(conditions, sql` AND `)}`)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    // Форматирование файлов с генерацией pre-signed URLs
    const formattedFiles = files.map(file => {
      let downloadUrl: string | null = null;
      let downloadUrlExpiresAt: string | null = null;

      // Генерируем pre-signed URL только для завершённых файлов
      if (file.status === FileStatus.COMPLETED) {
        const presigned = generateMockPresignedUrl(file.id, file.fileName);
        downloadUrl = presigned.url;
        downloadUrlExpiresAt = presigned.expiresAt.toISOString();
      }

      return {
        id: file.id,
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        status: file.status as FileStatus,
        downloadUrl,
        downloadUrlExpiresAt,
        errorMessage: file.errorMessage,
        createdAt: file.createdAt.toISOString(),
        updatedAt: file.updatedAt.toISOString(),
      };
    });

    return {
      taskId,
      files: formattedFiles,
      pagination: {
        number: pageNumber,
        size: pageSize,
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  /**
   * Повторить конвертацию файла (экспериментальная функция)
   *
   * Возвращает 501 Not Implemented в текущей версии
   */
  async retryFileConversion(
    taskId: ID,
    fileId: string
  ): Promise<RetryFileConversionResponse> {
    // Проверяем существование задания
    const [task] = await db
      .select()
      .from(report6406Tasks)
      .where(eq(report6406Tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new Error(`Task with id '${taskId}' not found`);
    }

    // Проверяем существование файла
    const [file] = await db
      .select()
      .from(report6406TaskFiles)
      .where(eq(report6406TaskFiles.id, fileId))
      .limit(1);

    if (!file) {
      throw new Error(`File with id '${fileId}' not found`);
    }

    if (file.taskId !== taskId) {
      throw new Error(`File '${fileId}' does not belong to task '${taskId}'`);
    }

    // Проверяем что файл в статусе FAILED
    if (file.status !== FileStatus.FAILED) {
      throw new Error(`File must be in FAILED status to retry. Current status: ${file.status}`);
    }

    // В текущей версии возвращаем ошибку Not Implemented
    throw new Error('File retry functionality is not implemented yet. This is an experimental feature.');
  }

  /**
   * Генерация моковых файлов для задания (для тестирования)
   */
  async generateMockFilesForTask(taskId: ID): Promise<void> {
    const mockFiles = [
      {
        taskId,
        fileName: 'report_part_1.txt',
        fileSize: 10485760, // 10MB
        fileType: 'text/plain',
        status: FileStatus.COMPLETED,
        storageUrl: `s3://mock-reports-bucket/reports/${taskId}/report_part_1.txt`,
      },
      {
        taskId,
        fileName: 'report_part_2.txt',
        fileSize: 12582912, // 12MB
        fileType: 'text/plain',
        status: FileStatus.COMPLETED,
        storageUrl: `s3://mock-reports-bucket/reports/${taskId}/report_part_2.txt`,
      },
      {
        taskId,
        fileName: 'report_summary.txt',
        fileSize: 1048576, // 1MB
        fileType: 'text/plain',
        status: FileStatus.COMPLETED,
        storageUrl: `s3://mock-reports-bucket/reports/${taskId}/report_summary.txt`,
      },
    ];

    await db.insert(report6406TaskFiles).values(mockFiles);

    // Обновляем количество файлов в задании
    await db
      .update(report6406Tasks)
      .set({ filesCount: mockFiles.length })
      .where(eq(report6406Tasks.id, taskId));
  }
}

export const taskFilesService = new TaskFilesService();
