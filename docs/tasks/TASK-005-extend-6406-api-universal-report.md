# TASK-005: Добавление новой функциональности в API формы 6406

## Статус
📋 Бэклог

## Описание
Расширение существующего API формы отчётности 6406 для поддержки полной функциональности универсального модуля управления отчетностью. Включает добавление новой статусной модели с 21 статусом, управление файлами отчётов, историю изменения статусов, выгрузку реестра и мониторинг хранилища.

## Цели
1. Обновить статусную модель заданий с 5 до 21 статуса
2. Реализовать API для управления файлами отчётов
3. Реализовать историю изменений статусов заданий
4. Добавить endpoint для запуска задания на выполнение (BR-3)
5. Добавить endpoint для выгрузки реестра отчётов в CSV (BR-5)
6. Реализовать мониторинг объёма хранилища
7. Добавить базовую систему ролей через заголовки запросов (моковую)
8. Обеспечить полную валидацию всех бизнес-требований (BR-1 до BR-13)

## Контекст и исходные данные

### Источники документации
- Основной документ: `docs/rawData/2026-01-28/БТ универсальный отчет.docx`
- Базовая реализация: TASK-003 (уже выполнена)
- API конвенции: `docs/api-conventions.md`

### Связь с предыдущими задачами
- **TASK-002**: Базовая инфраструктура Backend (выполнено)
- **TASK-003**: Первичная реализация API формы 6406 (выполнено) - 5 базовых статусов
- **TASK-005**: Расширение функциональности до полного объёма (текущая задача)

## Новая статусная модель (21 статус)

### Статусы для DAPP (Data Application Processing)

Статусы связаны с обработкой данных и генерацией выгрузки:

| № | Code | Name (RU) | is_end_dapp | is_end_fc | Разрешена отмена | Разрешено удаление | Разрешен запуск |
|---|------|-----------|-------------|-----------|------------------|-------------------|-----------------|
| 1 | upload_generation | Генерация выгрузки | false | false | true | false | false |
| 2 | registered | Задание зарегистрировано | false | false | true | false | false |
| 3 | failed | Ошибка генерации выгрузки | true | false | false | true | false |
| 4 | upload_not_formed | Выгрузка не сформирована | true | false | false | true | false |
| 5 | upload_formed | Выгрузка сформирована | true | false | true | false | false |
| 6 | accepted_dapp | Задание принято к исполнению | false | false | true | false | false |
| 7 | submitted_dapp | Задание поставлено в очередь выполнения | false | false | true | false | false |
| 8 | killed_dapp | Задание остановлено | true | false | true | true | false |
| 9 | new_dapp | Задание создано | false | false | true | false | false |
| 10 | saving_dapp | Задание сохранено | false | false | true | false | false |

### Статусы для File Conversion (FC)

Статусы связаны с конвертацией файлов:

| № | Code | Name (RU) | is_end_dapp | is_end_fc | Разрешена отмена | Разрешено удаление | Разрешен запуск |
|---|------|-----------|-------------|-----------|------------------|-------------------|-----------------|
| 11 | created | Создан отчет | false | false | false | true | true |
| 12 | deleted | Отчет удален | false | false | false | false | false |
| 13 | started | Отчет запущен | false | false | true | false | false |
| 14 | start_failed | Ошибка запуска отчета | false | false | false | true | false |
| 15 | converting | Отчет конвертируется | false | false | true | false | false |
| 16 | completed | Работа над отчетом завершена (файлы сконвертированы) | false | true | false | true | false |
| 17 | convert_stopped | Конвертация остановлена | - | - | - | true | false |
| 18 | in_queue | Файлы отчета добавлены в очередь на конвертацию | false | true | true | false | false |
| 19 | file_success_not_exist | Отсутствует файл _SUCCESS в папке отчета | false | true | false | true | false |
| 20 | failed_fc | Ошибка конвертации файла | false | true | false | true | false |
| 21 | have_broken_files | Есть файлы с ошибкой конвертации | false | true | false | true | false |

### Правила статусной модели

1. **Удаление запрещено**, если отчет находится в процессе работы (поле `Разрешено удаление` = false)
2. **Отмена запрещена**, если работа уже завершена или прервана ошибкой (поле `Разрешена отмена` = false)
3. **Запуск разрешён** только для статусов с полем `Разрешен запуск` = true (currently только `created`)

### Дополнительные поля для статусной модели

К существующей таблице `report_6406_tasks` добавить поля:
- `is_end_dapp` (boolean) - признак завершения обработки DAPP
- `is_end_fc` (boolean) - признак завершения конвертации файлов
- `can_cancel` (boolean) - разрешена ли отмена задания
- `can_delete` (boolean) - разрешено ли удаление задания
- `can_start` (boolean) - разрешен ли запуск задания

**Примечание**: Эти поля рассчитываются на основе текущего статуса согласно таблице выше.

## Доменная модель (дополнения к TASK-003)

### 1. История статусов задания (ReportTaskStatusHistory)

Новая таблица для хранения истории изменений статусов заданий.

**Поля:**
- `id` (UUID) - уникальный идентификатор записи истории
- `taskId` (UUID, FK) - идентификатор задания
- `status` (enum) - статус (один из 21 статуса)
- `previousStatus` (enum, nullable) - предыдущий статус
- `changedAt` (timestamp) - дата и время изменения статуса
- `changedBy` (string, nullable) - кто изменил (ФИО или идентификатор пользователя)
- `comment` (text, nullable) - комментарий к изменению
- `metadata` (jsonb, nullable) - дополнительная информация (например, причина ошибки)

