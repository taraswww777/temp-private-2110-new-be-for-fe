/**
 * Теги разделов OpenAPI и роутов Fastify Swagger.
 * Значения совпадают с прежними строковыми литералами в `tags: [...]`.
 */
export enum OpenApiTag {
  Health = 'Health',
  Report6406Dictionary = 'Report 6406 - Dictionary',
  Report6406Tasks = 'Report 6406 - Tasks',
  Report6406Packages = 'Report 6406 - Packages',
  Report6406Storage = 'Report 6406 - Storage',
  Inventory = 'Inventory',
  InventoryOrders = 'Inventory - Orders',
  InventoryDictionary = 'Inventory - Dictionary',
  InventoryAccounts = 'Inventory - Accounts',
  InventoryStatistics = 'Inventory - Statistics',
}

export const OPENAPI_TAG_SPEC: ReadonlyArray<{ name: OpenApiTag; description: string }> = [
  { name: OpenApiTag.Health, description: 'Health check endpoints' },
  {
    name: OpenApiTag.Report6406Dictionary,
    description: 'Справочники для формы отчётности 6406',
  },
  {
    name: OpenApiTag.Report6406Tasks,
    description: 'Задания на построение отчётов для формы 6406',
  },
  {
    name: OpenApiTag.Report6406Packages,
    description: 'Пакеты заданий для формы 6406',
  },
  {
    name: OpenApiTag.Report6406Storage,
    description: 'Мониторинг хранилища отчётов',
  },
  { name: OpenApiTag.Inventory, description: 'Инвентаризация' },
  { name: OpenApiTag.InventoryOrders, description: 'Параметры инвентаризации' },
  { name: OpenApiTag.InventoryDictionary, description: 'Словари фильтров инвентаризации' },
  { name: OpenApiTag.InventoryAccounts, description: 'Счета инвентаризации' },
  { name: OpenApiTag.InventoryStatistics, description: 'Статистика инвентаризации' },
];
