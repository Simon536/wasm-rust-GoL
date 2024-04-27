import { Universe, Cell }from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

const CELL_SIZE = 5; // px
const GRID_COLOUR = "#EEEEEE";
const DEAD_COLOUR = "#EEEEEE";
const ALIVE_COLOUR = "#000000";

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');
const playPauseButton = document.getElementById("play-pause");
const resetGameButton = document.getElementById("reset-game");
resetGameButton.textContent = " ↺ ";

let animationId = null;

const fps = new class {
  constructor(){
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  // Render the FPS counter
  render(){
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    // Save only the latest 100 timings.
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }
    let mean = sum / this.frames.length;

    // Render the statistics.
    this.fps.textContent = `Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
}

const renderLoop = () => {
  fps.render();

  drawGrid();
  drawCells();

  universe.tick();
  
  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
  return animationId === null;
}

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOUR;
  
  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }
  
  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }
  
  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);
  
  ctx.beginPath();

  // Draw live cells
  ctx.fillStyle = ALIVE_COLOUR;
  for (let row = 0; row < height; row++){
    for (let col = 0; col < width; col++){
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Alive){
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }
  
  // Draw dead cells
  ctx.fillStyle = DEAD_COLOUR;
  for (let row = 0; row < height; row++){
    for (let col = 0; col < width; col++){
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Dead){
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

const play = () => {
  playPauseButton.textContent = " ⏸ ";
  renderLoop();
}

const pause = () => {
  playPauseButton.textContent = " ▶ ";
  cancelAnimationFrame(animationId);
  animationId = null;
}

playPauseButton.addEventListener("click", event => {
  if (isPaused()){
    play();
  } else {
    pause();
  }
});

resetGameButton.addEventListener("click", event => {
  console.info("Resetting the game...");
  universe.reset();
});

drawGrid();
drawCells();

play();
