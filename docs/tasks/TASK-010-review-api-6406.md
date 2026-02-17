# TASK-010: Review API формы 6406 (Часть 1: Базовые схемы)

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-010-review-api-6406-part1`

---

## Краткое описание

**Часть 1 из 3-х:** Создание базовых переиспользуемых схем и исправление общих проблем в OpenAPI спецификации для формы 6406.

Эта подзадача включает создание инфраструктурных DTO в `components/schemas` (пагинация, сортировка, фильтрация) и исправление общих проблем по всему API: типы ID, форматы дат, описания статусов и полей.

---

## Исходное описание задачи

> Данный раздел содержит оригинальное описание задачи для оперативного обращения.

```
ОБЩЕЕ

- повыносить схемы в components/schemas, задать нормальные нейминги, чтобы впоследствии генерировались человекочитаемые DTO в openapi generator
- для статуса 200 "description": "Default Response" заменить на ОК
- все айдишники делать стрингами ( например встречается id - string (гуид), branchId - number)
- не хватает в свагер файле подсказок для полей (например branchName это филиал, но из названия поля это неочевидно)
- все даты должны быть одного формата, например строка ISO YYYY-MM-DDTHH:mm:ss.sssZ 


GET /api/v1/report-6406/tasks/
- что такое limit ? В теле запроса из пагинации достаточно передавать pageNumber и pageSize

- тело запроса я бы сделал так 

pagination: { number: number;  size: number }
sorting: { direction: string; column: string };
filter?: FilterDto[];

interface FilterUiDto {
    column: string;
    operator: FilterUiDtoOperatorEnum;  // равно, больше, меньше и т.д. Можно пока не реализовывать
    value string;
}

- тело ответа так
{
    items: EntityDto[];
    totalItems?: number;
}

И переиспользовал бы эти структуры везде где есть сортировка, пагинация, фильтрация 

- branchId не может быть отрицательным

- отсутствует поле createdBy (Сотрудник)

- отсутствуют поля canCancel, canDelete, canStart, хотя выглядит так что статусы нужны именно для списка, т.к. именно при просмотре списка в виде таблицы можно  отменять, удалять и запускать задания.



POST /api/v1/report-6406/tasks/

- общая проблема - тело ответа на создание справочника и получение деталей о справочнике должно быть описано одним ДТО, тогда не было бы проблем описанных ниже 

Тело ответа
- filesCount не может быть отрицательным
- fileUrl - урл на какой файл?  мне кажется это поле лишнее
- errorMessage в 201 ответе явно лишнее
- Отсутствует поле "ID папки в S3"
- Отсутствует поле "currency" (Валюта)
- непонятно откуда брать поле "Тип" на странице детали - дополнительные параметры
- непонятно откуда брать поле "Счета" на странице детали - дополнительные параметры

