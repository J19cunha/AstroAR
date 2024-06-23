// Defina isAnimating no topo do seu script para garantir que ele tenha um escopo global dentro deste arquivo
var isAnimating = false;
var markerLostTimeout;

function loadOnboarding() {
  fetch("public/pages/onBoarding-Fasesdalua.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("onboarding-container").innerHTML = data;
    });
}

function nextOnboarding() {
  const overlays = document.querySelectorAll(".onboarding-overlay");
  let currentIndex = 0;

  overlays.forEach((overlay, index) => {
    if (overlay.style.visibility === "visible") {
      currentIndex = index;
    }
  });

  if (currentIndex < overlays.length - 1) {
    overlays[currentIndex].style.visibility = "hidden";
    overlays[currentIndex + 1].style.visibility = "visible";
  }
}

function resetOnboarding() {
  const overlays = document.querySelectorAll(".onboarding-overlay");

  // Set all overlays to hidden except the first one
  overlays.forEach((overlay, index) => {
    overlay.style.visibility = index === 0 ? "visible" : "hidden";
  });
}

function closeOnboarding() {
  document.getElementById("onboarding-container").style.display = "none";
  resetOnboarding();
}

function previousOnboarding() {
  const overlays = document.querySelectorAll(".onboarding-overlay");
  let currentIndex = 0;

  overlays.forEach((overlay, index) => {
    if (overlay.style.visibility === "visible") {
      currentIndex = index;
    }
  });

  if (currentIndex > 0) {
    overlays[currentIndex].style.visibility = "hidden";
    overlays[currentIndex - 1].style.visibility = "visible";
  }
}

AFRAME.registerComponent("marker-handler", {
  init: function () {
    const startButton = document.getElementById("start-animation"); // Obtenha o botão pelo ID
    var icon = startButton.querySelector("i"); // Seleciona o ícone dentro do botão
    const markerLostDelay = 1000;

    this.el.addEventListener("markerFound", () => {
      clearTimeout(markerLostTimeout); // Cancela o temporizador se o marcador for encontrado novamente
      startButton.disabled = false; // Reativa o botão
    });

    this.el.addEventListener("markerLost", () => {
      markerLostTimeout = setTimeout(() => {
        var animatedEntities = document.querySelectorAll(
          "[rotate-continuously]"
        );
        animatedEntities.forEach(function (entity) {
          entity.setAttribute("rotate-continuously", { active: false }); // Alterna o estado da animação
        });
        startButton.disabled = true; // Desativa o botão
        icon.className = "fa-solid fa-play";
        isAnimating = false; // Atualize o estado aqui
      }, markerLostDelay);
    });
  },
});

AFRAME.registerComponent("rotate-continuously", {
  schema: {
    speed: { type: "number", default: 36 }, // Velocidade de rotação em graus por segundo (360 graus em 10 segundos)
    active: { type: "boolean", default: false }, // Adiciona um novo dado para controle de atividade
    // Acrescentamos um identificador para diferenciar entre Terra e Lua
    body: { type: "string", default: "" }, // 'earth' para Terra, 'moon' para Lua
  },
  tick: function (time, timeDelta) {
    if (this.data.active === false) {
      return; // Se a animação não estiver ativa, não faz nada
    } else {
      // updateMoonBrightness();
      var rotationIncrement = this.data.speed * (timeDelta / 1000);
      this.el.object3D.rotation.y +=
        THREE.MathUtils.degToRad(rotationIncrement);
    }
  },
});

let currentDay = 0;
const fasesDaLua = [
  "Lua Nova", // Dia 0
  "Lua Crescente...",
  "Quarto Crescente", // Dia 7
  "Lua Crescente...",
  "Lua Cheia", // Dia 14
  "Lua Minguante...",
  "Quarto Minguante", // Dia 21
  "Lua Minguante...",
];

// Supondo que temos 236 imagens para as fases da lua
const totalImages = 236;
let imagesLoaded = 0;
let currentImageIndex = 0;

let images = [];

function preloadImages() {
  for (let i = 1; i <= totalImages; i++) {
    const img = new Image();
    img.onload = function () {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        // Aqui você pode habilitar o botão de início ou fazer outra ação que dependa do carregamento completo
        console.log("Todas as imagens foram carregadas");
      }
    };
    img.src = `./assets/images/moonphases/moon.${i} Small Small.png`;
    images.push(img);
  }
}

