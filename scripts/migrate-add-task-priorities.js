#!/usr/bin/env node

/**
 * Скрипт миграции для добавления поля priority: "medium" ко всем задачам в tasks-manifest.json
 * 
 * Использование:
 *   node scripts/migrate-add-task-priorities.js
 */

const { readFile, writeFile } = require('fs/promises');
const { join, resolve } = require('path');

const TASKS_DIR = resolve(process.cwd(), 'docs/tasks');
const MANIFEST_PATH = join(TASKS_DIR, 'tasks-manifest.json');

async function migrate() {
  try {
    console.log('Чтение tasks-manifest.json...');
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(content);

    let updatedCount = 0;

    // Добавляем priority: "medium" ко всем задачам, у которых его нет
    manifest.tasks = manifest.tasks.map((task) => {
      if (!task.priority) {
        updatedCount++;
        return {
          ...task,
          priority: 'medium',
        };
      }
      return task;
    });

    if (updatedCount === 0) {
      console.log('✓ Все задачи уже имеют поле priority. Миграция не требуется.');
      return;
    }

    console.log(`Обновлено задач: ${updatedCount} из ${manifest.tasks.length}`);

    // Сохраняем обновленный манифест
    console.log('Сохранение обновленного tasks-manifest.json...');
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

    console.log('✓ Миграция успешно завершена!');
  } catch (error) {
    console.error('✗ Ошибка при выполнении миграции:', error);
    process.exit(1);
  }
}

migrate();
