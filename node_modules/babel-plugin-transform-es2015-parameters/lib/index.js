"use strict";

exports.__esModule = true;

exports.default = function () {
  return {
    visitor: {
      Function: function Function(path) {
        if (path.isArrowFunctionExpression() && path.get("params").some(function (param) {
          return param.isRestElement() || param.isAssignmentPattern();
        })) {
          path.arrowFunctionToExpression();
        }

        var convertedRest = (0, _rest2.default)(path);
        var convertedParams = (0, _params2.default)(path, this.opts.loose);

        if (convertedRest || convertedParams) {
          path.scope.crawl();
        }
      }
    }
  };
};

var _params = require("./params");

var _params2 = _interopRequireDefault(_params);

var _rest = require("./rest");

var _rest2 = _interopRequireDefault(_rest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }