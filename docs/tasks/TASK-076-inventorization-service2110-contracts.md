# TASK-076: API инвентаризации в service2110 (front API-28)

**Статус**: ✅ Done  
**Ветка**: (по факту — текущая рабочая ветка репозитория)  
**Приоритет**: high  

---

## Краткое описание

Добавить в `service2110` контракты (Zod DTO) и заглушки маршрутов для подсистемы инвентаризации по документу «Описание front-API-28» (сервис uaod-si-inventory). Бизнес-логику и БД не реализовывать: в ответах достаточно пустых массивов и минимально валидных объектов.

Задача **TASK-074** (контракты API-16) охватывает смежный контур; данная задача — явно целевой путь **`/api/v1/inventorization`** и согласования с `report-6406`.

---

## Принятые решения (уточнения)

| Тема | Решение |
|------|---------|
| Базовый префикс API | `/api/v1/inventorization` |
| Словари (фильтры) | Сегмент **`/dictionary/`** (не `/dictionaries/` из DOC). Шаблон пути: **`GET /dictionary/filters/<ключ-словаря>/:inventoryOrderId`**, где `<ключ-словаря>` — литералы `bs2`, `account-type`, `responsible-unit`, и т.д. Ответ БС-2: обёртка **`items`** массивом элементов **`{ id, bs2Name }`**. Остальные словари — **`items`** с **`{ id, name }`**. |
| Списки сущностей | Как в report-6406: тело с **pagination** (`PaginationRequestDto`: `page`, `limit`), **sorting** (`sortOrder`, `sortBy`), **filters**; ответ **`items` + `totalItems`** (аналог `GetTasksRequestDto` / `TasksListResponseDto`). Отдельные DTO в OpenAPI с префиксом имён **`Inventorization…`** (например `InventorizationGetOrdersListRequestDto`), чтобы не пересекаться с 6406. |
| Список счетов | Зафиксирован **`POST /accounts/list`** (тот же паттерн, что **`POST /orders/list`**, а не единственный `POST /accounts`). |
| Идентификаторы | Все бывшие UUID в контракте — **`zIdSchema` (int)** из `common.schema.ts` |
| Поле `adLogin` | С фронта **не передаётся** — не включать в body create/update приказа. В стабе create достаточно минимального поля (например **`title`**) без лишних опциональных полей. |
| `accountSurrogateKey` | Переименовать в **`accountSurrogateId`**, тип **int** (`zIdSchema`), если иное не потребует интеграция |
| Ручной учёт (`manual-unit`) | **Два маршрута**: (1) **`POST /accounts/manual-unit/:accountSurrogateId`** — один surrogate в path, тело опционально пустое `{}`; (2) **`POST /accounts/manual-unit/bulk`** — в body **`accountSurrogateIds`**: массив int (`zIdSchema`). Регистрировать **`/manual-unit/bulk` до** параметризованного `:accountSurrogateId`, чтобы не перехватывать сегмент `bulk`. |
| Ответ фильтра БС-2 | Только **`bs2Name`** (и **id** для строки); **без** `value` и **без** `orderId` в элементах ответа |
| История счёта | **`GET /accounts/surrogate/:accountSurrogateId/history`** — префикс **`surrogate`**, чтобы не конфликтовать с **`GET /accounts/:id`**. |
| Состояние процесса | Полный путь **`GET /inventory/state`** относительно базы инвентаризации (итого **`/api/v1/inventorization/inventory/state`**). Query: опциональный **`inventoryOrderId`** (int). |
| Реестр OpenAPI | Регистрация вынесена: **`schemas/report-6406/openapi-register.ts`** (`registerReport6406OpenApiSchemas`), **`schemas/inventorization/openapi-register.ts`** (`registerInventorizationOpenApiSchemas`); **`schema-registry.ts`** остаётся тонким (общие enum/общие DTO + вызов обоих регистраторов). |
| Swagger UI | Теги: **`Inventorization`**, **`Inventorization - Dictionary`**, **`Inventorization - Accounts`**, **`Inventorization - Statistics`**. |

---

## Источник эндпоинтов (из DOC, с учётом уточнений)

**Приказы**

- Список: в DOC был `GET /orders` — реализовать как **POST `/orders/list`** с пагинацией/сортировкой/фильтрами (ограничение Fastify/конвенция как у задач 6406).
- `POST /orders/new`
- `POST /orders/update`

**Словари** — все **GET**, параметр path **`inventoryOrderId`** (int), примеры полных путей:

- `GET …/dictionary/filters/bs2/:inventoryOrderId`
- `GET …/dictionary/filters/account-type/:inventoryOrderId`
- `GET …/dictionary/filters/responsible-unit/:inventoryOrderId`
- `GET …/dictionary/filters/responsible-unit-type/:inventoryOrderId`
- `GET …/dictionary/filters/inventory-status/:inventoryOrderId`
- `GET …/dictionary/filters/source-bank/:inventoryOrderId`
- `GET …/dictionary/filters/product/:inventoryOrderId`
- `GET …/dictionary/filters/manual-control-rule-number/:inventoryOrderId`

**Счета** (префикс **`/accounts`**, статичные сегменты объявлять **до** `GET /:id`)

- Список: **`POST /accounts/list`** — pagination + sorting + filters; ответ `items` + `totalItems`.
- Ручной учёт: **`POST /accounts/manual-unit/:accountSurrogateId`** (одна запись) и **`POST /accounts/manual-unit/bulk`** (массив **`accountSurrogateIds`** в body).
- `POST /accounts/inventory`, `POST /accounts/inventory/exclude`
- `GET /accounts/columns`, `POST /accounts/columns`
- `POST /accounts/export`
- `GET /accounts/:id` — деталь счёта по **id** (числовой идентификатор записи в реестре).
- История: **`GET /accounts/surrogate/:accountSurrogateId/history`**.

**Статистика**

- `POST /statistics/export`

**Состояние процесса**

- **`GET /inventory/state`** — query: опциональный **`inventoryOrderId`** (int).

Точный состав полей фильтров списка счетов и тел `inventory` / `exclude` — сверять с таблицами в MHT; для стабов допускаются минимальные объекты.

---

## Критерии приёмки

- [x] В `service2110` зарегистрирован плагин маршрутов с префиксом `/inventorization` под `/api/v1` (итого `/api/v1/inventorization/...`).
- [x] Zod-схемы вынесены в `service2110/src/schemas/inventorization/` (или согласованное имя), зарегистрированы в OpenAPI через реестр (вторая «часть» рядом с report-6406).
- [x] Списки используют тот же паттерн запроса/ответа, что список заданий 6406 (pagination, sorting, filters).
- [x] В контрактах нет UUID; идентификаторы сущностей — `zIdSchema`, `accountSurrogateId` — число.
- [x] Элементы ответа фильтра БС-2 без `value` и `orderId`, есть `bs2Name`.
- [x] Два варианта `manual-unit`: **`POST …/manual-unit/:accountSurrogateId`** и **`POST …/manual-unit/bulk`** с полем **`accountSurrogateIds`** в body.
- [x] Заглушки возвращают пустые `items` / пустые объекты там, где это уместно; Swagger собирается без ошибок.
- [x] Задание отражено в этом файле; статус в `tasks-manifest.json` обновляет исполнитель по завершении.

---

## Примечание для исполнителя

Перекрёст с **TASK-074** (API-16): при конфликте имён файлов или домена — приоритет у путей и префиксов, описанных в **этой** задаче для `service2110`.
