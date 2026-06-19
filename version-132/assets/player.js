(function () {
    window.initMoviePlayer = function (mediaUrl) {
        var root = document.querySelector("[data-player-root]");
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var overlay = root.querySelector("[data-player-overlay]");
        if (!video || !mediaUrl) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    maxBufferLength: 45
                });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        }
        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }
        function play() {
            attach();
            hideOverlay();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", hideOverlay);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
