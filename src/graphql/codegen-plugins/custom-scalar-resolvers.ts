import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { getNullableType, GraphQLSchema, isObjectType, isScalarType } from 'graphql';

export type FieldMap = Record<string, string>;
export type FieldsMap = Record<string, FieldMap>;

const resolvers = `import { transformToDate, transformToFloat } from '../custom-scalar-transformers';`;

const transformFunctions = ['transformToDate', 'transformToFloat'];

export const plugin: PluginFunction<any> = (schema: GraphQLSchema, _, config) => {
  const scalars = Object.keys(config.scalars as Record<string, unknown>);
  const scalarResolvers = schema.toConfig().types.reduce((acc, it) => {
    if (it != null && isObjectType(it) && !it.name.startsWith('__')) {
      const fields = it.getFields();
      const mappedFields = Object.keys(fields).reduce((mapped, key) => {
        const field = fields[key];
        const nullableType = getNullableType(field.type);
        if (isScalarType(nullableType) && scalars.includes(nullableType.name)) {
          mapped[field.name] = config.scalars[nullableType.name];
        }
        return mapped;
      }, {} as FieldMap);
      if (Object.keys(mappedFields).length > 0) {
        acc[it.name] = mappedFields;
      }
    }
    return acc;
  }, {} as FieldsMap);
  const resolversString = JSON.stringify(scalarResolvers);
  let transformedResolvers = resolversString;
  transformFunctions.forEach(it => {
    transformedResolvers = transformedResolvers.replaceAll(`"${it}"`, it);
  });
  return `${resolvers}
export const resolvers = ${transformedResolvers}`;
};
