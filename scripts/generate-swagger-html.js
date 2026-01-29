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
