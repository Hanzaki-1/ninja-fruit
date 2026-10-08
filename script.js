```javascript
"use strict";

/* ==========================================
   NINJA FRUIT
   MODE SLICE SELECTION
========================================== */


/* ==========================================
   ELEMENTS
========================================== */

const modeScreen = document.getElementById("modeScreen");

const classicBtn = document.getElementById("classicBtn");
const zenBtn = document.getElementById("zenBtn");

const gameScreen = document.getElementById("gameScreen");
const gameOver = document.getElementById("gameOver");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const livesText = document.getElementById("lives");

const finalScore = document.getElementById("finalScore");

const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");

const musicButton = document.getElementById("musicButton");
const music = document.getElementById("zenMusic");


/* ==========================================
   GAME VARIABLES
========================================== */

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


/* ==========================================
   CANVAS
========================================== */

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* ==========================================
   SCREEN FUNCTIONS
========================================== */

function showModeScreen() {

    modeScreen.classList.remove("hidden");

    gameScreen.classList.add("hidden");

    gameOver.classList.add("hidden");

    running = false;

}


function showGame() {

    modeScreen.classList.add("hidden");

    gameOver.classList.add("hidden");

    gameScreen.classList.remove("hidden");

}


function showGameOver() {

    running = false;

    finalScore.textContent = score;

    gameScreen.classList.add("hidden");

    modeScreen.classList.add("hidden");

    gameOver.classList.remove("hidden");

}


/* ==========================================
   MODE BUTTONS
========================================== */

classicBtn.addEventListener("click", function () {

    startGame("classic");

});


zenBtn.addEventListener("click", function () {

    startGame("zen");

});


/* ==========================================
   MODE SLICE
========================================== */

let modeSliceStart = null;

modeScreen.addEventListener("pointerdown", function (event) {

    modeSliceStart = {
        x: event.clientX,
        y: event.clientY
    };

});


modeScreen.addEventListener("pointermove", function (event) {

    if (!modeSliceStart) return;

    const dx = event.clientX - modeSliceStart.x;
    const dy = event.clientY - modeSliceStart.y;

    const distance = Math.sqrt(
        dx * dx + dy * dy
    );

    /*
       Only trigger after a real swipe.
       This prevents accidental selection.
    */

    if (distance < 45) return;


    /*
       Determine where the swipe started.

       Left side = CLASSIC
       Right side = ZEN
    */

    if (modeSliceStart.x < window.innerWidth / 2) {

        startGame("classic");

    } else {

        startGame("zen");

    }

    modeSliceStart = null;

});


modeScreen.addEventListener("pointerup", function () {

    modeSliceStart = null;

});


modeScreen.addEventListener("pointercancel", function () {

    modeSliceStart = null;

});


/* ==========================================
   START GAME
========================================== */

function startGame(mode) {

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

    running = true;

    updateHUD();

    showGame();

    playMusic();

    requestAnimationFrame(gameLoop);

}


/* ==========================================
   MUSIC
========================================== */

function playMusic() {

    if (!musicOn) return;

    music.play().catch(function () {});

}


musicButton.addEventListener("click", function () {

    musicOn = !musicOn;

    if (musicOn) {

        musicButton.textContent = "🔊";

        if (running) {
            music.play().catch(function () {});
        }

    } else {

        musicButton.textContent = "🔇";

        music.pause();

    }

});


/* ==========================================
   HUD
========================================== */

function updateHUD() {

    scoreText.textContent = score;

    comboText.textContent = combo;

    livesText.textContent =
        "❤️".repeat(Math.max(0, lives));

}


/* ==========================================
   FRUIT DATA
========================================== */

const fruitTypes = [

    {
        emoji: "🍉",
        color: "#ff477e"
    },

    {
        emoji: "🍊",
        color: "#ff9f1c"
    },

    {
        emoji: "🍎",
        color: "#ff3b30"
    },

    {
        emoji: "🍍",
        color: "#ffd60a"
    },

    {
        emoji: "🥝",
        color: "#8ac926"
    },

    {
        emoji: "🍑",
        color: "#ffadad"
    },

    {
        emoji: "🍌",
        color: "#ffe66d"
    }

];


/* ==========================================
   RANDOM
========================================== */

function random(min, max) {

    return Math.random() * (max - min) + min;

}


/* ==========================================
   SPAWN FRUIT
========================================== */

function spawnFruit() {

    const fruit =
        fruitTypes[
            Math.floor(
                Math.random() *
                fruitTypes.length
            )
        ];


    const bomb =
        gameMode === "classic" &&
        Math.random() < 0.14;


    fruits.push({

        x: random(
            35,
            canvas.width - 35
        ),

        y:
            canvas.height + 50,

        vx:
            random(-3, 3),

        vy:
            random(-15, -10),

        gravity:
            0.28,

        radius:
            28,

        emoji:
            bomb ? "💣" : fruit.emoji,

        color:
            bomb ? "#777777" : fruit.color,

        bomb:
            bomb,

        sliced:
            false

    });

}


/* ==========================================
   PARTICLES
========================================== */

function createParticles(x, y, color) {

    for (let i = 0; i < 15; i++) {

        particles.push({

            x: x,

            y: y,

            vx: random(-5, 5),

            vy: random(-5, 3),

            life: 1,

            color: color

        });

    }

}


/* ==========================================
   DISTANCE TO LINE
========================================== */

function distanceToLine(
    px,
    py,
    x1,
    y1,
    x2,
    y2
) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    const length =
        dx * dx +
        dy * dy;


    if (length === 0) {

        return Math.hypot(
            px - x1,
            py - y1
        );

    }


    let t =
        ((px - x1) * dx +
        (py - y1) * dy) /
        length;


    t = Math.max(
        0,
        Math.min(1, t)
    );


    const nearestX =
        x1 + t * dx;

    const nearestY =
        y1 + t * dy;


    return Math.hypot(
        px - nearestX,
        py - nearestY
    );

}


/* ==========================================
   SLICE FRUIT
========================================== */

function sliceFruit(
    x1,
    y1,
    x2,
    y2
) {

    for (const fruit of fruits) {

        if (fruit.sliced) continue;


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
            distance >
            fruit.radius + 12
        ) continue;


        fruit.sliced = true;


        createParticles(
            fruit.x,
            fruit.y,
            fruit.color
        );


        /* BOMB */

        if (fruit.bomb) {

            lives--;

            combo = 0;

            updateHUD();


            if (lives <= 0) {

                showGameOver();

                return;

            }

            continue;

        }


        /* FRUIT */

        combo++;

        score +=
            combo >= 3
                ? 20
                : 10;


        updateHUD();

    }

}


/* ==========================================
   PLAYER SWIPE
========================================== */

canvas.addEventListener(
    "pointerdown",
    function (event) {

        if (!running) return;

        slicing = true;

        previousPoint = {

            x: event.clientX,

            y: event.clientY

        };


        try {

            canvas.setPointerCapture(
                event.pointerId
            );

        } catch (error) {}

    }
);


canvas.addEventListener(
    "pointermove",
    function (event) {

        if (
            !running ||
            !slicing ||
            !previousPoint
        ) return;


        const current = {

            x: event.clientX,

            y: event.clientY

        };


        blade.push({

            x: current.x,

            y: current.y,

            life: 1

        });


        sliceFruit(

            previousPoint.x,

            previousPoint.y,

            current.x,

            current.y

        );


        previousPoint = current;

    }
);


function stopSlice() {

    slicing = false;

    previousPoint = null;

}


canvas.addEventListener(
    "pointerup",
    stopSlice
);

canvas.addEventListener(
    "pointercancel",
    stopSlice
);


/* ==========================================
   DRAW BACKGROUND
========================================== */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
        );


    gradient.addColorStop(
        0,
        "#100b2e"
    );

    gradient.addColorStop(
        0.5,
        "#191144"
    );

    gradient.addColorStop(
        1,
        "#071a2e"
    );


    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


/* ==========================================
   DRAW FRUIT
========================================== */

function drawFruits() {

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";


    for (const fruit of fruits) {

        if (fruit.sliced) continue;


        ctx.font = "48px serif";


        ctx.fillText(
            fruit.emoji,
            fruit.x,
            fruit.y
        );

    }

}


/* ==========================================
   DRAW PARTICLES
========================================== */

function drawParticles() {

    for (const particle of particles) {

        ctx.save();

        ctx.globalAlpha =
            Math.max(
                0,
                particle.life
            );

        ctx.fillStyle =
            particle.color;


        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();

    }

}


/* ==========================================
   DRAW BLADE
========================================== */

function drawBlade() {

    if (blade.length < 2) return;


    ctx.save();

    ctx.lineCap = "round";

    ctx.lineJoin = "round";


    for (
        let i = 1;
        i < blade.length;
        i++
    ) {

        const a = blade[i - 1];

        const b = blade[i];


        ctx.globalAlpha =
            b.life;


        ctx.strokeStyle =
            "#8ffcff";

        ctx.lineWidth =
            3 + b.life * 5;


        ctx.shadowBlur = 20;

        ctx.shadowColor =
            "#00eaff";


        ctx.beginPath();

        ctx.moveTo(
            a.x,
            a.y
        );

        ctx.lineTo(
            b.x,
            b.y
        );

        ctx.stroke();

    }


    ctx.restore();

}


/* ==========================================
   GAME LOOP
========================================== */

function gameLoop(time) {

    if (!running) return;


    const delta =
        lastTime
            ? Math.min(
                (time - lastTime) /
                16.67,
                2
            )
            : 1;


    lastTime = time;


    drawBackground();


    /* SPAWN */

    spawnTimer += delta;


    if (spawnTimer > 45) {

        spawnFruit();

        if (Math.random() > 0.55) {
            spawnFruit();
        }

        spawnTimer = 0;

    }


    /* FRUIT */

    for (const fruit of fruits) {

        if (fruit.sliced) continue;


        fruit.x +=
            fruit.vx * delta;


        fruit.y +=
            fruit.vy * delta;


        fruit.vy +=
            fruit.gravity * delta;

    }


    fruits =
        fruits.filter(
            fruit =>
                !fruit.sliced &&
                fruit.y <
                canvas.height + 100
        );


    /* PARTICLES */

    for (const particle of particles) {

        particle.x +=
            particle.vx * delta;

        particle.y +=
            particle.vy * delta;

        particle.vy +=
            0.15 * delta;

        particle.life -=
            0.025 * delta;

    }


    particles =
        particles.filter(
            p => p.life > 0
        );


    /* BLADE */

    for (const point of blade) {

        point.life -=
            0.09 * delta;

    }


    blade =
        blade.filter(
            point =>
                point.life > 0
        );


    drawFruits();

    drawParticles();

    drawBlade();


    requestAnimationFrame(
        gameLoop
    );

}


/* ==========================================
   GAME OVER BUTTONS
========================================== */

restartBtn.addEventListener(
    "click",
    function () {

        showModeScreen();

    }
);


menuBtn.addEventListener(
    "click",
    function () {

        showModeScreen();

    }
);


/* ==========================================
   INITIAL STATE
========================================== */

showModeScreen();

console.log(
    "NINJA FRUIT — MODE SELECT READY"
);
```
