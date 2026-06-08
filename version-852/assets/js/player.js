import { H as Hls } from './hls.js';

export function initMoviePlayer(videoId, source, overlayId) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);

  if (!video || !source) {
    return;
  }

  let hls = null;

  const attachSource = () => {
    if (video.dataset.ready === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    video.dataset.ready = '1';
  };

  const startPlayback = () => {
    attachSource();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    video.controls = true;
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', () => {
    if (video.dataset.ready !== '1') {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
