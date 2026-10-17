const projectViewer = document.querySelector("#project-viewer");
const projectViewerFrame = document.querySelector("#viewer-frame");
const projectViewerTitle = document.querySelector("#viewer-title");
const projectViewerClose = document.querySelector(".viewer-close");

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
