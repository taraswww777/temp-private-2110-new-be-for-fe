# TASK-003: Реализация API для формы отчётности 6406

## Статус
✅ Завершено

## Описание
Реализовать Backend API для работы с формой отчётности 6406, включающей управление заданиями на построение отчётов и пакетами заданий. API должен обеспечивать создание, просмотр, редактирование и удаление заданий и пакетов, а также их связывание между собой.

## Цели
1. Спроектировать схему БД для хранения заданий на построение отчётов и пакетов
2. Реализовать CRUD API для управления заданиями на построение отчётов
3. Реализовать CRUD API для управления пакетами заданий
4. Реализовать API для связывания заданий с пакетами
5. Реализовать API для получения справочников (филиалы, валюты, форматы, источники, типы отчётов)
6. Реализовать пагинацию, фильтрацию и сортировку для списков
7. Обеспечить валидацию данных через Zod схемы
8. Сгенерировать Swagger документацию

## Контекст и исходные данные

### Устаревшая Swagger спецификация
В качестве чернового референса используется файл `docs/rawData/2026-01-27/reportService.json`, который содержит старую спецификацию API. **Важно**: эта спецификация будет переделана на 100% в соответствии с новой архитектурой, но может служить источником понимания структуры данных.

### UI референсы
В папке `docs/rawData/2026-01-27/` находятся скриншоты UI формы 6406, показывающие:
- Список заданий на построение отчётов
- Форму создания нового задания
- Список пакетов
- Детальную страницу пакета
- Модальное окно добавления задания в пакет

## Соглашения по API

### Префикс endpoints для формы 6406
Все endpoints в рамках данной задачи должны начинаться с префикса `/api/v1/report-6406`.

**Обоснование:**
- Система поддерживает множество форм отчётности (6406, 3462, КРОС и др.)
- Каждая форма имеет свою специфику и набор параметров
- Изоляция по формам обеспечивает:
  - Четкое разделение функциональности
  - Возможность независимого развития каждой формы
  - Удобную группировку в Swagger документации
  - Гибкость в настройке прав доступа

**Примеры для других форм (будущие задачи):**
- `/api/v1/report-3462/*` - для формы 3462
- `/api/v1/report-kros/*` - для формы КРОС

### Документирование правил формирования endpoints
После завершения текущей задачи необходимо:
1. Создать документ `docs/api-conventions.md` с описанием правил формирования endpoints
2. Включить в него:
   - Структуру префиксов для разных форм отчётности
   - Правила именования ресурсов
   - Соглашения по версионированию API
   - Примеры правильного и неправильного использования

## Доменная модель

### Сущности

#### 1. Задание на построение отчёта (ReportTask)
Задание на построение отчёта для конкретного филиала за определённый период.

**Поля:**
- `id` (UUID) - уникальный идентификатор задания
- `createdAt` (timestamp) - дата и время создания задания
- `branchId` (integer) - идентификатор филиала
- `branchName` (string) - название филиала (денормализация для производительности)
- `periodStart` (date) - начало периода отчётности
- `periodEnd` (date) - конец периода отчётности
- `accountMask` (string, nullable) - маска счёта (опционально)
- `accountMaskSecondOrder` (string, nullable) - маска счёта 2-го порядка (опционально)
- `currency` (enum: 'RUB' | 'FOREIGN') - валюта (рубль или иностранная валюта)
- `format` (enum: 'TXT' | 'XLSX' | 'XML') - формат выходного файла
- `reportType` (enum: 'LSOZ' | 'LSOS' | 'LSOP') - тип отчёта
  - `LSOZ` - Информация об открытых и закрытых счетах
  - `LSOS` - Информация о счетах. Остатки
  - `LSOP` - Информация о счетах. Операции
- `source` (string, nullable) - код источника счета (опционально)
- `status` (enum) - статус задания (подробнее см. [Статусная модель](../report-6406-status-model.md))
  - `PENDING` - В очереди
  - `IN_PROGRESS` - В процессе выполнения
  - `COMPLETED` - Успешно выполнено
  - `FAILED` - Ошибка выполнения
  - `CANCELLED` - Отменено
