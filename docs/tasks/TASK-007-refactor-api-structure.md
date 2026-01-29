# TASK-007: Рефакторинг структуры API для формы 6406

**Статус:** backlog  
**Дата создания:** 2026-01-29  
**Приоритет:** Высокий  
**Тип:** Refactoring  

## Описание задачи

Провести рефакторинг существующего API для формы отчётности 6406 на основе анализа swagger.json. Улучшить консистентность, упростить структуру данных и привести API к более RESTful архитектуре.

## Цели

1. Упростить структуру данных в response для справочников
2. Унифицировать операции удаления и отмены
3. Улучшить консистентность naming и структуры endpoints
4. Дополнить отсутствующие схемы и параметры
5. Привести HTTP статус коды к стандартам REST API

## Детальный анализ проблем

### 🔴 Критические проблемы (приоритет 1)

#### 1. Reference endpoints возвращают лишние обертки

**Текущее состояние:**
```json
// GET /api/v1/report-6406/references/branches
{
  "branches": [...]
}

// GET /api/v1/report-6406/references/report-types
{
  "reportTypes": [...]
}
```

**Ожидаемое состояние:**
```json
// GET /api/v1/report-6406/references/branches
[
  { "id": 1, "code": "001", "name": "Филиал 1" },
  ...
]

// GET /api/v1/report-6406/references/report-types
[
  { "code": "LSOZ", "name": "Лицевые счета..." },
  ...
]
```

**Обоснование:**
- Справочники - это простые списки, не требующие дополнительной обертки
- Упрощается работа на frontend (меньше вложенности)
- Следование принципу "keep it simple"
- Стандартная практика для списочных endpoints

#### 2. Объединение операций DELETE для Tasks

**Текущее состояние:**
```
DELETE /api/v1/report-6406/tasks/{id}
POST /api/v1/report-6406/tasks/bulk-delete
```

**Предлагаемая структура:**
```
DELETE /api/v1/report-6406/tasks
Request body: { "taskIds": ["uuid1", "uuid2", ...] }
```

**Обоснование:**
- Единая точка входа для удаления (один или много)
- Упрощение логики на frontend
- Консистентный response format
- Поддержка batch операций из коробки

**Response format:**
```json
{
  "deleted": 5,
  "failed": 2,
  "results": [
    {
      "taskId": "uuid1",
      "success": true
    },
    {
      "taskId": "uuid2",
      "success": false,
      "reason": "Task not found or already deleted"
    }
  ]
}
```

#### 3. Объединение операций CANCEL для Tasks

**Текущее состояние:**
```
POST /api/v1/report-6406/tasks/{id}/cancel
POST /api/v1/report-6406/tasks/bulk-cancel
```

**Предлагаемая структура:**
```
POST /api/v1/report-6406/tasks/cancel
Request body: { "taskIds": ["uuid1", "uuid2", ...] }
```

**Response format:**
```json
{
  "cancelled": 5,
  "failed": 2,
  "results": [
    {
      "taskId": "uuid1",
      "success": true,
      "status": "deleted",
      "updatedAt": "2026-01-29T12:00:00Z"
    },
    {
      "taskId": "uuid2",
      "success": false,
      "reason": "Task cannot be cancelled in current status"
    }
  ]
}
```

#### 4. Объединение операций DELETE для Packages

**Текущее состояние:**
```
DELETE /api/v1/report-6406/packages/{id}
POST /api/v1/report-6406/packages/bulk-delete
```

**Предлагаемая структура:**
```
DELETE /api/v1/report-6406/packages
Request body: { "packageIds": ["uuid1", "uuid2", ...] }
```

**Response format:** (аналогично tasks delete)

#### 5. Объединение операций для Package Tasks

**Текущее состояние:**
```
DELETE /api/v1/report-6406/packages/{packageId}/tasks/{taskId}
POST /api/v1/report-6406/packages/{packageId}/tasks/bulk-remove
```

**Предлагаемая структура:**
```
DELETE /api/v1/report-6406/packages/{packageId}/tasks
Request body: { "taskIds": ["uuid1", "uuid2", ...] }
```

**Response format:**
```json
{
  "removed": 5,
  "failed": 2,
  "results": [
    {
      "taskId": "uuid1",
      "success": true
    },
    {
      "taskId": "uuid2",
      "success": false,
      "reason": "Task not found in package"
    }
  ]
}
```

