document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-button]');
  const menuPanel = document.querySelector('[data-menu-panel]');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', () => {
      menuPanel.classList.toggle('open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
      window.setInterval(() => {
        showSlide(activeIndex + 1);
      }, 6000);
    }
  }

  const localFilter = document.querySelector('[data-list-filter]');

  if (localFilter) {
    const cards = Array.from(document.querySelectorAll('[data-card-list] .movie-card'));

    localFilter.addEventListener('input', () => {
      const keyword = localFilter.value.trim().toLowerCase();

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' ').toLowerCase();

        card.style.display = haystack.includes(keyword) ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('[data-play-top]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });

  const searchRoot = document.querySelector('[data-page="search"]');

  if (searchRoot && typeof MOVIE_INDEX !== 'undefined') {
    const form = searchRoot.querySelector('[data-search-panel]');
    const input = form.querySelector('input[name="q"]');
    const select = form.querySelector('select[name="category"]');
    const results = searchRoot.querySelector('[data-search-results]');
    const count = searchRoot.querySelector('[data-result-count]');
    const params = new URLSearchParams(window.location.search);

    input.value = params.get('q') || '';

    const renderCard = (movie) => {
      const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

      return `
<article class="movie-card card" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-year="${escapeHtml(movie.year)}" data-genre="${escapeHtml(movie.genre)}">
  <a class="movie-card-link" href="./${escapeHtml(movie.file)}">
    <div class="poster-frame">
      <img src="./${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)} 在线观看" loading="lazy">
      <span class="poster-year">${escapeHtml(movie.year)}</span>
      <span class="poster-play">▶</span>
    </div>
    <div class="movie-card-body">
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.oneLine)}</p>
      <div class="card-meta">
        <span>${escapeHtml(movie.region)}</span>
        <span>${escapeHtml(movie.type)}</span>
      </div>
      <div class="card-tags">${tags}</div>
    </div>
  </a>
</article>`;
    };

    const performSearch = () => {
      const keyword = input.value.trim().toLowerCase();
      const category = select.value;

      let matched = MOVIE_INDEX.filter((movie) => {
        const haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine,
          movie.regionGroup,
          movie.typeGroup
        ].join(' ').toLowerCase();

        const keywordOk = !keyword || haystack.includes(keyword);
        const categoryOk = category === '全部' || movie.regionGroup === category || movie.typeGroup === category;

        return keywordOk && categoryOk;
      });

      if (!keyword && category === '全部') {
        matched = MOVIE_INDEX.slice(0, 60);
      }

      count.textContent = matched.length ? `${matched.length} 部影片` : '暂无匹配影片';
      results.innerHTML = matched.slice(0, 120).map(renderCard).join('');
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      performSearch();
    });

    input.addEventListener('input', performSearch);
    select.addEventListener('change', performSearch);
    performSearch();
  }
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
