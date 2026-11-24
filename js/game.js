
window.OasisGame = class {
    constructor() {
        this.canvas = document.getElementById("desertSceneCanvas");
        this.stage = new createjs.Stage(this.canvas);

        createjs.Touch.enable(this.stage);
        this.stage.enableMouseOver(20);

        this.layers = {};

        [
            "background",
            "environment",
            "objects",
            "feedback",
            "drag"
        ].forEach(name => {
            this.layers[name] = new createjs.Container();
            this.stage.addChild(this.layers[name]);
        });

        this.done = new Set();
        this.part = 1;
        this.isPlaying = false;
        this.muted = false;
        this.scroll = 0;

        const trayWindow = document.getElementById("trayWindow");
        trayWindow.addEventListener("wheel", event => {
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
                ? event.deltaX : event.deltaY;
            const oldScroll = this.scroll;
            this.scrollTray(delta > 0 ? 1 : -1);
            if (this.scroll !== oldScroll) event.preventDefault();
        }, { passive: false });

        this.drag = new OasisDragDrop(this);

        createjs.Ticker.framerate = 24;
        createjs.Ticker.on("tick", this.stage);
    }

    toGamePoint(event) {
        const rect = document
            .getElementById("game")
            .getBoundingClientRect();

        return {
            x: (event.clientX - rect.left) * 1920 / rect.width,
            y: (event.clientY - rect.top) * 1080 / rect.height
        };
    }

    makeBitmap(file, x, y, width, container) {
        const image = OasisAssets.get(file);

        if (!image) {
            console.warn("Missing asset:", file);
            return null;
        }

        const bitmap = new createjs.Bitmap(image);

        bitmap.x = x;
        bitmap.y = y;
        bitmap.scaleX = bitmap.scaleY = width / image.width;

        container.addChild(bitmap);

        return bitmap;
    }

    makeBackground() {
        const background = this.layers.background;
        const environment = this.layers.environment;
        background.removeAllChildren();
        environment.removeAllChildren();

        const cracked = OasisAssets.get("Cracked Desert Dunes with Lone Rock.png");
        const smooth = OasisAssets.get("Matched_Smooth_Desert.png");

        if (!cracked || !smooth) {
            console.error("Missing desert background assets");
            return;
        }

        const fillScreen = (image) => {
            const bitmap = new createjs.Bitmap(image);
            bitmap.x = 0;
            bitmap.y = 0;
            bitmap.scaleX = 1920 / image.width;
            bitmap.scaleY = 1080 / image.height;
            background.addChild(bitmap);
            return bitmap;
        };

        this.crackedGround = fillScreen(cracked);
        this.smoothGround = fillScreen(smooth);
        this.smoothGround.alpha = 0;

        this.yellowTree = this.makeBitmap("Group3.png", 130, 150, 600, environment);
        this.greenTree = this.makeBitmap("Group3.png", 130, 150, 600, environment);

        if (this.yellowTree) {
            const image = this.yellowTree.image;
            this.yellowTree.filters = [
                new createjs.ColorFilter(1.14, 0.96, 0.47, 1, 10, 2, 0, 0)
            ];
            this.yellowTree.cache(0, 0, image.width, image.height);
        }

        if (this.greenTree) this.greenTree.alpha = 0;

        this.sun = this.makeBitmap("sun.png", 490, 65, 125, environment);
        if (this.sun) this.sun.alpha = 0.55;

        this.pond = this.makeBitmap("Oasis.png", 885, 570, 810, environment);
        if (this.pond) this.pond.alpha = 0;
    }

    start() {
        this.isPlaying = true;

        this.drawTray();
        this.updateQuestion();
    }

    drawTray() {
        const track = document.getElementById("trayTrack");

        track.replaceChildren();

        OasisActivities.items
            .filter(item => !this.done.has(item.id))
            .forEach(item => {
                const button = document.createElement("div");

                button.className =
                    "tray-item" +
                    (this.done.has(item.id) ? " done" : "");

                button.setAttribute("role", "button");
                button.setAttribute("tabindex", "0");
                button.setAttribute(
                    "aria-label",
                    "Drag " + item.label
                );

                const img = document.createElement("img");

                img.src = OasisAssets.folder + item.file;
                img.alt = "";

                const text = document.createElement("span");
                text.textContent = item.label;

                button.append(img, text);

                button.addEventListener("pointerdown", event => {
                    if (!this.done.has(item.id)) {
                        this.drag.begin(event, item);
                    }
                });

                button.addEventListener("keydown", event => {
                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {
                        event.preventDefault();
                        this.tryDrop(item);
                    }
                });

                track.appendChild(button);
            });

        this.updateArrows();
    }

    updateArrows() {
        const track = document.getElementById("trayTrack");
        const viewport = document.getElementById("trayWindow");
        const step = 209;
        const max = Math.max(0, Math.ceil((track.scrollWidth - viewport.clientWidth) / step));

        this.scroll = Math.max(0, Math.min(this.scroll, max));
        const maxPixels = Math.max(0, track.scrollWidth - viewport.clientWidth);
        const offset = Math.min(this.scroll * step, maxPixels);
        track.style.transform = `translateX(${-offset}px)`;

        document.getElementById("previous").disabled = offset <= 0;
        document.getElementById("next").disabled = offset >= maxPixels;
    }

    scrollTray(direction) {
        this.scroll += direction;
        this.updateArrows();
    }

    updateQuestion() {
        document.getElementById("questionText").innerHTML =
            this.part === 1
                ? "Drag the non-living things<br>that you can find in the desert."
                : "Drag the living things<br>that you can find in the desert.";
    }

    tryDrop(item, fromSnap = false) {
        if (!this.isPlaying || this.done.has(item.id)) {
            return;
        }

        if (item.part !== this.part) {
            this.notify("Try another object");
            return;
        }

        if (
            item.id === "rocks" &&
            !this.done.has("oasis")
        ) {
            this.notify("Place the oasis first");
            return;
        }

        this.done.add(item.id);

        if (item.id === "oasis") {
            this.transformOasis();
        } else {
            this.place(item, fromSnap);
        }

        this.drawTray();
        this.notify("Well done!");

        const required = OasisActivities.required[this.part];

        if (required.every(id => this.done.has(id))) {
            this.completePart();
        }
    }

    place(item, fromSnap = false) {
        const target = OasisActivities.targets[item.id];

        if (!target) {
            return;
        }

        const bitmap = this.makeBitmap(
            item.file,
            target.x,
            target.y,
            target.width,
            this.layers.objects
        );

        if (bitmap && item.id === "fox") {
            bitmap.x = target.x + target.width;
            bitmap.scaleX = -Math.abs(bitmap.scaleX);
        }

        if (bitmap && !fromSnap) {
            OasisAnimations.pop(bitmap);
        }
    }

    transformOasis() {
        if (this.smoothGround) {
            createjs.Tween.get(this.smoothGround, { override: true })
                .to({ alpha: 1 }, 650);
        }

        if (this.yellowTree) {
            createjs.Tween.get(this.yellowTree, { override: true })
                .to({ alpha: 0 }, 550);
        }

        if (this.greenTree) {
            createjs.Tween.get(this.greenTree, { override: true })
                .to({ alpha: 1 }, 550);
        }

        if (this.sun) {
            createjs.Tween.get(this.sun, { override: true })
                .to({ alpha: 1 }, 550);
        }

        if (this.pond) {
            createjs.Tween.get(this.pond, { override: true })
                .to({ alpha: 1 }, 500);
        }
    }

    completePart() {
        this.isPlaying = false;

        setTimeout(() => {
            if (this.part === 1) {
                OasisUI.dialog(
                    "Great work!",
                    "You found the non-living things. Now look for living things in the desert.",
                    "Continue",
                    () => {
                        this.part = 2;
                        this.isPlaying = true;

                        this.updateQuestion();
                        this.drawTray();
                    }
                );
            } else {
                OasisUI.dialog(
                    "Well done!",
                    "You completed the living and non-living classification activity.",
                    "Play Again",
                    () => this.reset()
                );
            }
        }, 2000);
    }

    notify(message) {
        const element = document.getElementById("toast");

        element.textContent = message;
        element.classList.add("visible");

        clearTimeout(this.noticeTimer);

        this.noticeTimer = setTimeout(() => {
            element.classList.remove("visible");
        }, 1200);
    }

    reset() {
        this.drag.cancel();
        createjs.Tween.removeAllTweens();

        this.done.clear();
        this.part = 1;
        this.isPlaying = true;
        this.scroll = 0;

        Object.values(this.layers).forEach(layer => {
            layer.removeAllChildren();
        });

        this.makeBackground();
        this.drawTray();
        this.updateQuestion();
    }
};
