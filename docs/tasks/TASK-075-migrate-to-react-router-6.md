# TASK-075: Миграция на React Router 6.29.0 с модульной архитектурой и фича-флагами

**Статус**: 📋 В работе  
**Ветка**: `VTB-559/FE-Perehod-na-react-router-dom6.29.0`  
**Проект**: temp-private-2110 (`subProjects/temp-private-2110/`)

---

## Краткое описание

Полная миграция приложения с React Router 5.3.4 на React Router 6.29.0 с внедрением модульной архитектуры путей и системы фича-флагов для управления модулями. Новая архитектура разделяет функционал на независимые модули с чёткими корневыми путями: `/inventory` для инвентаризации и `/reports` для отчётов.

---

## Контекст

Текущее приложение использует React Router 5.3.4 и имеет следующие проблемы:
1. **Сложная навигация**: требуется всегда указывать полный путь, нет поддержки относительных путей
2. **Монолитная структура**: все модули находятся в корне, отсутствует чёткое разделение
3. **Ограниченные возможности**: `useRouteMatch` не позволяет гибко управлять навигацией между модулями
4. **Отсутствие контроля**: нет механизма управления видимостью модулей через конфигурацию

### Цели миграции

1. **Обновить на React Router 6.29.0** — использовать современный API с поддержкой относительных путей
2. **Внедрить модульную архитектуру** — чёткое разделение функционала по корневым путям
3. **Реализовать систему фича-флагов** — управление видимостью модулей через `.env` конфигурацию
4. **Улучшить Developer Experience** — упростить навигацию, сделать код более поддерживаемым

### Связанные задачи

- [TASK-033](./TASK-033-react-router-navigation-improvement.md) — начальное исследование проблемы
- Коммит `e93ee2506f57a375b278c71088077c5fa247e4d7` — пример текущих проблем с навигацией

---

## Требования

### 1. Обновление зависимостей

- [ ] Обновить `react-router-dom` с `5.3.4` до `6.29.0`
- [ ] Обновить `@types/react-router-dom` до версии для React Router 6
- [ ] Убедиться в отсутствии конфликтов с другими библиотеками
- [ ] Проверить совместимость с текущей версией React (17.0.2)

### 2. Создание системы фича-флагов

#### 2.1. Конфигурация окружения

- [ ] Переименовать `.env.example` → `.env.develop` (дефолтные значения для разработки)
- [ ] Создать файл `src/constants/env.ts` для инициализации всех env переменных
- [ ] Использовать функцию `importEnv` из `scripts/common/importEnv.ts` для загрузки env
- [ ] Добавить переменные фича-флагов в `.env.develop`:

```env
# ============================================
# Feature Flags - Архитектура приложения
# ============================================

# Главный переключатель архитектуры
# true = новая архитектура с react-router 6 и модульными путями
# false = legacy архитектура (текущая)
FEATURE_USE_NEW_APP_ARCHITECTURE=false

# ============================================
# Feature Flags - Модули
# ============================================

# Модуль "Отчёты" (новая реализация на react-router 6)
# Пути: /reports, /reports/6406/*, /reports/template/*
FEATURE_MODULE_REPORTS=true

# Модуль "Инвентаризация" 
# Пути: /inventory/*
FEATURE_MODULE_INVENTORY=false

# ============================================
# Feature Flags - Административные функции
# ============================================

# Доступ к странице настроек (/settings)
FEATURE_SHOW_SETTINGS=true

# Функционал администратора
FEATURE_IS_ADMIN=false

# ============================================
# Feature Flags - Экспериментальные функции
# ============================================

# Отображение статуса отчёта (требует доработки логики)
FEATURE_SHOW_REPORT_STATUS=false
```

#### 2.2. Типизация и константы

**Создать файл `src/constants/env.ts`:**

