import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { youtrackApi } from '@/api/youtrack.api';
import type { YouTrackTemplate } from '@/types/youtrack.types';
import { toast } from 'sonner';

interface CreateYouTrackIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onSuccess?: () => void;
}

export function CreateYouTrackIssueDialog({
  open,
  onOpenChange,
  taskId,
  onSuccess,
}: CreateYouTrackIssueDialogProps) {
  const [templates, setTemplates] = useState<YouTrackTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const data = await youtrackApi.getTemplates();
      setTemplates(data);
      if (data.length > 0) {
        const defaultTemplate = data.find((t) => t.id === 'default') || data[0];
        setSelectedTemplateId(defaultTemplate.id);
      } else {
        setSelectedTemplateId('default');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить шаблоны';
      toast.error(message);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const result = await youtrackApi.createIssue(taskId, selectedTemplateId);
      
      if (result.queued) {
        toast.success(`Задача добавлена в очередь. Операция: ${result.operationId}`);
      } else {
        toast.success(`Задача ${result.youtrackIssueId} создана в YouTrack`);
        if (result.youtrackIssueUrl) {
          window.open(result.youtrackIssueUrl, '_blank', 'noopener,noreferrer');
        }
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать задачу';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать задачу в YouTrack</DialogTitle>
          <DialogDescription>
            Создать новую задачу в YouTrack на основе локальной задачи {taskId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template">Шаблон</Label>
            {templatesLoading ? (
              <div className="text-sm text-muted-foreground">Загрузка шаблонов...</div>
            ) : templates.length === 0 ? (
              <div className="text-sm text-destructive">
                Шаблоны не найдены. Создайте шаблон на странице управления шаблонами.
              </div>
            ) : (
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Выберите шаблон" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                      {template.description && ` - ${template.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || templatesLoading || templates.length === 0}
          >
            {loading ? 'Создание...' : 'Создать задачу'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
