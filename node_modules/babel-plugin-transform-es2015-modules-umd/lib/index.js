"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types;

  function buildBrowserInit(browserGlobals, exactGlobals, file, moduleName) {
    var moduleNameOrBasename = moduleName ? moduleName.value : (0, _path.basename)(file.opts.filename, (0, _path.extname)(file.opts.filename));
    var globalToAssign = t.memberExpression(t.identifier("global"), t.identifier(t.toIdentifier(moduleNameOrBasename)));
    var initAssignments = [];

    if (exactGlobals) {
      var globalName = browserGlobals[moduleNameOrBasename];

      if (globalName) {
        initAssignments = [];
        var members = globalName.split(".");
        globalToAssign = members.slice(1).reduce(function (accum, curr) {
          initAssignments.push(buildPrerequisiteAssignment({
            GLOBAL_REFERENCE: accum
          }));
          return t.memberExpression(accum, t.identifier(curr));
        }, t.memberExpression(t.identifier("global"), t.identifier(members[0])));
      }
    }

    initAssignments.push(t.expressionStatement(t.assignmentExpression("=", globalToAssign, t.memberExpression(t.identifier("mod"), t.identifier("exports")))));
    return initAssignments;
  }

  function buildBrowserArg(browserGlobals, exactGlobals, source) {
    var memberExpression = void 0;

    if (exactGlobals) {
      var globalRef = browserGlobals[source];

      if (globalRef) {
        memberExpression = globalRef.split(".").reduce(function (accum, curr) {
          return t.memberExpression(accum, t.identifier(curr));
        }, t.identifier("global"));
      } else {
        memberExpression = t.memberExpression(t.identifier("global"), t.identifier(t.toIdentifier(source)));
      }
    } else {
      var requireName = (0, _path.basename)(source, (0, _path.extname)(source));
      var globalName = browserGlobals[requireName] || requireName;
      memberExpression = t.memberExpression(t.identifier("global"), t.identifier(t.toIdentifier(globalName)));
    }

    return memberExpression;
  }

  return {
    visitor: {
      Program: {
        exit: function exit(path, state) {
          if (!(0, _babelHelperModuleTransforms.isModule)(path)) return;
          var _state$opts = state.opts,
              globals = _state$opts.globals,
              exactGlobals = _state$opts.exactGlobals,
              loose = _state$opts.loose,
              allowTopLevelThis = _state$opts.allowTopLevelThis,
              strict = _state$opts.strict,
              strictMode = _state$opts.strictMode,
              noInterop = _state$opts.noInterop;
          var browserGlobals = globals || {};
          var moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          var _rewriteModuleStateme = (0, _babelHelperModuleTransforms.rewriteModuleStatementsAndPrepareHeader)(path, {
            loose: loose,
            strict: strict,
            strictMode: strictMode,
            allowTopLevelThis: allowTopLevelThis,
            noInterop: noInterop
          }),
              meta = _rewriteModuleStateme.meta,
              headers = _rewriteModuleStateme.headers;

          var amdArgs = [];
          var commonjsArgs = [];
          var browserArgs = [];
          var importNames = [];

          if ((0, _babelHelperModuleTransforms.hasExports)(meta)) {
            amdArgs.push(t.stringLiteral("exports"));
            commonjsArgs.push(t.identifier("exports"));
            browserArgs.push(t.memberExpression(t.identifier("mod"), t.identifier("exports")));
            importNames.push(t.identifier(meta.exportName));
          }

          for (var _iterator = meta.source, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref3;

            if (_isArray) {
              if (_i >= _iterator.length) break;
              _ref3 = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done) break;
              _ref3 = _i.value;
            }

            var _ref4 = _ref3;
            var _source = _ref4[0];
            var _metadata = _ref4[1];
            amdArgs.push(t.stringLiteral(_source));
            commonjsArgs.push(t.callExpression(t.identifier("require"), [t.stringLiteral(_source)]));
            browserArgs.push(buildBrowserArg(browserGlobals, exactGlobals, _source));
            importNames.push(t.identifier(_metadata.name));

            if (!(0, _babelHelperModuleTransforms.isSideEffectImport)(_metadata)) {
              var interop = (0, _babelHelperModuleTransforms.wrapInterop)(path, t.identifier(_metadata.name), _metadata.interop);

              if (interop) {
                var header = t.expressionStatement(t.assignmentExpression("=", t.identifier(_metadata.name), interop));
                header.loc = meta.loc;
                headers.push(header);
              }
            }

            headers.push.apply(headers, (0, _babelHelperModuleTransforms.buildNamespaceInitStatements)(meta, _metadata));
          }

          (0, _babelHelperModuleTransforms.ensureStatementsHoisted)(headers);
          path.unshiftContainer("body", headers);
          var _path$node = path.node,
              body = _path$node.body,
              directives = _path$node.directives;
          path.node.directives = [];
          path.node.body = [];
          var umdWrapper = path.pushContainer("body", [buildWrapper({
            MODULE_NAME: moduleName,
            AMD_ARGUMENTS: t.arrayExpression(amdArgs),
            COMMONJS_ARGUMENTS: commonjsArgs,
            BROWSER_ARGUMENTS: browserArgs,
            IMPORT_NAMES: importNames,
            GLOBAL_TO_ASSIGN: buildBrowserInit(browserGlobals, exactGlobals, this.file, moduleName)
          })])[0];
          var umdFactory = umdWrapper.get("expression.arguments")[1].get("body");
          umdFactory.pushContainer("directives", directives);
          umdFactory.pushContainer("body", body);
        }
      }
    }
  };
};

var _path = require("path");

var _babelTemplate = require("babel-template");

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _babelHelperModuleTransforms = require("babel-helper-module-transforms");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var buildPrerequisiteAssignment = (0, _babelTemplate2.default)("\n  GLOBAL_REFERENCE = GLOBAL_REFERENCE || {}\n");
var buildWrapper = (0, _babelTemplate2.default)("\n  (function (global, factory) {\n    if (typeof define === \"function\" && define.amd) {\n      define(MODULE_NAME, AMD_ARGUMENTS, factory);\n    } else if (typeof exports !== \"undefined\") {\n      factory(COMMONJS_ARGUMENTS);\n    } else {\n      var mod = { exports: {} };\n      factory(BROWSER_ARGUMENTS);\n\n      GLOBAL_TO_ASSIGN;\n    }\n  })(this, function(IMPORT_NAMES) {\n  })\n");