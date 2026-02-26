// _src/js/islands/product.js
import deferrableData from "deferrable-data";

// _src/js/modules/splide-product-extension.js
import { SplideEventInterface as EventInterface } from "vendor";
function SplideProductExtension(Splide2, Components, options) {
  const { on, off, bind, unbind } = EventInterface(Splide2);
  const isHorizontalGallerySplide = Splide2.root.hasAttribute(
    "data-horizontal-gallery-splide"
  );
  function __resizeTrackForSlideAtIndex(index) {
    if (isHorizontalGallerySplide && window.isLgBreakpoint()) {
      Splide2.root.querySelector(".splide__track").style.maxHeight = "";
      return;
    }
    const slides = Splide2.Components.Slides;
    const targetSlideObject = slides.getAt(index);
    if (!targetSlideObject) return;
    const targetSlide = targetSlideObject.slide;
    const targetSlideMedia = targetSlide.querySelector(
      "[data-product-single-media-wrapper]"
    );
    let maxHeightSource;
    if (isHorizontalGallerySplide) {
      maxHeightSource = targetSlideMedia.closest(".splide__slide").querySelector("[data-slide-height-setter]");
    } else {
      maxHeightSource = targetSlideMedia;
    }
    const newMaxHeight = maxHeightSource.getBoundingClientRect().height;
    const gridlineWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--gridline-width"
      ),
      10
    ) || 0;
    Splide2.root.querySelector(".splide__track").style.maxHeight = `${newMaxHeight + gridlineWidth}px`;
    const thumbnailsSplideVerticalEl = Splide2.root.parentNode.querySelector(
      ".splide.splide--thumbnails.splide--thumbnails--vertical"
    );
    if (thumbnailsSplideVerticalEl && isLgBreakpoint()) {
      const navHeight = Splide2.root.querySelector("[data-slideshow-navigation]").getBoundingClientRect().height || 0;
      const productContentHeight = Splide2.root.closest("[data-product-media-container]").parentNode.querySelector("[data-product-content]").getBoundingClientRect().height || 0;
      thumbnailsSplideVerticalEl.style.setProperty(
        "--thumbnails-height",
        `${Math.max(newMaxHeight + navHeight, productContentHeight)}px`
      );
    }
  }
  function __dispatchMediaEvents(newIndex, oldIndex) {
    const slides = Splide2.Components.Slides;
    const oldSlide = slides.getAt(oldIndex).slide.querySelector("[data-product-single-media-wrapper]");
    const newSlide = slides.getAt(newIndex).slide.querySelector("[data-product-single-media-wrapper]");
    if (oldSlide) oldSlide.dispatchEvent(new CustomEvent("mediaHidden"));
    if (newSlide) newSlide.dispatchEvent(new CustomEvent("mediaVisible"));
  }
  function onMounted() {
    __resizeTrackForSlideAtIndex(Splide2.index);
  }
  function onResize() {
    __resizeTrackForSlideAtIndex(Splide2.index);
  }
  function onSlidesUpdated() {
    __resizeTrackForSlideAtIndex(Splide2.index);
  }
  function onWindowResize() {
    __resizeTrackForSlideAtIndex(Splide2.index);
  }
  const debouncedWindowResize = debounce(onWindowResize, 150);
  function onMove(newIndex, oldIndex) {
    __resizeTrackForSlideAtIndex(newIndex);
    __dispatchMediaEvents(newIndex, oldIndex);
    Splide2.root.dispatchEvent(
      new CustomEvent("move", {
        detail: {
          newIndex,
          oldIndex
        }
      })
    );
  }
  function onDestroy() {
    unbind(window, "resize");
  }
  function mount() {
    on("mounted", onMounted);
    on("resize", onResize);
    on("move", onMove);
    on("destroy", onDestroy);
    bind(window, "resize", debouncedWindowResize);
    on("slides:updated", onSlidesUpdated);
    if (Shopify.designMode) {
      document.addEventListener("shopify:section:unload", (e) => {
        if (e.target.contains(Splide2.root) && !Splide2.state.is(window.Splide.STATES.DESTROYED)) {
          unbind(window, "resize", debouncedWindowResize);
        }
      });
    }
  }
  return {
    mount
  };
}

// _src/js/modules/splide-responsive-mount-extension.js
function SplideResponsiveMountExtension(Splide2) {
  function mount() {
    Splide2.root.dispatchEvent(new CustomEvent("responsive-mount"));
  }
  return {
    mount
  };
}

// _src/js/modules/splide-pagination-placeholder-extension.js
function SplidePaginationPlaceholderExtension(Splide2) {
  function mount() {
    Splide2.root.querySelectorAll("[data-splide-pagination-placeholder]").forEach((el) => {
      el.remove();
    });
  }
  return {
    mount
  };
}

