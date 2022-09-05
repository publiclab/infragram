"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types;
  return {
    visitor: {
      Program: {
        exit: function exit(path, state) {
          if (!(0, _babelHelperModuleTransforms.isModule)(path, true)) return;
          var _state$opts = state.opts,
              loose = _state$opts.loose,
              allowTopLevelThis = _state$opts.allowTopLevelThis,
              strict = _state$opts.strict,
              strictMode = _state$opts.strictMode,
              noInterop = _state$opts.noInterop;
          path.scope.rename("exports");
          path.scope.rename("module");
          path.scope.rename("require");
          path.scope.rename("__filename");
          path.scope.rename("__dirname");
          var moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          var _rewriteModuleStateme = (0, _babelHelperModuleTransforms.rewriteModuleStatementsAndPrepareHeader)(path, {
            exportName: "exports",
            loose: loose,
            strict: strict,
            strictMode: strictMode,
            allowTopLevelThis: allowTopLevelThis,
            noInterop: noInterop
          }),
              meta = _rewriteModuleStateme.meta,
              headers = _rewriteModuleStateme.headers;

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
            var loadExpr = t.callExpression(t.identifier("require"), [t.stringLiteral(_source)]);
            var header = void 0;

            if ((0, _babelHelperModuleTransforms.isSideEffectImport)(_metadata)) {
              header = t.expressionStatement(loadExpr);
            } else {
              header = t.variableDeclaration("var", [t.variableDeclarator(t.identifier(_metadata.name), (0, _babelHelperModuleTransforms.wrapInterop)(path, loadExpr, _metadata.interop) || loadExpr)]);
            }

            header.loc = _metadata.loc;
            headers.push(header);
            headers.push.apply(headers, (0, _babelHelperModuleTransforms.buildNamespaceInitStatements)(meta, _metadata));
          }

          (0, _babelHelperModuleTransforms.ensureStatementsHoisted)(headers);
          path.unshiftContainer("body", headers);
        }
      }
    }
  };
};

var _babelHelperModuleTransforms = require("babel-helper-module-transforms");