### 🟡 Важные улучшения (приоритет 2)

#### 6. Унификация naming операций

**Проблема:**
- Используется `bulk-remove` для пакетов
- Используется `bulk-delete` для задач
- Используется `bulk-cancel` для отмены

**Решение:**
Использовать консистентную терминологию:
- `DELETE` для полного удаления сущностей
- `remove` только для удаления связи (task из package)
- `cancel` для отмены операции (изменение статуса)

#### 7. Убрать trailing slash в URLs

**Текущее состояние:**
```
POST /api/v1/report-6406/tasks/
GET /api/v1/report-6406/tasks/
POST /api/v1/report-6406/packages/
GET /api/v1/report-6406/packages/
```

**Ожидаемое состояние:**
```
POST /api/v1/report-6406/tasks
GET /api/v1/report-6406/tasks
POST /api/v1/report-6406/packages
GET /api/v1/report-6406/packages
```

#### 8. Определить схему для status-history

**Текущее состояние:**
```json
GET /api/v1/report-6406/tasks/{id}/status-history
Response schema: {}
```

**Предлагаемая схема:**
```typescript
// Простой массив всей истории без пагинации
type StatusHistoryResponse = Array<{
  id: string; // UUID записи в истории
  status: TaskStatus;
  changedAt: string; // ISO 8601
  changedBy: string | null; // Кто изменил
  reason: string | null; // Причина изменения
  metadata: Record<string, any> | null; // Дополнительные данные
}>;
```

**Обоснование:**
- История изменений статусов обычно небольшая (десятки записей, не тысячи)
- Нет необходимости в пагинации для такого объема данных
- Упрощается работа на frontend (нет дополнительных запросов)
- Можно сразу показать полную историю на UI

#### 9. Определить схему для export request

**Текущее состояние:**
```json
POST /api/v1/report-6406/tasks/export
Request body schema: {}
```

**Предлагаемая схема:**
```typescript
interface ExportTasksRequest {
  filters?: {
    branchIds?: number[];
    statuses?: TaskStatus[];
    periodStart?: string; // YYYY-MM-DD
    periodEnd?: string; // YYYY-MM-DD
    formats?: FileFormat[];
    reportTypes?: ReportType[];
    createdAtFrom?: string; // ISO 8601
    createdAtTo?: string; // ISO 8601
  };
  columns?: string[]; // Какие колонки включить в экспорт
  sortBy?: 'createdAt' | 'branchId' | 'status' | 'periodStart';
  sortOrder?: 'ASC' | 'DESC';
}
```

#### 10. Унификация операции START

**Текущее состояние:**
```
POST /api/v1/report-6406/tasks/start
Request body: { "taskIds": ["uuid1", ...] }
```

**Решение:** Оставить как есть

**Обоснование:**
- Операция start специфична и имеет сложную бизнес-логику (проверка места в хранилище, валидация, запуск процессов)
- Семантически это действие, а не изменение статуса
- Текущий endpoint интуитивно понятен
- Поддерживает batch операции из коробки

### 🟢 Дополнительные улучшения (приоритет 3)

#### 11. Добавить фильтрацию для tasks list

**Текущее состояние:**
```
GET /api/v1/report-6406/tasks
```
Только пагинация, без фильтров.

**Предлагаемые query параметры:**
```
GET /api/v1/report-6406/tasks?
  page=0&
  limit=20&
  sortBy=createdAt&
  sortOrder=DESC&
  branchIds=1,2,3&
  statuses=created,started&
  periodStartFrom=2026-01-01&
  periodStartTo=2026-01-31&
  periodEndFrom=2026-01-01&
  periodEndTo=2026-01-31&
  formats=XLSX,PDF&
  reportTypes=LSOZ,LSOS&
  createdAtFrom=2026-01-01T00:00:00Z&
  createdAtTo=2026-01-31T23:59:59Z&
  search=поисковый+запрос
```