```typescript
/**
 * Типизация переменных окружения
 */
export interface AppEnvConfig {
  // Swagger
  SWAGGER_HOST_DEV?: string;
  SWAGGER_HOST_LOCAL?: string;
  
  // Feature Flags - Архитектура
  FEATURE_USE_NEW_APP_ARCHITECTURE?: boolean;
  
  // Feature Flags - Модули
  FEATURE_MODULE_REPORTS?: boolean;
  FEATURE_MODULE_INVENTORY?: boolean;
  
  // Feature Flags - Административные функции
  FEATURE_SHOW_SETTINGS?: boolean;
  FEATURE_IS_ADMIN?: boolean;
  
  // Feature Flags - Экспериментальные
  FEATURE_SHOW_REPORT_STATUS?: boolean;
}

/**
 * Преобразование строковых значений env в boolean
 */
const parseBoolean = (value: string | undefined): boolean => {
  if (value === undefined) return false;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Парсинг переменных окружения с приведением типов
 */
const parseEnv = (): AppEnvConfig => {
  const raw = import.meta.env || process.env;
  
  return {
    // Swagger
    SWAGGER_HOST_DEV: raw.SWAGGER_HOST_DEV,
    SWAGGER_HOST_LOCAL: raw.SWAGGER_HOST_LOCAL,
    
    // Feature Flags - Архитектура
    FEATURE_USE_NEW_APP_ARCHITECTURE: parseBoolean(raw.FEATURE_USE_NEW_APP_ARCHITECTURE),
    
    // Feature Flags - Модули
    FEATURE_MODULE_REPORTS: parseBoolean(raw.FEATURE_MODULE_REPORTS),
    FEATURE_MODULE_INVENTORY: parseBoolean(raw.FEATURE_MODULE_INVENTORY),
    
    // Feature Flags - Административные
    FEATURE_SHOW_SETTINGS: parseBoolean(raw.FEATURE_SHOW_SETTINGS),
    FEATURE_IS_ADMIN: parseBoolean(raw.FEATURE_IS_ADMIN),
    
    // Feature Flags - Экспериментальные
    FEATURE_SHOW_REPORT_STATUS: parseBoolean(raw.FEATURE_SHOW_REPORT_STATUS),
  };
};

/**
 * Типизированные переменные окружения приложения
 */
export const ENV: AppEnvConfig = parseEnv();
```

**Обновить файл `src/constants/featureFlags.ts`:**

```typescript
import { IS_DEV_SPACE } from "src/constants/hosts";
import { SHOULD_SHOW_SETTINGS } from "./shouldShowSettings";
import { ENV } from "./env";

/**
 * Перечисление всех фича-флагов приложения
 */
enum FeatureFlags {
  // === Архитектура приложения ===
  /** Использовать новую архитектуру с react-router 6 и модульными путями */
  UseNewAppArchitecture = "UseNewAppArchitecture",
  
  // === Модули приложения ===
  /** Включить модуль "Отчёты" (новая реализация) */
  ModuleReports = "ModuleReports",
  /** Включить модуль "Инвентаризация" */
  ModuleInventory = "ModuleInventory",
  
  // === Административные функции ===
  /** Показывать страницу настроек */
  ShowSettings = "ShowSettings",
  /** Функционал администратора */
  IsAdmin = "IsAdmin",
  
  // === Экспериментальные функции ===
  /** Показывать статус отчёта (экспериментально) */
  ShowReportStatus = "ShowReportStatus",
}

/**
 * Модули для переключения через localStorage (для разработки)
 * @deprecated Будет удалено после полного перехода на новую архитектуру
 */
export enum ModulesToShow {
  /** Новые отчёты */
  reports = "reports",
  /** Legacy отчёты */
  legacy = "legacy",
  /** Инвентаризация */
  inventory = "inventory",
}

// === Runtime переопределения ===
const IS_ADMIN_USER = Boolean(localStorage.getItem("isAdminUser"));
const MODULE_TO_SHOW = localStorage.getItem("moduleToShow");

/**
 * Конфигурация фича-флагов
 * 
 * Приоритет значений:
 * 1. localStorage (для dev-режима через SettingsPage)
 * 2. .env файл (индивидуальные настройки разработчика)
 * 3. .env.develop (дефолтные значения команды)
 */
export const FEATURE_CONFIG: Record<FeatureFlags, boolean> = {
  // === Архитектура ===
  [FeatureFlags.UseNewAppArchitecture]: 
    ENV.FEATURE_USE_NEW_APP_ARCHITECTURE ?? false,
  
  // === Модули ===
  [FeatureFlags.ModuleReports]: 
    ENV.FEATURE_USE_NEW_APP_ARCHITECTURE && ENV.FEATURE_MODULE_REPORTS
      ? (!MODULE_TO_SHOW || MODULE_TO_SHOW === ModulesToShow.reports)
      : false,
  
  [FeatureFlags.ModuleInventory]: 
    ENV.FEATURE_USE_NEW_APP_ARCHITECTURE && ENV.FEATURE_MODULE_INVENTORY
      ? (MODULE_TO_SHOW === ModulesToShow.inventory)
      : false,
  
  // === Административные функции ===
  [FeatureFlags.ShowSettings]: 
    SHOULD_SHOW_SETTINGS || ENV.FEATURE_SHOW_SETTINGS ?? false,
  
  [FeatureFlags.IsAdmin]: 
    IS_ADMIN_USER || ENV.FEATURE_IS_ADMIN ?? false,
  
  // === Экспериментальные ===
  [FeatureFlags.ShowReportStatus]: 
    ENV.FEATURE_SHOW_REPORT_STATUS ?? false,
};

/**
 * Legacy конфигурация (для обратной совместимости в период миграции)
 * @deprecated Использовать FEATURE_CONFIG напрямую
 */
export const LEGACY_FEATURE_CONFIG = {
  ShowReportsMenuModule: FEATURE_CONFIG.ModuleReports,
  ShowLegacyReportsMenuModule: !FEATURE_CONFIG.UseNewAppArchitecture || MODULE_TO_SHOW === ModulesToShow.legacy,
  ShowInventoryModule: FEATURE_CONFIG.ModuleInventory,
};
```

