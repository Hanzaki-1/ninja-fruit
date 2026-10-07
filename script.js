const canvas =
    document.getElementById("canvas");

const ctx =
    canvas.getContext("2d");


/* =========================
   UI
========================= */

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


/* =========================
   GAME STATE
========================= */

let score = 0;

let lives = 3;

let playing = false;

let gameMode = "classic";

let fruits = [];

let particles = [];

let slash = [];

let spawnTimer = null;

let comboTimer = null;

let musicOn = true;

let combo = 0;

let lastCutTime = 0;

let cutNumber = 0;


/* =========================
   MODE SLICE STATE
========================= */

let modeTouchStart = null;

let modeSlash = [];

let modeSelected = false;


/* =========================
   CANVAS
========================= */

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
    "🍑",
    "🍐"
];


/* =========================
   SPEED
========================= */

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


/* =========================
   POINTS
========================= */

function getPoints() {

    return Math.max(
        1,
        10 - cutNumber
    );
}


/* =========================
   FRUIT
========================= */

class Fruit {

    constructor() {

        this.x =
            Math.random() *
            (canvas.width - 140) +
            70;

        this.y =
            canvas.height * 0.78;

        this.size =
            60 +
            Math.random() * 10;

        const centerX =
            canvas.width / 2;

        const direction =
            centerX - this.x;

        this.speedX =
            direction * 0.004 +
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
            -(getSpeed() +
            Math.random() * 2.5);

        this.gravity = 0.28;

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


        if (this.x < 35) {

            this.x = 35;

            this.speedX *= -0.6;
        }


        if (
            this.x >
            canvas.width - 35
        ) {

            this.x =
                canvas.width - 35;

            this.speedX *= -0.6;
        }
    }


    draw() {

        ctx.save();

        ctx.font =
            this.size + "px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.shadowColor =
            "rgba(0,0,0,.45)";

        ctx.shadowBlur = 8;

        ctx.fillText(
            this.emoji,
            this.x,
            this.y
        );

        ctx.restore();
    }
}


/* =========================
   BOMB
========================= */

class Bomb {

    constructor() {

        this.x =
            Math.random() *
            (canvas.width - 140) +
            70;

        this.y =
            canvas.height * 0.78;

        this.size = 64;

        const centerX =
            canvas.width / 2;

        const direction =
            centerX - this.x;

        this.speedX =
            direction * 0.004 +
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
            -(getSpeed() +
            Math.random() * 2.5);

        this.gravity = 0.28;

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

            this.speedX *= -0.6;
        }