**Схема query параметров:**
```typescript
interface GetTasksQueryParams {
  // Пагинация
  page?: number; // default: 0
  limit?: number; // default: 20, max: 100
  
  // Сортировка
  sortBy?: 'createdAt' | 'branchId' | 'status' | 'periodStart' | 'updatedAt'; // default: 'createdAt'
  sortOrder?: 'ASC' | 'DESC'; // default: 'DESC'
  
  // Фильтры
  branchIds?: string; // comma-separated: "1,2,3"
  statuses?: string; // comma-separated: "created,started"
  periodStartFrom?: string; // YYYY-MM-DD
  periodStartTo?: string; // YYYY-MM-DD
  periodEndFrom?: string; // YYYY-MM-DD
  periodEndTo?: string; // YYYY-MM-DD
  formats?: string; // comma-separated: "XLSX,PDF"
  reportTypes?: string; // comma-separated: "LSOZ,LSOS"
  createdAtFrom?: string; // ISO 8601
  createdAtTo?: string; // ISO 8601
  createdBy?: string; // username или ID пользователя
  search?: string; // Поиск по названию филиала, ID и т.д.
}
```

#### 12. Добавить query параметры для files pagination

**Текущее состояние:**
```
GET /api/v1/report-6406/tasks/{id}/files
```
Response имеет pagination, но нет query параметров для управления ей.

**Предлагаемые query параметры:**
```
GET /api/v1/report-6406/tasks/{id}/files?page=0&limit=20
```

**Схема:**
```typescript
interface GetTaskFilesQueryParams {
  page?: number; // default: 0
  limit?: number; // default: 20, max: 100
}
```

#### 13. Исправить HTTP статус коды для DELETE

**Текущее состояние:**
```
DELETE /api/v1/report-6406/tasks/{id}
Response: 200 OK
```

В описании указано: "Возвращает 204 No Content при успешном удалении", но схема показывает 200.

**Решение:** Использовать `200 OK` с информативным телом ответа

```
DELETE /api/v1/report-6406/tasks
Response: 200 OK
{
  "deleted": 5,
  "failed": 0,
  "results": [
    {
      "taskId": "uuid1",
      "success": true
    },
    {
      "taskId": "uuid2",
      "success": false,
      "reason": "Task not found"
    }
  ]
}
```

**Обоснование:**
- Предоставляет детальную информацию об успехе/ошибках каждой операции
- Особенно важно для batch операций
- Frontend может показать пользователю конкретные результаты
- Позволяет частичный успех (некоторые удалены, некоторые нет)

#### 14. Улучшить naming для copy-to-tfr

**Текущее состояние:**
```
POST /api/v1/report-6406/packages/{packageId}/copy-to-tfr
```

**Решение:** Оставить как есть с улучшенной документацией

```
POST /api/v1/report-6406/packages/{packageId}/copy-to-tfr
```

**Обоснование:**
- TFR (Territory Financial Repository / Территориальный финансовый репозиторий) - устоявшийся термин в предметной области
- Сокращение общепринято и понятно для бизнес-пользователей
- Полное название слишком длинное для URL

**Требования:**
- Добавить полное описание в swagger: "Скопировать пакет в ТФР (Территориальный финансовый репозиторий)"
- Добавить глоссарий терминов в API документацию
- Добавить tooltip/hint в UI с расшифровкой аббревиатуры

#### 15. Сделать pagination параметры опциональными

**Текущее состояние:**
Некоторые endpoints имеют обязательные параметры пагинации с default значениями:
```typescript
{
  "schema": {
    "default": 0,
    "type": "integer"
  },
  "in": "query",
  "name": "page",
  "required": true  // ← противоречие
}
```

**Предлагаемое решение:**
```typescript
{
  "schema": {
    "type": "integer",
    "minimum": 0,
    "default": 0
  },
  "in": "query",
  "name": "page",
  "required": false  // ← опциональный с default
}
```

Backend должен применять default значения, если параметры не переданы.

## Предлагаемая структура API после рефакторинга

### References (справочники)
```
GET /api/v1/report-6406/references/branches         → Array<Branch>
GET /api/v1/report-6406/references/report-types     → Array<ReportType>
GET /api/v1/report-6406/references/currencies       → Array<Currency>
GET /api/v1/report-6406/references/formats          → Array<Format>
GET /api/v1/report-6406/references/sources          → Array<Source>
```

