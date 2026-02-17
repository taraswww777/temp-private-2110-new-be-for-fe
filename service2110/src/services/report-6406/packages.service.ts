import { db } from '../../db/index.js';
import {
  report6406Packages,
  report6406PackageTasks,
  report6406Tasks,
  report6406TaskBranches,
  branches,
} from '../../db/schema/index.js';
import { eq, sql, desc, asc, like, and, inArray } from 'drizzle-orm';
import type {
  CreatePackageInput,
  UpdatePackageInput,
  PackagesQuery,
  PackagesListResponse,
  Package,
  UpdatePackageResponse,
  BulkDeletePackagesInput,
  BulkDeletePackagesResponse,
  AddTasksToPackageInput,
  AddTasksToPackageResponse,
  BulkRemoveTasksFromPackageInput,
  BulkRemoveTasksResponse,
  CopyToTfrResponse,
} from '../../schemas/report-6406/packages.schema';

export class PackagesService {
  /**
   * Проверить уникальность имени пакета
   */
  private async checkPackageNameUniqueness(name: string, excludeId?: string): Promise<string | null> {
    const result = await db
      .select({ id: report6406Packages.id })
      .from(report6406Packages)
      .where(eq(report6406Packages.name, name))
      .limit(2);

    // Если нет пакетов с таким именем
    if (result.length === 0) {
      return null;
    }

    // Если найден только один пакет
    if (result.length === 1) {
      // Если это тот же пакет, который мы редактируем - нет дубликата
      if (excludeId && result[0].id === excludeId) {
        return null;
      }
      // Иначе есть дубликат
      return result[0].id;
    }

    // Если найдено два пакета, значит есть дубликат
    // (даже если один из них - редактируемый, другой - дубликат)
    return result.find(r => r.id !== excludeId)?.id || null;
  }

  /**
   * Создать новый пакет
   */
  async createPackage(input: CreatePackageInput): Promise<Package> {
    // Проверка уникальности имени пакета
    const existingPackageId = await this.checkPackageNameUniqueness(input.name);
    if (existingPackageId) {
      const error = new Error('PACKET_NAME_DUPLICATE') as Error & { statusCode?: number; details?: object };
      error.statusCode = 400;
      error.details = {
        name: input.name,
        existingPacketId: existingPackageId
      };
      throw error;
    }

    const [pkg] = await db
      .insert(report6406Packages)
      .values({
        name: input.name,
        createdBy: input.createdBy,
        tasksCount: 0,
        totalSize: 0,
      })
      .returning();

    return this.formatPackage(pkg);
  }

