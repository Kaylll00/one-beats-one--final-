//  The complete interactive tutorial system.

//  These variables are local to this screen
let tutorialStep       = 0;     // step: 1, 2, or 3
let tutorialPlayer     = null;  // tutorial player instance
let tutorialObjects    = [];    // Falling objects during step 2
let tutorialScore      = 0;     // correct catches 
let tutorialStreak     = 0;     // current consecutive catch streak
let tutorialSpawnTimer = 0;     // frames since last object spawn


//  Resets all tutorial state to the beginning.
function initTutorial() {
  tutorialStep       = 0;
  tutorialScore      = 0;
  tutorialStreak     = 0;
  tutorialSpawnTimer = 0;
  tutorialPlayer     = new Player(); 
  tutorialObjects    = [];
  popups             = [];           
}

//  resets objects and repositions the player.
function enterStep(step) {
  tutorialStep       = step;
  tutorialObjects    = [];    
  tutorialPlayer.x   = width / 2; 
  tutorialPlayer.y   = height - 80;
}

//  tutorial player movement, object spawning, and collision.
function updateTutorial() {
  if (!tutorialPlayer) initTutorial();

  try {
  
    tutorialPlayer.update();

  
    tutorialPlayer.form = tutorialPlayer.targetForm;

    shakeMag = 0;

    // Step 3 only
    if (tutorialStep === 2) {
      tutorialSpawnTimer++;
      if (tutorialSpawnTimer > 120) { 
        const type = random(["rock", "paper", "scissors"]);
        const obj  = new FallingObject(type, BASE_SPEED * 0.6);
        obj.isGlitch = false; 
        tutorialObjects.push(obj);
        tutorialSpawnTimer = 0;
      }
    }

    
    for (let i = tutorialObjects.length - 1; i >= 0; i--) {
      try {
        tutorialObjects[i].update();
      } catch (e) {
        console.error("FallingObject.update error in tutorial", e);
        tutorialObjects.splice(i, 1);
        continue;
      }

      if (tutorialObjects[i].y > height + 50) {
        tutorialObjects.splice(i, 1);
        continue;
      }
      if (tutorialObjects[i].hits(tutorialPlayer)) {
        const objType = tutorialObjects[i].currentType;

        if (tutorialPlayer.beats(objType)) {
          tutorialScore++;
          tutorialStreak++;
          const msg = tutorialStreak >= 3 ? "GREAT!" : "GOOD!";
          popups.push(new Popup(
            tutorialPlayer.x + tutorialPlayer.size / 2,
            tutorialPlayer.y - 40,
            msg,
            color(100, 255, 150)
          ));
          flashWhite = 60;
        } else {
          tutorialStreak = 0;
          popups.push(new Popup(
            tutorialPlayer.x + tutorialPlayer.size / 2,
            tutorialPlayer.y - 40,
            "WRONG!",
            color(255, 0, 0)
          ));
          flashRed = 60;
        }

        tutorialObjects.splice(i, 1); 
      }
    }

    updatePopups();

  } catch (err) {
    console.error("updateTutorial fatal error", err);
    tutorialObjects = [];
    popups          = [];
    gameState       = "menu";
  }
}

