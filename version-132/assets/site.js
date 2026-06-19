(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function openMobileNav() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-nav-menu]");
        var search = document.querySelector("[data-site-search]");
        if (!toggle || !nav || !search) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            search.classList.toggle("is-open");
        });
    }

    function bindTopSearch() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = "./movies.html";
                }
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show((current + 1) % slides.length);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        if (!panel || !cards.length) {
            return;
        }
        var search = panel.querySelector("[data-filter-search]");
        var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
        var empty = document.querySelector("[data-no-results]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (search && initial) {
            search.value = initial;
        }
        function pass(card) {
            var query = normalize(search ? search.value : "");
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" "));
            if (query && text.indexOf(query) === -1) {
                return false;
            }
            for (var i = 0; i < selects.length; i += 1) {
                var select = selects[i];
                var key = select.getAttribute("data-filter-select");
                var value = normalize(select.value);
                if (value && normalize(card.getAttribute("data-" + key)) !== value) {
                    return false;
                }
            }
            return true;
        }
        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = pass(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        if (search) {
            search.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    ready(function () {
        openMobileNav();
        bindTopSearch();
        initHero();
        initFilters();
    });
}());
