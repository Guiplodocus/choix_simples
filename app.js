const ACCESS_KEY = "AccessGranted";
const ACCESS_PASSWORD = "doudou";
const APP_BOOT_KEY = "dragouilleBooted";
const NO_BUTTON_LABELS = [
  "Non ?",
  "Toujours pas :( ?",
  "Pas aujourd'hui ?",
  "Tu es sure ?",
  "je suis triste... :(",
  "On verra ?",
  "Peut-être plus tard ?",
  "Réfléchis encore ?",
  "bon bah...",
  ":((",
];
let noButtonLabelIndex = 0;

function saveAnswer(answer) {
  sessionStorage.setItem("dragouilleAnswer", answer);
}

function getAnswer() {
  return sessionStorage.getItem("dragouilleAnswer");
}

function saveDate(dateValue) {
  sessionStorage.setItem("dragouilleDate", dateValue);
}

function getDate() {
  return sessionStorage.getItem("dragouilleDate");
}

function saveTime(timeValue) {
  sessionStorage.setItem("dragouilleTime", timeValue);
}

function getTime() {
  return sessionStorage.getItem("dragouilleTime");
}

function saveLocation(locationValue) {
  sessionStorage.setItem("dragouilleLocation", locationValue);
}

function getLocation() {
  return sessionStorage.getItem("dragouilleLocation");
}
//call api
async function notifyAdmin(payload) {
  const isHttp = window.location.protocol === "http:" || window.location.protocol === "https:";

  if (!isHttp) {
    return false;
  }

  try {
    const response = await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error("Impossible d'envoyer le mail, faut que tu me dises par message oops.", error);
    return false;
  }
}

function clearLocalStorageOnFirstLaunch() {
  if (!isLandingPageRoute()) {
    return;
  }

  if (sessionStorage.getItem(APP_BOOT_KEY) === "true") {
    return;
  }

  localStorage.clear();
  sessionStorage.setItem(APP_BOOT_KEY, "true");
}

function isAccessGranted() {
  return localStorage.getItem(ACCESS_KEY) === "true";
}

function grantAccess() {
  localStorage.setItem(ACCESS_KEY, "true");
}

function getCurrentFileName() {
  const fileName = window.location.pathname.split("/").pop() || "";
  return fileName.toLowerCase();
}

function getNormalizedPath() {
  const path = (window.location.pathname || "/").toLowerCase();
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

function isLandingPageRoute() {
  const fileName = getCurrentFileName();
  const path = getNormalizedPath();

  return fileName === "index.html"
    || fileName === "index"
    || path === "/"
    || path.endsWith("/index")
    || path.endsWith("/index.html");
}

function getLandingRedirectUrl() {
  const isFileProtocol = window.location.protocol === "file:";
  return isFileProtocol ? "./index.html" : "/";
}

function ensureAccess() {
  const isIndexPage = isLandingPageRoute();

  if (!isAccessGranted()) {
    if (!isIndexPage) {
      window.location.replace(getLandingRedirectUrl());
    }

    return false;
  }

  return true;
}

function initPasswordForm() {
  const authGate = document.getElementById("authGate");
  const siteContent = document.getElementById("siteContent");
  const passwordForm = document.getElementById("passwordForm");
  const passwordInput = document.getElementById("passwordInput");
  const passwordHint = document.getElementById("passwordHint");

  if (!authGate || !siteContent || !passwordForm || !passwordInput || !passwordHint) {
    return;
  }

  const revealContent = () => {
    authGate.classList.add("is-hidden");
    siteContent.classList.remove("is-hidden");
  };

  if (isAccessGranted()) {
    revealContent();
    return;
  }

  siteContent.classList.add("is-hidden");

  passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (passwordInput.value.trim() !== ACCESS_PASSWORD) {
      passwordHint.textContent = "Mot de passe incorrect. Réessaie.";
      passwordInput.value = "";
      passwordInput.focus();
      return;
    }

    grantAccess();
    revealContent();
    passwordInput.value = "";
    passwordHint.textContent = "Accès autorisé.";
    initChoiceForm();
  });
}

function formatDateForDisplay(dateValue) {
  if (!dateValue) {
    return "";
  }

  const parsedDate = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(parsedDate);
}

function formatDateForInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function renderResult() {
  const answer = getAnswer();
  const chosenDate = getDate();
  const chosenTime = getTime();
  const chosenLocation = getLocation();
  const title = document.getElementById("resultTitle");
  const text = document.getElementById("resultText");
  const answerBox = document.getElementById("resultAnswer");
  const dateBox = document.getElementById("resultDate");
  const timeBox = document.getElementById("resultTime");
  const locationBox = document.getElementById("resultLocation");

  if (!title || !text || !answerBox || !dateBox || !timeBox || !locationBox) {
    return;
  }

  if (answer === "oui") {
    title.textContent = "Tu as dit oui!!";
    text.textContent = "Ptit résumé d'où on fait ça et quand :";
    answerBox.textContent = "Oui";
    answerBox.style.color = "#d88fbf";
    dateBox.textContent = chosenDate ? formatDateForDisplay(chosenDate) : "Aucune date enregistrée";
    timeBox.textContent = chosenTime ? chosenTime : "Aucune heure enregistrée";
    locationBox.textContent = chosenLocation ? chosenLocation : "Aucun lieu enregistré";
    return;
  }

  title.textContent = "Aucune réponse enregistrée.";
  text.textContent = "Retourne à la page de départ pour choisir oui ou non.";
  answerBox.textContent = "Aucune réponse";
  dateBox.textContent = chosenDate ? formatDateForDisplay(chosenDate) : "Aucune date enregistrée";
  timeBox.textContent = chosenTime ? chosenTime : "Aucune heure enregistrée";
  locationBox.textContent = chosenLocation ? chosenLocation : "Aucun lieu enregistré";
}

