import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskStatusBadge } from '@/components/TaskStatusBadge';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { tasksApi } from '@/api/tasks.api';
import type { TaskDetail, UpdateTaskMetaInput } from '@/types/task.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await tasksApi.getTaskById(id);
      setTask(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleSave = async (updates: UpdateTaskMetaInput) => {
    if (!id) return;
    await tasksApi.updateTaskMeta(id, updates);
    await fetchTask();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 w-full bg-muted animate-pulse rounded" />
        <div className="h-96 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="rounded-lg border bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Ошибка загрузки задачи: {error || 'Задача не найдена'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="outline">← Назад к списку</Button>
        </Link>
        <TaskEditDialog task={task} onSave={handleSave} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{task.title}</CardTitle>
              <CardDescription className="text-lg font-mono">{task.id}</CardDescription>
            </div>
            <TaskStatusBadge status={task.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Дата создания:</span> {formatDate(task.createdDate)}
            </div>
            <div>
              <span className="font-semibold">Дата завершения:</span> {formatDate(task.completedDate)}
            </div>
            <div>
              <span className="font-semibold">Ветка:</span>{' '}
              <code className="text-sm bg-muted px-2 py-1 rounded">{task.branch || '—'}</code>
            </div>
            <div>
              <span className="font-semibold">Файл:</span>{' '}
              <code className="text-sm bg-muted px-2 py-1 rounded">{task.file}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Описание задачи</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownViewer content={task.content} />
        </CardContent>
      </Card>
    </div>
  );
}
