```javascript
"use strict";


/* =====================================
   ELEMENTS
===================================== */

const modeScreen =
    document.getElementById("modeScreen");

const gameScreen =
    document.getElementById("gameScreen");

const gameOver =
    document.getElementById("gameOver");

const classicBtn =
    document.getElementById("classicBtn");

const zenBtn =
    document.getElementById("zenBtn");

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");

const scoreText =
    document.getElementById("score");

const comboText =
    document.getElementById("combo");

const livesText =
    document.getElementById("lives");

const finalScore =
    document.getElementById("finalScore");

const restartBtn =
    document.getElementById("restartBtn");

const menuBtn =
    document.getElementById("menuBtn");

const musicButton =
    document.getElementById("musicButton");

const music =
    document.getElementById("zenMusic");


/* =====================================
   GAME DATA
===================================== */

let gameMode = "classic";

let score = 0;
let combo = 0;
let lives = 3;

let fruits = [];
let particles = [];
let blade = [];

let running = false;

let lastTime = 0;
let spawnTimer = 0;

let slicing = false;
let previousPoint = null;

let musicOn = true;


/* =====================================
   CANVAS
===================================== */

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* =====================================
   SCREEN CONTROL
===================================== */

function showModeScreen() {

    modeScreen.classList.remove("hidden");

    gameScreen.classList.add("hidden");

    gameOver.classList.add("hidden");

    running = false;

}


function showGame() {

    modeScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

    gameOver.classList.add("hidden");

}


/* =====================================
   MODE BUTTONS
===================================== */

/*
    SIMPLE CLICK EVENTS ONLY.
*/

classicBtn.addEventListener(
    "click",
    function () {

        console.log("CLASSIC SELECTED");

        startGame("classic");

    }
);


zenBtn.addEventListener(
    "click",
    function () {

        console.log("ZEN SELECTED");

        startGame("zen");

    }
);


/* =====================================
   START GAME
===================================== */

function startGame(mode) {

    console.log(
        "GAME START:",
        mode
    );

    gameMode = mode;

    score = 0;
    combo = 0;
    lives = 3;

    fruits = [];
    particles = [];
    blade = [];

    spawnTimer = 0;
    lastTime = 0;

    slicing = false;
    previousPoint = null;

    updateHUD();

    showGame();

    running = true;

    playMusic();

    requestAnimationFrame(gameLoop);

}


/* =====================================
   MUSIC
===================================== */

function playMusic() {

    if (!musicOn) return;

    music.volume = 0.35;

    music.play().catch(
        function () {}
    );

}


function stopMusic() {

    music.pause();

    music.currentTime = 0;

}


musicButton.addEventListener(
    "click",
    function () {

        musicOn = !musicOn;

        if (musicOn) {

            musicButton.textContent =
                "🔊";

            playMusic();

        } else {

            musicButton.textContent =
                "🔇";

            stopMusic();

        }

    }
);


/* =====================================
   HUD
===================================== */

function updateHUD() {

    scoreText.textContent =
        score;

    comboText.textContent =
        combo;

    livesText.textContent =
        "❤️".repeat(
            Math.max(0, lives)
        );

}


/* =====================================
   FRUITS
===================================== */

const fruitTypes = [
    "🍎",
    "🍊",
    "🍉",
    "🍌",
    "🍓",
    "🥝",
    "🍍",
    "🥥"
];


function spawnFruit() {

    const size = 55;

    const x =
        Math.random() *
        (canvas.width - size * 2) +
        size;

    const y =
        canvas.height + size;

    const vx =
        (Math.random() - 0.5) * 7;

    const vy =
        -(Math.random() * 9 + 12);

    let bomb = false;


    if (gameMode === "classic") {

        bomb =
            Math.random() < 0.14;

    }


    const emoji =
        bomb
            ? "💣"
            : fruitTypes[
                Math.floor(
                    Math.random() *
                    fruitTypes.length
                )
            ];


    fruits.push({

        x: x,
        y: y,

        vx: vx,
        vy: vy,

        gravity: 0.35,

        size: size,

        emoji: emoji,

        bomb: bomb,

        sliced: false

    });

}


/* =====================================
   PARTICLES
===================================== */

function createParticles(
    x,
    y,
    emoji
) {

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        particles.push({

            x: x,
            y: y,

            vx:
                (Math.random() - 0.5) * 8,

            vy:
                (Math.random() - 0.5) * 8,

            life: 1,

            emoji: emoji

        });

    }

}


/* =====================================
   LINE COLLISION
===================================== */

function distanceToLine(
    px,
    py,
    x1,
    y1,
    x2,
    y2
) {

    const dx =
        x2 - x1;

    const dy =
        y2 - y1;


    if (
        dx === 0 &&
        dy === 0
    ) {

        return Math.hypot(
            px - x1,
            py - y1
        );

    }


    const t =
        (
            (px - x1) * dx +
            (py - y1) * dy
        ) /
        (
            dx * dx +
            dy * dy
        );


    const clamped =
        Math.max(
            0,
            Math.min(1, t)
        );


    const closestX =
        x1 + clamped * dx;

    const closestY =
        y1 + clamped * dy;


    return Math.hypot(
        px - closestX,
        py - closestY
    );

}


/* =====================================
   SLICE
===================================== */

function checkSlice(
    x1,
    y1,
    x2,
    y2
) {

    for (const fruit of fruits) {

        if (fruit.sliced) {
            continue;
        }


        const distance =
            distanceToLine(
                fruit.x,
                fruit.y,
                x1,
                y1,
                x2,
                y2
            );


        if (
            distance <
            fruit.size * 0.75
        ) {

            fruit.sliced = true;


            if (fruit.bomb) {

                lives--;

                combo = 0;

                createParticles(
                    fruit.x,
                    fruit.y,
                    "💥"
                );

                updateHUD();


                if (lives <= 0) {

                    endGame();

                }

            } else {

                score += 10;

                combo++;


                if (combo >= 3) {

                    score +=
                        combo * 2;

                }


                createParticles(
                    fruit.x,
                    fruit.y,
                    fruit.emoji
                );

                updateHUD();

            }

        }

    }

}


/* =====================================
   PLAYER SLICING
===================================== */

canvas.addEventListener(
    "pointerdown",
    function (event) {

        if (!running) return;

        slicing = true;

        previousPoint = {

            x: event.clientX,
            y: event.clientY

        };

        blade = [
            previousPoint
        ];

    }
);


canvas.addEventListener(
    "pointermove",
    function (event) {

        if (
            !slicing ||
            !running
        ) {
            return;
        }


        const currentPoint = {

            x: event.clientX,
            y: event.clientY

        };


        if (previousPoint) {

            checkSlice(
                previousPoint.x,
                previousPoint.y,
                currentPoint.x,
                currentPoint.y
            );

        }


        blade.push(
            currentPoint
        );


        if (
            blade.length > 12
        ) {

            blade.shift();

        }


        previousPoint =
            currentPoint;

    }
);


function stopSlicing() {

    slicing = false;

    previousPoint = null;

}


canvas.addEventListener(
    "pointerup",
    stopSlicing
);

canvas.addEventListener(
    "pointercancel",
    stopSlicing
);

canvas.addEventListener(
    "pointerleave",
    stopSlicing
);


/* =====================================
   GAME LOOP
===================================== */

function gameLoop(time) {

    if (!running) {
        return;
    }


    if (!lastTime) {

        lastTime = time;

    }


    const delta =
        Math.min(
            (time - lastTime) / 16.67,
            2
        );


    lastTime = time;


    update(delta);

    draw();


    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================
   UPDATE
===================================== */

function update(delta) {

    spawnTimer += delta;


    const spawnRate =
        gameMode === "zen"
            ? 28
            : 34;


    if (
        spawnTimer >
        spawnRate
    ) {

        spawnFruit();

        spawnTimer = 0;

    }


    for (
        let i = fruits.length - 1;
        i >= 0;
        i--
    ) {

        const fruit =
            fruits[i];


        fruit.vy +=
            fruit.gravity * delta;


        fruit.x +=
            fruit.vx * delta;


        fruit.y +=
            fruit.vy * delta;


        if (
            fruit.y >
            canvas.height + 100
        ) {

            if (
                !fruit.sliced
            ) {

                combo = 0;

                updateHUD();

            }


            fruits.splice(
                i,
                1
            );

        }

    }


    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];


        p.x +=
            p.vx * delta;

        p.y +=
            p.vy * delta;

        p.vy +=
            0.25 * delta;

        p.life -=
            0.035 * delta;


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }


    for (const point of blade) {

        point.life =
            (point.life || 1) -
            0.08 * delta;

    }


    blade =
        blade.filter(
            function (point) {

                return point.life > 0;

            }
        );

}


/* =====================================
   DRAW
===================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* FRUIT */

    for (
        const fruit of fruits
    ) {

        ctx.font =
            fruit.size +
            "px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            fruit.emoji,
            fruit.x,
            fruit.y
        );

    }


    /* PARTICLES */

    for (
        const p of particles
    ) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life
            );

        ctx.font =
            "24px Arial";

        ctx.fillText(
            p.emoji,
            p.x,
            p.y
        );

    }


    ctx.globalAlpha = 1;


    /* BLADE */

    if (
        blade.length > 1
    ) {

        ctx.beginPath();


        ctx.moveTo(
            blade[0].x,
            blade[0].y
        );


        for (
            let i = 1;
            i < blade.length;
            i++
        ) {

            ctx.lineTo(
                blade[i].x,
                blade[i].y
            );

        }


        ctx.strokeStyle =
            "rgba(255,255,255,0.9)";

        ctx.lineWidth = 5;

        ctx.lineCap = "round";

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            "rgba(0,255,255,0.9)";

        ctx.stroke();

        ctx.shadowBlur = 0;

    }

}


/* =====================================
   GAME OVER
===================================== */

function endGame() {

    running = false;

    finalScore.textContent =
        score;

    gameScreen.classList.add(
        "hidden"
    );

    gameOver.classList.remove(
        "hidden"
    );

}


/* =====================================
   RESTART
===================================== */

restartBtn.addEventListener(
    "click",
    function () {

        startGame(
            gameMode
        );

    }
);


/* =====================================
   MENU
===================================== */

menuBtn.addEventListener(
    "click",
    function () {

        stopMusic();

        showModeScreen();

    }
);


/* =====================================
   INITIAL STATE
===================================== */

showModeScreen();

console.log(
    "NINJA FRUIT READY"
);
```