**Связи:**
- Связана с таблицей `report_6406_tasks` через `taskId`

**Индексы:**
- `idx_status_history_task_id` на поле `taskId`
- `idx_status_history_changed_at` на поле `changedAt DESC`

### 2. Файлы отчёта (ReportTaskFile)

Новая таблица для хранения информации о файлах, связанных с заданием.

**Поля:**
- `id` (UUID) - уникальный идентификатор файла
- `taskId` (UUID, FK) - идентификатор задания
- `fileName` (string) - имя файла
- `fileSize` (bigint) - размер файла в байтах
- `fileType` (string) - тип файла (mime-type)
- `status` (enum) - статус файла:
  - `PENDING` - ожидает конвертации
  - `CONVERTING` - конвертируется
  - `COMPLETED` - готов
  - `FAILED` - ошибка конвертации
- `storageUrl` (string) - URL файла в хранилище (S3 или аналог)
- `downloadUrl` (string, nullable) - pre-signed URL для скачивания (генерируется по запросу)
- `downloadUrlExpiresAt` (timestamp, nullable) - время истечения pre-signed URL
- `errorMessage` (text, nullable) - сообщение об ошибке (если status = FAILED)
- `createdAt` (timestamp) - дата создания файла
- `updatedAt` (timestamp) - дата последнего обновления

**Связи:**
- Связана с таблицей `report_6406_tasks` через `taskId`

**Индексы:**
- `idx_task_files_task_id` на поле `taskId`
- `idx_task_files_status` на поле `status`

### 3. Дополнительные поля для задания (обновление ReportTask)

К существующей таблице `report_6406_tasks` добавить:
- `createdBy` (string) - ФИО или идентификатор создателя задания
- `lastStatusChangedAt` (timestamp) - дата последнего изменения статуса
- `startedAt` (timestamp, nullable) - дата запуска задания на выполнение
- `completedAt` (timestamp, nullable) - дата завершения выполнения задания
- `filesCount` (integer, default: 0) - количество файлов в задании (денормализация)

## API Endpoints (дополнения к TASK-003)

**Важно**: Все endpoints начинаются с префикса `/api/v1/report-6406`

### Управление заданиями (расширение)

#### POST /api/v1/report-6406/tasks/start
Запустить одно или несколько заданий на выполнение (BR-3).

**Описание:**
Переводит задания из статуса `created` в статус `started` и запускает процесс генерации отчётов. Поддерживает запуск как одного задания, так и массовый запуск.

**Заголовки:**
- `X-User-Role` (string, optional) - роль пользователя (user, manager, admin)
- `X-User-Name` (string, optional) - имя пользователя для логирования

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
- Все задания должны существовать
- Задания должны быть в статусе `created` (можно запускать только созданные задания)
- Проверить наличие свободного места в хранилище для всех заданий (см. лимиты ниже)

**Response 200 (полный успех):**
```json
{
  "started": 2,
  "failed": 0,
  "results": [
    {
      "taskId": "03cb0f48-1234-5678-9abc-def012345678",
      "status": "started",
      "startedAt": "2026-01-28T12:00:00Z"
    },
    {
      "taskId": "03cb0f48-1234-5678-9abc-def012345679",
      "status": "started",
      "startedAt": "2026-01-28T12:00:00Z"
    }
  ],
  "errors": []
}
```

**Response 200 (частичный успех):**
```json
{
  "started": 1,
  "failed": 1,
  "results": [
    {
      "taskId": "03cb0f48-1234-5678-9abc-def012345678",
      "status": "started",
      "startedAt": "2026-01-28T12:00:00Z"
    }
  ],
  "errors": [
    {
      "taskId": "03cb0f48-1234-5678-9abc-def012345679",
      "reason": "Cannot start task in 'completed' status. Only tasks with status 'created' can be started"
    }
  ]
}
```

