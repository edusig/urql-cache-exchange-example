'use strict';
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.plugin = void 0;
var graphql_1 = require('graphql');
var plugin = function (schema, _documents, config) {
  var _a;
  var intro = (0, graphql_1.introspectionFromSchema)(schema);
  var locations = scalarLocations(intro, (_a = config.scalars) !== null && _a !== void 0 ? _a : []);
  return 'export type ObjectFieldTypes = Record<string, Record<string, string | string[]>>;\nexport type ScalarLocations = {\n scalars: string[],\n inputObjectFieldTypes: ObjectFieldTypes;\n};\nexport const scalarLocations : ScalarLocations = '.concat(
    JSON.stringify(__assign(__assign({}, locations), { scalars: config.scalars }), null, 2),
    ';\n',
  );
};
exports.plugin = plugin;
var scalarLocations = function (introspectionQuery, scalars) {
  var wantedScalar = function (n) {
    return scalars.indexOf(n) > -1;
  };
  var inputTypes = introspectionQuery.__schema.types.reduce(function (a, x) {
    if (x.kind === 'INPUT_OBJECT') a[x.name] = x;
    return a;
  }, {});
  /* Input Object types */
  var inputObjectFieldTypes = {};
  for (var name in inputTypes) {
    var typeInfo = inputTypes[name];
    var typeMap = {};
    for (var _i = 0, _a = typeInfo.inputFields; _i < _a.length; _i++) {
      var field = _a[_i];
      var fieldType = unpackInputType(field.type);
      if (fieldType === undefined) continue; // ENUMs, others?
      if (fieldType.kind === 'SCALAR' && wantedScalar(fieldType.name)) {
        typeMap[field.name] = fieldType.name;
      } else if (fieldType.kind === 'INPUT_OBJECT') {
        typeMap[field.name] = fieldType.name;
      }
    }
    if (!isObjectEmpty(typeMap)) inputObjectFieldTypes[name] = typeMap;
  }
  return { inputObjectFieldTypes: inputObjectFieldTypes };
};
var unpackInputType = function (type) {
  if (type.kind === 'SCALAR' || type.kind === 'INPUT_OBJECT') return type;
  if (type.kind === 'LIST' || type.kind === 'NON_NULL') return unpackInputType(type.ofType);
  return;
};
exports.default = scalarLocations;
var isObjectEmpty = function (obj) {
  return (
    obj && // 👈 null and undefined check
    Object.keys(obj).length === 0 &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
};
