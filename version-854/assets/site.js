(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        button.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupHero() {
    var slides = selectAll(".hero-slide");
    var dots = selectAll(".hero-dot");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-slide-target") || 0));
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var filter = document.querySelector("[data-page-filter]");
    var grid = document.querySelector("[data-card-grid]");
    if (!filter || !grid) {
      return;
    }
    var cards = selectAll(".movie-card, .rank-card", grid);
    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
      });
    });
  }

  function setupSorting() {
    var grid = document.querySelector("[data-card-grid]");
    var wrap = document.querySelector("[data-sort-buttons]");
    if (!grid || !wrap) {
      return;
    }
    var buttons = selectAll("button[data-sort]", wrap);
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var sort = button.getAttribute("data-sort");
        var cards = selectAll(".movie-card, .rank-card", grid);
        cards.sort(function (a, b) {
          if (sort === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          }
          if (sort === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          return Number(b.getAttribute("data-hot") || 0) - Number(a.getAttribute("data-hot") || 0);
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    });
  }

  var hlsLoading = false;
  var hlsCallbacks = [];

  function ensureHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.onload = function () {
      var callbacks = hlsCallbacks.slice();
      hlsCallbacks = [];
      callbacks.forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      var callbacks = hlsCallbacks.slice();
      hlsCallbacks = [];
      callbacks.forEach(function (fn) {
        fn();
      });
    };
    document.head.appendChild(script);
  }

  function setupPlayers() {
    selectAll(".player-card").forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector(".play-layer");
      var url = player.getAttribute("data-play-url");
      var hls = null;
      var ready = false;
      if (!video || !url) {
        return;
      }
      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
      function attach() {
        if (ready) {
          playVideo();
          return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          playVideo();
          return;
        }
        ensureHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          } else {
            video.src = url;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            playVideo();
          }
        });
      }
      function start() {
        if (layer) {
          layer.classList.add("is-hidden");
        }
        attach();
      }
      if (layer) {
        layer.addEventListener("click", start);
      }
      player.addEventListener("click", function (event) {
        if (event.target === video && video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-badge\">" + escapeHtml(movie.genreShort) + "</span>" +
      "<span class=\"poster-play\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "<div class=\"card-foot\"><span>评分 " + escapeHtml(movie.score) + "</span><span>" + Number(movie.views || 0).toLocaleString() + " 热度</span></div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var input = document.getElementById("searchPageInput");
    var results = document.getElementById("searchResults");
    var dynamic = document.getElementById("searchDynamic");
    var fallback = document.getElementById("searchFallback");
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    input.value = q;
    function render(query) {
      var value = query.trim().toLowerCase();
      if (!value) {
        if (dynamic) {
          dynamic.hidden = true;
        }
        if (fallback) {
          fallback.hidden = false;
        }
        results.innerHTML = "";
        return;
      }
      var list = window.SEARCH_INDEX.filter(function (movie) {
        return String(movie.search || "").toLowerCase().indexOf(value) !== -1;
      }).slice(0, 120);
      if (dynamic) {
        dynamic.hidden = false;
      }
      if (fallback) {
        fallback.hidden = true;
      }
      results.innerHTML = list.length ? list.map(movieCard).join("") : "<p class=\"empty-state\">未找到匹配影片</p>";
    }
    render(q);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSorting();
    setupPlayers();
    setupSearchPage();
  });
})();
