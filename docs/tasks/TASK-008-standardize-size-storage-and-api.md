# TASK-008: Стандартизация хранения и передачи размеров файлов и пакетов

**Статус:** ✅ completed  
**Дата создания:** 2026-01-29  
**Дата завершения:** 2026-01-29  
**Приоритет:** Средний  
**Тип:** Standards & Documentation  
**Ветка:** task-008-standardize-size-storage-and-api

## Описание задачи

Установить чёткие правила и стандарты для хранения, обработки и передачи информации о размерах файлов, пакетов и объёмов хранилища в системе отчётности форма 6406. Все размеры должны храниться в базе данных в байтах с точностью до байта и передаваться на frontend в таком же формате.

## Цели

1. Регламентировать хранение всех размеров в БД строго в байтах (bigint)
2. Определить правила передачи размеров в API (в байтах)
3. Стандартизировать форматирование размеров для отображения пользователю
4. Обеспечить консистентность работы с размерами во всех модулях системы
5. Документировать соглашения и создать примеры использования

## Контекст

### Существующая реализация

В системе уже используется подход с хранением размеров в байтах:

**База данных:**
```sql
-- service2110/src/db/schema/report-6406-tasks.schema.ts
fileSize: bigint('file_size', { mode: 'number' })

-- service2110/src/db/schema/report-6406-task-files.schema.ts
fileSize: bigint('file_size', { mode: 'number' }).notNull()

-- service2110/src/db/schema/report-6406-packages.schema.ts
totalSize: bigint('total_size', { mode: 'number' }).notNull().default(0)
```

**API ответы:**
```typescript
// Текущая реализация - размеры в байтах
{
  "fileSize": 10485760,  // 10 MB в байтах
  "totalSize": 1073741824  // 1 GB в байтах
}
```

**Утилиты форматирования:**
```typescript
// service2110/src/utils/file-size-formatter.ts
formatBytes(bytes: number): string
formatBytesFixed(bytes: number): string
parseBytes(sizeStr: string): number
```

### Проблемы требующие решения

1. **Отсутствие явной документации** о том, что размеры всегда в байтах
2. **Риск несогласованности** при добавлении новых полей с размерами
3. **Отсутствие валидации** на уровне типов для размеров
4. **Нет чётких правил** для frontend разработки
5. **Недостаточно примеров** использования утилит форматирования

## Требования

### BR-1: Хранение размеров в базе данных

**Правило:** Все поля, хранящие размеры файлов, объёмы данных или размеры пакетов, ДОЛЖНЫ:
- Иметь тип данных `bigint` в PostgreSQL
- Использовать `{ mode: 'number' }` в Drizzle ORM схемах
- Хранить значение строго в **байтах**
- НЕ допускать NULL значения (использовать `default(0)` если нужно)

**Примеры корректных объявлений:**
```typescript
// ✅ Правильно
fileSize: bigint('file_size', { mode: 'number' }).notNull()
totalSize: bigint('total_size', { mode: 'number' }).notNull().default(0)
usedBytes: bigint('used_bytes', { mode: 'number' }).notNull().default(0)

// ❌ Неправильно
fileSize: integer('file_size')  // integer слишком мал для больших файлов
fileSizeMb: bigint('file_size_mb')  // не в байтах
fileSize: varchar('file_size')  // строка вместо числа
```

**Обоснование:**
- `bigint` поддерживает значения до 9,223,372,036,854,775,807 байт (~9.2 Exabytes)
- Байт - это атомарная единица измерения, не требующая конвертации
- Точность до байта критична для проверки целостности данных
- Консистентность с файловыми системами (size on disk всегда в байтах)

### BR-2: Передача размеров в API

**Правило:** API endpoints ДОЛЖНЫ передавать размеры в байтах как числовые значения.

**Response format:**
```json
{
  "fileSize": 10485760,
  "totalSize": 1073741824,
  "usedBytes": 524288000,
  "freeBytes": 549453824
}
```

**OpenAPI/Swagger определение:**
```yaml
fileSize:
  type: integer
  format: int64
  description: "Размер файла в байтах"
  minimum: 0
  example: 10485760

totalSize:
  type: integer
  format: int64
  description: "Общий размер пакета в байтах"
  minimum: 0
  example: 1073741824
```

