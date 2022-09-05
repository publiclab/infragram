"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _options = require("../options");

async function notToMatchElement(instance, selector, {
  text,
  ...options
} = {}) {
  options = (0, _options.defaultOptions)(options);
  const {
    page,
    handle
  } = await (0, _utils.getContext)(instance, () => document);

  try {
    await page.waitForFunction((handle, selector, text) => {
      const elements = handle.querySelectorAll(selector);

      if (text !== undefined) {
        return [...elements].every(({
          textContent
        }) => !textContent.match(text));
      }

      return elements.length === 0;
    }, options, handle, selector, text);
  } catch (error) {
    throw (0, _utils.enhanceError)(error, `Element ${selector}${text !== undefined ? ` (text: "${text}") ` : ' '}found`);
  }
}

var _default = notToMatchElement;
exports.default = _default;