// _src/js/islands/quick-buy.js
import deferrableData from "deferrable-data";

// _src/js/components/quick-buy.js
var quick_buy_default = () => ({
  loading: false,
  addedToCart: false,
  errorMessage: "",
  init() {
    this.setUpProductFormEvents();
    const formEl = this.$root.querySelector("form");
    if (!formEl) return;
    if (formEl.hasAttribute("data-messages-id") && formEl.dataset.messagesId !== "") {
      const messagesModalId = formEl.dataset.messagesId;
      this.$watch("errorMessage", (value) => {
        if (Boolean(value)) {
          Alpine.store("modals").open(messagesModalId);
        }
      });
      if (!window.theme.settings.openDrawerOnAddToCart) {
        this.$watch("addedToCart", (value) => {
          if (value) {
            Alpine.store("modals").open(messagesModalId);
          }
        });
      }
    }
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
    });
    this.$root.addEventListener("baseline:productform:error", (event) => {
      event.stopPropagation();
      this.errorMessage = event.detail.message || window.theme.strings.cartError;
      this.loading = false;
    });
  }
});

// _src/js/islands/quick-buy.js
deferrableData("QuickBuy", quick_buy_default);
