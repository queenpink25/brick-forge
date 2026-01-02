/****************************************************
 * BRICK FORGE GAME
 * Complete game with 5 levels
 ****************************************************/

// ============================================
// PART 1: GET CANVAS AND SETUP VARIABLES
// ============================================

// Get the canvas element where we draw the game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // ctx is for drawing

// Get elements to show score, lives, level, bricks
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const bricksLeftElement = document.getElementById('bricks-left');

// Get the screens (start, level complete, game over)
const startScreen = document.getElementById('startScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const completedLevelElement = document.getElementById('completedLevel');
const finalScoreElement = document.getElementById('finalScore');

// Get all buttons
const startBtn = document.getElementById('startBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const launchBtn = document.getElementById('launchBtn');

// ============================================
// PART 2: GAME VARIABLES (STORES GAME DATA)
// ============================================

let score = 0;          // Player's score
let lives = 3;          // How many lives left
let currentLevel = 1;   // Current level (1-5)
let gameRunning = false;// Is game playing?
let gameOver = false;   // Is game over?
let levelComplete = false; // Level finished?

// Track unlocked levels
let unlockedLevels = [1]; // Level 1 is always unlocked

// ============================================
// PART 3: LEVELS DEFINITION
// ============================================

// Each level has different brick patterns
// 0 = no brick, 1 = normal brick, 2 = strong brick
const levels = [
    // LEVEL 1: Simple rows (Easiest)
    {
        name: "Easy Start",
        bricks: [
            [1,1,1,1,1,1,1,1], // Row 1: all bricks
            [1,1,1,1,1,1,1,1], // Row 2: all bricks
            [1,1,1,1,1,1,1,1]  // Row 3: all bricks
        ],
        ballSpeed: 4,
        colors: ['#ff5555', '#ff8888', '#ffaaaa'] // Brick colors
    },
    
    // LEVEL 2: Checker pattern
    {
        name: "Checkerboard",
        bricks: [
            [1,0,1,0,1,0,1,0], // Row 1: every other brick
            [0,1,0,1,0,1,0,1], // Row 2: opposite pattern
            [1,0,1,0,1,0,1,0], // Row 3
            [0,1,0,1,0,1,0,1]  // Row 4
        ],
        ballSpeed: 5,
        colors: ['#ffaa00', '#ffcc44', '#ffee88']
    },
    
    // LEVEL 3: Wall with holes
    {
        name: "Wall with Holes",
        bricks: [
            [1,1,1,1,1,1,1,1], // Solid row
            [1,0,0,1,1,0,0,1], // Some bricks missing
            [1,1,1,1,1,1,1,1], // Solid row
            [1,0,1,0,1,0,1,0], // Alternating
            [0,1,0,1,0,1,0,1]  // Alternating
        ],
        ballSpeed: 6,
        colors: ['#5555ff', '#8888ff', '#aaaaff']
    },
    
    // LEVEL 4: Pyramid shape
    {
        name: "Pyramid",
        bricks: [
            [0,0,1,1,1,1,0,0], // Small row
            [0,1,1,1,1,1,1,0], // Medium row
            [1,1,1,1,1,1,1,1], // Large row
            [1,1,1,1,1,1,1,1], // Large row
            [0,1,1,1,1,1,1,0], // Medium row
            [0,0,1,1,1,1,0,0]  // Small row
        ],
        ballSpeed: 7,
        colors: ['#ff55ff', '#ff88ff', '#ffaaff']
    },
    
    // LEVEL 5: Heart shape (Hardest)
    {
        name: "Heart Challenge",
        bricks: [
            [2,2,2,2,2,2,2,2], // Top: all strong bricks
            [2,1,1,1,1,1,1,2], // Row 2: mix
            [2,1,2,2,2,2,1,2], // Row 3: pattern
            [2,1,2,1,1,2,1,2], // Row 4: heart shape
            [2,1,2,1,1,2,1,2], // Row 5: heart shape
            [2,1,2,2,2,2,1,2], // Row 6: pattern
            [2,1,1,1,1,1,1,2], // Row 7: mix
            [2,2,2,2,2,2,2,2]  // Bottom: all strong
        ],
        ballSpeed: 8,
        colors: ['#00ff88', '#44ffaa', '#88ffcc']
    }
];

// ============================================
// PART 4: PADDLE OBJECT (PLAYER CONTROLS THIS)
// ============================================

const paddle = {
    x: canvas.width / 2 - 50, // Start in middle
    y: canvas.height - 30,    // Near bottom
    width: 100,               // How wide
    height: 15,               // How tall
    speed: 8,                 // How fast it moves
    color: '#00ff88',         // Green color
    
    // Draw the paddle on screen
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add shiny top part
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
    },
    
    // Move paddle left or right
    move(direction) {
        if (direction === 'left') {
            this.x -= this.speed; // Move left
        } else if (direction === 'right') {
            this.x += this.speed; // Move right
        }
        
        // Don't let paddle go off screen
        if (this.x < 0) {
            this.x = 0; // Stop at left edge
        }
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width; // Stop at right edge
        }
    }
};

