export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  createdDate: string | null;
  completedDate: string | null;
  branch: string | null;
  youtrackIssueIds?: string[];
  /** Имена тегов (в API и ответах; в манифесте хранятся tagIds). */
  tags?: string[];
}

/** Запись задачи в манифесте: теги хранятся по ID. */
export interface TaskInManifest extends Omit<Task, 'tags'> {
  tagIds?: string[];
  /** @deprecated Используется только при миграции со старого формата (tags по именам). */
  tags?: string[];
}

export interface TaskManifest {
  tasks: TaskInManifest[];
}

export interface TaskDetail extends Task {
  content: string; // markdown содержимое
}
