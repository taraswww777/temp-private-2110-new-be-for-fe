import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { env } from '../config/env.js';
import { youtrackApiService } from '../services/youtrack-api.service.js';
import { templatesService } from '../services/templates.service.js';
import { youtrackLinksService } from '../services/youtrack-links.service.js';
import { tasksService } from '../services/tasks.service.js';
import { youtrackQueueService } from '../services/youtrack-queue.service.js';
import { youtrackProcessorService } from '../services/youtrack-processor.service.js';
import { tagsBlacklistService } from '../services/tags-blacklist.service.js';
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
          200: z.union([
            z.object({
              localTaskId: z.string(),
              youtrackIssueId: z.string(),
              youtrackIssueUrl: z.string(),
              youtrackIssueIds: z.array(z.string()),
            }),
            z.object({
              localTaskId: z.string(),
              youtrackIssueId: z.string(),
              youtrackIssueUrl: z.string(),
              youtrackIssueIds: z.array(z.string()),
              queued: z.literal(true),
              operationId: z.string(),
            }),
          ]),
          404: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
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

      // Проверяем доступность YouTrack
      if (!youtrackProcessorService.isYouTrackAvailable()) {
        // Добавляем операцию в очередь
        const operation = await youtrackQueueService.enqueue({
          type: 'create_issue',
          data: {
            taskId,
            templateId,
            customFields,
          },
        });

        return reply.send({
          localTaskId: taskId,
          youtrackIssueId: '', // Будет заполнено после выполнения
          youtrackIssueUrl: '',
          youtrackIssueIds: localTask.youtrackIssueIds || [],
          queued: true,
          operationId: operation.id,
        });
      }

      try {
        // Применяем шаблон (в YT не подставляем номер задачи и ветку)
        const templateData = await templatesService.applyTemplateToTask(templateId, {
          taskId: '',
          title: localTask.title,
          content: localTask.content,
          status: localTask.status,
          branch: '',
        });

        // Получаем project ID
        const projectId = templateData.projectId === '0-0'
          ? await youtrackApiService.getProjectId()
          : templateData.projectId;

        // Фильтруем теги по чёрному списку (теги из чёрного списка не отправляем в YouTrack)
        const taskTags = localTask.tags ?? [];
        const tagsForYouTrack = await tagsBlacklistService.filterTagsForYouTrack(taskTags);

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

        // Добавляем отфильтрованные теги в описание (если есть)
        const descriptionWithTags =
          tagsForYouTrack.length > 0
            ? `${templateData.description || ''}\n\nТеги: ${tagsForYouTrack.join(', ')}`
            : templateData.description;

        // Создаем задачу в YouTrack
        const createdIssue = await youtrackApiService.createIssue({
          project: { id: projectId },
          summary: templateData.summary,
          description: descriptionWithTags,
          customFields: finalCustomFields,
        });

        const issueId = createdIssue.idReadable ?? createdIssue.id;

        // Привязка к родительской задаче (подзадача)
        if (templateData.parentIssueId) {
          try {
            await youtrackApiService.applyCommand(
              [issueId],
              `subtask of ${templateData.parentIssueId}`
            );
          } catch (err) {
            console.error('Failed to link as subtask:', err);
          }
        }

        const updatedTask = await youtrackLinksService.addLink(taskId, issueId);

        const youtrackIssueIds = (updatedTask.youtrackIssueIds || []).filter(
          (id): id is string => typeof id === 'string' && id.length > 0
        );

        return reply.send({
          localTaskId: taskId,
          youtrackIssueId: issueId,
          youtrackIssueUrl: youtrackApiService.getIssueUrl(issueId),
          youtrackIssueIds,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Если ошибка связана с недоступностью YouTrack, добавляем в очередь (не слать запросы, режим без YT)
        if (
          errorMessage.includes('not configured') ||
          errorMessage.includes('Failed to connect') ||
          errorMessage.includes('temporarily unavailable')
        ) {
          const operation = await youtrackQueueService.enqueue({
            type: 'create_issue',
            data: {
              taskId,
              templateId,
              customFields,
            },
          });

          return reply.send({
            localTaskId: taskId,
            youtrackIssueId: '',
            youtrackIssueUrl: '',
            youtrackIssueIds: localTask.youtrackIssueIds || [],
            queued: true,
            operationId: operation.id,
          });
        }

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
          200: z.union([
            z.object({
              localTaskId: z.string(),
              youtrackIssueId: z.string(),
              youtrackIssueUrl: z.string(),
              youtrackIssueIds: z.array(z.string()),
            }),
            z.object({
              localTaskId: z.string(),
              youtrackIssueId: z.string(),
              youtrackIssueUrl: z.string(),
              youtrackIssueIds: z.array(z.string()),
              queued: z.literal(true),
              operationId: z.string(),
            }),
          ]),
          404: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { taskId } = request.params;
      const { youtrackIssueId } = request.body;

      // Получаем текущие связи задачи (для ответа при постановке в очередь)
      const localTask = await tasksService.getTaskById(taskId);
      if (!localTask) {
        return reply.status(404).send({ message: `Task with id "${taskId}" not found` });
      }
      const currentIssueIds = (localTask.youtrackIssueIds || []).filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      );

      // Проверяем доступность YouTrack
      if (!youtrackProcessorService.isYouTrackAvailable()) {
        // Добавляем операцию в очередь
        const operation = await youtrackQueueService.enqueue({
          type: 'link_issue',
          data: {
            taskId,
            youtrackIssueId,
          },
        });

        return reply.send({
          localTaskId: taskId,
          youtrackIssueId,
          youtrackIssueUrl: '',
          youtrackIssueIds: currentIssueIds,
          queued: true,
          operationId: operation.id,
        });
      }

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
          
          // Если ошибка связана с недоступностью YouTrack, добавляем в очередь (режим без YT)
          if (
            error.message.includes('not configured') ||
            error.message.includes('Failed to connect') ||
            error.message.includes('temporarily unavailable')
          ) {
            const operation = await youtrackQueueService.enqueue({
              type: 'link_issue',
              data: {
                taskId,
                youtrackIssueId,
              },
            });

            return reply.send({
              localTaskId: taskId,
              youtrackIssueId,
              youtrackIssueUrl: '',
              youtrackIssueIds: currentIssueIds,
              queued: true,
              operationId: operation.id,
            });
          }
        }
        return reply.status(400).send({
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  );

  // GET /api/youtrack/issues/:youtrackIssueId - предпросмотр задачи YouTrack (для диалога связывания)
  server.get(
    '/youtrack/issues/:youtrackIssueId',
    {
      schema: {
        description: 'Получить информацию о задаче YouTrack для предпросмотра',
        params: z.object({
          youtrackIssueId: z.string(),
        }),
        response: {
          200: z.object({
            idReadable: z.string(),
            summary: z.string(),
            state: z.string().optional(),
            priority: z.string().optional(),
          }),
          404: z.object({ message: z.string() }),
          503: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { youtrackIssueId } = request.params;

      if (!youtrackProcessorService.isYouTrackAvailable()) {
        return reply.status(503).send({
          message: 'YouTrack is not configured or temporarily unavailable.',
        });
      }

      try {
        const issue = await youtrackApiService.getIssue(
          youtrackIssueId,
          'idReadable,summary,state(name),priority(name)'
        );
        return reply.send({
          idReadable: issue.idReadable ?? issue.id,
          summary: issue.summary ?? '',
          state: issue.state?.name,
          priority: issue.priority?.name,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        if (msg.includes('404') || msg.includes('not found')) {
          return reply.status(404).send({ message: msg || 'Issue not found' });
        }
        return reply.status(503).send({
          message: msg || 'YouTrack is temporarily unavailable.',
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
              youtrackIssueUrl: z.string().optional(),
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
        const ytAvailable = youtrackProcessorService.isYouTrackAvailable();

        const links = await Promise.all(
          youtrackIssueIds.map(async (issueId) => {
            const link: {
              youtrackIssueId: string;
              youtrackIssueUrl?: string;
              youtrackData?: { summary: string; state?: string; priority?: string };
            } = {
              youtrackIssueId: issueId,
            };

            if (ytAvailable && includeDetails) {
              try {
                const issue = await youtrackApiService.getIssue(
                  issueId,
                  'summary,state(name),priority(name)'
                );
                link.youtrackData = {
                  summary: issue.summary ?? '',
                  state: issue.state?.name,
                  priority: issue.priority?.name,
                };
              } catch (error) {
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
          200: z.union([
            z.object({
              localTaskId: z.string(),
              removedIssueId: z.string(),
              youtrackIssueIds: z.array(z.string()),
            }),
            z.object({
              localTaskId: z.string(),
              removedIssueId: z.string(),
              youtrackIssueIds: z.array(z.string()),
              queued: z.literal(true),
              operationId: z.string(),
            }),
          ]),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { taskId, youtrackIssueId } = request.params;

      const localTask = await tasksService.getTaskById(taskId);
      if (!localTask) {
        return reply.status(404).send({ message: `Task with id "${taskId}" not found` });
      }
      const currentIssueIds = (localTask.youtrackIssueIds || []).filter(
        (id): id is string => typeof id === 'string' && id.length > 0
      );

      // Проверяем доступность YouTrack
      if (!youtrackProcessorService.isYouTrackAvailable()) {
        // Добавляем операцию в очередь
        const operation = await youtrackQueueService.enqueue({
          type: 'unlink_issue',
          data: {
            taskId,
            youtrackIssueId,
          },
        });

        return reply.send({
          localTaskId: taskId,
          removedIssueId: youtrackIssueId,
          youtrackIssueIds: currentIssueIds,
          queued: true,
          operationId: operation.id,
        });
      }

      try {
        const updatedTask = await youtrackLinksService.removeLink(taskId, youtrackIssueId);

        return reply.send({
          localTaskId: taskId,
          removedIssueId: youtrackIssueId,
          youtrackIssueIds: updatedTask.youtrackIssueIds || [],
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            return reply.status(404).send({ message: error.message });
          }
          
          // Если ошибка связана с недоступностью YouTrack, добавляем в очередь
          if (
            error.message.includes('not configured') ||
            error.message.includes('Failed to connect') ||
            error.message.includes('temporarily unavailable')
          ) {
            const operation = await youtrackQueueService.enqueue({
              type: 'unlink_issue',
              data: {
                taskId,
                youtrackIssueId,
              },
            });

            return reply.send({
              localTaskId: taskId,
              removedIssueId: youtrackIssueId,
              youtrackIssueIds: currentIssueIds,
              queued: true,
              operationId: operation.id,
            });
          }
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
            parentIssueId: z.string().optional(),
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
            parentIssueId: z.string().optional(),
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
        }),
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            projectId: z.string(),
            parentIssueId: z.string().optional(),
            summaryTemplate: z.string(),
            descriptionTemplate: z.string(),
            customFields: z.record(z.string(), z.unknown()).optional(),
          }),
          400: z.object({ message: z.string() }),
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
          parentIssueId: z.string().optional(),
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
            parentIssueId: z.string().optional(),
            summaryTemplate: z.string(),
            descriptionTemplate: z.string(),
            customFields: z.record(z.string(), z.unknown()).optional(),
          }),
          404: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
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

  // GET /api/youtrack/tags/blacklist - получить чёрный список тегов
  server.get(
    '/youtrack/tags/blacklist',
    {
      schema: {
        description: 'Получить чёрный список тегов (теги из списка не отправляются в YouTrack)',
        response: {
          200: z.object({
            blacklist: z.array(z.string()),
          }),
        },
      },
    },
    async (_request, reply) => {
      const blacklist = await tagsBlacklistService.getBlacklist();
      return reply.send({ blacklist });
    }
  );

  // POST /api/youtrack/tags/blacklist - полная замена чёрного списка
  server.post(
    '/youtrack/tags/blacklist',
    {
      schema: {
        description: 'Обновить чёрный список тегов (полная замена)',
        body: z.object({
          blacklist: z.array(z.string()),
        }),
        response: {
          200: z.object({
            blacklist: z.array(z.string()),
          }),
        },
      },
    },
    async (request, reply) => {
      const { blacklist } = request.body;
      const updated = await tagsBlacklistService.setBlacklist(blacklist);
      return reply.send({ blacklist: updated });
    }
  );

  // PUT /api/youtrack/tags/blacklist - добавить тег в чёрный список
  server.put(
    '/youtrack/tags/blacklist',
    {
      schema: {
        description: 'Добавить тег в чёрный список (если его ещё нет)',
        body: z.object({
          tag: z.string(),
        }),
        response: {
          200: z.object({
            blacklist: z.array(z.string()),
          }),
        },
      },
    },
    async (request, reply) => {
      const { tag } = request.body;
      const blacklist = await tagsBlacklistService.addTag(tag);
      return reply.send({ blacklist });
    }
  );

  // DELETE /api/youtrack/tags/blacklist/:tag - удалить тег из чёрного списка
  server.delete(
    '/youtrack/tags/blacklist/:tag',
    {
      schema: {
        description: 'Удалить тег из чёрного списка',
        params: z.object({
          tag: z.string(),
        }),
        response: {
          200: z.object({
            blacklist: z.array(z.string()),
          }),
        },
      },
    },
    async (request, reply) => {
      const { tag } = request.params;
      const blacklist = await tagsBlacklistService.removeTag(decodeURIComponent(tag));
      return reply.send({ blacklist });
    }
  );

  // GET /api/youtrack/config - базовый URL YouTrack для ссылок на задачи
  server.get(
    '/youtrack/config',
    {
      schema: {
        description: 'Получить конфигурацию YouTrack (базовый URL для ссылок)',
        response: {
          200: z.object({
            baseUrl: z.string().nullable(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const baseUrl = env.YOUTRACK_URL
        ? env.YOUTRACK_URL.replace(/\/$/, '')
        : null;
      return reply.send({ baseUrl });
    }
  );

  // GET /api/youtrack/queue - получить статус очереди
  server.get(
    '/youtrack/queue',
    {
      schema: {
        description: 'Получить статус очереди операций YouTrack',
        response: {
          200: z.object({
            pending: z.number(),
            processing: z.number(),
            completed: z.number(),
            failed: z.number(),
            operations: z.array(z.object({
              id: z.string(),
              type: z.string(),
              status: z.string(),
              createdAt: z.string(),
              attempts: z.number(),
              data: z.object({
                taskId: z.string(),
                templateId: z.string().optional(),
                youtrackIssueId: z.string().optional(),
              }).optional(),
            })),
          }),
        },
      },
    },
    async (request, reply) => {
      const operations = await youtrackQueueService.getAllOperations();
      
      const stats = {
        pending: operations.filter(op => op.status === 'pending').length,
        processing: operations.filter(op => op.status === 'processing').length,
        completed: operations.filter(op => op.status === 'completed').length,
        failed: operations.filter(op => op.status === 'failed').length,
        operations: operations.map(op => ({
          id: op.id,
          type: op.type,
          status: op.status,
          createdAt: op.createdAt,
          attempts: op.attempts,
          data: op.data ? {
            taskId: op.data.taskId,
            ...('templateId' in op.data && op.data.templateId != null && { templateId: op.data.templateId }),
            ...('youtrackIssueId' in op.data && op.data.youtrackIssueId != null && { youtrackIssueId: op.data.youtrackIssueId }),
          } : undefined,
        })),
      };

      return reply.send(stats);
    }
  );

  // POST /api/youtrack/queue/process - обработать очередь вручную
  server.post(
    '/youtrack/queue/process',
    {
      schema: {
        description: 'Обработать все pending операции из очереди',
        response: {
          200: z.object({
            processed: z.number(),
            failed: z.number(),
            errors: z.array(z.object({
              operationId: z.string(),
              error: z.string(),
            })),
          }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      if (!youtrackProcessorService.isYouTrackAvailable()) {
        return reply.status(400).send({
          message: 'YouTrack is not configured',
        });
      }

      const result = await youtrackProcessorService.processPendingOperations();
      return reply.send(result);
    }
  );
};
