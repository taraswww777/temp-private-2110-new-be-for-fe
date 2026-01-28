import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';

export function TasksListPage() {
  const { tasks, loading, error, refetch } = useTasks();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Ошибка загрузки задач: {error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачи проекта</CardTitle>
        <CardDescription>
          Всего задач: {tasks.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TaskList tasks={tasks} onTaskUpdate={refetch} />
      </CardContent>
    </Card>
  );
}
