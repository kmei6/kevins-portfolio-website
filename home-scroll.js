const scrollCue = document.querySelector("#scroll-cue");

if (scrollCue) {
  let updateQueued = false;

  function updateScrollCue() {
    const fadeDistance = Math.max(1, window.innerHeight / 2);
    const opacity = Math.max(0, 1 - window.scrollY / fadeDistance);
    scrollCue.style.opacity = opacity;
    scrollCue.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
    updateQueued = false;
  }

  function queueScrollCueUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    window.requestAnimationFrame(updateScrollCue);
  }

  window.addEventListener("scroll", queueScrollCueUpdate, { passive: true });
  window.addEventListener("resize", queueScrollCueUpdate);
  updateScrollCue();
}
