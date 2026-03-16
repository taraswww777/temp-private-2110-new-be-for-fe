# TASK-074: Разработка контрактов API-16 (система инвентаризации)

**Статус**: 🔄 В работе  
**Ветка**: `feature/TASK-074-inventory-api16-contracts`  
**Приоритет**: high  

---

## Краткое описание

Разработать контракты (DTO и Zod-схемы) для системы инвентаризации (API-16) на основе документа "Описание front-API-16.mht". На данном этапе фокус **только на контрактах** — реализация бизнес-логики и работа с БД будут в отдельных задачах.

---

## Контекст и мотивация

Система инвентаризации требует формирования качественного API-контракта для взаимодействия между фронтендом и бекендом. Документ "Описание front-API-16.mht" описывает 5 основных доменов:

1. **Orders** — приказы на инвентаризацию
2. **References** — справочники для фильтров
3. **Accounts** — счета и операции инвентаризации
4. **Statistics** — статистика и экспорт
5. **Inventory** — состояние инвентаризации

Цель задачи — создать полный набор Zod-схем, соответствующих TypeScript-типов и заглушек эндпоинтов для генерации Swagger-спецификации.

---

## Технические требования

### Общие требования к неймингу

**Поля:**
- Полные слова без сокращений (за исключением общепринятых: `id`, `ad`, `pdf`)
- `snake_case` для полей DTO
- Для интервалов дат — суффиксы `_from` / `_to` (например: `period_from`, `period_to`)
- Для булевых полей — префикс `is_` или `has_` (например: `is_active`, `has_error`)

**Схемы:**
- `camelCase` для имён схем (например: `orderSchema`, `createOrderSchema`)
- Suffix `Schema` для Zod-схем
- Suffix `Response` для схем ответов (например: `ordersListResponseSchema`)

**Валидация интервалов дат:**
- Использовать утилиту `dateRangeRefinement()` из `common.schema.ts`
- Аналогично `createTaskSchema` в `tasks.schema.ts`

### Структура файлов

```
service2110/src/
├── schemas/
│   └── inventory-api16/
│       ├── orders.schema.ts           # Приказы на инвентаризацию
│       ├── accounts.schema.ts         # Счета и операции
│       ├── references.schema.ts       # Справочники
│       ├── statistics.schema.ts       # Статистика
│       └── inventory-state.schema.ts  # Состояние инвентаризации
└── routes/
    └── v1/
        └── inventory-api16/
            ├── orders/
            │   ├── list.routes.ts     # GET /orders
            │   ├── create.routes.ts   # POST /orders/new
            │   ├── update.routes.ts   # POST /orders/update
            │   └── index.ts
            ├── accounts/
            │   ├── list.routes.ts
            │   ├── create.routes.ts
            │   └── index.ts
            ├── references/
            │   └── filters.routes.ts  # GET /references/filters
            ├── statistics/
            │   └── export.routes.ts   # POST /statistics/export
            ├── inventory/
            │   └── state.routes.ts    # GET /inventory/state
            └── index.ts
```

---

## Детальная спецификация доменов

### 1. Orders (Приказы на инвентаризацию)

#### 1.1. GET /orders — Получить список приказов

**Базовая схема приказа:**

```typescript
// orders.schema.ts
export const baseOrderSchema = z.object({
  id: zIdSchema.describe('ИД приказа'),
  order_number: z.number().int().positive().describe('Номер приказа'),
  order_date: dateSchema.describe('Дата приказа (YYYY-MM-DD)'),
  start_date: dateSchema.describe('Дата начала инвентаризации (YYYY-MM-DD)'),
  end_date: dateSchema.describe('Дата окончания инвентаризации (YYYY-MM-DD)'),
  order_file: z.string().optional().describe('Файл приказа в формате PDF (путь, URL или base64)'),
  is_active: z.boolean().describe('Флаг активности приказа'),
  created_at: z.iso.datetime().describe('Дата и время создания'),
  updated_at: z.iso.datetime().describe('Дата и время обновления'),
});
```

