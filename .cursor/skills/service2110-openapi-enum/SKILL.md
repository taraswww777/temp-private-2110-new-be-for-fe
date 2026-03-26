---
name: service2110-openapi-enum
description: >-
  Добавляет enum в Zod и OpenAPI для service2110: TaskStatusEnum-паттерн, createEnumSchemaWithDescriptions,
  registry.add в openapi-register.ts, пара в swaggerExtendedEnumJsonSchemas в registerFastifySwagger.ts.
  Используй при новых enum в API, при отсутствии x-enum-descriptions в service2110.json, при работе с
  inventorization enums или упоминании swaggerExtendedEnumJsonSchemas.
---

# Enum → Swagger (service2110)

Чтобы enum был валидируемым в Zod **и** в `service2110/docs/swagger/service2110.json` попадали **`x-enum-descriptions`**, **`x-enum-varnames`** и **`oneOf`** (из `createEnumSchemaWithDescriptions`), нужно **три шага**:

1. **Файл enum** (паттерн как в `schemas/enums/TaskStatusEnum.ts`):
   - `export enum XxxEnum { ... }` со строковыми значениями;
   - мапа описаний `XxxDescriptions` для каждого значения;
   - `export const xxxSchema = z.enum(XxxEnum).describe('...')` — для полей API;
   - `export const XxxEnumSchema = createEnumSchemaWithDescriptions(XxxEnum, XxxDescriptions, 'XxxEnum', '...')` — расширенная JSON Schema для OpenAPI.

2. **Реестр Zod** — `registry.add(xxxSchema, { id: 'XxxEnum' })` в соответствующем `**/openapi-register.ts` (`id` **строго** совпадает с именем компонента в спеке).

3. **Обогащение Swagger** — в `src/app/plugins/registerFastifySwagger.ts` добавить пару **`XxxEnum: XxxEnumSchema`** в объект **`swaggerExtendedEnumJsonSchemas`**. Без этого шага генератор из Zod оставит только `{ type, enum }`, без `x-*`.

Дополнительно: enum подсистемы **inventorization** регистрируются в `schemas/inventorization/enums/openapi-register.ts` и вызываются из `registerInventorizationOpenApiSchemas`, но **п.3 всё равно обязателен** для расширений в файле спеки.
