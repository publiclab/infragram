"use strict";

exports.__esModule = true;
exports.logUsagePolyfills = exports.logEntryPolyfills = exports.logPlugin = exports.logMessage = undefined;

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*eslint quotes: ["error", "double", { "avoidEscape": true }]*/
var wordEnds = function wordEnds(size) {
  return size > 1 ? "s" : "";
};

var logMessage = exports.logMessage = function logMessage(message, context) {
  var pre = context ? `[${context}] ` : "";
  var logStr = `  ${pre}${message}`;
  console.log(logStr);
};

var logPlugin = exports.logPlugin = function logPlugin(plugin, targets, list, context) {
  var envList = list[plugin] || {};
  var filteredList = Object.keys(targets).reduce(function (a, b) {
    if (!envList[b] || _semver2.default.lt(targets[b], (0, _utils.semverify)(envList[b]))) {
      a[b] = (0, _utils.prettifyVersion)(targets[b]);
    }

    return a;
  }, {});
  var formattedTargets = JSON.stringify(filteredList).replace(/\,/g, ", ").replace(/^\{\"/, '{ "').replace(/\"\}$/, '" }');
  logMessage(`${plugin} ${formattedTargets}`, context);
};

var logEntryPolyfills = exports.logEntryPolyfills = function logEntryPolyfills(importPolyfillIncluded, polyfills, filename, onDebug) {
  if (!importPolyfillIncluded) {
    console.log(`
[${filename}] \`import 'babel-polyfill'\` was not found.`);
    return;
  }

  if (!polyfills.size) {
    console.log(`
[${filename}] Based on your targets, none were added.`);
    return;
  }

  console.log(`
[${filename}] Replaced \`babel-polyfill\` with the following polyfill${wordEnds(polyfills.size)}:`);
  onDebug(polyfills);
};

var logUsagePolyfills = exports.logUsagePolyfills = function logUsagePolyfills(polyfills, filename, onDebug) {
  if (!polyfills.size) {
    console.log(`
[${filename}] Based on your code and targets, none were added.`);
    return;
  }

  console.log(`
[${filename}] Added following polyfill${wordEnds(polyfills.size)}:`);
  onDebug(polyfills);
};