**Response:**
```typescript
export const ordersListResponseSchema = z.object({
  items: z.array(baseOrderSchema),
  totalItems: z.number().int().min(0),
});
```

**Мок-эндпоинт:** Возвращает `{ items: [], totalItems: 0 }`

#### 1.2. POST /orders/new — Создать новый приказ

**Схема создания:**

```typescript
export const createOrderSchema = baseOrderSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    ad_login: z.string().max(255).describe('AD-логин пользователя, создающего приказ'),
  })
  .superRefine(dateRangeRefinement({
    fromField: 'start_date',
    toField: 'end_date',
    atLeastOne: true,
  }));
```

**Response:** `baseOrderSchema` (созданный приказ)

**Мок-эндпоинт:** Возвращает `{} as any`

#### 1.3. POST /orders/update — Обновить приказ

**Схема обновления:**

```typescript
export const updateOrderSchema = z.object({
  id: zIdSchema.describe('ИД приказа для обновления'),
  ad_login: z.string().max(255).describe('AD-логин пользователя'),
  order_number: z.number().int().positive().optional(),
  order_date: dateSchema.optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  order_file: z.string().optional(),
  is_active: z.boolean().optional(),
})
.superRefine(dateRangeRefinement({
  fromField: 'start_date',
  toField: 'end_date',
  atLeastOne: false,
}));
```

**Response:** `baseOrderSchema` (обновлённый приказ)

**Мок-эндпоинт:** Возвращает `{} as any`

---

### 2. References (Справочники)

#### 2.1. GET /references/filters — Справочные данные для фильтров

**Схема справочников:**

```typescript
// references.schema.ts

export const referenceFilterItemSchema = z.object({
  code: z.string().describe('Код элемента справочника'),
  name: z.string().describe('Название элемента справочника'),
});

export const referencesFiltersResponseSchema = z.object({
  bs2: z.array(referenceFilterItemSchema).describe('БС-2 (балансовые счета второго порядка)'),
  account_type: z.array(referenceFilterItemSchema).describe('Типы счетов (1, 2, 5, -1)'),
  responsible_unit: z.array(referenceFilterItemSchema).describe('Ответственные подразделения'),
  responsible_unit_type: z.array(referenceFilterItemSchema).describe('Типы ответственных подразделений'),
  inventory_status: z.array(referenceFilterItemSchema).describe('Статусы инвентаризации'),
  source_bank: z.array(referenceFilterItemSchema).describe('Банки-источники'),
  product: z.array(referenceFilterItemSchema).describe('Продукты'),
});
```

**Мок-эндпоинт:** Возвращает объект со всеми фильтрами как пустые массивы:
```typescript
{
  bs2: [],
  account_type: [],
  responsible_unit: [],
  responsible_unit_type: [],
  inventory_status: [],
  source_bank: [],
  product: []
}
```

---

### 3. Accounts (Счета)

#### 3.1. POST /accounts — Получить список счетов с фильтрацией

**Базовая схема счёта:**

```typescript
// accounts.schema.ts

export const baseAccountSchema = z.object({
  id: zIdSchema.describe('ИД счёта'),
  account_number: zAccountSchema.describe('Номер счёта (20-значный)'),
  account_type: z.string().describe('Тип счёта'),
  bs2_code: z.string().describe('БС-2 код'),
  responsible_unit: z.string().describe('Ответственное подразделение'),
  responsible_unit_type: z.string().describe('Тип ответственного подразделения'),
  inventory_status: z.string().describe('Статус инвентаризации'),
  source_bank: z.string().describe('Банк-источник'),
  product: z.string().optional().describe('Продукт'),
  balance: z.number().optional().describe('Остаток по счёту'),
  currency_code: z.string().optional().describe('Валюта счёта'),
  created_at: z.iso.datetime().describe('Дата создания'),
  updated_at: z.iso.datetime().describe('Дата обновления'),
});
```

