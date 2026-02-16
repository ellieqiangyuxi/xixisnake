document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game-canvas");
    const scoreDisplay = document.getElementById("score-display");
    const scoreEl = document.getElementById("score");
    const finalScoreEl = document.getElementById("final-score");
    const startScreen = document.getElementById("start-screen");
    const gameOverScreen = document.getElementById("game-over-screen");
    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");
    const dpad = document.getElementById("dpad");
    const themeToggle = document.getElementById("theme-toggle");
    const titleEl = document.querySelector("header h1");

    // Theme toggle
    function isDark() {
        return document.documentElement.getAttribute("data-theme") === "dark";
    }

    function applyTheme(dark) {
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        localStorage.setItem("xixi-snake-theme", dark ? "dark" : "light");
    }

    // Load saved preference, default to light
    const savedTheme = localStorage.getItem("xixi-snake-theme");
    if (savedTheme === "dark") {
        applyTheme(true);
    }

    themeToggle.addEventListener("click", () => {
        applyTheme(!isDark());
    });

    // Preload snake head image
    const headImage = new Image();
    headImage.src = "assets/snake-head.png";

    // Sizing — game screen fills available space in the console
    const container = document.getElementById("game-container");
    const consoleTop = document.querySelector(".console-top");

    function resizeCanvas() {
        // Step 1: Measure actual available space inside the console
        const consoleEl = document.getElementById("console");
        const headerEl = document.querySelector("header");
        const controlsEl = document.querySelector(".console-controls");

        const consoleStyle = getComputedStyle(consoleEl);
        const consolePadLeft = parseFloat(consoleStyle.paddingLeft) || 0;
        const consolePadRight = parseFloat(consoleStyle.paddingRight) || 0;
        const consoleBorderLeft = parseFloat(consoleStyle.borderLeftWidth) || 0;
        const consoleBorderRight = parseFloat(consoleStyle.borderRightWidth) || 0;

        // Inner width of the console (what's actually available)
        const consoleInnerW = consoleEl.clientWidth;
        // Subtract console-top padding (10px each side) + game container border (3px each side)
        const availW = consoleInnerW - 20 - 6;

        // Available height: viewport minus header, controls, console chrome
        const vh = window.innerHeight;
        const headerH = headerEl ? headerEl.offsetHeight : 36;
        const controlsH = controlsEl && controlsEl.offsetHeight > 0 ? controlsEl.offsetHeight : 0;
        const consoleBorderTop = parseFloat(consoleStyle.borderTopWidth) || 0;
        const consoleBorderBottom = parseFloat(consoleStyle.borderBottomWidth) || 0;
        const verticalChrome = headerH + controlsH + consoleBorderTop + consoleBorderBottom + 30; // 30 = padding + margins
        const availH = vh - verticalChrome;

        // Step 2: Largest square that fits
        const size = Math.max(100, Math.floor(Math.min(availW, availH)));

        // Step 3: Set container size, then read back actual size to be safe
        container.style.width = size + "px";
        container.style.height = size + "px";

        // Read back actual rendered size (CSS may clamp it)
        const actualSize = Math.min(container.clientWidth, container.clientHeight);

        const dpr = window.devicePixelRatio || 1;
        canvas.width = actualSize * dpr;
        canvas.height = actualSize * dpr;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (game) {
            game.displaySize = actualSize;
        }
    }

    window.addEventListener("resize", resizeCanvas);

    // Game instance
    let game = new Game(canvas, headImage);
    resizeCanvas();
    let controls = new Controls(canvas, dpad);
    let loopTimer = null;

    controls.onDirection((dir) => {
        game.setDirection(dir);
    });

    // Preload food images
    const foodImages = {
        angela: new Image(),
        tangyuan: new Image(),
    };
    foodImages.angela.src = "assets/angela.png";
    foodImages.tangyuan.src = "assets/tangyuan.png";

    function getSelectedSpeed() {
        const checked = document.querySelector('input[name="speed"]:checked');
        return checked ? checked.value : "normal";
    }

    function getSelectedFood() {
        const checked = document.querySelector('input[name="food"]:checked');
        return checked ? checked.value : "angela";
    }

    function startGame() {
        const speed = getSelectedSpeed();
        const interval = SPEED_MAP[speed];

        const foodChoice = getSelectedFood();
        game.foodImage = foodImages[foodChoice];

        const foodName = foodChoice === "angela" ? "Angela" : "Tangyuan";
        titleEl.textContent = "Xixi Eats " + foodName;
        document.title = "Xixi Eats " + foodName;

        game.reset();
        resizeCanvas();
        scoreEl.textContent = "0";
        scoreDisplay.classList.add("visible");
        startScreen.classList.add("hidden");
        gameOverScreen.classList.add("hidden");

        game.darkMode = isDark();
        game.render();

        loopTimer = setInterval(() => {
            game.darkMode = isDark();
            game.update();

            if (game.isGameOver) {
                clearInterval(loopTimer);
                loopTimer = null;
                showGameOver();
                return;
            }

            scoreEl.textContent = game.score;
            game.render();
        }, interval);
    }

    function showGameOver() {
        finalScoreEl.textContent = game.score;
        scoreDisplay.classList.remove("visible");
        gameOverScreen.classList.remove("hidden");
    }

    startBtn.addEventListener("click", startGame);
    restartBtn.addEventListener("click", startGame);

    // Allow space bar to start/restart
    document.addEventListener("keydown", (e) => {
        if (e.key === " " || e.code === "Space") {
            if (!startScreen.classList.contains("hidden")) {
                e.preventDefault();
                startGame();
            } else if (!gameOverScreen.classList.contains("hidden")) {
                e.preventDefault();
                startGame();
            }
        }
    });
});