#### 2.3. Обновление SettingsPage

- [ ] Добавить переключатель архитектуры (новая/legacy)
- [ ] Обновить радио-кнопки для переключения модулей
- [ ] Добавить подсказки о текущей конфигурации фича-флагов
- [ ] Добавить кнопку сброса настроек localStorage

### 3. Миграция на React Router 6

#### 3.1. Обновление хуков и компонентов

**Таблица миграции API:**

| React Router 5 | React Router 6 | Примечания |
|----------------|----------------|------------|
| `useHistory()` | `useNavigate()` | `navigate('/path')` вместо `history.push('/path')` |
| `useRouteMatch()` | `useMatch()` или `useLocation()` | Другой синтаксис паттернов |
| `<Switch>` | `<Routes>` | Изменение структуры компонента |
| `<Route path="..." component={...}>` | `<Route path="..." element={<.../>}>` | Props `element` вместо `component` |
| `<Redirect>` | `<Navigate>` | Декларативная навигация |
| Вложенные роуты в отдельных компонентах | Вложенные роуты через `<Outlet>` | Новый паттерн для вложенности |

**Файлы для обновления:**

- [ ] `src/App/AppRouter.tsx` — главный роутер приложения
- [ ] `src/modules/Report6406Module/Report6406Module.routing.tsx` — роутинг модуля отчётов 6406
- [ ] `src/modules/ReportTemplateModule/ReportTemplateModule.routing.tsx` — роутинг модуля шаблонов отчётов
- [ ] `src/modules/ReportsMenuModule/ReportsMenuModule.routing.tsx` — роутинг меню отчётов
- [ ] `src/modules/InventoryModule/InventoryModule.routing.tsx` — роутинг модуля инвентаризации
- [ ] `src/modules/ReportManagerLegacyModule/ReportManagerLegacyModuleRouting.tsx` — legacy роутинг

**Поиск всех использований:**
```bash
# В проекте найти все использования устаревшего API
grep -r "useHistory" src/
grep -r "useRouteMatch" src/
grep -r "<Switch" src/
grep -r "component={" src/ | grep Route
grep -r "<Redirect" src/
```

#### 3.2. Обновление навигационных ссылок

- [ ] Заменить все `<Link to={fullPath}>` на относительные пути где возможно
- [ ] Использовать `navigate('../path')` для перехода на уровень выше
- [ ] Использовать `navigate('./path')` или `navigate('path')` для относительных переходов

**Примеры новой навигации:**

```typescript
// Старый подход (React Router 5)
const { url } = useRouteMatch();
history.push(`${url}/packages`);

// Новый подход (React Router 6)
navigate('packages');              // Относительный путь
navigate('../tfr');                // На уровень выше
navigate('/reports/6406/packages'); // Абсолютный путь (если нужен)
```

### 4. Новая модульная архитектура путей

#### 4.1. Структура корневых путей

```
/                           # Корень (редирект или главная страница)
├── /settings              # Страница настроек (если FEATURE_SHOW_SETTINGS)
├── /inventory             # Модуль инвентаризации (если FEATURE_MODULE_INVENTORY)
│   └── /* (вложенные пути модуля)
└── /reports               # Модуль отчётов (если FEATURE_MODULE_REPORTS)
    ├── /reports/6406      # Форма 6406
    │   ├── /reports/6406/packages
    │   ├── /reports/6406/tfr
    │   └── /* (другие пути)
    └── /reports/template  # Шаблоны отчётов
        └── /* (вложенные пути)
```

