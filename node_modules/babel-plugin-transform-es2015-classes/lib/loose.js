"use strict";

exports.__esModule = true;
exports.default = undefined;

var _babelHelperFunctionName = require("babel-helper-function-name");

var _babelHelperFunctionName2 = _interopRequireDefault(_babelHelperFunctionName);

var _vanilla = require("./vanilla");

var _vanilla2 = _interopRequireDefault(_vanilla);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var LooseClassTransformer = function (_VanillaTransformer) {
  _inheritsLoose(LooseClassTransformer, _VanillaTransformer);

  function LooseClassTransformer() {
    var _this;

    _this = _VanillaTransformer.apply(this, arguments) || this;
    _this._protoAlias = null;
    _this.isLoose = true;
    return _this;
  }

  LooseClassTransformer.prototype._insertProtoAliasOnce = function _insertProtoAliasOnce() {
    if (!this._protoAlias) {
      this._protoAlias = this.scope.generateUidIdentifier("proto");
      var classProto = t.memberExpression(this.classRef, t.identifier("prototype"));
      var protoDeclaration = t.variableDeclaration("var", [t.variableDeclarator(this._protoAlias, classProto)]);
      this.body.push(protoDeclaration);
    }
  };

  LooseClassTransformer.prototype._processMethod = function _processMethod(node, scope) {
    if (!node.decorators) {
      var classRef = this.classRef;

      if (!node.static) {
        this._insertProtoAliasOnce();

        classRef = this._protoAlias;
      }

      var methodName = t.memberExpression(classRef, node.key, node.computed || t.isLiteral(node.key));
      var func = t.functionExpression(null, node.params, node.body, node.generator, node.async);
      func.returnType = node.returnType;
      var key = t.toComputedKey(node, node.key);

      if (t.isStringLiteral(key)) {
        func = (0, _babelHelperFunctionName2.default)({
          node: func,
          id: key,
          scope: scope
        });
      }

      var expr = t.expressionStatement(t.assignmentExpression("=", methodName, func));
      t.inheritsComments(expr, node);
      this.body.push(expr);
      return true;
    }
  };

  return LooseClassTransformer;
}(_vanilla2.default);

exports.default = LooseClassTransformer;