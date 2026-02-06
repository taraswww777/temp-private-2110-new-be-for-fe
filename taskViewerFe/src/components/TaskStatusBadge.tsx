import { Badge } from '@/uiKit';
import type { TaskStatus } from '@/types/task.types';

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  'backlog': { label: '📋 Бэклог', variant: 'secondary' },
  'planned': { label: '📅 Запланировано', variant: 'secondary' },
  'in-progress': { label: '⏳ В работе', variant: 'default' },
  'completed': { label: '✅ Выполнено', variant: 'outline' },
  'cancelled': { label: '❌ Отменено', variant: 'destructive' },
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
