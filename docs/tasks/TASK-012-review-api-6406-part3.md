# TASK-012: Review API формы 6406 (Часть 3: Унификация DTO деталей)

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-012-review-api-6406-part3`

---

## Краткое описание

**Часть 3 из 3-х:** Создание единого DTO для детальной информации о задании и применение к endpoints POST /api/v1/report-6406/tasks/ и GET /api/v1/report-6406/tasks/{id}.

Эта подзадача включает создание `TaskDetailsDto`, удаление лишних полей, добавление недостающих полей для UI и применение единой схемы к обоим endpoints.

---

## Исходное описание задачи

> Фрагмент из общей формулировки ревью API формы 6406 (полный текст — в TASK-010, раздел «Исходное описание задачи»). Ниже приведена часть, относящаяся к ответам POST /tasks/ и GET /tasks/{id}.

```
POST /api/v1/report-6406/tasks/

- общая проблема - тело ответа на создание справочника и получение деталей о справочнике должно быть описано одним ДТО, тогда не было бы проблем описанных ниже 

Тело ответа
- filesCount не может быть отрицательным
- fileUrl - урл на какой файл?  мне кажется это поле лишнее
- errorMessage в 201 ответе явно лишнее
- Отсутствует поле "ID папки в S3"
- Отсутствует поле "currency" (Валюта)
- непонятно откуда брать поле "Тип" на странице детали - дополнительные параметры
- непонятно откуда брать поле "Счета" на странице детали - дополнительные параметры

