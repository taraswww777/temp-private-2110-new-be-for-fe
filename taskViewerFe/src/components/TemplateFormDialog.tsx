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
} from '@/uiKit';
import { TemplatePreview } from './TemplatePreview';
import type { YouTrackTemplate, CreateYouTrackTemplateInput } from '@/types/youtrack.types';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: YouTrackTemplate | null;
  onSave: (template: CreateYouTrackTemplateInput) => Promise<void>;
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateFormDialogProps) {
  const [formData, setFormData] = useState<CreateYouTrackTemplateInput>({
    id: '',
    name: '',
    description: '',
    projectId: '',
    parentIssueId: '',
    summaryTemplate: '',
    descriptionTemplate: '',
    customFields: {},
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (template) {
        setFormData({
          id: template.id,
          name: template.name,
          description: template.description || '',
          projectId: template.projectId,
          parentIssueId: template.parentIssueId || '',
          summaryTemplate: template.summaryTemplate,
          descriptionTemplate: template.descriptionTemplate,
          customFields: template.customFields || {},
        });
      } else {
        setFormData({
          id: '',
          name: '',
          description: '',
          projectId: '',
          parentIssueId: '',
          summaryTemplate: '',
          descriptionTemplate: '',
          customFields: {},
        });
      }
    }
  }, [open, template]);

  const handleSave = async () => {
    if (!formData.id.trim() || !formData.name.trim() || !formData.projectId.trim()) {
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const previewVariables = {
    taskId: 'TASK-001',
    title: 'Пример задачи',
    content: 'Это пример содержимого задачи для предпросмотра шаблона.',
    status: 'in-progress',
    branch: 'feature/TASK-001',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Редактировать шаблон' : 'Создать шаблон'}</DialogTitle>
          <DialogDescription>
            {template
              ? 'Редактирование шаблона для создания задач в YouTrack'
              : 'Создание нового шаблона для создания задач в YouTrack'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {template && (
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor="id" className="text-muted-foreground shrink-0">
                ID шаблона (readonly):
              </Label>
              <span id="id" className="font-mono bg-muted px-2 py-1 rounded">
                {formData.id}
              </span>
            </div>
          )}
          {!template && (
            <div className="grid gap-2">
              <Label htmlFor="id">ID шаблона</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="default"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Шаблон по умолчанию"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание шаблона"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="projectId">ID проекта YouTrack</Label>
            <Input
              id="projectId"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              placeholder="0-0"
            />
            <p className="text-xs text-muted-foreground">
              ID проекта в YouTrack. Используйте "0-0" для автоматического определения.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parentIssueId">Родительская задача (YouTrack)</Label>
            <Input
              id="parentIssueId"
              value={formData.parentIssueId ?? ''}
              onChange={(e) => setFormData({ ...formData, parentIssueId: e.target.value })}
              placeholder="VTB-100"
            />
            <p className="text-xs text-muted-foreground">
              Номер задачи в YouTrack (idReadable). Если указано, новая задача создаётся как подзадача этой.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summaryTemplate">Шаблон Summary</Label>
            <textarea
              id="summaryTemplate"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.summaryTemplate}
              onChange={(e) =>
                setFormData({ ...formData, summaryTemplate: e.target.value })
              }
              placeholder="{{title}}"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descriptionTemplate">Шаблон Description</Label>
            <textarea
              id="descriptionTemplate"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.descriptionTemplate}
              onChange={(e) =>
                setFormData({ ...formData, descriptionTemplate: e.target.value })
              }
              placeholder="{{content}}\n\n**Локальная задача:** {{taskId}}"
            />
          </div>

          <TemplatePreview
            template={{
              id: formData.id || 'preview',
              name: formData.name || 'Preview',
              description: formData.description,
              projectId: formData.projectId || '0-0',
              parentIssueId: formData.parentIssueId || undefined,
              summaryTemplate: formData.summaryTemplate,
              descriptionTemplate: formData.descriptionTemplate,
              customFields: formData.customFields,
            }}
            variables={previewVariables}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={
              saving ||
              !formData.id.trim() ||
              !formData.name.trim() ||
              !formData.projectId.trim()
            }
          >
            {saving ? 'Сохранение...' : template ? 'Сохранить изменения' : 'Создать шаблон'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
