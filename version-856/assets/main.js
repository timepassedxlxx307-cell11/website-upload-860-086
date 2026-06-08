(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
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
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function initFilters() {
        var input = document.querySelector("[data-search-input]");
        var button = document.querySelector("[data-search-button]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var empty = document.querySelector("[data-empty-filter]");
        if (!cards.length) {
            return;
        }
        var activeFilter = "";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
        }

        function apply() {
            var query = input ? normalize(input.value) : "";
            var filter = normalize(activeFilter);
            var visible = 0;
            cards.forEach(function (card) {
                var text = cardText(card);
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchFilter = !filter || text.indexOf(filter) !== -1;
                var shouldShow = matchQuery && matchFilter;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
        }
        if (button) {
            button.addEventListener("click", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                activeFilter = chip.getAttribute("data-filter-value") || "";
                apply();
            });
        });
        apply();
    }

    function initHomeSearch() {
        var form = document.querySelector("[data-home-search]");
        if (!form) {
            return;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var query = input ? input.value.trim() : "";
            var target = "./search.html";
            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.querySelector("[data-player]");
        var overlay = document.querySelector("[data-play-overlay]");
        if (!video || !streamUrl) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            attached = true;
        }

        function play() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initHomeSearch();
    });
})();
