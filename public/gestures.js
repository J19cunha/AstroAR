/* global AFRAME, THREE */

AFRAME.registerComponent("gesture-handler", {
  schema: {
    enabled: { default: true },
    rotationFactor: { default: 3 },
  },

  init: function () {
    this.handleRotation = this.handleRotation.bind(this);

    this.isVisible = false;

    this.el.sceneEl.addEventListener("markerFound", (e) => {
      this.isVisible = true;
    });

    this.el.sceneEl.addEventListener("markerLost", (e) => {
      this.isVisible = false;
    });
  },

  update: function () {
    if (this.data.enabled) {
      this.el.sceneEl.addEventListener("onefingermove", this.handleRotation);
    } else {
      this.el.sceneEl.removeEventListener("onefingermove", this.handleRotation);
    }
  },

  remove: function () {
    this.el.sceneEl.removeEventListener("onefingermove", this.handleRotation);
  },

  handleRotation: function (event) {
    const sensitivity = 0.4; // Sensibilidade do movimento do dedo
    if (this.isVisible) {
      // Incrementos positivos e negativos são considerados
      this.el.object3D.rotation.y +=
        event.detail.positionChange.x * this.data.rotationFactor * sensitivity;
    }
  },
});
AFRAME.registerComponent("orbit-around-sun-gesture", {
  schema: {
    radius: { type: "number", default: 2.5 },
    duration: { type: "number", default: 10000 }, // Duração de uma órbita completa em milissegundos
    speed: { type: "number", default: 60 },
  },
  init: function () {
    angle = 0; // Ângulo inicial da órbita
    this.lastMonthUpdateAngle = 0; // Guarda o último ângulo em que um mês foi incrementado

    // Adiciona o gesto de toque para iniciar a órbita
    this.el.sceneEl.addEventListener(
      "onefingermove",
      this.handleTouch.bind(this)
    );

    this.isVisible = false;

    this.el.sceneEl.addEventListener("markerFound", (e) => {
      this.isVisible = true;
    });

    this.el.sceneEl.addEventListener("markerLost", (e) => {
      this.isVisible = false;
    });

    updateEarthInclination(); // Inicie a inclinação da Terra
  },
  handleTouch: function (event) {
    if (this.isVisible) {
      // Calcula a rotação com base no movimento do toque
      const dx = event.detail.positionChange.x;
      const sensitivity = 1; // Sensibilidade do movimento do dedo

      // Calcula a mudança de ângulo com base no movimento do dedo
      const deltaAngle = dx * sensitivity;

      // Atualiza o ângulo de rotação
      angle += deltaAngle * this.data.speed;

      // Manter o ângulo dentro do intervalo de 0 a 360 graus p
      angle = angle % 360;
      if (angle < 0) {
        angle += 360;
      }

      // Verifica se o ângulo passou de um múltiplo de 30 desde a última atualização
      if (
        Math.floor(angle / 30) !== Math.floor(this.lastMonthUpdateAngle / 30)
      ) {
        updateMonthCounter(); // Chama a função para incrementar o mês
        this.lastMonthUpdateAngle = angle; // Atualiza o último ângulo de atualização do mês
      }

      // Atualiza a posição na órbita com base no novo ângulo
      var radians = -THREE.MathUtils.degToRad(angle);
      var x = Math.cos(radians) * this.data.radius;
      var z = Math.sin(radians) * this.data.radius;
      this.el.setAttribute("position", { x: x, y: 0, z: z });
      updateEarthInclination(); // Atualize a inclinação da Terra
    }
  },
});

AFRAME.registerComponent("rotate-continuously-gesture", {
  schema: {
    speed: { type: "number", default: 60 },
  },
  init: function () {
    this.accumulatedRotation = 0; // Rastreia o total de rotação acumulada

    // Adiciona o gesto de toque para iniciar a rotação
    this.el.sceneEl.addEventListener(
      "onefingermove",
      this.handleTouch.bind(this)
    );

    this.isVisible = false;

    this.el.sceneEl.addEventListener("markerFound", (e) => {
      this.isVisible = true;
    });

    this.el.sceneEl.addEventListener("markerLost", (e) => {
      this.isVisible = false;
    });

    updateEarthInclination(); // Inicie a inclinação da Terra
  },
  handleTouch: function (event) {
    if (this.isVisible) {
      // Calcula a rotação com base no movimento do toque
      const dx = event.detail.positionChange.x;
      const sensitivity = 1; // Sensibilidade do movimento do dedo

      // Calcula a mudança de rotação com base no movimento do dedo
      const rotationIncrement = dx * sensitivity;

      this.el.object3D.rotation.y += THREE.MathUtils.degToRad(
        rotationIncrement * this.data.speed
      );

      // Atualiza a inclinação da Terra
      updateEarthInclination();
    }
  },
});

