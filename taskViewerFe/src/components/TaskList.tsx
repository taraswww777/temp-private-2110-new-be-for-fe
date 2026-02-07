import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/uiKit';
import { TaskFilters } from './TaskFilters';
import { YouTrackConnectDialog } from './YouTrackConnectDialog';
import { TagBadge } from '@/uiKit';
import { tasksApi } from '@/api/tasks.api';
import { youtrackApi, buildYouTrackIssueUrl } from '@/api/youtrack.api';
import type { Task, TaskStatus, TaskPriority } from '@/types/task.types';
import type { YouTrackQueueStatus } from '@/types/youtrack.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  onTaskChange?: (taskId: string, updates: Partial<Task>) => void;
}

const SortIcon = ({ 
  column, 
  sortBy, 
  sortOrder 
}: { 
  column: 'id' | 'createdDate' | 'status' | 'priority';
  sortBy: 'id' | 'createdDate' | 'status' | 'priority';
  sortOrder: 'asc' | 'desc';
}) => {
  if (sortBy !== column) {
    return <span className="ml-2 text-muted-foreground">⇅</span>;
  }
  return <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
};

const priorityOrder: Record<TaskPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Иконка глаза для ссылки «Просмотр задачи» */
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const defaultStatusFilter: TaskStatus[] = ['backlog', 'planned', 'in-progress', 'cancelled'];
const defaultPriorityFilter: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

function TaskListYouTrackCell({
  task,
  youtrackBaseUrl,
  getTaskQueueFlags,
  onOpenConnect,
}: {
  task: Task;
  youtrackBaseUrl: string | null;
  getTaskQueueFlags: (taskId: string) => { createIssue: boolean; linkIssue: boolean };
  onOpenConnect: () => void;
}) {
  const flags = getTaskQueueFlags(task.id);
  const inQueue = flags.createIssue || flags.linkIssue;
  const issueIds = task.youtrackIssueIds ?? [];

  if (inQueue) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-500 text-xs w-fit">
        <span aria-hidden>⏳</span> В очереди
      </Badge>
    );
  }

  if (issueIds.length > 0) {
    return (
      <span className="flex flex-wrap items-center gap-1.5 text-xs">
        {issueIds.map((id) => {
          const href = buildYouTrackIssueUrl(youtrackBaseUrl, id);
          return href ? (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              {id}
            </a>
          ) : (
            <span key={id} className="font-mono text-muted-foreground">{id}</span>
          );
        })}
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs w-fit"
      onClick={(e) => { e.preventDefault(); onOpenConnect(); }}
      title="Связать с YouTrack"
    >
      Связать с YT
    </Button>
  );
}

/** Теги, отсортированные по последнему использованию (по макс. createdDate задачи с этим тегом) */
function useTagsSortedByLastUsed(allTasks: Task[]): string[] {
  return useMemo(() => {
    const tagToLastUsed = new Map<string, string>();
    for (const t of allTasks) {
      const date = t.createdDate ?? '';
      for (const tag of t.tags ?? []) {
        if (!tagToLastUsed.has(tag) || date > tagToLastUsed.get(tag)!) {
          tagToLastUsed.set(tag, date);
        }
      }
    }
    return [...tagToLastUsed.entries()]
      .sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0))
      .map(([tag]) => tag);
  }, [allTasks]);
}

