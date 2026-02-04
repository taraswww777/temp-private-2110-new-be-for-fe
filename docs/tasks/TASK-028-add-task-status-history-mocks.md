# TASK-028: Добавление моков для эндпоинта истории изменения статусов задачи

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-028-add-task-status-history-mocks`

**Подрепо temp-private-2110:** изменения в подрепозитории ведутся в рамках задачи **VTB-526**: ветки — `feature/VTB-526-...`, коммиты — с префиксом `VTB-526: ...`. После коммита в основном репо нужно также сделать коммит и пуш в подрепозитории temp-private-2110.

---

## Краткое описание

Добавить моки для эндпоинта `GET /api/v1/report-6406/tasks/:id/status-history` в рамках системы моков temp-private-2110. Обновить генератор `generateMockData2.ts` для создания реалистичных последовательностей истории статусов, добавить маршрут в `routesApi2.ts` и создать обработчик для моков.

**Предыдущая задача:** [TASK-027](TASK-027-add-task-status-history-endpoint.md) — реализация эндпоинта в service2110.

---

## Контекст

Эндпоинт истории статусов был реализован в TASK-027. Для разработки фронтенда и тестирования необходимо добавить соответствующие моки в систему моков temp-private-2110.

---

## Исходные данные (согласовано)

| Вопрос | Решение |
|--------|--------|
| Моки для каждого задания | Для каждого задания должен быть свой набор историй статусов |
| Реалистичность моков | Использовать типичные последовательности статусов для реалистичности |
| Хронология | История должна иметь правильную хронологию (от старых к новым) |

---

## Требования

### Frontend (temp-private-2110)

1. **Генератор моков** (`temp-private-2110/scripts/generateMockData2/generators/genStatusHistoryItemDto.ts`):
   - Обновить генератор для создания реалистичных последовательностей истории статусов
   - Добавить функцию `genStatusHistorySequence()` для генерации последовательностей
   - Добавить типичные последовательности статусов (успешный путь, путь с ошибкой, отмена и т.д.)
   - Обеспечить правильную хронологию (правильный порядок дат)

2. **Обновить generateMockData2.ts**:
   - Использовать `genStatusHistorySequence()` для генерации истории для каждого задания
   - Для каждого задания генерируется свой набор историй статусов

3. **Маршруты** (`temp-private-2110/webpackConfigs/devServer/routesApi2.ts`):
   - Добавить маршрут `GET /api/v1/report-6406/tasks/:id/status-history`

4. **Обработчик** (`temp-private-2110/webpackConfigs/devServer/handlers/api2/handlerGetTaskStatusHistory.ts`):
   - Создать обработчик для возврата моков истории статусов из `mockData_statusHistory`

---

## Критерии приёмки

- [x] Генератор моков обновлён для создания реалистичных последовательностей истории статусов
- [x] Для каждого задания генерируется свой набор историй статусов
- [x] История имеет правильную хронологию (правильный порядок дат)
- [x] Маршрут добавлен в routesApi2.ts
- [x] Обработчик handlerGetTaskStatusHistory.ts создан
- [x] Моки корректно возвращаются для существующих заданий
- [x] Моки корректно обрабатывают несуществующие задания (возвращают пустой массив или 404)

---

## Реализованные изменения

### Frontend (temp-private-2110)

1. **Генератор моков** (`temp-private-2110/scripts/generateMockData2/generators/genStatusHistoryItemDto.ts`):
   - Добавлена функция `genStatusHistorySequence()` для создания реалистичных последовательностей
   - Добавлены типичные последовательности статусов:
     - Успешный путь DAPP -> FC: `created -> new_dapp -> registered -> upload_generation -> upload_formed -> accepted_dapp -> submitted_dapp -> started -> converting -> completed`
     - Путь с ошибкой на этапе DAPP: `created -> new_dapp -> registered -> upload_generation -> failed`
     - Путь с отменой: `created -> new_dapp -> registered -> upload_generation -> killed_dapp`
     - Путь с ошибкой на этапе FC: `created -> new_dapp -> registered -> upload_formed -> started -> start_failed`
     - Короткий путь: `created -> started -> completed`
   - Улучшена хронология (правильный порядок дат от старых к новым)

2. **Обновлён generateMockData2.ts**:
   - Используется `genStatusHistorySequence()` для генерации истории для каждого задания
   - Для каждого задания генерируется свой набор историй статусов через `statusHistory[task.id]`

3. **Маршруты** (`temp-private-2110/webpackConfigs/devServer/routesApi2.ts`):
   - Добавлен маршрут `GET /api/v1/report-6406/tasks/:id/status-history`
   - Импортирован обработчик `handlerGetTaskStatusHistory`

4. **Обработчик** (`temp-private-2110/webpackConfigs/devServer/handlers/api2/handlerGetTaskStatusHistory.ts`):
   - Создан обработчик для возврата моков истории статусов
   - Использует `mockData_statusHistory` для получения данных по taskId
   - Возвращает пустой массив для несуществующих заданий

---

## Связанные задачи и артефакты

- **Предыдущая задача:** [TASK-027](TASK-027-add-task-status-history-endpoint.md) — реализация эндпоинта в service2110
- Генератор моков: `temp-private-2110/scripts/generateMockData2/generators/genStatusHistoryItemDto.ts`
- Главный генератор: `temp-private-2110/scripts/generateMockData2/generateMockData2.ts`
- Маршруты моков: `temp-private-2110/webpackConfigs/devServer/routesApi2.ts`
- Обработчик: `temp-private-2110/webpackConfigs/devServer/handlers/api2/handlerGetTaskStatusHistory.ts`
- Моки данных: `temp-private-2110/apiMock2/generated/statusHistory.json`
