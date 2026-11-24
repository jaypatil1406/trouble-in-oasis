window.OasisDragDrop = class {
    constructor(game) {
        this.game = game;
        this.active = null;
        this.animating = false;

        this.move = this.move.bind(this);
        this.end = this.end.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    begin(event, item) {
        if (
            this.animating ||
            this.active ||
            this.game.done.has(item.id) ||
            !this.game.isPlaying
        ) return;

        if (event.button !== undefined && event.button !== 0) return;

        event.preventDefault();

        const p = this.game.toGamePoint(event);

        const ghost = this.game.makeBitmap(
            item.file,
            p.x,
            p.y,
            135,
            this.game.layers.drag
        );

        if (!ghost) return;

        ghost.regX = ghost.image.width / 2;
        ghost.regY = ghost.image.height / 2;
        ghost.alpha = 1;

        this.active = {
            item,
            ghost,
            startX: p.x,
            startY: p.y
        };

        window.addEventListener('pointermove', this.move, {
            passive: false
        });

        window.addEventListener('pointerup', this.end);
        window.addEventListener('pointercancel', this.cancel);
    }

    move(event) {
        if (!this.active) return;

        event.preventDefault();

        const p = this.game.toGamePoint(event);

        this.active.ghost.x = p.x;
        this.active.ghost.y = p.y;

        this.game.stage.update();
    }

    end(event) {
        if (!this.active) return;

        const { item, ghost, startX, startY } = this.active;

        this.active = null;
        this.unbind();

        const p = this.game.toGamePoint(event);

        const inScene =
            p.x > 60 &&
            p.x < 1860 &&
            p.y > 230 &&
            p.y < 825;

        const allowed =
            inScene &&
            this.game.isPlaying &&
            !this.game.done.has(item.id) &&
            item.part === this.game.part &&
            (
                item.id !== 'rocks' ||
                this.game.done.has('oasis')
            );

        this.animating = true;

        if (!allowed) {
            createjs.Tween.get(ghost, { override: true })
                .to(
                    {
                        x: startX,
                        y: startY,
                        alpha: 0
                    },
                    140,
                    createjs.Ease.quadOut
                )
                .call(() => {
                    this.game.layers.drag.removeChild(ghost);
                    this.animating = false;

                    if (
                        inScene &&
                        item.part !== this.game.part
                    ) {
                        this.game.notify('Try another object');
                    } else if (
                        inScene &&
                        item.id === 'rocks' &&
                        !this.game.done.has('oasis')
                    ) {
                        this.game.notify('Place the oasis first');
                    }

                    this.game.stage.update();
                });

            return;
        }

        const target = OasisActivities.targets[item.id];

        const x = target ? target.x : 885;
        const y = target ? target.y : 570;
        const width = target ? target.width : 810;

        const scale = width / ghost.image.width;

        const finalScaleX =
            target && target.flipX ? -scale : scale;

        const endX = x + width / 2;

        const endY =
            y + (ghost.image.height * scale) / 2;

        if (item.id === 'oasis') {
            this.game.layers.drag.removeChild(ghost);

            this.animating = false;

            this.game.tryDrop(item, true);

            this.game.stage.update();
            return;
        }

        createjs.Tween.get(ghost, { override: true })
            .to(
                {
                    x: endX,
                    y: endY,
                    scaleX: finalScaleX,
                    scaleY: scale,
                    alpha: 1
                },
                160,
                createjs.Ease.quadOut
            )
            .call(() => {
                this.game.layers.drag.removeChild(ghost);

                this.animating = false;

                this.game.tryDrop(item, true);

                this.game.stage.update();
            });
    }

    unbind() {
        window.removeEventListener('pointermove', this.move);
        window.removeEventListener('pointerup', this.end);
        window.removeEventListener('pointercancel', this.cancel);
    }

    cancel() {
        if (this.active) {
            createjs.Tween.removeTweens(this.active.ghost);

            this.game.layers.drag.removeChild(
                this.active.ghost
            );

            this.active = null;
        }

        this.animating = false;
        this.unbind();

        this.game.stage.update();
    }
};