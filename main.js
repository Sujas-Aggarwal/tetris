const HEIGHT = {
  game: 20,
  previewWindow: 4,
  scoreWindow: 4,
};

const WIDTH = {
  game: 10,
  previewWindow: 4,
  scoreWindow: 4,
};

const BOX_SIZE = 40; // 1 box is of 10 px length and width
const SPEED = 1;

const game = document.getElementById("game");
const ctx = game.getContext("2d");
const previewWindow = document.getElementById("preview-window");
const scoreWindow = document.getElementById("score-window");
const previewCtx = previewWindow.getContext("2d");

const scoreDiv = document.getElementsByClassName("game-score-box")[0];

const TBlock = [0, 1, 2, 5, 9];
const IBlock = [1, 5, 9, 13];
const ZBlock = [5, 6, 10, 11];
const SBlock = [5, 6, 9, 10];
const IZBlock = [6, 7, 10, 9];
const LBlock = [2, 6, 10, 11];
const ILBlock = [2, 6, 10, 9];

const Blocks = {
  0: TBlock,
  1: IBlock,
  2: ZBlock,
  3: SBlock,
  4: IZBlock,
  5: LBlock,
  6: ILBlock,
};

const BlockType = {
  0: "TBlock",
  1: "IBlock",
  2: "ZBlock",
  3: "SBlock",
  4: "IZBlock",
  5: "LBlock",
  6: "ILBlock",
};

const COLORS = [
  "#FF4D6D", // Red / Coral
  "#4D79FF", // Blue
  "#35D07F", // Green
  "#FFD84D", // Yellow
  "#FF9F43", // Orange
  "#D66BFF", // Pink / Purple
  "#35DDEB", // Cyan
];

class Block {
  constructor(blockType) {
    if (!blockType) {
      // we will get a random one
      blockType = Math.floor(Math.random() * 5); // will be 0 to 4
    }
    this.type = BlockType[blockType];
    this.blocks = Blocks[blockType];
    console.log("got ", blockType);
    this.pos = {x:3,y: -2}; // x and y
    this.color = COLORS[blockType];
    if (blockType == 1) {
      // special for I
      this.pos.y = -3;
    }
  }
  // now we will draw it
  drawBlock(ctx, preview = false) {
    for (const i of this.blocks) {
      drawBox(
        (!preview * this.pos.x + Math.floor(i % 4)) * BOX_SIZE,
        (!preview * this.pos.y + Math.floor(i / 4)) * BOX_SIZE,
        this.color,
        ctx,
      );
    }
  }

  move(direction = 1) {
    //direction -> 1 is for top and 4 is for left, making it clockwise
    switch (direction) {
      case 1:
        this.pos.y +=  1;
        break;
      case 2:
        this.pos.x +=  1;
        break;
      case 3:
        this.pos.y -=  1;
        break;
      default:
        this.pos.x -=  1;
        break;
    }
  }
}

const gameState = new Array(WIDTH.game).fill(new Array(HEIGHT.game).fill(0));

function setupCanvas() {
  game.width = WIDTH.game * BOX_SIZE;
  game.height = HEIGHT.game * BOX_SIZE;
  game.style.imageRendering = "pixelated";

  previewWindow.width = WIDTH.previewWindow * BOX_SIZE;
  previewWindow.height = HEIGHT.previewWindow * BOX_SIZE;

  scoreWindow.width = WIDTH.scoreWindow * BOX_SIZE;
  scoreWindow.height = HEIGHT.scoreWindow * BOX_SIZE;

  scoreDiv.style.height = `${HEIGHT.game * BOX_SIZE}px`;
}

function drawBox(x, y, baseColor, ctx) {
  // 1. Draw the main solid base structure
  let size = BOX_SIZE;
  ctx.fillStyle = baseColor;
  ctx.fillRect(x, y, size, size);

  // 2. Add an Inner Glow / 3D Bevel effect using gradients
  // Light Source coming from Top-Left: Create highlights
  let highlight = ctx.createLinearGradient(x, y, x + size, y + size);
  highlight.addColorStop(0.5, "rgba(0, 0, 0, 0)"); // Neutral middle
  highlight.addColorStop(0.7, "rgba(0, 0, 0, 0.2)");
  highlight.addColorStop(1, "rgba(0, 0, 0, 0.5)"); // Dark bottom-right corner

  ctx.fillStyle = highlight;
  ctx.fillRect(x, y, size, size);

  // 3. Draw Bevel Borders (Classic Game Boy / Arcade Frame)
  const inset = size * 0.3; // 12% border width looks ideal
  ctx.lineWidth = inset;

  // 4. Draw the Inner Core Accent Square
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(
    x + inset * 1.5,
    y + inset * 1.5,
    size - inset * 3,
    size - inset * 3,
  );

  // 5. Crisp Outer Frame Border to separate blocks in a tetromino
  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
}

function draw() {
  ctx.reset();
  HOLDING_BLOCK.drawBlock(ctx);
  NEXT_BLOCK.drawBlock(previewCtx, true);
}

let HOLDING_BLOCK;
let NEXT_BLOCK;

function setupBlocks() {
  HOLDING_BLOCK = new Block();
  NEXT_BLOCK = new Block();
}

function initGame() {
  setupCanvas();
  setupBlocks();
  gameLoop();
}

function update() {
  console.log("state updated");
  HOLDING_BLOCK.move(1);
}

let lastTime = 0;
const FPS = 2;
const FPS_INTERVAL = 1000 / (FPS * SPEED);

function gameLoop(currentTime) {
  // this will decide what happens in the next frame
  // it can be game over, it can
  const DELTA = currentTime - lastTime;
  if (DELTA >= FPS_INTERVAL) {
    // Adjust lastTime to account for the current interval overflow
    lastTime = currentTime - (DELTA % FPS_INTERVAL);
    draw()
    update();
  }
  requestAnimationFrame(gameLoop);
}

initGame();
