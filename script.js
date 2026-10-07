const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");

const menu = document.getElementById("menu");
const gameOver = document.getElementById("gameOver");

let score = 0;
let lives = 3;

let fruits = [];
let particles = [];
let slash = [];

let playing = false;
let fruitTimer;


// =====================
// RESIZE
// =====================

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize);


// =====================
// FRUIT
// =====================

class Fruit {

    constructor() {

        // Start from the bottom
        this.x =
            Math.random() *
            (canvas.width - 120) + 60;

        this.y =
            canvas.height + 60;

        this.size = 65;

        // Calculate direction toward center
        const centerX = canvas.width / 2;

        const direction =
            centerX - this.x;

        // Keep horizontal movement controlled
        this.speedX =
            direction * 0.008;

        // Add a small random movement
        this.speedX +=
            (Math.random() - 0.5) * 2;

        // Limit horizontal speed
        this.speedX =
            Math.max(
                -4,
                Math.min(
                    4,
                    this.speedX
                )
            );

        // Strong upward movement
        this.speedY =
            -(Math.random() * 4 + 13);

        this.gravity = 0.35;

        this.emoji =
            fruitsList[
                Math.floor(
                    Math.random() *
                    fruitsList.length
                )
            ];

        this.sliced = false;
    }


    update() {

        this.x += this.speedX;

        this.y += this.speedY;

        this.speedY += this.gravity;


        // Keep fruit inside the screen

        if (this.x < 35) {
            this.x = 35;
            this.speedX *= -0.5;
        }

        if (this.x > canvas.width - 35) {
            this.x = canvas.width - 35;
            this.speedX *= -0.5;
        }

    }


    draw() {

        ctx.font =
            this.size + "px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            this.emoji,
            this.x,
            this.y
        );

    }
}


// =====================
// FRUIT TYPES
// =====================

const fruitsList = [
    "🍎",
    "🍊",
    "🍉",
    "🍌",
    "🍍",
    "🥝",
    "🍓"
];


// =====================
// PARTICLES
// =====================

class Particle {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.vx =
            (Math.random() - 0.5) * 12;

        this.vy =
            (Math.random() - 0.5) * 12;

        this.life = 1;
    }


    update() {

        this.x += this.vx;

        this.y += this.vy;

        this.vy += 0.3;

        this.life -= 0.04;

    }


    draw() {

        ctx.globalAlpha =
            this.life;

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;

    }
}


// =====================
// CREATE FRUIT
// =====================

function createFruit() {

    if (!playing) return;

    fruits.push(
        new Fruit()
    );

}


// =====================
// SLICE
// =====================

function sliceFruit(fruit) {

    if (fruit.sliced) return;

    fruit.sliced = true;

    score += 10;

    scoreText.textContent =
        score;

    for (let i = 0; i < 15; i++) {

        particles.push(
            new Particle(
                fruit.x,
                fruit.y
            )
        );

    }
}


// =====================
// TOUCH
// =====================

function touchMove(x, y) {

    if (!playing) return;

    slash.push({
        x: x,
        y: y
    });

    if (slash.length > 8) {
        slash.shift();
    }


    for (const fruit of fruits) {

        const distance =
            Math.hypot(
                x - fruit.x,
                y - fruit.y
            );

        if (
            distance <
            fruit.size / 2 + 35
        ) {

            sliceFruit(fruit);

        }

    }

}


// =====================
// MOBILE TOUCH
// =====================

canvas.addEventListener(
    "touchstart",
    function(e) {

        if (!playing) return;

        const touch =
            e.touches[0];

        touchMove(
            touch.clientX,
            touch.clientY
        );

    },
    { passive: false }
);


canvas.addEventListener(
    "touchmove",
    function(e) {

        e.preventDefault();

        if (!playing) return;

        const touch =
            e.touches[0];

        touchMove(
            touch.clientX,
            touch.clientY
        );

    },
    { passive: false }
);


canvas.addEventListener(
    "touchend",
    function() {

        slash = [];

    }
);


// =====================
// SLASH TRAIL
// =====================

function drawSlash() {

    if (slash.length < 2)
        return;

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
        "white";

    ctx.lineWidth = 6;

    ctx.lineCap =
        "round";

    ctx.stroke();

}


// =====================
// GAME LOOP
// =====================

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Fruits

    for (
        let i = fruits.length - 1;
        i >= 0;
        i--
    ) {

        const fruit =
            fruits[i];

        fruit.update();


        if (!fruit.sliced) {

            fruit.draw();

        }


        if (fruit.sliced) {

            fruits.splice(i, 1);

            continue;

        }


        // Missed fruit

        if (
            fruit.y >
            canvas.height + 100
        ) {

            fruits.splice(i, 1);

            lives--;

            livesText.textContent =
                lives;


            if (lives <= 0) {

                endGame();

            }

        }

    }


    // Particles

    for (
        let i = particles.length - 1;
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

            particles.splice(i, 1);

        }

    }


    drawSlash();

    requestAnimationFrame(
        gameLoop
    );

}


// =====================
// START BUTTON
// =====================

document
    .getElementById("startBtn")
    .addEventListener(
        "click",
        startGame
    );


function startGame() {

    score = 0;

    lives = 3;

    fruits = [];

    particles = [];

    slash = [];


    scoreText.textContent =
        "0";

    livesText.textContent =
        "3";


    menu.style.display =
        "none";

    gameOver.style.display =
        "none";


    playing = true;


    // Spawn first fruit immediately

    createFruit();


    // Then keep spawning

    clearInterval(fruitTimer);

    fruitTimer =
        setInterval(
            createFruit,
            750
        );

}


// =====================
// GAME OVER
// =====================

function endGame() {

    playing = false;

    clearInterval(
        fruitTimer
    );

    document.getElementById(
        "finalScore"
    ).textContent = score;

    gameOver.style.display =
        "block";

}


// =====================
// RESTART
// =====================

function restartGame() {

    gameOver.style.display =
        "none";

    startGame();

}


// START LOOP

gameLoop();
