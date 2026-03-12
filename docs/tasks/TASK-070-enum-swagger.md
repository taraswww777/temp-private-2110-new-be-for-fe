# TASK-070: Исправление enum в Swagger

**Статус**: ✅ Выполнено
**Ветка**: `feature/task-070-enum-swagger` (при необходимости)  
**Приоритет**: средний  

---


## Краткое описание

В Swagger-спецификации enum дублируются inline вместо переиспользования через `$ref`. Нужно зарегистрировать `ReportTypeEnumSchema`, убрать неиспользуемый `ReportFormTypeEnum` и вынести повторяющиеся inline enum в переиспользуемые схемы.

---

## Контекст

- В API используется `reportType` (LSOZ, LSOS, LSOP, KROS_VOS, KROS_VZS, KROS) — это `ReportTypeEnum`.
- В `openapi-components.ts` зарегистрирован `ReportFormTypeEnum` (N3462D, KROS, N6406D), который нигде не используется.
- `ReportTypeEnumSchema` не добавлен в компоненты, поэтому `replaceNestedSchemas` не может заменить inline enum на `$ref`.
- В `zodToJsonSchema` используется `$refStrategy: 'none'`, из‑за чего все enum разворачиваются inline.
- Дополнительно: enum статуса конвертации файла (PENDING, CONVERTING, COMPLETED, FAILED) и статуса пакета (pack_create, pack_transfer и т.д.) повторяются в нескольких DTO.

---

## Цели

- [x] Добавить `ReportTypeEnumSchema` в `openapi-components.ts` и в список `enumTypes` в `app.ts`
- [x] Удалить или заменить неиспользуемый `ReportFormTypeEnum` в компонентах
- [x] Вынести в переиспользуемые схемы inline enum: статус конвертации файла, статус пакета (если ещё дублируются)
- [x] ~~Исправить массив `enumTypes`~~ — снято: ручной маппинг заменён на `fastify-type-provider-zod`
- [x] ~~Добавить рекурсию в `replaceSchemaInParameters`~~ — снято: `createJsonSchemaTransform` делает это автоматически
- [x] Проверить, что в итоговом `service2110.json` enum переиспользуются через `$ref`
- [x] Перейти на `fastify-type-provider-zod` (`createJsonSchemaTransform` / `createJsonSchemaTransformObject`)
- [x] Перевести `schema-registry.ts` на `z.registry()` (Zod v4)
- [x] Удалить мёртвый код: `openapi-components.ts`, `zodToJsonSchema.ts`
- [x] Убрать дубли `*Input`-схем из swagger-спецификации
- [x] Исправить `export.schema.ts`: `z.enum(TaskStatusEnum)` → `taskStatusSchema`
- [x] Заменить инлайн JSON-схемы ошибок в роутах на Zod-схемы
- [x] Удалить deprecated-экспорты `getSchemaName` / `schemaRegistry` из `schema-registry.ts`

---

## Критерии приёмки

- [x] В `service2110.json` поле `reportType` во всех DTO ссылается на `#/components/schemas/ReportTypeEnum`
- [x] `ReportFormTypeEnum` удалён из компонентов и swagger
- [x] Нет дублирования одинаковых enum (reportType, статус конвертации, статус пакета) в DTO
- [x] Нет inline enum в query-параметрах (FileStatusEnum в `/tasks/{id}/files`) — решено через `createJsonSchemaTransform`
- [x] ~~`enumTypes` содержит корректные имена~~ — снято: ручной маппинг удалён
- [x] Swagger UI корректно отображает enum и их описания
- [x] Нет `*Input`-дублей схем в `components.schemas`
- [x] Все зарегистрированные enum'ы используют `$ref` (в т.ч. `ExportTasksResponseDto.status`)
- [x] `x-enum-descriptions`, `x-enum-varnames`, `oneOf` сохраняются на enum-схемах после автогенерации
- [x] Все response-схемы в роутах — Zod (нет инлайн JSON)

---

## Технические заметки

