/**
 * Палитра тегов: серый + цвета радуги (красный → оранжевый → жёлтый → зелёный → синий → фиолетовый).
 */
export const TAG_COLOR_OPTIONS: { value: string; label: string; className: string }[] = [
  { value: 'gray', label: 'Серый', className: 'bg-slate-600 text-white border-0 dark:bg-slate-500' },
  { value: 'red', label: 'Красный', className: 'bg-red-600 text-white border-0 dark:bg-red-500' },
  { value: 'orange', label: 'Оранжевый', className: 'bg-orange-500 text-white border-0 dark:bg-orange-400' },
  { value: 'yellow', label: 'Жёлтый', className: 'bg-yellow-500 text-black border-0 dark:bg-yellow-400 dark:text-black' },
  { value: 'green', label: 'Зелёный', className: 'bg-green-600 text-white border-0 dark:bg-green-500' },
  { value: 'blue', label: 'Синий', className: 'bg-blue-600 text-white border-0 dark:bg-blue-500' },
  { value: 'violet', label: 'Фиолетовый', className: 'bg-violet-600 text-white border-0 dark:bg-violet-500' },
];

const COLOR_CLASS_MAP = Object.fromEntries(
  TAG_COLOR_OPTIONS.map((o) => [o.value, o.className])
);

const DEFAULT_TAG_CLASS = TAG_COLOR_OPTIONS[0].className;

export function getTagBadgeClassName(colorKey: string | undefined): string {
  if (!colorKey || !(colorKey in COLOR_CLASS_MAP)) {
    return `border-0 ${DEFAULT_TAG_CLASS}`;
  }
  return COLOR_CLASS_MAP[colorKey as keyof typeof COLOR_CLASS_MAP];
}
