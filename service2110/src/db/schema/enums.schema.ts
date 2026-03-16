import { pgEnum } from 'drizzle-orm/pg-core';
import { ReportTypeEnum } from '../../schemas/enums/ReportTypeEnum.ts';
import { Currency } from '../../schemas/enums/CurrencyEnum.ts';
import { FileFormatEnum } from '../../schemas/enums/FileFormatEnum.ts';
import { PackageStatusEnum } from '../../schemas/enums/PackageStatusEnum.ts';
import { TaskStatusEnum } from '../../schemas/enums/TaskStatusEnum.ts';
import { FileStatusEnum } from '../../schemas/enums/FileStatusEnum.ts';
import { SortOrderEnum } from '../../schemas/enums/SortOrderEnum.ts';

/**
 * PostgreSQL enum для типа отчёта
 * Создаётся на основе TypeScript enum ReportTypeEnum
 */
export const reportTypePgEnum = pgEnum('report_type_enum', [
  ReportTypeEnum.LSOZ,
  ReportTypeEnum.LSOS,
  ReportTypeEnum.LSOP,
]);
export const fileFormatPgEnum = pgEnum('file_format_enum', [
  FileFormatEnum.TXT,
  FileFormatEnum.XLSX,
  FileFormatEnum.XML,
]);
export const currencyPgEnum = pgEnum('currency_enum', [
  Currency.RUB,
  Currency.FOREIGN
]);

/**
 * PostgreSQL enum для статусов пакета
 */
export const packetStatusPgEnum = pgEnum('packet_status_enum', [
  PackageStatusEnum.CREATE,
  PackageStatusEnum.TRANSFER,
  PackageStatusEnum.DONE,
  PackageStatusEnum.FAIL,
  PackageStatusEnum.CANCEL,
  PackageStatusEnum.DELETE
]);


/**
 * PostgreSQL enum для статусов задания (локальная статусная модель task_*)
 */
export const taskStatusPgEnum = pgEnum('task_status_enum', [
    TaskStatusEnum.CREATE,
    TaskStatusEnum.LOADING,
    TaskStatusEnum.DATA,
    TaskStatusEnum.EMPTY_DATA,
    TaskStatusEnum.FAIL_DATA,
    TaskStatusEnum.CANCEL_DATA,
    TaskStatusEnum.CONVERSION,
    TaskStatusEnum.DONE,
    TaskStatusEnum.FAIL_GENERATION,
    TaskStatusEnum.CANCEL_GENERATION,
    TaskStatusEnum.DELETE,
  ]);

/**
 * PostgreSQL enum для Статус конвертации файла
 * Создаётся на основе TypeScript enum FileStatusEnum
 */
export const fileStatusPgEnum = pgEnum('file_status_enum', [
  FileStatusEnum.PENDING,
  FileStatusEnum.CONVERTING,
  FileStatusEnum.COMPLETED,
  FileStatusEnum.FAILED,
]);
