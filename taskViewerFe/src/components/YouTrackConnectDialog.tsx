import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/uiKit';
import { youtrackApi } from '@/api/youtrack.api';
import type { YouTrackTemplate } from '@/types/youtrack.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type YouTrackConnectTab = 'create' | 'link';

interface YouTrackConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  existingIssueIds?: string[];
  onSuccess?: () => void;
  /** С какой вкладки открыть (по умолчанию — создать задачу) */
  initialTab?: YouTrackConnectTab;
}

export function YouTrackConnectDialog({
  open,
  onOpenChange,
  taskId,
  existingIssueIds = [],
  onSuccess,
  initialTab = 'create',
}: YouTrackConnectDialogProps) {
  const [activeTab, setActiveTab] = useState<YouTrackConnectTab>(initialTab);

  // Create tab state
  const [templates, setTemplates] = useState<YouTrackTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [createLoading, setCreateLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Link tab state
  const [linkIssueId, setLinkIssueId] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setLinkIssueId('');
    }
  }, [open, initialTab]);

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

  const validateIssueId = (id: string): boolean =>
    /^[A-Z0-9]+-[0-9]+$/i.test(id.trim());

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
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
      setCreateLoading(false);
    }
  };

  const handleLink = async () => {
    const trimmedId = linkIssueId.trim();
    if (!trimmedId) {
      toast.error('Введите ID задачи YouTrack');
      return;
    }
    if (!validateIssueId(trimmedId)) {
      toast.error('Неверный формат ID задачи. Ожидается формат: PROJ-123');
      return;
    }
    if (existingIssueIds.includes(trimmedId)) {
      toast.error(`Задача ${trimmedId} уже связана`);
      return;
    }
    try {
      setLinkLoading(true);
      const result = await youtrackApi.linkIssue(taskId, trimmedId);
      if (result.queued) {
        toast.success(`Операция добавлена в очередь. Операция: ${result.operationId}`);
      } else {
        toast.success(`Задача ${trimmedId} успешно связана`);
      }
      setLinkIssueId('');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось связать задачу';
      toast.error(message);
    } finally {
      setLinkLoading(false);
    }
  };

  const loading = createLoading || linkLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Связать с YouTrack</DialogTitle>
          <DialogDescription>
            Локальная задача {taskId}. Выберите способ связывания.
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'create'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Создать задачу в YouTrack
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === 'link'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Связать с существующей
          </button>
        </div>

        {activeTab === 'create' && (
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
        )}

        {activeTab === 'link' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issueId">ID задачи YouTrack</Label>
              <Input
                id="issueId"
                placeholder="PROJ-123"
                value={linkIssueId}
                onChange={(e) => setLinkIssueId(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !linkLoading) handleLink();
                }}
                disabled={linkLoading}
              />
              <p className="text-xs text-muted-foreground">
                Формат: PROJ-123 (буквы, дефис, цифры)
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          {activeTab === 'create' && (
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={loading || templatesLoading || templates.length === 0}
            >
              {createLoading ? 'Создание...' : 'Создать задачу'}
            </Button>
          )}
          {activeTab === 'link' && (
            <Button variant="primary" onClick={handleLink} disabled={loading || !linkIssueId.trim()}>
              {linkLoading ? 'Связывание...' : 'Связать'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
