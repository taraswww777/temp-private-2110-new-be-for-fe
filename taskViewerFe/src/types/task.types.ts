export type TaskStatus = 'backlog' | 'planned' | 'in-progress' | 'completed' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  file: string;
  createdDate: string | null;
  completedDate: string | null;
  branch: string | null;
}

export interface TaskDetail extends Task {
  content: string;
}

export interface UpdateTaskMetaInput {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  createdDate?: string | null;
  completedDate?: string | null;
  branch?: string | null;
}
