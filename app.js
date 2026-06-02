function saveAnswer(answer) {
  sessionStorage.setItem("dragouilleAnswer", answer);
}

function getAnswer() {
  return sessionStorage.getItem("dragouilleAnswer");
}

function renderResult() {
  const answer = getAnswer();
  const title = document.getElementById("resultTitle");
  const text = document.getElementById("resultText");
  const answerBox = document.getElementById("resultAnswer");

  if (!title || !text || !answerBox) {
    return;
  }

  if (answer === "oui") {
    title.textContent = "Tu as dit oui.";
    text.textContent = "J’aimerais vraiment t’emmener à un petit date, avec une ambiance douce et simple.";
    answerBox.textContent = "Oui";
    answerBox.style.color = "#d88fbf";
    return;
  }

  if (answer === "non") {
    title.textContent = "Tu as dit non.";
    text.textContent = "Aucun souci, je voulais juste te proposer quelque chose de sincère et gentil.";
    answerBox.textContent = "Non";
    answerBox.style.color = "#8d749a";
    return;
  }

  title.textContent = "Aucune réponse enregistrée.";
  text.textContent = "Retourne à la page de départ pour choisir oui ou non.";
  answerBox.textContent = "Aucune réponse";
}

function initChoiceButtons() {
  const buttons = document.querySelectorAll("[data-answer]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      saveAnswer(button.dataset.answer);
      window.location.href = "step.html";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initChoiceButtons();
  renderResult();
});