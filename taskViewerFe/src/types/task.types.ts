export type TaskStatus = 'backlog' | 'in-progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
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
  createdDate?: string | null;
  completedDate?: string | null;
  branch?: string | null;
}
