const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const speedText = document.getElementById("speed");
const livesText = document.getElementById("lives");

const menu = document.getElementById("menu");
const gameOver = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const musicButton = document.getElementById("musicButton");
const zenMusic = document.getElementById("zenMusic");

let score = 0;
let lives = 3;
let playing = false;

let fruits = [];
let particles = [];
let slash = [];

let spawnTimer = null;
let comboTimer = null;

let musicOn = true;

let combo = 0;
let comboTimeout = 900;

let lastTime = 0;


/* =========================
   CANVAS
========================= */

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


/* =========================
   FRUITS
========================= */

const fruitTypes = [
    "🍎",
    "🍊",
    "🍉",
    "🍌",
    "🍍",
    "🥝",
    "🍓",
    "🍑"
];


/* =========================
   SPEED
========================= */

/*
    Starts slower.

    0 - 99 points
    = slow

    100 - 199
    = slightly faster

    200 - 299
    = faster

    etc.
*/

function getSpeed() {

    const level =
        Math.floor(score / 100);

    return Math.min(
        18,
        8 + level * 1.1
    );
}


function getSpeedMultiplier() {

    return (
        getSpeed() / 8
    ).toFixed(1);
}


/* =========================
   POINTS
========================= */

function getPoints() {

    const level =
        Math.floor(score / 100);

    return 10 + level * 5;
}


/* =========================
   FRUIT
========================= */

class Fruit {

    constructor() {

        this.x =
            Math.random() *
            (canvas.width - 120) +
            60;

        this.y =
            canvas.height + 70;

        this.size = 65;

        /*
            Fruit travels mostly upward
            with a little horizontal movement.
        */

        const centerX =
            canvas.width / 2;

        const direction =
            centerX - this.x;

        this.speedX =
            direction * 0.005 +
            (Math.random() - 0.5) * 2;

        this.speedX =
            Math.max(
                -3.5,
                Math.min(
                    3.5,
                    this.speedX
                )
            );

        this.speedY =
            -(
                getSpeed() +
                Math.random() * 3
            );

        this.gravity = 0.30;

        this.emoji =
            fruitTypes[
                Math.floor(
                    Math.random() *
                    fruitTypes.length
                )
            ];

        this.sliced = false;
    }


    update() {

        this.x += this.speedX;

        this.y += this.speedY;

        this.speedY += this.gravity;


        /*
            Keep fruits inside screen.
        */

        if (this.x < 40) {

            this.x = 40;

            this.speedX *= -0.5;
        }


        if (
            this.x >
            canvas.width - 40
        ) {

            this.x =
                canvas.width - 40;

            this.speedX *= -0.5;
        }
    }


    draw() {

        ctx.save();

        ctx.font =
            this.size + "px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            this.emoji,
            this.x,
            this.y
        );

        ctx.restore();
    }
}


/* =========================
   PARTICLES
========================= */

class Particle {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.vx =
            (Math.random() - 0.5) * 12;

        this.vy =
            (Math.random() - 0.5) * 12;

        this.life = 1;

        this.size = 4;
    }


    update() {

        this.x += this.vx;

        this.y += this.vy;

        this.vy += 0.3;

        this.life -= 0.04;
    }


    draw() {

        ctx.save();

        ctx.globalAlpha =
            this.life;

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}


/* =========================
   COMBO DISPLAY
========================= */

function showCombo(x, y) {

    const text =
        document.createElement("div");

    text.textContent =
        combo + "x";

    text.style.position =
        "fixed";

    text.style.left =
        x + "px";

    text.style.top =
        y + "px";

    text.style.transform =
        "translate(-50%, -50%) scale(1)";

    text.style.color =
        "#ffffff";

    text.style.fontSize =
        combo >= 5
            ? "42px"
            : "34px";

    text.style.fontWeight =
        "900";

    text.style.fontFamily =
        "Arial, sans-serif";

    text.style.pointerEvents =
        "none";

    text.style.zIndex =
        "100";

    text.style.textShadow =
        "0 3px 12px rgba(0,0,0,0.8)";

    text.style.transition =
        "all 0.45s ease-out";

    document.body.appendChild(text);


    requestAnimationFrame(() => {

        text.style.top =
            (y - 70) + "px";

        text.style.transform =
            "translate(-50%, -50%) scale(1.25)";

        text.style.opacity = "0";
    });


    setTimeout(() => {

        text.remove();

    }, 500);
}


/* =========================
   COMBO
========================= */

function registerCombo(
    x,
    y
) {

    combo++;

    showCombo(
        x,
        y
    );


    clearTimeout(
        comboTimer
    );


    comboTimer =
        setTimeout(() => {

            combo = 0;

        }, comboTimeout);
}


/* =========================
   SLICE FRUIT
========================= */

function sliceFruit(fruit) {

    if (fruit.sliced)
        return;

    fruit.sliced = true;


    /*
        Base points
    */

    const points =
        getPoints();


    /*
        Combo bonus

        1x = normal
        2x = double
        3x = triple
    */

    const comboMultiplier =
        Math.max(
            1,
            combo + 1
        );


    score +=
        points * comboMultiplier;


    scoreText.textContent =
        score;


    speedText.textContent =
        getSpeedMultiplier() + "x";


    registerCombo(
        fruit.x,
        fruit.y
    );


    /*
        Fruit particles
    */

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        particles.push(
            new Particle(
                fruit.x,
                fruit.y
            )
        );
    }
}


/* =========================
   SPAWN MULTIPLE FRUITS
========================= */

