import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/uiKit';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemePreference } from '@/lib/theme';

const labels: Record<ThemePreference, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Как в системе',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(v) => setTheme(v as ThemePreference)}>
      <SelectTrigger className="w-[160px] h-8 text-sm" aria-label="Выбор темы">
        <SelectValue placeholder="Тема" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">{labels.light}</SelectItem>
        <SelectItem value="dark">{labels.dark}</SelectItem>
        <SelectItem value="system">{labels.system}</SelectItem>
      </SelectContent>
    </Select>
  );
}