// ============================================
// PART 5: BALL OBJECT
// ============================================

const ball = {
    x: canvas.width / 2,   // Start in middle
    y: canvas.height / 2,  // Start in middle
    radius: 10,            // Size of ball
    speed: 5,              // How fast it moves
    dx: 0,                 // Horizontal speed
    dy: 0,                 // Vertical speed
    color: '#ffffff',      // White color
    launched: false,       // Has ball been launched?
    
    // Draw the ball
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shiny highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
    },
    
    // Move the ball
    move() {
        if (!this.launched) return; // Don't move if not launched
        
        this.x += this.dx; // Move horizontally
        this.y += this.dy; // Move vertically
        
        // Bounce off left/right walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.dx = -this.dx; // Reverse direction
        }
        
        // Bounce off ceiling
        if (this.y - this.radius < 0) {
            this.dy = -this.dy; // Reverse direction
        }
        
        // Check if ball hits paddle
        if (this.y + this.radius > paddle.y && 
            this.y - this.radius < paddle.y + paddle.height &&
            this.x + this.radius > paddle.x && 
            this.x - this.radius < paddle.x + paddle.width) {
            
            // Change angle based on where ball hits paddle
            let hitSpot = (this.x - paddle.x) / paddle.width;
            this.dx = 8 * (hitSpot - 0.5); // -4 to 4
            this.dy = -Math.abs(this.dy); // Always bounce up
            
            // Move ball above paddle to avoid sticking
            this.y = paddle.y - this.radius;
        }
        
        // Check if ball fell off bottom (missed paddle)
        if (this.y + this.radius > canvas.height) {
            loseLife(); // Player loses a life
        }
    },
    
    // Launch the ball into play
    launch() {
        if (!this.launched) {
            // Random angle between 30 and 60 degrees
            let angle = Math.random() * Math.PI / 3 + Math.PI / 6;
            this.dx = Math.cos(angle) * this.speed;
            this.dy = -Math.sin(angle) * this.speed;
            this.launched = true;
        }
    },
    
    // Reset ball to starting position
    reset() {
        this.x = canvas.width / 2;
        this.y = paddle.y - this.radius;
        this.dx = 0;
        this.dy = 0;
        this.launched = false;
    }
};

// ============================================
// PART 6: BRICKS SYSTEM
// ============================================

let bricks = []; // Array to hold all bricks

// Create bricks for current level
function createBricks() {
    bricks = []; // Clear old bricks
    
    const level = levels[currentLevel - 1]; // Get current level data
    const rows = level.bricks.length;      // How many rows
    const cols = level.bricks[0].length;   // How many columns
    
    const brickWidth = 70;   // Width of each brick
    const brickHeight = 25;  // Height of each brick
    const padding = 5;       // Space between bricks
    
    // Calculate where to start drawing bricks (to center them)
    const totalWidth = cols * (brickWidth + padding) - padding;
    const startX = (canvas.width - totalWidth) / 2;
    
    // Create each brick
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const brickType = level.bricks[row][col];
            
            // Only create brick if type is not 0
            if (brickType > 0) {
                const brick = {
                    x: col * (brickWidth + padding) + startX,
                    y: row * (brickHeight + padding) + 50,
                    width: brickWidth,
                    height: brickHeight,
                    hits: brickType,        // 1 or 2 hits needed
                    maxHits: brickType,     // Original hits needed
                    color: level.colors[row % level.colors.length],
                    visible: true           // Is brick still there?
                };
                bricks.push(brick); // Add to bricks array
            }
        }
    }
    
    updateBricksLeft(); // Update display
}

// Draw all bricks on screen
function drawBricks() {
    bricks.forEach(brick => {
        if (!brick.visible) return; // Skip if brick is broken
        
        // Make brick darker if it's been hit
        let color = brick.color;
        if (brick.hits < brick.maxHits) {
            color = darkenColor(color, 0.3); // Darken by 30%
        }
        
        // Draw brick
        ctx.fillStyle = color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Add border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        
        // Show hit count for strong bricks (2 hits needed)
        if (brick.maxHits > 1) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                brick.hits, // Show remaining hits
                brick.x + brick.width / 2,
                brick.y + brick.height / 2 + 4
            );
        }
    });
}