function initDateForm() {
  const dateForm = document.getElementById("dateForm");
  const dateInput = document.getElementById("dateInput");
  const timeInput = document.getElementById("timeInput");

  if (!dateForm || !dateInput || !timeInput) {
    return;
  }

  dateInput.value = formatDateForInput();
  timeInput.value = "19:00";

  dateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!dateInput.value || !timeInput.value) {
      dateInput.reportValidity();
      timeInput.reportValidity();
      return;
    }

    saveDate(dateInput.value);
    saveTime(timeInput.value);
    window.location.href = "step2.html";
  });
}

function initLocationForm() {
  const locationForm = document.getElementById("locationForm");
  const locationSelect = document.getElementById("locationSelect");
  const customLocationField = document.getElementById("customLocationField");
  const customLocationInput = document.getElementById("customLocationInput");

  if (!locationForm || !locationSelect || !customLocationField || !customLocationInput) {
    return;
  }

  const syncCustomLocationField = () => {
    const needsCustomLocation = locationSelect.value === "autre";
    customLocationField.classList.toggle("is-hidden", !needsCustomLocation);
    customLocationInput.required = needsCustomLocation;

    if (!needsCustomLocation) {
      customLocationInput.value = "";
    }
  };

  locationSelect.addEventListener("change", syncCustomLocationField);
  syncCustomLocationField();

  locationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!locationSelect.value) {
      locationSelect.reportValidity();
      return;
    }

    if (locationSelect.value === "autre" && !customLocationInput.value.trim()) {
      customLocationInput.reportValidity();
      return;
    }

    const resolvedLocation = locationSelect.value === "autre"
      ? customLocationInput.value.trim()
      : locationSelect.value;

    saveLocation(resolvedLocation);

    window.location.href = "result.html";
  });
}
//envoi mail
function initResultSubmitForm() {
  const resultSubmitForm = document.getElementById("resultSubmitForm");
  const resultSubmitStatus = document.getElementById("resultSubmitStatus");

  if (!resultSubmitForm || !resultSubmitStatus) {
    return;
  }

  resultSubmitForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    resultSubmitStatus.textContent = "Envoi en cours...";

    const sent = await notifyAdmin({
      answer: getAnswer() || "",
      date: getDate() || "",
      time: getTime() || "",
      location: getLocation() || "",
      submittedAt: new Date().toISOString(),
    });

    resultSubmitStatus.textContent = sent
      ? "C'est envoyé ! (faut que je regarde mes mails pour voir ça oops)"
      : "L'envoi est pas parti (faut que tu me dises par message oops)";
  });
}
// gérer le mouvement et text du non
function moveNoButton(noButton) {
  if (noButton.dataset.moveLock === "true") {
    return;
  }

  const choices = noButton.closest(".choices");

  if (!choices) {
    return;
  }

  const choicesRect = choices.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const maxX = Math.max(32, choicesRect.width - buttonRect.width - 24);
  const maxY = Math.max(32, Math.max(180, choicesRect.height) - buttonRect.height - 24);
  const currentLeft = noButton.offsetLeft;
  const currentTop = noButton.offsetTop;
  let nextX = currentLeft;
  let nextY = currentTop;
  let attempts = 0;

  while (attempts < 12 && Math.abs(nextX - currentLeft) < 80 && Math.abs(nextY - currentTop) < 32) {
    nextX = Math.floor(Math.random() * maxX) + 12;
    nextY = Math.floor(Math.random() * maxY) + 12;
    attempts += 1;
  }

  const durationMs = Math.floor(Math.random() * 230) + 320;
  const tiltDeg = Math.floor(Math.random() * 25) - 12;
  const scale = (Math.random() * 0.09 + 1.02).toFixed(2);
  const nextLabel = NO_BUTTON_LABELS[noButtonLabelIndex % NO_BUTTON_LABELS.length];
  noButtonLabelIndex += 1;

  noButton.classList.add("is-moving");
  noButton.dataset.moveLock = "true";
  noButton.style.setProperty("--move-duration", `${durationMs}ms`);
  noButton.style.setProperty("--move-tilt", `${tiltDeg}deg`);
  noButton.style.setProperty("--move-scale", scale);
  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
  noButton.textContent = nextLabel;

  window.setTimeout(() => {
    noButton.dataset.moveLock = "false";
  }, durationMs + 40);
}

// Initialisation des événements et rendu
function initChoiceForm() {
  const choiceForm = document.getElementById("choiceForm");
  const noButton = document.querySelector('[data-answer="non"]');

  if (!choiceForm) {
    return;
  }

  if (noButton) {
    noButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      moveNoButton(noButton);
    });
  }

  choiceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const clickedButton = event.submitter;
    const answer = clickedButton?.value || "";

    if (answer === "non") {
      if (noButton) {
        moveNoButton(noButton);
      }
      return;
    }

    if (answer === "oui") {
      saveAnswer("oui");
      window.location.href = "step1.html";
    }
  });
}
// Note: le code de notifyAdmin est dans api/notify.js, mais il est utilisé ici pour envoyer les données au serveur lorsque l'utilisateur soumet le formulaire final.
document.addEventListener("DOMContentLoaded", () => {
  clearLocalStorageOnFirstLaunch();

  const isIndexPage = isLandingPageRoute();
  const isAllowed = ensureAccess();

  if (!isAllowed) {
    if (isIndexPage) {
      initPasswordForm();
    }

    return;
  }

  initPasswordForm();
  initChoiceForm();
  initDateForm();
  initLocationForm();
  initResultSubmitForm();
  renderResult();
});