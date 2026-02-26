// node_modules/wicg-inert/dist/inert.esm.js
var _createClass = /* @__PURE__ */ function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
(function() {
  if (typeof window === "undefined" || typeof Element === "undefined") {
    return;
  }
  var slice = Array.prototype.slice;
  var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
  var _focusableElementsString = ["a[href]", "area[href]", "input:not([disabled])", "select:not([disabled])", "textarea:not([disabled])", "button:not([disabled])", "details", "summary", "iframe", "object", "embed", "video", "[contenteditable]"].join(",");
  var InertRoot = function() {
    function InertRoot2(rootElement, inertManager2) {
      _classCallCheck(this, InertRoot2);
      this._inertManager = inertManager2;
      this._rootElement = rootElement;
      this._managedNodes = /* @__PURE__ */ new Set();
      if (this._rootElement.hasAttribute("aria-hidden")) {
        this._savedAriaHidden = this._rootElement.getAttribute("aria-hidden");
      } else {
        this._savedAriaHidden = null;
      }
      this._rootElement.setAttribute("aria-hidden", "true");
      this._makeSubtreeUnfocusable(this._rootElement);
      this._observer = new MutationObserver(this._onMutation.bind(this));
      this._observer.observe(this._rootElement, { attributes: true, childList: true, subtree: true });
    }
    _createClass(InertRoot2, [{
      key: "destructor",
      value: function destructor() {
        this._observer.disconnect();
        if (this._rootElement) {
          if (this._savedAriaHidden !== null) {
            this._rootElement.setAttribute("aria-hidden", this._savedAriaHidden);
          } else {
            this._rootElement.removeAttribute("aria-hidden");
          }
        }
        this._managedNodes.forEach(function(inertNode) {
          this._unmanageNode(inertNode.node);
        }, this);
        this._observer = /** @type {?} */
        null;
        this._rootElement = /** @type {?} */
        null;
        this._managedNodes = /** @type {?} */
        null;
        this._inertManager = /** @type {?} */
        null;
      }
      /**
       * @return {!Set<!InertNode>} A copy of this InertRoot's managed nodes set.
       */
    }, {
      key: "_makeSubtreeUnfocusable",
      /**
       * @param {!Node} startNode
       */
      value: function _makeSubtreeUnfocusable(startNode) {
        var _this2 = this;
        composedTreeWalk(startNode, function(node2) {
          return _this2._visitNode(node2);
        });
        var activeElement = document.activeElement;
        if (!document.body.contains(startNode)) {
          var node = startNode;
          var root = void 0;
          while (node) {
            if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
              root = /** @type {!ShadowRoot} */
              node;
              break;
            }
            node = node.parentNode;
          }
          if (root) {
            activeElement = root.activeElement;
          }
        }
        if (startNode.contains(activeElement)) {
          activeElement.blur();
          if (activeElement === document.activeElement) {
            document.body.focus();
          }
        }
      }
      /**
       * @param {!Node} node
       */
    }, {
      key: "_visitNode",
      value: function _visitNode(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        var element = (
          /** @type {!HTMLElement} */
          node
        );
        if (element !== this._rootElement && element.hasAttribute("inert")) {
          this._adoptInertRoot(element);
        }
        if (matches.call(element, _focusableElementsString) || element.hasAttribute("tabindex")) {
          this._manageNode(element);
        }
      }
      /**
       * Register the given node with this InertRoot and with InertManager.
       * @param {!Node} node
       */
    }, {
      key: "_manageNode",
      value: function _manageNode(node) {
        var inertNode = this._inertManager.register(node, this);
        this._managedNodes.add(inertNode);
      }
      /**
       * Unregister the given node with this InertRoot and with InertManager.
       * @param {!Node} node
       */
    }, {
      key: "_unmanageNode",
      value: function _unmanageNode(node) {
        var inertNode = this._inertManager.deregister(node, this);
        if (inertNode) {
          this._managedNodes["delete"](inertNode);
        }
      }
      /**
       * Unregister the entire subtree starting at `startNode`.
       * @param {!Node} startNode
       */
    }, {
      key: "_unmanageSubtree",
      value: function _unmanageSubtree(startNode) {
        var _this3 = this;
        composedTreeWalk(startNode, function(node) {
          return _this3._unmanageNode(node);
        });
      }
      /**
       * If a descendant node is found with an `inert` attribute, adopt its managed nodes.
       * @param {!HTMLElement} node
       */
    }, {
      key: "_adoptInertRoot",
      value: function _adoptInertRoot(node) {
        var inertSubroot = this._inertManager.getInertRoot(node);
        if (!inertSubroot) {
          this._inertManager.setInert(node, true);
          inertSubroot = this._inertManager.getInertRoot(node);
        }
        inertSubroot.managedNodes.forEach(function(savedInertNode) {
          this._manageNode(savedInertNode.node);
        }, this);
      }
      /**
       * Callback used when mutation observer detects subtree additions, removals, or attribute changes.
       * @param {!Array<!MutationRecord>} records
       * @param {!MutationObserver} self
       */
    }, {
      key: "_onMutation",
      value: function _onMutation(records, self) {
        records.forEach(function(record) {
          var target = (
            /** @type {!HTMLElement} */
            record.target
          );
          if (record.type === "childList") {
            slice.call(record.addedNodes).forEach(function(node) {
              this._makeSubtreeUnfocusable(node);
            }, this);
            slice.call(record.removedNodes).forEach(function(node) {
              this._unmanageSubtree(node);
            }, this);
          } else if (record.type === "attributes") {
            if (record.attributeName === "tabindex") {
              this._manageNode(target);
            } else if (target !== this._rootElement && record.attributeName === "inert" && target.hasAttribute("inert")) {
              this._adoptInertRoot(target);
              var inertSubroot = this._inertManager.getInertRoot(target);
              this._managedNodes.forEach(function(managedNode) {
                if (target.contains(managedNode.node)) {
                  inertSubroot._manageNode(managedNode.node);
                }
              });
            }
          }
        }, this);
      }
    }, {
      key: "managedNodes",
      get: function get() {
        return new Set(this._managedNodes);
      }
      /** @return {boolean} */
    }, {
      key: "hasSavedAriaHidden",
      get: function get() {
        return this._savedAriaHidden !== null;
      }
      /** @param {?string} ariaHidden */
    }, {
      key: "savedAriaHidden",
      set: function set(ariaHidden) {
        this._savedAriaHidden = ariaHidden;
      },
      get: function get() {
        return this._savedAriaHidden;
      }
    }]);
    return InertRoot2;
  }();
  var InertNode = function() {
    function InertNode2(node, inertRoot) {
      _classCallCheck(this, InertNode2);
      this._node = node;
      this._overrodeFocusMethod = false;
      this._inertRoots = /* @__PURE__ */ new Set([inertRoot]);
      this._savedTabIndex = null;
      this._destroyed = false;
      this.ensureUntabbable();
    }
    _createClass(InertNode2, [{
      key: "destructor",
      value: function destructor() {
        this._throwIfDestroyed();
        if (this._node && this._node.nodeType === Node.ELEMENT_NODE) {
          var element = (
            /** @type {!HTMLElement} */
            this._node
          );
          if (this._savedTabIndex !== null) {
            element.setAttribute("tabindex", this._savedTabIndex);
          } else {
            element.removeAttribute("tabindex");
          }
          if (this._overrodeFocusMethod) {
            delete element.focus;
          }
        }
        this._node = /** @type {?} */
        null;
        this._inertRoots = /** @type {?} */
        null;
        this._destroyed = true;
      }
      /**
       * @type {boolean} Whether this object is obsolete because the managed node is no longer inert.
       * If the object has been destroyed, any attempt to access it will cause an exception.
       */
    }, {
      key: "_throwIfDestroyed",
      /**
       * Throw if user tries to access destroyed InertNode.
       */
      value: function _throwIfDestroyed() {
        if (this.destroyed) {
          throw new Error("Trying to access destroyed InertNode");
        }
      }
      /** @return {boolean} */
    }, {
      key: "ensureUntabbable",
      /** Save the existing tabindex value and make the node untabbable and unfocusable */
      value: function ensureUntabbable() {
        if (this.node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        var element = (
          /** @type {!HTMLElement} */
          this.node
        );
        if (matches.call(element, _focusableElementsString)) {
          if (
            /** @type {!HTMLElement} */
            element.tabIndex === -1 && this.hasSavedTabIndex
          ) {
            return;
          }
          if (element.hasAttribute("tabindex")) {
            this._savedTabIndex = /** @type {!HTMLElement} */
            element.tabIndex;
          }
          element.setAttribute("tabindex", "-1");
          if (element.nodeType === Node.ELEMENT_NODE) {
            element.focus = function() {
            };
            this._overrodeFocusMethod = true;
          }
        } else if (element.hasAttribute("tabindex")) {
          this._savedTabIndex = /** @type {!HTMLElement} */
          element.tabIndex;
          element.removeAttribute("tabindex");
        }
      }
      /**
       * Add another inert root to this inert node's set of managing inert roots.
       * @param {!InertRoot} inertRoot
       */
    }, {
      key: "addInertRoot",
      value: function addInertRoot(inertRoot) {
        this._throwIfDestroyed();
        this._inertRoots.add(inertRoot);
      }
      /**
       * Remove the given inert root from this inert node's set of managing inert roots.
       * If the set of managing inert roots becomes empty, this node is no longer inert,
       * so the object should be destroyed.
       * @param {!InertRoot} inertRoot
       */
    }, {
      key: "removeInertRoot",
      value: function removeInertRoot(inertRoot) {
        this._throwIfDestroyed();
        this._inertRoots["delete"](inertRoot);
        if (this._inertRoots.size === 0) {
          this.destructor();
        }
      }
    }, {
      key: "destroyed",
      get: function get() {
        return (
          /** @type {!InertNode} */
          this._destroyed
        );
      }
    }, {
      key: "hasSavedTabIndex",
      get: function get() {
        return this._savedTabIndex !== null;
      }
      /** @return {!Node} */
    }, {
      key: "node",
      get: function get() {
        this._throwIfDestroyed();
        return this._node;
      }
      /** @param {?number} tabIndex */
    }, {
      key: "savedTabIndex",
      set: function set(tabIndex) {
        this._throwIfDestroyed();
        this._savedTabIndex = tabIndex;
      },
      get: function get() {
        this._throwIfDestroyed();
        return this._savedTabIndex;
      }
    }]);
    return InertNode2;
  }();
  var InertManager = function() {
    function InertManager2(document2) {
      _classCallCheck(this, InertManager2);
      if (!document2) {
        throw new Error("Missing required argument; InertManager needs to wrap a document.");
      }
      this._document = document2;
      this._managedNodes = /* @__PURE__ */ new Map();
      this._inertRoots = /* @__PURE__ */ new Map();
      this._observer = new MutationObserver(this._watchForInert.bind(this));
      addInertStyle(document2.head || document2.body || document2.documentElement);
      if (document2.readyState === "loading") {
        document2.addEventListener("DOMContentLoaded", this._onDocumentLoaded.bind(this));
      } else {
        this._onDocumentLoaded();
      }
    }
    _createClass(InertManager2, [{
      key: "setInert",
      value: function setInert(root, inert) {
        if (inert) {
          if (this._inertRoots.has(root)) {
            return;
          }
          var inertRoot = new InertRoot(root, this);
          root.setAttribute("inert", "");
          this._inertRoots.set(root, inertRoot);
          if (!this._document.body.contains(root)) {
            var parent = root.parentNode;
            while (parent) {
              if (parent.nodeType === 11) {
                addInertStyle(parent);
              }
              parent = parent.parentNode;
            }
          }
        } else {
          if (!this._inertRoots.has(root)) {
            return;
          }
          var _inertRoot = this._inertRoots.get(root);
          _inertRoot.destructor();
          this._inertRoots["delete"](root);
          root.removeAttribute("inert");
        }
      }
      /**
       * Get the InertRoot object corresponding to the given inert root element, if any.
       * @param {!Node} element
       * @return {!InertRoot|undefined}
       */
    }, {
      key: "getInertRoot",
      value: function getInertRoot(element) {
        return this._inertRoots.get(element);
      }
      /**
       * Register the given InertRoot as managing the given node.
       * In the case where the node has a previously existing inert root, this inert root will
       * be added to its set of inert roots.
       * @param {!Node} node
       * @param {!InertRoot} inertRoot
       * @return {!InertNode} inertNode
       */
    }, {
      key: "register",
      value: function register(node, inertRoot) {
        var inertNode = this._managedNodes.get(node);
        if (inertNode !== void 0) {
          inertNode.addInertRoot(inertRoot);
        } else {
          inertNode = new InertNode(node, inertRoot);
        }
        this._managedNodes.set(node, inertNode);
        return inertNode;
      }
      /**
       * De-register the given InertRoot as managing the given inert node.
       * Removes the inert root from the InertNode's set of managing inert roots, and remove the inert
       * node from the InertManager's set of managed nodes if it is destroyed.
       * If the node is not currently managed, this is essentially a no-op.
       * @param {!Node} node
       * @param {!InertRoot} inertRoot
       * @return {?InertNode} The potentially destroyed InertNode associated with this node, if any.
       */
    }, {
      key: "deregister",
      value: function deregister(node, inertRoot) {
        var inertNode = this._managedNodes.get(node);
        if (!inertNode) {
          return null;
        }
        inertNode.removeInertRoot(inertRoot);
        if (inertNode.destroyed) {
          this._managedNodes["delete"](node);
        }
        return inertNode;
      }
      /**
       * Callback used when document has finished loading.
       */
    }, {
      key: "_onDocumentLoaded",
      value: function _onDocumentLoaded() {
        var inertElements = slice.call(this._document.querySelectorAll("[inert]"));
        inertElements.forEach(function(inertElement) {
          this.setInert(inertElement, true);
        }, this);
        this._observer.observe(this._document.body || this._document.documentElement, { attributes: true, subtree: true, childList: true });
      }
      /**
       * Callback used when mutation observer detects attribute changes.
       * @param {!Array<!MutationRecord>} records
       * @param {!MutationObserver} self
       */
    }, {
      key: "_watchForInert",
      value: function _watchForInert(records, self) {
        var _this = this;
        records.forEach(function(record) {
          switch (record.type) {
            case "childList":
              slice.call(record.addedNodes).forEach(function(node) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                  return;
                }
                var inertElements = slice.call(node.querySelectorAll("[inert]"));
                if (matches.call(node, "[inert]")) {
                  inertElements.unshift(node);
                }
                inertElements.forEach(function(inertElement) {
                  this.setInert(inertElement, true);
                }, _this);
              }, _this);
              break;
            case "attributes":
              if (record.attributeName !== "inert") {
                return;
              }
              var target = (
                /** @type {!HTMLElement} */
                record.target
              );
              var inert = target.hasAttribute("inert");
              _this.setInert(target, inert);
              break;
          }
        }, this);
      }
    }]);
    return InertManager2;
  }();
  function composedTreeWalk(node, callback, shadowRootAncestor) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      var element = (
        /** @type {!HTMLElement} */
        node
      );
      if (callback) {
        callback(element);
      }
      var shadowRoot = (
        /** @type {!HTMLElement} */
        element.shadowRoot
      );
      if (shadowRoot) {
        composedTreeWalk(shadowRoot, callback, shadowRoot);
        return;
      }
      if (element.localName == "content") {
        var content = (
          /** @type {!HTMLContentElement} */
          element
        );
        var distributedNodes = content.getDistributedNodes ? content.getDistributedNodes() : [];
        for (var i = 0; i < distributedNodes.length; i++) {
          composedTreeWalk(distributedNodes[i], callback, shadowRootAncestor);
        }
        return;
      }
      if (element.localName == "slot") {
        var slot = (
          /** @type {!HTMLSlotElement} */
          element
        );
        var _distributedNodes = slot.assignedNodes ? slot.assignedNodes({ flatten: true }) : [];
        for (var _i = 0; _i < _distributedNodes.length; _i++) {
          composedTreeWalk(_distributedNodes[_i], callback, shadowRootAncestor);
        }
        return;
      }
    }
    var child = node.firstChild;
    while (child != null) {
      composedTreeWalk(child, callback, shadowRootAncestor);
      child = child.nextSibling;
    }
  }
  function addInertStyle(node) {
    if (node.querySelector("style#inert-style, link#inert-style")) {
      return;
    }
    var style = document.createElement("style");
    style.setAttribute("id", "inert-style");
    style.textContent = "\n[inert] {\n  pointer-events: none;\n  cursor: default;\n}\n\n[inert], [inert] * {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n";
    node.appendChild(style);
  }
  if (!HTMLElement.prototype.hasOwnProperty("inert")) {
    var inertManager = new InertManager(document);
    Object.defineProperty(HTMLElement.prototype, "inert", {
      enumerable: true,
      /** @this {!HTMLElement} */
      get: function get() {
        return this.hasAttribute("inert");
      },
      /** @this {!HTMLElement} */
      set: function set(inert) {
        inertManager.setInert(this, inert);
      }
    });
  }
})();

