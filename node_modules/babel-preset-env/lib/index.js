"use strict";

exports.__esModule = true;
exports.transformIncludesAndExcludes = exports.isPluginRequired = undefined;
exports.default = buildPreset;

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

var _builtIns = require("../data/built-ins.json");

var _builtIns2 = _interopRequireDefault(_builtIns);

var _debug = require("./debug");

var _defaultIncludes = require("./default-includes");

var _moduleTransformations = require("./module-transformations");

var _moduleTransformations2 = _interopRequireDefault(_moduleTransformations);

var _normalizeOptions2 = require("./normalize-options.js");

var _normalizeOptions3 = _interopRequireDefault(_normalizeOptions2);

var _plugins = require("../data/plugins.json");

var _plugins2 = _interopRequireDefault(_plugins);

var _shippedProposals = require("../data/shipped-proposals.js");

var _useBuiltInsEntryPlugin = require("./use-built-ins-entry-plugin");

var _useBuiltInsEntryPlugin2 = _interopRequireDefault(_useBuiltInsEntryPlugin);

var _useBuiltInsPlugin = require("./use-built-ins-plugin");

var _useBuiltInsPlugin2 = _interopRequireDefault(_useBuiltInsPlugin);

var _targetsParser = require("./targets-parser");

var _targetsParser2 = _interopRequireDefault(_targetsParser);

var _availablePlugins = require("./available-plugins");

var _availablePlugins2 = _interopRequireDefault(_availablePlugins);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getPlugin = function getPlugin(pluginName) {
  var plugin = _availablePlugins2.default[pluginName];

  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }

  return plugin;
};

var builtInsListWithoutProposals = (0, _utils.filterStageFromList)(_builtIns2.default, _shippedProposals.builtIns);
var pluginListWithoutProposals = (0, _utils.filterStageFromList)(_plugins2.default, _shippedProposals.features);

var isPluginRequired = exports.isPluginRequired = function isPluginRequired(supportedEnvironments, plugin) {
  var targetEnvironments = Object.keys(supportedEnvironments);

  if (targetEnvironments.length === 0) {
    return true;
  }

  var isRequiredForEnvironments = targetEnvironments.filter(function (environment) {
    // Feature is not implemented in that environment
    if (!plugin[environment]) {
      return true;
    }

    var lowestImplementedVersion = plugin[environment];
    var lowestTargetedVersion = supportedEnvironments[environment];

    if (!_semver2.default.valid(lowestTargetedVersion)) {
      throw new Error( // eslint-disable-next-line max-len
      `Invalid version passed for target "${environment}": "${lowestTargetedVersion}". Versions must be in semver format (major.minor.patch)`);
    }

    return _semver2.default.gt((0, _utils.semverify)(lowestImplementedVersion), lowestTargetedVersion);
  });
  return isRequiredForEnvironments.length > 0;
};

var hasBeenLogged = false;

var getBuiltInTargets = function getBuiltInTargets(targets) {
  var builtInTargets = Object.assign({}, targets);

  if (builtInTargets.uglify != null) {
    delete builtInTargets.uglify;
  }

  return builtInTargets;
};

