import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';

/**
 * Статусы процесса инвентаризации (front API-28 / DOC).
 */
export enum InventoryProcessStatusEnum {
  /** В процессе */
  IN_PROGRESS = 'in_progress',

  /** Ожидание */
  PENDING = 'pending',

  /** Завершено */
  COMPLETED = 'completed',

  /** Повторно открыто */
  REOPENED = 'reopened',
}

const InventoryProcessStatusDescriptions = {
  [InventoryProcessStatusEnum.IN_PROGRESS]: {
    value: InventoryProcessStatusEnum.IN_PROGRESS,
    description: 'В процессе выполнения инвентаризации',
  },
  [InventoryProcessStatusEnum.PENDING]: {
    value: InventoryProcessStatusEnum.PENDING,
    description: 'Ожидание',
  },
  [InventoryProcessStatusEnum.COMPLETED]: {
    value: InventoryProcessStatusEnum.COMPLETED,
    description: 'Завершено',
  },
  [InventoryProcessStatusEnum.REOPENED]: {
    value: InventoryProcessStatusEnum.REOPENED,
    description: 'Повторно открыто',
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
