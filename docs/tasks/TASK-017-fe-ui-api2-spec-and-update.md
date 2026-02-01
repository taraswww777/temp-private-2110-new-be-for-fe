# TASK-017: Спека service2110 и скрипт причёсывания (update2)

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-017-fe-ui-api2-spec-and-update` (основной репо и temp-private-2110)

**Часть общей работы:** 1 из 3 (второй контракт с бэком service2110). Следующие: [TASK-018](TASK-018-fe-ui-apiClient2-fullUpdate2.md), [TASK-019](TASK-019-fe-ui-apiMock2-generateMockData2.md).

---

## Краткое описание

Подготовить спеку второго контракта (service2110) для приложения temp-private-2110: один раз скопировать сырую спеку в rawApiDocs, причесать и положить в apiDocs; реализовать скрипт **updateLocalSwaggerFromRemote2**, чтобы при ручном обновлении raw-файла можно было получать актуальный причёсанный `service2110.json`.

---

## Контекст

- Второй контракт — **service2110** (Backend API, Fastify), спека: `service2110/docs/swagger/swagger.json`.
- Дальше с этой спекой работают TASK-018 (apiClient2) и TASK-019 (apiMock2).
- Файл в rawApiDocs в дальнейшем обновляется **вручную**.

---

## Исходные данные (согласовано)

| Вопрос | Решение |
|--------|--------|
| Источник спеки | Один раз скопировать в `temp-private-2110/docs/rawApiDocs`, один раз причесать и положить в `temp-private-2110/docs/apiDocs/`. Далее работать только с причёсанным файлом. |
| Причёсывание для API2 | Только **sortJsonObject** и **middlewareClearOperationParameters(['Authorization'])**. |
| Имя причёсанного файла в apiDocs | **service2110.json** |

---

## Требования

1. **Один раз:** скопировать `service2110/docs/swagger/swagger.json` в `temp-private-2110/docs/rawApiDocs/`.
2. Добавить конфиг для второго контракта в `scripts/swagger/config.ts` (например **apiService2110**: путь к raw-файлу в rawApiDocs, путь к `apiDocs/service2110.json`, путь к apiClient2 для последующих задач).
3. Реализовать **updateLocalSwaggerFromRemote2**: чтение спеки из rawApiDocs (локальный файл), применение только `sortJsonObject` и `middlewareClearOperationParameters(['Authorization'])`, сохранение в `docs/apiDocs/service2110.json`.
4. Один раз выполнить причёсывание и убедиться, что `service2110.json` лежит в `docs/apiDocs/`.
5. Добавить в package.json скрипты: `api:item:apiService2110:update`, при необходимости обёртку для update2 (полный **api:fullUpdate2** будет в TASK-018).

---

## Критерии приёмки

- [x] Swagger скопирован в rawApiDocs; причёсанный `service2110.json` лежит в `temp-private-2110/docs/apiDocs/`.
- [x] В `scripts/swagger/config.ts` есть конфиг apiService2110 (пути к raw, apiDocs/service2110.json, apiClient2).
- [x] Реализован **updateLocalSwaggerFromRemote2** (чтение из rawApiDocs, sortJsonObject + middlewareClearOperationParameters(['Authorization']), сохранение в apiDocs/service2110.json).
- [x] В package.json добавлены скрипты для update2 (api:item:apiService2110:update и т.п.).

---

## Связанные задачи и артефакты

- **Следующая задача:** TASK-018 (apiClient2, api:fullUpdate2) — зависит от наличия `service2110.json` в apiDocs.
- Контракт: `service2110/docs/swagger/swagger.json`
- Конфиг API1: `temp-private-2110/scripts/swagger/config.ts`
- Обработка спеки API1: `temp-private-2110/scripts/swagger/updateLocalSwaggerFromRemote/`
