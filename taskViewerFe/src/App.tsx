import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TasksListPage } from '@/pages/TasksListPage';
import { TaskDetailPage } from '@/pages/TaskDetailPage';
import { YouTrackTemplatesPage } from '@/pages/YouTrackTemplatesPage';
import { Toaster } from 'sonner';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Task Viewer</h1>
              <nav className="flex gap-4">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Задачи
                </Link>
                <Link
                  to="/youtrack/templates"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Шаблоны YouTrack
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-4">
          <Routes>
            <Route path="/" element={<TasksListPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/youtrack/templates" element={<YouTrackTemplatesPage />} />
          </Routes>
        </main>
      </div>
      <Toaster position="bottom-right" richColors />
    </BrowserRouter>
  );
}
