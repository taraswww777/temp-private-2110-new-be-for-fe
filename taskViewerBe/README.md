# Task Viewer Backend

Backend приложение для работы с задачами проекта через файловую систему.

## Установка

```bash
npm install
```

## Настройка

Скопировать `.env.example` в `.env`:

```bash
cp .env.example .env
```

### YouTrack интеграция (опционально)

Для работы с YouTrack интеграцией необходимо настроить следующие переменные окружения:

```env
YOUTRACK_URL=http://dvuaod-00app001.innodev.local:8080
YOUTRACK_TOKEN=<permanent-token>
YOUTRACK_PROJECT_ID=<project-id>  # Опционально
```

Если `YOUTRACK_PROJECT_ID` не указан, будет использован первый доступный проект из YouTrack.

## Запуск

Dev режим с hot-reload:

```bash
npm run start:dev
```

Production режим:

```bash
npm run build
npm start
```

## API Endpoints

### GET /api/tasks
Получить список всех задач из `tasks-manifest.json`

**Response:**
```json
[
  {
    "id": "TASK-001",
    "title": "Название задачи",
    "status": "backlog",
    "file": "TASK-001-file.md",
    "createdDate": "2026-01-28",
    "completedDate": null,
    "branch": null
  }
]
```

### GET /api/tasks/:id
Получить задачу по ID с содержимым markdown файла

**Response:**
```json
{
  "id": "TASK-001",
  "title": "Название задачи",
  "status": "backlog",
  "file": "TASK-001-file.md",
  "createdDate": "2026-01-28",
  "completedDate": null,
  "branch": null,
  "content": "# Markdown содержимое..."
}
```

### PATCH /api/tasks/:id
Обновить метаданные задачи (title, status, dates, branch)

**Body:**
```json
{
  "title": "Новое название",
  "status": "in-progress",
  "branch": "feature/TASK-XXX"
}
```

**Response:**
```json
{
  "id": "TASK-001",
  "title": "Новое название",
  "status": "in-progress",
  "file": "TASK-001-file.md",
  "createdDate": "2026-01-28",
  "completedDate": null,
  "branch": "feature/TASK-XXX"
}
```

## YouTrack интеграция

### POST /api/youtrack/tasks
Создать задачу в YouTrack на основе локальной задачи

**Body:**
```json
{
  "taskId": "TASK-035",
  "templateId": "default",
  "customFields": {
    "Priority": "Show-stopper"
  }
}
```

**Response:**
```json
{
  "localTaskId": "TASK-035",
  "youtrackIssueId": "PROJ-123",
  "youtrackIssueUrl": "http://dvuaod-00app001.innodev.local:8080/issue/PROJ-123",
  "youtrackIssueIds": ["PROJ-123"]
}
```

### POST /api/youtrack/tasks/:taskId/link
Связать локальную задачу с существующей задачей в YouTrack

**Body:**
```json
{
  "youtrackIssueId": "PROJ-123"
}
```

### GET /api/youtrack/tasks/:taskId
Получить информацию о всех связях локальной задачи с YouTrack

**Query параметры:**
- `includeDetails` (опционально): `true` для получения детальной информации из YouTrack

**Response:**
```json
{
  "localTaskId": "TASK-035",
  "youtrackIssueIds": ["PROJ-123"],
  "links": [
    {
      "youtrackIssueId": "PROJ-123",
      "youtrackIssueUrl": "http://dvuaod-00app001.innodev.local:8080/issue/PROJ-123",
      "youtrackData": {
        "summary": "Название задачи",
        "state": "Open",
        "priority": "Show-stopper"
      }
    }
  ]
}
```

### DELETE /api/youtrack/tasks/:taskId/link/:youtrackIssueId
Удалить связь локальной задачи с задачей в YouTrack

### Управление шаблонами

- `GET /api/youtrack/templates` - получить все шаблоны
- `GET /api/youtrack/templates/:templateId` - получить шаблон по ID
- `POST /api/youtrack/templates` - создать шаблон
- `PUT /api/youtrack/templates/:templateId` - обновить шаблон
- `DELETE /api/youtrack/templates/:templateId` - удалить шаблон

Шаблоны хранятся в `docs/tasks/youtrack-templates/` и поддерживают переменные:
- `{{taskId}}` - ID локальной задачи
- `{{title}}` - Название локальной задачи
- `{{content}}` - Содержимое markdown файла задачи
- `{{status}}` - Статус локальной задачи
- `{{branch}}` - Git ветка задачи

## Особенности

- Изменение статуса задачи обновляет как `tasks-manifest.json`, так и соответствующий `.md` файл
- Все данные хранятся в файловой системе (папка `docs/tasks`)
- Валидация запросов через Zod
- CORS настроен для работы с frontend (по умолчанию `http://localhost:5173`)
- Интеграция с YouTrack для автоматического создания задач и управления связями
- Система шаблонов для создания задач в YouTrack

## Технологии

- **Runtime**: Node.js >= 20
- **Framework**: Fastify
- **Language**: TypeScript
- **Validation**: Zod
- **File System**: Node.js fs/promises