**Ключевые файлы (текущая архитектура):**
- `service2110/src/schemas/schema-registry.ts` — единый реестр: `z.registry()` + `openApiRegistry.add(schema, { id })`
- `service2110/src/app/plugins/registerFastifySwagger.ts` — `createJsonSchemaTransform` / `createEnhancedTransformObject`
- `service2110/src/schemas/enums/*.ts` — enum-схемы с `createEnumSchemaWithDescriptions`

**Удалённые файлы:**
- ~~`service2110/src/schemas/openapi-components.ts`~~ — мёртвый код после перехода на `z.registry()`
- ~~`service2110/src/schemas/utils/zodToJsonSchema.ts`~~ — использовался только в `openapi-components.ts`
- ~~`service2110/src/app.ts`~~ — заменён на `service2110/src/app/app.ts` + плагины

**Принцип работы `$ref`:** библиотека `fastify-type-provider-zod` сравнивает Zod-схемы по **ссылке на объект** (identity), а не по структуре. Чтобы enum резолвился в `$ref`, в свойствах DTO нужно использовать тот же экземпляр, который зарегистрирован в `openApiRegistry` (например `taskStatusSchema`, а не новый `z.enum(TaskStatusEnum)`).

**Проверка:** после изменений запустить приложение и убедиться, что `docs/swagger/service2110.json` генерируется с `$ref` для enum.

---

## Уточнения в процессе выполнения

### 1. `enumTypes` в `registerFastifySwagger.ts` — имена не совпадают с ключами компонентов

Массив `enumTypes` (строка ~221) использует имена с суффиксом `Schema` (`FileFormatEnumSchema`, `TaskStatusEnumSchema` и т.д.), но ключи в `getOpenApiComponents()` — без суффикса (`FileFormatEnum`, `TaskStatusEnum`). Из-за этого фильтр `componentNames.filter(name => !enumTypes.includes(name))` не срабатывает, и все enum'ы попадают в `objectTypes` вместо обработки в приоритетном порядке.

Также не хватает: `PacketStatusEnum`, `FileStatusEnum`, `ReportTypeEnum`, `StorageCodeEnum`.

**Нужно заменить на:**
```
const enumTypes = ['PacketStatusEnum', 'FileStatusEnum', 'ReportTypeEnum', 'StorageCodeEnum', 'SortOrderEnum', 'CurrencyEnum', 'FileFormatEnum', 'TaskStatusEnum'];
```

### 2. Inline `FileStatusEnum` в query-параметрах не заменяется на `$ref`

В swagger JSON параметр `status` эндпоинта `/tasks/{id}/files` содержит inline `["PENDING", "CONVERTING", "COMPLETED", "FAILED"]` внутри `items` массива. Функция `replaceSchemaInParameters` в `onReady`-хуке сравнивает только `p.schema` верхнего уровня и не спускается внутрь `items`. Нужно добавить рекурсию (или вызвать `replaceNestedSchemas` внутри `replaceSchemaInParameters`).

### 3. `StorageCodeEnum` был зарегистрирован через `zodToJsonSchema` вместо расширенной enum-схемы

Создан полноценный `StorageCodeEnum.ts` по аналогии с другими enum'ами (`FileStatusEnum`, `TaskStatusEnum`). В `openapi-components.ts` заменён `zodToJsonSchema(storageCodeSchema, ...)` на `StorageCodeEnumSwaggerSchema`. Обновлены `schema-registry.ts` и `storage.service.ts`.

### 4. `SortOrderEnum` — copy-paste ошибка и некорректные описания

В `SortOrderEnum.ts` переменная описаний была названа `ReportFormTypeDescriptions` (copy-paste). Исправлена на `SortOrderDescriptions`. Описания обновлены на нейтральные: «Сортировка по возрастанию» / «Сортировка по убыванию».

### 5. Inline `sortBy` enum'ы в схемах report-6406

