# TASK-004: Создание Task Viewer приложения

## Статус
✅ Выполнено

## Описание
Создать web-приложение для управления задачами проекта, состоящее из frontend части на React + TypeScript + Tailwind CSS и backend части на Fastify для работы с файловой системой (чтение/запись tasks-manifest.json и .md файлов).

## Цели
1. Создать backend приложение `taskViewerBe` на Fastify для работы с файлами задач
2. Создать frontend приложение `taskViewerFe` на React + TypeScript + Vite + Tailwind CSS
3. Реализовать просмотр списка задач с фильтрацией, поиском и сортировкой
4. Реализовать детальный просмотр задачи с парсингом markdown и навигацией по заголовкам
5. Реализовать редактирование метаданных задач (статус, даты, branch, title)
6. Обеспечить удобный UX для работы с задачами

## Технологический стек

### Backend (taskViewerBe)
- **Runtime**: Node.js >= 20
- **Framework**: Fastify
- **Language**: TypeScript
- **Validation**: Zod
- **File System**: Node.js fs/promises

### Frontend (taskViewerFe)
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Markdown**: react-markdown
- **HTTP Client**: fetch API
- **Routing**: React Router v6

## Структура проекта

```
/
├── taskViewerBe/           # Backend приложение
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts      # Конфигурация окружения
│   │   ├── routes/
│   │   │   ├── index.ts    # Регистрация роутов
│   │   │   └── tasks.ts    # API для задач
│   │   ├── services/
│   │   │   └── tasks.service.ts  # Логика работы с файлами
│   │   ├── schemas/
│   │   │   └── tasks.schema.ts   # Zod схемы валидации
│   │   ├── types/
│   │   │   └── task.types.ts     # TypeScript типы
│   │   ├── app.ts          # Настройка Fastify
│   │   └── server.ts       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── taskViewerFe/           # Frontend приложение
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui компоненты
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskDetail.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskStatusBadge.tsx
│   │   │   ├── TaskEditDialog.tsx
│   │   │   └── MarkdownViewer.tsx
│   │   ├── pages/
│   │   │   ├── TasksListPage.tsx
│   │   │   └── TaskDetailPage.tsx
│   │   ├── hooks/
│   │   │   └── useTasks.ts
│   │   ├── api/
│   │   │   └── tasks.api.ts
│   │   ├── types/
│   │   │   └── task.types.ts
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── components.json    # shadcn/ui конфиг
│   └── README.md
│
└── docs/
    └── tasks/
        ├── tasks-manifest.json  # Источник данных (остается на месте)
        └── *.md                 # Файлы задач (остаются на месте)
```

## Детальное описание

### Часть 1: Backend приложение (taskViewerBe)

#### 1.1. Инициализация проекта

```bash
mkdir taskViewerBe
cd taskViewerBe
npm init -y
```

#### 1.2. Установка зависимостей

```bash
npm i fastify -ED
npm i @fastify/cors -ED
npm i zod -ED
npm i dotenv -ED
npm i typescript -ED
npm i @types/node -ED
npm i tsx -ED
npm i eslint -ED
npm i @eslint/js -ED
npm i typescript-eslint -ED
npm i globals -ED
```

#### 1.3. Конфигурационные файлы

**tsconfig.json**
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
    "sourceMap": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**eslint.config.mjs**
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

**.env.example**
```env
NODE_ENV=development
PORT=3001
HOST=localhost
CORS_ORIGIN=http://localhost:5173

# Путь к папке с задачами (относительно корня проекта)
TASKS_DIR=../docs/tasks
```

**package.json scripts**
```json
{
  "name": "task-viewer-be",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start:dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix"
  }
}
```

#### 1.4. Исходный код Backend

**src/types/task.types.ts**
```typescript
export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'in-progress' | 'completed' | 'cancelled';
  file: string;
  createdDate: string | null;
  completedDate: string | null;
  branch: string | null;
}

export interface TaskManifest {
  tasks: Task[];
}

export interface TaskDetail extends Task {
  content: string; // markdown содержимое
}
```

