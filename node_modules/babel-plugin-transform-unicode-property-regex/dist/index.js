'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	return {
		'visitor': {
			RegExpLiteral: function RegExpLiteral(path, state) {
				var node = path.node;
				if (!regex.is(node, 'u')) {
					return;
				}
				var useUnicodeFlag = state.opts.useUnicodeFlag || false;
				node.pattern = (0, _regexpuCore2.default)(node.pattern, node.flags, {
					'unicodePropertyEscape': true,
					'useUnicodeFlag': useUnicodeFlag
				});
				if (!useUnicodeFlag) {
					regex.pullFlag(node, 'u');
				}
			}
		}
	};
};

var _regexpuCore = require('regexpu-core');

var _regexpuCore2 = _interopRequireDefault(_regexpuCore);

var _babelHelperRegex = require('babel-helper-regex');

var regex = _interopRequireWildcard(_babelHelperRegex);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }