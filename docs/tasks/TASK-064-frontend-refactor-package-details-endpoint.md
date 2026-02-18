# TASK-064: Обновление Frontend для рефакторинга endpoint получения деталей пакета

**Статус**: 📅 Запланировано
**Ветка**: —

---

## Краткое описание

Обновить Frontend для использования отрефакторенного endpoint `GET /api/v1/report-6406/packages/:id` и нового способа получения задач пакета через `POST /api/v1/report-6406/tasks/list` с параметром `includedInPacket`.

**Предыдущая задача:** [TASK-039](TASK-039-refactor-package-details-endpoint.md) — рефакторинг endpoint получения деталей пакета (Backend выполнен).

---

## Контекст

В рамках TASK-039 был выполнен рефакторинг backend:
- Endpoint `GET /api/v1/report-6406/packages/:id` больше не принимает query параметры и не возвращает `tasks` и `tasksPagination`
- Для получения задач пакета необходимо использовать `POST /api/v1/report-6406/tasks/list` с параметром `includedInPacket`
- `PackageDetailDto` объединён с `PackageDto` в один `PackageDto`

Frontend необходимо обновить для соответствия новому API.

---

## Требования

### 1. Регенерация API клиента

**Действия:**
- Выполнить регенерацию `apiClient2` из обновлённой OpenAPI спецификации
- Убедиться, что метод `getApiV1Report6406Packages1` больше не принимает query параметры
- Убедиться, что response изменился с `PackageDetailDto` на `PackageDto`

**Файлы:**
- `temp-private-2110/apiClient2/api/service2110/services/Report6406PackagesService.ts`
- `temp-private-2110/apiClient2/api/service2110/models/PackageDto.ts`
- `temp-private-2110/apiClient2/api/service2110/models/PackageDetailDto.ts` (должен быть удалён или не использоваться)

### 2. Обновление компонента PacketDetailsPage

**Файл:** `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`

**Текущее использование:**
```typescript
const requestParams = {
  id: packageId,
  tasksSortOrder: ...,
  tasksSortBy: ...,
  tasksNumber: currentPage,
  tasksSize: pageSize,
};
const { data: packetDetails } = useGetPackageDetailsQuery(requestParams);
// Использование: packetDetails?.tasks, packetDetails?.tasksPagination
```

**Требуется изменить на:**
```typescript
// Получение деталей пакета (без задач)
const { data: packetDetails } = useGetPackageDetailsQuery({ id: packageId });

// Получение задач пакета через новый endpoint
const tasksRequestParams = {
  pagination: { number: currentPage, size: pageSize },
  sorting: { direction: sortObject?.sort, column: sortObject?.name },
  filter: filters,
  includedInPacket: packageId, // Новый параметр
};
const { data: tasksData } = useGetTasksListQuery(tasksRequestParams);
// Использование: tasksData?.items, tasksData?.totalItems
```

**Изменения:**
- Убрать передачу параметров пагинации/сортировки в `useGetPackageDetailsQuery`
- Добавить отдельный запрос для получения задач через `POST /api/v1/report-6406/tasks/list` с параметром `includedInPacket`
- Обновить использование данных:
  - `packetDetails?.tasks` → `tasksData?.items`
  - `packetDetails?.tasksPagination.totalItems` → `tasksData?.totalItems`
  - `packetDetails?.tasksPagination.totalPages` → вычислять из `tasksData?.totalItems` и `pageSize`

### 3. Обновление RTK Query API

**Файл:** `temp-private-2110/src/storeAppRouter/api/report6406Api2.ts`

**Проверить:**
- Хук `useGetPackageDetailsQuery` должен соответствовать новому API (без query параметров)
- Хук `useGetTasksListQuery` должен поддерживать параметры `includedInPacket` и `excludedInPacket`

**Если требуется:**
- Обновить типы параметров для `getPackageDetails`
- Убедиться, что `getTasksList` поддерживает новые параметры

### 4. Обновление типов

**Действия:**
- Удалить использование типа `PackageDetailDto` (если он используется напрямую)
- Использовать `PackageDto` для деталей пакета
- Использовать `TasksListResponseDto` для списка задач пакета

**Файлы для проверки:**
- `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`
- `temp-private-2110/src/modules/Report6406Module/components/PacketDetailBar/PacketDetailBar.tsx`
- Другие компоненты, использующие детали пакета

