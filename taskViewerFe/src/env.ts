/** Режим разработки (Vite dev server). В production — false. */
export const IS_DEV =
  typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
