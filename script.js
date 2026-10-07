```javascript
/* =====================================================
   NINJA FRUIT
   ===================================================== */


/* =====================================================
   GET ELEMENTS
===================================================== */

const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


const scoreText =
    document.getElementById("score");

const comboDisplay =
    document.getElementById("comboDisplay");

const livesText =
    document.getElementById("lives");


const menu =
    document.getElementById("menu");

const modeScreen =
    document.getElementById("modeScreen");

const gameOver =
    document.getElementById("gameOver");


const finalScore =
    document.getElementById("finalScore");

const finalMode =
    document.getElementById("finalMode");


const startBtn =
    document.getElementById("startBtn");

const classicBtn =
    document.getElementById("classicBtn");

const zenBtn =
    document.getElementById("zenBtn");

const backBtn =
    document.getElementById("backBtn");

const restartBtn =
    document.getElementById("restartBtn");

const menuBtn =
    document.getElementById("menuBtn");

const musicButton =
    document.getElementById("musicButton");

const zenMusic =
    document.getElementById("zenMusic");


/* =====================================================
   GAME VARIABLES
===================================================== */

let score = 0;

let lives = 3;

let playing = false;

let gameMode = "classic";

let fruits = [];

let particles = [];

let slash = [];

let spawnTimer = null;

let comboTimer = null;

let combo = 0;

let lastCutTime = 0;

let cutNumber = 0;

let musicOn = true;


/* =====================================================
   MODE SLICE VARIABLES
===================================================== */

let modeSlicing = false;

let previousModePoint = null;

let modeSlash = [];

let modeSelected = false;


/* =====================================================
   CANVAS
===================================================== */

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


/* =====================================================
   FRUIT TYPES
===================================================== */

const fruitTypes = [

    "🍎",
    "🍊",
    "🍉",
    "🍌",
    "🍍",
    "🥝",
    "🍓",
    "🍑",
    "🍐"

];


/* =====================================================
   GAME SPEED
===================================================== */

function getSpeed() {

    const level =
        Math.floor(
            score / 100
        );


    return Math.min(
        18,
        7 + level * 0.9
    );
}


/* =====================================================
   POINTS
===================================================== */

function getPoints() {

    return Math.max(
        1,
        10 - cutNumber
    );
}


/* =====================================================
   FRUIT
===================================================== */

class Fruit {

    constructor() {

        this.x =
            Math.random() *
            (
                canvas.width - 140
            ) + 70;


        /*
            Fruit starts higher
            than before.
        */

        this.y =
            canvas.height * 0.70;


        this.size =
            60 +
            Math.random() * 10;


        const centerX =
            canvas.width / 2;


        const direction =
            centerX - this.x;


        this.speedX =
            direction * 0.004 +
            (
                Math.random() - 0.5
            ) * 2;


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
                Math.random() * 2.5
            );


        this.gravity =
            0.28;


        this.emoji =
            fruitTypes[
                Math.floor(
                    Math.random() *
                    fruitTypes.length
                )
            ];


        this.sliced =
            false;


        this.isBomb =
            false;
    }


    update() {

        this.x +=
            this.speedX;


        this.y +=
            this.speedY;


        this.speedY +=
            this.gravity;


        if (
            this.x < 35
        ) {

            this.x = 35;

            this.speedX *=
                -0.6;
        }


        if (
            this.x >
            canvas.width - 35
        ) {

            this.x =
                canvas.width - 35;

            this.speedX *=
                -0.6;
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


        ctx.shadowColor =
            "rgba(0,0,0,.45)";


        ctx.shadowBlur =
            8;


        ctx.fillText(
            this.emoji,
            this.x,
            this.y
        );


        ctx.restore();
    }
}


/* =====================================================
   BOMB
===================================================== */

class Bomb {

    constructor() {

        this.x =
            Math.random() *
            (
                canvas.width - 140
            ) + 70;


        this.y =
            canvas.height * 0.70;


        this.size =
            64;


        const centerX =
            canvas.width / 2;


        const direction =
            centerX - this.x;


        this.speedX =
            direction * 0.004 +
            (
                Math.random() - 0.5
            ) * 2;


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
                Math.random() * 2.5
            );


        this.gravity =
            0.28;


        this.sliced =
            false;


        this.isBomb =
            true;
    }


    update() {

        this.x +=
            this.speedX;


        this.y +=
            this.speedY;


        this.speedY +=
            this.gravity;


        if (
            this.x < 35
        ) {

            this.x = 35;

            this.speedX *=
                -0.6;
        }


        if (
            this.x >
            canvas.width - 35
        ) {

            this.x =
                canvas.width - 35;

            this.speedX *=
                -0.6;
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


        ctx.shadowColor =
            "rgba(0,0,0,.6)";


        ctx.shadowBlur =
            10;


        ctx.fillText(
            "💣",
            this.x,
            this.y
        );


        ctx.restore();
    }
}


/* =====================================================
   PARTICLE
===================================================== */

class Particle {

    constructor(
        x,
        y,
        bomb = false
    ) {

        this.x =
            x;


        this.y =
            y;


        this.vx =
            (
                Math.random() - 0.5
            ) *
            (
                bomb
                    ? 18
                    : 12
            );


        this.vy =
            (
                Math.random() - 0.5
            ) *
            (
                bomb
                    ? 18
                    : 12
            );


        this.life =
            1;


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
                ? "#ff6545"
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


/* =====================================================
   MODE RING CENTER
===================================================== */

function getRingInfo(
    element
) {

    const rect =
        element.getBoundingClientRect();


    return {

        x:
            rect.left +
            rect.width / 2,

        y:
            rect.top +
            rect.height / 2,

        radius:
            rect.width / 2
    };
}


/* =====================================================
   CHECK SLASH THROUGH RING
===================================================== */

function lineHitsRing(
    pointA,
    pointB,
    ring
) {

    const info =
        getRingInfo(ring);


    const dx =
        pointB.x -
        pointA.x;


    const dy =
        pointB.y -
        pointA.y;


    const length =
        dx * dx +
        dy * dy;


    if (
        length === 0
    ) {

        return false;
    }


    let t =
        (
            (
                info.x -
                pointA.x
            ) *
            dx +

            (
                info.y -
                pointA.y
            ) *
            dy
        ) /
        length;


    t =
        Math.max(
            0,
            Math.min(
                1,
                t
            )
        );


    const closestX =
        pointA.x +
        t * dx;


    const closestY =
        pointA.y +
        t * dy;


    const distance =
        Math.hypot(
            info.x -
            closestX,

            info.y -
            closestY
        );


    /*
        Wide hit area so
        mobile swipes are easy.
    */

    return (
        distance <
        info.radius * 0.90
    );
}


/* =====================================================
   SELECT MODE
===================================================== */

function chooseMode(
    selectedMode
) {

    if (
        modeSelected
    ) {

        return;
    }


    modeSelected =
        true;


    /*
        Small ring animation.
    */

    const selectedRing =
        selectedMode === "classic"
            ? classicBtn
            : zenBtn;


    selectedRing.style.transform =
        "scale(1.15)";


    setTimeout(
        function() {

            selectedRing.style.transform =
                "";

            startGame(
                selectedMode
            );

        },
        150
    );
}


/* =====================================================
   MODE SWIPE START
===================================================== */

modeScreen.addEventListener(
    "touchstart",
    function(event) {

        if (
            modeSelected
        ) {

            return;
        }


        const touch =
            event.touches[0];


        modeSlicing =
            true;


        previousModePoint = {

            x:
                touch.clientX,

            y:
                touch.clientY

        };


        modeSlash = [

            previousModePoint

        ];


    },
    {
        passive: true
    }
);


/* =====================================================
   MODE SWIPE MOVE
===================================================== */

modeScreen.addEventListener(
    "touchmove",
    function(event) {

        if (
            !modeSlicing ||
            modeSelected
        ) {

            return;
        }


        const touch =
            event.touches[0];


        const currentPoint = {

            x:
                touch.clientX,

            y:
                touch.clientY

        };


        modeSlash.push(
            currentPoint
        );


        if (
            modeSlash.length >
            12
        ) {

            modeSlash.shift();
        }


        if (
            previousModePoint
        ) {


            /*
                CLASSIC
            */

            if (
                lineHitsRing(
                    previousModePoint,
                    currentPoint,
                    classicBtn
                )
            ) {

                chooseMode(
                    "classic"
                );

                return;
            }


            /*
                ZEN
            */

            if (
                lineHitsRing(
                    previousModePoint,
                    currentPoint,
                    zenBtn
                )
            ) {

                chooseMode(
                    "zen"
                );

                return;
            }

        }


        previousModePoint =
            currentPoint;


    },
    {
        passive: true
    }
);


/* =====================================================
   MODE SWIPE END
===================================================== */

modeScreen.addEventListener(
    "touchend",
    function() {

        modeSlicing =
            false;

        previousModePoint =
            null;

        modeSlash =
            [];

    }
);


/* =====================================================
   MODE MOUSE DRAG
===================================================== */

let mouseSlicing =
    false;


modeScreen.addEventListener(
    "mousedown",
    function(event) {

        if (
            modeSelected
        ) {

            return;
        }


        mouseSlicing =
            true;


        previousModePoint = {

            x:
                event.clientX,

            y:
                event.clientY

        };


        modeSlash = [

            previousModePoint

        ];
    }
);


modeScreen.addEventListener(
    "mousemove",
    function(event) {

        if (
            !mouseSlicing ||
            modeSelected
        ) {

            return;
        }


        const currentPoint = {

            x:
                event.clientX,

            y:
                event.clientY

        };


        modeSlash.push(
            currentPoint
        );


        if (
            lineHitsRing(
                previousModePoint,
                currentPoint,
                classicBtn
            )
        ) {

            chooseMode(
                "classic"
            );

            return;
        }


        if (
            lineHitsRing(
                previousModePoint,
                currentPoint,
                zenBtn
            )
        ) {

            chooseMode(
                "zen"
            );

            return;
        }


        previousModePoint =
            currentPoint;
    }
);


modeScreen.addEventListener(
    "mouseup",
    function() {

        mouseSlicing =
            false;

        previousModePoint =
            null;

        modeSlash =
            [];
    }
);


/* =====================================================
   DRAW MODE SLASH
===================================================== */

function drawModeSlash() {

    if (
        modeSlash.length <
        2
    ) {

        return;
    }


    ctx.save();


    ctx.beginPath();


    ctx.moveTo(
        modeSlash[0].x,
        modeSlash[0].y
    );


    for (
        let i = 1;
        i < modeSlash.length;
        i++
    ) {

        ctx.lineTo(
            modeSlash[i].x,
            modeSlash[i].y
        );
    }


    ctx.strokeStyle =
        "rgba(255,255,255,.95)";


    ctx.lineWidth =
        7;


    ctx.lineCap =
        "round";


    ctx.lineJoin =
        "round";


    ctx.shadowBlur =
        18;


    ctx.shadowColor =
        "white";


    ctx.stroke();


    ctx.restore();
}


/* =====================================================
   COMBO POPUP
===================================================== */

function showCombo(
    x,
    y
) {

    const popup =
        document.createElement(
            "div"
        );


    popup.textContent =
        combo + "x";


    popup.style.position =
        "fixed";


    popup.style.left =
        x + "px";


    popup.style.top =
        y + "px";


    popup.style.transform =
        "translate(-50%,-50%) scale(.7)";


    popup.style.color =
        "white";


    popup.style.fontSize =
        combo >= 5
            ? "46px"
            : "34px";


    popup.style.fontWeight =
        "900";


    popup.style.pointerEvents =
        "none";


    popup.style.zIndex =
        "200";


    popup.style.textShadow =
        "0 3px 18px rgba(0,0,0,.9)";


    popup.style.transition =
        "all .45s ease";


    document.body.appendChild(
        popup
    );


    requestAnimationFrame(
        function() {

            popup.style.top =
                (
                    y - 70
                ) + "px";


            popup.style.transform =
                "translate(-50%,-50%) scale(1.25)";


            popup.style.opacity =
                "0";
        }
    );


    setTimeout(
        function() {

            popup.remove();

        },
        500
    );
}


/* =====================================================
   COMBO
===================================================== */

function registerCombo(
    x,
    y
) {

    const now =
        Date.now();


    if (
        now -
        lastCutTime <
        1100
    ) {

        combo++;

    } else {

        combo =
            1;
    }


    lastCutTime =
        now;


    clearTimeout(
        comboTimer
    );


    comboTimer =
        setTimeout(
            function() {

                combo =
                    0;


                comboDisplay.textContent =
                    "—";

            },
            1100
        );


    comboDisplay.textContent =
        combo + "x";


    showCombo(
        x,
        y
    );
}


/* =====================================================
   CUT FRUIT
===================================================== */

function sliceFruit(
    fruit
) {

    if (
        fruit.sliced
    ) {

        return;
    }


    fruit.sliced =
        true;


    const points =
        getPoints();


    cutNumber++;


    const multiplier =
        Math.max(
            1,
            combo + 1
        );


    score +=
        points *
        multiplier;


    scoreText.textContent =
        score;


    registerCombo(
        fruit.x,
        fruit.y
    );


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


/* =====================================================
   BOMB HIT
===================================================== */

function hitBomb(
    bomb
) {

    bomb.sliced =
        true;


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


/* =====================================================
   CREATE OBJECT
===================================================== */

function createObject() {

    if (
        !playing
    ) {

        return;
    }


    /*
        Classic = bombs.
        Zen = no bombs.
    */

    if (
        gameMode === "classic" &&
        Math.random() < 0.16
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


/* =====================================================
   CREATE WAVE
===================================================== */

function createWave() {

    if (
        !playing
    ) {

        return;
    }


    const level =
        Math.floor(
            score / 100
        );


    let amount;


    if (
        level === 0
    ) {

        amount =
            Math.random() < .65
                ? 1
                : 2;

    } else if (
        level === 1
    ) {

        amount =
            2;

    } else if (
        level === 2
    ) {

        amount =
            Math.random() < .5
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

        createObject();
    }
}


/* =====================================================
   SPAWN
===================================================== */

function scheduleSpawn() {

    if (
        !playing
    ) {

        return;
    }


    const level =
        Math.floor(
            score / 100
        );


    const delay =
        Math.max(
            450,
            1250 -
            level * 65
        ) +
        Math.random() * 400;


    spawnTimer =
        setTimeout(
            function() {

                createWave();

                scheduleSpawn();

            },
            delay
        );
}


/* =====================================================
   GAME SLICE
===================================================== */

function touchMove(
    x,
    y
) {

    if (
        !playing
    ) {

        return;
    }


    slash.push({

        x: x,
        y: y

    });


    if (
        slash.length >
        10
    ) {

        slash.shift();
    }


    for (
        const object of fruits
    ) {

        if (
            object.sliced
        ) {

            continue;
        }


        const distance =
            Math.hypot(
                x - object.x,
                y - object.y
            );


        if (
            distance <
            object.size / 2 +
            32
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


/* =====================================================
   GAME TOUCH
===================================================== */

canvas.addEventListener(
    "touchstart",
    function(event) {

        if (
            !playing
        ) {

            return;
        }


        const touch =
            event.touches[0];


        touchMove(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchmove",
    function(event) {

        if (
            !playing
        ) {

            return;
        }


        const touch =
            event.touches[0];


        touchMove(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    function() {

        slash = [];
    }
);


/* =====================================================
   DRAW GAME SLASH
===================================================== */

function drawSlash() {

    if (
        slash.length <
        2
    ) {

        return;
    }


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
        "rgba(255,255,255,.95)";


    ctx.lineWidth =
        6;


    ctx.lineCap =
        "round";


    ctx.lineJoin =
        "round";


    ctx.shadowBlur =
        15;


    ctx.shadowColor =
        "white";


    ctx.stroke();


    ctx.restore();
}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
        MODE SLASH
    */

    if (
        !modeScreen.classList.contains(
            "hidden"
        )
    ) {

        drawModeSlash();
    }


    /*
        GAME OBJECTS
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
            Missed fruit.
        */

        if (
            object.y >
            canvas.height + 100
        ) {

            fruits.splice(
                i,
                1
            );


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


/* =====================================================
   START BUTTON
   =====================================================

   IMPORTANT:
   This is a simple click.
   It is NOT controlled by the
   canvas or swipe system.
===================================================== */

startBtn.onclick =
    function() {

        console.log(
            "START GAME clicked"
        );


        menu.classList.add(
            "hidden"
        );


        modeScreen.classList.remove(
            "hidden"
        );


        modeSelected =
            false;
    };


/* =====================================================
   BACK BUTTON
===================================================== */

backBtn.onclick =
    function() {

        modeScreen.classList.add(
            "hidden"
        );


        menu.classList.remove(
            "hidden"
        );


        modeSelected =
            false;


        modeSlash =
            [];


        previousModePoint =
            null;
    };


/* =====================================================
   CLASSIC TAP
===================================================== */

classicBtn.onclick =
    function() {

        chooseMode(
            "classic"
        );
    };


/* =====================================================
   ZEN TAP
===================================================== */

zenBtn.onclick =
    function() {

        chooseMode(
            "zen"
        );
    };


/* =====================================================
   START ACTUAL GAME
===================================================== */

function startGame(
    selectedMode
) {

    gameMode =
        selectedMode;


    score =
        0;


    lives =
        3;


    combo =
        0;


    cutNumber =
        0;


    lastCutTime =
        0;


    clearTimeout(
        spawnTimer
    );


    clearTimeout(
        comboTimer
    );


    fruits =
        [];


    particles =
        [];


    slash =
        [];


    scoreText.textContent =
        "0";


    livesText.textContent =
        "3";


    comboDisplay.textContent =
        "—";


    modeScreen.classList.add(
        "hidden"
    );


    gameOver.classList.add(
        "hidden"
    );


    playing =
        true;


    /*
        Start music after
        user selection.
    */

    if (
        musicOn
    ) {

        zenMusic.currentTime =
            0;


        zenMusic.volume =
            0.35;


        zenMusic.play()
            .catch(
                function() {}
            );
    }


    createWave();


    scheduleSpawn();
}


/* =====================================================
   GAME OVER
===================================================== */

function endGame() {

    if (
        !playing
    ) {

        return;
    }


    playing =
        false;


    clearTimeout(
        spawnTimer
    );


    clearTimeout(
        comboTimer
    );


    zenMusic.pause();


    finalScore.textContent =
        score;


    finalMode.textContent =
        gameMode === "classic"
            ? "CLASSIC MODE"
            : "ZEN MODE";


    gameOver.classList.remove(
        "hidden"
    );
}


/* =====================================================
   PLAY AGAIN
===================================================== */

restartBtn.onclick =
    function() {

        gameOver.classList.add(
            "hidden"
        );


        modeScreen.classList.remove(
            "hidden"
        );


        modeSelected =
            false;
    };


/* =====================================================
   MAIN MENU
===================================================== */

menuBtn.onclick =
    function() {

        playing =
            false;


        clearTimeout(
            spawnTimer
        );


        clearTimeout(
            comboTimer
        );


        zenMusic.pause();


        fruits =
            [];


        particles =
            [];


        slash =
            [];


        gameOver.classList.add(
            "hidden"
        );


        modeScreen.classList.add(
            "hidden"
        );


        menu.classList.remove(
            "hidden"
        );


        modeSelected =
            false;
    };


/* =====================================================
   MUSIC BUTTON
===================================================== */

musicButton.onclick =
    function() {

        if (
            zenMusic.paused
        ) {

            musicOn =
                true;


            zenMusic.play()
                .catch(
                    function() {}
                );


            musicButton.textContent =
                "🔊";

        } else {

            musicOn =
                false;


            zenMusic.pause();


            musicButton.textContent =
                "🔇";
        }
    };


/* =====================================================
   START GAME LOOP
===================================================== */

requestAnimationFrame(
    gameLoop
);
```
