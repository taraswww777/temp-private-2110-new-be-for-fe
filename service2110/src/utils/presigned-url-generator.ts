/**
 * Генератор pre-signed URLs для моковой реализации
 */

import { env } from '../config/env.ts';
import { ID } from '../schemas/common.schema.ts';
import { TaskFile } from '../schemas/report-6406/task-files.schema.ts';

/**
 * Результат генерации pre-signed URL
 */
export interface PresignedUrlResult {
  url: string;
  expiresAt: Date;
}

/**
 * Генерирует моковый pre-signed URL для файла
 *
 * В реальной реализации здесь будет обращение к S3 или аналогичному хранилищу
 * для генерации временной ссылки на скачивание файла.
 *
 * @param fileId - ИД файла
 * @param fileName - имя файла
 * @returns объект с URL и временем истечения
 */
export function generateMockPresignedUrl(
  fileId: TaskFile['id'],
  fileName: string
): PresignedUrlResult {
  const baseUrl = env.MOCK_FILE_STORAGE_URL || 'http://localhost:3000/mock-files';
  const expirationHours = env.PRESIGNED_URL_EXPIRATION_HOURS || 1;

  // Кодируем имя файла для URL
  const encodedFileName = encodeURIComponent(fileName);

  // Формируем URL
  const url = `${baseUrl}/${fileId}/${encodedFileName}`;

  // Рассчитываем время истечения
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expirationHours);

  return { url, expiresAt };
}

/**
 * Генерирует моковый URL для хранилища (S3-подобный)
 *
 * @param taskId - ИД задания
 * @param fileName - имя файла
 * @returns URL файла в хранилище
 */
export function generateStorageUrl(taskId: ID, fileName: string): string {
  // Моковая структура: s3://bucket-name/reports/taskId/fileName
  const bucketName = env.STORAGE_BUCKET_NAME || 'mock-reports-bucket';
  return `s3://${bucketName}/reports/${taskId}/${fileName}`;
}

/**
 * Проверяет, истёк ли срок действия pre-signed URL
 *
 * @param expiresAt - дата истечения URL
 * @returns true, если URL истёк
 */
export function isPresignedUrlExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
