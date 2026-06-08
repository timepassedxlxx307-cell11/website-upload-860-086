(function () {
  var header = document.querySelector('[data-header]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var menuToggle = document.querySelector('[data-menu-toggle]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('is-solid');
    } else {
      header.classList.remove('is-solid');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      play();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (slides.length > 1) {
      play();
    }
  });

  document.querySelectorAll('[data-home-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var url = './all-movies.html';
      if (query) {
        url += '?q=' + encodeURIComponent(query);
      }
      window.location.href = url;
    });
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var grid = scope.parentElement ? scope.parentElement.querySelector('[data-filter-grid]') : null;
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')) : [];
    var status = scope.querySelector('[data-filter-status]');

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value.trim() : '');
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      var hasVisible = false;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-keywords'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedType && cardType.indexOf(selectedType) === -1) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          hasVisible = true;
        }
      });

      if (status) {
        status.textContent = hasVisible ? '已显示匹配内容' : '未找到匹配内容';
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }
    apply();
  });
})();
