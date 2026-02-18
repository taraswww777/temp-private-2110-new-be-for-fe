# TASK-065: Обновление Frontend для использования поля code в DTO хранилища

**Статус**: 📅 Запланировано
**Ветка**: —

---

## Краткое описание

Обновить Frontend для использования поля `code` в DTO хранилища вместо фильтрации по `name`. Реализовать фильтрацию хранилищ по коду на всех страницах: ТФР отображается только на странице ТФР, на остальных страницах ТФР исключается из отображения.

**Предыдущая задача:** [TASK-040](TASK-040-storage-volume-code-field.md) — добавление поля code в DTO хранилища (Backend выполнен).

---

## Контекст

В рамках TASK-040 был выполнен рефакторинг backend:
- Добавлено поле `code` в DTO хранилища (`StorageVolumeItemDto`)
- Создан enum `StorageCode` с значениями: `'TFR'`, `'S3'`, `'LOCAL'`
- Enum экспортирован в Swagger спецификацию как `StorageCodeEnumSchema`
- Backend возвращает поле `code` в ответе endpoint `/api/v1/report-6406/storage/volume`

Frontend необходимо обновить для использования поля `code` вместо фильтрации по `name` для корректного отображения хранилищ на разных страницах.

---

## Требования

### 1. Регенерация API клиента

**Действия:**
- Выполнить регенерацию `apiClient2` из обновлённой OpenAPI спецификации
- Убедиться, что тип `StorageVolumeItemDto` содержит поле `code: StorageCodeEnumSchema`
- Убедиться, что тип `StorageCodeEnumSchema` доступен в API клиенте

**Файлы:**
- `temp-private-2110/apiClient2/api/service2110/models/StorageVolumeItemDto.ts`
- `temp-private-2110/apiClient2/api/service2110/models/StorageCodeEnumSchema.ts` (или аналогичный)

**Команды:**
```bash
cd temp-private-2110
npm run api:fullUpdate2
```

### 2. Обновление фильтрации на странице ТФР

**Файл:** `temp-private-2110/src/modules/Report6406Module/pages/TFRPage.tsx`

**Текущее использование:**
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData.filter(({ name }) => name === "ТФР").map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

**Требуется изменить на:**
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData
    .filter(({ code }) => code === 'TFR')
    .map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

**Изменения:**
- Заменить фильтрацию `name === "ТФР"` на `code === 'TFR'`
- Использовать enum значение `'TFR'` вместо строки `"ТФР"`

### 3. Обновление фильтрации на странице деталей пакета

**Файл:** `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`

**Текущее использование:**
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData.filter(({ name }) => name !== "ТФР").map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

**Требуется изменить на:**
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData
    .filter(({ code }) => code !== 'TFR')
    .map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

**Изменения:**
- Заменить фильтрацию `name !== "ТФР"` на `code !== 'TFR'`
- Использовать enum значение `'TFR'` вместо строки `"ТФР"`

### 4. Обновление фильтрации на страницах отчётов

**Файлы:**
- `temp-private-2110/src/modules/Report6406Module/pages/ReportsPage.tsx`
- `temp-private-2110/src/modules/Report6406Module/pages/ReportDetailPage.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportsPage.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportDetailPage.tsx`

**Текущее использование:**
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData.map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

**Требуется изменить на:**
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData
    .filter(({ code }) => code !== 'TFR')
    .map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

**Изменения:**
- Добавить фильтрацию для исключения ТФР: `code !== 'TFR'`
- На страницах отчётов не должно отображаться хранилище ТФР

### 5. Обновление типов и импортов

**Действия:**
- Убедиться, что тип `StorageVolumeItemDto` содержит поле `code`
- При необходимости добавить импорт `StorageCodeEnumSchema` для типизации
- Обновить все места, где используется фильтрация хранилищ

---

## Критерии приёмки

