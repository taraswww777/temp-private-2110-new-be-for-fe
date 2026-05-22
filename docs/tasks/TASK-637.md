# VTB-637 FE-Aktualizaciya-API-6406

Сейчас приложение работает в соответствии с [service2110.json](../../service2110/docs/swagger/service2110.json)

В [2110.uaod-sr_6406u_microfront-s-rest-v1.oas3.json](./assets/2110.uaod-sr_6406u_microfront-s-rest-v1.oas3.json)
Изложен обновлённый контракт API.

Нужно определить разницу между тем что есть и новым.

**Scope реализации:** только mock-роуты (`service2110/src/routes/v1/`) и Zod DTO (`service2110/src/schemas/report-6406/`). Бизнес-логика, БД и тесты — вне scope.

---

## Результаты анализа (gap)

### Уже есть в DTO / роутах (менять минимально)

- `PackageDto`: `lastCopiedToTfrAt`, `status` — `packages.schema.ts`
- `TaskDetail`: `filesCount` — `tasks.schema.ts`
- `PackStatusHistoryResponseDto` — `package-status-history.schema.ts`
- `GET /tasks/{id}/status-history`, `GET /packages/{id}/status-history` — mock-роуты уже есть

### Расхождения (нужны правки)

| Область | Новый OAS | Было в коде |
|---------|-----------|-------------|
| TFR transfer | `POST /packages/transfer`, body `{ packIds }` | `POST /transfer`, body — массив ID |
| TFR delete | `POST /packages/tfr-delete` | `DELETE /tfr` |
| TFR info | `GET /packages/info/tfr` | `GET /tfr` |
| Cancel copy | `GET /packages/{id}/cancel-copy` | `POST /{id}/cancel-copy` |
| Mass delete | `POST /packages/delete/packages`, body — массив ID | `DELETE /packages/` |
| Package list response | `{ results: PackListItemDto[], totalItems }` | `{ items: PackageDto[], totalItems }` |
| Task files | `POST /tasks/{id}/files`, body `PaginationRequestDto`, response `{ files, totalItems }` | `GET /tasks/{id}/files` + querystring |
| TaskFileDto | `{ fileId, linkResult, size }` | `{ id, fileName, fileSize }` |
| TaskDetail | `s3FolderId` | `s3Path` |
| Storage | `GET /storages/volume`, `GET /storages/s3/{bucket}/list` | `GET /storage/volume` only |
| StorageResponse | `{ code, totalSize, freeSize, percent }` | `StorageVolumeItemDto` + `reservedSize` |
| Dictionary | `/dictionaries/{sources,currencies,branches,accounts}` | `/dictionary/*` + `account-masks` |
| PackTfrInfoDto | `{ packId, packName, tfrCopyDate, size }` | `{ packageId, packageName, tfrCopyDate, size }` |

### Вне scope (не трогаем без отдельного запроса)

- Связка задач с пакетом: новый OAS — `/packages/{packageId}/tasks`, текущий — `add-link-with-tasks` / `delete-link-with-tasks`
- БД-маппинг (`total_size` в байтах vs `totalFilesSize` в MB в API)
- Интеграционные тесты и реальная логика TFR/S3

### Решения по реализации

- **Dictionary:** prefix `/dictionaries`; `GET /dictionary/employee/{login}` оставляем как extension (нет в новом OAS)
- **TFR:** пути/методы/DTO выравниваем под новый контракт без обратной совместимости

---

## Задание на обновление контракта API

### Новые эндпоинты

* **Управление пакетами в TFR:**
  * Добавить эндпоинт `/report-6406/packages/transfer` для передачи пакетов в TFR
  * Добавить эндпоинт `/report-6406/packages/tfr-delete` для удаления пакетов из TFR
  * Добавить эндпоинт `/report-6406/packages/list` для расширенного поиска пакетов
  * Добавить эндпоинт `/report-6406/packages/delete/packages` для массового удаления пакетов

* **Работа со хранилищами:**
  * Добавить эндпоинт `/report-6406/storages/volume` для получения информации о хранилищах
  * Добавить эндпоинт `/report-6406/storages/s3/{bucket}/list` для получения списка файлов в S3

### Обновления существующих эндпоинтов

* **Пакетный контроллер:**
  * Добавить операцию отмены копирования пакета `/report-6406/packages/{id}/cancel-copy`
  * Добавить получение истории статусов пакета `/report-6406/packages/{id}/status-history`
  * Добавить получение информации о пакетах в TFR `/report-6406/packages/info/tfr`

* **Задача контроллер:**
  * Добавить получение истории статусов задачи `/report-6406/tasks/{id}/status-history`
  * Добавить пагинацию в получение файлов задачи `/report-6406/tasks/{id}/files`

### Изменения в DTO

* **PackageDto:**
  * Добавить поле `lastCopiedToTfrAt`
  * Добавить поле `status`

* **TaskDetailResponseDto:**
  * Добавить поле `s3FolderId`
  * Добавить поле `filesCount`

* **Новые DTO:**
  * Создать `StorageResponse` для работы с хранилищами
  * Обновить `PackTransferRequest`
  * Добавить `PackStatusHistoryResponseDto`
  * Добавить `PackTfrInfoDto`

### Новые контроллеры

* **Storage-controller:**
  * Управление хранилищами
  * Работа с S3

* **Обновления в dictionary-controller:**
  * Расширение функционала справочников
  * Добавление новых методов получения данных

### Требования к реализации

* **Валидация:**
  * Добавить проверку новых полей
  * Обновить существующие валидаторы

* **Документация:**
  * Обновить описания всех новых эндпоинтов
  * Добавить примеры запросов и ответов
  * Обновить схемы в OpenAPI спецификации

* **Тестирование:**
  * Написать тесты для новых эндпоинтов
  * Обновить существующие тесты
  * Добавить интеграционные тесты для работы с TFR
