"use strict";

exports.__esModule = true;

exports.default = function (_ref) {
  var t = _ref.types;

  function addImport(path, builtIn, builtIns) {
    if (builtIn && !builtIns.has(builtIn)) {
      builtIns.add(builtIn);
      var importDec = t.importDeclaration([], t.stringLiteral(getModulePath(builtIn)));
      importDec._blockHoist = 3;
      var programPath = path.find(function (path) {
        return path.isProgram();
      });
      programPath.unshiftContainer("body", importDec);
    }
  }

  function addUnsupported(path, polyfills, builtIn, builtIns) {
    if (Array.isArray(builtIn)) {
      for (var _iterator = builtIn, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref2 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref2 = _i.value;
        }

        var _i2 = _ref2;

        if (polyfills.has(_i2)) {
          addImport(path, _i2, builtIns);
        }
      }
    } else {
      if (polyfills.has(builtIn)) {
        addImport(path, builtIn, builtIns);
      }
    }
  }

  function isRequire(path) {
    return t.isExpressionStatement(path.node) && t.isCallExpression(path.node.expression) && t.isIdentifier(path.node.expression.callee) && path.node.expression.callee.name === "require" && path.node.expression.arguments.length === 1 && t.isStringLiteral(path.node.expression.arguments[0]) && isPolyfillSource(path.node.expression.arguments[0].value);
  }

  var addAndRemovePolyfillImports = {
    ImportDeclaration(path) {
      if (path.node.specifiers.length === 0 && isPolyfillSource(path.node.source.value)) {
        console.warn(`
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the \`import 'babel-polyfill'\` call or use \`useBuiltIns: 'entry'\` instead.`);
        path.remove();
      }
    },

    Program: {
      enter(path) {
        path.get("body").forEach(function (bodyPath) {
          if (isRequire(bodyPath)) {
            console.warn(`
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the \`require('babel-polyfill')\` call or use \`useBuiltIns: 'entry'\` instead.`);
            bodyPath.remove();
          }
        });
      }

    },

    // Symbol()
    // new Promise
    ReferencedIdentifier(path, state) {
      var node = path.node,
          parent = path.parent,
          scope = path.scope;
      if (t.isMemberExpression(parent)) return;
      if (!has(_builtInDefinitions.definitions.builtins, node.name)) return;
      if (scope.getBindingIdentifier(node.name)) return;
      var builtIn = _builtInDefinitions.definitions.builtins[node.name];
      addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
    },

    // arr[Symbol.iterator]()
    CallExpression(path) {
      // we can't compile this
      if (path.node.arguments.length) return;
      var callee = path.node.callee;
      if (!t.isMemberExpression(callee)) return;
      if (!callee.computed) return;

      if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
        return;
      }

      addImport(path, "web.dom.iterable", this.builtIns);
    },

    // Symbol.iterator in arr
    BinaryExpression(path) {
      if (path.node.operator !== "in") return;
      if (!path.get("left").matchesPattern("Symbol.iterator")) return;
      addImport(path, "web.dom.iterable", this.builtIns);
    },

    // yield*
    YieldExpression(path) {
      if (!path.node.delegate) return;
      addImport(path, "web.dom.iterable", this.builtIns);
    },

    // Array.from
    MemberExpression: {
      enter(path, state) {
        if (!path.isReferenced()) return;
        var node = path.node;
        var obj = node.object;
        var prop = node.property;
        if (!t.isReferenced(obj, node)) return; // doesn't reference the global

        if (path.scope.getBindingIdentifier(obj.name)) return;

        if (has(_builtInDefinitions.definitions.staticMethods, obj.name)) {
          var staticMethods = _builtInDefinitions.definitions.staticMethods[obj.name];

          if (has(staticMethods, prop.name)) {
            var builtIn = staticMethods[prop.name];
            addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns); // if (obj.name === "Array" && prop.name === "from") {
            //   addImport(
            //     path,
            //     "babel-polyfill/lib/core-js/modules/web.dom.iterable",
            //     this.builtIns,
            //   );
            // }
          }
        }

        if (!node.computed && t.isIdentifier(prop) && has(_builtInDefinitions.definitions.instanceMethods, prop.name)) {
          warnOnInstanceMethod(state, getObjectString(node));
          var _builtIn = _builtInDefinitions.definitions.instanceMethods[prop.name];
          addUnsupported(path, state.opts.polyfills, _builtIn, this.builtIns);
        } else if (node.computed) {
          if (t.isStringLiteral(prop) && has(_builtInDefinitions.definitions.instanceMethods, prop.value)) {
            var _builtIn2 = _builtInDefinitions.definitions.instanceMethods[prop.value];
            warnOnInstanceMethod(state, `${obj.name}['${prop.value}']`);
            addUnsupported(path, state.opts.polyfills, _builtIn2, this.builtIns);
          } else {
            var res = path.get("property").evaluate();

            if (res.confident) {
              var _builtIn3 = _builtInDefinitions.definitions.instanceMethods[res.value];
              warnOnInstanceMethod(state, `${obj.name}['${res.value}']`);
              addUnsupported(path.get("property"), state.opts.polyfills, _builtIn3, this.builtIns);
            }
          }
        }
      },

      // Symbol.match
      exit(path, state) {
        if (!path.isReferenced()) return;
        var node = path.node;
        var obj = node.object;
        if (!has(_builtInDefinitions.definitions.builtins, obj.name)) return;
        if (path.scope.getBindingIdentifier(obj.name)) return;
        var builtIn = _builtInDefinitions.definitions.builtins[obj.name];
        addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
      }

    },

    // var { repeat, startsWith } = String
    VariableDeclarator(path, state) {
      if (!path.isReferenced()) return;
      var node = path.node;
      var obj = node.init;
      if (!t.isObjectPattern(node.id)) return;
      var props = node.id.properties;
      if (!t.isReferenced(obj, node)) return; // doesn't reference the global

      if (path.scope.getBindingIdentifier(obj.name)) return;

      for (var _iterator2 = props, _isArray2 = Array.isArray(_iterator2), _i3 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref3;

        if (_isArray2) {
          if (_i3 >= _iterator2.length) break;
          _ref3 = _iterator2[_i3++];
        } else {
          _i3 = _iterator2.next();
          if (_i3.done) break;
          _ref3 = _i3.value;
        }

        var _prop = _ref3;
        _prop = _prop.key;

        if (!node.computed && t.isIdentifier(_prop) && has(_builtInDefinitions.definitions.instanceMethods, _prop.name)) {
          warnOnInstanceMethod(state, `${path.parentPath.node.kind} { ${_prop.name} } = ${obj.name}`);
          var builtIn = _builtInDefinitions.definitions.instanceMethods[_prop.name];
          addUnsupported(path, state.opts.polyfills, builtIn, this.builtIns);
        }
      }
    },

    Function(path, state) {
      if (!this.usesRegenerator && (path.node.generator || path.node.async)) {
        this.usesRegenerator = true;

        if (state.opts.regenerator) {
          addImport(path, "regenerator-runtime", this.builtIns);
        }
      }
    }

  };
  return {
    name: "use-built-ins",

    pre() {
      this.builtIns = new Set();
      this.usesRegenerator = false;
    },

    post() {
      var _opts = this.opts,
          debug = _opts.debug,
          onDebug = _opts.onDebug;

      if (debug) {
        (0, _debug.logUsagePolyfills)(this.builtIns, this.file.opts.filename, onDebug);
      }
    },

    visitor: addAndRemovePolyfillImports
  };
};

var _builtInDefinitions = require("./built-in-definitions");

var _debug = require("./debug");

function isPolyfillSource(value) {
  return value === "babel-polyfill";
}

function warnOnInstanceMethod() {// state.opts.debug &&
  //   console.warn(
  //     `Adding a polyfill: An instance method may have been used: ${details}`,
  //   );
}

function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function getObjectString(node) {
  if (node.type === "Identifier") {
    return node.name;
  } else if (node.type === "MemberExpression") {
    return `${getObjectString(node.object)}.${getObjectString(node.property)}`;
  }

  return node.name;
}

var modulePathMap = {
  "regenerator-runtime": "babel-polyfill/lib/regenerator-runtime/runtime"
};

var getModulePath = function getModulePath(module) {
  return modulePathMap[module] || `babel-polyfill/lib/core-js/modules/${module}`;
};