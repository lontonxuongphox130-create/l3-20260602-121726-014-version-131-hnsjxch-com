document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const value = input ? input.value.trim() : "";
      if (value) {
        window.location.href = "search.html?q=" + encodeURIComponent(value);
      }
    });
  });

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const filterWrap = document.querySelector("[data-home-filters]");
  const homeGrid = document.querySelector("[data-home-grid]");

  if (filterWrap && homeGrid) {
    const cards = Array.from(homeGrid.querySelectorAll(".movie-card"));
    filterWrap.addEventListener("click", function (event) {
      const button = event.target.closest("[data-home-filter]");
      if (!button) {
        return;
      }
      const value = button.getAttribute("data-home-filter");
      filterWrap.querySelectorAll("button").forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      cards.forEach(function (card) {
        if (value === "all") {
          card.classList.remove("hidden-card");
          return;
        }
        const joined = [
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-year") || ""
        ].join(" ");
        card.classList.toggle("hidden-card", joined.indexOf(value) === -1);
      });
    });
  }

  const player = document.querySelector("[data-stream]");
  if (player) {
    const video = player.querySelector("video");
    const cover = player.querySelector(".player-cover");
    const stream = player.getAttribute("data-stream");
    let ready = false;
    let promise = null;

    const attach = function () {
      if (ready) {
        return promise || Promise.resolve();
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        promise = Promise.resolve();
        return promise;
      }
      if (window.Hls && window.Hls.isSupported()) {
        promise = new Promise(function (resolve) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
        return promise;
      }
      video.src = stream;
      promise = Promise.resolve();
      return promise;
    };

    const play = function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      attach().then(function () {
        video.play().catch(function () {});
      });
    };

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  const searchForm = document.querySelector("[data-search-page-form]");
  const resultWrap = document.querySelector("[data-search-results]");
  const searchTitle = document.querySelector("[data-search-title]");

  if (searchForm && resultWrap && Array.isArray(window.SEARCH_INDEX || SEARCH_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    const input = searchForm.querySelector("input[name='q']");

    if (input) {
      input.value = initial;
    }

    const render = function (keyword) {
      const q = keyword.trim().toLowerCase();
      const source = window.SEARCH_INDEX || SEARCH_INDEX;
      const items = q
        ? source.filter(function (movie) {
            return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.description]
              .join(" ")
              .toLowerCase()
              .indexOf(q) !== -1;
          }).slice(0, 120)
        : source.slice(0, 48);

      if (searchTitle) {
        searchTitle.textContent = q ? "搜索：" + keyword : "热门影片";
      }

      resultWrap.innerHTML = items.map(function (movie) {
        return [
          "<article class=\"movie-card\">",
          "<a class=\"poster-link\" href=\"" + movie.url + "\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\"><span class=\"poster-tag\">" + escapeHtml(movie.region) + "</span></a>",
          "<div class=\"movie-card-body\"><h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3><p>" + escapeHtml(movie.description) + "</p>",
          "<div class=\"meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></div></div>",
          "</article>"
        ].join("");
      }).join("");
    };

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = input ? input.value.trim() : "";
      const next = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
      window.history.replaceState(null, "", next);
      render(value);
    });

    render(initial);
  }
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
