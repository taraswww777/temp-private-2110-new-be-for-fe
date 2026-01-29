import { db } from '../../db/index.js';
import { branches, sources } from '../../db/schema/index.js';
import type { 
  BranchesResponse, 
  ReportTypesResponse, 
  CurrenciesResponse, 
  FormatsResponse,
  SourcesResponse 
} from '../../schemas/report-6406/references.schema';

export class ReferencesService {
  /**
   * Получить список филиалов
   */
  async getBranches(): Promise<BranchesResponse> {
    const branchesList = await db.select().from(branches);
    
    return branchesList;
  }

  /**
   * Получить список типов отчётов
   */
  async getReportTypes(): Promise<ReportTypesResponse> {
    return [
      {
        code: 'LSOZ',
        name: 'Информация об открытых и закрытых счетах',
      },
      {
        code: 'LSOS',
        name: 'Информация о счетах. Остатки',
      },
      {
        code: 'LSOP',
        name: 'Информация о счетах. Операции',
      },
    ];
  }

  /**
   * Получить список валют
   */
  async getCurrencies(): Promise<CurrenciesResponse> {
    return [
      {
        code: 'RUB',
        name: 'Рубль',
      },
      {
        code: 'FOREIGN',
        name: 'Иностранная валюта',
      },
    ];
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
    
    return sourcesList;
  }
}

export const referencesService = new ReferencesService();
