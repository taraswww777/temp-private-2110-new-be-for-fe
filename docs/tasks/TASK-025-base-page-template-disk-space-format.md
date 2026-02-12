# TASK-025: BasePageTemplate — отображение diskSpaces из сырых данных BE, утилита formatByteSize

**Статус**: planned  
**Ветка**: —

---

## Краткое описание

Расширить API эндпоинта `/api/v1/report-6406/storage/volume` для возврата размеров в байтах (`totalBytes`, `freeBytes`), создать утилиту форматирования размера `formatByteSize` во frontend, изменить логику отображения `diskSpaces` в **BasePageTemplate** для использования сырых данных с BE (размеры в байтах) и вывода строки вида «Свободно {free} из {total}» с человекочитаемыми значениями и единицами измерения. Пересмотреть полезность утилит `packageDtoToPacketDto`, `parseSizeToMB`, `storageVolumeToDiskSpace`.

---

## Цели

1. **Расширение API Backend**:
   - Добавить поля `totalBytes` и `freeBytes` (number, размер в байтах) в `StorageVolumeItemDto` эндпоинта `GET /api/v1/report-6406/storage/volume`.
   - Поля должны быть опциональными или обязательными (на усмотрение, но рекомендуется обязательные для консистентности).
   - Обновить схему Zod (`storageVolumeItemSchema`) и OpenAPI спецификацию.
   - Обновить сервис `StorageService.getStorageVolume()` для возврата байтов.

2. **Утилита форматирования размера во Frontend**:
   - Создать утилиту `formatByteSize` (или `formatBytes`) в `temp-private-2110/src/utils/`:
     - Преобразование размера из байтов в строку с подходящей единицей измерения (Bytes, KB, MB, GB, TB, PB);
     - Точность: максимум 2 знака после запятой;
     - Логика аналогична `formatBytesFixed` из backend (`service2110/src/utils/file-size-formatter.ts`).
   - Экспортировать утилиту для использования в компонентах.

3. **BasePageTemplate** — изменить логику отображения `diskSpaces`:
   - Изменить тип `DiskSpace`: поля `free` и `total` должны быть числами (байты) вместо текущих чисел в МБ.
   - Обновить `storageVolumeToDiskSpace` для использования `totalBytes` и `freeBytes` из API вместо парсинга строк `totalHuman` и `freeHuman`.
   - В компоненте `BasePageTemplate` использовать утилиту `formatByteSize` для форматирования значений перед отображением.
   - Строка вывода: «Свободно {free} из {total}», где `free` и `total` — отформатированные строки с единицей измерения (например, «512 Мб», «1.25 Гб»).

4. **Пересмотр утилит** — оценить необходимость и использование:
   - `packageDtoToPacketDto` — проверить использование и необходимость;
   - `parseSizeToMB` — удалить, так как больше не нужна (данные приходят в байтах);
   - `storageVolumeToDiskSpace` — упростить: убрать парсинг строк, использовать `totalBytes` и `freeBytes` напрямую.

---

## Обязательные требования (к выполнению)

### Backend

- **API эндпоинт** `GET /api/v1/report-6406/storage/volume`:
  - Добавить поля `totalBytes: number` и `freeBytes: number` в `StorageVolumeItemDto`.
  - Обновить схему Zod `storageVolumeItemSchema` в `service2110/src/schemas/report-6406/storage.schema.ts`.
  - Обновить сервис `StorageService.getStorageVolume()` для вычисления и возврата байтов.
  - Обновить OpenAPI спецификацию (`service2110.json`).

### Frontend

- **Утилита форматирования**:
  - Создать `temp-private-2110/src/utils/formatByteSize.ts` (или `formatBytes.ts`):
    - Функция принимает `bytes: number` и возвращает `string` (например, "1.50 GB", "512.00 MB").
    - Точность: максимум 2 знака после запятой.
    - Единицы измерения: Bytes, KB, MB, GB, TB, PB (1024-based).
    - Логика аналогична `formatBytesFixed` из backend.

- **BasePageTemplate**:
  - Изменить тип `DiskSpace`: `free: number` и `total: number` (байты).
  - Обновить `storageVolumeToDiskSpace` для использования `totalBytes` и `freeBytes` из API.
  - В компоненте использовать `formatByteSize` для форматирования перед отображением.
  - Отображение: «Свободно {formatByteSize(free)} из {formatByteSize(total)}».

- **Рефакторинг утилит**:
  - Удалить `parseSizeToMB` из `storageVolumeToDiskSpace.ts`.
  - Упростить `storageVolumeToDiskSpace`: использовать `totalBytes` и `freeBytes` напрямую.
  - Проверить и при необходимости удалить/рефакторить `packageDtoToPacketDto` (если не используется).

---

## Детальные требования к реализации

### 1. Backend: Расширение StorageVolumeItemDto

**Файл**: `service2110/src/schemas/report-6406/storage.schema.ts`

