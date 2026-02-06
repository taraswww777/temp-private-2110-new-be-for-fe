import { useState } from 'react';
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
import { youtrackApi } from '@/api/youtrack.api';
import { toast } from 'sonner';

interface LinkYouTrackIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  existingIssueIds: string[];
  onSuccess?: () => void;
}

export function LinkYouTrackIssueDialog({
  open,
  onOpenChange,
  taskId,
  existingIssueIds,
  onSuccess,
}: LinkYouTrackIssueDialogProps) {
  const [issueId, setIssueId] = useState('');
  const [loading, setLoading] = useState(false);

  const validateIssueId = (id: string): boolean => {
    // Простая валидация формата: должен содержать дефис и буквы/цифры
    // Например: PROJ-123, TASK-456
    return /^[A-Z0-9]+-[0-9]+$/i.test(id.trim());
  };

  const handleLink = async () => {
    const trimmedId = issueId.trim();
    
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
      setLoading(true);
      const result = await youtrackApi.linkIssue(taskId, trimmedId);
      
      if (result.queued) {
        toast.success(`Операция добавлена в очередь. Операция: ${result.operationId}`);
      } else {
        toast.success(`Задача ${trimmedId} успешно связана`);
      }
      
      setIssueId('');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось связать задачу';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIssueId('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Связать с существующей задачей YouTrack</DialogTitle>
          <DialogDescription>
            Введите ID задачи YouTrack для связывания с локальной задачей {taskId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="issueId">ID задачи YouTrack</Label>
            <Input
              id="issueId"
              placeholder="PROJ-123"
              value={issueId}
              onChange={(e) => setIssueId(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleLink();
                }
              }}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Формат: PROJ-123 (буквы, дефис, цифры)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleLink} disabled={loading || !issueId.trim()}>
            {loading ? 'Связывание...' : 'Связать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
