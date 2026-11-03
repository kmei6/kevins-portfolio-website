const personalWorkGrid = document.querySelector("#personal-work-grid");
const personalWorkEmpty = document.querySelector("#personal-work-empty");
const personalWorkDialog = document.querySelector("#personal-work-viewer");
const personalWorkTitle = document.querySelector("#personal-work-viewer-title");
const personalWorkSummary = document.querySelector("#personal-work-viewer-summary");
const personalWorkImage = document.querySelector("#personal-work-current-image");
const personalWorkImageCount = document.querySelector("#personal-work-image-count");
const personalWorkClose = document.querySelector("#personal-work-viewer-close");
const personalWorkPrevious = document.querySelector("#personal-work-previous");
const personalWorkNext = document.querySelector("#personal-work-next");

let activeImages = [];
let activeImageIndex = 0;

function openPersonalWork(item) {
  personalWorkTitle.textContent = item.title;
  personalWorkSummary.textContent = item.summary;
  activeImages = item.images.length ? item.images : [item.thumbnail];
  activeImageIndex = 0;
  showPersonalWorkImage();
  personalWorkDialog.showModal();
}

function showPersonalWorkImage() {
  if (!activeImages.length) return;
  personalWorkImage.src = activeImages[activeImageIndex];
  personalWorkImage.alt = `${personalWorkTitle.textContent} — image ${activeImageIndex + 1}`;
  personalWorkImageCount.textContent = `${activeImageIndex + 1} / ${activeImages.length}`;
  personalWorkPrevious.disabled = activeImages.length < 2;
  personalWorkNext.disabled = activeImages.length < 2;
}

function movePersonalWorkImage(direction) {
  if (!activeImages.length) return;
  activeImageIndex = (activeImageIndex + direction + activeImages.length) % activeImages.length;
  showPersonalWorkImage();
}

personalWorkPrevious?.addEventListener("click", () => movePersonalWorkImage(-1));
personalWorkNext?.addEventListener("click", () => movePersonalWorkImage(1));
personalWorkClose?.addEventListener("click", () => personalWorkDialog.close());
personalWorkDialog?.addEventListener("click", (event) => {
  if (event.target === personalWorkDialog) personalWorkDialog.close();
});
personalWorkDialog?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    movePersonalWorkImage(event.key === "ArrowLeft" ? -1 : 1);
  }
});

if (personalWorkGrid) {
  fetch("personal-work/items.json")
    .then((response) => {
      if (!response.ok) throw new Error("Could not load personal work list.");
      return response.json();
    })
    .then((items) => {
      if (!Array.isArray(items) || items.length === 0) return;

      personalWorkEmpty.hidden = true;
      items.forEach((item, index) => {
        if (!item.title || !item.summary || !item.thumbnail) return;

        const wrapper = document.createElement("div");
        wrapper.className = "project-item";
        wrapper.style.animationDelay = `${Math.min(index, 10) * 75}ms`;

        const card = document.createElement("button");
        card.className = "project-card personal-work-card";
        card.type = "button";
        card.dataset.title = item.title;
        card.setAttribute("aria-label", `View ${item.title}`);

        const thumbnail = document.createElement("img");
        thumbnail.src = item.thumbnail;
        thumbnail.alt = "";
        thumbnail.loading = "lazy";
        card.append(thumbnail);
        card.addEventListener("click", () => openPersonalWork({
          ...item,
          images: Array.isArray(item.images) ? item.images : [],
        }));

        const nameplate = document.createElement("span");
        nameplate.className = "project-nameplate";
        nameplate.textContent = item.title;

        wrapper.append(card, nameplate);
        personalWorkGrid.append(wrapper);
      });
    })
    .catch(() => {
      personalWorkEmpty.textContent = "Open this page through the local site server to load the personal work catalog.";
    });
}
