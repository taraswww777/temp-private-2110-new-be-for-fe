import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaskStatus } from '@/types/task.types';

interface TaskFiltersProps {
  search: string;
  statusFilter: TaskStatus | 'all';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatus | 'all') => void;
}

export function TaskFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: TaskFiltersProps) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <Input
        placeholder="Поиск по названию или ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[180px]">
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
    </div>
  );
}
