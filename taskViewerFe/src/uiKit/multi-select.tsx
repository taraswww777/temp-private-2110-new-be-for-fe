import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from '@/uiKit'

export interface MultiSelectOption {
  label: string
  value: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  /** Показывать ли кнопку очистки (появляется когда есть выбранные значения) */
  showClearButton?: boolean
  /** Кастомный рендер опции в выпадающем списке */
  renderOption?: (option: MultiSelectOption) => React.ReactNode
  /** Кастомный рендер выбранного значения (бейдж) */
  renderValue?: (option: MultiSelectOption, onRemove: () => void) => React.ReactNode
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Выберите...",
  className,
  showClearButton = true,
  renderOption,
  renderValue,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      handleUnselect(item)
    } else {
      onChange([...selected, item])
    }
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange(options.map((opt) => opt.value))
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange([])
  }

  const shouldShowClear = showClearButton && selected.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 w-full justify-between text-left font-normal min-w-0",
            !selected.length && "text-muted-foreground",
            className
          )}
        >
          <div className="flex gap-1 flex-nowrap min-w-0 flex-1 items-center overflow-hidden">
            {selected.length === 0 ? (
              <span className="truncate">{placeholder}</span>
            ) : selected.length <= 2 ? (
              selected.map((item) => {
                const option = options.find((opt) => opt.value === item)
                if (!option) return null
                
                if (renderValue) {
                  return (
                    <div key={item} onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}>
                      {renderValue(option, () => handleUnselect(item))}
                    </div>
                  )
                }
                
                return (
                  <Badge
                    variant="secondary"
                    key={item}
                    className="shrink-0 whitespace-nowrap text-xs py-0 px-1.5"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleUnselect(item)
                    }}
                  >
                    {option.label}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(item)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleUnselect(item)
                      }}
                    >
                      <span className="h-3 w-3 text-muted-foreground hover:text-foreground">×</span>
                    </button>
                  </Badge>
                )
              })
            ) : (
              <span className="truncate text-sm">
                Выбрано: {selected.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {shouldShowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="h-4 w-4 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
                aria-label="Очистить все"
                title="Очистить все"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                ×
              </button>
            )}
            <span className="h-4 w-4 shrink-0 opacity-50">▼</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleSelectAll}
          >
            {selected.length === options.length ? "Снять все" : "Выбрать все"}
          </Button>
          <div className="max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <span className="text-xs">✓</span>
                    </div>
                    {renderOption ? renderOption(option) : <span>{option.label}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
