import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';

/**
 * Статусы процесса инвентаризации (front API-28 / DOC).
 */
export enum InventoryProcessStatusEnum {
  /** инвентаризация активна */
  IN_PROGRESS = 'in_progress',

  /** инвентаризация активна, но данные не обновлены */
  PENDING = 'pending',

  /** инвентаризация в стадии обновления. Любые изменения пользователями запрещены */
  UPDATING = 'updating',

  /** инвентаризация завершена */
  COMPLETED = 'completed',

  /** повторное открытие инвентаризации */
  REOPENED = 'reopened',
}

const InventoryProcessStatusDescriptions = {
  [InventoryProcessStatusEnum.IN_PROGRESS]: {
    value: InventoryProcessStatusEnum.IN_PROGRESS,
    description: 'инвентаризация активна',
  },
  [InventoryProcessStatusEnum.PENDING]: {
    value: InventoryProcessStatusEnum.PENDING,
    description: 'инвентаризация активна, но данные не обновлены',
  },
  [InventoryProcessStatusEnum.UPDATING]: {
    value: InventoryProcessStatusEnum.UPDATING,
    description: 'инвентаризация в стадии обновления. Любые изменения пользователями запрещены',
  },
  [InventoryProcessStatusEnum.COMPLETED]: {
    value: InventoryProcessStatusEnum.COMPLETED,
    description: 'инвентаризация завершена',
  },
  [InventoryProcessStatusEnum.REOPENED]: {
    value: InventoryProcessStatusEnum.REOPENED,
    description: 'повторное открытие инвентаризации',
  },
} as const;

/** Zod-схема для полей API (например `status` в ответе состояния процесса). */
export const inventoryProcessStatusSchema = z
  .enum(InventoryProcessStatusEnum)
  .describe('Статус процесса инвентаризации');

/**
 * Расширенная JSON Schema для OpenAPI (`components.schemas.InventoryProcessStatusEnum`).
 */
export const InventoryProcessStatusEnumSchema = createEnumSchemaWithDescriptions(
  InventoryProcessStatusEnum,
  InventoryProcessStatusDescriptions,
  'InventoryProcessStatusEnum',
  'Статус процесса инвентаризации',
);
