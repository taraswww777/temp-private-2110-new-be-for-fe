# Промпт для шаринга контекста по TASK-024

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

---

## Контекст задачи

Работаю над задачей **TASK-024: Рефакторинг модулей ветки AppRouter**. Задача находится в файле `docs/tasks/TASK-024-fe-refactor-modules-appRouter.md`.

**Текущий статус**: В процессе выполнения. Переведены модули Report6406Module, ReportTemplateModule и PacketsArchivePage на использование `storeAppRouter` и API2. В **service2110** поле `operator` удалено из схем фильтрации (`GetTasksRequestDto`); фильтры используют формат без `operator` (по умолчанию — равенство).

## Важные архитектурные решения

### Разделение сторов

В проекте есть два стора:
- **Старый стор** (`src/store`) — используется в `ReportManagerLegacyModule` (запрещено изменять).
- **Новый стор** (`src/storeAppRouter`) — используется в ветке AppRouter для модулей `Report6406Module`, `ReportTemplateModule`, `ReportsMenuModule`.

**Критически важно**: Общие компоненты (`ReportTable`, `ActionBar`, `Filter`, `ReportsFiltersModal`, `CreateReportFormModal`, `ReportDetailCard`) используют старый стор и их нельзя изменять напрямую. Для ветки AppRouter созданы отдельные компоненты-копии, которые находятся в `src/modules/ReportTemplateModule/components/`:
- `ReportTable.tsx` — использует `storeAppRouter`
- `ActionBar.tsx` — использует `storeAppRouter`
- `Filter.tsx` — использует `ReportsFiltersModal`
- `ReportsFiltersModal.tsx` — модалка фильтров для нового стора
- `CreateReportFormModal.tsx` — форма создания отчёта с API2
- `CreateReport.tsx` — компонент для создания отчёта
- `ReportDetailCard.tsx` (в `ReportDetailCardNew2/`) — отображение деталей задания через API2
- `usePrepareColumnList.tsx` — универсальный хук для подготовки колонок таблицы (принимает только `initialColumnList`, опционально sortObject, onColumnResizeSave, savedColumnSizes; роутинг в хуке не используется)

**Важно**: Папка `components/Shared/` была удалена для устранения избыточного дублирования кода. Все компоненты находятся в родительской директории `components/`.

### Структура storeAppRouter

```
src/storeAppRouter/
├── api/
│   └── report6406Api2.ts          # RTK Query API для API2
├── reports/
│   ├── slice.ts                   # Слайс с pagination, filters, sortObject, rowSelectionMap
│   ├── selectors.ts               # Селекторы с защитой от undefined
│   ├── types.ts                   # Типы для слайса
│   ├── constants.ts               # Константы (REPORTS_SLICE_NAME)
│   └── index.ts                   # Экспорты
└── store.ts                       # Конфигурация стора с middleware RTK Query
```

### RTK Query API (report6406Api2.ts)

**Endpoints**:
- **Queries**: `getTasksList`, `getTaskDetails`, `getBranches`, `getSources`, `getCurrencies`, `getFormats`, `getReportTypes`, `getStorageVolumes`, `getPackagesList`
- **Mutations**: `createTask`, `cancelTasks`, `deleteTasks`, `startTasks`

**Особенности**:
- Все endpoints используют `axiosToRtk` с явными типами через `RequestParamsType` и `RequestResponseType`
- Прямая передача функции API: `axiosToRtk(API2.Service2110.Report6406TasksService.postApiV1Report6406TasksList)`
- Теги RTK Query определены в `REPORT6406_API2_TAGS`

### Поля формы (ReportsFiltersModal/fields)

Созданы версии полей формы для использования с новым стором и API2:
- `DepartmentField.tsx` — использует `useGetBranchesQuery` из `report6406Api2`
- `FormatField.tsx` — использует `useGetFormatsQuery` из `report6406Api2`
- `TypeField.tsx` — использует `useGetReportTypesQuery` из `report6406Api2`
- `StatusField.tsx` — использует enum `API2.Service2110.ReportTaskStatusEnumSchema` с маппингом из `localization.enums.ReportTaskStatus`
- `CurrencyField.tsx` — использует `useGetCurrenciesQuery(undefined)` из `report6406Api2`
- `SourceField.tsx` — использует `useGetSourcesQuery(undefined)` из `report6406Api2`

**Важно**: Для `useGetCurrenciesQuery` и `useGetSourcesQuery` необходимо передавать `undefined` в качестве параметра.

### Адаптеры данных

