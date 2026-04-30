import type { FastifyPluginAsync } from 'fastify';
import { packageStatusHistoryRoutes } from './status-history';
import { createPackageRoute } from './create.routes';
import { listPackagesRoute } from './list.routes';
import { getPackageRoute } from './get.routes';
import { updatePackageRoute } from './update.routes';
import { deletePackagesRoute } from './delete.routes';
import { addTasksToPackageRoute } from './add-tasks.routes';
import { removeTasksFromPackageRoute } from './remove-tasks.routes';
import { tfrRoutes } from './copy-to-tfr.routes';

/**
 * Регистрация всех роутов для работы с пакетами (packages)
 * Все эндпоинты замокированы для генерации Swagger-спецификации
 */
export const packagesRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(createPackageRoute);
  await fastify.register(listPackagesRoute);
  await fastify.register(getPackageRoute);
  await fastify.register(updatePackageRoute);
  await fastify.register(deletePackagesRoute);
  await fastify.register(addTasksToPackageRoute);
  await fastify.register(removeTasksFromPackageRoute);
  await fastify.register(tfrRoutes);
  await fastify.register(packageStatusHistoryRoutes);
};
