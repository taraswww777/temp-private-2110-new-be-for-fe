import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/uiKit';
import { tasksApi } from '@/api/tasks.api';
import { youtrackApi } from '@/api/youtrack.api';
import { PageHeader } from '@/components/PageHeader';
import { TagBadge } from '@/components/TagBadge';
import { TAG_COLOR_OPTIONS, getTagBadgeClassName } from '@/lib/tag-colors';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/task.types';
import { toast } from 'sonner';

/** Собирает по всем задачам: тег -> { count, taskIds } */
function aggregateTagsByTask(tasks: Task[]): Map<string, { count: number; taskIds: string[] }> {
  const map = new Map<string, { count: number; taskIds: string[] }>();
  for (const task of tasks) {
    const tags = task.tags ?? [];
    for (const tag of tags) {
      const t = tag.trim();
      if (!t) continue;
      const entry = map.get(t);
      if (entry) {
        entry.count += 1;
        entry.taskIds.push(task.id);
      } else {
        map.set(t, { count: 1, taskIds: [task.id] });
      }
    }
  }
  return map;
}

export function TaskTagsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [tagMetadata, setTagMetadata] = useState<Record<string, { color?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [addingToBlacklist, setAddingToBlacklist] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [editTag, setEditTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [colorSaving, setColorSaving] = useState<string | null>(null);

  const tagsWithStats = useMemo(() => {
    const map = aggregateTagsByTask(tasks);
    return Array.from(map.entries())
      .map(([tag, { count, taskIds }]) => ({ tag, count, taskIds }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, blacklistData, metadataData] = await Promise.all([
        tasksApi.getAllTasks(),
        youtrackApi.getTagsBlacklist(),
        tasksApi.getTagsMetadata(),
      ]);
      setTasks(tasksData);
      setBlacklist(blacklistData.blacklist);
      setTagMetadata(metadataData.tags);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить данные';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToBlacklist = async (tag: string) => {
    setAddingToBlacklist(tag);
    try {
      const data = await youtrackApi.addTagToBlacklist(tag);
      setBlacklist(data.blacklist);
      toast.success(`Тег «${tag}» добавлен в чёрный список`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить в чёрный список';
      toast.error(message);
    } finally {
      setAddingToBlacklist(null);
    }
  };

  const handleOpenRename = (tag: string) => {
    setEditTag(tag);
    setNewTagName(tag);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!editTag || !newTagName.trim()) return;
    const trimmed = newTagName.trim();
    if (trimmed === editTag) {
      setRenameDialogOpen(false);
      return;
    }
    setRenameSaving(true);
    try {
      const { updated } = await tasksApi.renameTag(editTag, trimmed);
      toast.success(`Тег переименован в «${trimmed}» (обновлено задач: ${updated})`);
      setRenameDialogOpen(false);
      setEditTag(null);
      setNewTagName('');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось переименовать тег';
      toast.error(message);
    } finally {
      setRenameSaving(false);
    }
  };

  const handleColorChange = async (tag: string, color: string) => {
    setColorSaving(tag);
    try {
      const data = await tasksApi.updateTagColor(tag, color);
      setTagMetadata(data.tags);
      toast.success('Цвет тега обновлён');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось изменить цвет';
      toast.error(message);
    } finally {
      setColorSaving(null);
    }
  };

  const blacklistSet = useMemo(() => new Set(blacklist.map((t) => t.toLowerCase())), [blacklist]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Управление тегами"
        subtitle="Все теги из задач. Редактирование названия, цвет, добавление в чёрный список YouTrack."
      />

      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
        <span>Всего тегов: {tagsWithStats.length}</span>
        <span className="text-border">|</span>
        <Link
          to="/youtrack/tags/blacklist"
          className="text-primary hover:underline"
        >
          Чёрный список тегов YouTrack →
        </Link>
      </div>

      {tagsWithStats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Нет тегов. Добавьте теги на детальных страницах задач.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Теги по задачам</CardTitle>
            <CardDescription>
              Для каждого тега: цвет, количество задач, ссылки на задачи. Можно переименовать тег во
              всех задачах и задать предустановленный цвет.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {tagsWithStats.map(({ tag, count, taskIds }) => {
                const inBlacklist = blacklistSet.has(tag.toLowerCase());
                const color = tagMetadata[tag]?.color;
                return (
                  <li
                    key={tag}
                    className="flex flex-wrap items-center gap-2 py-2 border-b border-border last:border-0"
                  >
                    <TagBadge tag={tag} colorKey={color} />
                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? 'задача' : count < 5 ? 'задачи' : 'задач'}
                    </span>
                    <span className="flex flex-wrap gap-1">
                      {taskIds.slice(0, 10).map((id) => (
                        <Link
                          key={id}
                          to={`/tasks/${id}`}
                          className="text-xs font-mono text-primary hover:underline"
                        >
                          {id}
                        </Link>
                      ))}
                      {taskIds.length > 10 && (
                        <span className="text-xs text-muted-foreground">
                          +{taskIds.length - 10}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRename(tag)}
                      >
                        Редактировать
                      </Button>
                      <Select
                        value={color ?? 'none'}
                        onValueChange={(v) => handleColorChange(tag, v === 'none' ? '' : v)}
                        disabled={colorSaving !== null}
                      >
                        <SelectTrigger className="w-[140px] min-h-9">
                          <SelectValue placeholder="Цвет">
                            {color ? (() => {
                              const opt = TAG_COLOR_OPTIONS.find((o) => o.value === color);
                              return (
                                <span
                                  className={cn(
                                    'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-normal',
                                    getTagBadgeClassName(color)
                                  )}
                                >
                                  {opt?.label ?? color}
                                </span>
                              );
                            })() : (
                              'Выбрать цвет'
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="inline-flex items-center rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs font-normal text-muted-foreground">
                              {color ? 'Без цвета' : 'Выбрать цвет'}
                            </span>
                          </SelectItem>
                          {TAG_COLOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-normal',
                                  getTagBadgeClassName(opt.value)
                                )}
                              >
                                {opt.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!inBlacklist && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToBlacklist(tag)}
                          disabled={addingToBlacklist !== null}
                        >
                          {addingToBlacklist === tag ? '…' : 'В чёрный список'}
                        </Button>
                      )}
                      {inBlacklist && (
                        <span className="text-xs text-muted-foreground">В чёрном списке</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать тег</DialogTitle>
            <DialogDescription>
              Новое имя будет применено ко всем задачам, где используется тег «{editTag}».
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="newTagName">Новое имя тега</Label>
            <Input
              id="newTagName"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Введите новое имя"
              disabled={renameSaving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)} disabled={renameSaving}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleRenameSubmit}
              disabled={renameSaving || !newTagName.trim() || newTagName.trim() === editTag}
            >
              {renameSaving ? 'Сохранение…' : 'Переименовать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
