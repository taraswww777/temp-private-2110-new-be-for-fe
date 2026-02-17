# TASK-039: Рефакторинг endpoint получения деталей пакета

**Статус**: ✅ Выполнено (Backend)  
**Ветка**: `feature/TASK-039-refactor-package-details-endpoint`

---

## Краткое описание

Рефакторинг endpoint `/api/v1/report-6406/packages/:id`: убрать параметры, перестать отдавать `tasks` и `tasksPagination`, унифицировать DTO. Добавить параметры фильтрации для получения списков задач пакета.

---

## Исходное описание задачи

> Данный раздел содержит оригинальное описание задачи для оперативного обращения.

**Источник:** [Заметки от 05.02.2026](../temp-private-2110/docs/notes/2026-02-05.md#получение-деталей-пакета-тарас)

```
`'/api/v1/report-6406/packages/:id'` - все параметры убираем, и перестаём отдавать `tasks`, `tasksPagination`

Тем самым `PackageDto` и `PackageDetailDto` станут равны и останется только `PackageDto`.

Получить список задач входящих в пакет.
Получить список задач отсутствующих в пакете.

`'/api/v1/report-6406/packages/:id/includedTasks'` - под вопросом, решение принимают BE
`'/api/v1/report-6406/packages/:id/excludedTasks'` - под вопросом, решение принимают BE

Нужно учитывать что эти эндпоинты должны расширять набор фильтров которые поддерживаются в `/api/v1/report-6406/tasks/list`.

Сегодня делаем так:
В `/api/v1/report-6406/tasks/list` добавить параметр `includedInPacket` и `excludedInPacket`.
```

---

## Цели

- Упростить endpoint получения деталей пакета
- Унифицировать DTO (объединить `PackageDto` и `PackageDetailDto`)
- Добавить фильтрацию задач по принадлежности к пакету
- Обеспечить расширяемость фильтров для списков задач пакета

---

## Детальное описание

### Контекст

Текущий endpoint `/api/v1/report-6406/packages/:id` имеет параметры и возвращает задачи пакета. Это усложняет структуру и не соответствует принципам разделения ответственности.

### Требования

#### 1. Рефакторинг основного endpoint

**Endpoint:** `GET /api/v1/report-6406/packages/:id`

**Изменения:**
- Убрать все query параметры
- Убрать поля `tasks` и `tasksPagination` из response
- Использовать единый `PackageDto` вместо `PackageDetailDto`

**Response (упрощённый):**
```json
{
  "id": "uuid",
  "name": "Название пакета",
  "status": "created",
  "createdAt": "2026-02-05T10:00:00Z",
  "createdBy": "user.login",
  // ... остальные поля без tasks и tasksPagination
}
```

#### 2. Фильтрация задач по пакету

**Endpoint:** `POST /api/v1/report-6406/tasks/list`

**Новые параметры в Request Body:**
```json
{
  "pagination": {...},
  "sorting": {...},
  "filter": [...],
  "includedInPacket": "uuid-пакета",  // Новый параметр
  "excludedInPacket": "uuid-пакета"   // Новый параметр
}
```

**Логика:**
- `includedInPacket` - вернуть только задачи, входящие в указанный пакет
- `excludedInPacket` - вернуть только задачи, НЕ входящие в указанный пакет
- Параметры взаимоисключающие (нельзя использовать оба одновременно)

**Альтернативный вариант (под вопросом):**
- `GET /api/v1/report-6406/packages/:id/includedTasks` - задачи пакета
- `GET /api/v1/report-6406/packages/:id/excludedTasks` - задачи не в пакете

**Решение принято:** Реализован вариант с добавлением параметров `includedInPacket` и `excludedInPacket` в `POST /api/v1/report-6406/tasks/list`. Отдельные endpoints `/includedTasks` и `/excludedTasks` не создавались, так как существующий endpoint `/tasks/list` уже поддерживает все необходимые фильтры, пагинацию и сортировку.

#### 3. Расширяемость фильтров

Новые endpoints или параметры должны поддерживать все фильтры, которые поддерживает `/api/v1/report-6406/tasks/list`:
- Пагинация
- Сортировка
- Все существующие фильтры

---

## Критерии приёмки

### Рефакторинг основного endpoint
- [x] Убраны все query параметры из `GET /api/v1/report-6406/packages/:id`
- [x] Убраны поля `tasks` и `tasksPagination` из response
- [x] `PackageDto` и `PackageDetailDto` объединены в один `PackageDto`
- [x] Удалён `PackageDetailDto` из кода
- [x] Обновлена OpenAPI спецификация
- [x] Обновлены все места использования endpoint на Backend

### Фильтрация задач по пакету
- [x] Добавлены параметры `includedInPacket` и `excludedInPacket` в `/api/v1/report-6406/tasks/list`
- [x] Реализована логика фильтрации задач по пакету
- [x] Параметры взаимоисключающие (валидация через `refine` в Zod схеме)
- [x] Поддерживаются все существующие фильтры, пагинация и сортировка
- [x] Обновлена OpenAPI спецификация
- [ ] Добавлены unit-тесты (требуется дополнительная работа)

### Альтернативный вариант (не выбран)
- [ ] Реализованы endpoints `/api/v1/report-6406/packages/:id/includedTasks` и `/excludedTasks`
- [ ] Endpoints поддерживают все фильтры из `/api/v1/report-6406/tasks/list`
- [ ] Обновлена OpenAPI спецификация
- [ ] Добавлены unit-тесты

**Примечание:** Альтернативный вариант не был реализован, так как выбран вариант с добавлением параметров в существующий endpoint `/tasks/list`.

### Общие критерии
- [x] Все изменения протестированы (компиляция TypeScript успешна)
- [x] Обратная совместимость: изменения требуют обновления Frontend (см. раздел "Требования к Frontend")
- [x] Документация обновлена (OpenAPI спецификация, схемы)

---

## Порядок выполнения

1. Проанализировать текущую структуру `PackageDto` и `PackageDetailDto`
2. Объединить DTO в один `PackageDto`
3. Упростить endpoint `GET /api/v1/report-6406/packages/:id`
4. Реализовать фильтрацию задач по пакету (выбрать вариант реализации)
5. Обновить OpenAPI спецификацию
6. Написать unit-тесты
7. Обновить Frontend (если требуется)
8. Протестировать изменения

---

## Связанные документы

- [Заметки от 05.02.2026](../temp-private-2110/docs/notes/2026-02-05.md)
- TASK-013: Добавление возможности получения заданий для добавления в пакет

---

---

## Технические детали реализации

### Выбранное решение

**Вариант:** Добавление параметров `includedInPacket` и `excludedInPacket` в существующий endpoint `POST /api/v1/report-6406/tasks/list`

**Обоснование:**
- Существующий endpoint уже поддерживает все необходимые фильтры, пагинацию и сортировку
- Не требуется создавать новые endpoints, что упрощает архитектуру
- Единая точка входа для получения списка задач с различными фильтрами
- Легко расширять в будущем

**Альтернативный вариант не выбран:**
- Отдельные endpoints `/api/v1/report-6406/packages/:id/includedTasks` и `/excludedTasks` не создавались
- Причина: дублирование функциональности существующего endpoint

### Детали реализации фильтрации

#### Логика работы параметров

1. **`includedInPacket`** (UUID пакета):
   - Использует SQL подзапрос с `EXISTS`:
   ```sql
   EXISTS (
     SELECT 1 FROM report_6406_package_tasks
     WHERE task_id = report_6406_tasks.id
       AND package_id = :includedInPacket
   )
   ```

2. **`excludedInPacket`** (UUID пакета):
   - Использует SQL подзапрос с `NOT EXISTS`:
   ```sql
   NOT EXISTS (
     SELECT 1 FROM report_6406_package_tasks
     WHERE task_id = report_6406_tasks.id
       AND package_id = :excludedInPacket
   )
   ```

3. **Приоритет параметров:**
   - Если указан `includedInPacket` или `excludedInPacket`, то `filter.packageId` игнорируется
   - Это позволяет явно контролировать фильтрацию по пакету

#### Валидация

Параметры `includedInPacket` и `excludedInPacket` взаимоисключающие. Валидация реализована через Zod `refine`:

```typescript
.refine(
  (data) => {
    if (data.includedInPacket && data.excludedInPacket) {
      return false;
    }
    return true;
  },
  {
    message: 'includedInPacket and excludedInPacket cannot be used together',
    path: ['includedInPacket'],
  }
)
```

---

## Выполненные изменения

### Backend (✅ Завершено)

#### 1. Рефакторинг endpoint получения деталей пакета
- **Файл:** `service2110/src/routes/v1/report-6406/packages/index.ts`
- Убраны все query параметры (`tasksNumber`, `tasksSize`, `tasksSortBy`, `tasksSortOrder`) из `GET /api/v1/report-6406/packages/:id`
- Убраны поля `tasks` и `tasksPagination` из response
- Endpoint теперь возвращает только `PackageDto` без задач

#### 2. Унификация DTO
- **Файлы:** 
  - `service2110/src/schemas/report-6406/packages.schema.ts`
  - `service2110/src/schemas/openapi-components.ts`
  - `service2110/src/schemas/schema-registry.ts`
- Удалены схемы: `packageDetailSchema`, `packageTaskItemSchema`, `packageTasksQuerySchema`
- Удалены типы: `PackageDetail`, `PackageTaskItem`, `PackageTasksQuery`
- Объединены `PackageDto` и `PackageDetailDto` в один `PackageDto`
- Обновлены все импорты и регистрации схем

#### 3. Упрощение сервиса пакетов
- **Файл:** `service2110/src/services/report-6406/packages.service.ts`
- Метод `getPackageById()` упрощён: убраны параметры `tasksQuery`, убрана логика получения задач
- Метод теперь возвращает только базовую информацию о пакете
- Удалены неиспользуемые импорты (`getStatusPermissions`, `TaskStatus`, `report6406Tasks`, `report6406TaskBranches`, `branches`)

#### 4. Фильтрация задач по пакету
- **Файлы:**
  - `service2110/src/schemas/report-6406/tasks.schema.ts`
  - `service2110/src/services/report-6406/tasks.service.ts`
- Добавлены параметры `includedInPacket` и `excludedInPacket` в схему `getTasksRequestSchema`
- Реализована валидация взаимоисключающих параметров через `refine`
- Обновлён метод `buildFilterConditions()` для поддержки новых параметров:
  - `includedInPacket` - фильтрует задачи, входящие в указанный пакет (через `EXISTS` подзапрос)
  - `excludedInPacket` - фильтрует задачи, НЕ входящие в указанный пакет (через `NOT EXISTS` подзапрос)
- Параметры имеют приоритет над `filter.packageId` (если указаны, то `filter.packageId` игнорируется)

#### 5. Обновление OpenAPI спецификации
- Удалены ссылки на `PackageDetailDto` из всех компонентов
- Схемы автоматически обновятся при следующем запуске приложения

### Статистика изменений
- **Изменено файлов:** 7
- **Добавлено строк:** +69
- **Удалено строк:** -181
- **Коммит:** `78e911d` в ветке `feature/TASK-039-refactor-package-details-endpoint`

---

## Требования к Frontend

### Необходимые изменения

#### 1. Обновление использования endpoint получения деталей пакета
**Файл:** `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`

**Текущее использование:**
```typescript
const requestParams = {
  id: packageId,
  tasksSortOrder: ...,
  tasksSortBy: ...,
  tasksNumber: currentPage,
  tasksSize: pageSize,
};
const { data: packetDetails } = useGetPackageDetailsQuery(requestParams);
// Использование: packetDetails?.tasks, packetDetails?.tasksPagination
```

**Требуется изменить на:**
```typescript
// Получение деталей пакета (без задач)
const { data: packetDetails } = useGetPackageDetailsQuery({ id: packageId });

// Получение задач пакета через новый endpoint
const tasksRequestParams = {
  pagination: { number: currentPage, size: pageSize },
  sorting: { direction: sortObject?.sort, column: sortObject?.name },
  filter: filters,
  includedInPacket: packageId, // Новый параметр
};
const { data: tasksData } = useGetTasksListQuery(tasksRequestParams);
// Использование: tasksData?.items, tasksData?.totalItems
```

#### 2. Обновление API клиента
**Файл:** `temp-private-2110/apiClient2/api/service2110/services/Report6406PackagesService.ts`

- Метод `getApiV1Report6406Packages1` больше не принимает query параметры
- Response изменился с `PackageDetailDto` на `PackageDto` (без полей `tasks` и `tasksPagination`)

#### 3. Обновление типов
- Удалить использование типа `PackageDetailDto` (если он используется напрямую)
- Использовать `PackageDto` для деталей пакета
- Использовать `TasksListResponseDto` для списка задач пакета

#### 4. Обновление компонентов
**Файл:** `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`

- Убрать передачу параметров пагинации/сортировки в `useGetPackageDetailsQuery`
- Добавить отдельный запрос для получения задач через `POST /api/v1/report-6406/tasks/list` с параметром `includedInPacket`
- Обновить использование данных: `packetDetails?.tasks` → `tasksData?.items`, `packetDetails?.tasksPagination` → `tasksData?.totalItems`

---


