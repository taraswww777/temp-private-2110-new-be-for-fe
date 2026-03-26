# TASK-076: API инвентаризации в service2110 (front API-28)

**Статус**: ✅ Done (базовые маршруты и стабы; **контракты Zod/OpenAPI требуют доработки по полям** — см. раздел ниже)  
**Ветка**: (по факту — текущая рабочая ветка репозитория)  
**Приоритет**: high  

---

## Маппинг URL: DOC «Описание front-API-28» → `service2110`

База в DOC — относительные пути сервиса инвентаризации (без общего префикса BFF). В `service2110` полный префикс: **`/api/v1/inventorization`**.

| Было в DOC (uaod-si-inventory) | Стало в service2110 |
|------------------------------|---------------------|
| `GET /orders` | `POST /orders/list` |
| `GET /dictionaries/filters/.../{inventoryOrderId}` | `GET /dictionary/filters/.../:inventoryOrderId` (сегмент `dictionary`, не `dictionaries`) |
| `POST /accounts` | `POST /accounts/list` |
| `POST /accounts/manual-unit/{accountSurrogateKeys}` | `POST /accounts/manual-unit/:accountSurrogateId` (один ключ в path) **и** `POST /accounts/manual-unit/bulk` (массив в body) |
| `GET /accounts/{accountSurrogateKey}/history` | `GET /accounts/surrogate/:accountSurrogateId/history` |
| `GET /inventory/state/{ID опционально}` | `GET /inventory/state` с query `inventoryOrderId` (опционально) |

Остальные пути (`/orders/new`, `/orders/update`, `/accounts/inventory`, `/accounts/inventory/exclude`, `/accounts/columns`, `/accounts/export`, `/accounts/:id`, `/statistics/export`) — **те же относительные сегменты**, меняется только префикс до `/api/v1/inventorization/...`.

**Имена параметров в DOC:** встречается опечатка `invertoryOrderId` — в контрактах использовать `inventoryOrderId`.

### Допустимые отклонения от «Описание front-API-28»

Если факт реализации или структура API в `service2110` расходятся с исходной постановкой, в рамках этой задачи **допустимо только**:

- **ренейминг** полей (в т.ч. унификация имён, замена устаревших имён в DOC на согласованные в проекте — например `accountSurrogateKey` → `accountSurrogateId`);
- **группировка** — вложенность и состав вложенных объектов (`pagination`, `sorting`, `filters`, разбиение на несколько маршрутов вместо одного и т.п.).

**Весь атрибутный состав** запросов и ответов по DOC **должен быть отражён в Zod/OpenAPI** (ни одного атрибута из постановки не опускаем из контракта). Сужение типов по правилам проекта (например UUID → `zIdSchema`) — не считается удалением атрибута.

**Стабы** могут возвращать пустые массивы и минимальные значения, но это **не основание** для урезания полей в схемах: DTO обязаны покрывать полный набор атрибутов из DOC (кроме явно исключённых отдельной строкой в таблице решений, например `adLogin` в body).

---

## Краткое описание

Добавить в `service2110` контракты (Zod DTO) и заглушки маршрутов для подсистемы инвентаризации по документу «Описание front-API-28» (сервис uaod-si-inventory). Бизнес-логику и БД не реализовывать: в ответах стабов достаточно пустых массивов и минимальных значений, при этом **схемы DTO** отражают полный атрибутный состав DOC (см. «Допустимые отклонения»).

Задача **TASK-074** (контракты API-16) охватывает смежный контур; данная задача — явно целевой путь **`/api/v1/inventorization`** и согласования с `report-6406`.

---

## Принятые решения (уточнения)

