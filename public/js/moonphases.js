$(document).dblclick(function (e) {
  e.preventDefault();
});

var markerLostTimeout;
AFRAME.registerComponent("marker-handler", {
  init: function () {
    const startButton = document.getElementById("start-animation"); // Obtenha o botão pelo ID
    var icon = startButton.querySelector("i"); // Seleciona o ícone dentro do botão
    const incrementDayButton = document.getElementById("increment-day");
    const decrementDayButton = document.getElementById("decrement-day");

    const markerLostDelay = 1000;

    this.el.addEventListener("markerFound", () => {
      //
      clearTimeout(markerLostTimeout); // Cancela o temporizador se o marcador for encontrado novamente

      //
      startButton.disabled = false; // Reativa o botão
      incrementDayButton.disabled = false;
      decrementDayButton.disabled = false;
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
        incrementDayButton.disabled = true;
        decrementDayButton.disabled = true;
        icon.className = "fa-solid fa-play";
        isAnimating = false; // Atualize o estado aqui
      }, markerLostDelay);
    });
  },
});

AFRAME.registerComponent("rotate-continuously", {
  schema: {
    speed: { type: "number", default: 36 }, // Velocidade de rotação em graus por segundo (360 graus em 10 segundos)
    active: { type: "boolean", default: false }, // Controla o estado da animação
  },
  tick: function (time, timeDelta) {
    if (this.data.active === false) {
      return; // Se a animação não estiver ativa, não faz nada
    } else {
      var rotationIncrement = this.data.speed * (timeDelta / 1000);
      this.el.object3D.rotation.y +=
        THREE.MathUtils.degToRad(rotationIncrement);
    }
  },
});

let currentDay = 0;

const totalImages = 236; // 236 imagens das fases da lua
let imagesLoaded = 0;
let images = [];

function preloadImages() {
  for (let i = 1; i <= totalImages; i++) {
    const img = new Image();
    img.onload = () => imagesLoaded++;
    img.src = `./assets/images/moonphases/moon.${i}.png`;
    images.push(img);
  }
}