- `fileSize` (integer, nullable) - размер сгенерированного файла в байтах
- `fileUrl` (string, nullable) - URL для скачивания файла
- `errorMessage` (string, nullable) - сообщение об ошибке (если status = FAILED)
- `updatedAt` (timestamp) - дата и время последнего обновления

**Связи:**
- Может быть связано с несколькими пакетами через связующую таблицу

**Техническая реализация статусов:**

TypeScript Enum:
```typescript
export enum ReportTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
```

Zod Schema:
```typescript
import { z } from 'zod';

export const reportTaskStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export type ReportTaskStatus = z.infer<typeof reportTaskStatusSchema>;
```

SQL (CHECK constraint):
```sql
CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'))
```

**Валидация переходов между статусами:**

Необходимо реализовать методы валидации в сервисе:

```typescript
class ReportTaskService {
  // Проверка возможности отмены задания
  canCancel(currentStatus: ReportTaskStatus): boolean {
    return ['PENDING', 'IN_PROGRESS'].includes(currentStatus);
  }

  // Проверка возможности удаления задания
  canDelete(currentStatus: ReportTaskStatus): boolean {
    return currentStatus !== 'IN_PROGRESS';
  }

  // Проверка возможности добавления в пакет
  canAddToPackage(currentStatus: ReportTaskStatus): boolean {
    return currentStatus === 'COMPLETED';
  }

  // Отмена задания с валидацией
  async cancelTask(taskId: string): Promise<void> {
    const task = await this.getTask(taskId);
    
    if (!this.canCancel(task.status)) {
      throw new ConflictError(
        `Cannot cancel task in ${task.status} status`
      );
    }

    // Если в процессе - прервать генерацию
    if (task.status === 'IN_PROGRESS') {
      await this.interruptGeneration(taskId);
    }

    await this.updateTaskStatus(taskId, 'CANCELLED');
  }

  // Удаление задания с валидацией
  async deleteTask(taskId: string): Promise<void> {
    const task = await this.getTask(taskId);
    
    if (!this.canDelete(task.status)) {
      throw new ConflictError(
        `Cannot delete task in ${task.status} status`
      );
    }

    // Удалить файл если есть
    if (task.fileUrl) {
      await this.deleteFile(task.fileUrl);
    }

    await this.deleteTaskFromDb(taskId);
  }
}
```

#### 2. Пакет заданий (ReportPackage)
Группа заданий, объединённых для удобства управления и копирования в ТФР.

**Поля:**
- `id` (UUID) - уникальный идентификатор пакета
- `name` (string) - название пакета (до 255 символов)
- `createdAt` (timestamp) - дата и время создания пакета
- `createdBy` (string) - ФИО сотрудника, создавшего пакет
- `lastCopiedToTfrAt` (timestamp, nullable) - дата последнего копирования в ТФР
- `tasksCount` (integer) - количество заданий в пакете (денормализация)
- `totalSize` (bigint) - общий размер всех файлов в пакете в байтах (денормализация)
- `updatedAt` (timestamp) - дата и время последнего обновления

**Связи:**
- Содержит множество заданий через связующую таблицу

#### 3. Связь задания с пакетом (PackageTask)
Связующая таблица many-to-many между пакетами и заданиями.

**Поля:**
- `packageId` (UUID, FK) - идентификатор пакета
- `taskId` (UUID, FK) - идентификатор задания
- `addedAt` (timestamp) - дата и время добавления задания в пакет

**Ограничения:**
- Уникальная пара (packageId, taskId)
- Каскадное удаление при удалении пакета или задания

## API Endpoints

**Важно:** Все endpoints начинаются с префикса `/api/v1/report-6406`

### Справочники

#### GET /api/v1/report-6406/references/branches
Получить список филиалов для выбора в форме создания задания.

**Response 200:**
```json
{
  "branches": [
    {
      "id": 1,
      "code": "7701",
      "name": "Филиал № 7701 Банка ВТБ (публичное акционерное общество)"
    }
  ]
}
```

#### GET /api/v1/report-6406/references/report-types
Получить список типов отчётов.

