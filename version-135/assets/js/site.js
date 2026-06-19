(function () {
  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function openSearch(query) {
    var text = String(query || '').trim();
    var target = './search.html';
    if (text) {
      target += '?q=' + encodeURIComponent(text);
    }
    window.location.href = target;
  }

  toArray(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      openSearch(input ? input.value : '');
    });
  });

  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var opened = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      toggle.textContent = opened ? '×' : '☰';
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = toArray(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = toArray(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 6200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  toArray(document.querySelectorAll('[data-card-filter]')).forEach(function (panel) {
    var input = panel.querySelector('[data-card-search]');
    var list = document.querySelector('[data-card-list]');
    var cards = list ? toArray(list.querySelectorAll('[data-movie-card]')) : [];
    var buttons = toArray(panel.querySelectorAll('[data-filter-value]'));
    var activeValue = 'all';
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = activeValue === 'all' || card.getAttribute('data-region') === activeValue;
        card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
      });
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  });

  window.initMoviePlayer = function (videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !url) {
      return;
    }

    var hls = null;
    var ready = false;

    function playVideo() {
      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    function prepare() {
      if (ready) {
        playVideo();
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
            video.src = url;
          }
        });
        return;
      }
      video.src = url;
      playVideo();
    }

    button.addEventListener('click', prepare);
    video.addEventListener('click', function () {
      if (video.paused) {
        prepare();
      }
    });
  };
})();
