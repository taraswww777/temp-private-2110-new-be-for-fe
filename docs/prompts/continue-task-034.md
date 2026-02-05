# Промпт для продолжения работы над TASK-034

## Контекст задачи

**Задача:** TASK-034 - Добавление мануала по работе со скриптами API и моков  
**Статус:** ✅ Завершено (документация и структура моков актуализированы)  
**Ветка:** `feature/TASK-032-status-model-documentation` (по git status; в подрепо — уточнить)  
**Подрепо:** `temp-private-2110` (рабочая директория для изменений)

## Контекст из последней сессии (для продолжения)

- **Мануал:** `temp-private-2110/docs/scripts-manual.md` полностью актуализирован под текущую кодовую базу.
- **Два контура моков:** единообразная структура для **API (legacy)** и **API2**:
  - **API2:** `webpackConfigs/devServer/api2/` — `handlers/`, `generatedMockData/`, `routesApi2.ts`. Генератор: `scripts/generateMockData2/`, defaultMockData там же.
  - **API (legacy):** `webpackConfigs/devServer/api/` — `handlers/`, `generatedMockData/`, `routesApi.ts`. Генератор: `scripts/generateMockData/`, defaultMockData там же.
- **Удалено:** папка `apiMock2` (не используется), папка `webpackConfigs/devServer/mockData`, старый путь `webpackConfigs/devServer/handlers/api` (handlers перенесены в `api/handlers/`).
- **defaultMockData:** есть у обоих генераторов; везде используются **именованные экспорты** (`export const`), не default. generateMockData2 загружает их через `module[exportName]`.
- **GenerateMockData2Config:** в `scripts/generateMockData2/config.ts` добавлено поле `defaultPageSize` (число, по умолчанию 20); используется в `getDefaultConfig()` и пагинации.
- **Legacy API:** `generateMockData.ts` пишет в `webpackConfigs/devServer/api/generatedMockData/`; предопределённые данные из `scripts/generateMockData/defaultMockData/` мержатся с данными из api-mock (predefined в приоритете).
- **.gitkeep:** добавлены в `api/generatedMockData/` и `api2/generatedMockData/` чтобы папки хранились в git при игноре JSON.

## Что уже сделано

### 1. Документация создана и обновлена
- ✅ Создан `temp-private-2110/docs/scripts-manual.md` с полным описанием скриптов
- ✅ Добавлено содержание с навигацией
- ✅ Добавлен раздел "Требования к именованию Swagger файлов"
- ✅ Создано 7 кейсов использования с пошаговыми инструкциями
- ✅ Добавлена справочная таблица скриптов (в т.ч. `generateMockData` для legacy)
- ✅ Описана структура файлов и папок для **обоих** API (api/ и api2/)
- ✅ Добавлена ссылка в `temp-private-2110/README.md`
- ✅ **Актуализация мануала:** убраны apiMock2, mockData, старый handlers/api; добавлены api/, defaultMockData для legacy, именованные экспорты, config.defaultPageSize, .gitkeep, пути и кейсы под текущую структуру

### 2. Реорганизация скриптов в package.json
- ✅ `api:fullUpdate` теперь обновляет все актуальные API клиенты (`apiService2110`)
- ✅ Добавлен `api:fullUpdateLegacy` для устаревшего `apiReportService`
- ✅ `api:fullUpdate2` переименован в `api:item:apiService2110:fullUpdate`
- ✅ `api:fullUpdate:apiReportService` переименован в `api:item:apiReportService:fullUpdate`
- ✅ `api:item:*:api:gen_fix` переименован в `api:item:*:genAndFix`
- ✅ Скрипты отсортированы семантически (общие → конкретные сервисы)

### 3. Реорганизация структуры мок-данных для API2
- ✅ Создана папка `scripts/generateMockData2/defaultMockData/` для типизированных TS файлов (именованные экспорты)
- ✅ Handlers в `webpackConfigs/devServer/api2/handlers/`, роутинг в `api2/routesApi2.ts`
- ✅ `generateMockData2.ts` пишет в `webpackConfigs/devServer/api2/generatedMockData/`
- ✅ В `api2/generatedMockData/` добавлен `.gitkeep`; JSON в `.gitignore`
- ✅ Конфиг `config.ts`: добавлен `defaultPageSize` для пагинации

