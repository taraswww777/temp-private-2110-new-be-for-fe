# TASK-009: Quick Start - Настройка GitHub Actions и Pages

Краткое руководство по выполнению задания TASK-009.

---

## 🎯 Цель задания

Настроить автоматическую публикацию Swagger документации на GitHub Pages.

**Результат**: При пуше в main документация автоматически обновляется на публичном URL.

---

## ⚡ Быстрый старт

### Шаг 1: Действия владельца репозитория (ВАЖНО!)

**⚠️ Перед началом работы владелец должен:**

1. **Настроить GitHub Pages**:
   - Settings → Pages
   - Source: выбрать **"GitHub Actions"**
   - Save

2. **Настроить Permissions**:
   - Settings → Actions → General
   - Workflow permissions: **"Read and write permissions"**
   - Включить "Allow GitHub Actions to create and approve pull requests"
   - Save

📄 Подробные инструкции: [TASK-009-OWNER-INSTRUCTIONS.md](./TASK-009-OWNER-INSTRUCTIONS.md)

---

### Шаг 2: Создание workflow

**Создать файл**: `.github/workflows/deploy-docs.yml`

```yaml
name: Deploy Swagger Documentation to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'service2110/docs/swagger/swagger.json'
      - '.github/workflows/deploy-docs.yml'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      
      - name: Create docs directory
        run: |
          mkdir -p _site
          cp service2110/docs/swagger/swagger.json _site/swagger.json
      
      - name: Generate Swagger HTML
        run: |
          cat > _site/index.html << 'EOF'
          <!DOCTYPE html>
          <html lang="ru">
          <head>
              <meta charset="UTF-8">
              <title>API Documentation - Service 2110</title>
              <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
              <style>
                  body { margin: 0; padding: 0; }
                  .topbar { display: none; }
              </style>
          </head>
          <body>
              <div id="swagger-ui"></div>
              <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
              <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
              <script>
                  window.onload = function() {
                      SwaggerUIBundle({
                          url: "./swagger.json",
                          dom_id: '#swagger-ui',
                          deepLinking: true,
                          presets: [
                              SwaggerUIBundle.presets.apis,
                              SwaggerUIStandalonePreset
                          ],
                          layout: "StandaloneLayout",
                          tryItOutEnabled: false,
                          displayRequestDuration: true,
                          filter: true
                      });
                  };
              </script>
          </body>
          </html>
          EOF
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '_site'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### Шаг 3: Обновить .gitignore (опционально)

Если создаёте локальный генератор, добавить в `.gitignore`:

```gitignore
# Generated documentation
docs/public/
```

---

### Шаг 4: Создать PR и проверить

1. **Создать ветку**:
   ```bash
   git checkout -b feature/TASK-009-setup-github-actions
   ```

2. **Закоммитить**:
   ```bash
   git add .github/workflows/deploy-docs.yml
   git commit -m "TASK-009: Add GitHub Actions workflow for Swagger documentation"
   ```

3. **Создать PR** и смержить в main

4. **Проверить**:
   - Actions → "Deploy Swagger Documentation" должен запуститься
   - Settings → Pages → должен появиться URL
   - Открыть URL и проверить что Swagger UI работает

---

## ✅ Критерии успеха

- [ ] Владелец настроил GitHub Pages (Source: GitHub Actions)
- [ ] Владелец настроил Workflow permissions
- [ ] Создан workflow файл `.github/workflows/deploy-docs.yml`
- [ ] Workflow запустился после мержа в main
- [ ] Документация доступна по URL GitHub Pages
- [ ] Swagger UI корректно отображает все endpoints
- [ ] При изменении swagger.json документация обновляется автоматически

---

## 🔗 Дополнительные документы

- 📖 [Полное описание задачи](./TASK-009-setup-github-actions-and-pages.md)
- 👤 [Инструкции для владельца](./TASK-009-OWNER-INSTRUCTIONS.md)
- 📋 [Манифест задач](./tasks-manifest.json)

---

## 💡 Локальная генерация (опционально)

Если хотите тестировать документацию локально:

### Создать скрипт `scripts/generate-swagger-html.js`

```javascript
#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sourceSwaggerPath = join(rootDir, 'service2110/docs/swagger/swagger.json');
const outputDir = join(rootDir, 'docs/public');
const outputSwaggerPath = join(outputDir, 'swagger.json');
const outputHtmlPath = join(outputDir, 'index.html');

mkdirSync(outputDir, { recursive: true });
cpSync(sourceSwaggerPath, outputSwaggerPath);

const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>API Documentation - Service 2110</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
    <style>
        body { margin: 0; padding: 0; }
        .topbar { display: none; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: "./swagger.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: "StandaloneLayout",
                tryItOutEnabled: false,
                displayRequestDuration: true,
                filter: true
            });
        };
    </script>
</body>
</html>`;

writeFileSync(outputHtmlPath, htmlContent);
console.log('✅ Generated HTML documentation in docs/public/');
```

### Добавить команды в package.json (root)

```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-swagger-html.js",
    "docs:preview": "npm run docs:generate && echo \"Open docs/public/index.html in your browser\""
  }
}
```

### Использование

```bash
# Сгенерировать HTML
npm run docs:generate

# Открыть docs/public/index.html в браузере
```

---

## 🚨 Troubleshooting

### Workflow не запускается
- Проверить настройки Permissions (Шаг 1, пункт 2)
- Попробовать запустить вручную: Actions → Run workflow

### Pages не публикуется
- Проверить настройки GitHub Pages (Шаг 1, пункт 1)
- Убедиться что выбрано "GitHub Actions"

### 404 на URL документации
- Подождать 1-2 минуты
- Проверить что workflow завершился успешно
- Открыть в режиме инкогнито

---

**Дата создания:** 2026-01-29  
**Задача:** TASK-009  
**Приоритет:** Средний
