
window.OasisUI = (() => {
  let confirmAction = null;
  function dialog(
    title,
    message,
    label,
    onConfirm,
    secondaryLabel = null,
    onCancel = null,
  ) {
    document.getElementById("dialogTitle").textContent = title;
    document.getElementById("dialogText").textContent = message;
    document.getElementById("primary").textContent = label;
    const secondary = document.getElementById("secondary");
    secondary.hidden = !secondaryLabel;
    if (secondaryLabel) secondary.textContent = secondaryLabel;
    confirmAction = onConfirm;
    secondary.onclick = () => {
      hide();
      if (onCancel) onCancel();
    };
    document.getElementById("overlay").classList.remove("hidden");
  }
  function hide() {
    document.getElementById("overlay").classList.add("hidden");
  }
  document.getElementById("primary").onclick = () => {
    hide();
    if (confirmAction) confirmAction();
  };
  return { dialog, hide };
})();
(function () {
  const gameElement = document.getElementById("game");
  function resize() {
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    gameElement.style.transform = `scale(${scale})`;
    gameElement.style.left = `${(innerWidth - 1920 * scale) / 2}px`;
    gameElement.style.top = `${(innerHeight - 1080 * scale) / 2}px`;
  }

  window.addEventListener("resize", resize);
  resize();
  if (!window.createjs) {
    OasisUI.dialog(
      "CreateJS not loaded",
      "Connect to the internet and reload this page. The CreateJS library is loaded from its official CDN.",
      "Reload",
      () => location.reload(),
    );
    return;
  }

  const game = new OasisGame();
  document.getElementById("previous").onclick = () => game.scrollTray(-1);
  document.getElementById("next").onclick = () => game.scrollTray(1);
  document.getElementById("reset").onclick = () =>
    OasisUI.dialog(
      "Restart?",
      "Start the activity again from the beginning?",
      "Restart",
      () => game.reset(),
      "Cancel",
      () => {},
    );
  document.getElementById("close").onclick = () =>
    OasisUI.dialog(
      "Exit activity?",
      "You can restart or return to the activity.",
      "Restart",
      () => game.reset(),
      "Continue",
      () => {},
    );
  document.getElementById("music").onclick = (e) => {
    game.muted = !game.muted;
    e.currentTarget.textContent = game.muted ? "♪" : "♫";
    if (game.muted && "speechSynthesis" in window) speechSynthesis.cancel();
  };
  OasisUI.dialog(
    "Loading artwork",
    "Preparing the desert scene…",
    "Please wait",
    () => {},
  );
  document.getElementById("primary").disabled = true;
  OasisAssets.load().then(() => {
    game.makeBackground();
    document.getElementById("primary").disabled = false;
    OasisUI.dialog(
      "Trouble in the Oasis",
      "Drag the correct objects into the desert. Start with the non-living things.",
      "Start",
      () => game.start(),
    );
  });
})();