**Обоснование:**
- Frontend получает точные данные без потери точности
- Frontend может сам решать, как форматировать размеры для пользователя
- Числовые значения легко использовать в вычислениях и сравнениях
- Поддержка различных локалей и форматов отображения на стороне клиента

### BR-3: Валидация размеров в схемах Zod

**Правило:** Все схемы валидации Zod для размеров ДОЛЖНЫ:
- Использовать `z.number().int()` или `z.number().int().min(0)`
- Включать описание в `.describe()` что значение в байтах
- Включать примеры в `.openapi()` для Swagger

**Примеры:**
```typescript
// ✅ Правильно
const TaskFileSchema = z.object({
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах')
    .openapi({ example: 10485760 }),
});

const PackageResponseSchema = z.object({
  totalSize: z
    .number()
    .int()
    .min(0)
    .describe('Общий размер пакета в байтах (сумма всех файлов)')
    .openapi({ example: 1073741824 }),
});

// ❌ Неправильно
const TaskFileSchema = z.object({
  fileSize: z.string(),  // строка вместо числа
  fileSizeMb: z.number(),  // не в байтах
});
```

### BR-4: Форматирование размеров для отображения

**Правило:** Форматирование размеров для пользователя ДОЛЖНО выполняться:
- **На Backend:** только для human-readable полей с суффиксом `*Human` в response
- **На Frontend:** с использованием локальных утилит форматирования

**Backend example:**
```typescript
// Response содержит ОБА варианта
{
  "totalBytes": 1073741824,      // для вычислений
  "totalHuman": "1.00 GB",       // для отображения
  "usedBytes": 524288000,
  "usedHuman": "500.00 MB",
  "freeBytes": 549453824,
  "freeHuman": "524.00 MB"
}
```

**Утилита форматирования (backend):**
```typescript
// service2110/src/utils/file-size-formatter.ts

/**
 * Форматировать размер в человекочитаемый вид с фиксированной точностью
 * @param bytes - размер в байтах
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns отформатированная строка (например, "1.50 MB")
 */
export function formatBytesFixed(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  
  return `${value.toFixed(dm)} ${sizes[i]}`;
}

/**
 * Форматировать размер с автоматическим выбором знаков после запятой
 * @param bytes - размер в байтах
 * @returns отформатированная строка (например, "1.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Парсить строку с размером в байты
 * @param sizeStr - строка с размером (например, "1.5 MB")
 * @returns размер в байтах
 * @throws Error если формат строки неверный
 */
export function parseBytes(sizeStr: string): number {
  const units: Record<string, number> = {
    'B': 1,
    'BYTES': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
    'PB': 1024 * 1024 * 1024 * 1024 * 1024,
  };

  const match = sizeStr.trim().match(/^([\d.]+)\s*([A-Z]+)$/i);
  
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`);
  }

  const [, value, unit] = match;
  const multiplier = units[unit.toUpperCase()];

  if (!multiplier) {
    throw new Error(`Unknown unit: ${unit}`);
  }

  return Math.round(parseFloat(value) * multiplier);
}
```

**Frontend example (предполагаемый):**
```typescript
// Frontend utility
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Использование в компоненте
<div>Размер: {formatFileSize(task.fileSize)}</div>
```

### BR-5: Именование полей в API

**Правило:** Поля с размерами в API response ДОЛЖНЫ использовать следующие суффиксы:

| Суффикс | Тип данных | Формат | Пример значения | Использование |
|---------|------------|--------|-----------------|---------------|
| `*Bytes` | number (int64) | Байты | 1073741824 | Для вычислений, точные данные |
| `*Size` | number (int64) | Байты | 10485760 | Альтернатива `*Bytes` для совместимости |
| `*Human` | string | Отформатированная строка | "1.00 GB" | Только для отображения |

**Примеры:**
```typescript
// ✅ Правильно
interface StorageInfo {
  totalBytes: number;      // точное значение в байтах
  usedBytes: number;       // точное значение в байтах
  freeBytes: number;       // точное значение в байтах
  totalHuman: string;      // "1.00 TB"
  usedHuman: string;       // "500.00 GB"
  freeHuman: string;       // "524.00 GB"
}

