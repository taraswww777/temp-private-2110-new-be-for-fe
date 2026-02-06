# Task Viewer Frontend

React приложение для просмотра и управления задачами проекта.

## Установка

```bash
npm install
```

## Запуск

Dev режим:

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Сборка

```bash
npm run build
```

## Storybook (UI Kit)

В проекте настроен [Storybook](https://storybook.js.org/) для изолированной разработки и просмотра UI-компонентов из `src/uiKit/`.

**Запуск в режиме разработки:**

```bash
npm run storybook
```

Storybook будет доступен по адресу: http://localhost:6006

**Сборка статического Storybook:**

```bash
npm run build-storybook
```

Собранные файлы по умолчанию попадают в каталог `storybook-static/`. В боковой панели сториз сгруппированы по категориям: **Формы** (Input, Label, Select, MultiSelect), **Обратная связь** (Badge, Button, Skeleton, Alert), **Контейнеры** (Card, Separator), **Overlay** (Dialog, Popover).

Перед первым запуском убедитесь, что зависимости установлены: `npm install`.

## Функциональность

### Список задач
- Табличное представление всех задач
- Поиск по названию и ID
- Фильтрация по статусу
- Сортировка (по ID, дате создания, статусу)
- Изменение статуса прямо из таблицы

### Детальный просмотр
- Полная информация о задаче
- Красивый рендеринг markdown
- Навигация по заголовкам
- Редактирование метаданных (title, status, branch, dates)

## Технологии

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Компоненты на базе Radix UI
- **Markdown**: react-markdown
- **HTTP Client**: fetch API
- **Routing**: React Router v6

## Примечания

- Убедитесь, что backend приложение (taskViewerBe) запущено на http://localhost:3001
- Если необходимо изменить адрес API, измените константу `API_BASE_URL` в файле `src/api/tasks.api.ts`