// _src/js/components/product.js
var product_default = ({
  product,
  featuredMediaId,
  splideOnDesktop = false,
  mediaScrollTo,
  singleVariantMode,
  alwaysShowProductFeaturedMediaFirst = false,
  firstMediaFullWidth = false,
  preselectVariant = true,
  skipMediaUpdates = false,
  shouldUpdateHistoryState = false,
  swapMediaOnDesktop = false,
  templateType = "default"
}) => ({
  productRoot: null,
  product,
  featuredMediaId,
  currentMediaId: featuredMediaId,
  splideOnDesktop,
  mediaScrollTo,
  singleVariantMode,
  alwaysShowProductFeaturedMediaFirst,
  firstMediaFullWidth,
  swapMediaOnDesktop,
  preselectVariant,
  skipMediaUpdates,
  shouldUpdateHistoryState,
  sectionId: null,
  currentVariant: null,
  quantity: 1,
  loading: false,
  cacheOptionsFor: 3e5,
  // 5 minutes
  sectionUpdateAbortController: null,
  preloadAbortController: null,
  hasGiftCardRecipientForm: false,
  firstMediaView: true,
  addedToCart: false,
  errorMessage: "",
  isMaxLgBreakpoint: window.isMaxLgBreakpoint(),
  maxLgBreakpointMQL: window.maxLgBreakpointMQL(),
  productMediaContainerResizeObserver: null,
  splide: null,
  mainSplideOptions: null,
  thumbnailsSplideHorizontal: null,
  thumbnailsSplideVertical: null,
  thumbnailActiveStatePaused: false,
  splideIndex: 0,
  slideCount: 0,
  allSlides: [],
  allHorizontalThumbnailsSlides: [],
  allVerticalThumbnailsSlides: [],
  splidesInFlux: false,
  splideIsReady: false,
  mediaListIsReordered: false,
  templateType,
  variantChangedFromInitialVariant: false,
  discountTagTemplate: window.theme.strings.discountTagTemplate,
  allProductURLs: [],
  allOptionsHaveSelections: false,
  sectionUpdateFetchIsPending: false,
  get resolvedParentRoot() {
    return this.productRoot ?? this.$root;
  },
  get currentVariantJSONEl() {
    return this.resolvedParentRoot.querySelector("[data-current-variant]");
  },
  get productMediaContainerEl() {
    return this.resolvedParentRoot.querySelector(
      "[data-product-media-container]"
    );
  },
  get splideEl() {
    return this.resolvedParentRoot.querySelector(
      ".splide:not(.splide--thumbnails)"
    );
  },
  get thumbnailsSplideHorizontalEl() {
    return this.resolvedParentRoot.querySelector(
      ".splide.splide--thumbnails:not(.splide--thumbnails--vertical)"
    );
  },
  get thumbnailsSplideVerticalEl() {
    return this.resolvedParentRoot.querySelector(
      ".splide.splide--thumbnails.splide--thumbnails--vertical"
    );
  },
  get optionEls() {
    return Array.from(
      this.resolvedParentRoot.querySelectorAll("[data-product-option]") ?? []
    );
  },
  get optionValueEls() {
    return Array.from(
      this.resolvedParentRoot.querySelectorAll(
        "[data-single-option-selector]"
      ) ?? []
    );
  },
  get selectedOptionValueEls() {
    return Array.from(
      this.resolvedParentRoot.querySelectorAll(
        '[data-single-option-selector]:checked, [data-single-option-selector][aria-selected="true"]'
      ) ?? []
    );
  },
  get unselectedOptionValueEls() {
    return Array.from(
      this.resolvedParentRoot.querySelectorAll(
        '[data-single-option-selector]:not(:checked, [aria-selected="true"])'
      ) ?? []
    );
  },
  get optionsFromOtherProductURLs() {
    return this.optionValueEls.filter(
      ({ dataset: { productUrl } }) => productUrl && productUrl !== this.product.url
    ) ?? [];
  },
  get isUsingSlideshowToDisplayMedia() {
    if (!this.splide) return false;
    return splideIsNotDestroyed(this.splide);
  },
  get isPrimaryProductOnPage() {
    return this.product.url === window.location.pathname;
  },
  get identifyingURLParam() {
    return this.templateType === "quick-buy" ? ["view", "quick-buy"] : ["section_id", this.sectionId];
  },
  init() {
    this.sectionId = getSectionId(this.$root);
    this.isMaxLgBreakpoint = this.maxLgBreakpointMQL.matches;
    this.maxLgBreakpointMQL.addEventListener("change", (e) => {
      this.isMaxLgBreakpoint = e.matches;
    });
    this.allOptionsHaveSelections = this.selectedOptionValueEls.length === this.optionEls.length;
    if (this.isPrimaryProductOnPage && !this.allOptionsHaveSelections && window.location.search.includes("variant=")) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("variant")) {
        const selectedValueEls = this.resolvedParentRoot.querySelectorAll(
          "[data-selected-value]"
        );
        for (const selectedValueEl of selectedValueEls) {
          if (selectedValueEl.tagName === "INPUT") {
            selectedValueEl.setAttribute("checked", "");
          } else {
            selectedValueEl.setAttribute("aria-selected", "true");
          }
        }
        const selectedSwatchValueLabelEl = this.resolvedParentRoot.querySelector("[data-selected-swatch-value]");
        if (selectedSwatchValueLabelEl) {
          selectedSwatchValueLabelEl.classList.remove("hidden");
        }
        this.allOptionsHaveSelections = this.selectedOptionValueEls.length === this.optionEls.length;
      }
    }
    if (this.singleVariantMode) {
      if (this.alwaysShowProductFeaturedMediaFirst && this.preselectVariant === false && this.allOptionsHaveSelections) {
        this.alwaysShowProductFeaturedMediaFirst = false;
      }
      if (this.templateType !== "horizontal-gallery") {
        this.$watch("isMaxLgBreakpoint", (value) => {
          this.splidesInFlux = true;
          if (["default", "three-column"].includes(this.templateType) && value === true || this.templateType === "thumbnails") {
            setTimeout(() => {
              this.updateSlidesForMediaGroupWithId(this.currentMediaId);
              if (splideIsIdle(this.splide)) {
                this.splide.on("destroy.postBreakpointChange", () => {
                  setTimeout(() => {
                    this.initSplide();
                    this.splidesInFlux = false;
                  });
                  this.splide.off("destroy.postBreakpointChange");
                });
                this.splide.destroy();
              } else {
                setTimeout(() => {
                  this.splidesInFlux = false;
                });
              }
            });
          } else if (["default", "three-column"].includes(this.templateType) && value === false) {
            setTimeout(() => {
              this.resetSlides();
              setTimeout(() => {
                this.splidesInFlux = false;
              });
            });
          }
        });
      } else {
        this.$watch("isMaxLgBreakpoint", (value) => {
          this.triggerWindowResizeForSplide();
        });
      }
    }
    if (Shopify.designMode) {
      this.triggerWindowResizeForSplide();
    }
    if (this.productMediaContainerEl) {
      this.productMediaContainerResizeObserver = new ResizeObserver(
        debounce(() => {
          this.triggerWindowResizeForSplide();
        }, 150)
      );
      this.productMediaContainerResizeObserver.observe(
        this.productMediaContainerEl
      );
    }
    this.productRoot = this.$root;
    if (this.$root.querySelector('[x-data="GiftCardRecipient"]')) {
      this.hasGiftCardRecipientForm = true;
    }
    this.$watch("currentVariant", (value, oldValue) => {
      if (!value) return;
      if (!(this.alwaysShowProductFeaturedMediaFirst && this.firstMediaView) && this.allOptionsHaveSelections) {
        if (value.featured_media) {
          this.currentMediaId = value.featured_media.id;
        } else {
          this.currentMediaId = this.featuredMediaId;
        }
      }
      if (this.firstMediaView) {
        this.firstMediaView = false;
      }
      document.dispatchEvent(
        new CustomEvent("theme:variant:change", {
          detail: {
            productRootEl: this.productRoot,
            formEl: this.productRoot.querySelector("form.shopify-product-form"),
            variant: value,
            previousVariant: oldValue,
            product: this.product
          }
        })
      );
      if (oldValue) {
        this.variantChangedFromInitialVariant = true;
      }
    });
    this.productRoot.addEventListener("theme:change:variant", (event) => {
      if (!event.detail || !event.detail.variantId) {
        console.error("theme:change:variant requires a variant ID");
        return;
      }
      this.handleVariantChange(event.detail.variantId);
    });
    this.productRoot.addEventListener("theme:change:option-values", (event) => {
      if (!event.detail || !event.detail.optionValueIDs) {
        console.error("theme:change:option-values requires option value IDs");
        return;
      }
      this.handleOptionValuesChangeEvent(event.detail.optionValueIDs);
    });
    this.$watch("currentMediaId", async (value, oldValue) => {
      if (this.skipMediaUpdates) {
        return;
      }
      if (this.singleVariantMode && (["default", "three-column"].includes(this.templateType) && this.isMaxLgBreakpoint || this.templateType === "thumbnails")) {
        this.thumbnailActiveStatePaused = true;
        this.updateSlidesForMediaGroupWithId(value);
        setTimeout(() => {
          this.thumbnailActiveStatePaused = false;
        }, 100);
      } else {
        this.$root.querySelectorAll(
          `[data-product-single-media-wrapper][data-media-id="${oldValue}"]`
        ).forEach((mediaWrapperEl) => {
          if (Boolean(mediaWrapperEl.offsetHeight)) {
            if (!this.isUsingSlideshowToDisplayMedia) {
              mediaWrapperEl.dispatchEvent(new CustomEvent("mediaHidden"));
            }
          }
        });
        this.$root.querySelectorAll(
          `[data-product-single-media-wrapper][data-media-id="${value}"]`
        ).forEach((mediaWrapperEl) => {
          if (Boolean(mediaWrapperEl.offsetHeight)) {
            if (this.mediaScrollTo) {
              if (this.isUsingSlideshowToDisplayMedia) {
                this.goToSlide(mediaWrapperEl);
              } else {
                mediaWrapperEl.dispatchEvent(new CustomEvent("mediaVisible"));
              }
            } else {
              this.updateMedia(mediaWrapperEl.closest("li"));
            }
          }
        });
      }
    });
    this.currentVariant = this.parseCurrentVariantJSON();
    this.setUpProductFormEvents();
    this.allSlides = this.splideEl?.querySelectorAll(
      ".splide__slide:not(.product-thumbnail)"
    );
    if (this.thumbnailsSplideHorizontalEl) {
      this.allHorizontalThumbnailsSlides = this.thumbnailsSplideHorizontalEl.querySelectorAll(".splide__slide");
    }
    if (this.thumbnailsSplideVerticalEl) {
      this.allVerticalThumbnailsSlides = this.thumbnailsSplideVerticalEl.querySelectorAll(".splide__slide");
    }
    this.__setUpSlideshow();
    if (this.singleVariantMode) {
      if (["default", "three-column"].includes(this.templateType) && this.isMaxLgBreakpoint || this.templateType === "thumbnails") {
        this.updateSlidesForMediaGroupWithId(this.currentMediaId);
      }
    }
    this.$watch("slideCount", (value) => {
      const dragDisableDefault = !(this.mainSplideOptions.drag === true);
      this.splide.Components.Drag.disable(
        value <= 1 ? true : dragDisableDefault
      );
    });
    this.allProductURLs = [
      this.product.url,
      ...this.optionValueEls.map(({ dataset: { productUrl } }) => productUrl).filter(Boolean)
    ];
    requestIdleCallback(() => {
      this.preloadReachableCombinations();
      updateRecentlyViewedProducts(this.product.id);
      if (this.shouldUpdateHistoryState && window.location.search.includes("option_values=")) {
        this.updateHistoryState(new URL(window.location.href));
      }
    });
  },
  parseCurrentVariantJSON() {
    let currentVariantJSON = {};
    try {
      currentVariantJSON = JSON.parse(this.currentVariantJSONEl?.innerHTML);
    } catch {
    }
    return currentVariantJSON;
  },
  selectionStateForOptionValueEl(optionValueEl) {
    const optionProductURL = optionValueEl.getAttribute("data-product-url");
    const selections = [
      optionValueEl,
      ...this.selectedOptionValueEls.filter(
        (el) => el.getAttribute("data-position") !== optionValueEl.getAttribute("data-position")
      )
    ].sort(
      (a, b) => parseInt(a.getAttribute("data-position"), 10) - parseInt(b.getAttribute("data-position"), 10)
    ).map((el) => el.getAttribute("data-id"));
    return {
      selections,
      productURL: optionProductURL ? optionProductURL : this.product.url
    };
  },
  async preloadReachableCombinations() {
    if (!this.allOptionsHaveSelections) {
      return;
    }
    if (window.shouldTryToSaveData()) {
      console.log(
        "Preference to save data detected, will not preload reachable product option combinations"
      );
      return;
    }
    if (!this.$root || !this.optionValueEls || this.optionValueEls.length === 0) {
      return;
    }
    this.preloadAbortController?.abort();
    const combinationsToPreload = [];
    for (const unselectedOptionValueEl of this.unselectedOptionValueEls) {
      combinationsToPreload.push(
        this.selectionStateForOptionValueEl(unselectedOptionValueEl)
      );
    }
    const urlsToPreload = /* @__PURE__ */ new Set();
    for (const combination of combinationsToPreload) {
      const selections = combination.selections;
      const productURL = combination.productURL;
      const url = getURLWithParams(
        productURL,
        [
          ["option_values", selections.join(",")],
          this.templateType === "quick-buy" ? ["view", "quick-buy"] : productURL !== this.product.url && this.isPrimaryProductOnPage ? null : ["section_id", this.sectionId]
        ].filter(Boolean)
      );
      url.searchParams.delete("variant");
      urlsToPreload.add(url.toString());
    }
    this.preloadAbortController = new AbortController();
    for (const urlToPreload of urlsToPreload) {
      void fetchHTML(
        urlToPreload,
        { signal: this.preloadAbortController.signal },
        this.cacheOptionsFor,
        false
      ).catch((e) => {
        if (e.name === "AbortError") {
          return;
        } else {
          throw e;
        }
      });
    }
  },
  async handleOptionValuesChangeEvent(optionValueIDs) {
    if (!optionValueIDs || optionValueIDs.length && optionValueIDs.length === 0) {
      console.error(
        `handleOptionValuesChangeEvent requires an array of optionValueIDs, none provided`
      );
      return;
    }
    this.preloadAbortController?.abort();
    this.sectionUpdateAbortController?.abort();
    this.sectionUpdateAbortController = new AbortController();
    const params = [
      ["option_values", optionValueIDs.join(",")],
      this.identifyingURLParam
    ];
    const url = this.isPrimaryProductOnPage ? currentURLWithParams(params) : getURLWithParams(this.product.url, params);
    await this.updateSectionHTML(url);
    if (this.shouldUpdateHistoryState) {
      this.updateHistoryState(url);
    }
    this.sectionUpdateAbortController = null;
    this.checkForProductURLMismatch();
  },
  async handleVariantChange(id) {
    if (!id) {
      console.error(`handleVariantChange requires a variant ID, none provided`);
      return;
    }
    this.preloadAbortController?.abort();
    this.sectionUpdateAbortController?.abort();
    this.sectionUpdateAbortController = new AbortController();
    const params = [["variant", id], this.identifyingURLParam];
    const url = this.isPrimaryProductOnPage ? currentURLWithParams(params) : getURLWithParams(this.product.url, params);
    await this.updateSectionHTML(url);
    if (this.shouldUpdateHistoryState) {
      this.updateHistoryState(url);
    }
    this.sectionUpdateAbortController = null;
    this.checkForProductURLMismatch();
  },
  async optionChange(el) {
    this.preloadAbortController?.abort();
    this.sectionUpdateAbortController?.abort();
    this.sectionUpdateAbortController = new AbortController();
    const addToCartButtonEl = this.resolvedParentRoot.querySelector(
      "form[data-product-form] [type=submit]"
    );
    setTimeout(() => {
      if (this.sectionUpdateFetchIsPending) {
        if (addToCartButtonEl) {
          addToCartButtonEl.classList.add("disabled--transient");
          addToCartButtonEl.disabled = true;
        }
      }
    }, 50);
    const selectionState = this.selectionStateForOptionValueEl(el);
    if (selectionState.productURL !== this.product.url) {
      if (this.isPrimaryProductOnPage) {
        const updatedProductURLWithOptions = getURLWithParams(
          selectionState.productURL,
          [["option_values", selectionState.selections.join(",")]]
        );
        replaceMainContent(
          updatedProductURLWithOptions,
          void 0,
          this.cacheOptionsFor
        );
      } else {
        const updatedProductURLWithOptions = getURLWithParams(
          selectionState.productURL,
          [
            ["option_values", selectionState.selections.join(",")],
            this.identifyingURLParam
          ]
        );
        replaceElement(
          this.templateType === "quick-buy" ? this.resolvedParentRoot : this.resolvedParentRoot.closest(".shopify-section"),
          updatedProductURLWithOptions,
          void 0,
          this.cacheOptionsFor
        );
      }
      return;
    }
    const params = [
      ["option_values", selectionState.selections.join(",")],
      this.identifyingURLParam
    ];
    const url = this.isPrimaryProductOnPage ? currentURLWithParams(params) : getURLWithParams(this.product.url, params);
    url.searchParams.delete("variant");
    await this.updateSectionHTML(url);
    this.currentVariant = this.parseCurrentVariantJSON();
    if (this.shouldUpdateHistoryState) {
      this.updateHistoryState(url);
    }
    this.sectionUpdateAbortController = null;
  },
  async updateSectionHTML(url) {
    this.sectionUpdateFetchIsPending = true;
    try {
      const updatedSectionHTML = await fetchHTML(
        url,
        { signal: this.sectionUpdateAbortController.signal, priority: "high" },
        this.cacheOptionsFor,
        false
      );
      const updatedSectionDOM = parseDOMFromString(updatedSectionHTML);
      const currentVariantFragmentEls = Array.from(
        this.productRoot.querySelectorAll("[data-variant-fragment]")
      );
      const selectedOptionValueEls = this.selectedOptionValueEls;
      for (const currentVariantFragmentEl of currentVariantFragmentEls) {
        const updatedVariantFragmentEl = updatedSectionDOM.querySelector(
          `[data-variant-fragment="${currentVariantFragmentEl.dataset.variantFragment}"]`
        );
        const morphingVariantPickerInNonPreselectMode = this.preselectVariant === false && currentVariantFragmentEl.hasAttribute("data-variant-picker");
        Alpine.morph(
          currentVariantFragmentEl,
          updatedVariantFragmentEl?.outerHTML || "",
          {
            updating(el, toEl, _childrenOnly, skip) {
              if (el.nodeType === 1 && el.hasAttribute("data-skip-on-section-update")) {
                skip();
              }
              if (el.nodeType === 1 && el.hasAttribute("ready")) {
                toEl.setAttribute("ready", "");
              }
              if (el.nodeType === 1 && el.tagName === "IMG") {
                if (el.getAttribute("src") === toEl.getAttribute("src")) {
                  skip();
                }
              }
              if (morphingVariantPickerInNonPreselectMode && el.nodeType === 1) {
                if (el.tagName === "INPUT" && el.hasAttribute("checked")) {
                  toEl.setAttribute("checked", "");
                }
                if (el.getAttribute("aria-selected") === "true") {
                  toEl.setAttribute("aria-selected", "true");
                }
                if (el.hasAttribute("data-selected-swatch-value")) {
                  try {
                    const swatchPosition = el.closest("[data-product-option]").querySelector("[data-position]").getAttribute("data-position");
                    if (selectedOptionValueEls.some(
                      (selectedEl) => selectedEl?.getAttribute("data-position") === swatchPosition
                    )) {
                      toEl.classList.remove("hidden");
                    }
                  } catch (_e) {
                  }
                }
              }
            }
          }
        );
        this.allOptionsHaveSelections = selectedOptionValueEls.length === this.optionEls.length;
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        throw err;
      }
    }
    this.sectionUpdateFetchIsPending = false;
    await this.$nextTick();
    requestIdleCallback(() => {
      this.preloadReachableCombinations();
    });
  },
  checkForProductURLMismatch() {
    const selectedOptionValueEls = this.selectedOptionValueEls;
    const selectionsWithURLMismatch = selectedOptionValueEls.map(
      ({ dataset: { productUrl } }) => productUrl && productUrl !== window.location.pathname ? productUrl : null
    ).filter(Boolean);
    if (selectionsWithURLMismatch.length > 0) {
      const newURL = getURLWithParams(selectionsWithURLMismatch[0], [
        this.currentVariant && this.currentVariant.id ? ["variant", this.currentVariant.id] : [
          "option_values",
          selectedOptionValueEls.map((el) => el.dataset.id).join(", ")
        ]
      ]);
      replaceMainContent(newURL, void 0, this.cacheOptionsFor);
    }
  },
  refreshPreloadCache() {
    for (const url of this.allProductURLs) {
      invalidateCacheForKeysContaining(url);
    }
    requestIdleCallback(() => {
      this.preloadReachableCombinations();
    });
  },
  updateHistoryState(url) {
    if (this.allOptionsHaveSelections == false) {
      return;
    }
    const historyURL = url;
    historyURL.searchParams.delete("section_id");
    historyURL.searchParams.delete("view");
    historyURL.searchParams.delete("variant");
    if (this.currentVariant && this.currentVariant.id) {
      historyURL.searchParams.delete("option_values");
      historyURL.searchParams.set("variant", this.currentVariant.id);
    }
    const historyURLAsString = historyURL.toString();
    window.history.replaceState(
      { path: historyURLAsString },
      "",
      historyURLAsString
    );
  },
  setUpProductFormEvents() {
    this.$root.addEventListener("baseline:productform:loading", (event) => {
      event.stopPropagation();
      this.loading = true;
      this.errorMessage = null;
      this.addedToCart = false;
    });
    this.$root.addEventListener("baseline:productform:success", (event) => {
      event.stopPropagation();
      this.loading = false;
      this.errorMessage = null;
      this.addedToCart = true;
      this.refreshPreloadCache();
    });
    if (!this.hasGiftCardRecipientForm) {
      this.$root.addEventListener("baseline:productform:error", (event) => {
        event.stopPropagation();
        const quantityEl = this.$root.querySelector('[name="quantity"]');
        this.errorMessage = event.detail.message || window.theme.strings.cartError;
        this.quantity = quantityEl ? Number(quantityEl.getAttribute("min")) : 1;
        this.loading = false;
      });
    }
  },
  openZoom(mediaId) {
    const zoomModalId = `image-zoom-${this.productRoot.id}`;
    if (!this.$store.modals.modals[zoomModalId]) {
      this.$store.modals.register(zoomModalId, "modal");
    }
    this.$watch("$store.modals.modal.contents", (value) => {
      if (value === zoomModalId) {
        this.$nextTick(() => {
          const zoomModalEl = document.getElementById(zoomModalId);
          waitForContent(zoomModalEl).then(() => {
            const mediaEl = zoomModalEl.querySelector(
              `[data-media-id="${mediaId}"]`
            );
            if (mediaEl) {
              mediaEl.scrollIntoView();
            }
          });
        });
      }
    });
    this.$store.modals.open(zoomModalId);
  },
  __setUpSlideshow() {
    if (!this.splideEl || !this.splideEl.dataset.slideshowEnabled === true) {
      return;
    }
    if (typeof Splide === "undefined") {
      console.error(
        "product.js requires a Splide object to be defined in the global scope"
      );
      return;
    }
    this.initSplide();
    document.addEventListener("dev:hotreloadmutation", async () => {
      if (!Shopify.designMode) {
        if (!this.singleVariantMode) {
          this.reinitMainSplide();
        } else {
          if (["default", "three-column"].includes(this.templateType) && this.isMaxLgBreakpoint || this.templateType === "thumbnails") {
            this.updateSlidesForMediaGroupWithId(this.currentMediaId);
          } else {
            this.reinitMainSplide();
          }
        }
      }
    });
  },
  initSplide() {
    if (this.templateType !== "horizontal-gallery") {
      this.mainSplideOptions = {
        arrows: Boolean(this.splideEl.querySelector(".splide__arrows")),
        pagination: Boolean(this.splideEl.querySelector(".splide__pagination")),
        rewind: true,
        speed: 600,
        drag: !(this.splideEl.dataset.dragDisabled === "true"),
        mediaQuery: "min",
        breakpoints: {}
      };
      if (!this.splideOnDesktop) {
        const breakpoint = this.templateType === "three-column" ? "1400" : "1024";
        this.mainSplideOptions.breakpoints[breakpoint] = {
          destroy: true
        };
      }
    } else {
      this.mainSplideOptions = {
        type: "slide",
        rewind: true,
        perPage: 1,
        autoWidth: false,
        mediaQuery: "min",
        breakpoints: {
          1024: {
            fixedWidth: "auto",
            // fixedWidth: 514,
            rewind: true,
            type: "slide",
            pagination: true,
            arrows: true,
            drag: !(this.splideEl.dataset.dragDisabled === "true"),
            classes: {
              // Add classes for pagination.
              // pagination:
              //   'splide__pagination splide__pagination--product flex justify-start items-center mt-4 ml-1 w-auto lg:ml-4', // container
            }
          }
        }
      };
    }
    this.splide = new Splide(this.splideEl, this.mainSplideOptions);
    if (this.thumbnailsSplideHorizontalEl) {
      const mobileOnly = this.thumbnailsSplideHorizontalEl.hasAttribute("data-mobile-only");
      const desktopOnly = this.thumbnailsSplideHorizontalEl.hasAttribute("data-desktop-only");
      const thumbnailsSplideHorizontalOptions = {
        arrows: false,
        pagination: false,
        rewind: true,
        isNavigation: true,
        // perPage: 5,
        autoWidth: true,
        gap: "var(--gridline-width)"
      };
      if (mobileOnly) {
        thumbnailsSplideHorizontalOptions.mediaQuery = "min";
        thumbnailsSplideHorizontalOptions.breakpoints = {
          1024: {
            destroy: true
          }
        };
        this.$watch("isMaxLgBreakpoint", (value) => {
          if (value === true) {
            this.resetSyncedSplide(this.thumbnailsSplideHorizontal);
          }
        });
      } else if (desktopOnly) {
        thumbnailsSplideHorizontalOptions.breakpoints = {
          1023: {
            destroy: true
          }
        };
        this.$watch("isMaxLgBreakpoint", (value) => {
          if (value === false) {
            this.resetSyncedSplide(this.thumbnailsSplideHorizontal);
          }
        });
      }
      this.thumbnailsSplideHorizontal = new Splide(
        this.thumbnailsSplideHorizontalEl,
        thumbnailsSplideHorizontalOptions
      );
      this.splide.sync(this.thumbnailsSplideHorizontal);
    }
    if (this.thumbnailsSplideVerticalEl) {
      this.thumbnailsSplideVertical = new Splide(
        this.thumbnailsSplideVerticalEl,
        {
          arrows: false,
          pagination: false,
          rewind: true,
          isNavigation: true,
          direction: "ttb",
          height: "var(--thumbnails-height)",
          autoHeight: true,
          breakpoints: {
            1023: { destroy: true }
          }
        }
      );
      this.$watch("isMaxLgBreakpoint", async (value) => {
        if (value === false) {
          this.resetSyncedSplide(this.thumbnailsSplideVertical);
        }
      });
      this.splide.sync(this.thumbnailsSplideVertical);
    }
    this.splideEl.addEventListener("responsive-mount", () => {
      this.splide.on("ready", () => {
        this.slideCount = this.splide.Components.Slides.get().length;
        this.splideIsReady = true;
      });
      this.splide.on("refresh", () => {
        this.slideCount = this.splide.Components.Slides.get().length;
      });
      this.splide.on("destroy", () => {
        this.splideIsReady = false;
      });
    });
    this.splide.mount({
      SplideResponsiveMountExtension,
      SplideProductExtension,
      SplidePaginationPlaceholderExtension
    });
    if (this.thumbnailsSplideHorizontal) {
      this.thumbnailsSplideHorizontal.mount();
    }
    if (this.thumbnailsSplideVertical) {
      this.thumbnailsSplideVertical.mount();
    }
    this.splideEl.addEventListener("move", (e) => {
      this.splideIndex = e.detail.newIndex;
    });
  },
  goToSlide(el) {
    const index = parseInt(el.closest(".splide__slide").dataset.index, 10);
    this.splide.go(index);
  },
  updateMedia(el) {
    if (this.isUsingSlideshowToDisplayMedia) {
      if (!(isLgBreakpoint() && this.swapMediaOnDesktop)) {
        this.goToSlide(el);
      } else {
        this.swapMedia(el);
      }
    } else {
      if (!this.singleVariantMode) {
        this.swapMedia(el);
      }
    }
  },
  swapMedia(el) {
    const incomingEl = el;
    if (this.mediaListIsReordered) {
      this.resetMediaListOrder();
    }
    let restOfIncomingMediaGroup;
    const outgoingEl = this.$refs.mediaList.firstElementChild;
    if (incomingEl.hasAttribute("data-media-group-id")) {
      restOfIncomingMediaGroup = Array.from(
        this.$refs.mediaList.querySelectorAll(
          `[data-media-group-id="${incomingEl.getAttribute(
            "data-media-group-id"
          )}"]`
        )
      ).filter((elInGroup) => elInGroup != incomingEl).reverse();
    }
    this.$refs.mediaList.insertBefore(outgoingEl, incomingEl);
    let restOfOutgoingMediaGroup;
    if (outgoingEl.hasAttribute("data-media-group-id")) {
      restOfOutgoingMediaGroup = Array.from(
        this.$refs.mediaList.querySelectorAll(
          `[data-media-group-id="${outgoingEl.getAttribute(
            "data-media-group-id"
          )}"]`
        )
      ).filter((elInGroup) => elInGroup != outgoingEl).reverse();
    }
    if (restOfOutgoingMediaGroup && restOfOutgoingMediaGroup.length) {
      let lastInsertedEl = outgoingEl;
      restOfOutgoingMediaGroup.forEach((elInGroup) => {
        this.$refs.mediaList.insertBefore(
          elInGroup,
          lastInsertedEl.nextElementSibling
        );
      });
    }
    this.$refs.mediaList.insertBefore(
      incomingEl,
      this.$refs.mediaList.firstElementChild
    );
    if (restOfIncomingMediaGroup && restOfIncomingMediaGroup.length) {
      let lastInsertedEl = incomingEl;
      restOfIncomingMediaGroup.forEach((elInGroup) => {
        this.$refs.mediaList.insertBefore(
          elInGroup,
          lastInsertedEl.nextElementSibling
        );
      });
    }
    if (this.isUsingSlideshowToDisplayMedia) {
      this.splide.go(0);
    }
    this.mediaListIsReordered = true;
  },
  resetMediaListOrder() {
    const mediaListItemsArray = Array.from(this.$refs.mediaList.children);
    mediaListItemsArray.sort(function(a, b) {
      a = parseInt(a.getAttribute("data-order"), 10);
      b = parseInt(b.getAttribute("data-order"), 10);
      return a > b ? 1 : -1;
    });
    mediaListItemsArray.forEach((mediaListItemEl) => {
      this.$refs.mediaList.appendChild(mediaListItemEl);
    });
  },
  shouldBeFullWidth() {
    if (this.isMaxLgBreakpoint || !this.$el.parentNode) return false;
    const mediaGroupEls = Array.from(
      this.$el.parentNode.querySelectorAll(
        `[data-media-group-id="${this.currentMediaId}"`
      )
    );
    const leftOver = mediaGroupEls.length % 2;
    const index = mediaGroupEls.indexOf(this.$el);
    if (index === 0) {
      if (leftOver > 0 || this.firstMediaFullWidth) {
        return true;
      }
    }
    if (index === mediaGroupEls.length - 1) {
      if (this.firstMediaFullWidth && leftOver === 0) {
        return true;
      } else if (this.firstMediaFullWidth && mediaGroupEls.length == 2) {
        return true;
      }
    }
    return false;
  },
  async triggerWindowResizeForSplide() {
    await this.$nextTick();
    window.dispatchEvent(new Event("resize"));
  },
  async resetSyncedSplide(syncedSplide) {
    if (!splideIsIdle(syncedSplide)) return;
    syncedSplide.destroy();
    await this.$nextTick();
    this.splide.sync(syncedSplide);
    syncedSplide.mount();
  },
  async reinitMainSplide() {
    this.splide.destroy();
    await this.$nextTick();
    this.initSplide();
  },
  updateSlidesForMediaGroupWithId(id) {
    if (this.slideCount < this.allSlides.length) {
      this.splide.Components.Slides.remove(
        ".splide__slide:not(.product-thumbnail)"
      );
      for (const slide of this.allSlides) {
        this.splide.Components.Slides.add(slide);
      }
      if (this.thumbnailsSplideHorizontal) {
        this.thumbnailsSplideHorizontal.Components.Slides.remove(
          ".splide__slide"
        );
        for (const slide of this.allHorizontalThumbnailsSlides) {
          this.thumbnailsSplideHorizontal.Components.Slides.add(slide);
        }
      }
      if (this.thumbnailsSplideVertical) {
        this.thumbnailsSplideVertical.Components.Slides.remove(
          ".splide__slide"
        );
        for (const slide of this.allVerticalThumbnailsSlides) {
          this.thumbnailsSplideVertical.Components.Slides.add(slide);
        }
        const lastGridlineEl = this.thumbnailsSplideVerticalEl.querySelector(
          'li[role="presentation"]'
        );
        this.thumbnailsSplideVerticalEl.querySelector(".splide__list").append(lastGridlineEl);
      }
    }
    this.splide.Components.Slides.remove(
      `.splide__slide:not([data-media-group-id="${id}"]):not(.product-thumbnail)`
    );
    this.splide.emit("slides:updated");
    if (this.thumbnailsSplideHorizontal) {
      this.thumbnailsSplideHorizontal.Components.Slides.remove(
        `.splide__slide:not([data-media-group-id="${id}"])`
      );
    }
    if (this.thumbnailsSplideVertical) {
      this.thumbnailsSplideVertical.Components.Slides.remove(
        `.splide__slide:not([data-media-group-id="${id}"])`
      );
    }
  },
  resetSlides() {
    if (this.slideCount < this.allSlides.length) {
      this.splide.Components.Slides.remove(
        ".splide__slide:not(.product-thumbnail)"
      );
      for (const slide of this.allSlides) {
        this.splide.Components.Slides.add(slide);
      }
    }
  },
  destroy() {
    this.productMediaContainerResizeObserver?.disconnect();
    this.productMediaContainerResizeObserver = null;
  }
});

