// _src/js/islands/vimeo-embed.js
import deferrableData from "deferrable-data";

// _src/js/components/vimeo-embed.js
var vimeo_embed_default = () => ({
  playing: false,
  boundOnMessage: null,
  init() {
    this.$nextTick(() => {
      this.boundOnMessage = this.onMessage.bind(this);
      window.addEventListener("message", this.boundOnMessage);
    });
    this.$watch("playing", (value) => {
      if (value === true) {
        this.$root.dispatchEvent(
          new CustomEvent("playing", {
            bubbles: true
          })
        );
      } else {
        this.$root.dispatchEvent(
          new CustomEvent("paused", {
            bubbles: true
          })
        );
      }
    });
  },
  play() {
    iFrameMethod(this.$refs.video, "play");
  },
  pause() {
    iFrameMethod(this.$refs.video, "pause");
  },
  onReady() {
    this.$refs.video.contentWindow.postMessage(
      JSON.stringify({
        method: "addEventListener",
        value: "playProgress"
      }),
      this.$refs.video.src
    );
    this.$refs.video.contentWindow.postMessage(
      JSON.stringify({
        method: "addEventListener",
        value: "pause"
      }),
      this.$refs.video.src
    );
  },
  onMessage(e) {
    if (e.source !== this.$refs.video.contentWindow) return;
    let data;
    try {
      data = JSON.parse(e.data);
    } catch (e2) {
      console.warn("Could not parse message from Vimeo embed", e2);
    }
    if (data.event === "ready") {
      this.onReady();
    }
    if (data.event === "playProgress") {
      this.playing = true;
    }
    if (data.event === "pause") {
      this.playing = false;
    }
  },
  deinit() {
    window.removeEventListener("message", this.boundOnMessage);
  }
});

// _src/js/islands/vimeo-embed.js
deferrableData("VimeoEmbed", vimeo_embed_default);
