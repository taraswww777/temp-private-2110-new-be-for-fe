import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaskStatus, TaskPriority } from '@/types/task.types';

interface TaskFiltersProps {
  search: string;
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatus | 'all') => void;
  onPriorityFilterChange: (value: TaskPriority | 'all') => void;
}

export function TaskFilters({
  search,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
}: TaskFiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      <Input
        placeholder="Поиск по названию или ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-grow"
      />

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="flex-grow">
          <SelectValue placeholder="Все статусы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все статусы</SelectItem>
          <SelectItem value="backlog">📋 Бэклог</SelectItem>
          <SelectItem value="planned">📅 Запланировано</SelectItem>
          <SelectItem value="in-progress">⏳ В работе</SelectItem>
          <SelectItem value="completed">✅ Выполнено</SelectItem>
          <SelectItem value="cancelled">❌ Отменено</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
        <SelectTrigger className="flex-grow">
          <SelectValue placeholder="Все приоритеты" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все приоритеты</SelectItem>
          <SelectItem value="critical">🔴 Критический</SelectItem>
          <SelectItem value="high">🟠 Высокий</SelectItem>
          <SelectItem value="medium">🔵 Средний</SelectItem>
          <SelectItem value="low">⚪ Низкий</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
