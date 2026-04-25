//  Everything that draws ON TOP of the gameplay scene:
//  - animated background, hud panel, form buttons (RPS)
//  - game fx. gradient. parallax, scanline 

function drawAnimatedBackground() {

  // gradient fx
  noStroke();
  for (let y = 0; y < height; y += 4) {
    const t = y / height; // 0 at top, 1 at bottom
    fill(lerp(12, 30, t), lerp(10, 18, t), lerp(26, 55, t), 255);
    rect(0, y, width, 4);
  }

  // parallax fx
  push();
  noStroke();
  for (const s of stars) {
    s.y += s.z * 0.6;
    s.x += sin(frameCount * 0.002 + s.tw) * 0.12 * s.z;

    if (s.y > height + 10) {
      s.y = -10;
      s.x = random(width);
      s.z = random(0.5, 2.2);
    }

    // twinkle
    const a = 90 + sin(frameCount * 0.02 + s.tw) * 60;
    fill(220, 210, 255, a);
    ellipse(s.x, s.y, s.z * 2.0);
  }
  pop();

  gridOffset = (gridOffset + 0.8) % 40;
  push();
  stroke(120, 100, 255, 28);
  strokeWeight(1);
  for (let x = 0; x < width; x += 40) {
    line(x, 0, x, height);
  }
  for (let y = -40; y < height + 40; y += 40) {
    const yy = (y + gridOffset) % 40;
    line(0, yy, width, yy);
  }
  pop();
}



//  HUD panel (hearts, score, multiplier, streak, next)
function drawHUDPanel() {
  push();

  noStroke();
  fill(10, 10, 18, 180);
  rect(0, 0, width, 90);
  stroke(120, 100, 255, 80);
  strokeWeight(2);
  line(0, 90, width, 90);

  // hp
  const hx = 20, hy = 30;
  textAlign(LEFT, CENTER);
  textSize(22);
  for (let i = 0; i < hp; i++) {
    const px = hx + i * 26;
    drawGlow(px + 6, hy + 4, 22, color(255, 90, 110, 60));
    fill(255, 110, 120);
    text("❤", px, hy);
  }

  // score
  fill(255, 255, 130);
  textSize(28);
  textAlign(LEFT, CENTER);
  text("Score: " + score, 20, 66);

  // badge multiplier
  if (multiplier > 1) {
    const bx = 220, by = 32;
    drawGlow(bx, by, 70, color(255, 210, 90, 90));
    fill(20, 18, 35, 220);
    stroke(255, 210, 90, 170);
    strokeWeight(2);
    rect(bx - 28, by - 18, 56, 36, 10);

    noStroke();
    fill(255, 235, 140);
    textAlign(CENTER, CENTER);
    textSize(22);
    text(multiplier + "x", bx, by + 1);
  }

  const nx = width - 90, ny = 44;
  fill(20, 18, 35, 220);
  stroke(120, 100, 255, 120);
  strokeWeight(2);
  rect(nx - 40, ny - 35, 80, 70, 12);

  noStroke();
  fill(230);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("NEXT", nx, ny - 22);

  push();
  translate(nx, ny + 8);
  scale(0.55);
  if      (nextObjectType === "rock")  drawRockIcon();
  else if (nextObjectType === "paper") drawPaperIcon();
  else                                  drawScissorsIcon();
  pop();

  pop();
}


