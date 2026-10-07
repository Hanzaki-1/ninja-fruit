const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


const scoreText =
    document.getElementById("score");

const speedText =
    document.getElementById("speed");

const livesText =
    document.getElementById("lives");


const menu =
    document.getElementById("menu");

const gameOver =
    document.getElementById("gameOver");


const finalScore =
    document.getElementById("finalScore");


const startBtn =
    document.getElementById("startBtn");


const restartBtn =
    document.getElementById("restartBtn");


const musicButton =
    document.getElementById("musicButton");


const zenMusic =
    document.getElementById("zenMusic");



/* =================================
   GAME VARIABLES
================================= */

let score = 0;

let lives = 3;

let playing = false;

let fruits = [];

let particles = [];

let slash = [];

let spawnTimer = null;

let musicOn = true;


/* =================================
   CANVAS
================================= */

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;

}


resizeCanvas();


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =================================
   FRUIT TYPES
================================= */

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



/* =================================
   GAME SPEED
================================= */

function getSpeed() {

    /*
       Starts at 13.

       Gets faster every 100 points.

       Maximum 25.
    */

    return Math.min(
        25,
        13 +
        Math.floor(
            score / 100
        ) * 1.2
    );

}


function getSpeedMultiplier() {

    return (
        getSpeed() / 13
    ).toFixed(1);

}


function getPoints() {

    /*
       Faster game =
       more points.

       10
       15
       20
       25
       etc.
    */

    return (
        10 +
        Math.floor(
            score / 100
        ) * 5
    );

}



/* =================================
   FRUIT CLASS
================================= */

class Fruit {

    constructor() {

        this.x =
            Math.random() *
            (
                canvas.width - 120
            ) + 60;


        this.y =
            canvas.height + 70;


        this.size = 65;


        const centerX =
            canvas.width / 2;


        const direction =
            centerX -
            this.x;


        /*
           Keep fruit moving
           toward center.
        */

        this.speedX =
            direction * 0.008 +
            (
                Math.random() - 0.5
            ) * 2;


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
                getSpeed() +
                Math.random() * 4
            );


        this.gravity =
            0.35;


        this.emoji =
            fruitTypes[
                Math.floor(
                    Math.random() *
                    fruitTypes.length
                )
            ];


        this.sliced = false;

        this.isBomb = false;

    }


    update() {

        this.x +=
            this.speedX;

        this.y +=
            this.speedY;

        this.speedY +=
            this.gravity;


        /* Keep inside screen */

        if (
            this.x < 40
        ) {

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
            this.size +
            "px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            this.emoji,
            this.x,
            this.y
        );


        ctx.restore();

    }

}



/* =================================
   BOMB CLASS
================================= */

class Bomb {

    constructor() {

        this.x =
            Math.random() *
            (
                canvas.width - 120
            ) + 60;


        this.y =
            canvas.height + 70;


        this.size = 65;


        const centerX =
            canvas.width / 2;


        const direction =
            centerX -
            this.x;


        this.speedX =
            direction * 0.008 +
            (
                Math.random() - 0.5
            ) * 2;


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
                getSpeed() +
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


        if (
            this.x < 40
        ) {

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
            this.size +
            "px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "💣",
            this.x,
            this.y
        );


        ctx.restore();

    }

}



/* =================================
   PARTICLES
================================= */

class Particle {

    constructor(
        x,
        y,
        bomb = false
    ) {

        this.x = x;

        this.y = y;

        this.vx =
            (
                Math.random() - 0.5
            ) * (
                bomb ? 18 : 12
            );

        this.vy =
            (
                Math.random() - 0.5
            ) * (
                bomb ? 18 : 12
            );

        this.life = 1;

        this.size =
            bomb
                ? 6
                : 4;

        this.bomb =
            bomb;

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

        ctx.save();


        ctx.globalAlpha =
            this.life;


        ctx.fillStyle =
            this.bomb
                ? "#ff8c00"
                : "#ffffff";


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



/* =================================
   RANDOM SPAWN
================================= */

function scheduleSpawn() {

    if (!playing)
        return;


    /*
       Faster spawning as
       score increases.
    */

    const delay =
        Math.max(
            350,
            950 -
            score * 1.2
        );


    const randomDelay =
        delay +
        Math.random() * 450;


    spawnTimer =
        setTimeout(
            function() {

                createObject();

                scheduleSpawn();

            },
            randomDelay
        );

}



/* =================================
   CREATE FRUIT OR BOMB
================================= */

function createObject() {

    if (!playing)
        return;


    /*
       Random bomb timing.

       15% chance normally.

       Random means bombs don't
       appear at fixed intervals.
    */

    const bombChance =
        Math.random();


    if (
        bombChance < 0.15
    ) {

        fruits.push(
            new Bomb()
        );

    } else {

        fruits.push(
            new Fruit()
        );

    }

}



/* =================================
   SLICE FRUIT
================================= */

function sliceFruit(
    fruit
) {

    if (
        fruit.sliced
    )
        return;


    fruit.sliced = true;


    const points =
        getPoints();


    score += points;


    scoreText.textContent =
        score;


    speedText.textContent =
        getSpeedMultiplier()
        + "x";


    /*
       Particles
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



/* =================================
   BOMB HIT
================================= */

function hitBomb(
    bomb
) {

    bomb.sliced = true;


    /*
       Big explosion
    */

    for (
        let i = 0;
        i < 60;
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



/* =================================
   TOUCH / SLASH
================================= */

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
        slash.length > 10
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
            object.size / 2 +
            35
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



/* =================================
   MOBILE TOUCH
================================= */

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



/* =================================
   SLASH TRAIL
================================= */

function drawSlash() {

    if (
        slash.length < 2
    )
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


    ctx.lineCap =
        "round";


    ctx.lineJoin =
        "round";


    ctx.shadowBlur = 12;

    ctx.shadowColor =
        "white";


    ctx.stroke();


    ctx.restore();

}



/* =================================
   GAME LOOP
================================= */

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       OBJECTS
    */

    for (
        let i =
            fruits.length - 1;
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


        /*
           Object leaves screen
        */

        if (
            object.y >
            canvas.height + 120
        ) {

            fruits.splice(
                i,
                1
            );


            /*
               Missing fruit
               loses life.

               Bombs don't.
            */

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



    /*
       PARTICLES
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



/* =================================
   START GAME
================================= */

startBtn.addEventListener(
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


    speedText.textContent =
        "1x";


    menu.classList.add(
        "hidden"
    );


    gameOver.classList.add(
        "hidden"
    );


    playing = true;


    /*
       Start music.

       Mobile browsers allow
       this because startGame()
       was triggered by a tap.
    */

    if (musicOn) {

        zenMusic.currentTime =
            0;

        zenMusic.volume =
            0.35;


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
       Start random fruit
       spawning.
    */

    createObject();

    scheduleSpawn();

}



/* =================================
   GAME OVER
================================= */

function endGame() {

    if (!playing)
        return;


    playing = false;


    clearTimeout(
        spawnTimer
    );


    /*
       Stop music
    */

    zenMusic.pause();


    finalScore.textContent =
        score;


    gameOver.classList.remove(
        "hidden"
    );

}



/* =================================
   RESTART
================================= */

restartBtn.addEventListener(
    "click",
    function() {

        startGame();

    }
);



/* =================================
   MUSIC BUTTON
================================= */

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



/* =================================
   GAME LOOP START
================================= */

gameLoop();
