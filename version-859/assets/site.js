(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });

    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.hidden = !mobileMenu.hidden;
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    document.querySelectorAll("input[type='search']").forEach(function (input) {
      if (query && !input.value) {
        input.value = params.get("q");
      }
    });

    function applyFilter(root, term, value) {
      var cards = root.querySelectorAll(".movie-card");
      var normalizedTerm = normalize(term);
      var normalizedValue = normalize(value || "all");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-text"));
        var year = normalize(card.getAttribute("data-year"));
        var matchText = !normalizedTerm || text.indexOf(normalizedTerm) !== -1;
        var matchValue = normalizedValue === "all" || year === normalizedValue || normalize(card.getAttribute("data-category")) === normalizedValue;
        card.classList.toggle("is-hidden-card", !(matchText && matchValue));
      });
    }

    document.querySelectorAll("[data-filter-list]").forEach(function (list) {
      var scope = list.closest("main") || document;
      var search = scope.querySelector("[data-local-search]");
      var currentValue = "all";
      if (query) {
        applyFilter(scope, query, currentValue);
      }
      if (search) {
        search.addEventListener("input", function () {
          applyFilter(scope, search.value, currentValue);
        });
      }
      scope.querySelectorAll("[data-filter-value]").forEach(function (button) {
        button.addEventListener("click", function () {
          currentValue = button.getAttribute("data-filter-value") || "all";
          scope.querySelectorAll("[data-filter-value]").forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          applyFilter(scope, search ? search.value : query, currentValue);
        });
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });
      restart();
    }
  });
})();
