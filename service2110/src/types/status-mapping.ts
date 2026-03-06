/**
 * Маппинг между внутренней статусной моделью (TaskStatus, DAPP/FC)
 * и API-моделью (TaskStatusEnum, task_*)
 */

import { TaskStatus } from './status-model.ts';
import { TaskStatusEnum } from '../schemas/enums/TaskStatusEnum.ts';

/**
 * Преобразование внутреннего статуса в API-статус (task_*)
 */
export function taskStatusToApiStatus(status: TaskStatus): TaskStatusEnum {
  const map: Record<TaskStatus, TaskStatusEnum> = {
    [TaskStatus.UPLOAD_GENERATION]: TaskStatusEnum.LOADING,
    [TaskStatus.REGISTERED]: TaskStatusEnum.LOADING,
    [TaskStatus.FAILED]: TaskStatusEnum.FAIL_DATA,
    [TaskStatus.UPLOAD_NOT_FORMED]: TaskStatusEnum.EMPTY_DATA,
    [TaskStatus.UPLOAD_FORMED]: TaskStatusEnum.LOADING,
    [TaskStatus.ACCEPTED_DAPP]: TaskStatusEnum.LOADING,
    [TaskStatus.SUBMITTED_DAPP]: TaskStatusEnum.LOADING,
    [TaskStatus.KILLED_DAPP]: TaskStatusEnum.CANCEL_GENERATION,
    [TaskStatus.NEW_DAPP]: TaskStatusEnum.CREATE,
    [TaskStatus.SAVING_DAPP]: TaskStatusEnum.LOADING,
    [TaskStatus.CREATED]: TaskStatusEnum.CREATE,
    [TaskStatus.DELETED]: TaskStatusEnum.DELETE,
    [TaskStatus.STARTED]: TaskStatusEnum.CONVERSION,
    [TaskStatus.START_FAILED]: TaskStatusEnum.FAIL_GENERATION,
    [TaskStatus.CONVERTING]: TaskStatusEnum.CONVERSION,
    [TaskStatus.COMPLETED]: TaskStatusEnum.DONE,
    [TaskStatus.CONVERT_STOPPED]: TaskStatusEnum.FAIL_GENERATION,
    [TaskStatus.IN_QUEUE]: TaskStatusEnum.LOADING,
    [TaskStatus.FILE_SUCCESS_NOT_EXIST]: TaskStatusEnum.FAIL_GENERATION,
    [TaskStatus.FAILED_FC]: TaskStatusEnum.FAIL_GENERATION,
    [TaskStatus.HAVE_BROKEN_FILES]: TaskStatusEnum.FAIL_GENERATION,
  };
  return map[status] ?? TaskStatusEnum.CREATE;
}

/**
 * Преобразование API-статуса (task_*) в массив внутренних статусов для фильтрации
 */
export function apiStatusToTaskStatuses(apiStatus: TaskStatusEnum): TaskStatus[] {
  const map: Record<TaskStatusEnum, TaskStatus[]> = {
    [TaskStatusEnum.CREATE]: [TaskStatus.CREATED, TaskStatus.NEW_DAPP],
    [TaskStatusEnum.LOADING]: [
      TaskStatus.UPLOAD_GENERATION,
      TaskStatus.REGISTERED,
      TaskStatus.UPLOAD_FORMED,
      TaskStatus.ACCEPTED_DAPP,
      TaskStatus.SUBMITTED_DAPP,
      TaskStatus.SAVING_DAPP,
      TaskStatus.IN_QUEUE,
    ],
    [TaskStatusEnum.DATA]: [TaskStatus.UPLOAD_FORMED, TaskStatus.ACCEPTED_DAPP, TaskStatus.SUBMITTED_DAPP],
    [TaskStatusEnum.EMPTY_DATA]: [TaskStatus.UPLOAD_NOT_FORMED],
    [TaskStatusEnum.FAIL_DATA]: [TaskStatus.FAILED],
    [TaskStatusEnum.CANCEL_DATA]: [TaskStatus.KILLED_DAPP],
    [TaskStatusEnum.CONVERSION]: [TaskStatus.STARTED, TaskStatus.CONVERTING],
    [TaskStatusEnum.DONE]: [TaskStatus.COMPLETED],
    [TaskStatusEnum.FAIL_GENERATION]: [
      TaskStatus.START_FAILED,
      TaskStatus.CONVERT_STOPPED,
      TaskStatus.FILE_SUCCESS_NOT_EXIST,
      TaskStatus.FAILED_FC,
      TaskStatus.HAVE_BROKEN_FILES,
    ],
    [TaskStatusEnum.CANCEL_GENERATION]: [TaskStatus.KILLED_DAPP],
    [TaskStatusEnum.DELETE]: [TaskStatus.DELETED],
  };
  return map[apiStatus] ?? [];
}
