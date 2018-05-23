
var gamePieces = {};
var context = $canvas.getContext('2d');
var bulletImage = new Image();
var bullets = [];
var bulletSpeed = 500;
var bulletWidth = 5;
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
 var pieceWidth = Math.min($canvas.width, $canvas.height) / 5;
 playerNames.forEach(function(playerName) {
   var gamePiece = gamePieces[playerName];
   if(!gamePiece.loaded) return;
   context.drawImage(gamePiece.picture ,gamePiece.x, gamePiece.y, pieceWidth, pieceWidth);
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
    var x = gamePiece[playerName].x - gamePiece[user].x;
    var y = gamePiece[playerName].y - gamePiece[user].y;
    var dist = x*x + y*y;
    if(dist < distance){
      closestPlayer = gamePiece[playerName];
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
 var step = 50;
 switch(e.key) {
   case 'ArrowLeft':
     gamePiece.x-= step;
     break;
   case 'ArrowRight':
     gamePiece.x+= step;
     break;
   case 'ArrowDown':
     gamePiece.y+= step;
     break;
   case 'ArrowUp':
     gamePiece.y-= step;
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
