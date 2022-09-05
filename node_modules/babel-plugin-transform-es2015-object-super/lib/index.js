"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types;
  return {
    visitor: {
      ObjectExpression: function ObjectExpression(path, state) {
        var objectRef = void 0;

        var getObjectRef = function getObjectRef() {
          return objectRef = objectRef || path.scope.generateUidIdentifier("obj");
        };

        path.get("properties").forEach(function (propertyPath) {
          if (!propertyPath.isMethod()) return;
          var propPaths = path.get("properties");

          for (var _iterator = propPaths, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray) {
              if (_i >= _iterator.length) break;
              _ref2 = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done) break;
              _ref2 = _i.value;
            }

            var _propPath = _ref2;
            if (_propPath.isObjectProperty()) _propPath = _propPath.get("value");
            replacePropertySuper(_propPath, _propPath.node, path.scope, getObjectRef, state);
          }
        });

        if (objectRef) {
          path.scope.push({
            id: objectRef
          });
          path.replaceWith(t.assignmentExpression("=", objectRef, path.node));
        }
      }
    }
  };
};

var _babelHelperReplaceSupers = require("babel-helper-replace-supers");

var _babelHelperReplaceSupers2 = _interopRequireDefault(_babelHelperReplaceSupers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function replacePropertySuper(path, node, scope, getObjectRef, file) {
  var replaceSupers = new _babelHelperReplaceSupers2.default({
    getObjectRef: getObjectRef,
    methodNode: node,
    methodPath: path,
    isStatic: true,
    scope: scope,
    file: file
  });
  replaceSupers.replace();
}