        if (
            this.x >
            canvas.width - 35
        ) {

            this.x =
                canvas.width - 35;

            this.speedX *= -0.6;
        }
    }


    draw() {

        ctx.save();

        ctx.font =
            this.size + "px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.shadowColor =
            "rgba(0,0,0,.6)";

        ctx.shadowBlur = 10;

        ctx.fillText(
            "💣",
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

    constructor(
        x,
        y,
        bomb = false
    ) {

        this.x = x;

        this.y = y;

        this.vx =
            (Math.random() - .5) *
            (bomb ? 18 : 12);

        this.vy =
            (Math.random() - .5) *
            (bomb ? 18 : 12);

        this.life = 1;

        this.size =
            bomb ? 6 : 4;

        this.bomb = bomb;
    }


    update() {

        this.x += this.vx;

        this.y += this.vy;

        this.vy += .3;

        this.life -= .04;
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


/* =================================================
   MODE RING POSITION
================================================= */

function getRingCenter(
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


/* =================================================
   CHECK IF SLASH CROSSES RING
================================================= */

function slashHitsRing(
    start,
    end,
    ring
) {

    const center =
        getRingCenter(ring);


    /*
        Distance from the
        line segment to the
        ring center.
    */

    const dx =
        end.x - start.x;

    const dy =
        end.y - start.y;


    if (
        dx === 0 &&
        dy === 0
    ) {

        return false;
    }


    const t =
        Math.max(
            0,
            Math.min(
                1,
                (
                    (center.x - start.x) * dx +
                    (center.y - start.y) * dy
                ) /
                (dx * dx + dy * dy)
            )
        );


    const closestX =
        start.x +
        t * dx;

    const closestY =
        start.y +
        t * dy;


    const distance =
        Math.hypot(
            center.x - closestX,
            center.y - closestY
        );


    /*
        Slice must pass through
        the ring area.
    */

    return (
        distance <
        center.radius * 0.82
    );
}


/* =================================================
   MODE SLASH EFFECT
================================================= */

function drawModeSlash() {

    if (
        modeSlash.length < 2
    )
        return;


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

    ctx.lineWidth = 7;

    ctx.lineCap =
        "round";

    ctx.lineJoin =
        "round";

    ctx.shadowBlur = 20;

    ctx.shadowColor =
        "white";

    ctx.stroke();

    ctx.restore();
}


/* =================================================
   MODE SELECT
================================================= */

function selectMode(
    selectedMode
) {

    if (modeSelected)
        return;


    modeSelected = true;


    /*
        Small visual flash.
    */

    const target =
        selectedMode === "classic"
            ? classicBtn
            : zenBtn;


    target.classList.add(
        "selected"
    );


    setTimeout(
        function() {

            startGame(
                selectedMode
            );

        },
        180
    );
}


/* =================================================
   MODE TOUCH START
================================================= */

modeScreen.addEventListener(
    "touchstart",
    function(e) {

        e.preventDefault();

        e.stopPropagation();


        if (modeSelected)
            return;


        const touch =
            e.touches[0];


        modeTouchStart = {

            x:
                touch.clientX,

            y:
                touch.clientY
        };


        modeSlash = [
            modeTouchStart
        ];

    },
    {
        passive: false
    }
);


/* =================================================
   MODE TOUCH MOVE
================================================= */

modeScreen.addEventListener(
    "touchmove",
    function(e) {

        e.preventDefault();

        e.stopPropagation();


        if (
            modeSelected ||
            !modeTouchStart
        )
            return;


        const touch =
            e.touches[0];


        const current = {

            x:
                touch.clientX,

            y:
                touch.clientY
        };


        modeSlash.push(
            current
        );


        if (
            modeSlash.length > 12
        ) {

            modeSlash.shift();
        }


        /*
            Check each segment
            of the swipe.
        */

        const previous =
            modeSlash[
                modeSlash.length - 2
            ];


        if (
            slashHitsRing(
                previous,
                current,
                classicBtn
            )
        ) {

            selectMode(
                "classic"
            );

            return;
        }


        if (
            slashHitsRing(
                previous,
                current,
                zenBtn
            )
        ) {

            selectMode(
                "zen"
            );

            return;
        }

    },
    {
        passive: false
    }
);


/* =================================================
   MODE TOUCH END
================================================= */

modeScreen.addEventListener(
    "touchend",
    function(e) {

        e.preventDefault();

        e.stopPropagation();


        modeTouchStart = null;

        modeSlash = [];

    },
    {
        passive: false
    }
);


/* =================================================
   ALSO SUPPORT MOUSE DRAG
================================================= */

let mouseDown = false;

let mouseStart = null;


modeScreen.addEventListener(
    "mousedown",
    function(e) {

        mouseDown = true;

        mouseStart = {

            x: e.clientX,

            y: e.clientY
        };

        modeSlash = [
            mouseStart
        ];
    }
);


modeScreen.addEventListener(
    "mousemove",
    function(e) {

        if (
            !mouseDown ||
            modeSelected
        )
            return;


        const current = {

            x: e.clientX,

            y: e.clientY
        };


        modeSlash.push(
            current
        );


        const previous =
            modeSlash[
                modeSlash.length - 2
            ];


        if (
            slashHitsRing(
                previous,
                current,
                classicBtn
            )
        ) {

            selectMode(
                "classic"
            );

            return;
        }


        if (
            slashHitsRing(
                previous,
                current,
                zenBtn
            )
        ) {

            selectMode(
                "zen"
            );

            return;
        }
    }
);


modeScreen.addEventListener(
    "mouseup",
    function() {

        mouseDown = false;

        mouseStart = null;

        modeSlash = [];
    }
);


/* =========================
   COMBO
========================= */

function showCombo(
    x,
    y
) {

    const comboText =
        document.createElement(
            "div"
        );


    comboText.textContent =
        combo + "x";


    comboText.style.position =
        "fixed";

    comboText.style.left =
        x + "px";

    comboText.style.top =
        y + "px";

    comboText.style.transform =
        "translate(-50%,-50%) scale(.7)";

    comboText.style.color =
        "#fff";

    comboText.style.fontSize =
        combo >= 5
            ? "46px"
            : "34px";

    comboText.style.fontWeight =
        "900";

    comboText.style.pointerEvents =
        "none";

    comboText.style.zIndex =
        "200";

    comboText.style.textShadow =
        "0 3px 18px rgba(0,0,0,.9)";

    comboText.style.transition =
        "all .45s ease-out";


    document.body.appendChild(
        comboText
    );


    requestAnimationFrame(
        function() {

            comboText.style.top =
                (y - 70) + "px";

            comboText.style.transform =
                "translate(-50%,-50%) scale(1.25)";

            comboText.style.opacity =
                "0";
        }
    );


    setTimeout(
        function() {

            comboText.remove();

        },
        500
    );
}


function registerCombo(
    x,
    y
) {

    const now =
        Date.now();


    if (
        now - lastCutTime <
        1100
    ) {

        combo++;

    } else {

        combo = 1;
    }


    lastCutTime =
        now;


    clearTimeout(
        comboTimer
    );


    comboTimer =
        setTimeout(
            function() {

                combo = 0;

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


/* =========================
   SLICE FRUIT
========================= */

function sliceFruit(
    fruit
) {

    if (
        fruit.sliced
    )
        return;


    fruit.sliced = true;


    const basePoints =
        getPoints();


    cutNumber++;


    const multiplier =
        Math.max(
            1,
            combo + 1
        );


    score +=
        basePoints *
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


/* =========================
   BOMB
========================= */

function hitBomb(
    bomb
) {

    bomb.sliced = true;


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


/* =========================
   CREATE OBJECT
========================= */

function createObject() {

    if (!playing)
        return;


    if (
        gameMode === "classic" &&
        Math.random() < .16
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


/* =========================
   WAVE
========================= */

function createWave() {

    if (!playing)
        return;


    const level =
        Math.floor(
            score / 100
        );


    let amount;


    if (level === 0) {

        amount =
            Math.random() < .65
                ? 1
                : 2;

    } else if (level === 1) {

        amount = 2;

    } else if (level === 2) {

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


/* =========================
   SPAWN
========================= */

function scheduleSpawn() {

    if (!playing)
        return;


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


/* =========================
   GAME TOUCH
========================= */

function touchMove(
    x,
    y
) {

    if (!playing)
        return;


    slash.push({
        x,
        y
    });


    if (
        slash.length > 10
    ) {

        slash.shift();
    }


    for (
        const object of fruits
    ) {

        if (
            object.sliced
        )
            continue;


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

            } else {

                sliceFruit(
                    object
                );
            }
        }
    }
}


/* =========================
   GAME TOUCH EVENTS
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
   SLASH
========================= */

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
        "rgba(255,255,255,.95)";

    ctx.lineWidth = 6;

    ctx.lineCap =
        "round";

    ctx.lineJoin =
        "round";

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "white";

    ctx.stroke();

    ctx.restore();
}


/* =========================
   GAME LOOP
========================= */

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
        FRUITS
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


/* =========================
   START BUTTON
========================= */

startBtn.addEventListener(
    "click",
    function() {

        menu.classList.add(
            "hidden"
        );

        modeScreen.classList.remove(
            "hidden"
        );

        modeSelected = false;
    }
);


/* =========================
   BACK
========================= */

backBtn.addEventListener(
    "click",
    function() {

        modeScreen.classList.add(
            "hidden"
        );

        menu.classList.remove(
            "hidden"
        );

        modeSlash = [];

        modeTouchStart = null;
    }
);


/* =========================
   TAP CLASSIC
========================= */

classicBtn.addEventListener(
    "click",
    function() {

        selectMode(
            "classic"
        );
    }
);


/* =========================
   TAP ZEN
========================= */

zenBtn.addEventListener(
    "click",
    function() {

        selectMode(
            "zen"
        );
    }
);


/* =========================
   START GAME
========================= */

function startGame(
    selectedMode
) {

    gameMode =
        selectedMode;


    score = 0;

    lives = 3;

    combo = 0;

    cutNumber = 0;

    lastCutTime = 0;


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

    comboDisplay.textContent =
        "—";

    livesText.textContent =
        "3";


    modeScreen.classList.add(
        "hidden"
    );

    gameOver.classList.add(
        "hidden"
    );


    playing = true;


    if (musicOn) {

        zenMusic.currentTime =
            0;

        zenMusic.volume =
            .35;


        zenMusic.play()
            .catch(
                function() {}
            );
    }


    createWave();

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


    finalMode.textContent =
        gameMode === "classic"
            ? "CLASSIC MODE"
            : "ZEN MODE";


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

        gameOver.classList.add(
            "hidden"
        );

        modeScreen.classList.remove(
            "hidden"
        );

        modeSelected = false;
    }
);


/* =========================
   MAIN MENU
========================= */

menuBtn.addEventListener(
    "click",
    function() {

        playing = false;


        clearTimeout(
            spawnTimer
        );

        clearTimeout(
            comboTimer
        );


        zenMusic.pause();


        fruits = [];

        particles = [];

        slash = [];


        gameOver.classList.add(
            "hidden"
        );

        menu.classList.remove(
            "hidden"
        );
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
