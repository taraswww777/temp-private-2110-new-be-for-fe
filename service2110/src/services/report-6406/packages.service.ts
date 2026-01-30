import { db } from '../../db/index.js';
import {
  report6406Packages,
  report6406PackageTasks,
  report6406Tasks,
  TaskStatus,
} from '../../db/schema/index.js';
import { eq, sql, desc, asc, like, and } from 'drizzle-orm';
import { getStatusPermissions } from '../../types/status-model.js';
import type {
  CreatePackageInput,
  UpdatePackageInput,
  PackagesQuery,
  PackagesListResponse,
  PackageDetail,
  PackageTasksQuery,
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
import { tasksService } from './tasks.service.js';

export class PackagesService {
  /**
   * Создать новый пакет
   */
  async createPackage(input: CreatePackageInput): Promise<Package> {
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
   * Получить детальную информацию о пакете с заданиями
   */
  async getPackageById(id: string, tasksQuery: PackageTasksQuery): Promise<PackageDetail> {
    const [pkg] = await db
      .select()
      .from(report6406Packages)
      .where(eq(report6406Packages.id, id))
      .limit(1);

    if (!pkg) {
      throw new Error(`Package with id '${id}' not found`);
    }

    // Получить задания в пакете
    const { tasksNumber, tasksSize, tasksSortBy, tasksSortOrder } = tasksQuery;

    // Подсчет общего количества заданий в пакете
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(report6406PackageTasks)
      .where(eq(report6406PackageTasks.packageId, id));

    // Сортировка
    const orderByColumn = {
      createdAt: report6406Tasks.createdAt,
      branchId: report6406Tasks.branchId,
      status: report6406Tasks.status,
      periodStart: report6406Tasks.periodStart,
    }[tasksSortBy];

    const orderByClause = tasksSortOrder === 'ASC' ? asc(orderByColumn) : desc(orderByColumn);

    // Получение заданий
    const tasks = await db
      .select({
        id: report6406Tasks.id,
        createdAt: report6406Tasks.createdAt,
        createdBy: report6406Tasks.createdBy,
        branchId: report6406Tasks.branchId,
        branchName: report6406Tasks.branchName,
        periodStart: report6406Tasks.periodStart,
        periodEnd: report6406Tasks.periodEnd,
        status: report6406Tasks.status,
        fileSize: report6406Tasks.fileSize,
        format: report6406Tasks.format,
        reportType: report6406Tasks.reportType,
        updatedAt: report6406Tasks.updatedAt,
        addedAt: report6406PackageTasks.addedAt,
      })
      .from(report6406PackageTasks)
      .innerJoin(report6406Tasks, eq(report6406PackageTasks.taskId, report6406Tasks.id))
      .where(eq(report6406PackageTasks.packageId, id))
      .orderBy(orderByClause)
      .limit(tasksSize)
      .offset((tasksNumber - 1) * tasksSize);

    return {
      ...this.formatPackage(pkg),
      tasks: tasks.map((task) => {
        const permissions = getStatusPermissions(task.status as TaskStatus);
        return {
          id: task.id,
          createdAt: task.createdAt.toISOString(),
          createdBy: task.createdBy,
          branchId: task.branchId,
          branchName: task.branchName,
          periodStart: task.periodStart,
          periodEnd: task.periodEnd,
          status: task.status as TaskStatus,
          fileSize: task.fileSize,
          format: task.format,
          reportType: task.reportType,
          updatedAt: task.updatedAt.toISOString(),
          canCancel: permissions.canCancel,
          canDelete: permissions.canDelete,
          canStart: permissions.canStart,
          addedAt: task.addedAt.toISOString(),
        };
      }),
      tasksPagination: {
        number: tasksNumber,
        size: tasksSize,
        totalItems: count,
        totalPages: Math.ceil(count / tasksSize),
      },
    };
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
