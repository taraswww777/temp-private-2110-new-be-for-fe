/**
 * Типы для работы с шаблонами YouTrack
 */

export interface YouTrackTemplate {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  summaryTemplate: string;
  descriptionTemplate: string;
  customFields?: Record<string, {
    $type: string;
    value: {
      name?: string;
      login?: string;
    };
  }>;
}

export interface TemplateVariables {
  taskId: string;
  title: string;
  content: string;
  status?: string;
  branch?: string | null;
}
