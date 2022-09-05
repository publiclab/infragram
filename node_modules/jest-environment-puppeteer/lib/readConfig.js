"use strict";

exports.__esModule = true;
exports.getPuppeteer = getPuppeteer;
exports.readConfig = readConfig;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _util = require("util");

var _cwd = _interopRequireDefault(require("cwd"));

var _mergeDeep = _interopRequireDefault(require("merge-deep"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const exists = (0, _util.promisify)(_fs.default.exists);
const DEFAULT_CONFIG = {
  launch: {},
  browserContext: 'default',
  exitOnPageError: true
};
const DEFAULT_CONFIG_CI = (0, _mergeDeep.default)(DEFAULT_CONFIG, {
  launch: {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding']
  }
});

async function readConfig() {
  const defaultConfig = process.env.CI === 'true' ? DEFAULT_CONFIG_CI : DEFAULT_CONFIG;
  const hasCustomConfigPath = !!process.env.JEST_PUPPETEER_CONFIG;
  const configPath = process.env.JEST_PUPPETEER_CONFIG || 'jest-puppeteer.config.js';

  const absConfigPath = _path.default.resolve((0, _cwd.default)(), configPath);

  const configExists = await exists(absConfigPath);

  if (hasCustomConfigPath && !configExists) {
    throw new Error(`Error: Can't find a root directory while resolving a config file path.\nProvided path to resolve: ${configPath}`);
  }

  if (!hasCustomConfigPath && !configExists) {
    return defaultConfig;
  } // eslint-disable-next-line global-require, import/no-dynamic-require


  const localConfig = await require(absConfigPath);
  const product = localConfig.launch ? localConfig.launch.product : undefined; // Move browser config to launch.product

  if (product === undefined && localConfig.browser) {
    // eslint-disable-next-line no-console
    console.warn('`browser` config has been deprecated and will be removed in future versions. Use `launch.product` config with `chrome` or `firefox` instead.');
    let launch = {};

    if (localConfig.launch) {
      launch = localConfig.launch;
    }

    launch.product = localConfig.browser === 'chromium' ? 'chrome' : localConfig.browser;
    localConfig.launch = launch;
  } // Ensure that launch.product is equal to 'chrome', or 'firefox'


  if (product !== undefined && !['chrome', 'firefox'].includes(product)) {
    throw new Error(`Error: Invalid product value '${product}'`);
  }

  return (0, _mergeDeep.default)({}, defaultConfig, localConfig);
}

function getPuppeteer() {
  /* eslint-disable global-require, import/no-dynamic-require, import/no-extraneous-dependencies, import/no-unresolved */
  try {
    return require('puppeteer');
  } catch (e) {
    return require('puppeteer-core');
  }
  /* eslint-enable */

}