// _src/js/global.js
import { Alpine as Alpine2, AlpinePlugins } from "vendor";
import { Splide as Splide2 } from "vendor";

// _src/js/alpine-plugins/fetched-fragment.js
function fetched_fragment_default(Alpine3) {
  Alpine3.magic("fetchedFragment", (el, { Alpine: Alpine4, evaluateLater }) => {
    return (url, selector, loadingClasses = null) => {
      let classNames;
      if (loadingClasses) {
        classNames = loadingClasses.split(/\s+/g);
        el.classList.add(...classNames);
      }
      return async () => {
        const html = await fetchHTMLFragment(url, selector);
        Alpine4.nextTick(() => {
          if (classNames) {
            el.classList.remove(...classNames);
          }
        });
        return html;
      };
    };
  });
}

// _src/js/alpine-plugins/html-if-set.js
function html_if_set_default(Alpine3) {
  Alpine3.directive(
    "html-if-set",
    (el, { modifiers, expression }, { effect, evaluateLater }) => {
      let evaluate = evaluateLater(expression);
      let useEmpty = modifiers.includes("use-empty");
      function saveInitialHTML() {
        el._x_custom_initialHTML = el.innerHTML;
      }
      function getInitialHTML() {
        return el._x_custom_initialHTML;
      }
      effect(() => {
        let newHTML;
        evaluate((value) => {
          if (Boolean(value)) {
            newHTML = value;
            if (!getInitialHTML()) {
              saveInitialHTML();
            }
          } else {
            if (useEmpty && value === "") {
              newHTML = value;
            } else {
              if (getInitialHTML()) {
                newHTML = getInitialHTML();
              }
            }
          }
          if (newHTML || useEmpty && newHTML === "") {
            Alpine3.mutateDom(() => {
              el.innerHTML = newHTML;
              el._x_ignoreSelf = true;
              Alpine3.initTree(el);
              delete el._x_ignoreSelf;
            });
          }
        });
      });
    }
  );
}

