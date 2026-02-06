# TASK-055: Storybook и UI Kit в Task Viewer (taskViewerFe)

**Статус**: ✅ Выполнено  
**Ветка**: `feature/TASK-055-storybook-ui-kit-taskviewer-fe`

---

## Краткое описание

Добавить Storybook в проект taskViewerFe для удобной отладки и разработки UI-компонентов, а также развить более полноценный UI Kit на базе компонентов из `taskViewerFe/src/uiKit/`.

---

## Цели

- Настроить Storybook в папке taskViewerFe
- Добавить сториз для всех компонентов в `taskViewerFe/src/components/ui/`
- Обеспечить возможность изолированной отладки компонентов (варианты пропсов, состояния)
- Дополнить и структурировать UI Kit: документировать варианты использования, добавить недостающие варианты/примеры

---

## Детальное описание

### Контекст

В `taskViewerFe/src/components/ui/` находятся переиспользуемые UI-компоненты (badge, button, card, dialog, input, label, multi-select, popover, select, separator и др.). Сейчас их отладка возможна только в контексте страниц приложения. Storybook позволит просматривать и тестировать компоненты изолированно, с разными пропсами и состояниями, что ускорит разработку и улучшит консистентность UI.

### Требования

#### 1. Установка и настройка Storybook

- Установить Storybook для React + Vite в `taskViewerFe/`
- Настроить совместимость с существующим стеком: React 19, TypeScript, Tailwind CSS, PostCSS
- Обеспечить загрузку глобальных стилей (Tailwind и т.д.) в сториз
- Добавить npm-скрипты, например: `storybook`, `build-storybook`

#### 2. Сториз для компонентов ui/

Для каждого компонента в `taskViewerFe/src/components/ui/` добавить хотя бы один `.stories.tsx` (или `.story.tsx`) с:

- Default-стори с базовым вариантом
- При необходимости — отдельные сториз для вариантов (например, размеры кнопки, варианты badge, состояния input: disabled, error)

Текущие компоненты для покрытия:

- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `dialog.tsx`
- `input.tsx`
- `label.tsx`
- `multi-select.tsx`
- `popover.tsx`
- `select.tsx`
- `separator.tsx`

#### 3. Развитие UI Kit

- Сгруппировать сториз по категориям (например, «Формы», «Обратная связь», «Навигация/Overlay»), чтобы в боковой панели Storybook был понятный UI Kit
- В описаниях сториз кратко указать назначение компонента и типичные сценарии использования
- При необходимости добавить недостающие визуальные варианты в сами компоненты (например, размеры, варианты) и отразить их в сториз

### Критерии приёмки

- [x] Storybook успешно запускается в taskViewerFe (`npm run storybook` или аналог)
- [x] Сборка Storybook выполняется без ошибок (`build-storybook` при наличии)
- [x] Для каждого компонента из `src/uiKit/` есть хотя бы один story-файл (badge, button, card, dialog, input, label, multi-select, popover, select, separator, skeleton, alert)
- [x] В сториз отображаются актуальные стили (Tailwind/глобальные стили подключены)
- [x] В README taskViewerFe указано, как запускать и использовать Storybook

### Связанные артефакты

- `taskViewerFe/package.json` — скрипты и зависимости
- `taskViewerFe/src/uiKit/*` — компоненты и сториз (barrel: `@/uiKit`)
- Конфигурация Storybook в `taskViewerFe/.storybook/`

---

## Примечания

- Задача касается только фронтенда (taskViewerFe); бэкенд не затрагивается.
- После настройки Storybook сториз можно использовать для визуальной регрессии и документации дизайн-системы приложения.