**Response 200:**
```json
{
  "reportTypes": [
    {
      "code": "LSOZ",
      "name": "Информация об открытых и закрытых счетах"
    },
    {
      "code": "LSOS",
      "name": "Информация о счетах. Остатки"
    },
    {
      "code": "LSOP",
      "name": "Информация о счетах. Операции"
    }
  ]
}
```

#### GET /api/v1/report-6406/references/currencies
Получить список валют.

**Response 200:**
```json
{
  "currencies": [
    {
      "code": "RUB",
      "name": "Рубль"
    },
    {
      "code": "FOREIGN",
      "name": "Иностранная валюта"
    }
  ]
}
```

#### GET /api/v1/report-6406/references/formats
Получить список форматов файлов.

**Response 200:**
```json
{
  "formats": [
    {
      "code": "TXT",
      "name": "Текстовый файл"
    },
    {
      "code": "XLSX",
      "name": "Excel файл"
    },
    {
      "code": "XML",
      "name": "XML файл"
    }
  ]
}
```

#### GET /api/v1/report-6406/references/sources
Получить список источников счетов.

**Response 200:**
```json
{
  "sources": [
    {
      "code": "SRC001",
      "name": "Источник 1",
      "ris": "RIS001"
    }
  ]
}
```

### Задания на построение отчётов

#### POST /api/v1/report-6406/tasks
Создать новое задание на построение отчёта.

**Request Body:**
```json
{
  "branchId": 7701,
  "periodStart": "2000-01-01",
  "periodEnd": "2030-12-31",
  "accountMask": "40817",
  "accountMaskSecondOrder": "01",
  "currency": "RUB",
  "format": "TXT",
  "reportType": "LSOZ",
  "source": "SRC001"
}
```

**Validation:**
- `branchId` - обязательное, целое число > 0
- `periodStart` - обязательное, дата в формате YYYY-MM-DD
- `periodEnd` - обязательное, дата в формате YYYY-MM-DD, должна быть >= periodStart
- `accountMask` - опциональное, строка до 20 символов
- `accountMaskSecondOrder` - опциональное, строка до 2 символов
- `currency` - обязательное, enum ['RUB', 'FOREIGN']
- `format` - обязательное, enum ['TXT', 'XLSX', 'XML']
- `reportType` - обязательное, enum ['LSOZ', 'LSOS', 'LSOP']
- `source` - опциональное, строка до 20 символов

**Response 201:**
```json
{
  "id": "03cb0f48-1234-5678-9abc-def012345678",
  "createdAt": "2025-11-11T17:22:10Z",
  "branchId": 7701,
  "branchName": "Филиал № 7701 Банка ВТБ (публичное акционерное общество)",
  "periodStart": "2000-01-01",
  "periodEnd": "2030-12-31",
  "accountMask": "40817",
  "accountMaskSecondOrder": "01",
  "currency": "RUB",
  "format": "TXT",
  "reportType": "LSOZ",
  "source": "SRC001",
  "status": "PENDING",
  "fileSize": null,
  "fileUrl": null,
  "errorMessage": null,
  "updatedAt": "2025-11-11T17:22:10Z"
}
```

#### GET /api/v1/report-6406/tasks
Получить список заданий с пагинацией, фильтрацией и сортировкой.

**Query Parameters:**
- `page` (integer, default: 0) - номер страницы (начиная с 0)
- `limit` (integer, default: 20, max: 100) - количество записей на странице
- `sortBy` (string, default: 'createdAt') - поле для сортировки ['createdAt', 'branchId', 'status', 'periodStart']
- `sortOrder` (string, default: 'DESC') - порядок сортировки ['ASC', 'DESC']
- `status` (string[], optional) - фильтр по статусам (можно передать несколько)
- `branchId` (integer, optional) - фильтр по филиалу
- `reportType` (string[], optional) - фильтр по типам отчётов
- `periodStartFrom` (date, optional) - фильтр по началу периода (от)
- `periodStartTo` (date, optional) - фильтр по началу периода (до)

