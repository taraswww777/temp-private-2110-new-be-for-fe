# TASK-006: Исправление отображения схем в Swagger документации

## Статус
- **Статус**: in-progress
- **Приоритет**: high
- **Ответственный**: N/A
- **Дата создания**: 2026-01-28

## Описание проблемы

При открытии Swagger документации по адресу `http://localhost:3000/docs` и попытке просмотра схем, которые возвращаются или ожидаются на входе, отображается просто пустой объект `{}`.

Также в конце страницы Swagger отсутствует секция "Schemas" с перечислением всех используемых схем в API.

### Причина

При использовании `fastify-type-provider-zod` Zod схемы напрямую не понимаются Swagger. Необходимо преобразовывать Zod схемы в JSON Schema формат, который может обработать `@fastify/swagger`.

## Технические детали

### Текущая конфигурация

```typescript:111:115:service2110/src/app.ts
transform: ({ schema, url }) => {
  // Преобразование Zod схем в JSON Schema для Swagger
  return { schema, url };
},
```

Функция `transform` в настоящее время не выполняет фактического преобразования.

### Требуемые изменения

1. **Установить пакет `zod-to-json-schema`** для преобразования Zod схем в JSON Schema
2. **Обновить функцию transform** для корректного преобразования схем
3. **Протестировать** отображение схем в Swagger UI

## План реализации

### Шаг 1: Установка зависимостей

```bash
cd service2110
npm install zod-to-json-schema
npm install -D @types/zod-to-json-schema
```

### Шаг 2: Обновление конфигурации Swagger

Обновить файл `service2110/src/app.ts`:

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';

// ... существующий код ...

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Backend API',
      description: 'API документация для Backend проекта на Fastify + TypeScript + PostgreSQL',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Report 6406 - References', description: 'Справочники для формы отчётности 6406' },
      { name: 'Report 6406 - Tasks', description: 'Задания на построение отчётов для формы 6406' },
      { name: 'Report 6406 - Packages', description: 'Пакеты заданий для формы 6406' },
      { name: 'Report 6406 - Storage', description: 'Мониторинг хранилища отчётов' },
    ],
  },
  transform: ({ schema, url }) => {
    const transformed = {
      schema: {},
      url,
    };

    // Преобразуем каждое поле схемы из Zod в JSON Schema
    if (schema?.body) {
      transformed.schema.body = zodToJsonSchema(schema.body, {
        target: 'openApi3',
        $refStrategy: 'none',
      });
    }

    if (schema?.querystring) {
      transformed.schema.querystring = zodToJsonSchema(schema.querystring, {
        target: 'openApi3',
        $refStrategy: 'none',
      });
    }

    if (schema?.params) {
      transformed.schema.params = zodToJsonSchema(schema.params, {
        target: 'openApi3',
        $refStrategy: 'none',
      });
    }

    if (schema?.headers) {
      transformed.schema.headers = zodToJsonSchema(schema.headers, {
        target: 'openApi3',
        $refStrategy: 'none',
      });
    }

    if (schema?.response) {
      transformed.schema.response = {};
      for (const [statusCode, responseSchema] of Object.entries(schema.response)) {
        if (typeof responseSchema === 'object' && 'parse' in responseSchema) {
          // Это Zod схема
          transformed.schema.response[statusCode] = zodToJsonSchema(responseSchema, {
            target: 'openApi3',
            $refStrategy: 'none',
          });
        } else {
          // Оставляем как есть для обычных JSON Schema
          transformed.schema.response[statusCode] = responseSchema;
        }
      }
    }

    // Копируем остальные поля схемы
    if (schema?.tags) transformed.schema.tags = schema.tags;
    if (schema?.summary) transformed.schema.summary = schema.summary;
    if (schema?.description) transformed.schema.description = schema.description;
    if (schema?.deprecated) transformed.schema.deprecated = schema.deprecated;
    if (schema?.security) transformed.schema.security = schema.security;

    return transformed;
  },
});
```

### Шаг 3: Тестирование

1. Запустить сервер:
   ```bash
   cd service2110
   npm run start:dev
   ```

2. Открыть Swagger UI: `http://localhost:3000/docs`

3. Проверить:
   - Отображаются ли схемы в запросах (body, query parameters)
   - Отображаются ли схемы в ответах (response schemas)
   - Присутствует ли секция "Schemas" в конце страницы
   - Корректно ли отображаются типы данных (string, number, array, object и т.д.)
   - Корректно ли отображаются валидации (required fields, min/max, patterns)

4. Проверить несколько эндпоинтов:
   - `POST /api/v1/report-6406/tasks` - создание задания
   - `GET /api/v1/report-6406/tasks` - получение списка с query параметрами
   - `GET /api/v1/report-6406/tasks/:id` - получение детальной информации
   - `POST /api/v1/report-6406/tasks/start` - запуск заданий

## Ожидаемый результат

После реализации:
- В Swagger UI корректно отображаются все схемы запросов и ответов
- В секции "Schemas" (внизу страницы) перечислены все используемые схемы
- Видны типы полей, их обязательность, валидации
- Понятна структура запросов и ответов для каждого эндпоинта

## Альтернативные решения

### Вариант 1: Использование `@anatine/zod-openapi`
Пакет `@anatine/zod-openapi` предоставляет более продвинутую интеграцию Zod с OpenAPI, включая поддержку описаний, примеров и других метаданных.

### Вариант 2: Ручное определение JSON Schema
Можно вручную определить JSON Schema для каждой схемы, но это приведёт к дублированию кода и усложнит поддержку.

## Зависимости

- Нет зависимостей от других задач

## Риски

- **Низкий риск**: Изменения затрагивают только конфигурацию Swagger, не влияют на бизнес-логику
- Возможны проблемы с преобразованием сложных Zod схем (refine, transform)

## Чеклист

- [ ] Установлен пакет `zod-to-json-schema`
- [ ] Обновлена функция `transform` в `app.ts`
- [ ] Сервер запускается без ошибок
- [ ] В Swagger UI отображаются схемы запросов
- [ ] В Swagger UI отображаются схемы ответов
- [ ] Присутствует секция "Schemas" в конце страницы
- [ ] Протестированы все группы эндпоинтов (Tasks, Packages, References, Storage)
- [ ] Обновлён `swagger.json`

## Ссылки

- [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema)
- [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod)
- [@fastify/swagger](https://github.com/fastify/fastify-swagger)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
