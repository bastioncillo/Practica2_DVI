var sprites = {
  Beer: {sx: 512,sy: 99,w: 23,h: 32,frames: 1},
  Glass: {sx: 512,sy: 131,w: 23,h: 32,frames: 1},
  NPC: {sx: 512,sy: 66,w: 33,h: 33,frames: 1},
  ParedIzda: {sx: 0,sy: 0,w: 512,h: 480,frames: 1},
  Player: {sx: 512,sy: 0,w: 56,h: 66,frames: 1},
  TapperGameplay: {sx: 0,sy: 480,w: 512,h: 480,frames: 1}
};

function storeCoordinate(xVal, yVal, array) {
    array.push({x: xVal, y: yVal});
}

var playerCoords = [];
storeCoordinate(325, 90, playerCoords);
storeCoordinate(357, 185, playerCoords);
storeCoordinate(389, 281, playerCoords);
storeCoordinate(421, 377, playerCoords);

var deadZoneCoords = [];
//Right
storeCoordinate(332, 90, deadZoneCoords);
storeCoordinate(364, 185, deadZoneCoords);
storeCoordinate(396, 281, deadZoneCoords);
storeCoordinate(428, 377, deadZoneCoords);
//Left
storeCoordinate(102, 90, deadZoneCoords);
storeCoordinate(70, 185, deadZoneCoords);
storeCoordinate(38, 281, deadZoneCoords);
storeCoordinate(6, 377, deadZoneCoords);


var clientCoords = [];
storeCoordinate(112, 80, clientCoords);
storeCoordinate(80, 175, clientCoords);
storeCoordinate(48, 271, clientCoords);
storeCoordinate(16, 367, clientCoords);

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_DEADZONE = 16;

var gameEnd = false;

var startGame = function() {
  var ua = navigator.userAgent.toUpperCase();

 //Stage cap
  var stage = new GameBoard();
  stage.add(new Stage());
  Game.setBoard(0, stage);
  Game.activateBoard(0);

  //Title cap
  var title = new GameBoard();
  title.add(new TitleScreen("Tapper", "Press enter to star playing", playGame));
  Game.setBoard(1, title);
  Game.activateBoard(1);

  //Victory cap
  var victory = new GameBoard();
  victory.add(new TitleScreen("Victory", "Press enter to star playing", startGame));
  Game.setBoard(2, victory);

  //Defeat cap
  var defeat = new GameBoard();
  defeat.add(new TitleScreen("Defeat", "Press enter to star playing", startGame));
  Game.setBoard(3, defeat);

  //Player, DeadZone and NPC'S cap
  var waiter = new GameBoard();
  waiter.add(new Player());

  for(var i = 0; i < deadZoneCoords.length; i++){
    waiter.add(new DeadZone(deadZoneCoords[i].x, deadZoneCoords[i].y, 10, 66 , i));
  }
  waiter.add(new Spawner(clientCoords[0], 1, 1));
  waiter.add(new Spawner(clientCoords[1], 1, 3));
  waiter.add(new Spawner(clientCoords[2], 2, 3));
  waiter.add(new Spawner(clientCoords[3], 2, 6));

  Game.setBoard(4, waiter);

  //Left panel cap
  var leftPanel = new GameBoard();
  leftPanel.add(new LeftPanel());
  Game.setBoard(5, leftPanel);

 if (!gameEnd)
   Game.activateBoard(1);
 else
  playGame();

};

var playGame = function() {
 // GameManager.reset();

  //Deactivate notify panels
  Game.deactivateBoard(1);
  Game.deactivateBoard(2);
  Game.deactivateBoard(3);
  //Activate the game
  Game.activateBoard(4);
  Game.activateBoard(5);
};

var winGame = function() {
  //Deactivate the game
  Game.deactivateBoard(4);
  Game.deactivateBoard(5);

  //Activate victory panel
  Game.activateBoard(2);
  GameManager.reset();
  gameEnd = true;
};

var loseGame = function() {
  //Deactivate the game
  Game.deactivateBoard(4);
  Game.deactivateBoard(5);

  //Activate defeat panel
  Game.activateBoard(3);
  GameManager.reset();
  gameEnd = true;
};

//Class Stage
var Stage = function(){
  this.setup('TapperGameplay', {x:0, y:0});
};

Stage.prototype = new Sprite();

Stage.prototype.step = function(dt) {};

//Class PLayer
var Player = function(){
  this.setup('Player', {x:421, y:377, reloadTime:0.16});
  this.move = this.reloadTime;
  this.beer = this.reloadTime;
  this.i = 3;
};

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;

