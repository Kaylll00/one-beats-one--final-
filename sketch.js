//  runs once when loaded
function setup() {
  cnv = createCanvas(500, 900);
  centerCanvas();
  frameRate(60); // 60 fps for smooth animation

  textAlign(CENTER, CENTER);

  // player entity
  player = new Player();

  nextObjectType = random(["rock", "paper", "scissors"]);

  for (let i = 0; i < 110; i++) {
    stars.push({
      x:  random(width),
      y:  random(height),
      z:  random(0.5, 2.2),
      tw: random(TWO_PI),
    });
  }

  // load high scores from local storage
  loadHighScoresFromStorage();
}

// called ~60 times per second by p5.js
function draw() {
  
  fxExcludeRects = [];

  push(); 

  // screen shake before showing the scene
  if (gameState === "playing" && !paused) applyScreenShake();

  // star-field and grid background
  drawAnimatedBackground();

  // Routing
  switch (gameState) {
    case "menu":
      drawMenu();         // menu
      break;

    case "playing":
      runGame();          // 
      break;

    case "gameover":
      drawGameOver();     // gameover
      break;

    case "tutorial":
      updateTutorial();   // logic
      drawTutorial();     // render
      break;

    case "highscores":
      drawHighScores();   // screens/Menu.js
      break;
  }

  pop(); 


  drawPostFX(); 
}


//  GAME LIFECYCLE

/** Transitions to the playing state and resets everything. */
function startGame() {
  gameState = "playing";
  resetGame();
  flashWhite = 140; 
  shakeMag   = 10;
}

/** Called by startGame() and by the Quit button in the pause menu.*/
function resetGame() {
  
  hp         = maxHp;
  score      = 0;
  streak     = 0;
  bestStreak = 0;
  multiplier = 1;

  // clear entities and FX
  objects   = [];
  particles = [];
  popups    = [];

  // back to 0
  spawnTimer     = 0;
  currentSpeed   = BASE_SPEED;
  nextObjectType = random(["rock", "paper", "scissors"]);

  // visual fx
  playerTrail = [];
  shakeMag    = 0;
  flashWhite  = 0;
  flashRed    = 0;

  paused = false;

  // start timer
  gameStartTime = millis();

  // fresh player instance (resets form to rock)
  player = new Player();
}



// game loop, called every frame during active gameplay
function runGame() {
  drawHUDPanel(); 

  // pause
  if (paused) {
    drawFrozenScene();   
    drawPausedOverlay(); 
    return;              
  }

  // Speed increases by 0.02 per point
  currentSpeed = min(MAX_SPEED, BASE_SPEED + score * 0.02);

  // player
  player.update();                                                          
  pushPlayerTrail(player.x + player.size / 2, player.y + player.size / 2, player.getColor());
  drawPlayerTrail();
  player.show();     

  drawFormButtons(); 
  updatePopups();    

  // falling objects
  spawnTimer++;
  // spawn rate gets faster as score increases (min 55 frames between spawns)
  const spawnRate = max(55, 95 - floor(score / 12));

  if (spawnTimer > spawnRate) {
    // Occasionally spawn a heart if the player is hurt
    const spawnHeart = (hp < maxHp) && (random() < HEART_CHANCE);

    if (spawnHeart) {
      objects.push(new FallingObject("heart", currentSpeed * 0.9));
    } else {
      objects.push(new FallingObject(nextObjectType, currentSpeed));
      nextObjectType = random(["rock", "paper", "scissors"]); // queue next
    }

    spawnTimer = 0;
  }

  for (let i = objects.length - 1; i >= 0; i--) {
    objects[i].update();
    objects[i].show();

    if (objects[i].hits(player)) {
      // ── Heart: heal the player ───────────────────────────
      if (objects[i].currentType === "heart") {
        hp = min(maxHp, hp + 1);
        createHealParticles(objects[i].x + objects[i].size / 2,
                            objects[i].y + objects[i].size / 2);
        flashWhite = 120;
        shakeMag   = 6;
        objects.splice(i, 1);
        continue;
      }

  
      if (player.beats(objects[i].currentType)) {
        streak++;
        bestStreak = max(bestStreak, streak);
        multiplier = calcMultiplier(streak); 
        score     += multiplier;

        createParticles(objects[i].x + objects[i].size / 2,
                        objects[i].y + objects[i].size / 2,
                        objects[i].currentType);

        // multiplier badge
        if (multiplier > 1) {
          popups.push(new MultiplierPopup(
            multiplier,
            player.x + player.size / 2,
            player.y - 18
          ));
        }

        flashWhite = 120;
        shakeMag   = min(14, 6 + multiplier * 2);

      } else {
        // incorrect form
        hp--;
        streak     = 0;
        multiplier = 1;
        createFailParticles(objects[i].x + objects[i].size / 2,
                            objects[i].y + objects[i].size / 2);
        flashRed = 150;
        shakeMag = 14;
      }

      objects.splice(i, 1); 

    } else if (objects[i].y > height) {
      // missed object penalty ────────────────
      if (objects[i].currentType !== "heart") hp--;
      objects.splice(i, 1); // remove to free memory
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) particles.splice(i, 1); // cull dead particles
  }

  if (hp <= 0) {
    gameDuration = millis() - gameStartTime;
    saveHighScore(score, gameDuration); // utils/helpers.js
    gameState  = "gameover";
    paused     = false;
    shakeMag   = 0;
    flashWhite = 0;
  }

  shakeMag   *= 0.88;
  flashWhite *= 0.88;
  flashRed   *= 0.88;
}

