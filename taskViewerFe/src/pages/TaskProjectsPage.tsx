import { useState, useEffect, useMemo } from 'react';
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
  Skeleton,
} from '@/uiKit';
import { tasksApi } from '@/api/tasks.api';
import { projectsApi, type Project } from '@/api/projects.api';
import { PageHeader } from '@/components/PageHeader';
import type { Task } from '@/types/task.types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

/** Собирает по всем задачам: проект -> { count, taskIds } */
function aggregateProjectsByTask(tasks: Task[]): Map<string | null, { count: number; taskIds: string[] }> {
  const map = new Map<string | null, { count: number; taskIds: string[] }>();
  for (const task of tasks) {
    const project = task.project ?? null;
    const entry = map.get(project);
    if (entry) {
      entry.count += 1;
      entry.taskIds.push(task.id);
    } else {
      map.set(project, { count: 1, taskIds: [task.id] });
    }
  }
  return map;
}

export function TaskProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [createProjectName, setCreateProjectName] = useState('');
  const [createSaving, setCreateSaving] = useState(false);

  const taskStatsByProject = useMemo(() => aggregateProjectsByTask(tasks), [tasks]);

  /** Все проекты из источника истины + статистика по задачам (в т.ч. проекты с 0 задач) */
  const projectsWithStats = useMemo(() => {
    const map = taskStatsByProject;
    const list: Array<{
      project: string | null;
      projectId: string | null;
      count: number;
      taskIds: string[];
    }> = projects.map((p) => ({
      project: p.name,
      projectId: p.id,
      count: map.get(p.name)?.count ?? 0,
      taskIds: map.get(p.name)?.taskIds ?? [],
    }));
    // Добавляем "Без проекта" если есть задачи без проекта
    const noProject = map.get(null);
    if (noProject && noProject.count > 0) {
      list.push({
        project: null as string | null,
        projectId: null as string | null,
        count: noProject.count,
        taskIds: noProject.taskIds,
      });
    }
    return list.sort((a, b) => b.count - a.count || (a.project || '').localeCompare(b.project || ''));
  }, [projects, taskStatsByProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        tasksApi.getAllTasks(),
        projectsApi.getAllProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
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

  const handleOpenRename = (projectId: string, currentName: string) => {
    setEditProject(projectId);
    setNewProjectName(currentName);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!editProject || !newProjectName.trim()) return;
    const trimmed = newProjectName.trim();
    setRenameSaving(true);
    try {
      await projectsApi.renameProject(editProject, trimmed);
      toast.success(`Проект переименован в «${trimmed}»`);
      setRenameDialogOpen(false);
      setEditProject(null);
      setNewProjectName('');
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось переименовать проект';
      toast.error(message);
    } finally {
      setRenameSaving(false);
    }
  };

  const handleOpenDelete = (projectId: string, _projectName: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!projectToDelete) return;
    const id = projectToDelete;
    setDeleteSaving(true);
    try {
      const { updated } = await projectsApi.removeProject(id);
      toast.success(`Проект удалён из ${updated} ${updated === 1 ? 'задачи' : 'задач'}`);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          project: task.project === projects.find((p) => p.id === id)?.name ? null : task.project,
        }))
      );
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить проект';
      toast.error(message);
    } finally {
      setDeleteSaving(false);
    }
  };

  const handleCreateProject = async () => {
    const name = createProjectName.trim();
    if (!name) {
      toast.error('Введите имя проекта');
      return;
    }
    setCreateSaving(true);
    try {
      const created = await projectsApi.createProject(name);
      toast.success(`Проект «${name}» создан`);
      setCreateProjectName('');
      setProjects((prev) =>
        prev.some((p) => p.id === created.id) ? prev : [...prev, created]
      );
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось создать проект';
      toast.error(message);
    } finally {
      setCreateSaving(false);
    }
  };

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
        title="Управление проектами"
        subtitle="Все проекты из задач. Редактирование названия, удаление проектов."
      />

      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
        <span>Всего проектов: {projects.length}</span>
        <span className="text-border">|</span>
        <span>Задач без проекта: {taskStatsByProject.get(null)?.count ?? 0}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Создать проект</CardTitle>
          <CardDescription>
            Новый проект будет добавлен в источник истины. Его можно будет назначить задачам в таблице или на детальной странице.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 min-w-[200px]">
            <Label htmlFor="create-project-name">Имя проекта</Label>
            <Input
              id="create-project-name"
              value={createProjectName}
              onChange={(e) => setCreateProjectName(e.target.value)}
              placeholder="Например: 2110"
              disabled={createSaving}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
            />
          </div>
          <Button
            onClick={handleCreateProject}
            disabled={createSaving || !createProjectName.trim()}
            variant="primary"
          >
            {createSaving ? 'Создание...' : 'Создать проект'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список проектов</CardTitle>
          <CardDescription>
            Все проекты с количеством задач. Нажмите на проект, чтобы увидеть связанные задачи.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {projectsWithStats.length === 0 ? (
              <p className="text-muted-foreground text-sm">Нет проектов</p>
            ) : (
              projectsWithStats.map((item) => {
                if (item.projectId === null) {
                  return (
                    <div
                      key="__no_project__"
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">Без проекта</div>
                        <div className="text-sm text-muted-foreground">
                          {item.count} {item.count === 1 ? 'задача' : 'задач'}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={item.projectId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.project}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} {item.count === 1 ? 'задача' : 'задач'}
                        {item.taskIds.length > 0 && (
                          <span className="ml-2">
                            (
                            {item.taskIds.slice(0, 3).map((id, idx) => (
                              <span key={id}>
                                <Link
                                  to={`/tasks/${id}`}
                                  className="text-primary hover:underline"
                                >
                                  {id}
                                </Link>
                                {idx < Math.min(item.taskIds.length, 3) - 1 && ', '}
                              </span>
                            ))}
                            {item.taskIds.length > 3 && '...'}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRename(item.projectId!, item.project!)}
                      >
                        Переименовать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDelete(item.projectId!, item.project!)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Диалог переименования */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименовать проект</DialogTitle>
            <DialogDescription>
              Изменение имени проекта не повлияет на задачи — в них хранятся ID проектов.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-project-name">Новое имя проекта</Label>
              <Input
                id="rename-project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Введите новое имя"
                disabled={renameSaving}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRenameDialogOpen(false);
                setEditProject(null);
                setNewProjectName('');
              }}
              disabled={renameSaving}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleRenameSubmit}
              disabled={renameSaving || !newProjectName.trim()}
            >
              {renameSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить проект?</DialogTitle>
            <DialogDescription>
              Проект будет удалён из всех задач. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={deleteSaving}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={deleteSaving}
            >
              {deleteSaving ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
