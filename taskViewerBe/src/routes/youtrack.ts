import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { youtrackApiService } from '../services/youtrack-api.service.js';
import { templatesService } from '../services/templates.service.js';
import { youtrackLinksService } from '../services/youtrack-links.service.js';
import { tasksService } from '../services/tasks.service.js';
import type { YouTrackTemplate } from '../types/template.types.js';

export const youtrackRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // POST /api/youtrack/tasks - создать задачу в YouTrack
  server.post(
    '/youtrack/tasks',
    {
      schema: {
        description: 'Создать задачу в YouTrack на основе локальной задачи',
        body: z.object({
          taskId: z.string(),
          templateId: z.string().default('default'),
          customFields: z.record(z.string(), z.unknown()).optional(),
        }),
        response: {
          200: z.object({
            localTaskId: z.string(),
            youtrackIssueId: z.string(),
            youtrackIssueUrl: z.string(),
            youtrackIssueIds: z.array(z.string()),
          }),
          404: z.object({ message: z.string() }),
          400: z.object({ message: z.string(), code: z.string().optional() }),
        },
      },
    },
    async (request, reply) => {
      const { taskId, templateId, customFields } = request.body;

      // Получаем локальную задачу
      const localTask = await tasksService.getTaskById(taskId);
      if (!localTask) {
        return reply.status(404).send({ message: `Task with id "${taskId}" not found` });
      }

      try {
        // Применяем шаблон
        const templateData = await templatesService.applyTemplateToTask(templateId, {
          taskId: localTask.id,
          title: localTask.title,
          content: localTask.content,
          status: localTask.status,
          branch: localTask.branch,
        });

        // Получаем project ID
        const projectId = templateData.projectId === '0-0'
          ? await youtrackApiService.getProjectId()
          : templateData.projectId;

        // Применяем переопределения customFields, если есть
        const finalCustomFields = customFields
          ? Object.entries(customFields).map(([name, value]) => {
              // Если value - объект с $type и value, используем его как есть
              if (typeof value === 'object' && value !== null && '$type' in value && 'value' in value) {
                const typedValue = value as { $type: string; value: { name?: string; login?: string } };
                return {
                  name,
                  $type: typedValue.$type,
                  value: typedValue.value,
                };
              }
              // Иначе пытаемся найти в шаблоне и переопределить только value
              const templateField = templateData.customFields.find(f => f.name === name);
              if (templateField) {
                return {
                  ...templateField,
                  value: typeof value === 'string' ? { name: value } : value as { name?: string; login?: string },
                };
              }
              // Если поля нет в шаблоне, создаем базовое поле
              return {
                name,
                $type: 'SingleEnumIssueCustomField',
                value: typeof value === 'string' ? { name: value } : value as { name?: string; login?: string },
              };
            })
          : templateData.customFields;

        // Создаем задачу в YouTrack
        const createdIssue = await youtrackApiService.createIssue({
          project: { id: projectId },
          summary: templateData.summary,
          description: templateData.description,
          customFields: finalCustomFields,
        });

        // Добавляем связь
        const updatedTask = await youtrackLinksService.addLink(taskId, createdIssue.idReadable);

        return reply.send({
          localTaskId: taskId,
          youtrackIssueId: createdIssue.idReadable,
          youtrackIssueUrl: youtrackApiService.getIssueUrl(createdIssue.idReadable),
          youtrackIssueIds: updatedTask.youtrackIssueIds || [],
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return reply.status(400).send({
          message: `Failed to create YouTrack issue: ${errorMessage}`,
        });
      }
    }
  );

  // POST /api/youtrack/tasks/:taskId/link - связать существующую задачу
  server.post(
    '/youtrack/tasks/:taskId/link',
    {
      schema: {
        description: 'Связать локальную задачу с существующей задачей в YouTrack',
        params: z.object({
          taskId: z.string(),
        }),
        body: z.object({
          youtrackIssueId: z.string(),
        }),
        response: {
          200: z.object({
            localTaskId: z.string(),
            youtrackIssueId: z.string(),
            youtrackIssueUrl: z.string(),
            youtrackIssueIds: z.array(z.string()),
          }),
          404: z.object({ message: z.string() }),
          400: z.object({ message: z.string(), code: z.string().optional() }),
        },
      },
    },
    async (request, reply) => {
      const { taskId } = request.params;
      const { youtrackIssueId } = request.body;

      try {
        // Проверяем существование задачи в YouTrack
        await youtrackApiService.getIssue(youtrackIssueId);

        // Добавляем связь
        const updatedTask = await youtrackLinksService.addLink(taskId, youtrackIssueId);

        return reply.send({
          localTaskId: taskId,
          youtrackIssueId,
          youtrackIssueUrl: youtrackApiService.getIssueUrl(youtrackIssueId),
          youtrackIssueIds: updatedTask.youtrackIssueIds || [],
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            return reply.status(404).send({
              message: error.message,
            });
          }
          if (error.message.includes('already exists')) {
            return reply.status(400).send({
              message: error.message,
            });
          }
        }
        return reply.status(400).send({
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // GET /api/youtrack/tasks/:taskId - получить информацию о связях
  server.get(
    '/youtrack/tasks/:taskId',
    {
      schema: {
        description: 'Получить информацию о всех связях локальной задачи с YouTrack',
        params: z.object({
          taskId: z.string(),
        }),
        querystring: z.object({
          includeDetails: z.string().optional(),
        }).optional(),
        response: {
          200: z.object({
            localTaskId: z.string(),
            youtrackIssueIds: z.array(z.string()),
            links: z.array(z.object({
              youtrackIssueId: z.string(),
              youtrackIssueUrl: z.string(),
              youtrackData: z.object({
                summary: z.string(),
                state: z.string().optional(),
                priority: z.string().optional(),
              }).optional(),
            })),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { taskId } = request.params;
      const query = request.query as { includeDetails?: string } | undefined;
      const includeDetails = query?.includeDetails === 'true';

      try {
        const youtrackIssueIds = await youtrackLinksService.getLinks(taskId);

        const links = await Promise.all(
          youtrackIssueIds.map(async (issueId) => {
            const link = {
              youtrackIssueId: issueId,
              youtrackIssueUrl: youtrackApiService.getIssueUrl(issueId),
              youtrackData: undefined as {
                summary: string;
                state?: string;
                priority?: string;
              } | undefined,
            };

            if (includeDetails) {
              try {
                const issue = await youtrackApiService.getIssue(issueId);
                link.youtrackData = {
                  summary: issue.summary,
                  state: issue.state?.name,
                  priority: issue.priority?.name,
                };
              } catch (error) {
                // Если не удалось получить детали, просто пропускаем их
                console.error(`Failed to get details for issue ${issueId}:`, error);
              }
            }

            return link;
          })
        );

        return reply.send({
          localTaskId: taskId,
          youtrackIssueIds,
          links,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.status(404).send({ message: error.message });
        }
        throw error;
      }
    }
  );

  // DELETE /api/youtrack/tasks/:taskId/link/:youtrackIssueId - удалить связь
  server.delete(
    '/youtrack/tasks/:taskId/link/:youtrackIssueId',
    {
      schema: {
        description: 'Удалить связь локальной задачи с задачей в YouTrack',
        params: z.object({
          taskId: z.string(),
          youtrackIssueId: z.string(),
        }),
        response: {
          200: z.object({
            localTaskId: z.string(),
            removedIssueId: z.string(),
            youtrackIssueIds: z.array(z.string()),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { taskId, youtrackIssueId } = request.params;

      try {
        const updatedTask = await youtrackLinksService.removeLink(taskId, youtrackIssueId);

        return reply.send({
          localTaskId: taskId,
          removedIssueId: youtrackIssueId,
          youtrackIssueIds: updatedTask.youtrackIssueIds || [],
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.status(404).send({ message: error.message });
        }
        throw error;
      }
    }
  );

  // GET /api/youtrack/templates - получить все шаблоны
  server.get(
    '/youtrack/templates',
    {
      schema: {
        description: 'Получить список всех шаблонов',
        response: {
          200: z.array(z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            projectId: z.string(),
            summaryTemplate: z.string(),
            descriptionTemplate: z.string(),
            customFields: z.record(z.string(), z.unknown()).optional(),
          })),
        },
      },
    },
    async (request, reply) => {
      const templates = await templatesService.getAllTemplates();
      return reply.send(templates);
    }
  );

  // GET /api/youtrack/templates/:templateId - получить шаблон по ID
  server.get(
    '/youtrack/templates/:templateId',
    {
      schema: {
        description: 'Получить шаблон по ID',
        params: z.object({
          templateId: z.string(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            projectId: z.string(),
            summaryTemplate: z.string(),
            descriptionTemplate: z.string(),
            customFields: z.record(z.string(), z.unknown()).optional(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { templateId } = request.params;
      const template = await templatesService.getTemplate(templateId);

      if (!template) {
        return reply.status(404).send({ message: `Template with id "${templateId}" not found` });
      }

      return reply.send(template);
    }
  );

  // POST /api/youtrack/templates - создать шаблон
  server.post(
    '/youtrack/templates',
    {
      schema: {
        description: 'Создать новый шаблон',
        body: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          projectId: z.string(),
          summaryTemplate: z.string(),
          descriptionTemplate: z.string(),
          customFields: z.record(z.string(), z.object({
            $type: z.string(),
            value: z.object({
              name: z.string().optional(),
              login: z.string().optional(),
            }),
          })).optional(),
        }),
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            projectId: z.string(),
            summaryTemplate: z.string(),
            descriptionTemplate: z.string(),
            customFields: z.record(z.string(), z.unknown()).optional(),
          }),
          400: z.object({ message: z.string(), code: z.string().optional() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const template = await templatesService.createTemplate(request.body as YouTrackTemplate);
        return reply.status(201).send(template);
      } catch (error) {
        return reply.status(400).send({
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'TEMPLATE_ERROR',
        });
      }
    }
  );

  // PUT /api/youtrack/templates/:templateId - обновить шаблон
  server.put(
    '/youtrack/templates/:templateId',
    {
      schema: {
        description: 'Обновить шаблон',
        params: z.object({
          templateId: z.string(),
        }),
        body: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          projectId: z.string().optional(),
          summaryTemplate: z.string().optional(),
          descriptionTemplate: z.string().optional(),
          customFields: z.record(z.string(), z.object({
            $type: z.string(),
            value: z.object({
              name: z.string().optional(),
              login: z.string().optional(),
            }),
          })).optional(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            projectId: z.string(),
            summaryTemplate: z.string(),
            descriptionTemplate: z.string(),
            customFields: z.record(z.string(), z.unknown()).optional(),
          }),
          404: z.object({ message: z.string() }),
          400: z.object({ message: z.string(), code: z.string().optional() }),
        },
      },
    },
    async (request, reply) => {
      const { templateId } = request.params;
      try {
        const template = await templatesService.updateTemplate(
          templateId,
          request.body as Partial<YouTrackTemplate>
        );
        return reply.send(template);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.status(404).send({ message: error.message });
        }
        return reply.status(400).send({
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'TEMPLATE_ERROR',
        });
      }
    }
  );

  // DELETE /api/youtrack/templates/:templateId - удалить шаблон
  server.delete(
    '/youtrack/templates/:templateId',
    {
      schema: {
        description: 'Удалить шаблон',
        params: z.object({
          templateId: z.string(),
        }),
        response: {
          204: z.null(),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { templateId } = request.params;
      try {
        await templatesService.deleteTemplate(templateId);
        return reply.status(204).send(null);
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.status(404).send({ message: error.message });
        }
        throw error;
      }
    }
  );
};
