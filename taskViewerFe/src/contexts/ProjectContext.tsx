import {
  createContext,
  useCallback,
  useContext,
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
/** Старый способ — в query; один раз переносим в localStorage и чистим URL */
const LEGACY_URL_PARAM = 'project';

function getStoredProject(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || null;
  } catch {
    return null;
  }
}

function getProjectFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(LEGACY_URL_PARAM);
    return raw && raw !== '__none__' ? raw : null;
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

function cleanupUrl() {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(LEGACY_URL_PARAM)) return;

    params.delete(LEGACY_URL_PARAM);
    const qs = params.toString();
    const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', newUrl);
  } catch {
    // Ignore errors
  }
}

function getInitialProject(): string | null {
  const urlProject = getProjectFromUrl();
  if (urlProject) {
    // Если есть проект в URL, сохраняем его в localStorage и чистим URL
    setStoredProject(urlProject);
    cleanupUrl();
    return urlProject;
  }
  return getStoredProject();
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<string | null>(getInitialProject);

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
