import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'rounded-xl border p-6 shadow [&>div+div]:mt-4',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        destructive:
          'border-destructive/50 bg-destructive/5 text-destructive [&>div]:text-destructive [&_p]:text-destructive/90',
        warning:
          'border-warning/50 bg-warning/5 text-warning [&>div]:text-warning [&_p]:text-warning/90',
        info:
          'border-info/50 bg-info/5 text-info [&>div]:text-info [&_p]:text-info/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface AlertDetailsItem {
  path?: string
  message: string
  expectedValues?: string[]
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Заголовок */
  title: React.ReactNode
  /** Описание, основной текст */
  description?: React.ReactNode
  /** Список деталей (например, ошибки валидации) */
  details?: AlertDetailsItem[]
  /** Кнопка или другое действие внизу */
  action?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      title,
      description,
      details,
      action,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <div className="flex flex-col space-y-1.5">
        <h5 className="font-semibold leading-none tracking-tight">{title}</h5>
        {description != null && (
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        )}
      </div>
      {details != null && details.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Детали валидации:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground [&_span]:font-mono [&_span]:text-foreground">
            {details.map((d, i) => (
              <li key={i}>
                {d.path != null && <span>{d.path}</span>}
                {d.path != null && ': '}
                {d.message}
                {d.expectedValues?.length
                  ? ` (допустимые: ${d.expectedValues.join(', ')})`
                  : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      {action != null && <div className="pt-2">{action}</div>}
      {children}
    </div>
  )
)
Alert.displayName = 'Alert'

// eslint-disable-next-line react-refresh/only-export-components -- alertVariants is CVA result, not a component
export { Alert, alertVariants }