- **ReportTable** принимает `TaskListItemDto[]` напрямую; `preparedReportRowsList` преобразует в `ReportTableRow` для renderCell (локализация статусов внутри).
- `src/modules/Report6406Module/utils/storageVolumeToDiskSpace.ts` — преобразует `StorageVolumeItemDto` → `DiskSpace`
- `src/modules/Report6406Module/utils/packageDtoToPacketDto.ts` — преобразует `PackageDto` → `PacketDTO`
- Адаптер `taskListItemToReportDto` удалён — данные передаются в таблицу без промежуточного маппинга в ReportDTO.

### Маппинг параметров запроса

**Старый API** (`useLazyGetOnDemandReportsQuery`):
```typescript
{
  query: {
    page: 0,                    // 0-based
    limit: 15,
    report_type: [1],           // числовое значение
    sort_by: 'create_date',
    sort_order: 'desc'
  }
}
```

**Новый API2** (`useLazyGetTasksListQuery`):
```typescript
{
  requestBody: {
    filter: [{
      column: 'reportType',
      value: 'LSOZ'              // ReportTypeEnumSchema.LSOZ для формы 6406 (operator удалён — по умолчанию равенство)
    }],
    pagination: {
      number: 1,                  // 1-based
      size: 15
    },
    sorting: {
      column: 'createdAt',        // GetTasksRequestDto.column.CREATED_AT
      direction: 'desc'           // GetTasksRequestDto.direction.DESC
    }
  }
}
```

### Маппинг статусов

Маппинг статусов `ReportTaskStatus` находится в `localization.enums.ReportTaskStatus`:
- Все статусы из `API2.Service2110.ReportTaskStatusEnumSchema` добавлены в маппинг
- Компоненты используют `localization.enums.ReportTaskStatus[status]` для получения русских названий
- Тип `Localization` обновлён в `localization.types.ts`

### Выявленные проблемы и решения

1. **Ошибка инициализации слайса**: Селекторы падали с `Cannot read properties of undefined`. Решение: добавлена защита в `selectors.ts` через функцию `getReportsState`.

2. **Ошибка middleware RTK Query**: Ошибка "Middleware for RTK-Query API has not been added". Решение: добавлена проверка наличия middleware при инициализации стора.

3. **Разделение сторов**: Общие компоненты нельзя изменять. Решение: созданы компоненты-копии для нового стора в `components/`.

4. **Поля формы используют старый стор**: Поля использовали старый стор. Решение: созданы версии полей для AppRouter в `ReportsFiltersModal/fields/`, которые используют API2 через `report6406Api2`.

5. **Избыточное дублирование кода**: Папка `components/Shared/` создавала дублирование. Решение: удалена папка `Shared`, компоненты перемещены в родительскую директорию `components/`.

6. **Суффикс AppRouter в компонентах**: Суффикс создавал избыточное дублирование. Решение: удалён суффикс `AppRouter` из всех компонентов и файлов.

7. **Ошибка TypeScript при обращении к статусам**: Ошибка `TS7053: Element implicitly has an 'any' type`. Решение: добавлена проверка `!taskDetails?.status` в условие перед использованием статуса.

8. **Поле `operator` в фильтрах API2**: В **service2110** поле `operator` удалено из `GetTasksRequestDto` и связанных схем. Решение: убрано из `common.schema.ts` (FilterSchema), `tasks.schema.ts`; логика в `tasks.service.ts` упрощена — по умолчанию используется сравнение на равенство; обновлены роут-документация, тесты `tasks-filter-packageId.test.ts` и `swagger.json`. Фронт должен передавать фильтры в формате `{ column, value }` без `operator`.

9. **Сортировка**: Функция `getSortColumn` и хук/функция `getTasksSortColumn` удалены. В таблице используются имена колонок API2 (`createdAt`, `branchId`, `status`); в запросе передаётся `(sortObject?.name as GetTasksRequestDto.column) || GetTasksRequestDto.column.CREATED_AT`.

10. **Данные для таблицы отчётов**: Вместо useMemo с объектом `reportsData` используются `const reports = data?.items ?? []; const totalItems = data?.totalItems ?? 0;` (в ReportTemplateModule/Report6406Module ReportsPage и AddIntoPacketModal).

11. **Даты для API2**: Функция `toApiDate` (DD.MM.YYYY → YYYY-MM-DD) перенесена в `src/utils/date.ts` рядом с `dateToLocale`; `CreateReportFormModal` импортирует из `src/utils/date`.

