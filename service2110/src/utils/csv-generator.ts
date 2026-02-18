/**
 * Утилиты для генерации CSV файлов
 */

import type { Report6406Task } from '../db/schema/report-6406-tasks.schema.ts';

/**
 * Интерфейс для строки CSV реестра заданий
 */
export interface TaskCsvRecord {
  ID: number;
  'Created At': string;
  'Created By': string;
  'Branch ID': string;
  'Branch Name': string;
  'Period Start': string;
  'Period End': string;
  'Account Mask': string;
  'Account Second Order': string;
  'Currency': string;
  'Format': string;
  'Report Type': string;
  'Source': string;
  'Status': string;
  'File Size': number;
  'Files Count': number;
  'Started At': string;
  'Completed At': string;
  'Error Message': string;
}

/**
 * Преобразует задание в строку CSV
 *
 * @param task - задание
 * @returns объект с полями для CSV
 */
export function taskToCsvRecord(task: Report6406Task): TaskCsvRecord {
  return {
    'ID': task.id,
    'Created At': task.createdAt.toISOString(),
    'Created By': task.createdBy || '',
    'Branch ID': task.branchId,
    'Branch Name': task.branchName,
    'Period Start': task.periodStart,
    'Period End': task.periodEnd,
    'Account Mask': task.accountMask || '',
    'Account Second Order': task.accountSecondOrder || '',
    'Currency': task.currency,
    'Format': task.format,
    'Report Type': task.reportType,
    'Source': task.source || '',
    'Status': task.status,
    'File Size': task.fileSize || 0,
    'Files Count': task.filesCount,
    'Started At': task.startedAt?.toISOString() || '',
    'Completed At': task.completedAt?.toISOString() || '',
    'Error Message': task.errorMessage || '',
  };
}

/**
 * Генерирует CSV строку из массива заданий
 *
 * @param tasks - массив заданий
 * @returns CSV строка
 */
export function generateTasksCsv(tasks: Report6406Task[]): string {
  if (tasks.length === 0) {
    return '';
  }

  // Преобразуем задания в записи CSV
  const records = tasks.map(taskToCsvRecord);

  // Формируем заголовки
  const headers = Object.keys(records[0]);
  const headerRow = headers.map(escapeCSVField).join(',');

  // Формируем строки данных
  const dataRows = records.map(record => {
    return headers.map(header => {
      const value = record[header as keyof TaskCsvRecord];
      return escapeCSVField(String(value));
    }).join(',');
  });

  // Объединяем заголовки и данные
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Экранирует поле CSV (добавляет кавычки если нужно)
 *
 * @param field - значение поля
 * @returns экранированное значение
 */
function escapeCSVField(field: string): string {
  // Если поле содержит запятую, кавычки или перенос строки, оборачиваем в кавычки
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    // Экранируем кавычки удвоением
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return field;
}

/**
 * Генерирует имя файла для экспорта CSV
 *
 * @returns имя файла с временной меткой
 */
export function generateCsvFileName(): string {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  return `report-6406-tasks-export-${timestamp}.csv`;
}
