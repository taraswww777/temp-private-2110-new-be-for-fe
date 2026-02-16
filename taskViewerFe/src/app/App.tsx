import { Route, Routes } from 'react-router-dom';
import { TasksListPage } from '@/pages/TasksListPage.tsx';
import { TaskDetailPage } from '@/pages/TaskDetailPage.tsx';
import { YouTrackTemplatesPage } from '@/pages/YouTrackTemplatesPage.tsx';
import { YouTrackQueuePage } from '@/pages/YouTrackQueuePage.tsx';
import { YouTrackTagsBlacklistPage } from '@/pages/YouTrackTagsBlacklistPage.tsx';
import { TaskTagsPage } from '@/pages/TaskTagsPage.tsx';
import { TaskProjectsPage } from '@/pages/TaskProjectsPage.tsx';
import { Toaster } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext.tsx';
import { AppLoader } from '@/app/AppLoader.tsx';
import { AppTemplate } from '@/app/components/AppTemplate.tsx';

const AppContent = () => {
  const { resolvedTheme } = useTheme();
  return (

    <AppTemplate>
      <Routes>
        <Route path="/" Component={TasksListPage} />
        <Route path="/tasks/:id" Component={TaskDetailPage} />
        <Route path="/tasks/tags" Component={TaskTagsPage} />
        <Route path="/tasks/projects" Component={TaskProjectsPage} />
        <Route path="/youtrack/templates" Component={YouTrackTemplatesPage} />
        <Route path="/youtrack/queue" Component={YouTrackQueuePage} />
        <Route path="/youtrack/tags/blacklist" Component={YouTrackTagsBlacklistPage} />
      </Routes>
      <Toaster position="top-right" richColors theme={resolvedTheme} />
    </AppTemplate>
  );
};

AppContent.displayName = 'AppContent';

export const App = () => (
  <AppLoader>
    <AppContent />
  </AppLoader>
);
