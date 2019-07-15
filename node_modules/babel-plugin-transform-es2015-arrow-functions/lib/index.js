"use strict";

exports.__esModule = true;

exports.default = function () {
  return {
    visitor: {
      ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
        if (!path.isArrowFunctionExpression()) return;
        path.arrowFunctionToExpression({
          allowInsertArrow: false,
          specCompliant: !!state.opts.spec
        });
      }
    }
  };
};