GET /api/v1/report-6406/tasks/{id}
проблемы описаны выше, здесь повторяются
```

---

## Цели

- Создать переиспользуемые схемы для пагинации, сортировки и фильтрации
- Исправить общие проблемы с типами данных (ID должны быть string)
- Унифицировать форматы дат (ISO 8601)
- Добавить описания для статусов и полей
- Подготовить инфраструктуру для последующего рефакторинга endpoints

---

## Детальное описание

### Контекст

В процессе разработки API для формы 6406 были выявлены недостатки в OpenAPI спецификации, которые необходимо исправить до продакшена. 

**Это первая часть трёхэтапного рефакторинга**, в которой закладывается фундамент - создаются базовые схемы и исправляются общие проблемы.

**Связанные задачи:**
- TASK-011: Рефакторинг GET /api/v1/report-6406/tasks/ (часть 2)
- TASK-012: Унификация DTO деталей и рефакторинг POST/GET {id} (часть 3)

### Требования для Части 1

#### Создание базовых схем в components/schemas

1. **PaginationRequestDto**
   - Создать схему для пагинации с полями: `number` (integer, minimum: 1), `size` (integer, minimum: 1, maximum: 100)
   - Добавить описания для каждого поля

2. **SortingRequestDto**
   - Создать схему для сортировки с полями: `direction` (enum: [asc, desc]), `column` (string)
   - Добавить описания для каждого поля

3. **FilterDto**
   - Создать схему для фильтрации с полями: `column` (string), `operator` (enum: [equals, notEquals, contains, greaterThan, lessThan]), `value` (string)
   - Добавить описания для каждого поля

4. **PaginatedResponseDto (обобщённая)**
   - Создать шаблон с полями: `items` (array), `totalItems` (integer, minimum: 0)
   - Эта схема будет базой для конкретных пагинированных ответов

#### Общие исправления по всему API

1. **Описания статусов**
   - Заменить `"description": "Default Response"` для статуса 200 на `"description": "OK"`
   - Для всех остальных статусов использовать осмысленные описания

3. **Унификация типов идентификаторов**
   - Все ID должны быть строками (string)
   - Исправить несоответствия: `id` - string (GUID), `branchId` - должен быть string, а не number

4. **Описания полей**
   - Добавить описания (`description`) для всех полей в схемах
   - Например: `branchName` → `"description": "Название филиала"`
   - Обеспечить понятность полей без необходимости обращаться к дополнительной документации

5. **Унификация форматов дат**
   - Все даты должны быть в формате строки ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
   - Указывать `"format": "date-time"` в схемах

> **Примечание:** Требования к конкретным endpoints (GET /tasks/, POST /tasks/, GET /tasks/{id}) будут реализованы в последующих подзадачах TASK-011 и TASK-012.

### Технические детали

- Использовать OpenAPI 3.0+ спецификацию
- Схемы должны поддерживать генерацию DTO через `@openapitools/openapi-generator-cli`
- Все изменения должны быть обратно совместимы или согласованы с frontend командой
- Обеспечить консистентность naming convention (camelCase для полей)

---

## Критерии приёмки (Часть 1)

### Базовые схемы созданы
- [x] Создана схема `filterSchema` с полями `column`, `operator`, `value`
- [x] Улучшены существующие схемы пагинации (paginationQuerySchema, paginationResponseSchema)
- [x] Все схемы находятся в `src/schemas/common.schema.ts`
- [x] Все поля схем имеют описания (`.describe()`)

### Общие исправления применены
- [x] 23 статуса 200 имеют описание "OK" (через автоматический маппинг в transform)
- [x] Все ID в спецификации имеют тип `string` (проверены `id`, `branchId`, `branchIds`)
- [x] Все даты имеют формат `string` с `format: "date-time"` (уже были корректными)
- [x] Добавлены описания для 77+ полей во всех схемах
- [x] Все числовые поля уже имели `.min(0)` где необходимо

### Переиспользование схем через $ref
- [x] Создан реестр схем (`schema-registry.ts`) с 50+ зарегистрированными схемами (общие, enum, справочники, задания, пакеты, экспорт, storage, response DTO)
- [x] Реализована функция `convertSchema()` и рекурсивная замена вложенных схем (`replaceNestedSchemas`) с сравнением по нормализованной структуре
- [x] В paths используются $ref на компоненты для body, response, вложенных объектов (pagination), query-параметров (даты), items массивов (enum)
- [x] Все ответы с JSON-телом описаны отдельными DTO и в paths ссылаются на них через $ref (исключение: mock-files — отдача файлов)
- [x] Все ссылки корректны и указывают на существующие схемы в `components/schemas`

### Валидация
- [x] OpenAPI спецификация валидна и проходит проверку (`swagger-cli validate`)
- [x] Созданные схемы корректно генерируются в swagger.json
- [x] Нет ошибок при парсинге спецификации
- [x] Все $ref ссылки разрешаются корректно

---

## Порядок выполнения (Часть 1)

### Этап 1: Анализ текущей спецификации

1. Прочитать текущий файл OpenAPI спецификации для формы 6406
2. Проверить текущую структуру `components/schemas` (если есть)
3. Составить список всех endpoints для понимания контекста
4. Проверить текущие типы полей (ID, даты) и описания статусов

### Этап 2: Создание базовых переиспользуемых схем

1. Создать схему `PaginationRequestDto`:
   ```yaml
   number:
     type: integer
     minimum: 1
     description: "Номер страницы"
   size:
     type: integer
     minimum: 1
     maximum: 100
     description: "Размер страницы"
   ```

2. Создать схему `SortingRequestDto`:
   ```yaml
   direction:
     type: string
     enum: [asc, desc]
     description: "Направление сортировки"
   column:
     type: string
     description: "Колонка для сортировки"
   ```

3. Создать схему `FilterDto`:
   ```yaml
   column:
     type: string
     description: "Колонка для фильтрации"
   operator:
     type: string
     enum: [equals, notEquals, contains, greaterThan, lessThan]
     description: "Оператор сравнения"
   value:
     type: string
     description: "Значение для фильтрации"
   ```

4. Создать базовую структуру `PaginatedResponseDto`:
   ```yaml
   items:
     type: array
     items: {}  # Будет специализироваться в конкретных endpoints
     description: "Список элементов"
   totalItems:
     type: integer
     minimum: 0
     description: "Общее количество элементов"
   ```

### Этап 3: Применение общих исправлений

1. **Исправить описания статусов HTTP 200**
   - Найти все endpoints с ответом 200
   - Заменить "Default Response" на "OK"

2. **Унифицировать типы ID**
   - Найти все поля с ID (id, branchId, taskId и т.д.)
   - Убедиться что все имеют тип `string`
   - Для числовых ID изменить на `string`

3. **Унифицировать форматы дат**
   - Найти все поля с датами (createdAt, updatedAt, completedDate и т.д.)
   - Убедиться что все имеют тип `string` с `format: "date-time"`

4. **Добавить описания полей**
   - Пройтись по всем схемам
   - Добавить `description` для полей, где его нет
   - Особое внимание на поля вроде `branchName`, `status` и т.д.

5. **Добавить валидацию для числовых полей**
   - Найти числовые поля, которые не могут быть отрицательными
   - Добавить `minimum: 0`

### Этап 4: Валидация и проверка

1. Валидировать OpenAPI спецификацию:
   - Использовать онлайн-валидатор или `swagger-cli validate`
   - Убедиться, что нет ошибок

2. Проверить в Swagger UI:
   - Убедиться, что созданные схемы отображаются корректно
   - Проверить, что описания видны

3. Документировать изменения:
   - Список созданных схем
   - Список применённых общих исправлений
   - Подготовка к следующим этапам (TASK-011, TASK-012)

---

## Уточнения в процессе выполнения

### Выполненные изменения (30.01.2026)

#### Подход к выполнению
Изначально была попытка напрямую редактировать `swagger.json`, но это неправильный подход, так как файл генерируется автоматически из Zod-схем при запуске приложения. Поэтому все изменения были внесены в исходные TypeScript схемы.

#### 1. Создание базовых схем
Добавлены переиспользуемые схемы в `src/schemas/common.schema.ts`:
- **filterSchema**: схема для фильтрации с полями `column`, `operator` (enum), `value`
- Улучшены существующие **paginationQuerySchema** и **paginationResponseSchema** с добавлением `.describe()` для всех полей

#### 2. Унификация типов ID
Изменён тип `branchId` с `number` на `string` в следующих файлах:
- `tasks.schema.ts`: createTaskSchema, taskSchema, taskListItemSchema, tasksQuerySchema (5 изменений)
- `export.schema.ts`: exportFiltersSchema, exportTasksRequestSchema (2 изменения)
- `packages.schema.ts`: добавлены описания для всех полей (3 схемы)

#### 3. Добавление описаний
Добавлены `.describe()` для 77+ полей во всех схемах API формы 6406:
- Все поля идентификаторов
- Все поля дат
- Все поля фильтрации
- Все поля пагинации
- Все поля бизнес-логики (статусы, права доступа и т.д.)

#### 4. Улучшение генерации OpenAPI
Обновлена transform функция в `src/app.ts`:
- Добавлен автоматический маппинг HTTP статусов на описания
- 200 → "OK", 201 → "Created", 404 → "Not Found" и т.д.
- Это гарантирует, что все будущие endpoints автоматически получат правильные описания

#### 5. Регенерация и валидация
- Запущен dev-сервер для автогенерации `swagger.json`
- Проведена валидация через `swagger-cli validate` - успешно
- Проверены все ключевые изменения в сгенерированном файле

#### 6. Реализация переиспользования схем через $ref ссылки (30.01.2026)

**Проблема:** После заполнения `components/schemas` все схемы дублировались в каждом endpoint, что увеличивало размер файла и усложняло поддержку.

**Решение:** Реализован механизм переиспользования схем через `$ref` ссылки на компоненты.

**Созданные компоненты:**

1. **`src/schemas/schema-registry.ts`** - реестр всех переиспользуемых Zod схем:
   - `schemaRegistry`: Map с 24 зарегистрированными схемами (общие, справочники, задания, пакеты, экспорт)
   - `getSchemaName()`: функция для поиска имени схемы по её объекту
   - `isRegisteredSchema()`: проверка, зарегистрирована ли схема в реестре

2. **Обновлена transform функция в `src/app.ts`**:
   - Создана функция `convertSchema()` для интеллектуальной конвертации:
     - Проверяет, зарегистрирована ли схема через `getSchemaName()`
     - Если зарегистрирована → возвращает `{$ref: "#/components/schemas/SchemaName"}`
     - Если не зарегистрирована → конвертирует inline как обычно
   - Применяется ко всем частям запроса/ответа: body, querystring, params, headers, response

**Результаты:**

✅ **15 endpoints используют $ref ссылки** вместо дублирования схем:
- **Задания (7):** CreateTaskDto, TaskDto, TaskDetailDto, TasksListResponseDto, BulkDeleteTasksResponseDto, BulkCancelTasksResponseDto, StartTasksResponseDto
- **Пакеты (6):** CreatePackageDto, UpdatePackageDto, PackageDto, PackageDetailDto, PackagesListResponseDto, BulkDeletePackagesResponseDto
- **Экспорт (2):** ExportTasksRequestDto, ExportTasksResponseDto

✅ **Размер файла уменьшился на 20%**: 168KB → 135KB (экономия ~33KB)

✅ **Преимущества:**
- Отсутствие дублирования: схемы описаны один раз в `components/schemas`
- Лучшая поддержка генераторов: OpenAPI Generator создаст переиспользуемые классы
- Единая точка изменения: изменение схемы автоматически применяется везде
- Swagger остаётся валидным: проходит `swagger-cli validate`

**Пример использования $ref в endpoint:**
```json
"post": {
  "requestBody": {
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/CreateTaskDto"
        }
      }
    }
  },
  "responses": {
    "201": {
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/TaskDto"
          }
        }
      }
    }
  }
}
```

**Примечание:** Простые справочники (BranchDto, ReportTypeDto, CurrencyDto и т.д.) остаются inline, так как они используются реже и их размер незначителен.

**Изменённые файлы:**
- `src/schemas/schema-registry.ts` - создан новый файл с реестром схем
- `src/app.ts` - обновлена transform функция с логикой переиспользования
- `src/schemas/openapi-components.ts` - используется для заполнения components/schemas
- `docs/swagger/swagger.json` - регенерирован с $ref ссылками (автоматически)

**Коммиты:**
- `a226736` - Реализация механизма $ref ссылок
- `ee29f84` - Регенерация swagger.json с ссылками

#### Технические детали
- Использован Zod с методом `.describe()` для добавления описаний
- Fastify + fastify-swagger + fastify-type-provider-zod для генерации OpenAPI
- Zod схемы конвертируются в JSON Schema через `.toJSONSchema()` с опциями для OpenAPI 3.1
- Реализован механизм переиспользования через реестр схем и проверку на регистрацию перед конвертацией

---

### Выясненные уточнения (дополнения к задаче)

Ниже зафиксированы уточнения, выявленные в процессе выполнения и расширения задачи.

#### 1. Переиспользование вложенных схем в paths

**Уточнение:** В `paths` не только верхнеуровневые body/response, но и вложенные объекты (например, `pagination`, `tasksPagination` внутри ответов) должны ссылаться на `components/schemas`, а не дублироваться inline.

**Реализация:**
- В `app.ts` при формировании `components.schemas` применяется рекурсивная функция `replaceNestedSchemas`: обход JSON Schema, сравнение вложенных объектов с зарегистрированными схемами по нормализованной структуре (type, propertyKeys, required, propertyTypes), замена совпадений на `$ref`.
- Та же логика используется в transform для схем из route (body, querystring, response): после конвертации Zod → JSON Schema вызывается `replaceNestedSchemas`.
- Порядок обработки компонентов: сначала простые типы (DateSchema, DateTimeSchema), затем enum-схемы, затем объекты — чтобы при сравнении все нужные схемы уже были в `processedComponents` и не возникало циклических подстановок.

**Результат:** Поля `pagination` и `tasksPagination` в ответах ссылаются на `#/components/schemas/PaginationMetadataDto`.

