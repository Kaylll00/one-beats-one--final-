//  Defines the Player class — the user-controlled character.
//  RESPONSIBILITIES:
//    - Read keyboard input (arrow keys) and move horizontally
//    - Animate smooth form switching between Rock, Paper, Scissors
//    - Render the correct creature sprite with glow + orbit ring
//    - Expose the beats() method for collision logic in sketch.js
//
//  OOP CONCEPTS USED:
//    - Class with constructor, methods, and getters/setters
//    - p5.Vector for position (this.pos) and velocity (this.vel)
//    - Encapsulation: all player state lives inside this class
// ============================================================

class Player {

  constructor() {
    // Position & Movement
    // Using p5.Vector so we can call this.pos.add(this.vel)
    this.pos  = createVector(width / 2 - 40, height - 100);
    this.vel  = createVector(0, 0);

    this.size  = 80; 
    this.speed = 8;   

    //switch progress animates 0 → 1 over ~5 frames
    this.form           = "rock";
    this.targetForm     = "rock";
    this.switchProgress = 0;
  }

  // ── Getters & Setters ──────────────────────────────────────
  // These allow other files to read player.x / player.y
  // even though the real data lives in this.pos (a p5.Vector).
  get x() { return this.pos.x; }
  get y() { return this.pos.y; }
  set x(v) { this.pos.x = v; }
  set y(v) { this.pos.y = v; }

  update() {

    this.vel.x = 0; // reset horizontal velocity each frame
    if (keyIsDown(LEFT_ARROW))  this.vel.x = -this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.vel.x =  this.speed;

    this.pos.add(this.vel);


    this.pos.x = constrain(this.pos.x, 0, width - this.size);

    if (this.form !== this.targetForm) {
      this.switchProgress += 0.2;
      if (this.switchProgress >= 1) {
        this.form           = this.targetForm;
        this.switchProgress = 0;
      }
    }
  }


  // ──────────────────────────────────────────────────────────
  //  show()
  //  Renders the player sprite at its current position.
  //  Uses translate() so all sub-draw methods work from (0, 0).
  // ──────────────────────────────────────────────────────────
  show() {
    push();

    // Move origin to the center of the player sprite
    translate(this.pos.x + this.size / 2, this.pos.y + this.size / 2);

    // ── Pulsing glow halo ──────────────────────────────────
    const c     = this.getColor();
    const pulse = 90 + sin(frameCount * 0.12) * 35; // oscillates 55–125
    drawGlow(0, 0, this.size * 1.7, color(red(c), green(c), blue(c), pulse));

    // ── Orbit ring ─────────────────────────────────────────
    stroke(255, 255, 255, 50);
    strokeWeight(2);
    noFill();
    const ringSize = 64 + sin(frameCount * 0.08) * 3; // slight breathing animation
    ellipse(0, 0, ringSize, ringSize);

    // ── Creature sprite ────────────────────────────────────
    if      (this.form === "rock")     this.drawRockCreature();
    else if (this.form === "paper")    this.drawPaperCreature();
    else if (this.form === "scissors") this.drawScissorsCreature();

    pop();
  }


  // ──────────────────────────────────────────────────────────
  //  SPRITE DRAWING METHODS
  //  Each draws a creature centered at (0, 0).
  //  They rely on translate() in show() to position correctly.
  // ──────────────────────────────────────────────────────────

  /** Rock — a chunky pentagon with glowing eyes and crack marks */
  drawRockCreature() {
    // Pentagon body
    fill(120, 80, 60);
    stroke(80, 50, 30);
    strokeWeight(3);
    beginShape();
    for (let i = 0; i < 5; i++) {
      const a = (TWO_PI / 5) * i - PI / 2;
      vertex(cos(a) * 30, sin(a) * 30);
    }
    endShape(CLOSE);

    // Crack lines on the surface
    stroke(60, 40, 20);
    strokeWeight(2);
    line(-15, -10, -5,  5);
    line( 10, -15, 15,  0);

    // Glowing yellow eyes
    fill(255, 200, 50);
    noStroke();
    ellipse(-10, -5, 8, 8);
    ellipse( 10, -5, 8, 8);

    // Eye shine
    fill(255, 255, 100);
    ellipse(-8, -7, 3, 3);
    ellipse(12, -7, 3, 3);
  }