**Схема фильтров:**

```typescript
export const accountsFilterSchema = z.object({
  order_id: zIdSchema.optional().describe('ИД приказа'),
  bs2_codes: z.array(z.string()).optional().describe('Коды БС-2'),
  account_types: z.array(z.string()).optional().describe('Типы счетов'),
  responsible_units: z.array(z.string()).optional().describe('Ответственные подразделения'),
  responsible_unit_types: z.array(z.string()).optional().describe('Типы ответственных подразделений'),
  inventory_statuses: z.array(z.string()).optional().describe('Статусы инвентаризации'),
  source_banks: z.array(z.string()).optional().describe('Банки-источники'),
  products: z.array(z.string()).optional().describe('Продукты'),
  account_number_search: z.string().optional().describe('Поиск по номеру счёта (частичное совпадение)'),
}).optional();
```

**Схема запроса:**

```typescript
export const getAccountsRequestSchema = z.object({
  pagination: paginationQuerySchema,
  sorting: z.object({
    direction: sortOrderSchema,
    column: z.enum(['account_number', 'account_type', 'inventory_status', 'created_at']),
  }),
  filter: accountsFilterSchema,
});
```

**Response:**
```typescript
export const accountsListResponseSchema = z.object({
  items: z.array(baseAccountSchema),
  totalItems: z.number().int().min(0),
});
```

**Мок-эндпоинт:** Возвращает `{ items: [], totalItems: 0 }`

#### 3.2. POST /accounts/manual-unit — Установить ручное подразделение

**Схема запроса:**

```typescript
export const setManualUnitSchema = z.object({
  account_ids: z.array(zIdSchema).min(1).describe('Массив ИД счетов'),
  responsible_unit: z.string().max(255).describe('Название подразделения'),
  responsible_unit_type: z.enum(['DB', 'MANUAL']).describe('Тип подразделения (из БД или проставлено вручную)'),
});
```

**Response:** Bulk-ответ с результатами операции

```typescript
export const bulkAccountOperationResponseSchema = z.object({
  succeeded: z.number().int().min(0).describe('Количество успешно обработанных счетов'),
  failed: z.number().int().min(0).describe('Количество счетов с ошибками'),
  results: z.array(z.object({
    account_id: zIdSchema,
    success: z.boolean(),
    reason: z.string().optional().describe('Причина ошибки'),
  })),
});
```

**Мок-эндпоинт:** Возвращает `{ succeeded: 0, failed: 0, results: [] }`

#### 3.3. POST /accounts/inventory — Инвентаризировать счёт

**Схема запроса:**

```typescript
export const inventoryAccountsSchema = z.object({
  account_ids: z.array(zIdSchema).min(1).describe('Массив ИД счетов для инвентаризации'),
});
```

**Response:** `bulkAccountOperationResponseSchema`

**Мок-эндпоинт:** Возвращает `{ succeeded: 0, failed: 0, results: [] }`

#### 3.4. POST /accounts/inventory/exclude — Исключить из инвентаризации

**Схема запроса:**

```typescript
export const excludeFromInventorySchema = z.object({
  account_ids: z.array(zIdSchema).min(1).describe('Массив ИД счетов для исключения'),
});
```

**Response:** `bulkAccountOperationResponseSchema`

**Мок-эндпоинт:** Возвращает `{ succeeded: 0, failed: 0, results: [] }`

#### 3.5. GET /accounts/columns — Получить доступные колонки

**Response:**

```typescript
export const accountColumnsResponseSchema = z.array(z.object({
  key: z.string().describe('Ключ колонки'),
  label: z.string().describe('Отображаемое название'),
  sortable: z.boolean().describe('Доступна ли сортировка'),
  filterable: z.boolean().describe('Доступен ли фильтр'),
}));
```

