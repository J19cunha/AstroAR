$(document).dblclick(function (e) {
  e.preventDefault();
});

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
  // Evento Google Analytics para "Interação com Onboarding"
  gtag("event", "Next_Onboarding_Step", {
    event_category: "Onboarding",
    event_label: `Step ${currentIndex + 1} to ${currentIndex + 2}`,
  });
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

  gtag("event", "Close_Onboarding", {
    event_category: "Onboarding",
    event_label: "Fechou sem interagir",
  });
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

// Defina isAnimating no topo do seu script para garantir que ele tenha um escopo global dentro deste arquivo
var isAnimating = false;
var markerLostTimeout;
AFRAME.registerComponent("marker-handler", {
  init: function () {
    const startButton = document.getElementById("start-animation"); // Obtenha o botão pelo ID
    var icon = startButton.querySelector("i"); // Seleciona o ícone dentro do botão
    const incrementButton = document.getElementById("increment-month");
    const decrementButton = document.getElementById("decrement-month");

    const markerLostDelay = 1000;

    this.el.addEventListener("markerFound", () => {
      clearTimeout(markerLostTimeout); // Cancela o temporizador se o marcador for encontrado novamente
      startButton.disabled = false; // Reativa o botão
      incrementButton.disabled = false;
      decrementButton.disabled = false;
    });

    this.el.addEventListener("markerLost", () => {
      markerLostTimeout = setTimeout(() => {
        var animatedEntities = document.querySelectorAll(
          "[rotate-continuously]"
        );
        var earthEntity = document.querySelectorAll("[orbit-around-sun]");
        animatedEntities.forEach(function (entity) {
          entity.setAttribute("rotate-continuously", { active: false }); // Alterna o estado da animação
        });
        earthEntity.forEach(function (entity) {
          entity.setAttribute("orbit-around-sun", { active: false }); // Alterna o estado da animação
        });

        startButton.disabled = true; // Desativa o botão
        incrementButton.disabled = true;
        decrementButton.disabled = true;
        icon.className = "fa-solid fa-play";
        isAnimating = false; // Atualize o estado aqui
      }, markerLostDelay);
    });
  },
});

