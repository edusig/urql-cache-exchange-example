/* eslint-disable guard-for-in */
/* eslint-disable no-underscore-dangle */
// This is an edited version of the file below from 2021-10-06
// https://github.com/marcinkoziej/codegen-graphql-scalar-locations/blob/main/src/scalarLocations.ts
// Because we are not going to use deserialization.
// We generate our own field resolver to solve that.
import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import {
  introspectionFromSchema,
  IntrospectionInputObjectType,
  IntrospectionInputTypeRef,
  IntrospectionQuery,
  IntrospectionType,
} from 'graphql';

interface Config {
  scalars?: string[];
}

export const plugin: PluginFunction<any> = (schema, _documents, config: Config) => {
  const intro = introspectionFromSchema(schema);
  const locations = scalarLocations(intro, config.scalars ?? []);
  return `export type ObjectFieldTypes = Record<string, Record<string, string | string[]>>;
export type ScalarLocations = {
 scalars: string[],
 inputObjectFieldTypes: ObjectFieldTypes;
};
export const scalarLocations : ScalarLocations = ${JSON.stringify(
    { ...locations, scalars: config.scalars },
    null,
    2,
  )};
`;
};

type ObjectFieldTypes = Record<string, Record<string, string | string[]>>;

const scalarLocations = (introspectionQuery: IntrospectionQuery, scalars: string[]) => {
  const wantedScalar = (n: string) => scalars.indexOf(n) > -1;

  const inputTypes = introspectionQuery.__schema.types.reduce(
    (a: Record<string, IntrospectionInputObjectType>, x: IntrospectionType) => {
      if (x.kind === 'INPUT_OBJECT') a[x.name] = x as IntrospectionInputObjectType;
      return a;
    },
    {},
  );

  /* Input Object types */
  const inputObjectFieldTypes: ObjectFieldTypes = {};
  for (const name in inputTypes) {
    const typeInfo: IntrospectionInputObjectType = inputTypes[name];
    const typeMap: Record<string, string> = {};

    for (const field of typeInfo.inputFields) {
      const fieldType = unpackInputType(field.type);
      if (fieldType === undefined) continue; // ENUMs, others?
      if (fieldType.kind === 'SCALAR' && wantedScalar(fieldType.name)) {
        typeMap[field.name] = fieldType.name;
      } else if (fieldType.kind === 'INPUT_OBJECT') {
        typeMap[field.name] = fieldType.name;
      }
    }

    if (!isObjectEmpty(typeMap)) inputObjectFieldTypes[name] = typeMap;
  }

  return { inputObjectFieldTypes };
};

const unpackInputType = (
  type: IntrospectionInputTypeRef,
): IntrospectionInputTypeRef | undefined => {
  if (type.kind === 'SCALAR' || type.kind === 'INPUT_OBJECT') return type;
  if (type.kind === 'LIST' || type.kind === 'NON_NULL') return unpackInputType(type.ofType);
  return;
};

export default scalarLocations;

const isObjectEmpty = (obj: Record<string, unknown>) =>
  obj && // 👈 null and undefined check
  Object.keys(obj).length === 0 &&
  Object.getPrototypeOf(obj) === Object.prototype;