**src/schemas/tasks.schema.ts**
```typescript
import { z } from 'zod';

export const taskStatusEnum = z.enum(['backlog', 'in-progress', 'completed', 'cancelled']);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusEnum,
  file: z.string(),
  createdDate: z.string().nullable(),
  completedDate: z.string().nullable(),
  branch: z.string().nullable(),
});

export const taskManifestSchema = z.object({
  tasks: z.array(taskSchema),
});

export const updateTaskMetaSchema = z.object({
  title: z.string().optional(),
  status: taskStatusEnum.optional(),
  createdDate: z.string().nullable().optional(),
  completedDate: z.string().nullable().optional(),
  branch: z.string().nullable().optional(),
});

export const taskParamsSchema = z.object({
  id: z.string(),
});

export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type UpdateTaskMetaInput = z.infer<typeof updateTaskMetaSchema>;
```

**src/config/env.ts**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TASKS_DIR: z.string().default('../docs/tasks'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

**src/services/tasks.service.ts**
```typescript
import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { env } from '../config/env.js';
import type { Task, TaskManifest, TaskDetail } from '../types/task.types.js';
import type { UpdateTaskMetaInput } from '../schemas/tasks.schema.js';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const MANIFEST_PATH = join(TASKS_DIR, 'tasks-manifest.json');

export const tasksService = {
  /**
   * Получить все задачи из манифеста
   */
  async getAllTasks(): Promise<Task[]> {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);
    return manifest.tasks;
  },

  /**
   * Получить задачу по ID с содержимым markdown файла
   */
  async getTaskById(id: string): Promise<TaskDetail | null> {
    const tasks = await this.getAllTasks();
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return null;
    }

    const mdPath = join(TASKS_DIR, task.file);
    const content = await readFile(mdPath, 'utf-8');

    return {
      ...task,
      content,
    };
  },

  /**
   * Обновить метаданные задачи
   */
  async updateTaskMeta(id: string, updates: UpdateTaskMetaInput): Promise<Task | null> {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);

    const taskIndex = manifest.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return null;
    }

    // Обновляем только переданные поля
    manifest.tasks[taskIndex] = {
      ...manifest.tasks[taskIndex],
      ...updates,
    };

    // Сохраняем обратно в файл
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

    return manifest.tasks[taskIndex];
  },

  /**
   * Обновить статус в markdown файле (первая строка с эмодзи)
   */
  async updateTaskStatusInMarkdown(taskFile: string, newStatus: string): Promise<void> {
    const mdPath = join(TASKS_DIR, taskFile);
    let content = await readFile(mdPath, 'utf-8');

    // Маппинг статусов на эмодзи
    const statusEmojiMap: Record<string, string> = {
      'backlog': '📋 Бэклог',
      'in-progress': '⏳ В работе',
      'completed': '✅ Выполнено',
      'cancelled': '❌ Отменено',
    };

    const statusLine = statusEmojiMap[newStatus] || newStatus;

    // Заменяем строку со статусом (после ## Статус)
    content = content.replace(
      /(## Статус\n)(.+)/,
      `$1${statusLine}`
    );

    await writeFile(mdPath, content, 'utf-8');
  },
};
```

**src/routes/tasks.ts**
```typescript
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  taskSchema,
  taskParamsSchema,
  updateTaskMetaSchema,
} from '../schemas/tasks.schema.js';
import { tasksService } from '../services/tasks.service.js';

export const tasksRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /api/tasks - получить все задачи
  server.get(
    '/tasks',
    {
      schema: {
        description: 'Получить список всех задач',
        response: {
          200: z.array(taskSchema),
        },
      },
    },
    async (request, reply) => {
      const tasks = await tasksService.getAllTasks();
      return reply.send(tasks);
    }
  );

  // GET /api/tasks/:id - получить задачу с содержимым
  server.get(
    '/tasks/:id',
    {
      schema: {
        description: 'Получить задачу по ID с markdown содержимым',
        params: taskParamsSchema,
        response: {
          200: taskSchema.extend({
            content: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const task = await tasksService.getTaskById(id);

      if (!task) {
        return reply.status(404).send({ message: 'Task not found' });
      }

      return reply.send(task);
    }
  );

  // PATCH /api/tasks/:id - обновить метаданные задачи
  server.patch(
    '/tasks/:id',
    {
      schema: {
        description: 'Обновить метаданные задачи',
        params: taskParamsSchema,
        body: updateTaskMetaSchema,
        response: {
          200: taskSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body;

      const task = await tasksService.updateTaskMeta(id, updates);

      if (!task) {
        return reply.status(404).send({ message: 'Task not found' });
      }

      // Если обновился статус, обновляем также markdown файл
      if (updates.status) {
        await tasksService.updateTaskStatusInMarkdown(task.file, updates.status);
      }

      return reply.send(task);
    }
  );
};
```

**src/routes/index.ts**
```typescript
import type { FastifyPluginAsync } from 'fastify';
import { tasksRoutes } from './tasks.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(tasksRoutes, { prefix: '/api' });
};
```

**src/app.ts**
```typescript
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './config/env.js';
import { routes } from './routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Валидация Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // CORS
  await app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Регистрация маршрутов
  await app.register(routes);

  return app;
}
```

**src/server.ts**
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

    app.log.info(`Task Viewer Backend is running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
```

**README.md для taskViewerBe**
```markdown
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

### GET /api/tasks/:id
Получить задачу по ID с содержимым markdown файла

### PATCH /api/tasks/:id
Обновить метаданные задачи (title, status, dates, branch)

Body:
```json
{
  "title": "Новое название",
  "status": "in-progress",
  "branch": "feature/TASK-XXX"
}
```
```

---

### Часть 2: Frontend приложение (taskViewerFe)

#### 2.1. Инициализация проекта

```bash
npm create vite@latest taskViewerFe -- --template react-ts
cd taskViewerFe
npm install
```

#### 2.2. Установка зависимостей

```bash
# Tailwind CSS
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn@latest init

# Дополнительные библиотеки
npm i react-router-dom -ED
npm i react-markdown -ED
npm i remark-gfm -ED
npm i date-fns -ED
npm i clsx -ED
npm i tailwind-merge -ED
```

#### 2.3. Конфигурация

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
```

**vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
```

**tsconfig.json** (добавить paths)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2.4. Компоненты shadcn/ui для установки

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add alert
```

#### 2.5. Исходный код Frontend

**src/types/task.types.ts**
```typescript
export type TaskStatus = 'backlog' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  file: string;
  createdDate: string | null;
  completedDate: string | null;
  branch: string | null;
}

export interface TaskDetail extends Task {
  content: string;
}

export interface UpdateTaskMetaInput {
  title?: string;
  status?: TaskStatus;
  createdDate?: string | null;
  completedDate?: string | null;
  branch?: string | null;
}
```

**src/api/tasks.api.ts**
```typescript
import type { Task, TaskDetail, UpdateTaskMetaInput } from '@/types/task.types';

const API_BASE_URL = 'http://localhost:3001/api';

export const tasksApi = {
  async getAllTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  async getTaskById(id: string): Promise<TaskDetail> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    return response.json();
  },

  async updateTaskMeta(id: string, updates: UpdateTaskMetaInput): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  },
};
```

**src/hooks/useTasks.ts**
```typescript
import { useState, useEffect } from 'react';
import { tasksApi } from '@/api/tasks.api';
import type { Task } from '@/types/task.types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAllTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, error, refetch: fetchTasks };
}
```

**src/components/TaskStatusBadge.tsx**
```typescript
import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/types/task.types';

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  'backlog': { label: '📋 Бэклог', variant: 'secondary' },
  'in-progress': { label: '⏳ В работе', variant: 'default' },
  'completed': { label: '✅ Выполнено', variant: 'outline' },
  'cancelled': { label: '❌ Отменено', variant: 'destructive' },
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

