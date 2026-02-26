// _src/js/islands/gift-card.js
import deferrableData from "deferrable-data";

// _src/js/components/gift-card.js
var gift_card_default = () => ({
  copied: false,
  init() {
    new QRCode(this.$refs.qrCode, {
      text: this.$refs.qrCode.dataset.identifier,
      width: 120,
      height: 120,
      imageAltText: theme.strings.qrImageAlt
    });
  },
  async copy() {
    this.copied = false;
    await navigator.clipboard.writeText(this.$refs.giftCardCode.value);
    this.copied = true;
  }
});

// _src/js/islands/gift-card.js
deferrableData("GiftCard", gift_card_default);