### 5. Обновление обработки состояний загрузки

**Требования:**
- Обработать состояния загрузки для двух отдельных запросов:
  - Загрузка деталей пакета
  - Загрузка задач пакета
- Обеспечить корректное отображение загрузки и ошибок для обоих запросов

---

## Критерии приёмки

- [ ] API клиент регенерирован из обновлённой OpenAPI спецификации
- [ ] Метод `getApiV1Report6406Packages1` не принимает query параметры
- [ ] Response метода `getApiV1Report6406Packages1` имеет тип `PackageDto` (без `tasks` и `tasksPagination`)
- [ ] Компонент `PacketDetailsPage` обновлён:
  - [ ] Убраны query параметры из запроса деталей пакета
  - [ ] Добавлен отдельный запрос для получения задач через `POST /api/v1/report-6406/tasks/list` с `includedInPacket`
  - [ ] Обновлено использование данных (`tasksData?.items` вместо `packetDetails?.tasks`)
  - [ ] Обновлена пагинация (использование `tasksData?.totalItems`)
- [ ] RTK Query хуки обновлены для поддержки новых параметров
- [ ] Удалено использование типа `PackageDetailDto` (если использовался напрямую)
- [ ] Обработаны состояния загрузки и ошибок для обоих запросов
- [ ] Компонент корректно работает после изменений

---

## Детальные требования к реализации

### 1. Регенерация API клиента

**Команды:**
```bash
cd temp-private-2110
npm run api:fullUpdate2
```

**Проверка после регенерации:**
- Убедиться, что `Report6406PackagesService.getApiV1Report6406Packages1` принимает только `{ id: string }`
- Убедиться, что возвращаемый тип — `PackageDto`, а не `PackageDetailDto`

### 2. Обновление PacketDetailsPage.tsx

**Структура изменений:**

```typescript
// Было:
const requestParams = {
  id: packageId,
  tasksSortOrder: ...,
  tasksSortBy: ...,
  tasksNumber: currentPage,
  tasksSize: pageSize,
};
const { data: packetDetails } = useGetPackageDetailsQuery(requestParams);

// Стало:
// 1. Получение деталей пакета (без задач)
const { data: packetDetails, isLoading: isLoadingPackage } = useGetPackageDetailsQuery(
  { id: packageId },
  { skip: !packageId }
);

// 2. Получение задач пакета
const tasksRequestParams = useMemo(() => ({
  pagination: { number: currentPage, size: pageSize },
  sorting: {
    direction: (sortObject?.sort.toLowerCase() as 'asc' | 'desc') || 'asc',
    column: sortObject?.name || 'createdAt',
  },
  filter: filters,
  includedInPacket: packageId,
}), [currentPage, pageSize, sortObject, filters, packageId]);

const { data: tasksData, isLoading: isLoadingTasks } = useGetTasksListQuery(
  tasksRequestParams,
  { skip: !packageId }
);

// 3. Использование данных
const tasks = tasksData?.items || [];
const totalItems = tasksData?.totalItems || 0;
const totalPages = Math.ceil(totalItems / pageSize);
```

### 3. Обновление использования данных

**Было:**
```typescript
<ReportTable reports={packetDetails?.tasks} />
<PaginationUI totalItems={packetDetails?.tasksPagination.totalItems} />
```

**Стало:**
```typescript
<ReportTable reports={tasks} />
<PaginationUI totalItems={totalItems} />
```

### 4. Обработка состояний загрузки

```typescript
const isLoading = isLoadingPackage || isLoadingTasks;

if (isLoading) {
  return <Loader />;
}
```

---

## Связанные задачи и артефакты

- **Предыдущая задача:** [TASK-039](TASK-039-refactor-package-details-endpoint.md) — рефакторинг endpoint получения деталей пакета (Backend выполнен)
- Компонент: `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`
- RTK Query API: `temp-private-2110/src/storeAppRouter/api/report6406Api2.ts`
- API клиент: `temp-private-2110/apiClient2/api/service2110/services/Report6406PackagesService.ts`
- Backend endpoint: `GET /api/v1/report-6406/packages/:id`
- Backend endpoint для задач: `POST /api/v1/report-6406/tasks/list`

---

## Регистрация

Задание зарегистрировано в `docs/tasks/tasks-manifest.json`.
