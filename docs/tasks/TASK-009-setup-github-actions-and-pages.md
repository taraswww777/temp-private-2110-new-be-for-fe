# TASK-009: Настройка GitHub Actions и GitHub Pages для публикации Swagger документации

## Статус
📋 В бэклоге

## Описание
Настроить автоматическую публикацию Swagger документации API в формате HTML на GitHub Pages с помощью GitHub Actions. При каждом пуше в main ветку должна автоматически обновляться HTML версия Swagger спеки, доступная по публичному URL.

## Цели
1. Настроить GitHub Actions для автоматической генерации HTML из Swagger спеки
2. Опубликовать Swagger документацию на GitHub Pages
3. Обеспечить автоматическое обновление документации при изменениях в main ветке
4. Предоставить публичный URL для просмотра документации

## Технический стек
- **CI/CD**: GitHub Actions
- **Хостинг**: GitHub Pages
- **Swagger**: Swagger UI (standalone HTML)
- **Источник**: `service2110/docs/swagger/swagger.json`

## Структура
```
/.github
  /workflows
    deploy-docs.yml           # GitHub Actions workflow
/docs
  /public                     # Публикуемая документация (игнорируется в git)
    index.html                # Swagger UI HTML (генерируется автоматически)
    swagger.json              # Копия swagger.json
```

## Детальное описание

### 1. Настройка GitHub Pages

#### 1.1. Настройки репозитория (требует действий владельца)
**⚠️ ВАЖНО: Эти действия должен выполнить владелец GitHub репозитория:**

1. Перейти в Settings репозитория на GitHub
2. В левом меню выбрать **Pages**
3. В разделе **Source** выбрать:
   - Source: **GitHub Actions** (вместо Deploy from a branch)
4. Сохранить настройки

**Примечание:** После настройки документация будет доступна по URL:
```
https://<username>.github.io/<repository-name>/
```

Где:
- `<username>` - имя пользователя или организации на GitHub
- `<repository-name>` - название репозитория

### 2. GitHub Actions Workflow

#### 2.1. Создать файл `.github/workflows/deploy-docs.yml`

```yaml
name: Deploy Swagger Documentation to GitHub Pages

# Запускать при пуше в main ветку и при изменениях в swagger.json
on:
  push:
    branches:
      - main
    paths:
      - 'service2110/docs/swagger/swagger.json'
      - '.github/workflows/deploy-docs.yml'
  # Возможность запустить вручную из интерфейса GitHub
  workflow_dispatch:

# Разрешения для публикации на GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Разрешить только один concurrent deployment
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
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v5
      
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
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>API Documentation - Service 2110</title>
              <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
              <style>
                  html {
                      box-sizing: border-box;
                      overflow: -moz-scrollbars-vertical;
                      overflow-y: scroll;
                  }
                  *, *:before, *:after {
                      box-sizing: inherit;
                  }
                  body {
                      margin: 0;
                      padding: 0;
                  }
                  .topbar {
                      display: none;
                  }
              </style>
          </head>
          <body>
              <div id="swagger-ui"></div>
              <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
              <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
              <script>
                  window.onload = function() {
                      window.ui = SwaggerUIBundle({
                          url: "./swagger.json",
                          dom_id: '#swagger-ui',
                          deepLinking: true,
                          presets: [
                              SwaggerUIBundle.presets.apis,
                              SwaggerUIStandalonePreset
                          ],
                          plugins: [
                              SwaggerUIBundle.plugins.DownloadUrl
                          ],
                          layout: "StandaloneLayout",
                          tryItOutEnabled: false,
                          displayRequestDuration: true,
                          filter: true,
                          syntaxHighlight: {
                              activate: true,
                              theme: "monokai"
                          }
                      });
                  };
              </script>
          </body>
          </html>
          EOF
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '_site'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Альтернативный подход с локальной генерацией (опционально)

Если нужно тестировать генерацию локально, можно создать скрипт:

#### 3.1. Создать `scripts/generate-swagger-html.js`
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

// Создать директорию если не существует
mkdirSync(outputDir, { recursive: true });

// Скопировать swagger.json
cpSync(sourceSwaggerPath, outputSwaggerPath);
console.log('✅ Copied swagger.json to docs/public/');

// Сгенерировать HTML
const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - Service 2110</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            padding: 0;
        }
        .topbar {
            display: none;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            window.ui = SwaggerUIBundle({
                url: "./swagger.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                tryItOutEnabled: false,
                displayRequestDuration: true,
                filter: true,
                syntaxHighlight: {
                    activate: true,
                    theme: "monokai"
                }
            });
        };
    </script>
</body>
</html>`;

