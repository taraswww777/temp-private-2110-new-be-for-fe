import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { YouTrackLinkCard } from '@/components/YouTrackLinkCard';
import { tasksApi } from '@/api/tasks.api';
import { ApiError } from '@/api/apiError';
import type { TaskDetail, UpdateTaskMetaInput, TaskStatus, TaskPriority } from '@/types/task.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTask = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await tasksApi.getTaskById(id);
      setTask(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (updates: UpdateTaskMetaInput) => {
    if (!id) return;
    await tasksApi.updateTaskMeta(id, updates);
    await fetchTask();
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!id) return;
    try {
      await tasksApi.updateTaskMeta(id, { status: newStatus });
      await fetchTask();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить статус';
      toast.error(message);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!id) return;
    try {
      await tasksApi.updateTaskMeta(id, { priority: newPriority });
      await fetchTask();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить приоритет';
      toast.error(message);
    }
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
    const isApiError = error instanceof ApiError;
    const details = isApiError ? error.details : [];
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">
            {error ? 'Ошибка загрузки задачи' : 'Задача не найдена'}
          </CardTitle>
          <CardDescription className="text-destructive/90 whitespace-pre-wrap">
            {error?.message ?? 'Задача не найдена'}
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
          {error && (
            <Button variant="outline" onClick={() => fetchTask()}>
              Повторить запрос
            </Button>
          )}
        </CardContent>
      </Card>
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

      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 min-w-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{task.title}</CardTitle>
                  <div className="flex items-center gap-4 flex-wrap">
                    <CardDescription className="text-lg font-mono">{task.id}</CardDescription>
                    <div className="flex items-center gap-2">
                      <Select
                        value={task.status}
                        onValueChange={(value) => handleStatusChange(value as TaskStatus)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="backlog">📋 Бэклог</SelectItem>
                          <SelectItem value="planned">📅 Запланировано</SelectItem>
                          <SelectItem value="in-progress">⏳ В работе</SelectItem>
                          <SelectItem value="completed">✅ Выполнено</SelectItem>
                          <SelectItem value="cancelled">❌ Отменено</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={task.priority}
                        onValueChange={(value) => handlePriorityChange(value as TaskPriority)}
                        disabled={task.status === 'completed'}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">🔴 Критический</SelectItem>
                          <SelectItem value="high">🟠 Высокий</SelectItem>
                          <SelectItem value="medium">🔵 Средний</SelectItem>
                          <SelectItem value="low">⚪ Низкий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
          </div>
          <aside className="CardRightBar w-full lg:w-[min(360px,100%)] lg:min-w-[280px] lg:border-l lg:border-border lg:bg-muted/30 p-4 lg:p-6 flex flex-col">
            <YouTrackLinkCard
              taskId={task.id}
              initialIssueIds={task.youtrackIssueIds}
              onLinksUpdated={fetchTask}
            />
          </aside>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Описание задачи</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 overflow-hidden">
          <MarkdownViewer content={task.content} />
        </CardContent>
      </Card>
    </div>
  );
}