// _src/js/alpine-plugins/mask.js
function mask_default(Alpine3) {
  Alpine3.directive(
    "mask",
    (el, { value, expression }, { effect, evaluateLater }) => {
      let templateFn = () => expression;
      let lastInputValue = "";
      queueMicrotask(() => {
        if (["function", "dynamic"].includes(value)) {
          let evaluator = evaluateLater(expression);
          effect(() => {
            templateFn = (input) => {
              let result;
              Alpine3.dontAutoEvaluateFunctions(() => {
                evaluator(
                  (value2) => {
                    result = typeof value2 === "function" ? value2(input) : value2;
                  },
                  {
                    scope: {
                      // These are "magics" we'll make available to the x-mask:function:
                      $input: input,
                      $money: formatMoney.bind({ el })
                    }
                  }
                );
              });
              return result;
            };
            processInputValue(el, false);
          });
        } else {
          processInputValue(el, false);
        }
        if (el._x_model) el._x_model.set(el.value);
      });
      el.addEventListener("input", () => processInputValue(el));
      el.addEventListener("blur", () => processInputValue(el, false));
      el.addEventListener("remask", () => processInputValue(el, false, true));
      function processInputValue(el2, shouldRestoreCursor = true, ignoreBackspace = false) {
        let input = el2.value;
        let template = templateFn(input);
        if (!template || template === "false") return false;
        if (ignoreBackspace === false && lastInputValue.length - el2.value.length === 1) {
          return lastInputValue = el2.value;
        }
        let setInput = () => {
          lastInputValue = el2.value = formatInput(input, template);
        };
        if (shouldRestoreCursor) {
          restoreCursorPosition(el2, template, () => {
            setInput();
          });
        } else {
          setInput();
        }
      }
      function formatInput(input, template) {
        if (input === "") return "";
        let strippedDownInput = stripDown(template, input);
        let rebuiltInput = buildUp(template, strippedDownInput);
        return rebuiltInput;
      }
    }
  ).before("model");
}
function restoreCursorPosition(el, template, callback) {
  let cursorPosition = el.selectionStart;
  let unformattedValue = el.value;
  callback();
  let beforeLeftOfCursorBeforeFormatting = unformattedValue.slice(
    0,
    cursorPosition
  );
  let newPosition = buildUp(
    template,
    stripDown(template, beforeLeftOfCursorBeforeFormatting)
  ).length;
  el.setSelectionRange(newPosition, newPosition);
}
function stripDown(template, input) {
  let inputToBeStripped = input;
  let output = "";
  let regexes = {
    9: /[0-9]/,
    a: /[a-zA-Z]/,
    "*": /[a-zA-Z0-9]/
  };
  let wildcardTemplate = "";
  for (let i = 0; i < template.length; i++) {
    if (["9", "a", "*"].includes(template[i])) {
      wildcardTemplate += template[i];
      continue;
    }
    for (let j = 0; j < inputToBeStripped.length; j++) {
      if (inputToBeStripped[j] === template[i]) {
        inputToBeStripped = inputToBeStripped.slice(0, j) + inputToBeStripped.slice(j + 1);
        break;
      }
    }
  }
  for (let i = 0; i < wildcardTemplate.length; i++) {
    let found = false;
    for (let j = 0; j < inputToBeStripped.length; j++) {
      if (regexes[wildcardTemplate[i]].test(inputToBeStripped[j])) {
        output += inputToBeStripped[j];
        inputToBeStripped = inputToBeStripped.slice(0, j) + inputToBeStripped.slice(j + 1);
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  return output;
}
function buildUp(template, input) {
  let clean = Array.from(input);
  let output = "";
  for (let i = 0; i < template.length; i++) {
    if (!["9", "a", "*"].includes(template[i])) {
      output += template[i];
      continue;
    }
    if (clean.length === 0) break;
    output += clean.shift();
  }
  return output;
}
function formatMoney(input, delimiter = ".", thousands, precision = 2) {
  if (input === "-") return "-";
  if (/^\D+$/.test(input)) return "9";
  if (thousands === null || thousands === void 0) {
    thousands = delimiter === "," ? "." : ",";
  }
  let addThousands = (input2, thousands2) => {
    let output = "";
    let counter = 0;
    for (let i = input2.length - 1; i >= 0; i--) {
      if (input2[i] === thousands2) continue;
      if (counter === 3) {
        output = input2[i] + thousands2 + output;
        counter = 0;
      } else {
        output = input2[i] + output;
      }
      counter++;
    }
    return output;
  };
  let minus = input.startsWith("-") ? "-" : "";
  let strippedInput = input.replaceAll(
    new RegExp(`[^0-9\\${delimiter}]`, "g"),
    ""
  );
  let template = Array.from({
    length: strippedInput.split(delimiter)[0].length
  }).fill("9").join("");
  template = `${minus}${addThousands(template, thousands)}`;
  if (precision > 0 && input.includes(delimiter))
    template += `${delimiter}` + "9".repeat(precision);
  queueMicrotask(() => {
    if (this.el.value.endsWith(delimiter)) return;
    if (this.el.value[this.el.selectionStart - 1] === delimiter) {
      this.el.setSelectionRange(
        this.el.selectionStart - 1,
        this.el.selectionStart - 1
      );
    }
  });
  return template;
}

// _src/js/stores/modals.js
var modals_default = {
  domContentLoaded: false,
  leftDrawer: { open: false, contents: "" },
  rightDrawer: { open: false, contents: "" },
  quickBuyDrawer: { open: false, contents: "" },
  modal: { open: false, contents: "" },
  promo: { open: false, contents: "" },
  popup: { open: false, contents: "" },
  modals: {},
  async init() {
    await switchOnDOMContentLoaded();
    await Alpine.nextTick();
    await Alpine.nextTick();
    for (const slotName of [
      "leftDrawer",
      "rightDrawer",
      "quickBuyDrawer",
      "modal",
      "promo",
      "popup"
    ]) {
      this.setUpShow(slotName);
      this.setUpHide(slotName);
    }
  },
  register(name, slotName) {
    this.modals[name] = slotName;
  },
  open(name) {
    if (this.modals[name]) {
      const slotName = this.modals[name];
      if (this[slotName].contents === name && this[slotName].open === true)
        return;
      document.body.dispatchEvent(
        new CustomEvent(`${kebabCase(name)}-will-open`, { bubbles: true })
      );
      document.body.dispatchEvent(
        new CustomEvent(`${kebabCase(slotName)}-will-open`, { bubbles: true })
      );
      this[slotName].contents = name;
      this[slotName].open = true;
    }
  },
  close(nameOrSlotName) {
    let name, slotName;
    if (this.modals[nameOrSlotName]) {
      name = nameOrSlotName;
      slotName = this.modals[nameOrSlotName];
    } else {
      name = this[nameOrSlotName].contents;
      slotName = nameOrSlotName;
    }
    if (this[slotName].contents !== name || this[slotName].open !== true)
      return;
    document.body.dispatchEvent(
      new CustomEvent(`${kebabCase(name)}-will-close`, {
        bubbles: true
      })
    );
    document.body.dispatchEvent(
      new CustomEvent(`${kebabCase(slotName)}-will-close`, { bubbles: true })
    );
    this[slotName].open = false;
  },
  setUpShow(slotName) {
    const slotEl = document.getElementById(`${kebabCase(slotName)}-slot`);
    slotEl._x_doShow = async () => {
      const dispatchOpenEvents = () => {
        const name = Alpine.store("modals")[slotName].contents;
        document.body.dispatchEvent(
          new CustomEvent(`${kebabCase(name)}-is-open`, {
            bubbles: true
          })
        );
        document.body.dispatchEvent(
          new CustomEvent(`${kebabCase(slotName)}-is-open`, {
            bubbles: true
          })
        );
      };
      Alpine.mutateDom(() => {
        if (slotEl.style.length === 1 && slotEl.style.display === "none") {
          slotEl.removeAttribute("style");
        } else {
          slotEl.style.removeProperty("display");
        }
      });
      await Alpine.nextTick();
      try {
        const transitionEl = slotEl.hasAttribute("x-show") ? slotEl : slotEl.closest("[x-show]");
        await Promise.all(
          transitionEl.getAnimations().map((animation) => animation.finished)
        );
        dispatchOpenEvents();
      } catch (e) {
        dispatchOpenEvents();
      }
    };
  },
  setUpHide(slotName) {
    const slotEl = document.getElementById(`${kebabCase(slotName)}-slot`);
    slotEl._x_doHide = () => {
      Alpine.mutateDom(() => {
        slotEl.style.setProperty("display", "none");
      });
      const name = Alpine.store("modals")[slotName].contents;
      Alpine.store("modals")[slotName].contents = "";
      document.body.dispatchEvent(
        new CustomEvent(`${kebabCase(name)}-is-closed`, {
          bubbles: true
        })
      );
      document.body.dispatchEvent(
        new CustomEvent(`${kebabCase(slotName)}-is-closed`, {
          bubbles: true
        })
      );
    };
  },
  closeAll() {
    Object.keys(this.modals).forEach((modal) => {
      Alpine.store("modals").close(modal);
    });
  },
  getSlotEl(slotName) {
    return document.getElementById(`${kebabCase(slotName)}-slot`) || null;
  },
  removeExistingContents(slotName, selector) {
    const existingModalContents = this.getSlotEl(slotName)?.querySelector(selector);
    if (existingModalContents) existingModalContents.remove();
  }
};

// _src/js/stores/cart-count.js
var cart_count_default = {
  count: window.theme && window.theme.cartItemCount || 0,
  init() {
    window.addEventListener("baseline:cart:afteradditem", (e) => {
      this._setFromFetchedSection(e.detail.response);
    });
    window.addEventListener("baseline:cart:cartqtychange", (e) => {
      this._setFromFetchedSection(e.detail.response);
    });
    window.addEventListener("baseline:cart:update", (e) => {
      this._setFromFetchedSection(e.detail.response);
    });
  },
  _setFromFetchedSection(data) {
    const countSectionHTML = data.sections["cart-item-count"];
    this.count = parseInt(
      parseDOMFromString(countSectionHTML).firstElementChild.innerText.trim(),
      10
    );
    window.theme.cartItemCount = this.count;
  },
  countWithText() {
    let string = theme.strings.itemCountOther;
    if (this.count === 1) {
      string = theme.strings.itemCountOne;
    }
    return string.replace("{{ count }}", this.count);
  }
};

// _src/js/components/age-check.js
var age_check_default = ({
  mode,
  dateFormat,
  minimumAge,
  redirectURL,
  enabled,
  declineAction
}) => {
  return {
    authenticated: false,
    mode,
    dateFormat,
    minimumAge,
    redirectURL,
    month: "",
    day: "",
    year: "",
    date: "",
    enabled,
    sectionId: null,
    storageKey: null,
    boundOnSectionSelect: null,
    boundOnSectionDeselect: null,
    showDeclinedMessage: false,
    get fullDate() {
      return `${this.month}/${this.day}/${this.year}`;
    },
    init() {
      this.sectionId = this.$root.id;
      this.storageKey = `switch-age-check-${this.sectionId}`;
      if (window.location.pathname === "/challenge") return;
      if (Shopify.designMode) {
        Alpine.store("modals").removeExistingContents("modal", "#ageCheck");
      }
      initTeleport(this.$root);
      Alpine.store("modals").register("ageCheck", "modal");
      if (!Shopify.designMode) {
        if (getExpiringStorageItem(this.storageKey) !== "approved") {
          Alpine.store("modals").open("ageCheck");
        }
      } else {
        if (window.theme.designMode.selected === this.sectionId) {
          if (this.enabled === true) {
            Alpine.store("modals").open("ageCheck");
          } else {
            Alpine.store("modals").close("ageCheck");
          }
        }
        this.boundOnSectionSelect = this.onSectionSelect.bind(this);
        this.boundOnSectionDeselect = this.onSectionDeselect.bind(this);
        document.addEventListener(
          "shopify:section:select",
          this.boundOnSectionSelect
        );
        document.addEventListener(
          "shopify:section:deselect",
          this.boundOnSectionDeselect
        );
      }
      if (this.redirectURL === null) {
        this.redirectURL = "https://www.google.com";
      }
      if (this.mode === "dob") {
        this.date = /* @__PURE__ */ new Date();
        setTimeout(() => this.setUpDOB(), 100);
      }
    },
    onSectionSelect(e) {
      if (!e.target.contains(this.$root)) return;
      if (!this.enabled) return;
      Alpine.store("modals").open("ageCheck");
    },
    onSectionDeselect(e) {
      if (!e.target.contains(this.$root)) return;
      this.$store.modals.close("ageCheck");
    },
    approveEntry() {
      Alpine.store("modals").close("ageCheck");
      if (!Shopify.designMode) {
        setExpiringStorageItem(this.storageKey, "approved", daysInMs(30));
      }
    },
    denyEntry() {
      if (declineAction === "redirect") {
        if (window.Shopify && window.Shopify.designMode) {
          this.$event.preventDefault();
        } else {
          window.location = this.redirectURL;
        }
      } else {
        this.showDeclinedMessage = true;
      }
    },
    checkInput(name) {
      switch (name) {
        case "day":
          return parseInt(this.day) > 0 && parseInt(this.day) < 32 ? true : false;
        case "month":
          return parseInt(this.month) > 0 && parseInt(this.month) < 13 ? true : false;
        case "year":
          return parseInt(this.year) < this.date.getFullYear() && parseInt(this.year) > 1900 ? true : false;
      }
      return true;
    },
    checkAge() {
      const currentDate = Math.round(this.date.getTime() / 1e3);
      const enteredDate = Math.round(
        (/* @__PURE__ */ new Date(`${this.fullDate}`)).getTime() / 1e3
      );
      const yearInSeconds = 31536e3;
      const difference = Math.floor(
        (currentDate - enteredDate) / yearInSeconds
      );
      if (difference > parseInt(this.minimumAge, 10)) {
        this.approveEntry();
      } else {
        this.denyEntry();
      }
    },
    setUpDOB() {
      const container = document.getElementById(`dob-form-${this.sectionId}`);
      container.addEventListener("input", (e) => {
        const target = e.srcElement || e.target;
        const maxLength = parseInt(target.attributes["maxlength"].value, 10);
        const targetLength = target.value.length;
        if (targetLength >= maxLength) {
          const valid = this.checkInput(target.getAttribute("name"));
          if (!valid) {
            target.value = "";
            return false;
          }
          let next = target.closest(".input-grid-item");
          while (next = next.nextElementSibling) {
            if (next == null) break;
            let input = next.querySelector("input");
            if (input !== null) {
              input.focus();
              break;
            }
          }
        } else if (targetLength === 0) {
          let previous = target.closest(".input-grid-item");
          while (previous = previous.previousElementSibling) {
            if (previous == null) break;
            const input = previous.querySelector("input");
            if (input !== null) {
              input.focus();
              break;
            }
          }
        }
        if (this.checkInput("day") && this.checkInput("month") && this.checkInput("year")) {
          setTimeout(() => this.checkAge(), 500);
        }
      });
    },
    destroy() {
      document.removeEventListener(
        "shopify:section:select",
        this.boundOnSectionSelect
      );
      document.removeEventListener(
        "shopify:section:deselect",
        this.boundOnSectionDeselect
      );
    }
  };
};

// _src/js/components/free-shipping-bar.js
var free_shipping_bar_default = () => ({
  sectionId: null,
  contentHTML: null,
  boundOnCartUpdate: null,
  init() {
    this.sectionId = getSectionId(this.$root);
    this.boundOnCartUpdate = this.onCartUpdate.bind(this);
    window.addEventListener(
      "baseline:cart:afteradditem",
      this.boundOnCartUpdate
    );
    window.addEventListener(
      "baseline:cart:cartqtychange",
      this.boundOnCartUpdate
    );
    window.addEventListener("baseline:cart:update", this.boundOnCartUpdate);
  },
  async onCartUpdate() {
    const updatedSection = await freshHTML(
      getURLWithParams(window.theme.routes.root_url, {
        // eslint-disable-next-line camelcase
        section_id: this.sectionId
      })
    );
    this.contentHTML = querySelectorInHTMLString(
      "[data-mutating-content]",
      updatedSection
    ).innerHTML;
  },
  destroy() {
    window.removeEventListener(
      "baseline:cart:afteradditem",
      this.boundOnCartUpdate
    );
    window.removeEventListener(
      "baseline:cart:cartqtychange",
      this.boundOnCartUpdate
    );
    window.removeEventListener("baseline:cart:update", this.boundOnCartUpdate);
  }
});

// _src/js/components/cart-items.js
var cart_items_default = () => ({
  itemsRoot: null,
  loading: null,
  boundOnCartQuantityChange: null,
  init() {
    this.itemsRoot = this.$root;
    this.boundOnCartQuantityChange = this.onCartQuantityChange.bind(this);
    window.addEventListener(
      "baseline:cart:afteradditem",
      this.boundOnCartQuantityChange
    );
    window.addEventListener(
      "baseline:cart:cartqtychange",
      this.boundOnCartQuantityChange
    );
    window.addEventListener(
      "baseline:cart:update",
      this.boundOnCartQuantityChange
    );
    document.addEventListener("baseline:cart:lock", () => {
      this.loading = true;
    });
    document.addEventListener("baseline:cart:unlock", () => {
      this.loading = false;
    });
  },
  onCartQuantityChange(e) {
    Alpine.morph(
      this.itemsRoot,
      querySelectorInHTMLString(
        "[data-cart-items]",
        e.detail.response.sections["cart-items"]
      ).outerHTML,
      {
        updating(el, toEl, childrenOnly, skip) {
          if (el.nodeType === 1 && el.hasAttribute("ready")) {
            toEl.setAttribute("ready", "");
          }
        }
      }
    );
    this.$nextTick(() => {
      this.itemsRoot.querySelectorAll("input").forEach((inputEl) => {
        inputEl.value = inputEl.getAttribute("value");
        inputEl.dispatchEvent(new Event("input"));
      });
    });
    this.updateLiveRegion(
      parseDOMFromString(e.detail.response.sections["cart-live-region"]).firstElementChild.textContent
    );
    if (e.detail.originalTarget) {
      this.$nextTick(() => {
        if (!this.itemsRoot.contains(e.detail.originalTarget)) {
          let focusRoot;
          if (this.itemsRoot.closest('[role="dialog"]')) {
            focusRoot = this.itemsRoot.closest('[role="dialog"]').parentNode;
          } else {
            focusRoot = this.itemsRoot;
          }
          this.$focus.within(focusRoot).first();
        }
      });
    }
    const itemsRootEl = this.itemsRoot;
    switch (e.type) {
      case "baseline:cart:afteradditem":
        document.dispatchEvent(
          new CustomEvent("theme:product:add", {
            detail: {
              cartItemCount: window.theme.cartItemCount,
              itemsRootEl,
              lineItemEl: document.querySelector(
                `[data-line-item-key="${e.detail.response.key}"]`
              ) || null,
              variantId: e.detail.response.variant_id,
              key: e.detail.response.key,
              formEl: document.getElementById(e.detail.sourceId),
              get cartPromise() {
                return fetch(
                  window.theme.routes.cart_url,
                  fetchConfigDefaults()
                ).then((res) => res.json()).then((cart) => cart).catch(
                  (error) => console.error(
                    "Error fetching cart in `theme:product:add`",
                    error
                  )
                );
              }
            }
          })
        );
        break;
      case "baseline:cart:cartqtychange":
        document.dispatchEvent(
          new CustomEvent("theme:line-item:change", {
            detail: {
              cartItemCount: e.detail.response.item_count,
              itemsRootEl,
              lineItemEl: document.querySelector(
                `[data-line-item-key="${e.detail.key}"]`
              ) || null,
              variantId: e.detail.variantId,
              key: e.detail.key,
              quantity: e.detail.quantity,
              previousQuantity: e.detail.previousQuantity,
              cart: e.detail.response
            }
          })
        );
        break;
      case "baseline:cart:update":
        document.dispatchEvent(
          new CustomEvent("theme:cart:update", {
            detail: {
              cartItemCount: window.theme.cartItemCount,
              itemsRootEl,
              get cartPromise() {
                return fetch(
                  window.theme.routes.cart_url,
                  fetchConfigDefaults()
                ).then((res) => res.json()).then((cart) => cart).catch(
                  (error) => console.error(
                    "Error fetching cart in `theme:cart:update`",
                    error
                  )
                );
              }
            }
          })
        );
        break;
    }
  },
  updateLiveRegion(liveRegionText) {
    if (!liveRegionText) return;
    const cartStatus = document.getElementById("cart-live-region-text");
    cartStatus.textContent = liveRegionText;
    cartStatus.setAttribute("aria-hidden", false);
    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1e3);
  },
  destroy() {
    window.removeEventListener(
      "baseline:cart:afteradditem",
      this.boundOnCartQuantityChange
    );
    window.removeEventListener(
      "baseline:cart:cartqtychange",
      this.boundOnCartQuantityChange
    );
    window.removeEventListener(
      "baseline:cart:update",
      this.boundOnCartQuantityChange
    );
  }
});

// _src/js/components/cart-item.js
var cart_item_default = (key) => ({
  quantity: null,
  previousQuantity: null,
  key,
  locked: false,
  errorMessage: null,
  init() {
    document.addEventListener("baseline:cart:lock", () => {
      this.locked = true;
    });
    document.addEventListener("baseline:cart:unlock", () => {
      this.locked = false;
    });
  },
  async itemQuantityChange() {
    if (this.locked || this.loading) return;
    if (this.$refs.quantityInput.hasAttribute("data-last-value")) {
      if (this.quantity === Number(this.$refs.quantityInput.dataset.lastValue)) {
        return;
      }
    }
    this.locked = true;
    this.loading = true;
    const request = {
      ...fetchConfigDefaults("application/javascript"),
      body: JSON.stringify({
        id: this.key,
        quantity: this.quantity,
        sections: "cart-items,cart-footer,cart-item-count,cart-live-region",
        // eslint-disable-next-line camelcase
        sections_url: window.location.pathname
      })
    };
    try {
      const response = await fetch(theme.routes.cart_change_url, request);
      const data = await response.json();
      if (data.status === 422) {
        this.errorMessage = data.message;
        this.quantity = this.previousQuantity;
        document.dispatchEvent(
          new CustomEvent("theme:line-item:error", {
            detail: {
              message: this.errorMessage,
              itemsRootEl: this.itemsRoot,
              lineItemEl: document.querySelector(`[data-line-item-key="${this.key}"]`) || null,
              variantId: Number(this.$refs.quantityInput.dataset.variantId),
              key: this.key,
              quantity: this.quantity
            }
          })
        );
      } else {
        this.errorMessage = null;
        document.body.dispatchEvent(
          new CustomEvent("baseline:cart:cartqtychange", {
            bubbles: true,
            detail: {
              response: data,
              key: this.key,
              quantity: this.quantity,
              previousQuantity: this.previousQuantity,
              variantId: Number(this.$refs.quantityInput.dataset.variantId),
              originalTarget: this.$refs.quantityControl
            }
          })
        );
      }
    } catch (e) {
      console.error(e);
      document.getElementById("cart-errors").textContent = theme.strings.cartError;
      document.dispatchEvent(
        new CustomEvent("theme:cart:error:other", {
          detail: {
            message: theme.strings.cartError,
            error: e
          }
        })
      );
    } finally {
      this.locked = false;
      this.loading = false;
    }
  },
  removeItem() {
    const visibleQtyControl = Array.from(
      this.$root.querySelectorAll('[x-data="CartItemQuantity"]')
    ).filter((el) => el.offsetParent)[0];
    visibleQtyControl.dispatchEvent(new CustomEvent("remove"));
  }
});

// _src/js/components/core/quantity.js
var quantity_default = {
  adjustQuantity(adjustCb) {
    if (typeof this.previousQuantity !== "undefined") {
      this.previousQuantity = this.quantity;
    }
    const quantityBeforeAdjustment = this.quantity;
    adjustCb();
    this.dispatchInputEvent();
    if (this.quantity === quantityBeforeAdjustment) return;
    this.$nextTick(() => {
      this.dispatchChangeEvent();
    });
  },
  increment() {
    this.adjustQuantity(() => {
      this.$refs.quantityInput.stepUp();
    });
  },
  decrement() {
    this.adjustQuantity(() => {
      this.$refs.quantityInput.stepDown();
    });
  },
  dispatchInputEvent() {
    this.$refs.quantityInput.dispatchEvent(new Event("input"));
  },
  dispatchChangeEvent() {
    this.$refs.quantityInput.dispatchEvent(new Event("change"));
  }
};

// _src/js/components/cart-item-quantity.js
var cart_item_quantity_default = () => ({
  remove() {
    this.adjustQuantity(() => {
      this.$refs.quantityInput.value = 0;
    });
  },
  ...quantity_default
});

// _src/js/components/cart-footer.js
var cart_footer_default = () => {
  return {
    footerRoot: null,
    _morphFooter(e) {
      const newFooterSection = querySelectorInHTMLString(
        "[data-cart-footer]",
        e.detail.response.sections["cart-footer"]
      );
      Alpine.morph(
        this.footerRoot,
        newFooterSection ? newFooterSection.outerHTML : "",
        {
          updating(el, toEl, childrenOnly, skip) {
            if (el.classList && el.classList.contains("additional-checkout-buttons")) {
              skip();
            }
            if (el.nodeType === 1 && el.hasAttribute("ready")) {
              toEl.setAttribute("ready", "");
            }
          }
        }
      );
    },
    init() {
      this.footerRoot = this.$root;
      window.addEventListener("baseline:cart:afteradditem", (e) => {
        this._morphFooter(e);
      });
      window.addEventListener("baseline:cart:cartqtychange", (e) => {
        this._morphFooter(e);
      });
      window.addEventListener("baseline:cart:update", (e) => {
        this._morphFooter(e);
      });
    }
  };
};

// _src/js/components/cart-note.js
var cart_note_default = () => {
  return {
    updating: false,
    note: "",
    init() {
      this.note = this.$root.value;
      this.$watch("note", (value, oldValue) => {
        if (value !== oldValue) {
          this.updateNote();
        }
      });
    },
    async updateNote() {
      this.updating = true;
      await fetch(theme.routes.cart_update_url, {
        ...fetchConfigDefaults(),
        body: JSON.stringify({
          note: this.$root.value
        })
      });
      this.updating = false;
    }
  };
};

// _src/js/components/header.js
var header_default = () => ({
  isStuck: false,
  overlayHeaderWithSticky: null,
  overlayTextColor: null,
  init() {
    this.overlayHeaderWithSticky = this.$root.dataset.overlayHeaderWithSticky === "true";
    if (this.overlayHeaderWithSticky) {
      this.setUpOverlayWithSticky();
    }
  },
  setUpOverlayWithSticky() {
    const positionerEl = document.createElement("div");
    positionerEl.id = "sticky-positioner";
    document.body.insertBefore(
      positionerEl,
      this.$root.closest(".shopify-section")
    );
    const observer = new IntersectionObserver(([e]) => {
      e.intersectionRatio === 0 ? this.isStuck = true : this.isStuck = false;
    });
    observer.observe(positionerEl);
    this.overlayTextColor = this.$root.dataset.overlayTextColorScheme;
    this.updateColorScheme(this.isStuck);
    this.$watch("isStuck", (value) => {
      this.updateColorScheme(value);
    });
  },
  updateColorScheme(isStuck) {
    if (isStuck) {
      this.$refs.header.setAttribute("data-color-scheme", "");
      this.$refs.header.classList.remove("bg-transparent");
      this.$refs.header.classList.add("bg-scheme-background");
    } else {
      this.$refs.header.setAttribute(
        "data-color-scheme",
        this.overlayTextColor
      );
      this.$refs.header.classList.remove("bg-scheme-background");
      this.$refs.header.classList.add("bg-transparent");
    }
  }
});

// _src/js/components/video.js
var video_default = (mode = "preview") => ({
  player: null,
  enabled: false,
  playing: false,
  id: "",
  playback: "inline",
  mode,
  init() {
    this.id = this.$root.id;
    document.body.addEventListener("pauseAllMedia", (e) => {
      if (e.detail !== null && e.detail.id === this.$root.id) {
        return;
      }
      if (this.mode === "autoplay") return;
      this.pause();
    });
    this.$watch("enabled", (value) => {
      if (value === true) {
        this.player = this.$root.querySelector("[\\@play][\\@pause]");
        this.player.addEventListener("playing", () => {
          this.playing = true;
        });
        this.player.addEventListener("paused", () => {
          this.playing = false;
        });
      }
    });
    this.$watch("playing", (value) => {
      if (value === true) {
        this.dispatchPauseAllMediaEvent();
      }
    });
    this.productMediaWrapper = this.$root.closest(
      "[data-product-single-media-wrapper]"
    );
    if (this.productMediaWrapper !== null) {
      this.setUpProductMediaListeners();
    }
    if (Shopify.designMode) {
      document.addEventListener("shopify:section:unload", (e) => {
        if (e.target.contains(this.$root) && this.player) {
          this.player.dispatchEvent(new CustomEvent("deinit"));
        }
      });
    }
    if (this.mode === "autoplay") {
      this.enable();
    }
    this.$nextTick(() => {
      this.checkImagesLoaded();
    });
  },
  checkImagesLoaded() {
    const images = this.$root.querySelectorAll("img.track-loaded");
    images.forEach((image) => {
      if (image.complete) {
        image.classList.add("is-complete");
      } else {
        image.addEventListener("load", () => {
          image.classList.add("is-complete");
        });
      }
    });
  },
  enable() {
    if (this.playback === "modal") {
      if (!this.$store.modals.modals[this.id]) {
        this.$store.modals.register(this.id, "modal");
      }
      this.dispatchPauseAllMediaEvent();
      this.$store.modals.open(this.id);
    } else {
      this.enabled = true;
    }
  },
  dispatchPauseAllMediaEvent() {
    document.body.dispatchEvent(
      new CustomEvent("pauseAllMedia", {
        detail: {
          id: this.$root.id
        }
      })
    );
  },
  play() {
    if (this.enabled === false || this.player === null) return;
    this.player.dispatchEvent(new CustomEvent("play"));
  },
  pause() {
    if (this.enabled === false || this.player === null) return;
    this.player.dispatchEvent(new CustomEvent("pause"));
  },
  setUpProductMediaListeners() {
    this.productMediaWrapper.addEventListener("mediaHidden", () => {
      this.pause();
    });
    this.productMediaWrapper.addEventListener("mediaVisible", () => {
    });
  }
});

// _src/js/components/product-media-video.js
var product_media_video_default = () => ({
  player: null,
  productMediaWrapper: null,
  enabled: false,
  playing: false,
  init() {
    document.body.addEventListener("pauseAllMedia", (e) => {
      if (e.detail !== null && e.detail.id === this.$root.id) {
        return;
      }
      this.pause();
    });
    this.$watch("enabled", (value) => {
      if (value === true) {
        this.player = this.$root.querySelector("[\\@play][\\@pause]");
        this.player.addEventListener("playing", () => {
          this.playing = true;
        });
        this.player.addEventListener("paused", () => {
          this.playing = false;
        });
      }
    });
    this.$watch("playing", (value) => {
      if (value === true) {
        this.dispatchPauseAllMediaEvent();
      }
    });
    this.productMediaWrapper = this.$root.closest(
      "[data-product-single-media-wrapper]"
    );
    if (this.productMediaWrapper) {
      this.setUpProductMediaListeners();
    }
    if (Shopify.designMode) {
      document.addEventListener("shopify:section:unload", (e) => {
        if (e.target.contains(this.$root) && this.player) {
          this.player.dispatchEvent(new CustomEvent("deinit"));
        }
      });
    }
  },
  setUpProductMediaListeners() {
    this.productMediaWrapper.addEventListener("mediaHidden", () => {
      this.pause();
    });
    this.productMediaWrapper.addEventListener("mediaVisible", () => {
      this.play();
    });
  },
  enable() {
    this.enabled = true;
  },
  dispatchPauseAllMediaEvent() {
    document.body.dispatchEvent(
      new CustomEvent("pauseAllMedia", {
        detail: {
          id: this.$root.id
        }
      })
    );
  },
  play() {
    if (this.enabled === false || this.player === null) return;
    this.player.dispatchEvent(new CustomEvent("play"));
  },
  pause() {
    if (this.enabled === false || this.player === null) return;
    this.player.dispatchEvent(new CustomEvent("pause"));
  }
});

// _src/js/components/html-video.js
var html_video_default = () => ({
  init() {
    this.$refs.video.addEventListener("play", () => {
      this.$root.dispatchEvent(
        new CustomEvent("playing", {
          bubbles: true
        })
      );
    });
    this.$refs.video.addEventListener("pause", () => {
      this.$root.dispatchEvent(
        new CustomEvent("paused", {
          bubbles: true
        })
      );
    });
    if (this.$refs.video.autoplay) {
      this.$nextTick(() => {
        this.$refs.video.play();
      });
    }
  },
  play() {
    this.$refs.video.play();
  },
  pause() {
    this.$refs.video.pause();
  }
});

// _src/js/components/filterable.js
var filterable_default = () => ({
  filtersOpen: false,
  sortOpen: false,
  filtersCache: [],
  loading: false,
  focusedBeforeUpdate: null,
  searchParams: null,
  countHTML: null,
  filtersFormHTML: null,
  resultsHTML: null,
  drawerToggleHTML: null,
  afterUpdateCallback: null,
  isMdBreakpoint: window.isMdBreakpoint(),
  mdBreakpointMQL: window.mdBreakpointMQL(),
  boundOnHistoryChange: null,
  clickOutside(event, property, sidebarOnDesktop) {
    if (!(sidebarOnDesktop && this.isMdBreakpoint)) {
      event.preventDefault();
    }
    if (event.target && (event.target === this.$refs.filterDropDownToggle || event.target === this.$refs.sortDropDownToggle))
      return;
    this[property] = false;
  },
  focusOut(event, property) {
    if (event.relatedTarget) {
      if (event.relatedTarget === this.$refs.filterDropDownToggle || event.relatedTarget === this.$refs.sortDropDownToggle)
        return;
      const dropdownParent = event.relatedTarget.closest(
        "[data-filterable-dropdown]"
      );
      if (!dropdownParent) {
        this[property] = false;
      }
    }
  },
  onEscape() {
    if (this.filtersOpen) {
      this.filtersOpen = false;
      this.$refs.filterDropDownToggle.focus();
    }
    if (this.sortOpen) {
      this.sortOpen = false;
      this.$refs.sortToggle.focus();
    }
  },
  init() {
    this.isMdBreakpoint = this.mdBreakpointMQL.matches;
    this.mdBreakpointMQL.addEventListener("change", (e) => {
      this.isMdBreakpoint = e.matches;
    });
    this.$root.addEventListener("baseline:filterable:open-filters", () => {
      this.filtersOpen = true;
    });
    this.boundOnHistoryChange = this.onHistoryChange.bind(this);
    window.addEventListener("popstate", this.boundOnHistoryChange);
    this.$watch("sortOpen", (value) => {
      if (value === true && this.filtersOpen === true) {
        this.filtersOpen = false;
      }
    });
    this.$watch("filtersOpen", (value) => {
      if (value === true && this.sortOpen === true) {
        this.sortOpen = false;
      }
    });
    this.$watch("searchParams", this.onSearchParamsUpdate.bind(this));
  },
  async onSearchParamsUpdate(value, oldValue) {
    if (value === oldValue) return;
    const updatedHTML = await fetchHTML(
      currentURLAddingParams(
        [...value, ["section_id", getSectionId(this.$root)]],
        true
      )
    );
    if (this.$root.querySelector(`[data-fragment-id="count"]`)) {
      this.countHTML = querySelectorInHTMLString(
        `[data-fragment-id="count"]`,
        updatedHTML
      ).innerHTML;
    }
    if (this.$root.querySelector(`[data-fragment-id="drawer-toggle"]`)) {
      this.drawerToggleHTML = querySelectorInHTMLString(
        `[data-fragment-id="drawer-toggle"]`,
        updatedHTML
      ).innerHTML;
    }
    const filterFormFragmentIds = [
      "filters-form-sidebar",
      "filters-form-filters-drop-down",
      "filters-form-sort-drop-down",
      "filters-form-drawer"
    ];
    for (const fragmentId of filterFormFragmentIds) {
      let fragmentEl, updatedFormFragmentEl;
      if (fragmentId === "filters-form-drawer") {
        fragmentEl = document.getElementById("filters-form-drawer");
        if (!fragmentEl) continue;
        updatedFormFragmentEl = querySelectorInHTMLString(
          `[data-template-fragment-id="${fragmentId}"]`,
          updatedHTML
        )?.content.firstElementChild.querySelector(
          `[data-fragment-id="${fragmentId}"]`
        );
        if (!updatedFormFragmentEl) continue;
      } else {
        fragmentEl = this.$root.querySelector(
          `[data-fragment-id="${fragmentId}"]`
        );
        if (!fragmentEl) continue;
        updatedFormFragmentEl = querySelectorInHTMLString(
          `[data-fragment-id="${fragmentId}"]`,
          updatedHTML
        ) || null;
        if (!updatedFormFragmentEl) continue;
      }
      fragmentEl.querySelectorAll("[data-filterable-filter-fragment]").forEach((filterableFragmentEl) => {
        const updatedFragmentEl = updatedFormFragmentEl.querySelector(
          `[data-filterable-filter-fragment="${filterableFragmentEl.getAttribute(
            "data-filterable-filter-fragment"
          )}"`
        );
        if (updatedFragmentEl)
          filterableFragmentEl.innerHTML = updatedFragmentEl.innerHTML;
      });
    }
    this.resultsHTML = querySelectorInHTMLString(
      `[data-fragment-id="results"]`,
      updatedHTML
    ).innerHTML;
    this.afterUpdate();
  },
  // beforeUpdate() {},
  afterUpdate() {
    if (this.focusedBeforeUpdate && document.getElementById(this.focusedBeforeUpdate)) {
      const target = document.getElementById(this.focusedBeforeUpdate);
      this.$focus.focus(target);
      if (target.tagName === "INPUT" && target.type === "text") {
        target.select();
      }
      this.focusedBeforeUpdate = null;
    }
    if (!this.historyChanged) {
      this.updateURLHash(this.searchParams);
    } else {
      this.historyChanged = false;
    }
    this.loading = false;
    if (this.afterUpdateCallback) {
      this.$nextTick(() => {
        this.afterUpdateCallback();
        this.afterUpdateCallback = null;
      });
    }
  },
  filterFormSubmit(event) {
    let form = event.target.closest("form");
    if (event.target.hasAttribute("form")) {
      const formId = event.target.getAttribute("form");
      form = document.getElementById(formId);
    }
    if (this.loading || !form) return;
    this.loading = true;
    if (document.activeElement && this.$root.contains(document.activeElement)) {
      const targetId = document.activeElement.getAttribute("id");
      if (targetId) {
        this.focusedBeforeUpdate = targetId;
      }
    }
    const formData = new FormData(form);
    this.searchParams = new URLSearchParams(formData);
    if (event.target.name && event.target.name === "sort_by") {
      this.afterUpdateCallback = () => {
        this.sortOpen = false;
      };
    }
  },
  clearAllFilters() {
    this.searchParams = new URL(this.$event.currentTarget.href).searchParams;
  },
  updateURLHash(searchParams) {
    const searchParamsString = searchParams.toString();
    history.pushState(
      { searchParamsString },
      "",
      `${window.location.pathname}${searchParamsString && "?".concat(searchParamsString)}`
    );
  },
  onHistoryChange(event) {
    this.historyChanged = true;
    this.searchParams = event.state.searchParams || "";
  },
  destroy() {
    window.removeEventListener("popstate", this.boundOnHistoryChange);
  }
});

// _src/js/components/range-control.js
var range_control_default = (min, max, start, end) => ({
  min,
  max,
  valueA: start,
  valueB: end,
  ready: false,
  ignoreRangeStart: false,
  ignoreRangeEnd: false,
  get rangeStart() {
    return Math.min(this.valueA, this.valueB);
  },
  set rangeStart(value) {
    if (value >= this.rangeEnd) return;
    if (this.valueA < this.valueB) {
      this.valueA = value;
    } else {
      this.valueB = value;
    }
  },
  get rangeEnd() {
    return Math.max(this.valueA, this.valueB);
  },
  set rangeEnd(value) {
    if (value <= this.rangeStart) return;
    if (this.valueA > this.valueB) {
      this.valueA = value;
    } else {
      this.valueB = value;
    }
  },
  get rangeStartInMajorUnits() {
    return this.rangeStart / 100;
  },
  get rangeEndInMajorUnits() {
    return this.rangeEnd / 100;
  },
  get range() {
    return this.rangeEnd - this.rangeStart;
  },
  get rangeStartInPercent() {
    return this.normalize(this.rangeStart);
  },
  get rangeEndInPercent() {
    return this.normalize(this.rangeEnd);
  },
  get rangeInPercent() {
    return this.rangeEndInPercent - this.rangeStartInPercent;
  },
  get valueCenter() {
    return this.rangeStart + this.range / 2;
  },
  set valueCenter(value) {
    const proposedRangeStart = Math.round((value - this.range / 2) / 100) * 100;
    const proposedRangeEnd = Math.round((value + this.range / 2) / 100) * 100;
    if (proposedRangeStart < this.min || proposedRangeEnd > this.max) {
      return;
    }
    this.rangeStart = proposedRangeStart;
    this.rangeEnd = proposedRangeEnd;
  },
  init() {
    this.$watch("rangeStart", (value, oldValue) => {
      if (value === oldValue || this.ignoreRangeStart) return;
      this.updateRangeStartDirectInputField(value);
    });
    this.$watch("rangeEnd", (value, oldValue) => {
      if (value === oldValue || this.ignoreRangeEnd) return;
      this.updateRangeEndDirectInputField(value);
    });
    this.$nextTick(() => {
      this.ready = true;
    });
  },
  normalize(value) {
    const ratio = (100 - 0) / (this.max - this.min);
    return (value - this.min) * ratio + 0;
  },
  updateRangeStartDirectInputField(value, triggerChange = true) {
    this.$refs.rangeStartDirectInputField.value = (value / 100).toString();
    this.$refs.rangeStartDirectInputField.dispatchEvent(new Event("remask"));
  },
  updateRangeEndDirectInputField(value, triggerChange = true) {
    this.$refs.rangeEndDirectInputField.value = (value / 100).toString();
    this.$refs.rangeEndDirectInputField.dispatchEvent(new Event("remask"));
  },
  handleRangeStartDirectInputFieldInput() {
    this.ignoreRangeStart = true;
    this.rangeStart = this.$el.value.replaceAll(/\D/g, "") * 100;
    this.$nextTick(() => {
      this.ignoreRangeStart = false;
    });
    this.$refs.rangeStartFormField.dispatchEvent(
      new CustomEvent("indirect-change")
    );
  },
  handleRangeEndDirectInputFieldInput() {
    this.ignoreRangeEnd = true;
    this.rangeEnd = this.$el.value.replaceAll(/\D/g, "") * 100;
    this.$nextTick(() => {
      this.ignoreRangeEnd = false;
    });
    this.$refs.rangeEndFormField.dispatchEvent(
      new CustomEvent("indirect-change")
    );
  },
  handleRangeStartDirectInputFieldChange() {
    this.$refs.rangeStartFormField.dispatchEvent(new Event("change"));
  },
  handleRangeEndDirectInputFieldChange() {
    this.$refs.rangeEndFormField.dispatchEvent(new Event("change"));
  },
  handleRangeStartControlChange() {
    this.$refs.rangeStartFormField.dispatchEvent(new Event("change"));
  },
  handleRangeEndControlChange() {
    this.$refs.rangeEndFormField.dispatchEvent(new Event("change"));
  },
  handleRangeCenterControlChange() {
    this.$refs.rangeStartFormField.dispatchEvent(new Event("change"));
  }
});

// _src/js/components/option-drop-down.js
var option_drop_down_default = () => ({
  expanded: false,
  selectedValue: "",
  hasSelection: false,
  init() {
    if (this.$root.querySelector('[aria-selected="true"]')) {
      this.hasSelection = true;
      this.selectedValue = this.$root.querySelector('[aria-selected="true"]').textContent.trim();
    }
  },
  toggle() {
    if (this.expanded) {
      this.close();
      return;
    }
    this.$refs.button.focus();
    this.expanded = true;
    this.$refs.panel.style.display = "";
    const selectedEl = this.$refs.panel.querySelector("[aria-selected]");
    if (selectedEl) {
      this.$focus.focus(selectedEl);
    } else {
      this.$focus.within(this.$refs.panel).first();
    }
  },
  selectOption() {
    const optionButtonEls = this.$root.querySelectorAll(
      "[data-single-option-selector]"
    );
    for (const optionButtonEl of optionButtonEls) {
      optionButtonEl.removeAttribute("aria-selected");
    }
    this.$el.setAttribute("aria-selected", "true");
    this.hasSelection = true;
    this.selectedValue = this.$el.textContent.trim();
    this.optionChange(this.$el);
  },
  close(focusAfter) {
    if (!this.expanded) return;
    this.expanded = false;
    this.$refs.panel.style.display = "none";
    if (focusAfter) {
      this.$focus.focus(focusAfter);
    }
  }
});

// _src/js/components/quantity.js
var quantity_default2 = () => ({
  quantity: null,
  ...quantity_default
});

// _src/js/components/add-to-cart-price.js
var add_to_cart_price_default = () => ({
  totalCurrentPrice: null,
  quantity: null,
  init() {
    if (!this.currentVariant && this.currentVariant.price) {
      return;
    }
    const quantityInputEl = this.resolvedParentRoot.querySelector('[name="quantity"]');
    if (!quantityInputEl) {
      return;
    }
    const quantityDataStack = Alpine.$data(quantityInputEl);
    if (!(quantityDataStack && "quantity" in quantityDataStack)) {
      return;
    }
    this.quantity = quantityDataStack.quantity;
    this.updateTotalCurrentPrice();
    quantityDataStack.$watch("quantity", (value) => {
      this.quantity = value;
      this.updateTotalCurrentPrice();
    });
    this.$watch("currentVariant", () => {
      this.updateTotalCurrentPrice();
    });
  },
  updateTotalCurrentPrice() {
    if (!this.currentVariant && this.currentVariant.price) {
      this.totalCurrentPrice = null;
      return;
    }
    this.totalCurrentPrice = this.currentVariant.price * this.quantity;
  }
});

// _src/js/components/product-group-picker.js
var product_group_picker_default = () => ({
  cacheGroupProductsFor: Shopify?.designMode ? 0 : 3e5,
  // 5 minutes
  init() {
    requestIdleCallback(() => {
      this.preloadGroupProducts();
    });
  },
  preloadGroupProducts() {
    if (window.shouldTryToSaveData()) {
      console.log(
        "Preference to save data detected, will not preload sibling products"
      );
      return;
    }
    const linkEls = this.$root.querySelectorAll("a[href]");
    if (!this.$root || !linkEls || linkEls.length === 0) {
      return;
    }
    const urlsToPreload = Array.from(linkEls).map(
      (linkEl) => this.isPrimaryProductOnPage ? linkEl.href : getURLWithParams(linkEl.href, [this.identifyingURLParam])
    );
    for (const urlToPreload of urlsToPreload) {
      void fetchHTML(
        urlToPreload,
        void 0,
        this.cacheGroupProductsFor,
        Shopify?.designMode ? true : false
      );
    }
  },
  selectGroupProduct() {
    if (this.isPrimaryProductOnPage) {
      replaceMainContent(this.$el.href, void 0, this.cacheGroupProductsFor);
    } else {
      const updatedProductURL = getURLWithParams(this.$el.href, [
        this.identifyingURLParam
      ]);
      replaceElement(
        this.templateType === "quick-buy" ? this.resolvedParentRoot : this.resolvedParentRoot.closest(".shopify-section"),
        updatedProductURL,
        void 0,
        this.cacheGroupProductsFor
      );
    }
  }
});

// _src/js/components/modal-cart.js
var modal_cart_default = ({ openOnAddToCart }) => {
  return {
    init() {
      if (openOnAddToCart === true) {
        document.body.addEventListener("baseline:cart:afteradditem", () => {
          Alpine.store("modals").closeAll();
          Alpine.store("modals").open("cart");
        });
      }
      Alpine.store("modals").register("cart", "rightDrawer");
    }
  };
};

// _src/js/components/rte.js
var rte_default = () => ({
  init() {
    this.$root.querySelectorAll("table").forEach((tableEl) => {
      const wrapper = wrap(tableEl);
      wrapper.classList.add("rte__table");
    });
    const iframeSelector = `iframe[src*="youtube.com"],iframe[src="vimeo"]`;
    this.$root.querySelectorAll(iframeSelector).forEach((extVideoEl) => {
      const wrapper = wrap(extVideoEl);
      wrapper.classList.add("rte__external-video");
    });
  }
});

// _src/js/components/sidebar.js
var sidebar_default = () => ({
  boundOnSectionSelect: null,
  boundOnSectionDeselect: null,
  init() {
    if (Shopify.designMode) {
      this.setUpDesignMode();
    }
  },
  setUpDesignMode() {
    this.boundOnSectionSelect = this.onSectionSelect.bind(this);
    this.boundOnSectionDeselect = this.onSectionDeselect.bind(this);
    document.addEventListener(
      "shopify:section:select",
      this.boundOnSectionSelect
    );
    document.addEventListener(
      "shopify:section:deselect",
      this.boundOnSectionDeselect
    );
  },
  onSectionSelect(e) {
    if (!e.target.contains(this.$root)) return;
    Alpine.store("modals").open("sidebar");
  },
  onSectionDeselect(e) {
    if (!e.target.contains(this.$root)) return;
    Alpine.store("modals").close("sidebar");
  },
  destroy() {
    document.removeEventListener(
      "shopify:section:select",
      this.boundOnSectionSelect
    );
    document.removeEventListener(
      "shopify:section:deselect",
      this.boundOnSectionDeselect
    );
  }
});

// _src/js/components/table.js
var table_default = () => ({
  sortCol: 0,
  sortOrder: "asc",
  sortOpen: false,
  originalItems: [],
  mobileSortLabel: "",
  initialSortComplete: false,
  init() {
    this.originalItems = [...this.$refs.tableData.children];
    this.mobileSortLabel = this.$refs.tableHeader.children[this.sortCol].dataset.sortLabel;
    this.sortItems();
    this.initialSortComplete = true;
  },
  sort(colIndex) {
    this.sortOrder = this.sortCol === colIndex && this.sortOrder === "asc" ? "desc" : "asc";
    this.sortCol = colIndex;
    this.sortItems();
  },
  mobileSort(colIndex, order) {
    this.sortOrder = order;
    this.sortCol = colIndex;
    this.sortItems();
    this.mobileSortLabel = this.$refs.tableHeader.children[this.sortCol].dataset.sortLabel;
    this.sortOpen = false;
  },
  sortItems() {
    const tableContainer = this.$refs.tableData;
    const rows = tableContainer.children;
    const rowsArray = Array.from(rows);
    rowsArray.sort((a, b) => {
      const aSortValue = a.querySelector(`[data-index="${this.sortCol}"]`).dataset.sortValue.toLowerCase();
      const bSortValue = b.querySelector(`[data-index="${this.sortCol}"]`).dataset.sortValue.toLowerCase();
      if (!isNaN(aSortValue) && !isNaN(bSortValue)) {
        return this.sortOrder === "asc" ? aSortValue - bSortValue : bSortValue - aSortValue;
      }
      if (isBooleanString(aSortValue) && isBooleanString(bSortValue)) {
        const aSortBoolValue = stringToBoolean(aSortValue);
        const bSortBoolValue = stringToBoolean(bSortValue);
        if (aSortBoolValue === bSortBoolValue) {
          return 0;
        }
        if (aSortBoolValue) {
          return this.sortOrder === "asc" ? -1 : 1;
        } else {
          return this.sortOrder === "asc" ? 1 : -1;
        }
      }
      if (aSortValue < bSortValue) {
        return this.sortOrder === "asc" ? -1 : 1;
      }
      if (aSortValue > bSortValue) {
        return this.sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
    tableContainer.innerHTML = "";
    rowsArray.forEach((row) => tableContainer.appendChild(row));
  },
  restoreOriginalItems() {
    const tableContainer = this.$refs.tableData;
    tableContainer.innerHTML = "";
    this.originalItems.forEach((item) => tableContainer.appendChild(item));
  }
});

// _src/js/modules/splide-pagination-placeholder-extension.js
function SplidePaginationPlaceholderExtension(Splide3) {
  function mount() {
    Splide3.root.querySelectorAll("[data-splide-pagination-placeholder]").forEach((el) => {
      el.remove();
    });
  }
  return {
    mount
  };
}

// _src/js/components/slideshow.js
var slideshow_default = ({
  autoplay = false,
  autoplayInterval = null,
  mode = "slideshow",
  gap = null,
  onlyIfNeeded = false
}) => ({
  autoplay,
  autoplayInterval,
  playing: false,
  splide: null,
  rate: 0,
  mode,
  gap,
  onlyIfNeeded,
  maxLgBreakpointMQL: window.matchMedia("(max-width: 1023px)"),
  init() {
    if (typeof Splide === "undefined") {
      console.error(
        "The Slideshows component requires a Splide object to be defined in the global scope"
      );
      return;
    }
    this.initSplide();
    if (this.onlyIfNeeded) {
      this.destroyOrInitIfNeeded();
      this.maxLgBreakpointMQL.addEventListener("change", (e) => {
        this.destroyOrInitIfNeeded();
      });
    }
    if (Shopify.designMode) {
      this._setUpDesignModeHandlers();
    }
    document.addEventListener("dev:hotreloadmutation", async () => {
      if (!Shopify.designMode) {
        this.splide.destroy();
        await this.$nextTick();
        this.initSplide();
      }
    });
  },
  initSplide() {
    const options = {
      arrows: true,
      pagination: true,
      rewind: true,
      speed: 600,
      start: parseInt(this.$root.dataset.start, 10) - 1 || 0,
      interval: this.autoplayInterval,
      autoplay: this.autoplay,
      drag: !this.autoplay,
      focusableNodes: "a:not([data-splide-ignore]), button, textarea, input, select, iframe"
    };
    if (this.mode === "carousel") {
      options.autoWidth = true;
    }
    if (this.gap) {
      options.gap = this.gap;
    }
    this.splide = new Splide(this.$root, options);
    if (options.autoplay) {
      this.splide.on("autoplay:play", () => {
        this.playing = true;
      });
      this.splide.on("autoplay:pause", () => {
        this.playing = false;
      });
      this.splide.on("autoplay:playing", (rate) => {
        this.rate = rate;
      });
    }
    this.splide.mount({ SplidePaginationPlaceholderExtension });
  },
  destroyOrInitIfNeeded() {
    const slideEls = Array.from(this.$root.querySelectorAll(".splide__slide"));
    const totalSlidesWidth = slideEls.reduce(
      (totalWidth, slideEl) => totalWidth + slideEl.getBoundingClientRect().width,
      0
    );
    const totalGridlinesWidth = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--gridline-width"
      )
    ) * (slideEls.length - 1);
    const totalContentWidth = totalSlidesWidth + totalGridlinesWidth;
    if (totalContentWidth <= this.$root.getBoundingClientRect().width) {
      if (splideIsNotDestroyed(this.splide)) this.splide.destroy();
    } else {
      if (!splideIsNotDestroyed(this.splide)) this.initSplide();
    }
  },
  _setUpDesignModeHandlers() {
    this.$root.addEventListener("slideshow-go", (e) => {
      if (!e.detail) return;
      this.splide.go(parseInt(e.detail, 10));
    });
  }
});

// _src/js/components/slideshow-pagination.js
var slideshow_pagination_default = () => ({
  paginationIsWrapped: false,
  checkIfWrapped() {
    this.paginationIsWrapped = hasWrappedChildren(this.$refs.pagination);
  },
  init() {
    this.checkIfWrapped();
  }
});

// _src/js/components/promo-popup.js
var promo_popup_default = ({ delay, frequency, enabled }) => ({
  delay,
  frequency,
  enabled,
  sectionId: null,
  storageKey: null,
  boundOnSectionSelect: null,
  boundOnSectionDeselect: null,
  async init() {
    this.sectionId = this.$root.id;
    this.storageKey = `switch-popup-${this.sectionId}`;
    if (window.location.pathname === "/challenge") return;
    if (this.enabled) {
      if (Shopify.designMode) {
        Alpine.store("modals").removeExistingContents("promo", "#promoPopup");
      }
      initTeleport(this.$root);
      Alpine.store("modals").register("promoPopup", "promo");
    }
    document.body.addEventListener("promo-is-closed", (e) => {
      setExpiringStorageItem(
        this.storageKey,
        "shown",
        daysInMs(this.frequency)
      );
    });
    const popupContent = this.$refs.teleported.content.querySelector("template").content;
    const hasErrors = Boolean(popupContent.querySelector("[data-errors]"));
    const hasSuccessMessage = Boolean(
      popupContent.querySelector("[data-success-message]")
    );
    if (hasSuccessMessage || hasErrors) {
      this.open();
      this.clearSuccessParams();
      setExpiringStorageItem(this.storageKey, "shown", daysInMs(200));
    }
    if (!Shopify.designMode) {
      if (getExpiringStorageItem(this.storageKey) !== "shown") {
        setTimeout(() => {
          this.open();
          const escapeHandler = (e) => {
            if (e.code !== "Escape") return;
            this.$store.modals.close("promoPopup");
            document.body.removeEventListener("keydown", escapeHandler);
          };
          document.body.addEventListener("keydown", escapeHandler);
        }, this.delay * 1e3);
      }
    } else {
      if (window.theme.designMode.selected === this.sectionId) {
        if (this.enabled === true) {
          this.open();
        } else {
          Alpine.store("modals").close("promoPopup");
        }
      }
      this.boundOnSectionSelect = this.onSectionSelect.bind(this);
      this.boundOnSectionDeselect = this.onSectionDeselect.bind(this);
      document.addEventListener(
        "shopify:section:select",
        this.boundOnSectionSelect
      );
      document.addEventListener(
        "shopify:section:deselect",
        this.boundOnSectionDeselect
      );
    }
  },
  open() {
    this.$store.modals.open("promoPopup");
    this.$focus.first();
  },
  onSectionSelect(e) {
    if (!e.target.contains(this.$root)) return;
    if (!this.enabled) return;
    this.open();
  },
  onSectionDeselect(e) {
    if (!e.target.contains(this.$root)) return;
    this.$store.modals.close("promoPopup");
  },
  clearSuccessParams() {
    const updatedParams = new URLSearchParams(window.location.search);
    if (updatedParams.has("customer_posted")) {
      updatedParams.delete("customer_posted");
    }
    let newURL;
    if (updatedParams.toString().length > 0) {
      newURL = `${window.location.pathname}?${updatedParams.toString()}`;
    } else {
      newURL = window.location.pathname;
    }
    history.replaceState("", document.title, newURL);
  },
  destroy() {
    document.removeEventListener(
      "shopify:section:select",
      this.boundOnSectionSelect
    );
    document.removeEventListener(
      "shopify:section:deselect",
      this.boundOnSectionDeselect
    );
  }
});

// _src/js/components/countdown-timer.js
var countdown_timer_default = ({
  dateTime = {
    year: null,
    month: null,
    day: null,
    hour: null,
    minute: null
  },
  timezone = "Z",
  showYears = false,
  showMonths = false,
  showDays = true,
  showHours = true,
  showMinutes = true,
  padNumbers = true,
  minimumShownParts = 3,
  srTitleBefore = null,
  srTitle = null,
  srTitleAfter = null
} = {}) => ({
  dateTimeParts: ["years", "months", "days", "hours", "minutes", "seconds"],
  dateTime,
  timezone,
  targetDate: null,
  dateDiff: {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  },
  alreadyHappened: false,
  hidden: false,
  show: {
    years: showYears,
    months: showMonths,
    days: showDays,
    hours: showHours,
    minutes: showMinutes,
    seconds: true
  },
  padNumbers,
  minimumShownParts,
  srTitleBefore,
  srTitle,
  srTitleAfter,
  dateTimeString: null,
  separatorOn: true,
  get years() {
    return this.getPrettyNumber(this.dateDiff.years);
  },
  get months() {
    return this.getPrettyNumber(this.dateDiff.months);
  },
  get days() {
    return this.getPrettyNumber(this.dateDiff.days);
  },
  get hours() {
    return this.getPrettyNumber(this.dateDiff.hours);
  },
  get minutes() {
    return this.getPrettyNumber(this.dateDiff.minutes);
  },
  get seconds() {
    return this.getPrettyNumber(this.dateDiff.seconds);
  },
  get rawYears() {
    return this.dateDiff.years || 0;
  },
  get rawMonths() {
    return this.dateDiff.months || 0;
  },
  get rawDays() {
    return this.dateDiff.days || 0;
  },
  get rawHours() {
    return this.dateDiff.hours || 0;
  },
  get rawMinutes() {
    return this.dateDiff.minutes || 0;
  },
  get rawSeconds() {
    return this.dateDiff.seconds || 0;
  },
  get shownParts() {
    return Object.values(this.show).filter(Boolean).length || 0;
  },
  get diffAsSentence() {
    const formattedParts = [];
    for (const part of this.dateTimeParts) {
      const rawValue = this.dateDiff[part];
      if (rawValue === 0 && this.showZeros === false) {
        continue;
      }
      const variant = rawValue === 1 ? "one" : "other";
      if (part === "years" && !this.show.years && this.minimumShownParts < 6 || part == "months" && !this.show.months && this.minimumShownParts < 5 || part == "days" && !this.show.days && this.minimumShownParts < 4 || part == "hours" && !this.show.hours && this.minimumShownParts < 3 || part == "minutes" && !this.show.minutes && this.minimumShownParts < 2) {
        continue;
      }
      formattedParts.push(
        [this[part], theme.strings.dateTimeParts[part][variant]].join("&nbsp;")
      );
    }
    return formattedParts.join(", ");
  },
  get screenReaderText() {
    if (this.alreadyHappened) {
      return window.theme.strings.countdownTimerComplete;
    }
    return `${srTitleBefore ?? ""}${window.theme.strings.countdownTimerSRText.replace(
      "{{ target }}",
      this.srTitle && this.srTitle !== "" ? this.srTitle : this.srTargetDate
    ).replace("{{ time_left }}", this.srDiffAsSentence)}${srTitleAfter ?? ""}`;
  },
  get srTargetDate() {
    return this.targetDate.toLocaleDateString(window.theme.locale.isoCode, {
      timezone: window.theme.locale.timeZone,
      year: "numeric",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric"
    });
  },
  srDiffAsSentence: "",
  intervalID: null,
  srIntervalId: null,
  init() {
    if (!this.dateTime) {
      throw new Error("CountdownTimer: No date input provided");
    }
    this.dateTimeString = `${this.dateTime.year}-${this.dateTime.month}-${this.dateTime.day.padStart(2, "0")}T${this.dateTime.hour.padStart(2, "0")}:${this.dateTime.minute.padStart(2, 0)}:00${this.dateTime.timeZone}`;
    try {
      this.targetDate = this.dateFromString(this.dateTimeString);
    } catch (e) {
      const errorMessage = "There was an error parsing the date, please double-check the date provided in settings. " + e.message;
      this.hidden = true;
      console.error(errorMessage);
    }
    this.updateDiff();
    this.intervalID = setInterval(this.updateDiff.bind(this), 1e3);
    this.$nextTick(() => {
      this.updateSRText();
      this.srIntervalID = setInterval(this.updateSRText.bind(this), 15e3);
    });
  },
  dateFromString(dateTimeString) {
    const dateTimeFormatRegex = /[\d]{4}\-[\d]{2}\-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}[+-]?[\d]{2}:[\d]{2}/;
    if (dateTimeFormatRegex.test(dateTimeString)) {
      return new Date(dateTimeString);
    } else {
      throw new Error(
        `CountdownTimer: Unparseable date-time string: ${dateTimeString}`
      );
    }
  },
  updateDiff() {
    const now = /* @__PURE__ */ new Date();
    if (this.targetDate <= now) {
      this.markAsAlreadyHappened();
      return;
    }
    this.dateDiff = this.calculateDiff(now, this.targetDate);
    this.show.years = this.dateDiff.years > 0 || this.minimumShownParts == 6;
    this.show.months = this.dateDiff.months > 0 || this.show.years || this.minimumShownParts >= 5;
    this.show.days = this.dateDiff.days > 0 || this.show.months || this.minimumShownParts >= 4;
    this.show.hours = this.dateDiff.hours > 0 || this.show.days || this.minimumShownParts >= 3;
    this.show.minutes = this.dateDiff.minutes > 0 || this.show.hours || this.minimumShownParts >= 2;
    this.separatorOn = !this.separatorOn;
  },
  markAsAlreadyHappened() {
    clearInterval(this.intervalID);
    this.dateDiff = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    this.show.years = this.minimumShownParts == 6;
    this.show.months = this.minimumShownParts >= 5;
    this.show.days = this.minimumShownParts >= 4;
    this.show.hours = this.minimumShownParts >= 3;
    this.show.minutes = this.minimumShownParts >= 2;
    this.separatorOn = true;
    this.alreadyHappened = true;
  },
  calculateDiff(start, end) {
    let startDate = new Date(start.getTime());
    let endDate = new Date(end.getTime());
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();
    let hours = endDate.getHours() - startDate.getHours();
    let minutes = endDate.getMinutes() - startDate.getMinutes();
    let seconds = endDate.getSeconds() - startDate.getSeconds();
    if (seconds < 0) {
      seconds += 60;
      minutes--;
    }
    if (minutes < 0) {
      minutes += 60;
      hours--;
    }
    if (hours < 0) {
      hours += 24;
      days--;
    }
    if (days < 0) {
      const previousMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        0
      );
      days += previousMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }
    return { years, months, days, hours, minutes, seconds };
  },
  getPrettyNumber(number) {
    return this.padNumbers ? number.toString().padStart(2, "0") : number.toString();
  },
  updateSRText() {
    this.srDiffAsSentence = JSON.parse(JSON.stringify(this.diffAsSentence));
  },
  destroy() {
    clearInterval(this.intervalID);
    clearInterval(this.srIntervalID);
  }
});

// _src/js/elements/scrolling-items-container.js
var ScrollingItemsContainer = class extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this.isConnected) return;
    this.scrollingItemsEl = this.firstElementChild;
    this.resizeObserver = new ResizeObserver(
      debounce((entries) => {
        const entry = entries[0];
        if (entry.contentRect.width === this.lastWidth) {
          return;
        }
        this.lastWidth = entry.contentRect.width;
        this.scrollingItemsEl.adjustScrollingItemsSpeed();
        this.scrollingItemsEl.makeClones();
      }, 150)
    );
    this.resizeObserver.observe(this);
    this.addEventListener("scrolling-items:change", () => {
      this.scrollingItemsEl.adjustScrollingItemsSpeed();
      this.scrollingItemsEl.makeClones();
    });
    if (Shopify.designMode) {
      document.addEventListener("shopify:section:unload", (e) => {
        if (e.target.contains(this)) {
          this.resizeObserver.disconnect();
        }
      });
    }
  }
  disconnectedCallback() {
    this.resizeObserver.disconnect();
  }
};

