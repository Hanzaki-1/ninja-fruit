const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");

const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

let score = 0;
let lives = 3;

let fruits = [];
let particles = [];

let mouse = {
    x: 0,
    y: 0,
    down: false
};

const fruitTypes = [
    {
        emoji: "🍎",
        color: "#ff3333"
    },
    {
        emoji: "🍊",
        color: "#ff8c00"
    },
    {
        emoji: "🍉",
        color: "#ff4d6d"
    },
    {
        emoji: "🍌",
        color: "#ffd60a"
    },
    {
        emoji: "🍍",
        color: "#f9c74f"
    },
    {
        emoji: "🥝",
        color: "#7cb342"
    }
];

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// ===============================
// FRUIT
// ===============================

class Fruit {

    constructor() {

        const type =
            fruitTypes[
                Math.floor(Math.random() * fruitTypes.length)
            ];

        this.x =
            Math.random() *
            (canvas.width - 100) +
            50;

        this.y = canvas.height + 50;

        this.radius = 35;

        this.speedX =
            (Math.random() - 0.5) * 8;

        this.speedY =
            -(Math.random() * 8 + 13);

        this.gravity = 0.35;

        this.emoji = type.emoji;
        this.color = type.color;

        this.rotation = 0;

        this.sliced = false;

    }


    update() {

        this.x += this.speedX;

        this.y += this.speedY;

        this.speedY += this.gravity;

        this.rotation += 0.05;

    }


    draw() {

        ctx.save();

        ctx.translate(this.x, this.y);

        ctx.rotate(this.rotation);

        ctx.font = "60px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(this.emoji, 0, 0);

        ctx.restore();

    }

}


// ===============================
// PARTICLES
// ===============================

class Particle {

    constructor(x, y, color) {

        this.x = x;
        this.y = y;

        this.speedX =
            (Math.random() - 0.5) * 10;

        this.speedY =
            (Math.random() - 0.5) * 10;

        this.size =
            Math.random() * 6 + 2;

        this.life = 1;

        this.color = color;

    }


    update() {

        this.x += this.speedX;

        this.y += this.speedY;

        this.speedY += 0.2;

        this.life -= 0.03;

    }


    draw() {

        ctx.globalAlpha = this.life;

        ctx.fillStyle = this.color;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.globalAlpha = 1;

    }

}


// ===============================
// CREATE FRUIT
// ===============================

function createFruit() {

    if (lives <= 0) return;

    fruits.push(new Fruit());

}

setInterval(() => {

    createFruit();

}, 800);


// ===============================
// SLASH
// ===============================

function slashFruit(fruit) {

    fruit.sliced = true;

    score += 10;

    scoreText.textContent = score;

    // Create particles

    for (let i = 0; i < 20; i++) {

        particles.push(
            new Particle(
                fruit.x,
                fruit.y,
                fruit.color
            )
        );

    }

}


// ===============================
// CHECK COLLISION
// ===============================

function checkSlash() {

    if (!mouse.down) return;

    for (let i = fruits.length - 1; i >= 0; i--) {

        const fruit = fruits[i];

        const distance =
            Math.sqrt(
                Math.pow(mouse.x - fruit.x, 2) +
                Math.pow(mouse.y - fruit.y, 2)
            );

        if (
            distance <
            fruit.radius + 30 &&
            !fruit.sliced
        ) {

            slashFruit(fruit);

        }

    }

}


// ===============================
// MOUSE
// ===============================

canvas.addEventListener("mousemove", function(e) {

    const rect =
        canvas.getBoundingClientRect();

    mouse.x =
        e.clientX - rect.left;

    mouse.y =
        e.clientY - rect.top;

});

canvas.addEventListener("mousedown", function() {

    mouse.down = true;

});

canvas.addEventListener("mouseup", function() {

    mouse.down = false;

});


// ===============================
// TOUCH SUPPORT
// ===============================

canvas.addEventListener(
    "touchmove",
    function(e) {

        e.preventDefault();

        const rect =
            canvas.getBoundingClientRect();

        const touch =
            e.touches[0];

        mouse.x =
            touch.clientX - rect.left;

        mouse.y =
            touch.clientY - rect.top;

        mouse.down = true;

    },
    { passive: false }
);


canvas.addEventListener(
    "touchstart",
    function(e) {

        const rect =
            canvas.getBoundingClientRect();

        const touch =
            e.touches[0];

        mouse.x =
            touch.clientX - rect.left;

        mouse.y =
            touch.clientY - rect.top;

        mouse.down = true;

    }
);


canvas.addEventListener(
    "touchend",
    function() {

        mouse.down = false;

    }
);


// ===============================
// GAME LOOP
// ===============================

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

        const fruit = fruits[i];

        fruit.update();

        fruit.draw();


        // Remove sliced fruit

        if (fruit.sliced) {

            fruits.splice(i, 1);

            continue;

        }


        // Fruit missed

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

        if (particle.life <= 0) {

            particles.splice(i, 1);

        }

    }


    checkSlash();


    requestAnimationFrame(gameLoop);

}


// ===============================
// GAME OVER
// ===============================

function endGame() {

    gameOverScreen.style.display =
        "block";

    finalScore.textContent =
        score;

}


// ===============================
// RESTART
// ===============================

function restartGame() {

    score = 0;
    lives = 3;

    scoreText.textContent = score;
    livesText.textContent = lives;

    fruits = [];
    particles = [];

    gameOverScreen.style.display =
        "none";

}


// START GAME

gameLoop();
