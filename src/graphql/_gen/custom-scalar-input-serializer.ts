export type ObjectFieldTypes = Record<string, Record<string, string | string[]>>;
export type ScalarLocations = {
 scalars: string[],
 inputObjectFieldTypes: ObjectFieldTypes;
};
export const scalarLocations : ScalarLocations = {
  "inputObjectFieldTypes": {},
  "scalars": [
    "Date",
    "DateTime",
    "Decimal"
  ]
};
