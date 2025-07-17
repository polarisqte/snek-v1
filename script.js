const canvas = document.getElementById("game");
const scoreHeader = document.getElementById("score");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 50;
const BODY_COLOR = "blue";
const HEAD_COLOR = "darkblue";
const FOOD_COLOR = "red";
const FOOD_COUNT = 3;

const tileCount = canvas.width / GRID_SIZE;

let snake = [{ x: 10, y: 10 }];
let dx = 1;
let dy = 0;
let dChanged = false;
let bufferedD = null;
let frozen = false;

let food = [];
let score = 0;

document.addEventListener("keydown", keyPush);

function gameLoop() {
  if (frozen) return;

  moveSnake();

  dChanged = false;

  if (bufferedD && validateDirection(bufferedD)) {
    dx = bufferedD.dx;
    dy = bufferedD.dy;
    bufferedD = null;
    dChanged = true;
  }

  if (checkCollision()) {
    alert("game over. ur score: " + score);

    if (score > getHighScore()) {
      setHighScore(score);
    }

    showMenu();
    return;
  }

  food.forEach((f, i) => {
    if (snake[0].x === f.x && snake[0].y === f.y) {
      snake.push({});
      score++;
      food[i] = getFoodCoords();
    }
  });

  scoreHeader.textContent = `score: ${score} | highscore: ${getHighScore()}`;
  drawGame();
}

function moveSnake() {
  if (frozen) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  snake.pop();
}

function drawGame() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = FOOD_COLOR;
  food.forEach((f) => {
    ctx.fillRect(f.x * GRID_SIZE, f.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  });

  ctx.fillStyle = HEAD_COLOR;
  snake.forEach((part) => {
    ctx.fillRect(
      part.x * GRID_SIZE,
      part.y * GRID_SIZE,
      GRID_SIZE - 1,
      GRID_SIZE - 1
    );
  });

  ctx.fillStyle = BODY_COLOR;
  ctx.fillRect(
    snake[0].x * GRID_SIZE,
    snake[0].y * GRID_SIZE,
    GRID_SIZE - 1,
    GRID_SIZE - 1
  );
}

function spawnFood() {
  food = [];

  for (let i = 0; i < FOOD_COUNT; i++) {
    food.push(getFoodCoords());
  }
}

function getFoodCoords() {
  let coords;
  let invalid;

  do {
    coords = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    invalid = snake.some((part) => part.x === coords.x && part.y === coords.y);
    invalid = food.some((f) => f.x === coords.x && f.y === coords.y);
  } while (invalid);

  return coords;
}

function keyPush(e) {
  if (e.code === "Space" && frozen) resetGame();

  const nd = getDirection(e.key);
  if (!nd) return;

  if (!dChanged && validateDirection(nd)) {
    dx = nd.dx;
    dy = nd.dy;
    dChanged = true;
  } else {
    bufferedD = nd;
  }
}

function getDirection(key) {
  switch (key) {
    case "ArrowLeft":
      return { dx: -1, dy: 0 };
    case "ArrowUp":
      return { dx: 0, dy: -1 };
    case "ArrowRight":
      return { dx: 1, dy: 0 };
    case "ArrowDown":
      return { dx: 0, dy: 1 };
    default:
      return null;
  }
}

function validateDirection(nd) {
  return !(-dx === nd.dx && -dy === nd.dy);
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

function resetGame() {
  console.log("restart init");
  frozen = false;
  dChanged = false;
  bufferedD = null;
  snake = [{ x: 10, y: 10 }];
  dx = 1;
  dy = 0;
  score = 0;
  spawnFood();
  document.getElementById("bgr").remove();
}

showMenu();
setInterval(gameLoop, 125);

function getHighScore() {
  return parseInt(localStorage.getItem("highScore")) || 0;
}

function setHighScore(scr) {
  localStorage.setItem("highScore", scr);
}

function showMenu() {
  frozen = true;
  dx = 0;
  dy = 0;

  const bg = document.createElement("div");
  bg.id = "bgr";
  bg.style.zIndex = 5;
  bg.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  bg.style.justifyContent = "center";
  bg.style.alignItems = "center";
  bg.style.width = "100%";
  bg.style.height = "100%";

  const lb = document.createElement("label");
  lb.textContent = "press space to resume";
  lb.style.zIndex = 6;
  lb.style.color = "white";

  canvas.parentElement.append(bg);
  bg.append(lb);
}
