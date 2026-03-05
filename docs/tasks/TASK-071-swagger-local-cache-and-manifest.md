# TASK-071: Улучшение скриптов Swagger — локальный кэш, fallback и манифест

**Статус**: 📋 Бэклог  
**Ветка**: —

---

## Краткое описание

Добавить в скрипты обновления Swagger (`updateLocalSwaggerFromRemote` и `updateLocalSwaggerFromRemote2`) поддержку локального кэша в `docs/rawData` с датированными снапшотами, fallback на последний доступный локальный файл при недоступности удалённого Swagger URL, а также общий манифест с метаданными и хешами итоговых `apiDocs` файлов. В результате обновление swagger-спек станет более надёжным, воспроизводимым и лучше документированным.

---

## Контекст

- Уже реализован скрипт `updateLocalSwaggerFromRemote` для основного API (reportService) в `subProjects/temp-private-2110/scripts/swagger/updateLocalSwaggerFromRemote/updateLocalSwaggerFromRemote.ts`.
- Для второго контракта (service2110) ранее была реализована логика `updateLocalSwaggerFromRemote2` (см. [TASK-017](TASK-017-fe-ui-api2-spec-and-update.md)), но без общего механизма кэширования и fallback на локальные снапшоты.
- В корневом репозитории существует папка `docs/rawData`, где уже есть пример датированного файла `2026-01-27/reportService.json`, но нет общего формализованного подхода к именованию и выбору «последнего валидного» файла.
- Для планирования и трекинга задач уже используется манифест `docs/tasks/tasks-manifest.json`; аналогичный подход планируется для Swagger-снапшотов.

---

## Цели

1. **Надёжное обновление Swagger при проблемах с сетью**  
   - При недоступности Swagger URL или ошибке HTTP/парсинга скрипт должен уметь продолжать работу, используя последний подходящий локальный снапшот из `docs/rawData`.
   - При полном отсутствии подходящих локальных файлов скрипт должен явно завершаться с ошибкой, не оставляя полу-обновлённые `apiDocs`.

2. **Единая архитектура для обоих скриптов**  
   - Выделить общую функцию обработки Swagger (загрузка/чтение, парсинг, прогон через пайплайн мидлварей и сохранение результата) и переиспользовать её в:
     - `updateLocalSwaggerFromRemote` (основной контракт reportService),
     - `updateLocalSwaggerFromRemote2` (контракт service2110).

3. **Прозрачное версионирование снапшотов и итоговых файлов**  
   - Вести манифест с путями к сырым снапшотам в `docs/rawData` и хешами итоговых файлов в `subProjects/temp-private-2110/docs/apiDocs/`.
   - По хешу итогового файла уметь определять, изменился ли контракт при очередном обновлении.

4. **Гибкие настройки источника данных для Swagger**  
   - Через конфиг (`swagger.types.ts` / `config.ts`) уметь явно указывать режимы:
     - работа только с локальным файлом (игнорируя удалённый URL),
     - работа по URL с одновременным кэшированием скачанного файла в `docs/rawData`.

---

## Требования

### 1. Расширение типов и конфига Swagger

- **Файл**: `subProjects/temp-private-2110/scripts/swagger/swagger.types.ts`  
  - Добавить в интерфейс `ApiServiceConfig` опцию для управления источником данных, например:
    - `useLocalOnly?: boolean` — при `true` игнорировать `urlSwaggerApi` и работать только с локальными файлами.
    - (опционально) `snapshotKey?: string` — короткий идентификатор сервиса для именования файлов в `docs/rawData` (например, `reportService`, `service2110`).
  - Обновить JSDoc-комментарии вокруг полей, связанных с локальным файлом (`pathToLocalSwaggerJson`) и новой опцией `useLocalOnly`.