| Тема | Решение |
|------|---------|
| Базовый префикс API | `/api/v1/inventorization` |
| Словари (фильтры) | Сегмент **`/dictionary/`** (не `/dictionaries/` из DOC). Шаблон пути: **`GET /dictionary/filters/<ключ-словаря>/:inventoryOrderId`**, где `<ключ-словаря>` — литералы `bs2`, `account-type`, `responsible-unit`, и т.д. Ответы — обёртка **`items`**; **элементы** — полный набор атрибутов из DOC для данного словаря (допустимы ренейминг и группировка). |
| Списки сущностей | **Счета** — как `getTasksRequestSchema` в report-6406: **pagination**, **sorting**, **filters** (optional-объект с опциональными полями). **Приказы** — то же по ответу (`items` + `totalItems`), но **в теле запроса списка приказов нет `filters`** (только pagination + sorting). DTO в OpenAPI с префиксом **`Inventorization…`**. |
| Список счетов | Зафиксирован **`POST /accounts/list`** (тот же паттерн, что **`POST /orders/list`**, а не единственный `POST /accounts`). |
| Идентификаторы | Все бывшие UUID в контракте — **`zIdSchema` (int)** из `common.schema.ts` |
| Поле `adLogin` | С фронта **не передаётся** — не включать в body create/update приказа. **Схемы** create/update по остальным полям — **полный атрибутный состав из DOC**; стаб может отвечать минимальными значениями. |
| `accountSurrogateKey` | Переименовать в **`accountSurrogateId`**, тип **int** (`zIdSchema`), если иное не потребует интеграция |
| Ручной учёт (`manual-unit`) | **Два маршрута**: (1) **`POST /accounts/manual-unit/:accountSurrogateId`** — один surrogate в path, тело опционально пустое `{}`; (2) **`POST /accounts/manual-unit/bulk`** — в body **`accountSurrogateIds`**: массив int (`zIdSchema`). Регистрировать **`/manual-unit/bulk` до** параметризованного `:accountSurrogateId`, чтобы не перехватывать сегмент `bulk`. |
| Ответ фильтра БС-2 | Все атрибуты элемента из DOC **сохраняются** в DTO; допустим только **renaming** (например имя поля заказа в DOC → `inventoryOrderId` в контракте). Не выкидывать `value` и прочие поля из постановки без отдельного решения вне рамок «только ренейминг и группировка». |
| История счёта | **`GET /accounts/surrogate/:accountSurrogateId/history`** — префикс **`surrogate`**, чтобы не конфликтовать с **`GET /accounts/:id`**. |
| Состояние процесса | Полный путь **`GET /inventory/state`** относительно базы инвентаризации (итого **`/api/v1/inventorization/inventory/state`**). Query: опциональный **`inventoryOrderId`** (int). |
| Реестр OpenAPI | Регистрация вынесена: **`schemas/report-6406/openapi-register.ts`** (`registerReport6406OpenApiSchemas`), **`schemas/inventorization/openapi-register.ts`** (`registerInventorizationOpenApiSchemas`); **`schema-registry.ts`** остаётся тонким (общие enum/общие DTO + вызов обоих регистраторов). |
| Swagger UI | Теги: **`Inventorization`**, **`Inventorization - Dictionary`**, **`Inventorization - Accounts`**, **`Inventorization - Statistics`**. |

---

## Источник эндпоинтов (из DOC, с учётом уточнений)

**Приказы**

- Список: в DOC был `GET /orders` — реализовать как **POST `/orders/list`** с пагинацией и сортировкой (без блока `filters` в теле; по аналогии с report-6406 по структуре `pagination` / `sorting`).
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

Точный состав полей — таблицы в MHT; **в DTO** — полный набор атрибутов; в ответах стабов — по-прежнему допустимы пустые/минимальные значения.

---

## Критерии приёмки

- [x] В `service2110` зарегистрирован плагин маршрутов с префиксом `/inventorization` под `/api/v1` (итого `/api/v1/inventorization/...`).
- [x] Zod-схемы вынесены в `service2110/src/schemas/inventorization/` (или согласованное имя), зарегистрированы в OpenAPI через реестр (вторая «часть» рядом с report-6406).
- [x] Список счетов — как задания 6406: pagination, sorting, filters. Список приказов — pagination, sorting (без filters).
- [x] В контрактах нет UUID; идентификаторы сущностей — `zIdSchema`, `accountSurrogateId` — число.
- [ ] Все DTO инвентаризации покрывают **полный атрибутный состав** DOC по каждому endpoint (отклонения — только ренейминг и группировка; см. раздел «Допустимые отклонения» и исключения в таблице решений).
- [x] Два варианта `manual-unit`: **`POST …/manual-unit/:accountSurrogateId`** и **`POST …/manual-unit/bulk`** с полем **`accountSurrogateIds`** в body.
- [x] Заглушки возвращают пустые `items` / пустые объекты там, где это уместно; Swagger собирается без ошибок.
- [x] Задание отражено в этом файле; статус в `tasks-manifest.json` обновляет исполнитель по завершении.

---

