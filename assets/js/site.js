(() => {
  const qs = (selector, parent = document) => parent.querySelector(selector);
  const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  function setupMobileMenu() {
    const toggle = qs('[data-menu-toggle]');
    const panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', panel.classList.contains('open'));
    });
  }

  function setupHeroCarousel() {
    const slides = qsa('[data-hero-slide]');
    const dots = qsa('[data-hero-dot]');
    const next = qs('[data-hero-next]');
    const prev = qs('[data-hero-prev]');
    if (slides.length === 0) return;

    let index = 0;
    let timer = null;

    const show = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
    };

    next?.addEventListener('click', () => {
      show(index + 1);
      start();
    });

    prev?.addEventListener('click', () => {
      show(index - 1);
      start();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        start();
      });
    });

    start();
  }

  function setupLocalFiltering() {
    const tools = qs('[data-listing-tools]');
    const list = qs('[data-card-list]');
    if (!tools || !list) return;

    const searchInput = qs('[data-local-search]', tools);
    const yearButtons = qsa('[data-filter-year]', tools);
    const regionSelect = qs('[data-region-filter]', tools);
    const typeSelect = qs('[data-type-filter]', tools);
    const resultCount = qs('[data-result-count]', tools);
    const cards = qsa('.movie-card', list);

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    let activeYear = 'all';

    const apply = () => {
      const query = (searchInput?.value || '').trim().toLowerCase();
      const region = regionSelect?.value || 'all';
      const type = typeSelect?.value || 'all';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' ').toLowerCase();
        const okQuery = !query || haystack.includes(query);
        const okYear = activeYear === 'all' || card.dataset.year === activeYear;
        const okRegion = region === 'all' || card.dataset.region === region;
        const okType = type === 'all' || card.dataset.type === type;
        const show = okQuery && okYear && okRegion && okType;
        card.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });

      if (resultCount) resultCount.textContent = String(visible);
    };

    searchInput?.addEventListener('input', apply);
    regionSelect?.addEventListener('change', apply);
    typeSelect?.addEventListener('change', apply);

    yearButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeYear = button.dataset.filterYear || 'all';
        yearButtons.forEach((item) => item.classList.toggle('active', item === button));
        apply();
      });
    });

    apply();
  }

  function setupPlayer() {
    const playerCard = qs('.player-card[data-video-url]');
    if (!playerCard) return;

    const video = qs('video', playerCard);
    const button = qs('[data-play-button]', playerCard);
    const videoUrl = playerCard.dataset.videoUrl;
    if (!video || !button || !videoUrl) return;

    const startPlayback = () => {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => undefined);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => undefined);
        }, { once: true });
      } else {
        video.src = videoUrl;
        video.play().catch(() => undefined);
      }
      playerCard.classList.add('playing');
    };

    button.addEventListener('click', startPlayback, { once: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupHeroCarousel();
    setupLocalFiltering();
    setupPlayer();
  });
})();