#### 2. Схемы для дат в query-параметрах

**Уточнение:** Повторяющиеся схемы для дат в query (строка с `pattern` YYYY-MM-DD и строка с `format: date-time`) нужно описать один раз в `components/schemas` и в paths использовать через `$ref`.

**Реализация:**
- В `common.schema.ts`: `dateSchema` (YYYY-MM-DD), `dateTimeSchema` (ISO 8601).
- Зарегистрированы как `DateSchema`, `DateTimeSchema` в реестре и в openapi-components.
- В хуке `onReady` после генерации swagger выполняется обход всех `paths` → `parameters`; схема каждого параметра сравнивается с зарегистрированными (по type, format, pattern, enum); при совпадении подставляется `$ref` (например, `#/components/schemas/DateSchema`, `#/components/schemas/DateTimeSchema`).

**Результат:** Параметры вроде `periodStartFrom`, `periodEndTo`, `createdAtFrom`, `createdAtTo` в paths ссылаются на DateSchema/DateTimeSchema вместо дублирования схем.

#### 3. Enum-схемы для переиспользования

**Уточнение:** Схемы вида «массив строк с enum» (formats: [TXT, XLSX, XML], reportTypes: [LSOZ, LSOS, LSOP] и т.д.) должны быть общими компонентами, а в paths — только `$ref`.

