// Defina isAnimating no topo do seu script para garantir que ele tenha um escopo global dentro deste arquivo
var isAnimating = false;
var markerLostTimeout;

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
// function getMoonPhaseIndex(normalizedRotation) {
//   const threshold = 0.01; // Small threshold to account for floating-point precision errors

//   if (Math.abs(normalizedRotation - 0) < threshold) {
//     document.getElementById("moonphases-title").hidden = false;
//     return 0; // Lua Nova
//   } else if (normalizedRotation > 0 && normalizedRotation < 0.25 - threshold) {
//     document.getElementById("moonphases-title").hidden = true;
//     return 1; // Lua Crescente
//   } else if (Math.abs(normalizedRotation - 0.25) < threshold) {
//     document.getElementById("moonphases-title").hidden = false;
//     return 2; // Quarto Crescente
//   } else if (
//     normalizedRotation > 0.25 + threshold &&
//     normalizedRotation < 0.5 - threshold
//   ) {
//     document.getElementById("moonphases-title").hidden = true;
//     return 3; // Lua Cheia
//   } else if (Math.abs(normalizedRotation - 0.5) < threshold) {
//     document.getElementById("moonphases-title").hidden = false;
//     return 4; // Lua Cheia
//   } else if (
//     normalizedRotation > 0.5 + threshold &&
//     normalizedRotation < 0.75 - threshold
//   ) {
//     document.getElementById("moonphases-title").hidden = true;
//     return 5; // Lua Minguante
//   } else if (Math.abs(normalizedRotation - 0.75) < threshold) {
//     document.getElementById("moonphases-title").hidden = false;
//     return 6; // Quarto Minguante
//   } else {
//     document.getElementById("moonphases-title").hidden = true;
//     return 7; // Lua Minguante
//   }
// }

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

function togglePlayPause() {
  var btn = document.getElementById("play-pause-button");
  if (btn.textContent === "▶️") {
    // Se o botão mostrar o ícone de play
    btn.textContent = "⏸"; // Muda para o ícone de pause
    // Inicie a animação ou mídia aqui
  } else {
    // Se o botão mostrar o ícone de pause
    btn.textContent = "▶️"; // Muda para o ícone de play
    // Pausa a animação ou mídia aqui
  }
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
  document.getElementById("current-day").innerText = `Dia ${currentDay}`;
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

function updateDayBasedOnEarthRotation() {
  const earthModel = document.getElementById("earthModel").object3D;
  const currentRotationY = earthModel.rotation.y;

  let rotationDelta = currentRotationY - accumulatedRotation;

  if (rotationDelta >= twoPi || rotationDelta <= -twoPi) {
    rotationDelta %= twoPi; // Ajuste para o delta dentro do intervalo de -2π a 2π

    if (!manualUpdate) {
      if (rotationDelta > 0) {
        currentDay++;
      } else {
        currentDay--;
      }

      if (currentDay > 27) {
        currentDay = 0;
      } else if (currentDay < 0) {
        currentDay = 27;
      }
      document.getElementById("current-day").innerText = `Dia ${currentDay}`;
    } else {
      manualUpdate = false; // Reset manualUpdate after handling it
    }
    accumulatedRotation = currentRotationY;
  }
  requestAnimationFrame(updateDayBasedOnEarthRotation);
}

document.addEventListener("DOMContentLoaded", function () {
  requestAnimationFrame(updateDayBasedOnEarthRotation);

  document.getElementById("Tempo").style.display = "block";

  document
    .querySelector(".moonphases-button")
    .addEventListener("click", function () {
      document.querySelector(".div-com-fundo").classList.toggle("reduced");
    });

  preloadImages(); // Chame preloadImages aqui para garantir que o DOM esteja pronto.
  requestAnimationFrame(animateMoonPhase);

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

  var dynamicBar = document.getElementById("draggableModal");
  var header = document.getElementById("header");

  var initialY;
  var dragging = false;

  // Função genérica para iniciar o arrasto
  function startDrag(e) {
    initialY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    dragging = true;
  }

  // Função genérica para o movimento de arrasto
  function onDrag(e) {
    if (!dragging) return;
    var currentY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    var deltaY = currentY - initialY;

    if (deltaY < 0) {
      header.classList.add("expanded");
    } else {
      header.classList.remove("expanded");
    }
  }

  // Função para terminar o arrasto
  function endDrag() {
    dragging = false;
  }

  // Eventos de mouse
  dynamicBar.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", endDrag);

  // Eventos de toque
  dynamicBar.addEventListener("touchstart", startDrag);
  window.addEventListener("touchmove", onDrag);
  window.addEventListener("touchend", endDrag);
});
