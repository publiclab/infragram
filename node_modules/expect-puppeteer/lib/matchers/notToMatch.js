"use strict";

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _options = require("../options");

async function notToMatch(instance, matcher, options) {
  options = (0, _options.defaultOptions)(options);
  const {
    traverseShadowRoots = false
  } = options;
  const {
    page,
    handle
  } = await (0, _utils.getContext)(instance, () => document.body);

  try {
    await page.waitForFunction((handle, matcher, traverseShadowRoots) => {
      function getShadowTextContent(node) {
        const walker = document.createTreeWalker(node, // eslint-disable-next-line no-bitwise
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
        let result = '';
        let currentNode = walker.nextNode();

        while (currentNode) {
          if (currentNode.assignedSlot) {
            // Skip everything within this subtree, since it's assigned to a slot in the shadow DOM.
            const nodeWithAssignedSlot = currentNode;

            while (currentNode === nodeWithAssignedSlot || nodeWithAssignedSlot.contains(currentNode)) {
              currentNode = walker.nextNode();
            } // eslint-disable-next-line no-continue


            continue;
          } else if (currentNode.nodeType === Node.TEXT_NODE) {
            result += currentNode.textContent;
          } else if (currentNode.shadowRoot) {
            result += getShadowTextContent(currentNode.shadowRoot);
          } else if (typeof currentNode.assignedNodes === 'function') {
            const assignedNodes = currentNode.assignedNodes(); // eslint-disable-next-line no-loop-func

            assignedNodes.forEach(node => {
              result += getShadowTextContent(node);
            });
          }

          currentNode = walker.nextNode();
        }

        return result;
      }

      if (!handle) return false;
      const textContent = traverseShadowRoots ? getShadowTextContent(handle) : handle.textContent;
      return textContent.match(new RegExp(matcher)) === null;
    }, options, handle, matcher, traverseShadowRoots);
  } catch (error) {
    throw (0, _utils.enhanceError)(error, `Text found "${matcher}"`);
  }
}

var _default = notToMatch;
exports.default = _default;