  /** Paper — a soft white layered blob with animated wing appendages */
  drawPaperCreature() {
    noStroke();

    // Layered ghostly halo (4 ellipses drifting)
    for (let i = 0; i < 4; i++) {
      const off = sin(frameCount * 0.1 + i) * (5 + i);
      fill(255, 255, 255, 70 - i * 10);
      ellipse(off, i * 10 - 18, 58 - i * 7, 28);
    }

    // Main body
    fill(255);
    ellipse(0, 0, 45, 45);

    // Animated wing appendages — left and right
    fill(255, 255, 255, 180);

    // Left wing
    beginShape();
    vertex(-20, 10);
    vertex(-28, 20 + sin(frameCount * 0.15) * 6);
    vertex(-16, 28 + sin(frameCount * 0.15) * 6);
    vertex(-10, 15);
    endShape(CLOSE);

    // Right wing
    beginShape();
    vertex( 20, 10);
    vertex( 28, 20 + cos(frameCount * 0.15) * 6);
    vertex( 16, 28 + cos(frameCount * 0.15) * 6);
    vertex( 10, 15);
    endShape(CLOSE);

    // Grey eyes
    fill(110, 110, 160);
    ellipse(-8, -5, 6, 8);
    ellipse( 8, -5, 6, 8);

    // Eye shine
    fill(210, 210, 255);
    ellipse(-6, -7, 2, 3);
    ellipse(10, -7, 2, 3);
  }

  /** Scissors — a metallic diamond body with extending blade arms */
  drawScissorsCreature() {
    // Diamond body
    fill(180, 180, 200);
    stroke(100, 100, 120);
    strokeWeight(2);
    beginShape();
    vertex( 0, -25);
    vertex(20,   0);
    vertex( 0,  25);
    vertex(-20,  0);
    endShape(CLOSE);

    // Blade arms — left and right
    fill(200, 200, 220);
    stroke(120, 120, 140);
    strokeWeight(2);
    beginShape(); vertex(-20, -5); vertex(-38, -16); vertex(-30, -4); endShape(CLOSE);
    beginShape(); vertex( 20, -5); vertex( 38, -16); vertex( 30, -4); endShape(CLOSE);

    // Blade edge highlights
    stroke(240, 240, 255, 200);
    strokeWeight(1);
    line(-20, -5, -38, -16);
    line( 20, -5,  38, -16);

    // Red pupils
    fill(255, 100, 100);
    noStroke();
    ellipse(-8, -3, 7, 10);
    ellipse( 8, -3, 7, 10);

    // Eye shine
    fill(255, 200, 200);
    ellipse(-6, -6, 2, 3);
    ellipse(10, -6, 2, 3);
  }


  // ──────────────────────────────────────────────────────────
  //  UTILITY METHODS
  // ──────────────────────────────────────────────────────────

  /**
   * Returns the accent color for the current form.
   * Used to tint the glow halo and the player trail.
   */
  getColor() {
    if (this.form === "rock")     return color(120, 80, 60, 120);
    if (this.form === "paper")    return color(255, 255, 255, 120);
    return                               color(180, 180, 200, 120); // scissors
  }

  /**
   * Requests a form change.
   * The actual switch animates over ~5 frames via switchProgress.
   *
   * @param {string} newForm - "rock", "paper", or "scissors"
   */
  switchForm(newForm) {
    this.targetForm = newForm;
  }

  /**
   * Rock-Paper-Scissors rule lookup.
   * Returns true if the player's current form beats the given type.
   *
   * Rules:
   *   Rock     beats Scissors
   *   Paper    beats Rock
   *   Scissors beats Paper
   *
   * @param {string} type - The type of the falling object
   * @returns {boolean}
   */
  beats(type) {
    return (
      (this.form === "rock"     && type === "scissors") ||
      (this.form === "paper"    && type === "rock")     ||
      (this.form === "scissors" && type === "paper")
    );
  }
}
