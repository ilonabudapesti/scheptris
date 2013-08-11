// HI INTERNET!

var BLOCK_WIDTH = 35;
var COLUMNS = 10;
var ROWS = 20;
var DRAW_OUTLINE = false;
var BACKGROUND_COLOR = "#050F1A";
var GAME_FPS = 60;

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = COLUMNS * BLOCK_WIDTH;
canvas.height = ROWS * BLOCK_WIDTH;
document.body.appendChild(canvas);

var board = [];

for (var i = 0; i < COLUMNS; i++) {
  for (var j = 0; j < ROWS; j++) {
    if (!board[i]) {
      board[i] = [];
    }

    board[i][j] = { color: BACKGROUND_COLOR, filled: false };  
  }
}

var shapes = [
  {
    name: "t",
    color: "purple",
    points: 
    [
                [[0,-1],
         [-1,0], [0, 0], [1,0]], 

                [[0,-1],
                 [0, 0], [1, 0],
                 [0, 1]],

        [[-1,0], [0,0], [1,0], 
                 [0,1]],

                [[0,-1],
         [-1,0], [0, 0],
                 [0, 1]]
    ]
  },
  {
    name: "i",
    color: "cyan",
    points: 
    [
        [[-1,0], [0,0], [1,0], [2,0]],

        [[0, -1],
         [0, 0],
         [0, 1],
         [0, 2]],

        [[-1,0], [0,0],  [1,0], [2,0]],

        [[0,-1],
         [0, 0],
         [0, 1],
         [0, 2]]
    ]
  },
  {
    name: "o",
    color: "yellow",
    points: 
    [
        [[0,0], [1,0],
         [0,1], [1,1]],

        [[0,0], [1,0],
         [0,1], [1,1]],

        [[0,0], [1,0],
         [0,1], [1,1]],

        [[0,0], [1,0],
         [0,1], [1,1]]
    ]
  },
  {
    name: "s",
    color: "green",
    points: 
    [
              [[0,0], [1,0],
       [-1,1], [0,1]],

              [[0,-1],
               [0, 0],[1,0],
                      [1,1]],

              [[0,0], [1,0],
       [-1,1], [0,1]],

              [[0,-1],
               [0, 0],[1,0],
                      [1,1]]
    ]
  },
  {
    name: "z",
    color: "red",
    points: 
    [
      [[-1,0], [0,0],
               [0,1], [1,1]],

             [[0,-1],
      [-1, 0],[0,0],
      [-1,1]],
      
      [[-1,0], [0,0],
               [0,1], [1,1]],

             [[0,-1],
      [-1, 0],[0,0],
      [-1,1]]
    ]
  },
  {
    name: "L",
    color: "orange",
    points: 
    [
      [[0,-1],
       [0,0],
       [0,1], [1,1]],

             
                  [[1,-1],
      [-1,0],[0,0],[1, 0]],
      
      [[-1,-1], [0,-1],
                [0, 0], 
                [0, 1]],

      [[-1,0], [0,0], [1,0],
       [-1,1]]
    ]
  },
  {
    name: "J",
    color: "blue",
    points: 
    [
            [[0,-1],
             [0,0],
     [-1,1], [0,1]],

             
      [[-1,0],[0,0],[1,0],
                    [1,1]],
      
      [[0,-1], [1,-1],
       [0, 0], 
       [0, 1]],

      [[-1,-1],
       [-1,0],[0,0],[1,0]],
                    
    ]
  }
];

// currentShape
var currentShape = {  
  x: 0,
  y: 0,
  shapeIndex: 0,
  rotationIndex: 0,
  getPoints: function() {
    return shapes[this.shapeIndex].points[this.rotationIndex];
  },
  getColor: function() {
    return shapes[this.shapeIndex].color;
  },
  getPointsForRotation: function(direction) {
    var newIndex = this.rotationIndex + direction;
    if (newIndex < 0) {
      newIndex = 3;
    } else if (newIndex > 3) {
      newIndex = 0;
    }
    
    return shapes[this.shapeIndex].points[newIndex];  
  },
  freeze: function() {
    for(var i = 0; i < 4; i++) {
      x = this.getPoints()[i][0];
      y = this.getPoints()[i][1];

      board[this.x + x][this.y + y].color = this.getColor();
      board[this.x + x][this.y + y].filled = true;
    }
  }
};

