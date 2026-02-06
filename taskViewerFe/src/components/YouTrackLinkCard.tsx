import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { youtrackApi } from '@/api/youtrack.api';
import type { TaskYouTrackLinks } from '@/types/youtrack.types';
import { toast } from 'sonner';
import { CreateYouTrackIssueDialog } from './CreateYouTrackIssueDialog';
import { LinkYouTrackIssueDialog } from './LinkYouTrackIssueDialog';

interface YouTrackLinkCardProps {
  taskId: string;
  initialIssueIds?: string[];
  onLinksUpdated?: () => void;
}

export function YouTrackLinkCard({ taskId, initialIssueIds, onLinksUpdated }: YouTrackLinkCardProps) {
  const [links, setLinks] = useState<TaskYouTrackLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await youtrackApi.getIssueLinks(taskId, true);
      setLinks(data);
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

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchLinks();
    onLinksUpdated?.();
  };

  const handleLinkSuccess = () => {
    setLinkDialogOpen(false);
    fetchLinks();
    onLinksUpdated?.();
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>🔗 YouTrack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasLinks ? (
            <div className="space-y-3">
              <CardDescription>Задача не связана</CardDescription>
              <div className="flex flex-col gap-2">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  Создать задачу в YouTrack
                </Button>
                <Button variant="outline" onClick={() => setLinkDialogOpen(true)}>
                  Связать с существующей задачей
                </Button>
              </div>
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
                      onClick={() => setLinkDialogOpen(true)}
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
                    onClick={() => setLinkDialogOpen(true)}
                    className="w-full"
                  >
                    Связать ещё одну задачу
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateYouTrackIssueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        taskId={taskId}
        onSuccess={handleCreateSuccess}
      />

      <LinkYouTrackIssueDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        taskId={taskId}
        existingIssueIds={issueIds}
        onSuccess={handleLinkSuccess}
      />
    </>
  );
}