writeFileSync(outputHtmlPath, htmlContent);
console.log('✅ Generated index.html in docs/public/');
console.log('\n📄 Documentation files:');
console.log(`   - ${outputHtmlPath}`);
console.log(`   - ${outputSwaggerPath}`);
console.log('\n🌐 Open index.html in browser to preview.');
```

#### 3.2. Добавить скрипт в package.json (root)
```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-swagger-html.js",
    "docs:preview": "npm run docs:generate && echo \"Open docs/public/index.html in your browser\""
  }
}
```

### 4. .gitignore

Добавить в корневой `.gitignore`:
```gitignore
# Generated documentation
docs/public/
```

### 5. README обновления

#### 5.1. Обновить главный README.md
Добавить секцию о документации:

```markdown
## 📚 API Документация

API документация доступна в нескольких форматах:

### Локальная разработка
- Swagger UI: http://localhost:3000/docs
- JSON спека: http://localhost:3000/docs/json
- Файл: `service2110/docs/swagger/swagger.json`

### Публичная документация
- GitHub Pages: https://<username>.github.io/<repository-name>/
- Автоматически обновляется при пуше в main ветку

### Генерация документации локально
```bash
# Сгенерировать HTML версию документации
npm run docs:generate

# Предпросмотр (откроется в браузере)
npm run docs:preview
```