var transformIncludesAndExcludes = exports.transformIncludesAndExcludes = function transformIncludesAndExcludes(opts) {
  return opts.reduce(function (result, opt) {
    var target = opt.match(/^(es\d+|web)\./) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
};

var getPlatformSpecificDefaultFor = function getPlatformSpecificDefaultFor(targets) {
  var targetNames = Object.keys(targets);
  var isAnyTarget = !targetNames.length;
  var isWebTarget = targetNames.some(function (name) {
    return name !== "node";
  });
  return isAnyTarget || isWebTarget ? _defaultIncludes.defaultWebIncludes : null;
};

var filterItems = function filterItems(list, includes, excludes, targets, defaultItems) {
  var result = new Set();

  for (var item in list) {
    var excluded = excludes.has(item);

    if (!excluded) {
      if (isPluginRequired(targets, list[item])) {
        result.add(item);
      } else {
        var shippedProposalsSyntax = _shippedProposals.pluginSyntaxMap.get(item);

        if (shippedProposalsSyntax) {
          result.add(shippedProposalsSyntax);
        }
      }
    }
  }

  if (defaultItems) {
    defaultItems.forEach(function (item) {
      return !excludes.has(item) && result.add(item);
    });
  }

  includes.forEach(function (item) {
    return result.add(item);
  });
  return result;
};

function buildPreset(context, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var _normalizeOptions = (0, _normalizeOptions3.default)(opts),
      configPath = _normalizeOptions.configPath,
      debug = _normalizeOptions.debug,
      optionsExclude = _normalizeOptions.exclude,
      forceAllTransforms = _normalizeOptions.forceAllTransforms,
      ignoreBrowserslistConfig = _normalizeOptions.ignoreBrowserslistConfig,
      optionsInclude = _normalizeOptions.include,
      loose = _normalizeOptions.loose,
      modules = _normalizeOptions.modules,
      shippedProposals = _normalizeOptions.shippedProposals,
      spec = _normalizeOptions.spec,
      optionsTargets = _normalizeOptions.targets,
      useBuiltIns = _normalizeOptions.useBuiltIns; // TODO: remove this in next major


  var hasUglifyTarget = false;

  if (optionsTargets && optionsTargets.uglify) {
    hasUglifyTarget = true;
    delete optionsTargets.uglify;
    console.log("");
    console.log("The uglify target has been deprecated. Set the top level");
    console.log("option `forceAllTransforms: true` instead.");
    console.log("");
  }

  var targets = (0, _targetsParser2.default)(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath
  });
  var include = transformIncludesAndExcludes(optionsInclude);
  var exclude = transformIncludesAndExcludes(optionsExclude);
  var transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  var transformations = filterItems(shippedProposals ? _plugins2.default : pluginListWithoutProposals, include.plugins, exclude.plugins, transformTargets);
  var polyfills = void 0;
  var polyfillTargets = void 0;

  if (useBuiltIns) {
    polyfillTargets = getBuiltInTargets(targets);
    polyfills = filterItems(shippedProposals ? _builtIns2.default : builtInsListWithoutProposals, include.builtIns, exclude.builtIns, polyfillTargets, getPlatformSpecificDefaultFor(polyfillTargets));
  }

  var plugins = [];
  var pluginUseBuiltIns = useBuiltIns !== false; // NOTE: not giving spec here yet to avoid compatibility issues when
  // babel-plugin-transform-es2015-modules-commonjs gets its spec mode

  if (modules !== false && _moduleTransformations2.default[modules]) {
    plugins.push([getPlugin(_moduleTransformations2.default[modules]), {
      loose
    }]);
  }

  transformations.forEach(function (pluginName) {
    return plugins.push([getPlugin(pluginName), {
      spec,
      loose,
      useBuiltIns: pluginUseBuiltIns
    }]);
  });
  var regenerator = transformations.has("transform-regenerator");

  if (debug && !hasBeenLogged) {
    hasBeenLogged = true;
    console.log("babel-preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify((0, _utils.prettifyTargets)(targets), null, 2));
    console.log(`\nUsing modules transform: ${modules.toString()}`);
    console.log("\nUsing plugins:");
    transformations.forEach(function (transform) {
      (0, _debug.logPlugin)(transform, targets, _plugins2.default);
    });

    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    } else {
      console.log(`
Using polyfills with \`${useBuiltIns}\` option:`);
    }
  }

  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    var pluginOptions = {
      debug,
      polyfills,
      regenerator,
      onDebug: function onDebug(polyfills, context) {
        polyfills.forEach(function (polyfill) {
          return (0, _debug.logPlugin)(polyfill, polyfillTargets, _builtIns2.default, context);
        });
      }
    };
    plugins.push([useBuiltIns === "usage" ? _useBuiltInsPlugin2.default : _useBuiltInsEntryPlugin2.default, pluginOptions]);
  }

  return {
    plugins
  };
}