В `task-files.schema.ts`, `packages.schema.ts`, `export.schema.ts` поле `sortBy` было определено как `z.enum([...])` inline. Вынесены в именованные схемы: `taskFileSortBySchema`, `packageSortBySchema`, `exportSortBySchema`. В `tasks.schema.ts` уже было корректно (`taskListSortColumnSchema`).

### 6. PgEnum'ы добавлены в `enums.schema.ts`

Добавлены `fileStatusPgEnum` и `sortOrderPgEnum` в `service2110/src/db/schema/enums.schema.ts` для консистентности с остальными enum'ами.

### 7. Переход на `fastify-type-provider-zod` — замена ручного маппинга

`registerFastifySwagger.ts` полностью переписан: удалена вся ручная логика `$ref`-замены (~500 строк). Вместо неё используются `createJsonSchemaTransform` и `createJsonSchemaTransformObject` из `fastify-type-provider-zod`, которые автоматически генерируют `components.schemas` и подставляют `$ref` на основе `z.registry()`.

`schema-registry.ts` переведён с `Map<string, unknown>` на `z.registry<{ id: string }>()` (Zod v4). Все Zod-схемы регистрируются через `openApiRegistry.add(schema, { id: 'SchemaName' })`.

### 8. `openapi-components.ts` и `zodToJsonSchema.ts` — мёртвый код

После перехода на `fastify-type-provider-zod` файлы `openapi-components.ts` (ручной маппинг `zodToJsonSchema()` → JSON Schema) и `schemas/utils/zodToJsonSchema.ts` больше нигде не импортируются. `getOpenApiComponents()` не имеет ни одного потребителя. Оба файла удалены.

### 9. Дубли `*Input`-схем в swagger-спецификации

Библиотека `fastify-type-provider-zod` генерирует две версии каждой зарегистрированной схемы: `SchemaName` (output) и `SchemaNameInput` (input). Для enum'ов они идентичны, для объектов с `.default()` — Input-версия имеет опциональные поля.

В `createEnhancedTransformObject` добавлен пост-процессинг: все `*Input`-схемы удаляются из `components.schemas`, а `$ref`-ссылки перезаписываются на базовые имена (без суффикса). Если output-версия отсутствует — input-схема промотируется на её место.

### 10. `export.schema.ts` — `z.enum(TaskStatusEnum)` вместо `taskStatusSchema`

В `exportTasksResponseSchema` поле `status` использовало `z.enum(TaskStatusEnum)` — создание нового экземпляра enum вместо зарегистрированного `taskStatusSchema`. Библиотека сравнивает по **ссылке на объект**, а не по структуре, поэтому не находила этот enum в реестре и инлайнила его. Исправлено на `taskStatusSchema.describe('Статус экспорта')`.

### 11. Инлайн JSON-схемы в роутах — несовместимость с `createJsonSchemaTransform`

В роутах `packages/index.ts` (POST и PATCH, response 400) и `packages/status-history.ts` (GET, response 404) использовались инлайн JSON-объекты вместо Zod-схем для описания ошибок. `createJsonSchemaTransform` ожидает только Zod-схемы и падала с `FastifyError: Invalid schema passed`. Инлайн JSON заменён на `duplicatePackageErrorSchema` (новая Zod-схема) и `httpErrorWithInstanceSchema`.

### 12. `sortBy` inline enum'ы — ожидаемое поведение

Поля `sortBy` в `packagesQuerySchema`, `taskFilesQuerySchema`, `exportTasksRequestSchema` — это локальные enum'ы с конкретным набором полей для сортировки (например `['createdAt', 'name', 'tasksCount', 'totalSize']`). Они **не являются** переиспользуемыми компонентами и не зарегистрированы в `openApiRegistry`. Инлайн для них — корректное поведение; при необходимости можно зарегистрировать отдельно.

### 13. Deprecated-экспорты в `schema-registry.ts`

`getSchemaName()` и `schemaRegistry` были добавлены для обратной совместимости со старым `src/app.ts`. После удаления `src/app.ts` (вынесен в `src/app/app.ts` с новой архитектурой) эти экспорты больше не имеют потребителей и могут быть удалены.

