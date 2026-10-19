const photoGrid = document.querySelector("#photo-grid");
const emptyMessage = document.querySelector("#photo-empty");
const photoViewer = document.querySelector("#photo-viewer");
const viewerImage = document.querySelector("#photo-viewer-image");
const viewerTitle = document.querySelector("#photo-viewer-title");
const viewerCount = document.querySelector("#photo-viewer-count");
const filmstrip = document.querySelector("#photo-filmstrip");
const previousButton = document.querySelector("#photo-prev");
const nextButton = document.querySelector("#photo-next");
const closeButton = document.querySelector("#photo-close");

const photoDirectory = "photos/gallery/images/";
let photos = [];
let activeIndex = 0;

function photoPath(file) {
  return `${photoDirectory}${encodeURIComponent(file)}`;
}

function createFilmstrip() {
  filmstrip.replaceChildren();

  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.className = "photo-filmstrip-button";
    button.type = "button";
    button.setAttribute("aria-label", `Show ${photo.title || `photo ${index + 1}`}`);

    const image = document.createElement("img");
    image.src = photoPath(photo.file);
    image.alt = "";
    image.loading = "lazy";
    button.append(image);
    button.addEventListener("click", () => showPhoto(index));
    filmstrip.append(button);
  });
}

function renderGallery() {
  photoGrid.replaceChildren();
  emptyMessage.hidden = photos.length > 0;

  photos.forEach((photo, index) => {
    const item = document.createElement("article");
    item.className = "photo-item";
    item.style.animationDelay = `${Math.min(index * 65, 780)}ms`;

    const button = document.createElement("button");
    button.className = "photo-card";
    button.type = "button";
    button.setAttribute("aria-label", `Open photo ${index + 1}`);

    const image = document.createElement("img");
    image.src = photoPath(photo.file);
    image.alt = photo.alt || photo.title || "";
    image.loading = "lazy";
    image.decoding = "async";
    button.append(image);
    button.addEventListener("click", () => {
      showPhoto(index);
      photoViewer.showModal();
    });

    item.append(button);
    photoGrid.append(item);
  });

  createFilmstrip();
}

function showPhoto(index) {
  if (!photos.length) return;
  activeIndex = (index + photos.length) % photos.length;
  const photo = photos[activeIndex];
  const title = photo.title || `Photo ${activeIndex + 1}`;

  viewerImage.src = photoPath(photo.file);
  viewerImage.alt = photo.alt || title;
  viewerTitle.textContent = title;
  viewerCount.textContent = `${activeIndex + 1} / ${photos.length}`;
  previousButton.disabled = photos.length < 2;
  nextButton.disabled = photos.length < 2;

  [...filmstrip.children].forEach((button, index) => {
    if (index === activeIndex) {
      button.setAttribute("aria-current", "true");
      button.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function closeViewer() {
  if (photoViewer.open) photoViewer.close();
}

previousButton.addEventListener("click", () => showPhoto(activeIndex - 1));
nextButton.addEventListener("click", () => showPhoto(activeIndex + 1));
closeButton.addEventListener("click", closeViewer);

photoViewer.addEventListener("click", (event) => {
  if (event.target === photoViewer) closeViewer();
});

photoViewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPhoto(activeIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(activeIndex + 1);
  }
});

photoViewer.addEventListener("close", () => {
  viewerImage.removeAttribute("src");
});

async function loadPhotos() {
  try {
    const response = await fetch("photos/gallery/photos.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("The photo list could not be loaded.");
    const data = await response.json();
    photos = Array.isArray(data)
      ? data.filter((photo) => photo && typeof photo.file === "string" && photo.file.trim())
      : [];
    renderGallery();
  } catch {
    emptyMessage.textContent = "The photo list could not be loaded. Open this page through the local site server, or check that photos/gallery/photos.json is available.";
  }
}

loadPhotos();
