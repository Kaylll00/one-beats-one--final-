
//  OOP CONCEPTS USED:
//    - Class with constructor and methods
//    - p5.Vector for position (this.pos)
//    - Encapsulation: glitch state and trail are private to this class

class FallingObject {

  constructor(type, speed) {

    // ── Identity ───────────────────────────────────────────
    this.type        = type;  
    this.currentType = type;  
    this.size = (type === "heart") ? 48 : 60;
    this.pos = createVector(random(width - this.size), -50);
    this.speed = speed; // increases with score

    // glitch
    this.isGlitch       = (type !== "heart") && (random() < 0.1);
    this.glitchTimer    = 0;
    this.glitchInterval = 70; // ~1.2 sec

    this.trail = [];
  }

  // Getters to llow other code to read obj.x and obj.y directly,
  get x() { return this.pos.x; }
  get y() { return this.pos.y; }

  update() {

    // ── 1. Fall downward ───────────────────────────────────
    this.pos.y += this.speed;

    // ── 2. Glitch: randomise displayed type periodically ───
    if (this.isGlitch) {
      this.glitchTimer++;
      if (this.glitchTimer > this.glitchInterval) {
        this.currentType = random(["rock", "paper", "scissors"]);
        this.glitchTimer = 0;
      }
    }
    this.trail.push({
      x: this.pos.x + this.size / 2,
      y: this.pos.y + this.size / 2,
    });

    if (this.trail.length > 10) this.trail.shift();
  }


  show() {

    push();
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const a = map(i, 0, this.trail.length - 1, 20, 120);
      // Hearts trail is pink; everything else is purple
      fill(this.currentType === "heart" ? color(255, 90, 120, a) : color(140, 120, 255, a));
      ellipse(t.x, t.y, 8 + i * 0.7);
    }
    pop();

    push();

    translate(this.pos.x + this.size / 2, this.pos.y + this.size / 2);

    if (this.currentType === "heart") {
      drawGlow(0, 0, this.size * 1.25, color(255, 90, 120, 75));
      drawHeartIcon(0, 0, 42);
      pop();
      return; 
    }

    if (this.isGlitch) {
      stroke(255, 0, 255, 140);
      strokeWeight(2);
      noFill();
      rect(-this.size / 2 - 5, -this.size / 2 - 5, this.size + 10, this.size + 10);

      stroke(255, 0, 255, 70);
      rect(
        -this.size / 2 - 5 + sin(frameCount * 0.25) * 2,
        -this.size / 2 - 5 + cos(frameCount * 0.25) * 2,
        this.size + 10, this.size + 10
      );
    }

    scale(0.8);
    if      (this.currentType === "rock")  drawRockIcon();
    else if (this.currentType === "paper") drawPaperIcon();
    else                                   drawScissorsIcon();

    pop();
  }


  //  AABB (Axis-Aligned Bounding Box) collision detection.
  hits(player) {
    return (
      this.pos.x             < player.x + player.size && // my left   < their right
      this.pos.x + this.size > player.x               && // my right  > their left
      this.pos.y             < player.y + player.size && // my top    < their bottom
      this.pos.y + this.size > player.y                  // my bottom > their top
    );
  }
}
