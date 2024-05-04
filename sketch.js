/**
 * Assets
 * Spikes: https://omniclause.itch.io/spikes
 * Bird: https://brysiaa.itch.io/pixel-flappy-birds-16x16px
 * Background: https://github.com/samuelcust/flappy-bird-assets
 * Audio: https://github.com/samuelcust/flappy-bird-assets
 * Font: https://www.fontspace.com/typeface-mario-world-pixel-font-f56447
 
 * Author: Sukesh Sivagnanaruban
 */

// Default level these spikes will remain in every level iteration
const defaultLevel = [
  "...............",
  "..tttttttttttt.",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "...............",
  "..bbbbbbbbbbbb.",
];
let level = defaultLevel.slice();

// Key is range of scores (inclusive) value is max number of spikes
const spikeThresholds = new Map([
  [[-Infinity, 4], 3],
  [[5, 9], 4],
  [[10, 19], 5],
  [[20, 29], 6],
  [[30, 39], 7],
  [[40, 49], 8],
  [[50, 59], 9],
  [[60, 69], 10],
  [[70, 79], 11],
  [[80, 89], 12],
  [[90, 99], 13],
  [[100, Infinity], 14],
]);

let bottomSpikes;
let leftSpikes;
let topSpikes;
let rightSpikes;

let sheetImg;
let birdSheetImg;
let backgroundImg;
let customFont;
let dieSfx;
let pointSfx;
let flapSfx;

let bird;
const gravity = 0.16;
const lift = -3.5;
const moveSpeed = 2.5;

let playerScores;

///////////////////////////////////////////////////////////////////

class Bird {
  constructor(gravity, lift, moveSpeed) {
    this.sprite = new Sprite(width / 2, height / 2, 15, 13);
    this.sprite.spriteSheet = birdSheetImg;
    this.sprite.diameter = 13;
    this.sprite.anis.w = 15;
    this.sprite.anis.h = 13;
    const birdAnis = {
      flying: {
        row: 0,
        frames: 3,
      },
    };
    this.sprite.addAnis(birdAnis);
    this.sprite.scale = 1.75;

    this.gravity = gravity;
    this.lift = lift;
    this.moveSpeed = moveSpeed;
  }

  flap() {
    this.sprite.velocity.y = this.lift;
    flapSfx.play();
  }

  flip() {
    this.sprite.velocity.x *= -1; // Reverse horizontal velocity
    this.sprite.scale.x *= -1; // Horizontally flip bird
  }

  fall() {
    this.sprite.velocity.y += this.gravity;
  }
}

///////////////////////////////////////////////////////////////////

class PlayerScores {
  constructor() {
    this.score = 0;
    this.highScore = 0;
  }

  updateScore(newScore) {
    this.score = newScore;
  }

  incrementScore() {
    this.score++;
  }

  updateHighScore() {
    this.highScore = max(this.score, this.highScore);
  }
}

///////////////////////////////////////////////////////////////////
// Game setup functions

// Intial game state is intro
let gameState = intro;

// Preload game assets
function preload() {
  sheetImg = loadImage("assets/16-bit-spike-sheet.png");
  birdSheetImg = loadImage("assets/kiwi_spritesheet.png");
  customFont = loadFont("assets/marioworld.ttf");
  backgroundImg = loadImage("assets/bird_background_cropped.png");

  dieSfx = loadSound("assets/hit.wav");
  pointSfx = loadSound("assets/point.wav");
  flapSfx = loadSound("assets/wing.wav");
}

// Setup game sprites
function setup() {
  new Canvas(240, 320, "pixelated");
  frameRate(60);
  allSprites.pixelPerfect = true;

  playerScores = new PlayerScores();
  bird = new Bird(gravity, lift, moveSpeed);

  bottomSpikes = new Group();
  leftSpikes = new Group();
  topSpikes = new Group();
  rightSpikes = new Group();

  createTileMap();
}

// Display respective game state
function draw() {
  gameState();
}

