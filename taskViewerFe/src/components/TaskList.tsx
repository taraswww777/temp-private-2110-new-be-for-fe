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
import type { Task, TaskStatus } from '@/types/task.types';
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
  column: 'id' | 'createdDate' | 'status';
  sortBy: 'id' | 'createdDate' | 'status';
  sortOrder: 'asc' | 'desc';
}) => {
  if (sortBy !== column) {
    return <span className="ml-2 text-muted-foreground">⇅</span>;
  }
  return <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
};

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'id' | 'createdDate' | 'status'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // По умолчанию в обратном порядке

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
    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
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
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, search, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateTaskMeta(taskId, { status: newStatus });
      onTaskUpdate();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
  };

  const handleColumnSort = (column: 'id' | 'createdDate' | 'status') => {
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

  return (
    <div>
      <TaskFilters
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th 
                className="h-12 px-4 text-left align-middle font-medium cursor-pointer select-none hover:bg-muted/30"
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
            {filteredAndSortedTasks.map((task) => (
              <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                <td 
                  className="p-4 align-middle font-mono cursor-pointer hover:bg-accent/50 select-none transition-colors"
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
                      <SelectItem value="in-progress">⏳ В работе</SelectItem>
                      <SelectItem value="completed">✅ Выполнено</SelectItem>
                      <SelectItem value="cancelled">❌ Отменено</SelectItem>
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
    </div>
  );
}
