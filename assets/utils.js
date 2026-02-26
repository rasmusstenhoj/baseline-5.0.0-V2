/**
 * `formatMoney` originally from Shopify’s `theme-scripts` package
 * https://github.com/Shopify/theme-scripts/blob/master/packages/theme-currency/currency.js#L20
 */

/**
 * Format money values based on your shop currency settings
 * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
 * or 3.00 dollars
 * @param  {String} formatString - shop money_format setting
 * @return {String} value - formatted value
 */

function formatMoney(cents, formatString = theme.moneyFormat) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }

  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;

  function formatWithDelimiters(
    number,
    precision = 2,
    thousands = ',',
    decimal = '.'
  ) {
    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      `$1${thousands}`
    );
    const centsAmount = parts[1] ? decimal + parts[1] : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

window.switchDOMContentLoaded = false;

document.addEventListener('DOMContentLoaded', () => {
  window.switchDOMContentLoaded = true;
});

window.switchOnDOMContentLoaded = (cb) => {
  if (cb) {
    if (window.switchDOMContentLoaded) {
      cb();
      return;
    }

    document.addEventListener('DOMContentLoaded', () => {
      cb();
    });
  } else {
    return new Promise((resolve) => {
      if (window.switchDOMContentLoaded) {
        resolve();
        return;
      }

      document.addEventListener(
        'DOMContentLoaded',
        () => {
          resolve();
        },
        {
          once: true,
        }
      );
    });
  }
};

window.requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    const start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };

function wrap(el, tagName = 'div') {
  const wrapper = document.createElement(tagName);

  el.parentNode.insertBefore(wrapper, el);

  wrapper.appendChild(el);

  return wrapper;
}

function wrapAll(nodes, wrapper) {
  // Cache the current parent and previous sibling of the first node.
  var parent = nodes[0].parentNode;
  var previousSibling = nodes[0].previousSibling;

  // Place each node in wrapper.
  //  - If nodes is an array, we must increment the index we grab from
  //    after each loop.
  //  - If nodes is a NodeList, each node is automatically removed from
  //    the NodeList when it is removed from its parent with appendChild.
  for (var i = 0; nodes.length - i; wrapper.firstChild === nodes[0] && i++) {
    wrapper.appendChild(nodes[i]);
  }

  // Place the wrapper just after the cached previousSibling
  parent.insertBefore(wrapper, previousSibling.nextSibling);

  return wrapper;
}

function unwrap(wrapper) {
  // place childNodes in document fragment
  var docFrag = document.createDocumentFragment();
  while (wrapper.firstChild) {
    var child = wrapper.removeChild(wrapper.firstChild);
    docFrag.appendChild(child);
  }

  // replace wrapper with document fragment
  wrapper.parentNode.replaceChild(docFrag, wrapper);
}

function loadScriptBySrc(scriptSrc) {
  if (
    document.head.querySelector(`script[src="${scriptSrc}"]`) ||
    document.body.querySelector(`script[src="${scriptSrc}"]`)
  )
    return;

  const scriptEl = document.createElement('script');
  scriptEl.src = scriptSrc;
  scriptEl.type = 'module';

  document.body.appendChild(scriptEl);

  return scriptEl;
}

function loadInlineScript(scriptContent) {
  console.time('inlineScriptDuplicatesCheck');

  const headScripts = document.head.querySelectorAll('script[type="module"]');
  const bodyScripts = document.body.querySelectorAll('script[type="module"]');

  const allScripts = Array.from(headScripts).concat(Array.from(bodyScripts));

  const scriptsWithSameContent = allScripts.filter(
    (script) =>
      !script.src &&
      script.textContent.replace(/\s/g, '') === scriptContent.replace(/\s/g, '')
  );

  console.timeEnd('inlineScriptDuplicatesCheck');

  if (scriptsWithSameContent.length > 0) {
    return;
  } else {
    const scriptEl = document.createElement('script');

    scriptEl.type = 'module';

    scriptEl.textContent = scriptContent;

    document.body.appendChild(scriptEl);

    return scriptEl;
  }
}

function loadThisScript(sourceScriptEl) {
  return new Promise((resolve, reject) => {
    if (sourceScriptEl.type !== 'module') {
      console.warn('Script not loaded, not a module', sourceScriptEl);
      reject();
    }

    if (sourceScriptEl.src) {
      const scriptEl = loadScriptBySrc(sourceScriptEl.src);

      if (scriptEl) {
        scriptEl.onload = () => {
          resolve();
        };

        scriptEl.onerror = () => {
          reject();
        };
      } else {
        resolve();
      }
    } else if (sourceScriptEl.textContent.trim() !== '') {
      const scriptEl = loadInlineScript(sourceScriptEl.textContent);

      resolve();
    }
  });
}