- [ ] API клиент регенерирован из обновлённой OpenAPI спецификации
- [ ] Тип `StorageVolumeItemDto` содержит поле `code: StorageCodeEnumSchema`
- [ ] Страница ТФР (`TFRPage.tsx`) использует фильтрацию `code === 'TFR'`
- [ ] Страница деталей пакета (`PacketDetailsPage.tsx`) использует фильтрацию `code !== 'TFR'`
- [ ] Страницы отчётов используют фильтрацию `code !== 'TFR'` для исключения ТФР:
  - [ ] `Report6406Module/pages/ReportsPage.tsx`
  - [ ] `Report6406Module/pages/ReportDetailPage.tsx`
  - [ ] `ReportTemplateModule/pages/ReportsPage.tsx`
  - [ ] `ReportTemplateModule/pages/ReportDetailPage.tsx`
- [ ] Убрана фильтрация по `name` во всех компонентах
- [ ] ТФР отображается только на странице ТФР
- [ ] На остальных страницах ТФР не отображается в футере
- [ ] Все изменения протестированы

---

## Детальные требования к реализации

### 1. Регенерация API клиента

**Команды:**
```bash
cd temp-private-2110
npm run api:fullUpdate2
```

**Проверка после регенерации:**
- Убедиться, что `StorageVolumeItemDto` содержит поле `code`
- Убедиться, что тип `code` — это `StorageCodeEnumSchema` или enum с значениями `'TFR' | 'S3' | 'LOCAL'`

### 2. Обновление TFRPage.tsx

**Файл:** `temp-private-2110/src/modules/Report6406Module/pages/TFRPage.tsx`

**Изменения:**
```typescript
// Импорт enum (если доступен)
import { StorageCodeEnumSchema } from 'apiClient2/api/service2110';

// Обновление фильтрации
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData
    .filter(({ code }) => code === StorageCodeEnumSchema.TFR || code === 'TFR')
    .map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

### 3. Обновление PacketDetailsPage.tsx

**Файл:** `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`

**Изменения:**
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData
    .filter(({ code }) => code !== 'TFR')
    .map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

### 4. Обновление страниц отчётов

**Файлы:**
- `temp-private-2110/src/modules/Report6406Module/pages/ReportsPage.tsx`
- `temp-private-2110/src/modules/Report6406Module/pages/ReportDetailPage.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportsPage.tsx`
- `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportDetailPage.tsx`

**Изменения:**
Добавить фильтрацию для исключения ТФР:
```typescript
const diskSpaces = useMemo(() => {
  if (!storageVolumesData) return [];
  return storageVolumesData
    .filter(({ code }) => code !== 'TFR')
    .map(storageVolumeToDiskSpace);
}, [storageVolumesData]);
```

### 5. Использование enum значений

**Рекомендация:**
Если в API клиенте доступен enum `StorageCodeEnumSchema`, использовать его:
```typescript
import { StorageCodeEnumSchema } from 'apiClient2/api/service2110';

// Использование
.filter(({ code }) => code === StorageCodeEnumSchema.TFR)
```

Если enum недоступен, использовать строковые литералы:
```typescript
.filter(({ code }) => code === 'TFR')
```

---

## Связанные задачи и артефакты

- **Предыдущая задача:** [TASK-040](TASK-040-storage-volume-code-field.md) — добавление поля code в DTO хранилища (Backend выполнен)
- Компоненты для обновления:
  - `temp-private-2110/src/modules/Report6406Module/pages/TFRPage.tsx`
  - `temp-private-2110/src/modules/Report6406Module/pages/PacketDetailsPage.tsx`
  - `temp-private-2110/src/modules/Report6406Module/pages/ReportsPage.tsx`
  - `temp-private-2110/src/modules/Report6406Module/pages/ReportDetailPage.tsx`
  - `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportsPage.tsx`
  - `temp-private-2110/src/modules/ReportTemplateModule/pages/ReportDetailPage.tsx`
- API клиент: `temp-private-2110/apiClient2/api/service2110/models/StorageVolumeItemDto.ts`
- Backend endpoint: `GET /api/v1/report-6406/storage/volume`
- Backend enum: `StorageCodeEnumSchema` с значениями `'TFR'`, `'S3'`, `'LOCAL'`

---

## Регистрация

Задание зарегистрировано в `docs/tasks/tasks-manifest.json`.