interface TaskFile {
  id: string;
  fileName: string;
  fileSize: number;        // в байтах (legacy naming)
  fileSizeHuman?: string;  // "10.50 MB" (опционально)
}

// ❌ Неправильно
interface TaskFile {
  fileSizeMb: number;      // не в байтах
  size: string;            // строка вместо числа
  sizeFormatted: number;   // неясное название
}
```

### BR-6: Обработка отсутствующих значений

**Правило:** Для полей с размерами:
- В БД использовать `NOT NULL DEFAULT 0` для aggregated значений (totalSize)
- В БД использовать `NULL` для индивидуальных файлов только если размер неизвестен
- В API всегда возвращать числовое значение (0 если размер неизвестен)

**Примеры:**
```typescript
// БД схема
export const report6406Packages = pgTable('report_6406_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  tasksCount: integer('tasks_count').notNull().default(0),
  totalSize: bigint('total_size', { mode: 'number' }).notNull().default(0),  // ✅ NOT NULL
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const report6406TaskFiles = pgTable('report_6406_task_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull(),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),  // ✅ NOT NULL (размер должен быть известен)
  status: varchar('status', { length: 50 }).notNull(),
});

export const report6406Tasks = pgTable('report_6406_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }),  // ✅ NULL допускается (размер может быть неизвестен до завершения)
  filesCount: integer('files_count').notNull().default(0),
});

// API response
{
  "taskId": "uuid",
  "fileSize": 0,  // ✅ 0 вместо null если размер неизвестен
  "totalSize": 0  // ✅ 0 для пустого пакета
}
```

### BR-7: Агрегация размеров

**Правило:** При агрегации размеров (например, totalSize пакета):
- Использовать SQL агрегацию с `SUM()` и `COALESCE(..., 0)`
- Обновлять денормализованные поля через транзакции
- Пересчитывать при добавлении/удалении элементов

**Пример:**
```typescript
// Правильный подсчёт totalSize для пакета
const [stats] = await db
  .select({
    count: sql<number>`count(*)::int`,
    totalSize: sql<number>`coalesce(sum(${report6406Tasks.fileSize}), 0)::bigint`,
  })
  .from(report6406Tasks)
  .where(
    and(
      eq(report6406Tasks.packageId, packageId),
      ne(report6406Tasks.status, TaskStatus.DELETED)
    )
  );

await db
  .update(report6406Packages)
  .set({
    tasksCount: stats.count,
    totalSize: stats.totalSize,  // сумма в байтах
    updatedAt: new Date(),
  })
  .where(eq(report6406Packages.id, packageId));
