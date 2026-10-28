const projectViewer = document.querySelector("#project-viewer");
const projectViewerFrame = document.querySelector("#viewer-frame");
const projectViewerTitle = document.querySelector("#viewer-title");
const projectViewerClose = document.querySelector(".viewer-close");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".project-card[data-hover-frames]").forEach((card) => {
  const image = card.querySelector("img");
  const frames = card.dataset.hoverFrames.split("|");
  let frameIndex = 0;
  let frameTimer = null;
  let pointerOver = false;
  let keyboardFocused = false;

  frames.forEach((source) => {
    const preload = new Image();
    preload.src = source;
  });

  function syncAnimation() {
    if (reduceMotion) return;
    if (pointerOver || keyboardFocused) {
      if (frameTimer || frames.length < 2) return;
      frameIndex = 0;
      image.src = frames[frameIndex];
      frameTimer = window.setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        image.src = frames[frameIndex];
      }, 420);
      return;
    }

    window.clearInterval(frameTimer);
    frameTimer = null;
    frameIndex = 0;
    image.src = frames[0];
  }

  card.addEventListener("pointerenter", () => {
    pointerOver = true;
    syncAnimation();
  });
  card.addEventListener("pointerleave", () => {
    pointerOver = false;
    syncAnimation();
  });
  card.addEventListener("focus", () => {
    keyboardFocused = true;
    syncAnimation();
  });
  card.addEventListener("blur", () => {
    keyboardFocused = false;
    syncAnimation();
  });
});

document.querySelector(".project-grid").addEventListener("click", (event) => {
  const card = event.target.closest(".project-card");
  if (!card) return;

  event.preventDefault();
  projectViewerTitle.textContent = card.dataset.title || "Project presentation";
  projectViewerFrame.src = card.href;
  projectViewer.showModal();
});

projectViewerClose.addEventListener("click", () => projectViewer.close());

projectViewer.addEventListener("click", (event) => {
  if (event.target === projectViewer) projectViewer.close();
});

projectViewer.addEventListener("close", () => {
  projectViewerFrame.src = "about:blank";
});