// _src/js/elements/scrolling-items.js
var ScrollingItems = class _ScrollingItems extends HTMLElement {
  static mutatingAttributes = ["x-html", "x-text", "x-html-if-set"];
  static alpineRootAttributes = ["x-data", "x-init"];
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this.isConnected) return;
    this.mutatingContentEl = this.querySelector("[data-mutating-content]");
    if (this.mutatingContentEl) {
      this.setUpMutationObserver();
    }
    this.adjustScrollingItemsSpeed();
    this.makeClones();
  }
  adjustScrollingItemsSpeed() {
    const referenceWidth = 1024;
    document.documentElement.style.setProperty(
      "--global-scrolling-items-speed-multiplier",
      window.innerWidth / referenceWidth
    );
  }
  makeClones() {
    let i = 0;
    const fallbackContentEl = this.querySelector("noscript");
    if (fallbackContentEl) {
      this.querySelector("noscript").remove();
    }
    const scrollingItemsSurfaceEl = this.querySelector(
      "scrolling-items-surface"
    );
    const originalContentEl = this.querySelector("scrolling-items-content");
    if (!scrollingItemsSurfaceEl || !originalContentEl) {
      return;
    }
    const originalContentWidth = originalContentEl.getBoundingClientRect().width;
    if (originalContentWidth === 0) {
      return;
    }
    const totalClonesNeeded = 2 * Math.ceil(window.innerWidth * 2 / originalContentWidth / 2);
    const sanitizedContentEl = originalContentEl.cloneNode(true);
    if (this.mutatingContentEl) {
      const clonedMutatingContentEl = sanitizedContentEl.querySelector(
        "[data-mutating-content]"
      );
      if (clonedMutatingContentEl) {
        clonedMutatingContentEl.removeAttribute("data-mutating-content");
        clonedMutatingContentEl.setAttribute(
          "data-cloned-mutating-content",
          ""
        );
        if (_ScrollingItems.alpineRootAttributes.some(
          (attr) => clonedMutatingContentEl.hasAttribute(attr)
        )) {
          clonedMutatingContentEl.setAttribute("x-ignore", "");
        } else {
          for (const attribute of _ScrollingItems.mutatingAttributes) {
            if (clonedMutatingContentEl.hasAttribute(attribute)) {
              clonedMutatingContentEl.removeAttribute(attribute);
            }
          }
        }
      }
    }
    const addClone = () => {
      const clone = sanitizedContentEl.cloneNode(true);
      scrollingItemsSurfaceEl.append(clone);
    };
    while (scrollingItemsSurfaceEl.children.length !== totalClonesNeeded) {
      if (totalClonesNeeded === Infinity || Number.isNaN(totalClonesNeeded) || i > 1e3) {
        console.error(
          `Baseline: Scrolling items: Something went wrong inside the scrolling items layout function`,
          {
            originalContentWidth,
            windowInnerWidth: window.innerWidth,
            totalExistingClones: scrollingItemsSurfaceEl.children.length,
            totalClonesNeeded
          }
        );
        break;
      }
      if (scrollingItemsSurfaceEl.children.length > totalClonesNeeded) {
        scrollingItemsSurfaceEl.removeChild(scrollingItemsSurfaceEl.lastChild);
      } else {
        addClone();
      }
    }
    this.style.setProperty(
      "--local-scrolling-items-speed-multiplier",
      this.getBoundingClientRect().width / window.innerWidth
    );
  }
  setUpMutationObserver() {
    this.throttledMutationObserverCb = throttle(
      (_records, _observer) => {
        const clonedEls = this.querySelectorAll(
          "[data-cloned-mutating-content]"
        );
        for (const clonedEl of clonedEls) {
          clonedEl.innerHTML = this.mutatingContentEl.innerHTML;
          if (this.mutatingContentEl.hasAttribute("style")) {
            clonedEl.setAttribute(
              "style",
              this.mutatingContentEl.getAttribute("style")
            );
          }
        }
        this.makeClones();
      },
      100,
      true
      // trailing – run on the last mutation of the batch
    );
    this.mutationObserver = new MutationObserver(
      this.throttledMutationObserverCb
    );
    this.mutationObserver.observe(this.mutatingContentEl, {
      subtree: true,
      childList: true,
      attributes: true
    });
  }
  disconnectedCallback() {
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
  }
};