//  pause toggle
function togglePause() {
  paused     = !paused;
  flashWhite = max(flashWhite, 50);
  shakeMag   = max(shakeMag, 2);
}


//  INPUT — MOUSE
function mousePressed() {

  // ── Pause overlay buttons ──────────────────────────────────
  if (gameState === "playing" && paused) {

    if (resumeBtn && pointInRect(mouseX, mouseY, resumeBtn.x, resumeBtn.y, resumeBtn.w, resumeBtn.h)) {
      paused = false;
      return;
    }

    if (pauseRestartBtn && pointInRect(mouseX, mouseY, pauseRestartBtn.x, pauseRestartBtn.y, pauseRestartBtn.w, pauseRestartBtn.h)) {
      startGame();
      return;
    }

    if (pauseQuitBtn && pointInRect(mouseX, mouseY, pauseQuitBtn.x, pauseQuitBtn.y, pauseQuitBtn.w, pauseQuitBtn.h)) {
      gameDuration = millis() - gameStartTime;
      if (score > 0) saveHighScore(score, gameDuration);
      gameState = "menu";
      resetGame();
      return;
    }
  }

  // main menu buttons
  if (gameState === "menu") {
    for (const btn of menuButtons) {
      if (pointInRect(mouseX, mouseY, btn.x, btn.y, btn.w, btn.h)) {
        if (btn.state === "playing")    { startGame(); return; }
        if (btn.state === "tutorial")   { gameState = "tutorial"; initTutorial(); return; }
        if (btn.state === "highscores") { gameState = "highscores"; return; }
      }
    }
  }

  // tutorial buttons
  if (gameState === "tutorial") {

    // form switch buttons (top)
    const y = 170, h = 38, w = 120, gap = 10;
    const startX = width / 2 - (w * 3 + gap * 2) / 2;
    const formDefs = [
      { form: "rock",     x: startX + 0 * (w + gap) },
      { form: "paper",    x: startX + 1 * (w + gap) },
      { form: "scissors", x: startX + 2 * (w + gap) },
    ];
    for (const b of formDefs) {
      if (pointInRect(mouseX, mouseY, b.x, y, w, h)) {
        tutorialPlayer.switchForm(b.form);
        return;
      }
    }

    // next button
    const btnH = 40, btnW = 130, margin = 20;
    const baseX = width - btnW - margin;
    const baseY = height - btnH - margin;
    if (pointInRect(mouseX, mouseY, baseX, baseY, btnW, btnH)) {
      tutorialStep === 2 ? startGame() : enterStep(tutorialStep + 1);
      return;
    }

    // Back button
    if (tutorialStep > 0) {
      const backY = baseY - btnH - 10;
      if (pointInRect(mouseX, mouseY, baseX, backY, btnW, btnH)) {
        enterStep(tutorialStep - 1);
        return;
      }
    }

    // menu button
    if (pointInRect(mouseX, mouseY, 20, height - 50, 110, 36)) {
      gameState = "menu";
      return;
    }
  }

  // high scores back button
  if (gameState === "highscores") {
    const backW = 160, backH = 42;
    const backX = width / 2 - backW / 2;
    const backY = height - 70;
    if (pointInRect(mouseX, mouseY, backX, backY, backW, backH)) {
      gameState = "menu";
      return;
    }
  }

  // game over buttons 
  if (gameState === "gameover") {
    const cx   = width / 2;
    const btnW = 180, btnH = 42, btnGap = 14;
    const btnX = cx - btnW / 2;
    const btn1Y = 150 + 200 + 30;         
    const btn2Y = btn1Y + btnH + btnGap;

    if (pointInRect(mouseX, mouseY, btnX, btn1Y, btnW, btnH)) { startGame(); return; }
    if (pointInRect(mouseX, mouseY, btnX, btn2Y, btnW, btnH)) { gameState = "menu"; resetGame(); return; }
  }

  // active playing: form button clicks
  if (gameState === "playing" && !paused) {
    for (const b of formButtons) {
      if (pointInRect(mouseX, mouseY, b.x, b.y, b.w, b.h)) {
        player.switchForm(b.form);
        flashWhite = max(flashWhite, 50);
        shakeMag   = max(shakeMag, 3);
        break;
      }
    }
  }
}


//  INPUT — KEYBOARD
function keyPressed() {

  // actual playing state controls 
  if (gameState === "playing") {
    if (key === "a" || key === "A") player.switchForm("rock");
    if (key === "s" || key === "S") player.switchForm("paper");
    if (key === "d" || key === "D") player.switchForm("scissors");
    if (key === "p" || key === "P") togglePause();
  }

  // tutorial keyboard form switching
  if (gameState === "tutorial") {
    if (key === "a" || key === "A") tutorialPlayer.switchForm("rock");
    if (key === "s" || key === "S") tutorialPlayer.switchForm("paper");
    if (key === "d" || key === "D") tutorialPlayer.switchForm("scissors");
  }
}