### Tasks (задания)
```
POST   /api/v1/report-6406/tasks                    → Task (create)
GET    /api/v1/report-6406/tasks                    → { tasks, pagination } (list с фильтрами)
GET    /api/v1/report-6406/tasks/{id}               → Task (get one)
DELETE /api/v1/report-6406/tasks                    → BatchDeleteResult (delete one or many)

POST   /api/v1/report-6406/tasks/cancel             → BatchCancelResult (cancel one or many)
POST   /api/v1/report-6406/tasks/start              → BatchStartResult (start one or many)
POST   /api/v1/report-6406/tasks/export             → ExportResult (export to CSV)

GET    /api/v1/report-6406/tasks/{id}/status-history → Array<StatusHistoryItem>
GET    /api/v1/report-6406/tasks/{id}/files         → { files, pagination }
POST   /api/v1/report-6406/tasks/{taskId}/files/{fileId}/retry → FileRetryResult
```

### Packages (пакеты)
```
POST   /api/v1/report-6406/packages                 → Package (create)
GET    /api/v1/report-6406/packages                 → { packages, pagination } (list)
GET    /api/v1/report-6406/packages/{id}            → PackageDetail (get one with tasks)
PATCH  /api/v1/report-6406/packages/{id}            → Package (update name)
DELETE /api/v1/report-6406/packages                 → BatchDeleteResult (delete one or many)

POST   /api/v1/report-6406/packages/{packageId}/tasks           → AddTasksResult (add tasks)
DELETE /api/v1/report-6406/packages/{packageId}/tasks           → RemoveTasksResult (remove tasks)
POST   /api/v1/report-6406/packages/{packageId}/copy-to-tfr    → CopyToTfrResult
```

### Storage (хранилище)
```
GET    /api/v1/report-6406/storage/volume           → StorageInfo
```

### Health
```
GET    /health                                       → HealthStatus
```

## Изменения в типах данных

### Batch Operation Results

```typescript
// Generic batch result
interface BatchOperationResult<T = void> {
  successful: number;
  failed: number;
  results: Array<{
    id: string; // taskId, packageId, etc.
    success: boolean;
    data?: T; // Данные для успешных операций
    error?: string; // Причина ошибки
  }>;
}

// Delete operations
interface BatchDeleteResult extends BatchOperationResult {
  deleted: number; // alias for successful
}

// Cancel operations
interface BatchCancelResult extends BatchOperationResult<{
  status: TaskStatus;
  updatedAt: string;
}> {
  cancelled: number; // alias for successful
}

// Start operations
interface BatchStartResult extends BatchOperationResult<{
  status: TaskStatus;
  startedAt: string;
}> {
  started: number; // alias for successful
}

// Add tasks to package
interface AddTasksResult {
  added: number;
  alreadyInPackage: number;
  notFound: number;
  results: Array<{
    taskId: string;
    success: boolean;
    reason?: string;
  }>;
}

// Remove tasks from package
interface RemoveTasksResult extends BatchOperationResult {
  removed: number; // alias for successful
  notFound: number;
}
```

## План выполнения

### Этап 1: Breaking Changes (требуют обновления frontend)

1. ✅ Убрать обертки из reference endpoints
   - Обновить все 5 endpoints справочников
   - Вернуть прямые массивы вместо объектов

2. ✅ Объединить DELETE операции
   - Tasks: `DELETE /api/v1/report-6406/tasks` (body: taskIds)
   - Packages: `DELETE /api/v1/report-6406/packages` (body: packageIds)
   - Package tasks: `DELETE /api/v1/report-6406/packages/{packageId}/tasks` (body: taskIds)
   - Удалить старые endpoints (bulk-delete, {id})

3. ✅ Объединить CANCEL операции
   - Tasks: `POST /api/v1/report-6406/tasks/cancel` (body: taskIds)
   - Удалить старые endpoints (bulk-cancel, {id}/cancel)

4. ✅ Убрать trailing slash
   - `/api/v1/report-6406/tasks/` → `/api/v1/report-6406/tasks`
   - `/api/v1/report-6406/packages/` → `/api/v1/report-6406/packages`

### Этап 2: Дополнения без breaking changes

5. ✅ Добавить схему для status-history (Breaking Change)
   - Определить схему как простой массив
   - Убрать пагинацию (история обычно небольшая)
   - Обновить swagger

6. ✅ Добавить схемы для export
   - Определить схему request body
   - Определить фильтры для экспорта

7. ✅ Добавить фильтрацию для GET /tasks
   - Query параметры для всех полей
   - Search функциональность
   - Сортировка

8. ✅ Добавить pagination query params для /tasks/{id}/files
   - page и limit параметры