#### 4.2. Legacy пути (миграция на React Router 6)

**Legacy модуль отчётов** (из `ReportManagerLegacyModuleRouting.tsx`):

```
/                                          # MainPage
/report-form-6406                         # Reports6406Page
/report-form-6406/:id                     # ReportForm6406DetailsPage
/report-form-3462                         # Reports3462Page
/report-form-3462/:id                     # ReportForm3462DetailsPage
/kros                                     # ReportsKrosPage
/kros/:id                                 # KrosDetailsPage
/statements-vos                           # ReportsStatementsVOSPage
/statements-vos/:id                       # StatementsVOSDetailsPage
/statements-vzs                           # ReportsStatementsVZSPage
/statements-vzs/:id                       # StatementsVZSDetailsPage
/regular                                  # ReportsRegularPage
```

**Требование:** Все legacy пути должны быть мигрированы на React Router 6 с сохранением текущей структуры.

#### 4.3. Обновление AppRouter.tsx

**Текущая структура:**

```typescript
// Старый код (React Router 5)
<BrowserRouter basename={baseURL}>
  <Switch>
    {FEATURE_CONFIG.ShowSettings && <Route path={"/settings"} component={SettingsPage} />}
    {FEATURE_CONFIG.ShowReportsMenuModule && (
      <>
        <Route exact path={"/"} component={ReportsMenuModule} />
        <Route path={EReportsRoutes.ReportTemplate} component={ReportTemplateModule} />
        <Route path={EReportsRoutes.Report6406} component={Report6406Module} />
      </>
    )}
    {FEATURE_CONFIG.ShowInventoryModule && <Route path={"/"} component={InventoryModule} />}
  </Switch>
</BrowserRouter>
```

**Новая структура (React Router 6):**

```typescript
// Новый код (React Router 6)
<BrowserRouter basename={baseURL}>
  <Routes>
    {/* Страница настроек */}
    {FEATURE_CONFIG.ShowSettings && (
      <Route path="/settings" element={<SettingsPage />} />
    )}
    
    {/* Новая архитектура с модульными путями */}
    {FEATURE_CONFIG.UseNewAppArchitecture ? (
      <>
        {/* Модуль отчётов */}
        {FEATURE_CONFIG.ModuleReports && (
          <Route path="/reports/*" element={<ReportsModule />} />
        )}
        
        {/* Модуль инвентаризации */}
        {FEATURE_CONFIG.ModuleInventory && (
          <Route path="/inventory/*" element={<InventoryModule />} />
        )}
        
        {/* Редирект на первый доступный модуль или заглушка */}
        <Route path="/" element={<Navigate to={getDefaultModulePath()} replace />} />
      </>
    ) : (
      /* Legacy архитектура (временно) */
      <Route path="/*" element={<LegacyAppRouter />} />
    )}
    
    {/* 404 страница */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

#### 4.4. Создание новых модульных роутеров

**Создать файл `src/modules/ReportsModule/ReportsModule.routing.tsx`:**

```typescript
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Report6406Module } from '../Report6406Module';
import { ReportTemplateModule } from '../ReportTemplateModule';
import { ReportsMenuPage } from './pages/ReportsMenuPage';

export const ReportsModuleRouting = () => {
  return (
    <Routes>
      {/* Главная страница модуля отчётов */}
      <Route index element={<ReportsMenuPage />} />
      
      {/* Форма 6406 */}
      <Route path="6406/*" element={<Report6406Module />} />
      
      {/* Шаблоны отчётов */}
      <Route path="template/*" element={<ReportTemplateModule />} />
      
      {/* 404 внутри модуля */}
      <Route path="*" element={<Navigate to="/reports" replace />} />
    </Routes>
  );
};
```

**Создать файл `src/modules/InventoryModule/InventoryModule.routing.tsx`:**

```typescript
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { InventoryMainPage } from './pages/InventoryMainPage';
// ... другие страницы модуля

