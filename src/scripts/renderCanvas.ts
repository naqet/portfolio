// Necessary variables
let ctx: CanvasRenderingContext2D;
const currentPosition = { x: 0, y: 0 };
const lines: Line[] = [];
const config = {
  friction: 0.5,
  trails: 20,
  size: 30,
  dampening: 0.25,
  tension: 0.98,
};

// Classes

class ListNode {
  x: number;
  y: number;
  vy: number;
  vx: number;

  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.vy = 0;
    this.vx = 0;
  }
}

class Line {
  spring: number;
  friction: number;
  nodes: ListNode[];

  constructor(spring: number) {
    this.spring = spring + 0.1 * Math.random() - 0.05;
    this.friction = config.friction + 0.01 * Math.random() - 0.005;
    this.nodes = [];
    for (let i = 0; i < config.size; i++) {
      const newNode = new ListNode(currentPosition.x, currentPosition.y);
      this.nodes.push(newNode);
    }
  }

  update() {
    let spring = this.spring;
    const firstNode = this.nodes[0];
    firstNode.vx += (currentPosition.x - firstNode.x) * spring;
    firstNode.vy += (currentPosition.y - firstNode.y) * spring;

    for (let i = 0; i < this.nodes.length; i++) {
      const currentNode = this.nodes[i];
      const previousNode = this.nodes[i - 1];
      (previousNode &&
        (currentNode.vx += (previousNode.x - currentNode.x) * spring) &&
        (currentNode.vy += (previousNode.y - currentNode.y) * spring) &&
        (currentNode.vx += previousNode.vx * config.dampening) &&
        (currentNode.vy += previousNode.vy * config.dampening),
        (currentNode.vx *= this.friction) < (currentNode.vy *= this.friction),
        (currentNode.x += currentNode.vx),
        (currentNode.y += currentNode.vy),
        (spring *= config.tension));
    }
  }

  draw() {
    const firstNode = this.nodes[0];
    let { x: firstX, y: firstY } = firstNode;

    ctx.beginPath();
    ctx.moveTo(firstNode.x, firstNode.y);
    for (let i = 1; i < this.nodes.length - 2; i++) {
      const currentNode = this.nodes[i];
      const nextNode = this.nodes[i + 1];
      firstX = 0.5 * (currentNode.x + nextNode.x);
      firstY = 0.5 * (currentNode.y + nextNode.y);
      ctx.quadraticCurveTo(currentNode.x, currentNode.y, firstX, firstY);
    }
    const secondLastNode = this.nodes[this.nodes.length - 2];
    const lastNode = this.nodes[this.nodes.length - 1];
    ctx.quadraticCurveTo(
      secondLastNode.x,
      secondLastNode.y,
      lastNode.x,
      lastNode.y,
    );
    ctx.stroke();
    ctx.closePath();
  }
}

// Functions

const resizeCanvas = () => {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
};

const updatePosition = (event: MouseEvent) => {
  currentPosition.x = event.clientX;
  currentPosition.y = event.clientY + 5;
};

const handleMousemove = (e: MouseEvent) => {
  document.removeEventListener("mousemove", handleMousemove);
  document.addEventListener("mousemove", updatePosition);
  updatePosition(e);

  // Add lines
  for (let i = 0; i < config.trails; i++) {
    lines.push(new Line(0.45 + (i / config.trails) * 0.025));
  }

  drawLine();
};

const drawLine = () => {
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "hsla(165, 100%, 70%, 10%)";
  ctx.lineWidth = 1;
  for (let i = 0; i < config.trails; i++) {
    const currentLine = lines[i];
    currentLine.update();
    currentLine.draw();
  }

  window.requestAnimationFrame(drawLine);
};

export const initCanvas = function () {
  if (!document) return;

  ctx = (document.getElementById("canvas-bg") as HTMLCanvasElement).getContext(
    "2d",
  );
  resizeCanvas();

  document.addEventListener("mousemove", handleMousemove);
  document.body.addEventListener("orientationchange", resizeCanvas);
  document.body.addEventListener("resize", resizeCanvas);
};

export const clearEventListeners = () => {
  if (!document) return;
  document.removeEventListener("mousemove", handleMousemove);
  document.removeEventListener("mousemove", updatePosition);
  document.body.removeEventListener("orientationchange", resizeCanvas);
};
