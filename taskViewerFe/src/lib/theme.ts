/**
 * Управление темой: светлая / тёмная / по системе.
 * Класс `dark` выставляется на document.documentElement для Tailwind darkMode: "class".
 */

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'taskviewerfe-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyResolvedTheme(resolved: ResolvedTheme, el: HTMLElement = document.documentElement) {
  if (resolved === 'dark') {
    el.classList.add('dark');
  } else {
    el.classList.remove('dark');
  }
}

/**
 * Читает сохранённую тему из localStorage и применяет к документу.
 * Вызывать до первого рендера (например, в main.tsx), чтобы избежать мигания.
 */
export function initTheme(el: HTMLElement = document.documentElement) {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  const preference: ThemePreference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  const resolved = preference === 'system' ? getSystemTheme() : preference;
  applyResolvedTheme(resolved, el);
  return { preference, resolved };
}

/**
 * Применить выбранную тему (preference) к документу.
 */
export function applyTheme(preference: ThemePreference, el: HTMLElement = document.documentElement): ResolvedTheme {
  const resolved = preference === 'system' ? getSystemTheme() : preference;
  applyResolvedTheme(resolved, el);
  return resolved;
}

export function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

export function setStoredTheme(preference: ThemePreference) {
  localStorage.setItem(STORAGE_KEY, preference);
}

export function subscribeToSystemTheme(callback: (resolved: ResolvedTheme) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => callback(getSystemTheme());
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

export { getSystemTheme, applyResolvedTheme };
