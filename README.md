# Service2110

Backend сервис на стеке Fastify + TypeScript + PostgreSQL + Drizzle ORM.

## Структура проекта

```
/
├── service2110/        # Service2110 (Fastify + TypeScript)
├── docs/               # Документация и задачи
│   └── tasks/         # Задачи в формате TASK-XXX
├── pet-task-viewer/   # Task Viewer вынесен как отдельное приложение (отдельный репозиторий при переносе)
├── package.json       # Корневой package.json с workspace
└── README.md          # Этот файл
```

При работе только с Service2110 каталог `pet-task-viewer/` в этом монорепозитории можно не трогать или удалить после полного переноса в свой git remote.

## Требования

- Node.js >= 20
- Docker и docker-compose
- npm

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск в режиме разработки (рекомендуется)

**БД в Docker + Service2110 локально** ⭐

```bash
# Запустить PostgreSQL в Docker
npm run docker:db:up

# Запустить Service2110 (Backend) с hot-reload
npm run dev
```

**Преимущества:**
- ✅ Быстрый hot-reload при изменении кода
- ✅ Удобная отладка
- ✅ Логи сразу в терминале

### 3. Проверка работы

После запуска Service2110 будет доступен:

- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## Доступные команды

### Service2110 (Backend) команды

```bash
# Разработка
npm run dev                 # Запуск в dev режиме с hot-reload
npm run build               # Сборка TypeScript
npm run lint                # Проверка кода ESLint
npm run lint:fix            # Автоисправление ESLint

# База данных
npm run db:generate         # Создать миграцию
npm run db:push             # Быстрое применение изменений (dev)
npm run db:seed             # Заполнить справочники тестовыми данными
npm run db:studio           # Открыть Drizzle Studio
```

### Docker команды

```bash
# PostgreSQL
npm run docker:db:up        # Запустить PostgreSQL
npm run docker:db:down      # Остановить PostgreSQL
```

### CI проверки (локально)

```bash
npm run ci:lint             # Линтер только Service2110
npm run ci:build            # Сборка только Service2110
npm run ci:check            # Полная проверка (lint + build)
```

## Варианты запуска (подробно)

### 🔧 Режим разработки (Development)

**Рекомендуемый способ для разработки:**

1. Запустить PostgreSQL:
   ```bash
   npm run docker:db:up
   ```

2. Запустить Service2110 локально:
   ```bash
   npm run dev
   ```

3. При необходимости применить миграции:
   ```bash
   npm run db:push
   ```

**Что происходит:**
- PostgreSQL работает в Docker контейнере `be_postgres`
- Service2110 запускается локально через `tsx watch` с автоперезагрузкой
- При изменении `.ts` файлов сервер автоматически перезапускается
- БД доступна на `localhost:5432`
- API доступен на `localhost:3000`

**Остановка:**
```bash
# Остановить Service2110: Ctrl+C в терминале
# Остановить PostgreSQL:
npm run docker:db:down
```

---

## API Endpoints

### Health Check
- `GET /health` - Проверка состояния приложения и БД

### Report 6406 API
- `GET /api/v1/report-6406/references/*` - Справочники (филиалы, валюты, форматы и т.д.)
- `POST /api/v1/report-6406/tasks` - Создать задание на построение отчёта
- `GET /api/v1/report-6406/tasks` - Получить список заданий
- `POST /api/v1/report-6406/packages` - Создать пакет заданий
- `GET /api/v1/report-6406/packages` - Получить список пакетов

Полная документация доступна в Swagger UI.

### Документация
- `GET /docs` - Swagger UI (интерактивная документация)
- `GET /docs/json` - Swagger JSON спецификация

## 📚 API Документация

API документация доступна в нескольких форматах:

### Локальная разработка
- **Swagger UI**: http://localhost:3000/docs
- **JSON спека**: http://localhost:3000/docs/json
- **Файл**: `service2110/docs/swagger/swagger.json`

### Публичная документация
- **GitHub Pages**: `https://<username>.github.io/<repository-name>/`
- Автоматически обновляется при пуше в main ветку
- Публичный доступ для всех желающих

### Генерация документации локально

Для тестирования документации локально:

```bash
# Сгенерировать HTML версию документации
npm run docs:generate

# Предпросмотр (откроется в браузере)
npm run docs:preview
```

Сгенерированные файлы будут в папке `docs/public/`:
- `index.html` - Swagger UI
- `swagger.json` - OpenAPI спецификация

## 🔄 CI/CD

### Автоматические проверки

При создании Pull Request автоматически запускаются проверки для **Service2110**:

1. **Lint** — ESLint  
2. **Build** — сборка TypeScript (включая проверку типов в рамках сборки)

Отдельно репозиторий **Pet Task Viewer** (каталог `pet-task-viewer/` или собственный remote) содержит свой CI для `taskViewerBe` и `taskViewerFe`.

### Локальная проверка перед коммитом

