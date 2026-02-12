import { useMemo } from 'react';
import { SearchSelectField, TagBadge } from '@/uiKit';
import type { Task } from '@/types/task.types';

/** Теги, отсортированные по последнему использованию (по макс. createdDate задачи с этим тегом) */
function useTagsSortedByLastUsed(allTasks: Task[]): string[] {
  return useMemo(() => {
    const tagToLastUsed = new Map<string, string>();
    for (const t of allTasks) {
      const date = t.createdDate ?? '';
      for (const tag of t.tags ?? []) {
        if (!tagToLastUsed.has(tag) || date > tagToLastUsed.get(tag)!) {
          tagToLastUsed.set(tag, date);
        }
      }
    }
    return [...tagToLastUsed.entries()]
      .sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0))
      .map(([tag]) => tag);
  }, [allTasks]);
}

export interface TaskTagsEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void | Promise<void>;
  allTasks: Task[];
  tagMetadata: Record<string, { color?: string }>;
  disabled?: boolean;
  saving?: boolean;
  /** Подпись для блока (по умолчанию "Теги") */
  label?: string;
  /** placeholder для поля ввода */
  placeholder?: string;
  className?: string;
}

export function TaskTagsEditor({
  tags,
  onTagsChange,
  allTasks,
  tagMetadata,
  disabled = false,
  saving = false,
  label = 'Теги',
  placeholder = 'Введите или выберите тег...',
  className,
}: TaskTagsEditorProps) {
  const options = useTagsSortedByLastUsed(allTasks);
  const isDisabled = disabled || saving;

  return (
    <SearchSelectField
      label={label}
      value={tags}
      onChange={onTagsChange}
      options={options}
      placeholder={placeholder}
      disabled={isDisabled}
      emptyMessage="Нет подходящих тегов. Введите название и нажмите Enter."
      renderOption={(value) => (
        <TagBadge tag={value} colorKey={tagMetadata[value]?.color} className="text-xs" />
      )}
      renderValue={(value, onRemove) => (
        <TagBadge
          tag={value}
          colorKey={tagMetadata[value]?.color}
          onRemove={onRemove}
          disabled={isDisabled}
          className="text-xs"
        />
      )}
      className={className}
    />
  );
}
