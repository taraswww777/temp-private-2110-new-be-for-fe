import { useState, useEffect } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from '@/uiKit';
import { youtrackApi } from '@/api/youtrack.api';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';

export function YouTrackTagsBlacklistPage() {
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      const data = await youtrackApi.getTagsBlacklist();
      setBlacklist(data.blacklist);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить чёрный список';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleAdd = async () => {
    const tag = newTag.trim();
    if (!tag) return;
    if (blacklist.includes(tag)) {
      toast.info('Этот тег уже в чёрном списке');
      setNewTag('');
      return;
    }
    setSaving(true);
    try {
      const data = await youtrackApi.addTagToBlacklist(tag);
      setBlacklist(data.blacklist);
      setNewTag('');
      toast.success('Тег добавлен в чёрный список');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить тег';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (tag: string) => {
    setSaving(true);
    try {
      const data = await youtrackApi.removeTagFromBlacklist(tag);
      setBlacklist(data.blacklist);
      toast.success('Тег удалён из чёрного списка');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить тег';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />

      <Card>
        <CardHeader>
          <CardTitle>Чёрный список тегов YouTrack</CardTitle>
          <CardDescription>
            Теги из этого списка не отправляются в YouTrack при создании задачи. Удобно для
            внутренних меток (например, «черновик», «внутренний»).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              placeholder="Введите тег и нажмите «Добавить»"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              disabled={saving}
              className="max-w-[280px]"
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!newTag.trim() || saving}
            >
              Добавить
            </Button>
          </div>

          {blacklist.length === 0 ? (
            <p className="text-sm text-muted-foreground">Чёрный список пуст. Добавьте тег выше.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {blacklist.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal pr-1 gap-1 py-1.5"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Удалить ${tag} из чёрного списка`}
                    className="ml-0.5 rounded hover:bg-muted-foreground/20 p-0.5"
                    onClick={() => handleRemove(tag)}
                    disabled={saving}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
