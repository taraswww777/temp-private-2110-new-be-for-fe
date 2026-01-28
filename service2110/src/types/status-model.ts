/**
 * Статусная модель для задач отчётов формы 6406
 * 
 * Включает 21 статус:
 * - 10 статусов для DAPP (Data Application Processing)
 * - 11 статусов для FC (File Conversion)
 */

// Все доступные статусы (21 статус)
export enum TaskStatus {
  // DAPP статусы (Data Application Processing)
  UPLOAD_GENERATION = 'upload_generation',
  REGISTERED = 'registered',
  FAILED = 'failed',
  UPLOAD_NOT_FORMED = 'upload_not_formed',
  UPLOAD_FORMED = 'upload_formed',
  ACCEPTED_DAPP = 'accepted_dapp',
  SUBMITTED_DAPP = 'submitted_dapp',
  KILLED_DAPP = 'killed_dapp',
  NEW_DAPP = 'new_dapp',
  SAVING_DAPP = 'saving_dapp',
  
  // FC статусы (File Conversion)
  CREATED = 'created',
  DELETED = 'deleted',
  STARTED = 'started',
  START_FAILED = 'start_failed',
  CONVERTING = 'converting',
  COMPLETED = 'completed',
  CONVERT_STOPPED = 'convert_stopped',
  IN_QUEUE = 'in_queue',
  FILE_SUCCESS_NOT_EXIST = 'file_success_not_exist',
  FAILED_FC = 'failed_fc',
  HAVE_BROKEN_FILES = 'have_broken_files',
}

// Типы для статусов
export type TaskStatusType = `${TaskStatus}`;

// Статусы для файлов
export enum FileStatus {
  PENDING = 'PENDING',
  CONVERTING = 'CONVERTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type FileStatusType = `${FileStatus}`;

/**
 * Описание разрешений для каждого статуса
 */
export interface StatusPermissions {
  isEndDapp: boolean;      // Признак завершения обработки DAPP
  isEndFc: boolean;        // Признак завершения конвертации файлов
  canCancel: boolean;      // Разрешена ли отмена задания
  canDelete: boolean;      // Разрешено ли удаление задания
  canStart: boolean;       // Разрешен ли запуск задания
  displayName: string;     // Отображаемое имя на русском языке
}

/**
 * Карта разрешений для всех статусов
 */
export const STATUS_PERMISSIONS_MAP: Record<TaskStatus, StatusPermissions> = {
  // DAPP статусы
  [TaskStatus.UPLOAD_GENERATION]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Генерация выгрузки',
  },
  [TaskStatus.REGISTERED]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Задание зарегистрировано',
  },
  [TaskStatus.FAILED]: {
    isEndDapp: true,
    isEndFc: false,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Ошибка генерации выгрузки',
  },
  [TaskStatus.UPLOAD_NOT_FORMED]: {
    isEndDapp: true,
    isEndFc: false,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Выгрузка не сформирована',
  },
  [TaskStatus.UPLOAD_FORMED]: {
    isEndDapp: true,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Выгрузка сформирована',
  },
  [TaskStatus.ACCEPTED_DAPP]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Задание принято к исполнению',
  },
  [TaskStatus.SUBMITTED_DAPP]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Задание поставлено в очередь выполнения',
  },
  [TaskStatus.KILLED_DAPP]: {
    isEndDapp: true,
    isEndFc: false,
    canCancel: true,
    canDelete: true,
    canStart: false,
    displayName: 'Задание остановлено',
  },
  [TaskStatus.NEW_DAPP]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Задание создано',
  },
  [TaskStatus.SAVING_DAPP]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Задание сохранено',
  },
  
  // FC статусы
  [TaskStatus.CREATED]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: false,
    canDelete: true,
    canStart: true,
    displayName: 'Создан отчет',
  },
  [TaskStatus.DELETED]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: false,
    canDelete: false,
    canStart: false,
    displayName: 'Отчет удален',
  },
  [TaskStatus.STARTED]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Отчет запущен',
  },
  [TaskStatus.START_FAILED]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Ошибка запуска отчета',
  },
  [TaskStatus.CONVERTING]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Отчет конвертируется',
  },
  [TaskStatus.COMPLETED]: {
    isEndDapp: false,
    isEndFc: true,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Работа над отчетом завершена (файлы сконвертированы)',
  },
  [TaskStatus.CONVERT_STOPPED]: {
    isEndDapp: false,
    isEndFc: false,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Конвертация остановлена',
  },
  [TaskStatus.IN_QUEUE]: {
    isEndDapp: false,
    isEndFc: true,
    canCancel: true,
    canDelete: false,
    canStart: false,
    displayName: 'Файлы отчета добавлены в очередь на конвертацию',
  },
  [TaskStatus.FILE_SUCCESS_NOT_EXIST]: {
    isEndDapp: false,
    isEndFc: true,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Отсутствует файл _SUCCESS в папке отчета',
  },
  [TaskStatus.FAILED_FC]: {
    isEndDapp: false,
    isEndFc: true,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Ошибка конвертации файла',
  },
  [TaskStatus.HAVE_BROKEN_FILES]: {
    isEndDapp: false,
    isEndFc: true,
    canCancel: false,
    canDelete: true,
    canStart: false,
    displayName: 'Есть файлы с ошибкой конвертации',
  },
};

/**
 * Получить разрешения для статуса
 */
export function getStatusPermissions(status: TaskStatus): StatusPermissions {
  return STATUS_PERMISSIONS_MAP[status];
}

/**
 * Проверить, можно ли выполнить действие для данного статуса
 */
export function canPerformAction(
  status: TaskStatus,
  action: 'cancel' | 'delete' | 'start'
): boolean {
  const permissions = getStatusPermissions(status);
  
  switch (action) {
    case 'cancel':
      return permissions.canCancel;
    case 'delete':
      return permissions.canDelete;
    case 'start':
      return permissions.canStart;
    default:
      return false;
  }
}

/**
 * Массив всех статусов для использования в валидации
 */
export const ALL_TASK_STATUSES: TaskStatus[] = Object.values(TaskStatus);

/**
 * Массив всех статусов для использования в SQL CHECK constraint
 */
export const ALL_TASK_STATUSES_SQL: string[] = ALL_TASK_STATUSES.map(s => s.toString());