// _src/js/elements/text-fit.js
var TextFit = class extends HTMLElement {
  connectedCallback() {
    if (!this.isConnected) return;
    if (getComputedStyle(this).getPropertyValue("--support-sentinel") !== "9999px") {
      return;
    }
    console.log("text-fit: Using JavaScript fallback");
    this.resizeObserver = new ResizeObserver(
      throttle(this.updateFontSize.bind(this), 100)
    );
    this.resizeObserver.observe(this);
  }
  updateFontSize() {
    const measureEl = this.querySelector(
      '[aria-hidden="true"], text-fit-measure'
    );
    const displayEl = this.querySelector("[data-display], text-fit-adjusted");
    measureEl.style.position = "absolute";
    measureEl.style.left = "-9999px";
    const currentFontSize = parseFloat(getComputedStyle(measureEl).fontSize);
    const currentContentElInlineSize = measureEl.getBoundingClientRect().width;
    const currentElInlineSize = this.getBoundingClientRect().width;
    const ratio = currentElInlineSize / currentContentElInlineSize;
    displayEl.style.setProperty("--font-size", `${currentFontSize * ratio}px`);
    displayEl.style.setProperty("white-space", "nowrap");
  }
  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
};

// node_modules/@shopify/theme-currency/currency.js
var moneyFormat = "${{amount}}";
function formatMoney2(cents, format) {
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }
  let value = "";
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || moneyFormat;
  function formatWithDelimiters(number, precision = 2, thousands = ",", decimal = ".") {
    if (isNaN(number) || number == null) {
      return 0;
    }
    number = (number / 100).toFixed(precision);
    const parts = number.split(".");
    const dollarsAmount = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      `$1${thousands}`
    );
    const centsAmount = parts[1] ? decimal + parts[1] : "";
    return dollarsAmount + centsAmount;
  }
  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }
  return formatString.replace(placeholderRegex, value);
}