///////////////////////////////////////////////////////////////////
// Sprite creation/update functions

function createBird() {
  bird = new Sprite(width / 2, height / 2, 15, 13);
  bird.spriteSheet = birdSheetImg;
  bird.diameter = 13;
  bird.anis.w = 15;
  bird.anis.h = 13;
  bird.scale = 1.75;
  bird.addAnis(birdAnis);
  bird.shapeColor = color(255, 0, 0);
}

function createTileMap() {
  bottomSpikes.spriteSheet = sheetImg;
  bottomSpikes.addAni({ w: 16, h: 16, row: 0, col: 0 });
  bottomSpikes.anis.offset.y = -3;
  bottomSpikes.w = 13;
  bottomSpikes.h = 13;
  bottomSpikes.tile = "b";
  bottomSpikes.collider = "static";
  bottomSpikes.collides(bird.sprite, spikeCollision);

  leftSpikes.spriteSheet = sheetImg;
  leftSpikes.addAni({ w: 16, h: 16, row: 0, col: 1 });
  leftSpikes.tile = "l";
  leftSpikes.anis.offset.x = 3;
  leftSpikes.h = 10;
  leftSpikes.collider = "static";
  leftSpikes.collides(bird.sprite, spikeCollision);

  topSpikes.spriteSheet = sheetImg;
  topSpikes.addAni({ w: 16, h: 16, row: 0, col: 2 });
  topSpikes.tile = "t";
  topSpikes.anis.offset.y = 3;
  topSpikes.h = 13;
  topSpikes.w = 13;
  topSpikes.collider = "static";
  topSpikes.collides(bird.sprite, spikeCollision);

  rightSpikes.spriteSheet = sheetImg;
  rightSpikes.addAni({ w: 16, h: 16, row: 0, col: 3 });
  rightSpikes.tile = "r";
  rightSpikes.anis.offset.x = -3;
  rightSpikes.h = 10;
  rightSpikes.collider = "static";
  rightSpikes.collides(bird.sprite, spikeCollision);

  new Tiles(level, 0, 0, 16, 16);
}

function getMaxSpikesForScore(currentScore) {
  for (const [range, maxSpikes] of spikeThresholds) {
    const [lowerBound, upperBound] = range;
    if (currentScore >= lowerBound && currentScore <= upperBound) {
      return maxSpikes;
    }
  }
}

function updateTileMap(side) {
  // Clear existing spike sprites
  bottomSpikes.removeAll();
  leftSpikes.removeAll();
  topSpikes.removeAll();
  rightSpikes.removeAll();

  level = defaultLevel.slice(); // Remove lateral spikes from level tilemap

  const currentScore = playerScores.score;
  const maxSpikes = getMaxSpikesForScore(currentScore);

  generateSpikes(side, maxSpikes); // Generate new spikes on respective side
  createTileMap(); // Display modified level
}

// Prevent one spike gaps that bird can't fit through
function isOneSpikeGap(prevRow, secondPrevRow, side) {
  let prevSpike, secondPrevSpike;
  switch (side) {
    case "left":
      prevSpike = prevRow[1];
      secondPrevSpike = secondPrevRow[1];
      break;
    case "right":
      prevSpike = prevRow[prevRow.length - 1];
      secondPrevSpike = secondPrevRow[secondPrevRow.length - 1];
      break;
  }
  return (
    (secondPrevSpike === "l" && prevSpike === ".") ||
    (secondPrevSpike === "r" && prevSpike === ".") ||
    (secondPrevRow === defaultLevel[1] && prevSpike === ".")
  );
}

