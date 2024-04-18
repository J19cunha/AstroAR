// Defina isAnimating no topo do seu script para garantir que ele tenha um escopo global dentro deste arquivo
var isAnimating = false;

AFRAME.registerComponent("marker-handler", {
  init: function () {
    const startButton = document.getElementById("start-animation"); // Obtenha o botão pelo ID
    var icon = startButton.querySelector("i"); // Seleciona o ícone dentro do botão

    this.el.addEventListener("markerFound", () => {
      startButton.disabled = false; // Reativa o botão
    });

    this.el.addEventListener("markerLost", () => {
      var animatedEntities = document.querySelectorAll("[rotate-continuously]");
      animatedEntities.forEach(function (entity) {
        entity.setAttribute("rotate-continuously", { active: false }); // Alterna o estado da animação
      });
      startButton.disabled = true; // Desativa o botão
      icon.className = "fa-solid fa-play";
      isAnimating = false; // Atualize o estado aqui
    });
  },
});

AFRAME.registerComponent("rotate-continuously", {
  schema: {
    speed: { type: "number", default: 36 },
    active: { type: "boolean", default: false }, // Adiciona um novo dado para controle de atividade
    // Acrescentamos um identificador para diferenciar entre Terra e Lua
    body: { type: "string", default: "" }, // 'earth' para Terra, 'moon' para Lua
  },
  init: function () {
    this.accumulatedRotation = 0; // Rastreia o total de rotação acumulada
  },
  tick: function (time, timeDelta) {
    if (this.data.active === false) {
      return; // Se a animação não estiver ativa, não faz nada
    } else {
      // updateMoonBrightness();
      var rotationIncrement = this.data.speed * (timeDelta / 1000);
      this.el.object3D.rotation.y +=
        THREE.MathUtils.degToRad(rotationIncrement);

      // Atualiza a rotação acumulada
      this.accumulatedRotation += rotationIncrement;
      // Verifica se a rotação acumulada excedeu 360 graus (uma volta completa)

      if (this.data.body === "earth") {
        if (this.accumulatedRotation >= 360) {
          // Reduz a rotação acumulada
          this.accumulatedRotation -= 360;
          console.log("Uma volta completa da Terra");
          updateDayCounter(); // Atualiza o contador de dias
        }
      }
    }
  },
});

// Exemplo hipotético de como você poderia estar rastreando as rotações da Terra
let currentDay = 0;

function updateDayCounter() {
  const dayCounterElement = document.getElementById("current-day");
  currentDay++; // Incrementa a cada volta completa da Terra
  if (currentDay > 28) {
    currentDay = 0;
  } else if (currentDay < 0) {
    currentDay = 28;
  }
  dayCounterElement.innerText = `Dia ${currentDay}`;
}

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

  const normalizedRotation = (rotation % (2 * Math.PI)) / (2 * Math.PI); // Normaliza para [0, 1]
  const currentImageIndex = Math.floor(normalizedRotation * totalImages);

  // Certifique-se de que o elemento de imagem exista antes de tentar definir sua propriedade src
  // const moonImageElement = document.getElementById("moon-phase-image-bright");
  const moonImageEntity = document.getElementById("my-texture");
  const planeMoon = document.getElementById("planeMoon");

  // Atualiza a imagem da lua com base no índice atual
  // moonImageElement.src = images[currentImageIndex].src;

  // Atualiza diretamente a textura do material da entidade A-Frame
  planeMoon.setAttribute("material", "src", images[currentImageIndex].src);
}

function getMoonRotation() {
  const moonModel = document.getElementById("moonModel");
  const rotation = moonModel.object3D.rotation.y;
  return rotation;
}
function openTab(evt, tabName) {
  var i, tabcontent, tabbuttons;

  // Esconde todos os elementos com class="tab-content"
  tabcontent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove a classe "active" de todos os elementos com class="tab-button"
  tabbuttons = document.getElementsByClassName("tab-button");
  for (i = 0; i < tabbuttons.length; i++) {
    tabbuttons[i].className = tabbuttons[i].className.replace(
      " active-tab",
      ""
    );
  }

  // Mostra a aba atual e adiciona a classe "active" ao botão que abriu a aba
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active-tab";
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

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("Tempo").style.display = "block";
  document.getElementsByClassName("tab-button")[0].className += " active-tab";

  preloadImages(); // Chame preloadImages aqui para garantir que o DOM esteja pronto.
  animateMoonPhase(); // Inicie a animação da fase da lua

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

    if (deltaY > 0) {
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

function updateDay(increment) {
  currentDay += increment;
  if (currentDay > 28) {
    currentDay = 0;
  } else if (currentDay < 0) {
    currentDay = 28;
  }

  document.getElementById("current-day").innerText = `Dia ${currentDay}`;

  // Atualiza a rotação da Terra e da Lua
  updateEarthAndMoonRotation(currentDay);
}

function updateEarthAndMoonRotation(day) {
  const earthRotation = day * 360; // Simplificação para demonstração
  const moonRotation = day * (360 / 28); // Simplificação para demonstração

  const earth = document.getElementById("earthModel");
  const moon = document.getElementById("moonModel");
  const moonPase = document.getElementById("moon-rotate");

  if (earth && moon) {
    earth.object3D.rotation.y = THREE.MathUtils.degToRad(earthRotation);
    moon.object3D.rotation.y = THREE.MathUtils.degToRad(moonRotation);
    moonPase.object3D.rotation.y = THREE.MathUtils.degToRad(moonRotation);
  }
}

document.getElementById("increment-day").addEventListener("click", function () {
  updateDay(1);
});

document.getElementById("decrement-day").addEventListener("click", function () {
  updateDay(-1);
});
