//game state
let gameState = start

//score
let score = 0
let highScore = 0

//pity timer
let pity = 4

//ensures that the player can't create multiple intervals
let space = false

//sounds
let song;
let shot;
let empty;
let reload;

//sprite objects
let car;
let zombies;
let bullets;
let fuel;
let ammo;

//image objects
let carSprites;
let zombieSprites
let zombieSpriteSheet;
let bulletImg;
let fuelImg;
let ammoImg;
let backgroundImg;
let backgroundX;

//zombie animations
let zombieAnis = {
  breathing: {row: 0, frames: 8},
  swing: {row: 1, frames: 7},
  run: {row: 2, frames: 8},
  splat: {row: 3, frames: 13},
  splat2: {row: 4, frames: 9},
  die: {row: 5, frames: 8}
}

function preload(){
  //background music, pulled from https://www.chosic.com/download-audio/45403/
  song = loadSound('Assets/Hitman(chosic.com).mp3')

  //bullet fired, out of ammo, ammo pick up sounds, pulled from https://f8studios.itch.io/snakes-second-authentic-gun-sounds-pack?download
  shot = loadSound('Assets/20 Gauge Single Isolated.mp3')
  empty = loadSound('Assets/AK PolyMag Pack.mp3')
  reload = loadSound('Assets/Single Shotgun Load.mp3')

  //ammo sprite, pulled from https://fightswithbears.itch.io/2d-health-and-ammo-pickups
  ammoImg = loadImage('Assets/ammo-rifle 32px.png')

  //car animation, pulled from https://www.spriters-resource.com/psp/ageofzombies/sheet/218668/
  carSprites = loadImage('Assets/PSP - Age of Zombies - Don Zombie.png')

  zombieSprites = loadImage('Assets/ZombieRun.png')

  //zombie animations, pulled from https://ironnbutterfly.itch.io/zombie-sprite
  zombieSpriteSheet = loadImage('Assets/Zombie.png')

  //fuel sprite, pulled from https://www.deviantart.com/littlemisssunshine11/art/Jerry-Can-279999593
  fuelImg = loadImage('Assets/jerry_can_by_littlemisssunshine11_d4mpd2h.png')

  //regular font, pulled from https://www.fontspace.com/falling-sky-font-f22358
  font = loadFont('Assets/FallingSky-JKwK.otf')
  
  //title screen font, pulled from https://www.fontspace.com/zombies-reborn-font-f101113
  titleFont = loadFont('Assets/ZombiesReborn-Eanaj.otf')

  //background image, pulled from https://www.spriters-resource.com/pc_computer/highwayhunter/sheet/164558/
  backgroundImg = loadAni('Assets/PC Computer - Highway Hunter - Road Sections.png', {frameSize: [142, 66], frames: 1})

  //bullet sprite, pulled from https://bdragon1727.itch.io/fire-pixel-bullet-16x16
  bulletImg = loadImage('Assets/All_Fire_Bullet_Pixel_16x16.png')
  
}
function setup() {
  new Canvas(800, 450, "pixelated")
  
  backgroundX = width/2

  //ceiling and floor walls
  ceiling = new Sprite(width/2, 23, width, 45, 's');
  ceiling.bounciness = 0
  ceiling.opacity = 0
  floor = new Sprite(width/2, height-13, width, 26, 's');
  floor.bounciness = 0
  floor.opacity = 0

  //car
  car = new Sprite();
  car.spriteSheet = carSprites
  car.addAni({row: 0, frames: 4})
  car.y = height/2 + 100
  car.x = width/2
  car.w = 130
  car.h = 60
  car.scale = 1.5
  car.collider = 'd'
  car.bounciness = 0
  car.fuel = 100
  car.ammo = 10

  //bullets
  bullets = new Group();
  bullets.image = bulletImg
  bullets.scale = 1.5
  bullets.x = () => car.x + car.w/2
  bullets.y = () => car.y
  bullets.w = 20
  bullets.h = 10
  bullets.speed = 30
  bullets.overlaps(car)


  //ammo
  ammo = new Group();
  ammo.image = ammoImg
  ammo.scale = 2
  ammo.x = width
  ammo.y = () => random(45 + 22/2, height - 26 - 22/2)
  ammo.w = 20
  ammo.h = 22
  ammo.speed = -5
  ammo.collider = 'k'

  //fuel
  fuel = new Group();
  fuel.image = fuelImg
  fuel.x = width
  fuel.scale = 1.2
  fuel.y = () => random(45 + 35/2, height - 26 - 35/2)
  fuel.w = 30
  fuel.h = 35
  fuel.speed = -5
  fuel.collider = 'k'

  //zombies
  zombies = new Group();
  zombies.spriteSheet = zombieSprites
  zombies.addAni({frameSize: [32, 32], frames: 8})

  //sprite sheet code that doesn't work :(
  /*zombies.spriteSheet = zombieSpriteSheet
  zombies.addAnis(zombieAnis)
  zombies.changeAni('run')*/

  zombies.x = width + 26/2
  zombies.scale = 3
  zombies.h = 26
  zombies.w = 20
  zombies.y = () => random(45 + 26, height - 26 - 26)
  zombies.speed = -5
  zombies.collider = 'k'

  //ensures sprites other than zombies can't be shot 
  bullets.overlaps(fuel)
  bullets.overlaps(ammo)

  //code which calls functions when certain types overlap
  car.overlaps(ammo, ammoCollected)
  car.overlaps(fuel, fuelCollected)
  car.overlaps(zombies, zombieHit)
  bullets.overlaps(zombies, zombieShot)
}