**Response 507 Insufficient Storage:**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.8",
  "title": "Insufficient Storage",
  "status": 507,
  "detail": "Not enough storage space. Required: 200MB, Available: 50MB"
}
```

#### GET /api/v1/report-6406/tasks/:id
Получить детальную информацию о задании (обновлённый endpoint из TASK-003).

**Изменения по сравнению с TASK-003:**
- Добавить поля: `createdBy`, `lastStatusChangedAt`, `startedAt`, `completedAt`, `filesCount`
- Добавить вычисляемые поля: `canCancel`, `canDelete`, `canStart` (на основе текущего статуса)
- Поле `status` теперь может принимать один из 21 статуса

**Response 200:**
```json
{
  "id": "03cb0f48-1234-5678-9abc-def012345678",
  "createdAt": "2025-11-11T17:22:10Z",
  "createdBy": "Иванов Иван Иванович",
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
  "status": "completed",
  "canCancel": false,
  "canDelete": true,
  "canStart": false,
  "fileSize": 34603008,
  "filesCount": 3,
  "fileUrl": "https://storage.example.com/reports/03cb0f48-1234-5678-9abc-def012345678.txt",
  "errorMessage": null,
  "lastStatusChangedAt": "2025-11-11T17:25:30Z",
  "startedAt": "2025-11-11T17:22:15Z",
  "completedAt": "2025-11-11T17:25:30Z",
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

### История статусов задания (BR-10)

#### GET /api/v1/report-6406/tasks/:id/status-history
Получить историю изменений статусов задания.

**Path Parameters:**
- `id` (UUID) - идентификатор задания

**Query Parameters:**
- `page` (integer, default: 0) - номер страницы
- `limit` (integer, default: 20, max: 100) - количество записей на странице

**Response 200:**
```json
{
  "taskId": "03cb0f48-1234-5678-9abc-def012345678",
  "history": [
    {
      "id": "hist-001",
      "status": "completed",
      "previousStatus": "converting",
      "changedAt": "2025-11-11T17:25:30Z",
      "changedBy": "System",
      "comment": "All files converted successfully"
    },
    {
      "id": "hist-002",
      "status": "converting",
      "previousStatus": "started",
      "changedAt": "2025-11-11T17:23:00Z",
      "changedBy": "System",
      "comment": null
    },
    {
      "id": "hist-003",
      "status": "started",
      "previousStatus": "created",
      "changedAt": "2025-11-11T17:22:15Z",
      "changedBy": "Иванов Иван Иванович",
      "comment": "Manually started by user"
    },
    {
      "id": "hist-004",
      "status": "created",
      "previousStatus": null,
      "changedAt": "2025-11-11T17:22:10Z",
      "changedBy": "Иванов Иван Иванович",
      "comment": "Task created"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "totalItems": 4,
    "totalPages": 1
  }
}
```

### Файлы отчёта (BR-12, BR-13)

#### GET /api/v1/report-6406/tasks/:id/files
Получить список файлов задания.

**Path Parameters:**
- `id` (UUID) - идентификатор задания

**Query Parameters:**
- `page` (integer, default: 0) - номер страницы
- `limit` (integer, default: 20, max: 100) - количество файлов на странице
- `sortBy` (string, default: 'status') - поле для сортировки ['status', 'fileName', 'fileSize', 'createdAt']
- `sortOrder` (string, default: 'ASC') - порядок сортировки ['ASC', 'DESC']
- `status` (string[], optional) - фильтр по статусам файлов

**Response 200:**
```json
{
  "taskId": "03cb0f48-1234-5678-9abc-def012345678",
  "files": [
    {
      "id": "file-001",
      "fileName": "report_part_1.txt",
      "fileSize": 10485760,
      "fileType": "text/plain",
      "status": "COMPLETED",
      "downloadUrl": "https://storage.example.com/presigned/file-001?expires=...",
      "downloadUrlExpiresAt": "2026-01-28T13:00:00Z",
      "errorMessage": null,
      "createdAt": "2025-11-11T17:23:00Z",
      "updatedAt": "2025-11-11T17:25:00Z"
    },
    {
      "id": "file-002",
      "fileName": "report_part_2.txt",
      "fileSize": 12582912,
      "fileType": "text/plain",
      "status": "FAILED",
      "downloadUrl": null,
      "downloadUrlExpiresAt": null,
      "errorMessage": "Conversion failed: Invalid file format",
      "createdAt": "2025-11-11T17:23:00Z",
      "updatedAt": "2025-11-11T17:24:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 20,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

**Примечание о downloadUrl:**
- Pre-signed URL генерируется при каждом запросе списка файлов
- Срок действия: 1 час с момента генерации
- Для моковой реализации: возвращать статический URL с текстовым файлом

#### POST /api/v1/report-6406/tasks/:taskId/files/:fileId/retry
⚠️ **Экспериментальный функционал** - повторить конвертацию файла с ошибкой.

**Примечание**: Этот endpoint является экспериментальным и может быть изменён или удалён в будущих версиях. Реализация опциональна.

**Path Parameters:**
- `taskId` (UUID) - идентификатор задания
- `fileId` (UUID) - идентификатор файла

**Validation:**
- Файл должен быть в статусе `FAILED`

**Response 200:**
```json
{
  "id": "file-002",
  "status": "PENDING",
  "message": "File conversion restarted"
}
```

**Response 501 Not Implemented (для первой версии):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.2",
  "title": "Not Implemented",
  "status": 501,
  "detail": "File retry functionality is not implemented yet. This is an experimental feature."
}
```

### Выгрузка реестра отчётов (BR-5)

#### POST /api/v1/report-6406/tasks/export
Выгрузить реестр отчётов в CSV формате.

**Request Body:**
```json
{
  "filters": {
    "status": ["completed", "failed"],
    "branchId": 7701,
    "periodStartFrom": "2025-01-01",
    "periodStartTo": "2025-12-31"
  },
  "sortBy": "createdAt",
  "sortOrder": "DESC"
}
```

**Описание:**
Создаёт CSV файл со списком заданий согласно фильтрам. Возвращает ссылку на скачивание файла.

**Response 200:**
```json
{
  "exportId": "export-12345",
  "status": "COMPLETED",
  "fileUrl": "https://storage.example.com/exports/report-6406-tasks-export-12345.csv",
  "fileSize": 1048576,
  "downloadUrlExpiresAt": "2026-01-28T13:00:00Z",
  "recordsCount": 1523,
  "createdAt": "2026-01-28T12:00:00Z"
}
```

**CSV формат:**
```csv
ID,Created At,Created By,Branch ID,Branch Name,Period Start,Period End,Status,File Size,Format,Report Type,Started At,Completed At
03cb0f48-1234-5678-9abc-def012345678,2025-11-11T17:22:10Z,Иванов Иван Иванович,7701,Филиал № 7701,2000-01-01,2030-12-31,completed,34603008,TXT,LSOZ,2025-11-11T17:22:15Z,2025-11-11T17:25:30Z
...
```

**Примечание для моковой реализации:**
- Генерировать CSV "на лету" при запросе
- Использовать библиотеку для генерации CSV (например, `csv-stringify`)
- Возвращать ссылку на dynamically generated file или stream

### Мониторинг хранилища

#### GET /api/v1/report-6406/storage/volume
Получить информацию о занятом и свободном объёме хранилища.

**Response 200:**
```json
{
  "totalBytes": 1099511627776,
  "usedBytes": 549755813888,
  "freeBytes": 549755813888,
  "usedPercent": 50.0,
  "totalHuman": "1.00 TB",
  "usedHuman": "512.00 GB",
  "freeHuman": "512.00 GB",
  "warning": null
}
```

**Response 200 (с предупреждением о нехватке места):**
```json
{
  "totalBytes": 1099511627776,
  "usedBytes": 989626271129,
  "freeBytes": 109885356646,
  "usedPercent": 90.0,
  "totalHuman": "1.00 TB",
  "usedHuman": "921.60 GB",
  "freeHuman": "102.40 GB",
  "warning": "Storage usage is above 85%. Consider cleaning up old reports."
}
```

**Конфигурация (ENV):**
- `STORAGE_MAX_SIZE_BYTES` - максимальный объём хранилища в байтах (по умолчанию: 1099511627776 = 1TB)
- `STORAGE_WARNING_THRESHOLD` - порог предупреждения в процентах (по умолчанию: 85)

**Логика расчёта:**
- `usedBytes` = сумма всех `fileSize` из таблицы `report_6406_tasks` где `status` != 'deleted'
- `freeBytes` = `totalBytes` - `usedBytes`
- `usedPercent` = (`usedBytes` / `totalBytes`) * 100
- `warning` появляется, если `usedPercent` >= `STORAGE_WARNING_THRESHOLD`

### Лимиты хранилища (BR-3)

При запуске задания проверять наличие свободного места:
1. Получить ожидаемый размер отчёта (можно использовать моковое значение, например 100MB)
2. Проверить: `freeBytes` >= `expectedReportSize`
3. Если места недостаточно, вернуть ошибку 507 Insufficient Storage

## Схема базы данных (дополнения)

### Обновление таблицы report_6406_tasks

```sql
ALTER TABLE report_6406_tasks
  -- Новые статусы (обновить CHECK constraint)
  DROP CONSTRAINT IF EXISTS report_6406_tasks_status_check,
  ADD CONSTRAINT report_6406_tasks_status_check CHECK (
    status IN (
      'upload_generation', 'registered', 'failed', 'upload_not_formed', 'upload_formed',
      'accepted_dapp', 'submitted_dapp', 'killed_dapp', 'new_dapp', 'saving_dapp',
      'created', 'deleted', 'started', 'start_failed', 'converting',
      'completed', 'convert_stopped', 'in_queue', 'file_success_not_exist',
      'failed_fc', 'have_broken_files'
    )
  ),
  
  -- Новые поля
  ADD COLUMN created_by VARCHAR(255),
  ADD COLUMN last_status_changed_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN started_at TIMESTAMP,
  ADD COLUMN completed_at TIMESTAMP,
  ADD COLUMN files_count INTEGER DEFAULT 0;

-- Индексы
CREATE INDEX idx_report_6406_tasks_created_by ON report_6406_tasks(created_by);
CREATE INDEX idx_report_6406_tasks_last_status_changed_at ON report_6406_tasks(last_status_changed_at DESC);
```

### Таблица: report_6406_task_status_history

```sql
CREATE TABLE report_6406_task_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES report_6406_tasks(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL CHECK (
    status IN (
      'upload_generation', 'registered', 'failed', 'upload_not_formed', 'upload_formed',
      'accepted_dapp', 'submitted_dapp', 'killed_dapp', 'new_dapp', 'saving_dapp',
      'created', 'deleted', 'started', 'start_failed', 'converting',
      'completed', 'convert_stopped', 'in_queue', 'file_success_not_exist',
      'failed_fc', 'have_broken_files'
    )
  ),
  previous_status VARCHAR(30),
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  changed_by VARCHAR(255),
  comment TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_task_id ON report_6406_task_status_history(task_id);
CREATE INDEX idx_status_history_changed_at ON report_6406_task_status_history(changed_at DESC);
```

### Таблица: report_6406_task_files

```sql
CREATE TABLE report_6406_task_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES report_6406_tasks(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONVERTING', 'COMPLETED', 'FAILED')),
  storage_url TEXT NOT NULL,
  download_url TEXT,
  download_url_expires_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_files_task_id ON report_6406_task_files(task_id);
CREATE INDEX idx_task_files_status ON report_6406_task_files(status);
CREATE INDEX idx_task_files_created_at ON report_6406_task_files(created_at DESC);
```

## Система ролей (моковая реализация)

### Роли
- `user` - базовый пользователь (оператор банка)
- `manager` - менеджер (контролёр)
- `admin` - администратор

### Заголовки запросов
- `X-User-Role` (string, optional) - роль пользователя (по умолчанию: 'user')
- `X-User-Name` (string, optional) - имя пользователя (по умолчанию: 'Anonymous User')
- `X-User-Id` (string, optional) - идентификатор пользователя (по умолчанию: 'anonymous')

### Middleware для извлечения информации о пользователе

```typescript
// src/plugins/user-context.ts
import type { FastifyPluginAsync } from 'fastify';

export interface UserContext {
  role: 'user' | 'manager' | 'admin';
  name: string;
  id: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: UserContext;
  }
}

export const userContextPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (request) => {
    const role = (request.headers['x-user-role'] as string) || 'user';
    const name = (request.headers['x-user-name'] as string) || 'Anonymous User';
    const id = (request.headers['x-user-id'] as string) || 'anonymous';

    // Валидация роли
    if (!['user', 'manager', 'admin'].includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    request.user = {
      role: role as 'user' | 'manager' | 'admin',
      name,
      id,
    };
  });
};
```

### Использование в сервисах

```typescript
// При создании задания
const task = await createTask({
  ...data,
  createdBy: request.user.name, // Из заголовка X-User-Name
});

// При изменении статуса
await addStatusHistory({
  taskId,
  status: newStatus,
  previousStatus: currentStatus,
  changedBy: request.user.name,
});
```

### Примечание
**Важно**: Это упрощённая моковая реализация для разработки. Настоящая авторизация через JWT и проверка прав доступа будут реализованы в отдельной задаче.

## Структура проекта (дополнения)

```
/be/src
  /db/schema
    report-6406-tasks.schema.ts          # Обновить: добавить новые статусы и поля
    report-6406-task-status-history.schema.ts  # Новая схема
    report-6406-task-files.schema.ts     # Новая схема
    index.ts                             # Обновить: добавить экспорт новых схем
    
  /routes/v1/report-6406
    /tasks
      index.ts                           # Обновить: добавить POST /:id/start
      bulk-operations.ts                 # Обновить: добавить bulk-start
      status-history.ts                  # Новый файл: история статусов
      files.ts                           # Новый файл: управление файлами
      export.ts                          # Новый файл: выгрузка реестра
    /storage
      index.ts                           # Новый файл: мониторинг хранилища
      
  /services/report-6406
    tasks.service.ts                     # Обновить: добавить startTask, updateStatus
    task-status-history.service.ts       # Новый файл: работа с историей статусов
    task-files.service.ts                # Новый файл: работа с файлами
    export.service.ts                    # Новый файл: генерация CSV
    storage.service.ts                   # Новый файл: расчёт объёма хранилища
    
  /schemas/report-6406
    tasks.schema.ts                      # Обновить: добавить новые поля и статусы
    task-status-history.schema.ts        # Новый файл: схемы для истории
    task-files.schema.ts                 # Новый файл: схемы для файлов
    export.schema.ts                     # Новый файл: схемы для экспорта
    storage.schema.ts                    # Новый файл: схемы для хранилища
    
  /plugins
    user-context.ts                      # Новый файл: middleware для user context
    
  /types
    status-model.ts                      # Новый файл: типы и константы статусов
    
  /utils
    file-size-formatter.ts               # Новый файл: форматирование размеров (bytes to human)
    presigned-url-generator.ts           # Новый файл: генерация моковых pre-signed URLs
    csv-generator.ts                     # Новый файл: генерация CSV файлов
```

## Бизнес-требования (Business Requirements)

### Модуль «Управление списком заданий»

#### BR-1: Создание задания
**Статус**: ✅ Реализовано в TASK-003
- Endpoint: `POST /api/v1/report-6406/tasks`

#### BR-2: Удаление задания
**Статус**: ✅ Реализовано в TASK-003, обновить валидацию
- Endpoint: `DELETE /api/v1/report-6406/tasks/:id`
- Обновить: проверять поле `can_delete` на основе статуса
- Правило: нельзя удалить задание с `can_delete = false`

#### BR-3: Запуск формирования отчетов
**Статус**: 🆕 Новая функциональность
- Endpoint: `POST /api/v1/report-6406/tasks/start` (единый endpoint для одного или нескольких заданий)
- Проверка: статус должен быть `created`
- Проверка: наличие свободного места в хранилище

#### BR-4: Фильтрация
**Статус**: ✅ Реализовано в TASK-003
- Endpoint: `GET /api/v1/report-6406/tasks?status=...&branchId=...`
- Обновить: поддержка новых 21 статусов в фильтрах

#### BR-5: Выгрузка реестра отчетов
**Статус**: 🆕 Новая функциональность
- Endpoint: `POST /api/v1/report-6406/tasks/export`
- Формат: CSV
- Фильтрация по тем же параметрам что и GET списка

#### BR-6: Отмена запуска формирования отчетов
**Статус**: ✅ Реализовано в TASK-003, обновить валидацию
- Endpoint: `POST /api/v1/report-6406/tasks/:id/cancel`
- Обновить: проверять поле `can_cancel` на основе статуса
- Правило: нельзя отменить задание с `can_cancel = false`

#### BR-7: Просмотр списка отчетов
**Статус**: ✅ Реализовано в TASK-003
- Endpoint: `GET /api/v1/report-6406/tasks`
- Обновить: возвращать новые поля в response

#### BR-8: Управление размерами страницы
**Статус**: ✅ Реализовано в TASK-003
- Query параметр `limit` для контроля размера страницы

#### BR-9: Пагинация
**Статус**: ✅ Реализовано в TASK-003
- Query параметры `page` и `limit`

### Модуль «История статусов отчета»

#### BR-10: Просмотр истории статусов отчета
**Статус**: 🆕 Новая функциональность
- Endpoint: `GET /api/v1/report-6406/tasks/:id/status-history`
- Таблица: `report_6406_task_status_history`
- Автоматическое логирование всех изменений статусов

### Модуль «Детализация отчета»

#### BR-11: Просмотр детализации по отчету
**Статус**: ✅ Реализовано в TASK-003, расширить response
- Endpoint: `GET /api/v1/report-6406/tasks/:id`
- Добавить: новые поля (`createdBy`, `filesCount`, `startedAt`, `completedAt`)
- Добавить: вычисляемые поля (`canCancel`, `canDelete`, `canStart`)

### Модуль «Файлы отчета»

#### BR-12: Просмотр списка файлов отчета
**Статус**: 🆕 Новая функциональность
- Endpoint: `GET /api/v1/report-6406/tasks/:id/files`
- Таблица: `report_6406_task_files`
- Сортировка по статусу (финальные успешные сверху, после финальные неуспешные, промежуточные последними)

#### BR-13: Скачивание файла
**Статус**: 🆕 Новая функциональность
- Pre-signed URLs в response от `GET /api/v1/report-6406/tasks/:id/files`
- Доступно только для файлов в статусе `COMPLETED`
- Моковая реализация: статический URL на текстовый файл с содержимым "Mock report file content"

## Валидация и обработка ошибок

### Валидация статусных переходов

```typescript
// src/services/report-6406/tasks.service.ts
export class TasksService {
  private getStatusPermissions(status: TaskStatus) {
    const permissions = STATUS_PERMISSIONS_MAP[status];
    return {
      canCancel: permissions.canCancel,
      canDelete: permissions.canDelete,
      canStart: permissions.canStart,
    };
  }

  async startTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.getTaskById(taskId);
    
    if (!task) {
      throw new NotFoundError(`Task with id '${taskId}' not found`);
    }

    const permissions = this.getStatusPermissions(task.status);
    
    if (!permissions.canStart) {
      throw new ConflictError(
        `Cannot start task in '${task.status}' status. Only tasks with status 'created' can be started`
      );
    }

    // Проверка наличия места в хранилище
    const storageInfo = await storageService.getStorageVolume();
    const estimatedSize = 104857600; // 100MB mock value
    
    if (storageInfo.freeBytes < estimatedSize) {
      throw new InsufficientStorageError(
        `Not enough storage space. Required: ${formatBytes(estimatedSize)}, Available: ${formatBytes(storageInfo.freeBytes)}`
      );
    }

    // Обновление статуса
    const updatedTask = await this.updateTaskStatus(
      taskId,
      'started',
      task.status,
      userId,
      'Task started by user'
    );

    return updatedTask;
  }

  async updateTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    previousStatus: TaskStatus,
    changedBy: string,
    comment?: string
  ): Promise<Task> {
    // Транзакция: обновить задание + добавить запись в историю
    return await db.transaction(async (trx) => {
      // Обновить задание
      const task = await trx
        .update(tasks)
        .set({
          status: newStatus,
          lastStatusChangedAt: new Date(),
          updatedAt: new Date(),
          // Обновить startedAt если переход в started
          ...(newStatus === 'started' && { startedAt: new Date() }),
          // Обновить completedAt если переход в completed
          ...(newStatus === 'completed' && { completedAt: new Date() }),
        })
        .where(eq(tasks.id, taskId))
        .returning();

      // Добавить запись в историю
      await trx.insert(taskStatusHistory).values({
        taskId,
        status: newStatus,
        previousStatus,
        changedAt: new Date(),
        changedBy,
        comment,
      });

      return task[0];
    });
  }
}
```

### HTTP статус-коды

- `200 OK` - успешное выполнение операции
- `201 Created` - успешное создание ресурса
- `204 No Content` - успешное удаление
- `400 Bad Request` - ошибка валидации входных данных
- `404 Not Found` - ресурс не найден
- `409 Conflict` - конфликт бизнес-правил (например, нельзя запустить задание в неправильном статусе)
- `507 Insufficient Storage` - недостаточно места в хранилище

### Формат ошибок (RFC 7807)

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.6.8",
  "title": "Insufficient Storage",
  "status": 507,
  "detail": "Not enough storage space. Required: 100MB, Available: 50MB"
}
```

## Конфигурация (Environment Variables)

Добавить в `.env.example`:

```env
# Storage Configuration
STORAGE_MAX_SIZE_BYTES=1099511627776  # 1TB
STORAGE_WARNING_THRESHOLD=85          # Предупреждение при 85% заполнения