export const InventoryModuleRouting = () => {
  return (
    <Routes>
      {/* Главная страница модуля инвентаризации */}
      <Route index element={<InventoryMainPage />} />
      
      {/* Другие пути модуля */}
      {/* TODO: Добавить пути после уточнения структуры */}
      
      {/* 404 внутри модуля */}
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
};
```

### 5. Обновление навигации в компонентах

#### 5.1. Обновление всех компонентов с useHistory

**Найти все файлы:**
```bash
grep -rl "useHistory" src/
```

**Пример обновления:**

```typescript
// Было (React Router 5)
import { useHistory } from 'react-router-dom';

const MyComponent = () => {
  const history = useHistory();
  
  const handleClick = () => {
    history.push('/reports/6406/packages');
    history.replace('/reports');
    history.goBack();
  };
};

// Стало (React Router 6)
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/reports/6406/packages');
    navigate('/reports', { replace: true });
    navigate(-1); // goBack
  };
};
```

#### 5.2. Обновление всех компонентов с useRouteMatch

**Найти все файлы:**
```bash
grep -rl "useRouteMatch" src/
```

**Пример обновления:**

```typescript
// Было (React Router 5)
import { useRouteMatch } from 'react-router-dom';

const MyComponent = () => {
  const { url, path } = useRouteMatch();
  // url: "/reports/6406"
  // path: "/reports/:id"
};

// Стало (React Router 6)
import { useMatch, useResolvedPath } from 'react-router-dom';

const MyComponent = () => {
  const match = useMatch('/reports/:id');
  const resolvedPath = useResolvedPath('.');
  // match.params.id
  // resolvedPath.pathname
};
```

#### 5.3. Обновление всех Link компонентов

**Пример обновления относительных путей:**

```typescript
// Было (React Router 5) - всегда полный путь
<Link to="/reports/6406/packages">Пакеты</Link>

