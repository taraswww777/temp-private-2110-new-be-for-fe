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
  sortBy: 'id' | 'createdDate' | 'status';
  sortOrder: 'asc' | 'desc';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatus | 'all') => void;
  onSortByChange: (value: 'id' | 'createdDate' | 'status') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

export function TaskFilters({
  search,
  statusFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusFilterChange,
  onSortByChange,
  onSortOrderChange,
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
          <SelectItem value="in-progress">⏳ В работе</SelectItem>
          <SelectItem value="completed">✅ Выполнено</SelectItem>
          <SelectItem value="cancelled">❌ Отменено</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Сортировка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="id">По ID</SelectItem>
          <SelectItem value="createdDate">По дате создания</SelectItem>
          <SelectItem value="status">По статусу</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortOrder} onValueChange={onSortOrderChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">По возрастанию</SelectItem>
          <SelectItem value="desc">По убыванию</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