function loadTheseScripts(scriptEls) {
  const promises = [];

  for (scriptEl of scriptEls) {
    promises.push(loadThisScript(scriptEl));
  }

  return Promise.all(promises);
}

let touchDevice = false;

function isTouch() {
  return touchDevice;
}

document.addEventListener('touchstart', () => {
  touchDevice = true;
});

function themeHeaderEl() {
  return document.querySelector('[data-theme-header]');
}

function headerIsSticky() {
  const headerEl = themeHeaderEl();

  if (
    headerEl &&
    headerEl.hasAttribute('data-sticky-header') &&
    headerEl.dataset.stickyHeader === 'true'
  ) {
    return true;
  }

  return false;
}

function headerIsOverlaid() {
  const headerEl = themeHeaderEl();

  if (
    headerEl &&
    headerEl.hasAttribute('data-overlay-header') &&
    headerEl.dataset.overlayHeader === 'true'
  ) {
    return true;
  }

  return false;
}

function scrollToTopOf(element) {
  if (!element) return;

  let topOffset = element.getBoundingClientRect().top;

  if (headerIsSticky() || headerIsOverlaid()) {
    topOffset -=
      parseFloat(
        document.documentElement.style.getPropertyValue('--header-group-height')
      ) + 20;
  }

  window.scroll({
    top: window.scrollY + topOffset,
    ...(isMotionSafe() && { behavior: 'smooth' }),
  });
}

function objectHasNoKeys(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }

  return true;
}

function nextOrFirst(array, currentItem) {
  if (!currentItem) return array[0];

  return array[array.indexOf(currentItem) + 1] || array[0];
}

function previousOrLast(array, currentItem) {
  if (!currentItem) return array[array.length - 1];

  return array[array.indexOf(currentItem) - 1] || array[array.length - 1];
}

function fetchConfigDefaults(acceptHeader = 'application/json') {
  return {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json;',
      Accept: acceptHeader,
    },
  };
}

function parseDOMFromString(htmlString) {
  window.___baselineDOMParser = window.___baselineDOMParser || new DOMParser();

  return window.___baselineDOMParser.parseFromString(htmlString, 'text/html');
}

function querySelectorInHTMLString(selector, htmlString) {
  return parseDOMFromString(htmlString).querySelector(selector);
}

/**
 * Light wrapper around fetch for making common
 * requests easier. Provides very basic caching.
 *
 * Requests are not cached inside theme editor.
 */

window.__fetchCache = window.__fetchCache || {};

const RESPONSE_TYPE_JSON = 0;
const RESPONSE_TYPE_TEXT = 1;

async function fetchAndCache(
  url,
  options,
  cacheTimeout = 5000,
  forceFresh = Shopify.designMode ? true : false,
  responseType
) {
  const key = url.toString();

  if (__fetchCache[key] && !forceFresh) {
    return __fetchCache[key];
  }

  const responseReader =
    responseType === RESPONSE_TYPE_TEXT
      ? Response.prototype.text
      : Response.prototype.json;

  const res = await fetch(url, options);
  const data = responseReader.call(res);

  if (cacheTimeout && cacheTimeout > 0) {
    __fetchCache[key] = data;

    setTimeout(() => {
      delete __fetchCache[key];
    }, cacheTimeout);
  }

  return data;
}

function invalidateCacheForKeysContaining(string) {
  const matchingKeys = Object.keys(__fetchCache).filter((key) =>
    key.includes(string)
  );

  for (const key of matchingKeys) {
    delete __fetchCache[key];
  }
}

/**
 * fetchHTML and fetchJSON cache responses for 5 seconds
 * by default; if a fresh request is required, set
 * forceFresh to true or use the freshHTML and freshJSON
 * helper functions.
 */

async function fetchHTML(
  url,
  options,
  cacheTimeout = 5000,
  forceFresh = Shopify.designMode ? true : false
) {
  return fetchAndCache(
    url,
    options,
    cacheTimeout,
    forceFresh,
    RESPONSE_TYPE_TEXT
  );
}

function freshHTML(url, options) {
  return fetchHTML(url, options, 0, true);
}

