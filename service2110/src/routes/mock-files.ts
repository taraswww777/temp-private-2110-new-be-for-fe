import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { zIdSchema } from '../schemas/common.schema.ts';

const mockFileParamsSchema = z.object({
  fileId: zIdSchema,
  fileName: z.string(),
});

/**
 * Моковые маршруты для скачивания файлов
 *
 * Используются для разработки и тестирования.
 * В продакшене будут заменены на реальное хранилище (S3 или аналог).
 */
export const mockFilesRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /mock-files/:fileId/:fileName
   * Скачать моковый файл
   */
  fastify.get('/mock-files/:fileId/:fileName', async (request, reply) => {
    const params = mockFileParamsSchema.parse(request.params);
    const { fileId, fileName } = params;

    const content = `Mock report file content
File ID: ${fileId}
File Name: ${fileName}
Generated at: ${new Date().toISOString()}

This is a mock file for development purposes.
In production, this would contain actual report data.

========================================
Sample Report Data
========================================

Task ID: ${fileId}
Report Type: Universal Report 6406
Format: TXT
Status: COMPLETED

Account Number | Balance     | Currency | Date
================================================
40817810000000000001 | 1,234,567.89 | RUB | 2026-01-28
40817810000000000002 | 987,654.32   | RUB | 2026-01-28
40817810000000000003 | 456,789.12   | RUB | 2026-01-28

Total Records: 3
Total Balance: 2,679,011.33 RUB

Report generated successfully.
`;

    return reply
      .header('Content-Type', 'text/plain; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${decodeURIComponent(fileName)}"`)
      .send(content);
  });

  /**
   * GET /mock-files/exports/:fileName
   * Скачать моковый экспортированный CSV файл
   */
  fastify.get('/mock-files/exports/:fileName', async (request, reply) => {
    const { fileName } = request.params as { fileName: string };

    // Моковые данные CSV
    const csvContent = `ID,Created At,Created By,Branch ID,Branch Name,Period Start,Period End,Status,File Size,Format,Report Type,Started At,Completed At
03cb0f48-1234-5678-9abc-def012345678,2025-11-11T17:22:10Z,Иванов Иван Иванович,7701,Филиал № 7701,2000-01-01,2030-12-31,completed,34603008,TXT,LSOZ,2025-11-11T17:22:15Z,2025-11-11T17:25:30Z
03cb0f48-1234-5678-9abc-def012345679,2025-11-12T10:15:20Z,Петров Петр Петрович,7702,Филиал № 7702,2000-01-01,2030-12-31,started,0,XLSX,LSOS,2025-11-12T10:15:25Z,
`;

    return reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${fileName}"`)
      .send(csvContent);
  });
};
