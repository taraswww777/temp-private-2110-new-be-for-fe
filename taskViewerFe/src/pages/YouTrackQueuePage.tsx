import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { youtrackApi } from '@/api/youtrack.api';
import type { YouTrackQueueStatus, QueueOperationItem } from '@/types/youtrack.types';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  processing: 'В обработке',
  completed: 'Выполнено',
  failed: 'Ошибка',
};

const typeLabels: Record<string, string> = {
  create_issue: 'Создать задачу',
  link_issue: 'Связать задачу',
  unlink_issue: 'Отвязать задачу',
};

function OperationRow({ op }: { op: QueueOperationItem }) {
  const date = format(new Date(op.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru });
  const { data } = op;
  const taskCell = data?.taskId ? (
    <span className="flex flex-wrap items-center gap-1.5">
      <Link
        to={`/tasks/${data.taskId}`}
        className="font-mono text-primary hover:underline"
      >
        {data.taskId}
      </Link>
      {data.templateId && (
        <span className="text-muted-foreground text-xs">(шаблон: {data.templateId})</span>
      )}
      {data.youtrackIssueId && (
        <span className="text-muted-foreground text-xs">→ {data.youtrackIssueId}</span>
      )}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

  return (
    <tr className="border-b last:border-0">
      <td className="py-2 px-3 text-sm font-mono">{op.id.slice(0, 8)}…</td>
      <td className="py-2 px-3 text-sm">{typeLabels[op.type] ?? op.type}</td>
      <td className="py-2 px-3 text-sm">{taskCell}</td>
      <td className="py-2 px-3 text-sm">{statusLabels[op.status] ?? op.status}</td>
      <td className="py-2 px-3 text-sm text-muted-foreground">{date}</td>
      <td className="py-2 px-3 text-sm">{op.attempts}</td>
    </tr>
  );
}

export function YouTrackQueuePage() {
  const [status, setStatus] = useState<YouTrackQueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await youtrackApi.getQueueStatus();
      setStatus(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить очередь';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleProcess = async () => {
    try {
      setProcessing(true);
      const result = await youtrackApi.processQueue();
      if (result.processed > 0 || result.failed > 0) {
        toast.success(
          `Обработано: ${result.processed}, ошибок: ${result.failed}`
        );
      } else if (status?.pending === 0) {
        toast.info('Нет операций в очереди');
      }
      if (result.errors.length > 0) {
        result.errors.forEach((e) => toast.error(`${e.operationId}: ${e.error}`));
      }
      await fetchQueue();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обработать очередь';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const hasPending = (status?.pending ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Очередь YouTrack"
        subtitle="Операции, ожидающие выполнения при недоступности YouTrack"
        actions={
          <Button
            onClick={handleProcess}
            disabled={processing || !hasPending}
          >
            {processing ? 'Обработка…' : 'Обработать очередь'}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Статистика</CardTitle>
          <CardDescription>
            Всего операций в очереди: {status?.operations.length ?? 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold text-amber-600">{status?.pending ?? 0}</div>
              <div className="text-muted-foreground">Ожидает</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold text-blue-600">{status?.processing ?? 0}</div>
              <div className="text-muted-foreground">В обработке</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold text-green-600">{status?.completed ?? 0}</div>
              <div className="text-muted-foreground">Выполнено</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold text-red-600">{status?.failed ?? 0}</div>
              <div className="text-muted-foreground">Ошибка</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Операции</CardTitle>
          <CardDescription>
            Список операций в очереди (последние сверху)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!status?.operations.length ? (
            <p className="text-muted-foreground py-6 text-center">
              Очередь пуста
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="py-2 px-3 font-medium">ID</th>
                    <th className="py-2 px-3 font-medium">Тип</th>
                    <th className="py-2 px-3 font-medium">Задача</th>
                    <th className="py-2 px-3 font-medium">Статус</th>
                    <th className="py-2 px-3 font-medium">Создано</th>
                    <th className="py-2 px-3 font-medium">Попыток</th>
                  </tr>
                </thead>
                <tbody>
                  {status.operations.map((op) => (
                    <OperationRow key={op.id} op={op} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
