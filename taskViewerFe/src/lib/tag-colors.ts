/**
 * Палитра тегов без промежуточных оттенков: только 100/800/400 (светлая) и 600/100/500 (тёмная).
 */
export const TAG_COLOR_OPTIONS: { value: string; label: string; className: string }[] = [
  { value: 'gray', label: 'Серый', className: 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-100 border-slate-400 dark:border-slate-500' },
  { value: 'red', label: 'Красный', className: 'bg-rose-100 text-rose-800 dark:bg-rose-600 dark:text-rose-100 border-rose-400 dark:border-rose-500' },
  { value: 'orange', label: 'Оранжевый', className: 'bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-100 border-orange-400 dark:border-orange-500' },
  { value: 'amber', label: 'Янтарный', className: 'bg-amber-100 text-amber-800 dark:bg-amber-600 dark:text-amber-100 border-amber-400 dark:border-amber-500' },
  { value: 'yellow', label: 'Жёлтый', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100 border-yellow-400 dark:border-yellow-500' },
  { value: 'lime', label: 'Лайм', className: 'bg-lime-100 text-lime-800 dark:bg-lime-600 dark:text-lime-100 border-lime-400 dark:border-lime-500' },
  { value: 'green', label: 'Зелёный', className: 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-100 border-green-400 dark:border-green-500' },
  { value: 'emerald', label: 'Изумрудный', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-600 dark:text-emerald-100 border-emerald-400 dark:border-emerald-500' },
  { value: 'teal', label: 'Бирюзовый', className: 'bg-teal-100 text-teal-800 dark:bg-teal-600 dark:text-teal-100 border-teal-400 dark:border-teal-500' },
  { value: 'cyan', label: 'Циан', className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-600 dark:text-cyan-100 border-cyan-400 dark:border-cyan-500' },
  { value: 'blue', label: 'Синий', className: 'bg-sky-100 text-sky-800 dark:bg-sky-600 dark:text-sky-100 border-sky-400 dark:border-sky-500' },
  { value: 'indigo', label: 'Индиго', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-indigo-100 border-indigo-400 dark:border-indigo-500' },
  { value: 'violet', label: 'Фиолетовый', className: 'bg-violet-100 text-violet-800 dark:bg-violet-600 dark:text-violet-100 border-violet-400 dark:border-violet-500' },
  { value: 'purple', label: 'Пурпурный', className: 'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-purple-100 border-purple-400 dark:border-purple-500' },
  { value: 'fuchsia', label: 'Фуксия', className: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-600 dark:text-fuchsia-100 border-fuchsia-400 dark:border-fuchsia-500' },
  { value: 'pink', label: 'Розовый', className: 'bg-pink-100 text-pink-800 dark:bg-pink-600 dark:text-pink-100 border-pink-400 dark:border-pink-500' },
];

const COLOR_CLASS_MAP = Object.fromEntries(
  TAG_COLOR_OPTIONS.map((o) => [o.value, o.className])
);

/** Классы для тега по умолчанию (серый). */
const DEFAULT_TAG_CLASS = TAG_COLOR_OPTIONS[0].className;

export function getTagBadgeClassName(colorKey: string | undefined): string {
  if (!colorKey || !(colorKey in COLOR_CLASS_MAP)) {
    return `border ${DEFAULT_TAG_CLASS}`;
  }
  return `border ${COLOR_CLASS_MAP[colorKey as keyof typeof COLOR_CLASS_MAP]}`;
}
