import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { SearchSelect, type SearchSelectProps } from './search-select';

export interface SearchSelectFieldProps extends Omit<SearchSelectProps, 'className'> {
  label: string;
  className?: string;
  /** Дополнительный текст под полем (подсказка, описание) */
  description?: React.ReactNode;
}

export function SearchSelectField({
  label,
  className,
  description,
  ...searchSelectProps
}: SearchSelectFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label className="font-semibold">{label}</Label>
      <SearchSelect {...searchSelectProps} />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
