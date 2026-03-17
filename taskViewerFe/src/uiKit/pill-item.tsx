import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/clipboard';

export interface PillItemProps {
  value: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function PillItem({ value, label, className, onClick }: PillItemProps) {
  const handleCopy = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await copyToClipboard(value, label);
    onClick?.();
  };

  const baseClass =
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer hover:bg-accent/70 select-none';

  return (
    <span
      className={cn(baseClass, 'bg-muted border-border', className)}
      onClick={handleCopy}
      title={`Нажмите, чтобы скопировать: ${value}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCopy(e);
        }
      }}
    >
      {label || value}
    </span>
  );
}
