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

Также автоматически сохраняется в `docs/swagger/service2110.json` при запуске приложения.

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

## API Отчётности 6406

Полная документация доступна в Swagger UI: http://localhost:3000/docs

### Основные endpoints

#### Задания на построение отчётов
- `GET /api/v1/report-6406/tasks` - Список заданий с фильтрацией и пагинацией
- `POST /api/v1/report-6406/tasks` - Создать новое задание
- `GET /api/v1/report-6406/tasks/:id` - Детальная информация о задании
- `DELETE /api/v1/report-6406/tasks/:id` - Удалить задание
- `POST /api/v1/report-6406/tasks/start` - Запустить задания на выполнение
- `POST /api/v1/report-6406/tasks/:id/cancel` - Отменить задание
- `POST /api/v1/report-6406/tasks/bulk-delete` - Массовое удаление
- `POST /api/v1/report-6406/tasks/bulk-cancel` - Массовая отмена
- `POST /api/v1/report-6406/tasks/export` - Экспорт реестра в CSV

#### История статусов заданий
- `GET /api/v1/report-6406/tasks/:id/status-history` - История изменений статусов

#### Файлы отчётов
- `GET /api/v1/report-6406/tasks/:id/files` - Список файлов задания
- `POST /api/v1/report-6406/tasks/:taskId/files/:fileId/retry` - Повторить конвертацию файла (экспериментально)

#### Пакеты заданий
- `GET /api/v1/report-6406/packages` - Список пакетов
- `POST /api/v1/report-6406/packages` - Создать пакет
- `GET /api/v1/report-6406/packages/:id` - Детальная информация о пакете
- `DELETE /api/v1/report-6406/packages/:id` - Удалить пакет
- `POST /api/v1/report-6406/packages/:id/add-tasks` - Добавить задания в пакет
- `POST /api/v1/report-6406/packages/:id/copy-to-tfr` - Скопировать пакет в ТФР

#### Мониторинг хранилища
- `GET /api/v1/report-6406/storage/volume` - Информация о объёме хранилища

#### Справочники
- `GET /api/v1/report-6406/references/branches` - Список филиалов
- `GET /api/v1/report-6406/references/sources` - Список источников данных

### Статусная модель (21 статус)

Задания могут находиться в одном из 21 статуса:

**DAPP статусы (Data Application Processing):**
- `upload_generation` - Генерация выгрузки
- `registered` - Задание зарегистрировано
- `failed` - Ошибка генерации выгрузки
- `upload_not_formed` - Выгрузка не сформирована
- `upload_formed` - Выгрузка сформирована
- `accepted_dapp` - Задание принято к исполнению
- `submitted_dapp` - Задание поставлено в очередь
- `killed_dapp` - Задание остановлено
- `new_dapp` - Задание создано
- `saving_dapp` - Задание сохранено

**FC статусы (File Conversion):**
- `created` - Создан отчет
- `deleted` - Отчет удален
- `started` - Отчет запущен
- `start_failed` - Ошибка запуска отчета
- `converting` - Отчет конвертируется
- `completed` - Работа над отчетом завершена
- `convert_stopped` - Конвертация остановлена
- `in_queue` - Файлы в очереди на конвертацию
- `file_success_not_exist` - Отсутствует файл _SUCCESS
- `failed_fc` - Ошибка конвертации файла
- `have_broken_files` - Есть файлы с ошибкой

### Моковый user context

Для разработки используется упрощённая система ролей через заголовки:

- `X-User-Role` - роль пользователя (`user`, `manager`, `admin`)
- `X-User-Name` - имя пользователя для логирования
- `X-User-Id` - идентификатор пользователя

Пример запроса:
```bash
curl -X POST http://localhost:3000/api/v1/report-6406/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-Name: Иванов Иван Иванович" \
  -H "X-User-Role: user" \
  -d '{ ... }'
```

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

### Основные переменные

**Приложение:**
- `PORT` - порт приложения (по умолчанию 3000)
- `HOST` - хост приложения (по умолчанию 0.0.0.0)
- `NODE_ENV` - окружение (development/production/test)

**База данных:**
- `DB_HOST` - хост PostgreSQL (по умолчанию postgres)
- `DB_PORT` - порт PostgreSQL (по умолчанию 5432)
- `DB_USER` - пользователь БД (по умолчанию postgres)
- `DB_PASSWORD` - пароль БД (по умолчанию postgres)
- `DB_NAME` - имя БД (по умолчанию app_db)

**Хранилище (для модуля отчётности 6406):**
- `STORAGE_MAX_SIZE_BYTES` - максимальный объём хранилища в байтах (по умолчанию 1TB)
- `STORAGE_WARNING_THRESHOLD` - порог предупреждения в процентах (по умолчанию 85)

**Mock файлы (для разработки):**
- `MOCK_FILE_STORAGE_URL` - базовый URL для моковых файлов (по умолчанию http://localhost:3000/mock-files)
- `PRESIGNED_URL_EXPIRATION_HOURS` - срок действия pre-signed URLs в часах (по умолчанию 1)
- `STORAGE_BUCKET_NAME` - имя бакета для моковых URLs (по умолчанию mock-reports-bucket)

**CSV Export:**
- `CSV_EXPORT_MAX_RECORDS` - максимальное количество записей в CSV (по умолчанию 10000)

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
