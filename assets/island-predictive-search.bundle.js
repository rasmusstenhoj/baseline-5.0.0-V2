// _src/js/islands/predictive-search.js
import deferrableData from "deferrable-data";

// _src/js/components/predictive-search.js
var predictive_search_default = (resources) => ({
  loading: false,
  resultsOpen: false,
  rawQuery: "",
  resultsHTML: null,
  resources,
  selectedElement: null,
  allOptionsArray: null,
  get trimmedQuery() {
    return this.rawQuery.trim();
  },
  get queryKey() {
    return this.trimmedQuery.replace(" ", "-").toLowerCase();
  },
  init() {
    this.$watch("searchOpen", (value) => {
      if (value === true) {
        this.onOpen();
        this.$focus.focus(this.$refs.input);
        this.$nextTick(() => {
          this.$root.style.setProperty(
            "--search-bar-height",
            `${this.$root.getBoundingClientRect().height}px`
          );
        });
      }
    });
    this.$watch("trimmedQuery", (value, oldValue) => {
      if (!this.trimmedQuery.length) {
        this.closeResults();
      } else {
        this.openResults();
        if (value !== oldValue) {
          this.getSearchResults();
        }
      }
    });
  },
  close(clearSearchTerm = true, focusAfter) {
    this.closeResults(clearSearchTerm);
    this.searchOpen = false;
    if (focusAfter) {
      setTimeout(() => {
        this.$focus.focus(focusAfter);
      });
    }
  },
  openResults() {
    this.resultsOpen = true;
    document.documentElement.style.overflowY = "hidden";
  },
  closeResults(clearSearchTerm = false) {
    this.resultsOpen = false;
    if (clearSearchTerm) {
      this.rawQuery = "";
    }
    this.selectedElement = null;
    document.documentElement.style.overflowY = "auto";
  },
  async getSearchResults() {
    this.loading = true;
    liveRegion(window.theme.strings.loading);
    const updatedHTML = await fetchHTML(
      getURLWithParams(window.theme.routes.predictive_search_url, {
        q: this.trimmedQuery,
        "resources[type]": this.resources,
        // eslint-disable-next-line camelcase
        section_id: "predictive-search"
      })
    );
    const resultsMarkup = querySelectorInHTMLString(
      "#shopify-section-predictive-search",
      updatedHTML
    ).innerHTML;
    const liveRegionText = querySelectorInHTMLString(
      "#predictive-search-count",
      updatedHTML
    ).innerHTML;
    this.resultsHTML = resultsMarkup;
    liveRegion(liveRegionText);
    this.$nextTick(() => {
      this.allOptionsArray = Array.from(
        this.$root.querySelectorAll('[role="option"]')
      );
    });
    this.loading = false;
    this.openResults();
  },
  onFocus() {
    if (!this.trimmedQuery.length) return;
    if (this.resultsHTML) {
      this.openResults();
    } else {
      this.getSearchResults();
    }
  },
  onFormSubmit(event) {
    if (!this.trimmedQuery.length || this.$el.querySelector('[aria-selected="true"] a'))
      event.preventDefault();
  },
  onOpen() {
    if (this.trimmedQuery.length) {
      this.openResults();
      this.$nextTick(() => {
        this.getSearchResults();
      });
    }
  },
  switchOption(direction) {
    if (direction === "previous" && !this.selectedElement) return;
    if (direction === "next") {
      this.selectedElement = nextOrFirst(
        this.allOptionsArray,
        this.selectedElement
      );
    } else if (direction === "previous") {
      this.selectedElement = previousOrLast(
        this.allOptionsArray,
        this.selectedElement
      );
    }
    this.selectedElement.scrollIntoView({
      behavior: isMotionSafe() ? "smooth" : "auto",
      block: "end"
    });
  },
  onKeyup() {
    this.$event.preventDefault();
    switch (this.$event.code) {
      case "ArrowUp":
        this.switchOption("previous");
        break;
      case "ArrowDown":
        this.switchOption("next");
        break;
      case "Enter":
        this.selectOption();
        break;
    }
  },
  onKeydown() {
    if (this.$event.code === "ArrowUp" || this.$event.code === "ArrowDown" || this.$event.code === "Enter" && this.selectedElement) {
      this.$event.preventDefault();
    }
  },
  isSelected() {
    return this.$el === this.selectedElement ? "true" : "false";
  },
  selectOption() {
    if (this.selectedElement) {
      const selectedOptionAction = this.selectedElement.querySelector("a, button");
      if (selectedOptionAction) selectedOptionAction.click();
    }
  }
});

// _src/js/islands/predictive-search.js
deferrableData("PredictiveSearch", predictive_search_default);
