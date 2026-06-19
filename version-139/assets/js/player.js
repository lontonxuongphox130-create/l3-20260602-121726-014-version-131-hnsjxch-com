function initMoviePlayer(url) {
  const video = document.getElementById('movieVideo');
  const playButton = document.querySelector('[data-play-button]');
  let started = false;
  let hlsInstance = null;

  if (!video || !playButton || !url) {
    return;
  }

  const begin = function () {
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    playButton.classList.add('is-hidden');
    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  };

  playButton.addEventListener('click', begin);
  video.addEventListener('click', function () {
    if (!started || video.paused) {
      begin();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function () {
    playButton.classList.add('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
