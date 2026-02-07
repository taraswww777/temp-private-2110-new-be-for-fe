import { cn } from '@/lib/utils';
import { getTagBadgeClassName } from './tag-colors';

export { getTagBadgeClassName } from './tag-colors';

export interface TagBadgeProps {
  tag: string;
  colorKey?: string;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function TagBadge({ tag, colorKey, onRemove, disabled, className }: TagBadgeProps) {
  const baseClass =
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap';
  const colorClass = getTagBadgeClassName(colorKey);

  return (
    <span
      className={cn(baseClass, colorClass, className)}
      data-tag={tag}
      data-color={colorKey ?? undefined}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          aria-label={`Удалить тег ${tag}`}
          className="ml-1 rounded hover:opacity-80 p-0.5 leading-none"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={disabled}
        >
          ×
        </button>
      )}
    </span>
  );
}
