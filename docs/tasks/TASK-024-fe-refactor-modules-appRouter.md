# TASK-024: Рефакторинг модулей ветки AppRouter (Report6406, ReportTemplate, ReportsMenu)

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-024-fe-refactor-modules-appRouter` (основной репо), `feature/VTB-526-refactor-modules-appRouter-try2` (подрепо temp-private-2110)

**Подрепо temp-private-2110:** если в рамках TASK-024 вносятся изменения в подрепозиторий temp-private-2110, они ведутся в рамках задачи **VTB-526**: ветки — `feature/VTB-526-...`, коммиты — с префиксом `VTB-526: ...`. После коммита в основном репо нужно также сделать коммит и пуш в подрепозитории temp-private-2110.

---

## ⚠️ КРИТИЧНО: Инициальное сообщение для продолжения работы

**ВНИМАНИЕ**: При продолжении работы над задачей TASK-024 необходимо строго соблюдать следующие требования:

### Обязательные действия после каждой операции

**После каждой логически завершённой операции (после каждого изменения кода) необходимо:**

1. **Выполнить коммит и пуш в ОБА репозитория:**
   - **Сначала** в подрепо `temp-private-2110` (путь: `temp-private-2110/`)
   - **Затем** в основной репо (корневой каталог проекта)

2. **Язык коммитов:**
   - **В подрепо `temp-private-2110`**: коммиты должны быть **на английском языке** с префиксом `VTB-526: ...`
   - **В основном репо**: коммиты на русском языке с префиксом `TASK-024: ...`

3. **Порядок выполнения:**
   ```
   1. cd temp-private-2110
   2. git add <изменённые файлы>
   3. git commit -m "VTB-526: <описание на английском>"
   4. git push
   5. cd .. (вернуться в корень проекта)
   6. git add temp-private-2110
   7. git commit -m "TASK-024: <описание на русском>"
   8. git push
   ```

4. **Обязательность**: Это критичное требование для поддержания синхронизации между репозиториями и отслеживания прогресса работы. Невыполнение этого требования может привести к потере изменений и проблемам с синхронизацией.

### Контекст для продолжения работы

Для продолжения работы ознакомьтесь с файлом `docs/tasks/TASK-024-context-prompt.md`, который содержит:
- Текущее состояние задачи
- Архитектурные решения
- Выявленные проблемы и их решения
- Список выполненных изменений
- Ключевые файлы проекта

### Важные напоминания

1. **Запрещено изменять**: `src/modules/ReportManagerLegacyModule/` и общий стор `src/store`
2. **Все обращения к API2**: через пространство имён `API2.Service2110.*`
3. **Захардкоженные данные**: должны быть заменены на RTK Query запросы
4. **Параметры запросов**: Для `useGetCurrenciesQuery` и `useGetSourcesQuery` необходимо передавать `undefined` в качестве параметра
5. **Компоненты без суффикса**: Все компоненты находятся в `components/` без суффикса `AppRouter` и без папки `Shared`
6. **Импорты компонентов**: Используется `import { ActionBar, ReportTable, Filter } from "src/modules/ReportTemplateModule/components"`

### Squash истории (ветка вплоть до e42a35f)

При сквоше коммитов в ветке `feature/TASK-024-fe-refactor-modules-appRouter` вплоть до коммита **e42a35f** **не сквошить** 9-й и 10-й пункты (оставить как отдельные коммиты):

- **9-й**: `3e99cf3` — Merge pull request #26 (feature/TASK-023-task-status-planned-task-viewer)
- **10-й**: `5b9e169` — TASK-022: Улучшение обработки ошибок в Task Viewer API

(Нумерация — от e42a35f назад по истории, как в `git log e42a35f --oneline`.)

---

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
- **Полный переход на API2 (apiClient2)**:
  - **Критическое требование**: Все обращения к `apiClient2` должны выполняться через пространство имён `API2.Service2110.*` (например, `API2.Service2110.Report6406TasksService`, `API2.Service2110.StorageVolumeItemDto`).
  - **Удаление старого API**: Полностью удалены все импорты `api-client` из модулей AppRouter. Удалены импорты `API` и `ReportType` из `api-client` в компонентах `ReportsPage.tsx` и `AddIntoPacketModal.tsx`.
  - **Обновление компонентов**:
    - `ReportsPage.tsx`: удалены импорты `API` и `ReportType` из `api-client`, удалён параметр `report_type` из `requestParams` (фильтрация по типу отчёта теперь выполняется на стороне API2).
    - `AddIntoPacketModal.tsx`: удалены импорты `API` и `ParametersOf`, удалён параметр `report_type: [1]` из `requestParams`.
  - **RTK Store для AppRouter**:
    - Создан новый стор `src/storeAppRouter/` для ветки AppRouter.
    - Создан RTK Query API `src/storeAppRouter/api/report6406Api2.ts` с эндпоинтами для API2:
      - **Queries**: `getTasksList`, `getTaskDetails`, `getBranches`, `getSources`, `getCurrencies`, `getFormats`, `getReportTypes`, `getStorageVolumes`.
      - **Mutations**: `createTask`, `cancelTasks`, `deleteTasks`, `startTasks`.
    - Все эндпоинты используют обёртку `axiosToRtk` из `src/utils` для преобразования `CancelablePromise` в формат RTK Query.
    - Для методов без параметров используется прямая передача: `axiosToRtk(API2.Service2110.Report6406ReferencesService.getApiV1Report6406ReferencesBranches)`.
    - Для методов с параметрами используются inline-адаптеры: `axiosToRtk((params) => API2.Service2110.Report6406TasksService.postApiV1Report6406TasksList({ requestBody: params }))`.
    - Теги RTK Query определены в константе `REPORT6406_API2_TAGS` перед определением API.
    - Стор подключён через `<Provider store={storeAppRouter}>` в `App.tsx` для ветки AppRouter.
    - Экспортируются типы `RootState`, `AppDispatch` и хуки `useAppSelector`, `useAppDispatch`.
  - **Типы и компоненты**:
    - `BasePageTemplate.tsx`: использует `API2.Service2110.StorageVolumeItemDto` вместо прямого импорта.
    - Захардкоженные `diskSpaces` заменены на запросы через RTK Query к api2 (`useGetStorageVolumesQuery`).
  - **Конфигурация сборки**:
    - Добавлен webpack alias для `apiClient2` в `webpack.config.ts`.
    - Добавлен path mapping в `tsconfig.json`: `"apiClient2/*": ["./apiClient2/*"]`.
    - Обновлён `jsRule.ts` для включения `apiClient2` в сборку.
  - **Mock-сервер для разработки**:
    - Создан файл `routesApi2.ts` с маршрутами для API2 (`/api/v1/report-6406/*`).
    - Создана структура handlers с разделением на папки:
      - `handlers/api/` — handlers для старого API (используются в `routes.ts`).
      - `handlers/api2/` — handlers для нового API2 (используются в `routesApi2.ts`).
    - **Критическое требование**: Все handlers в `handlers/api2/` должны использовать данные из `apiMock2` (`temp-private-2110/apiMock2/`).
    - **Запрещено**: Использование `temp-private-2110/webpackConfigs/devServer/mockData/` в handlers для API2 строго запрещено.
    - Handlers для API2 используют импорты из `apiMock2` через относительные пути (`../../../../apiMock2`).
    - Handlers реализуют поддержку пагинации, сортировки и фильтрации для `getTasksList`.
    - Маршруты объединены в `devServer.ts`: `routes: { ...routes, ...routesApi2 }`.
  - **RTK Store для AppRouter**:
    - Создан новый стор `src/storeAppRouter/` для ветки AppRouter.
    - Создан RTK Query API `src/storeAppRouter/api/report6406Api2.ts` с эндпоинтами для API2:
      - **Queries**: `getTasksList`, `getTaskDetails`, `getBranches`, `getSources`, `getCurrencies`, `getFormats`, `getReportTypes`, `getStorageVolumes`.
      - **Mutations**: `createTask`, `cancelTasks`, `deleteTasks`, `startTasks`.
    - Все эндпоинты используют обёртку `axiosToRtk` из `src/utils` для преобразования `CancelablePromise` в формат RTK Query.
    - Для методов без параметров используется прямая передача: `axiosToRtk(API2.Service2110.Report6406ReferencesService.getApiV1Report6406ReferencesBranches)`.
    - Для методов с параметрами используются inline-адаптеры: `axiosToRtk((params) => API2.Service2110.Report6406TasksService.postApiV1Report6406TasksList({ requestBody: params }))`.
    - Теги RTK Query определены в константе `REPORT6406_API2_TAGS` перед определением API.
    - Стор подключён через `<Provider store={storeAppRouter}>` в `App.tsx` для ветки AppRouter.
    - Экспортируются типы `RootState`, `AppDispatch` и хуки `useAppSelector`, `useAppDispatch`.

---

## ⚠️ КРИТИЧНО: Репозитории и коммиты

**ВНИМАНИЕ**: После каждой логически завершённой операции (после каждого изменения кода) необходимо выполнить коммит и пуш в ОБА репозитория.

**Все изменения необходимо коммитить в обоих репозиториях с учётом нюансов, выявленных ранее:**

1. **Основной репозиторий** (temp-private-2110-new-be-for-fe):
   - Ветка с префиксом задачи, например: `feature/TASK-024-fe-refactor-modules-appRouter`.
   - Коммиты — с префиксом `TASK-024: ...` на русском языке.

2. **Подрепозиторий temp-private-2110**:
   - Ветки — с префиксом **VTB-526**: `feature/VTB-526-...` (например, `feature/VTB-526-refactor-modules-appRouter-try2`).
   - Коммиты — с префиксом **VTB-526**: `VTB-526: ...` на английском языке.
   - После каждого коммита в основном репо по изменениям, затрагивающим temp-private-2110, нужно выполнить коммит и пуш в подрепозитории temp-private-2110.

3. **Порядок:** при изменениях и в основном репо, и в подрепо — сначала коммит (и при необходимости пуш) в temp-private-2110, затем коммит и пуш в основном репозитории.

4. **Обязательность**: Это критичное требование для поддержания синхронизации между репозиториями и отслеживания прогресса работы. Невыполнение этого требования может привести к потере изменений и проблемам с синхронизацией.

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

---

## Дополнения и уточнения

### Критические требования

1. **Полный переход на API2**: 
   - Все обращения к `apiClient2` должны выполняться через пространство имён `API2.Service2110.*`.
   - Запрещены прямые импорты из `apiClient2/api/service2110`.
   - Все импорты старого `api-client` должны быть удалены из модулей AppRouter.

2. **Удаление захардкоженных данных**:
   - Все захардкоженные данные должны быть заменены на запросы через RTK Query к API2.
   - Пример: `diskSpaces` заменены на `useGetStorageVolumesQuery()`.

3. **⚠️ КРИТИЧНО - Коммиты и пуш**:
   - После каждой логически завершённой операции (после каждого изменения кода) необходимо выполнить коммит и пуш в ОБА репозитория.
   - Порядок: сначала подрепо `temp-private-2110` (коммиты на английском с префиксом `VTB-526:`), затем основной репо (коммиты на русском с префиксом `TASK-024:`).
   - Это критичное требование для поддержания синхронизации между репозиториями и отслеживания прогресса работы.

### Структура handlers для mock-сервера

Handlers организованы в две папки для упрощения поддержки:

- **`webpackConfigs/devServer/handlers/api/`** — handlers для старого API:
  - `handlersGetReportsOnDemand.ts`
  - `handlerGetReference.ts`
  - `handlerGetListFilesByReportId.ts`
  - `handlerGetReportDetailByReportId.ts`
  - `handlerGetReportFilesByReportId.ts`
  - `handlerPostReportStart.ts`

- **`webpackConfigs/devServer/handlers/api2/`** — handlers для нового API2:
  - `handlerGetTasksList.ts`
  - `handlerGetTaskDetails.ts`
  - `handlerGetReferencesSources.ts`
  - `handlerGetReferencesBranches.ts`
  - `handlerGetReferencesCurrencies.ts`
  - `handlerGetReferencesFormats.ts`
  - `handlerGetReferencesReportTypes.ts`
  - `handlerGetStorageVolume.ts`

### Маршруты API2

Создан отдельный файл `routesApi2.ts` для маршрутов API2:
- `/api/v1/report-6406/tasks/list` (POST)
- `/api/v1/report-6406/tasks/:id` (GET)
- `/api/v1/report-6406/references/*` (GET)
- `/api/v1/report-6406/storage/volume` (GET)

Маршруты объединены в `devServer.ts` для работы mock-сервера.

### Используемые UI-компоненты

Для интерфейсов используется UI-кит: `@admiral-ds/react-ui` (https://www.npmjs.com/package/@admiral-ds/react-ui).

### Конфигурация для apiMock2

Для работы с `apiMock2` в handlers и компонентах:
- Добавлен path mapping в `tsconfig.json`: `"apiMock2/*": ["./apiMock2/*"]`.
- Добавлен webpack alias в `webpack.config.ts`: `'apiMock2': path.join(__dirname, 'apiMock2')`.
- Добавлен `apiMock2` в `jsRule.ts` для включения в сборку.
- В handlers для API2 используются относительные пути импорта (`../../../../apiMock2`) для корректной работы при загрузке конфигурации webpack через ts-node.

### Использование axiosToRtk в RTK Query

Все RTK Query эндпоинты используют обёртку `axiosToRtk` из `src/utils`:
- Для методов без параметров: `axiosToRtk(API2.Service2110.Report6406ReferencesService.getApiV1Report6406ReferencesBranches)`.
- Для методов с параметрами: `axiosToRtk((params) => API2.Service2110.Report6406TasksService.postApiV1Report6406TasksList({ requestBody: params }))`.
- Явные типы в `builder.query` и `builder.mutation` не указываются — TypeScript выводит их автоматически.
- Теги RTK Query определены в константе `REPORT6406_API2_TAGS` перед определением API для типобезопасности и избежания опечаток.

### Переход ReportsPage и AddIntoPacketModal на useLazyGetTasksListQuery

- **Переход на новый API**: `ReportsPage.tsx` и `AddIntoPacketModal.tsx` переведены с `useLazyGetOnDemandReportsQuery` на `useLazyGetTasksListQuery` из `storeAppRouter/api/report6406Api2.ts`.
- **Слайс reports для storeAppRouter**: Создан слайс `src/storeAppRouter/reports/` с поддержкой `pagination`, `filters`, `sortObject`, `rowSelectionMap` для работы компонентов AppRouter ветки.
- **Адаптеры данных**:
  - `taskListItemToReportDto.ts` — преобразует `TaskListItemDto` (API2) в `ReportDTO` для совместимости с `ReportTable`.
  - `storageVolumeToDiskSpace.ts` — преобразует `StorageVolumeItemDto` в `DiskSpace` для `BasePageTemplate`.
- **Компоненты для нового стора** (копии логики из общих компонентов):
  - `ReportTable.tsx` — использует `storeAppRouter` вместо старого `store`.
  - `ActionBar.tsx` — использует `storeAppRouter` для `rowSelectionMap` и `filters`.
  - `Filter.tsx` — использует `ReportsFiltersModal`.
  - `ReportsFiltersModal.tsx` — модалка фильтров для нового стора.
  - `usePrepareReportColumnList.tsx` — хук для подготовки колонок таблицы с поддержкой `sortObject` из нового стора.
- **Маппинг параметров запроса**:
  - Старый формат: `{ query: { page: 0, limit: 15, report_type: [1], sort_by: 'create_date', sort_order: 'desc' } }`.
  - Новый формат: `{ filter: [{ column: 'reportType', operator: 'equals', value: 'LSOZ' }], pagination: { number: 1, size: 15 }, sorting: { column: 'createdAt', direction: 'desc' } }`.
  - Фильтр по типу отчёта: для формы 6406 используется `ReportTypeEnumSchema.LSOZ`.
- **Защита селекторов**: Добавлена защита в селекторах `storeAppRouter/reports/selectors.ts` для предотвращения ошибок при отсутствии слайса в сторе (возвращается начальное состояние).
- **Проверка middleware**: Добавлена проверка наличия middleware RTK Query при инициализации стора.

---

## Уточнения, выявленные в ходе решения задачи

### Проблема разделения сторов

**Проблема**: Общие компоненты (`ReportTable`, `ActionBar`, `Filter`, `ReportsFiltersModal`) используют старый стор `src/store`, который также используется в `ReportManagerLegacyModule`. Изменять эти компоненты нельзя, так как это затронет Legacy модуль.

**Решение**: Созданы отдельные компоненты для ветки AppRouter в `src/modules/ReportTemplateModule/components/`:
- `ReportTable` — копия логики `ReportTable` с использованием `storeAppRouter`.
- `ActionBar` — копия логики `ActionBar` с использованием `storeAppRouter`.
- `Filter` — копия логики `Filter` с использованием `ReportsFiltersModal`.
- `ReportsFiltersModal` — копия логики `ReportsFiltersModal` с использованием `storeAppRouter`.
- `usePrepareReportColumnList` — копия логики `usePrepareReportColumnList` с использованием `storeAppRouter`.

### Проблема инициализации слайса в сторе

**Проблема**: При первом рендере компонентов селекторы могли обращаться к слайсу `reports`, который ещё не был инициализирован в сторе, что вызывало ошибку `Cannot read properties of undefined`.

**Решение**: Добавлена защита в селекторах `storeAppRouter/reports/selectors.ts`:
- Функция `getReportsState` проверяет наличие слайса в сторе через оператор `in`.
- Если слайс отсутствует, возвращается начальное состояние.
- Все селекторы используют эту защищённую функцию.

### Проблема с middleware RTK Query

**Проблема**: При использовании RTK Query возникала ошибка "Middleware for RTK-Query API at reducerPath 'report6406Api2' has not been added to the store".

**Решение**: Добавлена проверка наличия middleware при инициализации стора в `storeAppRouter/store.ts`:
- Проверка существования `report6406Api2.middleware` перед добавлением в store.
- Выброс ошибки, если middleware отсутствует.

### Необходимость адаптеров данных

**Проблема**: API2 возвращает данные в формате `TaskListItemDto` и `StorageVolumeItemDto`, которые отличаются от форматов `ReportDTO` и `DiskSpace`, используемых в существующих компонентах.

**Решение**: Созданы адаптеры:
- `taskListItemToReportDto` — преобразует `TaskListItemDto` в `ReportDTO` с маппингом статусов в читаемые строки.
- `storageVolumeToDiskSpace` — преобразует `StorageVolumeItemDto` (строковые размеры в человекочитаемом формате) в `DiskSpace` (числа в МБ).

### Маппинг параметров запроса

**Проблема**: Старый API использует формат `{ query: { page, limit, report_type, sort_by, sort_order } }`, а новый API2 использует формат `{ filter: [...], pagination: { number, size }, sorting: { column, direction } }`.

**Решение**: 
- Создана функция `getSortColumn` для маппинга имён колонок из старого формата в новый.
- Фильтр по типу отчёта: для формы 6406 используется `ReportTypeEnumSchema.LSOZ` вместо числового значения.
- Пагинация: `page` (0-based) → `number` (1-based), `limit` → `size`.

### Структура слайса reports в storeAppRouter

Создан полный слайс `src/storeAppRouter/reports/` с поддержкой:
- `pagination` — текущая страница и размер страницы.
- `filters` — активные фильтры.
- `sortObject` — текущая сортировка (колонка и направление).
- `rowSelectionMap` — выбранные строки в таблице.
- `isDisabledForm` — флаг блокировки формы.

Все действия и селекторы аналогичны старому слайсу, но работают с новым стором.

### Рефакторинг полей формы в ReportsFiltersModalAppRouter

**Проблема**: Поля формы (`DepartmentField`, `FormatField`, `StatusField`, `TypeField`, `CurrencyField`, `SourceField`) использовали старый стор (`useGetReferenceValuesQuery` из `src/store/api/reportsApi`) или захардкоженные данные.

**Решение**: Созданы версии полей для AppRouter в `ReportsFiltersModal/fields/`:
- `DepartmentField.tsx` — использует `useGetBranchesQuery` из `report6406Api2`
- `FormatField.tsx` — использует `useGetFormatsQuery` из `report6406Api2`
- `TypeField.tsx` — использует `useGetReportTypesQuery` из `report6406Api2`
- `StatusField.tsx` — использует enum `API2.Service2110.ReportTaskStatusEnumSchema` с маппингом из `localization.enums.ReportTaskStatus`
- `CurrencyField.tsx` — использует `useGetCurrenciesQuery(undefined)` из `report6406Api2`
- `SourceField.tsx` — использует `useGetSourcesQuery(undefined)` из `report6406Api2`

**Важно**: Для `useGetCurrenciesQuery` и `useGetSourcesQuery` необходимо передавать `undefined` в качестве параметра.

### Рефакторинг CreateReportFormModal

**Проблема**: `CreateReportFormModal` использовал старые поля формы и не был интегрирован с API2 для создания заданий.

**Решение**: Создан `CreateReportFormModal`:
- Использует все AppRouter-версии полей формы
- Интегрирован с `useCreateTaskMutation` из `report6406Api2`
- Маппинг формы в `CreateTaskDto` с конвертацией дат из DD.MM.YYYY в YYYY-MM-DD
- Валидация обязательных полей перед отправкой
- Уведомления об успехе/ошибке через `NotificationService`
- Создан `CreateReport` для использования в `ActionBar`

### Рефакторинг ReportTemplateModule

**Проблема**: `ReportTemplateModule` использовал старый стор и старый API для получения списка отчётов и деталей.

**Решение**:
- `ReportTemplateModule/pages/ReportsPage.tsx` переведён на `storeAppRouter` и `useLazyGetTasksListQuery`
  - Использует `ReportTypeEnumSchema.LSOS` для фильтрации типа отчёта (шаблон)
  - Использует `ActionBarAppRouter` и `ReportTableAppRouter` из `Report6406Module`
  - Использует `useGetStorageVolumesQuery` для получения данных о дисках
- Создан `ReportDetailCardAppRouter` для отображения деталей задания через API2
  - Использует `useGetTaskDetailsQuery` из `report6406Api2`
  - Отображает поля из `TaskDetailsDto`: филиал, тип отчёта, статус, формат, создатель, S3, количество файлов, размер
  - Маппинг статусов на русские названия
- `ReportTemplateModule/pages/ReportDetailPage.tsx` использует `ReportDetailCard`
- `Report6406Module/pages/ReportDetailPage.tsx` также переведён на `ReportDetailCard`

### Удаление суффикса AppRouter из компонентов

**Проблема**: В процессе рефакторинга у компонентов появился суффикс `AppRouter`, что создавало избыточное дублирование кода и усложняло поддержку.

**Решение**: 
- Удалён суффикс `AppRouter` из всех компонентов и файлов
- Компоненты переименованы: `ActionBarAppRouter` → `ActionBar`, `ReportTableAppRouter` → `ReportTable`, `FilterAppRouter` → `Filter`, и т.д.
- Все интерфейсы и типы также переименованы без суффикса
- Обновлены все импорты в файлах, использующих эти компоненты

### Удаление папки Shared

**Проблема**: Папка `components/Shared/` создавала избыточное дублирование кода и усложняла структуру проекта.

**Решение**:
- Удалена папка `components/Shared/`
- Все компоненты перемещены в родительскую директорию `components/`
- Создан `components/index.ts` для экспорта всех компонентов
- Обновлены импорты: `components/Shared` → `components`

**Структура компонентов после рефакторинга**:
```
components/
├── ActionBar.tsx
├── Filter.tsx
├── CreateReport.tsx
├── ReportTable/
│   ├── ReportTable.tsx
│   ├── ReportTable.constants.tsx
│   ├── usePrepareReportColumnList.tsx
│   └── utils/
│       ├── preparedReportRowsList.tsx
│       └── reportColumnSizesStore.ts
├── ReportsFiltersModal/
│   ├── ReportsFiltersModal.tsx
│   └── fields/
│       ├── DepartmentField.tsx
│       ├── FormatField.tsx
│       ├── TypeField.tsx
│       ├── StatusField.tsx
│       ├── CurrencyField.tsx
│       └── SourceField.tsx
├── CreateReportFormModal/
│   ├── CreateReportFormModal.tsx
│   ├── CreateReportFormModal.types.ts
│   └── CreateReportFormModal.constants.ts
└── index.ts
```

### Рефакторинг PacketsArchivePage

**Проблема**: `PacketsArchivePage.tsx` использовал старый стор и моковые данные.

**Решение**:
- Переведён на использование `storeAppRouter` вместо старого стора
- Добавлен endpoint `getPackagesList` в `report6406Api2.ts` для получения списка пакетов
- Использует `useGetPackagesListQuery` для получения реальных данных
- Использует `useGetStorageVolumesQuery` для получения данных о дисках
- Создан адаптер `packageDtoToPacketDto.ts` для преобразования `PackageDto` в `PacketDTO`
- Реализованы пагинация и сортировка через API2
- Обновлены компоненты `PacketsTable.tsx` и `PacketsArchiveActionBar.tsx` для использования нового стора

### Использование axiosToRtk с явными типами

**Проблема**: RTK Query не мог правильно вывести типы из `axiosToRtk`, что приводило к ошибкам TypeScript.

**Решение**:
- Созданы типы `RequestParamsType` и `RequestResponseType` в `axiosToRtk.ts` для извлечения типов из функций API
- Все endpoints в `report6406Api2.ts` используют явные типы: `builder.query<RequestResponseType<...>, RequestParamsType<...>>`
- Упрощено использование `axiosToRtk`: напрямую передаётся функция API без промежуточных обёрток
- Пример: `queryFn: axiosToRtk(API2.Service2110.Report6406TasksService.postApiV1Report6406TasksList)`

### Маппинг статусов в localization.ts

**Проблема**: Маппинг статусов `ReportTaskStatus` был разбросан по разным компонентам, что создавало дублирование.

**Решение**:
- Добавлен раздел `ReportTaskStatus` в `localization.enums`
- Все статусы из `API2.Service2110.ReportTaskStatusEnumSchema` добавлены в маппинг
- Компоненты используют `localization.enums.ReportTaskStatus[status]` вместо локальных констант
- Обновлён тип `Localization` в `localization.types.ts`

### Исправление ошибок TypeScript

**Проблема**: Ошибка `TS7053: Element implicitly has an 'any' type` при обращении к `localization.enums.ReportTaskStatus[taskDetails.status]`.

**Решение**:
- Добавлена проверка `!taskDetails?.status` в условие перед использованием статуса
- Это позволяет TypeScript правильно определить тип после проверки

### Исправление ошибки размещения endpoint в report6406Api2.ts

**Проблема**: Ошибка `TS2339: Property 'useGetPackagesListQuery' does not exist` при попытке экспортировать хук из API.

**Решение**:
- Endpoint `getPackagesList` был неправильно размещён вне объекта `endpoints`
- Endpoint перемещён внутрь объекта `endpoints` перед закрывающей скобкой
- Добавлен тег `Package` в `REPORT6406_API2_TAGS`

---

## ⚠️ КРИТИЧНО: Инициальное сообщение для продолжения работы

**ВНИМАНИЕ**: При продолжении работы над задачей TASK-024 необходимо строго соблюдать следующие требования:

### Обязательные действия после каждой операции

**После каждой логически завершённой операции (после каждого изменения кода) необходимо:**

1. **Выполнить коммит и пуш в ОБА репозитория:**
   - **Сначала** в подрепо `temp-private-2110` (путь: `temp-private-2110/`)
   - **Затем** в основной репо (корневой каталог проекта)

2. **Язык коммитов:**
   - **В подрепо `temp-private-2110`**: коммиты должны быть **на английском языке** с префиксом `VTB-526: ...`
   - **В основном репо**: коммиты на русском языке с префиксом `TASK-024: ...`

3. **Порядок выполнения:**
   ```
   1. cd temp-private-2110
   2. git add <изменённые файлы>
   3. git commit -m "VTB-526: <описание на английском>"
   4. git push
   5. cd .. (вернуться в корень проекта)
   6. git add temp-private-2110
   7. git commit -m "TASK-024: <описание на русском>"
   8. git push
   ```

4. **Обязательность**: Это критичное требование для поддержания синхронизации между репозиториями и отслеживания прогресса работы. Невыполнение этого требования может привести к потере изменений и проблемам с синхронизацией.

### Контекст для продолжения работы

Для продолжения работы ознакомьтесь с файлом `docs/tasks/TASK-024-context-prompt.md`, который содержит:
- Текущее состояние задачи
- Архитектурные решения
- Выявленные проблемы и их решения
- Список выполненных изменений
- Ключевые файлы проекта

### Важные напоминания

1. **Запрещено изменять**: `src/modules/ReportManagerLegacyModule/` и общий стор `src/store`
2. **Все обращения к API2**: через пространство имён `API2.Service2110.*`
3. **Захардкоженные данные**: должны быть заменены на RTK Query запросы
4. **Параметры запросов**: Для `useGetCurrenciesQuery` и `useGetSourcesQuery` необходимо передавать `undefined` в качестве параметра
5. **Компоненты без суффикса**: Все компоненты находятся в `components/` без суффикса `AppRouter` и без папки `Shared`
6. **Импорты компонентов**: Используется `import { ActionBar, ReportTable, Filter } from "src/modules/ReportTemplateModule/components"`

### Инициальное сообщение для нового агента

При продолжении работы над задачей **TASK-024: Рефакторинг модулей ветки AppRouter** необходимо:

1. **Ознакомиться с контекстом**: Прочитать файл `docs/tasks/TASK-024-context-prompt.md` для понимания текущего состояния задачи и архитектурных решений.

2. **Ознакомиться с задачей**: Прочитать файл `docs/tasks/TASK-024-fe-refactor-modules-appRouter.md` для понимания полного описания задачи.

3. **Соблюдать требования к коммитам**: После каждой логически завершённой операции выполнять коммит и пуш в оба репозитория (сначала `temp-private-2110/`, затем основной репо). Коммиты в подрепо — на английском языке с префиксом `VTB-526:`, в основном репо — на русском с префиксом `TASK-024:`.

4. **Не изменять**: `src/modules/ReportManagerLegacyModule/` и общий стор `src/store`.

5. **Использовать API2**: Все обращения к `apiClient2` должны выполняться через пространство имён `API2.Service2110.*`.

6. **Продолжить рефакторинг**: Согласно описанию задачи в `docs/tasks/TASK-024-fe-refactor-modules-appRouter.md`.

**Полное инициальное сообщение**: См. файл `docs/tasks/TASK-024-initial-message.md`.

### Переход ReportsPage и AddIntoPacketModal на useLazyGetTasksListQuery

- **Переход на новый API**: `ReportsPage.tsx` и `AddIntoPacketModal.tsx` переведены с `useLazyGetOnDemandReportsQuery` на `useLazyGetTasksListQuery` из `storeAppRouter/api/report6406Api2.ts`.
- **Слайс reports для storeAppRouter**: Создан слайс `src/storeAppRouter/reports/` с поддержкой `pagination`, `filters`, `sortObject`, `rowSelectionMap` для работы компонентов AppRouter ветки.
- **Адаптеры данных**:
  - `taskListItemToReportDto.ts` — преобразует `TaskListItemDto` (API2) в `ReportDTO` для совместимости с `ReportTable`.
  - `storageVolumeToDiskSpace.ts` — преобразует `StorageVolumeItemDto` в `DiskSpace` для `BasePageTemplate`.
- **Компоненты для нового стора** (копии логики из общих компонентов):
  - `ReportTable.tsx` — использует `storeAppRouter` вместо старого `store`.
  - `ActionBar.tsx` — использует `storeAppRouter` для `rowSelectionMap` и `filters`.
  - `Filter.tsx` — использует `ReportsFiltersModal`.
  - `ReportsFiltersModal.tsx` — модалка фильтров для нового стора.
  - `usePrepareReportColumnList.tsx` — хук для подготовки колонок таблицы с поддержкой `sortObject` из нового стора.
- **Маппинг параметров запроса**:
  - Старый формат: `{ query: { page: 0, limit: 15, report_type: [1], sort_by: 'create_date', sort_order: 'desc' } }`.
  - Новый формат: `{ filter: [{ column: 'reportType', operator: 'equals', value: 'LSOZ' }], pagination: { number: 1, size: 15 }, sorting: { column: 'createdAt', direction: 'desc' } }`.
  - Фильтр по типу отчёта: для формы 6406 используется `ReportTypeEnumSchema.LSOZ`.
- **Защита селекторов**: Добавлена защита в селекторах `storeAppRouter/reports/selectors.ts` для предотвращения ошибок при отсутствии слайса в сторе (возвращается начальное состояние).
- **Проверка middleware**: Добавлена проверка наличия middleware RTK Query при инициализации стора.

---

## Уточнения, выявленные в ходе решения задачи

### Проблема разделения сторов

**Проблема**: Общие компоненты (`ReportTable`, `ActionBar`, `Filter`, `ReportsFiltersModal`) используют старый стор `src/store`, который также используется в `ReportManagerLegacyModule`. Изменять эти компоненты нельзя, так как это затронет Legacy модуль.

**Решение**: Созданы отдельные компоненты для ветки AppRouter в `src/modules/ReportTemplateModule/components/`:
- `ReportTable` — копия логики `ReportTable` с использованием `storeAppRouter`.
- `ActionBar` — копия логики `ActionBar` с использованием `storeAppRouter`.
- `Filter` — копия логики `Filter` с использованием `ReportsFiltersModal`.
- `ReportsFiltersModal` — копия логики `ReportsFiltersModal` с использованием `storeAppRouter`.
- `usePrepareReportColumnList` — копия логики `usePrepareReportColumnList` с использованием `storeAppRouter`.

### Проблема инициализации слайса в сторе

**Проблема**: При первом рендере компонентов селекторы могли обращаться к слайсу `reports`, который ещё не был инициализирован в сторе, что вызывало ошибку `Cannot read properties of undefined`.

**Решение**: Добавлена защита в селекторах `storeAppRouter/reports/selectors.ts`:
- Функция `getReportsState` проверяет наличие слайса в сторе через оператор `in`.
- Если слайс отсутствует, возвращается начальное состояние.
- Все селекторы используют эту защищённую функцию.

### Проблема с middleware RTK Query

**Проблема**: При использовании RTK Query возникала ошибка "Middleware for RTK-Query API at reducerPath 'report6406Api2' has not been added to the store".

**Решение**: Добавлена проверка наличия middleware при инициализации стора в `storeAppRouter/store.ts`:
- Проверка существования `report6406Api2.middleware` перед добавлением в store.
- Выброс ошибки, если middleware отсутствует.

### Необходимость адаптеров данных

**Проблема**: API2 возвращает данные в формате `TaskListItemDto` и `StorageVolumeItemDto`, которые отличаются от форматов `ReportDTO` и `DiskSpace`, используемых в существующих компонентах.

**Решение**: Созданы адаптеры:
- `taskListItemToReportDto` — преобразует `TaskListItemDto` в `ReportDTO` с маппингом статусов в читаемые строки.
- `storageVolumeToDiskSpace` — преобразует `StorageVolumeItemDto` (строковые размеры в человекочитаемом формате) в `DiskSpace` (числа в МБ).

### Маппинг параметров запроса

**Проблема**: Старый API использует формат `{ query: { page, limit, report_type, sort_by, sort_order } }`, а новый API2 использует формат `{ filter: [...], pagination: { number, size }, sorting: { column, direction } }`.

**Решение**: 
- Создана функция `getSortColumn` для маппинга имён колонок из старого формата в новый.
- Фильтр по типу отчёта: для формы 6406 используется `ReportTypeEnumSchema.LSOZ` вместо числового значения.
- Пагинация: `page` (0-based) → `number` (1-based), `limit` → `size`.

### Структура слайса reports в storeAppRouter

Создан полный слайс `src/storeAppRouter/reports/` с поддержкой:
- `pagination` — текущая страница и размер страницы.
- `filters` — активные фильтры.
- `sortObject` — текущая сортировка (колонка и направление).
- `rowSelectionMap` — выбранные строки в таблице.
- `isDisabledForm` — флаг блокировки формы.

Все действия и селекторы аналогичны старому слайсу, но работают с новым стором.

### Рефакторинг полей формы в ReportsFiltersModalAppRouter

**Проблема**: Поля формы (`DepartmentField`, `FormatField`, `StatusField`, `TypeField`, `CurrencyField`, `SourceField`) использовали старый стор (`useGetReferenceValuesQuery` из `src/store/api/reportsApi`) или захардкоженные данные.

**Решение**: Созданы версии полей для AppRouter в `ReportsFiltersModal/fields/`:
- `DepartmentField.tsx` — использует `useGetBranchesQuery` из `report6406Api2`
- `FormatField.tsx` — использует `useGetFormatsQuery` из `report6406Api2`
- `TypeField.tsx` — использует `useGetReportTypesQuery` из `report6406Api2`
- `StatusField.tsx` — использует enum `API2.Service2110.ReportTaskStatusEnumSchema` с маппингом из `localization.enums.ReportTaskStatus`
- `CurrencyField.tsx` — использует `useGetCurrenciesQuery(undefined)` из `report6406Api2`
- `SourceField.tsx` — использует `useGetSourcesQuery(undefined)` из `report6406Api2`

**Важно**: Для `useGetCurrenciesQuery` и `useGetSourcesQuery` необходимо передавать `undefined` в качестве параметра.

### Рефакторинг CreateReportFormModal

**Проблема**: `CreateReportFormModal` использовал старые поля формы и не был интегрирован с API2 для создания заданий.

**Решение**: Создан `CreateReportFormModal`:
- Использует все AppRouter-версии полей формы
- Интегрирован с `useCreateTaskMutation` из `report6406Api2`
- Маппинг формы в `CreateTaskDto` с конвертацией дат из DD.MM.YYYY в YYYY-MM-DD
- Валидация обязательных полей перед отправкой
- Уведомления об успехе/ошибке через `NotificationService`
- Создан `CreateReport` для использования в `ActionBar`

### Рефакторинг ReportTemplateModule

**Проблема**: `ReportTemplateModule` использовал старый стор и старый API для получения списка отчётов и деталей.

**Решение**:
- `ReportTemplateModule/pages/ReportsPage.tsx` переведён на `storeAppRouter` и `useLazyGetTasksListQuery`
  - Использует `ReportTypeEnumSchema.LSOS` для фильтрации типа отчёта (шаблон)
  - Использует `ActionBarAppRouter` и `ReportTableAppRouter` из `Report6406Module`
  - Использует `useGetStorageVolumesQuery` для получения данных о дисках
- Создан `ReportDetailCardAppRouter` для отображения деталей задания через API2
  - Использует `useGetTaskDetailsQuery` из `report6406Api2`
  - Отображает поля из `TaskDetailsDto`: филиал, тип отчёта, статус, формат, создатель, S3, количество файлов, размер
  - Маппинг статусов на русские названия
- `ReportTemplateModule/pages/ReportDetailPage.tsx` использует `ReportDetailCard`
- `Report6406Module/pages/ReportDetailPage.tsx` также переведён на `ReportDetailCard`

### Удаление суффикса AppRouter из компонентов

**Проблема**: В процессе рефакторинга у компонентов появился суффикс `AppRouter`, что создавало избыточное дублирование кода и усложняло поддержку.

**Решение**: 
- Удалён суффикс `AppRouter` из всех компонентов и файлов
- Компоненты переименованы: `ActionBarAppRouter` → `ActionBar`, `ReportTableAppRouter` → `ReportTable`, `FilterAppRouter` → `Filter`, и т.д.
- Все интерфейсы и типы также переименованы без суффикса
- Обновлены все импорты в файлах, использующих эти компоненты

### Удаление папки Shared

**Проблема**: Папка `components/Shared/` создавала избыточное дублирование кода и усложняла структуру проекта.

**Решение**:
- Удалена папка `components/Shared/`
- Все компоненты перемещены в родительскую директорию `components/`
- Создан `components/index.ts` для экспорта всех компонентов
- Обновлены импорты: `components/Shared` → `components`

**Структура компонентов после рефакторинга**:
```
components/
├── ActionBar.tsx
├── Filter.tsx
├── CreateReport.tsx
├── ReportTable/
│   ├── ReportTable.tsx
│   ├── ReportTable.constants.tsx
│   ├── usePrepareReportColumnList.tsx
│   └── utils/
│       ├── preparedReportRowsList.tsx
│       └── reportColumnSizesStore.ts
├── ReportsFiltersModal/
│   ├── ReportsFiltersModal.tsx
│   └── fields/
│       ├── DepartmentField.tsx
│       ├── FormatField.tsx
│       ├── TypeField.tsx
│       ├── StatusField.tsx
│       ├── CurrencyField.tsx
│       └── SourceField.tsx
├── CreateReportFormModal/
│   ├── CreateReportFormModal.tsx
│   ├── CreateReportFormModal.types.ts
│   └── CreateReportFormModal.constants.ts
└── index.ts
```

### Рефакторинг PacketsArchivePage

**Проблема**: `PacketsArchivePage.tsx` использовал старый стор и моковые данные.

**Решение**:
- Переведён на использование `storeAppRouter` вместо старого стора
- Добавлен endpoint `getPackagesList` в `report6406Api2.ts` для получения списка пакетов
- Использует `useGetPackagesListQuery` для получения реальных данных
- Использует `useGetStorageVolumesQuery` для получения данных о дисках
- Создан адаптер `packageDtoToPacketDto.ts` для преобразования `PackageDto` в `PacketDTO`
- Реализованы пагинация и сортировка через API2
- Обновлены компоненты `PacketsTable.tsx` и `PacketsArchiveActionBar.tsx` для использования нового стора

### Использование axiosToRtk с явными типами

**Проблема**: RTK Query не мог правильно вывести типы из `axiosToRtk`, что приводило к ошибкам TypeScript.

**Решение**:
- Созданы типы `RequestParamsType` и `RequestResponseType` в `axiosToRtk.ts` для извлечения типов из функций API
- Все endpoints в `report6406Api2.ts` используют явные типы: `builder.query<RequestResponseType<...>, RequestParamsType<...>>`
- Упрощено использование `axiosToRtk`: напрямую передаётся функция API без промежуточных обёрток
- Пример: `queryFn: axiosToRtk(API2.Service2110.Report6406TasksService.postApiV1Report6406TasksList)`

### Маппинг статусов в localization.ts

**Проблема**: Маппинг статусов `ReportTaskStatus` был разбросан по разным компонентам, что создавало дублирование.

**Решение**:
- Добавлен раздел `ReportTaskStatus` в `localization.enums`
- Все статусы из `API2.Service2110.ReportTaskStatusEnumSchema` добавлены в маппинг
- Компоненты используют `localization.enums.ReportTaskStatus[status]` вместо локальных констант
- Обновлён тип `Localization` в `localization.types.ts`

### Исправление ошибок TypeScript

**Проблема**: Ошибка `TS7053: Element implicitly has an 'any' type` при обращении к `localization.enums.ReportTaskStatus[taskDetails.status]`.

**Решение**:
- Добавлена проверка `!taskDetails?.status` в условие перед использованием статуса
- Это позволяет TypeScript правильно определить тип после проверки

### Исправление ошибки размещения endpoint в report6406Api2.ts

**Проблема**: Ошибка `TS2339: Property 'useGetPackagesListQuery' does not exist` при попытке экспортировать хук из API.

**Решение**:
- Endpoint `getPackagesList` был неправильно размещён вне объекта `endpoints`
- Endpoint перемещён внутрь объекта `endpoints` перед закрывающей скобкой
- Добавлен тег `Package` в `REPORT6406_API2_TAGS`

---

## ⚠️ КРИТИЧНО: Инициальное сообщение для продолжения работы

**ВНИМАНИЕ**: При продолжении работы над задачей TASK-024 необходимо строго соблюдать следующие требования:

### Обязательные действия после каждой операции

**После каждой логически завершённой операции (после каждого изменения кода) необходимо:**

1. **Выполнить коммит и пуш в ОБА репозитория:**
   - **Сначала** в подрепо `temp-private-2110` (путь: `temp-private-2110/`)
   - **Затем** в основной репо (корневой каталог проекта)

2. **Язык коммитов:**
   - **В подрепо `temp-private-2110`**: коммиты должны быть **на английском языке** с префиксом `VTB-526: ...`
   - **В основном репо**: коммиты на русском языке с префиксом `TASK-024: ...`

3. **Порядок выполнения:**
   ```
   1. cd temp-private-2110
   2. git add <изменённые файлы>
   3. git commit -m "VTB-526: <описание на английском>"
   4. git push
   5. cd .. (вернуться в корень проекта)
   6. git add temp-private-2110
   7. git commit -m "TASK-024: <описание на русском>"
   8. git push
   ```

4. **Обязательность**: Это критичное требование для поддержания синхронизации между репозиториями и отслеживания прогресса работы. Невыполнение этого требования может привести к потере изменений и проблемам с синхронизацией.

### Контекст для продолжения работы

Для продолжения работы ознакомьтесь с файлом `docs/tasks/TASK-024-context-prompt.md`, который содержит:
- Текущее состояние задачи
- Архитектурные решения
- Выявленные проблемы и их решения
- Список выполненных изменений
- Ключевые файлы проекта

### Важные напоминания

1. **Запрещено изменять**: `src/modules/ReportManagerLegacyModule/` и общий стор `src/store`
2. **Все обращения к API2**: через пространство имён `API2.Service2110.*`
3. **Захардкоженные данные**: должны быть заменены на RTK Query запросы
4. **Параметры запросов**: Для `useGetCurrenciesQuery` и `useGetSourcesQuery` необходимо передавать `undefined` в качестве параметра
5. **Компоненты без суффикса**: Все компоненты находятся в `components/` без суффикса `AppRouter` и без папки `Shared`
6. **Импорты компонентов**: Используется `import { ActionBar, ReportTable, Filter } from "src/modules/ReportTemplateModule/components"`

### Инициальное сообщение для нового агента

При продолжении работы над задачей **TASK-024: Рефакторинг модулей ветки AppRouter** необходимо:

1. **Ознакомиться с контекстом**: Прочитать файл `docs/tasks/TASK-024-context-prompt.md` для понимания текущего состояния задачи и архитектурных решений.

2. **Ознакомиться с задачей**: Прочитать файл `docs/tasks/TASK-024-fe-refactor-modules-appRouter.md` для понимания полного описания задачи.

3. **Соблюдать требования к коммитам**: После каждой логически завершённой операции выполнять коммит и пуш в оба репозитория (сначала `temp-private-2110/`, затем основной репо). Коммиты в подрепо — на английском языке с префиксом `VTB-526:`, в основном репо — на русском с префиксом `TASK-024:`.

4. **Не изменять**: `src/modules/ReportManagerLegacyModule/` и общий стор `src/store`.

5. **Использовать API2**: Все обращения к `apiClient2` должны выполняться через пространство имён `API2.Service2110.*`.

6. **Продолжить рефакторинг**: Согласно описанию задачи в `docs/tasks/TASK-024-fe-refactor-modules-appRouter.md`.

**Полное инициальное сообщение**: См. файл `docs/tasks/TASK-024-initial-message.md`.
