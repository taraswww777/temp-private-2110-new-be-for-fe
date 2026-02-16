import { ProjectSelector } from '@/components/ProjectSelector.tsx';
import { Link } from 'react-router-dom';
import { ThemeSwitcher } from '@/components/ThemeSwitcher.tsx';

export  const AppTemplateHeader = () => {
  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Task Viewer</h1>
          <ProjectSelector />
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Задачи
            </Link>
            <Link
              to="/tasks/tags"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Теги
            </Link>
            <Link
              to="/tasks/projects"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Проекты
            </Link>
            <Link
              to="/youtrack/templates"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Шаблоны YouTrack
            </Link>
            <Link
              to="/youtrack/queue"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Очередь YouTrack
            </Link>
            <Link
              to="/youtrack/tags/blacklist"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Чёрный список тегов
            </Link>
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}
