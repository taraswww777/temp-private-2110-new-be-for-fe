import { useState, useEffect } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/uiKit';
import { youtrackApi, buildYouTrackIssueUrl } from '@/api/youtrack.api';
import type { TaskYouTrackLinks } from '@/types/youtrack.types';
import { toast } from 'sonner';
import { YouTrackConnectDialog } from './YouTrackConnectDialog';
import type { YouTrackConnectTab } from './YouTrackConnectDialog';

interface TaskPreviewData {
  title: string;
  content: string;
  status?: string;
  branch?: string | null;
}

interface YouTrackLinkCardProps {
  taskId: string;
  initialIssueIds?: string[];
  /** Данные задачи для предпросмотра шаблона в диалоге создания */
  taskPreview?: TaskPreviewData;
  onLinksUpdated?: () => void;
}

export function YouTrackLinkCard({ taskId, initialIssueIds, taskPreview, onLinksUpdated }: YouTrackLinkCardProps) {
  const [links, setLinks] = useState<TaskYouTrackLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [youtrackBaseUrl, setYoutrackBaseUrl] = useState<string | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectDialogTab, setConnectDialogTab] = useState<YouTrackConnectTab>('create');
  const [queueStatus, setQueueStatus] = useState<{ createIssue: boolean; linkIssue: boolean }>({
    createIssue: false,
    linkIssue: false,
  });

  useEffect(() => {
    youtrackApi.getConfig().then((c) => setYoutrackBaseUrl(c.baseUrl)).catch(() => setYoutrackBaseUrl(null));
  }, []);

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
                    <span className="font-semibold">Задача:</span>{' '}
                    {(() => {
                      const url = buildYouTrackIssueUrl(youtrackBaseUrl, issueIds[0]);
                      return url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2 hover:no-underline"
                        >
                          {issueIds[0]}
                        </a>
                      ) : (
                        issueIds[0]
                      );
                    })()}
                  </div>
                  <div className="flex gap-2 flex-wrap">
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
                  ).map((link) => {
                    const issueUrl = buildYouTrackIssueUrl(youtrackBaseUrl, link.youtrackIssueId);
                    return (
                    <div
                      key={link.youtrackIssueId}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          •{' '}
                          {issueUrl ? (
                            <a
                              href={issueUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline underline-offset-2 hover:no-underline"
                            >
                              {link.youtrackIssueId}
                            </a>
                          ) : (
                            link.youtrackIssueId
                          )}
                        </div>
                        {link.youtrackData && (
                          <div className="text-xs text-muted-foreground">
                            {link.youtrackData.summary}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnlink(link.youtrackIssueId)}
                        >
                          Отвязать
                        </Button>
                      </div>
                    </div>
                    );
                  })}
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
        taskPreview={taskPreview}
        onSuccess={handleConnectSuccess}
        initialTab={connectDialogTab}
      />
    </>
  );
}
