// _src/js/islands/zoom.js
import deferrableData from "deferrable-data";

// _src/js/components/zoom.js
var zoom_default = () => ({
  imageProxies: [],
  _isLandscapeMQL: window.matchMedia("(orientation: landscape)"),
  viewportIsLandscape: false,
  willOverflow: false,
  debouncedCheckOverflow: null,
  init() {
    this.viewportIsLandscape = this._isLandscapeMQL.matches;
    this.$watch("imageProxies", () => {
      this.$nextTick(() => {
        this.checkOverflow();
      });
    });
    this._isLandscapeMQL.addEventListener("change", (e) => {
      this.viewportIsLandscape = e.matches;
    });
    this.debouncedCheckOverflow = debounce(this.checkOverflow.bind(this), 300);
    window.addEventListener("resize", this.debouncedCheckOverflow);
  },
  scrollZoomAreaTo(index) {
    document.dispatchEvent(new CustomEvent("unzoom"));
    this.$root.querySelector(`[data-index="${index}"]`).scrollIntoView({
      behavior: "smooth"
    });
  },
  async checkOverflow() {
    const proxyContainerEl = this.$refs.proxyContainer;
    if (this.willOverflow) {
      proxyContainerEl.style.visibility = "hidden";
    }
    this.willOverflow = false;
    await this.$nextTick();
    this.willOverflow = proxyContainerEl ? proxyContainerEl.scrollHeight > window.innerHeight : true;
    proxyContainerEl.style.visibility = "";
  },
  destroy() {
    window.removeEventListener("resize", this.debouncedCheckOverflow);
  }
});

// _src/js/components/zoomable.js
var zoomable_default = () => ({
  zoomed: false,
  loaded: false,
  imageEl: null,
  init() {
    this.imageEl = this.$refs.image;
    this.imageProxies.push({
      ratio: this.$refs.image.clientWidth / this.$refs.image.clientHeight,
      current: false
    });
    if (this.imageEl.complete) {
      this.loaded = true;
    } else {
      this.imageEl.addEventListener("load", (e) => {
        if (this.imageEl.complete) {
          this.loaded = true;
        }
      });
    }
  },
  handleZoom() {
    this.$nextTick(() => {
      const frameWidth = this.$el.clientWidth, frameHeight = this.$el.clientHeight;
      const zoomTarget = {
        x: this.$event.detail.ratioX * this.$refs.image.clientWidth,
        y: this.$event.detail.ratioY * this.$refs.image.clientHeight
      };
      const frameCenter = {
        x: frameWidth / 2,
        y: frameHeight / 2
      };
      const pointerDelta = {
        x: frameWidth * this.$event.detail.deltaX,
        y: frameHeight * this.$event.detail.deltaY
      };
      this.$el.scroll(
        zoomTarget.x - frameCenter.x + pointerDelta.x,
        zoomTarget.y - frameCenter.y + pointerDelta.y
      );
    });
  },
  unZoom() {
    if (this.zoomed) {
      this.zoomed = false;
    }
  },
  handleImageClick() {
    if (this.zoomed) {
      this.zoomed = false;
      return;
    }
    const unzoomedImageWidth = this.$el.clientWidth, unzoomedImageHeight = this.$el.clientHeight;
    const unzoomedImageCenter = {
      x: unzoomedImageWidth / 2,
      y: unzoomedImageHeight / 2
    };
    this.$dispatch("zoom", {
      ratioX: this.$event.offsetX / unzoomedImageWidth,
      ratioY: this.$event.offsetY / unzoomedImageHeight,
      deltaX: (unzoomedImageCenter.x - this.$event.offsetX) / unzoomedImageWidth,
      deltaY: (unzoomedImageCenter.y - this.$event.offsetY) / unzoomedImageHeight
    });
    this.zoomed = true;
  }
});

// _src/js/islands/zoom.js
deferrableData("Zoom", zoom_default);
deferrableData("Zoomable", zoomable_default);
