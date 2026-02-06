import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { ApiError } from '@/api/apiError';

export function TasksListPage() {
  const { tasks, loading, error, refetch, updateTask } = useTasks();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    const isApiError = error instanceof ApiError;
    const details = isApiError ? error.details : [];
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Ошибка загрузки задач</CardTitle>
          <CardDescription className="text-destructive/90 whitespace-pre-wrap">
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {details.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Детали валидации:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {details.map((d, i) => (
                  <li key={i}>
                    <span className="font-mono text-foreground">{d.path}</span>: {d.message}
                    {d.expectedValues?.length ? ` (допустимые: ${d.expectedValues.join(', ')})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            Повторить запрос
          </Button>
        </CardContent>
      </Card>
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