function TaskListTagsCell({
  task,
  allTasks,
  tagMetadata,
  onTaskUpdate,
  onTaskChange,
}: {
  task: Task;
  allTasks: Task[];
  tagMetadata: Record<string, { color?: string }>;
  onTaskUpdate: () => void;
  onTaskChange?: (taskId: string, updates: Partial<Task>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [dropdownFocusedIndex, setDropdownFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentTags = task.tags ?? [];
  const tagsByLastUsed = useTagsSortedByLastUsed(allTasks);

  const trimmedInput = newTagInput.trim();
  const canAddNew = trimmedInput.length > 0 && !currentTags.includes(trimmedInput);
  const filteredSuggestions = useMemo(() => {
    const excludeSelected = tagsByLastUsed.filter((tag) => !currentTags.includes(tag));
    if (!trimmedInput) return excludeSelected;
    const lower = trimmedInput.toLowerCase();
    return excludeSelected.filter((tag) => tag.toLowerCase().includes(lower));
  }, [tagsByLastUsed, trimmedInput, currentTags]);
  const exactMatch = trimmedInput && filteredSuggestions.some((t) => t.toLowerCase() === trimmedInput.toLowerCase());
  const showAddNew = canAddNew && !exactMatch;
  const options: Array<{ type: 'add'; label: string } | { type: 'tag'; tag: string }> = [
    ...(showAddNew ? [{ type: 'add' as const, label: trimmedInput }] : []),
    ...filteredSuggestions.map((tag) => ({ type: 'tag' as const, tag })),
  ];
  const optionCount = options.length;

  const addTag = async (tag: string) => {
    if (!tag || currentTags.includes(tag)) return;
    const nextTags = [...currentTags, tag];
    setSaving(true);
    try {
      await tasksApi.updateTaskMeta(task.id, { tags: nextTags });
      setNewTagInput('');
      setDropdownFocusedIndex(-1);
      if (onTaskChange) {
        onTaskChange(task.id, { tags: nextTags });
      } else {
        onTaskUpdate();
      }
      toast.success('Тег добавлен');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось добавить тег');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const tag = trimmedInput;
    if (!tag || currentTags.includes(tag)) {
      setNewTagInput('');
      return;
    }
    addTag(tag);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const next = currentTags.filter((t) => t !== tagToRemove);
    setSaving(true);
    try {
      await tasksApi.updateTaskMeta(task.id, { tags: next });
      if (onTaskChange) {
        onTaskChange(task.id, { tags: next });
      } else {
        onTaskUpdate();
      }
      toast.success('Тег удалён');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить тег');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (index < 0 || index >= optionCount) return;
    const opt = options[index];
    if (opt.type === 'add') {
      addTag(opt.label);
    } else {
      addTag(opt.tag);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (optionCount === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdownFocusedIndex((i) => (i < optionCount - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDropdownFocusedIndex((i) => (i <= 0 ? optionCount - 1 : i - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (dropdownFocusedIndex >= 0) {
        handleSelectOption(dropdownFocusedIndex);
      } else {
        handleAddTag();
      }
      return;
    }
    if (e.key === 'Escape') {
      setDropdownFocusedIndex(-1);
    }
  };

  const trigger = (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      className="w-full text-left p-1 -m-1 rounded hover:bg-muted/80 transition-colors min-h-[28px] flex flex-wrap items-center gap-1"
      title="Нажмите, чтобы изменить теги"
    >
      {currentTags.length > 0 ? (
        currentTags.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
            colorKey={tagMetadata[tag]?.color}
            className="text-xs"
          />
        ))
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      )}
      <span className="text-muted-foreground/60 text-xs ml-0.5" aria-hidden>✎</span>
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">Теги задачи {task.id}</div>
          <div className="flex flex-wrap gap-1.5">
            {currentTags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                colorKey={tagMetadata[tag]?.color}
                onRemove={() => handleRemoveTag(tag)}
                disabled={saving}
                className="text-xs"
              />
            ))}
          </div>
          <div className="relative flex gap-2">
            <div className="flex-1 min-w-0 relative">
              <Input
                ref={inputRef}
                placeholder="Введите или выберите тег..."
                value={newTagInput}
                onChange={(e) => {
                  setNewTagInput(e.target.value);
                  setDropdownFocusedIndex(-1);
                }}
                onFocus={() => setDropdownFocusedIndex(-1)}
                onKeyDown={handleInputKeyDown}
                disabled={saving}
                className="h-8 text-sm pr-2"
              />
              {(newTagInput !== '' || filteredSuggestions.length > 0) && (
                <div
                  className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
                  role="listbox"
                >
                  {optionCount === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Нет подходящих тегов. Введите название и нажмите Enter или «Добавить».
                    </div>
                  ) : (
                    options.map((opt, index) => {
                      const isAdd = opt.type === 'add';
                      const isSelected = index === dropdownFocusedIndex;
                      return (
                        <button
                          key={isAdd ? `add-${opt.label}` : opt.tag}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                            isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/80'
                          } ${isAdd ? 'text-primary font-medium' : ''}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectOption(index)}
                          onMouseEnter={() => setDropdownFocusedIndex(index)}
                        >
                          {isAdd ? (
                            <>+ Добавить «{opt.label}»</>
                          ) : (
                            <TagBadge
                              tag={opt.tag}
                              colorKey={tagMetadata[opt.tag]?.color}
                              className="text-xs"
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleAddTag();
              }}
              disabled={!trimmedInput || currentTags.includes(trimmedInput) || saving}
            >
              Добавить
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TaskList({ tasks, onTaskUpdate, onTaskChange }: TaskListProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUpdatingFromUrl = useRef(false);

  // Чтение параметров из URL
  const getSearchFromUrl = () => searchParams.get('search') || '';
  const getStatusFilterFromUrl = (): TaskStatus[] => {
    const statusParam = searchParams.get('status');
    if (!statusParam) return defaultStatusFilter;
    return statusParam.split(',').filter((s): s is TaskStatus => 
      ['backlog', 'planned', 'in-progress', 'completed', 'cancelled'].includes(s)
    );
  };
  const getPriorityFilterFromUrl = (): TaskPriority[] => {
    const priorityParam = searchParams.get('priority');
    if (!priorityParam) return defaultPriorityFilter;
    return priorityParam.split(',').filter((p): p is TaskPriority => 
      ['critical', 'high', 'medium', 'low'].includes(p)
    );
  };
  const getPageFromUrl = () => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  };
  const getPageSizeFromUrl = () => {
    const size = searchParams.get('pageSize');
    return size ? parseInt(size, 10) : 10;
  };
  const getSortByFromUrl = (): 'id' | 'createdDate' | 'status' | 'priority' => {
    const sort = searchParams.get('sortBy');
    if (sort && ['id', 'createdDate', 'status', 'priority'].includes(sort)) {
      return sort as 'id' | 'createdDate' | 'status' | 'priority';
    }
    return 'id';
  };
  const getSortOrderFromUrl = (): 'asc' | 'desc' => {
    const order = searchParams.get('sortOrder');
    return order === 'asc' ? 'asc' : 'desc';
  };

  const [search, setSearch] = useState(getSearchFromUrl);
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(getStatusFilterFromUrl);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>(getPriorityFilterFromUrl);
  const [sortBy, setSortBy] = useState<'id' | 'createdDate' | 'status' | 'priority'>(getSortByFromUrl);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(getSortOrderFromUrl);
  const [currentPage, setCurrentPage] = useState(getPageFromUrl);
  const [pageSize, setPageSize] = useState(getPageSizeFromUrl);
  const [queueStatus, setQueueStatus] = useState<YouTrackQueueStatus | null>(null);
  const [youtrackBaseUrl, setYoutrackBaseUrl] = useState<string | null>(null);
  const [connectDialogTaskId, setConnectDialogTaskId] = useState<string | null>(null);
  const [tagMetadata, setTagMetadata] = useState<Record<string, { color?: string }>>({});

  useEffect(() => {
    youtrackApi.getConfig().then((c) => setYoutrackBaseUrl(c.baseUrl)).catch(() => setYoutrackBaseUrl(null));
  }, []);
  useEffect(() => {
    tasksApi.getTagsMetadata().then((d) => setTagMetadata(d.tags)).catch(() => setTagMetadata({}));
  }, []);
  useEffect(() => {
    youtrackApi.getQueueStatus().then(setQueueStatus).catch(() => setQueueStatus(null));
  }, [connectDialogTaskId]);

  // Синхронизация с URL при изменении параметров
  const updateUrlParams = (
    updates: {
      search?: string;
      status?: TaskStatus[];
      priority?: TaskPriority[];
      page?: number;
      pageSize?: number;
      sortBy?: 'id' | 'createdDate' | 'status' | 'priority';
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.search !== undefined) {
      if (updates.search) {
        newParams.set('search', updates.search);
      } else {
        newParams.delete('search');
      }
    }

    if (updates.status !== undefined) {
      if (updates.status.length > 0 && JSON.stringify(updates.status.sort()) !== JSON.stringify(defaultStatusFilter.sort())) {
        newParams.set('status', updates.status.join(','));
      } else {
        newParams.delete('status');
      }
    }

    if (updates.priority !== undefined) {
      if (updates.priority.length > 0 && JSON.stringify(updates.priority.sort()) !== JSON.stringify(defaultPriorityFilter.sort())) {
        newParams.set('priority', updates.priority.join(','));
      } else {
        newParams.delete('priority');
      }
    }

    if (updates.page !== undefined) {
      if (updates.page > 1) {
        newParams.set('page', updates.page.toString());
      } else {
        newParams.delete('page');
      }
    }

    if (updates.pageSize !== undefined) {
      if (updates.pageSize !== 10) {
        newParams.set('pageSize', updates.pageSize.toString());
      } else {
        newParams.delete('pageSize');
      }
    }

    if (updates.sortBy !== undefined) {
      if (updates.sortBy !== 'id') {
        newParams.set('sortBy', updates.sortBy);
      } else {
        newParams.delete('sortBy');
      }
    }

    if (updates.sortOrder !== undefined) {
      if (updates.sortOrder !== 'desc') {
        newParams.set('sortOrder', updates.sortOrder);
      } else {
        newParams.delete('sortOrder');
      }
    }

    isUpdatingFromUrl.current = true;
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  // Инициализация из URL при первой загрузке и при изменении URL (например, кнопка "Назад")
  useEffect(() => {
    if (isUpdatingFromUrl.current) {
      isUpdatingFromUrl.current = false;
      return;
    }

    const urlSearch = getSearchFromUrl();
    const urlStatus = getStatusFilterFromUrl();
    const urlPriority = getPriorityFilterFromUrl();
    const urlPage = getPageFromUrl();
    const urlPageSize = getPageSizeFromUrl();
    const urlSortBy = getSortByFromUrl();
    const urlSortOrder = getSortOrderFromUrl();

    // Обновляем состояние только если значения изменились
    if (urlSearch !== search) setSearch(urlSearch);
    if (JSON.stringify(urlStatus.sort()) !== JSON.stringify(statusFilter.sort())) setStatusFilter(urlStatus);
    if (JSON.stringify(urlPriority.sort()) !== JSON.stringify(priorityFilter.sort())) setPriorityFilter(urlPriority);
    if (urlPage !== currentPage) setCurrentPage(urlPage);
    if (urlPageSize !== pageSize) setPageSize(urlPageSize);
    if (urlSortBy !== sortBy) setSortBy(urlSortBy);
    if (urlSortOrder !== sortOrder) setSortOrder(urlSortOrder);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Фильтрация по поиску
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (task) =>
          task.id.toLowerCase().includes(searchLower) ||
          task.title.toLowerCase().includes(searchLower)
      );
    }

    // Фильтрация по статусу
    if (statusFilter.length > 0) {
      result = result.filter((task) => statusFilter.includes(task.status));
    }

    // Фильтрация по приоритету
    if (priorityFilter.length > 0) {
      result = result.filter((task) => priorityFilter.includes(task.priority));
    }

    // Сортировка
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'id': {
          comparison = a.id.localeCompare(b.id);
          break;
        }
        case 'createdDate': {
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        }
        case 'status': {
          comparison = a.status.localeCompare(b.status);
          break;
        }
        case 'priority': {
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedTasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredAndSortedTasks.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении фильтров
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Синхронизация состояния с URL (объединено в один useEffect для оптимизации)
  useEffect(() => {
    // Проверяем, нужно ли обновлять URL
    const urlSearch = getSearchFromUrl();
    const urlStatus = getStatusFilterFromUrl();
    const urlPriority = getPriorityFilterFromUrl();
    const urlPage = getPageFromUrl();
    const urlPageSize = getPageSizeFromUrl();
    const urlSortBy = getSortByFromUrl();
    const urlSortOrder = getSortOrderFromUrl();

    // Обновляем URL только если состояние отличается от URL
    const needsUpdate = 
      search !== urlSearch ||
      JSON.stringify(statusFilter.sort()) !== JSON.stringify(urlStatus.sort()) ||
      JSON.stringify(priorityFilter.sort()) !== JSON.stringify(urlPriority.sort()) ||
      currentPage !== urlPage ||
      pageSize !== urlPageSize ||
      sortBy !== urlSortBy ||
      sortOrder !== urlSortOrder;

    if (needsUpdate) {
      updateUrlParams({
        search,
        status: statusFilter,
        priority: priorityFilter,
        page: currentPage,
        pageSize,
        sortBy,
        sortOrder,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, priorityFilter, currentPage, pageSize, sortBy, sortOrder]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateTaskMeta(taskId, { status: newStatus });
      // Обновляем локальное состояние задачи без запроса к API
      if (onTaskChange) {
        onTaskChange(taskId, { status: newStatus });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить статус';
      toast.error(message);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      await tasksApi.updateTaskMeta(taskId, { priority: newPriority });
      // Обновляем локальное состояние задачи без запроса к API
      if (onTaskChange) {
        onTaskChange(taskId, { priority: newPriority });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить приоритет';
      toast.error(message);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
  };

  const handleColumnSort = (column: 'id' | 'createdDate' | 'status' | 'priority') => {
    if (sortBy === column) {
      // Переключаем направление сортировки
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Новая колонка - начинаем с ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCopyId = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(id);
      toast.success(`ID "${id}" скопирован в буфер обмена`);
    } catch (err) {
      console.error('Failed to copy ID:', err);
      toast.error('Не удалось скопировать ID');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getTaskQueueFlags = (taskId: string) => {
    if (!queueStatus?.operations) return { createIssue: false, linkIssue: false };
    const pending = queueStatus.operations.filter(
      (op) => op.status === 'pending' && op.data?.taskId === taskId
    );
    return {
      createIssue: pending.some((op) => op.type === 'create_issue'),
      linkIssue: pending.some((op) => op.type === 'link_issue'),
    };
  };

  const handleYouTrackSuccess = () => {
    onTaskUpdate();
    youtrackApi.getQueueStatus().then(setQueueStatus).catch(() => setQueueStatus(null));
  };

  return (
    <div>
      <TaskFilters
        search={search}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onSearchChange={(value) => {
          setSearch(value);
          handleFilterChange();
        }}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          handleFilterChange();
        }}
        onPriorityFilterChange={(value) => {
          setPriorityFilter(value);
          handleFilterChange();
        }}
      />

      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-2 text-left align-middle font-medium w-10" aria-label="Просмотр" />
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30 w-24"
                onClick={() => handleColumnSort('id')}
              >
                <div className="flex items-center">
                  ID
                  <SortIcon column="id" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">Название</th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30"
                onClick={() => handleColumnSort('status')}
              >
                <div className="flex items-center">
                  Статус
                  <SortIcon column="status" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30"
                onClick={() => handleColumnSort('priority')}
              >
                <div className="flex items-center">
                  Приоритет
                  <SortIcon column="priority" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30"
                onClick={() => handleColumnSort('createdDate')}
              >
                <div className="flex items-center">
                  Дата создания
                  <SortIcon column="createdDate" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">Теги</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Ветка</th>
              <th className="h-12 px-4 text-left align-middle font-medium">YouTrack</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {paginatedTasks.map((task) => (
              <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-2 align-middle w-10">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    title="Просмотр задачи"
                    aria-label={`Просмотр задачи ${task.id}`}
                  >
                    <EyeIcon />
                  </Link>
                </td>
                <td 
                  className="p-4 align-middle font-mono cursor-pointer hover:bg-accent/50 select-none transition-colors w-24"
                  onClick={(e) => handleCopyId(task.id, e)}
                  title="Нажмите, чтобы скопировать ID"
                >
                  {task.id}
                </td>
                <td className="p-4 align-middle">{task.title}</td>
                <td className="p-4 align-middle">
                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                  >
<SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">📋 Бэклог</SelectItem>
                      <SelectItem value="planned">📅 Запланировано</SelectItem>
                      <SelectItem value="in-progress">⏳ В работе</SelectItem>
                      <SelectItem value="completed">✅ Выполнено</SelectItem>
                      <SelectItem value="cancelled">❌ Отменено</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 align-middle">
                  <Select
                    value={task.priority}
                    onValueChange={(value) => handlePriorityChange(task.id, value as TaskPriority)}
                    disabled={task.status === 'completed'}
                  >
<SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">🔴 Критический</SelectItem>
                      <SelectItem value="high">🟠 Высокий</SelectItem>
                      <SelectItem value="medium">🔵 Средний</SelectItem>
                      <SelectItem value="low">⚪ Низкий</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4 align-middle">{formatDate(task.createdDate)}</td>
                <td className="p-4 align-middle">
                  <TaskListTagsCell
                    task={task}
                    allTasks={tasks}
                    tagMetadata={tagMetadata}
                    onTaskUpdate={onTaskUpdate}
                    onTaskChange={onTaskChange}
                  />
                </td>
                <td className="p-4 align-middle font-mono text-sm">{task.branch || '—'}</td>
                <td className="p-4 align-middle">
                  <TaskListYouTrackCell
                    task={task}
                    youtrackBaseUrl={youtrackBaseUrl}
                    getTaskQueueFlags={getTaskQueueFlags}
                    onOpenConnect={() => setConnectDialogTaskId(task.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Задачи не найдены
        </div>
      )}

      {filteredAndSortedTasks.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Показано {startIndex + 1}–{Math.min(endIndex, filteredAndSortedTasks.length)} из {filteredAndSortedTasks.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">На странице:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              ««
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              »»
            </Button>
          </div>
        </div>
      )}

      {connectDialogTaskId && (
        <YouTrackConnectDialog
          open={!!connectDialogTaskId}
          onOpenChange={(open) => !open && setConnectDialogTaskId(null)}
          taskId={connectDialogTaskId}
          existingIssueIds={tasks.find((t) => t.id === connectDialogTaskId)?.youtrackIssueIds ?? []}
          taskPreview={(() => {
            const t = tasks.find((x) => x.id === connectDialogTaskId);
            return t
              ? { title: t.title, content: '', status: t.status, branch: t.branch ?? null }
              : undefined;
          })()}
          onSuccess={() => {
            setConnectDialogTaskId(null);
            handleYouTrackSuccess();
          }}
          initialTab="create"
        />
      )}
    </div>
  );
}
