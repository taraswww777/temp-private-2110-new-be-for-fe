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
} from '@/uiKit';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { tasksApi } from '@/api/tasks.api';
import type { TaskDetail } from '@/types/task.types';

interface TaskContentEditDialogProps {
  task: TaskDetail;
  onContentUpdated?: () => void;
}

export function TaskContentEditDialog({ task, onContentUpdated }: TaskContentEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(task.content);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(task.content);
    }
  }, [open, task.content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await tasksApi.updateTaskContent(task.id, content);
      toast.success('Содержимое задачи обновлено');
      setOpen(false);
      if (onContentUpdated) {
        onContentUpdated();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сохранить изменения';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(task.content); // Восстанавливаем исходное содержимое
    setOpen(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Разрешаем закрытие только если это явное действие (уже обработано в handleCancel или handleSave)
        // Или если это открытие (newOpen === true)
        if (newOpen) {
          setOpen(true);
        }
        // Если newOpen === false, игнорируем - закрытие должно происходить только через кнопки
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Редактировать содержимое</Button>
      </DialogTrigger>
      <DialogContent 
        className="w-[90vw] max-w-[90vw] max-h-[90vh] flex flex-col p-0"
        onEscapeKeyDown={(e) => {
          // Предотвращаем закрытие по Escape
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          // Предотвращаем закрытие при клике вне модального окна
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          // Предотвращаем закрытие при взаимодействии вне модального окна
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle>Редактирование содержимого задачи {task.id}</DialogTitle>
              <DialogDescription>
                Редактируйте описание задачи в формате Markdown. Изменения сохраняются в файл задачи.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full -mr-2 -mt-2"
              onClick={handleCancel}
              aria-label="Закрыть"
              type="button"
            >
              ×
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 px-6 py-4 min-h-0 flex flex-col">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Введите описание задачи в формате Markdown..."
            className="flex-1 min-h-0"
          />
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 flex-shrink-0 border-t">
          <Button variant="outline" onClick={handleCancel}>
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