async function fetchJSON(
  url,
  options,
  cacheTimeout = 5000,
  forceFresh = Shopify.designMode ? true : false
) {
  return fetchAndCache(
    url,
    options,
    cacheTimeout,
    forceFresh,
    RESPONSE_TYPE_JSON
  );
}

function freshJSON(url, options) {
  return fetchJSON(url, options, 0, true);
}

async function fetchHTMLFragment(url, selector) {
  const fetchedHTMLString = await fetchHTML(url);
  const fragment = querySelectorInHTMLString(selector, fetchedHTMLString);

  return fragment ? fragment.innerHTML : '';
}

function mdBreakpointMQL() {
  return window.matchMedia('(min-width: 768px)');
}

function isMdBreakpoint() {
  return window.mdBreakpointMQL().matches;
}

function maxLgBreakpointMQL() {
  return window.matchMedia('(max-width: 1023px)');
}

function isMaxLgBreakpoint() {
  return window.maxLgBreakpointMQL().matches;
}

function lgBreakpointMQL() {
  return window.matchMedia('(min-width: 1024px)');
}

function isLgBreakpoint() {
  return window.lgBreakpointMQL().matches;
}

function motionSafeMQL() {
  return window.matchMedia('(prefers-reduced-motion: reduce)');
}

function isMotionSafe() {
  return !window.motionSafeMQL().matches;
}

function reducedDataMQL() {
  return window.matchMedia('(prefers-reduced-data: reduce)');
}

function prefersReducedData() {
  return reducedDataMQL().matches;
}

function isSlowConnection() {
  if ('connection' in navigator) {
    const { connection } = navigator;

    return (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g'
    );
  }

  return false;
}

function shouldTryToSaveData() {
  return (
    prefersReducedData() ||
    isSlowConnection() ||
    ('connection' in navigator && navigator.connection.saveData === true)
  );
}

function showMobileSidebarNav() {
  if (window.alwaysShowMobileSidebarNav === true) {
    return true;
  }

  return !isMdBreakpoint();
}

function initTeleport(el) {
  if (!el) return;

  const teleportCandidates = el.querySelectorAll('[data-should-teleport]');

  if (teleportCandidates.length) {
    teleportCandidates.forEach((teleportCandidate) => {
      teleportCandidate.setAttribute(
        'x-teleport',
        teleportCandidate.dataset.shouldTeleport
      );
    });
  }
}

async function getModalLabel(modalSlotName, slotEl) {
  if (Alpine.store('modals')[modalSlotName].open) {
    await globalNextTick();

    const labelSourceEl = Array.from(slotEl.children).filter((el) =>
      el.hasAttribute('data-modal-label')
    )[0];

    if (labelSourceEl) {
      return labelSourceEl.dataset.modalLabel;
    }
  }

  return false;
}

function waitForContent(element) {
  return new Promise((resolve, reject) => {
    if (element.innerHTML.trim().length > 0) {
      resolve();
    }

    const mutationObserver = new MutationObserver((mutationsList, observer) => {
      if (element.innerHTML.trim().length > 0) {
        observer.disconnect();
        resolve();
      }
    });

    mutationObserver.observe(element, { childList: true });
  });
}

window.uniqueFilter = (element, index, array) =>
  array.indexOf(element) === index;

function shallowDiffKeys(object1, object2, meaningfulKeys = []) {
  function keysForDiff(object) {
    if (meaningfulKeys.length === 0) {
      return Object.keys(object);
    }

    return Object.keys(object).filter(
      (key) => meaningfulKeys.indexOf(key) !== -1
    );
  }

  const keys1 = keysForDiff(object1);
  const keys2 = keysForDiff(object2);

  let equal = true;

  const diffKeys = [];

  if (keys1.length !== keys2.length) {
    equal = false;
  }

  if (equal) {
    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        diffKeys.push(key);
        equal = false;
      }
    }
  }

  return { equal, diffKeys };
}

function shallowDiffKeysOnMultiple(arrayOfObjects, meaningfulKeys = []) {
  const results = [];
  const allDiffKeys = [];

  for (const array1 of arrayOfObjects) {
    for (const array2 of arrayOfObjects) {
      results.push(shallowDiffKeys(array1, array2, meaningfulKeys).equal);
      allDiffKeys.push(
        shallowDiffKeys(array1, array2, meaningfulKeys).diffKeys
      );
    }
  }

  const result = results.reduce((prev, curr) => prev && curr);

  const uniqueDiffKeys = allDiffKeys.flat().filter(uniqueFilter);

  return { result, uniqueDiffKeys };
}

