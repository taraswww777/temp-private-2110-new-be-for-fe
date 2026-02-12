import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uiKit';
import { useProject } from '@/contexts/ProjectContext';
import { projectsApi } from '@/api/projects.api';
import { toast } from 'sonner';

export function ProjectSelector() {
  const { selectedProject, setSelectedProject } = useProject();
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsApi.getAllProjects();
        setProjects(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Не удалось загрузить проекты');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleChange = (value: string) => {
    if (value === '__none__') {
      setSelectedProject(null);
    } else {
      setSelectedProject(value);
    }
  };

  const selectedProjectName = selectedProject
    ? projects.find((p) => p.id === selectedProject)?.name || selectedProject
    : null;

  return (
    <Select
      value={selectedProject || '__none__'}
      onValueChange={handleChange}
      disabled={loading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={loading ? 'Загрузка...' : 'Все проекты'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">Все проекты</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
