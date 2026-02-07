export interface Task {
  id: string;
  title: string;
  status: 'backlog' | 'planned' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  createdDate: string | null;
  completedDate: string | null;
  branch: string | null;
  youtrackIssueIds?: string[]; // Опциональное поле для связей с YouTrack
  tags?: string[]; // Теги задачи (при отправке в YouTrack фильтруются по чёрному списку)
}

export interface TaskManifest {
  tasks: Task[];
}

export interface TaskDetail extends Task {
  content: string; // markdown содержимое
}