Запустите проверки локально перед созданием PR:

```bash
# Полная проверка Service2110 (lint + build)
npm run ci:check

# Только lint Service2110
npm run ci:lint

# Только build Service2110
npm run ci:build
```

### Публикация документации

При пуше в main ветку:
- Автоматически обновляется Swagger документация на GitHub Pages
- Срабатывает только при изменениях в `swagger.json` или workflow

## Работа с базой данных

### Создание и применение миграций

1. Изменить схему в `service2110/src/db/schema/`
2. Создать миграцию:
   ```bash
   npm run db:generate
   ```
3. Применить изменения (быстро, для dev):
   ```bash
   npm run db:push
   ```

### Заполнение справочников

Заполнить справочники тестовыми данными:

```bash
npm run db:seed
```

### Drizzle Studio

Визуальный редактор базы данных:

```bash
npm run db:studio
```

Откроется по адресу: https://local.drizzle.studio

## Переменные окружения

Service2110 использует файл `service2110/.env`. Пример в `service2110/.env.example`:

```env
# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DB_HOST=localhost        # для локального запуска
# DB_HOST=postgres       # для Docker режима
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=app_db
```

**Важно:** При локальном запуске Service2110 используйте `DB_HOST=localhost`.

## Структура Service2110

```
service2110/
├── src/
│   ├── config/         # Конфигурация (env валидация)
│   ├── db/            # База данных
│   │   ├── schema/    # Drizzle схемы таблиц
│   │   ├── migrations/# SQL миграции
│   │   ├── seed.ts    # Заполнение справочников
│   │   └── index.ts   # Подключение к БД
│   ├── routes/        # API маршруты
│   │   └── v1/        # API v1
│   │       └── report-6406/  # Форма отчётности 6406
│   ├── services/      # Бизнес-логика
│   │   └── report-6406/
│   ├── schemas/       # Zod схемы валидации
│   │   └── report-6406/
│   ├── plugins/       # Fastify плагины
│   ├── app.ts         # Настройка Fastify
│   └── server.ts      # Entry point
├── docs/
│   └── swagger/       # Swagger документация (генерируется)
├── Dockerfile         # Docker образ
├── docker-compose.yml # Оркестрация контейнеров
├── tsconfig.json      # TypeScript конфигурация
├── eslint.config.mjs  # ESLint конфигурация
├── drizzle.config.ts  # Drizzle ORM конфигурация
└── README.md          # Документация
```

## Технологический стек

- **Runtime**: Node.js 20
- **Framework**: Fastify
- **Language**: TypeScript
- **Validation**: Zod
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **API Docs**: Swagger (автогенерация из Zod)
- **Linter**: ESLint
- **Containerization**: Docker, docker-compose
- **CI/CD**: GitHub Actions

## Особенности

- ✅ TypeScript с строгой типизацией
- ✅ Валидация через Zod с автогенерацией типов
- ✅ Swagger документация с автогенерацией из Zod схем
- ✅ CORS настроен для localhost
- ✅ Graceful shutdown
- ✅ Health check endpoint с проверкой БД
- ✅ Версионирование API (v1)
- ✅ RFC 7807 Problem Details для ошибок
- ✅ Логирование запросов/ответов в dev режиме (pino-pretty)
- ✅ Hot-reload в dev режиме (tsx watch)
- ✅ Docker и docker-compose для запуска
- ✅ CI/CD через GitHub Actions (автоматическая проверка PR)

## Разработка

### Добавление нового endpoint

1. Создать Zod схему в `be/src/schemas/`
2. Создать сервис в `be/src/services/`
3. Создать маршрут в `be/src/routes/`
4. Зарегистрировать маршрут в `be/src/routes/index.ts`
5. Swagger документация обновится автоматически

### Добавление новой таблицы

1. Создать схему в `be/src/db/schema/`
2. Экспортировать из `be/src/db/schema/index.ts`
3. Создать миграцию: `npm run be:db:generate`
4. Применить миграцию: `npm run be:db:migrate`

## Troubleshooting

### Порт 3000 занят

```bash
# Windows
netstat -ano | findstr :3000
taskkill //F //PID <PID>

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### PostgreSQL не запускается

```bash
# Остановить все контейнеры
npm run docker:down

# Удалить volumes (осторожно, удалит данные!)
cd be && docker-compose down -v

# Запустить заново
npm run docker:db:up
```

### Health check возвращает 503

Убедитесь, что PostgreSQL запущен:
```bash
npm run docker:db:up
```

Проверьте, что в `be/.env` правильный `DB_HOST`:
- Для локального запуска: `DB_HOST=localhost`
- Для Docker режима: `DB_HOST=postgres`

## Задачи

Все задачи находятся в папке `docs/tasks/` в формате `TASK-XXX-описание.md`.

Манифест задач: `docs/tasks/tasks-manifest.json`

## Лицензия

ISC
