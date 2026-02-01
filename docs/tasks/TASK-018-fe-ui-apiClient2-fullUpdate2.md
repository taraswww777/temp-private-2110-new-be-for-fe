# TASK-018: apiClient2 и полная цепочка api:fullUpdate2

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-018-fe-ui-apiClient2-fullUpdate2`

**Часть общей работы:** 2 из 3 (второй контракт с бэком service2110). Предыдущая: [TASK-017](TASK-017-fe-ui-api2-spec-and-update.md). Следующая: [TASK-019](TASK-019-fe-ui-apiMock2-generateMockData2.md).

**Подрепо temp-private-2110:** изменения в подрепозитории ведутся в рамках задачи **VTB-526**: ветки — `feature/VTB-526-...`, коммиты — с префиксом `VTB-526: ...`. После коммита в основном репо нужно также сделать коммит и пуш в подрепозитории temp-private-2110.

---

## Краткое описание

Создать пакет **apiClient2** (второй сгенерированный API-клиент), настроить генерацию из причёсанной спеки `service2110.json`, при необходимости — постобработку (runFixSwaggerApi2), собрать в package.json полную цепочку **api:fullUpdate2** (update2 + gen2 + fix2). apiClient2 не должен пересекаться с apiClient.

---

## Зависимости

- **TASK-017** выполнена: в `temp-private-2110/docs/apiDocs/` лежит причёсанный `service2110.json`, есть конфиг apiService2110 и скрипт update2.

---

## Исходные данные (согласовано)

| Вопрос | Решение |
|--------|--------|
| Структура apiClient2 | Аналогична apiClient (core, api/&lt;service&gt;, constants, index.ts). **apiClient2** не должен никак пересекаться с **apiClient** (отдельные пакеты, без общих импортов). |
| Fix | Нужен отдельный **runFixSwaggerApi2** (постобработка сгенерированного клиента), подключается в цепочку api:fullUpdate2. |

---

## Требования

1. Добавить в **workspaces** в `temp-private-2110/package.json`: **apiClient2**.
2. Создать пакет **apiClient2** (структура по аналогии с apiClient: core, api/&lt;service&gt;, constants, index.ts; без пересечения с apiClient).
3. Добавить скрипт **gen2**: генерация клиента из `docs/apiDocs/service2110.json` в `apiClient2/api/...` (openapi-typescript-codegen, опции по аналогии с API1).
4. Реализовать **runFixSwaggerApi2** и скрипт `api:item:apiService2110:fix` (правки путей, типов, query и т.д. под сгенерированный код API2).
5. Собрать в package.json полную цепочку **api:fullUpdate2** = update2 + gen2 + fix2 (используя скрипты из TASK-017 для update2).

---

## Критерии приёмки

- [x] В workspaces добавлен **apiClient2**.
- [x] Пакет **apiClient2** создан, генерируется из `service2110.json`, не пересекается с apiClient.
- [x] Реализован **runFixSwaggerApi2** и подключён в цепочку.
- [x] В package.json цепочка **api:fullUpdate2** (update2 + gen2 + fix2) выполняется одной командой.

---

## Связанные задачи и артефакты

- **Предыдущая задача:** TASK-017 (спека и update2).
- **Следующая задача:** TASK-019 (apiMock2, generateMockData2) — использует apiClient2/спеку API2.
- Текущая генерация API1: `temp-private-2110/package.json` (api:fullUpdate), `temp-private-2110/scripts/swagger/fixClientApi/`
