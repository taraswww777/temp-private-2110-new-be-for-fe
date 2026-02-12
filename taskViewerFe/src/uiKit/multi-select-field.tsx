import { cn } from "@/lib/utils"
import { Label } from "./label"
import { MultiSelect, type MultiSelectOption } from "./multi-select"

export interface MultiSelectFieldProps {
  label: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  /** Кастомный рендер опции в выпадающем списке */
  renderOption?: (option: MultiSelectOption) => React.ReactNode
  /** Кастомный рендер выбранного значения (бейдж) */
  renderValue?: (option: MultiSelectOption, onRemove: () => void) => React.ReactNode
}

export function MultiSelectField({
  label,
  options,
  selected,
  onChange,
  placeholder = "Выберите...",
  className,
  renderOption,
  renderValue,
}: MultiSelectFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>{label}</Label>
      <MultiSelect
        options={options}
        selected={selected}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full"
        renderOption={renderOption}
        renderValue={renderValue}
      />
    </div>
  )
}
