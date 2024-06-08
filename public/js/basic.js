// Defina isAnimating no topo do seu script para garantir que ele tenha um escopo global dentro deste arquivo
var isAnimating = false;
//call script config.js to get the let angle
let angle = 0;

AFRAME.registerComponent("marker-handler", {
  init: function () {
    const startButton = document.getElementById("start-animation"); // Obtenha o botão pelo ID
    var icon = startButton.querySelector("i"); // Seleciona o ícone dentro do botão

    this.el.addEventListener("markerFound", () => {
      startButton.disabled = false; // Reativa o botão
    });

    this.el.addEventListener("markerLost", () => {
      var animatedEntities = document.querySelectorAll("[rotate-continuously]");
      var earthEntity = document.querySelectorAll("[orbit-around-sun]");
      animatedEntities.forEach(function (entity) {
        entity.setAttribute("rotate-continuously", { active: false }); // Alterna o estado da animação
      });
      earthEntity.forEach(function (entity) {
        entity.setAttribute("orbit-around-sun", { active: false }); // Alterna o estado da animação
      });

      startButton.disabled = true; // Desativa o botão
      icon.className = "fa-solid fa-play";
      isAnimating = false; // Atualize o estado aqui
    });
  },
});

AFRAME.registerComponent("orbit-around-sun", {
  schema: {
    radius: { type: "number", default: 2 },
    duration: { type: "number", default: 10000 }, // Duração de uma órbita completa em milissegundos
    active: { type: "boolean", default: false }, // Adiciona um novo dado para controle de atividade
  },
  init: function () {
    this.lastMonthUpdateAngle = 0; // Guarda o último ângulo em que um mês foi incrementado
    updateEarthInclination(); // Inicie a inclinação da Terra
  },
  tick: function (time, timeDelta) {
    if (this.data.active === false) {
      return; // Se a animação não estiver ativa, não faz nada
    } else {
      // Atualiza o ângulo com base no tempo decorrido
      angle += (360 / this.data.duration) * timeDelta;
      angle %= 360;

      // Verifica se o ângulo passou de um múltiplo de 30 desde a última atualização
      if (
        Math.floor(angle / 29) !== Math.floor(this.lastMonthUpdateAngle / 29)
      ) {
        updateMonthCounter(); // Chama a função para incrementar o mês
        this.lastMonthUpdateAngle = angle; // Atualiza o último ângulo de atualização do mês
      }

      // Calcula a nova posição na órbita
      var radians = -THREE.MathUtils.degToRad(angle);
      var x = Math.cos(radians) * this.data.radius;
      var z = Math.sin(radians) * this.data.radius;
      this.el.setAttribute("position", { x: x, y: 0, z: z });
      updateEarthInclination(); // Atualize a inclinação da Terra
    }
  },
});

AFRAME.registerComponent("rotate-continuously", {
  schema: {
    speed: { type: "number", default: 36 },
    active: { type: "boolean", default: false }, // Adiciona um novo dado para controle de atividade
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
    }
  },
});

let currentMonthIndex = 0; // Index of month in the months array
let currentSeasonIndex = 0; // Index of season in the seasons array
const months = [
  "Dezembro",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
];
const seasons = ["Inverno", "Primavera", "Verão", "Outono"];

function updateEarthInclination() {
  const earthImage = document.getElementById("earth-image");

  // Calcula a inclinação com base no ângulo atual da Terra na órbita
  const maxInclination = 23.5;
  const inclination =
    maxInclination * Math.cos(THREE.MathUtils.degToRad(angle));
  earthImage.style.transform = `rotate(${inclination}deg)`;
}

function updateMonthCounter() {
  currentMonthIndex = (currentMonthIndex + 1) % months.length;
  updateDateInfo(); // Atualiza informações de mês e estação
}

function updateDateInfo() {
  // Atualiza diretamente a estação baseando-se no mês
  if (currentMonthIndex >= 0 && currentMonthIndex < 3) {
    // Dezembro, Janeiro, Fevereiro
    currentSeasonIndex = 0; // Inverno
  } else if (currentMonthIndex >= 3 && currentMonthIndex < 6) {
    // Março, Abril, Maio
    currentSeasonIndex = 1; // Primavera
  } else if (currentMonthIndex >= 6 && currentMonthIndex < 9) {
    // Junho, Julho, Agosto
    currentSeasonIndex = 2; // Verão
  } else if (currentMonthIndex >= 9 && currentMonthIndex < 12) {
    // Setembro, Outubro, Novembro
    currentSeasonIndex = 3; // Outono
  }

  const monthCounterElement = document.getElementById("current-month");
  const seasonCounterElement = document.getElementById("space");

  monthCounterElement.innerText = months[currentMonthIndex];
  seasonCounterElement.textContent = seasons[currentSeasonIndex];
}

function updateEarthPosition(month) {
  const earthEntity = document.querySelector("[orbit-around-sun]");
  angle = (360 / months.length) * month;
  const radians = -THREE.MathUtils.degToRad(angle);
  const radius = earthEntity.getAttribute("orbit-around-sun").radius;
  const x = Math.cos(radians) * radius;
  const z = Math.sin(radians) * radius;

  earthEntity.setAttribute("position", { x: x, y: 0, z: z });
  document
    .getElementById("sun-direction")
    .setAttribute("rotation", { x: 0, y: angle, z: 0 });
}

function updateMonth(increment) {
  currentMonthIndex =
    (currentMonthIndex + increment + months.length) % months.length;
  updateDateInfo(); // Atualiza informações de mês e estação
  updateEarthPosition(currentMonthIndex); // Atualiza a posição da Terra
}

document
  .getElementById("increment-month")
  .addEventListener("click", function () {
    updateMonth(1);
  });

document
  .getElementById("decrement-month")
  .addEventListener("click", function () {
    updateMonth(-1);
  });

AFRAME.registerComponent("click-listener", {
  schema: {
    month: { type: "number", default: 0 },
  },
  init: function () {
    // Armazena uma referência ao componente dentro de uma variável para acesso correto dentro da função de callback do evento
    const component = this;

    // Detetar o click na área entre a terra e a componente

    this.el.addEventListener("click", () => {
      // Atualiza o índice do mês atual para o mês associado ao componente clicado.
      currentMonthIndex = component.data.month;
      console.log("Mês atualizado para", months[currentMonthIndex]);
      // Chama updateDateInfo para atualizar a informação do mês e da estação na interface.
      updateDateInfo();
      // Aqui usamos 'component' em vez de 'this' para acessar a propriedade 'data' que contém o mês definido no schema
      updateEarthPosition(component.data.month);
    });
  },
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("Tempo").style.display = "block";

  // Este é o novo botão de alternância
  var toggleButton = document.getElementById("start-animation");

  document
    .querySelector(".seasons-button")
    .addEventListener("click", function () {
      document.querySelector(".div-sunDirection").classList.toggle("reduced");
    });

  var icon = toggleButton.querySelector("i"); // Seleciona o ícone dentro do botão

  toggleButton.addEventListener("click", function () {
    var animatedEntities = document.querySelectorAll("[rotate-continuously]");
    var earthEntity = document.querySelectorAll("[orbit-around-sun]");
    isAnimating = !isAnimating; // Inverte o estado da animação

    animatedEntities.forEach(function (entity) {
      entity.setAttribute("rotate-continuously", { active: isAnimating }); // Alterna o estado da animação
    });

    earthEntity.forEach(function (entity) {
      entity.setAttribute("orbit-around-sun", { active: isAnimating }); // Alterna o estado da animação
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