function generateSpikes(side, maxSpikes) {
  let spikesCount = 0; // Track the count of spikes generated
  for (let i = 2; i < level.length - 1; i++) {
    let random = Math.random();

    let row = level[i];
    let prevRow = level[i - 1];
    let secondPrevRow = level[i - 2];

    // If spike on the side and the bottom spikes
    // creates a one spike gap must place spike to prevent gap
    let mustAddSpike =
      i === level.length - 2 &&
      (prevRow.includes("l") || prevRow.includes("r"));

    if (
      (random < 0.5 &&
        spikesCount < maxSpikes &&
        !isOneSpikeGap(prevRow, secondPrevRow, side)) ||
      mustAddSpike
    ) {
      // Spikes for respective sides
      switch (side) {
        case "left":
          level[i] = row.slice(0, 1) + "l" + row.slice(2);
          break;
        case "right":
          level[i] = row.slice(0, row.length - 1) + "r";
          break;
      }
      spikesCount++;
    }
  }
}

///////////////////////////////////////////////////////////////////
// Collision functions

function checkWallCollision() {
  // Check if the bird touches the right side
  if (bird.sprite.position.x >= width - bird.sprite.width) {
    bird.flip();
    playerScores.incrementScore();
    pointSfx.play();
    updateTileMap("left"); // Update spikes for left side

    // Check if bird touches the left side
  } else if (bird.sprite.position.x <= bird.sprite.width) {
    bird.flip();
    playerScores.incrementScore();
    pointSfx.play();
    updateTileMap("right"); // Update spikes for right side
  }
}

function spikeCollision() {
  dieSfx.play();
  gameState = gameOver;
}

///////////////////////////////////////////////////////////////////
// Game states

function intro() {
  image(backgroundImg, 0, 0, width, height);

  // Title text
  textFont(customFont);
  textAlign(CENTER, CENTER);
  textSize(16);
  fill("#FFB347");
  stroke("red");
  strokeWeight(4);
  text("Flappy Spikes", width / 2, height / 2 - 100);
  noStroke();

  // High score text
  textFont(customFont);
  textAlign(CENTER, CENTER);
  textSize(8);
  fill("red");
  stroke("black");
  strokeWeight(3);
  text("High Score: " + playerScores.highScore, width / 2, height / 2 - 70);
  noStroke();

  // Text to instruct player to start game
  textFont(customFont);
  textAlign(CENTER, CENTER);
  textSize(8);
  fill("white");
  stroke(0);
  strokeWeight(3);
  text("Click to start game!", width / 2, height / 2 + 30);
  noStroke();

  // Keep bird stationary
  bird.sprite.velocity.x = 0;

  // Bird input to start game
  if (kb.presses("space") || mouse.presses()) {
    bird.sprite.velocity.x = moveSpeed; // Set initial horizontal velocity
    bird.flap();
    gameState = runGame;
  }
}

function runGame() {
  background(0); // Clear text
  image(backgroundImg, 0, 0, width, height);

  checkWallCollision();

  textFont(customFont);
  textAlign(CENTER, CENTER);
  textSize(28);
  fill(0);
  text(playerScores.score, width / 2, height / 2);

  // Bird input controls
  if (kb.presses("space") || mouse.presses()) {
    bird.flap();
  }

  // Bird is always affected by gravity
  bird.fall();
}

function gameOver() {
  background(0); // Clear text
  allSprites.removeAll(); // Remove all sprites

  playerScores.updateHighScore();

  // Display "Game Over" text
  stroke(0);
  strokeWeight(3);
  textAlign(CENTER, CENTER);
  textSize(22);
  fill("red");
  text("Game Over", width / 2, height / 2 - 50);

  // Display score
  textSize(22);
  fill("white");
  text("Score: " + playerScores.score, width / 2, height / 2);

  // Display replay button
  fill("yellow");
  textSize(16);
  text("Press enter \nto replay", width / 2, height / 2 + 80);

  // Return to main screen
  if (kb.presses("enter")) {
    background(0); // Clear assets on screen
    image(backgroundImg, 0, 0, width, height);
    playerScores.updateScore(0); // Reset score to 0
    level = defaultLevel.slice(); // Reset level to default
    createTileMap();
    bird = new Bird(gravity, lift, moveSpeed);
    gameState = intro;
  }
}
