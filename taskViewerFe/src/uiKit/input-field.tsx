import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Label } from "./label"

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string
  id?: string
  className?: string
  /** Дополнительный текст под полем (подсказка, описание) */
  description?: React.ReactNode
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, id: idProp, className, description, ...props }, ref) => {
    const generatedId = React.useId()
    const id = idProp ?? generatedId

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <Label htmlFor={id}>{label}</Label>
        <Input ref={ref} id={id} {...props} />
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    )
  }
)
InputField.displayName = "InputField"

export { InputField }