function animateMoonPhase() {
  requestAnimationFrame(animateMoonPhase); // Solicitar ao navegador que chame animateMoonPhase antes da próxima repaint
  updateMoonImage(); // Atualizar a imagem da lua com base na rotação do modelo 3D
}

function updateMoonImage() {
  const rotation = getMoonRotation();

  // Normalizar a rotação para um intervalo de [0, 1], lidando com valores negativos
  const normalizedRotation =
    (((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) /
    (2 * Math.PI);
  const currentImageIndex = Math.floor(normalizedRotation * totalImages);

  const moonImageElement = document.getElementById("moon-phase-image-bright");
  const moonPhaseTextElement = document.getElementById("moonphases-space");

  if (moonImageElement) {
    moonImageElement.src = images[currentImageIndex].src;
  }

  if (moonPhaseTextElement) {
    const phaseIndex = getMoonPhaseIndex(currentDay);
    moonPhaseTextElement.textContent = fasesDaLua[phaseIndex];
  }
}

function getMoonPhaseIndex(currentDay) {
  if (currentDay === 0) {
    document.getElementById("moonphases-title").hidden = false;
    return 0; // Lua Nova
  } else if (currentDay > 0 && currentDay < 7) {
    document.getElementById("moonphases-title").hidden = true;
    return 1; // Lua Crescente
  } else if (currentDay === 7) {
    document.getElementById("moonphases-title").hidden = false;
    return 2; // Quarto Crescente
  } else if (currentDay > 7 && currentDay < 14) {
    document.getElementById("moonphases-title").hidden = true;
    return 3; // Lua crescente
  } else if (currentDay === 14) {
    document.getElementById("moonphases-title").hidden = false;
    return 4; // Lua Cheia
  } else if (currentDay > 14 && currentDay < 21) {
    document.getElementById("moonphases-title").hidden = true;
    return 5; // Lua Minguante
  } else if (currentDay === 21) {
    document.getElementById("moonphases-title").hidden = false;
    return 6; // Quarto Minguante
  } else {
    document.getElementById("moonphases-title").hidden = true;
    return 7; // Lua Minguante
  }
}

function getMoonRotation() {
  const moonModel = document.getElementById("moon-rotate");
  const rotation = moonModel.object3D.rotation.y;
  return rotation;
}

let accumulatedRotation = 0; // Armazena a rotação total acumulada
const twoPi = 2 * Math.PI; // Constante para 2π, uma volta completa
let manualUpdate = false;

function updateDay(day) {
  manualUpdate = true; // Definindo manualUpdate como true durante a atualização manual do dia
  currentDay += day;
  if (currentDay > 27) {
    currentDay = 0;
  } else if (currentDay < 0) {
    currentDay = 27;
  }
  updateEarthAndMoonRotation(currentDay);
  document.getElementById("current-day").innerText = `${currentDay} / 27 dias`;
}

function updateEarthAndMoonRotation(increment) {
  const earthRotation = increment * 360;
  const moonRotation = increment * (360 / 28);

  const earth = document.getElementById("earthModel");
  const moon = document.getElementById("moon-rotate");
  const moonPase = document.getElementById("moon-rotate");

  if (earth && moon) {
    earth.object3D.rotation.y = THREE.MathUtils.degToRad(earthRotation);
    moon.object3D.rotation.y = THREE.MathUtils.degToRad(moonRotation);
    moonPase.object3D.rotation.y = THREE.MathUtils.degToRad(moonRotation);
    accumulatedRotation = earth.object3D.rotation.y;
  }
}

document.getElementById("increment-day").addEventListener("click", function () {
  updateDay(1);
});
document.getElementById("decrement-day").addEventListener("click", function () {
  updateDay(-1);
});

document
  .getElementById("onBoarding-btn")
  .addEventListener("click", function () {
    document.getElementById("onboarding-container").style.display = "block";
  });

function updateDayBasedOnEarthRotation() {
  requestAnimationFrame(updateDayBasedOnEarthRotation);
  updateDayBasedOnMoonRotation();
}

function updateDayBasedOnMoonRotation() {
  const moonRotation = getMoonRotation(); // Obtém a rotação da Lua
  const totalRotation = 2 * Math.PI; // Rotação completa (uma órbita completa da lua)

  // Normaliza a rotação para um valor entre 0 e 1
  let normalizedRotation =
    ((moonRotation % totalRotation) + totalRotation) % totalRotation; //  Normaliza a rotação para um valor entre 0 e totalRotation para garantir que esteja dentro do intervalo correto.
  let day = Math.floor((normalizedRotation / totalRotation) * 28); // Calcula o dia atual com base na rotação normalizada da lua. Como a órbita da lua é dividida em 28 partes, multiplicamos normalizedRotation por 28 para obter o dia correspondente.

  // Atualiza currentDay apenas se o dia mudou
  if (day !== currentDay) {
    currentDay = day; // Atualiza a variável currentDay com o novo valor do dia.
    document.getElementById(
      "current-day"
    ).innerText = `${currentDay} / 27 dias`;
  }
  updateProgressBar(); // Atualiza a barra de progresso com base no dia atual
}

function updateProgressBar() {
  const timelines = document.querySelectorAll(".timeline");

  for (let i = 0; i < timelines.length; i++) {
    const timeline = timelines[i];
    const progressBar = timeline.querySelector(".filling-line");
    const timelineMarker = timeline.querySelector(".timeline-marker");

    // Defina o intervalo de dias para cada semana
    const startDay = i * 7; // 0, 7, 14, 21
    const endDay = (i + 1) * 7; // 7, 14, 21, 28

    // Calcula o progresso dentro do intervalo da semana
    let progress = 0;
    if (currentDay >= startDay && currentDay <= endDay) {
      progress = ((currentDay - startDay) / 7) * 100;
    } else if (currentDay > endDay) {
      progress = 100;
    }

    // Ajusta a largura da filling-line com base no progresso calculado
    progressBar.style.width = `${progress}%`;

    // Atualiza as classes dos marcadores de timeline
    if (currentDay >= startDay && currentDay < endDay) {
      timelineMarker.classList.add("selected");
      timelineMarker.classList.remove("older-event");
    } else if (currentDay >= endDay) {
      timelineMarker.classList.add("older-event");
      timelineMarker.classList.remove("selected");
    } else {
      timelineMarker.classList.remove("selected");
      timelineMarker.classList.remove("older-event");
    }
  }

  // Adiciona a classe .older-event ao marcador anterior
  const previousTimelineIndex = Math.floor((currentDay - 1) / 7);
  const previousTimeline = timelines[previousTimelineIndex];
  if (previousTimeline) {
    const previousTimelineMarker =
      previousTimeline.querySelector(".timeline-marker");
    previousTimelineMarker.classList.add("older-event");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadOnboarding();
  requestAnimationFrame(updateDayBasedOnEarthRotation);
  preloadImages(); // Chame preloadImages aqui para garantir que o DOM esteja pronto.
  requestAnimationFrame(animateMoonPhase);

  updateProgressBar(); // Atualiza a barra de progresso inicialmente

  document.getElementById("Tempo").style.display = "block";

  document
    .querySelector(".moonphases-button")
    .addEventListener("click", function () {
      document.querySelector(".div-com-fundo").classList.toggle("reduced");
    });

  // Este é o novo botão de alternância
  var toggleButton = document.getElementById("start-animation");

  var icon = toggleButton.querySelector("i"); // Seleciona o ícone dentro do botão

  toggleButton.addEventListener("click", function () {
    var animatedEntities = document.querySelectorAll("[rotate-continuously]");
    isAnimating = !isAnimating; // Inverte o estado da animação

    animatedEntities.forEach(function (entity) {
      entity.setAttribute("rotate-continuously", { active: isAnimating }); // Alterna o estado da animação
    });

    // Altera a classe do ícone conforme o estado da animação
    if (isAnimating) {
      icon.className = "fa-solid fa-pause";
      icon.style.color = "#ffffff";
    } else {
      icon.className = "fa-solid fa-play";
      icon.style.color = "#ffffff";
    }
  });
});