// Стало (React Router 6) - можно использовать относительные пути
<Link to="packages">Пакеты</Link>           // Относительно текущего
<Link to="../tfr">ТФР</Link>                // На уровень выше
<Link to="/reports/6406/packages">Пакеты</Link>  // Абсолютный (если нужен)
```

### 6. Тестирование

#### 6.1. Сценарии тестирования

- [ ] **Переключение между архитектурами:**
  - Включить `FEATURE_USE_NEW_APP_ARCHITECTURE=true` → проверить новые пути `/reports`, `/inventory`
  - Выключить `FEATURE_USE_NEW_APP_ARCHITECTURE=false` → проверить legacy пути
  
- [ ] **Переключение модулей:**
  - Включить только `FEATURE_MODULE_REPORTS` → доступен только `/reports`
  - Включить только `FEATURE_MODULE_INVENTORY` → доступен только `/inventory`
  - Включить оба модуля → доступны оба пути
  - Выключить все модули → показать заглушку или редирект

- [ ] **Навигация внутри модулей:**
  - Переходы между страницами модуля отчётов
  - Относительные пути работают корректно
  - Абсолютные пути работают корректно
  - Кнопка "Назад" браузера работает

- [ ] **SettingsPage:**
  - Переключение архитектуры через localStorage
  - Переключение модулей через localStorage
  - Изменения применяются после перезагрузки страницы

- [ ] **Legacy функционал:**
  - Все legacy пути работают на React Router 6
  - Навигация в legacy модуле не сломана

#### 6.2. Проверка регрессий

- [ ] Все существующие переходы работают
- [ ] История браузера работает корректно (back/forward)
- [ ] Deep links работают (можно открыть любой URL напрямую)
- [ ] Не появились console errors/warnings
- [ ] TypeScript компилируется без ошибок
- [ ] ESLint проходит без критичных ошибок

### 7. Документация

- [ ] Обновить `README.md` с описанием новой архитектуры
- [ ] Добавить документацию по фича-флагам в `docs/development/`
- [ ] Создать migration guide для разработчиков
- [ ] Добавить примеры использования относительных путей
- [ ] Задокументировать структуру модулей

---

## Критерии приёмки

### Обязательные

- [ ] React Router обновлён до версии 6.29.0
- [ ] Все модули мигрированы на React Router 6 API
- [ ] Система фича-флагов реализована и работает через `.env` файлы
- [ ] Новые модульные пути `/inventory` и `/reports` работают
- [ ] Legacy функционал мигрирован на React Router 6 и работает
- [ ] SettingsPage позволяет переключаться между архитектурами
- [ ] Все существующие переходы работают без регрессий
- [ ] TypeScript компилируется без ошибок
- [ ] Нет console errors в режиме разработки

### Желательные

- [ ] Использование относительных путей где это улучшает читаемость кода
- [ ] Создана документация по миграции
- [ ] Добавлены примеры использования нового API
- [ ] Код ревью проведено, замечания исправлены

---

## Область изменений

### Основные файлы

| Файл | Тип изменения | Описание |
|------|---------------|----------|
| `package.json` | Обновление | Обновление версии react-router-dom |
| `.env.example` → `.env.develop` | Переименование + расширение | Дефолтные env переменные + фича-флаги |
| `src/constants/env.ts` | Создание | Типизация и парсинг env переменных |
| `src/constants/featureFlags.ts` | Обновление | Новая структура фича-флагов |
| `src/App/AppRouter.tsx` | Обновление | Главный роутер с поддержкой модулей |
| `src/App/SettingsPage.tsx` | Обновление | Добавление переключателя архитектуры |

### Роутинг модулей (миграция на RR6)

| Файл | Описание |
|------|----------|
| `src/modules/Report6406Module/Report6406Module.routing.tsx` | Миграция на React Router 6 |
| `src/modules/ReportTemplateModule/ReportTemplateModule.routing.tsx` | Миграция на React Router 6 |
| `src/modules/ReportsMenuModule/ReportsMenuModule.routing.tsx` | Миграция на React Router 6 |
| `src/modules/InventoryModule/InventoryModule.routing.tsx` | Миграция на React Router 6 |
| `src/modules/ReportManagerLegacyModule/ReportManagerLegacyModuleRouting.tsx` | Миграция на React Router 6 |

### Новые модульные роутеры

| Файл | Описание |
|------|----------|
| `src/modules/ReportsModule/ReportsModule.routing.tsx` | Новый роутер для `/reports` |
| `src/modules/ReportsModule/pages/ReportsMenuPage.tsx` | Главная страница модуля отчётов |
| `src/modules/InventoryModule/InventoryModule.routing.tsx` | Роутер для `/inventory` |
| `src/modules/InventoryModule/pages/InventoryMainPage.tsx` | Главная страница модуля инвентаризации |

### Компоненты с навигацией (массовое обновление)

Все компоненты, использующие:
- `useHistory` → обновить на `useNavigate`
- `useRouteMatch` → обновить на `useMatch` / `useLocation`
- `<Link>` → обновить на относительные пути где возможно

---

## Вне границ данной задачи

- Изменение бизнес-логики приложения
- Рефакторинг компонентов (кроме необходимого для миграции)
- Добавление новых функциональных возможностей
- Изменение дизайна или UI компонентов
- Оптимизация производительности (если не связано с роутингом)
- Обновление других зависимостей (кроме react-router)

---

## Дополнительные заметки

### Преимущества React Router 6

1. **Относительные пути** — упрощение навигации внутри модулей
2. **Лучший API** — `useNavigate` более интуитивен чем `useHistory`
3. **Улучшенная типизация** — меньше ошибок на этапе разработки
4. **Вложенные роуты** — более декларативный подход через `<Outlet>`
5. **Меньший размер бандла** — React Router 6 легче версии 5

### Миграционные риски

1. **Объём изменений** — миграция затронет множество файлов
2. **Breaking changes** — возможны упущенные кейсы при миграции
3. **Регрессии** — необходимо тщательное тестирование всех путей
4. **Время разработки** — миграция может занять больше времени чем ожидается

### Рекомендации по реализации

1. **Поэтапная миграция:**
   - Этап 1: Обновить зависимости и настроить фича-флаги
   - Этап 2: Мигрировать главный AppRouter
   - Этап 3: Мигрировать модульные роутеры по одному
   - Этап 4: Обновить все компоненты с навигацией
   - Этап 5: Тестирование и документация

2. **Использовать TypeScript** для отлова ошибок на этапе компиляции

3. **Тестировать каждый модуль** сразу после миграции

4. **Сохранить legacy код** до полного завершения миграции (через фича-флаг)

5. **Code review** обязателен для критичных путей приложения

---

## Полезные ссылки

- [React Router 6 документация](https://reactrouter.com/)
- [React Router v5 → v6 Migration Guide](https://reactrouter.com/en/main/upgrading/v5)
- [React Router 6.29.0 Release Notes](https://github.com/remix-run/react-router/releases/tag/react-router%406.29.0)
- [TASK-033: Начальное исследование проблемы](./TASK-033-react-router-navigation-improvement.md)

---

## История изменений

| Дата | Автор | Изменение |
|------|-------|-----------|
| 2026-03-17 | AI Assistant | Создание задания на основе TASK-033 |