**Response 200:**
```json
{
  "tasks": [
    {
      "id": "03cb0f48-1234-5678-9abc-def012345678",
      "createdAt": "2025-11-11T17:22:10Z",
      "branchId": 7701,
      "branchName": "Филиал № 7701 Банка ВТБ (публичное акционерное общество)",
      "periodStart": "2000-01-01",
      "periodEnd": "2030-12-31",
      "status": "COMPLETED",
      "fileSize": 34603008,
      "format": "TXT",
      "reportType": "LSOZ",
      "updatedAt": "2025-11-11T17:25:30Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "totalItems": 256,
    "totalPages": 13
  }
}
```

#### GET /api/v1/report-6406/tasks/:id
Получить детальную информацию о задании.

**Response 200:**
```json
{
  "id": "03cb0f48-1234-5678-9abc-def012345678",
  "createdAt": "2025-11-11T17:22:10Z",
  "branchId": 7701,
  "branchName": "Филиал № 7701 Банка ВТБ (публичное акционерное общество)",
  "periodStart": "2000-01-01",
  "periodEnd": "2030-12-31",
  "accountMask": "40817",
  "accountMaskSecondOrder": "01",
  "currency": "RUB",
  "format": "TXT",
  "reportType": "LSOZ",
  "source": "SRC001",
  "status": "COMPLETED",
  "fileSize": 34603008,
  "fileUrl": "https://storage.example.com/reports/03cb0f48-1234-5678-9abc-def012345678.txt",
  "errorMessage": null,
  "updatedAt": "2025-11-11T17:25:30Z",
  "packages": [
    {
      "id": "12312341451-uuid",
      "name": "Какое-то правильное название пакета",
      "addedAt": "2025-11-11T18:00:00Z"
    }
  ]
}
```

**Response 404:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Report task with id '03cb0f48-1234-5678-9abc-def012345678' not found"
}
```

#### DELETE /api/v1/report-6406/tasks/:id
Удалить задание. Если задание находится в статусе IN_PROGRESS, вернуть ошибку 409.

**Response 204:** (успешное удаление, без тела ответа)

**Response 404:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Report task with id '03cb0f48-1234-5678-9abc-def012345678' not found"
}
```

**Response 409:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.8",
  "title": "Conflict",
  "status": 409,
  "detail": "Cannot delete task in IN_PROGRESS status"
}
```

#### POST /api/v1/report-6406/tasks/bulk-delete
Массовое удаление заданий.

**Request Body:**
```json
{
  "taskIds": [
    "03cb0f48-1234-5678-9abc-def012345678",
    "03cb0f48-1234-5678-9abc-def012345679"
  ]
}
```

**Response 200:**
```json
{
  "deleted": 2,
  "failed": 0,
  "errors": []
}
```

**Response 200 (частичный успех):**
```json
{
  "deleted": 1,
  "failed": 1,
  "errors": [
    {
      "taskId": "03cb0f48-1234-5678-9abc-def012345679",
      "reason": "Cannot delete task in IN_PROGRESS status"
    }
  ]
}
```

#### POST /api/v1/report-6406/tasks/:id/cancel
Отменить задание (перевести в статус CANCELLED). Доступно только для заданий в статусе PENDING или IN_PROGRESS.

**Response 200:**
```json
{
  "id": "03cb0f48-1234-5678-9abc-def012345678",
  "status": "CANCELLED",
  "updatedAt": "2025-11-11T18:30:00Z"
}
```

**Response 409:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.8",
  "title": "Conflict",
  "status": 409,
  "detail": "Cannot cancel task in COMPLETED status"
}
```

#### POST /api/v1/report-6406/tasks/bulk-cancel
Массовая отмена заданий.

**Request Body:**
```json
{
  "taskIds": [
    "03cb0f48-1234-5678-9abc-def012345678",
    "03cb0f48-1234-5678-9abc-def012345679"
  ]
}
```

**Response 200:**
```json
{
  "cancelled": 2,
  "failed": 0,
  "errors": []
}
```

### Пакеты заданий

#### POST /api/v1/report-6406/packages
Создать новый пакет.

**Request Body:**
```json
{
  "name": "Какое-то правильное название пакета",
  "createdBy": "Иванов Иван Иванович"
}
```

**Validation:**
- `name` - обязательное, строка от 1 до 255 символов
- `createdBy` - обязательное, строка от 1 до 255 символов

