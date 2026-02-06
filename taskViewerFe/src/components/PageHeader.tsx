import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  /** Заголовок страницы */
  title?: React.ReactNode;
  /** Подзаголовок, описание */
  subtitle?: React.ReactNode;
  /** Кнопки и другие элементы справа */
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="shrink-0"
      >
        ← Назад
      </Button>
      <div className="flex-1 min-w-0">
        {title != null && (
          <h1 className="text-3xl font-bold">{title}</h1>
        )}
        {subtitle != null && (
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        )}
      </div>
      {actions != null && (
        <div className="shrink-0 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