**src/components/TaskFilters.tsx**
```typescript
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaskStatus } from '@/types/task.types';

interface TaskFiltersProps {
  search: string;
  statusFilter: TaskStatus | 'all';
  sortBy: 'id' | 'createdDate' | 'status';
  sortOrder: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatus | 'all') => void;
  onSortByChange: (value: 'id' | 'createdDate' | 'status') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

export function TaskFilters({
  search,
  statusFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusFilterChange,
  onSortByChange,
  onSortOrderChange,
}: TaskFiltersProps) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <Input
        placeholder="Поиск по названию или ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="backlog">📋 Бэклог</SelectItem>
          <SelectItem value="in-progress">⏳ В работе</SelectItem>
          <SelectItem value="completed">✅ Выполнено</SelectItem>
          <SelectItem value="cancelled">❌ Отменено</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Сортировка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="id">По ID</SelectItem>
          <SelectItem value="createdDate">По дате создания</SelectItem>
          <SelectItem value="status">По статусу</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortOrder} onValueChange={onSortOrderChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">По возрастанию</SelectItem>
          <SelectItem value="desc">По убыванию</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

**src/components/TaskList.tsx**
```typescript
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskFilters } from './TaskFilters';
import { tasksApi } from '@/api/tasks.api';
import type { Task, TaskStatus } from '@/types/task.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'id' | 'createdDate' | 'status'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Фильтрация по поиску
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (task) =>
          task.id.toLowerCase().includes(searchLower) ||
          task.title.toLowerCase().includes(searchLower)
      );
    }

    // Фильтрация по статусу
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'createdDate':
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, search, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateTaskMeta(taskId, { status: newStatus });
      onTaskUpdate();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
  };

  return (
    <div>
      <TaskFilters
        search={search}
        statusFilter={statusFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead>Ветка</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-mono">{task.id}</TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">📋 Бэклог</SelectItem>
                    <SelectItem value="in-progress">⏳ В работе</SelectItem>
                    <SelectItem value="completed">✅ Выполнено</SelectItem>
                    <SelectItem value="cancelled">❌ Отменено</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{formatDate(task.createdDate)}</TableCell>
              <TableCell className="font-mono text-sm">{task.branch || '—'}</TableCell>
              <TableCell>
                <Link to={`/tasks/${task.id}`}>
                  <Button variant="outline" size="sm">
                    Просмотр
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredAndSortedTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Задачи не найдены
        </div>
      )}
    </div>
  );
}
```

**src/components/MarkdownViewer.tsx**
```typescript
import { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface MarkdownViewerProps {
  content: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [activeHeading, setActiveHeading] = useState<string>('');

  // Извлекаем заголовки из markdown для навигации
  const headings = useMemo(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const result: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      result.push({ id, text, level });
    }

    return result;
  }, [content]);

  // Intersection Observer для подсветки активного заголовка
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex gap-6">
      {/* Навигация по заголовкам */}
      {headings.length > 0 && (
        <Card className="w-64 p-4 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h3 className="font-semibold mb-3">Содержание</h3>
          <Separator className="mb-3" />
          <nav className="space-y-1">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${
                  activeHeading === heading.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </Card>
      )}

      {/* Контент markdown */}
      <div className="flex-1 prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children, ...props }) => {
              const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return <h1 id={id} {...props}>{children}</h1>;
            },
            h2: ({ children, ...props }) => {
              const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return <h2 id={id} {...props}>{children}</h2>;
            },
            h3: ({ children, ...props }) => {
              const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return <h3 id={id} {...props}>{children}</h3>;
            },
            h4: ({ children, ...props }) => {
              const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return <h4 id={id} {...props}>{children}</h4>;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
```

**src/components/TaskEditDialog.tsx**
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task, TaskStatus, UpdateTaskMetaInput } from '@/types/task.types';

interface TaskEditDialogProps {
  task: Task;
  onSave: (updates: UpdateTaskMetaInput) => Promise<void>;
}

export function TaskEditDialog({ task, onSave }: TaskEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateTaskMetaInput>({
    title: task.title,
    status: task.status,
    branch: task.branch,
    createdDate: task.createdDate,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setOpen(false);
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Редактировать</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Редактирование задачи {task.id}</DialogTitle>
          <DialogDescription>
            Редактирование метаданных задачи. Изменения сохраняются в tasks-manifest.json
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as TaskStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">📋 Бэклог</SelectItem>
                <SelectItem value="in-progress">⏳ В работе</SelectItem>
                <SelectItem value="completed">✅ Выполнено</SelectItem>
                <SelectItem value="cancelled">❌ Отменено</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="branch">Ветка</Label>
            <Input
              id="branch"
              value={formData.branch || ''}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value || null })}
              placeholder="feature/TASK-XXX"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**src/pages/TasksListPage.tsx**
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';

export function TasksListPage() {
  const { tasks, loading, error, refetch } = useTasks();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Ошибка загрузки задач: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачи проекта</CardTitle>
        <CardDescription>
          Всего задач: {tasks.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TaskList tasks={tasks} onTaskUpdate={refetch} />
      </CardContent>
    </Card>
  );
}
```

**src/pages/TaskDetailPage.tsx**
```typescript
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { TaskStatusBadge } from '@/components/TaskStatusBadge';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { tasksApi } from '@/api/tasks.api';
import type { TaskDetail, UpdateTaskMetaInput } from '@/types/task.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await tasksApi.getTaskById(id);
      setTask(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleSave = async (updates: UpdateTaskMetaInput) => {
    if (!id) return;
    await tasksApi.updateTaskMeta(id, updates);
    await fetchTask();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Ошибка загрузки задачи: {error || 'Задача не найдена'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="outline">← Назад к списку</Button>
        </Link>
        <TaskEditDialog task={task} onSave={handleSave} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{task.title}</CardTitle>
              <CardDescription className="text-lg font-mono">{task.id}</CardDescription>
            </div>
            <TaskStatusBadge status={task.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Дата создания:</span> {formatDate(task.createdDate)}
            </div>
            <div>
              <span className="font-semibold">Дата завершения:</span> {formatDate(task.completedDate)}
            </div>
            <div>
              <span className="font-semibold">Ветка:</span>{' '}
              <code className="text-sm bg-muted px-2 py-1 rounded">{task.branch || '—'}</code>
            </div>
            <div>
              <span className="font-semibold">Файл:</span>{' '}
              <code className="text-sm bg-muted px-2 py-1 rounded">{task.file}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Описание задачи</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownViewer content={task.content} />
        </CardContent>
      </Card>
    </div>
  );
}
```

**src/App.tsx**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TasksListPage } from '@/pages/TasksListPage';
import { TaskDetailPage } from '@/pages/TaskDetailPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Task Viewer</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<TasksListPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

