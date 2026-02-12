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
}

export function MultiSelectField({
  label,
  options,
  selected,
  onChange,
  placeholder = "Выберите...",
  className,
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
      />
    </div>
  )
}
