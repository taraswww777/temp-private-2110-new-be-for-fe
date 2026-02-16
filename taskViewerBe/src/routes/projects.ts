import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { projectsMetadataService } from '../services/projects-metadata.service.ts';
import { tasksService } from '../services/tasks.service.ts';

export const projectsRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /api/projects — получить все проекты
  server.get(
    '/projects',
    {
      schema: {
        description: 'Получить список всех проектов',
        response: {
          200: z.array(z.object({
            id: z.string(),
            name: z.string(),
          })),
        },
      },
    },
    async (_request, reply) => {
      const projects = await projectsMetadataService.getAllProjects();
      return reply.send(projects);
    }
  );

  // POST /api/projects — создать новый проект
  server.post(
    '/projects',
    {
      schema: {
        description: 'Создать новый проект в projects-metadata.json',
        body: z.object({
          name: z.string().min(1),
        }),
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
          }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name } = request.body;
      const trimmed = name.trim();
      if (!trimmed) {
        return reply.status(400).send({ message: 'Имя проекта не должно быть пустым' });
      }
      const id = await projectsMetadataService.getOrCreateProjectByName(trimmed);
      const project = await projectsMetadataService.getProjectById(id);
      if (!project) {
        return reply.status(400).send({ message: 'Не удалось создать проект' });
      }
      return reply.status(201).send({
        id,
        name: project.name,
      });
    }
  );

  // PATCH /api/projects/:id — переименовать проект
  server.patch(
    '/projects/:id',
    {
      schema: {
        description: 'Переименовать проект',
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          name: z.string().min(1),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
          }),
          400: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name } = request.body;
      const trimmed = name.trim();
      if (!trimmed) {
        return reply.status(400).send({ message: 'Имя проекта не должно быть пустым' });
      }
      try {
        await projectsMetadataService.renameProjectById(id, trimmed);
        const project = await projectsMetadataService.getProjectById(id);
        if (!project) {
          return reply.status(404).send({ message: 'Проект не найден' });
        }
        return reply.send({
          id,
          name: project.name,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Не удалось переименовать проект';
        return reply.status(400).send({ message });
      }
    }
  );

  // DELETE /api/projects/:id — удалить проект
  server.delete(
    '/projects/:id',
    {
      schema: {
        description: 'Удалить проект из источника истины и из всех задач',
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            updated: z.number(),
          }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updated = await tasksService.removeProjectFromAllTasks(id);
      return reply.send({ updated });
    }
  );
};
