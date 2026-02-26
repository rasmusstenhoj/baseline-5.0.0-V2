// _src/js/islands/gift-card-recipient.js
import deferrableData from "deferrable-data";

// _src/js/components/gift-card-recipient.js
var gift_card_recipient_default = () => ({
  enabled: false,
  recipientMessage: "",
  get messageLength() {
    return this.recipientMessage.length;
  },
  errorMessage: null,
  errors: null,
  init() {
    document.body.addEventListener("baseline:productform:error", (e) => {
      if (e.detail.sourceId === this.$root.closest("form").getAttribute("id")) {
        this.errors = e.detail.errors;
        this.enabled = true;
      }
    });
  }
});

// _src/js/islands/gift-card-recipient.js
deferrableData("GiftCardRecipient", gift_card_recipient_default);
