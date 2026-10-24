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

let SCORE = 0;
let MAX_SCORE = 0;

const IMAGINARY_MATRIX = 4;

const BOX_SIZE = 40; // 1 box is of 10 px length and width
let SPEED = 1;

const game = document.getElementById("game");
const ctx = game.getContext("2d");
const previewWindow = document.getElementById("preview-window");
const scoreWindow = document.getElementById("score-window");
const previewCtx = previewWindow.getContext("2d");

const scoreDiv = document.getElementsByClassName("game-score-box")[0];

let IS_GAME_OVER = false;

// these are given indices using Imaginary matrix with m x n as 4 x 4
const TBlock = [0, 1, 2, 5];
const IBlock = [0, 4, 8, 12];
const ZBlock = [0, 1, 5, 6];
const OBlock = [0, 1, 4, 5]; // square block
const IZBlock = [4, 5, 1, 2];
const LBlock = [0, 4, 6, 7];
const ILBlock = [8, 9, 5, 1];

const Blocks = {
  0: TBlock,
  1: IBlock,
  2: ZBlock,
  3: OBlock,
  4: IZBlock,
  5: LBlock,
  6: ILBlock,
};

const BlockType = {
  0: "TBlock",
  1: "IBlock",
  2: "ZBlock",
  3: "OBlock",
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

const GAME_BOARD = Array.from({ length: HEIGHT.game }, () =>
  new Array(WIDTH.game).fill(-1),
);
// making it -1 by default cause 0 to 6 are for colors occupying that particular box

const DIMENSIONS = [
  [3, 2],
  [1, 4],
  [3, 2],
  [2, 2],
  [3, 2],
  [2, 3],
  [2, 3],
]; //width and height

const MOVE_SOUND = new Audio("assets/sounds/move.wav");
MOVE_SOUND.volume = 0.2;

const LINE_CLEAR_SOUND = new Audio("assets/sounds/clear.wav");

const BG_MUSIC = new Audio("assets/sounds/bg.mp3");
BG_MUSIC.volume = 0.02;
BG_MUSIC.loop = true;

const GAME_OVER_SOUND = new Audio("assets/sounds/game-over.mp3");
GAME_OVER_SOUND.volume = 0.6;

const soundControl = document.getElementById("sound-control");
const speedControl = document.getElementById("speed-control");

function speedHandler(e, auto = false) {
  if (auto) {
    SPEED *=  1.0 + (0.5 / (1.0 + (SPEED / 30)));
  } else {
    SPEED = SPEED * 2;
    if (SPEED > 4000) {
      SPEED = 1;
    }
  }

  FPS_INTERVAL = 1000 / (FPS * SPEED);
}

function bgMusicHandler(e) {
  if (BG_MUSIC.paused || BG_MUSIC.ended || BG_MUSIC.readyState <= 2) {
    BG_MUSIC.play();
    soundControl.src = "assets/images/volume-on.png";
  } else {
    BG_MUSIC.pause();
    soundControl.src = "assets/images/volume-off.png";
  }
}
soundControl.addEventListener("mousedown", bgMusicHandler);
speedControl.addEventListener("mousedown", speedHandler);

class Block {
  constructor(blockType) {
    if (!blockType) {
      // we will get a random one
      blockType = Math.floor(Math.random() * 7); // will be 0 to 6
    }
    this.type = BlockType[blockType];
    this.blocks = Blocks[blockType];
    this.color = COLORS[blockType];
    this.locked = false;
    this.dimensions = DIMENSIONS[blockType];
    this.number = blockType;
    this.pos = {
      x: Math.floor((WIDTH.game - this.dimensions[0]) / 2),
      y: -this.dimensions[1],
    }; // x and y
  }
  // now we will draw it
  drawBlock(ctx, preview = false) {
    for (const i of this.blocks) {
      drawBox(
        !preview * this.pos.x +
          Math.floor(i % IMAGINARY_MATRIX) +
          ((WIDTH.previewWindow - this.dimensions[0]) * preview) / 2,
        !preview * this.pos.y +
          Math.floor(i / IMAGINARY_MATRIX) +
          ((HEIGHT.previewWindow - this.dimensions[1]) * preview) / 2,
        this.color,
        ctx,
      );
    }
  }

  move(direction = 3, isDefault = false) {
    if (this.locked) return;
    //direction -> 1 is for top and 4 is for left, making it clockwise

    // so now we need to add collision detection in our stuff
    // if any of our stuff collides in the direction we wanna move,
    // we will say back off not just the corners
    switch (direction) {
      case 1:
        // basically we will fall at once
        SCORE++;
        while (true) {
          if (this.move(3) == -1) break;
        }
        break;
      case 2:
        if (this.checkCollision({ x: this.pos.x + 1, y: this.pos.y })) break;
        MOVE_SOUND.play();
        this.pos.x += 1;
        break;
      case 3:
        if (this.checkCollision({ x: this.pos.x, y: this.pos.y + 1 })) {
          // one more thing, we need to check
          // if its starting position is less than 0 in y
          // it means an game over
          this.addToBoard();
          if (this.pos.y < 0) {
            gameOver();
          }
          return -1;
        }
        if (!isDefault) {
          MOVE_SOUND.play();
        }
        this.pos.y += 1;
        break;
      case 4:
        if (this.checkCollision({ x: this.pos.x - 1, y: this.pos.y })) break;
        MOVE_SOUND.play();
        this.pos.x -= 1;
        break;
      case 5:
        this.rotate();
        break;
    }
    return 1;
  }
  checkCollision(pos, blocks = this.blocks, dimensions = this.dimensions) {
    // they will give us an position
    // if we either cross the boundary
    // or we cross any pre occupied block, we will return true
    // which means, there is collision
    // pos is pos.x and pos.yc
    if (
      pos.x < 0 ||
      pos.x + dimensions[0] > WIDTH.game ||
      pos.y + dimensions[1] > HEIGHT.game
    )
      return true;
    for (const i of blocks) {
      let y = pos.y + Math.floor(i / IMAGINARY_MATRIX);
      let x = pos.x + (i % IMAGINARY_MATRIX);
      if (y < 0) continue;
      if (GAME_BOARD[y][x] != -1) return true;
    }
    return false;
  }
  addToBoard() {
    this.locked = true;
    for (const i of this.blocks) {
      // we will use i along with its position and put it in the game board
      let y = this.pos.y + Math.floor(i / IMAGINARY_MATRIX);
      let x = this.pos.x + (i % IMAGINARY_MATRIX);
      if (y < 0) continue;
      GAME_BOARD[y][x] = this.number;
      // added
    }
  }
  rotate() {
    // i think its gonna be the hardest part to implement here tbh
    // hmm, if i think of it in a way that we are in
    // we know that
    // if we rotate anything by 90 degree,
    // the new row is just the old col
    // and the new col is N-1-row
    // here N is the imaginary size of the matrix i was taking
    // which in our case if 4 since i am doing all the calculations using 4 here
    // so, let's perform the rotations for our cute little stuff
    // and then we can shift the origin to ensure they are at top left most part
    // so that it will be easier for us to do anything with them

    //process ->
    // we will simply convert these indices to row and col
    // we will apply the transformation to get our new row and col
    // we will then shift their origin to ensure they are at top left most
    // we will then again convert them into indices
    // we will check for collision, if there is any
    // if there is, then we will cancel the operation
    // if there is none, we will just change our blocks to the new blocks

    let newBlocks = [];
    let minRow = IMAGINARY_MATRIX;
    let minCol = IMAGINARY_MATRIX;
    for (let i of this.blocks) {
      // now i is our index of the block
      let row = Math.floor(i / IMAGINARY_MATRIX);
      let col = i % IMAGINARY_MATRIX;

      let newRow = col;
      let newCol = IMAGINARY_MATRIX - 1 - row;

      minRow = Math.min(newRow, minRow);
      minCol = Math.min(newCol, minCol);
      newBlocks.push([newRow, newCol]);
    }
    // we got our new array but its not shifted yet
    // we will shift it by the minRow and the minCol number
    for (let i = 0; i < newBlocks.length; i++) {
      newBlocks[i][0] -= minRow;
      newBlocks[i][1] -= minCol;
    }
    // now we got our shifted stuff=
    // now we can convert it to indices
    for (let i = 0; i < newBlocks.length; i++) {
      newBlocks[i] = newBlocks[i][0] * IMAGINARY_MATRIX + newBlocks[i][1];
    }
    // now we got our indices, let's check if it collides or not
    // we need to also inverse the dimensions now
    let newDimensions = [this.dimensions[1], this.dimensions[0]];
    if (!this.checkCollision(this.pos, newBlocks, newDimensions)) {
      MOVE_SOUND.play();
      this.blocks = newBlocks;
      this.dimensions = newDimensions;
    }
  }
}

function setupCanvas() {
  game.width = WIDTH.game * BOX_SIZE;
  game.height = HEIGHT.game * BOX_SIZE;
  game.style.imageRendering = "pixelated";

  previewWindow.width = WIDTH.previewWindow * BOX_SIZE;
  previewWindow.height = HEIGHT.previewWindow * BOX_SIZE;

  scoreWindow.style.width = `${WIDTH.scoreWindow * BOX_SIZE}px`;
  scoreWindow.style.height = `${HEIGHT.scoreWindow * BOX_SIZE}px`;

  scoreDiv.style.height = `${HEIGHT.game * BOX_SIZE}px`;
}

function drawBox(x, y, baseColor, ctx) {
  x = x * BOX_SIZE;
  y = y * BOX_SIZE;
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
  previewCtx.reset();
  drawBoard();
  drawScore();
  HOLDING_BLOCK.drawBlock(ctx);
  NEXT_BLOCK.drawBlock(previewCtx, true);
}

function drawBoard() {
  // we need to draw the board
  for (let row = 0; row < HEIGHT.game; row++) {
    for (let col = 0; col < WIDTH.game; col++) {
      let value = GAME_BOARD[row][col];
      if (value == -1) continue;
      drawBox(col, row, COLORS[value], ctx);
    }
  }
}

function drawScore() {
  let score = SCORE;
  scoreWindow.innerText = score;
}

let HOLDING_BLOCK;
let NEXT_BLOCK;

function setupBlocks() {
  HOLDING_BLOCK = NEXT_BLOCK;
  NEXT_BLOCK = new Block();
}

function initGame() {
  HOLDING_BLOCK = null;
  NEXT_BLOCK = new Block();
  setupCanvas();
  setupBlocks();
  gameLoop();
}

let LAST_SCORE_THRESHOLD = 1
function update(movement_direction = 3, isDefault = true) {
  HOLDING_BLOCK.move(movement_direction, isDefault);
  // we need to check if locked
  if (HOLDING_BLOCK.locked) {
    setupBlocks();
  }
  // we also need to check the state of our
  clearLines();
  if (SCORE>=LAST_SCORE_THRESHOLD*10){
    LAST_SCORE_THRESHOLD = SCORE
    speedHandler(null, true)
  }
}

function clearLines() {
  // basically we will check which lines are full and we will remove
  // those lines and push the array downwards
  // we will also make sure we keep track of how many lines are being
  // cleared at once and so we will increase the point accordingly
  let total = 0;
  for (let row = 0; row < HEIGHT.game; row++) {
    let isCleared = true;
    for (let col = 0; col < WIDTH.game; col++) {
      // we got both row and col now
      if (GAME_BOARD[row][col] == -1) {
        isCleared = false;
        break;
      }
    }
    // now we know whether this one is good or not
    // we can easily remove this if its cleared and append a new array in our board game
    if (isCleared) {
      total++;
      GAME_BOARD.splice(row, 1); // this row is removed now
      GAME_BOARD.unshift(Array.from({ length: WIDTH.game }, () => -1));
    }
  }
  SCORE += total * 1000;
  if (total > 0) {
    LINE_CLEAR_SOUND.play();
  }
}

function gameOver() {
  HOLDING_BLOCK = null;
  NEXT_BLOCK = null;
  IS_GAME_OVER = true;
  GAME_OVER_SOUND.play();
  draw();
}

let lastTime = 0;
const FPS = 2;
let FPS_INTERVAL = 1000 / (FPS * SPEED);

function gameLoop(currentTime) {
  // this will decide what happens in the next frame
  // it can be game over, it can
  if (IS_GAME_OVER) return;
  draw();
  const DELTA = currentTime - lastTime;
  if (DELTA >= FPS_INTERVAL) {
    // Adjust lastTime to account for the current interval overflow
    lastTime = currentTime - (DELTA % FPS_INTERVAL);
    update();
  }
  requestAnimationFrame(gameLoop);
}

function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      update(1);
      break;
    case "ArrowRight":
      update(2);
      break;
    case "ArrowDown":
      update(3, false);
      break;
    case "ArrowLeft":
      update(4);
      break;
    case " ":
      update(5);
      break;
  }
}

window.addEventListener("keydown", handleInput);

initGame();
