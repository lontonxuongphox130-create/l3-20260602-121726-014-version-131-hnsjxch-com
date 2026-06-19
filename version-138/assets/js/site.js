(() => {
  const getRootPrefix = () => document.body.getAttribute('data-root-prefix') || './';

  const initMenu = () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  };

  const initHero = () => {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    };

    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), 5000);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        play();
      });
    });

    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  };

  const initSearch = () => {
    const forms = Array.from(document.querySelectorAll('[data-site-search]'));
    const index = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
    if (!forms.length || !index.length) return;
    const root = getRootPrefix();

    forms.forEach((form) => {
      const input = form.querySelector('input[type="search"]');
      const results = form.querySelector('[data-search-results]');
      if (!input || !results) return;

      const render = () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
          results.classList.remove('open');
          results.innerHTML = '';
          return;
        }
        const matched = index.filter((item) => {
          const text = `${item.title} ${item.region} ${item.type} ${item.year} ${item.genre} ${item.summary}`.toLowerCase();
          return text.includes(q);
        }).slice(0, 8);

        results.innerHTML = matched.map((item) => `
          <a href="${root}${item.url}">
            <img src="${root}${item.cover}" alt="${item.title}">
            <span><strong>${item.title}</strong><em>${item.year} · ${item.region} · ${item.type}</em></span>
          </a>
        `).join('');
        results.classList.toggle('open', matched.length > 0);
      };

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const first = results.querySelector('a');
        if (first) window.location.href = first.href;
      });
      document.addEventListener('click', (event) => {
        if (!form.contains(event.target)) results.classList.remove('open');
      });
    });
  };

  const initFilters = () => {
    const scopes = Array.from(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach((scope) => {
      const container = scope.parentElement || document;
      const cards = Array.from(container.querySelectorAll('[data-movie-card]'));
      const empty = container.querySelector('[data-empty-state]');
      const search = scope.querySelector('[data-filter-search]');
      const state = { type: '', region: '', year: '', q: '' };

      const apply = () => {
        state.q = search ? search.value.trim().toLowerCase() : '';
        let shown = 0;
        cards.forEach((card) => {
          const text = `${card.dataset.title || ''} ${card.dataset.region || ''} ${card.dataset.type || ''} ${card.dataset.year || ''} ${card.dataset.genre || ''}`.toLowerCase();
          const ok = (!state.q || text.includes(state.q)) &&
            (!state.type || card.dataset.type === state.type) &&
            (!state.region || card.dataset.region === state.region) &&
            (!state.year || card.dataset.year === state.year);
          card.hidden = !ok;
          if (ok) shown += 1;
        });
        if (empty) empty.hidden = shown > 0;
      };

      scope.querySelectorAll('[data-filter-group]').forEach((group) => {
        const key = group.getAttribute('data-filter-group');
        group.querySelectorAll('[data-filter-value]').forEach((button) => {
          button.addEventListener('click', () => {
            state[key] = button.getAttribute('data-filter-value') || '';
            group.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            apply();
          });
        });
      });

      if (search) search.addEventListener('input', apply);
      apply();
    });
  };

  const startVideo = (player) => {
    const video = player.querySelector('video');
    const trigger = player.querySelector('[data-play-button]');
    const source = trigger ? trigger.getAttribute('data-source') : '';
    if (!video || !source) return;

    player.classList.add('is-loading');
    if (video.hlsInstance) {
      video.hlsInstance.destroy();
      video.hlsInstance = null;
    }

    const finish = () => {
      player.classList.add('is-playing');
      player.classList.remove('is-loading');
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => player.classList.remove('is-loading'));
      }
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      finish();
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true });
      video.hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
      hls.on(window.Hls.Events.ERROR, () => player.classList.remove('is-loading'));
    } else {
      video.src = source;
      finish();
    }
  };

  const initPlayers = () => {
    document.querySelectorAll('[data-player]').forEach((player) => {
      const button = player.querySelector('[data-play-button]');
      const video = player.querySelector('video');
      if (button) button.addEventListener('click', () => startVideo(player));
      if (video) {
        video.addEventListener('click', () => {
          if (!player.classList.contains('is-playing')) startVideo(player);
        });
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initHero();
    initSearch();
    initFilters();
    initPlayers();
  });
})();
