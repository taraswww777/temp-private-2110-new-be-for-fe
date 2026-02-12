# TASK-020: Рефакторинг FE — стор для ветки AppRouter, текущий стор без изменений

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-020-fe-refactor-store-appRouter` (основной репо), `feature/VTB-526-store-appRouter` (подрепо temp-private-2110)

**Подрепо temp-private-2110:** если в рамках TASK-020 вносятся изменения в подрепозиторий temp-private-2110, они ведутся в рамках задачи **VTB-526**: ветки — `feature/VTB-526-...`, коммиты — с префиксом `VTB-526: ...`. После коммита в основном репо нужно также сделать коммит и пуш в подрепозитории temp-private-2110.

---

## Краткое описание

Отрефакторить FE-код так, чтобы текущий стор остался без изменений (используется в ReportManagerLegacyModule), а для ветки приложения, проходящей через **AppRouter**, создавался и использовался **новый стор**. В дальнейшем в новый стор будет интегрироваться API2 (apiClient2), подготовленный в TASK-017–TASK-019.

---

## Предшествующие задачи

При проведении работ учитывать:

- **[TASK-017](TASK-017-fe-ui-api2-spec-and-update.md)** — спека service2110 и скрипт причёсывания (update2)
- **[TASK-018](TASK-018-fe-ui-apiClient2-fullUpdate2.md)** — apiClient2 и цепочка api:fullUpdate2
- **[TASK-019](TASK-019-fe-ui-apiMock2-generateMockData2.md)** — apiMock2 и generateMockData2

Интеграция API2 с новым стором и компонентами выносится в отдельную задачу; в рамках TASK-020 закладывается только структура нового стора и его использование в AppRouter.

---

## Анализ: что используется после AppRouter

### Точка входа

- **App.tsx**: в зависимости от `FEATURE_CONFIG.ShowReportsMenuModule` рендерит либо `<AppRouter baseURL={baseURL} />`, либо `<ReportManagerLegacyModule baseURL={baseURL} />`. Store в App/AppLoader не подключается.
- **AppRouter.tsx** рендерит:
  - `ReportsMenuModule` (главное меню) — store не использует
  - `SettingsPage` — store не использует
  - `ReportTemplateModule` (шаблон отчётов)
  - `Report6406Module` (отчёт 6406)

### Подключение текущего стора

- **Один глобальный стор** (`src/store`): `store`, `useAppSelector`, `useAppDispatch`, слайс `reports`, RTK Query `reportsApi` (api-client).
- **Provider** стоит не в App, а в лоадерах модулей:
  - `ReportTemplateModuleLoader` — `<Provider store={store}>` оборачивает ReportTemplateModule
  - `Report6406ModuleLoader` — `<Provider store={store}>` оборачивает Report6406Module
  - `ReportManagerLegacyModuleLoader` — `<Provider store={store}>` оборачивает ReportManagerLegacyModule
- Модули под AppRouter (ReportTemplateModule, Report6406Module) и модуль Legacy используют **один и тот же** `store` из `src/store`.

### Кто импортирует store после AppRouter

- **ReportTemplateModule**: страницы (ReportsPage), компоненты (ReportTable, ReportDetailTable, ReportDetailCard, ActionBar, ReportsFiltersModal, поля DepartmentField, SourceField и др.) — импорты `src/store`, `src/store/reports`, `src/store/api/reportsApi`.
- **Report6406Module**: страницы (ReportsPage, PacketsArchivePage), компоненты (PacketsTable, AddIntoPacketModal, PacketsArchiveActionBar и др.) — те же импорты.
- **ReportsMenuModule** — store не использует.
- **SettingsPage** — store не использует.
- Общий компонент **Pagination** (`src/components/Pagination.tsx`) использует store и импортируется только в **ReportManagerLegacyModule** (ReportsRegularPage, ReportsOnDemandPage, KrosAndStatementsPage).

Итого: под AppRouter стор нужен только в ReportTemplateModule и Report6406Module; под Legacy — в ReportManagerLegacyModule и в Pagination.

---

## Цели рефакторинга

1. **Текущий стор не менять**: `src/store` (store, reports slice, reportsApi) остаётся как есть и продолжает использоваться только в **ReportManagerLegacyModule** (и в компонентах, которые вызываются только из Legacy, например Pagination).
2. **Новый стор**: создать отдельный стор (например, отдельный модуль/папка), который будет использоваться **только в ветке с AppRouter**.
3. **AppRouter использует новый стор**: при рендере AppRouter всё дерево (ReportsMenuModule, ReportTemplateModule, Report6406Module, SettingsPage) должно находиться внутри `<Provider store={newStore}>`, а не внутри Provider со старым store.
4. **Модули под AppRouter** (ReportTemplateModule, Report6406Module) и все их дочерние компоненты перевести на импорты из нового стора (новый store, его типы, хуки, слайсы, API). Лоадеры ReportTemplateModule и Report6406Module больше не должны вешать свой `<Provider store={store}>` — стор должен приходить сверху (из App/корня ветки AppRouter).

---

## Требования

### 1. Текущий стор (src/store)

- Не менять состав редьюсеров, API, экспорты.
- Использовать только в ReportManagerLegacyModule (и там, где он уже используется вне AppRouter). ReportManagerLegacyModuleLoader по-прежнему оборачивает детей в `<Provider store={store}>`.

### 2. Новый стор

- Создать новый стор (структура на усмотрение: отдельная папка/модуль, например `src/storeAppRouter` или аналог).
- На первом этапе новый стор может повторять текущую структуру (слайс reports, RTK Query reportsApi на api-client), чтобы модули ReportTemplateModule и Report6406Module работали без смены контракта. Дальнейшая замена api-client на apiClient2 — отдельная задача.
- Экспортировать: экземпляр стора, типы (RootState, AppDispatch), хуки (useAppSelector, useAppDispatch), слайсы и API, необходимые для ReportTemplateModule и Report6406Module.

### 3. Подключение нового стора в App

- В точке, где рендерится AppRouter (в App.tsx или в обёртке вокруг него), обернуть AppRouter в `<Provider store={newStore}>`. Ветка с ReportManagerLegacyModule остаётся с `<Provider store={store}>` (в ReportManagerLegacyModuleLoader).

### 4. Лоадеры модулей под AppRouter

- **ReportTemplateModuleLoader** и **Report6406ModuleLoader**: убрать обёртку `<Provider store={store}>`, оставить только обёртку контейнера/стилей вокруг детей (стор будет предоставлен выше по дереву).

### 5. Импорты в модулях под AppRouter

- Во всех файлах, которые входят только в ветку AppRouter (ReportTemplateModule, Report6406Module — страницы, компоненты, утилиты), заменить импорты с `src/store`, `src/store/reports`, `src/store/api/reportsApi` на импорты из нового стора.
- Файлы, используемые только в ReportManagerLegacyModule (и общие компоненты вроде Pagination, если они только там), продолжают импортировать из `src/store`.

### 6. Общие компоненты

- Компоненты, которые используются и под AppRouter, и под Legacy и при этом зависят от стора (если такие появятся или уже есть), нужно либо дублировать с разными импортами стора, либо получать стор из контекста. По текущему анализу Pagination используется только в Legacy; компоненты под AppRouter используют PaginationUI и данные из стора напрямую — уточнить при реализации.

---

## Критерии приёмки

- [x] Текущий стор (`src/store`) не изменён по составу и поведению; используется только в ветке ReportManagerLegacyModule (и там, где он использовался ранее).
- [x] Создан новый стор; его экземпляр, типы и хуки экспортируются из отдельного модуля.
- [x] AppRouter и всё дерево под ним (ReportsMenuModule, ReportTemplateModule, Report6406Module, SettingsPage) обёрнуты в `<Provider store={newStore}>` на уровне App (или эквивалентной точки входа ветки с меню).
- [x] ReportTemplateModuleLoader и Report6406ModuleLoader не используют Provider со старым store; под AppRouter используется только новый стор. (Лоадеры удалены в рамках TASK-024)
- [x] Все импорты стора в ReportTemplateModule и Report6406Module (и их поддереве) ведут на новый стор; в ReportManagerLegacyModule — на старый.
- [x] Поведение приложения в ветке AppRouter и в ветке ReportManagerLegacyModule сохраняется (при необходимости проверка на другом ПК).

---

## Вне границ данной задачи

- Интеграция apiClient2 и API2 в новый стор (RTK Query и т.д.) — отдельная задача.
- Рефакторинг логики внутри страниц/компонентов (кроме переключения импортов стора) не входит в задачу.

---

## Связанные артефакты

- Точка ветвления: `temp-private-2110/src/App/App.tsx`
- Роутинг: `temp-private-2110/src/App/AppRouter.tsx`
- Текущий стор: `temp-private-2110/src/store/` (store.ts, reports/, api/reportsApi.ts)
- Лоадеры: ReportTemplateModuleLoader.tsx, Report6406ModuleLoader.tsx, ReportManagerLegacyModuleLoader.tsx

---

## Уточнения (по ходу реализации)

### apiClient2: пути к core в сгенерированных сервисах

Генератор (openapi-typescript-codegen) выдаёт в файлах `apiClient2/api/service2110/services/*.ts` импорты `../../core/...`, тогда как из папки `services/` до корня apiClient2 нужно три уровня вверх — `../../../core/` (как в старой реализации apiClient: `api/reportService/services/` → `../../../core/`).

**Решение:** доработка постобработки в `runFixSwaggerApiService2110.ts` → `fixClientApi2.ts`: в `correctGeneratedServices` заменять `from '../../core` и `from '../core` на `from '../../../core`, чтобы после каждой перегенерации API пути к core оставались корректными.

---

## Примечания о выполнении

- **Дата завершения**: 2026-02-12
- **Лоадеры модулей**: ReportTemplateModuleLoader и Report6406ModuleLoader были удалены в рамках [TASK-024](TASK-024-fe-refactor-modules-appRouter.md) (строка 85), что соответствует требованиям TASK-020.
- **Интеграция API2**: В рамках TASK-024 была выполнена интеграция `apiClient2` в новый стор `storeAppRouter` через RTK Query (`report6406Api2.ts`), что выходит за рамки TASK-020, но соответствует общему направлению развития проекта.
