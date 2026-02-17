# TASK-043: Обратная связь по API контракту от Backend

**Статус**: ✅ Выполнено
**Ветка**: `feature/TASK-043-api-contract-feedback-backend`

---

## Краткое описание

Реализовать изменения в API контракте на основе обратной связи: добавить справочник валют, убрать устаревшие endpoints, обновить структуру endpoints справочников, обработать AccountMasks.

---

## Исходное описание задачи

> Данный раздел содержит оригинальное описание задачи для оперативного обращения.

**Источник:** [Заметки от 05.02.2026](../../../temp-private-2110/docs/notes/2026-02-05.md#обратная-связь-по-api-контракту-от-be-тарас)

---

## Цели

- Добавить справочник списка валют
- Убрать устаревшие endpoints
- Обновить структуру endpoints справочников
- Обработать AccountMasks в виде связанного списка
- Добавить endpoint получения данных о пользователе
- Переименовать `/references` в `/dictionary`
- Проработать имя endpoint списка заданий

---

## Детальное описание

### Контекст

На основе обратной связи от команды необходимо внести изменения в API контракт для улучшения структуры и согласованности.

### Требования

#### 1. Справочник списка валют

**Добавить endpoint:**
- `GET /api/v1/report-6406/dictionary/currencies` (после переименования)

**Response:**
```json
{
  "currencies": [
    {
      "code": "RUB",
      "name": "Российский рубль"
    },
    {
      "code": "USD",
      "name": "Доллар США"
    }
  ]
}
```

#### 2. Убрать устаревшие endpoints

**Удалить:**
- `/api/v1/report-6406/references/report-types`

#### 3. Обновить endpoints справочников

**Текущие endpoints:**
- `/api/v1/report-6406/references/branches`
- `/api/v1/report-6406/references/sources`

**Изменения:**
- Переименовать `/references` в `/dictionary`
- Обновить структуру response для branches

**Новый формат `/dictionary/branches`:**
```json
{
  "branches": [
    {
      "id": 21,
      "codeCB": "00",
      "codeDAPP": "00000",
      "name": "Филиал Банка в г. Воронеж"
    }
  ]
}
```

**Новый endpoint `/dictionary/sources`:**
- В back: `/reference/origin`
- Адаптировать под структуру `/dictionary`

#### 4. Обработка AccountMasks

**Endpoint:** `GET /api/v1/report-6406/dictionary/account-masks`

**Response (связанный список):**
```json
[
  {
    "firstAccount": 123,
    "secondAccounts": [12345, 12545]
  },
  {
    "firstAccount": 456,
    "secondAccounts": [67890, 67891]
  }
]
```

#### 5. Запрос данных о пользователе

**Endpoint:** `GET /api/v1/report-6406/dictionary/employee/{adLogin}`

**Response:**
```json
{
  "fullName": "Иванов Иван Иванович",
  "adLogin": "vtb12345678"
}
```

**DTO:**
- `fullName` (string, maxLength: 50) - ФИО сотрудника
- `adLogin` (string, maxLength: 30, pattern: `^([^А-Яа-я\\,\\s\\:]+)$`) - AD-логин сотрудника без домена

#### 6. Переименование `/references` в `/dictionary`

**Изменения:**
- Все endpoints `/api/v1/report-6406/references/*` → `/api/v1/report-6406/dictionary/*`
- Обновить все места использования
- Обновить документацию

#### 7. Проработка имени endpoint списка заданий

**Текущий endpoint:**
- `/api/v1/report-6406/tasks/list`

**Требуется:**
- Проработать и согласовать новое имя endpoint
- Возможные варианты:
  - `/api/v1/report-6406/tasks` (GET с query параметрами)
  - `/api/v1/report-6406/tasks/search`
  - Оставить как есть

---

## Критерии приёмки

### Справочник валют
- [x] Добавлен endpoint `/api/v1/report-6406/dictionary/currencies`
- [x] Реализована логика получения списка валют
- [x] Обновлена OpenAPI спецификация

### Удаление устаревших endpoints
- [x] Удалён endpoint `/api/v1/report-6406/references/report-types`
- [x] Обновлена документация

### Обновление endpoints справочников
- [x] Обновлён endpoint `/dictionary/branches` с новой структурой
- [x] Обновлён endpoint `/dictionary/sources`
- [x] Обновлена OpenAPI спецификация

### AccountMasks
- [x] Реализован endpoint `/api/v1/report-6406/dictionary/account-masks`
- [x] Response в формате связанного списка
- [x] Обновлена OpenAPI спецификация

### Данные о пользователе
- [x] Реализован endpoint `/api/v1/report-6406/dictionary/employee/{adLogin}`
- [x] Реализована валидация adLogin
- [x] Обновлена OpenAPI спецификация

### Переименование
- [x] Все endpoints `/references` переименованы в `/dictionary`
- [x] Обновлены все места использования
- [x] Обновлена документация

### Имя endpoint списка заданий
- [x] Проработано и согласовано новое имя
- [x] Выполнено переименование (если требуется) - Оставлено как было
- [x] Обновлена документация

### Общие критерии
- [x] Все изменения протестированы
- [x] Обновлена OpenAPI спецификация
- [x] Обновлена документация
- [x] Обеспечена обратная совместимость или согласованы breaking changes

---

## Порядок выполнения

1. Проанализировать текущую структуру endpoints справочников
2. Добавить справочник валют
3. Удалить устаревшие endpoints
4. Обновить структуру endpoints справочников
5. Реализовать AccountMasks как связанный список
6. Добавить endpoint получения данных о пользователе
7. Переименовать `/references` в `/dictionary`
8. Проработать имя endpoint списка заданий
9. Обновить OpenAPI спецификацию
10. Обновить документацию
11. Протестировать все изменения

---

## Связанные документы

- [Заметки от 05.02.2026](../../subProjects/temp-private-2110/docs/notes/2026-02-05.md)

---