**Мок-эндпоинт:** Возвращает `[]`

#### 3.6. POST /accounts/filters — (уточнить из документа)

*TODO: Требуется детализация из документа*

#### 3.7. POST /accounts/export — Экспорт счетов

**Схема запроса:**

```typescript
export const exportAccountsSchema = z.object({
  filter: accountsFilterSchema,
  format: z.enum(['XLSX', 'CSV', 'TXT']).describe('Формат экспорта'),
  columns: z.array(z.string()).optional().describe('Список колонок для экспорта (если не указано — все)'),
});
```

**Response:**

```typescript
export const exportAccountsResponseSchema = z.object({
  file_url: z.string().url().describe('URL для скачивания файла'),
  expires_at: z.iso.datetime().describe('Время истечения ссылки'),
  file_size: z.number().int().min(0).describe('Размер файла в байтах'),
});
```

**Мок-эндпоинт:** Возвращает `{} as any`

#### 3.8. GET /accounts/:id — Получить счёт по ID

**Response:** `baseAccountSchema`

**Мок-эндпоинт:** Возвращает `{} as any`

#### 3.9. GET /accounts/:id/history — История изменений счёта

**Response:**

```typescript
export const accountHistoryItemSchema = z.object({
  id: zIdSchema,
  account_id: zIdSchema,
  changed_at: z.iso.datetime().describe('Дата и время изменения'),
  changed_by: z.string().describe('Кто изменил'),
  field_name: z.string().describe('Название изменённого поля'),
  old_value: z.string().nullable().describe('Старое значение'),
  new_value: z.string().nullable().describe('Новое значение'),
});

export const accountHistoryResponseSchema = z.array(accountHistoryItemSchema);
```

**Мок-эндпоинт:** Возвращает `[]`

---

### 4. Statistics (Статистика)

#### 4.1. POST /statistics/export — Экспорт статистики

**Схема запроса:**

```typescript
// statistics.schema.ts

export const exportStatisticsSchema = z.object({
  order_id: zIdSchema.describe('ИД приказа'),
  format: z.enum(['XLSX', 'PDF']).describe('Формат экспорта'),
  include_details: z.boolean().default(false).describe('Включить детализацию'),
});
```

**Response:**

```typescript
export const exportStatisticsResponseSchema = z.object({
  file_url: z.string().url().describe('URL для скачивания'),
  expires_at: z.iso.datetime().describe('Время истечения ссылки'),
  file_size: z.number().int().min(0).describe('Размер файла в байтах'),
});
```

**Мок-эндпоинт:** Возвращает `{} as any`

---

### 5. Inventory (Состояние инвентаризации)

#### 5.1. GET /inventory/state — Получить текущее состояние

**Response:**

```typescript
// inventory-state.schema.ts

export const inventoryStateResponseSchema = z.object({
  order_id: zIdSchema.describe('ИД текущего активного приказа'),
  order_number: z.number().int().positive().describe('Номер приказа'),
  start_date: dateSchema.describe('Дата начала'),
  end_date: dateSchema.describe('Дата окончания'),
  total_accounts: z.number().int().min(0).describe('Всего счетов'),
  inventoried_accounts: z.number().int().min(0).describe('Проинвентаризировано счетов'),
  excluded_accounts: z.number().int().min(0).describe('Исключено из инвентаризации'),
  progress_percent: z.number().min(0).max(100).describe('Процент выполнения'),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'NOT_STARTED']).describe('Статус инвентаризации'),
});
```

**Мок-эндпоинт:** Возвращает `{} as any`

---

## Критерии приёмки

### Схемы (DTO)

