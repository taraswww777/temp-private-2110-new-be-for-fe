/**
 * Unit тесты для утилит форматирования размеров файлов
 */
import { describe, it, expect } from 'vitest';
import { formatBytes, formatBytesFixed, parseBytes } from '../file-size-formatter';

describe('file-size-formatter', () => {
  describe('formatBytes', () => {
    it('должен форматировать 0 байт', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('должен форматировать байты', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
      expect(formatBytes(1023)).toBe('1023 Bytes');
    });

    it('должен форматировать килобайты', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('должен форматировать мегабайты', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(10485760)).toBe('10 MB');
      expect(formatBytes(1572864)).toBe('1.5 MB');
    });

    it('должен форматировать гигабайты', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(1610612736)).toBe('1.5 GB');
    });

    it('должен форматировать терабайты', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB');
      expect(formatBytes(1649267441664)).toBe('1.5 TB');
    });

    it('должен форматировать петабайты', () => {
      expect(formatBytes(1125899906842624)).toBe('1 PB');
    });

    it('должен использовать указанное количество десятичных знаков', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 3)).toBe('1.5 KB');
    });

    it('должен обрабатывать очень большие числа', () => {
      // eslint-disable-next-line no-loss-of-precision
      const largeNumber = 9223372036854775807; // Max bigint value
      const result = formatBytes(largeNumber);
      expect(result).toContain('PB');
    });

    it('должен обрабатывать отрицательные decimals', () => {
      expect(formatBytes(1536, -1)).toBe('2 KB');
    });
  });

  describe('formatBytesFixed', () => {
    it('должен форматировать 0 байт с фиксированной точностью', () => {
      expect(formatBytesFixed(0)).toBe('0.00 Bytes');
    });

    it('должен форматировать байты с фиксированной точностью', () => {
      expect(formatBytesFixed(500)).toBe('500.00 Bytes');
      expect(formatBytesFixed(1023)).toBe('1023.00 Bytes');
    });

    it('должен форматировать килобайты с фиксированной точностью', () => {
      expect(formatBytesFixed(1024)).toBe('1.00 KB');
      expect(formatBytesFixed(1536)).toBe('1.50 KB');
      expect(formatBytesFixed(2048)).toBe('2.00 KB');
    });

    it('должен форматировать мегабайты с фиксированной точностью', () => {
      expect(formatBytesFixed(1048576)).toBe('1.00 MB');
      expect(formatBytesFixed(10485760)).toBe('10.00 MB');
      expect(formatBytesFixed(1572864)).toBe('1.50 MB');
    });

    it('должен форматировать гигабайты с фиксированной точностью', () => {
      expect(formatBytesFixed(1073741824)).toBe('1.00 GB');
      expect(formatBytesFixed(1610612736)).toBe('1.50 GB');
    });

    it('должен форматировать терабайты с фиксированной точностью', () => {
      expect(formatBytesFixed(1099511627776)).toBe('1.00 TB');
      expect(formatBytesFixed(1649267441664)).toBe('1.50 TB');
    });

    it('должен форматировать петабайты с фиксированной точностью', () => {
      expect(formatBytesFixed(1125899906842624)).toBe('1.00 PB');
    });

    it('должен всегда использовать 2 десятичных знака', () => {
      expect(formatBytesFixed(1024)).toBe('1.00 KB');
      expect(formatBytesFixed(1536)).toBe('1.50 KB');
      expect(formatBytesFixed(1638)).toBe('1.60 KB');
    });
  });

  describe('parseBytes', () => {
    it('должен парсить байты', () => {
      expect(parseBytes('500 B')).toBe(500);
      expect(parseBytes('1023 Bytes')).toBe(1023);
      expect(parseBytes('500 BYTES')).toBe(500);
    });

    it('должен парсить килобайты', () => {
      expect(parseBytes('1 KB')).toBe(1024);
      expect(parseBytes('1.5 KB')).toBe(1536);
      expect(parseBytes('2 KB')).toBe(2048);
    });

    it('должен парсить мегабайты', () => {
      expect(parseBytes('1 MB')).toBe(1048576);
      expect(parseBytes('10 MB')).toBe(10485760);
      expect(parseBytes('1.5 MB')).toBe(1572864);
    });

    it('должен парсить гигабайты', () => {
      expect(parseBytes('1 GB')).toBe(1073741824);
      expect(parseBytes('1.5 GB')).toBe(1610612736);
    });

    it('должен парсить терабайты', () => {
      expect(parseBytes('1 TB')).toBe(1099511627776);
      expect(parseBytes('1.5 TB')).toBe(1649267441664);
    });

    it('должен парсить петабайты', () => {
      expect(parseBytes('1 PB')).toBe(1125899906842624);
    });

    it('должен игнорировать регистр единиц измерения', () => {
      expect(parseBytes('1 kb')).toBe(1024);
      expect(parseBytes('1 Kb')).toBe(1024);
      expect(parseBytes('1 KB')).toBe(1024);
      expect(parseBytes('1 mb')).toBe(1048576);
    });

    it('должен игнорировать пробелы', () => {
      expect(parseBytes('1MB')).toBe(1048576);
      expect(parseBytes('1 MB')).toBe(1048576);
      expect(parseBytes('  1  MB  ')).toBe(1048576);
    });

    it('должен обрабатывать дробные значения', () => {
      expect(parseBytes('1.5 MB')).toBe(1572864);
      expect(parseBytes('0.5 GB')).toBe(536870912);
      expect(parseBytes('2.75 KB')).toBe(2816);
    });

    it('должен округлять до целого числа', () => {
      // 1.333 в float даёт погрешность при умножении на 1024²
      expect(parseBytes('1.333 MB')).toBe(1397752);
      expect(parseBytes('1.999 KB')).toBe(2047);
    });

    it('должен выбрасывать ошибку для неверного формата', () => {
      expect(() => parseBytes('invalid')).toThrow('Invalid size format');
      expect(() => parseBytes('1.5')).toThrow('Invalid size format');
      expect(() => parseBytes('MB')).toThrow('Invalid size format');
      expect(() => parseBytes('')).toThrow('Invalid size format');
    });

    it('должен выбрасывать ошибку для неизвестной единицы измерения', () => {
      expect(() => parseBytes('1 ZB')).toThrow('Unknown unit: ZB');
      expect(() => parseBytes('1 YB')).toThrow('Unknown unit: YB');
      expect(() => parseBytes('1 XB')).toThrow('Unknown unit: XB');
    });
  });

  describe('интеграционные тесты', () => {
    it('formatBytes и parseBytes должны быть обратимыми операциями', () => {
      const testCases = [
        1024,        // 1 KB
        1048576,     // 1 MB
        1073741824,  // 1 GB
        10485760,    // 10 MB
      ];

      testCases.forEach(bytes => {
        const formatted = formatBytes(bytes);
        const parsed = parseBytes(formatted);
        // Разница не более 1 байта из-за округления
        expect(Math.abs(parsed - bytes)).toBeLessThanOrEqual(1);
      });
    });

    it('formatBytesFixed и parseBytes должны быть обратимыми операциями', () => {
      const testCases = [
        1024,        // 1 KB
        1048576,     // 1 MB
        1073741824,  // 1 GB
        10485760,    // 10 MB
      ];

      testCases.forEach(bytes => {
        const formatted = formatBytesFixed(bytes);
        const parsed = parseBytes(formatted);
        // Разница не более 1 байта из-за округления
        expect(Math.abs(parsed - bytes)).toBeLessThanOrEqual(1);
      });
    });

    it('должен правильно обрабатывать реальные сценарии', () => {
      // Размер типичного XLSX файла
      const xlsxSize = parseBytes('10 MB');
      expect(formatBytesFixed(xlsxSize)).toBe('10.00 MB');

      // Размер типичного пакета
      const packageSize = parseBytes('150 MB');
      expect(formatBytesFixed(packageSize)).toBe('150.00 MB');

      // Размер хранилища
      const storageSize = parseBytes('1 TB');
      expect(formatBytesFixed(storageSize)).toBe('1.00 TB');
    });

    it('должен правильно обрабатывать граничные случаи', () => {
      // Переход между единицами измерения
      expect(formatBytes(1023)).toBe('1023 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      
      expect(formatBytes(1024 * 1024 - 1)).toBe('1024 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      
      expect(formatBytes(1024 * 1024 * 1024 - 1)).toBe('1024 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('граничные случаи и валидация', () => {
    it('должен корректно обрабатывать минимальные значения', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1)).toBe('1 Bytes');
    });

    it('должен корректно обрабатывать максимальные значения', () => {
      const maxSafeInteger = Number.MAX_SAFE_INTEGER;
      const result = formatBytes(maxSafeInteger);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('parseBytes должен обрабатывать очень маленькие дробные значения', () => {
      expect(parseBytes('0.001 MB')).toBe(1049);
      expect(parseBytes('0.1 KB')).toBe(102);
    });

    it('parseBytes должен обрабатывать большие дробные значения', () => {
      // 999.99 в float даёт погрешность при умножении на 1024³
      expect(parseBytes('999.99 GB')).toBe(1073731086582);
      // 100.5 * 1024^4 в float даёт погрешность
      expect(parseBytes('100.5 TB')).toBe(110500918591488);
    });
  });
});
