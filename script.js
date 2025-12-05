const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const gameTips = document.getElementById('game-tips');

let isJumping = false;
let jumpHeight = 0;
let gravity = 2;
let jumpSpeed = 0;
let score = 0;
let obstacles = [];
let gameOver = false;
let isStarted = false;

// Start screen
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

// --------- PANCAKE RENDER helper -----------
function renderPancakeChar(container) {
    container.innerHTML = `
      <div class="body"></div>
      <div class="arm left"></div>
      <div class="arm right"></div>
      <div class="leg left"></div>
      <div class="leg right"></div>
      <div class="eye left"></div>
      <div class="eye right"></div>
      <div class="smile"></div>
    `;
}
function ensurePlayerStruct() {
    // Pancake pixel arms/legs/eyes (if not exist, rerender!)
    if (player.innerHTML === "" || player.children.length<6)
        renderPancakeChar(player);
}
ensurePlayerStruct();

// Animate arms/legs on jump!
function setPlayerActive(anim) {
    if(anim)
        player.classList.add("active");
    else
        player.classList.remove("active");
}

// ---------- DOORS & LAMP STRUCTURE ------------
let setupBGRun = false;
function renderBackground() {
    // Only once
    if(setupBGRun)return;
    setupBGRun=true;
    // left doors
    const leftPanel = gameContainer.querySelector('.doors.left');
    const rightPanel = gameContainer.querySelector('.doors.right');
    if(leftPanel&&rightPanel){
        leftPanel.innerHTML =
        `<div class="door"><div class='knob'></div></div>
         <div class="door"><div class='knob'></div></div>`;
        rightPanel.innerHTML =
        `<div class="door"><div class='knob'></div></div>
         <div class="door"><div class='knob'></div></div>`;
    }
    // lamp
    const lamps = gameContainer.querySelector('.lamps');
    if(lamps) {
        lamps.innerHTML =
        `<div class='lamp'><div class='lamp-top'></div><div class='lamp-stick'></div></div>
         <div class='lamp'><div class='lamp-top'></div><div class='lamp-stick'></div></div>
         <div class='lamp'><div class='lamp-top'></div><div class='lamp-stick'></div></div>`;
    }
}
renderBackground();

//--- GAME LOGIC ------------
function jump() {
    if (!isJumping && !gameOver && isStarted) {
        isJumping = true;
        jumpSpeed = 19;
        setPlayerActive(true);
    }
}
function update() {
    ensurePlayerStruct();
    if (!gameOver && isStarted) {
        // Pancake jumping physics
        if (isJumping) {
            jumpHeight += jumpSpeed;
            jumpSpeed -= gravity * 1.15;
            if (jumpSpeed > 6) jumpHeight += 0.8; // meloncat agak lebar
            if (jumpHeight <= 0) {
                jumpHeight = 0;
                isJumping = false;
                setPlayerActive(false);
            }
        }
        // Update pancake position
        player.style.bottom = (32 + jumpHeight) + 'px';

        // Obstacles update + collision
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= 6.5;
            obs.el.style.left = obs.x + 'px';

            // Collision (adjust for arms/legs)
            if (
                obs.x < 90 && obs.x + obs.width > 63 &&
                jumpHeight < 22 // pixel arms/ kaki abaikan
            ) {
                endGame();
                return;
            }

            if (obs.x + obs.width < 0) {
                gameContainer.removeChild(obs.el);
                obstacles.splice(i, 1);
                score++;
                scoreEl.textContent = 'Skor: ' + score;
            }
        }
    }
    requestAnimationFrame(update);
}

// Buat monster pixel/ghost
function spawnObstacle() {
    if (gameOver || !isStarted) return;
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    let width = 28;

    // Face structure
    obstacle.innerHTML = `
        <div class="ghost-face"></div>
        <div class="ghost-eye left"></div>
        <div class="ghost-eye right"></div>
        <div class="ghost-mouth"></div>
    `;
    obstacle.style.left = (gameContainer.offsetWidth) + 'px';
    gameContainer.appendChild(obstacle);

    obstacles.push({
        el: obstacle,
        x: gameContainer.offsetWidth,
        width: width
    });

    let interval = 1100 + Math.random() * 900;
    setTimeout(spawnObstacle, interval);
}

function endGame() {
    gameOver = true;
    setTimeout(() => {
        alert('Pancake ketangkap di hallway hotel!\nSkor: ' + score + '\nKlik OK untuk main lagi.');
        location.reload();
    }, 50);
}

// --- KONTROL UTAMA
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        jump();
        e.preventDefault();
    }
});
gameContainer.addEventListener('click', jump);

// START tombol
startBtn.onclick = function() {
    startScreen.style.display = 'none';
    gameContainer.style.display = '';
    scoreEl.style.display = '';
    gameTips.style.display = '';
    isStarted = true;

    renderBackground();
    score = 0;
    scoreEl.textContent = 'Skor: ' + score;
    obstacles = [];
    gameOver = false;
    ensurePlayerStruct();
    update();
    setTimeout(spawnObstacle, 1200); // biar visual dulu
};
// Auto add pancake
ensurePlayerStruct();
update();
