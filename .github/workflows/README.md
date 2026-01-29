# GitHub Actions Workflows

Этот репозиторий использует GitHub Actions для автоматизации CI/CD процессов.

## Workflows

### 1. CI - Build and Lint (`ci.yml`)

**Назначение:** Проверка качества кода для всех приложений в monorepo

**Запускается при:**
- Pull Request в ветки `main` или `develop`
- Push в ветки `main` или `develop`

**Проверки:**
- **service2110** (Backend):
  - ✅ Lint (ESLint)
  - ✅ Build (TypeScript)
  - ✅ Type Check (tsc --noEmit)
- **taskViewerBe** (Task Viewer Backend):
  - ✅ Lint (ESLint)
  - ✅ Build (TypeScript)
  - ✅ Type Check (tsc --noEmit)
- **taskViewerFe** (Task Viewer Frontend):
  - ✅ Lint (ESLint)
  - ✅ Build (Vite)

**Статус:** ✅ Активен

---

### 2. Deploy Swagger Documentation (`deploy-docs.yml`)

**Назначение:** Автоматическая публикация Swagger документации на GitHub Pages

**Запускается при:**
- Push в ветку `main` при изменениях в:
  - `service2110/docs/swagger/swagger.json`
  - `.github/workflows/deploy-docs.yml`
- Ручной запуск через `workflow_dispatch`

**Действия:**
1. Копирует `swagger.json` в `_site/`
2. Генерирует `index.html` со встроенным Swagger UI 5.11.0
3. Публикует на GitHub Pages

**Требования:**
- Settings → Pages → Source: **GitHub Actions** (настраивает владелец)
- Settings → Actions → General → Workflow permissions: **Read and write**

**Статус:** ✅ Активен

---

## Локальная проверка

Перед созданием PR рекомендуется запустить локальную проверку:

```bash
# Полная проверка (lint + build)
npm run ci:check

# Только lint
npm run ci:lint

# Только build
npm run ci:build
```

---

## Troubleshooting

### CI падает на lint

Проверьте ошибки локально:
```bash
npm run ci:lint
```

Исправьте ошибки и закоммитьте изменения.

### CI падает на build

Проверьте ошибки локально:
```bash
npm run ci:build
```

Убедитесь что все зависимости установлены:
```bash
npm ci
```

### Документация не публикуется

1. Проверьте настройки GitHub Pages (требует прав владельца)
2. Убедитесь что `swagger.json` закоммичен
3. Проверьте логи workflow в Actions

---

## Добавление новых проверок

Для добавления новых проверок в CI:

1. Отредактируйте `.github/workflows/ci.yml`
2. Добавьте новый job или step
3. Протестируйте локально
4. Создайте PR

Пример добавления проверки тестов:

```yaml
- name: Run tests
  run: npm run test -w service2110
```

---

**Дата создания:** 2026-01-29  
**Последнее обновление:** 2026-01-29
