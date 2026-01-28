# API Conventions

Этот документ описывает соглашения и правила формирования API endpoints в проекте.

## Версионирование API

Все API endpoints используют версионирование через префикс в URL:

```
/api/v1/*
```

### Примеры:
- ✅ `/api/v1/report-6406/tasks`
- ✅ `/api/v1/report-6406/packages`
- ❌ `/report-6406/tasks` (отсутствует версионирование)
- ❌ `/api/report-6406/tasks` (отсутствует версия)

## Структура endpoints для форм отчётности

Каждая форма отчётности имеет свой изолированный префикс в рамках версии API.

### Общая структура:
```
/api/v{version}/report-{form_number}/*
```

### Реализованные формы:

#### Форма 6406
Префикс: `/api/v1/report-6406`

**Endpoints:**
- `/api/v1/report-6406/references/*` - справочники
- `/api/v1/report-6406/tasks/*` - задания на построение отчётов
- `/api/v1/report-6406/packages/*` - пакеты заданий

#### Будущие формы (примеры):
- `/api/v1/report-3462/*` - для формы 3462
- `/api/v1/report-kros/*` - для формы КРОС

## Обоснование изоляции по формам

1. **Четкое разделение функциональности** - каждая форма имеет свою специфику и набор параметров
2. **Независимое развитие** - изменения в одной форме не влияют на другие
3. **Удобная группировка** - в Swagger документации endpoints группируются по формам
4. **Гибкость в настройке прав доступа** - можно настроить доступ на уровне формы

## Именование ресурсов

### Правила:
1. Используйте множественное число для коллекций: `/tasks`, `/packages`
2. Используйте существительные, а не глаголы: `/tasks`, а не `/getTasks`
3. Используйте kebab-case для составных слов: `/report-types`, `/package-tasks`
4. ID ресурсов передаются в URL как параметры: `/tasks/:id`

### Примеры правильного именования:

#### CRUD операции:
- `GET /api/v1/report-6406/tasks` - получить список заданий
- `POST /api/v1/report-6406/tasks` - создать задание
- `GET /api/v1/report-6406/tasks/:id` - получить задание по ID
- `PATCH /api/v1/report-6406/tasks/:id` - обновить задание
- `DELETE /api/v1/report-6406/tasks/:id` - удалить задание

#### Специфичные действия:
- `POST /api/v1/report-6406/tasks/:id/cancel` - отменить задание
- `POST /api/v1/report-6406/tasks/bulk-delete` - массовое удаление
- `POST /api/v1/report-6406/packages/:id/copy-to-tfr` - копирование в ТФР

#### Вложенные ресурсы:
- `POST /api/v1/report-6406/packages/:packageId/tasks` - добавить задания в пакет
- `DELETE /api/v1/report-6406/packages/:packageId/tasks/:taskId` - удалить задание из пакета

### Примеры неправильного именования:
- ❌ `/api/v1/report-6406/getTask` - используется глагол вместо существительного
- ❌ `/api/v1/report-6406/task` - единственное число вместо множественного
- ❌ `/api/v1/report-6406/reportTypes` - camelCase вместо kebab-case
- ❌ `/api/v1/report-6406/tasks/delete/:id` - действие в URL вместо HTTP метода

## HTTP методы

Используйте правильные HTTP методы согласно семантике:

| Метод  | Назначение                    | Идемпотентность |
|--------|-------------------------------|-----------------|
| GET    | Получение данных              | Да              |
| POST   | Создание ресурса или действие | Нет             |
| PUT    | Полная замена ресурса         | Да              |
| PATCH  | Частичное обновление ресурса  | Нет             |
| DELETE | Удаление ресурса              | Да              |

### Примеры:
- `GET /tasks` - получить список (идемпотентный)
- `POST /tasks` - создать новый (не идемпотентный)
- `PATCH /tasks/:id` - обновить часть полей (не идемпотентный)
- `DELETE /tasks/:id` - удалить (идемпотентный)

## HTTP статус коды

Используйте правильные статус коды для различных ситуаций:

### Успешные ответы (2xx):
- `200 OK` - успешный запрос с телом ответа
- `201 Created` - ресурс успешно создан
- `204 No Content` - успешный запрос без тела ответа (обычно для DELETE)

### Клиентские ошибки (4xx):
- `400 Bad Request` - невалидные данные в запросе
- `404 Not Found` - ресурс не найден
- `409 Conflict` - конфликт с текущим состоянием (например, нельзя удалить задание в статусе IN_PROGRESS)

### Серверные ошибки (5xx):
- `500 Internal Server Error` - внутренняя ошибка сервера

## Формат ошибок (RFC 7807)