function scheduleSpawn() {

    if (!playing)
        return;


    /*
        Starts slower.

        As score increases,
        spawn becomes faster.
    */

    const level =
        Math.floor(score / 100);


    const baseDelay =
        Math.max(
            400,
            1100 -
            level * 70
        );


    const randomDelay =
        baseDelay +
        Math.random() * 500;


    spawnTimer =
        setTimeout(() => {

            createWave();

            scheduleSpawn();

        }, randomDelay);
}


/* =========================
   CREATE FRUIT WAVE
========================= */

function createWave() {

    if (!playing)
        return;


    /*
        Number of fruits depends
        on score.

        Start with 1-2.

        Later:
        2-3
        3-4
        etc.
    */

    const level =
        Math.floor(score / 100);


    let amount;


    if (level === 0) {

        amount =
            Math.random() < 0.65
                ? 1
                : 2;

    } else if (level === 1) {

        amount =
            2;

    } else if (level === 2) {

        amount =
            Math.random() < 0.5
                ? 2
                : 3;

    } else {

        amount =
            Math.min(
                5,
                2 +
                Math.floor(
                    level / 2
                )
            );
    }


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        fruits.push(
            new Fruit()
        );
    }
}


/* =========================
   TOUCH / SWIPE
========================= */

function touchMove(x, y) {

    if (!playing)
        return;


    slash.push({
        x: x,
        y: y
    });


    if (slash.length > 10) {

        slash.shift();
    }


    for (
        const fruit of fruits
    ) {

        if (fruit.sliced)
            continue;


        const distance =
            Math.hypot(
                x - fruit.x,
                y - fruit.y
            );


        if (
            distance <
            fruit.size / 2 + 35
        ) {

            sliceFruit(
                fruit
            );
        }
    }
}


/* =========================
   TOUCH EVENTS
========================= */

canvas.addEventListener(
    "touchstart",
    function(e) {

        if (!playing)
            return;


        const touch =
            e.touches[0];


        touchMove(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchmove",
    function(e) {

        e.preventDefault();


        if (!playing)
            return;


        const touch =
            e.touches[0];


        touchMove(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: false
    }
);


canvas.addEventListener(
    "touchend",
    function() {

        slash = [];

    }
);


/* =========================
   SLASH EFFECT
========================= */

function drawSlash() {

    if (slash.length < 2)
        return;


    ctx.save();


    ctx.beginPath();


    ctx.moveTo(
        slash[0].x,
        slash[0].y
    );


    for (
        let i = 1;
        i < slash.length;
        i++
    ) {

        ctx.lineTo(
            slash[i].x,
            slash[i].y
        );
    }


    ctx.strokeStyle =
        "rgba(255,255,255,0.9)";

    ctx.lineWidth = 6;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    ctx.shadowBlur = 12;

    ctx.shadowColor =
        "white";

    ctx.stroke();

    ctx.restore();
}


/* =========================
   GAME LOOP
========================= */

function gameLoop(timestamp) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        Update fruits
    */

    for (
        let i =
            fruits.length - 1;
        i >= 0;
        i--
    ) {

        const fruit =
            fruits[i];


        fruit.update();


        if (!fruit.sliced) {

            fruit.draw();
        }


        /*
            Remove sliced fruit
        */

        if (fruit.sliced) {

            fruits.splice(
                i,
                1
            );

            continue;
        }


        /*
            Fruit missed
        */

        if (
            fruit.y >
            canvas.height + 120
        ) {

            fruits.splice(
                i,
                1
            );


            lives--;


            livesText.textContent =
                lives;


            if (lives <= 0) {

                endGame();
            }
        }
    }


    /*
        Particles
    */

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.update();

        particle.draw();


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }


    drawSlash();


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   START GAME
========================= */

startBtn.addEventListener(
    "click",
    startGame
);


function startGame() {

    score = 0;

    lives = 3;

    combo = 0;


    clearTimeout(
        spawnTimer
    );

    clearTimeout(
        comboTimer
    );


    fruits = [];

    particles = [];

    slash = [];


    scoreText.textContent =
        "0";

    livesText.textContent =
        "3";

    speedText.textContent =
        "1.0x";


    menu.classList.add(
        "hidden"
    );


    gameOver.classList.add(
        "hidden"
    );


    playing = true;


    /*
        Start music
    */

    if (musicOn) {

        zenMusic.currentTime = 0;

        zenMusic.volume = 0.35;

        zenMusic.play()
            .catch(
                function(error) {

                    console.log(
                        "Music error:",
                        error
                    );

                }
            );
    }


    /*
        Start with 2 fruits
        so the game immediately
        feels active.
    */

    fruits.push(
        new Fruit()
    );

    fruits.push(
        new Fruit()
    );


    scheduleSpawn();
}


/* =========================
   GAME OVER
========================= */

function endGame() {

    if (!playing)
        return;


    playing = false;


    clearTimeout(
        spawnTimer
    );


    clearTimeout(
        comboTimer
    );


    zenMusic.pause();


    finalScore.textContent =
        score;


    gameOver.classList.remove(
        "hidden"
    );
}


/* =========================
   RESTART
========================= */

restartBtn.addEventListener(
    "click",
    function() {

        startGame();

    }
);


/* =========================
   MUSIC
========================= */

musicButton.addEventListener(
    "click",
    function() {

        if (
            zenMusic.paused
        ) {

            musicOn = true;


            zenMusic.play()
                .catch(
                    function() {}
                );


            musicButton.textContent =
                "🔊";

        } else {

            musicOn = false;


            zenMusic.pause();


            musicButton.textContent =
                "🔇";
        }
    }
);


/* =========================
   START LOOP
========================= */

requestAnimationFrame(
    gameLoop
);
