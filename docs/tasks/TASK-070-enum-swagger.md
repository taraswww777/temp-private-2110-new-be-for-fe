# TASK-070: Исправление enum в Swagger

**Статус**: ⏳ В работе
**Ветка**: `feature/task-070-enum-swagger` (при необходимости)  
**Приоритет**: средний  

---


## Краткое описание

В Swagger-спецификации enum дублируются inline вместо переиспользования через `$ref`. Нужно зарегистрировать `ReportTypeEnumSchema`, убрать неиспользуемый `ReportFormTypeEnum` и вынести повторяющиеся inline enum в переиспользуемые схемы.

---

## Контекст

- В API используется `reportType` (LSOZ, LSOS, LSOP, KROS_VOS, KROS_VZS, KROS) — это `ReportTypeEnum`.
- В `openapi-components.ts` зарегистрирован `ReportFormTypeEnum` (N3462D, KROS, N6406D), который нигде не используется.
- `ReportTypeEnumSchema` не добавлен в компоненты, поэтому `replaceNestedSchemas` не может заменить inline enum на `$ref`.
- В `zodToJsonSchema` используется `$refStrategy: 'none'`, из‑за чего все enum разворачиваются inline.
- Дополнительно: enum статуса конвертации файла (PENDING, CONVERTING, COMPLETED, FAILED) и статуса пакета (pack_create, pack_transfer и т.д.) повторяются в нескольких DTO.

---

## Цели

- [ ] Добавить `ReportTypeEnumSchema` в `openapi-components.ts` и в список `enumTypes` в `app.ts`
- [ ] Удалить или заменить неиспользуемый `ReportFormTypeEnum` в компонентах
- [ ] Вынести в переиспользуемые схемы inline enum: статус конвертации файла, статус пакета (если ещё дублируются)
- [ ] Проверить, что в итоговом `service2110.json` enum переиспользуются через `$ref`

---

## Критерии приёмки

- [ ] В `service2110.json` поле `reportType` во всех DTO ссылается на `#/components/schemas/ReportTypeEnumSchema` (или аналогичное имя)
- [ ] `ReportFormTypeEnum` либо удалён из компонентов, либо используется там, где это нужно по доменной модели
- [ ] Нет дублирования одинаковых enum (reportType, статус конвертации, статус пакета) в нескольких местах
- [ ] Swagger UI корректно отображает enum и их описания

---

## Технические заметки

**Файлы для изменения:**
- `service2110/src/schemas/openapi-components.ts` — добавить `ReportTypeEnumSchema`, убрать/заменить `ReportFormTypeEnum`
- `service2110/src/app.ts` — обновить список `enumTypes` (строка ~290)
- `service2110/src/schemas/enums/ReportTypeEnum.ts` — уже есть `ReportTypeEnumSchema`, нужно только зарегистрировать

**Связанные файлы:**
- `service2110/src/schemas/utils/zodToJsonSchema.ts` — `$refStrategy: 'none'`; замена на `$ref` выполняется в `app.ts` через `replaceNestedSchemas`
- `service2110/src/schemas/report-6406/tasks.schema.ts` — использует `reportTypeSchema` из `ReportTypeEnum`
- `service2110/src/schemas/report-6406/export.schema.ts` — использует `reportTypeSchema`

**Проверка:** после изменений запустить приложение и убедиться, что `docs/swagger/service2110.json` генерируется с `$ref` для enum.

---

## Уточнения в процессе выполнения

_(здесь будут добавляться уточнения, выявленные в процессе работы)_


