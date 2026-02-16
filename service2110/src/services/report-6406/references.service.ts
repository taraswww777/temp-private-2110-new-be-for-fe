import { db } from '../../db/index.js';
import { branches, sources } from '../../db/schema/index.js';
import type {
  BranchesResponse,
  CurrenciesResponse,
  SourcesResponse,
  EmployeeResponse,
  AccountMasksResponse
} from '../../schemas/report-6406/dictionary.schema';
import { FormatsResponse } from '../../schemas/report-6406/references.schema';

export class ReferencesService {
  /**
   * Получить список филиалов
   */
  async getBranches(): Promise<BranchesResponse> {
    const branchesList = await db.select().from(branches);

    return { branches: branchesList.map(branch => ({
      id: Number(branch.id),
      codeCB: branch.code,
      codeDAPP: branch.dappCode,
      name: branch.name
    })) };
  }


  /**
   * Получить список валют
   */
  async getCurrencies(): Promise<CurrenciesResponse> {
    return {
      currencies: [
        {
          code: 'RUB',
          name: 'Российский рубль'
        },
        {
          code: 'USD',
          name: 'Доллар США'
        }
      ]
    };
  }

  /**
   * Получить список форматов файлов
   */
  async getFormats(): Promise<FormatsResponse> {
    return [
      {
        code: 'TXT',
        name: 'Текстовый файл',
      },
      {
        code: 'XLSX',
        name: 'Excel файл',
      },
      {
        code: 'XML',
        name: 'XML файл',
      },
    ];
  }

  /**
   * Получить список источников
   */
  async getSources(): Promise<SourcesResponse> {
    const sourcesList = await db.select().from(sources);

    return { sources: sourcesList };
  }

  /**
   * Получить маски счетов в виде связанного списка
   */
  async getAccountMasks(): Promise<AccountMasksResponse> {
    return [
      {
        firstAccount: 123,
        secondAccounts: [12345, 12345]
      },
      {
        firstAccount: 456,
        secondAccounts: [45690, 45691]
      }
    ];
  }

  /**
   * Получить данные о сотруднике по AD-логину
   */
  async getEmployee(login: string): Promise<EmployeeResponse> {
    // Временная реализация, в будущем будет интеграция с AD
    return {
      fullName: 'Иванов Иван Иванович',
      login: 'vtb12345678'
    };
  }
}

export const referencesService = new ReferencesService();
