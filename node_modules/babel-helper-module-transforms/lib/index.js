"use strict";

exports.__esModule = true;
exports.isSideEffectImport = exports.hasExports = undefined;
exports.isModule = isModule;
exports.rewriteModuleStatementsAndPrepareHeader = rewriteModuleStatementsAndPrepareHeader;
exports.ensureStatementsHoisted = ensureStatementsHoisted;
exports.wrapInterop = wrapInterop;
exports.buildNamespaceInitStatements = buildNamespaceInitStatements;

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

var _babelTemplate = require("babel-template");

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _chunk = require("lodash/chunk");

var _chunk2 = _interopRequireDefault(_chunk);

var _rewriteThis = require("./rewrite-this");

var _rewriteThis2 = _interopRequireDefault(_rewriteThis);

var _rewriteLiveReferences = require("./rewrite-live-references");

var _rewriteLiveReferences2 = _interopRequireDefault(_rewriteLiveReferences);

var _normalizeAndLoadMetadata = require("./normalize-and-load-metadata");

var _normalizeAndLoadMetadata2 = _interopRequireDefault(_normalizeAndLoadMetadata);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.hasExports = _normalizeAndLoadMetadata.hasExports;
exports.isSideEffectImport = _normalizeAndLoadMetadata.isSideEffectImport;

function isModule(path, requireUnambiguous) {
  if (requireUnambiguous === void 0) {
    requireUnambiguous = false;
  }

  var sourceType = path.node.sourceType;

  if (sourceType !== "module" && sourceType !== "script") {
    throw path.buildCodeFrameError("Unknown sourceType \"" + sourceType + "\", cannot transform.");
  }

  var filename = path.hub.file.opts.filename;

  if (/\.mjs$/.test(filename)) {
    requireUnambiguous = false;
  }

  return path.node.sourceType === "module" && (!requireUnambiguous || isUnambiguousModule(path));
}

function isUnambiguousModule(path) {
  return path.get("body").some(function (p) {
    return p.isModuleDeclaration();
  });
}

function rewriteModuleStatementsAndPrepareHeader(path, _ref) {
  var exportName = _ref.exportName,
      strict = _ref.strict,
      allowTopLevelThis = _ref.allowTopLevelThis,
      strictMode = _ref.strictMode,
      loose = _ref.loose,
      noInterop = _ref.noInterop;
  (0, _assert2.default)(isModule(path), "Cannot process module statements in a script");
  path.node.sourceType = "script";
  var meta = (0, _normalizeAndLoadMetadata2.default)(path, exportName, {
    noInterop: noInterop
  });

  if (!allowTopLevelThis) {
    (0, _rewriteThis2.default)(path);
  }

  (0, _rewriteLiveReferences2.default)(path, meta);

  if (strictMode !== false) {
    var hasStrict = path.node.directives.some(function (directive) {
      return directive.value.value === "use strict";
    });

    if (!hasStrict) {
      path.unshiftContainer("directives", t.directive(t.directiveLiteral("use strict")));
    }
  }

  var headers = [];

  if ((0, _normalizeAndLoadMetadata.hasExports)(meta) && !strict) {
    headers.push(buildESModuleHeader(meta, loose));
  }

  var nameList = buildExportNameListDeclaration(path, meta);

  if (nameList) {
    meta.exportNameListName = nameList.name;
    headers.push(nameList.statement);
  }

  headers.push.apply(headers, buildExportInitializationStatements(path, meta));
  return {
    meta: meta,
    headers: headers
  };
}

function ensureStatementsHoisted(statements) {
  statements.forEach(function (header) {
    header._blockHoist = 3;
  });
}

function wrapInterop(programPath, expr, type) {
  if (type === "none") {
    return null;
  }

  var helper = void 0;

  if (type === "default") {
    helper = "interopRequireDefault";
  } else if (type === "namespace") {
    helper = "interopRequireWildcard";
  } else {
    throw new Error("Unknown interop: " + type);
  }

  return t.callExpression(programPath.hub.file.addHelper(helper), [expr]);
}

var buildNamespaceInit = (0, _babelTemplate2.default)("\n  var NAME = SOURCE;\n");
var buildReexportNamespace = (0, _babelTemplate2.default)("\n  EXPORTS.NAME = NAMESPACE;\n");

