import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/uiKit';
import { TaskTagsEditor } from '@/components/TaskTagsEditor';
import { tasksApi } from '@/api/tasks.api';
import type { Task, TaskStatus, TaskPriority, UpdateTaskMetaInput } from '@/types/task.types';

interface TaskEditDialogProps {
  task: Task;
  onSave: (updates: UpdateTaskMetaInput) => Promise<void>;
}

export function TaskEditDialog({ task, onSave }: TaskEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateTaskMetaInput>({
    title: task.title,
    status: task.status,
    priority: task.priority,
    branch: task.branch,
    createdDate: task.createdDate,
    tags: task.tags ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tagMetadata, setTagMetadata] = useState<Record<string, { color?: string }>>({});

  useEffect(() => {
    if (open) {
      tasksApi.getAllTasks().then(setAllTasks).catch(() => setAllTasks([]));
      tasksApi.getTagsMetadata().then((d) => setTagMetadata(d.tags)).catch(() => setTagMetadata({}));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setFormData({
        title: task.title,
        status: task.status,
        priority: task.priority,
        branch: task.branch,
        createdDate: task.createdDate,
        tags: task.tags ?? [],
      });
    }
  }, [open, task.title, task.status, task.priority, task.branch, task.createdDate, task.tags]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить изменения';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Редактировать</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Редактирование задачи {task.id}</DialogTitle>
          <DialogDescription>
            Редактирование метаданных задачи. Изменения сохраняются в tasks-manifest.json
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as TaskStatus })
              }
            >
              <SelectTrigger>
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Приоритет</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value as TaskPriority })
              }
              disabled={task.status === 'completed'}
            >
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label htmlFor="branch">Ветка</Label>
            <Input
              id="branch"
              value={formData.branch || ''}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value || null })}
              placeholder="feature/TASK-XXX"
            />
          </div>
          <div className="grid gap-2">
            <TaskTagsEditor
              tags={formData.tags ?? []}
              onTagsChange={(tags) => setFormData({ ...formData, tags })}
              allTasks={allTasks}
              tagMetadata={tagMetadata}
              label="Теги"
              placeholder="Введите или выберите тег..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
