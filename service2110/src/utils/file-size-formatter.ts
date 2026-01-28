/**
 * Утилиты для форматирования размеров файлов
 */

/**
 * Преобразует размер в байтах в человекочитаемый формат
 * @param bytes - размер в байтах
 * @param decimals - количество знаков после запятой (по умолчанию 2)
 * @returns отформатированная строка (например, "1.50 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Преобразует размер в байтах в человекочитаемый формат с фиксированной точностью
 * Например: 1536 байт -> "1.50 KB"
 * @param bytes - размер в байтах
 * @returns отформатированная строка
 */
export function formatBytesFixed(bytes: number): string {
  if (bytes === 0) return '0.00 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  
  return `${value.toFixed(2)} ${sizes[i]}`;
}

/**
 * Парсит строку с размером файла и возвращает значение в байтах
 * Например: "1.5 MB" -> 1572864
 * @param sizeStr - строка с размером (например, "1.5 MB")
 * @returns размер в байтах
 */
export function parseBytes(sizeStr: string): number {
  const units: Record<string, number> = {
    'B': 1,
    'BYTES': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
    'PB': 1024 * 1024 * 1024 * 1024 * 1024,
  };
  
  const match = sizeStr.trim().match(/^([\d.]+)\s*([A-Z]+)$/i);
  
  if (!match) {
    throw new Error(`Invalid size format: ${sizeStr}`);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  
  const multiplier = units[unit];
  
  if (!multiplier) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  
  return Math.floor(value * multiplier);
}