function iFrameCommand(iFrameEl, commandString) {
  if (!iFrameEl || !commandString) return;

  iFrameEl.contentWindow.postMessage(
    JSON.stringify({
      event: 'command',
      func: commandString,
      args: '',
    }),
    '*'
  );
}

function iFrameMethod(iFrameEl, methodString) {
  if (!iFrameEl || !methodString) return;

  iFrameEl.contentWindow.postMessage(
    JSON.stringify({
      method: methodString,
    }),
    '*'
  );
}

function splideIsIdle(splideInstance) {
  if (!splideInstance) return;

  if (window.Splide && splideInstance) {
    if (splideInstance.state.is(window.Splide.STATES.IDLE)) {
      return true;
    }
  }

  return false;
}

function splideIsDestroyed(splideInstance) {
  if (!splideInstance) return;

  if (window.Splide && splideInstance) {
    if (splideInstance.state.is(window.Splide.STATES.DESTROYED)) {
      return true;
    }
  }

  return false;
}

function splideIsNotDestroyed(splideInstance) {
  if (!splideInstance) return;

  if (window.Splide && splideInstance) {
    if (!splideInstance.state.is(window.Splide.STATES.DESTROYED)) {
      return true;
    }
  }

  return false;
}

function getUrlWithVariant(url, id) {
  if (/variant=/.test(url)) {
    return url.replace(/(variant=)[^&]+/, '$1' + id);
  } else if (/\?/.test(url)) {
    return url.concat('&variant=').concat(id);
  }

  return url.concat('?variant=').concat(id);
}

function getSectionId(el) {
  if (!el._closestSectionId) {
    el._closestSectionId = el
      .closest('.shopify-section')
      ?.getAttribute('id')
      .replace('shopify-section-', '');
  }

  return el._closestSectionId;
}

function kebabCase(subject) {
  if ([' ', '_'].includes(subject)) return subject;
  return subject
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]/, '-')
    .toLowerCase();
}

function clearURLSearchParams(url) {
  for (const key of [...url.searchParams.keys()]) {
    url.searchParams.delete(key);
  }
}

/**
 * paramsInput can be a string, a sequence of pairs,
 * or a record, as per:
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams#examples
 *
 * It can also be an instance of URLSearchParams.
 *
 */

function _getURLByModifyingParams(
  urlString,
  paramsInput,
  clear = false,
  append
) {
  const url = new URL(urlString, window.location.origin);

  if (clear) {
    clearURLSearchParams(url);
  }

  const params = new URLSearchParams(paramsInput);

  const setOrAppendParam = append
    ? URLSearchParams.prototype.append
    : URLSearchParams.prototype.set;

  for (const [key, value] of params) {
    setOrAppendParam.call(url.searchParams, key, value);
  }

  return url;
}

function getURLWithParams(url, paramsInput, clear = false) {
  return _getURLByModifyingParams(url, paramsInput, clear, false);
}

function currentURLWithParams(paramsInput, clear = false) {
  return getURLWithParams(window.location.href, paramsInput, clear);
}

function getURLAddingParams(url, paramsInput, clear = false) {
  return _getURLByModifyingParams(url, paramsInput, clear, true);
}

function currentURLAddingParams(paramsInput, clear = false) {
  return getURLAddingParams(window.location.href, paramsInput, clear);
}

