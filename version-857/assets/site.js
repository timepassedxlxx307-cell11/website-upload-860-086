(function () {
    var hlsLibraryPromise = null;
    var hlsLibraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLibraryPromise) {
            return hlsLibraryPromise;
        }
        hlsLibraryPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = hlsLibraryUrl;
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLibraryPromise;
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10));
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var genreSelect = scope.querySelector("[data-filter-genre]");
            var list = document.querySelector("[data-filter-list]");
            var empty = document.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || params.get("tag") || "";
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var typeValue = normalize(typeSelect ? typeSelect.value : "");
                var yearValue = normalize(yearSelect ? yearSelect.value : "");
                var regionValue = normalize(regionSelect ? regionSelect.value : "");
                var genreValue = normalize(genreSelect ? genreSelect.value : "");
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var typeText = normalize(card.dataset.type);
                    var yearText = normalize(card.dataset.year);
                    var regionText = normalize(card.dataset.region);
                    var genreText = normalize(card.dataset.genre + " " + card.dataset.tags);
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (typeValue && typeText.indexOf(typeValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && yearText.indexOf(yearValue) === -1) {
                        matched = false;
                    }
                    if (regionValue && regionText.indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    if (genreValue && genreText.indexOf(genreValue) === -1) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.hidden = shown > 0;
                }
            }

            [input, typeSelect, yearSelect, regionSelect, genreSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var message = player.querySelector("[data-player-message]");
            var streamUrl = player.getAttribute("data-stream");
            var ready = false;
            var attached = false;

            function fail() {
                if (message) {
                    message.hidden = false;
                }
            }

            function playVideo() {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            function attachWithHls(Hls) {
                if (!Hls || !Hls.isSupported()) {
                    video.src = streamUrl;
                    ready = true;
                    playVideo();
                    return;
                }
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    ready = true;
                    playVideo();
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        fail();
                    }
                });
            }

            function start() {
                if (!video || !streamUrl) {
                    fail();
                    return;
                }
                player.classList.add("is-playing");
                if (ready) {
                    playVideo();
                    return;
                }
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    ready = true;
                    playVideo();
                    return;
                }
                loadHlsLibrary().then(function (Hls) {
                    attachWithHls(Hls);
                }).catch(function () {
                    video.src = streamUrl;
                    ready = true;
                    playVideo();
                });
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
}());