// node_modules/@switchthemes/live-region/index.js
function liveRegion(content, clear) {
  clearTimeout(window.liveRegionTimeout);
  let region = document.getElementById("screenreader-announce");
  region.innerHTML = content;
  window.liveRegionTimeout = setTimeout(() => {
    region.innerHTML = "";
  }, 3e3);
}
function cartLiveRegion(item) {
  const templateString = theme.strings.update + ": [QuantityLabel]: [Quantity], [Regular] [$$] [DiscountedPrice] [$]. [PriceInformation]";
  function _liveRegionContent() {
    let liveRegionContent = templateString;
    liveRegionContent = liveRegionContent.replace("[QuantityLabel]", theme.strings.quantity).replace("[Quantity]", item.quantity);
    let regularLabel = "";
    let regularPrice = formatMoney2(item.original_line_price, theme.moneyFormat);
    let discountLabel = "";
    let discountPrice = "";
    let discountInformation = "";
    if (item.original_line_price > item.final_line_price) {
      regularLabel = theme.strings.regularTotal;
      discountLabel = theme.strings.discountedTotal;
      discountPrice = formatMoney2(item.final_line_price, theme.moneyFormat);
      discountInformation = theme.strings.priceColumn;
    }
    liveRegionContent = liveRegionContent.replace("[Regular]", regularLabel).replace("[$$]", regularPrice).replace("[DiscountedPrice]", discountLabel).replace("[$]", discountPrice).replace("[PriceInformation]", discountInformation).replace("  .", "").trim();
    return liveRegionContent;
  }
  liveRegion(_liveRegionContent(), true);
}
function variantLiveRegion(variant) {
  const templateString = "[Availability] [Regular] [$$] [Sale] [$]. [UnitPrice] [$$$]";
  function _getBaseUnit() {
    if (variant.unit_price_measurement.reference_value === 1) {
      return variant.unit_price_measurement.reference_unit;
    }
    return variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
  }
  function _liveRegionContent() {
    let liveRegionContent = templateString;
    const availability = variant.available ? "" : theme.strings.soldOut + ",";
    liveRegionContent = liveRegionContent.replace(
      "[Availability]",
      availability
    );
    let regularLabel = "";
    let regularPrice = formatMoney2(variant.price, theme.moneyFormat);
    let saleLabel = "", salePrice = "", unitLabel = "", unitPrice = "";
    if (variant.compare_at_price > variant.price) {
      regularLabel = theme.strings.regularPrice;
      regularPrice = formatMoney2(variant.compare_at_price, theme.moneyFormat);
      saleLabel = theme.strings.sale;
      salePrice = formatMoney2(variant.price, theme.moneyFormat);
    }
    if (variant.unit_price) {
      unitLabel = theme.strings.unitPrice;
      unitPrice = formatMoney2(variant.unit_price, theme.moneyFormat) + " " + theme.strings.unitPriceSeparator + " " + _getBaseUnit();
    }
    liveRegionContent = liveRegionContent.replace("[Regular]", regularLabel).replace("[$$]", regularPrice).replace("[Sale]", saleLabel).replace("[$]", salePrice).replace("[UnitPrice]", unitLabel).replace("[$$$]", unitPrice).replace("  .", "").trim();
    return liveRegionContent;
  }
  liveRegion(_liveRegionContent(), false);
}

