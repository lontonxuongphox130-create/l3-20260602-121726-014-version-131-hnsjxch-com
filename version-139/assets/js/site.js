(function () {
  const navButton = document.querySelector('[data-nav-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (navButton && mobilePanel) {
    navButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    const showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  const filterPanel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-card-grid]');

  if (filterPanel && grid) {
    const searchInput = filterPanel.querySelector('[data-filter-search]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const categorySelect = filterPanel.querySelector('[data-filter-category]');
    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const matchesYear = function (card, value) {
      if (!value) {
        return true;
      }
      const year = Number(card.dataset.year || 0);
      if (value === '2021') {
        return year <= 2021;
      }
      return year === Number(value);
    };

    const applyFilters = function () {
      const query = normalize(searchInput ? searchInput.value : '');
      const yearValue = yearSelect ? yearSelect.value : '';
      const categoryValue = categorySelect ? categorySelect.value : '';

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        const categoryText = card.querySelector('.movie-meta a') ? card.querySelector('.movie-meta a').textContent.trim() : '';
        const visible = (!query || haystack.indexOf(query) !== -1) && matchesYear(card, yearValue) && (!categoryValue || categoryText === categoryValue);
        card.classList.toggle('is-filter-hidden', !visible);
      });
    };

    [searchInput, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }
})();