function buildNamespaceInitStatements(metadata, sourceMetadata) {
  var statements = [];

  for (var _iterator = sourceMetadata.importsNamespace, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref2 = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref2 = _i.value;
    }

    var _localName = _ref2;
    if (_localName === sourceMetadata.name) continue;
    statements.push(buildNamespaceInit({
      NAME: t.identifier(_localName),
      SOURCE: t.identifier(sourceMetadata.name)
    }));
  }

  for (var _iterator2 = sourceMetadata.reexportNamespace, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref3;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref3 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref3 = _i2.value;
    }

    var _exportName = _ref3;
    statements.push(buildReexportNamespace({
      EXPORTS: t.identifier(metadata.exportName),
      NAME: t.identifier(_exportName),
      NAMESPACE: t.identifier(sourceMetadata.name)
    }));
  }

  if (sourceMetadata.reexportAll) {
    var statement = buildNamespaceReexport(metadata, sourceMetadata.name);
    statement.loc = sourceMetadata.reexportAll.loc;
    statements.push(statement);
  }

  return statements;
}

var moduleHeader = (0, _babelTemplate2.default)("\n  Object.defineProperty(EXPORTS, \"__esModule\", {\n    value: true,\n  })\n");
var moduleHeaderLoose = (0, _babelTemplate2.default)("\n  EXPORTS.__esModule = true;\n");

function buildESModuleHeader(metadata, enumerable) {
  if (enumerable === void 0) {
    enumerable = false;
  }

  if (enumerable) {
    return moduleHeaderLoose({
      EXPORTS: t.identifier(metadata.exportName)
    });
  }

  return moduleHeader({
    EXPORTS: t.identifier(metadata.exportName)
  });
}

var namespaceReexport = (0, _babelTemplate2.default)("\n  Object.keys(NAMESPACE).forEach(function(key) {\n    if (key === \"default\" || key === \"__esModule\") return;\n    VERIFY_NAME_LIST;\n\n    Object.defineProperty(EXPORTS, key, {\n      enumerable: true,\n      get: function() {\n        return NAMESPACE[key];\n      },\n    });\n  });\n");
var buildNameListCheck = (0, _babelTemplate2.default)("\n  if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;\n");

function buildNamespaceReexport(metadata, namespace) {
  return namespaceReexport({
    NAMESPACE: t.identifier(namespace),
    EXPORTS: t.identifier(metadata.exportName),
    VERIFY_NAME_LIST: metadata.exportNameListName ? buildNameListCheck({
      EXPORTS_LIST: t.identifier(metadata.exportNameListName)
    }) : null
  });
}

var reexportGetter = (0, _babelTemplate2.default)("\n  Object.defineProperty(EXPORTS, EXPORT_NAME, {\n    enumerable: true,\n    get: function() {\n      return NAMESPACE.IMPORT_NAME;\n    },\n  });\n");

