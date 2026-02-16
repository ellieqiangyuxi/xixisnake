class Controls {
    constructor(canvas, dpadElement) {
        this.canvas = canvas;
        this.dpad = dpadElement;
        this._directionCallback = null;
        this._touchStartX = 0;
        this._touchStartY = 0;

        this._initKeyboard();
        this._initTouch();
        this._initDpad();
    }

    onDirection(callback) {
        this._directionCallback = callback;
    }

    _emit(direction) {
        if (this._directionCallback) {
            this._directionCallback(direction);
        }
    }

    _initKeyboard() {
        document.addEventListener("keydown", (e) => {
            const keyMap = {
                ArrowUp: "up",
                ArrowDown: "down",
                ArrowLeft: "left",
                ArrowRight: "right",
                w: "up",
                W: "up",
                s: "down",
                S: "down",
                a: "left",
                A: "left",
                d: "right",
                D: "right",
            };

            const dir = keyMap[e.key];
            if (dir) {
                e.preventDefault();
                this._emit(dir);
            }
        });
    }

    _initTouch() {
        const MIN_SWIPE = 20;

        this.canvas.addEventListener(
            "touchstart",
            (e) => {
                const touch = e.touches[0];
                this._touchStartX = touch.clientX;
                this._touchStartY = touch.clientY;
                e.preventDefault();
            },
            { passive: false }
        );

        this.canvas.addEventListener(
            "touchend",
            (e) => {
                const touch = e.changedTouches[0];
                const dx = touch.clientX - this._touchStartX;
                const dy = touch.clientY - this._touchStartY;

                if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;

                if (Math.abs(dx) > Math.abs(dy)) {
                    this._emit(dx > 0 ? "right" : "left");
                } else {
                    this._emit(dy > 0 ? "down" : "up");
                }

                e.preventDefault();
            },
            { passive: false }
        );

        // Prevent scrolling when touching the canvas
        this.canvas.addEventListener("touchmove", (e) => e.preventDefault(), {
            passive: false,
        });
    }

    _initDpad() {
        if (!this.dpad) return;

        const buttons = this.dpad.querySelectorAll(".dpad-btn");
        buttons.forEach((btn) => {
            const handler = (e) => {
                e.preventDefault();
                const dir = btn.dataset.direction;
                if (dir) this._emit(dir);
            };

            btn.addEventListener("touchstart", handler, { passive: false });
            btn.addEventListener("mousedown", handler);
        });
    }

    destroy() {
        this._directionCallback = null;
    }
}
