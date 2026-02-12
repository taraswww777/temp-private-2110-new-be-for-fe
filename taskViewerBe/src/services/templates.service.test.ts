import { describe, it, expect } from 'vitest';
import { templatesService } from './templates.service.js';

describe('templatesService.applyTemplateVariables', () => {
  it('replaces all variables in template string', () => {
    const result = templatesService.applyTemplateVariables(
      'Task: {{taskId}} - {{title}} | {{content}} | {{status}} | {{branch}}',
      {
        taskId: 'TASK-001',
        title: 'Fix bug',
        content: 'Description here',
        status: 'in-progress',
        branch: 'feature/TASK-001',
      }
    );
    expect(result).toBe(
      'Task: TASK-001 - Fix bug | Description here | in-progress | feature/TASK-001'
    );
  });

  it('replaces empty optional variables with empty string', () => {
    const result = templatesService.applyTemplateVariables('{{title}} {{status}} {{branch}}', {
      taskId: '',
      title: 'Only title',
      content: '',
      status: '',
      branch: '',
    });
    expect(result).toBe('Only title  ');
  });
});
