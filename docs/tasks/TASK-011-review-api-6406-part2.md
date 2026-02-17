# TASK-011: Review API формы 6406 (Часть 2: Рефакторинг GET /tasks/)

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-011-review-api-6406-part2`

---

## Краткое описание

**Часть 2 из 3-х:** Рефакторинг endpoint GET /api/v1/report-6406/tasks/ - обновление структуры запроса и ответа, добавление недостающих полей.

Эта подзадача включает применение созданных в TASK-010 схем для пагинации, сортировки и фильтрации, создание `TaskListItemDto` и добавление полей для управления действиями (`canCancel`, `canDelete`, `canStart`, `createdBy`).

---

## Цели

- Применить созданные базовые схемы к GET /tasks/
- Унифицировать структуру request body (пагинация, сортировка, фильтрация)
- Создать DTO для элементов списка заданий
- Добавить недостающие поля в список заданий
- Обновить структуру response на пагинированную

---

## Детальное описание

### Контекст

**Это вторая часть трёхэтапного рефакторинга** API для формы 6406. В первой части (TASK-010) были созданы базовые схемы для пагинации, сортировки и фильтрации. Теперь нужно применить их к endpoint для получения списка заданий.

**Зависимости:**
- ✅ Требует выполнения TASK-010 (базовые схемы должны быть созданы)

**Связанные задачи:**
- TASK-010: Review API формы 6406 (Часть 1: Базовые схемы) - предварительное условие
- TASK-012: Унификация DTO деталей и рефакторинг POST/GET {id} (часть 3) - следующий этап

### Требования

#### Обновление request body для GET /api/v1/report-6406/tasks/

1. **Структура запроса**
   - Убрать поле `limit` (дублирование с pagination)
   - Добавить поле `pagination` с типом `PaginationRequestDto` (созданный в TASK-010)
   - Добавить поле `sorting` с типом `SortingRequestDto` (созданный в TASK-010)
   - Добавить опциональное поле `filter` (массив `FilterDto`, созданный в TASK-010)

   Итоговая структура:
   ```typescript
   {
     pagination: PaginationRequestDto;  // { number: number; size: number }
     sorting: SortingRequestDto;        // { direction: 'asc'|'desc'; column: string }
     filter?: FilterDto[];              // [{ column: string; operator: enum; value: string }]
   }
   ```

#### Создание TaskListItemDto

2. **Схема элемента списка**
   - Создать схему `TaskListItemDto` в `components/schemas`
   - Включить все существующие поля из текущего response
   - Изменить `branchId` на тип `string` (если был `number`)
   - Убедиться что все ID имеют тип `string`
   - Убедиться что все даты имеют тип `string` с `format: "date-time"`

3. **Новые поля для управления действиями**
   - Добавить `createdBy` (тип: `string`, **обязательное**):
     - Описание: "ФИО сотрудника, создавшего задание"
     - **Уточнение:** поле обязательно к заполнению; проставляется автоматически на стороне BE при создании новой записи (из контекста пользователя). При возвращении данных на FE это поле всегда должно быть заполнено (не `null`).
   - Добавить `canCancel` (тип: `boolean`, описание: "Можно ли отменить задание")
   - Добавить `canDelete` (тип: `boolean`, описание: "Можно ли удалить задание")
   - Добавить `canStart` (тип: `boolean`, описание: "Можно ли запустить задание")

4. **Описания для всех полей**
   - Убедиться что каждое поле в `TaskListItemDto` имеет `description`
   - Особое внимание на неочевидные поля (`branchName` → "Название филиала", `status` → "Статус задания" и т.д.)

#### Обновление response для GET /api/v1/report-6406/tasks/

5. **Структура ответа**
   - Изменить описание статуса 200 на "OK" (если ещё не изменено в TASK-010)
   - Использовать структуру пагинированного ответа:
     ```typescript
     {
       items: TaskListItemDto[];
       totalItems: number;
     }
     ```

### Технические детали

- Использовать `$ref` для ссылки на схемы из `components/schemas`
- Обеспечить обратную совместимость или согласовать изменения с frontend
- Соблюдать naming convention (camelCase для полей)

---

## Критерии приёмки (Часть 2)

### Request body обновлён
- [x] Поле `limit` удалено из request body
- [x] Добавлено поле `pagination` с типом `$ref: '#/components/schemas/PaginationRequestDto'`
- [x] Добавлено поле `sorting` с типом `$ref: '#/components/schemas/SortingRequestDto'`
- [x] Добавлено опциональное поле `filter` (array of `FilterDto`)

### TaskListItemDto создан и применён
- [x] Создана схема `TaskListItemDto` в `components/schemas`
- [x] Все существующие поля включены в схему
- [x] Все ID имеют тип `string` (включая `branchId`)
- [x] Все даты имеют тип `string` с `format: "date-time"`
- [x] Все поля имеют описания (`description`)

### Новые поля добавлены
- [x] Поле `createdBy` (string, обязательное) добавлено в `TaskListItemDto`; при создании задания проставляется на BE; при возврате на FE всегда заполнено (не null)
- [x] Поле `canCancel` (boolean) добавлено в `TaskListItemDto`
- [x] Поле `canDelete` (boolean) добавлено в `TaskListItemDto`
- [x] Поле `canStart` (boolean) добавлено в `TaskListItemDto`

### Response обновлён
- [x] Response 200 использует структуру с `items` и `totalItems`
- [x] Поле `items` ссылается на массив `TaskListItemDto`
- [x] Поле `totalItems` имеет тип `integer` с `minimum: 0`

### Валидация
- [x] OpenAPI спецификация валидна (`swagger-cli validate`)
- [x] Endpoint корректно отображается в Swagger UI
- [x] Request и response схемы понятны и читаемы

---

## Порядок выполнения (Часть 2)

### Этап 1: Подготовка и проверка зависимостей

1. Убедиться, что TASK-010 выполнен:
   - Проверить наличие `PaginationRequestDto` в `components/schemas`
   - Проверить наличие `SortingRequestDto` в `components/schemas`
   - Проверить наличие `FilterDto` в `components/schemas`

2. Прочитать текущую спецификацию GET /api/v1/report-6406/tasks/:
   - Проанализировать текущую структуру request body
   - Проанализировать текущую структуру response
   - Составить список всех полей в response

### Этап 2: Обновление request body

1. Найти секцию `requestBody` для GET /api/v1/report-6406/tasks/

2. Обновить структуру:
   - Удалить поле `limit`
   - Добавить поле `pagination`:
     ```yaml
     pagination:
       $ref: '#/components/schemas/PaginationRequestDto'
     ```
   - Добавить поле `sorting`:
     ```yaml
     sorting:
       $ref: '#/components/schemas/SortingRequestDto'
     ```
   - Добавить опциональное поле `filter`:
     ```yaml
     filter:
       type: array
       items:
         $ref: '#/components/schemas/FilterDto'
       description: "Фильтры для списка заданий"
     ```

### Этап 3: Создание TaskListItemDto

1. Создать новую схему в `components/schemas`:
   ```yaml
   TaskListItemDto:
     type: object
     properties:
       # Существующие поля (из текущего response)
       id:
         type: string
         format: uuid
         description: "Уникальный идентификатор задания"
       
       # ... другие существующие поля с описаниями
       
       branchId:
         type: string  # Изменить с number на string, если нужно
         description: "Идентификатор филиала"
       
       branchName:
         type: string
         description: "Название филиала"
       
       status:
         type: string
         description: "Статус задания"
       
       # Даты в формате ISO 8601
       createdAt:
         type: string
         format: date-time
         description: "Дата и время создания задания"
       
       # Новые поля (createdBy — обязательное, заполняется на BE при создании, при ответе всегда заполнено)
       createdBy:
         type: string
         description: "ФИО сотрудника, создавшего задание (всегда заполняется на BE при создании; при возврате на FE всегда заполнено)"
       
       canCancel:
         type: boolean
         description: "Можно ли отменить задание"
       
       canDelete:
         type: boolean
         description: "Можно ли удалить задание"
       
       canStart:
         type: boolean
         description: "Можно ли запустить задание"
     
     required:
       - id
       - createdBy
       # ... другие обязательные поля
   ```

2. Убедиться что:
   - Все ID - строки
   - Все даты - строки с `format: date-time`
   - Все поля имеют описания
   - Указаны обязательные поля в `required`, включая `createdBy` (обязательное; при ответе на FE всегда заполнено)

### Этап 4: Обновление response

1. Найти секцию `responses` для GET /api/v1/report-6406/tasks/

2. Обновить response 200:
   ```yaml
   '200':
     description: "OK"
     content:
       application/json:
         schema:
           type: object
           properties:
             items:
               type: array
               items:
                 $ref: '#/components/schemas/TaskListItemDto'
               description: "Список заданий"
             totalItems:
               type: integer
               minimum: 0
               description: "Общее количество заданий"
           required:
             - items
             - totalItems
   ```

### Этап 5: Валидация и проверка

1. Валидировать OpenAPI спецификацию:
   ```bash
   swagger-cli validate path/to/openapi.yaml
   ```

2. Проверить в Swagger UI:
   - Открыть Swagger UI
   - Найти GET /api/v1/report-6406/tasks/
   - Проверить что request body отображается корректно
   - Проверить что response schema читаема
   - Убедиться что новые поля видны с описаниями

3. Проверить ссылки на схемы:
   - Убедиться что все `$ref` корректны
   - Проверить что схемы разворачиваются в Swagger UI

4. Документировать изменения:
   - Список изменений в request body
   - Список добавленных полей в TaskListItemDto
   - Изменения в структуре response
   - Рекомендации для frontend разработчиков

---

## Уточнения в процессе выполнения

Все выявленные уточнения внесены в основной текст задания ниже.

1. **Реализация списка заданий (endpoint):** Вместо GET с телом запроса используется **POST /api/v1/report-6406/tasks/list**, т.к. Fastify не поддерживает валидацию body для GET (`FST_ERR_ROUTE_BODY_VALIDATION_SCHEMA_NOT_SUPPORTED`). Структура тела запроса (pagination, sorting, filter) и ответа (items, totalItems) соответствует заданию.

2. **Поле `createdBy`:** Обязательно к заполнению. Проставляется автоматически на стороне BE при создании новой записи (из контекста пользователя). При возвращении данных на FE это поле всегда должно быть заполнено (не `null`); для старых записей в БД с `null` при отдаче подставляется пустая строка или иное согласованное значение.

---

## Связанные документы

- OpenAPI спецификация формы 6406
- Swagger UI / ReDoc для просмотра API
- TASK-010: Созданные базовые схемы (PaginationRequestDto, SortingRequestDto, FilterDto)

---

## Связанные задачи

- **TASK-010**: Review API формы 6406 (Часть 1: Базовые схемы) - **предварительное условие**
- **TASK-012**: Унификация DTO деталей и рефакторинг POST/GET {id} (часть 3) - следующий этап

---