function draw() {
  backgroundImg.rotation = 90
  animation(backgroundImg, backgroundX, height/2)
  animation(backgroundImg, backgroundX + width, height/2)
  backgroundImg.scale.x = height/142
  backgroundImg.scale.y = width/64
  if(gameState != over) backgroundX -= 3
  if(backgroundX < (-width/2)) backgroundX = width/2
  gameState()

}

//Function which will create the title screen
function start(){
  //title screen
  textFont(titleFont)
  fill('red')
  textAlign(CENTER)
  textSize(150)
  text("Drive to Survive", width/2, height/2 - 100)
  
  push()
  textSize(30)
  fill('white')
  textFont(font)
  text("Press SPACE to start", width/2, height/2 - 60) 
  pop()
  
  //if the player presses SPACE to start the game
  if(kb.presses("space") && !space){
    space = true
    car.moveTo(100, car.y, 5)
    setTimeout(setRunning, 1000)
    setTimeout(setHUD, 1000)
  } 
}

function setRunning(){
  gameState = running
  spawnInterval = setInterval(spawnRandom, 1000)
  fuelInterval = setInterval(loseFuel, 1000)
  song.setVolume(0.5)
  song.play()
}

//Function which will run the game
function running(){
  //controls
  if(kb.presses("down")) car.vel.y += 5
  if(kb.presses("up")) car.vel.y += -5
  if(kb.releases('up') || kb.releases('down')) car.vel.y = 0
  if(kb.presses("space") && car.ammo > 0){
    bullets.amount++
    car.ammo -= 1
    shot.setVolume(0.5)
    shot.play()
  }else if(kb.presses("space") && car.ammo <= 0){
    empty.play()
  } 

  //end the game when the player runs out of fuel
  if (car.fuel <= 0) gameState = over

  updateHUD()
}

//Function which creates the Game Over screen
function over(){
  song.stop()
  updateHUD()
  clearInterval(spawnInterval)
  clearInterval(fuelInterval)
  allSprites.draw()
  car.ani.stop()
  for(z of zombies){
    z.ani.stop()
  }
  allSprites.speed = 0

  if(kb.presses("space")){
    setRunning()
    car.fuel = 100
    car.ammo = 10
    car.x = 100
    car.y = height/2 + 100
    car.ani.play()
    bullets.removeAll()
    ammo.removeAll()
    fuel.removeAll()
    zombies.removeAll()
  }
  if(highScore < score) highScore = score
  
  push()
  textSize(150)
  fill('red')
  textFont(titleFont)
  text('Game Over', width/2, height/2 - 100)
  pop()

  push()
  textSize(30)
  fill('white')
  textFont(font)
  text('Press SPACE to try again', width/2, height/2 - 50)
  pop()

  push()
  textSize(30)
  fill('white')
  textFont(font)
  text('Score:' + score, width/2 - 75, height/2 + 100)
  pop()

  push()
  textSize(30)
  fill('white')
  textFont(font)
  text('High Score:' + highScore, width/2 + 75, height/2 + 100)
  pop()
}

//creates fuel and ammo icons
function setHUD(){
  fuelIcon = new Sprite(20, 15, 10, 10, 's')
  fuelIcon.image = fuelImg
  fuelIcon.scale = 1.2
  ammoIcon = new Sprite(width-100, 20, 10, 10, 's')
  ammoIcon.image = ammoImg
  ammoIcon.scale = 2
}

//updates the fuel and ammo HUD
function updateHUD(){
  //fuel bars
  let fuelBar = map(car.fuel, 0, 100, 0, 200)
  fill('red')
  rect(40, 10, 200, 20)
  fill('green')
  rect(40, 10, fuelBar, 20)

  //score
  push()
  textSize(55)
  textFont(font)
  fill('white')
  text('SCORE: ' + score, width/2, 40)
  pop()

  //ammo counter
  push()
  textSize(55)
  fill('white')
  textFont(font)
  textAlign(LEFT)
  text('X' + car.ammo, width-80, 40)
  pop()
}

//when a bullet hits a zombie
function zombieShot(bullet, zombie){
  bullet.remove()
  zombie.remove()
  score++
}
//when the car hits a zombie
function zombieHit(car, zombie){
  zombie.remove()
  car.fuel -= 40
}

//when the player collects an ammo drop
function ammoCollected(car, ammo){
  ammo.remove()
  reload.play()
  //restores 3 ammo and ensures the player can't go over 10 ammo
  if(car.ammo <= 7){
    car.ammo += 3
  }else{
    car.ammo = 10
  }
}

//when the car collects a fuel drop
function fuelCollected(car, fuel){
  fuel.remove()
  //restores the fuel and ensures that the player can't go over 100 fuel
  if(car.fuel <= 50){
    car.fuel += 50
  }else{
    car.fuel = 100
  }

}

//function which is called every second to make the player lose fuel
function loseFuel(){
  car.fuel -= 10
}

//randomly spawns a zombie, ammo drop or fuel can. a fuel can is guaranteed at least once every 5 spawns
function spawnRandom(){
  
  //generates a random number between 0 and 1 to decide which object is spawned 
  num = random(0,1)
  
  //checks if the pity timer has reached 0, if so, spawn a fuel drop
  if(pity == 0){
    fuel.amount++
    pity = 4
  }else if(num < 0.8){
    zombies.amount++
    pity -= 1
  }else if(num < 0.9){
    fuel.amount++
    pity = 4
  }else{
    ammo.amount++
    pity -= 1
  }
}