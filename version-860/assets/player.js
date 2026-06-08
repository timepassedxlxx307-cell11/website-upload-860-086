(function () {
    window.initMoviePlayer = function (videoId, overlayId, statusId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var status = document.getElementById(statusId);
        var hls = null;

        if (!video || !overlay || !sourceUrl) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }

        function attachSource() {
            if (video.getAttribute('data-ready') === '1') {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('');
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放加载失败，请稍后重试');
                    }
                });
            } else {
                video.src = sourceUrl;
            }
            video.setAttribute('data-ready', '1');
        }

        function play() {
            attachSource();
            overlay.classList.add('is-hidden');
            setStatus('');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
