# TASK-002: Инициализация Backend проекта на Fastify

## Статус
📋 Бэклог

## Описание
Инициализировать Backend проект на стеке Fastify + TypeScript + PostgreSQL + Drizzle ORM с поддержкой Docker, автогенерацией Swagger документации и полным набором инструментов для разработки.

## Цели
1. Создать структуру Backend проекта в папке `/be`
2. Настроить TypeScript, ESLint и все необходимые зависимости
3. Настроить Docker и docker-compose для запуска приложения и PostgreSQL
4. Настроить Drizzle ORM для работы с PostgreSQL и миграциями
5. Интегрировать Swagger с автогенерацией из Zod схем
6. Создать примеры CRUD endpoints
7. Настроить команды для запуска в dev и production режимах

## Технологический стек
- **Runtime**: Node.js >= 20
- **Package Manager**: npm
- **Framework**: Fastify
- **Language**: TypeScript
- **Validation**: Zod
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **API Documentation**: Swagger (@fastify/swagger, @fastify/swagger-ui, fastify-type-provider-zod)
- **Linter**: ESLint
- **Containerization**: Docker, docker-compose

## Структура проекта

```
/be
  /src
    /db
      /schema        # Drizzle схемы таблиц
      /migrations    # SQL миграции (генерируются автоматически)
      index.ts       # Настройка подключения к БД
    /routes          # Fastify маршруты
      index.ts       # Регистрация всех маршрутов
      example.ts     # Пример CRUD endpoints
    /services        # Бизнес-логика
      example.service.ts  # Пример сервиса
    /schemas         # Zod схемы для валидации API
      example.schema.ts   # Пример схем
    /config          # Конфигурация приложения
      env.ts         # Валидация переменных окружения через Zod
    /types           # TypeScript типы
      index.ts       # Общие типы
    app.ts           # Настройка Fastify приложения (плагины, swagger)
    server.ts        # Entry point (запуск сервера)
  /docs
    /swagger         # Сгенерированная Swagger документация
      swagger.json   # JSON спецификация (генерируется автоматически)
  drizzle.config.ts  # Конфигурация Drizzle ORM
  tsconfig.json      # Конфигурация TypeScript
  eslint.config.mjs  # Конфигурация ESLint
  package.json       # Зависимости и скрипты
  .env.example       # Пример переменных окружения
  .env               # Локальные переменные окружения (не в git)
  Dockerfile         # Docker образ для приложения
  docker-compose.yml # Оркестрация контейнеров (app + postgres)
  README.md          # Документация по запуску
```

## Детальное описание

### 1. Инициализация проекта

#### 1.1. Создать структуру папок
```bash
mkdir -p be/src/{db/{schema,migrations},routes,services,schemas,config,types}
mkdir -p be/docs/swagger
```

#### 1.2. Инициализировать package.json
```bash
cd be
npm init -y
```

#### 1.3. Установить зависимости

**Production зависимости** (все как devDependencies с флагом -ED):
```bash
npm i fastify -ED
npm i @fastify/swagger -ED
npm i @fastify/swagger-ui -ED
npm i fastify-type-provider-zod -ED
npm i zod -ED
npm i drizzle-orm -ED
npm i postgres -ED
npm i dotenv -ED
```

**Development зависимости**:
```bash
npm i typescript -ED
npm i @types/node -ED
npm i tsx -ED
npm i drizzle-kit -ED
npm i eslint -ED
npm i @eslint/js -ED
npm i typescript-eslint -ED
npm i globals -ED
```

### 2. Конфигурационные файлы

#### 2.1. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 2.2. eslint.config.mjs
Базируется на примере из https://github.com/taraswww777/pet-protected-notes/blob/master/be/eslint.config.mjs

```javascript
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

const eslintConfig = [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['./src/**/*.{js,mjs,cjs,ts}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 0,
      'no-unused-vars': 0,
    },
    ignores: ['dist', 'node_modules'],
  },
];

export default eslintConfig;
```

