# TASK-007: Quick Start Guide

## Быстрый старт для разработчика

### 📋 Краткое описание

Рефакторинг API для формы 6406:
- Упрощение структуры данных (убрать обертки)
- Объединение дублирующих endpoints
- Улучшение консистентности
- Обновление до OpenAPI 3.1

### 🎯 Ключевые изменения

#### Breaking Changes (требуют обновления frontend)

```diff
# 1. Reference endpoints
- GET /references/branches → { branches: [...] }
+ GET /references/branches → [...]

# 2. DELETE tasks
- DELETE /tasks/{id}
- POST /tasks/bulk-delete
+ DELETE /tasks (body: { taskIds: [...] })

# 3. CANCEL tasks
- POST /tasks/{id}/cancel
- POST /tasks/bulk-cancel
+ POST /tasks/cancel (body: { taskIds: [...] })

# 4. DELETE packages
- DELETE /packages/{id}
- POST /packages/bulk-delete
+ DELETE /packages (body: { packageIds: [...] })

# 5. Trailing slash
- POST /tasks/
- GET /tasks/
+ POST /tasks
+ GET /tasks

# 6. Status history
- GET /tasks/{id}/status-history → { history: [...], pagination: {...} }
+ GET /tasks/{id}/status-history → [...]
```

#### Non-Breaking (дополнения)

```diff
# Фильтрация для tasks
+ GET /tasks?branchIds=1,2&statuses=created,started&...

# Pagination для files
+ GET /tasks/{id}/files?page=0&limit=20

# Схемы
+ status-history response schema
+ export request schema

# OpenAPI 3.1
+ openapi: 3.1.0
+ version: 2.0.0
```

### 🚀 План реализации (4 этапа)

```
Этап 1: Breaking Changes (1-2 дня)
├── Reference endpoints (5 шт)
├── DELETE объединение (3 группы)
├── CANCEL объединение
└── Trailing slash

Этап 2: Дополнения (1 день)
├── Схемы (status-history, export)
├── Фильтрация GET /tasks
└── Pagination для files

Этап 3: Качество (0.5 дня)
├── Pagination параметры
├── HTTP статусы
└── Документация

Этап 4: OpenAPI 3.1 (0.5-1 день)
├── Обновление зависимостей
├── Миграция схем (nullable → anyOf)
└── Тестирование
```

### 💻 Начало работы

```bash
# 1. Создать ветку
git checkout -b feature/TASK-007-refactor-api

# 2. Обновить зависимости (для OpenAPI 3.1)
npm install @fastify/swagger@^9.0.0 @fastify/swagger-ui@^5.0.0

# 3. Начать с Этапа 1 - Reference endpoints
# Файлы для изменения:
# - service2110/src/routes/report-6406/references.ts
# - service2110/src/schemas/report-6406/references.schema.ts
```

### 📝 Пример изменения

**Reference endpoint (Этап 1)**

```typescript
// Было
fastify.get('/branches', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          branches: {
            type: 'array',
            items: BranchSchema
          }
        }
      }
    }
  }
}, async (request, reply) => {
  const branches = await getBranches();
  return { branches };  // ← обертка
});

// Стало
fastify.get('/branches', {
  schema: {
    response: {
      200: {
        type: 'array',  // ← прямой массив
        items: BranchSchema
      }
    }
  }
}, async (request, reply) => {
  const branches = await getBranches();
  return branches;  // ← без обертки
});
```

**DELETE endpoint (Этап 1)**

```typescript
// Было (2 endpoint)
fastify.delete('/:id', ...);
fastify.post('/bulk-delete', ...);

// Стало (1 endpoint)
fastify.delete('/', {
  schema: {
    body: {
      type: 'object',
      properties: {
        taskIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          minItems: 1
        }
      },
      required: ['taskIds']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          deleted: { type: 'integer', minimum: 0 },
          failed: { type: 'integer', minimum: 0 },
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                taskId: { type: 'string', format: 'uuid' },
                success: { type: 'boolean' },
                reason: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
}, async (request, reply) => {
  const { taskIds } = request.body;
  
  const results = await Promise.allSettled(
    taskIds.map(id => deleteTask(id))
  );
  
  const deleted = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  return {
    deleted,
    failed,
    results: taskIds.map((taskId, index) => ({
      taskId,
      success: results[index].status === 'fulfilled',
      reason: results[index].status === 'rejected' 
        ? results[index].reason 
        : undefined
    }))
  };
});
```

**OpenAPI 3.1 nullable (Этап 4)**

```typescript
// Было (OpenAPI 3.0)
const schema = {
  type: 'string',
  nullable: true  // ← старый способ
};

// Стало (OpenAPI 3.1)
const schema = {
  anyOf: [
    { type: 'string' },
    { type: 'null' }
  ]
};

// Или короче:
const schema = {
  type: ['string', 'null']
};
```

### ✅ Checklist для каждого endpoint

- [ ] Изменил route
- [ ] Обновил schema
- [ ] Обновил handler
- [ ] Написал unit test
- [ ] Проверил swagger UI
- [ ] Обновил документацию

### 🧪 Тестирование

```typescript
// Unit test пример
describe('GET /references/branches', () => {
  it('should return array directly', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/report-6406/references/branches'
    });
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.json())).toBe(true);  // ← прямой массив
    expect(response.json()[0]).toHaveProperty('id');
    expect(response.json()[0]).toHaveProperty('code');
    expect(response.json()[0]).toHaveProperty('name');
  });
});

describe('DELETE /tasks', () => {
  it('should delete multiple tasks', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/report-6406/tasks',
      payload: {
        taskIds: ['uuid1', 'uuid2']
      }
    });
    
    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('deleted');
    expect(response.json()).toHaveProperty('failed');
    expect(response.json()).toHaveProperty('results');
  });
});
```

### 📚 Полезные команды

```bash
# Запуск dev сервера
npm run dev

# Запуск тестов
npm test

# Проверка типов
npm run type-check

# Линтер
npm run lint

# Генерация swagger
npm run swagger:generate

# Проверка swagger UI
# → http://localhost:3000/documentation

# Валидация OpenAPI 3.1
npx @apidevtools/swagger-cli validate docs/swagger/swagger.json
```

### 🔗 Ссылки на полную документацию

- [TASK-007-refactor-api-structure.md](./TASK-007-refactor-api-structure.md) - Полное описание
- [TASK-007-DECISIONS.md](./TASK-007-DECISIONS.md) - Принятые решения
- [OpenAPI 3.1 Spec](https://spec.openapis.org/oas/v3.1.0)

### ⚠️ Важные моменты

1. **Breaking Changes** - требуют координации с frontend
2. **Миграция** - предпочтительна постепенная (deprecated endpoints)
3. **Тестирование** - обязательно regression tests
4. **Документация** - обновить CHANGELOG.md и migration guide
5. **OpenAPI 3.1** - проверить совместимость инструментов

### 🤝 Координация с командой

1. Уведомить frontend о breaking changes
2. Согласовать timeline миграции
3. Подготовить migration guide
4. Провести demo после Этапа 1
5. Собрать feedback после stage deploy

---

**Вопросы?** Смотри полную документацию в TASK-007-refactor-api-structure.md

**Статус:** Ready for Development  
**Приоритет:** Высокий  
**Оценка:** 3-4 дня
