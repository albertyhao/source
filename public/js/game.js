
var gamePieces = {};
var context = $canvas.getContext('2d');
var bulletImage = new Image();
var bullets = [];
var bulletSpeed = 500;
var bulletWidth = 5;
var direction = 'right';
var index = 0;
var Sprite = function(name) {
  this.front = [new Image(), new Image(), new Image()];
  this.left = [new Image(), new Image(), new Image()];
  this.right = [new Image(), new Image(), new Image()];
  this.back = [new Image(), new Image(), new Image()];

  this.front[0].src = `/${name}sprites/${name}front1.png`
  this.front[1].src = `/${name}sprites/${name}front2.png`
  this.front[2].src = `/${name}sprites/${name}front3.png`

  this.left[0].src = `/${name}sprites/${name}left1.png`
  this.left[1].src = `/${name}sprites/${name}left2.png`
  this.left[2].src = `/${name}sprites/${name}left3.png`

  this.right[0].src = `/${name}sprites/${name}right1.png`
  this.right[1].src = `/${name}sprites/${name}right2.png`
  this.right[2].src = `/${name}sprites/${name}right3.png`

  this.back[0].src = `/${name}sprites/${name}back1.png`
  this.back[1].src = `/${name}sprites/${name}back2.png`
  this.back[2].src = `/${name}sprites/${name}back3.png`
}
var sprites = {
  dean: new Sprite('dean'),
  sam: new Sprite('sam'),
  castiel: new Sprite('castiel')
}
bulletImage.src = '/img/clash2.png'

socket.on('playerUpdate', updatePlayers);

function updatePlayers(players) {

 var playerNames = Object.keys(players);

 playerNames.forEach(function(playerName) {
   if(playerName === user) return;
   if(!gamePieces[playerName]) {
     createNewPlayer(playerName);
   }

   var player = players[playerName];
   var gamePiece = gamePieces[playerName];
   gamePiece.x = player.x;
   gamePiece.y = player.y;
 });

 var gamePieceNames = Object.keys(gamePieces);
 gamePieceNames.forEach(function(gamePieceName) {
   if(!players[gamePieceName]) {
     delete gamePieces[gamePieceName];
   }
 })

}

function createNewPlayer(playerName) {

 var gamePiece = { loaded: false, x: 0, y:0 };
 gamePiece.picture = new Image();
 gamePiece.picture.onload = function() {
   gamePiece.loaded = true;
 }
 gamePiece.picture.src = '/picture/' + playerName;
 gamePieces[playerName] = gamePiece;

}

function drawPlayers() {

 var playerNames = Object.keys(gamePieces);
 var pieceWidth = Math.min($canvas.width, $canvas.height) / 10;
 playerNames.forEach(function(playerName) {
   var gamePiece = gamePieces[playerName];
   if(!gamePiece.loaded) return;
   context.drawImage(sprites[playerName][direction][index % 3] ,gamePiece.x, gamePiece.y, pieceWidth, pieceWidth);
 });

}

function collides(bullet) {
  if(bullet.x < 0 || bullet.x > $canvas.width) return true;
  if(bullet.y < 0 || bullet.y > $canvas.height) return true;
  return false;
  }

function drawBullets(){
  bullets.forEach(function(bullet){
    canvas.drawImage(bullet.image, bullet.x, bullet.y, bulletWidth, bulletWidth);
    bullet.x += bullet.xStep;
    bullet.y += bullet.yStep;
    if(collides(bullet)){
      bullets.flagToRemove = true;
    }
  });
  bullets = bullets.filter(function(bullet){
    return !bullets.flatToRemove;
  })
}

function animate() {

 context.clearRect(0, 0, $canvas.width, $canvas.height);
 drawPlayers();
 drawBullets();
 window.requestAnimationFrame(animate);

}

function findClosestPlayer(user){
  var distance = Infinity;
  var closestPlayer;
  Object.keys(gamePieces).forEach(function(playerName) {
    if(playerName === user) return;
    var x = gamePieces[playerName].x - gamePieces[user].x;
    var y = gamePieces[playerName].y - gamePieces[user].y;
    var dist = x*x + y*y;
    if(dist < distance){
      closestPlayer = gamePieces[playerName];
    }
  });
  return closestPlayer;
}

function fire(){
  var player = gamePieces[user];
  var closestPlayer = findClosestPlayer(user);
  var theta = Math.atan((closestPlayer.y - player.y)/(closestPlayer.x - player.x));
  var bullet = {
    xStart: player.x,
    yStart: player.y,
    xEnd: closestPlayer.x,
    yEnd: closestPlayer.y,
    xStep: bulletSpeed*Math.cos(theta),
    yStep: bulletSpeed*Math.sin(theta),
    image: bulletImage
  };
  bullets.push(bullet);
}

function handlePlayerAction(e) {

 var gamePiece = gamePieces[user];
 var step = 25;
 switch(e.key) {
   case 'ArrowLeft':
   case 'a':
     gamePiece.x-= step;
     direction = 'left';
     index++;
     break;
   case 'ArrowRight':
   case 'd':
     gamePiece.x+= step;
     direction = 'right';
     index++;
     break;
   case 'ArrowDown':
   case 's':
     gamePiece.y+= step;
     direction = 'front';
     index++;
     break;
   case 'ArrowUp':
   case 'w':
     gamePiece.y-= step;
     direction = 'back';
     index++;
     break;
   case 'p':
     fire();
     break;
   default:
     return;
 }
 socket.emit('playerUpdate', {x: gamePiece.x, y: gamePiece.y});

}

document.body.addEventListener('keydown', handlePlayerAction);
window.requestAnimationFrame(animate);
createNewPlayer(user);
