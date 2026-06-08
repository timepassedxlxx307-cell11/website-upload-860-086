(function () {
  window.initMoviePlayer = function (sourceUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function startPlayback() {
      if (!video) {
        return;
      }
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    prepare();

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
