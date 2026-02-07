import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/uiKit';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { TagBadge } from '@/components/TagBadge';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { YouTrackLinkCard } from '@/components/YouTrackLinkCard';
import { PageHeader } from '@/components/PageHeader';
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
  const [newTagInput, setNewTagInput] = useState('');
  const [tagsSaving, setTagsSaving] = useState(false);
  const [tagMetadata, setTagMetadata] = useState<Record<string, { color?: string }>>({});

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

  useEffect(() => {
    tasksApi.getTagsMetadata().then((d) => setTagMetadata(d.tags)).catch(() => setTagMetadata({}));
  }, []);

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

  const currentTags = task?.tags ?? [];

  const handleAddTag = async () => {
    if (!id) return;
    const tag = newTagInput.trim();
    if (!tag) return;
    if (currentTags.includes(tag)) {
      setNewTagInput('');
      return;
    }
    setTagsSaving(true);
    try {
      await tasksApi.updateTaskMeta(id, { tags: [...currentTags, tag] });
      setNewTagInput('');
      await fetchTask();
      toast.success('Тег добавлен');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить тег';
      toast.error(message);
    } finally {
      setTagsSaving(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!id) return;
    const next = currentTags.filter((t) => t !== tagToRemove);
    setTagsSaving(true);
    try {
      await tasksApi.updateTaskMeta(id, { tags: next });
      await fetchTask();
      toast.success('Тег удалён');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить тег';
      toast.error(message);
    } finally {
      setTagsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !task) {
    const isApiError = error instanceof ApiError;
    const details = isApiError ? error.details : [];
    return (
      <Alert
        variant="destructive"
        title={error ? 'Ошибка загрузки задачи' : 'Задача не найдена'}
        description={error?.message ?? 'Задача не найдена'}
        details={details}
        action={
          error ? (
            <Button variant="outline" onClick={() => fetchTask()}>
              Повторить запрос
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader actions={<TaskEditDialog task={task} onSave={handleSave} />} />

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

              <div className="mt-4 pt-4 border-t">
                <span className="font-semibold block mb-2">Теги</span>
                <div className="flex flex-wrap gap-2 items-center">
                  {currentTags.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      colorKey={tagMetadata[tag]?.color}
                      onRemove={() => handleRemoveTag(tag)}
                      disabled={tagsSaving}
                      className="text-xs"
                    />
                  ))}
                  <div className="flex gap-2 flex-1 min-w-[200px]">
                    <Input
                      placeholder="Добавить тег..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      disabled={tagsSaving}
                      className="max-w-[200px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!newTagInput.trim() || tagsSaving}
                    >
                      Добавить
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
          <aside className="CardRightBar w-full lg:w-[min(360px,100%)] lg:min-w-[280px] lg:border-l lg:border-border lg:bg-muted/30 p-4 lg:p-6 flex flex-col">
            <YouTrackLinkCard
              taskId={task.id}
              initialIssueIds={task.youtrackIssueIds}
              taskPreview={{
                title: task.title,
                content: task.content ?? '',
                status: task.status,
                branch: task.branch ?? null,
              }}
              onLinksUpdated={fetchTask}
            />
          </aside>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="min-w-0 overflow-hidden pt-6 pl-0">
          <MarkdownViewer content={task.content} />
        </CardContent>
      </Card>
    </div>
  );
}
