(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initializeMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initializeHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initializeFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var search = panel.querySelector("[data-live-search]");
            var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-field]"));
            var count = panel.querySelector("[data-filter-count]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));

            function applyFilters() {
                var query = normalize(search ? search.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" "));

                    var matched = !query || haystack.indexOf(query) !== -1;
                    selects.forEach(function (select) {
                        var field = select.getAttribute("data-filter-field");
                        var value = normalize(select.value);
                        var cardValue = normalize(card.getAttribute("data-" + field));
                        if (value && cardValue !== value) {
                            matched = false;
                        }
                    });

                    card.classList.toggle("is-hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + " / " + cards.length;
                }
            }

            if (search) {
                search.addEventListener("input", applyFilters);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });
            applyFilters();
        });
    }

    function initializeQueryFromUrl() {
        var input = document.querySelector("[data-live-search]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function initializeImageFallbacks() {
        var images = Array.prototype.slice.call(document.querySelectorAll("img[data-cover-fallback]"));
        images.forEach(function (image) {
            image.addEventListener("error", function () {
                var fallback = document.createElement("div");
                fallback.className = "cover-fallback";
                fallback.textContent = image.getAttribute("data-cover-fallback") || "影视封面";
                image.replaceWith(fallback);
            }, { once: true });
        });
    }

    function initializePlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-button]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-video-src");
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function loadAndPlay() {
                if (!video || !source) {
                    setStatus("播放源暂不可用。");
                    return;
                }

                if (!initialized) {
                    initialized = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                setStatus("播放加载失败，请稍后重试。");
                            }
                        });
                    } else {
                        video.src = source;
                    }
                }

                if (button) {
                    button.classList.add("is-hidden");
                }
                setStatus("正在加载播放源...");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.then(function () {
                        setStatus("正在播放。");
                    }).catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", loadAndPlay);
            }
            if (video) {
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                    setStatus("正在播放。");
                });
                video.addEventListener("pause", function () {
                    setStatus("播放已暂停。");
                });
            }
        });
    }

    ready(function () {
        initializeMenu();
        initializeHero();
        initializeFilters();
        initializeQueryFromUrl();
        initializeImageFallbacks();
        initializePlayers();
    });
})();