- [ ] Все схемы созданы в `service2110/src/schemas/inventory-api16/`
- [ ] Схемы следуют неймингу: `snake_case` для полей, суффиксы `_from`/`_to` для интервалов
- [ ] Валидация интервалов дат через `dateRangeRefinement()`
- [ ] Все обязательные поля помечены `.describe()` с описанием
- [ ] Используются переиспользуемые схемы из `common.schema.ts` (`zIdSchema`, `dateSchema`, `paginationQuerySchema`)
- [ ] Экспортированы TypeScript-типы для всех схем (`z.infer<typeof ...>`)

### Роуты (заглушки для Swagger)

- [ ] Созданы роуты в `service2110/src/routes/v1/inventory-api16/`
- [ ] Каждый endpoint в отдельном файле (например, `list.routes.ts`, `create.routes.ts`)
- [ ] Все эндпоинты замокированы согласно стратегии из TASK-072:
  - Списки: `{ items: [], totalItems: 0 }`
  - Bulk-операции: `{ succeeded: 0, failed: 0, results: [] }`
  - Детали: `{} as any`
- [ ] Добавлены комментарии "MOCK: Возвращает ... для генерации Swagger-спецификации"
- [ ] Корректные `schema.tags`, `schema.summary`, `schema.description`
- [ ] Нет зависимостей от сервисов, обработки ошибок, `request.user`

### Swagger

- [ ] Swagger-спецификация успешно генерируется (`npm run openapi`)
- [ ] Все эндпоинты корректно отображаются в Swagger UI
- [ ] Схемы содержат детальные описания полей
- [ ] Request/Response body корректно типизированы

### Документация

- [ ] Задание зарегистрировано в `docs/tasks/tasks-manifest.json`
- [ ] Создан файл `docs/api/inventory-api16-contract.md` с кратким описанием контракта
- [ ] Указаны ссылки на исходный документ "Описание front-API-16.mht"

### Техническое качество

- [ ] Нет ошибок TypeScript (`npm run tsc`)
- [ ] Нет ошибок линтера (`npm run lint`)
- [ ] Код соответствует стилю проекта (используется Prettier)
- [ ] Добавлена директива `/* eslint-disable @typescript-eslint/no-explicit-any */` где необходимо

---

## Не входит в задачу (Out of scope)

- Реализация бизнес-логики эндпоинтов (все эндпоинты мокируются)
- Создание DB-схем и миграций
- Реализация сервисов (`orders.service.ts`, `accounts.service.ts` и т.д.)
- Интеграция с внешними системами (AD, S3)
- Обработка ошибок и валидация на уровне сервисов
- Unit/integration тесты

---

## Связанные задачи

- **TASK-072** — Унификация DTO отчёта 6406 (паттерн для мокирования)
- **TASK-073** — Рефакторинг DTO заданий (использование `baseTaskSchema`)
- **TASK-070** — Enum в Swagger (стандартизация enum-схем)

---

---

## Примеры кода схем

### orders.schema.ts

