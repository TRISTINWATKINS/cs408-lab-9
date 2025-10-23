// set up canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// random number generator
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// random RGB color generator
function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

/* ===== Export for QUnit test ===== */
export function sayHello() {
  return "hello";
}

/* ===== Shape base class ===== */
class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

/* ===== Ball class extends Shape ===== */
class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;
    this.exists = true; // tracks whether ball is eaten
  }

  draw() {
    if (!this.exists) return;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    if (!this.exists) return;

    if (this.x + this.size >= width) {
      this.velX = -Math.abs(this.velX);
    }
    if (this.x - this.size <= 0) {
      this.velX = Math.abs(this.velX);
    }
    if (this.y + this.size >= height) {
      this.velY = -Math.abs(this.velY);
    }
    if (this.y - this.size <= 0) {
      this.velY = Math.abs(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    if (!this.exists) return;

    for (const ball of balls) {
      if (this === ball || !ball.exists) continue;

      const dx = this.x - ball.x;
      const dy = this.y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + ball.size) {
        ball.color = this.color = randomRGB();
      }
    }
  }
}

/* ===== EvilCircle class extends Shape ===== */
class EvilCircle extends Shape {  //I originally wrote this with a 1 click per movement, but i didnt like it, so i redid it so the evil circile movees smoothly
  constructor(x, y) {
    super(x, y, 5, 5);
    this.color = "white";
    this.size = 10;
    this.keys = {}; 

//     window.addEventListener("keydown", (e) => {   //old code for 1 click per movement
//   switch (e.key) {
//     case "a":
//       this.x -= this.velX;
//       break;
//     case "d":
//       this.x += this.velX;
//       break;
//     case "w":
//       this.y -= this.velY;
//       break;
//     case "s":
//       this.y += this.velY;
//       break;
//   }
// });

   
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  
  move() {
    if (this.keys["a"]) this.x -= this.velX;
    if (this.keys["d"]) this.x += this.velX;
    if (this.keys["w"]) this.y -= this.velY;
    if (this.keys["s"]) this.y += this.velY;
  }

  // Keep evil circle on screen
  checkBounds() {
    if (this.x + this.size >= width) this.x -= this.size;
    if (this.x - this.size <= 0) this.x += this.size;
    if (this.y + this.size >= height) this.y -= this.size;
    if (this.y - this.size <= 0) this.y += this.size;
  }

  // Eat balls
  collisionDetect(ballsArr, counterObj, para) {
    for (const ball of ballsArr) {
      if (!ball.exists) continue;

      const dx = this.x - ball.x;
      const dy = this.y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + ball.size) {
        ball.exists = false;
        counterObj.count--;
        if (para) para.textContent = `Ball count: ${counterObj.count}`;
      }
    }
  }
}

/* ===== Scene setup ===== */
const balls = [];
const counter = { count: 0 };
const para = document.querySelector("p");

// create random balls
while (balls.length < 25) {
  const size = random(10, 20);
  const ball = new Ball(
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomRGB(),
    size
  );
  balls.push(ball);
  counter.count++;
}
if (para) para.textContent = `Ball count: ${counter.count}`;

// create evil circle
const evil = new EvilCircle(width / 2, height / 2);

/* ===== Animation loop ===== */
function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  for (const ball of balls) {
    if (ball.exists) {
      ball.draw();
      ball.update();
      ball.collisionDetect();
    }
  }

  evil.move(); // smooth movement while key held
  evil.checkBounds();
  evil.draw();
  evil.collisionDetect(balls, counter, para);

  requestAnimationFrame(loop);
}

loop();
