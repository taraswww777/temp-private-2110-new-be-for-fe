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

## Особенности

- Изменение статуса задачи обновляет как `tasks-manifest.json`, так и соответствующий `.md` файл
- Все данные хранятся в файловой системе (папка `docs/tasks`)
- Валидация запросов через Zod
- CORS настроен для работы с frontend (по умолчанию `http://localhost:5173`)

## Технологии

- **Runtime**: Node.js >= 20
- **Framework**: Fastify
- **Language**: TypeScript
- **Validation**: Zod
- **File System**: Node.js fs/promises
