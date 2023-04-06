'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.plugin = void 0;
var graphql_1 = require('graphql');
var resolvers =
  "import { transformToDate, transformToFloat } from '../custom-scalar-transformers';";
var transformFunctions = ['transformToDate', 'transformToFloat'];
var plugin = function (schema, _, config) {
  var scalars = Object.keys(config.scalars);
  var scalarResolvers = schema.toConfig().types.reduce(function (acc, it) {
    if (it != null && (0, graphql_1.isObjectType)(it) && !it.name.startsWith('__')) {
      var fields_1 = it.getFields();
      var mappedFields = Object.keys(fields_1).reduce(function (mapped, key) {
        var field = fields_1[key];
        var nullableType = (0, graphql_1.getNullableType)(field.type);
        if ((0, graphql_1.isScalarType)(nullableType) && scalars.includes(nullableType.name)) {
          mapped[field.name] = config.scalars[nullableType.name];
        }
        return mapped;
      }, {});
      if (Object.keys(mappedFields).length > 0) {
        acc[it.name] = mappedFields;
      }
    }
    return acc;
  }, {});
  var resolversString = JSON.stringify(scalarResolvers);
  var transformedResolvers = resolversString;
  transformFunctions.forEach(function (it) {
    transformedResolvers = transformedResolvers.replaceAll('"'.concat(it, '"'), it);
  });
  return ''.concat(resolvers, '\nexport const resolvers = ').concat(transformedResolvers);
};
exports.plugin = plugin;