Все ошибки возвращаются в формате RFC 7807 Problem Details:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Report task with id '03cb0f48-1234-5678-9abc-def012345678' not found",
  "instance": "/api/v1/report-6406/tasks/03cb0f48-1234-5678-9abc-def012345678"
}
```

### Поля:
- `type` - URI с описанием типа ошибки
- `title` - краткое описание ошибки
- `status` - HTTP статус код
- `detail` - детальное описание ошибки
- `instance` (опционально) - URI запроса, который вызвал ошибку
- `errors` (опционально) - массив деталей валидации для 400 ошибок

## Пагинация

### Query параметры:
- `page` - номер страницы (начиная с 0)
- `limit` - количество записей на странице (по умолчанию 20, максимум 100)

### Формат ответа:
```json
{
  "tasks": [...],
  "pagination": {
    "page": 0,
    "limit": 20,
    "totalItems": 256,
    "totalPages": 13
  }
}
```

## Фильтрация

Фильтры передаются как query параметры:

```
GET /api/v1/report-6406/tasks?status=COMPLETED&branchId=7701
```

### Множественные значения:
Для фильтрации по нескольким значениям используйте массивы:

```
GET /api/v1/report-6406/tasks?status=COMPLETED&status=PENDING
```

## Сортировка

Сортировка задается двумя query параметрами:

- `sortBy` - поле для сортировки
- `sortOrder` - направление (`ASC` или `DESC`)

```
GET /api/v1/report-6406/tasks?sortBy=createdAt&sortOrder=DESC
```

## Swagger документация

Все endpoints должны быть задокументированы в Swagger с помощью Zod схем:

```typescript
app.get('/tasks', {
  schema: {
    tags: ['Report 6406 - Tasks'],
    summary: 'Получить список заданий',
    querystring: tasksQuerySchema,
    response: {
      200: tasksListResponseSchema,
    },
  },
}, handler);
```

### Теги в Swagger:
- Используйте формат: `Report {FormNumber} - {Resource}`
- Примеры:
  - `Report 6406 - References`
  - `Report 6406 - Tasks`
  - `Report 6406 - Packages`

## Валидация

Вся валидация входных данных выполняется с помощью Zod схем:

```typescript
export const createTaskSchema = z.object({
  branchId: z.number().int().positive(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // ...
});
```

### Преимущества Zod:
1. Типобезопасность - автоматический вывод типов TypeScript
2. Валидация runtime - проверка данных во время выполнения
3. Swagger интеграция - автоматическая генерация OpenAPI схем

## Массовые операции

Массовые операции (bulk operations) всегда возвращают детальную информацию об успехах и ошибках:

```json
{
  "deleted": 2,
  "failed": 1,
  "errors": [
    {
      "taskId": "uuid",
      "reason": "Cannot delete task in IN_PROGRESS status"
    }
  ]
}
```

### Endpoint для массовых операций:
```
POST /api/v1/report-6406/tasks/bulk-delete
POST /api/v1/report-6406/tasks/bulk-cancel
```

## Даты и время

### Формат:
- Даты: `YYYY-MM-DD` (ISO 8601)
- Дата и время: `YYYY-MM-DDTHH:mm:ss.sssZ` (ISO 8601 с timezone UTC)

### Примеры:
- `"2025-11-11"` - дата
- `"2025-11-11T17:22:10.123Z"` - дата и время

## Лучшие практики

1. **Консистентность** - используйте одинаковые подходы для схожих операций
2. **Предсказуемость** - структура endpoints должна быть интуитивной
3. **Документация** - все endpoints должны быть задокументированы
4. **Валидация** - всегда валидируйте входные данные
5. **Обработка ошибок** - используйте правильные статус коды и RFC 7807
6. **Производительность** - используйте пагинацию для больших списков
7. **Безопасность** - валидируйте и санитизируйте все входные данные

## Примеры полных URL

### Справочники:
```
GET /api/v1/report-6406/references/branches
GET /api/v1/report-6406/references/report-types
GET /api/v1/report-6406/references/currencies
GET /api/v1/report-6406/references/formats
GET /api/v1/report-6406/references/sources
```

### Задания:
```
POST   /api/v1/report-6406/tasks
GET    /api/v1/report-6406/tasks
GET    /api/v1/report-6406/tasks/:id
DELETE /api/v1/report-6406/tasks/:id
POST   /api/v1/report-6406/tasks/bulk-delete
POST   /api/v1/report-6406/tasks/:id/cancel
POST   /api/v1/report-6406/tasks/bulk-cancel
```

### Пакеты:
```
POST   /api/v1/report-6406/packages
GET    /api/v1/report-6406/packages
GET    /api/v1/report-6406/packages/:id
PATCH  /api/v1/report-6406/packages/:id
DELETE /api/v1/report-6406/packages/:id
POST   /api/v1/report-6406/packages/bulk-delete
POST   /api/v1/report-6406/packages/:packageId/tasks
DELETE /api/v1/report-6406/packages/:packageId/tasks/:taskId
POST   /api/v1/report-6406/packages/:packageId/tasks/bulk-remove
POST   /api/v1/report-6406/packages/:packageId/copy-to-tfr
```
