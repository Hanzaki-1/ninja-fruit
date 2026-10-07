```javascript
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
let nextSpawnTimer;


// =====================================
// ZEN MUSIC
// =====================================

let audioContext;
let masterGain;
let musicTimer;

function startZenMusic() {

    if (audioContext) return;

    audioContext =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    masterGain =
        audioContext.createGain();

    masterGain.gain.value = 0.08;

    masterGain.connect(
        audioContext.destination
    );

    playZenLoop();
}


function playZenLoop() {

    if (!playing || !audioContext)
        return;


    const notes = [
        261.63, // C
        329.63, // E
        392.00, // G
        523.25, // C
        392.00, // G
        329.63  // E
    ];


    const note =
        notes[
            Math.floor(
                Math.random() *
                notes.length
            )
        ];


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type =
        "sine";

    oscillator.frequency.value =
        note;


    gain.gain.setValueAtTime(
        0,
        audioContext.currentTime
    );


    gain.gain.linearRampToValueAtTime(
        0.12,
        audioContext.currentTime + 0.2
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 2
    );


    oscillator.connect(gain);

    gain.connect(masterGain);


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 2
    );


    musicTimer =
        setTimeout(
            playZenLoop,
            900 + Math.random() * 900
        );
}


// =====================================
// CANVAS
// =====================================

function resize() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
}

resize();

window.addEventListener(
    "resize",
    resize
);


// =====================================
// FRUITS
// =====================================

const fruitsList = [
    "🍎",
    "🍊",
    "🍉",
    "🍌",
    "🍍",
    "🥝",
    "🍓"
];


// =====================================
// GAME SPEED
// =====================================

function getGameSpeed() {

    /*
        Every 100 points increases speed.

        Starts around 13.

        Maximum around 25.
    */

    const speed =
        13 +
        Math.floor(score / 100) * 1.2;

    return Math.min(
        speed,
        25
    );
}


function getPointValue() {

    /*
        More speed = more points.

        Base = 10

        Every 100 points,
        fruit value increases.
    */

    return (
        10 +
        Math.floor(score / 100) * 5
    );

}


// =====================================
// FRUIT
// =====================================

class Fruit {

    constructor() {

        this.x =
            Math.random() *
            (canvas.width - 120) +
            60;

        this.y =
            canvas.height + 70;

        this.size = 65;


        const centerX =
            canvas.width / 2;


        const direction =
            centerX - this.x;


        this.speedX =
            direction * 0.008 +
            (Math.random() - 0.5) * 2;


        this.speedX =
            Math.max(
                -4,
                Math.min(
                    4,
                    this.speedX
                )
            );


        this.speedY =
            -(
                getGameSpeed() +
                Math.random() * 4
            );


        this.gravity =
            0.35;


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

        this.x +=
            this.speedX;

        this.y +=
            this.speedY;

        this.speedY +=
            this.gravity;


        // Keep inside screen

        if (this.x < 35) {

            this.x = 35;

            this.speedX *= -0.5;

        }


        if (
            this.x >
            canvas.width - 35
        ) {

            this.x =
                canvas.width - 35;

            this.speedX *= -0.5;

        }

    }


    draw() {

        ctx.font =
            this.size + "px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            this.emoji,
            this.x,
            this.y
        );

    }

}


// =====================================
// BOMB
// =====================================

class Bomb {

    constructor() {

        this.x =
            Math.random() *
            (canvas.width - 120) +
            60;

        this.y =
            canvas.height + 70;

        this.size = 65;


        const centerX =
            canvas.width / 2;


        const direction =
            centerX - this.x;


        this.speedX =
            direction * 0.008 +
            (Math.random() - 0.5) * 2;


        this.speedX =
            Math.max(
                -4,
                Math.min(
                    4,
                    this.speedX
                )
            );


        this.speedY =
            -(
                getGameSpeed() +
                Math.random() * 4
            );


        this.gravity =
            0.35;


        this.sliced = false;

        this.isBomb = true;

    }


    update() {

        this.x +=
            this.speedX;

        this.y +=
            this.speedY;

        this.speedY +=
            this.gravity;


        if (this.x < 35) {

            this.x = 35;

            this.speedX *= -0.5;

        }


        if (
            this.x >
            canvas.width - 35
        ) {

            this.x =
                canvas.width - 35;

            this.speedX *= -0.5;

        }

    }


    draw() {

        ctx.font =
            this.size + "px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "💣",
            this.x,
            this.y
        );

    }

}


// =====================================
// PARTICLES
// =====================================

class Particle {

    constructor(
        x,
        y,
        bomb = false
    ) {

        this.x = x;
        this.y = y;

        this.vx =
            (Math.random() - 0.5) * 14;

        this.vy =
            (Math.random() - 0.5) * 14;

        this.life = 1;

        this.bomb = bomb;

    }


    update() {

        this.x +=
            this.vx;

        this.y +=
            this.vy;

        this.vy +=
            0.3;

        this.life -=
            0.04;

    }


    draw() {

        ctx.globalAlpha =
            this.life;


        ctx.fillStyle =
            this.bomb
                ? "orange"
                : "white";


        ctx.beginPath();


        ctx.arc(
            this.x,
            this.y,
            this.bomb ? 6 : 4,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.globalAlpha = 1;

    }

}


// =====================================
// RANDOM SPAWN
// =====================================

function scheduleNextSpawn() {

    if (!playing)
        return;


    /*
        Spawn becomes slightly faster
        as the game progresses.
    */

    const minimum =
        Math.max(
            350,
            850 -
            score * 1.5
        );


    const maximum =
        Math.max(
            500,
            1200 -
            score * 1.5
        );


    const delay =
        minimum +
        Math.random() *
        (maximum - minimum);


    nextSpawnTimer =
        setTimeout(
            () => {

                createObject();

                scheduleNextSpawn();

            },
            delay
        );

}


// =====================================
// CREATE OBJECT
// =====================================

function createObject() {

    if (!playing)
        return;


    /*
        Bomb probability changes randomly.

        Usually 10–25%.

        Occasionally a bomb can appear
        after a quiet period.
    */

    const bombChance =
        Math.random();


    if (bombChance < 0.18) {

        fruits.push(
            new Bomb()
        );

    } else {

        fruits.push(
            new Fruit()
        );

    }

}


// =====================================
// SLICE FRUIT
// =====================================

function sliceFruit(fruit) {

    if (fruit.sliced)
        return;


    fruit.sliced = true;


    const points =
        getPointValue();


    score += points;


    scoreText.textContent =
        score;


    for (
        let i = 0;
        i < 15;
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


// =====================================
// HIT BOMB
// =====================================

function hitBomb(bomb) {

    bomb.sliced = true;


    for (
        let i = 0;
        i < 50;
        i++
    ) {

        particles.push(
            new Particle(
                bomb.x,
                bomb.y,
                true
            )
        );

    }


    endGame();

}


// =====================================
// TOUCH
// =====================================

function touchMove(
    x,
    y
) {

    if (!playing)
        return;


    slash.push({
        x: x,
        y: y
    });


    if (
        slash.length > 8
    ) {

        slash.shift();

    }


    for (
        const object of fruits
    ) {

        const distance =
            Math.hypot(
                x - object.x,
                y - object.y
            );


        if (
            distance <
            object.size / 2 + 35
        ) {


            if (
                object.isBomb
            ) {

                hitBomb(
                    object
                );

                return;

            }


            sliceFruit(
                object
            );

        }

    }

}


// =====================================
// TOUCH EVENTS
// =====================================

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


// =====================================
// SLASH
// =====================================

function drawSlash() {

    if (
        slash.length < 2
    )
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


// =====================================
// GAME LOOP
// =====================================

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Objects

    for (
        let i = fruits.length - 1;
        i >= 0;
        i--
    ) {

        const object =
            fruits[i];


        object.update();


        if (
            !object.sliced
        ) {

            object.draw();

        }


        if (
            object.sliced
        ) {

            fruits.splice(
                i,
                1
            );

            continue;

        }


        // Missed object

        if (
            object.y >
            canvas.height + 100
        ) {

            fruits.splice(
                i,
                1
            );


            // Only fruits
            // cost a life

            if (
                !object.isBomb
            ) {

                lives--;

                livesText.textContent =
                    lives;


                if (
                    lives <= 0
                ) {

                    endGame();

                }

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


// =====================================
// START GAME
// =====================================

document
    .getElementById(
        "startBtn"
    )
    .addEventListener(
        "click",
        startGame
```
