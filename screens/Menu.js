// ============================================================
//  screens/Menu.js
//  ------------------------------------------------------------
//  Draws the Main Menu screen and the High Scores screen.
//
//  Functions:
//    drawMenu()        → animated title + three nav buttons
//    drawHighScores()  → top 5 leaderboard card + back button
// ============================================================


// ─────────────────────────────────────────────────────────────
//  MAIN MENU
// ─────────────────────────────────────────────────────────────
function drawMenu() {
  // Make sure the game is never paused on the menu
  paused = false;

  const cx = width / 2;

  // ── Animated Title ─────────────────────────────────────────

  // Title bobs up and down using sin() — amplitude 6px, period ~157 frames
  let titleY    = 150 + sin(frameCount * 0.04) * 6;
  let glowPulse = 180 + sin(frameCount * 0.08) * 60; // oscillates 120–240

  textFont("Courier New");
  noStroke();

  // Back-glow halos (5 overlapping ellipses, fading outward)
  for (let i = 0; i < 5; i++) {
    fill(120, 80, 255, 20 - i * 4);
    ellipse(cx, titleY, 460 - i * 70, 180 - i * 25);
  }

  // Main neon glow behind the title text
  drawGlow(cx, titleY, 340 + sin(frameCount * 0.05) * 20, color(255, 120, 220, glowPulse));

  // RGB glitch split — red copy shifts left, blue copy shifts right
  let gx = sin(frameCount * 0.9) * 1.5; // oscillates ±1.5px
  textSize(60);
  fill(255, 80, 120, 120);
  text("ONE BEATS ONE", cx + gx - 2, titleY); // red shadow
  fill(120, 180, 255, 120);
  text("ONE BEATS ONE", cx - gx + 2, titleY); // blue shadow
  fill(255);
  text("ONE BEATS ONE", cx, titleY);           // white main text

  // Shimmer underline
  stroke(255, 255, 255, 60);
  strokeWeight(1);
  line(cx - 120, titleY + 35, cx + 120, titleY + 35);

  // ── Subtitle ───────────────────────────────────────────────
  noStroke();
  drawGlow(cx, titleY + 60, 180, color(120, 180, 255, 60));
  fill(255);
  textSize(20);
  text("REACT • SWITCH • SURVIVE", cx, titleY + 60);

  // ── Navigation Buttons ─────────────────────────────────────
  const btnW  = 230;
  const btnH  = 50;
  const gap   = 20;
  const total = btnH * 3 + gap * 2;
  const startY = height / 2 + 40 - total / 2;

  const defs = [
    { label: "START",       state: "playing",    col: color(120, 255, 170) },
    { label: "TUTORIAL",    state: "tutorial",   col: color(180, 200, 255) },
    { label: "HIGH SCORES", state: "highscores", col: color(255, 180, 200) },
  ];

  // Rebuild the button registry (mousePressed reads this each frame)
  menuButtons = [];

  for (let i = 0; i < defs.length; i++) {
    const x       = cx - btnW / 2;
    const y       = startY + i * (btnH + gap);
    const hovered = isHoverRect(x, y, btnW, btnH);

    drawCleanButton(x, y, btnW, btnH, defs[i].label, defs[i].col, hovered);

    menuButtons.push({ x, y, w: btnW, h: btnH, state: defs[i].state });
  }
}


// ─────────────────────────────────────────────────────────────
//  HIGH SCORES SCREEN
// ─────────────────────────────────────────────────────────────
function drawHighScores() {
  const cx = width / 2;

  // ── Title ──────────────────────────────────────────────────
  drawGlow(cx, 60, 250, color(255, 180, 80, 90));
  fill(255, 200, 150);
  textFont("Courier New");
  textSize(40);
  textAlign(CENTER, CENTER);
  text("TOP 5 SCORES", cx, 60);

  // ── Scores Card ────────────────────────────────────────────
  const cardW = min(420, width - 20);
  const cardH = 550;
  const cardX = cx - cardW / 2;
  const cardY = 120;

  push();
  noStroke();
  fill(16, 14, 26, 220);
  rect(cardX, cardY, cardW, cardH, 18);
  stroke(255, 180, 80, 90);
  strokeWeight(2);
  noFill();
  rect(cardX, cardY, cardW, cardH, 18);
  pop();

  // Always read fresh from localStorage (scores may have been added)
  loadHighScoresFromStorage();

  // ── Score Rows ─────────────────────────────────────────────
  push();
  textFont("Courier New");
  let rowY = cardY + 30;
  const rowH = 90;

  for (let i = 0; i < min(5, highScores.length); i++) {
    const hs = highScores[i];

    // Rank
    fill(255, 210, 110);
    textSize(18);
    textAlign(LEFT, TOP);
    text(`#${i + 1}`, cardX + 20, rowY);

    // Score value
    fill(255, 245, 170);
    textSize(16);
    text(`Score: ${hs.score}`, cardX + 20, rowY + 20);

    // Duration
    fill(220, 220, 255);
    textSize(14);
    text(`Time: ${formatTime(hs.duration)}`, cardX + 20, rowY + 38);

    // Date
    fill(180, 180, 210);
    textSize(12);
    text(hs.date, cardX + 20, rowY + 54);

    rowY += rowH;
  }

  // Empty state message
  if (highScores.length === 0) {
    fill(180, 180, 210);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("No scores yet. Play a game!", cx, cardY + cardH / 2);
  }
  pop();

  // ── Back Button ────────────────────────────────────────────
  const backW = 160, backH = 42;
  const backX = cx - backW / 2;
  const backY = height - 70;
  drawCleanButton(backX, backY, backW, backH, "BACK", color(255, 180, 150), isHoverRect(backX, backY, backW, backH));
}