### Этап 3: Улучшения качества

9. ✅ Исправить required для pagination параметров
   - Сделать все опциональными с default значениями

10. ✅ Обновить HTTP статусы
    - 200 OK для batch DELETE с информативным response

11. ✅ Обновить документацию
    - Добавить описания для TFR и других аббревиатур
    - Примеры использования для всех endpoints
    - Создать глоссарий терминов

12. ✅ Обновить swagger schemas
    - Добавить примеры для всех типов
    - Описания для всех полей

### Этап 4: Обновление до OpenAPI 3.1

13. ✅ Подготовка к миграции
    - Проверить совместимость @fastify/swagger с OpenAPI 3.1
    - Проверить инструменты (swagger-ui версия, code generators)
    - Создать план миграции

14. ✅ Обновление спецификации
    - Изменить версию openapi: 3.1.0
    - Обновить version: 2.0.0 (новая мажорная версия API)
    - Адаптировать схемы под JSON Schema 2020-12

15. ✅ Тестирование
    - Проверить корректность отображения в Swagger UI
    - Проверить работу валидации
    - Проверить code generation tools

## Матрица изменений endpoints

| Старый endpoint | Новый endpoint | Метод | Изменение | Breaking |
|----------------|----------------|-------|-----------|----------|
| `/references/branches` | `/references/branches` | GET | Response: `{ branches }` → `[...]` | ✅ Да |
| `/references/report-types` | `/references/report-types` | GET | Response: `{ reportTypes }` → `[...]` | ✅ Да |
| `/references/currencies` | `/references/currencies` | GET | Response: `{ currencies }` → `[...]` | ✅ Да |
| `/references/formats` | `/references/formats` | GET | Response: `{ formats }` → `[...]` | ✅ Да |
| `/references/sources` | `/references/sources` | GET | Response: `{ sources }` → `[...]` | ✅ Да |
| `/tasks/` | `/tasks` | POST | Убран trailing slash | ✅ Да |
| `/tasks/` | `/tasks` | GET | Убран trailing slash + фильтры | ✅ Да |
| `/tasks/{id}` | Удален | DELETE | Перенесен в `/tasks` | ✅ Да |
| `/tasks/bulk-delete` | `/tasks` | DELETE | Объединен | ✅ Да |
| `/tasks/{id}/cancel` | Удален | POST | Перенесен в `/tasks/cancel` | ✅ Да |
| `/tasks/bulk-cancel` | `/tasks/cancel` | POST | Объединен | ✅ Да |
| `/tasks/{id}/status-history` | `/tasks/{id}/status-history` | GET | Response: добавлена схема, убрана пагинация | ✅ Да |
| `/tasks/{id}/files` | `/tasks/{id}/files` | GET | Добавлены query params | ❌ Нет |
| `/tasks/export` | `/tasks/export` | POST | Добавлена схема request | ❌ Нет |
| `/packages/` | `/packages` | POST | Убран trailing slash | ✅ Да |
| `/packages/` | `/packages` | GET | Убран trailing slash | ✅ Да |
| `/packages/{id}` | Удален | DELETE | Перенесен в `/packages` | ✅ Да |
| `/packages/bulk-delete` | `/packages` | DELETE | Объединен | ✅ Да |
| `/packages/{packageId}/tasks/{taskId}` | Удален | DELETE | Перенесен в `/packages/{id}/tasks` | ✅ Да |
| `/packages/{packageId}/tasks/bulk-remove` | `/packages/{packageId}/tasks` | DELETE | Объединен | ✅ Да |

## Требования

### Backend

1. Fastify роуты для всех новых endpoints
2. Обновленные schemas в соответствии с новой структурой
3. Миграция старых endpoints (deprecation warnings)
4. Unit тесты для всех измененных endpoints
5. Обновленная swagger документация

### Frontend (если есть)

1. Обновить API клиенты
2. Обновить типы TypeScript
3. Обновить вызовы измененных endpoints
4. Регрессионное тестирование

### Документация

1. API Reference обновлен
2. Migration Guide для frontend разработчиков
3. Changelog с breaking changes
4. Примеры использования новых endpoints

## Тестирование

### Unit тесты

- [ ] Тесты для всех reference endpoints (проверка формата массива)
- [ ] Тесты для объединенных DELETE operations
- [ ] Тесты для объединенного CANCEL operation
- [ ] Тесты для фильтрации GET /tasks
- [ ] Тесты для pagination GET /tasks/{id}/files
- [ ] Тесты для export с фильтрами
- [ ] Тесты для status-history

