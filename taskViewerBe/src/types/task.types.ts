export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'planned' | 'in-progress' | 'completed' | 'cancelled';
  file: string;
  createdDate: string | null;
  completedDate: string | null;
  branch: string | null;
}

export interface TaskManifest {
  tasks: Task[];
}

export interface TaskDetail extends Task {
  content: string; // markdown содержимое
}