GET /api/v1/report-6406/tasks/{id}
проблемы описаны выше, здесь повторяются
```

---

## Цели

- Создать единый `TaskDetailsDto` для детальной информации о задании
- Удалить лишние поля из response (errorMessage, fileUrl)
- Добавить недостающие поля для UI (s3FolderId, currency, type, accounts)
- Применить единую схему к POST (201) и GET /{id} (200)
- Завершить рефакторинг API формы 6406

---

## Детальное описание

### Контекст

**Это третья и финальная часть трёхэтапного рефакторинга** API для формы 6406. В предыдущих частях были созданы базовые схемы (TASK-010) и отрефакторен endpoint для списка заданий (TASK-011). Теперь нужно унифицировать DTO для детальной информации.

**Проблема:** Текущие response для POST /tasks/ (201) и GET /tasks/{id} (200) описаны разными схемами или inline, что приводит к дублированию и несогласованности.

**Решение:** Создать единый `TaskDetailsDto` и использовать его в обоих endpoints.

**Зависимости:**
- ✅ Требует выполнения TASK-010 (общие исправления должны быть применены)
- ⚠️ Рекомендуется выполнить TASK-011 (для последовательности)

**Связанные задачи:**
- TASK-010: Review API формы 6406 (Часть 1: Базовые схемы) - предварительное условие
- TASK-011: Review API формы 6406 (Часть 2: Рефакторинг GET /tasks/) - рекомендуется

### Требования

#### Создание TaskDetailsDto

1. **Единая схема для деталей**
   - Создать схему `TaskDetailsDto` в `components/schemas`
   - Включить все поля из текущих response POST и GET /{id}
   - Объединить поля из обоих endpoints (если есть различия)

2. **Удаление лишних полей**
   - Убрать поле `errorMessage` - для успешного ответа (201, 200) не требуется
   - Убрать поле `fileUrl` - непонятно на какой файл ссылка, скорее всего лишнее

3. **Исправление существующих полей**
   - `filesCount`: добавить `minimum: 0` (не может быть отрицательным)
   - Все ID должны быть `string`
   - Все даты должны быть `string` с `format: "date-time"`

4. **Добавление недостающих полей**
   
   Для раздела "Основная информация":
   - Все существующие поля с правильными типами и описаниями
   
   Для раздела "Дополнительные параметры" (на UI):
   - `s3FolderId` (тип: `string`, описание: "ID папки в S3")
   - `currency` (тип: `string`, описание: "Валюта (например: RUB, USD)")
   - `type` (тип: `string`, описание: "Тип задания")
   - `accounts` (тип: `array of string`, описание: "Список счетов")

5. **Описания для всех полей**
   - Убедиться что каждое поле имеет `description`
   - Использовать понятные описания для полей вроде `branchName`, `status` и т.д.

#### Применение к POST /api/v1/report-6406/tasks/

6. **Response 201 (Created)**
   - Обновить описание на "Created" или "Задание успешно создано"
   - Использовать `$ref: '#/components/schemas/TaskDetailsDto'`

#### Применение к GET /api/v1/report-6406/tasks/{id}

7. **Response 200 (OK)**
   - Обновить описание на "OK" (если ещё не обновлено в TASK-010)
   - Использовать `$ref: '#/components/schemas/TaskDetailsDto'`

### Технические детали

- Использовать `$ref` для ссылки на схему из `components/schemas`
- Обеспечить обратную совместимость или согласовать breaking changes с frontend
- Соблюдать naming convention (camelCase для полей)

---

## Критерии приёмки (Часть 3)

### TaskDetailsDto создан
- [x] Создана схема `TaskDetailsDto` в `components/schemas`
- [x] Включены все поля из текущих response POST и GET /{id}
- [x] Все ID имеют тип `string`
- [x] Все даты имеют тип `string` с `format: "date-time"`
- [x] Все поля имеют описания (`description`)

### Лишние поля удалены
- [x] Поле `errorMessage` удалено из схемы
- [x] Поле `fileUrl` удалено из схемы

### Существующие поля исправлены
- [x] Поле `filesCount` имеет `minimum: 0`
- [x] Числовые поля, которые не могут быть отрицательными, имеют `minimum: 0`

### Недостающие поля добавлены
- [x] Поле `s3FolderId` (string) добавлено
- [x] Поле `currency` (string) добавлено
- [x] Поле `type` (string) добавлено
- [x] Поле `accounts` (array of string) добавлено

### Схема применена к endpoints
- [x] POST /tasks/ response 201 использует `$ref: '#/components/schemas/TaskDetailsDto'`
- [x] POST /tasks/ response 201 имеет описание "Created" или подобное
- [x] GET /tasks/{id} response 200 использует `$ref: '#/components/schemas/TaskDetailsDto'`
- [x] GET /tasks/{id} response 200 имеет описание "OK"

### Финальная валидация
- [x] OpenAPI спецификация валидна (`swagger-cli validate`)
- [x] DTO успешно генерируются через openapi-generator без ошибок
- [x] Schemas корректно отображаются в Swagger UI
- [x] Все три части рефакторинга (TASK-010, TASK-011, TASK-012) завершены

---

## Порядок выполнения (Часть 3)

### Этап 1: Анализ текущих response

1. Прочитать текущую спецификацию POST /api/v1/report-6406/tasks/:
   - Проанализировать response 201
   - Составить список всех полей
   - Выявить inline-схемы

2. Прочитать текущую спецификацию GET /api/v1/report-6406/tasks/{id}:
   - Проанализировать response 200
   - Составить список всех полей
   - Сравнить с полями из POST

3. Выявить различия:
   - Какие поля есть только в POST
   - Какие поля есть только в GET
   - Какие поля различаются по типу

### Этап 2: Создание TaskDetailsDto

1. Создать новую схему в `components/schemas`:
   ```yaml
   TaskDetailsDto:
     type: object
     properties:
       # Основная информация
       id:
         type: string
         format: uuid
         description: "Уникальный идентификатор задания"
       
       branchId:
         type: string
         description: "Идентификатор филиала"
       
       branchName:
         type: string
         description: "Название филиала"
       
       status:
         type: string
         description: "Статус задания"
       
       # Даты
       createdAt:
         type: string
         format: date-time
         description: "Дата и время создания задания"
       
       updatedAt:
         type: string
         format: date-time
         description: "Дата и время последнего обновления"
       
       completedAt:
         type: string
         format: date-time
         nullable: true
         description: "Дата и время завершения задания"
       
       # Файлы и пакеты
       filesCount:
         type: integer
         minimum: 0
         description: "Количество файлов в задании"
       
       packagesCount:
         type: integer
         minimum: 0
         description: "Количество пакетов"
       
       # НЕ включать:
       # - errorMessage (лишнее для успешного response)
       # - fileUrl (непонятное поле)
       
       # S3 и хранилище
       s3FolderId:
         type: string
         description: "ID папки в S3"
       
       # Финансовые данные
       currency:
         type: string
         description: "Валюта (например: RUB, USD)"
       
       # Дополнительные параметры (для UI)
       type:
         type: string
         description: "Тип задания"
       
       accounts:
         type: array
         items:
           type: string
         description: "Список счетов"
       
       # ... другие существующие поля с описаниями
     
     required:
       - id
       - branchId
       - status
       - createdAt
       # ... другие обязательные поля
   ```

2. Проверить каждое поле:
   - ✅ Все ID - `string`
   - ✅ Все даты - `string` с `format: date-time`
   - ✅ Все числовые счётчики - `minimum: 0`
   - ✅ Все поля имеют `description`
   - ✅ Указаны обязательные поля в `required`

### Этап 3: Применение к POST /api/v1/report-6406/tasks/

1. Найти секцию `responses` для POST /api/v1/report-6406/tasks/

2. Обновить response 201:
   ```yaml
   '201':
     description: "Задание успешно создано"
     content:
       application/json:
         schema:
           $ref: '#/components/schemas/TaskDetailsDto'
   ```

3. Удалить inline-схему (если была)

### Этап 4: Применение к GET /api/v1/report-6406/tasks/{id}

1. Найти секцию `responses` для GET /api/v1/report-6406/tasks/{id}

2. Обновить response 200:
   ```yaml
   '200':
     description: "OK"
     content:
       application/json:
         schema:
           $ref: '#/components/schemas/TaskDetailsDto'
   ```

3. Удалить inline-схему (если была)

### Этап 5: Финальная валидация и тестирование

1. Валидировать OpenAPI спецификацию:
   ```bash
   swagger-cli validate path/to/openapi.yaml
   ```

2. Проверить генерацию DTO:
   ```bash
   npx @openapitools/openapi-generator-cli generate \
     -i path/to/openapi.yaml \
     -g typescript-fetch \
     -o ./generated
   ```
   - Убедиться что `TaskDetailsDto` генерируется корректно
   - Проверить что имя DTO человекочитаемое
   - Убедиться что нет ошибок генерации

3. Проверить в Swagger UI:
   - Открыть Swagger UI
   - Найти POST /api/v1/report-6406/tasks/
   - Проверить response 201 - должен показывать `TaskDetailsDto`
   - Найти GET /api/v1/report-6406/tasks/{id}
   - Проверить response 200 - должен показывать `TaskDetailsDto`
   - Убедиться что новые поля видны с описаниями

4. Проверить полноту рефакторинга:
   - ✅ TASK-010: Базовые схемы созданы
   - ✅ TASK-011: GET /tasks/ отрефакторен
   - ✅ TASK-012: POST и GET /{id} отрефакторены
   - ✅ Все критерии приёмки выполнены

5. Создать финальную документацию:
   - Сводка всех изменений в API
   - Список breaking changes (если есть)
   - Миграционное руководство для frontend
   - Примеры использования новых полей

### Этап 6: Согласование с frontend (если нужно)

1. Подготовить список изменений:
   - Удалённые поля: `errorMessage`, `fileUrl`
   - Добавленные поля: `s3FolderId`, `currency`, `type`, `accounts`
   - Изменённые типы: `branchId` (number → string, если применимо)

2. Уведомить frontend команду:
   - Отправить список изменений
   - Предоставить обновлённую спецификацию
   - Согласовать сроки обновления

3. При необходимости:
   - Обсудить breaking changes
   - Подготовить переходный период
   - Обновить документацию API

---

## Уточнения в процессе выполнения

- Задача выполнена. Все критерии приёмки закрыты; TaskDetailsDto применён к POST 201 и GET /{id} 200.

---

## Связанные документы

- OpenAPI спецификация формы 6406
- Swagger UI / ReDoc для просмотра API
- Документация OpenAPI Generator
- TASK-010: Созданные базовые схемы
- TASK-011: Отрефакторенный GET /tasks/

---

## Связанные задачи

- **TASK-010**: Review API формы 6406 (Часть 1: Базовые схемы) - **предварительное условие**
- **TASK-011**: Review API формы 6406 (Часть 2: Рефакторинг GET /tasks/) - рекомендуется выполнить перед этой задачей

---