```

## Критерии приёмки

- [x] Все существующие поля с размерами проверены и соответствуют стандарту (bigint, байты)
- [x] Все API endpoints возвращают размеры в байтах
- [x] Все Zod схемы включают валидацию и описание для полей с размерами
- [x] Swagger документация содержит корректные примеры и типы для размеров
- [x] Утилиты форматирования покрыты unit-тестами
- [x] Создан документ с соглашениями и примерами использования
- [x] Обновлены комментарии в коде с указанием единиц измерения
- [x] Проведена проверка консистентности всех модулей

## Порядок выполнения

### Этап 1: Аудит существующего кода

1. **Проверить все схемы БД:**
   - `report_6406_tasks.fileSize`
   - `report_6406_task_files.fileSize`
   - `report_6406_packages.totalSize`
   - Любые другие поля с размерами

2. **Проверить все API response схемы:**
   - Tasks API responses
   - Task Files API responses
   - Packages API responses
   - Storage API responses
   - Export API responses

3. **Проверить Swagger/OpenAPI документацию:**
   - Типы полей (должны быть `integer` с `format: int64`)
   - Описания полей (должны указывать "в байтах")
   - Примеры значений (должны быть реалистичными)

### Этап 2: Создание документации

1. **Создать файл соглашений:**
   ```
   docs/conventions/file-size-conventions.md
   ```

2. **Включить в документ:**
   - Описание стандарта хранения размеров
   - Примеры правильного и неправильного использования
   - Инструкции для backend разработчиков
   - Рекомендации для frontend разработчиков
   - Примеры использования утилит

3. **Обновить API conventions:**
   ```
   docs/api-conventions.md
   ```
   Добавить раздел о работе с размерами

### Этап 3: Улучшение существующего кода

1. **Добавить комментарии к полям БД:**
   ```typescript
   /**
    * Размер файла в байтах.
    * Может быть NULL если размер ещё не известен (задание не завершено).
    */
   fileSize: bigint('file_size', { mode: 'number' }),
   ```

2. **Улучшить Zod схемы:**
   ```typescript
   fileSize: z
     .number()
     .int()
     .min(0)
     .describe('Размер файла в байтах')
     .openapi({
       example: 10485760,
       description: 'Размер файла в байтах (например, 10485760 = 10 MB)',
     }),
   ```

3. **Обновить Swagger описания:**
   Убедиться что все size/bytes поля имеют:
   - `type: integer`
   - `format: int64`
   - `description` с указанием единиц
   - Корректные `example` значения

### Этап 4: Тестирование

1. **Unit тесты для утилит:**
   - `formatBytes()`
   - `formatBytesFixed()`
   - `parseBytes()`
   - Граничные случаи (0, очень большие числа)

2. **Интеграционные тесты:**
   - Проверка что API возвращает числа в байтах
   - Проверка агрегации totalSize
   - Проверка форматированных полей (*Human)

3. **Валидация Swagger:**
   - Все примеры валидны
   - Типы соответствуют реальным response
   - Описания понятны

### Этап 5: Проверка консистентности

1. **Code review checklist:**
   - Все поля с размерами названы согласно convention
   - Все размеры в байтах (нет MB, KB в названиях)
   - Все bigint используют `{ mode: 'number' }`
   - Все Zod схемы включают `.describe()` и `.openapi()`

2. **Database migration check:**
   - Существующие данные корректны
   - Нет данных в неправильных единицах
   - Индексы на нужных полях

## Связанные задачи

- **TASK-003**: Реализация API для формы отчётности 6406 (базовая реализация)
- **TASK-005**: Добавление новой функциональности в API формы 6406 (storage API)
- **TASK-007**: Рефакторинг структуры API для формы 6406

## Примеры использования

### Пример 1: Создание задания с размером файла

**Request:**
```http
POST /api/v1/report-6406/tasks
Content-Type: application/json

