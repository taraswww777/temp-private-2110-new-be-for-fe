import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateFormDialog } from '@/components/TemplateFormDialog';
import { TemplatePreview } from '@/components/TemplatePreview';
import { youtrackApi } from '@/api/youtrack.api';
import type { YouTrackTemplate, CreateYouTrackTemplateInput } from '@/types/youtrack.types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/PageHeader';

export function YouTrackTemplatesPage() {
  const [templates, setTemplates] = useState<YouTrackTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<YouTrackTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<YouTrackTemplate | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await youtrackApi.getTemplates();
      setTemplates(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить шаблоны';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (template: YouTrackTemplate) => {
    setEditingTemplate(template);
    setFormDialogOpen(true);
  };

  const handlePreview = (template: YouTrackTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handleDelete = (templateId: string) => {
    setDeletingTemplateId(templateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTemplateId) return;

    try {
      setDeleting(true);
      await youtrackApi.deleteTemplate(deletingTemplateId);
      toast.success(`Шаблон ${deletingTemplateId} удалён`);
      await fetchTemplates();
      setDeleteDialogOpen(false);
      setDeletingTemplateId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить шаблон';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (templateData: CreateYouTrackTemplateInput) => {
    try {
      if (editingTemplate) {
        await youtrackApi.updateTemplate(editingTemplate.id, templateData);
        toast.success(`Шаблон ${templateData.id} обновлён`);
      } else {
        await youtrackApi.createTemplate(templateData);
        toast.success(`Шаблон ${templateData.id} создан`);
      }
      await fetchTemplates();
      setFormDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось сохранить шаблон';
      toast.error(message);
      throw error;
    }
  };

  const previewVariables = {
    taskId: 'TASK-001',
    title: 'Пример задачи',
    content: 'Это пример содержимого задачи для предпросмотра шаблона.',
    status: 'in-progress',
    branch: 'feature/TASK-001',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 w-full bg-muted animate-pulse rounded" />
        <div className="h-96 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Шаблоны YouTrack"
        subtitle="Управление шаблонами для создания задач в YouTrack"
        actions={<Button onClick={handleCreate}>Создать шаблон</Button>}
      />

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Шаблоны не найдены</p>
            <Button onClick={handleCreate}>Создать первый шаблон</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription className="font-mono">{template.id}</CardDescription>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(template)}
                    >
                      Предпросмотр
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">ID проекта:</span>{' '}
                    <code className="bg-muted px-2 py-1 rounded">{template.projectId}</code>
                  </div>
                  <div>
                    <span className="font-semibold">Custom Fields:</span>{' '}
                    {template.customFields
                      ? Object.keys(template.customFields).length
                      : 0}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <span className="text-sm font-semibold">Summary Template:</span>
                    <div className="text-sm bg-muted p-2 rounded mt-1 font-mono text-xs">
                      {template.summaryTemplate || '(пусто)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Description Template:</span>
                    <div className="text-sm bg-muted p-2 rounded mt-1 font-mono text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {template.descriptionTemplate || '(пусто)'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) {
            setEditingTemplate(null);
          }
        }}
        template={editingTemplate}
        onSave={handleSave}
      />

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Предпросмотр шаблона</DialogTitle>
            <DialogDescription>
              {previewTemplate?.name} ({previewTemplate?.id})
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <TemplatePreview template={previewTemplate} variables={previewVariables} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить шаблон?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить шаблон "{deletingTemplateId}"? Это действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingTemplateId(null);
              }}
              disabled={deleting}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
