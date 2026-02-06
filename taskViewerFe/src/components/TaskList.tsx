import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TaskFilters } from './TaskFilters';
import { tasksApi } from '@/api/tasks.api';
import type { Task, TaskStatus, TaskPriority } from '@/types/task.types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
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

const defaultStatusFilter: TaskStatus[] = ['backlog', 'planned', 'in-progress', 'cancelled'];
const defaultPriorityFilter: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>(defaultStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority[]>(defaultPriorityFilter);
  const [sortBy, setSortBy] = useState<'id' | 'createdDate' | 'status' | 'priority'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // По умолчанию в обратном порядке
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateTaskMeta(taskId, { status: newStatus });
      onTaskUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось обновить статус';
      toast.error(message);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      await tasksApi.updateTaskMeta(taskId, { priority: newPriority });
      onTaskUpdate();
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
              <th className="h-12 px-4 text-left align-middle font-medium">Ветка</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {paginatedTasks.map((task) => (
              <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
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
                    <SelectTrigger className="w-[160px]">
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
                    <SelectTrigger className="w-[160px]">
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
                <td className="p-4 align-middle font-mono text-sm">{task.branch || '—'}</td>
                <td className="p-4 align-middle">
                  <Link to={`/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      Просмотр
                    </Button>
                  </Link>
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
                    variant={currentPage === pageNum ? 'default' : 'outline'}
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
    </div>
  );
}
