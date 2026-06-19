(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function() {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          show(i);
        });
      });

      if (slides.length > 1) {
        setInterval(function() {
          show(index + 1);
        }, 5200);
      }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
    panels.forEach(function(panel) {
      var input = panel.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-title]"));
      if (!input || !cards.length) {
        return;
      }

      function runFilter() {
        var keyword = normalize(input.value);
        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          card.classList.toggle("hidden-by-filter", keyword && haystack.indexOf(keyword) === -1);
        });
      }

      input.addEventListener("input", runFilter);
    });
  });
})();
