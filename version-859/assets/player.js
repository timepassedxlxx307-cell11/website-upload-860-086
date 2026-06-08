(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var source = shell.getAttribute("data-m3u8");
      var hlsInstance = null;

      function attach() {
        if (!video || !source || shell.classList.contains("is-ready")) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        shell.classList.add("is-ready");
      }

      function play() {
        attach();
        shell.classList.add("is-playing");
        if (video) {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!shell.classList.contains("is-playing")) {
            play();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
