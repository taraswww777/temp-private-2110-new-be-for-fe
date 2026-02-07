import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { env } from '../config/env.js';
import type { YouTrackTemplate, TemplateVariables } from '../types/template.types.js';
import { z } from 'zod';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const TEMPLATES_DIR = join(TASKS_DIR, 'youtrack-templates');

/** Убрать из заголовка префикс вида "TASK-053: " перед отправкой в YT */
function cleanTitleForYoutrack(title: string): string {
  return title.replace(/^\s*[A-Z]+-\d+:\s*/i, '').trim();
}

/** Оставить только контент после первой строки "---" (до неё обычно идут Статус, Ветки и дублирование названия) */
function cleanContentForYoutrack(content: string): string {
  if (!content || typeof content !== 'string') return '';
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((line) => line.trim() === '---');
  if (idx === -1) return content.trim();
  return lines.slice(idx + 1).join('\n').trim();
}

// Схема валидации шаблона
const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  projectId: z.string(),
  parentIssueId: z.string().optional(),
  summaryTemplate: z.string(),
  descriptionTemplate: z.string(),
  customFields: z.record(z.string(), z.object({
    $type: z.string(),
    value: z.object({
      name: z.string().optional(),
      login: z.string().optional(),
    }),
  })).optional(),
});

/**
 * Сервис для работы с шаблонами YouTrack
 */
export const templatesService = {
  /**
   * Убедиться, что папка для шаблонов существует
   */
  async ensureTemplatesDir(): Promise<void> {
    if (!existsSync(TEMPLATES_DIR)) {
      await mkdir(TEMPLATES_DIR, { recursive: true });
    }
  },

  /**
   * Получить путь к файлу шаблона
   */
  getTemplatePath(templateId: string): string {
    return join(TEMPLATES_DIR, `${templateId}.json`);
  },

  /**
   * Получить все шаблоны
   */
  async getAllTemplates(): Promise<YouTrackTemplate[]> {
    await this.ensureTemplatesDir();

    if (!existsSync(TEMPLATES_DIR)) {
      return [];
    }

    const { readdir } = await import('fs/promises');
    const files = await readdir(TEMPLATES_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    const templates: YouTrackTemplate[] = [];

    for (const file of jsonFiles) {
      try {
        const template = await this.getTemplate(file.replace('.json', ''));
        if (template) {
          templates.push(template);
        }
      } catch (error) {
        // Пропускаем некорректные файлы
        console.error(`Error reading template ${file}:`, error);
      }
    }

    return templates;
  },

  /**
   * Получить шаблон по ID
   */
  async getTemplate(templateId: string): Promise<YouTrackTemplate | null> {
    await this.ensureTemplatesDir();

    const templatePath = this.getTemplatePath(templateId);
    if (!existsSync(templatePath)) {
      return null;
    }

    const content = await readFile(templatePath, 'utf-8');
    const template = JSON.parse(content);

    // Валидация через Zod
    const parsed = templateSchema.parse(template);
    const validatedTemplate: YouTrackTemplate = {
      ...parsed,
      customFields: parsed.customFields as Record<string, { $type: string; value: { name?: string; login?: string } }> | undefined,
    };
    return validatedTemplate;
  },

  /**
   * Создать новый шаблон
   */
  async createTemplate(template: YouTrackTemplate): Promise<YouTrackTemplate> {
    await this.ensureTemplatesDir();

    // Валидация
    const validatedTemplate = templateSchema.parse(template);

    // Проверка на существование
    const existing = await this.getTemplate(template.id);
    if (existing) {
      throw new Error(`Template with id "${template.id}" already exists`);
    }

    // Сохранение
    const templatePath = this.getTemplatePath(template.id);
    await writeFile(
      templatePath,
      JSON.stringify(validatedTemplate, null, 2),
      'utf-8'
    );

    return validatedTemplate;
  },

  /**
   * Обновить шаблон
   */
  async updateTemplate(templateId: string, updates: Partial<YouTrackTemplate>): Promise<YouTrackTemplate> {
    await this.ensureTemplatesDir();

    const existing = await this.getTemplate(templateId);
    if (!existing) {
      throw new Error(`Template with id "${templateId}" not found`);
    }

    const updatedTemplate: YouTrackTemplate = {
      ...existing,
      ...updates,
      id: templateId, // ID не может быть изменен
    };

    // Валидация
    const parsed = templateSchema.parse(updatedTemplate);
    const validatedTemplate: YouTrackTemplate = {
      ...parsed,
      customFields: parsed.customFields as Record<string, { $type: string; value: { name?: string; login?: string } }> | undefined,
    };

    // Сохранение
    const templatePath = this.getTemplatePath(templateId);
    await writeFile(
      templatePath,
      JSON.stringify(validatedTemplate, null, 2),
      'utf-8'
    );

    return validatedTemplate;
  },

  /**
   * Удалить шаблон
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.ensureTemplatesDir();

    const templatePath = this.getTemplatePath(templateId);
    if (!existsSync(templatePath)) {
      throw new Error(`Template with id "${templateId}" not found`);
    }

    const { unlink } = await import('fs/promises');
    await unlink(templatePath);
  },

  /**
   * Применить переменные к шаблону
   */
  applyTemplateVariables(
    template: string,
    variables: TemplateVariables
  ): string {
    let result = template;

    // Заменяем переменные
    result = result.replace(/\{\{taskId\}\}/g, variables.taskId);
    result = result.replace(/\{\{title\}\}/g, variables.title);
    result = result.replace(/\{\{content\}\}/g, variables.content);
    result = result.replace(/\{\{status\}\}/g, variables.status || '');
    result = result.replace(/\{\{branch\}\}/g, variables.branch || '');

    return result;
  },

  /**
   * Применить шаблон к данным задачи для создания issue в YouTrack
   */
  async applyTemplateToTask(
    templateId: string,
    variables: TemplateVariables
  ): Promise<{
    summary: string;
    description: string;
    customFields: Array<{
      name: string;
      $type: string;
      value: {
        name?: string;
        login?: string;
      };
    }>;
    projectId: string;
    parentIssueId?: string;
  }> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    const cleanedVariables: TemplateVariables = {
      ...variables,
      title: cleanTitleForYoutrack(variables.title),
      content: cleanContentForYoutrack(variables.content),
    };
    const summary = this.applyTemplateVariables(template.summaryTemplate, cleanedVariables);
    const description = this.applyTemplateVariables(template.descriptionTemplate, cleanedVariables);

    const customFields = template.customFields
      ? Object.entries(template.customFields).map(([name, field]) => ({
          name,
          $type: field.$type,
          value: field.value,
        }))
      : [];

    return {
      summary,
      description,
      customFields,
      projectId: template.projectId,
      parentIssueId: template.parentIssueId?.trim() || undefined,
    };
  },
};
