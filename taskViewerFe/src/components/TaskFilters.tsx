import { InputField, MultiSelectField, TagBadge } from '@/uiKit';
import type { TaskStatus, TaskPriority } from '@/types/task.types';

interface TaskFiltersProps {
  search: string;
  statusFilter: TaskStatus[];
  priorityFilter: TaskPriority[];
  tagsFilter: string[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (statuses: TaskStatus[]) => void;
  onPriorityFilterChange: (priorities: TaskPriority[]) => void;
  onTagsFilterChange: (tags: string[]) => void;
  availableTags: string[];
  tagMetadata: Record<string, { color?: string }>;
}

export function TaskFilters({
  search,
  statusFilter,
  priorityFilter,
  tagsFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onTagsFilterChange,
  availableTags,
  tagMetadata,
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

  const tagsOptions = availableTags.map((tag) => ({
    label: tag,
    value: tag,
  }));

  return (
    <div className="flex gap-4 mb-6">
      <InputField
        label="Поиск"
        placeholder="По названию или ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-grow"
      />

      <MultiSelectField
        label="Статус"
        options={statusOptions}
        selected={statusFilter}
        onChange={(selected) => onStatusFilterChange(selected as TaskStatus[])}
        placeholder="Все статусы"
        className="flex-grow"
      />

      <MultiSelectField
        label="Приоритет"
        options={priorityOptions}
        selected={priorityFilter}
        onChange={(selected) => onPriorityFilterChange(selected as TaskPriority[])}
        placeholder="Все приоритеты"
        className="flex-grow"
      />

      <MultiSelectField
        label="Теги"
        options={tagsOptions}
        selected={tagsFilter}
        onChange={(selected) => onTagsFilterChange(selected)}
        placeholder="Все теги"
        className="flex-grow"
        renderOption={(option) => (
          <TagBadge 
            tag={option.label} 
            colorKey={tagMetadata[option.value]?.color} 
            className="text-xs" 
          />
        )}
        renderValue={(option, onRemove) => (
          <TagBadge
            tag={option.label}
            colorKey={tagMetadata[option.value]?.color}
            onRemove={onRemove}
            className="text-xs"
          />
        )}
      />
    </div>
  );
}