```typescript
import { z } from 'zod';
import { dateRangeRefinement, dateSchema, zIdSchema } from '../common.schema.ts';

/**
 * Базовая схема приказа на инвентаризацию.
 * Используется в GET /api/v1/inventory-api16/orders (200)
 */
export const baseOrderSchema = z.object({
  id: zIdSchema.describe('ИД приказа'),
  order_number: z.number().int().positive().describe('Номер приказа'),
  order_date: dateSchema.describe('Дата приказа (YYYY-MM-DD)'),
  start_date: dateSchema.describe('Дата начала инвентаризации (YYYY-MM-DD)'),
  end_date: dateSchema.describe('Дата окончания инвентаризации (YYYY-MM-DD)'),
  order_file: z.string().nullable().describe('Файл приказа в формате PDF'),
  is_active: z.boolean().describe('Флаг активности приказа'),
  created_at: z.iso.datetime().describe('Дата и время создания'),
  updated_at: z.iso.datetime().describe('Дата и время последнего обновления'),
});

export type Order = z.infer<typeof baseOrderSchema>;

/**
 * Схема для создания нового приказа.
 * POST /api/v1/inventory-api16/orders/new
 */
export const createOrderSchema = baseOrderSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    ad_login: z.string().max(255).describe('AD-логин пользователя'),
  })
  .superRefine(dateRangeRefinement({
    fromField: 'start_date',
    toField: 'end_date',
    atLeastOne: true,
  }));

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Схема для обновления приказа.
 * POST /api/v1/inventory-api16/orders/update
 */
export const updateOrderSchema = z.object({
  id: zIdSchema.describe('ИД приказа для обновления'),
  ad_login: z.string().max(255).describe('AD-логин пользователя'),
  order_number: z.number().int().positive().optional(),
  order_date: dateSchema.optional(),
  start_date: dateSchema.optional(),
  end_date: dateSchema.optional(),
  order_file: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
}).superRefine(dateRangeRefinement({
  fromField: 'start_date',
  toField: 'end_date',
  atLeastOne: false,
}));

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

/**
 * Схема ответа со списком приказов.
 * GET /api/v1/inventory-api16/orders (200)
 */
export const ordersListResponseSchema = z.object({
  items: z.array(baseOrderSchema).describe('Список приказов'),
  totalItems: z.number().int().min(0).describe('Общее количество приказов'),
});

export type OrdersListResponse = z.infer<typeof ordersListResponseSchema>;
```

### references.schema.ts

```typescript
import { z } from 'zod';

/**
 * Элемент справочника (код + название).
 */
export const referenceFilterItemSchema = z.object({
  code: z.string().describe('Код элемента справочника'),
  name: z.string().describe('Название элемента справочника'),
});

export type ReferenceFilterItem = z.infer<typeof referenceFilterItemSchema>;

/**
 * Схема ответа GET /api/v1/inventory-api16/references/filters (200)
 * Возвращает все справочники для фильтров в одном запросе.
 */
export const referencesFiltersResponseSchema = z.object({
  bs2: z.array(referenceFilterItemSchema).describe('БС-2 (балансовые счета второго порядка)'),
  account_type: z.array(referenceFilterItemSchema).describe('Типы счетов (1, 2, 5, -1)'),
  responsible_unit: z.array(referenceFilterItemSchema).describe('Ответственные подразделения'),
  responsible_unit_type: z.array(referenceFilterItemSchema).describe('Типы ответственных подразделений (из БД или проставлено вручную)'),
  inventory_status: z.array(referenceFilterItemSchema).describe('Статусы инвентаризации (Проинвентаризировано / Не проинвентаризировано)'),
  source_bank: z.array(referenceFilterItemSchema).describe('Банки-источники'),
  product: z.array(referenceFilterItemSchema).describe('Продукты'),
});

export type ReferencesFiltersResponse = z.infer<typeof referencesFiltersResponseSchema>;
```

---

## Стратегия реализации

### Этап 1: Создание схем (Приоритет 1)

**Файлы для создания:**
1. `schemas/inventory-api16/orders.schema.ts` — схемы приказов
2. `schemas/inventory-api16/references.schema.ts` — схемы справочников
3. `schemas/inventory-api16/accounts.schema.ts` — схемы счетов
4. `schemas/inventory-api16/statistics.schema.ts` — схемы статистики
5. `schemas/inventory-api16/inventory-state.schema.ts` — схема состояния

**Порядок создания:**
- Сначала `references.schema.ts` (нет зависимостей)
- Потом `orders.schema.ts` (простая структура)
- Затем `accounts.schema.ts` (сложная, с фильтрами)
- Далее `statistics.schema.ts` и `inventory-state.schema.ts`

### Этап 2: Создание роутов (Приоритет 2)