Сгенерированные файлы будут в папке `docs/public/`:
- `index.html` - Swagger UI
- `swagger.json` - OpenAPI спецификация
```

## Порядок выполнения

### Этап 1: Подготовка (владелец репозитория)
1. ⚠️ **Владелец репозитория** должен настроить GitHub Pages:
   - Зайти в Settings → Pages
   - Выбрать Source: **GitHub Actions**
   - Сохранить настройки

### Этап 2: Создание workflow
2. Создать структуру папок `.github/workflows`
3. Создать файл `deploy-docs.yml` с workflow конфигурацией
4. Проверить права доступа в workflow (permissions секция)

### Этап 3: Локальный генератор (опционально)
5. Создать скрипт `scripts/generate-swagger-html.js`
6. Добавить команды `docs:generate` и `docs:preview` в package.json
7. Протестировать локальную генерацию: `npm run docs:generate`

### Этап 4: Git конфигурация
8. Добавить `docs/public/` в `.gitignore`
9. Убедиться что swagger.json не в gitignore (он должен быть в репозитории)

### Этап 5: Документация
10. Обновить главный README.md с информацией о публичной документации
11. Добавить инструкции по локальной генерации

### Этап 6: Тестирование
12. Создать ветку `feature/TASK-009-setup-github-actions`
13. Закоммитить все изменения
14. Создать Pull Request в main
15. После мержа в main проверить что:
    - GitHub Actions успешно запустился
    - Документация опубликована на GitHub Pages
    - HTML страница корректно отображает swagger.json
16. Открыть URL GitHub Pages и проверить:
    - Swagger UI загружается
    - Все endpoints видны
    - Схемы отображаются корректно
    - Можно фильтровать endpoints

### Этап 7: Валидация
17. Сделать тестовое изменение в `swagger.json` (например, в описании)
18. Закоммитить в main
19. Убедиться что GitHub Actions запустился автоматически
20. Проверить что изменения отразились на GitHub Pages

### Этап 8: Финализация
21. Обновить статус задачи в манифесте
22. Добавить ссылку на GitHub Pages в документацию проекта

## Критерии приёмки

- [ ] Создана директория `.github/workflows`
- [ ] Создан файл `deploy-docs.yml` с корректным workflow
- [ ] Workflow настроен на запуск при изменениях в swagger.json
- [ ] Workflow настроен на запуск при пуше в main
- [ ] Workflow имеет правильные permissions для GitHub Pages
- [ ] HTML генерируется с использованием Swagger UI 5.x
- [ ] HTML включает корректную ссылку на swagger.json
- [ ] Swagger UI настроен с правильными параметрами (deepLinking, filter, etc)
- [ ] Создан скрипт для локальной генерации (опционально)
- [ ] Добавлены команды в package.json для генерации документации
- [ ] Добавлен `docs/public/` в .gitignore
- [ ] Обновлён главный README.md с информацией о документации
- [ ] GitHub Pages настроен владельцем репозитория (Source: GitHub Actions)
- [ ] После мержа в main workflow успешно выполняется
- [ ] Документация публикуется на GitHub Pages
- [ ] GitHub Pages URL корректно отображает Swagger UI
- [ ] Все endpoints видны в Swagger UI
- [ ] Схемы корректно отображаются
- [ ] При изменении swagger.json документация автоматически обновляется
- [ ] Топбар Swagger UI скрыт (для более чистого интерфейса)
- [ ] TryItOut функциональность отключена (только просмотр)

## Ветка
`feature/TASK-009-setup-github-actions`

## Приоритет
Средний

## Теги
- CI/CD
- Documentation
- GitHub Actions
- GitHub Pages
- Swagger

## Зависимости
- Требует доступ владельца репозитория для настройки GitHub Pages
- Зависит от наличия `service2110/docs/swagger/swagger.json`

## Риски и ограничения

### Риски
1. **Отсутствие permissions**: Если workflow не имеет правильных permissions, публикация не будет работать
   - **Решение**: Убедиться что секция `permissions` настроена правильно
2. **Некорректный путь к swagger.json**: Если путь изменится, workflow сломается
   - **Решение**: Использовать относительные пути и проверять их в workflow
3. **Устаревший swagger.json**: Если забыть закоммитить обновлённый swagger.json
   - **Решение**: Добавить проверку в CI что swagger.json актуален

### Ограничения
1. GitHub Pages публикует только статические файлы (без серверной логики)
2. Документация обновляется только после пуша в main (не в других ветках)
3. TryItOut в Swagger UI не будет работать (документация статическая)

## Дополнительные улучшения (будущие задачи)

### Возможные расширения
1. Добавить версионирование документации (папки v1, v2 и т.д.)
2. Настроить кастомный домен для документации
3. Добавить темную тему для Swagger UI
4. Интегрировать ReDoc как альтернативу Swagger UI
5. Добавить валидацию swagger.json в CI перед публикацией
6. Добавить badge в README с ссылкой на документацию
7. Генерировать Changelog из коммитов при публикации документации

## Ссылки и документация

### GitHub Actions
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Pages action](https://github.com/actions/deploy-pages)

### GitHub Pages
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Publishing with GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)

### Swagger UI
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Swagger UI Configuration](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/)
- [Swagger UI on npm](https://www.npmjs.com/package/swagger-ui-dist)

## Примеры workflow

### Ссылки на примеры
- [GitHub Pages starter workflow](https://github.com/actions/starter-workflows/blob/main/pages/static.yml)
- [Deploy static HTML to Pages](https://github.com/actions/starter-workflows/blob/main/pages/jekyll.yml)

## Вопросы требующие уточнения

### 1. Кастомный домен
- Нужен ли кастомный домен для документации?
- Если да, какой домен использовать?

### 2. Версионирование
- Нужно ли хранить версии документации (v1.0.0, v1.1.0)?
- Или достаточно только последней версии?

### 3. Альтернативные форматы
- Нужна ли альтернатива Swagger UI (например, ReDoc)?
- Нужно ли генерировать Markdown документацию?

### 4. Уведомления
- Нужны ли уведомления об успешной публикации (Slack, Discord)?
- Нужны ли уведомления об ошибках при публикации?

### 5. Валидация
- Нужна ли валидация swagger.json перед публикацией?
- Если swagger.json невалиден, блокировать публикацию?

### 6. Доступ
- Нужно ли ограничить доступ к документации?
- Или она должна быть публичной для всех?

## Напоминания владельцу репозитория

**⚠️ ВАЖНО: Перед началом работы над задачей:**

1. **Настроить GitHub Pages**:
   ```
   1. Открыть https://github.com/<username>/<repository>/settings/pages
   2. В разделе "Build and deployment":
      - Source: выбрать "GitHub Actions" (не Deploy from a branch)
   3. Сохранить изменения
   ```

2. **Проверить permissions репозитория**:
   - Settings → Actions → General
   - Workflow permissions: выбрать "Read and write permissions"
   - Включить "Allow GitHub Actions to create and approve pull requests"

3. **После мержа Pull Request**:
   - Проверить что Actions запустился
   - Проверить что нет ошибок в workflow
   - Открыть URL GitHub Pages (будет в настройках Pages)
   - Убедиться что документация отображается корректно

**URL документации будет:**
```
https://<username>.github.io/<repository-name>/
```

**Где посмотреть URL:**
- Settings → Pages → "Your site is live at..."
- Actions → последний успешный run → Deploy step → output URL

---

## История изменений

### 2026-01-29 (создание)
- Создано задание TASK-009
- Определены требования к GitHub Actions и GitHub Pages
- Добавлены детальные инструкции для владельца репозитория
- Создан workflow конфигурация для автоматической публикации
- Добавлены опциональные скрипты для локальной генерации

---

**Дата создания:** 2026-01-29
**Автор:** AI Assistant
**Статус:** В бэклоге
