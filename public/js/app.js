AFRAME.registerComponent("rotate-continuously", {
  schema: {
    speed: { type: "number", default: 36 },
    active: { type: "boolean", default: false }, // Adiciona um novo dado para controle de atividade
  },
  tick: function (time, timeDelta) {
    if (this.data.active === false) {
      return; // Se a animação não estiver ativa, não faz nada
    } else {
      // updateMoonBrightness();
      var rotationIncrement = this.data.speed * (timeDelta / 1000);
      this.el.object3D.rotation.y += THREE.Math.degToRad(rotationIncrement);
    }
  },
});

// Supondo que temos 236 imagens para as fases da lua
const totalImages = 236;
let imagesLoaded = 0;
let currentImageIndex = 0;

const images = [];

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
    img.src = `../assets/images/moonphases/moon.${i} Small.jpeg`;
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
  const moonImageElement = document.getElementById("moon-phase-image-bright");
  if (moonImageElement) {
    moonImageElement.src = images[currentImageIndex].src;
  }
}

function getMoonRotation() {
  const moonModel = document.getElementById("moonModel");
  const rotation = moonModel.object3D.rotation.y; // Apenas como exemplo, ajuste conforme necessário
  return rotation;
}

document.addEventListener("DOMContentLoaded", function () {
  preloadImages(); // Chame preloadImages aqui para garantir que o DOM esteja pronto.

  animateMoonPhase(); // Inicie a animação da fase da lua

  // Este é o novo botão de alternância
  var toggleButton = document.getElementById("start-animation");
  var isAnimating = false; // Estado inicial da animação

  toggleButton.addEventListener("click", function () {
    var animatedEntities = document.querySelectorAll("[rotate-continuously]");
    isAnimating = !isAnimating; // Inverte o estado da animação

    animatedEntities.forEach(function (entity) {
      entity.setAttribute("rotate-continuously", { active: isAnimating }); // Alterna o estado da animação
    });

    // Altera o texto do botão conforme o estado da animação
    toggleButton.textContent = isAnimating
      ? "Stop Animation"
      : "Start Animation";
  });
});