### Integration тесты

- [ ] E2E тесты для полного flow создания и удаления tasks
- [ ] E2E тесты для работы с packages
- [ ] Тесты на граничные случаи (пустые массивы, большие батчи)

### Регрессионное тестирование

- [ ] Проверка всех существующих endpoints
- [ ] Проверка обратной совместимости (где применимо)
- [ ] Проверка swagger документации

## Миграция

### Стратегия миграции

**Вариант 1: Big Bang (рекомендуется для небольших проектов)**
- Все изменения в одном релизе
- Frontend и Backend обновляются одновременно
- Требует координации команд

**Вариант 2: Gradual Migration (рекомендуется для production)**
1. Создать новые endpoints параллельно со старыми
2. Пометить старые как deprecated в swagger
3. Дать время frontend на миграцию (2-4 недели)
4. Удалить старые endpoints

**Рекомендация:** Использовать Вариант 2 для production, Вариант 1 для dev/stage.

### Deprecation Warnings

Для старых endpoints добавить заголовки:
```
Deprecation: true
Sunset: 2026-03-01T00:00:00Z
Link: <https://api.example.com/docs/migration>; rel="deprecation"
```

## Риски и митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Breaking changes ломают frontend | Высокая | Критическое | Вариант 2 миграции, deprecated endpoints |
| Ошибки в новой логике batch операций | Средняя | Высокое | Тщательное тестирование, code review |
| Несовместимость со старыми клиентами | Средняя | Среднее | API versioning, документация |
| Увеличение времени разработки | Низкая | Среднее | Приоритизация, поэтапное внедрение |

## Метрики успеха

1. ✅ Все tests pass (100% coverage для измененных endpoints)
2. ✅ Swagger документация обновлена и валидна
3. ✅ Frontend успешно мигрирован на новые endpoints
4. ✅ Нет регрессий в функциональности
5. ✅ Улучшение читаемости кода (по code review)
6. ✅ Уменьшение размера response для справочников (замер в bytes)
7. ✅ Положительная обратная связь от frontend разработчиков

## Дополнительные рекомендации

### API Versioning

Рассмотреть внедрение версионирования API:
```
/api/v2/report-6406/...
```

Это позволит:
- Сохранить v1 для старых клиентов
- Внедрить все breaking changes в v2
- Постепенно мигрировать клиентов

### OpenAPI 3.1

**Решение:** Обновить спецификацию до OpenAPI 3.1

**Преимущества:**
- Полная совместимость с JSON Schema 2020-12
- Улучшенная поддержка сложных типов (discriminators, oneOf, anyOf)
- Поддержка webhooks (на будущее)
- Улучшенная валидация и документация
- Современные инструменты code generation

**Изменения:**
```yaml
openapi: 3.1.0  # было 3.0.3
info:
  title: Backend API
  version: 2.0.0  # новая мажорная версия с breaking changes
```

**Требует:**
- Обновление @fastify/swagger до версии с поддержкой OpenAPI 3.1
- Проверка совместимости с существующими инструментами (swagger-ui, code generators)
- Обновление JSON Schema валидаторов

## Детальный план миграции на OpenAPI 3.1

### Преимущества OpenAPI 3.1

**Основные улучшения:**

1. **Полная совместимость с JSON Schema**
   - OpenAPI 3.1 использует JSON Schema 2020-12
   - Можно использовать любые конструкции JSON Schema без ограничений
   - Лучшая валидация сложных типов

2. **Улучшенная работа с типами**
   ```yaml
   # OpenAPI 3.0 (старое)
   type: string
   nullable: true
   
   # OpenAPI 3.1 (новое)
   type: [string, null]
   # или
   anyOf:
     - type: string
     - type: null
   ```

3. **Поддержка webhooks**
   - Описание callback endpoints
   - Документирование асинхронных событий

4. **Улучшенные discriminators**
   - Лучшая поддержка полиморфизма
   - Cleaner oneOf/anyOf/allOf

5. **Современная экосистема**
   - Новые code generators
   - Лучшая поддержка в IDE
   - Активное развитие инструментов

### Необходимые изменения

#### 1. Обновление зависимостей