#### 2.3. drizzle.config.ts
```typescript
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'app_db',
  },
});
```

#### 2.4. .env.example
```env
# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=app_db
```

#### 2.5. Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
```

#### 2.6. docker-compose.yml
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: be_postgres
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-app_db}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: be_app
    ports:
      - "${PORT:-3000}:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 3000
      HOST: 0.0.0.0
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-postgres}
      DB_NAME: ${DB_NAME:-app_db}
    volumes:
      - ./src:/app/src
      - ./docs:/app/docs
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run start:dev

volumes:
  postgres_data:
```

### 3. Исходный код

#### 3.1. src/config/env.ts
Валидация переменных окружения через Zod
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('app_db'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

#### 3.2. src/db/index.ts
Подключение к PostgreSQL через Drizzle
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env.js';
import * as schema from './schema/index.js';

const connectionString = `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

export const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

#### 3.3. src/db/schema/index.ts
Пример схемы таблицы для CRUD
```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
```

#### 3.4. src/schemas/example.schema.ts
Zod схемы для валидации API
```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export const itemParamsSchema = z.object({
  id: z.string().transform(Number),
});

export const itemResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;
```

#### 3.5. src/services/example.service.ts
Сервис с бизнес-логикой (пока моки)
```typescript
import type { CreateItemInput, UpdateItemInput } from '../schemas/example.schema.js';
import type { Item } from '../db/schema/index.js';

// Временное хранилище (моки)
let items: Item[] = [];
let idCounter = 1;

export const exampleService = {
  async getAll(): Promise<Item[]> {
    return items;
  },

  async getById(id: number): Promise<Item | null> {
    return items.find((item) => item.id === id) || null;
  },

  async create(data: CreateItemInput): Promise<Item> {
    const newItem: Item = {
      id: idCounter++,
      title: data.title,
      description: data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    items.push(newItem);
    return newItem;
  },

  async update(id: number, data: UpdateItemInput): Promise<Item | null> {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date(),
    };
    return items[index];
  },

  async delete(id: number): Promise<boolean> {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    items.splice(index, 1);
    return true;
  },
};
```

#### 3.6. src/routes/example.ts
CRUD маршруты с Zod валидацией
```typescript
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createItemSchema,
  updateItemSchema,
  itemParamsSchema,
  itemResponseSchema,
} from '../schemas/example.schema.js';
import { exampleService } from '../services/example.service.js';

