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
import { ApiError } from '@/api/apiError';

export function TasksListPage() {
  const { tasks, loading, error, refetch, updateTask } = useTasks();

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
              Всего задач: {tasks.length}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <TaskList 
            tasks={tasks} 
            onTaskUpdate={refetch}
            onTaskChange={updateTask}
          />
        </CardContent>
      </Card>
  );
}
