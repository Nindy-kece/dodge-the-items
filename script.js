// ----------- Constants ------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// Pancake settings
const PANCAKE_X = 50;
const PANCAKE_Y_BASE = GAME_HEIGHT - 48;
const PANCAKE_SIZE = 32;
const GRAVITY = 0.7;
const JUMP_POWER = -11;

// Obstacle settings
const OBSTACLE_WIDTH = 26;
const OBSTACLE_HEIGHT = 28;
const OBSTACLE_GAP = 125;
const OBSTACLE_SPEED = 4;

// Game state
let pancakeY = PANCAKE_Y_BASE;
let pancakeVY = 0;
let isJumping = false;
let obstacles = [];
let score = 0;
let gameRunning = true;

// ----------- Utility Functions ------------

// Draw pixel pancake (body, arms, legs, smile & blush)
function drawPancake(x, y) {
    // body
    ctx.fillStyle = '#ffe083'; // pancake face
    ctx.fillRect(x, y, PANCAKE_SIZE, PANCAKE_SIZE);
    ctx.strokeStyle = '#a9703d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x+1, y+1, PANCAKE_SIZE-2, PANCAKE_SIZE-2);

    // arms & legs (pixel lines)
    ctx.fillStyle = '#a9703d';
    // left arm
    ctx.fillRect(x-7, y+10, 7, 5);
    // right arm
    ctx.fillRect(x+PANCAKE_SIZE, y+10, 7, 5);
    // left leg
    ctx.fillRect(x+6, y+PANCAKE_SIZE, 5, 9);
    // right leg
    ctx.fillRect(x+PANCAKE_SIZE-11, y+PANCAKE_SIZE, 5, 9);

    // Smile face
    ctx.fillStyle = '#5f310d';
    ctx.fillRect(x + 11, y + 17, 8, 4); // smile (short line)
    ctx.fillRect(x + 12, y + 21, 7, 3); // smile shading

    // Eyes
    ctx.fillStyle = '#40250f';
    ctx.fillRect(x + 10, y + 10, 4, 4); // left eye
    ctx.fillRect(x + 18, y + 10, 4, 4); // right eye

    // Blush/dots
    ctx.fillStyle = '#f6b6b6';
    ctx.fillRect(x + 7, y + 15, 3, 3);
    ctx.fillRect(x + PANCAKE_SIZE-10, y + 15, 3, 3);
}

// Draw pixel ingredient obstacle by type
function drawObstacle(obs) {
    const x = obs.x, y = obs.y;
    switch(obs.type) {
        case 'egg':
            // Egg (white+yellow pixel art)
            ctx.fillStyle = "#f8f3c1";
            ctx.fillRect(x+2, y+14, 20, 10); // egg white
            ctx.fillStyle = "#f6df41";
            ctx.fillRect(x+9, y+19, 8, 8);   // yolk
            ctx.strokeStyle = '#ecb611';
            ctx.strokeRect(x+2, y+14, 20, 10);
            break;
        case 'milk':
            // Milk carton
            ctx.fillStyle = "#e3f6ff";
            ctx.fillRect(x+5, y+7, 16, 20);
            ctx.fillStyle = "#afd8fa";
            ctx.fillRect(x+5, y+7, 16, 7); // top
            ctx.strokeStyle = "#8ecfeb";
            ctx.strokeRect(x+5, y+7, 16, 20);
            ctx.fillStyle = "#2173d6";
            ctx.fillRect(x+9, y+13, 8, 4); // stripe
            break;
        case 'flour':
            // Flour sack
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x+3, y+10, 20, 14);
            ctx.fillStyle = "#ceb475";
            ctx.fillRect(x+3, y+10, 20, 4); // top fold
            ctx.strokeStyle = "#cebc9e";
            ctx.strokeRect(x+3, y+10, 20, 14);
            ctx.fillStyle = "#b29856";
            ctx.fillRect(x+9, y+14, 8, 4); // wheat mark
            break;
        case 'butter':
            // Butter stick
            ctx.fillStyle = "#fff374";
            ctx.fillRect(x+9, y+15, 10, 9);
            ctx.strokeStyle = "#d3ae36";
            ctx.strokeRect(x+9, y+15, 10, 9);
            break;
    }
}

// Draw pixel kitchen background
function drawBackground() {
    // Kitchen wall
    ctx.fillStyle = '#fffadb';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Floor
    ctx.fillStyle = '#ffe097';
    ctx.fillRect(0, GAME_HEIGHT-36, GAME_WIDTH, 36);

    // Counter
    ctx.fillStyle = '#cc9b5b';
    ctx.fillRect(0, GAME_HEIGHT-60, GAME_WIDTH, 18);

    // Draw pixel cabinets (simple rectangles)
    for(let i=0;i<4;i++) {
        ctx.fillStyle = '#edd2a5';
        ctx.fillRect(24 + i*110, GAME_HEIGHT-75, 85, 15);
        ctx.fillStyle = '#d3c1a9';
        ctx.fillRect(52 + i*110, GAME_HEIGHT-67, 9, 9); // handle
    }

    // Draw tiny window for brightness effect
    ctx.fillStyle = '#caf6ff';
    ctx.fillRect(GAME_WIDTH-78, 18, 60, 34);
    ctx.fillStyle = '#ffe5b7';
    ctx.fillRect(GAME_WIDTH-75, 38, 56, 7); // bottom
}