export const exampleRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /api/items - получить все элементы
  server.get(
    '/items',
    {
      schema: {
        tags: ['Items'],
        description: 'Получить список всех элементов',
        response: {
          200: z.array(itemResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const items = await exampleService.getAll();
      return reply.send(items);
    }
  );

  // GET /api/items/:id - получить элемент по ID
  server.get(
    '/items/:id',
    {
      schema: {
        tags: ['Items'],
        description: 'Получить элемент по ID',
        params: itemParamsSchema,
        response: {
          200: itemResponseSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const item = await exampleService.getById(id);

      if (!item) {
        return reply.status(404).send({ message: 'Item not found' });
      }

      return reply.send(item);
    }
  );

  // POST /api/items - создать новый элемент
  server.post(
    '/items',
    {
      schema: {
        tags: ['Items'],
        description: 'Создать новый элемент',
        body: createItemSchema,
        response: {
          201: itemResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const item = await exampleService.create(request.body);
      return reply.status(201).send(item);
    }
  );

  // PATCH /api/items/:id - обновить элемент
  server.patch(
    '/items/:id',
    {
      schema: {
        tags: ['Items'],
        description: 'Обновить элемент',
        params: itemParamsSchema,
        body: updateItemSchema,
        response: {
          200: itemResponseSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const item = await exampleService.update(id, request.body);

      if (!item) {
        return reply.status(404).send({ message: 'Item not found' });
      }

      return reply.send(item);
    }
  );

  // DELETE /api/items/:id - удалить элемент
  server.delete(
    '/items/:id',
    {
      schema: {
        tags: ['Items'],
        description: 'Удалить элемент',
        params: itemParamsSchema,
        response: {
          204: z.void(),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await exampleService.delete(id);

      if (!deleted) {
        return reply.status(404).send({ message: 'Item not found' });
      }

      return reply.status(204).send();
    }
  );
};
```

#### 3.7. src/routes/index.ts
Регистрация всех маршрутов
```typescript
import type { FastifyPluginAsync } from 'fastify';
import { exampleRoutes } from './example.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(exampleRoutes, { prefix: '/api' });
};
```

#### 3.8. src/app.ts
Настройка Fastify приложения
```typescript
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { env } from './config/env.js';
import { routes } from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Установка валидаторов Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Swagger плагин
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Backend API',
        description: 'API документация для Backend проекта',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Items', description: 'Items endpoints' },
      ],
    },
    transform: ({ schema, url }) => {
      // Преобразование Zod схем в JSON Schema для Swagger
      return { schema, url };
    },
  });

  // Swagger UI
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });

  // Регистрация маршрутов
  await app.register(routes);

  // Хук для сохранения swagger.json после старта
  app.addHook('onReady', async () => {
    const swaggerJson = app.swagger();
    const swaggerPath = join(process.cwd(), 'docs', 'swagger', 'swagger.json');
    writeFileSync(swaggerPath, JSON.stringify(swaggerJson, null, 2));
    app.log.info(`Swagger JSON saved to ${swaggerPath}`);
  });

  return app;
}
```

#### 3.9. src/server.ts
Entry point
```typescript
import 'dotenv/config';
import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`Server is running at http://${env.HOST}:${env.PORT}`);
    app.log.info(`Swagger documentation available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
```

### 4. package.json скрипты

```json
{
  "name": "be",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "docker-compose up --build",
    "start:dev": "tsx watch src/server.ts",
    "build": "tsc",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 5. README.md для /be

```markdown
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

2. Установить зависимости:
```bash
npm install
```

## Запуск

### Запуск через Docker (рекомендуется)

Запуск приложения и PostgreSQL в Docker контейнерах:

```bash
npm run start
```

Приложение будет доступно по адресу: http://localhost:3000

Swagger документация: http://localhost:3000/docs

### Запуск в режиме разработки (локально)

1. Запустить только PostgreSQL:
```bash
docker-compose up postgres -d
```

2. Применить миграции:
```bash
npm run db:push
```

3. Запустить приложение:
```bash
npm run start:dev
```

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

### GET /api/items
Получить все элементы

### GET /api/items/:id
Получить элемент по ID

### POST /api/items
Создать новый элемент

Body:
```json
{
  "title": "Example",
  "description": "Optional description"
}
```

### PATCH /api/items/:id
Обновить элемент

Body:
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

### DELETE /api/items/:id
Удалить элемент

## Переменные окружения

См. `.env.example` для списка всех доступных переменных.

Основные:
- `PORT` - порт приложения (по умолчанию 3000)
- `DB_HOST` - хост PostgreSQL (по умолчанию postgres)
- `DB_PORT` - порт PostgreSQL (по умолчанию 5432)
- `DB_USER` - пользователь БД (по умолчанию postgres)
- `DB_PASSWORD` - пароль БД (по умолчанию postgres)
- `DB_NAME` - имя БД (по умолчанию app_db)
```

## Критерии приёмки

- [ ] Создана структура папок в `/be` согласно спецификации
- [ ] Установлены все необходимые npm зависимости
- [ ] Настроен TypeScript (tsconfig.json)
- [ ] Настроен ESLint (eslint.config.mjs)
- [ ] Настроен Drizzle ORM (drizzle.config.ts)
- [ ] Созданы конфигурационные файлы (.env.example, Dockerfile, docker-compose.yml)
- [ ] Реализовано подключение к PostgreSQL через Drizzle
- [ ] Создана примерная схема таблицы `items`
- [ ] Реализована валидация переменных окружения через Zod
- [ ] Настроен Fastify с интеграцией Swagger + Zod
- [ ] Реализованы примеры CRUD endpoints (/api/items)
- [ ] Swagger документация доступна по `/docs` (HTML)
- [ ] Swagger JSON автоматически сохраняется в `docs/swagger/swagger.json`
- [ ] Команда `npm run start` запускает приложение через Docker
- [ ] Команда `npm run start:dev` запускает приложение в dev режиме с hot-reload
- [ ] Добавлены команды для работы с миграциями (db:generate, db:migrate, db:push, db:studio)
- [ ] Создан README.md с документацией по запуску и использованию
- [ ] Приложение успешно запускается и отвечает на HTTP запросы
- [ ] Все endpoints корректно отображаются в Swagger документации

## Ветка
`feature/TASK-002-init-be-project`

## Порядок выполнения

1. Создать ветку `feature/TASK-002-init-be-project` от `main`
2. Создать структуру папок проекта
3. Инициализировать npm проект и установить зависимости
4. Создать конфигурационные файлы (tsconfig, eslint, drizzle, docker)
5. Реализовать базовую структуру приложения (config, db, schemas)
6. Реализовать пример CRUD endpoints
7. Настроить Swagger интеграцию
8. Создать README.md с документацией
9. Протестировать запуск через Docker
10. Протестировать запуск в dev режиме
11. Проверить работу всех endpoints через Swagger UI
12. Проверить генерацию swagger.json
13. Создать коммит с сообщением: `TASK-002 Инициализация Backend проекта на Fastify`
14. Обновить статус задачи на "Выполнено" в манифесте

## Ссылки

- Пример проекта: https://github.com/taraswww777/pet-protected-notes
- ESLint конфиг: https://github.com/taraswww777/pet-protected-notes/blob/master/be/eslint.config.mjs
- Fastify документация: https://fastify.dev/
- Drizzle ORM: https://orm.drizzle.team/
- Zod: https://zod.dev/
- fastify-type-provider-zod: https://github.com/turkerdev/fastify-type-provider-zod

## Вопросы требующие уточнения перед началом работы

### 1. Swagger JSON путь
- В задании указано сохранение в `docs/swagger/swagger.json`
- Нужно ли также сохранять `swagger.yaml` или только JSON?

### 2. Логирование
- Какой формат логов предпочтителен: JSON или pretty-print?
- Нужно ли логирование запросов/ответов в dev режиме?

### 3. CORS
- Нужно ли настраивать CORS для работы с фронтендом?
- Если да, какие origins разрешены?

### 4. Graceful Shutdown
- Нужно ли реализовать graceful shutdown при остановке приложения?

### 5. Health Check Endpoint
- Нужен ли endpoint `/health` или `/healthz` для проверки состояния приложения?
- Должен ли он проверять подключение к БД?

### 6. Версионирование API
- Нужно ли версионирование API (например, `/api/v1/items`)?

### 7. Обработка ошибок
- Нужен ли глобальный обработчик ошибок с единым форматом ответа?
- Какой формат ошибок использовать (RFC 7807 Problem Details, custom)?

## Уточнения в процессе выполнения

### Технические решения
- Используется `postgres` драйвер вместо `pg` для лучшей интеграции с Drizzle
- `fastify-type-provider-zod` обеспечивает автоматическую типизацию из Zod схем
- Swagger JSON сохраняется автоматически при старте приложения через хук `onReady`
- В примере CRUD используются моки в памяти для демонстрации структуры API
- Docker compose настроен с healthcheck для PostgreSQL для корректного запуска приложения

### Структура
- Все импорты используют расширение `.js` для совместимости с ES модулями
- Используется `type: "module"` в package.json для поддержки ES модулей
- Схемы БД экспортируются через `index.ts` для удобства импорта

### Исправления кода
- Добавлен импорт `z` из `zod` в `src/routes/example.ts` для использования `z.array()` и `z.object()` в схемах маршрутов