// Component that detects and emits events for touch gestures

AFRAME.registerComponent("gesture-detector", {
  schema: {
    element: { default: "" },
  },

  init: function () {
    this.targetElement =
      this.data.element && document.querySelector(this.data.element);

    if (!this.targetElement) {
      this.targetElement = this.el;
    }

    this.internalState = {
      previousState: null,
    };

    this.emitGestureEvent = this.emitGestureEvent.bind(this);

    this.targetElement.addEventListener("touchstart", this.emitGestureEvent);

    this.targetElement.addEventListener("touchend", this.emitGestureEvent);

    this.targetElement.addEventListener("touchmove", this.emitGestureEvent);
  },

  remove: function () {
    this.targetElement.removeEventListener("touchstart", this.emitGestureEvent);

    this.targetElement.removeEventListener("touchend", this.emitGestureEvent);

    this.targetElement.removeEventListener("touchmove", this.emitGestureEvent);
  },

  emitGestureEvent(event) {
    const currentState = this.getTouchState(event);

    const previousState = this.internalState.previousState;

    const gestureContinues =
      previousState &&
      currentState &&
      currentState.touchCount == previousState.touchCount;

    const gestureEnded = previousState && !gestureContinues;

    const gestureStarted = currentState && !gestureContinues;

    if (gestureEnded) {
      const eventName =
        this.getEventPrefix(previousState.touchCount) + "fingerend";

      this.el.emit(eventName, previousState);

      this.internalState.previousState = null;
    }

    if (gestureStarted) {
      currentState.startTime = performance.now();

      currentState.startPosition = currentState.position;

      currentState.startSpread = currentState.spread;

      const eventName =
        this.getEventPrefix(currentState.touchCount) + "fingerstart";

      this.el.emit(eventName, currentState);

      this.internalState.previousState = currentState;
    }

    if (gestureContinues) {
      const eventDetail = {
        positionChange: {
          x: currentState.position.x - previousState.position.x,

          y: currentState.position.y - previousState.position.y,
        },
      };

      if (currentState.spread) {
        eventDetail.spreadChange = currentState.spread - previousState.spread;
      }

      // Update state with new data

      Object.assign(previousState, currentState);

      // Add state data to event detail

      Object.assign(eventDetail, previousState);

      const eventName =
        this.getEventPrefix(currentState.touchCount) + "fingermove";

      this.el.emit(eventName, eventDetail);
    }
  },

  getTouchState: function (event) {
    if (event.touches.length === 0) {
      return null;
    }

    // Convert event.touches to an array so we can use reduce

    const touchList = [];

    for (let i = 0; i < event.touches.length; i++) {
      touchList.push(event.touches[i]);
    }

    const touchState = {
      touchCount: touchList.length,
    };

    // Calculate center of all current touches

    const centerPositionRawX =
      touchList.reduce((sum, touch) => sum + touch.clientX, 0) /
      touchList.length;

    const centerPositionRawY =
      touchList.reduce((sum, touch) => sum + touch.clientY, 0) /
      touchList.length;

    touchState.positionRaw = { x: centerPositionRawX, y: centerPositionRawY };

    // Scale touch position and spread by average of window dimensions

    const screenScale = 2 / (window.innerWidth + window.innerHeight);

    touchState.position = {
      x: centerPositionRawX * screenScale,
      y: centerPositionRawY * screenScale,
    };

    // Calculate average spread of touches from the center point

    if (touchList.length >= 2) {
      const spread =
        touchList.reduce((sum, touch) => {
          return (
            sum +
            Math.sqrt(
              Math.pow(centerPositionRawX - touch.clientX, 2) +
                Math.pow(centerPositionRawY - touch.clientY, 2)
            )
          );
        }, 0) / touchList.length;
      touchState.spread = spread * screenScale;
    }
    return touchState;
  },

  getEventPrefix(touchCount) {
    const numberNames = ["one", "two", "three", "many"];

    return numberNames[Math.min(touchCount, 4) - 1];
  },
});