  /**
   * Получить список пакетов с пагинацией
   */
  async getPackages(query: PackagesQuery): Promise<PackagesListResponse> {
    const { number: pageNumber, size: pageSize, sortBy, sortOrder, search } = query;

    // Построение WHERE условий
    const conditions = [];

    if (search) {
      conditions.push(like(report6406Packages.name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Подсчет общего количества
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(report6406Packages)
      .where(whereClause);

    // Сортировка
    const orderByColumn = {
      createdAt: report6406Packages.createdAt,
      name: report6406Packages.name,
      tasksCount: report6406Packages.tasksCount,
      totalSize: report6406Packages.totalSize,
    }[sortBy];

    const orderByClause = sortOrder === 'ASC' ? asc(orderByColumn) : desc(orderByColumn);

    // Получение данных
    const packages = await db
      .select()
      .from(report6406Packages)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    return {
      packages: packages.map(pkg => this.formatPackage(pkg)),
      pagination: {
        number: pageNumber,
        size: pageSize,
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  /**
   * Получить детальную информацию о пакете
   */
  async getPackageById(id: string): Promise<Package> {
    const [pkg] = await db
      .select()
      .from(report6406Packages)
      .where(eq(report6406Packages.id, id))
      .limit(1);

    if (!pkg) {
      throw new Error(`Package with id '${id}' not found`);
    }

    return this.formatPackage(pkg);
  }

  /**
   * Обновить название пакета
   */
  async updatePackage(id: string, input: UpdatePackageInput): Promise<UpdatePackageResponse> {
    const [pkg] = await db
      .select()
      .from(report6406Packages)
      .where(eq(report6406Packages.id, id))
      .limit(1);

    if (!pkg) {
      throw new Error(`Package with id '${id}' not found`);
    }

    // Проверка уникальности имени пакета (исключая текущий пакет)
    const existingPackageId = await this.checkPackageNameUniqueness(input.name, id);
    if (existingPackageId) {
      const error = new Error('PACKET_NAME_DUPLICATE') as Error & { statusCode?: number; details?: object };
      error.statusCode = 400;
      error.details = {
        name: input.name,
        existingPacketId: existingPackageId
      };
      throw error;
    }

    const [updatedPkg] = await db
      .update(report6406Packages)
      .set({
        name: input.name,
        updatedAt: new Date(),
      })
      .where(eq(report6406Packages.id, id))
      .returning();

    return {
      id: updatedPkg.id,
      name: updatedPkg.name,
      updatedAt: updatedPkg.updatedAt.toISOString(),
    };
  }

  /**
   * Удалить пакет
   */
  async deletePackage(id: string): Promise<void> {
    const [pkg] = await db
      .select()
      .from(report6406Packages)
      .where(eq(report6406Packages.id, id))
      .limit(1);

    if (!pkg) {
      throw new Error(`Package with id '${id}' not found`);
    }

    await db.delete(report6406Packages).where(eq(report6406Packages.id, id));
  }

  /**
   * Массовое удаление пакетов (универсальный метод для одного или нескольких)
   */
  async bulkDeletePackages(input: BulkDeletePackagesInput): Promise<BulkDeletePackagesResponse> {
    let deleted = 0;
    const results: Array<{ packageId: string; success: boolean; reason?: string }> = [];

    for (const packageId of input.packageIds) {
      try {
        await this.deletePackage(packageId);
        deleted++;
        results.push({
          packageId,
          success: true,
        });
      } catch (error) {
        results.push({
          packageId,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      deleted,
      failed: input.packageIds.length - deleted,
      results,
    };
  }

  /**
   * Добавить задания в пакет
   */
  async addTasksToPackage(packageId: string, input: AddTasksToPackageInput): Promise<AddTasksToPackageResponse> {
    // Проверить существование пакета
    const [pkg] = await db
      .select()
      .from(report6406Packages)
      .where(eq(report6406Packages.id, packageId))
      .limit(1);

    if (!pkg) {
      throw new Error(`Package with id '${packageId}' not found`);
    }

    let added = 0;
    let alreadyInPackage = 0;
    let notFound = 0;
    const errors: Array<{ taskId: string; reason: string }> = [];

    for (const taskId of input.taskIds) {
      try {
        // Проверить существование задания
        const [task] = await db
          .select()
          .from(report6406Tasks)
          .where(eq(report6406Tasks.id, taskId))
          .limit(1);

        if (!task) {
          notFound++;
          errors.push({ taskId, reason: 'Task not found' });
          continue;
        }

        // Проверить, что задание уже не в пакете
        const [existing] = await db
          .select()
          .from(report6406PackageTasks)
          .where(
            and(
              eq(report6406PackageTasks.packageId, packageId),
              eq(report6406PackageTasks.taskId, taskId)
            )
          )
          .limit(1);

        if (existing) {
          alreadyInPackage++;
          errors.push({ taskId, reason: 'Task already in package' });
          continue;
        }

        // Добавить задание в пакет
        await db.insert(report6406PackageTasks).values({
          packageId,
          taskId,
        });

        added++;
      } catch (error) {
        errors.push({
          taskId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Обновить денормализованные поля пакета
    if (added > 0) {
      await this.updatePackageStats(packageId);
    }

    return {
      added,
      alreadyInPackage,
      notFound,
      errors,
    };
  }

  /**
   * Удалить задание из пакета
   */
  async removeTaskFromPackage(packageId: string, taskId: string): Promise<void> {
    const [relation] = await db
      .select()
      .from(report6406PackageTasks)
      .where(
        and(
          eq(report6406PackageTasks.packageId, packageId),
          eq(report6406PackageTasks.taskId, taskId)
        )
      )
      .limit(1);

    if (!relation) {
      throw new Error(`Task '${taskId}' not found in package '${packageId}'`);
    }

    await db
      .delete(report6406PackageTasks)
      .where(
        and(
          eq(report6406PackageTasks.packageId, packageId),
          eq(report6406PackageTasks.taskId, taskId)
        )
      );

    // Обновить денормализованные поля пакета
    await this.updatePackageStats(packageId);
  }

  /**
   * Массовое удаление заданий из пакета (универсальный метод для одного или нескольких)
   */
  async bulkRemoveTasksFromPackage(
    packageId: string,
    input: BulkRemoveTasksFromPackageInput
  ): Promise<BulkRemoveTasksResponse> {
    let removed = 0;
    const results: Array<{ taskId: string; success: boolean; reason?: string }> = [];

    for (const taskId of input.taskIds) {
      try {
        await this.removeTaskFromPackage(packageId, taskId);
        removed++;
        results.push({
          taskId,
          success: true,
        });
      } catch (error) {
        results.push({
          taskId,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      removed,
      failed: input.taskIds.length - removed,
      results,
    };
  }

  /**
   * Скопировать пакет в ТФР
   */
  async copyToTfr(packageId: string): Promise<CopyToTfrResponse> {
    const [pkg] = await db
      .select()
      .from(report6406Packages)
      .where(eq(report6406Packages.id, packageId))
      .limit(1);

    if (!pkg) {
      throw new Error(`Package with id '${packageId}' not found`);
    }

    if (pkg.tasksCount === 0) {
      throw new Error('Cannot copy empty package to TFR');
    }

    const [updatedPkg] = await db
      .update(report6406Packages)
      .set({
        lastCopiedToTfrAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(report6406Packages.id, packageId))
      .returning();

    return {
      id: updatedPkg.id,
      lastCopiedToTfrAt: updatedPkg.lastCopiedToTfrAt!.toISOString(),
      message: 'Package successfully copied to TFR',
    };
  }

  /**
   * Обновить денормализованные поля пакета (tasksCount и totalSize)
   */
  private async updatePackageStats(packageId: string): Promise<void> {
    const [stats] = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalSize: sql<number>`coalesce(sum(${report6406Tasks.fileSize}), 0)::bigint`,
      })
      .from(report6406PackageTasks)
      .leftJoin(report6406Tasks, eq(report6406PackageTasks.taskId, report6406Tasks.id))
      .where(eq(report6406PackageTasks.packageId, packageId));

    await db
      .update(report6406Packages)
      .set({
        tasksCount: stats.count,
        totalSize: stats.totalSize,
        updatedAt: new Date(),
      })
      .where(eq(report6406Packages.id, packageId));
  }

  /**
   * Форматирование пакета для API
   */
  private formatPackage(pkg: typeof report6406Packages.$inferSelect): Package {
    return {
      id: pkg.id,
      name: pkg.name,
      createdAt: pkg.createdAt.toISOString(),
      createdBy: pkg.createdBy,
      lastCopiedToTfrAt: pkg.lastCopiedToTfrAt?.toISOString() || null,
      tasksCount: pkg.tasksCount,
      totalSize: pkg.totalSize,
      updatedAt: pkg.updatedAt.toISOString(),
    };
  }
}

export const packagesService = new PackagesService();
