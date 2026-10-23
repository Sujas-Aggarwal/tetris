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

const game = document.getElementById("game");
const ctx = game.getContext("2d");
const previewWindow = document.getElementById("preview-window");
const scoreWindow = document.getElementById("score-window");

const scoreDiv = document.getElementsByClassName("game-score-box")[0];

const TBlock = [0,1,2,5,9];
const IBlock = [1,5,9,13];
const ZBlock = [5,6,10,11];
const SBlock = [5,6,9,10];
const IZBlock = [6,7,10,9];

const Blocks = {
  0: TBlock,
  1: IBlock,
  2: ZBlock,
  3: SBlock,
  4: IZBlock,
};

const BlockType = {
  0: "TBlock",
  1: "IBlock",
  2: "ZBlock",
  3: "SBlock",
  4: "IZBlock",
};

class Block {
  constructor(blockType) {
    if (!blockType) {
      // we will get a random one
      blockType = Math.floor(Math.random() * 5); // will be 0 to 4
    }
    this.type = BlockType[blockType];
    this.blocks = Blocks[blockType];
    console.log("got ",blockType)
  }
  // now we will draw it
  draw(ctx) {
    // we will use our blocks to draw it as easy as that
    ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, BOX_SIZE, BOX_SIZE);
    // ctx.fillRect(50, 0, BOX_SIZE, BOX_SIZE);
    for (const i of this.blocks){
        ctx.fillRect(Math.floor(i%4)*BOX_SIZE,Math.floor(i/4)*BOX_SIZE,BOX_SIZE, BOX_SIZE);
    }
  }
}

const gameState = new Array(WIDTH.game).fill(new Array(HEIGHT.game).fill(0));

function setupGame() {
  game.width = WIDTH.game * BOX_SIZE;
  game.height = HEIGHT.game * BOX_SIZE;
  game.style.imageRendering = "pixelated";

  previewWindow.width = WIDTH.previewWindow * BOX_SIZE;
  previewWindow.height = HEIGHT.previewWindow * BOX_SIZE;


  scoreWindow.width = WIDTH.scoreWindow * BOX_SIZE;
  scoreWindow.height = HEIGHT.scoreWindow * BOX_SIZE;


  scoreDiv.style.height = `${HEIGHT.game * BOX_SIZE}px`;
}

function draw() {
    let newBlock = new Block()
    newBlock.draw(ctx)
    newBlock.draw(previewWindow.getContext("2d"))
}

function initGame() {}

setupGame();
draw();
