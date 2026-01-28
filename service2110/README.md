# Backend Application

Backend приложение на стеке Fastify + TypeScript + PostgreSQL + Drizzle ORM.

## Требования

- Node.js >= 20
- Docker и docker-compose
- npm

## Установка

1. Скопировать `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Установить зависимости (из корня проекта):
```bash
npm install
```

## Запуск

> **Рекомендация:** Используйте команды из корневого `package.json` для удобства.

### Вариант 1: БД в Docker + Backend локально ⭐ (рекомендуется для разработки)

Из корня проекта:
```bash
# Запустить PostgreSQL
npm run docker:db:up

# Запустить Backend с hot-reload
npm run be:dev
```

Или из папки `be/`:
```bash
# Запустить PostgreSQL
docker-compose up postgres -d

# Запустить Backend
npm run start:dev
```

**Преимущества:**
- ✅ Быстрый hot-reload при изменении кода
- ✅ Удобная отладка
- ✅ Логи сразу в терминале

### Вариант 2: Всё в Docker (production-like)

Из корня проекта:
```bash
npm run docker:up
```

Или из папки `be/`:
```bash
npm run start  # или docker-compose up --build
```

**Преимущества:**
- ✅ Полная изоляция
- ✅ Ближе к production окружению
- ✅ Не нужно устанавливать Node.js локально

### После запуска

Приложение будет доступно:
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## Работа с базой данных

### Создание миграции

После изменения схем в `src/db/schema/`:

```bash
npm run db:generate
```

### Применение миграций

```bash
npm run db:migrate
```

### Быстрое применение изменений (dev)

```bash
npm run db:push
```

### Drizzle Studio

Визуальный редактор БД:

```bash
npm run db:studio
```

Будет доступен по адресу: https://local.drizzle.studio

## API Документация

### Swagger UI
HTML документация с возможностью тестирования: http://localhost:3000/docs

### Swagger JSON
JSON спецификация: http://localhost:3000/docs/json

Также автоматически сохраняется в `docs/swagger/swagger.json` при запуске приложения.

## Структура проекта

```
/src
  /db          - База данных (схемы, миграции, подключение)
  /routes      - Fastify маршруты
  /services    - Бизнес-логика
  /schemas     - Zod схемы валидации
  /config      - Конфигурация приложения
  /plugins     - Fastify плагины (обработка ошибок)
  /types       - TypeScript типы
  app.ts       - Настройка Fastify
  server.ts    - Entry point
```

## Разработка

### Линтинг

Проверка кода:
```bash
npm run lint
```

Автоматическое исправление:
```bash
npm run lint:fix
```

### Сборка

```bash
npm run build
```

Результат будет в папке `dist/`.

## Примеры API

### GET /health
Проверка состояния приложения и подключения к БД

Response 200:
```json
{
  "status": "OK",
  "timestamp": "2026-01-28T00:00:00.000Z",
  "database": "connected"
}
```

### GET /api/v1/items
Получить все элементы

### GET /api/v1/items/:id
Получить элемент по ID

### POST /api/v1/items
Создать новый элемент

Body:
```json
{
  "title": "Example",
  "description": "Optional description"
}
```

### PATCH /api/v1/items/:id
Обновить элемент

Body:
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

### DELETE /api/v1/items/:id
Удалить элемент

## Обработка ошибок

Все ошибки возвращаются в формате RFC 7807 Problem Details:

```json
{
  "type": "https://httpstatuses.com/404",
  "title": "Not Found",
  "status": 404,
  "detail": "Item not found",
  "instance": "/api/v1/items/123"
}
```

Для ошибок валидации (422):
```json
{
  "type": "https://httpstatuses.com/422",
  "title": "Validation Error",
  "status": 422,
  "detail": "Request validation failed",
  "instance": "/api/v1/items",
  "errors": [
    {
      "path": "title",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

## CORS

Настроен CORS с разрешением запросов с:
- `http://localhost:*` (любой порт)
- `http://127.0.0.1:*` (любой порт)

## Graceful Shutdown

Приложение корректно обрабатывает сигналы `SIGINT` и `SIGTERM`:
1. Закрывает Fastify сервер
2. Закрывает подключение к PostgreSQL
3. Завершает процесс

## Переменные окружения

См. `.env.example` для списка всех доступных переменных.

Основные:
- `PORT` - порт приложения (по умолчанию 3000)
- `HOST` - хост приложения (по умолчанию 0.0.0.0)
- `NODE_ENV` - окружение (development/production/test)
- `DB_HOST` - хост PostgreSQL (по умолчанию postgres)
- `DB_PORT` - порт PostgreSQL (по умолчанию 5432)
- `DB_USER` - пользователь БД (по умолчанию postgres)
- `DB_PASSWORD` - пароль БД (по умолчанию postgres)
- `DB_NAME` - имя БД (по умолчанию app_db)

## Особенности

- ✅ TypeScript с строгой типизацией
- ✅ Валидация через Zod с автоматической генерацией типов
- ✅ Swagger документация с автогенерацией из Zod схем
- ✅ CORS настроен для localhost
- ✅ Graceful shutdown
- ✅ Health check endpoint с проверкой БД
- ✅ Версионирование API (v1)
- ✅ RFC 7807 Problem Details для ошибок
- ✅ Логирование запросов/ответов в dev режиме
- ✅ Docker и docker-compose для запуска
- ✅ Drizzle ORM для работы с PostgreSQL
