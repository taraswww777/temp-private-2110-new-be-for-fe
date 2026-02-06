import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type ThemePreference,
  type ResolvedTheme,
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  subscribeToSystemTheme,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const resolved = theme === 'system' ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    return resolved;
  });

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    setStoredTheme(next);
    const resolved = applyTheme(next);
    setResolvedTheme(resolved);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const unsubscribe = subscribeToSystemTheme((resolved) => {
      setResolvedTheme(resolved);
      applyTheme('system');
    });
    return unsubscribe;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
