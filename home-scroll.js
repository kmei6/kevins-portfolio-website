const story = document.querySelector("#home-story");
const scrollCue = document.querySelector("#scroll-cue");
const blendSlide = document.querySelector("#color-blend");
const streamingSlide = document.querySelector("#streaming");

if (story && blendSlide && streamingSlide) {
  let updateQueued = false;

  function updateScrollEffects() {
    const slideHeight = Math.max(1, story.clientHeight);
    const slidePosition = story.scrollTop / slideHeight;
    const transitionProgress = Math.max(0, Math.min(1, slidePosition % 1));
    const fade = Math.sin(Math.PI * transitionProgress);
    const betweenHomeAndBlend = slidePosition < 1;

    blendSlide.style.setProperty("--blend-home", betweenHomeAndBlend ? fade : 0);
    blendSlide.style.setProperty("--blend-stream", betweenHomeAndBlend ? 0 : fade);
    streamingSlide.style.setProperty("--blend-stream", betweenHomeAndBlend ? 0 : fade);

    if (scrollCue) {
      const cueOpacity = Math.max(0, 1 - story.scrollTop / (slideHeight / 2));
      scrollCue.style.opacity = cueOpacity;
      scrollCue.style.pointerEvents = cueOpacity > 0.05 ? "auto" : "none";
    }

    updateQueued = false;
  }

  function queueScrollEffects() {
    if (updateQueued) return;
    updateQueued = true;
    window.requestAnimationFrame(updateScrollEffects);
  }

  story.addEventListener("scroll", queueScrollEffects, { passive: true });
  window.addEventListener("resize", queueScrollEffects);
  updateScrollEffects();
}

const resumeDialog = document.querySelector("#resume-dialog");
const resumeOpenButton = document.querySelector("#resume-open");
const resumeCloseButton = document.querySelector("#resume-close");

resumeOpenButton?.addEventListener("click", () => resumeDialog?.showModal());
resumeCloseButton?.addEventListener("click", () => resumeDialog?.close());
resumeDialog?.addEventListener("click", (event) => {
  if (event.target === resumeDialog) resumeDialog.close();
});