## Доработки DTO (довести до полного атрибутного состава DOC)

Структура и стиль — **как в `service2110/src/schemas/report-6406/`** (`pagination` / `sorting` / `filters`, `.describe()`, `items` + `totalItems`). Отличия от DOC — **только ренейминг и группировка**; все атрибуты из таблиц MHT должны присутствовать в соответствующих Zod-схемах.

### Приказы (`orders.schema.ts`)

- Имена полей: где в DOC **`orderFileLink`**, в контракте допустим синоним (**`orderFile`** и т.п.) при сохранении семантики — оформить в описании OpenAPI.
- **`POST /orders/new`**, **`POST /orders/update`**: довести тела до **полного набора полей из DOC** (кроме исключённого `adLogin`).

### Счета — элемент списка и деталь (`inventoryAccountListItem`, `inventoryAccountDetail`)

В DOC для строки списка и карточки счёта задан большой набор полей. Сейчас в схемах фактически только `id`, `accountSurrogateId`, `accountNumber`. **Отсутствуют (минимальный перечень из DOC):** `accountOpenDate`, тип счёта (как int/справочник), поля по БС/банку/продукту/подразделениям, статусы инвентаризации, суммы/остатки, признаки расхождений, `resolutionDate`, **`manualUnit`** (строка с подразделением, выставленным вручную) и др. Нужно перенести таблицу ответа из раздела **3.1 POST /accounts** (параметры ответа `items[]`) в Zod-объект(ы) списка и детали (деталь может совпадать со списком или быть расширением).

### Ручной учёт (`manual-unit`)

- В DOC для `POST .../manual-unit` в body: **`manualResponsibleUnit`** (string), **`force`** (boolean). В текущих DTO для одиночного вызова body не описан (пустой объект). Добавить опциональные поля.
- Для **bulk** в DOC отдельного метода нет; при необходимости те же поля — как опция на всю операцию или не включать (согласовать).

### `POST /accounts/inventory` и `POST /accounts/inventory/exclude`

- В DOC тело **`POST /accounts/inventory`** включает: `accountSurrogateKeys` (массив), **`manualInventoryAccountStatus`** (string), **`discrepancyDescription`** (string), **`discrepancySum`** (decimal string) и далее по таблице DOC. Сейчас только `inventoryOrderId` и опционально `accountIds`. Привести к DOC (имена `accountSurrogateIds` + int — по правилам проекта).

### Колонки таблицы счетов

- В DOC — **`isVisible`**; если в схеме другое имя (**`visible`**), считать это **renaming**; атрибут и семантика должны быть сохранены.

### Экспорт счетов `POST /accounts/export`

- В DOC: **`accountSurrogateKeys`** (массив) и **`filter`** (объект с теми же фильтрами, что список, если список ключей пуст). Сейчас только `inventoryOrderId`, `format`. Добавить поля по DOC.

### Экспорт статистики `POST /statistics/export`

- В DOC: объект **`filters`** с тем же составом, что фильтры списка счетов (bs2, accountNum, …), плюс типичные поля выгрузки. Сейчас только `inventoryOrderId`, `format`. Расширить DTO.

### История счёта `GET .../history`

- В DOC элемент истории: **`changedAt`**, **`changedBy`**, **`fieldName`**, **`oldValue`**, **`newValue`** и т.д. Текущие **`action` + `id`** не заменяют полный состав — **все атрибуты из DOC** должны быть в DTO (допустимо оставить вычисляемое поле как дополнение, но не вместо атрибутов DOC).

### Состояние процесса `GET /inventory/state`

- В DOC ответ включает осмысленный **`status`** string(20) с перечислением: `in_progress`, `pending`, `completed`, `reopened` (и пояснения). Сейчас `status` + `progressPercent` — **добавить enum/описание допустимых значений** в OpenAPI; при необходимости — дополнительные поля из DOC (в т.ч. строка про заполнение данными приказа, если бэкенд будет отдавать).

### Словари

- Элементы ответов словарей (в т.ч. **БС-2**): **все поля из DOC** в DTO; отличия только по **renaming** (например опечатки в имени параметра пути) и типам (`zIdSchema` вместо UUID).

---

## Примечание для исполнителя

Перекрёст с **TASK-074** (API-16): при конфликте имён файлов или домена — приоритет у путей и префиксов, описанных в **этой** задаче для `service2110`.
