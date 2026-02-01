/**
 * Формат детали ошибки валидации от бэкенда
 */
export interface ApiErrorDetail {
  path: string;
  message: string;
  expectedValues?: string[];
}

/**
 * Тело ошибки, возвращаемое API (совпадает с бэкендом)
 */
export interface ApiErrorBody {
  message: string;
  code: string;
  details?: ApiErrorDetail[];
}

/**
 * Ошибка с данными от API: сообщение и опционально детали валидации
 */
export class ApiError extends Error {
  readonly code: string;
  readonly details: ApiErrorDetail[];
  readonly statusCode: number;

  constructor(
    message: string,
    options: { code?: string; details?: ApiErrorDetail[]; statusCode?: number } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code ?? 'UNKNOWN';
    this.details = options.details ?? [];
    this.statusCode = options.statusCode ?? 0;
  }

  /** Создать ApiError из ответа fetch (парсит JSON body) */
  static async fromResponse(response: Response): Promise<ApiError> {
    let body: ApiErrorBody;
    try {
      const json = await response.json();
      body =
        typeof json?.message === 'string'
          ? (json as ApiErrorBody)
          : { message: response.statusText || 'Ошибка запроса', code: 'UNKNOWN' };
    } catch {
      body = {
        message: response.statusText || `Ошибка ${response.status}`,
        code: 'UNKNOWN',
      };
    }
    return new ApiError(body.message, {
      code: body.code,
      details: body.details,
      statusCode: response.status,
    });
  }
}
