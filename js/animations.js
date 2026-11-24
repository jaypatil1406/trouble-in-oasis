
window.OasisAnimations = {
  pop(displayObject) {
    displayObject.scaleX *= .85; displayObject.scaleY *= .85;
    createjs.Tween.get(displayObject).to({ scaleX: displayObject.scaleX / .85, scaleY: displayObject.scaleY / .85 }, 300, createjs.Ease.backOut);
  },
  fadeIn(displayObject, ms = 450) { displayObject.alpha = 0; createjs.Tween.get(displayObject).to({ alpha: 1 }, ms); },
  disappear(displayObject, ms = 400) { createjs.Tween.get(displayObject).to({ alpha: 0 }, ms); }
};
