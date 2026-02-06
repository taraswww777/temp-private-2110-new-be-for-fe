import { Badge } from '@/uiKit';
import type { TaskPriority } from '@/types/task.types';

const priorityConfig: Record<TaskPriority, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  'critical': { label: '🔴 Критический', variant: 'destructive' },
  'high': { label: '🟠 Высокий', variant: 'default' },
  'medium': { label: '🔵 Средний', variant: 'secondary' },
  'low': { label: '⚪ Низкий', variant: 'outline' },
};

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
