import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Показывать ли кнопку очистки (появляется когда есть значение) */
  showClearButton?: boolean
  /** Обработчик очистки (если не указан, используется onChange с пустой строкой) */
  onClear?: () => void
  /** Обработчик изменения значения */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showClearButton, onClear, onChange, value, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current!)

    const hasValue = value !== undefined && value !== null && String(value).length > 0
    const shouldShowClear = showClearButton && hasValue && !props.disabled

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (onClear) {
        onClear()
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
      inputRef.current?.focus()
    }

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            shouldShowClear ? "pr-8" : "px-3",
            className
          )}
          ref={inputRef}
          value={value}
          onChange={onChange}
          {...props}
        />
        {shouldShowClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
            aria-label="Очистить"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
