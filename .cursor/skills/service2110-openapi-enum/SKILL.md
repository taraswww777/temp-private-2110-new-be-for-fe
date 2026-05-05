---
name: service2110-openapi-enum
description: >-
  LEGACY для текущего контура: enum в Zod и OpenAPI для service2110.
  Применяй только если пользователь явно работает с service2110.
---

# LEGACY: Enum → Swagger (service2110)

В текущем процессе service2110 не используется. Этот skill включать только по явному запросу.

Чтобы enum был валидируемым в Zod **и** в `service2110/docs/swagger/service2110.json` попадали **`x-enum-descriptions`**, **`x-enum-varnames`** и **`oneOf`** (из `createEnumSchemaWithDescriptions`), нужно **три шага**:

1. **Файл enum** (паттерн как в `schemas/report-6406/enums/TaskStatusEnum.ts`; общие не доменные — `schemas/common/SortOrderEnum.ts` и т.п.):
   - `export enum XxxEnum { ... }` со строковыми значениями;
   - мапа описаний `XxxDescriptions` для каждого значения;
   - `export const xxxSchema = z.enum(XxxEnum).describe('...')` — для полей API;
   - `export const XxxEnumSchema = createEnumSchemaWithDescriptions(XxxEnum, XxxDescriptions, 'XxxEnum', '...')` — расширенная JSON Schema для OpenAPI.

2. **Реестр Zod** — `registry.add(xxxSchema, { id: 'XxxEnum' })` (`id` **строго** совпадает с именем компонента в спеке), в зависимости от домена:
   - **report-6406** — `schemas/report-6406/enums/openapi-register.ts` (`registerReport6406EnumsOpenApiSchemas`), вызов из `registerReport6406OpenApiSchemas`;
   - **inventorization** — `schemas/inventorization/enums/openapi-register.ts`, вызов из `registerInventorizationOpenApiSchemas`;
   - **общие** (сортировка и др.) — `schemas/common/openapi-register.ts` (`registerCommonOpenApiSchemas`).

3. **Обогащение Swagger** — в `src/app/plugins/registerFastifySwagger.ts` добавить пару **`XxxEnum: XxxEnumSchema`** в **`swaggerExtendedEnumJsonSchemas`**. Без этого генератор из Zod оставит только `{ type, enum }`, без `x-*` (актуально для **всех** доменов, включая report-6406 и inventorization).
