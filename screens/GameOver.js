// ============================================================
//  screens/GameOver.js
//  ------------------------------------------------------------
//  Draws two overlays related to game interruption:
//
//    drawGameOver()      → shown when hp reaches 0
//    drawPausedOverlay() → shown when the player presses P
//    drawFrozenScene()   → renders the game scene without updating it
//                          (used as a backdrop while paused)
// ============================================================


// ─────────────────────────────────────────────────────────────
//  GAME OVER SCREEN
// ─────────────────────────────────────────────────────────────
function drawGameOver() {
  paused = false;
  const cx = width / 2;

  // ── Title ──────────────────────────────────────────────────
  drawGlow(cx, 80, 250, color(255, 100, 120, 90));
  fill(255, 140, 150);
  textFont("Courier New");
  textSize(44);
  textAlign(CENTER, CENTER);
  text("GAME OVER", cx, 80);

  // ── Stats Card ─────────────────────────────────────────────
  const cardW = min(420, width - 20);
  const cardH = 200;
  const cardX = cx - cardW / 2;
  const cardY = 150;

  push();
  noStroke();
  fill(16, 14, 26, 220);
  rect(cardX, cardY, cardW, cardH, 18);
  stroke(255, 120, 140, 90);
  strokeWeight(2);
  noFill();
  rect(cardX, cardY, cardW, cardH, 18);
  pop();

  // ── Stats Rows ─────────────────────────────────────────────
  const pad  = 22;
  const rows = [cardY + 50, cardY + 95, cardY + 140];

  push();
  textFont("Courier New");

  // Labels (left-aligned)
  textAlign(LEFT, CENTER);
  fill(190, 190, 220);
  textSize(13);
  text("FINAL SCORE",  cardX + pad, rows[0]);
  text("DURATION",     cardX + pad, rows[1]);
  text("BEST STREAK",  cardX + pad, rows[2]);

  // Values (right-aligned)
  textAlign(RIGHT, CENTER);
  fill(255, 245, 170); textSize(22); text(score,                    cardX + cardW - pad, rows[0]);
  fill(220, 220, 255); textSize(18); text(formatTime(gameDuration), cardX + cardW - pad, rows[1]);
  fill(255, 210, 110); textSize(18); text(bestStreak + "x",         cardX + cardW - pad, rows[2]);
  pop();

  // ── Action Buttons ─────────────────────────────────────────
  const btnW   = 180, btnH = 42, btnGap = 14;
  const btnX   = cx - btnW / 2;
  const btn1Y  = cardY + cardH + 30;          // Try Again
  const btn2Y  = btn1Y + btnH + btnGap;       // Menu

  drawCleanButton(btnX, btn1Y, btnW, btnH, "TRY AGAIN", color(255, 120, 140), isHoverRect(btnX, btn1Y, btnW, btnH));
  drawCleanButton(btnX, btn2Y, btnW, btnH, "MENU",       color(120, 255, 170), isHoverRect(btnX, btn2Y, btnW, btnH));

  // Helper caption
  fill(180, 180, 210, 160);
  textSize(12);
  textAlign(CENTER, CENTER);
  text("Try Again restarts • Menu returns to home", cx, btn2Y + btnH + 16);
}


// ─────────────────────────────────────────────────────────────
//  FROZEN SCENE
//  Renders the current game world without calling update() on
//  anything. Used as the backdrop behind the pause overlay.
// ─────────────────────────────────────────────────────────────
function drawFrozenScene() {
  // Show the trail but don't advance it
  pushPlayerTrail(
    player.x + player.size / 2,
    player.y + player.size / 2,
    player.getColor()
  );
  drawPlayerTrail();
  player.show();

  drawFormButtons();

  for (let o  of objects)   o.show();
  for (let p  of particles) p.show();
  for (let pu of popups)    pu.show();
}


// ─────────────────────────────────────────────────────────────
//  PAUSE OVERLAY
//  Drawn on top of drawFrozenScene() when paused === true.
//  Also registers the resume / restart / quit button hit-boxes
//  so that mousePressed() in sketch.js can detect clicks.
// ─────────────────────────────────────────────────────────────
function drawPausedOverlay() {
  push();
  const offsetY = -15; // shift panel slightly upward

  // Dark dimming layer behind the panel
  noStroke();
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);

  // ── Panel ─────────────────────────────────────────────────
  const w = 380, h = 290;
  const x = width  / 2 - w / 2;
  const y = height / 2 - h / 2;

  fill(16, 14, 26, 240);
  rect(x, y, w, h, 18);
  stroke(120, 100, 255, 120);
  strokeWeight(2);
  noFill();
  rect(x, y, w, h, 18);

  // ── Title ─────────────────────────────────────────────────
  noStroke();
  fill(255, 230, 120);
  textFont("Courier New");
  textAlign(CENTER, CENTER);
  textSize(40);
  text("PAUSED", width / 2, y + 45 + offsetY);

  // ── Instruction ───────────────────────────────────────────
  fill(200, 200, 235);
  textSize(16);
  text("Click RESUME or press P to continue", width / 2, y + 85 + offsetY);

  pop();

  // ── Buttons ───────────────────────────────────────────────
  const btnW   = 180, btnH = 42, gap = 16;
  const cx     = width / 2;
  const startY = (height / 2 - h / 2) + 130 + offsetY;

  // RESUME button
  const resumeX = cx - btnW / 2;
  const resumeY = startY;
  drawCleanButton(resumeX, resumeY, btnW, btnH, "RESUME", color(120, 255, 170), isHoverRect(resumeX, resumeY, btnW, btnH));
  resumeBtn = { x: resumeX, y: resumeY, w: btnW, h: btnH }; // register hit-box

  // RESTART button
  const restartX = cx - btnW / 2;
  const restartY = resumeY + btnH + gap;
  drawCleanButton(restartX, restartY, btnW, btnH, "RESTART", color(255, 210, 120), isHoverRect(restartX, restartY, btnW, btnH));
  pauseRestartBtn = { x: restartX, y: restartY, w: btnW, h: btnH }; // register hit-box

  // QUIT button
  const quitX = cx - btnW / 2;
  const quitY = restartY + btnH + gap;
  drawCleanButton(quitX, quitY, btnW, btnH, "QUIT TO MENU", color(255, 120, 120), isHoverRect(quitX, quitY, btnW, btnH));
  pauseQuitBtn = { x: quitX, y: quitY, w: btnW, h: btnH }; // register hit-box
}