- **Файл**: `subProjects/temp-private-2110/scripts/swagger/config.ts`  
  - Для `apiReportService` и `apiService2110`:
    - добавить поле `useLocalOnly` с разумным значением по умолчанию (например, `false` для reportService, `true` для service2110, если он в основном работает от локальной спеки);
    - при необходимости задать `snapshotKey` для каждого сервиса.
  - Убедиться, что экспорт `SERVICES` остаётся обратно совместимым для существующих run-скриптов.

### 2. Схема хранения снапшотов в `docs/rawData`

- **Каталог**: `docs/rawData` (корневой репозиторий)  
  - Принять формат хранения сырых swagger-файлов:
    - `docs/rawData/YYYY-MM-DD/<snapshotKey>.json`  
      где `YYYY-MM-DD` — дата создания снапшота, `<snapshotKey>` — ключ сервиса (`reportService`, `service2110` и т.п.).
  - При успешной загрузке swagger по сети:
    - создавать (при необходимости) подпапку с текущей датой;
    - сохранять туда полученный JSON с именем `<snapshotKey>.json`.
  - Старые файлы не перезаписывать, чтобы была возможность анализа истории.

### 3. Общая функция обработки Swagger

- **Новый модуль** (предложение): `subProjects/temp-private-2110/scripts/swagger/common/updateSwagger.ts`  
  - Реализовать функцию, условно:
    - `updateSwaggerWithPipeline(config: ApiServiceConfig, options: { snapshotKey: string; middlewares: Function[]; })`.
  - Функция должна:
    1. Определять, использовать ли удалённый URL или только локальный файл на основе `config.useLocalOnly`.
    2. Пытаться получить сырой JSON:
       - если `useLocalOnly === false`:
         - сформировать `swaggerUrl = SWAGGER_HOST + config.urlSwaggerApi`;
         - попытаться скачать swagger:
           - при успехе сохранить сырую версию в `docs/rawData/YYYY-MM-DD/<snapshotKey>.json` и/или в `config.pathToLocalSwaggerJson`;
           - при ошибке перейти к поиску последнего снапшота в `docs/rawData`;
       - если `useLocalOnly === true`:
         - пропустить сетевой запрос и сразу перейти к поиску подходящего локального файла.
    3. Выбирать локальный снапшот:
       - сначала по манифесту (см. раздел 4),
       - при отсутствии метаданных — по структуре файловой системы `docs/rawData`.
       - если подходящих файлов нет — выбросить осмысленную ошибку и завершить выполнение.
    4. Парсить swagger через `$RefParser` и прогонять через переданный пайплайн мидлварей (lodash `pipe`).
    5. Сохранять итоговый JSON в `config.pathToSave` (в `subProjects/temp-private-2110/docs/apiDocs/...`).
    6. Возвращать/логировать рассчитанный хеш итогового файла.

- **Файл**: `subProjects/temp-private-2110/scripts/swagger/updateLocalSwaggerFromRemote/updateLocalSwaggerFromRemote.ts`  
  - Заменить текущую реализацию на вызов общей функции:
    - передавать соответствующий `ApiServiceConfig` (`SERVICES.apiReportService`) и полный пайплайн мидлварей, который сейчас зашит в функции.

- **Файл**: `subProjects/temp-private-2110/scripts/swagger/updateLocalSwaggerFromRemote/updateLocalSwaggerFromRemote2.ts`  
  - Реализовать/обновить аналогично:
    - использовать общий модуль;
    - передавать конфиг `SERVICES.apiService2110` и сокращённый пайплайн (по договорённости из TASK-017: `sortJsonObject` + `middlewareClearOperationParameters(['Authorization'])` и другие требуемые шаги).

### 4. Манифест Swagger-снапшотов и хешей итоговых файлов

