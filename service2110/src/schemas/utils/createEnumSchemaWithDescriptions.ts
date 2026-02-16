export function createEnumSchemaWithDescriptions(
  enumObj: Record<string, string>,
  descriptions: Record<string, { value: string; description: string }>,
  name: string,
  description: string
) {
  const enumValues = Object.values(enumObj);
  const enumDescriptions = enumValues.map(v => descriptions[v]?.description || '');
  const enumNames = Object.keys(enumObj);

  return {
    type: 'string',
    enum: enumValues,
    description,
    title: name,
    'x-enum-descriptions': enumDescriptions,
    'x-enum-varnames': enumNames,
    // Для сваггера, который поддерживает oneOf с описаниями
    oneOf: enumValues.map((value, index) => ({
      const: value,
      description: enumDescriptions[index],
      title: enumNames[index]
    }))
  };
}
