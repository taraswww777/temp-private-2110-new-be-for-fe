# TASK-017: Спека service2110 и скрипт причёсывания (update2)

**Статус**: ✅ Выполнено  
**Ветка (основной репо):** `feature/TASK-017-fe-ui-api2-spec-and-update`  
**Ветка (подрепо temp-private-2110):** `feature/VTB-526-fe-ui-api2-spec-and-update`

**Часть общей работы:** 1 из 3 (второй контракт с бэком service2110). Следующие: [TASK-018](TASK-018-fe-ui-apiClient2-fullUpdate2.md), [TASK-019](TASK-019-fe-ui-apiMock2-generateMockData2.md).

---

## Краткое описание

Подготовить спеку второго контракта (service2110) для приложения temp-private-2110: один раз скопировать сырую спеку в rawApiDocs, причесать и положить в apiDocs; реализовать скрипт **updateLocalSwaggerFromRemote2**, чтобы при ручном обновлении raw-файла можно было получать актуальный причёсанный `service2110.json`.

---

## Контекст

- Второй контракт — **service2110** (Backend API, Fastify), спека: `service2110/docs/swagger/swagger.json`.
- Дальше с этой спекой работают TASK-018 (apiClient2) и TASK-019 (apiMock2).
- Файл в rawApiDocs в дальнейшем обновляется **вручную**.

### Подрепозиторий temp-private-2110 и задача VTB-526

В подрепозитории **temp-private-2110** работы по TASK-017 (и далее по TASK-018, TASK-019, TASK-020 в части изменений в temp-private-2110) ведутся в рамках задачи **VTB-526**. Поэтому:

- **Ветки** в temp-private-2110 создаются с префиксом задачи: `feature/VTB-526-...` (а не TASK-017 и т.п.).
- **Сообщения коммитов** в temp-private-2110 начинаются с идентификатора задачи: `VTB-526: ...`.
- **Коммит и пуш в подрепо:** после коммита в основном репозитории нужно также сделать коммит (и пуш) в подрепозитории temp-private-2110 по тем же изменениям.

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

### Дополнения (выявленные в ходе выполнения)

- **Run-скрипт** `runUpdateSwaggerApiService2110.ts` импортирует пути напрямую (через `getDirname` и `path.resolve`), а не из `config.ts`, чтобы скрипт работал без наличия файла `.env` (config при загрузке подтягивает envUtils и требует .env).
- **rawApiDocs**: файлы `*.json` в `temp-private-2110/docs/rawApiDocs/` игнорируются через `.gitignore`; в репозиторий попадает только причёсанный файл в `docs/apiDocs/service2110.json`.