- **Новый файл** (предложение): `subProjects/temp-private-2110/scripts/swagger/swagger.manifest.json`  
  - Структура (пример):
    ```jsonc
    {
      "reportService": {
        "snapshots": [
          { "path": "docs/rawData/2026-01-27/reportService.json", "createdAt": "2026-01-27T08:00:00Z" }
        ],
        "lastApiDocsHash": "sha256-..."
      },
      "service2110": {
        "snapshots": [
          { "path": "docs/rawData/2026-02-10/service2110.json", "createdAt": "2026-02-10T09:00:00Z" }
        ],
        "lastApiDocsHash": "sha256-..."
      }
    }
    ```
  - Обязательные действия:
    - При каждом успешном скачивании и сохранении сырого swagger:
      - добавлять запись о новом снапшоте (без удаления старых, максимум — с опциональным ограничением длины истории).
    - После сохранения итогового файла в `docs/apiDocs/...`:
      - считать хеш содержимого (например, SHA-256);
      - сравнивать с `lastApiDocsHash` для соответствующего сервиса;
      - при изменении контракта обновлять `lastApiDocsHash` и логировать факт изменения.

### 5. Fallback и поведение при отсутствии подходящих файлов

- Для обоих скриптов (`updateLocalSwaggerFromRemote`, `updateLocalSwaggerFromRemote2`) поведение должно быть одинаковым:
  - если удалённый URL недоступен (сетевые ошибки, HTTP-код != 2xx или некорректный JSON),
    - скрипт обязан попытаться использовать последний валидный локальный файл:
      - сначала по манифесту;
      - затем (при отсутствии записей) по файловой системе `docs/rawData`.
  - если ни одного подходящего файла не найдено:
    - скрипт завершает работу с ошибкой;
    - в консоль/лог выводится понятное сообщение об отсутствии доступного swagger.

---

## Критерии приёмки

- [ ] В `ApiServiceConfig` добавлены опции для управления источником swagger (минимум `useLocalOnly`), и они используются в `config.ts`.
- [ ] Реализован единый модуль/функция обработки swagger, переиспользуемая обоими скриптами.
- [ ] `updateLocalSwaggerFromRemote` и `updateLocalSwaggerFromRemote2` используют общую функцию и корректно работают с новой схемой.
- [ ] При успешной загрузке по сети swagger-файлы сохраняются в `docs/rawData/YYYY-MM-DD/<snapshotKey>.json` без перезаписи старых файлов.
- [ ] При недоступности URL скрипты корректно используют последний локальный снапшот; при полном отсутствии файлов — завершаются с ошибкой.
- [ ] В `subProjects/temp-private-2110/scripts/swagger/swagger.manifest.json` ведутся списки снапшотов и хеши итоговых файлов.
- [ ] При повторном запуске на неизменённом контракте хеш итогового файла совпадает с предыдущим, и это отражается в логах/манифесте.
- [ ] Задание зарегистрировано в `docs/tasks/tasks-manifest.json`.

---

## Связанные задачи и артефакты

- **[TASK-006](TASK-006-fix-swagger-schemas-display.md)** — исправления отображения схем в Swagger документации.
- **[TASK-017](TASK-017-fe-ui-api2-spec-and-update.md)** — спека service2110 и первый вариант скрипта updateLocalSwaggerFromRemote2.
- **[TASK-018](TASK-018-fe-ui-apiClient2-fullUpdate2.md)** — apiClient2 и полная цепочка `api:fullUpdate2`.
- **[TASK-070](TASK-070-enum-swagger.md)** — исправление enum в Swagger.
- Скрипты и конфиги:
  - `subProjects/temp-private-2110/scripts/swagger/updateLocalSwaggerFromRemote/updateLocalSwaggerFromRemote.ts`
  - `subProjects/temp-private-2110/scripts/swagger/updateLocalSwaggerFromRemote/updateLocalSwaggerFromRemote2.ts`
  - `subProjects/temp-private-2110/scripts/swagger/swagger.types.ts`
  - `subProjects/temp-private-2110/scripts/swagger/config.ts`
  - `subProjects/temp-private-2110/docs/apiDocs/`
  - `docs/rawData/`

---

## Регистрация

Задание зарегистрировано в `docs/tasks/tasks-manifest.json`.