// Helper: Darken a color
function darkenColor(color, amount) {
    // Remove # from color code
    color = color.replace('#', '');
    
    // Convert to RGB numbers
    let r = parseInt(color.substr(0, 2), 16);
    let g = parseInt(color.substr(2, 2), 16);
    let b = parseInt(color.substr(4, 2), 16);
    
    // Make darker
    r = Math.floor(r * (1 - amount));
    g = Math.floor(g * (1 - amount));
    b = Math.floor(b * (1 - amount));
    
    // Convert back to color code
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Check if ball hits any bricks
function checkBrickCollision() {
    bricks.forEach(brick => {
        if (!brick.visible) return; // Skip broken bricks
        
        // Check if ball is touching this brick
        if (ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height) {
            
            // Hit the brick
            brick.hits--;
            
            // Add to score (strong bricks give more points)
            score += brick.maxHits * 10;
            updateScore();
            
            // Check if brick is destroyed
            if (brick.hits <= 0) {
                brick.visible = false;
                updateBricksLeft();
                
                // Check if all bricks are gone
                const remaining = bricks.filter(b => b.visible).length;
                if (remaining === 0) {
                    completeLevel(); // Level finished!
                }
            }
            
            // Bounce the ball
            // Find which side of brick was hit
            const ballCenterX = ball.x;
            const ballCenterY = ball.y;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;
            
            const dx = ballCenterX - brickCenterX;
            const dy = ballCenterY - brickCenterY;
            
            // Bounce based on hit location
            if (Math.abs(dx) > Math.abs(dy)) {
                ball.dx = -ball.dx; // Hit left/right side
            } else {
                ball.dy = -ball.dy; // Hit top/bottom side
            }
        }
    });
}

// ============================================
// PART 7: GAME FUNCTIONS
// ============================================

// Update score display
function updateScore() {
    scoreElement.textContent = score.toString().padStart(4, '0');
}

// Update lives display
function updateLives() {
    livesElement.textContent = lives;
}

// Update level display
function updateLevel() {
    levelElement.textContent = currentLevel;
}

// Update bricks left display
function updateBricksLeft() {
    const remaining = bricks.filter(b => b.visible).length;
    bricksLeftElement.textContent = remaining;
}

// Player loses a life
function loseLife() {
    lives--;
    updateLives();
    
    if (lives <= 0) {
        gameOver = true;
        showGameOver();
    } else {
        ball.reset(); // Reset ball for next try
    }
}

// Level is complete
function completeLevel() {
    levelComplete = true;
    gameRunning = false;
    
    // UNLOCK NEXT LEVEL
    unlockNextLevel();
    
    completedLevelElement.textContent = currentLevel;
    levelCompleteScreen.classList.remove('hidden');
}

// Show game over screen
function showGameOver() {
    gameOver = true;
    gameRunning = false;
    
    finalScoreElement.textContent = score.toString().padStart(4, '0');
    gameOverScreen.classList.remove('hidden');
}

// Start a new game
function startGame() {
    // Reset all game variables
    score = 0;
    lives = 3;
    // Keep currentLevel as it is (don't reset to 1)
    gameRunning = true;
    gameOver = false;
    levelComplete = false;
    
    // Update displays
    updateScore();
    updateLives();
    updateLevel();
    
    // Setup game
    createBricks();
    ball.reset();
    paddle.x = canvas.width / 2 - paddle.width / 2;
    
    // Set ball speed for current level
    ball.speed = levels[currentLevel - 1].ballSpeed;
    
    // Hide all screens
    startScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Update level buttons
    updateLevelButtons();
}

// Go to next level
function nextLevel() {
    if (currentLevel < levels.length) {
        currentLevel++;
        levelComplete = false;
        gameRunning = true;
        
        updateLevel();
        createBricks();
        ball.reset();
        paddle.x = canvas.width / 2 - paddle.width / 2;
        
        // Set ball speed for new level
        ball.speed = levels[currentLevel - 1].ballSpeed;
        
        levelCompleteScreen.classList.add('hidden');
        updateLevelButtons();
    } else {
        // All levels completed!
        alert('🎉 Congratulations! You beat all 5 levels! 🎉');
        showGameOver();
    }
}

// Restart game
function restartGame() {
    startGame(); // Restarts current level
}

// ============================================
// PART 8: LEVEL SELECTOR BUTTONS - FIXED
// ============================================

// Create level buttons (1-5)
function createLevelButtons() {
    const container = document.getElementById('levelButtons');
    container.innerHTML = ''; // Clear old buttons
    
    // Load saved unlocked levels
    loadUnlockedLevels();
    
    for (let i = 1; i <= levels.length; i++) {
        const button = document.createElement('button');
        button.className = 'level-btn';
        button.textContent = i;
        button.dataset.level = i;
        
        // Check if level is unlocked
        const isUnlocked = unlockedLevels.includes(i);
        
        // Add click handler - VERY SIMPLE
        button.addEventListener('click', () => {
            console.log(`Clicked Level ${i}, Unlocked: ${isUnlocked}`);
            
            if (isUnlocked) {
                // Just start this level
                currentLevel = i;
                startGame();
            } else {
                // Show message for locked level
                alert(`Level ${i} is locked. Complete Level ${i-1} first!`);
            }
        });
        
        // Mark as locked if not unlocked
        if (!isUnlocked) {
            button.classList.add('locked');
        }
        
        container.appendChild(button);
    }
}

// Update level buttons (show which is active)
function updateLevelButtons() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach(button => {
        const level = parseInt(button.dataset.level);
        
        // Remove active class from all buttons
        button.classList.remove('active');
        
        // Add active class to current level
        if (level === currentLevel) {
            button.classList.add('active');
        }
    });
}

