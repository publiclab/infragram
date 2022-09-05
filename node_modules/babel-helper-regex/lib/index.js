"use strict";

exports.__esModule = true;
exports.is = is;
exports.pullFlag = pullFlag;

var _pull = require("lodash/pull");

var _pull2 = _interopRequireDefault(_pull);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function is(node, flag) {
  return node.type === "RegExpLiteral" && node.flags.indexOf(flag) >= 0;
}

function pullFlag(node, flag) {
  var flags = node.flags.split("");
  if (node.flags.indexOf(flag) < 0) return;
  (0, _pull2.default)(flags, flag);
  node.flags = flags.join("");
}