**Реализация:**
- Зарегистрированы enum-схемы: `FileFormatEnumSchema`, `ReportTypeEnumSchema`, `ReportTaskStatusEnumSchema`, `CurrencyEnumSchema`, `SortOrderEnumSchema` (Zod enum → JSON Schema с type/enum).
- Они добавлены в список «простых» типов при сборке components (обрабатываются до сложных объектов).
- Функция сравнения для подстановки `$ref` расширена на простые типы (string с enum); рекурсивная замена обрабатывает и `schema.items` в массивах.

**Результат:** В paths поля `formats`, `reportTypes`, `statuses` и т.п. в request/response используют `items: { $ref: "#/components/schemas/FileFormatEnumSchema" }` (и аналоги для остальных enum) вместо inline `type: array, items: { type: string, enum: [...] }`.

#### 4. Все responses в виде отдельных DTO

**Уточнение:** У всех paths ответы (responses) с телом должны быть описаны отдельными DTO в `components/schemas`, в paths — только ссылка `$ref`, без inline-описания структуры.

**Реализация:**
- **Health:** В `common.schema.ts` добавлены `healthResponseSchema` (200) и `httpErrorWithInstanceSchema` (503 с полем instance). Роут переведён на них. Зарегистрированы как HealthResponseDto, HttpErrorWithInstanceDto.
- **References:** Ответы-массивы зарегистрированы как BranchesResponseDto, ReportTypesResponseDto, CurrenciesResponseDto, FormatsResponseDto, SourcesResponseDto (z.array соответствующей схемы).
- **Tasks:** StatusHistoryItemDto, StatusHistoryResponseDto; TaskFileDto, TaskFilesResponseDto; RetryFileConversionResponseDto — все зарегистрированы и используются в роутах.
- **Packages:** UpdatePackageResponseDto, AddTasksToPackageResponseDto, BulkRemoveTasksResponseDto, CopyToTfrResponseDto — зарегистрированы.
- **Storage:** StorageVolumeDto зарегистрирован.

