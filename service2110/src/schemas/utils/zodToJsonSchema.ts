// В openapi-components.ts
import { extendApi } from '@anatine/zod-openapi';

export function zodToJsonSchema(schema: unknown, name: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zodSchema = schema as any;

    // Получаем базовую JSON схему
    const jsonSchema = zodSchema.toJSONSchema?.({
      target: 'openApi3' as const,
      $refStrategy: 'none' as const,
      removeIncompatibleMeta: true,
    }) ?? {};

    // Добавляем заголовок
    const result = {
      ...jsonSchema,
      title: name,
    };

    // Извлекаем метаданные из zod схемы (где @anatine/zod-openapi их сохраняет)
    const metadata = zodSchema._def?.metadata;

    // Если есть метаданные с OpenAPI extensions, добавляем их
    if (metadata) {
      // Добавляем все x-* поля из метаданных
      Object.entries(metadata).forEach(([key, value]) => {
        if (key.startsWith('x-')) {
          result[key] = value;
        }
      });

      // Специальная обработка для описаний enum
      if (metadata['x-enum-descriptions'] && result.enum) {
        // Для OpenAPI 3.1 можно использовать oneOf с описаниями
        if (name.includes('Enum')) {
          result.oneOf = result.enum.map((value: string, index: number) => ({
            const: value,
            description: metadata['x-enum-descriptions'][index],
            title: metadata['x-enum-varnames']?.[index] || value
          }));
        }
      }
    }

    return result;
  } catch (error) {
    console.error(`Error converting schema ${name}:`, error);
    return { type: 'object', title: name };
  }
}