**Response 201:**
```json
{
  "id": "12312341451-uuid",
  "name": "Какое-то правильное название пакета",
  "createdAt": "2025-12-21T14:33:45Z",
  "createdBy": "Иванов Иван Иванович",
  "lastCopiedToTfrAt": null,
  "tasksCount": 0,
  "totalSize": 0,
  "updatedAt": "2025-12-21T14:33:45Z"
}
```

#### GET /api/v1/report-6406/packages
Получить список пакетов с пагинацией и сортировкой.

**Query Parameters:**
- `page` (integer, default: 0) - номер страницы
- `limit` (integer, default: 20, max: 100) - количество записей на странице
- `sortBy` (string, default: 'createdAt') - поле для сортировки ['createdAt', 'name', 'tasksCount', 'totalSize']
- `sortOrder` (string, default: 'DESC') - порядок сортировки ['ASC', 'DESC']
- `search` (string, optional) - поиск по названию пакета (частичное совпадение)

**Response 200:**
```json
{
  "packages": [
    {
      "id": "12312341451-uuid",
      "name": "Какое-то валидное имя пакета",
      "createdAt": "2025-12-21T14:33:45Z",
      "createdBy": "Иванов Иван Иванович",
      "lastCopiedToTfrAt": "2025-12-21T14:33:45Z",
      "tasksCount": 10123,
      "totalSize": 128974848
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "totalItems": 256,
    "totalPages": 13
  }
}
```

#### GET /api/v1/report-6406/packages/:id
Получить детальную информацию о пакете, включая список заданий в пакете.

**Query Parameters (для списка заданий внутри пакета):**
- `tasksPage` (integer, default: 0) - номер страницы для заданий
- `tasksLimit` (integer, default: 20, max: 100) - количество заданий на странице
- `tasksSortBy` (string, default: 'createdAt') - поле для сортировки заданий
- `tasksSortOrder` (string, default: 'DESC') - порядок сортировки заданий

**Response 200:**
```json
{
  "id": "12312341451-uuid",
  "name": "Какое-то правильное название пакета",
  "createdAt": "2025-12-21T14:33:45Z",
  "createdBy": "Иванов Иван Иванович",
  "lastCopiedToTfrAt": "2025-12-21T14:33:45Z",
  "tasksCount": 10123,
  "totalSize": 128974848,
  "updatedAt": "2025-12-21T14:33:45Z",
  "tasks": [
    {
      "id": "03cb0f48-1234-5678-9abc-def012345678",
      "createdAt": "2025-11-11T17:22:10Z",
      "branchId": 7701,
      "branchName": "Филиал № 7701 Банка ВТБ (публичное акционерное общество)",
      "periodStart": "2000-01-01",
      "periodEnd": "2030-12-31",
      "status": "COMPLETED",
      "fileSize": 34603008,
      "format": "TXT",
      "addedAt": "2025-11-11T18:00:00Z"
    }
  ],
  "tasksPagination": {
    "page": 0,
    "limit": 20,
    "totalItems": 256,
    "totalPages": 13
  }
}
```

#### PATCH /api/v1/report-6406/packages/:id
Обновить название пакета.

**Request Body:**
```json
{
  "name": "Новое название пакета"
}
```

**Response 200:**
```json
{
  "id": "12312341451-uuid",
  "name": "Новое название пакета",
  "updatedAt": "2025-12-21T15:00:00Z"
}
```

#### DELETE /api/v1/report-6406/packages/:id
Удалить пакет. При удалении пакета все связи с заданиями удаляются, но сами задания остаются.

**Response 204:** (успешное удаление, без тела ответа)