function buildExportNameListDeclaration(programPath, metadata) {
  var exportedVars = Object.create(null);

  for (var _iterator3 = metadata.local.values(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
    var _ref4;

    if (_isArray3) {
      if (_i3 >= _iterator3.length) break;
      _ref4 = _iterator3[_i3++];
    } else {
      _i3 = _iterator3.next();
      if (_i3.done) break;
      _ref4 = _i3.value;
    }

    var _data2 = _ref4;

    for (var _iterator5 = _data2.names, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
      var _ref6;

      if (_isArray5) {
        if (_i5 >= _iterator5.length) break;
        _ref6 = _iterator5[_i5++];
      } else {
        _i5 = _iterator5.next();
        if (_i5.done) break;
        _ref6 = _i5.value;
      }

      var _name2 = _ref6;
      exportedVars[_name2] = true;
    }
  }

  var hasReexport = false;

  for (var _iterator4 = metadata.source.values(), _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
    var _ref5;

    if (_isArray4) {
      if (_i4 >= _iterator4.length) break;
      _ref5 = _iterator4[_i4++];
    } else {
      _i4 = _iterator4.next();
      if (_i4.done) break;
      _ref5 = _i4.value;
    }

    var _data3 = _ref5;

    for (var _iterator6 = _data3.reexports.keys(), _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
      var _ref7;

      if (_isArray6) {
        if (_i6 >= _iterator6.length) break;
        _ref7 = _iterator6[_i6++];
      } else {
        _i6 = _iterator6.next();
        if (_i6.done) break;
        _ref7 = _i6.value;
      }

      var _exportName3 = _ref7;
      exportedVars[_exportName3] = true;
    }

    for (var _iterator7 = _data3.reexportNamespace, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : _iterator7[Symbol.iterator]();;) {
      var _ref8;

      if (_isArray7) {
        if (_i7 >= _iterator7.length) break;
        _ref8 = _iterator7[_i7++];
      } else {
        _i7 = _iterator7.next();
        if (_i7.done) break;
        _ref8 = _i7.value;
      }

      var _exportName4 = _ref8;
      exportedVars[_exportName4] = true;
    }

    hasReexport = hasReexport || _data3.reexportAll;
  }

  if (!hasReexport || Object.keys(exportedVars).length === 0) return null;
  var name = programPath.scope.generateUidIdentifier("exportNames");
  delete exportedVars.default;
  return {
    name: name.name,
    statement: t.variableDeclaration("var", [t.variableDeclarator(name, t.valueToNode(exportedVars))])
  };
}

function buildExportInitializationStatements(programPath, metadata) {
  var initStatements = [];
  var exportNames = [];

  for (var _iterator8 = metadata.local, _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : _iterator8[Symbol.iterator]();;) {
    var _ref10;

    if (_isArray8) {
      if (_i8 >= _iterator8.length) break;
      _ref10 = _iterator8[_i8++];
    } else {
      _i8 = _iterator8.next();
      if (_i8.done) break;
      _ref10 = _i8.value;
    }

    var _ref12 = _ref10;
    var _localName2 = _ref12[0];
    var _data5 = _ref12[1];

    if (_data5.kind === "import") {} else if (_data5.kind === "hoisted") {
      initStatements.push(buildInitStatement(metadata, _data5.names, t.identifier(_localName2)));
    } else {
      exportNames.push.apply(exportNames, _data5.names);
    }
  }

  for (var _iterator9 = metadata.source.values(), _isArray9 = Array.isArray(_iterator9), _i9 = 0, _iterator9 = _isArray9 ? _iterator9 : _iterator9[Symbol.iterator]();;) {
    var _ref11;

    if (_isArray9) {
      if (_i9 >= _iterator9.length) break;
      _ref11 = _iterator9[_i9++];
    } else {
      _i9 = _iterator9.next();
      if (_i9.done) break;
      _ref11 = _i9.value;
    }

    var _data6 = _ref11;

    for (var _iterator10 = _data6.reexports, _isArray10 = Array.isArray(_iterator10), _i10 = 0, _iterator10 = _isArray10 ? _iterator10 : _iterator10[Symbol.iterator]();;) {
      var _ref14;

      if (_isArray10) {
        if (_i10 >= _iterator10.length) break;
        _ref14 = _iterator10[_i10++];
      } else {
        _i10 = _iterator10.next();
        if (_i10.done) break;
        _ref14 = _i10.value;
      }

      var _ref16 = _ref14;
      var _exportName6 = _ref16[0];
      var _importName = _ref16[1];
      initStatements.push(reexportGetter({
        EXPORTS: t.identifier(metadata.exportName),
        EXPORT_NAME: t.stringLiteral(_exportName6),
        NAMESPACE: t.identifier(_data6.name),
        IMPORT_NAME: t.identifier(_importName)
      }));
    }

    for (var _iterator11 = _data6.reexportNamespace, _isArray11 = Array.isArray(_iterator11), _i11 = 0, _iterator11 = _isArray11 ? _iterator11 : _iterator11[Symbol.iterator]();;) {
      var _ref15;

      if (_isArray11) {
        if (_i11 >= _iterator11.length) break;
        _ref15 = _iterator11[_i11++];
      } else {
        _i11 = _iterator11.next();
        if (_i11.done) break;
        _ref15 = _i11.value;
      }

      var _exportName7 = _ref15;
      exportNames.push(_exportName7);
    }
  }

  initStatements.push.apply(initStatements, (0, _chunk2.default)(exportNames, 100).map(function (members) {
    return buildInitStatement(metadata, members, programPath.scope.buildUndefinedNode());
  }));
  return initStatements;
}

var initStatement = (0, _babelTemplate2.default)("\n  EXPORTS.NAME = VALUE;\n");

function buildInitStatement(metadata, exportNames, initExpr) {
  return t.expressionStatement(exportNames.reduce(function (acc, exportName) {
    return initStatement({
      EXPORTS: t.identifier(metadata.exportName),
      NAME: t.identifier(exportName),
      VALUE: acc
    }).expression;
  }, initExpr));
}