**Структура директорий:**
```
routes/v1/inventory-api16/
├── orders/
│   ├── list.routes.ts
│   ├── create.routes.ts
│   ├── update.routes.ts
│   └── index.ts
├── accounts/
│   ├── list.routes.ts
│   ├── manual-unit.routes.ts
│   ├── inventory.routes.ts
│   ├── exclude.routes.ts
│   ├── columns.routes.ts
│   ├── export.routes.ts
│   ├── get.routes.ts
│   ├── history.routes.ts
│   └── index.ts
├── references/
│   └── filters.routes.ts
├── statistics/
│   └── export.routes.ts
├── inventory/
│   └── state.routes.ts
└── index.ts
```

**Пример роута (orders/list.routes.ts):**
```typescript
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ordersListResponseSchema } from '../../../../schemas/inventory-api16/orders.schema.ts';

/**
 * GET /api/v1/inventory-api16/orders
 * Получить список приказов на инвентаризацию
 * 
 * MOCK: Возвращает пустой список для генерации Swagger-спецификации
 */
export const listOrdersRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/', {
    schema: {
      tags: ['Inventory API-16 - Orders'],
      summary: 'Получить список приказов на инвентаризацию',
      description: 'Возвращает список всех приказов на инвентаризацию',
      response: {
        200: ordersListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ items: [], totalItems: 0 });
  });
};
```

### Этап 3: Проверка Swagger (Приоритет 3)

1. Запустить сервер: `npm run dev`
2. Открыть Swagger UI: `http://localhost:3000/swagger`
3. Проверить наличие всех endpoints
4. Проверить корректность схем в разделе "Schemas"
5. Проверить examples в request/response

### Этап 4: Документация (Приоритет 4)

Создать краткую справку по API в `docs/api/inventory-api16-endpoints.md`:
- Список всех endpoints с кратким описанием
- Примеры request/response
- Коды ошибок
- Ссылки на исходный документ

---

## Чек-лист выполнения

### Схемы

- [ ] `orders.schema.ts`
  - [ ] `baseOrderSchema`
  - [ ] `createOrderSchema`
  - [ ] `updateOrderSchema`
  - [ ] `ordersListResponseSchema`
- [ ] `references.schema.ts`
  - [ ] `referenceFilterItemSchema`
  - [ ] `referencesFiltersResponseSchema`
- [ ] `accounts.schema.ts`
  - [ ] `baseAccountSchema`
  - [ ] `accountsFilterSchema`
  - [ ] `getAccountsRequestSchema`
  - [ ] `accountsListResponseSchema`
  - [ ] `setManualUnitSchema`
  - [ ] `inventoryAccountsSchema`
  - [ ] `excludeFromInventorySchema`
  - [ ] `bulkAccountOperationResponseSchema`
  - [ ] `accountColumnsResponseSchema`
  - [ ] `exportAccountsSchema`
  - [ ] `exportAccountsResponseSchema`
  - [ ] `accountHistoryItemSchema`
  - [ ] `accountHistoryResponseSchema`
- [ ] `statistics.schema.ts`
  - [ ] `exportStatisticsSchema`
  - [ ] `exportStatisticsResponseSchema`
- [ ] `inventory-state.schema.ts`
  - [ ] `inventoryStateResponseSchema`

### Роуты

**Orders (3 роута):**
- [ ] `GET /orders` (list.routes.ts)
- [ ] `POST /orders/new` (create.routes.ts)
- [ ] `POST /orders/update` (update.routes.ts)
- [ ] `orders/index.ts` (реэкспорт)

**References (1 роут):**
- [ ] `GET /references/filters` (filters.routes.ts)

**Accounts (8 роутов):**
- [ ] `POST /accounts` (list.routes.ts)
- [ ] `POST /accounts/manual-unit` (manual-unit.routes.ts)
- [ ] `POST /accounts/inventory` (inventory.routes.ts)
- [ ] `POST /accounts/inventory/exclude` (exclude.routes.ts)
- [ ] `GET /accounts/columns` (columns.routes.ts)
- [ ] `POST /accounts/export` (export.routes.ts)
- [ ] `GET /accounts/:id` (get.routes.ts)
- [ ] `GET /accounts/:id/history` (history.routes.ts)
- [ ] `accounts/index.ts` (реэкспорт)

