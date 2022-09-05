"use strict";

exports.__esModule = true;
exports.validateUseBuiltInsOption = exports.objectToBrowserslist = exports.validateModulesOption = exports.validateIgnoreBrowserslistConfig = exports.validateBoolOption = exports.validateConfigPathOption = exports.checkDuplicateIncludeExcludes = exports.normalizePluginNames = exports.normalizePluginName = exports.validateIncludesAndExcludes = undefined;
exports.default = normalizeOptions;

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

var _browserslist = require("browserslist");

var _browserslist2 = _interopRequireDefault(_browserslist);

var _builtIns = require("../data/built-ins.json");

var _builtIns2 = _interopRequireDefault(_builtIns);

var _defaultIncludes = require("./default-includes");

var _moduleTransformations = require("./module-transformations");

var _moduleTransformations2 = _interopRequireDefault(_moduleTransformations);

var _plugins = require("../data/plugins.json");

var _plugins2 = _interopRequireDefault(_plugins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validIncludesAndExcludes = new Set([].concat(Object.keys(_plugins2.default), Object.keys(_moduleTransformations2.default).map(function (m) {
  return _moduleTransformations2.default[m];
}), Object.keys(_builtIns2.default), _defaultIncludes.defaultWebIncludes));

var validateIncludesAndExcludes = exports.validateIncludesAndExcludes = function validateIncludesAndExcludes(opts, type) {
  if (opts === void 0) {
    opts = [];
  }

  (0, _invariant2.default)(Array.isArray(opts), `Invalid Option: The '${type}' option must be an Array<String> of plugins/built-ins`);
  var unknownOpts = opts.filter(function (opt) {
    return !validIncludesAndExcludes.has(opt);
  });
  (0, _invariant2.default)(unknownOpts.length === 0, `Invalid Option: The plugins/built-ins '${unknownOpts.join(", ")}' passed to the '${type}' option are not
    valid. Please check data/[plugin-features|built-in-features].js in babel-preset-env`);
  return opts;
};

var validBrowserslistTargets = [].concat(Object.keys(_browserslist2.default.data), Object.keys(_browserslist2.default.aliases));

var normalizePluginName = exports.normalizePluginName = function normalizePluginName(plugin) {
  return plugin.replace(/^babel-plugin-/, "");
};

var normalizePluginNames = exports.normalizePluginNames = function normalizePluginNames(plugins) {
  return plugins.map(normalizePluginName);
};

var checkDuplicateIncludeExcludes = exports.checkDuplicateIncludeExcludes = function checkDuplicateIncludeExcludes(include, exclude) {
  if (include === void 0) {
    include = [];
  }

  if (exclude === void 0) {
    exclude = [];
  }

  var duplicates = include.filter(function (opt) {
    return exclude.indexOf(opt) >= 0;
  });
  (0, _invariant2.default)(duplicates.length === 0, `Invalid Option: The plugins/built-ins '${duplicates.join(", ")}' were found in both the "include" and
    "exclude" options.`);
};

var validateConfigPathOption = exports.validateConfigPathOption = function validateConfigPathOption(configPath) {
  if (configPath === void 0) {
    configPath = process.cwd();
  }

  (0, _invariant2.default)(typeof configPath === "string", `Invalid Option: The configPath option '${configPath}' is invalid, only strings are allowed.`);
  return configPath;
};

var validateBoolOption = exports.validateBoolOption = function validateBoolOption(name, value, defaultValue) {
  if (typeof value === "undefined") {
    value = defaultValue;
  }

  if (typeof value !== "boolean") {
    throw new Error(`Preset env: '${name}' option must be a boolean.`);
  }

  return value;
};

var validateIgnoreBrowserslistConfig = exports.validateIgnoreBrowserslistConfig = function validateIgnoreBrowserslistConfig(ignoreBrowserslistConfig) {
  return validateBoolOption("ignoreBrowserslistConfig", ignoreBrowserslistConfig, false);
};

var validateModulesOption = exports.validateModulesOption = function validateModulesOption(modulesOpt) {
  if (modulesOpt === void 0) {
    modulesOpt = "commonjs";
  }

  (0, _invariant2.default)(modulesOpt === false || Object.keys(_moduleTransformations2.default).indexOf(modulesOpt) > -1, `Invalid Option: The 'modules' option must be either 'false' to indicate no modules, or a
    module type which can be be one of: 'commonjs' (default), 'amd', 'umd', 'systemjs'.`);
  return modulesOpt;
};

var objectToBrowserslist = exports.objectToBrowserslist = function objectToBrowserslist(object) {
  return Object.keys(object).reduce(function (list, targetName) {
    if (validBrowserslistTargets.indexOf(targetName) >= 0) {
      var targetVersion = object[targetName];
      return list.concat(`${targetName} ${targetVersion}`);
    }

    return list;
  }, []);
};

var validateUseBuiltInsOption = exports.validateUseBuiltInsOption = function validateUseBuiltInsOption(builtInsOpt) {
  if (builtInsOpt === void 0) {
    builtInsOpt = false;
  }

  (0, _invariant2.default)(builtInsOpt === "usage" || builtInsOpt === false || builtInsOpt === "entry", `Invalid Option: The 'useBuiltIns' option must be either
    'false' (default) to indicate no polyfill,
    '"entry"' to indicate replacing the entry polyfill, or
    '"usage"' to import only used polyfills per file`);
  return builtInsOpt;
};

function normalizeOptions(opts) {
  if (opts.exclude) {
    opts.exclude = normalizePluginNames(opts.exclude);
  }

  if (opts.include) {
    opts.include = normalizePluginNames(opts.include);
  }

  checkDuplicateIncludeExcludes(opts.include, opts.exclude);
  return {
    configPath: validateConfigPathOption(opts.configPath),
    debug: opts.debug,
    exclude: validateIncludesAndExcludes(opts.exclude, "exclude"),
    forceAllTransforms: validateBoolOption("forceAllTransforms", opts.forceAllTransforms, false),
    ignoreBrowserslistConfig: validateIgnoreBrowserslistConfig(opts.ignoreBrowserslistConfig),
    include: validateIncludesAndExcludes(opts.include, "include"),
    loose: validateBoolOption("loose", opts.loose, false),
    modules: validateModulesOption(opts.modules),
    shippedProposals: validateBoolOption("shippedProposals", opts.shippedProposals, false),
    spec: validateBoolOption("loose", opts.spec, false),
    targets: opts.targets,
    useBuiltIns: validateUseBuiltInsOption(opts.useBuiltIns)
  };
}