let currentImageIndex = 0;
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
function animateMoonScreen() {
  // Chama a função novamente na próximo frame
  requestAnimationFrame(animateMoonScreen);

  // Obter a rotação da Lua
  const moonRotation = getMoonRotation();
  // Normalizar a rotação para um intervalo de [0, 1], lidando com valores negativos
  const normalizedRotation =
    (((moonRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) /
    (2 * Math.PI);
  // Calcular o índice da imagem atual com base na rotação normalizada
  const currentImageIndex = Math.floor(normalizedRotation * totalImages);

  const moonImageElement = document.getElementById("moon-phase-image-bright");
  const moonPhaseTextElement = document.getElementById("moonphases-space");
  // Atualiza a imagem da fase da lua
  if (moonImageElement) {
    moonImageElement.src = images[currentImageIndex].src;
  }
  // Atualiza o texto da fase da lua
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
    return 1; // Lua Crescente...
  } else if (currentDay === 7) {
    document.getElementById("moonphases-title").hidden = false;
    return 2; // Quarto Crescente
  } else if (currentDay > 7 && currentDay < 14) {
    document.getElementById("moonphases-title").hidden = true;
    return 3; // Lua crescente...
  } else if (currentDay === 14) {
    document.getElementById("moonphases-title").hidden = false;
    return 4; // Lua Cheia
  } else if (currentDay > 14 && currentDay < 21) {
    document.getElementById("moonphases-title").hidden = true;
    return 5; // Lua Minguante...
  } else if (currentDay === 21) {
    document.getElementById("moonphases-title").hidden = false;
    return 6; // Quarto Minguante
  } else {
    document.getElementById("moonphases-title").hidden = true;
    return 7; // Lua Minguante...
  }
}

function getMoonRotation() {
  const moonModel = document.getElementById("moon-rotate");
  const rotation = moonModel.object3D.rotation.y;
  return rotation;
}

function updateEarthAndMoonRotation(increment) {
  // Atualiza o valor de increment para ser a soma do dia atual e do incremento passado como argumento (1 ou -1)
  increment = currentDay + increment;

  // Calcula a rotação da Terra e da Lua com base no incremento
  const earthRotation = increment * 360;
  const moonRotation = increment * (360 / 28);

  const earth = document.getElementById("earthModel");
  const moon = document.getElementById("moon-rotate");

  // Atualiza a rotação da Terra e da Lua
  if (earth && moon) {
    earth.object3D.rotation.y = THREE.MathUtils.degToRad(earthRotation);
    moon.object3D.rotation.y = THREE.MathUtils.degToRad(moonRotation);
  }
}

document.getElementById("increment-day").addEventListener("click", function () {
  updateEarthAndMoonRotation(1);
});
document.getElementById("decrement-day").addEventListener("click", function () {
  updateEarthAndMoonRotation(-1);
});

function updateDayBasedOnCurrentRotation() {
  // Chama a função novamente na próximo frame de animação de forma a manter uma atualização contínua
  requestAnimationFrame(updateDayBasedOnCurrentRotation);

  // Obtém a rotação da Lua
  const moonRotation = getMoonRotation();

  // Uma Rotação completa (uma órbita completa da lua: 360º = 2π radianos)
  const totalRotation = 2 * Math.PI;
  // Normaliza a rotação para garantir que esteja entre 0 e 2π radianos
  let normalizedRotation =
    ((moonRotation % totalRotation) + totalRotation) % totalRotation;
  // Calcula o dia atual com base na rotação normalizada
  let day = Math.floor((normalizedRotation / totalRotation) * 28);
  // Verifica se o dia calculado é diferente do dia atualmente armazenado, ou seja, se houve uma mudança de dia
  if (day !== currentDay) {
    currentDay = day; // Atualiza a variável currentDay com o novo valor do dia.

    // Atualiza o elemento html do dia atual
    document.getElementById(
      "current-day"
    ).innerText = `${currentDay} / 27 dias`;
  }
  updateProgressBar(); // Atualiza a barra de progresso com base no dia atual
}

function updateProgressBar() {
  const timelines = document.querySelectorAll(".timeline");
  const totalDays = timelines.length * 7;

  timelines.forEach((timeline, i) => {
    const progressBar = timeline.querySelector(".filling-line");
    const timelineMarker = timeline.querySelector(".timeline-marker");

    const startDay = i * 7;
    const endDay = (i + 1) * 7;

    let progress = 0;
    if (currentDay >= startDay) {
      progress =
        currentDay < endDay ? ((currentDay - startDay) / 7) * 100 : 100;
    }

    progressBar.style.width = `${progress}%`;
    timelineMarker.classList.toggle(
      "selected",
      currentDay >= startDay && currentDay < endDay
    );
    timelineMarker.classList.toggle("older-event", currentDay >= endDay);
  });
}

//onBoarding functions

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

document
  .getElementById("onBoarding-btn")
  .addEventListener("click", function () {
    console.log("Onboarding button clicked");
    document.getElementById("onboarding-container").style.display = "block";
  });

// Defina isAnimating no topo do seu script para garantir que ele tenha um escopo global dentro deste arquivo
var isAnimating = false;
document.addEventListener("DOMContentLoaded", function () {
  requestAnimationFrame(updateDayBasedOnCurrentRotation);
  preloadImages(); // Chame preloadImages aqui para garantir que o DOM esteja pronto.
  requestAnimationFrame(animateMoonScreen);

  updateProgressBar(); // Atualiza a barra de progresso inicialmente

  document
    .querySelector(".moonphases-button")
    .addEventListener("click", function () {
      document.querySelector(".div-com-fundo").classList.toggle("reduced");
    });

  // Este é o novo botão de alternância
  var toggleButton = document.getElementById("start-animation");
  var icon = toggleButton.querySelector("i"); // Seleciona o ícone dentro do botão

  toggleButton.addEventListener("click", function () {
    const animatedEntities = document.querySelectorAll("[rotate-continuously]");
    isAnimating = !isAnimating; // Inverte o estado da animação

    animatedEntities.forEach(function (entity) {
      entity.setAttribute("rotate-continuously", { active: isAnimating }); // Alterna o estado da animação
    });

    icon.className = isAnimating ? "fa-solid fa-pause" : "fa-solid fa-play";
    icon.style.color = "#ffffff"; // Consider setting a class for consistent styling
  });
});

