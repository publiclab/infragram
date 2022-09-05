"use strict";

exports.__esModule = true;

exports.default = function () {
  return {
    inherits: _babelPluginSyntaxOptionalCatchBinding2.default,
    visitor: {
      CatchClause: function CatchClause(path) {
        if (!path.node.param) {
          var uid = path.scope.generateUidIdentifier("unused");
          var paramPath = path.get("param");
          paramPath.replaceWith(uid);
        }
      }
    }
  };
};

var _babelPluginSyntaxOptionalCatchBinding = require("babel-plugin-syntax-optional-catch-binding");

var _babelPluginSyntaxOptionalCatchBinding2 = _interopRequireDefault(_babelPluginSyntaxOptionalCatchBinding);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }