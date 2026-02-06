import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { youtrackApi } from '@/api/youtrack.api';
import type { TaskYouTrackLinks } from '@/types/youtrack.types';
import { toast } from 'sonner';
import { YouTrackConnectDialog } from './YouTrackConnectDialog';
import type { YouTrackConnectTab } from './YouTrackConnectDialog';

interface YouTrackLinkCardProps {
  taskId: string;
  initialIssueIds?: string[];
  onLinksUpdated?: () => void;
}

export function YouTrackLinkCard({ taskId, initialIssueIds, onLinksUpdated }: YouTrackLinkCardProps) {
  const [links, setLinks] = useState<TaskYouTrackLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectDialogTab, setConnectDialogTab] = useState<YouTrackConnectTab>('create');
  const [queueStatus, setQueueStatus] = useState<{ createIssue: boolean; linkIssue: boolean }>({
    createIssue: false,
    linkIssue: false,
  });

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const [linksData, queueData] = await Promise.all([
        youtrackApi.getIssueLinks(taskId, true),
        youtrackApi.getQueueStatus().catch(() => null),
      ]);
      setLinks(linksData);
      if (queueData?.operations) {
        const pendingForTask = queueData.operations.filter(
          (op) => op.status === 'pending' && op.data?.taskId === taskId
        );
        setQueueStatus({
          createIssue: pendingForTask.some((op) => op.type === 'create_issue'),
          linkIssue: pendingForTask.some((op) => op.type === 'link_issue'),
        });
      } else {
        setQueueStatus({ createIssue: false, linkIssue: false });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить связи';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleUnlink = async (youtrackIssueId: string) => {
    try {
      await youtrackApi.unlinkIssue(taskId, youtrackIssueId);
      toast.success(`Связь с задачей ${youtrackIssueId} удалена`);
      await fetchLinks();
      onLinksUpdated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить связь';
      toast.error(message);
    }
  };

  const handleConnectSuccess = () => {
    setConnectDialogOpen(false);
    fetchLinks();
    onLinksUpdated?.();
  };

  const openConnectDialog = (tab: YouTrackConnectTab = 'create') => {
    setConnectDialogTab(tab);
    setConnectDialogOpen(true);
  };

  const openInYouTrack = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔗 YouTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  const issueIds = links?.youtrackIssueIds || initialIssueIds || [];
  const hasLinks = issueIds.length > 0;
  const inQueue = queueStatus.createIssue || queueStatus.linkIssue;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>🔗 YouTrack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(inQueue || !hasLinks) && (
            <div className="flex flex-wrap items-center gap-2">
              {inQueue && (
                <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-500">
                  <span aria-hidden>⏳</span> В очереди
                </Badge>
              )}
              {!hasLinks && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <span aria-hidden>○</span> Не связана
                </Badge>
              )}
            </div>
          )}
          {!hasLinks ? (
            <div className="space-y-3">
              <Button
                onClick={() => openConnectDialog('create')}
                disabled={queueStatus.createIssue || queueStatus.linkIssue}
                title={queueStatus.createIssue || queueStatus.linkIssue ? 'Операция уже в очереди' : undefined}
              >
                Связать с YT
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {issueIds.length === 1 ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold">Задача:</span> {issueIds[0]}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => {
                        const link = links?.links.find((l) => l.youtrackIssueId === issueIds[0]);
                        if (link) {
                          openInYouTrack(link.youtrackIssueUrl);
                        }
                      }}
                    >
                      Открыть в YouTrack
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlink(issueIds[0])}
                    >
                      Отвязать
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openConnectDialog('link')}
                      disabled={queueStatus.createIssue || queueStatus.linkIssue}
                      title={queueStatus.createIssue || queueStatus.linkIssue ? 'Операция уже в очереди' : undefined}
                    >
                      Связать ещё одну задачу
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(links?.links && links.links.length > 0
                    ? links.links
                    : issueIds.map((id) => ({
                        youtrackIssueId: id,
                        youtrackIssueUrl: '',
                        youtrackData: undefined,
                      }))
                  ).map((link) => (
                    <div
                      key={link.youtrackIssueId}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium">• {link.youtrackIssueId}</div>
                        {link.youtrackData && (
                          <div className="text-xs text-muted-foreground">
                            {link.youtrackData.summary}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {link.youtrackIssueUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openInYouTrack(link.youtrackIssueUrl)}
                          >
                            Открыть
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnlink(link.youtrackIssueId)}
                        >
                          Отвязать
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openConnectDialog('link')}
                    className="w-full"
                    disabled={queueStatus.createIssue || queueStatus.linkIssue}
                    title={queueStatus.createIssue || queueStatus.linkIssue ? 'Операция уже в очереди' : undefined}
                  >
                    Связать ещё одну задачу
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <YouTrackConnectDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        taskId={taskId}
        existingIssueIds={issueIds}
        onSuccess={handleConnectSuccess}
        initialTab={connectDialogTab}
      />
    </>
  );
}