### 4. Реорганизация структуры мок-данных для API (legacy)
- ✅ Создана структура `webpackConfigs/devServer/api/`: `handlers/`, `generatedMockData/`, `routesApi.ts`, `index.ts`
- ✅ Handlers перенесены из `handlers/api/` в `api/handlers/`; `generateMockData.ts` пишет в `api/generatedMockData/`
- ✅ Добавлен `scripts/generateMockData/defaultMockData/` (defaultReferences, defaultReports, defaultReportsDetail, defaultReportFilesLists, defaultReportFiles, README, types MockDataPredefined)
- ✅ В `generateMockData.ts`: loadPredefined(), мерж predefined + api-mock (predefined в приоритете)
- ✅ В `api/generatedMockData/` добавлен `.gitkeep`; JSON в `.gitignore`

### 5. Исключение сгенерированных данных из git
- ✅ JSON из `webpackConfigs/devServer/api2/generatedMockData/` и `webpackConfigs/devServer/api/generatedMockData/` в `.gitignore`
- ✅ Папка `webpackConfigs/devServer/mockData` удалена (не использовалась)

## Текущая структура проекта

### Структура скриптов в package.json

```json
{
  "scripts": {
    "generateMockData2": "tsx scripts/run/runGenerateMockData2.ts",
    "api:fullUpdate": "npm run api:item:apiService2110:fullUpdate",
    "api:fullUpdateLegacy": "npm run api:item:apiReportService:fullUpdate",
    "api:item:apiService2110:fullUpdate": "npm run api:item:apiService2110:update && npm run api:item:apiService2110:genAndFix",
    "api:item:apiReportService:fullUpdate": "npm run api:item:apiReportService:update && npm run api:item:apiReportService:genAndFix",
    "api:item:apiService2110:update": "tsx scripts/run/runUpdateSwaggerApiService2110.ts",
    "api:item:apiService2110:gen": "openapi --input ./docs/apiDocs/service2110.json --output ./apiClient2/api/service2110 --useOptions --client axios --exportCore false --indent 2",
    "api:item:apiService2110:fix": "tsx scripts/run/runFixSwaggerApiService2110.ts",
    "api:item:apiService2110:genAndFix": "npm run api:item:apiService2110:gen && npm run api:item:apiService2110:fix",
    "api:item:apiReportService:update": "tsx scripts/run/runUpdateSwaggerApiReportService.ts",
    "api:item:apiReportService:gen": "openapi --input ./docs/apiDocs/reportService.json --output ./apiClient/api/reportService --useOptions --client axios --exportCore false --indent 2",
    "api:item:apiReportService:fix": "tsx scripts/run/runFixSwaggerApiReportService.ts",
    "api:item:apiReportService:genAndFix": "npm run api:item:apiReportService:gen && npm run api:item:apiReportService:fix"
  }
}
```

### Структура мок-данных (API2 и API legacy)

**API2:**
```
temp-private-2110/
├── scripts/generateMockData2/
│   ├── defaultMockData/              # TS файлы, именованные экспорты (export const)
│   │   ├── defaultBranches.ts, defaultTasksList.ts, defaultTaskDetails.ts, ...
│   │   └── README.md
│   ├── generators/
│   ├── generateMockData2.ts
│   ├── config.ts                     # defaultPageSize, referencesCount, tasksCount, ...
│   └── types.ts
│
└── webpackConfigs/devServer/api2/
    ├── generatedMockData/            # JSON в gitignore, .gitkeep в папке
    │   ├── .gitkeep
    │   ├── *.json
    │   └── index.ts                  # Генерируется скриптом
    ├── handlers/
    └── routesApi2.ts
```

**API (legacy):**
```
temp-private-2110/
├── scripts/generateMockData/
│   ├── defaultMockData/              # TS файлы, именованные экспорты
│   │   ├── defaultReferences.ts, defaultReports.ts, defaultReportsDetail.ts, ...
│   │   └── README.md
│   ├── generatorsMockData/
│   ├── generateMockData.ts          # Пишет в api/generatedMockData/
│   └── types.ts                      # MockDataPredefined
│
└── webpackConfigs/devServer/api/
    ├── generatedMockData/            # JSON в gitignore, .gitkeep в папке
    │   ├── .gitkeep
    │   ├── *.json
    │   └── index.ts
    ├── handlers/
    ├── routesApi.ts
    └── index.ts
```

Роутинг в dev: `routes.ts` реэкспортирует `routesApi`, к нему подключаются маршруты из `routesApi2`.

### Важные пути

- **Swagger спецификации:** `temp-private-2110/docs/apiDocs/`
- **Архивные Swagger:** `temp-private-2110/docs/rawApiDocs/` (формат: `название-сервиса-ГГГГ-ММ-ДД.json`)
- **API клиенты:** `temp-private-2110/apiClient2/api/service2110/`
- **Store:** `temp-private-2110/src/storeAppRouter/store.ts` (может быть перемещен в будущем)
- **RTK Query API:** `temp-private-2110/src/storeAppRouter/api/report6406Api2.ts` (новые сервисы добавляются сюда)

