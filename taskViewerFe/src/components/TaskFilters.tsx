import { Input, MultiSelect } from '@/uiKit';
import type { TaskStatus, TaskPriority } from '@/types/task.types';

interface TaskFiltersProps {
  search: string;
  statusFilter: TaskStatus[];
  priorityFilter: TaskPriority[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  onPriorityFilterChange: (priorities: TaskPriority[]) => void;
}

export function TaskFilters({
  search,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
}: TaskFiltersProps) {
  const statusOptions = [
    { label: '📋 Бэклог', value: 'backlog' },
    { label: '📅 Запланировано', value: 'planned' },
    { label: '⏳ В работе', value: 'in-progress' },
    { label: '✅ Выполнено', value: 'completed' },
    { label: '❌ Отменено', value: 'cancelled' },
  ];

  const priorityOptions = [
    { label: '🔴 Критический', value: 'critical' },
    { label: '🟠 Высокий', value: 'high' },
    { label: '🔵 Средний', value: 'medium' },
    { label: '⚪ Низкий', value: 'low' },
  ];

  return (
    <div className="flex gap-4 mb-6">
      <Input
        placeholder="Поиск по названию или ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-grow"
      />

      <MultiSelect
        options={statusOptions}
        selected={statusFilter}
        onChange={(selected) => onStatusFilterChange(selected as TaskStatus[])}
        placeholder="Все статусы"
        className="flex-grow"
      />

      <MultiSelect
        options={priorityOptions}
        selected={priorityFilter}
        onChange={(selected) => onPriorityFilterChange(selected as TaskPriority[])}
        placeholder="Все приоритеты"
        className="flex-grow"
      />
    </div>
  );
}
