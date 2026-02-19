import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

// Enum для статусов пакета
export enum PacketStatusEnum {
  CREATE = 'pack_create',
  TRANSFER = 'pack_transfer',
  DONE = 'pack_done',
  FAIL = 'pack_fail',
  CANCEL = 'pack_cancel',
  DELETE = 'pack_delete',
}

// Мапа описаний для каждого значения enum
const PacketStatusDescriptions = {
  [PacketStatusEnum.CREATE]: { value: PacketStatusEnum.CREATE, description: 'Создано' },
  [PacketStatusEnum.TRANSFER]: { value: PacketStatusEnum.TRANSFER, description: 'Копирование' },
  [PacketStatusEnum.DONE]: { value: PacketStatusEnum.DONE, description: 'Выполнено' },
  [PacketStatusEnum.FAIL]: { value: PacketStatusEnum.FAIL, description: 'Не выполнено' },
  [PacketStatusEnum.CANCEL]: { value: PacketStatusEnum.CANCEL, description: 'Отменено' },
  [PacketStatusEnum.DELETE]: { value: PacketStatusEnum.DELETE, description: 'Удалено' },
} as const;

// Создаем схему через enum (который возвращает ZodEnum)
export const packetStatusSchema = z.enum(PacketStatusEnum).describe('Статус пакета');

// Добавляем метаданные через describe (некоторые генераторы поддерживают)
export const PacketStatusEnumSchema = createEnumSchemaWithDescriptions(
  PacketStatusEnum,
  PacketStatusDescriptions,
  'PacketStatusEnum',
  'Статус пакета'
);
