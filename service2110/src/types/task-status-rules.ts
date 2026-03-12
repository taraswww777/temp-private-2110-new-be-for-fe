import { TaskStatusEnum } from '../schemas/enums/TaskStatusEnum';

export interface StatusPermissions {
  canCancel: boolean; // Отменить
  canDelete: boolean; // Удалить
  canStart: boolean; // Запустить
  canAddToPackage: boolean; // Можно добавить задание в пакет
  isFinal: boolean; // Финальный статус
  displayName: string; // Название (RU)
}

/**
 * Статусная модель для задач (task_*)
 */
export const TASK_STATUS_PERMISSIONS: Record<TaskStatusEnum, StatusPermissions> = {
  [TaskStatusEnum.CREATE]: {
    canCancel: false,
    canDelete: true,
    canStart: true,
    canAddToPackage: false,
    isFinal: false,
    displayName: 'Создано',
  },
  [TaskStatusEnum.LOADING]: {
    canCancel: false,
    canDelete: false,
    canStart: false,
    canAddToPackage: false,
    isFinal: false,
    displayName: 'Готовится к запуску',
  },
  [TaskStatusEnum.DATA]: {
    canCancel: true,
    canDelete: false,
    canStart: false,
    canAddToPackage: false,
    isFinal: false,
    displayName: 'Выборка данных',
  },
  [TaskStatusEnum.EMPTY_DATA]: {
    canCancel: false,
    canDelete: true,
    canStart: false,
    canAddToPackage: false,
    isFinal: true,
    displayName: 'Нет данных по заданным параметрам',
  },
  [TaskStatusEnum.FAIL_DATA]: {
    canCancel: false,
    canDelete: true,
    canStart: true,
    canAddToPackage: false,
    isFinal: true,
    displayName: 'Выборка не выполнена',
  },
  [TaskStatusEnum.CANCEL_DATA]: {
    canCancel: false,
    canDelete: true,
    canStart: true,
    canAddToPackage: false,
    isFinal: true,
    displayName: 'Выборка данных отменена',
  },
  [TaskStatusEnum.CONVERSION]: {
    canCancel: true,
    canDelete: false,
    canStart: false,
    canAddToPackage: false,
    isFinal: false,
    displayName: 'Генерация',
  },
  [TaskStatusEnum.DONE]: {
    canCancel: false,
    canDelete: true,
    canStart: false,
    canAddToPackage: true,
    isFinal: true,
    displayName: 'Выполнено',
  },
  [TaskStatusEnum.FAIL_GENERATION]: {
    canCancel: true,
    canDelete: true,
    canStart: true,
    canAddToPackage: false,
    isFinal: true,
    displayName: 'Генерация не выполнена',
  },
  [TaskStatusEnum.CANCEL_GENERATION]: {
    canCancel: false,
    canDelete: true,
    canStart: true,
    canAddToPackage: false,
    isFinal: true,
    displayName: 'Генерация отменена',
  },
  [TaskStatusEnum.DELETE]: {
    canCancel: false,
    canDelete: false,
    canStart: false,
    canAddToPackage: false,
    isFinal: true,
    displayName: 'Удалено',
  },
};

export function getStatusPermissions(status: string): StatusPermissions {
  return TASK_STATUS_PERMISSIONS[status as TaskStatusEnum];
}

export function canPerformAction(
  status: TaskStatusEnum,
  action: 'cancel' | 'delete' | 'start' | 'addToPackage',
): boolean {
  const permissions = getStatusPermissions(status);

  switch (action) {
    case 'cancel':
      return permissions.canCancel;
    case 'delete':
      return permissions.canDelete;
    case 'start':
      return permissions.canStart;
    case 'addToPackage':
      return permissions.canAddToPackage;
    default:
      return false;
  }
}

export const ALL_TASK_STATUSES: string[] = Object.values(TaskStatusEnum);
export const ALL_TASK_STATUSES_SQL: string[] = ALL_TASK_STATUSES.map((s) => s.toString());