# File URLs (Mock)
MOCK_FILE_STORAGE_URL=http://localhost:3000/mock-files
PRESIGNED_URL_EXPIRATION_HOURS=1     # Срок действия pre-signed URLs

# CSV Export
CSV_EXPORT_MAX_RECORDS=10000         # Максимальное количество записей в CSV
```

## Моковые данные и функции

### Генератор моковых pre-signed URLs

```typescript
// src/utils/presigned-url-generator.ts
import { env } from '../config/env.js';

export function generateMockPresignedUrl(fileId: string, fileName: string): {
  url: string;
  expiresAt: Date;
} {
  const baseUrl = env.MOCK_FILE_STORAGE_URL || 'http://localhost:3000/mock-files';
  const expirationHours = env.PRESIGNED_URL_EXPIRATION_HOURS || 1;
  
  const url = `${baseUrl}/${fileId}/${encodeURIComponent(fileName)}`;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expirationHours);
  
  return { url, expiresAt };
}
```

### Mock endpoint для скачивания файлов

```typescript
// src/routes/mock-files.ts
import type { FastifyPluginAsync } from 'fastify';

export const mockFilesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/mock-files/:fileId/:fileName', async (request, reply) => {
    const { fileId, fileName } = request.params as { fileId: string; fileName: string };
    
    const content = `Mock report file content
File ID: ${fileId}
File Name: ${fileName}
Generated at: ${new Date().toISOString()}

This is a mock file for development purposes.
In production, this would contain actual report data.`;

    return reply
      .header('Content-Type', 'text/plain; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="${fileName}"`)
      .send(content);
  });
};
```

### Моковая генерация файлов для задания

```typescript
// src/services/report-6406/task-files.service.ts
export async function generateMockFilesForTask(taskId: string): Promise<void> {
  const mockFiles = [
    {
      taskId,
      fileName: 'report_part_1.txt',
      fileSize: 10485760, // 10MB
      fileType: 'text/plain',
      status: 'COMPLETED' as const,
      storageUrl: `s3://mock-bucket/reports/${taskId}/report_part_1.txt`,
    },
    {
      taskId,
      fileName: 'report_part_2.txt',
      fileSize: 12582912, // 12MB
      fileType: 'text/plain',
      status: 'COMPLETED' as const,
      storageUrl: `s3://mock-bucket/reports/${taskId}/report_part_2.txt`,
    },
    {
      taskId,
      fileName: 'report_summary.txt',
      fileSize: 1048576, // 1MB
      fileType: 'text/plain',
      status: 'COMPLETED' as const,
      storageUrl: `s3://mock-bucket/reports/${taskId}/report_summary.txt`,
    },
  ];

  await db.insert(taskFiles).values(mockFiles);
}
```

## Критерии приёмки

### База данных
- [ ] Обновлена таблица `report_6406_tasks` с новыми полями и 21 статусом
- [ ] Создана таблица `report_6406_task_status_history`
- [ ] Создана таблица `report_6406_task_files`
- [ ] Созданы необходимые индексы
- [ ] Сгенерированы и применены миграции

### API Endpoints - Управление заданиями (дополнения)
- [ ] POST /api/v1/report-6406/tasks/start - запуск задания (поддерживает одно или несколько заданий)
- [ ] GET /api/v1/report-6406/tasks/:id - обновлён с новыми полями
- [ ] Обновлена валидация для DELETE и POST .../cancel

### API Endpoints - История статусов
- [ ] GET /api/v1/report-6406/tasks/:id/status-history - история изменений статусов

### API Endpoints - Файлы
- [ ] GET /api/v1/report-6406/tasks/:id/files - список файлов с pre-signed URLs
- [ ] POST /api/v1/report-6406/tasks/:taskId/files/:fileId/retry - повтор конвертации (⚠️ экспериментальный, можно вернуть 501 Not Implemented)

### API Endpoints - Экспорт и хранилище
- [ ] POST /api/v1/report-6406/tasks/export - выгрузка реестра в CSV
- [ ] GET /api/v1/report-6406/storage/volume - мониторинг хранилища

### API Endpoints - Mock
- [ ] GET /mock-files/:fileId/:fileName - mock endpoint для скачивания файлов

### Функциональность
- [ ] Автоматическое логирование изменений статусов в историю
- [ ] Проверка разрешений на операции (cancel, delete, start) на основе статуса
- [ ] Проверка наличия свободного места при запуске задания
- [ ] Генерация pre-signed URLs для файлов (mock реализация)
- [ ] Генерация CSV файла с реестром заданий
- [ ] Подсчёт занятого и свободного места в хранилище
- [ ] Middleware для извлечения информации о пользователе из заголовков

### Валидация и обработка ошибок
- [ ] Валидация переходов между статусами
- [ ] Корректная обработка ошибок 409 Conflict при нарушении бизнес-правил
- [ ] Корректная обработка ошибки 507 Insufficient Storage
- [ ] Все endpoints возвращают корректные HTTP статус-коды

### Документация
- [ ] Swagger документация обновлена для всех новых endpoints
- [ ] Документированы все новые схемы запросов и ответов
- [ ] Добавлены примеры для всех endpoints
- [ ] Обновлён файл README.md с описанием новой функциональности

### Тестирование
- [ ] Все новые endpoints протестированы через Swagger UI
- [ ] Проверена работа истории статусов
- [ ] Проверена генерация pre-signed URLs для файлов
- [ ] Проверена генерация CSV реестра
- [ ] Проверен подсчёт объёма хранилища
- [ ] Проверена работа middleware для user context
- [ ] Проверены все сценарии валидации статусных переходов

## Технические детали реализации

### Транзакции для атомарных операций

Все операции изменения статуса должны выполняться в транзакции:
```typescript
await db.transaction(async (trx) => {
  // 1. Обновить задание
  await trx.update(tasks).set({ status: newStatus });
  
  // 2. Добавить запись в историю
  await trx.insert(taskStatusHistory).values({ ... });
});
```

### Денормализация данных

Для производительности использовать денормализованные поля:
- `filesCount` в таблице `report_6406_tasks` - обновлять при добавлении/удалении файлов
- `usedBytes` для хранилища - рассчитывать как сумму `fileSize` всех активных заданий

### Форматирование размеров файлов

```typescript
// src/utils/file-size-formatter.ts
export function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
```

### Генерация CSV

```typescript
// src/utils/csv-generator.ts
import { stringify } from 'csv-stringify/sync';

