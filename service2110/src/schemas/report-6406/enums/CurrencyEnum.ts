import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema, registerReport6406OpenApiSchema } from '../openapi-register-helpers.ts';

// Enum для валют
export enum Currency {
  /** Рубли */
  RUB = 'RUB',
  /** Иностранная валюта */
  FOREIGN = 'FOREIGN',
}

// Мапа описаний для каждого значения enum
const CurrencyDescriptions = {
  [Currency.RUB]: { value: Currency.RUB, description: 'Рубли' },
  [Currency.FOREIGN]: { value: Currency.FOREIGN, description: 'Иностранная валюта' },
} as const;

export const currencySchema = z.enum(Currency).describe('Валюта');
export const currencyIdSchema = z.number().positive().min(100).max(999).describe('Валюта');

// Создаем расширенную схему с описаниями
export const CurrencyEnumSchema = createEnumSchemaWithDescriptions(
  Currency,
  CurrencyDescriptions,
  'CurrencyEnum',
  'Валюта отчёта',
);

(function registerCurrencyEnumOpenApi() {
  registerReport6406EnumOpenApiSchema(currencySchema, 'CurrencyEnum');
  registerReport6406OpenApiSchema(currencyIdSchema, 'Report6406CurrencyIdSchema');
})();