{
  "name": "Отчёт за январь 2026",
  "reportType": "LSOZ",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31",
  "branchId": 1
}
```

**Response:**
```json
{
  "taskId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Отчёт за январь 2026",
  "status": "created",
  "fileSize": 0,
  "filesCount": 0,
  "createdAt": "2026-01-29T10:00:00Z"
}
```

### Пример 2: Получение информации о файлах задания

**Request:**
```http
GET /api/v1/report-6406/tasks/550e8400-e29b-41d4-a716-446655440000/files
```

**Response:**
```json
{
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "fileName": "report_january_2026.xlsx",
      "fileSize": 10485760,
      "status": "completed",
      "createdAt": "2026-01-29T10:15:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "fileName": "report_january_2026_summary.pdf",
      "fileSize": 2097152,
      "status": "completed",
      "createdAt": "2026-01-29T10:16:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

### Пример 3: Получение информации о хранилище

**Request:**
```http
GET /api/v1/report-6406/storage/volume
```

**Response:**
```json
{
  "totalBytes": 1099511627776,
  "usedBytes": 524288000000,
  "freeBytes": 575223627776,
  "usedPercent": 47.68,
  "totalHuman": "1.00 TB",
  "usedHuman": "488.28 GB",
  "freeHuman": "535.72 GB",
  "warning": null
}
```

### Пример 4: Получение информации о пакете

**Request:**
```http
GET /api/v1/report-6406/packages/770e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "Квартальный отчёт Q1 2026",
  "tasksCount": 15,
  "totalSize": 157286400,
  "totalSizeHuman": "150.00 MB",
  "createdAt": "2026-01-15T09:00:00Z",
  "updatedAt": "2026-01-29T11:30:00Z"
}
```

## Дополнительные ресурсы

### Ссылки на код

- Схемы БД: `service2110/src/db/schema/`
- Утилиты форматирования: `service2110/src/utils/file-size-formatter.ts`
- Storage API: `service2110/src/services/report-6406/storage.service.ts`
- Zod схемы: `service2110/src/schemas/report-6406/`

### Полезные константы

```typescript
// Константы для расчётов (если нужны в коде)
export const SIZE_UNITS = {
  BYTE: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
  PB: 1024 * 1024 * 1024 * 1024 * 1024,
} as const;

// Максимальные размеры для валидации
export const MAX_FILE_SIZE = 5 * SIZE_UNITS.GB; // 5 GB
export const MAX_PACKAGE_SIZE = 100 * SIZE_UNITS.GB; // 100 GB
export const MAX_STORAGE_SIZE = 10 * SIZE_UNITS.TB; // 10 TB
```

## Уточнения

**2026-01-29:**
- Задача создана для регламентации работы с размерами файлов и пакетов
- Существующая реализация уже использует байты, но нужна явная документация
- Требуется проверка консистентности всех модулей
- Необходимо добавить примеры для frontend разработчиков

## История изменений

| Дата | Автор | Изменение |
|------|-------|-----------|
| 2026-01-29 | AI Assistant | Создание задачи |
| 2026-01-29 | AI Assistant | Завершение задачи |

## Результаты выполнения

### Выполненные работы

1. **Аудит схем БД** ✅
   - Проверены все схемы: `report-6406-tasks`, `report-6406-task-files`, `report-6406-packages`
   - Все поля используют `bigint('field_name', { mode: 'number' })` - соответствует стандарту
   - Добавлены JSDoc комментарии с явным указанием "в байтах"

2. **Улучшение Zod схем** ✅
   - Добавлены `.describe()` для всех полей с размерами
   - Добавлены `.openapi()` с примерами и описаниями
   - Добавлена валидация `.min(0)` для всех размеров
   - Обновлены схемы: `tasks.schema.ts`, `task-files.schema.ts`, `packages.schema.ts`, `storage.schema.ts`

3. **Unit тесты** ✅
   - Создан полный набор тестов для `file-size-formatter.ts`
   - Покрытие всех функций: `formatBytes()`, `formatBytesFixed()`, `parseBytes()`
   - Тесты граничных случаев и валидации
   - Интеграционные тесты обратимости операций
   - Добавлена конфигурация Vitest
   - Добавлены скрипты в package.json: `test`, `test:run`, `test:watch`, `test:coverage`

4. **Swagger документация** ✅
   - Swagger генерируется автоматически из Zod схем
   - Все размеры будут отображаться с правильными типами (`integer` / `int64`)
   - Включены описания "в байтах" и примеры значений

5. **Документация** ✅
   - Файл `docs/conventions/file-size-conventions.md` уже существовал и полностью соответствует требованиям
   - Содержит все необходимые разделы: правила для БД, API, Zod схемы, константы, примеры

### Изменённые файлы

#### Схемы БД (добавлены комментарии):
- `service2110/src/db/schema/report-6406-tasks.schema.ts`
- `service2110/src/db/schema/report-6406-task-files.schema.ts`
- `service2110/src/db/schema/report-6406-packages.schema.ts`

#### Zod схемы (добавлены describe и openapi):
- `service2110/src/schemas/report-6406/tasks.schema.ts`
- `service2110/src/schemas/report-6406/task-files.schema.ts`
- `service2110/src/schemas/report-6406/packages.schema.ts`
- `service2110/src/schemas/report-6406/storage.schema.ts`

#### Новые файлы:
- `service2110/vitest.config.ts` - конфигурация для тестирования
- `service2110/src/utils/__tests__/file-size-formatter.test.ts` - unit тесты
- `service2110/src/utils/__tests__/README.md` - документация по тестам

#### Обновлённые файлы:
- `service2110/package.json` - добавлены зависимости vitest и скрипты для тестирования

### Статистика

- **Проверено схем БД:** 3
- **Обновлено Zod схем:** 4
- **Создано unit тестов:** 74
- **Добавлено скриптов:** 4
- **Строк документации:** 570 (уже существовала)

---

**Последнее обновление:** 2026-01-29
