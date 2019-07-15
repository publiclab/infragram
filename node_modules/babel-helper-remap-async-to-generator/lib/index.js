"use strict";

exports.__esModule = true;

exports.default = function (path, file, helpers) {
  if (!helpers) {
    helpers = {
      wrapAsync: file
    };
    file = null;
  }

  path.traverse(awaitVisitor, {
    file: file,
    wrapAwait: helpers.wrapAwait
  });
  path.node.async = false;
  path.node.generator = true;
  (0, _babelHelperWrapFunction2.default)(path, helpers.wrapAsync);
};

var _babelHelperWrapFunction = require("babel-helper-wrap-function");

var _babelHelperWrapFunction2 = _interopRequireDefault(_babelHelperWrapFunction);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

var _forAwait = require("./for-await");

var _forAwait2 = _interopRequireDefault(_forAwait);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var awaitVisitor = {
  Function: function Function(path) {
    path.skip();
  },
  AwaitExpression: function AwaitExpression(_ref, _ref2) {
    var node = _ref.node;
    var wrapAwait = _ref2.wrapAwait;
    node.type = "YieldExpression";

    if (wrapAwait) {
      node.argument = t.callExpression(wrapAwait, [node.argument]);
    }
  },
  ForOfStatement: function ForOfStatement(path, _ref3) {
    var file = _ref3.file,
        wrapAwait = _ref3.wrapAwait;
    var node = path.node;
    if (!node.await) return;
    var build = (0, _forAwait2.default)(path, {
      getAsyncIterator: file.addHelper("asyncIterator"),
      wrapAwait: wrapAwait
    });
    var declar = build.declar,
        loop = build.loop;
    var block = loop.body;
    path.ensureBlock();

    if (declar) {
      block.body.push(declar);
    }

    block.body = block.body.concat(node.body.body);
    t.inherits(loop, node);
    t.inherits(loop.body, node.body);

    if (build.replaceParent) {
      path.parentPath.replaceWithMultiple(build.node);
    } else {
      path.replaceWithMultiple(build.node);
    }
  }
};