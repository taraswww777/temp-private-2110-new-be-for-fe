/**
 * Предустановленные цвета тегов — контрастные, хорошо различимые (Tailwind-классы и подпись).
 */
export const TAG_COLOR_OPTIONS: { value: string; label: string; className: string }[] = [
  { value: 'gray', label: 'Серый', className: 'bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-gray-100 border-gray-400 dark:border-gray-500' },
  { value: 'red', label: 'Красный', className: 'bg-red-300 text-red-950 dark:bg-red-700 dark:text-red-100 border-red-500 dark:border-red-600' },
  { value: 'orange', label: 'Оранжевый', className: 'bg-orange-300 text-orange-950 dark:bg-orange-700 dark:text-orange-100 border-orange-500 dark:border-orange-600' },
  { value: 'amber', label: 'Янтарный', className: 'bg-amber-300 text-amber-950 dark:bg-amber-600 dark:text-amber-100 border-amber-500 dark:border-amber-600' },
  { value: 'yellow', label: 'Жёлтый', className: 'bg-yellow-300 text-yellow-950 dark:bg-yellow-600 dark:text-yellow-100 border-yellow-500 dark:border-yellow-600' },
  { value: 'lime', label: 'Лайм', className: 'bg-lime-300 text-lime-950 dark:bg-lime-600 dark:text-lime-100 border-lime-500 dark:border-lime-600' },
  { value: 'green', label: 'Зелёный', className: 'bg-green-300 text-green-950 dark:bg-green-700 dark:text-green-100 border-green-500 dark:border-green-600' },
  { value: 'emerald', label: 'Изумрудный', className: 'bg-emerald-400 text-emerald-950 dark:bg-emerald-600 dark:text-emerald-100 border-emerald-600 dark:border-emerald-500' },
  { value: 'teal', label: 'Бирюзовый', className: 'bg-teal-300 text-teal-950 dark:bg-teal-600 dark:text-teal-100 border-teal-500 dark:border-teal-500' },
  { value: 'cyan', label: 'Циан', className: 'bg-cyan-300 text-cyan-950 dark:bg-cyan-600 dark:text-cyan-100 border-cyan-500 dark:border-cyan-500' },
  { value: 'blue', label: 'Синий', className: 'bg-blue-300 text-blue-950 dark:bg-blue-700 dark:text-blue-100 border-blue-500 dark:border-blue-600' },
  { value: 'indigo', label: 'Индиго', className: 'bg-indigo-300 text-indigo-950 dark:bg-indigo-600 dark:text-indigo-100 border-indigo-500 dark:border-indigo-500' },
  { value: 'violet', label: 'Фиолетовый', className: 'bg-violet-300 text-violet-950 dark:bg-violet-600 dark:text-violet-100 border-violet-500 dark:border-violet-500' },
  { value: 'purple', label: 'Пурпурный', className: 'bg-purple-300 text-purple-950 dark:bg-purple-600 dark:text-purple-100 border-purple-500 dark:border-purple-500' },
  { value: 'fuchsia', label: 'Фуксия', className: 'bg-fuchsia-300 text-fuchsia-950 dark:bg-fuchsia-600 dark:text-fuchsia-100 border-fuchsia-500 dark:border-fuchsia-500' },
  { value: 'pink', label: 'Розовый', className: 'bg-pink-300 text-pink-950 dark:bg-pink-600 dark:text-pink-100 border-pink-500 dark:border-pink-500' },
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
