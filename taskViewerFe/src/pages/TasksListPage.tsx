import { useMemo, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/uiKit';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { useProject } from '@/contexts/ProjectContext';
import { projectsApi, type Project } from '@/api/projects.api';
import { ApiError } from '@/api/apiError';

export function TasksListPage() {
  const { tasks, loading, error, refetch, updateTask } = useTasks();
  const { selectedProject } = useProject();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    projectsApi.getAllProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  // Фильтрация задач по выбранному проекту
  const filteredTasks = useMemo(() => {
    if (!selectedProject) return tasks;
    
    // Если выбран вариант "Без проекта"
    if (selectedProject === '__no_project__') {
      return tasks.filter((task) => !task.project);
    }
    
    // Находим имя проекта по ID
    const selectedProjectObj = projects.find((p) => p.id === selectedProject);
    if (!selectedProjectObj) {
      // Если проект не найден (возможно был удалён), показываем все задачи
      return tasks;
    }
    
    // Фильтруем задачи по имени проекта
    return tasks.filter((task) => task.project === selectedProjectObj.name);
  }, [tasks, selectedProject, projects]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    const isApiError = error instanceof ApiError;
    const details = isApiError ? error.details : [];
    return (
      <Alert
        variant="destructive"
        title="Ошибка загрузки задач"
        description={error.message}
        details={details}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Повторить запрос
          </Button>
        }
      />
    );
  }

  return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Задачи проекта</CardTitle>
            <CardDescription>
              Всего задач: {filteredTasks.length} {selectedProject && `(отфильтровано из ${tasks.length})`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <TaskList 
            tasks={filteredTasks} 
            onTaskUpdate={refetch}
            onTaskChange={updateTask}
            showProjectColumn={!selectedProject || selectedProject === '__no_project__'}
            projects={projects}
          />
        </CardContent>
      </Card>
  );
}
