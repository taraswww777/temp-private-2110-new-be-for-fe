import { TaskStatusEnum } from './taskStatusEnum.ts';
import { TaskPriorityEnum } from './taskPriorityEnum.ts';

export interface Task {
  id: string;
  title: string;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  file: string;
  createdDate: string | null;
  completedDate: string | null;
  branch: string | null;
  youtrackIssueIds?: string[];
  /** Имена тегов (в API и ответах; в манифесте хранятся tagIds). */
  tags?: string[];
  /** Имя проекта (в API и ответах; в манифесте хранится projectId). */
  project?: string | null;
}

/** Запись задачи в манифесте: теги хранятся по ID, проект по ID. */
export interface TaskInManifest extends Omit<Task, 'tags' | 'project'> {
  tagIds?: string[];
  /** @deprecated Используется только при миграции со старого формата (tags по именам). */
  tags?: string[];
  /** ID проекта (в манифесте хранится projectId; в API резолвится в имя). */
  projectId?: string | null;
}

export interface TaskManifest {
  tasks: TaskInManifest[];
}

export interface TaskDetail extends Task {
  content: string; // markdown содержимое
}