//  form buttons below hug during gamepla
//  Also re-registers the formButtons[] array each frame so
function drawFormButtons() {
  const y = 98, h = 38, w = 120, gap = 10;
  const totalW = w * 3 + gap * 2;
  const startX = width / 2 - totalW / 2;

  formButtons = [
    { form: "rock",     label: "ROCK (A)",     x: startX + 0 * (w + gap), y, w, h, col: color(140, 95, 75)   },
    { form: "paper",    label: "PAPER (S)",    x: startX + 1 * (w + gap), y, w, h, col: color(240, 240, 255) },
    { form: "scissors", label: "SCISSORS (D)", x: startX + 2 * (w + gap), y, w, h, col: color(190, 190, 210) },
  ];

  push();
  textAlign(CENTER, CENTER);
  textSize(14);
  textFont("Courier New");

  for (const b of formButtons) {
    const hover    = isHoverRect(b.x, b.y, b.w, b.h);
    const isActive = player && player.targetForm === b.form;

    noStroke();
    fill(18, 16, 30, 210);
    rect(b.x - 3, b.y - 3, b.w + 6, b.h + 6, 12);

    // glow fx
    if (hover || isActive) {
      drawRectGlow(
        b.x, b.y, b.w, b.h, 12,
        color(red(b.col), green(b.col), blue(b.col), hover ? 80 : 60),
        10
      );
    }

    // hover fx
    stroke(hover ? color(140, 255, 190) : color(120, 100, 255, 120));
    strokeWeight(isActive ? 3 : 2);
    fill(hover ? color(38, 34, 62, 230) : color(25, 22, 45, 210));
    rect(b.x, b.y, b.w, b.h, 12);


    noStroke();
    fill(255, 255, 255, hover ? 30 : 18);
    rect(b.x + 10, b.y + 8, b.w - 20, 2, 2);


    fill(240);
    text(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  }

  fill(255);
  textSize(18);
  text("Press P to pause", width / 2, y + h + 18);

  pop();
}

/**When the array exceeds MAX_TRAIL, the oldest point is removed.*/
function pushPlayerTrail(x, y, col) {
  playerTrail.push({ x, y, a: 140, s: 18, r: red(col), g: green(col), b: blue(col) });
  if (playerTrail.length > MAX_TRAIL) playerTrail.shift();
}

/** trail f*/
function drawPlayerTrail() {
  push();
  noStroke();
  for (let i = 0; i < playerTrail.length; i++) {
    const t      = playerTrail[i];
    const alphaV = map(i, 0, playerTrail.length - 1, 10, t.a);
    fill(t.r, t.g, t.b, alphaV * 0.35);
    ellipse(t.x, t.y, t.s + i * 0.8);
  }
  pop();
}
                                                                                                
//  shake fx
function applyScreenShake() {
  if (shakeMag > 0.2) {
    translate(random(-shakeMag, shakeMag), random(-shakeMag, shakeMag));
  }
}


// ─────────────────────────────────────────────────────────────
//  POST-PROCESSING FX
//  Applied AFTER all game content is drawn, outside of the
//  push/pop block that contains screen shake.
// ─────────────────────────────────────────────────────────────

/**
 * Routes to the correct FX pass based on current game state.
 * Flash overlays are only drawn during active gameplay.
 */
function drawPostFX() {
  if (gameState === "playing" && !paused) {
    if (flashWhite > 1) {
      noStroke();
      fill(255, 255, 255, flashWhite * 0.35);
      rect(0, 0, width, height);
    }
    if (flashRed > 1) {
      noStroke();
      fill(255, 60, 80, flashRed * 0.25);
      rect(0, 0, width, height);
    }
  }

  if (gameState === "gameover") drawGameOverFX();
  else                          drawNormalFX();
}

/**
 scan fx playing/tutorial
 */
function drawNormalFX() {
  // Scanlines
  push();
  stroke(0, 0, 0, 25);
  strokeWeight(1);
  for (let y = 0; y < height; y += 3) {
    let x0 = 0;

    const rects = fxExcludeRects
      .filter(r => y >= r.y && y <= r.y + r.h)
      .sort((a, b) => a.x - b.x);

    for (const r of rects) {
      if (r.x > x0) line(x0, y, r.x, y);
      x0 = max(x0, r.x + r.w);
    }
    if (x0 < width) line(x0, y, width, y);
  }
  pop();

  
  push();
  noStroke();
  for (let i = 0; i < 6; i++) {
    fill(0, 0, 0, 20);
    rect(i * 8, i * 8, width - i * 16, height - i * 16, 18);
  }
  pop();
}

/** scan fx gameover */
function drawGameOverFX() {
  goScan += 0.8; 

  noStroke();
  fill(0, 0, 0, 90);
  rect(0, 0, width, height);

  push();
  stroke(0, 0, 0, 35);
  strokeWeight(1);
  for (let y = 0; y < height; y += 3) {
    line(0, y, width, y);
  }
  pop();
}
