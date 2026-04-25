/**
 * Draws a soft radial glow centered at (x, y).
 * Renders 4 overlapping semi-transparent ellipses, each slightly
 * larger and more transparent than the last.
 *
 * @param {number} x    - Center X
 * @param {number} y    - Center Y
 * @param {number} size - Diameter of the innermost ellipse
 * @param {p5.Color} col - Color including alpha (use color(r,g,b,a))
 */
function drawGlow(x, y, size, col) {
  noStroke();
  for (let i = 0; i < 4; i++) {
    fill(red(col), green(col), blue(col), 30 - i * 7);
    ellipse(x, y, size + i * 20, size + i * 20);
  }
}

/**
 * Draws a soft glow behind a rounded rectangle.
 * Used for button hover effects — the glow expands slightly
 * beyond the button edges.
 *
 * @param {number} x    - left edge
 * @param {number} y    - top edge
 * @param {number} w    - width
 * @param {number} h    - height
 * @param {number} r    - radius
 * @param {p5.Color} col - glow color
 * @param {number} pad  - number of pixel to expand beyond edges (default 6)
 */
function drawRectGlow(x, y, w, h, r, col, pad = 6) {
  const rr    = red(col);
  const gg    = green(col);
  const bb    = blue(col);
  const baseA = alpha(col) > 0 ? alpha(col) : 60;

  noStroke();
  for (let i = 0; i < 2; i++) {
    const grow = pad + i * 3;
    fill(rr, gg, bb, max(0, baseA - i * 25));
    rect(x - grow, y - grow, w + grow * 2, h + grow * 2, r + grow * 0.5);
  }
}

/**
 * styled button.
 * @param {number} x         - left edge 
 * @param {number} y         - top edge 
 * @param {number} w         - width
 * @param {number} h         - height
 * @param {string} label     - text
 * @param {p5.Color} accentCol - glow
 * @param {boolean} hovered  - when hovered
 */
function drawCleanButton(x, y, w, h, label, accentCol, hovered) {
  push();

  noStroke();
  fill(18, 16, 30, 210);
  rect(x - 3, y - 3, w + 6, h + 6, 14);


  stroke(
    hovered
      ? color(red(accentCol), green(accentCol), blue(accentCol), 220)
      : color(red(accentCol), green(accentCol), blue(accentCol), 140)
  );
  strokeWeight(2);
  fill(hovered ? color(45, 32, 45, 220) : color(30, 24, 40, 210));
  rect(x, y, w, h, 14);


  if (hovered) {
    drawRectGlow(
      x, y, w, h, 14,
      color(red(accentCol), green(accentCol), blue(accentCol), 85),
      14
    );
  }


  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textFont("Courier New");
  textSize(22);
  text(label, x + w / 2, y + h / 2 + 1);

  pop();
}

/** rock object */
function drawRockIcon() {
  fill(150, 100, 80);
  stroke(100, 60, 40);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < 6; i++) {
    const a = (TWO_PI / 6) * i;
    const r = i % 2 === 0 ? 30 : 25; 
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape(CLOSE);

  fill(255, 200, 100);
  noStroke();
  ellipse(0, -5, 8, 8);
}

/** paper object */
function drawPaperIcon() {
  fill(255);
  stroke(200);
  strokeWeight(2);
  rect(-25, -30, 50, 60, 5);

  // Ruled lines
  stroke(150);
  strokeWeight(1);
  line(-15, -15, 15, -15);
  line(-15,  -5, 15,  -5);
  line(-15,   5, 15,   5);
  line(-15,  15, 10,  15);

  // Folded top-right corner
  stroke(230);
  line(15, -30, 25, -20);
  line(25, -20, 25, -30);
}

/** scissors object */
function drawScissorsIcon() {
  fill(200, 200, 220);
  stroke(120, 120, 140);
  strokeWeight(3);

  noFill();
  ellipse(-10, -15, 15, 15);
  ellipse(-10,  15, 15, 15);

  line(-10, -15, 20, 0);
  line(-10,  15, 20, 0);

  fill(240, 240, 255);
  noStroke();
  triangle(15, -3, 25, -2, 20,  2);
  triangle(15,  3, 25,  2, 20, -2);
}

/**
 * heart icon
 *
 * @param {number} cx - center X
 * @param {number} cy - center Y
 * @param {number} s  - scale (40 = normal size)
 */
function drawHeartIcon(cx, cy, s) {
  push();
  translate(cx, cy);
  noStroke();

  const wob = sin(frameCount * 0.15) * 1.6; // wobble offset

  fill(255, 90, 120);
  beginShape();
  for (let a = 0; a <= TWO_PI; a += 0.12) {
    // Cardioid formula — produces a heart shape
    const hx = 16 * pow(sin(a), 3);
    const hy = -(13 * cos(a) - 5 * cos(2*a) - 2 * cos(3*a) - cos(4*a));
    vertex(hx * (s / 40), (hy + wob) * (s / 40));
  }
  endShape(CLOSE);

  // Highlight
  fill(255, 200, 215, 150);
  ellipse(-s * 0.12, -s * 0.10 + wob * 0.2, s * 0.20, s * 0.16);

  pop();
}

//  MATH / GAME LOGIC HELPERS

function pointInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

/** tests whether the mouse cursor is over a rectangle. */
function isHoverRect(x, y, w, h) {
  return pointInRect(mouseX, mouseY, x, y, w, h);
}

/**
 * Returns the score multiplier for a given streak count.
 *
 * Streak thresholds:
 *   3+  → 2x
 *   6+  → 3x
 *   10+ → 5x
 *   14+ → 6x
 *   20+ → 8x 
 */
function calcMultiplier(s) {
  if (s >= 20) return 8;
  if (s >= 14) return 6;
  if (s >= 10) return 5;
  if (s >=  6) return 3;
  if (s >=  3) return 2;
  return 1;
}

/**
 * timer duration as "MM:SS".
 */
function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mins     = Math.floor(totalSec / 60);
  const secs     = totalSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

//  HIGH SCORE PERSISTENCE
//  Uses localStorage so scores survive page refreshes.

/**
 * Adds a new score entry, sorts by score descending,
 * keeps only the top 5, then saves to localStorage.
 */
function saveHighScore(sc, duration) {
  const now = new Date();
  highScores.push({
    score:    sc,
    duration: duration,
    date:     `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`,
  });

  highScores.sort((a, b) => b.score - a.score); // high to low
  highScores = highScores.slice(0, 5);           // top 5 only
  saveHighScoresToStorage();
}

/** serial highScores array to localStorage. */
function saveHighScoresToStorage() {
  try {
    localStorage.setItem("oneBeatsOneScores", JSON.stringify(highScores));
  } catch (e) {
    // localStorage may be unavailable in some environments — fail silently
  }
}

/** load highScores array from localStorage. falls back to empty array. */
function loadHighScoresFromStorage() {
  try {
    const stored = localStorage.getItem("oneBeatsOneScores");
    highScores = stored ? JSON.parse(stored) : [];
  } catch (e) {
    highScores = [];
  }
}


// ─────────────────────────────────────────────────────────────
//  CANVAS HELPERS
// ─────────────────────────────────────────────────────────────

/** Center */
function centerCanvas() {
  const x = (windowWidth  - width)  / 2;
  const y = (windowHeight - height) / 2;
  cnv.position(max(0, x), max(0, y));
}

/** Called automatically */
function windowResized() {
  centerCanvas();
}
