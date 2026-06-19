(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var menuPanel = document.querySelector('[data-menu-panel]');

    if (menuButton && menuPanel) {
        menuButton.addEventListener('click', function () {
            menuPanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    if (slides.length) {
        showSlide(0);
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search-input'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('.filter-year'));
    var typeFilters = Array.prototype.slice.call(document.querySelectorAll('.filter-type'));
    var regionFilters = Array.prototype.slice.call(document.querySelectorAll('.filter-region'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));
    var emptyState = document.querySelector('.empty-state');

    function valueOf(list) {
        return list.length ? list[0].value.trim().toLowerCase() : '';
    }

    function filterCards() {
        var query = valueOf(searchInputs);
        var year = valueOf(yearFilters);
        var type = valueOf(typeFilters);
        var region = valueOf(regionFilters);
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.dataset.title,
                card.dataset.tags,
                card.dataset.type,
                card.dataset.region,
                card.textContent
            ].join(' ').toLowerCase();
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !year || String(card.dataset.year) === year;
            var matchType = !type || String(card.dataset.type).toLowerCase() === type;
            var matchRegion = !region || String(card.dataset.region).toLowerCase() === region;
            var show = matchQuery && matchYear && matchType && matchRegion;

            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    searchInputs.concat(yearFilters, typeFilters, regionFilters).forEach(function (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
    });
})();

function initMoviePlayer(source) {
    var video = document.querySelector('.movie-player-video');
    var overlay = document.querySelector('.player-overlay');
    var button = document.querySelector('.player-button');
    var initialized = false;
    var hlsInstance = null;

    function start() {
        if (!video || !source) {
            return;
        }

        if (!initialized) {
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        if (overlay) {
            overlay.classList.add('hidden');
        }

        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!initialized) {
                start();
            }
        });
    }
}
