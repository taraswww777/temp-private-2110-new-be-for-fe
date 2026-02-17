# TASK-013: Добавление возможности получения заданий для добавления в пакет

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-013-available-tasks-for-package`

---

## Краткое описание

Реализовать возможность получения списка заданий, которые еще не входят в текущий пакет и могут быть добавлены. Реализация через добавление фильтрации в существующий endpoint GET /api/v1/report-6406/tasks/ или создание нового специализированного endpoint.

---

## Исходное описание задачи

> Данный раздел содержит оригинальное описание задачи для оперативного обращения.

```
Нет ручки на получение заданий которые можно добавить в пакет. Или добавить отдельную или добавить в GET /api/v1/report-6406/tasks/

возможность установить фильтр

{
    column: 'package',
    operator:  '!==',
    value 'packageId',
}

чтобы получить список заданий которые еще не входят в текущий пакет
```

---

## Цели

- Предоставить возможность получения списка заданий, не входящих в указанный пакет
- Реализовать фильтрацию по пакету с оператором "не равно"
- Обеспечить удобный UI/UX для добавления заданий в пакет
- Переиспользовать существующую инфраструктуру фильтрации (если она уже реализована в TASK-011)

---

## Детальное описание

### Контекст

При работе с пакетами заданий необходима возможность добавлять в пакет новые задания. Для этого нужно получить список заданий, которые:
1. Ещё не входят ни в один пакет (не имеют packageId)
2. Или не входят в конкретный пакет (имеют другой packageId или null)

Сейчас такой возможности нет, что затрудняет работу с пакетами на frontend.

### Требования

#### Вариант 1: Расширение существующего endpoint (РЕКОМЕНДУЕТСЯ)

Добавить поддержку специального фильтра в GET /api/v1/report-6406/tasks/

**Преимущества:**
- Переиспользование существующей логики пагинации, сортировки, фильтрации
- Единая точка входа для всех списков заданий
- Меньше кода для поддержки

**Реализация:**

1. **Расширить FilterDto** (если ещё не поддерживается оператор "не равно")
   - Добавить оператор `notEquals` или `!==` в enum операторов
   - Описание: "Не равно (исключает записи с указанным значением)"

2. **Поддержать фильтрацию по полю `packageId`**
   - Добавить поле `packageId` в модель задания (если отсутствует)
   - Тип: `string | null` (null = задание не в пакете)
   - Описание: "ID пакета, к которому принадлежит задание (null = не в пакете)"

3. **Примеры использования:**

   ```typescript
   // Получить задания, не входящие в пакет с ID "pkg-123"
   {
     pagination: { number: 1, size: 20 },
     sorting: { direction: 'desc', column: 'createdAt' },
     filter: [
       {
         column: 'packageId',
         operator: 'notEquals',
         value: 'pkg-123'
       }
     ]
   }
   ```

   ```typescript
   // Получить задания, не входящие ни в один пакет
   {
     pagination: { number: 1, size: 20 },
     sorting: { direction: 'desc', column: 'createdAt' },
     filter: [
       {
         column: 'packageId',
         operator: 'equals',
         value: 'null'  // или специальное значение
       }
     ]
   }
   ```

4. **Обработка на backend:**
   - Парсить фильтр с `column: 'packageId'` и `operator: 'notEquals'`
   - Формировать SQL условие: `WHERE package_id != $1 OR package_id IS NULL`
   - Если value = 'null', то: `WHERE package_id IS NULL`

#### Вариант 2: Создание специализированного endpoint (альтернатива)

Создать новый endpoint: GET /api/v1/report-6406/packages/{packageId}/available-tasks

**Преимущества:**
- Явная семантика - понятно что это для добавления в пакет
- Может включать дополнительную логику (например, исключать задания с неподходящим статусом)

**Недостатки:**
- Дублирование кода (пагинация, сортировка)
- Больше endpoints для поддержки

**Реализация:**

1. **Request:**
   ```typescript
   GET /api/v1/report-6406/packages/{packageId}/available-tasks
   
   Body:
   {
     pagination: PaginationRequestDto;
     sorting?: SortingRequestDto;
   }
   ```

2. **Response:**
   ```typescript
   {
     items: TaskListItemDto[];
     totalItems: number;
   }
   ```

3. **Логика:**
   - Получить задания, где `packageId != {packageId} OR packageId IS NULL`
   - Опционально: фильтровать по статусам (например, только активные задания)

### Технические детали

- Убедиться что поле `packageId` присутствует в модели Task
- Добавить индекс на поле `packageId` для производительности
- Поддержать NULL значения корректно
- Обеспечить согласованность с frontend (согласовать формат фильтра)

---

## Критерии приёмки

### Если выбран Вариант 1 (расширение GET /tasks/)

- [x] Поле `packageId` добавлено в модель Task (тип: `string | null`) — в данной модели связь many-to-many; фильтр по пакету реализован через подзапросы к `report_6406_package_tasks`
- [x] Поле `packageIds` (массив) добавлено в `TaskListItemDto` с описанием
- [x] Оператор `notEquals` уже был в enum операторов `FilterDto`
- [x] Backend корректно обрабатывает фильтр с `column: 'packageId'` и `operator: 'notEquals'`
- [x] Корректно обрабатываются NULL значения (задания без пакета: `value: 'null'`)
- [x] Можно получить список заданий, не входящих в указанный пакет
- [x] Можно получить список заданий, не входящих ни в один пакет
- [x] Индекс на `package_id` и `task_id` в таблице `report_6406_package_tasks` уже есть
- [x] Добавлены unit-тесты для фильтрации по packageId (схемы и валидация)
- [x] Обновлена OpenAPI спецификация (описание endpoint, TaskListItemDto с packageIds)
- [x] Swagger UI корректно отображает новый фильтр

### Если выбран Вариант 2 (новый endpoint)

- [ ] Создан endpoint GET /api/v1/report-6406/packages/{packageId}/available-tasks
- [ ] Endpoint поддерживает пагинацию через `PaginationRequestDto`
- [ ] Endpoint поддерживает сортировку через `SortingRequestDto`
- [ ] Response использует структуру `{ items: TaskListItemDto[], totalItems: number }`
- [ ] Backend корректно возвращает задания, не входящие в указанный пакет
- [ ] Корректно обрабатываются NULL значения
- [ ] Добавлены unit-тесты для endpoint
- [ ] Обновлена OpenAPI спецификация
- [ ] Swagger UI корректно отображает новый endpoint

### Общие критерии

- [x] Производительность запроса приемлема (с индексом, если нужно)
- [x] Документация обновлена (описание POST /list в Swagger)
- [x] Frontend может успешно получить список доступных заданий (фильтр + поле packageIds в ответе)

---

## Порядок выполнения

### Этап 1: Анализ и выбор варианта реализации

1. Проанализировать текущую реализацию GET /api/v1/report-6406/tasks/
2. Проверить статус TASK-011 (реализована ли фильтрация)
3. Оценить оба варианта:
   - Вариант 1: простота vs расширение существующего endpoint
   - Вариант 2: явность vs дублирование кода
4. Согласовать с командой выбранный вариант
5. Зафиксировать решение в разделе "Уточнения"

### Этап 2: Проверка модели данных

1. Проверить модель Task:
   - Есть ли поле `packageId`?
   - Какой тип: `string`, `number`, `null`?
   - Есть ли связь с таблицей packages?

2. Если поле отсутствует:
   - Добавить поле `package_id` в таблицу tasks
   - Тип: `VARCHAR(255) NULL` или `UUID NULL`
   - Создать миграцию БД
   - Добавить foreign key на таблицу packages (если нужно)

3. Проверить индексы:
   - Создать индекс на `package_id` для производительности
   ```sql
   CREATE INDEX idx_tasks_package_id ON tasks(package_id);
   ```

### Этап 3: Реализация выбранного варианта

#### Для Варианта 1:

1. **Обновить FilterDto в OpenAPI**
   ```yaml
   FilterDto:
     properties:
       operator:
         type: string
         enum: [equals, notEquals, contains, greaterThan, lessThan]
         # Добавлен notEquals
   ```

2. **Добавить packageId в TaskListItemDto**
   ```yaml
   TaskListItemDto:
     properties:
       packageId:
         type: string
         nullable: true
         description: "ID пакета, к которому принадлежит задание (null = не в пакете)"
   ```

3. **Обновить backend обработку фильтров**
   
   В файле обработки GET /tasks/:
   ```typescript
   // Пример логики
   if (filter.column === 'packageId') {
     if (filter.operator === 'notEquals') {
       if (filter.value === 'null') {
         query.where('package_id IS NULL');
       } else {
         query.where(raw('(package_id != ? OR package_id IS NULL)', [filter.value]));
       }
     } else if (filter.operator === 'equals') {
       if (filter.value === 'null') {
         query.where('package_id IS NULL');
       } else {
         query.where('package_id', filter.value);
       }
     }
   }
   ```

4. **Обновить SQL запрос**
   - Добавить LEFT JOIN на таблицу packages (если нужны данные пакета)
   - Добавить поле `package_id` в SELECT

#### Для Варианта 2:

1. **Создать новый route handler**
   
   Файл: `src/routes/packages/{packageId}/available-tasks.ts`
   ```typescript
   fastify.post('/api/v1/report-6406/packages/:packageId/available-tasks', {
     schema: {
       params: {
         type: 'object',
         properties: {
           packageId: { type: 'string' }
         }
       },
       body: {
         type: 'object',
         properties: {
           pagination: { $ref: 'PaginationRequestDto#' },
           sorting: { $ref: 'SortingRequestDto#' }
         }
       },
       response: {
         200: {
           type: 'object',
           properties: {
             items: { 
               type: 'array',
               items: { $ref: 'TaskListItemDto#' }
             },
             totalItems: { type: 'integer' }
           }
         }
       }
     },
     handler: async (request, reply) => {
       const { packageId } = request.params;
       const { pagination, sorting } = request.body;
       
       // Логика получения заданий
       const tasks = await getAvailableTasksForPackage(packageId, pagination, sorting);
       
       return {
         items: tasks.data,
         totalItems: tasks.total
       };
     }
   });
   ```

2. **Реализовать сервисную функцию**
   ```typescript
   async function getAvailableTasksForPackage(
     excludePackageId: string,
     pagination: PaginationDto,
     sorting?: SortingDto
   ) {
     const query = db('tasks')
       .select('*')
       .where(function() {
         this.where('package_id', '!=', excludePackageId)
           .orWhereNull('package_id');
       });
     
     // Применить пагинацию и сортировку
     // ...
     
     return {
       data: tasks,
       total: count
     };
   }
   ```

### Этап 4: Тестирование

1. **Unit-тесты**
   - Тест фильтрации: получение заданий без указанного пакета
   - Тест фильтрации: получение заданий без любого пакета (NULL)
   - Тест пагинации
   - Тест сортировки

2. **Integration-тесты**
   - Создать несколько заданий с разными packageId
   - Проверить что фильтр работает корректно
   - Проверить граничные случаи (пустой список, все задания в пакетах)

3. **Ручное тестирование через Swagger UI**
   - Отправить запрос с фильтром `packageId != 'some-id'`
   - Проверить что возвращаются правильные задания
   - Проверить что пагинация работает

### Этап 5: Обновление документации

1. **OpenAPI спецификация**
   - Обновить схемы (FilterDto, TaskListItemDto)
   - Обновить endpoint (или добавить новый)
   - Добавить примеры запросов

2. **README / API документация**
   - Описать как получить список доступных заданий
   - Привести примеры запросов
   - Объяснить обработку NULL значений

3. **Frontend документация**
   - Описать формат фильтра для frontend
   - Примеры использования
   - Обработка ошибок

### Этап 6: Согласование с frontend

1. Предоставить обновлённую OpenAPI спецификацию
2. Провести демонстрацию работы через Swagger UI
3. Обсудить формат запроса и ответа
4. При необходимости внести корректировки

---

## Уточнения в процессе выполнения

### Решение по варианту реализации

**Дата:** 2026-01-30

**Выбранный вариант:** Вариант 1 (расширение POST /api/v1/report-6406/tasks/list)

**Обоснование:** Переиспользование существующей логики пагинации, сортировки и фильтрации; единая точка входа для списка заданий. Оператор `notEquals` уже был в FilterDto. Связь заданий с пакетами — many-to-many через таблицу `report_6406_package_tasks`, поэтому фильтр по пакету реализован через подзапросы EXISTS/NOT EXISTS. В TaskListItemDto добавлено поле `packageIds: string[]` (массив ID пакетов), а не одно поле `packageId`, так как задание может входить в несколько пакетов.

---

## Связанные документы

- OpenAPI спецификация формы 6406
- Схема базы данных (таблица tasks, packages)
- TASK-011: Рефакторинг GET /tasks/ (если фильтрация уже реализована)

---

## Связанные задачи

- **TASK-011**: Review API формы 6406 (Часть 2: Рефакторинг GET /tasks/) - может содержать реализацию фильтрации
- **TASK-010**: Review API формы 6406 (Часть 1: Базовые схемы) - FilterDto создан здесь

---


