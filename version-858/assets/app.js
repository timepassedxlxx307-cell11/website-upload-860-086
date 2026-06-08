(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
        queryAll('a', menu).forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
            });
        });
    }

    function initCarousel() {
        queryAll('[data-carousel]').forEach(function (carousel) {
            var slides = queryAll('[data-slide]', carousel);
            var dots = queryAll('[data-carousel-dot]', carousel);
            var prev = carousel.querySelector('[data-carousel-prev]');
            var next = carousel.querySelector('[data-carousel-next]');
            var index = 0;
            var timer;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    start();
                });
            });
            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        });
    }

    function initFilters() {
        queryAll('[data-filter-form]').forEach(function (form) {
            var scopeSelector = form.getAttribute('data-scope');
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = queryAll('[data-card]', scope);
            var fields = queryAll('input, select', form);

            function value(name) {
                var field = form.querySelector('[name="' + name + '"]');
                return field ? field.value.trim().toLowerCase() : '';
            }

            function apply() {
                var keyword = value('q');
                var year = value('year');
                var type = value('type');
                cards.forEach(function (card) {
                    var searchText = (card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                    var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                    var matched = true;
                    if (keyword && searchText.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType.indexOf(type) === -1) {
                        matched = false;
                    }
                    card.hidden = !matched;
                });
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
            fields.forEach(function (field) {
                field.addEventListener('input', apply);
                field.addEventListener('change', apply);
            });
        });
    }

    function initPlayers() {
        queryAll('.movie-player').forEach(function (box) {
            var video = box.querySelector('video');
            var button = box.querySelector('.player-start');
            var stream = box.getAttribute('data-stream');
            var attached = false;
            var hlsInstance = null;

            function attach() {
                if (attached || !video || !stream) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = stream;
            }

            function play() {
                attach();
                box.classList.add('is-playing');
                video.controls = true;
                var task = video.play();
                if (task && task.catch) {
                    task.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    box.classList.add('is-playing');
                });
                video.addEventListener('emptied', function () {
                    if (hlsInstance && hlsInstance.destroy) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        attached = false;
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initCarousel();
        initFilters();
        initPlayers();
    });
}());
