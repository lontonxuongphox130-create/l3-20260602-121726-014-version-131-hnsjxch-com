(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
    });
  }

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide-to]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
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

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initSearchPage() {
    var input = document.getElementById('siteSearchInput');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-results .search-card'));
    var count = document.getElementById('searchResultCount');
    if (!input || !cards.length) {
      return;
    }

    function filterCards() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-text') || '';
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    input.value = getQueryValue('q');
    input.addEventListener('input', filterCards);
    filterCards();
  }

  function initPlayer() {
    var shell = document.querySelector('.player-shell');
    var video = document.getElementById('movie-player');
    var button = document.querySelector('.js-play-button');
    var message = document.querySelector('.player-message');
    if (!shell || !video || !button) {
      return;
    }

    var source = shell.getAttribute('data-video-source') || '';
    var hlsInstance = null;
    var loaded = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function loadVideo() {
      if (loaded) {
        return Promise.resolve();
      }
      if (!source) {
        setMessage('当前影片暂未绑定可播放地址。');
        return Promise.reject(new Error('empty video source'));
      }

      loaded = true;
      setMessage('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('视频加载失败，请刷新后重试。');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('');
        return Promise.resolve();
      }

      setMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Firefox 或 Safari。');
      return Promise.reject(new Error('hls unsupported'));
    }

    function playVideo() {
      loadVideo().then(function () {
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击播放器。');
          });
        }
      }).catch(function () {});
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initSearchPage();
    initPlayer();
  });
})();
