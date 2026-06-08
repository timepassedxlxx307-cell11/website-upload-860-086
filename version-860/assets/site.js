(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dots] button'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
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
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function setupSearch() {
        var input = document.querySelector('.js-search');
        var scope = document.querySelector('.search-scope');
        if (!input || !scope) {
            return;
        }
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.search-card'));
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var active = 'all';

        function apply() {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = active === 'all' || text.indexOf(active.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
            });
        }

        input.value = getQueryValue('q');
        input.addEventListener('input', apply);
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                active = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
        apply();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