function formatDate(string) {
  const date = new Date(string);

  return date.toLocaleDateString(Shopify.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function asyncTimeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function globalNextTick() {
  return new Promise((resolve) => {
    queueMicrotask(resolve);
  });
}

function hasWrappedChildren(el) {
  if (!el.children || el.children.length < 2) return false;

  const childEls = Array.from(el.children);

  let lastOffsetTop = childEls.shift().offsetTop;

  for (const childEl of childEls) {
    if (childEl.offsetTop !== lastOffsetTop) {
      return true;
    }

    lastOffsetTop = childEl.offsetTop;
  }

  return false;
}

function isBooleanString(string) {
  return string === 'true' || string === 'false' ? true : false;
}

function stringToBoolean(string) {
  return string === 'true' ? true : false;
}

function daysInMs(days) {
  return days * 24 * 60 * 60 * 1000;
}

function msInDays(ms) {
  return ms / 1000 / 60 / 60 / 24;
}

function isInTheFuture(msSinceEpoch) {
  return msSinceEpoch > Date.now();
}

function setExpiringStorageItem(key, value, expiresIn) {
  localStorage.setItem(
    key,
    JSON.stringify({ value, expires: Date.now() + expiresIn })
  );
}

function getExpiringStorageItem(key) {
  const value = localStorage.getItem(key);

  if (!value) {
    return null;
  }

  let valueObject;

  try {
    valueObject = JSON.parse(value);
  } catch (e) {}

  if (valueObject && valueObject.expires) {
    if (isInTheFuture(valueObject.expires)) {
      return valueObject.value;
    } else {
      localStorage.removeItem(key);
      return null;
    }
  }

  return null;
}

function getRecentlyViewedProducts() {
  let currentRecentlyViewedProducts;

  const localStorageItem = localStorage.getItem(
    'switch-recently-viewed-products'
  );

  try {
    const parsedItem = JSON.parse(localStorageItem);

    currentRecentlyViewedProducts = Array.isArray(parsedItem) ? parsedItem : [];
  } catch (e) {
    currentRecentlyViewedProducts = [];
  }

  return currentRecentlyViewedProducts;
}

function updateRecentlyViewedProducts(productId) {
  if (!productId) return;

  const currentRecentlyViewedProducts = getRecentlyViewedProducts().filter(
    (id) => id !== productId
  );

  currentRecentlyViewedProducts.unshift(productId);

  localStorage.setItem(
    'switch-recently-viewed-products',
    JSON.stringify(currentRecentlyViewedProducts)
  );
}

function getHiddenElHeight(el) {
  const cloneEl = el.cloneNode(true);

  Object.assign(cloneEl.style, {
    position: 'absolute',
    left: '-200vw',
  });

  cloneEl.setAttribute('aria-hidden', 'true');

  document.body.appendChild(cloneEl);

  const height = cloneEl.getBoundingClientRect().height;

  cloneEl.remove();

  return height;
}

function getPluralizedString(key, count) {
  return count === 1 ? key.one : key.other;
}

function letterSpacingFix(string) {
  return string.replace(/(.)$/, `<span class="tracking-normal">$1</span>`);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadLazyImages(el) {
  el?.querySelectorAll('img[src][loading="lazy"]').forEach((imgEl) => {
    imgEl.removeAttribute('loading');
  });
}

function reevaluateScriptsIn(el) {
  const scriptEls = el.querySelectorAll('script');

  for (const scriptEl of scriptEls) {
    const newScriptEl = document.createElement('script');

    for (const attributeName of scriptEl.getAttributeNames()) {
      newScriptEl.setAttribute(
        attributeName,
        scriptEl.getAttribute(attributeName)
      );
    }

    newScriptEl.textContent = scriptEl.textContent;

    scriptEl.replaceWith(newScriptEl);
  }
}

window.replaceMainContentAbortController = null;

async function replaceMainContent(url, options = undefined, cacheFor = 0) {
  if (!url) return;

  window.replaceMainContentAbortController?.abort();
  window.replaceMainContentAbortController = new AbortController();

  const html = await fetchHTML(
    url,
    { ...options, signal: window.replaceMainContentAbortController.signal },
    cacheFor,
    false
  );

  const mainEl = document.querySelector('main#MainContent');

  const newMainEl = querySelectorInHTMLString('main#MainContent', html);

  if (newMainEl) {
    window.Alpine?.destroyTree(mainEl);
    mainEl.replaceWith(newMainEl);

    reevaluateScriptsIn(newMainEl);
  }

  const historyURLAsString = url.toString();

  window.history.replaceState(
    { path: historyURLAsString },
    '',
    historyURLAsString
  );

  window.replaceMainContentAbortController = null;
}

async function replaceElement(el, url, options = undefined, cacheFor = 0) {
  if (!el || !url) return;

  if (!el.getAttribute('id')) {
    console.error('replaceElement needs an element with an id');
    return;
  }

  el.updateAbortController?.abort();
  el.updateAbortController = new AbortController();

  const html = await fetchHTML(
    url,
    { ...options, signal: el.updateAbortController.signal },
    cacheFor,
    false
  );

  const dom = parseDOMFromString(html);

  const newEl = dom.getElementById(el.getAttribute('id'));

  if (newEl) {
    window.Alpine?.destroyTree(el);
    el.replaceWith(newEl);

    reevaluateScriptsIn(newEl);
  }
}

function prefetchTagFor(url, as = 'document') {
  if (!url) return null;

  const linkEl = document.createElement('link');
  linkEl.rel = 'prefetch';
  linkEl.href = url;
  linkEl.as = as;

  return linkEl;
}
