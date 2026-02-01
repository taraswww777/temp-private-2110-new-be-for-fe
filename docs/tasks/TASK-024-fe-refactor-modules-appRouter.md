# TASK-024: Рефакторинг модулей ветки AppRouter (Report6406, ReportTemplate, ReportsMenu)

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-024-fe-refactor-modules-appRouter` (основной репо), `feature/VTB-526-refactor-modules-appRouter` (подрепо temp-private-2110)

**Подрепо temp-private-2110:** если в рамках TASK-024 вносятся изменения в подрепозиторий temp-private-2110, они ведутся в рамках задачи **VTB-526**: ветки — `feature/VTB-526-...`, коммиты — с префиксом `VTB-526: ...`. После коммита в основном репо нужно также сделать коммит и пуш в подрепозитории temp-private-2110.

---

## Краткое описание

Отрефакторить уже написанный код, относящийся к модулям ветки **AppRouter**:

- **Report6406Module** — `temp-private-2110/src/modules/Report6406Module/`
- **ReportTemplateModule** — `temp-private-2110/src/modules/ReportTemplateModule/`
- **ReportsMenuModule** — `temp-private-2110/src/modules/ReportsMenuModule/`

Конкретные направления рефакторинга (структура, типы, API2, стиль и т.д.) уточняются при выполнении задачи. В TASK-020 заложена структура нового стора (storeAppRouter) и его использование в AppRouter; в TASK-024 работа ведётся над кодом самих модулей.

### Выполненные изменения (рефакторинг)

- **Единая точка импорта модулей**: Report6406Module и ReportsMenuModule экспортируются из `src/modules/index.ts`; AppRouter импортирует все три модуля из `src/modules`.
- **Общий тип DiskSpace**: тип перенесён в `src/types/common.ts`; Report6406Module больше не зависит от ReportTemplateModule по типу DiskSpace; BasePageTemplate и оба `diskSpaces.ts` используют импорт из `src/types/common`.
- **Удаление избыточных Loader-обёрток**: Report6406ModuleLoader и ReportTemplateModuleLoader удалены (они лишь прокидывали `children`); разметка контейнера и роутинга вынесена напрямую в Report6406Module и ReportTemplateModule.
- **Стиль**: исправлен отступ в ReportTemplateModule.routing.tsx; убраны лишние пробелы в объявлениях в diskSpaces.ts.

---

## Репозитории и коммиты

**Все изменения необходимо коммитить в обоих репозиториях с учётом нюансов, выявленных ранее:**

1. **Основной репозиторий** (temp-private-2110-new-be-for-fe):
   - Ветка с префиксом задачи, например: `feature/TASK-024-fe-refactor-modules-appRouter`.
   - Коммиты — с префиксом `TASK-024: ...` (или по принятому в проекте формату).

2. **Подрепозиторий temp-private-2110**:
   - Ветки — с префиксом **VTB-526**: `feature/VTB-526-...` (например, `feature/VTB-526-refactor-modules-appRouter`).
   - Коммиты — с префиксом **VTB-526**: `VTB-526: ...`.
   - После каждого коммита в основном репо по изменениям, затрагивающим temp-private-2110, нужно выполнить коммит и пуш в подрепозитории temp-private-2110.

3. **Порядок:** при изменениях и в основном репо, и в подрепо — сначала коммит (и при необходимости пуш) в temp-private-2110, затем коммит и пуш в основном репозитории.

---

## Предшествующие задачи

- **[TASK-020](TASK-020-fe-refactor-store-appRouter.md)** — стор для ветки AppRouter (storeAppRouter), импорты в ReportTemplateModule и Report6406Module переведены на новый стор.

---

## Область изменений

| Модуль               | Путь в temp-private-2110                          |
|----------------------|----------------------------------------------------|
| Report6406Module     | `src/modules/Report6406Module/`                    |
| ReportTemplateModule | `src/modules/ReportTemplateModule/`                |
| ReportsMenuModule    | `src/modules/ReportsMenuModule/`                  |

---

## Критерии приёмки

- [x] Рефакторинг выполнен в рамках указанных модулей.
- [x] Изменения закоммичены в основном репозитории (ветка задачи, сообщение с префиксом задачи).
- [x] Изменения в коде temp-private-2110 закоммичены и запушены в подрепозитории (ветка VTB-526, коммиты с префиксом `VTB-526: ...`).
- [x] Поведение приложения в ветке AppRouter сохранено или улучшено по согласованным критериям.

---

## Вне границ данной задачи

- Изменения в ReportManagerLegacyModule и общем сторе `src/store`.
- Интеграция apiClient2 в storeAppRouter и компоненты (если выносится в отдельную задачу).