**Statistics (1 роут):**
- [ ] `POST /statistics/export` (export.routes.ts)

**Inventory (1 роут):**
- [ ] `GET /inventory/state` (state.routes.ts)

**Корневой индекс:**
- [ ] `inventory-api16/index.ts` (регистрация всех модулей)

### Swagger и документация

- [ ] Все endpoints отображаются в Swagger UI
- [ ] Схемы корректно отображаются в разделе "Schemas"
- [ ] Request/Response body валидны
- [ ] Добавлены tags для группировки
- [ ] Добавлены summary и description
- [ ] Создан файл `docs/api/inventory-api16-endpoints.md`

### Техническое качество

- [ ] `npm run tsc` — без ошибок
- [ ] `npm run lint` — без ошибок
- [ ] Добавлена директива `/* eslint-disable @typescript-eslint/no-explicit-any */` где нужно
- [ ] Все файлы отформатированы Prettier

---

## Примечания и уточнения

### Интерпретация документа

Из анализа документа "Описание front-API-16.mht" извлечена следующая информация:

1. **Orders (Приказы)**:
   - Структура полностью описана в документе
   - Поля: id, orderNumber, orderDate, startDate, endDate, orderFile, active
   - orderFile — строка (вероятно путь или URL к PDF)

2. **References (Справочники)**:
   - Единый endpoint возвращает все справочники
   - Структура: массивы объектов {code, name}
   - 7 справочников: bs2, accountType, responsibleUnit, responsibleUnitType, inventoryStatus, sourceBank, product

3. **Accounts (Счета)**:
   - Основной домен с множеством операций
   - Поддержка фильтрации по всем полям справочников
   - Bulk-операции возвращают детальный результат по каждому счёту

4. **Statistics (Статистика)**:
   - Экспорт в XLSX или PDF
   - Параметр include_details для детализации

5. **Inventory State (Состояние)**:
   - Одна точка входа для получения текущего состояния
   - Включает прогресс выполнения в процентах

### Решения по неймингу

| Поле в документе | Поле в DTO | Обоснование |
|------------------|------------|-------------|
| `orderNumber` | `order_number` | snake_case согласно требованиям |
| `orderDate` | `order_date` | snake_case |
| `startDate` | `start_date` | snake_case |
| `endDate` | `end_date` | snake_case |
| `orderFile` | `order_file` | snake_case |
| `active` | `is_active` | Префикс is_ для boolean |
| `bs2` | `bs2` | Общепринятое сокращение, оставляем |
| `accountType` | `account_type` | snake_case |
| `responsibleUnit` | `responsible_unit` | snake_case |
| `responsibleUnitType` | `responsible_unit_type` | snake_case |
| `inventoryStatus` | `inventory_status` | snake_case |
| `sourceBank` | `source_bank` | snake_case |

### Открытые вопросы (для будущих задач)

1. **Аутентификация**: Откуда берётся `ad_login`? Из JWT токена или передаётся явно?
2. **Файлы приказов**: Нужен ли отдельный endpoint для загрузки PDF? Multipart/form-data?
3. **Пагинация**: Нужна ли пагинация для списка приказов?
4. **Сортировка**: По каким полям можно сортировать приказы и счета?
5. **Валидация**: Бизнес-правила (например, только один активный приказ)?
6. **История**: Какие именно поля логируются в истории счёта?

---

## Связанные документы

- **Исходный документ**: `d:\Downloads\Описание front-API-16.mht`
- **Паттерны из проекта**:
  - `tasks.schema.ts` — пример базовой схемы и наследования
  - `packages.schema.ts` — пример комментариев к схемам
  - `common.schema.ts` — переиспользуемые схемы и утилиты
  - `list.routes.ts` (tasks) — пример мок-роута со списком
