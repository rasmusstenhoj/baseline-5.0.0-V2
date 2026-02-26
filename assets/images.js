class ImageWithPlaceholder extends HTMLElement {
  connectedCallback() {
    this.imageEl = this.querySelector('img');

    if (!this.imageEl) {
      return;
    }

    this.loaded = this.imageEl.complete && this.imageEl.naturalWidth > 0;

    this.imageEl.addEventListener('load', () => {
      this.loaded = this.imageEl.complete && this.imageEl.naturalWidth > 0;
    });
  }

  get loaded() {
    return this._loaded;
  }

  set loaded(value) {
    this._loaded = value;

    this.imageEl.classList.toggle('is-complete', value);
  }
}

customElements.define('image-with-placeholder', ImageWithPlaceholder);
