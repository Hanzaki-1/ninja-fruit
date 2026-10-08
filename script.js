```javascript
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    const menu = $("menu");
    const modeScreen = $("modeScreen");
    const gameOver = $("gameOver");
    const topBar = $("topBar");
    const canvas = $("canvas");
    const ctx = canvas.getContext("2d");

    const zenMusic = $("zenMusic");
    const musicButton = $("musicButton");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = 1;

    let mode = "classic";
    let running = false;
    let score = 0;
    let lives = 3;
    let combo = 0;
    let lastSliceTime = 0;

    let fruits = [];
    let particles = [];
    let trail = [];

    let spawnTimer = 0;
    let lastTime = 0;
    let animationId = null;

    let slicing = false;
    let lastPoint = null;
    let modeSwipeStart = null;
    let musicOn = true;

    const fruitTypes = [
        { emoji: "🍉", color: "#ff477e" },
        { emoji: "🍊", color: "#ff9f1c" },
        { emoji: "🍎", color: "#ff3b30" },
        { emoji: "🍍", color: "#ffd60a" },
        { emoji: "🥝", color: "#8ac926" },
        { emoji: "🍑", color: "#ffadad" },
        { emoji: "🍌", color: "#ffe66d" }
    ];

    /* =================================
       SCREEN MANAGEMENT
    ================================= */

    function showScreen(target) {
        [menu, modeScreen, gameOver].forEach(screen => {
            screen.classList.add("hidden");
        });

        if (target) target.classList.remove("hidden");

        if (topBar) {
            topBar.classList.toggle("hidden", target !== null);
        }

        musicButton.classList.remove("hidden");
    }

    $("startBtn").addEventListener("click", () => {
        running = false;
        showScreen(modeScreen);
    });

    $("backBtn").addEventListener("click", () => {
        running = false;
        showScreen(menu);
    });

    $("classicBtn").addEventListener("click", () => startGame("classic"));
    $("zenBtn").addEventListener("click", () => startGame("zen"));

    $("restartBtn").addEventListener("click", () => {
        showScreen(modeScreen);
    });

    $("menuBtn").addEventListener("click", () => {
        running = false;
        showScreen(menu);
    });

    /* =================================
       CANVAS SETUP
    ================================= */

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    /* =================================
       HUD
    ================================= */

    function updateHUD() {
        $("score").textContent = score;
        $("combo").textContent = combo;
        $("lives").textContent = "❤️".repeat(Math.max(0, lives));
    }

    /* =================================
       AUDIO
    ================================= */

    musicButton.addEventListener("click", () => {
        musicOn = !musicOn;
        musicButton.textContent = musicOn ? "🔊" : "🔇";

        if (!musicOn) {
            zenMusic.pause();
        } else if (running) {
            zenMusic.play().catch(() => {});
        }
    });

    function startMusic() {
        if (musicOn) {
            zenMusic.play().catch(() => {});
        }
    }

    /* =================================
       START GAME
    ================================= */

    function startGame(selectedMode) {
        mode = selectedMode;
        score = 0;
        lives = 3;
        combo = 0;
        lastSliceTime = 0;

        fruits = [];
        particles = [];
        trail = [];

        spawnTimer = 0;
        lastTime = 0;
        slicing = false;
        lastPoint = null;

        running = true;

        if (animationId !== null) {
            cancelAnimationFrame(animationId);
        }

        showScreen(null);
        updateHUD();
        startMusic();

        animationId = requestAnimationFrame(gameLoop);
    }

    /* =================================
       FRUIT SPAWNING
    ================================= */

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function spawnWave() {
        const count = Math.floor(random(3, 6));

        for (let i = 0; i < count; i++) {
            const fruit = fruitTypes[
                Math.floor(Math.random() * fruitTypes.length)
            ];

            const isBomb = mode === "classic" && Math.random() < 0.14;

            fruits.push({
                x: random(35, Math.max(36, width - 35)),
                y: height + random(15, 100),
                vx: random(-3.2, 3.2),
                vy: random(-15, -10),
                gravity: 0.27,
                radius: 25,
                emoji: isBomb ? "💣" : fruit.emoji,
                color: isBomb ? "#707070" : fruit.color,
                bomb: isBomb,
                sliced: false
            });
        }
    }

    /* =================================
       PARTICLES
    ================================= */

    function burst(x, y, color) {
        for (let i = 0; i < 14; i++) {
            particles.push({
                x,
                y,
                vx: random(-4.5, 4.5),
                vy: random(-5, 3),
                life: 1,
                color,
                radius: random(2, 5)
            });
        }
    }

    /* =================================
       SLICE COLLISION
    ================================= */

    function segmentDistance(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;

        if (lengthSquared === 0) {
            return Math.hypot(px - x1, py - y1);
        }

        const t = Math.max(0, Math.min(1,
            ((px - x1) * dx + (py - y1) * dy) / lengthSquared
        ));

        return Math.hypot(
            px - (x1 + t * dx),
            py - (y1 + t * dy)
        );
    }

    function sliceBetween(x1, y1, x2, y2) {
        const now = performance.now();

        for (const fruit of fruits) {
            if (fruit.sliced) continue;

            const distance = segmentDistance(
                fruit.x, fruit.y, x1, y1, x2, y2
            );

            if (distance > fruit.radius + 9) continue;

            fruit.sliced = true;
            burst(fruit.x, fruit.y, fruit.color);

            if (fruit.bomb) {
                lives--;
                combo = 0;
                updateHUD();

                if (lives <= 0) {
                    endGame();
                    return;
                }

                continue;
            }

            combo = now - lastSliceTime < 850 ? combo + 1 : 1;
            lastSliceTime = now;

            score += combo >= 3 ? 20 : 10;
            updateHUD();
        }
    }

    /* =================================
       PLAYER SWIPING
    ================================= */

    function pointFromEvent(event) {
        return { x: event.clientX, y: event.clientY };
    }

    canvas.addEventListener("pointerdown", event => {
        if (!running) return;

        slicing = true;
        lastPoint = pointFromEvent(event);

        try {
            canvas.setPointerCapture(event.pointerId);
        } catch (_) {}
    });

    canvas.addEventListener("pointermove", event => {
        if (!running || !slicing || !lastPoint) return;

        const current = pointFromEvent(event);

        trail.push({
            x: current.x,
            y: current.y,
            life: 1
        });

        sliceBetween(
            lastPoint.x,
            lastPoint.y,
            current.x,
            current.y
        );

        lastPoint = current;
    });

    function stopSlicing() {
        slicing = false;
        lastPoint = null;
    }

    canvas.addEventListener("pointerup", stopSlicing);
    canvas.addEventListener("pointercancel", stopSlicing);
    canvas.addEventListener("lostpointercapture", stopSlicing);

    /* =================================
       MODE RING SWIPE SELECTION
    ================================= */

    modeScreen.addEventListener("pointerdown", event => {
        modeSwipeStart = {
            x: event.clientX,
            y: event.clientY
        };
    });

    modeScreen.addEventListener("pointerup", event => {
        if (!modeSwipeStart) return;

        const start = modeSwipeStart;
        modeSwipeStart = null;

        const distance = Math.hypot(
            event.clientX - start.x,
            event.clientY - start.y
        );

        // Normal taps are handled by the mode buttons.
        if (distance < 35) return;

        const target = document.elementFromPoint(
            event.clientX,
            event.clientY
        );

        if (target && target.closest("#classicBtn")) {
            startGame("classic");
        } else if (target && target.closest("#zenBtn")) {
            startGame("zen");
        } else if (event.clientX < width / 2) {
            startGame("classic");
        } else {
            startGame("zen");
        }
    });

    modeScreen.addEventListener("pointercancel", () => {
        modeSwipeStart = null;
    });

    /* =================================
       GAME OVER
    ================================= */

    function endGame() {
        if (!running) return;

        running = false;
        slicing = false;

        zenMusic.pause();
        $("finalScore").textContent = score;

        showScreen(gameOver);
    }

    /* =================================
       BACKGROUND
    ================================= */

    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, width, height);

        gradient.addColorStop(0, "#100b2e");
        gradient.addColorStop(0.55, "#191144");
        gradient.addColorStop(1, "#071a2e");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#ffffff";

        for (let i = 0; i < 40; i++) {
            const x = (i * 137 + 29) % width;
            const y = (i * 83 + 17) % height;

            ctx.beginPath();
            ctx.arc(x, y, i % 3 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /* =================================
       DRAW OBJECTS
    ================================= */

    function drawFruits() {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const fruit of fruits) {
            if (fruit.sliced) continue;

            ctx.font = "46px serif";
            ctx.fillText(fruit.emoji, fruit.x, fruit.y);
        }
    }

    function drawParticles() {
        for (const particle of particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, particle.life);
            ctx.fillStyle = particle.color;

            ctx.beginPath();
            ctx.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.restore();
        }
    }

    function drawTrail() {
        if (trail.length < 2) return;

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < trail.length; i++) {
            const a = trail[i - 1];
            const b = trail[i];

            ctx.globalAlpha = Math.max(0, b.life);
            ctx.strokeStyle = "#8ffcff";
            ctx.lineWidth = 3 + b.life * 5;
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#00eaff";

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /* =================================
       UPDATE GAME
    ================================= */

    function gameLoop(time) {
        if (!running) return;

        const delta = lastTime
            ? Math.min((time - lastTime) / 16.67, 2)
            : 1;

        lastTime = time;

        drawBackground();

        spawnTimer += delta;

        if (spawnTimer > 48) {
            spawnWave();
            spawnTimer = 0;
        }

        for (const fruit of fruits) {
            if (fruit.sliced) continue;

            fruit.x += fruit.vx * delta;
            fruit.y += fruit.vy * delta;
            fruit.vy += fruit.gravity * delta;
        }

        fruits = fruits.filter(fruit =>
            !fruit.sliced && fruit.y < height + 100
        );

        for (const particle of particles) {
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.vy += 0.15 * delta;
            particle.life -= 0.025 * delta;
        }

        particles = particles.filter(p => p.life > 0);

        for (const point of trail) {
            point.life -= 0.09 * delta;
        }

        trail = trail.filter(point => point.life > 0);

        drawFruits();
        drawParticles();
        drawTrail();

        animationId = requestAnimationFrame(gameLoop);
    }

    /* =================================
       INITIALIZE
    ================================= */

    showScreen(menu);
    updateHUD();

    console.log("Ninja Fruit is ready!");
});
```
