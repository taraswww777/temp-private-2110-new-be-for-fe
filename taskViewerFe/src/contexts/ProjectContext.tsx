import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ProjectContextValue {
  selectedProject: string | null;
  setSelectedProject: (project: string | null) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

const STORAGE_KEY = 'task-viewer-selected-project';

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
  const [selectedProject, setSelectedProjectState] = useState<string | null>(() => getStoredProject());

  const setSelectedProject = useCallback((project: string | null) => {
    setSelectedProjectState(project);
    setStoredProject(project);
  }, []);

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