12. **Хук подготовки колонок**: `usePrepareReportColumnList` и `usePrepareColumnList` (ReportDetailsFilesList) объединены в один хук `usePrepareColumnList` в `ReportTable/usePrepareColumnList.tsx`. Хук не использует роутинг; логика для `report_id` (ссылка) и фильтрация по `FEATURE_CONFIG.IsAdmin` вынесены в компонент ReportTable.

## Текущее состояние

### Выполнено

- ✅ Создан слайс `storeAppRouter/reports/` с поддержкой `pagination`, `filters`, `sortObject`, `rowSelectionMap`
- ✅ `Report6406Module/pages/ReportsPage.tsx` переведён на `useLazyGetTasksListQuery` и `storeAppRouter`
- ✅ `Report6406Module/components/AddIntoPacketModal.tsx` переведён на `useLazyGetTasksListQuery` и `storeAppRouter`
- ✅ Созданы компоненты для нового стора: `ReportTable`, `ActionBar`, `Filter`, `ReportsFiltersModal`
- ✅ Универсальный хук `usePrepareColumnList` (один хук для ReportTable и ReportDetailsFilesList), без роутинга внутри
- ✅ Адаптеры данных: `storageVolumeToDiskSpace`, `packageDtoToPacketDto`; ReportTable работает с `TaskListItemDto[]` через `preparedReportRowsList` (адаптер `taskListItemToReportDto` удалён)
- ✅ Добавлена защита в селекторах от ошибок инициализации
- ✅ Добавлена проверка middleware RTK Query
- ✅ Рефакторинг `ReportsFiltersModal`: все поля переведены на использование нового стора и API2
  - Созданы поля: `DepartmentField`, `FormatField`, `StatusField`, `TypeField`, `CurrencyField`, `SourceField`
- ✅ Рефакторинг `CreateReportFormModal`: создан с использованием API2 `createTask`
  - Создан `CreateReport` для использования в `ActionBar`
  - Все поля формы используют AppRouter-версии полей
  - Маппинг формы в `CreateTaskDto` с конвертацией дат из DD.MM.YYYY в YYYY-MM-DD
- ✅ Рефакторинг `ReportTemplateModule`:
  - `ReportTemplateModule/pages/ReportsPage.tsx` переведён на `storeAppRouter` и API2 (использует `ReportTypeEnumSchema.LSOS` для шаблона)
  - Создан `ReportDetailCard` для отображения деталей задания через API2 (`useGetTaskDetailsQuery`)
  - `ReportTemplateModule/pages/ReportDetailPage.tsx` использует `ReportDetailCard`
  - `Report6406Module/pages/ReportDetailPage.tsx` также переведён на `ReportDetailCard`
- ✅ Удалён суффикс `AppRouter` из всех компонентов и файлов
- ✅ Удалена папка `components/Shared/`, компоненты перемещены в родительскую директорию
- ✅ Рефакторинг `PacketsArchivePage.tsx`: переведён на `storeAppRouter` и API2
  - Добавлен endpoint `getPackagesList` в `report6406Api2.ts`
  - Использует `useGetPackagesListQuery` для получения списка пакетов
  - Реализованы пагинация и сортировка через API2
- ✅ Добавлены явные типы для RTK Query endpoints через `RequestParamsType` и `RequestResponseType`
- ✅ Маппинг статусов `ReportTaskStatus` добавлен в `localization.enums`
- ✅ В **service2110**: поле `operator` удалено из `GetTasksRequestDto` и схем фильтрации; логика фильтрации упрощена (по умолчанию — равенство)
- ✅ Удалены `getSortColumn` и `getTasksSortColumn`; сортировка передаётся напрямую из стора или дефолт
- ✅ Упрощена инициализация данных таблицы: `reports = data?.items ?? []`, `totalItems = data?.totalItems ?? 0`
- ✅ `toApiDate` перенесён в `src/utils/date.ts`
- ✅ Mock API2 (devServer): добавлены маршруты GET `/api/v1/report-6406/packages`, POST/DELETE `/api/v1/report-6406/tasks/`, POST `/api/v1/report-6406/tasks/cancel`, POST `/api/v1/report-6406/tasks/start`; handlers в `handlers/api2/` (handlerGetPackagesList, handlerPostTask, handlerDeleteTasks, handlerPostTasksCancel, handlerPostTasksStart); в `routesApi2.ts` убраны приведения `as any`
- ✅ Генерация моков: в `scripts/generateMockData2/generateMockData2.ts` список пакетов формируется по тому же принципу, что и storage volume (predefined или сгенерированный массив через `genPackageDto()`)

### Ветки и коммиты

