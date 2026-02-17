import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

// Enum для валют
export enum Currency {
  RUB = 'RUB',
  FOREIGN = 'FOREIGN',
}

// Мапа описаний для каждого значения enum
const CurrencyDescriptions = {
  [Currency.RUB]: { value: Currency.RUB, description: 'Рубли' },
  [Currency.FOREIGN]: { value: Currency.FOREIGN, description: 'Иностранная валюта' },
} as const;


export const currencySchema = z.enum(Currency).describe('Валюта');

// Создаем расширенную схему с описаниями
export const CurrencyEnumSchema = createEnumSchemaWithDescriptions(
  Currency,
  CurrencyDescriptions,
  'CurrencyEnum',
  'Валюта отчёта'
);