let angle = 0;
AFRAME.registerComponent("orbit-around-sun", {
  schema: {
    radius: { type: "number", default: 2.5 },
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
        Math.floor(angle / 30) !== Math.floor(this.lastMonthUpdateAngle / 30)
      ) {
        updateMonthCounterContinuously(); // Chama a função para incrementar o mês
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
    speed: { type: "number", default: 36 }, //  Velocidade de rotação em graus por segundo 360 em 10 segundos
    active: { type: "boolean", default: false }, // Adiciona um novo dado para controle de atividade
  },
  init: function () {
    this.accumulatedRotation = 0; // Rastreia o total de rotação acumulada
  },
  tick: function (time, timeDelta) {
    if (this.data.active === false) {
      return; // Se a animação não estiver ativa, não faz nada
    } else {
      var rotationIncrement = this.data.speed * (timeDelta / 1000);
      this.el.object3D.rotation.y +=
        THREE.MathUtils.degToRad(rotationIncrement);

      // Atualiza a rotação acumulada
      this.accumulatedRotation += rotationIncrement;
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
  const clickableZone = document.querySelector(".clickable-zone");
  const downArrows = document.querySelectorAll(".down-arrow");

  // Calcula a inclinação com base no ângulo atual da Terra na órbita
  const maxInclination = 23.5;
  const inclination =
    maxInclination * Math.cos(THREE.MathUtils.degToRad(angle));
  earthImage.style.transform = `rotate(${inclination}deg)`;
  // translate y and x

  // Atualiza a posição do ponto de clique
  const clickableZoneRotation = -90 + inclination;
  clickableZone.style.transform = `rotate(${clickableZoneRotation}deg)`;
  clickableZone.style.left = `${10 + inclination}%`;

  // Atualiza a rotação das setas com base no ângulo atual da Terra na órbita
  // Define os valores de rotação
  const winterRotation = -68.3;
  const summerRotation = -111.7;

  // Calcula o progresso ao longo do ano (0 a 1)
  const yearProgress = angle / 360;

  // Mapeia o progresso ao longo do ano para a rotação das setas
  let arrowRotation;
  if (yearProgress <= 0.5) {
    // Inverno até verão
    arrowRotation =
      winterRotation + (summerRotation - winterRotation) * (yearProgress * 2);
  } else {
    // Verão até inverno
    arrowRotation =
      summerRotation +
      (winterRotation - summerRotation) * ((yearProgress - 0.5) * 2);
  }

  downArrows.forEach((arrow) => {
    arrow.style.transform = `rotate(${arrowRotation}deg)`;
  });
}

function updateProgressBar() {
  const timelines = document.querySelectorAll(".timeline");

  for (let i = 0; i < timelines.length; i++) {
    const timeline = timelines[i];
    const progressBar = timeline.querySelector(".filling-line");
    const timelineMarker = timeline.querySelector(".timeline-marker");

    // Defina o intervalo de dias para cada semana
    const startIndexMonth = i * 3; // 0, 3, 6, 9
    const endIndexMonth = (i + 1) * 3; // 3, 6, 9, 12

    // Calcula o progresso dentro do intervalo da semana
    let progress = 0;
    if (
      currentMonthIndex >= startIndexMonth &&
      currentMonthIndex < endIndexMonth
    ) {
      progress = ((currentMonthIndex - startIndexMonth) / 3) * 100;
    } else if (currentMonthIndex >= endIndexMonth) {
      progress = 100;
    }

    // Ajusta a largura da filling-line com base no progresso calculado
    progressBar.style.width = `${progress}%`;

    // Atualiza as classes dos marcadores de timeline
    if (
      currentMonthIndex >= startIndexMonth &&
      currentMonthIndex < endIndexMonth
    ) {
      timelineMarker.classList.add("selected");
      timelineMarker.classList.remove("older-event");
    } else if (currentMonthIndex >= endIndexMonth) {
      timelineMarker.classList.add("older-event");
      timelineMarker.classList.remove("selected");
    } else {
      timelineMarker.classList.remove("selected");
      timelineMarker.classList.remove("older-event");
    }
  }
}

function updateMonthCounterContinuously() {
  const monthIndex = Math.floor(angle / 30); // Baseado em 360 graus divididos por 12 meses
  if (monthIndex !== currentMonthIndex) {
    currentMonthIndex = monthIndex;
    updateDateInfo();
  }
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

  seasonCounterElement.textContent = seasons[currentSeasonIndex];

  if (currentMonthIndex == 0) {
    document.getElementById("december-note").style.visibility = "visible";
  } else if (currentMonthIndex == 6) {
    document.getElementById("december-note").style.visibility = "visible";
    document.getElementById("december-note").innerText =
      " - Dia mais longo do ano";
  } else {
    document.getElementById("december-note").style.visibility = "hidden";
  }

  monthCounterElement.innerText = months[currentMonthIndex];
  updateProgressBar(); // Atualiza a barra de progresso
}

function updateMonth(increment) {
  currentMonthIndex =
    (currentMonthIndex + increment + months.length) % months.length;
  updateDateInfo(); // Atualiza informações de mês e estação
  const earthEntity = document.querySelector("[orbit-around-sun]");
  angle = (360 / months.length) * currentMonthIndex;

  document.querySelector("[orbit-around-sun]").components[
    "orbit-around-sun"
  ].lastMonthUpdateAngle = angle;

  const radians = -THREE.MathUtils.degToRad(angle);
  const radius = earthEntity.getAttribute("orbit-around-sun").radius;
  const x = Math.cos(radians) * radius;
  const z = Math.sin(radians) * radius;

  earthEntity.setAttribute("position", { x: x, y: 0, z: z });
  document
    .getElementById("sun-direction")
    .setAttribute("rotation", { x: 0, y: angle, z: 0 });
  updateEarthInclination(); // Atualiza a inclinação da Terra
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("onBoarding-btn")
    .addEventListener("click", function () {
      document.getElementById("onboarding-container").style.display = "block";
    });

  document
    .getElementById("increment-month")
    .addEventListener("click", function () {
      gtag("event", "Increment_Month_Clicked", {
        event_category: "Interaction",
        event_label: "Increment Month Button",
      });
      updateMonth(1);
    });

  document
    .getElementById("decrement-month")
    .addEventListener("click", function () {
      gtag("event", "Decrement_Month_Clicked", {
        event_category: "Interaction",
        event_label: "Decrement Month Button",
      });
      updateMonth(-1);
    });
  document
    .querySelector(".clickable-zone")
    .addEventListener("click", function () {
      document.getElementById("cloudy-overlay").style.visibility = "visible";
    });

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
    gtag("event", "Start_Animation_Clicked", {
      event_category: "Interaction",
      event_label: "Start Animation Button",
    });

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

  document.querySelector(".close-icon").addEventListener("click", function () {
    document.getElementById("cloudy-overlay").style.visibility = "hidden";
  });
});
