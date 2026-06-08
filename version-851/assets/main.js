(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var topButton = document.querySelector('.back-to-top');

  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('is-visible', window.scrollY > 500);
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('active', thumbIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  var panel = document.querySelector('[data-filter-panel]');

  if (panel) {
    var input = panel.querySelector('.filter-input');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid [data-title]'));
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (input && q) {
      input.value = q;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function cardMatches(card, query) {
      var target = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();

      if (query && target.indexOf(query) === -1) {
        return false;
      }

      return selects.every(function (select) {
        var key = select.getAttribute('data-filter');
        var value = normalize(select.value);
        if (!value) {
          return true;
        }
        return normalize(card.getAttribute('data-' + key)) === value;
      });
    }

    function applyFilters() {
      var query = input ? normalize(input.value) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matched = cardMatches(card, query);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();
