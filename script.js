const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const gameTips = document.getElementById('game-tips');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

// BG Elements setup (lamps/doors etc)
function renderBg() {
    // Lamps (pixel)
    const lamps = document.querySelector('.lamps');
    if (lamps) {
        lamps.innerHTML =
        '<div class="lamp l1"></div>'+
        '<div class="lamp l2"></div>'+
        '<div class="lamp l3"></div>'
        ;
        lamps.querySelectorAll('.lamp').forEach(item=>{
            let stick=document.createElement('div');
            stick.className="lamp-stick";
            item.appendChild(stick);
        });
    }
    // Doors
    function mkDoorHtml() {
        return '<div class="door"><div class="knob"></div></div>'
             + '<div class="door"><div class="knob"></div></div>';
    }
    let dl=document.querySelector('.doors-left');
    let dr=document.querySelector('.doors-right');
    if(dl) dl.innerHTML = mkDoorHtml();
    if(dr) dr.innerHTML = mkDoorHtml();
}

function makePancakePixel(container){
    container.innerHTML =
        `<div class="body"></div>
        <div class="arm left"></div>
        <div class="arm right"></div>
        <div class="leg left"></div>
        <div class="leg right"></div>
        <div class="eye left"></div>
        <div class="eye right"></div>
        <div class="smile"></div>
        `;
}

// Setup player pixel (main pancake arms/legs)
makePancakePixel(player);

function setPlayerActive(active) {
    if (active) {
        player.classList.add('active');
    } else {
        player.classList.remove('active');
    }
}

// Main state
let isJumping = false;
let jumpHeight = 0;
let gravity = 1.18; // Gravity lebih kecil supaya jump pelan
let jumpSpeed = 0;
let score = 0;
let obstacles = [];
let gameOver = false;
let isStarted = false;

// Game loop
function update() {
    if (!gameOver && isStarted) {
        if (isJumping) {
            jumpHeight += jumpSpeed;
            jumpSpeed -= gravity;
            if (jumpSpeed > 5
