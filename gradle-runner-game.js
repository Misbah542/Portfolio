/**
 * Gradle Runner Game
 * A pixel-art infinite runner game featuring the Gradle elephant
 * Author: Misbah ul Haque
 */

class GradleRunnerGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game settings
        this.canvasWidth = Math.min(800, window.innerWidth - 60);
        this.canvasHeight = Math.min(400, Math.floor(this.canvasWidth / 2));
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.pixelSize = 4;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('gradleRunnerHighScore') || '0');
        this.gameSpeed = 5;
        this.baseSpeed = 5;
        this.speedIncrement = 0.002;
        
        // Gradle character
        this.gradle = {
            x: 100,
            y: this.canvasHeight - 150,
            width: 40,
            height: 40,
            jumpVelocity: 0,
            isJumping: false,
            isDucking: false,
            baseY: this.canvasHeight - 150
        };
        
        // Obstacles
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 120;
        
        // Ground
        this.groundY = this.canvasHeight - 110;
        
        // Input handling
        this.keys = {};
        this.setupInputHandlers();
        
        // Animation frame
        this.animationId = null;
        this.frameCount = 0;
    }
    
    setupInputHandlers() {
        this.keyDownHandler = (e) => {
            if (e.key === 'ArrowUp' && !this.gradle.isJumping && !this.gradle.isDucking) {
                this.jump();
            } else if (e.key === 'ArrowDown' && !this.gradle.isJumping) {
                this.duck();
            }
            this.keys[e.key] = true;
        };
        
        this.keyUpHandler = (e) => {
            if (e.key === 'ArrowDown') {
                this.standUp();
            }
            this.keys[e.key] = false;
        };
        
        // Touch controls for mobile
        this.touchStartHandler = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const canvasRect = this.canvas.getBoundingClientRect();
            const touchY = touch.clientY - canvasRect.top;
            
            // Top half of screen = jump, bottom half = duck
            if (touchY < this.canvasHeight / 2 && !this.gradle.isJumping && !this.gradle.isDucking) {
                this.jump();
            } else if (touchY >= this.canvasHeight / 2 && !this.gradle.isJumping) {
                this.duck();
            }
        };
        
        this.touchEndHandler = (e) => {
            e.preventDefault();
            this.standUp();
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler);
        this.canvas.addEventListener('touchend', this.touchEndHandler);
    }
    
    start() {
        this.isRunning = true;
        this.score = 0;
        this.gameSpeed = this.baseSpeed;
        this.obstacles = [];
        this.gradle.y = this.gradle.baseY;
        this.gradle.isJumping = false;
        this.gradle.isDucking = false;
        this.gradle.jumpVelocity = 0;
        this.frameCount = 0;
        
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.canvas.removeEventListener('touchstart', this.touchStartHandler);
        this.canvas.removeEventListener('touchend', this.touchEndHandler);
    }
    
    jump() {
        if (!this.gradle.isJumping) {
            this.gradle.isJumping = true;
            this.gradle.jumpVelocity = -15;
        }
    }
    
    duck() {
        if (!this.gradle.isDucking) {
            this.gradle.isDucking = true;
            this.gradle.height = 20;
            this.gradle.y = this.gradle.baseY + 20;
        }
    }
    
    standUp() {
        if (this.gradle.isDucking) {
            this.gradle.isDucking = false;
            this.gradle.height = 40;
            this.gradle.y = this.gradle.baseY;
        }
    }
    
    updateGradle() {
        // Apply gravity
        if (this.gradle.isJumping) {
            this.gradle.jumpVelocity += 0.8;
            this.gradle.y += this.gradle.jumpVelocity;
            
            // Land on ground
            if (this.gradle.y >= this.gradle.baseY) {
                this.gradle.y = this.gradle.baseY;
                this.gradle.isJumping = false;
                this.gradle.jumpVelocity = 0;
            }
        }
    }
    
    createObstacle() {
        const types = ['bug', 'error', 'gradle', 'xml', 'kotlin'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let obstacle = {
            x: this.canvasWidth,
            type: type,
            width: 30,
            height: 30
        };
        
        // Different obstacle types
        switch(type) {
            case 'bug': // Ground obstacle
                obstacle.y = this.groundY - 30;
                obstacle.color = '#ff4444';
                break;
            case 'error': // Flying obstacle
                obstacle.y = this.groundY - 80;
                obstacle.color = '#ff8844';
                obstacle.height = 20;
                obstacle.width = 40;
                break;
            case 'gradle': // Tall obstacle
                obstacle.y = this.groundY - 50;
                obstacle.height = 50;
                obstacle.color = '#44ff44';
                break;
            case 'xml': // Wide obstacle
                obstacle.y = this.groundY - 25;
                obstacle.height = 25;
                obstacle.width = 50;
                obstacle.color = '#4488ff';
                break;
            case 'kotlin': // Double obstacle
                obstacle.y = this.groundY - 30;
                obstacle.color = '#ff44ff';
                obstacle.double = true;
                break;
        }
        
        this.obstacles.push(obstacle);
    }
    
    updateObstacles() {
        // Move obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.gameSpeed;
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.score += 10;
                return false;
            }
            return true;
        });
        
        // Create new obstacles
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.createObstacle();
            this.obstacleTimer = 0;
            
            // Decrease interval as game progresses (increase difficulty)
            this.obstacleInterval = Math.max(60, 120 - Math.floor(this.score / 100) * 10);
        }
    }
    
    checkCollisions() {
        const gradleBox = {
            x: this.gradle.x + 5,
            y: this.gradle.y + 5,
            width: this.gradle.width - 10,
            height: this.gradle.height - 10
        };
        
        for (let obstacle of this.obstacles) {
            if (gradleBox.x < obstacle.x + obstacle.width &&
                gradleBox.x + gradleBox.width > obstacle.x &&
                gradleBox.y < obstacle.y + obstacle.height &&
                gradleBox.y + gradleBox.height > obstacle.y) {
                this.gameOver();
                return;
            }
            
            // Check double obstacle
            if (obstacle.double) {
                const secondObstacle = {
                    x: obstacle.x + 40,
                    y: obstacle.y,
                    width: obstacle.width,
                    height: obstacle.height
                };
                
                if (gradleBox.x < secondObstacle.x + secondObstacle.width &&
                    gradleBox.x + gradleBox.width > secondObstacle.x &&
                    gradleBox.y < secondObstacle.y + secondObstacle.height &&
                    gradleBox.y + gradleBox.height > secondObstacle.y) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    gameOver() {
        this.isRunning = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('gradleRunnerHighScore', this.highScore.toString());
            // Update UI
            const highScoreEl = document.getElementById('highScore');
            if (highScoreEl) highScoreEl.textContent = this.highScore;
        }
        
        // Show game over screen
        const finalScoreEl = document.getElementById('finalScore');
        const gameOverEl = document.getElementById('gameOver');
        if (finalScoreEl) finalScoreEl.textContent = this.score;
        if (gameOverEl) gameOverEl.classList.add('active');
    }
    
    drawPixelArt(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    drawGradle() {
        const x = this.gradle.x;
        const y = this.gradle.y;
        const ps = this.pixelSize;
        
        // Gradle elephant shape (simplified pixel art)
        this.ctx.fillStyle = '#06a94d';
        
        if (this.gradle.isDucking) {
            // Ducking shape
            this.drawPixelArt(x, y, 40, 20, '#06a94d');
            this.drawPixelArt(x + 35, y + 5, 10, 10, '#048a3d'); // Trunk
        } else {
            // Standing/jumping shape
            // Body
            this.drawPixelArt(x + 5, y + 10, 30, 25, '#06a94d');
            // Head
            this.drawPixelArt(x + 10, y, 20, 15, '#06a94d');
            // Trunk
            this.drawPixelArt(x + 30, y + 5, 10, 15, '#048a3d');
            // Legs (animated)
            const legOffset = Math.sin(this.frameCount * 0.3) * 2;
            if (!this.gradle.isJumping) {
                this.drawPixelArt(x + 8, y + 30, 8, 10, '#048a3d');
                this.drawPixelArt(x + 24, y + 30 + legOffset, 8, 10, '#048a3d');
            }
            // Eye
            this.drawPixelArt(x + 15, y + 5, 3, 3, '#ffffff');
        }
    }
    
    drawObstacle(obstacle) {
        this.ctx.fillStyle = obstacle.color;
        
        // Draw based on type
        switch(obstacle.type) {
            case 'bug':
                // Bug shape
                this.drawPixelArt(obstacle.x + 5, obstacle.y, 20, 15, obstacle.color);
                this.drawPixelArt(obstacle.x, obstacle.y + 10, 30, 10, obstacle.color);
                this.drawPixelArt(obstacle.x + 10, obstacle.y + 20, 10, 10, obstacle.color);
                break;
            
            case 'error':
                // Error block
                this.drawPixelArt(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px monospace';
                this.ctx.fillText('ERR', obstacle.x + 5, obstacle.y + 15);
                break;
            
            case 'gradle':
                // Gradle build block
                this.drawPixelArt(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
                break;
            
            case 'xml':
                // XML bracket
                this.drawPixelArt(obstacle.x, obstacle.y, 10, obstacle.height, obstacle.color);
                this.drawPixelArt(obstacle.x + obstacle.width - 10, obstacle.y, 10, obstacle.height, obstacle.color);
                break;
            
            case 'kotlin':
                // Kotlin K shape
                this.drawPixelArt(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
                if (obstacle.double) {
                    this.drawPixelArt(obstacle.x + 40, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
                }
                break;
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw ground
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, this.groundY, this.canvasWidth, this.canvasHeight - this.groundY);
        
        // Draw ground line pattern
        this.ctx.strokeStyle = '#4caf50';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvasWidth, this.groundY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw gradle
        this.drawGradle();
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => this.drawObstacle(obstacle));
        
        // Draw score
        this.ctx.fillStyle = '#4caf50';
        this.ctx.font = '20px monospace';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        
        // Draw speed indicator
        const speedLevel = Math.floor((this.gameSpeed - this.baseSpeed) / 2) + 1;
        this.ctx.fillText(`Speed: ${speedLevel}x`, 20, 55);
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        // Update game state
        this.frameCount++;
        this.updateGradle();
        this.updateObstacles();
        this.checkCollisions();
        
        // Increase difficulty
        this.gameSpeed += this.speedIncrement;
        this.score += Math.floor(this.gameSpeed / 10);
        
        // Update UI
        const gameScoreEl = document.getElementById('gameScore');
        const highScoreEl = document.getElementById('highScore');
        if (gameScoreEl) gameScoreEl.textContent = this.score;
        if (highScoreEl) highScoreEl.textContent = this.highScore;
        
        // Draw everything
        this.draw();
        
        // Continue loop
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

// Export for use in main.js
window.GradleRunnerGame = GradleRunnerGame;