**Исключение:** `GET /mock-files/*` отдают файлы (text/plain, text/csv), не JSON; у них оставлено описание "Default Response" без DTO.

**Результат:** Все пути с JSON-ответами в paths ссылаются на отдельные DTO в components/schemas; swagger остаётся валидным.

#### 5. Сводка по зарегистрированным схемам (актуальное состояние)

- **Общие:** PaginationRequestDto, PaginationResponseDto, FilterDto, DateSchema, DateTimeSchema, FileFormatEnumSchema, ReportTypeEnumSchema, ReportTaskStatusEnumSchema, CurrencyEnumSchema, SortOrderEnumSchema, HealthResponseDto, HttpErrorWithInstanceDto.
- **Справочники:** BranchDto, ReportTypeDto, CurrencyDto, FormatDto, SourceDto, BranchesResponseDto, ReportTypesResponseDto, CurrenciesResponseDto, FormatsResponseDto, SourcesResponseDto.
- **Задания:** CreateTaskDto, TaskDto, TaskListItemDto, TasksListResponseDto, TaskDetailDto, BulkDeleteTasksResponseDto, BulkCancelTasksResponseDto, StartTasksResponseDto, StatusHistoryItemDto, StatusHistoryResponseDto, TaskFileDto, TaskFilesResponseDto, RetryFileConversionResponseDto.
- **Пакеты:** CreatePackageDto, UpdatePackageDto, PackageDto, PackageDetailDto, PackagesListResponseDto, BulkDeletePackagesResponseDto, UpdatePackageResponseDto, AddTasksToPackageResponseDto, BulkRemoveTasksResponseDto, CopyToTfrResponseDto.
- **Экспорт:** ExportTasksRequestDto, ExportTasksResponseDto.
- **Storage:** StorageVolumeDto.