//  Per-frame rendering for the tutorial screen.
function drawTutorial() {
  if (!tutorialPlayer) initTutorial();
  drawTutorialFormButtons();

  tutorialPlayer.show();
  for (let obj of tutorialObjects) obj.show();

  // instruction panel 
  const panW = width * 0.6;
  const panH = 100 + (tutorialStep === 2 ? 10 : 0);
  const panX = width / 2 - panW / 2;
  const panY = 40;


  fxExcludeRects.push({ x: panX, y: panY, w: panW, h: panH });

  push();
  noStroke();
  fill(12, 10, 22, 235);
  rect(panX, panY, panW, panH, 16);
  stroke(120, 140, 255, 120);
  strokeWeight(2);
  noFill();
  rect(panX, panY, panW, panH, 16);
  drawRectGlow(panX, panY, panW, panH, 16, color(120, 140, 255, 40), 8);
  pop();

  push();
  textFont("Courier New");
  textAlign(LEFT, TOP);

  const pad = 14;
  let tx = panX + pad;
  let ty = panY + pad;


  fill(150, 180, 255);
  textSize(12);
  text(`STEP ${tutorialStep + 1} / 3`, tx, ty);
  ty += 14;

  fill(220, 240, 255);
  textSize(15);
  textStyle(BOLD);
  if (tutorialStep === 0) text("MOVE USING ARROW KEYS ( ← / → )",      tx, ty);
  if (tutorialStep === 1) text("SWITCH FORMS USING KEYS",               tx, ty);
  if (tutorialStep === 2) text("CATCH OBJECTS USING PROPER FORM",       tx, ty);
  textStyle(NORMAL);
  ty += 18;

  fill(210, 220, 240);
  textSize(12);
  if (tutorialStep === 0) {
    text("Use LEFT and RIGHT arrow keys\nto move your character across the \nscreen.", tx, ty);
  }
  if (tutorialStep === 1) {
    text("Use A, S, D keys to switch between \ncharacters or click the on-screen \nbuttons.", tx, ty);
  }
  if (tutorialStep === 2) {
    text("Rock beats Scissors\nPaper beats Rock\nScissors beats Paper", tx, ty);
    ty += 45;
    fill(150, 255, 180);
    text(`Caught: ${tutorialScore}   ⚡ ${tutorialStreak}`, tx, ty);
  }
  pop();

  // nav button
  const btnH  = 40, btnW = 130, margin = 20;
  const baseX = width - btnW - margin;
  const baseY = height - btnH - margin;

  // NEXT / START button
  const nextLabel = tutorialStep === 2 ? "START" : "NEXT STEP";
  drawCleanButton(baseX, baseY, btnW, btnH, nextLabel, color(150, 255, 200), isHoverRect(baseX, baseY, btnW, btnH));

  // BACK button (only on steps 1 and 2)
  if (tutorialStep > 0) {
    const backY = baseY - btnH - 10;
    drawCleanButton(baseX, backY, btnW, btnH, "BACK", color(180, 180, 200), isHoverRect(baseX, backY, btnW, btnH));
  }

  drawCleanButton(20, height - 50, 110, 36, "MENU", color(180, 200, 255), isHoverRect(20, height - 50, 110, 36));
}


function drawTutorialFormButtons() {
  const y = 170, h = 38, w = 120, gap = 10;
  const totalW = w * 3 + gap * 2;
  const startX = width / 2 - totalW / 2;

  const defs = [
    { form: "rock",     label: "ROCK (A)",     x: startX + 0 * (w + gap), col: color(140, 95, 75)   },
    { form: "paper",    label: "PAPER (S)",    x: startX + 1 * (w + gap), col: color(240, 240, 255) },
    { form: "scissors", label: "SCISSORS (D)", x: startX + 2 * (w + gap), col: color(190, 190, 210) },
  ];

  push();
  textAlign(CENTER, CENTER);
  textSize(14);
  textFont("Courier New");

  for (const b of defs) {
    const hovered  = isHoverRect(b.x, y, w, h);
    const isActive = tutorialPlayer && tutorialPlayer.form === b.form;

  
    noStroke();
    fill(18, 16, 30, 210);
    rect(b.x - 3, y - 3, w + 6, h + 6, 12);

  
    if (hovered || isActive) {
      drawRectGlow(b.x, y, w, h, 12, color(red(b.col), green(b.col), blue(b.col), hovered ? 80 : 60), 10);
    }

 
    stroke(hovered ? color(140, 255, 190) : color(120, 100, 255, 120));
    strokeWeight(isActive ? 3 : 2);
    fill(hovered ? color(38, 34, 62, 230) : color(25, 22, 45, 210));
    rect(b.x, y, w, h, 12);

    
    noStroke();
    fill(255, 255, 255, hovered ? 30 : 18);
    rect(b.x + 10, y + 8, w - 20, 2, 2);

    
    fill(240);
    text(b.label, b.x + w / 2, y + h / 2 + 1);
  }
  pop();
}