### Именование скриптов

Формат: `api:item:<serviceName>:<operation>`

- `update` — обновление Swagger JSON
- `gen` — генерация TypeScript клиента
- `fix` — исправление сгенерированного клиента
- `genAndFix` — комбинация gen + fix
- `fullUpdate` — комбинация update + genAndFix

## Что может потребоваться доработать

### 1. Документация
- [x] Актуализировать `scripts-manual.md` под текущую структуру (api/, api2/, defaultMockData для обоих, без apiMock2/mockData) — **сделано**

### 2. Структура defaultMockData
- [ ] При необходимости дополнять файлы в `generateMockData2/defaultMockData/` и `generateMockData/defaultMockData/`
- [ ] Типы: API2 — из apiClient2; legacy — MockDataPredefined в `scripts/generateMockData/types.ts`

### 3. Генерация и моки
- [ ] По необходимости: правки в `config.ts` (defaultPageSize и др.) для API2
- [ ] Проверка: `npm run generateMockData` и `npm run generateMockData2`, работа handlers в dev

## Важные детали

### Как работает генерация моков

**API2 (generateMockData2):**
1. Загрузка предопределённых данных из `scripts/generateMockData2/defaultMockData/*.ts` — **именованные экспорты** (`export const defaultBranches`, …), загрузка через `module[exportName]`.
2. Маппинг: имя экспорта (например `defaultBranches`) → ключ файла (`branches.json`).
3. Предопределённые данные мержатся с сгенерированными (predefined в приоритете).
4. Результат в `webpackConfigs/devServer/api2/generatedMockData/*.json`, генерируется `index.ts`.

**API legacy (generateMockData):**
1. Загрузка предопределённых из `scripts/generateMockData/defaultMockData/*.ts` (именованные экспорты).
2. Мерж с данными из пакета api-mock (predefined в приоритете).
3. Результат в `webpackConfigs/devServer/api/generatedMockData/*.json`.

**Общее:** handlers в `api/handlers/` и `api2/handlers/` импортируют из `../generatedMockData`.

### Требования к именованию Swagger файлов

Формат: `название-сервиса-ГГГГ-ММ-ДД.json`

Примеры:
- `service2110-2026-02-05.json`
- `service2111-2026-03-15.json`

### Разница между API1 и API2

- **API1 (Legacy):** `apiReportService`, используется в старых ветках
- **API2 (Текущий):** `apiService2110`, используется в AppRouter ветке

Для нового функционала используйте API2 и скрипты без суффикса `Legacy`.

## Последние изменения (контекст сессии)

- Актуализирован `temp-private-2110/docs/scripts-manual.md`: две структуры (api/, api2/), defaultMockData для обоих генераторов, именованные экспорты, config.defaultPageSize, .gitkeep, убраны apiMock2 и mockData.
- Legacy моки приведены к той же схеме: `webpackConfigs/devServer/api/` (handlers, generatedMockData, routesApi), defaultMockData в `scripts/generateMockData/defaultMockData/`.

## Следующие шаги (если требуется доработка)

1. При изменении DTO/эндпоинтов — при необходимости обновить генераторы и defaultMockData, затем перезапустить `generateMockData` / `generateMockData2`.
2. Держать мануал в актуальном состоянии при любых изменениях путей или скриптов.

## Важные файлы для изучения

- `temp-private-2110/docs/scripts-manual.md` — основной мануал (актуализирован)
- `temp-private-2110/scripts/generateMockData2/generateMockData2.ts` — логика генерации API2
- `temp-private-2110/scripts/generateMockData2/config.ts` — конфиг (defaultPageSize и др.)
- `temp-private-2110/scripts/generateMockData/generateMockData.ts` — логика генерации legacy, loadPredefined
- `temp-private-2110/webpackConfigs/devServer/api2/routesApi2.ts` — роутинг моков API2
- `temp-private-2110/webpackConfigs/devServer/api/routesApi.ts` — роутинг моков legacy
- `temp-private-2110/webpackConfigs/devServer/routes.ts` — объединение routesApi и routesApi2
- `temp-private-2110/src/storeAppRouter/api/report6406Api2.ts` — RTK Query API

---

**Примечание:** Все изменения выполняются в подрепо `temp-private-2110`. Ветку уточнять по текущему `git status`.