export function generateTasksCsv(tasks: Task[]): string {
  const records = tasks.map(task => ({
    'ID': task.id,
    'Created At': task.createdAt.toISOString(),
    'Created By': task.createdBy || '',
    'Branch ID': task.branchId,
    'Branch Name': task.branchName,
    'Period Start': task.periodStart,
    'Period End': task.periodEnd,
    'Status': task.status,
    'File Size': task.fileSize || 0,
    'Format': task.format,
    'Report Type': task.reportType,
    'Started At': task.startedAt?.toISOString() || '',
    'Completed At': task.completedAt?.toISOString() || '',
  }));

  return stringify(records, {
    header: true,
    columns: {
      'ID': 'ID',
      'Created At': 'Created At',
      'Created By': 'Created By',
      'Branch ID': 'Branch ID',
      'Branch Name': 'Branch Name',
      'Period Start': 'Period Start',
      'Period End': 'Period End',
      'Status': 'Status',
      'File Size': 'File Size',
      'Format': 'Format',
      'Report Type': 'Report Type',
      'Started At': 'Started At',
      'Completed At': 'Completed At',
    },
  });
}
```

## Порядок выполнения

1. Создать ветку `feature/TASK-005-extend-6406-api-universal-report` от `main`
2. **База данных**:
   - Обновить Drizzle схему `report-6406-tasks.schema.ts` (добавить новые поля и 21 статус)
   - Создать Drizzle схему `report-6406-task-status-history.schema.ts`
   - Создать Drizzle схему `report-6406-task-files.schema.ts`
   - Сгенерировать и применить миграции
3. **Типы и утилиты**:
   - Создать `src/types/status-model.ts` с константами и типами для 21 статуса
   - Создать `src/utils/file-size-formatter.ts`
   - Создать `src/utils/presigned-url-generator.ts`
   - Создать `src/utils/csv-generator.ts`
4. **Middleware**:
   - Создать `src/plugins/user-context.ts`
   - Зарегистрировать плагин в `src/app.ts`
5. **Zod схемы**:
   - Обновить `src/schemas/report-6406/tasks.schema.ts` (новые поля)
   - Создать `src/schemas/report-6406/task-status-history.schema.ts`
   - Создать `src/schemas/report-6406/task-files.schema.ts`
   - Создать `src/schemas/report-6406/export.schema.ts`
   - Создать `src/schemas/report-6406/storage.schema.ts`
6. **Сервисы**:
   - Обновить `src/services/report-6406/tasks.service.ts` (startTask, updateStatus)
   - Создать `src/services/report-6406/task-status-history.service.ts`
   - Создать `src/services/report-6406/task-files.service.ts`
   - Создать `src/services/report-6406/export.service.ts`
   - Создать `src/services/report-6406/storage.service.ts`
7. **Маршруты**:
   - Обновить `src/routes/v1/report-6406/tasks/index.ts` (добавить POST /start)
   - Создать `src/routes/v1/report-6406/tasks/status-history.ts`
   - Создать `src/routes/v1/report-6406/tasks/files.ts`
   - Создать `src/routes/v1/report-6406/tasks/export.ts`
   - Создать `src/routes/v1/report-6406/storage/index.ts`
   - Создать `src/routes/mock-files.ts`
   - Обновить регистрацию маршрутов в `src/routes/v1/report-6406/index.ts`
8. **Конфигурация**:
   - Обновить `src/config/env.ts` (добавить STORAGE_* переменные)
   - Обновить `.env.example`
9. **Тестирование**:
   - Протестировать все новые endpoints через Swagger UI
   - Проверить работу всех функций
   - Проверить валидацию
10. **Документация**:
    - Проверить корректность Swagger документации
    - Обновить README.md
11. Создать коммит с сообщением: `TASK-005 Добавление новой функциональности в API формы 6406`

## Ветка
`feature/TASK-005-extend-6406-api-universal-report`

## Связанные задачи
- Зависит от: TASK-002 (Инициализация Backend проекта) ✅
- Зависит от: TASK-003 (Реализация API для формы отчётности 6406) ✅
- Следующая: TASK-006 (Реализация авторизации и RBAC) - будет создана позже

## Ссылки
- Основной документ: `docs/rawData/2026-01-28/БТ универсальный отчет.docx`
- Статусная модель: `docs/report-6406-status-model.md`
- API конвенции: `docs/api-conventions.md`
- Базовая реализация: `docs/tasks/TASK-003-implement-6406-report-api.md`
- Drizzle ORM: https://orm.drizzle.team/
- RFC 7807 Problem Details: https://tools.ietf.org/html/rfc7807
- CSV Stringify: https://csv.js.org/stringify/

## Вопросы требующие уточнения в процессе выполнения

**Важно**: Эти вопросы нужно будет уточнить перед началом работы над задачей:

### 1. Генерация файлов
При запуске задания (POST /api/v1/report-6406/tasks/start):
- Нужно ли сразу генерировать моковые файлы в таблице `report_6406_task_files`?
- Или файлы появляются асинхронно (имитация фоновой обработки)?

### 2. Статусный цикл задания
Какие переходы между статусами должны происходить автоматически:
- `created` → (POST /start) → `started` → ? → `completed`
- Нужна ли имитация промежуточных статусов (`converting`, `in_queue` и т.д.)?

### 3. CSV Export
- Должен ли endpoint `/tasks/export` возвращать файл сразу (stream) или создавать задачу на генерацию?
- Если создаёт задачу, нужна ли отдельная таблица для хранения export jobs?

## Уточнения в процессе выполнения

_(Эта секция будет заполняться в процессе работы над заданием)_
