// attributes for the game 
interface Ball 
{
  x: number;
  y:number;
  vx: number;
  vy: number;
  speed: number;
  radius:number;
}
interface Player 
{
  x: number;
  y: number;
  width:number;
  height: number;
  speed: number;
  score: number;
}
interface Keys 
{
  [key: string]:boolean;
}
export function createNeonPongGame():HTMLElement 
{
  //Creating the game container 
  const container = document.createElement("div");
  container.className = "neon-game-container";
  container.innerHTML = `
  <button class="back-button">← Back</button>
        <div class="game-container">
            <div class="score-label score-label-left">
                Player 1: <span id="player1Score">0</span>
            </div>
            <div class="score-label score-label-right">
                Player 2: <span id="player2Score">0</span>
            </div>
            <canvas id="gameCanvas" width="800" height="400"></canvas>
            <div class="controls">
                <div class="player-controls">
                    <div>Player 1</div>
                    <div>W - Up</div>
                    <div>S - Down</div>
                </div>
                <div class="player-controls">
                    <div>Player 2</div>
                    <div>↑ - Up</div>
                    <div>↓ - Down</div>
                </div>
            </div>
            <div class="game-message" id="gameMessage">
                <div class="game-title">NEON PONG</div>
                <div class="game-instructions">First to 5 points wins!</div>
                <button class="start-button">START GAME</button>
            </div>
        </div>
    `;

  const backButton = container.querySelector(".back-button") as HTMLButtonElement;
  backButton.addEventListener("click", () => {
    if (window.hideNeonPongGame) 
      {
      window.hideNeonPongGame();
    } else 
      {
      container.remove();
      document.body.style.overflow = "";
    }
  });

  // getting elements from the container
  const canvas = container.querySelector("#gameCanvas") as HTMLCanvasElement;
  const gameMessage = container.querySelector("#gameMessage") as HTMLElement;
  const player1ScoreEl = container.querySelector("#player1Score") as HTMLElement;
  const player2ScoreEl = container.querySelector("#player2Score") as HTMLElement;
  const startButton = container.querySelector(".start-button") as HTMLButtonElement;

  class NeonPong 
  {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameMessage: HTMLElement;
    private player1ScoreEl: HTMLElement;
    private player2ScoreEl: HTMLElement;
    // states of Game
    private gameRunning: boolean = false;
    private gameOver: boolean = false;
    private winningScore: number = 5;
    //OBject of game
    private ball: Ball;
    private player1: Player;
    private player2: Player;
    // Input handling
    private keys: Keys = {};
    constructor
    (
      canvas: HTMLCanvasElement,
      gameMessage: HTMLElement,
      player1ScoreEl: HTMLElement,
      player2ScoreEl: HTMLElement
    ) 
    {
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
      this.gameMessage = gameMessage;
      this.player1ScoreEl = player1ScoreEl;
      this.player2ScoreEl = player2ScoreEl;
      // Game objects
      this.ball = 
      {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: 0,
        vy: 0,
        speed: 6,
        radius: 8,
      };
      this.player1 = 
      {
        x: 20,
        y: this.canvas.height / 2 - 50,
        width: 10,
        height: 100,
        speed: 8,
        score: 0,
      };
      this.player2 = 
      {
        x: this.canvas.width - 30,
        y: this.canvas.height / 2 - 50,
        width: 10,
        height: 100,
        speed: 8,
        score: 0,
      };
      // Setting up input handling
      this.setupInputHandlers();
      // main function call: Start game loop
      this.gameLoop();
    }

    private setupInputHandlers(): void 
    {
      document.addEventListener("keydown", (e: KeyboardEvent) => {
        this.keys[e.key] = true;
      });
      document.addEventListener("keyup", (e: KeyboardEvent) => {
        this.keys[e.key] = false;
      });
    }

    public startGame(): void 
    {
      this.gameRunning = true;
      this.gameOver = false;
      this.gameMessage.style.display = "none";
      // Resetting ball to center
      this.resetBall();
    }
    private resetBall(): void 
    {
      this.ball.x = this.canvas.width / 2;
      this.ball.y = this.canvas.height / 2;

      // moving the ball to random direction
      const angle = ((Math.random() - 0.5) * Math.PI) / 3; //+-30 degrees
      const direction = Math.random() < 0.5 ? 1 : -1;
      this.ball.vx = Math.cos(angle) * this.ball.speed * direction;
      this.ball.vy = Math.sin(angle) * this.ball.speed;
    }

    private update(): void 
    {
      if (!this.gameRunning || this.gameOver) 
        return;
      // Player 1 controls (W/S)
      if (this.keys["w"] || this.keys["W"]) 
        {
        this.player1.y -= this.player1.speed;
      }
      if (this.keys["s"] || this.keys["S"]) 
        {
        this.player1.y += this.player1.speed;
      }
      // Player 2 controls (Arrow keys)
      if (this.keys["ArrowUp"]) 
        {
        this.player2.y -= this.player2.speed;
      }
      if (this.keys["ArrowDown"]) {
        this.player2.y += this.player2.speed;
      }
      // Keep paddles inside the table
      this.player1.y = Math.max(0,Math.min(this.canvas.height - this.player1.height, this.player1.y));
      this.player2.y = Math.max(0,Math.min(this.canvas.height - this.player2.height, this.player2.y));

      //Updateing ball position
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;

      // Handling Ball collision with walls
      if (
        this.ball.y <= this.ball.radius ||
        this.ball.y >= this.canvas.height - this.ball.radius
      ) {
        this.ball.vy = -this.ball.vy;
        this.ball.y = Math.max(
          this.ball.radius,
          Math.min(this.canvas.height - this.ball.radius, this.ball.y)
        );
      }
      // Handling Ball collision with paddles
      this.checkPaddleCollision();
      // Ball out of bounds (point)
      if (this.ball.x <= 0) 
        {
        this.player2.score++;
        this.updateScore();
        this.resetBall();
      } else if (this.ball.x >= this.canvas.width) 
        {
        this.player1.score++;
        this.updateScore();
        this.resetBall();
      }
      // Check if game is oevr
      if (
        this.player1.score >= this.winningScore ||
        this.player2.score >= this.winningScore
      ) 
      {
        this.endGame();
      }
    }

    private checkPaddleCollision(): void 
    {
      // Player 1 paddle collision
      if (
        this.ball.x - this.ball.radius <= this.player1.x + this.player1.width &&
        this.ball.x + this.ball.radius >= this.player1.x &&
        this.ball.y >= this.player1.y &&
        this.ball.y <= this.player1.y + this.player1.height &&
        this.ball.vx < 0
      ) {
        this.ball.vx = -this.ball.vx;
        this.ball.x = this.player1.x + this.player1.width + this.ball.radius;

        // Adding spin based on where ball hits paddle
        const relativeIntersectY =
          this.player1.y + this.player1.height / 2 - this.ball.y;
        const normalizedIntersectY =
          relativeIntersectY / (this.player1.height / 2);
        this.ball.vy = -normalizedIntersectY * this.ball.speed * 0.75;

        //increasing speed slightly
        this.ball.speed = Math.min(this.ball.speed * 1.02, 12);
      }

      // Player 2 paddle collision
      if (
        this.ball.x + this.ball.radius >= this.player2.x &&
        this.ball.x - this.ball.radius <= this.player2.x + this.player2.width &&
        this.ball.y >= this.player2.y &&
        this.ball.y <= this.player2.y + this.player2.height &&
        this.ball.vx > 0
      ) {
        this.ball.vx = -this.ball.vx;
        this.ball.x = this.player2.x - this.ball.radius;

        // Add spin based on where ball hits paddle
        const relativeIntersectY =
          this.player2.y + this.player2.height / 2 - this.ball.y;
        const normalizedIntersectY =
          relativeIntersectY / (this.player2.height / 2);
        this.ball.vy = -normalizedIntersectY * this.ball.speed * 0.75;

        // Increasing speed slightly
        this.ball.speed = Math.min(this.ball.speed * 1.02, 12);
      }
    }

    private updateScore(): void 
    {
      this.player1ScoreEl.textContent = this.player1.score.toString();
      this.player2ScoreEl.textContent = this.player2.score.toString();
    }
    private endGame(): void 
    {
      this.gameRunning = false;
      this.gameOver = true;

      const winner =this.player1.score >= this.winningScore ? "Player 1" : "Player 2";
      this.gameMessage.innerHTML = `
                <div style="font-size: 2rem; color: var(--secondary-color);">${winner} Wins!</div>
                <div style="font-size: 1rem; margin: 10px 0;">Final Score: ${this.player1.score} - ${this.player2.score}</div>
                <button class="start-button" style="padding: 10px 20px; font-size: 1.2rem; background: #00E6FF; color: black; border: none; border-radius: 5px; cursor: pointer;">Play Again</button>
            `;
      this.gameMessage.style.display = "block";
      // Re-attaching event listener to the new button
      const newStartButton = this.gameMessage.querySelector(
        ".start-button"
      ) as HTMLButtonElement;
      newStartButton.addEventListener("click", () => this.resetGame());
    }
    public resetGame(): void 
    {
      this.player1.score = 0;
      this.player2.score = 0;
      this.updateScore();
      this.ball.speed = 6;
      this.startGame();
    }
    private draw(): void 
    {
      // Clear canvas at first
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Drawing center line
      this.ctx.setLineDash([10, 10]);
      this.ctx.strokeStyle = "rgba(0, 230, 255, 0.5)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width / 2, 0);
      this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Drawing paddles with glow effect
      this.ctx.shadowBlur = 20;

      // Player 1 paddle (cyan)
      this.ctx.shadowColor = "#00E6FF";
      this.ctx.fillStyle = "#00E6FF";
      this.ctx.fillRect(
        this.player1.x,
        this.player1.y,
        this.player1.width,
        this.player1.height
      );
      // Player 2 paddle (magenta)
      this.ctx.shadowColor = "#FF00FF";
      this.ctx.fillStyle = "#FF00FF";
      this.ctx.fillRect(
        this.player2.x,
        this.player2.y,
        this.player2.width,
        this.player2.height
      );
      // Draw ball with glow effect
      this.ctx.shadowColor = "#FFFFFF";
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.beginPath();
      this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
      this.ctx.fill();
      //shadow after reset
      this.ctx.shadowBlur = 0;
    }
    private gameLoop(): void 
    {
      this.update();
      this.draw();
      requestAnimationFrame(() => this.gameLoop()); //infinite loop till game is ended
    }
  }

  // Initialize game
  const game = new NeonPong(
    canvas,
    gameMessage,
    player1ScoreEl,
    player2ScoreEl
  );
  // Attach event listener to start button
  startButton.addEventListener("click", () => game.startGame());

  // Prevent default behavior for arrow keys
  const preventKeys = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "Space"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  };
  document.addEventListener("keydown", preventKeys);
  // Returning the container element so it acts as a general code
  return container;
}
