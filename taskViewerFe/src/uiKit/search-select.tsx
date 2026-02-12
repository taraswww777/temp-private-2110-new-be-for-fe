import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, Popover, PopoverAnchor, PopoverContent } from '@/uiKit';

export interface SearchSelectProps {
  /** Выбранные значения */
  value: string[];
  /** Изменение выбора */
  onChange: (value: string[]) => void;
  /** Список опций для подсказок (фильтруется по вводу) */
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  /** Рендер опции в выпадающем списке */
  renderOption?: (value: string) => React.ReactNode;
  /** Рендер выбранного значения (бейдж с возможностью удаления) */
  renderValue?: (
    value: string,
    onRemove: () => void,
    disabled?: boolean
  ) => React.ReactNode;
  /** Сообщение при отсутствии подходящих опций */
  emptyMessage?: string;
  /** Текст для пункта «добавить новое». По умолчанию: value => `+ Добавить «${value}»` */
  getCreateLabel?: (value: string) => string;
  className?: string;
}

export function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Введите или выберите...',
  disabled = false,
  renderOption,
  renderValue,
  emptyMessage = 'Нет подходящих. Введите значение и нажмите Enter.',
  getCreateLabel = (v) => `+ Добавить «${v}»`,
  className,
}: SearchSelectProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const trimmed = inputValue.trim();
  const canAddNew = trimmed.length > 0 && !value.includes(trimmed);
  const availableOptions = React.useMemo(
    () => options.filter((opt) => !value.includes(opt)),
    [options, value]
  );

  const filtered = React.useMemo(() => {
    if (!trimmed) return availableOptions;
    const lower = trimmed.toLowerCase();
    return availableOptions.filter((opt) => opt.toLowerCase().includes(lower));
  }, [availableOptions, trimmed]);
  const hasExactMatch =
    trimmed && filtered.some((opt) => opt.toLowerCase() === trimmed.toLowerCase());
  const showCreate = canAddNew && !hasExactMatch;

  const listOptions: Array<{ type: 'create'; value: string } | { type: 'option'; value: string }> =
    React.useMemo(
      () => [
        ...(showCreate ? [{ type: 'create' as const, value: trimmed }] : []),
        ...filtered.map((opt) => ({ type: 'option' as const, value: opt })),
      ],
      [showCreate, trimmed, filtered]
    );

  const addValue = React.useCallback(
    (v: string) => {
      if (!v || value.includes(v)) return;
      const next = [...value, v];
      setInputValue('');
      setFocusedIndex(-1);
      setIsOpen(false);
      inputRef.current?.blur();
      void Promise.resolve(onChange(next)).catch(() => {});
    },
    [value, onChange]
  );

  const removeValue = React.useCallback(
    (v: string) => {
      const next = value.filter((x) => x !== v);
      void Promise.resolve(onChange(next)).catch(() => {});
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (listOptions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addValue(trimmed);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => (i < listOptions.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => (i <= 0 ? listOptions.length - 1 : i - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0) {
        const opt = listOptions[focusedIndex];
        addValue(opt.value);
      } else {
        addValue(trimmed);
      }
      return;
    }
    if (e.key === 'Escape') {
      setFocusedIndex(-1);
    }
  };

  const defaultRenderValue = (v: string, onRemove: () => void, isDisabled?: boolean) => (
    <span
      key={v}
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
    >
      {v}
      <button
        type="button"
        aria-label={`Удалить ${v}`}
        className="ml-1 rounded hover:opacity-80 p-0.5 leading-none disabled:opacity-50"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={isDisabled}
      >
        ×
      </button>
    </span>
  );

  const showDropdown = isOpen;

  return (
    <div className={cn('w-full max-w-xs', className)}>
      <div className="flex flex-wrap gap-2 items-center">
        {value.map((v) => (
          <React.Fragment key={v}>
            {renderValue
              ? renderValue(v, () => removeValue(v), disabled)
              : defaultRenderValue(v, () => removeValue(v), disabled)}
          </React.Fragment>
        ))}
        <Popover
          open={showDropdown}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setInputValue('');
              setFocusedIndex(-1);
            }
          }}
          modal
        >
          <PopoverAnchor asChild>
            <div className="flex-1 min-w-0 inline-block w-[220px] max-w-full">
              <Input
                ref={inputRef}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInputValue(newValue);
                  setFocusedIndex(-1);
                  // Открываем при вводе
                  setIsOpen(true);
                }}
                onFocus={() => {
                  setFocusedIndex(-1);
                  // Открываем при фокусе, если есть доступные опции
                  if (availableOptions.length > 0 || inputValue !== '') {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className="w-full"
              />
            </div>
          </PopoverAnchor>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] max-h-48 overflow-auto p-0"
            align="start"
            sideOffset={4}
            collisionPadding={16}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={() => {
              setIsOpen(false);
              inputRef.current?.blur();
            }}
            onPointerDownOutside={(e) => {
              const target = e.target as HTMLElement;
              // Не закрываем если клик внутри PopoverContent
              if (target.closest('[role="listbox"]')) {
                e.preventDefault();
                return;
              }
              // Закрываем при клике вне компонента
              setIsOpen(false);
            }}
          >
            <div role="listbox">
              {listOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
              ) : (
                listOptions.map((opt, index) => {
                  const isCreate = opt.type === 'create';
                  const isSelected = index === focusedIndex;
                  return (
                    <button
                      key={isCreate ? `create-${opt.value}` : opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/80'
                      } ${isCreate ? 'text-primary font-medium' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        // Предотвращаем blur на input
                        e.stopPropagation();
                      }}
                      onClick={() => addValue(opt.value)}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      {isCreate ? (
                        getCreateLabel(opt.value)
                      ) : renderOption ? (
                        renderOption(opt.value)
                      ) : (
                        opt.value
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
