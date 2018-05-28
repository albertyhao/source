var gamePieces = {};
var context = $canvas.getContext('2d');
var bulletImage = new Image();
var bullets = [];
var bulletSpeed = 500;
var bulletWidth = 5;
var direction = 'right';
var index = 0;
var imageSources = ['/images/1.png', '/images/2.png', '/images/3.png', '/images/4.png'];
var tileImages = [];
var loaded = 0;
var imageCount = 4;

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

imageSources.forEach(function(imgSource){
    var img = new Image();
    img.onload = function() {
      loaded++;
      if(loaded === imageCount) {
        callMeAfterAllImagesLoaded()
      }
    }
    img.src = imgSource;
    tileImages.push(img);
})

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
  // gamePiece.picture.onload = function() {
  //   gamePiece.loaded = true;
  // }
  //gamePiece.picture.src = '/picture/' + playerName;
  gamePieces[playerName] = gamePiece;
  var gamePiece = { loaded: false, x: $canvas.width/2, y:$canvas.height/2 };

  gamePiece.picture = new Image();
  gamePiece.picture.onload = function() {
    gamePiece.loaded = true;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/picture/' + playerName);
  xhr.onload = function(res) {
    if (xhr.status === 200) {
        gamePiece.picture.src =  xhr.responseText;
    }
  }
  xhr.send();
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
    context.drawImage(bullet.image, bullet.x, bullet.y, bulletWidth, bulletWidth);
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

function drawBackground() {

  var map = [[1,1,1,1,1,1,1,1,3,3,3,3,1,1,1,1,1,1,1,1],
           [1,2,2,4,2,2,2,2,2,2,4,2,4,2,4,2,4,2,4,1],
           [1,2,2,4,2,2,2,2,2,2,2,2,4,2,4,2,4,2,4,1],
           [1,2,2,2,2,2,2,2,4,4,2,2,4,4,4,4,4,2,2,1],
           [1,2,4,2,4,2,2,2,2,2,2,2,4,2,2,2,4,2,4,1],
           [1,2,4,2,2,2,2,2,2,4,2,2,4,2,4,4,4,2,4,1],
           [1,2,2,4,2,2,4,2,2,2,2,2,2,2,4,2,4,2,4,1],
           [1,4,2,2,4,2,2,4,2,2,2,2,2,4,2,2,4,2,4,1],
           [3,2,2,2,2,2,2,2,2,2,2,2,4,2,4,2,4,2,4,3],
           [3,4,2,2,4,2,2,4,2,2,4,2,4,2,4,2,2,2,4,3],
           [3,4,2,4,2,2,2,2,2,4,2,4,2,2,4,4,4,2,4,3],
           [3,2,4,2,2,2,2,4,2,4,2,4,2,2,2,2,4,2,2,3],
           [1,2,2,2,2,2,2,2,2,2,4,2,2,2,4,4,4,2,4,1],
           [1,2,2,2,2,4,2,2,4,2,2,2,4,4,4,2,2,2,2,1],
           [1,2,4,2,2,2,2,2,2,2,2,2,4,2,4,2,4,2,4,1],
           [1,2,2,4,2,2,2,2,2,4,2,2,2,2,2,4,4,2,4,1],
           [1,2,2,2,2,2,2,2,2,2,4,4,4,4,4,2,4,2,4,1],
           [1,2,4,2,4,2,2,2,2,4,2,2,2,2,4,4,4,2,4,1],
           [1,2,4,2,2,2,2,2,2,2,2,2,4,2,4,4,4,2,4,1],
           [1,1,1,1,1,1,1,1,3,3,3,3,1,1,1,1,1,1,1,1]
         ]; /* NATHAN INSERT MAP HERE */
  var x = 0;
  var y = 0;
  var width = $canvas.width/20;
  var height = $canvas.height/20;

  for(var y = 0; y < map.length; y++) {
      for(var x = 0; x < map[y].length; x++) {
          var tileImage = tileImages[map[y][x]-1]
          context.drawImage(tileImage, x*width, y*height, width, height);
      }
  }
};

function animate() {

  context.clearRect(0, 0, $canvas.width, $canvas.height);
  drawBackground();
  drawPlayers();
  drawBullets();
  window.requestAnimationFrame(animate);

}

function findClosestPlayer(user){
  var player = gamePieces[user];
  if(Object.keys(gamePieces).length < 2){
    if(direction === "left"){
      return {x: 0, y: player.y}
    }
    if(direction === "right"){
      return {x: $canvas.width, y: player.y}
    }
    if(direction === "back"){
      return {x: player.x, y: $canvas.height}
    }
    if(direction === "front"){
      return {x: player.x, y: $canvas.height}
    }
  }
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
  var step = 40;
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

function callMeAfterAllImagesLoaded() {
    document.body.addEventListener('keydown', handlePlayerAction);
    socket.on('playerUpdate', updatePlayers);
    window.requestAnimationFrame(animate);
    createNewPlayer(user);
}
