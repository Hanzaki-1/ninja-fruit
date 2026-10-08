```javascript
"use strict";

/*
========================================
NINJA FRUIT
BASIC WORKING VERSION
========================================
*/

console.log("SCRIPT.JS LOADED");


/* =========================
   GET ELEMENTS
========================= */

const menu = document.getElementById("menu");
const modeScreen = document.getElementById("modeScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOver = document.getElementById("gameOver");

const startBtn = document.getElementById("startBtn");
const classicBtn = document.getElementById("classicBtn");
const zenBtn = document.getElementById("zenBtn");
const backBtn = document.getElementById("backBtn");

const restartBtn = document.getElementById("restartBtn");
const menuBtn = document.getElementById("menuBtn");


/* =========================
   CHECK ELEMENTS
========================= */

console.log("START BUTTON:", startBtn);
console.log("MODE SCREEN:", modeScreen);
console.log("CLASSIC BUTTON:", classicBtn);
console.log("ZEN BUTTON:", zenBtn);


/* =========================
   SCREEN FUNCTIONS
========================= */

function hideEverything() {

    menu.classList.add("hidden");

    modeScreen.classList.add("hidden");

    gameScreen.classList.add("hidden");

    gameOver.classList.add("hidden");

}


function showMenu() {

    hideEverything();

    menu.classList.remove("hidden");

}


function showModes() {

    hideEverything();

    modeScreen.classList.remove("hidden");

    console.log("MODE SCREEN OPENED");

}


function startGame(mode) {

    hideEverything();

    gameScreen.classList.remove("hidden");

    console.log("GAME STARTED:", mode);

}


/* =========================
   START BUTTON
========================= */

startBtn.onclick = function(event) {

    event.preventDefault();

    console.log("START BUTTON PRESSED!");

    showModes();

};


/* =========================
   CLASSIC
========================= */

classicBtn.onclick = function(event) {

    event.preventDefault();

    console.log("CLASSIC SELECTED");

    startGame("classic");

};


/* =========================
   ZEN
========================= */

zenBtn.onclick = function(event) {

    event.preventDefault();

    console.log("ZEN SELECTED");

    startGame("zen");

};


/* =========================
   BACK
========================= */

backBtn.onclick = function(event) {

    event.preventDefault();

    showMenu();

};


/* =========================
   RESTART
========================= */

restartBtn.onclick = function() {

    showModes();

};


/* =========================
   MAIN MENU
========================= */

menuBtn.onclick = function() {

    showMenu();

};


/* =========================
   INITIAL SCREEN
========================= */

showMenu();

console.log("NINJA FRUIT READY!");
```
