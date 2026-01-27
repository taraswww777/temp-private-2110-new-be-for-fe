# API Conventions

## Соглашения по формированию API endpoints

Данный документ описывает правила и соглашения по формированию API endpoints для Backend сервиса.

## Структура URL

### Базовая структура
```
/api/{version}/{form-type}/{resource}/{action}
```

Где:
- `version` - версия API (например, `v1`, `v2`)
- `form-type` - тип формы отчётности (например, `report-6406`, `report-3462`, `report-kros`)
- `resource` - ресурс (например, `tasks`, `packages`, `references`)
- `action` - действие (опционально, например, `bulk-delete`, `cancel`)

## Префиксы для форм отчётности

Каждая форма отчётности имеет свой уникальный префикс:

| Форма | Префикс | Описание |
|-------|---------|----------|
| 6406 | `/api/v1/report-6406` | Форма отчётности 6406 |
| 3462 | `/api/v1/report-3462` | Форма отчётности 3462 |
| КРОС | `/api/v1/report-kros` | Форма отчётности КРОС |

### Обоснование изоляции по формам

1. **Независимость**: Каждая форма может иметь свою специфику и набор параметров
2. **Масштабируемость**: Легко добавлять новые формы без влияния на существующие
3. **Права доступа**: Возможность настройки прав на уровне формы
4. **Swagger группировка**: Удобная организация документации по формам
5. **Версионирование**: Возможность независимого версионирования каждой формы

## Примеры endpoints

### Форма 6406

#### Справочники
```
GET /api/v1/report-6406/references/branches
GET /api/v1/report-6406/references/report-types
GET /api/v1/report-6406/references/currencies
GET /api/v1/report-6406/references/formats
GET /api/v1/report-6406/references/sources
```

#### Задания
```
POST   /api/v1/report-6406/tasks
GET    /api/v1/report-6406/tasks
GET    /api/v1/report-6406/tasks/:id
DELETE /api/v1/report-6406/tasks/:id
POST   /api/v1/report-6406/tasks/bulk-delete
POST   /api/v1/report-6406/tasks/:id/cancel
POST   /api/v1/report-6406/tasks/bulk-cancel
```

#### Пакеты
```
POST   /api/v1/report-6406/packages
GET    /api/v1/report-6406/packages
GET    /api/v1/report-6406/packages/:id
PATCH  /api/v1/report-6406/packages/:id
DELETE /api/v1/report-6406/packages/:id
POST   /api/v1/report-6406/packages/bulk-delete
```

#### Управление заданиями в пакетах
```
POST   /api/v1/report-6406/packages/:packageId/tasks
DELETE /api/v1/report-6406/packages/:packageId/tasks/:taskId
POST   /api/v1/report-6406/packages/:packageId/tasks/bulk-remove
POST   /api/v1/report-6406/packages/:packageId/copy-to-tfr
```

## Правила именования

### Ресурсы
- Используйте множественное число для коллекций: `tasks`, `packages`, `references`
- Используйте kebab-case: `report-types`, `bulk-delete`

### Действия
- CRUD операции используют стандартные HTTP методы без явного указания действия в URL:
  - `GET /tasks` - получить список
  - `POST /tasks` - создать
  - `GET /tasks/:id` - получить один
  - `PATCH /tasks/:id` - обновить
  - `DELETE /tasks/:id` - удалить

- Специальные действия указываются явно:
  - `POST /tasks/:id/cancel` - отменить задание
  - `POST /tasks/bulk-delete` - массовое удаление
  - `POST /packages/:id/copy-to-tfr` - копировать в ТФР

### Параметры пути
- Используйте camelCase для параметров: `:taskId`, `:packageId`
- Используйте осмысленные имена: `:id`, `:taskId`, а не `:tid`

## HTTP методы

| Метод | Назначение | Идемпотентность |
|-------|-----------|-----------------|
| GET | Получение данных | Да |
| POST | Создание ресурса или выполнение действия | Нет |
| PATCH | Частичное обновление ресурса | Нет |
| PUT | Полное обновление ресурса | Да |
| DELETE | Удаление ресурса | Да |

## Query параметры

### Пагинация
```
?page=0&limit=20
```

- `page` - номер страницы (начиная с 0)
- `limit` - количество записей на странице (default: 20, max: 100)

### Сортировка
```
?sortBy=createdAt&sortOrder=DESC
```

- `sortBy` - поле для сортировки
- `sortOrder` - порядок сортировки (`ASC` или `DESC`)

### Фильтрация
```
?status=PENDING&status=IN_PROGRESS&branchId=7701
```

- Используйте имена полей как есть
- Для множественных значений повторяйте параметр

### Поиск
```
?search=название
```

- `search` - текстовый поиск по основным полям

## Коды ответов

| Код | Описание | Когда использовать |
|-----|----------|-------------------|
| 200 | OK | Успешный GET, PATCH, POST (не создание) |
| 201 | Created | Успешное создание ресурса |
| 204 | No Content | Успешное удаление |
| 400 | Bad Request | Ошибка валидации |
| 401 | Unauthorized | Не авторизован |
| 403 | Forbidden | Нет прав доступа |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт бизнес-логики |
| 422 | Unprocessable Entity | Ошибка обработки данных |
| 500 | Internal Server Error | Внутренняя ошибка сервера |

## Формат ошибок

Используем RFC 7807 Problem Details:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Report task with id '03cb0f48-1234-5678-9abc-def012345678' not found"
}
```

## Версионирование

- Версия указывается в URL: `/api/v1/...`
- При breaking changes создаётся новая версия: `/api/v2/...`
- Старые версии поддерживаются минимум 6 месяцев после выхода новой

## Примеры неправильного использования

❌ **Неправильно:**
```
GET /api/v1/getReportTasks
POST /api/v1/createTask
GET /api/v1/task/:id
DELETE /api/v1/report-6406-tasks/:id
```

✅ **Правильно:**
```
GET /api/v1/report-6406/tasks
POST /api/v1/report-6406/tasks
GET /api/v1/report-6406/tasks/:id
DELETE /api/v1/report-6406/tasks/:id
```

## Swagger документация

- Все endpoints должны быть документированы в Swagger
- Группировка по тегам соответствует форме отчётности: `Report 6406 - Tasks`, `Report 6406 - Packages`
- Все схемы запросов и ответов должны быть описаны
- Примеры запросов и ответов обязательны

## Дополнительные соглашения

### Даты и время
- Используйте ISO 8601 формат: `2025-11-11T17:22:10Z`
- Все даты в UTC

### UUID
- Используйте UUID v4 для идентификаторов
- Формат: `03cb0f48-1234-5678-9abc-def012345678`

### Размеры файлов
- В байтах (integer/bigint)
- Для отображения конвертировать на клиенте

### Денормализация
- Допускается для оптимизации производительности
- Должна быть обоснована и документирована
- Примеры: `tasksCount`, `totalSize`, `branchName`
