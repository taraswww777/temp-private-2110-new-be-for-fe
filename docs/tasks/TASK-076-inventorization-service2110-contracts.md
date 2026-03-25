# TASK-076: API инвентаризации в service2110 (front API-28)

**Статус**: 📋 Backlog  
**Ветка**: (назначить исполнителю)  
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
| Словари (фильтры) | Префикс сегмента **`/dictionary/`** (например `/dictionary/filters/...`), в духе `report-6406`, не `/dictionaries/` из исходного DOC |
| Списки сущностей | Как в report-6406: тело запроса с **pagination** (`PaginationRequestDto`: `page`, `limit`), **sorting** (`sortOrder`, `sortBy`), **filters**; ответ `items` + `totalItems` (аналог `GetTasksRequestDto` / `TasksListResponseDto`) |
| Идентификаторы | Все бывшие UUID в контракте — **`zIdSchema` (int)** из `common.schema.ts` |
| Поле `adLogin` | С фронта **не передаётся** — не включать в body create/update приказа |
| `accountSurrogateKey` | Переименовать в **`accountSurrogateId`**, тип **int** (`zIdSchema`), если иное не потребует интеграция |
| Ручной учёт (`manual-unit`) | **Два метода**: (1) операция над **одной** записью — `accountSurrogateId` в **URL**; (2) **массовая** — массив числовых id **в body** |
| Ответ фильтра БС-2 | Только **`bs2Name`** (и id для строки); **без** `value` и **без** `orderId` в элементах ответа |
| Реестр OpenAPI | Разделить регистрацию схем: одна часть для **report-6406**, другая для **inventorization** (отдельный модуль(и) + тонкий `schema-registry.ts`), по аналогии с папкой `schemas/report-6406/` |

---

## Источник эндпоинтов (из DOC, с учётом уточнений)

**Приказы**

- Список: в DOC был `GET /orders` — реализовать как **POST `/orders/list`** с пагинацией/сортировкой/фильтрами (ограничение Fastify/конвенция как у задач 6406).
- `POST /orders/new`
- `POST /orders/update`

**Словари** (`/dictionary/filters/...`), все **GET**, в path — `inventoryOrderId` (int):

- `bs2`, `account-type`, `responsible-unit`, `responsible-unit-type`, `inventory-status`, `source-bank`, `product`, `manual-control-rule-number`

**Счета**

- Список: **POST `/accounts`** (или `/accounts/list` — зафиксировать один вариант в коде и в Swagger) с pagination + sorting + filters.
- Ручной учёт: отдельный single + bulk (см. выше).
- `POST /accounts/inventory`, `POST /accounts/inventory/exclude`
- `GET /accounts/columns`, `POST /accounts/columns`
- `POST /accounts/export`
- `GET /accounts/:id` — деталь счёта по **id**
- История: путь без коллизии с `/:id`, например **`GET /accounts/surrogate/:accountSurrogateId/history`** (или иной явный префикс).

**Статистика**

- `POST /statistics/export`

**Состояние процесса**

- `GET /inventory/state` с опциональным query **`inventoryOrderId`** (int), если в DOC фигурирует опциональный идентификатор приказа.

Точный состав полей фильтров списка счетов и тел `inventory` / `exclude` — сверять с таблицами в MHT; для стабов допускаются минимальные объекты.

---

## Критерии приёмки

- [ ] В `service2110` зарегистрирован плагин маршрутов с префиксом `/inventorization` под `/api/v1` (итого `/api/v1/inventorization/...`).
- [ ] Zod-схемы вынесены в `service2110/src/schemas/inventorization/` (или согласованное имя), зарегистрированы в OpenAPI через реестр (вторая «часть» рядом с report-6406).
- [ ] Списки используют тот же паттерн запроса/ответа, что список заданий 6406 (pagination, sorting, filters).
- [ ] В контрактах нет UUID; идентификаторы сущностей — `zIdSchema`, `accountSurrogateId` — число.
- [ ] Элементы ответа фильтра БС-2 без `value` и `orderId`, есть `bs2Name`.
- [ ] Два варианта `manual-unit`: по одному id в URL и массовый с массивом id в body.
- [ ] Заглушки возвращают пустые `items` / пустые объекты там, где это уместно; Swagger собирается без ошибок.
- [ ] Задание отражено в этом файле; статус в `tasks-manifest.json` обновляет исполнитель по завершении.

---

## Примечание для исполнителя

Перекрёст с **TASK-074** (API-16): при конфликте имён файлов или домена — приоритет у путей и префиксов, описанных в **этой** задаче для `service2110`.
