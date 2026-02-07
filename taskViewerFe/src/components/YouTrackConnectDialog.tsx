import { useState, useEffect, useRef } from 'react';
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
import { youtrackApi, buildYouTrackIssueUrl } from '@/api/youtrack.api';
import { TemplatePreview } from '@/components/TemplatePreview';
import type { YouTrackTemplate, YouTrackIssueInfo } from '@/types/youtrack.types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type YouTrackConnectTab = 'create' | 'link';

/** Данные задачи для предпросмотра шаблона (как будет выглядеть задача в YouTrack) */
export interface TaskPreviewData {
  title: string;
  content: string;
  status?: string;
  branch?: string | null;
}

interface YouTrackConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  existingIssueIds?: string[];
  /** Данные задачи для предпросмотра шаблона (если не переданы — предпросмотр с плейсхолдерами) */
  taskPreview?: TaskPreviewData;
  onSuccess?: () => void;
  /** С какой вкладки открыть (по умолчанию — создать задачу) */
  initialTab?: YouTrackConnectTab;
}

export function YouTrackConnectDialog({
  open,
  onOpenChange,
  taskId,
  existingIssueIds = [],
  taskPreview,
  onSuccess,
  initialTab = 'create',
}: YouTrackConnectDialogProps) {
  const [activeTab, setActiveTab] = useState<YouTrackConnectTab>(initialTab);

  // Create tab state
  const [templates, setTemplates] = useState<YouTrackTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [createLoading, setCreateLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [overridePriority, setOverridePriority] = useState('');
  const [overrideAssignee, setOverrideAssignee] = useState('');

  // Link tab state
  const [linkIssueId, setLinkIssueId] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkPreview, setLinkPreview] = useState<YouTrackIssueInfo | null>(null);
  const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);
  const [linkPreviewError, setLinkPreviewError] = useState<string | null>(null);
  const [ytBaseUrl, setYtBaseUrl] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      setLinkIssueId('');
      setLinkPreview(null);
      setLinkPreviewError(null);
      setOverridePriority('');
      setOverrideAssignee('');
      youtrackApi.getConfig().then((c) => setYtBaseUrl(c.baseUrl));
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

  // Предпросмотр задачи YouTrack при вводе ID (с задержкой)
  const trimmedLinkId = linkIssueId.trim();
  const linkIdValidForPreview =
    trimmedLinkId.length > 0 &&
    validateIssueId(trimmedLinkId) &&
    !existingIssueIds.includes(trimmedLinkId);

  const linkPreviewCancelledRef = useRef(false);
  useEffect(() => {
    if (!linkIdValidForPreview) {
      setLinkPreview(null);
      setLinkPreviewError(null);
      return;
    }
    linkPreviewCancelledRef.current = false;
    setLinkPreviewLoading(true);
    setLinkPreviewError(null);
    const t = setTimeout(() => {
      youtrackApi
        .getIssueInfo(trimmedLinkId)
        .then((info) => {
          if (!linkPreviewCancelledRef.current) {
            setLinkPreview(info);
            setLinkPreviewError(null);
          }
        })
        .catch((err) => {
          if (!linkPreviewCancelledRef.current) {
            setLinkPreview(null);
            setLinkPreviewError(err instanceof Error ? err.message : 'Не удалось загрузить задачу');
          }
        })
        .finally(() => {
          if (!linkPreviewCancelledRef.current) setLinkPreviewLoading(false);
        });
    }, 400);
    return () => {
      clearTimeout(t);
      linkPreviewCancelledRef.current = true;
    };
  }, [trimmedLinkId, linkIdValidForPreview]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const createPreviewVariables = {
    taskId: taskPreview ? '' : taskId,
    title: taskPreview?.title ?? '',
    content: taskPreview?.content ?? '',
    status: taskPreview?.status ?? '',
    branch: taskPreview?.branch ?? '',
  };

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      const customFields: Record<string, unknown> = {};
      if (overridePriority.trim()) {
        customFields['Priority'] = {
          $type: 'SingleEnumIssueCustomField',
          value: { name: overridePriority.trim() },
        };
      }
      if (overrideAssignee.trim()) {
        customFields['Assignee'] = {
          $type: 'SingleUserIssueCustomField',
          value: { login: overrideAssignee.trim() },
        };
      }
      const result = await youtrackApi.createIssue(
        taskId,
        selectedTemplateId,
        Object.keys(customFields).length > 0 ? customFields : undefined
      );
      if (result.queued) {
        toast.success(`Задача добавлена в очередь. Операция: ${result.operationId}`);
      } else {
        toast.success(`Задача ${result.youtrackIssueId} создана в YouTrack`);
        const config = await youtrackApi.getConfig();
        const url = buildYouTrackIssueUrl(config.baseUrl, result.youtrackIssueId);
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
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
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
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
            {selectedTemplate && (
              <>
                <TemplatePreview
                  template={selectedTemplate}
                  variables={createPreviewVariables}
                />
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-sm font-medium text-muted-foreground">
                    Переопределение полей (опционально)
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="override-priority" className="text-xs">
                        Приоритет
                      </Label>
                      <Input
                        id="override-priority"
                        placeholder="Например: High"
                        value={overridePriority}
                        onChange={(e) => setOverridePriority(e.target.value)}
                        disabled={createLoading}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="override-assignee" className="text-xs">
                        Исполнитель (логин)
                      </Label>
                      <Input
                        id="override-assignee"
                        placeholder="Логин в YouTrack"
                        value={overrideAssignee}
                        onChange={(e) => setOverrideAssignee(e.target.value)}
                        disabled={createLoading}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
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
            {linkPreviewLoading && (
              <div className="text-sm text-muted-foreground">Загрузка информации о задаче...</div>
            )}
            {linkPreviewError && !linkPreviewLoading && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {linkPreviewError}
              </div>
            )}
            {linkPreview && !linkPreviewLoading && (
              <div className="rounded-md border bg-muted/50 px-3 py-3 text-sm">
                <div className="font-medium text-foreground">
                  {linkPreview.idReadable ?? trimmedLinkId}
                </div>
                <div className="mt-1 text-foreground">{linkPreview.summary}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-muted-foreground">
                  {linkPreview.state && <span>Статус: {linkPreview.state}</span>}
                  {linkPreview.priority && <span>Приоритет: {linkPreview.priority}</span>}
                </div>
                {ytBaseUrl && (
                  <a
                    href={buildYouTrackIssueUrl(ytBaseUrl, linkPreview.idReadable ?? trimmedLinkId) ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-primary underline hover:no-underline"
                  >
                    Открыть в YouTrack
                  </a>
                )}
              </div>
            )}
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
