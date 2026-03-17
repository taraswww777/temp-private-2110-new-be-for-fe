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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  PillItem,
} from '@/uiKit';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { TaskContentEditDialog } from '@/components/TaskContentEditDialog';
import { TaskTagsEditor } from '@/components/TaskTagsEditor';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { YouTrackLinkCard } from '@/components/YouTrackLinkCard';
import { PageHeader } from '@/components/PageHeader';
import { tasksApi } from '@/api/tasks.api';
import { projectsApi, type Project } from '@/api/projects.api';
import { ApiError } from '@/api/apiError';
import { copyToClipboard } from '@/lib/clipboard';
import type { Task, TaskDetail, UpdateTaskMetaInput, TaskStatus, TaskPriority } from '@/types/task.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tagsSaving, setTagsSaving] = useState(false);
  const [tagMetadata, setTagMetadata] = useState<Record<string, { color?: string }>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSaving, setProjectSaving] = useState(false);

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
    projectsApi.getAllProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    tasksApi.getAllTasks().then(setAllTasks).catch(() => setAllTasks([]));
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
  const currentProject = task?.project ?? null;

  const handleTagsChange = async (newTags: string[]) => {
    if (!id) return;
    setTagsSaving(true);
    try {
      await tasksApi.updateTaskMeta(id, { tags: newTags });
      await fetchTask();
      toast.success(
        newTags.length > currentTags.length ? 'Тег добавлен' : newTags.length < currentTags.length ? 'Тег удалён' : 'Теги обновлены'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось изменить теги';
      toast.error(message);
    } finally {
      setTagsSaving(false);
    }
  };

  const handleProjectChange = async (newProject: string | null) => {
    if (!id) return;
    setProjectSaving(true);
    try {
      await tasksApi.updateTaskMeta(id, { project: newProject });
      await fetchTask();
      toast.success(newProject ? 'Проект обновлён' : 'Проект удалён');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось изменить проект';
      toast.error(message);
    } finally {
      setProjectSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru });
  };

  const handleCopyId = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await copyToClipboard(id, `ID: ${id}`);
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
      <PageHeader 
        actions={
          <div className="flex gap-2">
            <TaskEditDialog task={task} onSave={handleSave} />
            <TaskContentEditDialog task={task} onContentUpdated={fetchTask} />
          </div>
        } 
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 min-w-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{task.title}</CardTitle>
                  <div className="flex items-center gap-4 flex-wrap">
                    <CardDescription className="text-lg font-mono">
                      <span
                        className="cursor-pointer hover:bg-accent/50 select-none transition-colors px-2 py-1 rounded inline-block"
                        onClick={(e) => handleCopyId(task.id, e)}
                        title="Нажмите, чтобы скопировать ID"
                      >
                        {task.id}
                      </span>
                    </CardDescription>
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
                      <Select
                        value={currentProject || '__none__'}
                        onValueChange={(value) => handleProjectChange(value === '__none__' ? null : value)}
                        disabled={projectSaving}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Без проекта" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Без проекта</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.name}>
                              {project.name}
                            </SelectItem>
                          ))}
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
                  {task.branch ? (
                    <PillItem value={task.branch} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Файл:</span>{' '}
                  <PillItem value={task.file} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <TaskTagsEditor
                  tags={currentTags}
                  onTagsChange={handleTagsChange}
                  allTasks={allTasks}
                  tagMetadata={tagMetadata}
                  saving={tagsSaving}
                />
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