// _src/js/components/product-form.js
var product_form_default = () => ({
  formEl: null,
  init() {
    this.formEl = this.$root.querySelector("form");
    this.formEl.addEventListener("submit", this.submit.bind(this));
  },
  async submit(event) {
    event.preventDefault();
    this.$root.dispatchEvent(
      new CustomEvent("baseline:productform:loading", {
        bubbles: true
      })
    );
    liveRegion(window.theme.strings.loading);
    const formData = new FormData(event.target);
    const formId = event.target.getAttribute("id");
    const options = fetchConfigDefaults("application/javascript");
    formData.append("sections", "cart-items,cart-footer,cart-item-count");
    formData.append("sections_url", window.location.pathname);
    options.body = formData;
    options.headers["X-Requested-With"] = "XMLHttpRequest";
    delete options.headers["Content-Type"];
    let response, data;
    let fetchError = null;
    try {
      response = await fetch(`${theme.routes.cart_add_url}`, options);
      data = await response.json();
    } catch (e) {
      fetchError = e;
    }
    if (data?.status || fetchError) {
      let errors = data?.errors || data?.description || fetchError;
      let message = data?.description || data?.message || null;
      const errorDetail = {
        sourceId: formId,
        variantId: Number(formData.get("id")),
        errors,
        message
      };
      this.$root.dispatchEvent(
        new CustomEvent("baseline:productform:error", {
          detail: errorDetail,
          bubbles: true
        })
      );
      const formEl = this.formEl;
      const productRootEl = formEl.closest("[data-product-root]") || null;
      document.dispatchEvent(
        new CustomEvent("theme:product:error:add-to-cart", {
          detail: {
            productRootEl,
            formEl,
            ...errorDetail
          }
        })
      );
      if (errors) {
        console.error(`Encountered the following errors in form #${formId}:`);
        if (!Array.isArray(errors)) {
          errors = [errors];
        }
        for (const error of errors) {
          console.error(error.message || error);
        }
        console.error(`End errors for form #${formId}.`);
      }
    } else {
      this.$root.dispatchEvent(
        new CustomEvent("baseline:productform:success", {
          bubbles: true
        })
      );
      document.body.dispatchEvent(
        new CustomEvent("baseline:cart:afteradditem", {
          bubbles: true,
          detail: {
            response: data,
            sourceId: formId
          }
        })
      );
    }
  }
});

// _src/js/islands/product.js
deferrableData("Product", product_default);
deferrableData("ProductForm", product_form_default);