- **Основной репо**: ветка `feature/TASK-024-fe-refactor-modules-appRouter`, коммиты с префиксом `TASK-024: ...`
- **Подрепо temp-private-2110**: ветка `feature/VTB-526-refactor-modules-appRouter-try2`, коммиты с префиксом `VTB-526: ...`
- **Порядок коммитов**: сначала подрепо, затем основной репо

### ⚠️ КРИТИЧНО: Требования к коммитам и пушам

**После каждой операции (после каждого логически завершённого изменения) необходимо:**

1. **Выполнить коммит и пуш в ОБА репозитория:**
   - Сначала в подрепо `temp-private-2110`
   - Затем в основной репо

2. **Язык коммитов:**
   - **В подрепо `temp-private-2110`**: коммиты должны быть **на английском языке** с префиксом `VTB-526: ...`
   - **В основном репо**: коммиты на русском языке с префиксом `TASK-024: ...`

3. **Обязательность**: Это критичное требование для поддержания синхронизации между репозиториями и отслеживания прогресса работы.

## Ключевые файлы

### Новые файлы
- `temp-private-2110/src/storeAppRouter/reports/*` — слайс для нового стора
- `temp-private-2110/src/modules/ReportTemplateModule/components/ActionBar.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/Filter.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/CreateReport.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportTable/ReportTable.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportTable/ReportTable.constants.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportTable/usePrepareColumnList.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportTable/utils/preparedReportRowsList.tsx`
- `temp-private-2110/src/utils/date.ts` — `dateToLocale`, `toApiDate`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportTable/utils/reportColumnSizesStore.ts`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportsFiltersModal/ReportsFiltersModal.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportsFiltersModal/fields/*` — поля для AppRouter
- `temp-private-2110/src/modules/ReportTemplateModule/components/CreateReportFormModal/*`
- `temp-private-2110/src/modules/Report6406Module/utils/storageVolumeToDiskSpace.ts`
- `temp-private-2110/src/modules/Report6406Module/utils/packageDtoToPacketDto.ts`
- `temp-private-2110/src/modules/ReportTemplateModule/components/ReportDetailCardNew2/ReportDetailCard.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/components/index.ts` — экспорт всех компонентов

### Изменённые файлы (frontend — temp-private-2110)
- `temp-private-2110/src/modules/Report6406Module/pages/ReportsPage.tsx`
- `temp-private-2110/src/modules/Report6406Module/pages/ReportDetailPage.tsx`
- `temp-private-2110/src/modules/Report6406Module/pages/PacketsArchivePage.tsx`
- `temp-private-2110/src/modules/Report6406Module/components/AddIntoPacketModal.tsx`
- `temp-private-2110/src/modules/Report6406Module/components/PacketsTable/PacketsTable.tsx`
- `temp-private-2110/src/modules/Report6406Module/components/PacketsArchiveActionBar/PacketsArchiveActionBar.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportsPage.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportDetailPage.tsx`
- `temp-private-2110/src/storeAppRouter/store.ts`
- `temp-private-2110/src/storeAppRouter/api/report6406Api2.ts`
- `temp-private-2110/src/utils/axiosToRtk.ts`
- `temp-private-2110/src/localization/localization.ts`
- `temp-private-2110/src/localization/localization.types.ts`

### Изменённые файлы (backend — service2110, удаление operator)
- `service2110/src/schemas/common.schema.ts` — FilterSchema без operator
- `service2110/src/schemas/report-6406/tasks.schema.ts` — GetTasksRequestDto
- `service2110/src/services/report-6406/tasks.service.ts` — упрощённая логика фильтров
- `service2110/src/routes/v1/report-6406/tasks/index.ts` — документация
- `service2110/src/schemas/report-6406/__tests__/tasks-filter-packageId.test.ts` — тесты
- `docs/public/swagger.json` — описание API

### Mock API2 (devServer, temp-private-2110)
- `temp-private-2110/webpackConfigs/devServer/routesApi2.ts` — маршруты API2
- `temp-private-2110/webpackConfigs/devServer/handlers/api2/` — handlerGetTasksList, handlerGetTaskDetails, handlerGetPackagesList, handlerGetStorageVolume, handlerPostTask, handlerDeleteTasks, handlerPostTasksCancel, handlerPostTasksStart, handlerGetReferences*.
- `temp-private-2110/scripts/generateMockData2/generateMockData2.ts` — генерация моков (packages list по тому же принципу, что и storage volume).

## Важные замечания