**src/main.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**README.md для taskViewerFe**
```markdown
# Task Viewer Frontend

React приложение для просмотра и управления задачами проекта.

## Установка

```bash
npm install
```

## Запуск

Dev режим:

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Сборка

```bash
npm run build
```

## Функциональность

### Список задач
- Табличное представление всех задач
- Поиск по названию и ID
- Фильтрация по статусу
- Сортировка (по ID, дате создания, статусу)
- Изменение статуса прямо из таблицы

### Детальный просмотр
- Полная информация о задаче
- Красивый рендеринг markdown
- Навигация по заголовкам
- Редактирование метаданных (title, status, branch, dates)

## Технологии
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- react-markdown
```

---

## Топ-10 UI библиотек на Tailwind для React

1. **[shadcn/ui](https://ui.shadcn.com/)** ⭐ Используется в проекте
   - Copy-paste компоненты
   - Radix UI + Tailwind
   - TypeScript first
   - Полный контроль над кодом

2. **[Headless UI](https://headlessui.com/)**
   - От создателей Tailwind CSS
   - Unstyled компоненты
   - Accessibility first
   - Легковесная

3. **[DaisyUI](https://daisyui.com/)**
   - 50+ компонентов
   - 32 темы из коробки
   - Просто классы CSS
   - Без JavaScript

4. **[Flowbite React](https://flowbite-react.com/)**
   - 56+ компонентов
   - TypeScript поддержка
   - Хорошая документация
   - Интеграция с Next.js

5. **[Tremor](https://www.tremor.so/)**
   - Специализация: дашборды и аналитика
   - Встроенные графики
   - Таблицы и метрики
   - Минималистичный дизайн

6. **[NextUI](https://nextui.org/)**
   - Современный дизайн
   - Темная тема из коробки
   - Плавные анимации
   - Автокомплит поиска

7. **[Radix UI + Tailwind](https://www.radix-ui.com/)**
   - Unstyled primitives
   - Максимальная гибкость
   - Accessibility
   - Базис для shadcn/ui

8. **[Catalyst UI](https://tailwindui.com/templates/catalyst)**
   - Premium от Tailwind Labs
   - Application UI Kit
   - Production-ready
   - Высокое качество

9. **[Park UI](https://park-ui.com/)**
   - Ark UI + Tailwind
   - Headless + styled варианты
   - Multi-framework (React, Vue, Solid)
   - TypeScript

10. **[Preline UI](https://preline.co/)**
    - Open source
    - 200+ компонентов
    - HTML + JS + Tailwind
    - Хорошая документация

---

## Критерии приёмки

### Backend (taskViewerBe)
- [ ] Создана структура проекта `taskViewerBe/`
- [ ] Установлены все зависимости
- [ ] Настроены конфигурационные файлы (tsconfig, eslint, .env)
- [ ] Реализован сервис для работы с файлами задач
- [ ] Реализованы API endpoints:
  - [ ] GET /api/tasks - получить все задачи
  - [ ] GET /api/tasks/:id - получить задачу с markdown
  - [ ] PATCH /api/tasks/:id - обновить метаданные
- [ ] Настроен CORS для работы с frontend
- [ ] Backend запускается и отвечает на запросы
- [ ] Обновление статуса также меняет статус в .md файле

### Frontend (taskViewerFe)
- [ ] Создана структура проекта `taskViewerFe/`
- [ ] Установлены все зависимости (React, Vite, Tailwind, shadcn/ui)
- [ ] Настроены конфигурационные файлы (vite, tailwind, tsconfig)
- [ ] Установлены компоненты shadcn/ui
- [ ] Реализован список задач с:
  - [ ] Табличным представлением
  - [ ] Поиском по названию и ID
  - [ ] Фильтрацией по статусу
  - [ ] Сортировкой (ID, дата, статус)
  - [ ] Изменением статуса из таблицы
- [ ] Реализован детальный просмотр с:
  - [ ] Отображением всех метаданных
  - [ ] Парсингом и рендерингом markdown
  - [ ] Навигацией по заголовкам
  - [ ] Подсветкой активного заголовка
- [ ] Реализовано редактирование метаданных через модальное окно
- [ ] Routing работает корректно
- [ ] UI адаптивный и красивый

### Интеграция
- [ ] Frontend успешно получает данные из Backend
- [ ] Изменения в frontend сохраняются в файлы через backend
- [ ] Изменение статуса обновляет как manifest, так и .md файл
- [ ] Нет CORS ошибок

### Документация
- [ ] Создан README.md для `taskViewerBe/`
- [ ] Создан README.md для `taskViewerFe/`
- [ ] Описаны команды для запуска обоих приложений

## Ветка
`feature/TASK-004-create-task-viewer`

## Порядок выполнения

### Этап 1: Backend (taskViewerBe)
1. Создать папку `taskViewerBe/` в корне проекта
2. Инициализировать npm проект и установить зависимости
3. Создать конфигурационные файлы
4. Реализовать типы и схемы валидации
5. Реализовать сервис для работы с файлами
6. Реализовать API endpoints
7. Настроить CORS
8. Протестировать API (через curl или Postman)
9. Создать README.md

### Этап 2: Frontend (taskViewerFe)
10. Создать проект через Vite
11. Установить и настроить Tailwind CSS
12. Инициализировать shadcn/ui и установить нужные компоненты
13. Создать типы и API клиент
14. Реализовать хук useTasks
15. Реализовать компоненты:
    - TaskStatusBadge
    - TaskFilters
    - TaskList
    - MarkdownViewer
    - TaskEditDialog
16. Реализовать страницы:
    - TasksListPage
    - TaskDetailPage
17. Настроить роутинг
18. Протестировать весь функционал
19. Создать README.md

### Этап 3: Финальная проверка
20. Запустить оба приложения одновременно
21. Проверить все функции (просмотр, фильтрация, сортировка, редактирование)
22. Убедиться, что изменения сохраняются в файлы
23. Проверить адаптивность UI
24. Создать коммит: `TASK-004 Создание Task Viewer приложения`

## Уточнения в процессе выполнения

### 1. Интеграция с npm workspaces (Монорепозиторий)

**Проблема**: Проект использует монорепозиторий с несколькими приложениями.

**Решение**: 
- Добавить `taskViewerBe` и `taskViewerFe` в `workspaces` корневого `package.json`
- Добавить скрипты для запуска через npm workspaces:

```json
{
  "workspaces": [
    "be",
    "taskViewerBe",
    "taskViewerFe"
  ],
  "scripts": {
    "viewer:be:dev": "npm run start:dev -w taskViewerBe",
    "viewer:fe:dev": "npm run dev -w taskViewerFe"
  }
}
```

**Команды запуска**:
```bash
# Из корня проекта
npm run viewer:be:dev   # Запуск backend
npm run viewer:fe:dev   # Запуск frontend
```

### 2. Проблема с CORS во время разработки

**Проблема**: При разработке frontend и backend на разных портах возникают CORS-ошибки.

**Решение**: Настроить Vite dev server для проксирования запросов на backend.

**vite.config.ts** (обновленная версия):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

**src/api/tasks.api.ts** (обновленная версия):
```typescript
// Используем относительный путь - Vite dev server проксирует на http://localhost:3001
const API_BASE_URL = '/api';
```

**Преимущества**:
- Нет CORS ошибок в режиме разработки
- Не нужно настраивать CORS на backend для каждого origin
- Проще переход на production (можно использовать тот же относительный путь `/api`)

### 3. Проблема с Tailwind CSS v4

**Проблема**: При установке Tailwind CSS через `npm i -D tailwindcss postcss autoprefixer` может установиться v4, которая имеет breaking changes.

**Ошибки**:
```
[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin
[postcss] Cannot apply unknown utility class border-border
```

**Решение**: Использовать **Tailwind CSS v3.4.17** для стабильности.

```bash
npm i -D tailwindcss@3.4.17 postcss autoprefixer
```

**postcss.config.js** (для v3):
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**tailwind.config.js** (обновленная версия с цветами):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    }
  },
  plugins: [require('@tailwindcss/typography')],
}
```

**Важно**: Обязательно добавить плагин для markdown:
```bash
npm i -D @tailwindcss/typography
```

### 4. Упрощение сортировки в таблице

**Проблема**: Изначально в задании были выпадающие списки для выбора сортировки, что усложняло UI.

**Решение**: Сортировка только по клику на заголовки колонок.

**TaskFilters.tsx** (упрощенная версия):
```typescript
interface TaskFiltersProps {
  search: string;
  statusFilter: TaskStatus | 'all';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatus | 'all') => void;
}
// Убраны пропсы: sortBy, sortOrder, onSortByChange, onSortOrderChange
```

**TaskList.tsx** (обновленная версия):
```typescript
export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'id' | 'createdDate' | 'status'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // По умолчанию в обратном порядке

  // Функция для обработки клика по заголовку колонки
  const handleColumnSort = (column: 'id' | 'createdDate' | 'status') => {
    if (sortBy === column) {
      // Меняем направление если кликнули на уже активную колонку
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Новая колонка - сортируем по возрастанию
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Компонент иконки сортировки
  const SortIcon = ({ column }: { column: 'id' | 'createdDate' | 'status' }) => {
    if (sortBy !== column) {
      return <span className="ml-2 text-muted-foreground">⇅</span>; // Неактивная
    }
    return <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>; // Активная
  };

  return (
    <div>
      <TaskFilters
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30"
                onClick={() => handleColumnSort('id')}
              >
                <div className="flex items-center">
                  ID
                  <SortIcon column="id" />
                </div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Название
              </th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30"
                onClick={() => handleColumnSort('status')}
              >
                <div className="flex items-center">
                  Статус
                  <SortIcon column="status" />
                </div>
              </th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30"
                onClick={() => handleColumnSort('createdDate')}
              >
                <div className="flex items-center">
                  Дата создания
                  <SortIcon column="createdDate" />
                </div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Ветка
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Действия
              </th>
            </tr>
          </thead>
          {/* ... остальной код таблицы ... */}
        </table>
      </div>
    </div>
  );
}
```

**Особенности**:
- **По умолчанию**: сортировка по ID в обратном порядке (`desc`) - новые задачи сверху
- **Кликабельные колонки**: ID, Статус, Дата создания
- **Визуальные индикаторы**:
  - `⇅` - колонка не активна (можно кликнуть для сортировки)
  - `↑` - активная сортировка по возрастанию
  - `↓` - активная сортировка по убыванию
- **Hover эффект**: колонки меняют цвет при наведении (`hover:bg-muted/30`)
- **Поведение**: первый клик сортирует по возрастанию, второй - по убыванию

### 5. Несоответствие схемы данных

**Проблема**: В `tasks-manifest.json` для старых задач отсутствовали поля `createdDate`, `completedDate`, `branch`.

**Ошибка**:
```
FST_ERR_RESPONSE_SERIALIZATION: Response does not match the schema
```

**Решение**: Обновить все записи в `tasks-manifest.json`, добавив недостающие поля с `null`:

```json
{
  "id": "TASK-001",
  "title": "...",
  "status": "completed",
  "file": "...",
  "createdDate": null,
  "completedDate": null,
  "branch": null
}
```

### 6. Документация проекта

**Создан файл**: `docs/TASK-VIEWER.md` с полной документацией приложения, включающей:
- Архитектуру проекта
- Технологический стек
- Инструкции по установке и запуску
- API эндпоинты
- Функциональность frontend
- Конфигурацию Vite proxy
- Структуру файлов
- Команды для работы через npm workspaces

### 7. Git workflow

**Важно**: Все работы проводятся в отдельной ветке `feature/TASK-004-create-task-viewer`.

```bash
# Создание ветки
git checkout -b feature/TASK-004-create-task-viewer

# Коммиты в процессе работы
git add .
git commit -m "Описание изменений"

# После завершения - мерж в main
git checkout main
git merge feature/TASK-004-create-task-viewer
```

### Итоговый список коммитов в feature-ветке:

1. `Инициализация Backend: создание структуры проекта taskViewerBe`
2. `Backend: реализация API endpoints и сервисов для работы с задачами`
3. `Инициализация Frontend: создание проекта taskViewerFe через Vite`
4. `Frontend: настройка Tailwind CSS и структуры проекта`
5. `Frontend: реализация API клиента и базовых компонентов`
6. `Frontend: реализация компонентов списка и фильтрации задач`
7. `Frontend: реализация просмотра задачи и markdown viewer`
8. `Frontend: реализация редактирования метаданных задачи`
9. `Frontend: настройка роутинга и страниц приложения`
10. `Интеграция: добавление workspaces и скриптов запуска в корневой package.json`
11. `Документация: создание TASK-VIEWER.md с полным описанием`
12. `Fix: обновление tasks-manifest.json для совместимости со схемой`
13. `Исправление Tailwind CSS: установка @tailwindcss/postcss`
14. `Откат на Tailwind CSS v3 для стабильности и совместимости`
15. `Настройка Vite proxy для избавления от CORS`
16. `Обновление документации: добавлена информация о Vite proxy`
17. `Добавлена сортировка по клику на заголовки колонок таблицы`
18. `Упрощение сортировки: только клики по колонкам, по умолчанию desc по ID`
