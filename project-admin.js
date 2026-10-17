const adminDialog = document.querySelector("#project-admin");
const adminTrigger = document.querySelector("#project-admin-trigger");
const adminClose = document.querySelector("#admin-close");
const loginStep = document.querySelector("#login-step");
const uploadStep = document.querySelector("#upload-step");
const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#admin-password");
const passwordError = document.querySelector("#password-error");
const projectUploadForm = document.querySelector("#project-upload-form");
const uploadMessage = document.querySelector("#upload-message");
const projectGrid = document.querySelector(".project-grid");
const projectPassword = "kmei6";

function insertProject(project, index, newestFirst = false) {
  const item = document.createElement("div");
  item.className = "project-item";
  item.style.animationDelay = `${Math.min(index * 70, 800)}ms`;

  const link = document.createElement("a");
  link.className = "project-card";
  link.href = project.presentation;
  link.dataset.title = project.name;
  link.setAttribute("aria-label", `Open ${project.name} presentation`);

  const image = document.createElement("img");
  image.src = project.thumbnail;
  image.alt = "";
  link.append(image);

  const label = document.createElement("span");
  label.className = "project-nameplate";
  label.textContent = project.name;

  item.append(link, label);
  if (newestFirst) projectGrid.prepend(item);
  else projectGrid.append(item);
}

async function loadSavedProjects() {
  if (window.location.protocol === "file:") return;
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) return;
    const projects = await response.json();
    projects.forEach((project, index) => insertProject(project, projects.length - index - 1, true));
  } catch {
    // The page can still show its built-in projects when the upload server is unavailable.
  }
}

adminTrigger.addEventListener("click", () => {
  adminDialog.showModal();
  passwordInput.focus();
});

adminClose.addEventListener("click", () => adminDialog.close());

adminDialog.addEventListener("click", (event) => {
  if (event.target === adminDialog) adminDialog.close();
});

adminDialog.addEventListener("close", () => {
  passwordForm.reset();
  projectUploadForm.reset();
  passwordError.textContent = "";
  uploadMessage.textContent = "Files will be saved in the project folders.";
  loginStep.hidden = false;
  uploadStep.hidden = true;
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value !== projectPassword) {
    passwordError.textContent = "hahahahah this isnt your site";
    passwordInput.select();
    return;
  }

  passwordError.textContent = "";
  loginStep.hidden = true;
  uploadStep.hidden = false;
  uploadStep.querySelector("input[name='name']").focus();
});

projectUploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (window.location.protocol === "file:") {
    uploadMessage.textContent = "To save files into the site folders, double-click start-site.command and open http://127.0.0.1:8000/projects.html.";
    return;
  }

  uploadMessage.textContent = "Saving your project…";
  const submitButton = projectUploadForm.querySelector("button[type='submit']");
  submitButton.disabled = true;

  try {
    const uploadData = new FormData(projectUploadForm);
    uploadData.set("password", projectPassword);
    const response = await fetch("/api/projects", {
      method: "POST",
      body: uploadData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The project could not be saved.");

    insertProject(result.project, 0, true);
    projectUploadForm.reset();
    uploadMessage.textContent = `Added “${result.project.name}” to the Projects page.`;
  } catch (error) {
    uploadMessage.textContent = error.message || "The project could not be saved. Check that the local site server is running.";
  } finally {
    submitButton.disabled = false;
  }
});

loadSavedProjects();