1. **Запрещено изменять**: `src/modules/ReportManagerLegacyModule/` и общий стор `src/store`
2. **Все обращения к API2**: через пространство имён `API2.Service2110.*`
3. **Захардкоженные данные**: заменены на RTK Query запросы
4. **⚠️ КРИТИЧНО - Коммиты и пуши**: После каждой логически завершённой операции необходимо выполнить коммит и пуш в ОБА репозитория. В подрепо `temp-private-2110` коммиты должны быть на английском языке с префиксом `VTB-526:`, в основном репо — на русском с префиксом `TASK-024:`.
5. **Параметры запросов**: Для `useGetCurrenciesQuery` и `useGetSourcesQuery` необходимо передавать `undefined` в качестве параметра.
6. **Компоненты без суффикса**: Все компоненты находятся в `components/` без суффикса `AppRouter` и без папки `Shared`.
7. **Импорты компонентов**: Используется `import { ActionBar, ReportTable, Filter } from "src/modules/ReportTemplateModule/components"`.
8. **Фильтры API2**: Формат без поля `operator`. Передавать объекты вида `{ column, value }`; бэкенд (service2110) по умолчанию использует сравнение на равенство.

## Резюме последней сессии (контекст для продолжения)

Краткий контекст выполненных работ по TASK-024 для быстрого восстановления при продолжении:

1. **Удаление `getSortColumn`**: Файл `src/modules/Report6406Module/utils/getSortColumn.ts` удалён. В `ReportTable.constants.tsx` имена колонок приведены к формату API2 (`createdAt`, `branchId`, `status`). В запросах используется `sortObject?.name` с fallback на `GetTasksRequestDto.column.CREATED_AT`. Функция `getTasksSortColumn` удалена как избыточная.

2. **Удаление адаптера `taskListItemToReportDto`**: Файл удалён. `ReportTable` принимает `TaskListItemDto[]` напрямую. `preparedReportRowsList` преобразует в `ReportTableRow` для `renderCell`; локализация статусов — внутри `renderCell` в `ReportTable.constants.tsx`.

3. **Упрощение `reportsData`**: Избыточный `useMemo` с объектом `{ reports, total_subjects }` убран в `ReportsPage.tsx` (Report6406Module, ReportTemplateModule) и в `AddIntoPacketModal.tsx`. Используются `const reports = data?.items ?? [];` и `const totalItems = data?.totalItems ?? 0;`.

4. **Перенос `toApiDate`**: Функция перенесена из `CreateReportFormModal.tsx` в `src/utils/date.ts`; импорт обновлён в модалке.

5. **Унификация хука `usePrepareColumnList`**: Хуки `usePrepareReportColumnList` и `usePrepareColumnList` (ReportDetailsFilesList) объединены в один хук в `ReportTable/usePrepareColumnList.tsx`. Роутинг и фильтрация по `FEATURE_CONFIG.IsAdmin` вынесены в компонент `ReportTable.tsx`. Старые файлы хуков удалены.

6. **Исправления TypeScript**: В `ReportTable.tsx` — тип параметра `_` в `renderCell` задан как `unknown`; тип `width` в `savedColumnSizes` приведён к `string`. В `ReportDetailsFilesList.tsx` — приведение типа для `columnFiltersMap[column.name]` и безопасное применение `filtersProps`.

7. **Мокирование мутаций API2**: Замокированы 4 эндпоинта: `POST /api/v1/report-6406/tasks` (createTask), `POST /api/v1/report-6406/tasks/cancel`, `DELETE /api/v1/report-6406/tasks`, `POST /api/v1/report-6406/tasks/start`. Обработчики в `webpackConfigs/devServer/handlers/api2/`, маршруты в `routesApi2.ts`. Пути приведены в соответствие с apiClient2 (packages без концевого слеша, tasks с слешем для POST/DELETE). Убраны приведения `as any`.

8. **Генерация моков пакетов**: В `scripts/generateMockData2/generateMockData2.ts` список пакетов формируется по тому же принципу, что и `storageVolume`: predefined или массив через `genPackageDto()`.

**Коммиты**: Сначала коммит в подрепо `temp-private-2110` с префиксом `VTB-526:` (англ.), затем в основной репо с префиксом `TASK-024:` (рус.).

**Следующий логический шаг**: при отсутствии других приоритетов — рефакторинг модуля **ReportsMenuModule**.

---

## Следующие шаги

Продолжить рефакторинг модулей ветки AppRouter согласно описанию задачи в `docs/tasks/TASK-024-fe-refactor-modules-appRouter.md`. Приоритет: при необходимости — рефакторинг **ReportsMenuModule**.
