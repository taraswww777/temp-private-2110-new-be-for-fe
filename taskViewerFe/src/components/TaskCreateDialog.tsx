import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { tasksApi } from '@/api/tasks.api';
import { projectsApi, type Project } from '@/api/projects.api';
import type { Task, TaskStatus, TaskPriority } from '@/types/task.types';

interface TaskCreateDialogProps {
  onTaskCreated?: (task: Task) => void;
}

export function TaskCreateDialog({ onTaskCreated }: TaskCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    status: 'backlog' as TaskStatus,
    priority: 'medium' as TaskPriority,
    content: '',
    branch: null as string | null,
    tags: [] as string[],
    project: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tagMetadata, setTagMetadata] = useState<Record<string, { color?: string }>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      tasksApi.getAllTasks().then(setAllTasks).catch(() => setAllTasks([]));
      tasksApi.getTagsMetadata().then((d) => setTagMetadata(d.tags)).catch(() => setTagMetadata({}));
      projectsApi.getAllProjects().then(setProjects).catch(() => setProjects([]));
    }
  }, [open]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Название задачи обязательно');
      return;
    }

    setSaving(true);
    try {
      const task = await tasksApi.createTask({
        title: formData.title.trim(),
        status: formData.status,
        priority: formData.priority,
        content: formData.content,
        branch: formData.branch,
        tags: formData.tags,
        project: formData.project,
      });
      
      toast.success(`Задача ${task.id} создана`);
      setOpen(false);
      
      // Сбросить форму
      setFormData({
        title: '',
        status: 'backlog',
        priority: 'medium',
        content: '',
        branch: null,
        tags: [],
        project: null,
      });

      if (onTaskCreated) {
        onTaskCreated(task);
      } else {
        // Перейти на страницу задачи
        navigate(`/tasks/${task.id}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось создать задачу';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">Создать задачу</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создание новой задачи</DialogTitle>
          <DialogDescription>
            Заполните данные задачи. Описание можно редактировать в формате Markdown.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название задачи"
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
            <Label htmlFor="project">Проект</Label>
            <Select
              value={formData.project || '__none__'}
              onValueChange={(value) =>
                setFormData({ ...formData, project: value === '__none__' ? null : value })
              }
            >
              <SelectTrigger>
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
          <div className="grid gap-2">
            <Label htmlFor="content">Описание (Markdown)</Label>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Введите описание задачи в формате Markdown..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !formData.title.trim()}>
            {saving ? 'Создание...' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