// node_modules/@switchthemes/islands/index.js
var DataIsland = class extends HTMLElement {
  constructor() {
    super();
  }
  async connectedCallback() {
    if (!this.isConnected) return;
    this._x_ignore = true;
    let onVisible = false, onIdle = false, onInteraction = false;
    let onVisibleModifier;
    if (this.hasAttribute("on")) {
      const onAttribute = this.getAttribute("on");
      if (onAttribute === "idle") {
        onIdle = true;
      } else if (onAttribute.endsWith("visible")) {
        onVisible = true;
        onVisibleModifier = onAttribute.includes(":") ? onAttribute.split(":")[0] : null;
      } else if (onAttribute === "interaction") {
        onInteraction = true;
      }
    } else {
      onVisible = true;
    }
    if (onIdle) {
      await this.idle();
    } else if (onVisible) {
      await this.visible(onVisibleModifier);
    } else if (onInteraction) {
      await this.interaction();
    }
    this.hydrate();
  }
  idle() {
    return new Promise((resolve) => {
      requestIdleCallback(() => {
        resolve();
      });
    });
  }
  interaction() {
    const events = ["touchstart", "click"];
    return new Promise((resolve) => {
      const onInteractionListener = (event) => {
        for (const eventName of events) {
          this.removeEventListener(eventName, onInteractionListener);
        }
        resolve();
      };
      for (const eventName of events) {
        this.addEventListener(eventName, onInteractionListener);
      }
    });
  }
  visible(modifier = null) {
    const options = {
      rootMargin: "25%"
    };
    if (modifier) {
      switch (modifier) {
        case "before":
          options.rootMargin = "125%";
          break;
        case "mostly":
          options.rootMargin = "0px";
          options.threshold = 0.75;
          break;
        case "fully":
          options.rootMargin = "0px";
          options.threshold = 1;
          break;
      }
    }
    return new Promise((resolve) => {
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) return;
          resolve();
          io.disconnect();
          break;
        }
      }, options);
      if (getComputedStyle(this).display === "contents") {
        for (const childEl of this.children) {
          io.observe(childEl);
        }
      } else {
        io.observe(this);
      }
    });
  }
  // disconnectedCallback() {
  // }
  async hydrate() {
    const componentName = this.getAttribute("x-data")?.trim().split("(")[0];
    if (componentName && !componentName.startsWith("{") && this.hasAttribute("src")) {
      await importOrImportShim(this.getAttribute("src"));
    }
    await this.parentHydration();
    if (!window.Alpine) await window.alpineInitPromise();
    if (!window.alpineIsStarted) await window.alpineStartedPromise();
    delete this._x_ignore;
    await Alpine.nextTick();
    Alpine.initTree(this);
    this.setAttribute("ready", "");
  }
  parentHydration() {
    const parentDeferredEl = this.parentElement.closest(
      "data-island:not([ready])"
    );
    if (!parentDeferredEl) {
      return;
    }
    return new Promise((resolve, reject) => {
      if (parentDeferredEl) {
        const parentObserver = new MutationObserver(
          (mutationsList, observer) => {
            if (parentDeferredEl.hasAttribute("ready")) {
              observer.disconnect();
              resolve();
            }
          }
        );
        parentObserver.observe(parentDeferredEl, {
          attributes: true,
          attributeFilter: ["ready"]
        });
      }
    });
  }
};
function init() {
  if (!(HTMLScriptElement.supports && HTMLScriptElement.supports("importmap")) || typeof window.importShim !== "undefined") {
    window.importOrImportShim = (name) => importShim(name);
  } else {
    window.importOrImportShim = (name) => import(name);
  }
  window.alpineIsInitialized = false;
  window.alpineIsStarted = false;
  document.addEventListener("alpine:initialized", () => {
    window.alpineIsInitialized = true;
  });
  document.addEventListener("switch:alpine:started", () => {
    window.alpineIsStarted = true;
  });
  window.alpineInitPromise = () => {
    return new Promise((resolve) => {
      if (window.alpineIsInitialized) {
        resolve();
      }
      document.addEventListener("alpine:initialized", () => {
        resolve();
      });
    });
  };
  window.alpineStartedPromise = () => {
    return new Promise((resolve) => {
      if (window.alpineIsStarted) {
        resolve();
      }
      document.addEventListener("switch:alpine:started", () => {
        resolve();
      });
    });
  };
  if (!customElements.get("data-island")) {
    customElements.define("data-island", DataIsland);
  }
}