**Response 404:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Package with id '12312341451-uuid' not found"
}
```

#### POST /api/v1/report-6406/packages/bulk-delete
Массовое удаление пакетов.

**Request Body:**
```json
{
  "packageIds": [
    "12312341451-uuid",
    "12312341452-uuid"
  ]
}
```

**Response 200:**
```json
{
  "deleted": 2,
  "failed": 0,
  "errors": []
}
```

### Управление заданиями в пакетах

#### POST /api/v1/report-6406/packages/:packageId/tasks
Добавить задания в пакет.

**Request Body:**
```json
{
  "taskIds": [
    "03cb0f48-1234-5678-9abc-def012345678",
    "03cb0f48-1234-5678-9abc-def012345679"
  ]
}
```

**Validation:**
- `taskIds` - обязательное, массив UUID, минимум 1 элемент

**Response 200:**
```json
{
  "added": 2,
  "alreadyInPackage": 0,
  "notFound": 0,
  "errors": []
}
```

**Response 200 (частичный успех):**
```json
{
  "added": 1,
  "alreadyInPackage": 1,
  "notFound": 0,
  "errors": [
    {
      "taskId": "03cb0f48-1234-5678-9abc-def012345679",
      "reason": "Task already in package"
    }
  ]
}
```

#### DELETE /api/v1/report-6406/packages/:packageId/tasks/:taskId
Удалить задание из пакета.

**Response 204:** (успешное удаление, без тела ответа)

**Response 404:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Task '03cb0f48-1234-5678-9abc-def012345678' not found in package '12312341451-uuid'"
}
```

#### POST /api/v1/report-6406/packages/:packageId/tasks/bulk-remove
Массовое удаление заданий из пакета.

**Request Body:**
```json
{
  "taskIds": [
    "03cb0f48-1234-5678-9abc-def012345678",
    "03cb0f48-1234-5678-9abc-def012345679"
  ]
}
```

**Response 200:**
```json
{
  "removed": 2,
  "notFound": 0,
  "errors": []
}
```

#### POST /api/v1/report-6406/packages/:packageId/copy-to-tfr
Скопировать пакет в ТФР (Территориальный Филиал Регистрации). Обновляет поле `lastCopiedToTfrAt`.

**Response 200:**
```json
{
  "id": "12312341451-uuid",
  "lastCopiedToTfrAt": "2025-12-21T15:30:00Z",
  "message": "Package successfully copied to TFR"
}
```

**Response 400:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "Cannot copy empty package to TFR"
}
```

## Схема базы данных

**Важно:** Названия таблиц содержат префикс `report_6406_` для изоляции данных разных форм отчётности.

### Таблица: report_6406_tasks

```sql
CREATE TABLE report_6406_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  branch_id INTEGER NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  account_mask VARCHAR(20),
  account_mask_second_order VARCHAR(2),
  currency VARCHAR(20) NOT NULL CHECK (currency IN ('RUB', 'FOREIGN')),
  format VARCHAR(10) NOT NULL CHECK (format IN ('TXT', 'XLSX', 'XML')),
  report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('LSOZ', 'LSOS', 'LSOP')),
  source VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED')),
  file_size BIGINT,
  file_url TEXT,
  error_message TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_6406_tasks_created_at ON report_6406_tasks(created_at DESC);
CREATE INDEX idx_report_6406_tasks_branch_id ON report_6406_tasks(branch_id);
CREATE INDEX idx_report_6406_tasks_status ON report_6406_tasks(status);
CREATE INDEX idx_report_6406_tasks_period_start ON report_6406_tasks(period_start);
```

### Таблица: report_6406_packages

```sql
CREATE TABLE report_6406_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  last_copied_to_tfr_at TIMESTAMP,
  tasks_count INTEGER NOT NULL DEFAULT 0,
  total_size BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_report_6406_packages_created_at ON report_6406_packages(created_at DESC);