// Save progress when level is completed
function unlockNextLevel() {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= levels.length && !unlockedLevels.includes(nextLevel)) {
        unlockedLevels.push(nextLevel);
        saveUnlockedLevels();
        console.log(`Level ${nextLevel} unlocked!`);
        
        // Update buttons to show newly unlocked level
        const nextButton = document.querySelector(`.level-btn[data-level="${nextLevel}"]`);
        if (nextButton) {
            nextButton.classList.remove('locked');
        }
    }
}

// Save unlocked levels to localStorage
function saveUnlockedLevels() {
    localStorage.setItem('brickForge_unlockedLevels', JSON.stringify(unlockedLevels));
}

// Load unlocked levels from localStorage
function loadUnlockedLevels() {
    const saved = localStorage.getItem('brickForge_unlockedLevels');
    if (saved) {
        unlockedLevels = JSON.parse(saved);
    } else {
        unlockedLevels = [1]; // Level 1 always unlocked
        saveUnlockedLevels();
    }
}

// ============================================
// PART 9: GAME LOOP (HEART OF THE GAME)
// ============================================

// Main game loop - runs 60 times per second
function gameLoop() {
    // Clear the canvas (wipe screen clean)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    drawGrid();
    
    // Draw all game objects
    drawBricks();
    paddle.draw();
    ball.draw();
    
    // Update game if it's running
    if (gameRunning && !levelComplete && !gameOver) {
        ball.move();
        checkBrickCollision();
        
        // Show launch hint if ball not launched yet
        if (!ball.launched) {
            ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE to launch', canvas.width / 2, canvas.height - 60);
        }
    }
    
    // Keep the loop going (60 FPS)
    requestAnimationFrame(gameLoop);
}

// Draw grid background
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines every 50 pixels
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines every 50 pixels
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// ============================================
// PART 10: CONTROLS
// ============================================

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Move paddle left
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        paddle.move('left');
    }
    
    // Move paddle right
    if (e.key === 'ArrowRight' || e.key === 'd') {
        paddle.move('right');
    }
    
    // Launch ball (spacebar)
    if (e.key === ' ' && gameRunning && !ball.launched) {
        ball.launch();
    }
    
    // Pause game (P key)
    if (e.key === 'p' || e.key === 'P') {
        gameRunning = !gameRunning;
    }
    
    // Restart game (R key)
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

// Button controls
startBtn.addEventListener('click', startGame);
nextLevelBtn.addEventListener('click', nextLevel);
restartBtn.addEventListener('click', restartGame);

// Mobile controls (touch buttons)
leftBtn.addEventListener('mousedown', () => paddle.move('left'));
leftBtn.addEventListener('mouseup', () => {});
leftBtn.addEventListener('touchstart', () => paddle.move('left'));
leftBtn.addEventListener('touchend', () => {});

rightBtn.addEventListener('mousedown', () => paddle.move('right'));
rightBtn.addEventListener('mouseup', () => {});
rightBtn.addEventListener('touchstart', () => paddle.move('right'));
rightBtn.addEventListener('touchend', () => {});

launchBtn.addEventListener('click', () => {
    if (gameRunning && !ball.launched) {
        ball.launch();
    }
});

// ============================================
// PART 11: INITIALIZE GAME
// ============================================

// Create level buttons (1-5)
createLevelButtons();

// Setup first level
createBricks();
ball.reset();
paddle.x = canvas.width / 2 - paddle.width / 2;

// Update all displays
updateScore();
updateLives();
updateLevel();
updateBricksLeft();

// Start the game loop
gameLoop();

// Game loaded message
console.log('🎮 Brick Breaker Game Loaded!');
console.log('Controls: Arrow keys to move, SPACE to launch');
console.log('Break all bricks to win! Good luck!');