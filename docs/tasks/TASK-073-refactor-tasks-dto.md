# TASK-073: Рефакторинг DTO заданий — унификация через baseTaskSchema

**Статус**: 📋 Запланировано
**Ветка**: `feature/TASK-073-refactor-tasks-dto`

---

## Краткое описание

Привести все Zod-схемы заданий в `service2110/src/schemas/report-6406/tasks.schema.ts` к единой системе, построенной на `baseTaskSchema`. Устранить дублирование полей, устаревшие имена (`branchId`, `periodStart`, `format` и т.д.) и разночтения между схемами (единицы `fileSize`, nullable vs default, `packageIds` vs `packageId`).

---

## Контекст

В файле `tasks.schema.ts` исторически сложились три поколения схем:
- **`taskSchema`** — старый «полный» DTO со старыми именами полей.
- **`taskListItemSchema`** — элемент списка, тоже со старыми именами.
- **`taskDetailSchema`** — каноничная схема для POST 201 / GET /:id, с новыми именами (periodFrom/periodTo, branchIdsList, currencyCode, fileType).

Между ними разночтения в именовании полей, единицах измерения `fileSize` (байты vs мегабайты), подходе к nullable/default, `packageIds` (массив) vs `packageId` (singular).

`baseTaskSchema` уже добавлен в файл и содержит общие поля. Следующий шаг — построить все схемы через `.extend()` / `.pick()` от этой базы.

---

## Принятые решения

| Вопрос | Решение |
|---|---|
| `fileSize` — единицы | Мегабайты |
| `fileSize` — null/default | `default(0)`, 0 означает «ещё не рассчитан» |
| Элемент списка | `taskSchema` (вместо `taskListItemSchema`) |
| `currencyCode` | Всегда присутствует во всех схемах |
| `filesCount` | Убираем из DTO заданий; получаем отдельным запросом списка файлов |
| `packageId` vs `packageIds` | `packageId` (singular, nullable) |

---

## План реализации

### Шаг 1. Доработать `baseTaskSchema`

- `fileSize`: добавить `.default(0)`, уточнить describe — «Размер файла в мегабайтах; 0 — ещё не рассчитан»

Целевой набор полей `baseTaskSchema`:
`id`, `createdAt`, `createdBy`, `branchIdsList`, `reportType`, `periodFrom`, `periodTo`, `currencyCode`, `fileType`, `status`, `fileSize`, `updatedAt`

### Шаг 2. Переписать `createTaskSchema`

Через `baseTaskSchema.pick().extend()`:
- `.pick()`: `branchIdsList`, `reportType`, `periodFrom`, `periodTo`, `fileType`
- `.extend()`: `currencyCode` (optional, default RUB), `account`, `accountSecondOrderList`, `sourcesList` — все optional
- `.refine()`: `periodTo >= periodFrom`
- Удалить устаревшие поля: `branchId`, `branchIds`, `periodStart`, `periodEnd`, `accountMask`, `accountSecondOrder`, `currency`, `format`, `source`
- Удалить refine на `branchId || branchIds`

### Шаг 3. Переписать `taskDetailSchema`

Через `baseTaskSchema.extend()`:
- Добавить: `account`, `accountSecondOrderList`, `sourcesList`, `s3FolderId`, `operationTypesList`, `packageId`
- Убрать: `filesCount` (отдельный запрос), `.refine()` на periodFrom/periodTo (бессмысленный — поля обязательны), `.default()` с fileType, `.nonoptional()`
- Все дублированные поля убираются (наследуются из base)

### Шаг 4. Заменить `taskSchema` + удалить `taskListItemSchema`

Новый `taskSchema` через `baseTaskSchema.extend()`:
- Добавить: `canCancel`, `canDelete`, `canStart`, `packageId` (nullable)
- Удалить старый `taskSchema` (строки 85-122) и `taskListItemSchema` (строки 172-196)
- Удалить `taskPackageInfoSchema` (больше не нужна)
- Типы: `type Task`, `type TaskListItem` → единый `type Task`

### Шаг 5. Обновить sort / filter схемы

**`taskListSortColumnSchema`** — переименовать значения enum:
- `'branchId'` → `'branchIdsList'`
- `'periodStart'` → `'periodFrom'`
- `'periodEnd'` → `'periodTo'`
- `'format'` → `'fileType'`
- `'branchName'` → удалить (нет в base)

**`tasksListFilterSchema`** — переименовать поля:
- `branchIds` → `branchIdsList`
- `format` → `fileType`

### Шаг 6. Обновить `tasksListResponseSchema`

Заменить `taskListItemSchema` на `taskSchema` в `items`.

### Шаг 7. Обновить зависимости

| Файл | Что менять |
|---|---|
| `schema-registry.ts` | Удалить `TaskDto` (старый), переименовать `TaskListItemDto` → `TaskDto` (новый `taskSchema`) |
| `routes/.../tasks/index.ts` | Проверить/обновить импорты |
| `tasks.service.ts` | Обновить маппинг полей под новые имена |
| Тесты | Обновить имена полей |

### Шаг 8. Проверка bulk-схем

`bulkDeleteTasksSchema`, `bulkDeleteResponseSchema`, `bulkCancelTasksSchema`, `bulkCancelResponseSchema`, `cancelTaskResponseSchema`, `startTasksSchema`, `startTaskResultSchema`, `startTaskErrorSchema`, `startTasksResponseSchema` — используют только `zIdSchema` и `taskStatusSchema`, не затронуты переименованием. Проверить на всякий случай.

---

## Критерии приёмки

- [ ] `baseTaskSchema` содержит все общие поля с корректными типами и описаниями
- [ ] `createTaskSchema` строится через `baseTaskSchema.pick().extend()`, без дублирования
- [ ] `taskDetailSchema` строится через `baseTaskSchema.extend()`, без `filesCount`, без бессмысленного refine
- [ ] `taskSchema` (бывший `taskListItemSchema`) строится через `baseTaskSchema.extend()`, содержит `canCancel/canDelete/canStart/packageId`
- [ ] Старый `taskSchema`, `taskListItemSchema`, `taskPackageInfoSchema` удалены
- [ ] Sort enum и filter schema используют новые имена полей (`branchIdsList`, `periodFrom`, `periodTo`, `fileType`)
- [ ] `tasksListResponseSchema` использует новый `taskSchema`
- [ ] `schema-registry.ts` обновлён: `TaskDto` ссылается на новый `taskSchema`
- [ ] Роуты компилируются без ошибок
- [ ] Bulk-схемы не затронуты и работают
- [ ] Задание зарегистрировано в `docs/tasks/tasks-manifest.json`

---

## Связанные задачи

- **[TASK-012](TASK-012-review-api-6406-part3.md)** — унификация DTO деталей (первоначальное создание `taskDetailSchema`)
- **[TASK-043](TASK-043-api-contract-feedback-backend.md)** — обратная связь по API контракту
- **[TASK-068](TASK-068-uuid-int.md)** — замена uuid на int
- **[TASK-069](TASK-069-refactoring-services.md)** — рефакторинг сервисов

---

## Регистрация

Задание зарегистрировано в `docs/tasks/tasks-manifest.json`.
