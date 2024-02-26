const e = require("express");

const buttonFullScreen = document.querySelector("button");
buttonFullScreen.addEventListener("click", function () {
  toggleFullScreen();
  
});
function toggleFullScreen() {
  const element = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}