**package.json:**
```json
{
  "dependencies": {
    "@fastify/swagger": "^9.0.0",  // версия с поддержкой OpenAPI 3.1
    "@fastify/swagger-ui": "^5.0.0"
  }
}
```

**Проверка совместимости:**
```bash
npm info @fastify/swagger
npm info @fastify/swagger-ui
```

#### 2. Изменение спецификации

**swagger plugin config (src/plugins/swagger.ts):**
```typescript
// Было
fastify.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'Backend API',
      version: '1.0.0'
    }
  }
});

// Стало
fastify.register(fastifySwagger, {
  openapi: {
    openapi: '3.1.0',  // ← Обновлено
    info: {
      title: 'Backend API',
      version: '2.0.0',  // ← Новая мажорная версия
      description: 'API документация для Backend проекта на Fastify + TypeScript + PostgreSQL',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api-stage.example.com',
        description: 'Staging server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ]
  }
});
```

#### 3. Обновление схем (nullable → type: null)

**Было (OpenAPI 3.0):**
```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string', nullable: true }  // ← старый способ
  }
};
```

**Стало (OpenAPI 3.1):**
```typescript
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: {
      anyOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    }
    // или короче:
    // description: { type: ['string', 'null'] }
  }
};
```

**Автоматизация замены:**

Создать скрипт для замены всех `nullable: true`:

```typescript
// scripts/migrate-schemas-to-openapi-3.1.ts
import fs from 'fs';
import path from 'path';

function migrateSchema(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(migrateSchema);
  }

  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'nullable' && value === true) {
      // Пропускаем, обработаем в type
      continue;
    }

    if (key === 'type' && obj.nullable === true) {
      // Преобразуем type с nullable
      result.anyOf = [
        { type: value },
        { type: 'null' }
      ];
    } else {
      result[key] = migrateSchema(value);
    }
  }

  return result;
}

// Применить к всем schema файлам
// ...
```

#### 4. Примеры использования новых возможностей

**Discriminators для Union Types:**

```typescript
const taskSchema = {
  oneOf: [
    {
      type: 'object',
      properties: {
        type: { const: 'report' },
        reportType: { type: 'string' },
        format: { type: 'string' }
      },
      required: ['type', 'reportType', 'format']
    },
    {
      type: 'object',
      properties: {
        type: { const: 'export' },
        exportFormat: { type: 'string' }
      },
      required: ['type', 'exportFormat']
    }
  ],
  discriminator: {
    propertyName: 'type',
    mapping: {
      report: '#/components/schemas/ReportTask',
      export: '#/components/schemas/ExportTask'
    }
  }
};
```

**Webhooks (для будущего):**

```typescript
const webhooksSpec = {
  webhooks: {
    'task.completed': {
      post: {
        summary: 'Task Completion Webhook',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  taskId: { type: 'string', format: 'uuid' },
                  status: { type: 'string' },
                  completedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Webhook received' }
        }
      }
    }
  }
};
```

### Checklist для миграции на OpenAPI 3.1

