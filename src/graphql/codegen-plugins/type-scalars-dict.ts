import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, getNullableType, isObjectType, isScalarType } from 'graphql';

export type FieldMap = Record<string, string>;
export type FieldsMap = Record<string, FieldMap>;

export const plugin: PluginFunction<any> = (schema: GraphQLSchema, _, config) => {
  const scalars = Object.keys(config.scalars as Record<string, unknown>);
  return JSON.stringify(
    schema.toConfig().types.reduce((acc, it) => {
      if (it != null && isObjectType(it) && !it.name.startsWith('__')) {
        const fields = it.getFields();
        const mappedFields = Object.keys(fields).reduce((innerAcc, key) => {
          const field = fields[key];
          const nullableType = getNullableType(field.type);
          if (isScalarType(nullableType) && scalars.includes(nullableType.name)) {
            innerAcc[field.name] = nullableType.name;
          }
          return innerAcc;
        }, {} as FieldMap);
        if (Object.keys(mappedFields).length > 0) {
          acc[it.name] = mappedFields;
        }
      }
      return acc;
    }, {} as FieldsMap),
  );
};
