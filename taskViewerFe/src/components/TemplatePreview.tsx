import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/uiKit';
import type { YouTrackTemplate } from '@/types/youtrack.types';

interface TemplatePreviewProps {
  template: YouTrackTemplate;
  variables: {
    taskId: string;
    title: string;
    content: string;
    status?: string;
    branch?: string | null;
  };
}

export function TemplatePreview({ template, variables }: TemplatePreviewProps) {
  const replaceVariables = (text: string): string => {
    return text
      .replace(/\{\{taskId\}\}/g, variables.taskId)
      .replace(/\{\{title\}\}/g, variables.title)
      .replace(/\{\{content\}\}/g, variables.content)
      .replace(/\{\{status\}\}/g, variables.status || '')
      .replace(/\{\{branch\}\}/g, variables.branch || '');
  };

  const previewSummary = replaceVariables(template.summaryTemplate);
  const previewDescription = replaceVariables(template.descriptionTemplate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Предпросмотр шаблона</CardTitle>
        <CardDescription>
          Как будет выглядеть задача в YouTrack с подстановкой переменных
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold">Summary:</div>
          <div className="text-sm bg-muted p-3 rounded border whitespace-pre-wrap">
            {previewSummary || '(пусто)'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Description:</div>
          <div className="text-sm bg-muted p-3 rounded border whitespace-pre-wrap max-h-64 overflow-y-auto">
            {previewDescription || '(пусто)'}
          </div>
        </div>
        {template.customFields && Object.keys(template.customFields).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Custom Fields:</div>
            <div className="text-sm space-y-1">
              {Object.entries(template.customFields).map(([name, field]) => (
                <div key={name} className="bg-muted p-2 rounded border">
                  <span className="font-medium">{name}:</span>{' '}
                  {field.value.name || field.value.login || '(не задано)'}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            <div className="font-semibold mb-1">Доступные переменные:</div>
            <div className="space-y-1">
              <div><code className="bg-background px-1 py-0.5 rounded">&#123;&#123;taskId&#125;&#125;</code> - ID локальной задачи</div>
              <div><code className="bg-background px-1 py-0.5 rounded">&#123;&#123;title&#125;&#125;</code> - Название задачи</div>
              <div><code className="bg-background px-1 py-0.5 rounded">&#123;&#123;content&#125;&#125;</code> - Содержимое задачи</div>
              <div><code className="bg-background px-1 py-0.5 rounded">&#123;&#123;status&#125;&#125;</code> - Статус задачи</div>
              <div><code className="bg-background px-1 py-0.5 rounded">&#123;&#123;branch&#125;&#125;</code> - Git ветка</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