- [ ] Проверить совместимость @fastify/swagger >= 9.0.0
- [ ] Обновить зависимости (npm install)
- [ ] Изменить openapi: '3.1.0' в swagger config
- [ ] Обновить version: '2.0.0' (новая мажорная версия API)
- [ ] Найти все использования nullable: true
- [ ] Заменить на anyOf: [{ type: '...' }, { type: 'null' }]
- [ ] Проверить работу swagger UI (http://localhost:3000/documentation)
- [ ] Проверить валидацию запросов/ответов
- [ ] Обновить тесты (если есть изменения в валидации)
- [ ] Добавить примеры (examples) в схемы для документации
- [ ] Добавить descriptions для всех полей
- [ ] Проверить code generation (если используется)
- [ ] Обновить CHANGELOG.md
- [ ] Создать migration guide для API consumers

### Потенциальные проблемы и решения

| Проблема | Решение |
|----------|---------|
| Старая версия @fastify/swagger | Обновить до >= 9.0.0 |
| Swagger UI не поддерживает 3.1 | Обновить @fastify/swagger-ui до >= 5.0.0 |
| Breaking changes в валидации | Тщательное тестирование, regression tests |
| Code generators не поддерживают 3.1 | Использовать новые версии или альтернативы (openapi-generator >= 6.0) |
| Старые клиенты | Версионирование API (/api/v1 vs /api/v2) |

### Инструменты для проверки

```bash
# Валидация OpenAPI 3.1 спецификации
npx @apidevtools/swagger-cli validate docs/swagger/swagger.json

# Конвертация 3.0 → 3.1 (если нужно)
npx openapi-converter --from 3.0 --to 3.1 swagger-3.0.json > swagger-3.1.json

# Генерация клиента (проверка совместимости)
npx openapi-generator-cli generate \
  -i docs/swagger/swagger.json \
  -g typescript-fetch \
  -o generated/client
```

## Ссылки

- [REST API Best Practices](https://restfulapi.net/)
- [OpenAPI 3.1.0 Specification](https://spec.openapis.org/oas/v3.1.0)
- [OpenAPI 3.0 to 3.1 Migration Guide](https://www.openapis.org/blog/2021/02/16/migrating-from-openapi-3-0-to-3-1-0)
- [JSON Schema 2020-12](https://json-schema.org/specification.html)
- [HTTP Status Codes](https://httpstatuses.com/)
- [API Deprecation Best Practices](https://nordicapis.com/how-to-smartly-sunset-and-deprecate-apis/)
- [Fastify Swagger Plugin](https://github.com/fastify/fastify-swagger)

## Чеклист для разработчика

### Подготовка
- [ ] Прочитал и понял все изменения
- [ ] Создал ветку для task: `feature/TASK-007-refactor-api`
- [ ] Обсудил breaking changes с командой

### Этап 1: Breaking Changes
- [ ] Убрал обертки из 5 reference endpoints
- [ ] Объединил DELETE операции (tasks, packages, package-tasks)
- [ ] Объединил CANCEL операции (tasks)
- [ ] Убрал trailing slash из URLs
- [ ] Написал unit тесты для изменений
- [ ] Обновил integration тесты

### Этап 2: Дополнения
- [ ] Добавил схему для status-history (простой массив)
- [ ] Добавил схему для export request body
- [ ] Добавил фильтрацию для GET /tasks (10+ параметров)
- [ ] Добавил pagination query params для GET /tasks/{id}/files
- [ ] Написал тесты для новой функциональности

### Этап 3: Улучшения качества
- [ ] Сделал pagination параметры опциональными
- [ ] Обновил HTTP статусы (200 OK для DELETE с телом)
- [ ] Добавил глоссарий терминов (TFR и др.)
- [ ] Добавил примеры для всех endpoints
- [ ] Добавил descriptions для всех полей схем

### Этап 4: OpenAPI 3.1
- [ ] Проверил совместимость @fastify/swagger >= 9.0.0
- [ ] Обновил зависимости (npm install)
- [ ] Изменил openapi: '3.1.0' в конфигурации
- [ ] Обновил version: '2.0.0' в info
- [ ] Заменил nullable: true на anyOf/type: null
- [ ] Проверил swagger UI локально
- [ ] Проверил валидацию схем

### Документация
- [ ] Обновил swagger документацию (генерация)
- [ ] Обновил CHANGELOG.md (breaking changes отдельно)
- [ ] Создал MIGRATION.md для frontend команды
- [ ] Обновил README.md (если нужно)
- [ ] Добавил примеры использования новых endpoints

### Тестирование
- [ ] Unit тесты: все pass
- [ ] Integration тесты: все pass
- [ ] Regression тесты: проверил старую функциональность
- [ ] Проверил swagger UI визуально
- [ ] Проверил все примеры из документации

### Code Review
- [ ] Провел self-review
- [ ] Запросил code review у команды
- [ ] Исправил замечания
- [ ] Получил approvals

### Деплой
- [ ] Задеплоил на dev окружение
- [ ] Провел smoke testing на dev
- [ ] Задеплоил на stage окружение
- [ ] Координация с frontend командой для миграции
- [ ] Merged в main (после одобрения)
- [ ] Задеплоил на production
- [ ] Мониторинг метрик после деплоя (24 часа)
- [ ] Проверил логи на ошибки

### Post-Release
- [ ] Отправил уведомление команде о релизе
- [ ] Ответил на вопросы по миграции
- [ ] Закрыл task в трекере
- [ ] Ретроспектива (что прошло хорошо/плохо)

---

**Примечание:** Этот документ является результатом анализа swagger.json и может быть скорректирован после обсуждения с командой.