```typescript
export const storageVolumeItemSchema = z.object({
  id: z.string().describe('Уникальный идентификатор хранилища'),
  name: z.string().describe('Имя хранилища'),
  totalHuman: z.string().describe('Общий объём в человекочитаемом формате'),
  freeHuman: z.string().describe('Свободный объём в человекочитаемом формате'),
  percent: z.number().min(0).max(100).describe('Процент заполнения'),
  // Новые поля:
  totalBytes: z.number().int().min(0).describe('Общий объём в байтах'),
  freeBytes: z.number().int().min(0).describe('Свободный объём в байтах'),
});
```

**Файл**: `service2110/src/services/report-6406/storage.service.ts`

Обновить метод `getStorageVolume()` для возврата байтов:
```typescript
const item: StorageVolumeItem = {
  id: DEFAULT_STORAGE_ID,
  name: DEFAULT_STORAGE_NAME,
  totalHuman,
  freeHuman,
  percent,
  totalBytes,  // добавить
  freeBytes,   // добавить
};
```

### 2. Frontend: Утилита formatByteSize

**Файл**: `temp-private-2110/src/utils/formatByteSize.ts`

```typescript
/**
 * Преобразует размер в байтах в человекочитаемый формат
 * @param bytes - размер в байтах
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns отформатированная строка (например, "1.50 GB", "512.00 MB")
 */
export function formatByteSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const maxIndex = sizes.length - 1;
  const i = Math.min(maxIndex, Math.floor(Math.log(bytes) / Math.log(k)));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
```

### 3. Frontend: Обновление storageVolumeToDiskSpace

**Файл**: `temp-private-2110/src/modules/Report6406Module/utils/storageVolumeToDiskSpace.ts`

Упростить функцию:
```typescript
export const storageVolumeToDiskSpace = (
  storage: API2.Service2110.StorageVolumeItemDto
): DiskSpace => {
  const id = typeof storage.id === 'string' 
    ? parseInt(storage.id.replace(/\D/g, '')) || 0 
    : storage.id;

  return {
    id,
    name: storage.name,
    free: storage.freeBytes ?? 0,  // использовать байты напрямую
    total: storage.totalBytes ?? 0, // использовать байты напрямую
  };
};
```

### 4. Frontend: Обновление BasePageTemplate

**Файл**: `temp-private-2110/src/modules/ReportTemplateModule/components/BasePageTemplate/BasePageTemplate.tsx`

```tsx
import { formatByteSize } from 'src/utils/formatByteSize';

// В компоненте:
{diskSpaces.map(({ id, name, free, total }) => {
  const percent = (free / total) * 100;
  return (
    <Flex.Cell col={6} columnGap={24} key={id}>
      <S.ProgressPage
        label={
          <S.ProgressPageLabel>
            <T font="Body/Body 2 Long">{name}:</T>
            <T font="Body/Body 2 Long">
              Свободно {formatByteSize(free)} из {formatByteSize(total)}
            </T>
          </S.ProgressPageLabel>
        }
        percent={percent}
        appearance={percent < 80 ? "primary" : "error"}
      />
    </Flex.Cell>
  );
})}
```

### 5. Обновление типов

**Файл**: `temp-private-2110/apiClient2/api/service2110/models/StorageVolumeItemDto.ts`

После регенерации API клиента должны появиться поля:
```typescript
export type StorageVolumeItemDto = {
  // ... существующие поля
  totalBytes?: number;  // или обязательное, в зависимости от схемы
  freeBytes?: number;   // или обязательное, в зависимости от схемы
};
```

---

## Критерии приёмки

- [ ] API эндпоинт `GET /api/v1/report-6406/storage/volume` возвращает поля `totalBytes` и `freeBytes`.
- [ ] Схема Zod `storageVolumeItemSchema` обновлена с новыми полями.
- [ ] OpenAPI спецификация обновлена.
- [ ] Создана утилита `formatByteSize` во frontend с корректной логикой форматирования.
- [ ] Тип `DiskSpace` обновлён: `free` и `total` — числа (байты).
- [ ] Функция `storageVolumeToDiskSpace` упрощена: использует `totalBytes` и `freeBytes` напрямую.
- [ ] Удалена функция `parseSizeToMB`.
- [ ] `BasePageTemplate` использует `formatByteSize` для форматирования значений.
- [ ] Отображение: «Свободно {formatByteSize(free)} из {formatByteSize(total)}».
- [ ] Проверена и при необходимости удалена/отрефакторена утилита `packageDtoToPacketDto`.

---

## Связанные задачи и артефакты

- **[TASK-016](TASK-016-storage-volume-response-array.md)** — первоначальная реализация эндпоинта `/api/v1/report-6406/storage/volume`.
- **[TASK-008](TASK-008-standardize-size-storage-and-api.md)** — стандартизация хранения и передачи размеров файлов и пакетов.
- Backend утилита: `service2110/src/utils/file-size-formatter.ts` (использовать как референс для frontend утилиты).
- Frontend компонент: `temp-private-2110/src/modules/ReportTemplateModule/components/BasePageTemplate/BasePageTemplate.tsx`.
- Frontend утилита: `temp-private-2110/src/modules/Report6406Module/utils/storageVolumeToDiskSpace.ts`.

---

## Регистрация

Задание зарегистрировано в `docs/tasks/tasks-manifest.json`.