// ----------- Game Functions ------------

// Reset game state and restart
function startGame() {
    // init pancake
    pancakeY = PANCAKE_Y_BASE;
    pancakeVY = 0;
    isJumping = false;
    // score
    score = 0;
    scoreElem.innerText = "Score: 0";
    // obstacles
    obstacles = [];
    for (let i=0;i<3;i++) {
        obstacles.push(generateObstacle(GAME_WIDTH + i*OBSTACLE_GAP + 100));
    }
    // running
    gameRunning = true;
    restartBtn.style.display = "none";
    requestAnimationFrame(gameLoop);
}

// Generate a random ingredient obstacle at an x-position
function generateObstacle(xpos) {
    const types = ['egg','milk','flour','butter'];
    return {
        x: xpos,
        y: GAME_HEIGHT-OBSTACLE_HEIGHT-24+(Math.random()*12|0),
        type: types[Math.floor(Math.random()*types.length)],
        scored: false
    };
}

// Handle the pancake jump
function jump() {
    if(!gameRunning) return;
    if(pancakeY >= PANCAKE_Y_BASE) {
        pancakeVY = JUMP_POWER;
        isJumping = true;
    }
}

// Collision detection (simple box overlap)
function checkCollision(obs) {
    let px = PANCAKE_X;
    let py = pancakeY;
    // pancake box
    let pWidth = PANCAKE_SIZE;
    let pHeight = PANCAKE_SIZE;
    // obstacle box
    let ox = obs.x;
    let oy = obs.y;
    let oWidth = OBSTACLE_WIDTH;
    let oHeight = OBSTACLE_HEIGHT;
    return (
        px < ox + oWidth &&
        px + pWidth > ox &&
        py < oy + oHeight &&
        py + pHeight > oy
    );
}

// ----------- Main Game Loop ------------
function gameLoop() {
    // Update pancake jump
    pancakeY += pancakeVY;
    pancakeVY += GRAVITY;
    // Prevent falling below ground
    if (pancakeY >= PANCAKE_Y_BASE) {
        pancakeY = PANCAKE_Y_BASE;
        pancakeVY = 0;
        isJumping = false;
    }

    // Move obstacles & respawn if out
    for(let obs of obstacles) {
        obs.x -= OBSTACLE_SPEED;
    }

    if(obstacles[0].x < -OBSTACLE_WIDTH) {
        obstacles.shift();
        obstacles.push(generateObstacle(GAME_WIDTH + Math.random()*60));
    }

    // Collision
    for(let obs of obstacles) {
        if(checkCollision(obs)) {
            gameOver();
            return; // Stop game loop
        }
        // Scoring: only when the obstacle passes.
        if(!obs.scored && obs.x + OBSTACLE_WIDTH < PANCAKE_X) {
            obs.scored = true;
            score++;
            scoreElem.innerText = "Score: " + score;
        }
    }

    // Draw everything
    ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);
    drawBackground();
    drawPancake(PANCAKE_X, pancakeY);
    for(let obs of obstacles)
        drawObstacle(obs);

    // Grass line (for fun)
    ctx.fillStyle = '#7ebd62';
    for(let gx=0;gx<GAME_WIDTH;gx+=16)
        ctx.fillRect(gx, GAME_HEIGHT-10, 12, 7);

    if(gameRunning)
        requestAnimationFrame(gameLoop);
}

// Game Over Sequence
function gameOver() {
    gameRunning = false;
    restartBtn.style.display = "inline-block";
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#623e19";
    ctx.fillRect(45, 60, GAME_WIDTH - 90, GAME_HEIGHT - 120);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff7e1";
    ctx.font = "22px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", GAME_WIDTH/2, GAME_HEIGHT/2-10);
    ctx.font = "17px Verdana";
    ctx.fillText("Score: " + score, GAME_WIDTH/2, GAME_HEIGHT/2 +20);
    ctx.font = "13px monospace";
    ctx.fillText("Press Restart to play again!", GAME_WIDTH/2, GAME_HEIGHT/2+42);
    ctx.restore();
}

// ----------- Controls ------------
document.addEventListener('keydown', function(e){
    if(e.code === "Space" && gameRunning){
        jump();
        e.preventDefault();
    }
});

// Restarting the game
restartBtn.onclick = function(){
    startGame();
}

// Initial game start
startGame();