#### 7. Доработки по детальному описанию (30.01.2026)

Выполнены три доработки для 100% соответствия «Требованиям» и «Порядку выполнения»:

**SortingRequestDto**
- Добавлена схема `sortingRequestSchema` в `common.schema.ts` с полями `direction` (enum: asc, desc) и `column` (string).
- Зарегистрирована в реестре и openapi-components как `SortingRequestDto`.

**Пагинация: number и size**
- Запрос: `paginationQuerySchema` переведён на поля `number` (integer, minimum: 1, номер страницы с 1) и `size` (integer, min: 1, max: 100).
- Ответ: метаданные пагинации вынесены в `paginationMetadataSchema` с полями `number`, `size`, `totalItems`, `totalPages` (в реестре — `PaginationMetadataDto`).
- Во всех эндпоинтах с пагинацией (tasks, packages, task-files) query-параметры и тело ответа используют `number`/`size`; offset вычисляется как `(number - 1) * size`.
- В пакетах для пагинации заданий внутри пакета: `tasksPage`/`tasksLimit` заменены на `tasksNumber`/`tasksSize`.

**PaginatedResponseDto (обобщённая)**
- Добавлена схема `paginatedResponseSchema` с полями `items` (array) и `totalItems` (integer, min: 0) — шаблон для пагинированных ответов.
- Зарегистрирована как `PaginatedResponseDto`. Конкретные списки (TasksListResponseDto и др.) по-прежнему используют структуру `items` + вложенный объект `pagination` (PaginationMetadataDto).

**Изменённые файлы:**
- `src/schemas/common.schema.ts` — paginationQuerySchema (number/size), sortingRequestSchema, paginationMetadataSchema, paginatedResponseSchema.
- `src/schemas/report-6406/tasks.schema.ts`, `packages.schema.ts`, `task-files.schema.ts` — переход на paginationMetadataSchema, packageTasksQuerySchema (tasksNumber/tasksSize).
- `src/schemas/schema-registry.ts`, `openapi-components.ts` — новые схемы и переименования.
- `src/services/report-6406/tasks.service.ts`, `packages.service.ts`, `task-files.service.ts` — логика пагинации (number, size, offset).
- `docs/swagger/swagger.json` — регенерирован.

**Внимание:** Смена query-параметров с `page`/`limit` на `number`/`size` и нумерации страницы с 1 — **breaking change** для клиентов API; требуется согласование с frontend.

#### 8. Важные технические решения

- **Не редактировать swagger.json вручную** — файл генерируется при старте приложения из Zod-схем и transform/onReady.
- **Порядок обработки components:** simpleTypes → enumTypes → objectTypes, чтобы вложенные и enum-схемы были доступны при сравнении и не создавались циклические ссылки.
- **Сравнение схем:** нормализация (type, propertyKeys, required, propertyTypes для объектов; type, format, pattern, enum для примитивов) и сравнение по JSON.stringify нормализованного представления.
- **Параметры paths:** замена схем в `parameters[].schema` на `$ref` выполняется в onReady по уже сгенерированному swagger, т.к. fastify-swagger разворачивает querystring в parameters после transform.

---

## Связанные документы

- OpenAPI спецификация формы 6406
- Swagger UI / ReDoc для просмотра API
- Документация OpenAPI Generator

## Связанные задачи

- **TASK-011**: Рефакторинг GET /api/v1/report-6406/tasks/ (часть 2) - зависит от TASK-010
- **TASK-012**: Унификация DTO деталей и рефакторинг POST/GET {id} (часть 3) - зависит от TASK-010 и TASK-011

---