addEventListener("keydown", function (e) {
  //console.log(e.keyCode);
  if (e.keyCode == 32 || e.keyCode == 38) { 
    rotate();
  }
  if (e.keyCode == 78) {
    changeShape();
  } 
  if (e.keyCode == 40) { //down
    down(false);
  }
  if (e.keyCode == 37) { //left
    slide(-1);
  }
  if (e.keyCode == 39) { //right
    slide(1);
  }
}, false);

var reset = function () {
  currentShape.x = 4;
  currentShape.y = 0;
};

var collisionCheck = function(deltaX, deltaY, deltaRotation) {
  collide = false;
  
  var points;
  if (deltaRotation != 0) {
    points = currentShape.getPointsForRotation(deltaRotation);
  } else {
    points = currentShape.getPoints();
  }

  for(var i = 0; i < 4; i++) {
    checkX = points[i][0];
    checkY = points[i][1];
    newX = currentShape.x + checkX + deltaX;
    newY = currentShape.y + checkY + deltaY;

    //walls - how to do the top? losing state?
    if (newX < 0 || newX > 9 || newY > 19) {
      console.log("collision with wall");
      collide = true;
      break;
    }    
    
    //shapes    
    if (board[newX][newY].filled) {
      console.log("collision with shape - sideways");
      collide = true;
      break;
    }
  }

  return collide;
}

var rotate = function() {
  collide = collisionCheck(0, 0, 1);
  
  if (!collide) {
    currentShape.rotationIndex++;
    if (currentShape.rotationIndex > 3) { currentShape.rotationIndex = 0; }      
  }
};

var slide = function(direction) {
  collide = collisionCheck(direction, 0, 0);
  
  if (!collide) {
    currentShape.x += direction;
  }
}

var down = function(instant) {
  collide = collisionCheck(0, 1, 0);
  
  if (!collide) {
    currentShape.y += 1;
  } else {
    currentShape.freeze();
    nextShape();
  }
};

var nextShape = function() {
  reset();
};

var changeShape = function() {
  currentShape.shapeIndex++;
  if (currentShape.shapeIndex > 6) { currentShape.shapeIndex = 0; }
};

// update game objects
var update = function (modifier) {
  timeSinceLastMove = Date.now() - lastMove;
  if (timeSinceLastMove > 1000) {
   down(false);
   lastMove = Date.now();
  }
};

var drawBoard = function() {
  for (var i = 0; i < COLUMNS; i++) {
    for (var j = 0; j < ROWS; j++) {
      block = board[i][j];
      if (block.filled) {
        ctx.fillStyle = block.color;
        ctx.fillRect(i * BLOCK_WIDTH, j * BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(i * BLOCK_WIDTH, j * BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH);

      } else {
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(i * BLOCK_WIDTH, j * BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH);

      }     
    }
  }
};

var drawCurrentShape = function() {
  for (var i = 0; i < 4; i++) {
    var x = currentShape.getPoints()[i][0];
    var y = currentShape.getPoints()[i][1];

    ctx.fillStyle = currentShape.getColor();
    ctx.fillRect((currentShape.x * BLOCK_WIDTH) + (x * BLOCK_WIDTH), 
                 (currentShape.y * BLOCK_WIDTH) + (y * BLOCK_WIDTH),
                  BLOCK_WIDTH,
                  BLOCK_WIDTH);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect((currentShape.x * BLOCK_WIDTH) + (x * BLOCK_WIDTH),
                   (currentShape.y * BLOCK_WIDTH) + (y * BLOCK_WIDTH),
                    BLOCK_WIDTH,
                    BLOCK_WIDTH);
  }
};

var drawAll = function () {
  //drawBackground();
  drawBoard();
  drawCurrentShape();
};

// game loop
var main = function () {
  var now = Date.now();
  var delta = now - then;

  update(delta / 1000);

  then = now;
};

var render = function() {
  requestAnimationFrame(render);
  drawAll();
};
 
// start it up
reset();
var then = Date.now();
var lastMove = Date.now();

render();
updateLoopIntervalId = setInterval(main, 1000 / GAME_FPS);
