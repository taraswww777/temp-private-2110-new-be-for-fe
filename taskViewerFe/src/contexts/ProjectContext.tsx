import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ProjectContextValue {
  selectedProject: string | null;
  setSelectedProject: (project: string | null) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const STORAGE_KEY = 'task-viewer-selected-project';
const URL_PARAM_KEY = 'project';

function getStoredProject(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || null;
  } catch {
    return null;
  }
}

function setStoredProject(project: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (project) {
      localStorage.setItem(STORAGE_KEY, project);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isUpdatingFromUrl = useRef(false);
  
  // Чтение проекта из URL при инициализации
  const getProjectFromUrl = (): string | null => {
    const projectParam = searchParams.get(URL_PARAM_KEY);
    if (!projectParam) return null;
    // Если параметр есть, но это пустая строка или специальное значение, возвращаем как есть
    return projectParam;
  };

  const [selectedProject, setSelectedProjectState] = useState<string | null>(() => {
    // Сначала проверяем URL, потом localStorage
    const urlProject = getProjectFromUrl();
    if (urlProject !== null) return urlProject;
    return getStoredProject();
  });

  // Обновление URL при изменении проекта
  const updateUrl = useCallback((project: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (project && project !== '__none__' && project !== null) {
      newParams.set(URL_PARAM_KEY, project);
    } else {
      newParams.delete(URL_PARAM_KEY);
    }

    isUpdatingFromUrl.current = true;
    const newUrl = newParams.toString() ? `?${newParams.toString()}` : window.location.pathname;
    navigate(newUrl, { replace: true });
  }, [searchParams, navigate]);

  const setSelectedProject = useCallback((project: string | null) => {
    setSelectedProjectState(project);
    setStoredProject(project);
    updateUrl(project);
  }, [updateUrl]);

  // Синхронизация с URL при изменении параметров (например, кнопка "Назад")
  useEffect(() => {
    if (isUpdatingFromUrl.current) {
      isUpdatingFromUrl.current = false;
      return;
    }

    const urlProject = getProjectFromUrl();
    if (urlProject !== selectedProject) {
      setSelectedProjectState(urlProject);
      if (urlProject) {
        setStoredProject(urlProject);
      } else {
        // Если в URL нет проекта, но он был в localStorage, оставляем localStorage
        // Это позволяет сохранить выбор пользователя при переходе на другие страницы
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const value = useMemo<ProjectContextValue>(
    () => ({ selectedProject, setSelectedProject }),
    [selectedProject, setSelectedProject]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook, not a component
export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return ctx;
}
