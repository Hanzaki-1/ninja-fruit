```javascript
"use strict";

/* ========================================
   NINJA FRUIT — GAME SCRIPT
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Find page elements
    const menu = document.getElementById("menu");
    const modeScreen = document.getElementById("modeScreen");
    const gameOver = document.getElementById("gameOver");

    const startBtn = document.getElementById("startBtn");
    const classicBtn = document.getElementById("classicBtn");
    const zenBtn = document.getElementById("zenBtn");
    const backBtn = document.getElementById("backBtn");
    const restartBtn = document.getElementById("restartBtn");

    const canvas = document.getElementById("canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    const scoreElement = document.getElementById("score");
    const comboElement = document.getElementById("combo");
    const livesElement = document.getElementById("lives");
    const musicButton = document.getElementById("musicButton");
    const zenMusic = document.getElementById("zenMusic");

    // Check that the required HTML exists
    if (!menu || !modeScreen || !startBtn) {
        console.error(
            "Ninja Fruit: Missing #menu, #modeScreen or #startBtn. Check index.html IDs."
        );
        return;
    }

    /* ========================================
       GAME STATE
    ======================================== */

    let gameRunning = false;
    let gameMode = "classic";
    let score = 0;
    let lives = 3;
    let combo = 0;
    let lastSliceTime = 0;

    let objects = [];
    let particles = [];
    let bladeTrail = [];

    let pointerDown = false;
    let previousPointer = null;
    let spawnTimer = 0;
    let lastFrameTime = 0;
    let animationFrame = 0;
    let musicEnabled = true;

    /* ========================================
       SCREEN HELPERS
    ======================================== */

    function showScreen(screenToShow) {
        [menu, modeScreen, gameOver].forEach(screen => {
            if (screen) screen.classList.add("hidden");
        });

        if (screenToShow) {
            screenToShow.classList.remove("hidden");
        }
    }

    function openModeScreen() {
        console.log("Start Game clicked — opening mode selection.");
        gameRunning = false;
        showScreen(modeScreen);
    }

    function returnToMenu() {
        gameRunning = false;
        showScreen(menu);
    }

    /* ========================================
       START BUTTON
    ======================================== */

    startBtn.addEventListener("click", event => {
        event.preventDefault();
        openModeScreen();
    });

    if (backBtn) {
        backBtn.addEventListener("click", event => {
            event.preventDefault();
            returnToMenu();
        });
    }

    /* ========================================
       CANVAS SIZE
    ======================================== */

    function resizeCanvas() {
        if (!canvas || !ctx) return;

        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(window.innerWidth * ratio);
        canvas.height = Math.floor(window.innerHeight * ratio);

        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    if (canvas && ctx) {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    }

    /* ========================================
       SCORE DISPLAY
    ======================================== */

    function updateHUD() {
        if (scoreElement) scoreElement.textContent = score;
        if (comboElement) comboElement.textContent = combo;
        if (livesElement) {
            livesElement.textContent = "❤️".repeat(Math.max(0, lives));
        }
    }

    /* ========================================
       START A GAME
    ======================================== */

    function startGame(mode) {
        gameMode = mode;
        score = 0;
        lives = 3;
        combo = 0;

        objects = [];
        particles = [];
        bladeTrail = [];

        spawnTimer = 0;
        lastSliceTime = 0;
        lastFrameTime = 0;

        gameRunning = true;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        showScreen(null);
        updateHUD();

        // Audio can be blocked until the player interacts.
        if (musicEnabled && zenMusic) {
            zenMusic.play().catch(() => {
                console.log("Music will play when the browser allows it.");
            });
        }

        animationFrame = requestAnimationFrame(gameLoop);
    }

    if (classicBtn) {
        classicBtn.addEventListener("click", event => {
            event.preventDefault();
            startGame("classic");
        });
    }

    if (zenBtn) {
        zenBtn.addEventListener("click", event => {
            event.preventDefault();
            startGame("zen");
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener("click", event => {
            event.preventDefault();
            showScreen(modeScreen);
        });
    }

    /* ========================================
       MUSIC BUTTON
    ======================================== */

    if (musicButton) {
        musicButton.addEventListener("click", () => {
            musicEnabled = !musicEnabled;

            if (musicEnabled) {
                musicButton.textContent = "🔊";

                if (zenMusic) {
                    zenMusic.play().catch(() => {});
                }
            } else {
                musicButton.textContent = "🔇";

                if (zenMusic) {
                    zenMusic.pause();
                }
            }
        });
    }

    /* ========================================
       GAME OBJECTS
    ======================================== */

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function spawnObjects() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const fruitTypes = [
            { emoji: "🍉", color: "#ff477e" },
            { emoji: "🍊", color: "#ff9f1c" },
            { emoji: "🍎", color: "#ff3b30" },
            { emoji: "🍍", color: "#ffd60a" },
            { emoji: "🥝", color: "#8ac926" },
            { emoji: "🍑", color: "#ffadad" },
            { emoji: "🍌", color: "#ffe66d" }
        ];

        const count = Math.floor(randomBetween(3, 6));

        for (let i = 0; i < count; i++) {
            const fruit = fruitTypes[
                Math.floor(Math.random() * fruitTypes.length)
            ];

            objects.push({
                x: randomBetween(40, Math.max(41, width - 40)),
                y: height + randomBetween(20, 120),
                vx: randomBetween(-3, 3),
                vy: randomBetween(-15, -10),
                gravity: 0.28,
                radius: 27,
                emoji: fruit.emoji,
                color: fruit.color,
                sliced: false,
                missed: false,
                isBomb: gameMode === "classic" && Math.random() < 0.13
            });
        }
    }

    /* ========================================
       PARTICLES
    ======================================== */

    function makeParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            particles.push({
                x,
                y,
                vx: randomBetween(-4, 4),
                vy: randomBetween(-5, 3),
                life: 1,
                color
            });
        }
    }

    /* ========================================
       SLICE DETECTION
    ======================================== */

    function distanceToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (dx === 0 && dy === 0) {
            return Math.hypot(px - x1, py - y1);
        }

        const t = Math.max(
            0,
            Math.min(
                1,
                ((px - x1) * dx + (py - y1) * dy) /
                (dx * dx + dy * dy)
            )
        );

        const nearestX = x1 + t * dx;
        const nearestY = y1 + t * dy;

        return Math.hypot(px - nearestX, py - nearestY);
    }

    function sliceObjects(x1, y1, x2, y2) {
        const now = performance.now();

        for (const object of objects) {
            if (object.sliced || object.missed) continue;

            const distance = distanceToSegment(
                object.x,
                object.y,
                x1,
                y1,
                x2,
                y2
            );

            if (distance < object.radius + 10) {
                object.sliced = true;

                if (object.isBomb) {
                    lives--;
                    combo = 0;
                    makeParticles(object.x, object.y, "#555555");
                    updateHUD();

                    if (lives <= 0) {
                        endGame();
                        return;
                    }
                } else {
                    if (now - lastSliceTime < 900) {
                        combo++;
                    } else {
                        combo = 1;
                    }

                    lastSliceTime = now;

                    score += combo >= 3 ? 20 : 10;

                    makeParticles(object.x, object.y, object.color);
                    updateHUD();
                }
            }
        }
    }

    /* ========================================
       POINTER / TOUCH CONTROLS
    ======================================== */

    function pointerPosition(event) {
        return {
            x: event.clientX,
            y: event.clientY
        };
    }

    if (canvas) {
        canvas.addEventListener("pointerdown", event => {
            if (!gameRunning) return;

            pointerDown = true;
            previousPointer = pointerPosition(event);

            if (canvas.setPointerCapture) {
                try {
                    canvas.setPointerCapture(event.pointerId);
                } catch (_) {}
            }
        });

        canvas.addEventListener("pointermove", event => {
            if (!gameRunning || !pointerDown) return;

            const current = pointerPosition(event);

            if (previousPointer) {
                bladeTrail.push({
                    x: current.x,
                    y: current.y,
                    life: 1
                });

                sliceObjects(
                    previousPointer.x,
                    previousPointer.y,
                    current.x,
                    current.y
                );
            }

            previousPointer = current;
        });

        function stopPointer() {
            pointerDown = false;
            previousPointer = null;
        }

        canvas.addEventListener("pointerup", stopPointer);
        canvas.addEventListener("pointercancel", stopPointer);
        canvas.addEventListener("pointerleave", stopPointer);
    }

    /* ========================================
       END GAME
    ======================================== */

    function endGame() {
        gameRunning = false;

        if (gameOver) {
            const finalScore = document.getElementById("finalScore");
            if (finalScore) finalScore.textContent = score;

            showScreen(gameOver);
        } else {
            showScreen(modeScreen);
            alert("Game over! Your score: " + score);
        }

        if (zenMusic) zenMusic.pause();
    }

    /* ========================================
       DRAWING
    ======================================== */

    function drawBackground() {
        const gradient = ctx.createLinearGradient(
            0, 0, window.innerWidth, window.innerHeight
        );

        gradient.addColorStop(0, "#100b2e");
        gradient.addColorStop(0.5, "#171044");
        gradient.addColorStop(1, "#071a2e");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Decorative stars
        ctx.save();
        ctx.globalAlpha = 0.35;

        for (let i = 0; i < 45; i++) {
            const x = (i * 137) % window.innerWidth;
            const y = (i * 83) % window.innerHeight;

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x, y, (i % 3) + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function drawObjects() {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const object of objects) {
            if (object.sliced || object.missed) continue;

            if (object.isBomb) {
                ctx.font = "48px serif";
                ctx.fillText("💣", object.x, object.y);
            } else {
                ctx.font = "48px serif";
                ctx.fillText(object.emoji, object.x, object.y);
            }
        }
    }

    function drawParticles() {
        for (const particle of particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, particle.life);
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawBlade() {
        if (bladeTrail.length < 2) return;

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < bladeTrail.length; i++) {
            const previous = bladeTrail[i - 1];
            const current = bladeTrail[i];

            ctx.globalAlpha = Math.max(0, current.life);
            ctx.strokeStyle = "#8ffcff";
            ctx.lineWidth = 3 + current.life * 5;
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#00eaff";

            ctx.beginPath();
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(current.x, current.y);
            ctx.stroke();
        }

        ctx.restore();
    }

    /* ========================================
       MAIN GAME LOOP
    ======================================== */

    function gameLoop(timestamp) {
        if (!gameRunning || !ctx) return;

        const delta = lastFrameTime
            ? Math.min((timestamp - lastFrameTime) / 16.67, 2)
            : 1;

        lastFrameTime = timestamp;

        drawBackground();

        spawnTimer += delta;

        if (spawnTimer > 55) {
            spawnObjects();
            spawnTimer = 0;
        }

        for (const object of objects) {
            if (object.sliced || object.missed) continue;

            object.x += object.vx * delta;
            object.y += object.vy * delta;
            object.vy += object.gravity * delta;

            if (object.y > window.innerHeight + 80) {
                object.missed = true;
            }
        }

        // Remove old objects
        objects = objects.filter(object =>
            !object.sliced &&
            !object.missed &&
            object.y < window.innerHeight + 150
        );

        for (const particle of particles) {
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.vy += 0.15 * delta;
            particle.life -= 0.025 * delta;
        }

        particles = particles.filter(particle => particle.life > 0);

        for (const point of bladeTrail) {
            point.life -= 0.08 * delta;
        }

        bladeTrail = bladeTrail.filter(point => point.life > 0);

        drawObjects();
        drawParticles();
        drawBlade();

        animationFrame = requestAnimationFrame(gameLoop);
    }

    /* ========================================
       MODE RING SWIPE SUPPORT
       Swipe across a ring to choose a mode.
       Buttons remain tappable too.
    ======================================== */

    let modePointerStart = null;

    if (modeScreen) {
        modeScreen.addEventListener("pointerdown", event => {
            modePointerStart = {
                x: event.clientX,
                y: event.clientY
            };
        });

        modeScreen.addEventListener("pointerup", event => {
            if (!modePointerStart) return;

            const startX = modePointerStart.x;
            const startY = modePointerStart.y;
            const endX = event.clientX;
            const endY = event.clientY;

            const distance = Math.hypot(
                endX - startX,
                endY - startY
            );

            modePointerStart = null;

            // A tap is handled by the ring buttons.
            if (distance < 35) return;

            const element = document.elementFromPoint(endX, endY);

            if (element && element.closest("#classicBtn")) {
                startGame("classic");
                return;
            }

            if (element && element.closest("#zenBtn")) {
                startGame("zen");
                return;
            }

            // If the swipe ends on the left or right half of the screen,
            // choose the corresponding mode.
            if (endX < window.innerWidth / 2) {
                startGame("classic");
            } else {
                startGame("zen");
            }
        });
    }

    /* ========================================
       INITIAL SCREEN
    ======================================== */

    showScreen(menu);
    updateHUD();

    console.log("Ninja Fruit loaded successfully.");
});
```
