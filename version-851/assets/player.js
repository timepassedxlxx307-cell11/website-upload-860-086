(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var initialized = false;

    function setup() {
      if (!video || initialized || !stream) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function start() {
      setup();
      player.classList.add('is-playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove('is-playing');
        }
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }
  });
})();