// _src/js/global.js
var { intersect, focus, collapse, morph } = AlpinePlugins;
Alpine2.plugin(intersect);
Alpine2.plugin(focus);
Alpine2.plugin(collapse);
Alpine2.plugin(morph);
Alpine2.plugin(fetched_fragment_default);
Alpine2.plugin(html_if_set_default);
Alpine2.plugin(mask_default);
window.Alpine = Alpine2;
window.Spruce = Alpine2;
init();
window.Splide = Splide2;
window.liveRegion = liveRegion;
window.variantLiveRegion = variantLiveRegion;
window.cartLiveRegion = cartLiveRegion;
document.addEventListener("alpine:init", () => {
  Alpine2.store("modals", modals_default);
  Alpine2.store("cartCount", cart_count_default);
});
Alpine2.data("AgeCheck", age_check_default);
Alpine2.data("FreeShippingBar", free_shipping_bar_default);
Alpine2.data("CartItems", cart_items_default);
Alpine2.data("CartItem", cart_item_default);
Alpine2.data("CartItemQuantity", cart_item_quantity_default);
Alpine2.data("CartFooter", cart_footer_default);
Alpine2.data("CartNote", cart_note_default);
Alpine2.data("Header", header_default);
Alpine2.data("Video", video_default);
Alpine2.data("ProductMediaVideo", product_media_video_default);
Alpine2.data("HTMLVideo", html_video_default);
Alpine2.data("Filterable", filterable_default);
Alpine2.data("RangeControl", range_control_default);
Alpine2.data("OptionDropDown", option_drop_down_default);
Alpine2.data("Quantity", quantity_default2);
Alpine2.data("AddToCartPrice", add_to_cart_price_default);
Alpine2.data("ProductGroupPicker", product_group_picker_default);
Alpine2.data("Sidebar", sidebar_default);
Alpine2.data("Table", table_default);
Alpine2.data("ModalCart", modal_cart_default);
Alpine2.data("RTE", rte_default);
Alpine2.data("Slideshow", slideshow_default);
Alpine2.data("SlideshowPagination", slideshow_pagination_default);
Alpine2.data("PromoPopup", promo_popup_default);
Alpine2.data("CountdownTimer", countdown_timer_default);
if (!customElements.get("scrolling-items-container")) {
  customElements.define("scrolling-items-container", ScrollingItemsContainer);
}
if (!customElements.get("scrolling-items")) {
  customElements.define("scrolling-items", ScrollingItems);
}
if (!customElements.get("text-fit")) {
  customElements.define("text-fit", TextFit);
}
setTimeout(() => {
  Alpine2.start();
  document.dispatchEvent(new CustomEvent("switch:alpine:started"));
});
console.log('Baseline theme (5.0.0) by SWITCH | Make the switch: https://switchthemes.co');
