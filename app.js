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

function saveLocation(locationValue) {
  sessionStorage.setItem("dragouilleLocation", locationValue);
}

function getLocation() {
  return sessionStorage.getItem("dragouilleLocation");
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
  const chosenLocation = getLocation();
  const title = document.getElementById("resultTitle");
  const text = document.getElementById("resultText");
  const answerBox = document.getElementById("resultAnswer");
  const dateBox = document.getElementById("resultDate");
  const locationBox = document.getElementById("resultLocation");

  if (!title || !text || !answerBox || !dateBox || !locationBox) {
    return;
  }

  if (answer === "oui") {
    title.textContent = "Tu as dit oui.";
    text.textContent = "J’aimerais vraiment t’emmener à un petit date, avec une ambiance douce et simple.";
    answerBox.textContent = "Oui";
    answerBox.style.color = "#d88fbf";
    dateBox.textContent = chosenDate ? formatDateForDisplay(chosenDate) : "Aucune date enregistrée";
    locationBox.textContent = chosenLocation ? chosenLocation : "Aucun lieu enregistré";
    return;
  }

  title.textContent = "Aucune réponse enregistrée.";
  text.textContent = "Retourne à la page de départ pour choisir oui ou non.";
  answerBox.textContent = "Aucune réponse";
  dateBox.textContent = chosenDate ? formatDateForDisplay(chosenDate) : "Aucune date enregistrée";
  locationBox.textContent = chosenLocation ? chosenLocation : "Aucun lieu enregistré";
}

function initDateForm() {
  const dateForm = document.getElementById("dateForm");
  const dateInput = document.getElementById("dateInput");

  if (!dateForm || !dateInput) {
    return;
  }

  dateInput.value = formatDateForInput();

  dateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!dateInput.value) {
      dateInput.reportValidity();
      return;
    }

    saveDate(dateInput.value);
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

function initChoiceButtons() {
  const buttons = document.querySelectorAll("[data-answer]");
  const noButton = document.querySelector('[data-answer="non"]');

  buttons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      if (button.dataset.answer === "non" && noButton) {
        event.preventDefault();

        const choices = noButton.closest(".choices");

        if (choices) {
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

          noButton.classList.add("is-moving");
          noButton.style.left = `${nextX}px`;
          noButton.style.top = `${nextY}px`;
          noButton.textContent = "Non ?";

          return;
        }

        return;
      }

      saveAnswer(button.dataset.answer);
      window.location.href = "step1.html";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initChoiceButtons();
  initDateForm();
  initLocationForm();
  renderResult();
});