CREATE INDEX idx_report_6406_packages_name ON report_6406_packages(name);
```

### Таблица: report_6406_package_tasks (связующая таблица)

```sql
CREATE TABLE report_6406_package_tasks (
  package_id UUID NOT NULL REFERENCES report_6406_packages(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES report_6406_tasks(id) ON DELETE CASCADE,
  added_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (package_id, task_id)
);

CREATE INDEX idx_report_6406_package_tasks_package_id ON report_6406_package_tasks(package_id);
CREATE INDEX idx_report_6406_package_tasks_task_id ON report_6406_package_tasks(task_id);
```

### Таблица: branches (справочник филиалов)

```sql
CREATE TABLE branches (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL
);

CREATE INDEX idx_branches_code ON branches(code);
```

### Таблица: sources (справочник источников)

```sql
CREATE TABLE sources (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ris VARCHAR(20)
);
```

## Структура проекта

```
/be/src
  /db
    /schema
      report-6406-tasks.schema.ts      # Схема таблицы report_6406_tasks
      report-6406-packages.schema.ts   # Схема таблицы report_6406_packages
      report-6406-package-tasks.schema.ts  # Схема связующей таблицы
      branches.schema.ts               # Схема справочника филиалов
      sources.schema.ts                # Схема справочника источников
      index.ts                         # Экспорт всех схем
  /routes
    /v1
      /report-6406
        /tasks
          index.ts                # CRUD маршруты для заданий
          bulk-operations.ts      # Массовые операции (bulk-delete, bulk-cancel)
        /packages
          index.ts                # CRUD маршруты для пакетов
          tasks.ts                # Управление заданиями в пакетах
        /references
          index.ts                # Справочники
        index.ts                  # Регистрация всех report-6406 маршрутов
      index.ts                    # Регистрация всех v1 маршрутов
  /services
    /report-6406
      tasks.service.ts            # Бизнес-логика для заданий
      packages.service.ts         # Бизнес-логика для пакетов
      references.service.ts       # Бизнес-логика для справочников
  /schemas
    /report-6406
      tasks.schema.ts             # Zod схемы для валидации API заданий
      packages.schema.ts          # Zod схемы для валидации API пакетов
      references.schema.ts        # Zod схемы для справочников
    common.schema.ts              # Общие схемы (пагинация, сортировка)
```

## Критерии приёмки

### База данных
- [ ] Созданы Drizzle схемы для всех таблиц (report_6406_tasks, report_6406_packages, report_6406_package_tasks, branches, sources)
- [ ] Сгенерированы и применены миграции
- [ ] Созданы необходимые индексы для оптимизации запросов
- [ ] Настроены каскадные удаления для связующей таблицы

### API Endpoints - Справочники
- [ ] GET /api/v1/report-6406/references/branches - получение списка филиалов
- [ ] GET /api/v1/report-6406/references/report-types - получение типов отчётов
- [ ] GET /api/v1/report-6406/references/currencies - получение валют
- [ ] GET /api/v1/report-6406/references/formats - получение форматов
- [ ] GET /api/v1/report-6406/references/sources - получение источников

### API Endpoints - Задания
- [ ] POST /api/v1/report-6406/tasks - создание задания
- [ ] GET /api/v1/report-6406/tasks - получение списка с пагинацией и фильтрацией
- [ ] GET /api/v1/report-6406/tasks/:id - получение детальной информации
- [ ] DELETE /api/v1/report-6406/tasks/:id - удаление задания
- [ ] POST /api/v1/report-6406/tasks/bulk-delete - массовое удаление
- [ ] POST /api/v1/report-6406/tasks/:id/cancel - отмена задания
- [ ] POST /api/v1/report-6406/tasks/bulk-cancel - массовая отмена

### API Endpoints - Пакеты
- [ ] POST /api/v1/report-6406/packages - создание пакета
- [ ] GET /api/v1/report-6406/packages - получение списка с пагинацией
- [ ] GET /api/v1/report-6406/packages/:id - получение детальной информации с заданиями
- [ ] PATCH /api/v1/report-6406/packages/:id - обновление названия
- [ ] DELETE /api/v1/report-6406/packages/:id - удаление пакета
- [ ] POST /api/v1/report-6406/packages/bulk-delete - массовое удаление

### API Endpoints - Управление заданиями в пакетах
- [ ] POST /api/v1/report-6406/packages/:packageId/tasks - добавление заданий в пакет
- [ ] DELETE /api/v1/report-6406/packages/:packageId/tasks/:taskId - удаление задания из пакета
- [ ] POST /api/v1/report-6406/packages/:packageId/tasks/bulk-remove - массовое удаление из пакета
- [ ] POST /api/v1/report-6406/packages/:packageId/copy-to-tfr - копирование в ТФР

### Валидация и обработка ошибок
- [ ] Все входные данные валидируются через Zod схемы
- [ ] Корректная обработка ошибок с форматом RFC 7807
- [ ] Валидация бизнес-правил согласно статусной модели:
  - [ ] Нельзя удалить задание в статусе IN_PROGRESS
  - [ ] Нельзя отменить задание в статусе COMPLETED, FAILED или CANCELLED
  - [ ] Можно добавить в пакет только задание в статусе COMPLETED
- [ ] Корректные HTTP статус-коды для всех случаев (409 Conflict для нарушения бизнес-правил)
- [ ] Реализованы все переходы между статусами согласно статусной модели
- [ ] Реализованы методы валидации: canCancel(), canDelete(), canAddToPackage()

### Функциональность
- [ ] Пагинация работает корректно для всех списков
- [ ] Фильтрация по всем указанным полям работает корректно
- [ ] Сортировка по всем указанным полям работает корректно
- [ ] Денормализованные поля (tasksCount, totalSize) обновляются автоматически
- [ ] Поле updatedAt обновляется при изменении записей
- [ ] Массовые операции возвращают детальную информацию об успехах и ошибках

### Документация
- [ ] Swagger документация сгенерирована и доступна по /docs
- [ ] Все endpoints корректно отображаются в Swagger с префиксом /api/v1/report-6406
- [ ] Все схемы запросов и ответов документированы
- [ ] Добавлены примеры запросов и ответов
- [ ] Создан документ docs/api-conventions.md с правилами формирования endpoints

### Тестирование
- [ ] Все endpoints протестированы через Swagger UI
- [ ] Проверена корректность пагинации
- [ ] Проверена корректность фильтрации
- [ ] Проверена корректность сортировки
- [ ] Проверены граничные случаи (пустые списки, несуществующие ID и т.д.)
- [ ] Проверены массовые операции

## Технические требования

### Производительность
- Использовать индексы для часто используемых полей в запросах
- Денормализация для полей tasksCount и totalSize для избежания COUNT запросов
- Оптимизация JOIN запросов при получении связанных данных

### Безопасность
- Валидация всех входных данных
- Защита от SQL injection через использование параметризованных запросов Drizzle
- Проверка существования связанных сущностей перед операциями

### Масштабируемость
- Пагинация обязательна для всех списков
- Ограничение максимального размера страницы (max: 100)
- Использование курсорной пагинации в будущем при необходимости

## Порядок выполнения

1. Создать ветку `feature/TASK-003-implement-6406-report-api` от `main`
2. Создать структуру папок для report-6406 в routes, services, schemas
3. Создать Drizzle схемы для всех таблиц (с префиксом report_6406_)
4. Сгенерировать и применить миграции
5. Создать Zod схемы для валидации API
6. Реализовать сервисы для справочников (services/report-6406/references.service.ts)
7. Реализовать маршруты для справочников с префиксом /api/v1/report-6406/references
8. Реализовать сервисы для заданий (services/report-6406/tasks.service.ts)
9. Реализовать маршруты для заданий с префиксом /api/v1/report-6406/tasks (CRUD + массовые операции)
10. Реализовать сервисы для пакетов (services/report-6406/packages.service.ts)
11. Реализовать маршруты для пакетов с префиксом /api/v1/report-6406/packages (CRUD + управление заданиями)
12. Протестировать все endpoints через Swagger UI
13. Проверить корректность генерации Swagger документации
14. Создать документ docs/api-conventions.md с правилами формирования endpoints
15. Заполнить справочники тестовыми данными
16. Создать seed скрипт для тестовых данных (опционально)
17. Создать коммит с сообщением: `TASK-003 Реализация API для формы отчётности 6406`

## Ветка
`feature/TASK-003-implement-6406-report-api`

## Связанные задачи
- Зависит от: TASK-002 (Инициализация Backend проекта)

## Ссылки
- [Статусная модель формы 6406](../report-6406-status-model.md)
- [API Conventions](../api-conventions.md)
- Устаревшая Swagger спецификация: `docs/rawData/2026-01-27/reportService.json`
- UI скриншоты: `docs/rawData/2026-01-27/*.png`
- Drizzle ORM документация: https://orm.drizzle.team/
- RFC 7807 Problem Details: https://tools.ietf.org/html/rfc7807

## Уточнения в процессе выполнения

_(Эта секция будет заполняться в процессе работы над заданием)_
