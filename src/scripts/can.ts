// Canvas context for drawing
let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;

// Current mouse position
const mousePosition = { x: 0, y: 0 };

// Array to store all the animated lines
const lines: Line[] = [];

// Animation settings
const settings = {
  friction: 0.5,
  lineCount: 20,
  nodesPerLine: 30,
  dampening: 0.25,
  tension: 0.98,
};

// Canvas position tracking
let canvasOffsetX = 0;
let canvasOffsetY = 0;

/**
 * Represents a single point in a line
 */
class Node {
  // Position
  x: number;
  y: number;

  // Velocity
  vx: number = 0;
  vy: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Represents a complete line made up of multiple nodes
 */
class Line {
  // Physics properties
  spring: number;
  friction: number;

  // All points that make up this line
  nodes: Node[];

  constructor(springStrength: number) {
    // Add slight randomization to make each line unique
    this.spring = springStrength + (Math.random() * 0.1 - 0.05);
    this.friction = settings.friction + (Math.random() * 0.01 - 0.005);

    // Create all nodes at the current mouse position
    this.nodes = [];
    for (let i = 0; i < settings.nodesPerLine; i++) {
      this.nodes.push(new Node(mousePosition.x, mousePosition.y));
    }
  }

  /**
   * Update the physics of all nodes in the line
   */
  update() {
    let currentSpring = this.spring;

    // First node follows the mouse position
    const firstNode = this.nodes[0];
    firstNode.vx += (mousePosition.x - firstNode.x) * currentSpring;
    firstNode.vy += (mousePosition.y - firstNode.y) * currentSpring;

    // Update each node
    for (let i = 0; i < this.nodes.length; i++) {
      const currentNode = this.nodes[i];

      // Each node after the first follows the previous node
      if (i > 0) {
        const previousNode = this.nodes[i - 1];

        // Pull toward previous node based on spring strength
        currentNode.vx += (previousNode.x - currentNode.x) * currentSpring;
        currentNode.vy += (previousNode.y - currentNode.y) * currentSpring;

        // Transfer some velocity from previous node
        currentNode.vx += previousNode.vx * settings.dampening;
        currentNode.vy += previousNode.vy * settings.dampening;
      }

      // Apply friction to slow down movement
      currentNode.vx *= this.friction;
      currentNode.vy *= this.friction;

      // Update position based on velocity
      currentNode.x += currentNode.vx;
      currentNode.y += currentNode.vy;

      // Reduce spring strength for each subsequent node
      currentSpring *= settings.tension;
    }
  }

  /**
   * Draw the line on the canvas
   */
  draw() {
    // Start a new path
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

    // Draw smooth curves through most of the nodes
    for (let i = 1; i < this.nodes.length - 2; i++) {
      const current = this.nodes[i];
      const next = this.nodes[i + 1];

      // Calculate midpoint between current and next node
      const midX = (current.x + next.x) * 0.5;
      const midY = (current.y + next.y) * 0.5;

      // Draw curve to midpoint using current node as control point
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }

    // Handle the last segment separately
    if (this.nodes.length > 2) {
      const secondLast = this.nodes[this.nodes.length - 2];
      const last = this.nodes[this.nodes.length - 1];

      // Draw final curve to last node
      ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
    }

    // Render the path
    ctx.stroke();
    ctx.closePath();
  }
}

/**
 * Recalculate canvas offset position
 */
function updateCanvasOffset() {
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  canvasOffsetX = rect.left;
  canvasOffsetY = rect.top;
}

/**
 * Resize the canvas to match the window dimensions
 */
function resizeCanvas() {
  if (!ctx || !canvas) return;

  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  // Update canvas position after resize
  updateCanvasOffset();
}

/**
 * Update the stored mouse position
 */
function updateMousePosition(event: MouseEvent) {
  // Get mouse position relative to canvas
  mousePosition.x = event.clientX - canvasOffsetX;
  mousePosition.y = event.clientY - canvasOffsetY + 5;
}

/**
 * Handle the initial mouse movement
 */
function handleFirstMouseMove(event: MouseEvent) {
  // Switch to the regular mouse tracking
  document.removeEventListener("mousemove", handleFirstMouseMove);
  document.addEventListener("mousemove", updateMousePosition);

  // Update position immediately
  updateMousePosition(event);

  // Create all the lines with slightly different properties
  for (let i = 0; i < settings.lineCount; i++) {
    // Base spring strength of 0.45, increasing slightly for each line
    const springStrength = 0.45 + (i / settings.lineCount) * 0.025;
    lines.push(new Line(springStrength));
  }

  // Start the animation loop
  animateLines();
}

/**
 * Main animation function
 */
function animateLines() {
  // Clear the canvas
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Set up line appearance
  ctx.globalCompositeOperation = "lighter"; // Colors add together for a glowing effect
  ctx.strokeStyle = "hsla(165, 100%, 70%, 10%)"; // Semi-transparent cyan
  ctx.lineWidth = 2;

  // Update and draw each line
  for (let i = 0; i < lines.length; i++) {
    lines[i].update();
    lines[i].draw();
  }

  // Continue the animation loop
  window.requestAnimationFrame(animateLines);
}

/**
 * Initialize the canvas and start the animation
 */
export function initCanvas() {
  if (!document) return;

  // Get the canvas and context
  canvas = document.getElementById("canvas-bg") as HTMLCanvasElement;
  if (!canvas) return;

  ctx = canvas.getContext("2d")!;
  if (!ctx) return;

  // Set up the canvas
  resizeCanvas();
  updateCanvasOffset();

  // Set up event listeners
  document.addEventListener("mousemove", handleFirstMouseMove);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("scroll", updateCanvasOffset);
  document.body.addEventListener("orientationchange", resizeCanvas);
}

/**
 * Clean up event listeners
 */
export function cleanupCanvas() {
  if (!document) return;

  document.removeEventListener("mousemove", handleFirstMouseMove);
  document.removeEventListener("mousemove", updateMousePosition);
  window.removeEventListener("resize", resizeCanvas);
  window.removeEventListener("scroll", updateCanvasOffset);
  document.body.removeEventListener("orientationchange", resizeCanvas);
}
