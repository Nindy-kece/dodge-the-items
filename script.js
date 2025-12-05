const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const backgroundPixel = document.getElementById('background-pixel');
let isJumping = false;
let jumpHeight = 0;
let gravity = 2;
let jumpSpeed = 0;
let score = 0;
let obstacles = [];
let gameOver = false;
let isStarted = false;

// Start screen & tutorial
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const gameTips = document.getElement