Player.prototype.step = function(dt){
  this.move -= dt;
  if(Game.keys['up'] && this.move < 0){
     if(this.i > 0){
      this.x = playerCoords[this.i-1].x;
      this.y = playerCoords[this.i-1].y;
      this.i--;
    }
    else{
      this.x = playerCoords[3].x;
      this.y = playerCoords[3].y;
      this.i = 3;
    }
    this.move = this.reloadTime;
  }

  if(Game.keys['down'] && this.move < 0){  
    if(this.i < 3){
      this.x = playerCoords[this.i+1].x;
      this.y = playerCoords[this.i+1].y;
      this.i++;
    }
    else{
      this.x = playerCoords[0].x;
      this.y = playerCoords[0].y;
      this.i = 0;
    }
    this.move = this.reloadTime;
  }

  this.beer -= dt;
  if(Game.keys['space'] && this.beer < 0){
    Game.keys['space'] = false;
    this.beer = this.reloadTime;
    this.board.add(new Beer(this.x,this.y));
  }
};

//Class Beer
var Beer = function(x, y){
  this.setup('Beer',{vx: -50});
  this.x = x - this.w;
  this.y = y;
}

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_PLAYER_PROJECTILE;

Beer.prototype.step = function(dt){
  this.x += this.vx * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
    this.board.add(new Glass(this.x, this.y));
    GameManager.checkGlass(1);
    GameManager.checkClients(-1);
  }
}

Beer.prototype.hit = function(damage){
  this.board.remove(this);
}

//Class Client
var Client = function(x, y){
  this.setup('NPC',{vx: -50});
  this.x = x;
  this.y = y;
}

Client.prototype = new Sprite();
Client.prototype.type = OBJECT_ENEMY;

Client.prototype.step = function(dt){
  this.x -= this.vx * dt;
}

Client.prototype.hit = function(damage) {
 this.board.remove(this);
};

//Class Glass
var Glass = function(x, y){
  this.setup('Glass', {vx: -50});
  this.x = x;
  this.y = y;
}

Glass.prototype = new Sprite();
Glass.prototype.type = OBJECT_PLAYER_PROJECTILE;

Glass.prototype.step = function(dt){
  this.x -= this.vx * dt;
  var collision = this.board.collide(this, OBJECT_PLAYER);
  if(collision){
    this.board.remove(this);
    GameManager.checkGlass(-1);
  }
}

Glass.prototype.hit = function(damage){
  this.board.remove(this);
}

//Class DeadZone
var DeadZone = function(x, y, w, h, i){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.i = i;
}

DeadZone.prototype.type = OBJECT_DEADZONE;

DeadZone.prototype.step = function(dt){
  var collision = this.board.collide(this, OBJECT_ENEMY | OBJECT_PLAYER_PROJECTILE);
  if(collision){
    collision.hit(this.damage);
    GameManager.checkLose();
  }
}

DeadZone.prototype.draw = function(ctx){
  //Uncomment for debug
/*  i = 0;
  for(i; i < deadZoneCoords.length; i++){
   ctx.fillRect(this.x, this.y, this.w, this.h);
  }*/ 
}

//Class Spawner
var Spawner = function(pos, nClients, freq){
  this.nC = nClients;
  this.initClients = this.nC;
  this.freq = freq;
  this.initFreq = this.freq;
  this.client = new Client(pos.x, pos.y);
  GameManager.checkClients(nClients);
}

Spawner.prototype.reset = function(){
  this.freq = this.initFreq;
  this.nC = this.initClients;
}

Spawner.prototype.step = function(dt){
  this.freq -= dt;
  if(this.nC > 0 && this.freq < 0){
    this.freq = this.initFreq;
    this.board.add(Object.create(this.client));
    this.nC--;
  }
}

Spawner.prototype.draw = function(){}

//Class Left Panel
var LeftPanel = function(){
  this.setup('ParedIzda', {x:0, y:0});
}

LeftPanel.prototype = new Sprite();

LeftPanel.prototype.step = function(dt){}

//Game manager
var GameManager = new function(){
  this.totalClients = 0;
  this.totalGlass = 0;
  this.defeat = false;

  this.reset = function(){
    this.totalClients = 0;
    this.totalGlass = 0;
    this.defeat = false;
  }

  this.checkClients = function(n){
    this.totalClients += n;
    this.checkGame();
  }

  this.checkGlass = function(n){
    this.totalGlass += n;
    this.checkGame();
  }

  this.checkLose = function(){
    this.defeat = true;
    this.checkGame();
  }

  this.checkGame= function(){
    if(this.defeat === true){
      loseGame();
    }
    else if(this.totalGlass === 0 && this.totalClients === 0){
      winGame();
    }
  }
}

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});