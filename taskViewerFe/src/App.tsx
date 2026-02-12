import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TasksListPage } from '@/pages/TasksListPage';
import { TaskDetailPage } from '@/pages/TaskDetailPage';
import { YouTrackTemplatesPage } from '@/pages/YouTrackTemplatesPage';
import { YouTrackQueuePage } from '@/pages/YouTrackQueuePage';
import { YouTrackTagsBlacklistPage } from '@/pages/YouTrackTagsBlacklistPage';
import { TaskTagsPage } from '@/pages/TaskTagsPage';
import { TaskProjectsPage } from '@/pages/TaskProjectsPage';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ProjectSelector } from '@/components/ProjectSelector';

function AppContent() {
  const { resolvedTheme } = useTheme();
  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
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
        </header>
        <main className="container mx-auto px-4 py-4">
          <Routes>
            <Route path="/" element={<TasksListPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/tasks/tags" element={<TaskTagsPage />} />
            <Route path="/tasks/projects" element={<TaskProjectsPage />} />
            <Route path="/youtrack/templates" element={<YouTrackTemplatesPage />} />
            <Route path="/youtrack/queue" element={<YouTrackQueuePage />} />
            <Route path="/youtrack/tags/blacklist" element={<YouTrackTagsBlacklistPage />} />
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-right" richColors theme={resolvedTheme} />
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ProjectProvider>
    </ThemeProvider>
  );
}
