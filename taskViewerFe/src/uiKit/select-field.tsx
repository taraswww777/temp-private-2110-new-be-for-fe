import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export interface SelectFieldOption {
  label: string
  value: string
}

export interface SelectFieldProps {
  label: string
  id?: string
  options: SelectFieldOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SelectField({
  label,
  id: idProp,
  options,
  value,
  onValueChange,
  placeholder = "Выберите...",
  disabled,
  className,
}: SelectFieldProps) {
  const generatedId = React.useId()
  const id = idProp ?? generatedId

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
