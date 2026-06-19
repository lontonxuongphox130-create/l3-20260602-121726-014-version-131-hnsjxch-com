(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll('img');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var parent = image.parentElement;
        if (parent) {
          parent.classList.add('image-missing');
        }
      }, { once: true });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilter() {
    var list = document.querySelector('[data-filter-list]');
    var input = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var sortSelect = document.querySelector('[data-year-sort]');
    if (!list || !input) {
      return;
    }
    var items = Array.prototype.slice.call(list.children).filter(function (item) {
      return item.matches('.movie-card, .library-row');
    });

    function applyFilter() {
      var query = normalize(input.value);
      var type = normalize(typeFilter ? typeFilter.value : '');
      items.forEach(function (item) {
        var haystack = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-genre')
        ].join(' '));
        var typeValue = normalize(item.getAttribute('data-type'));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !type || typeValue.indexOf(type) !== -1;
        item.classList.toggle('is-hidden-by-filter', !(matchQuery && matchType));
      });
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }
      var direction = sortSelect.value === 'asc' ? 1 : -1;
      items.sort(function (a, b) {
        var yearA = Number(a.getAttribute('data-year')) || 0;
        var yearB = Number(b.getAttribute('data-year')) || 0;
        return (yearA - yearB) * direction;
      });
      items.forEach(function (item) {
        list.appendChild(item);
      });
      applyFilter();
    }

    input.addEventListener('input', applyFilter);
    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
    }
    applySort();
  }

  function canPlayNative(video, src) {
    if (!video || !src) {
      return false;
    }
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  }

  function initPlayer() {
    var players = document.querySelectorAll('.static-player');
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      var src = shell.getAttribute('data-video-src');
      var loaded = false;

      function loadAndPlay() {
        if (!video || !src) {
          return;
        }
        if (!loaded) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            shell._hls = hls;
          } else if (canPlayNative(video, src)) {
            video.src = src;
          } else {
            video.src = src;
          }
          loaded = true;
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', loadAndPlay);
      }
      if (video) {
        video.addEventListener('play', loadAndPlay, { once: true });
      }
    });
  }

  ready(function () {
    initMenu();
    initImageFallbacks();
    initHero();
    initFilter();
    initPlayer();
  });
})();
