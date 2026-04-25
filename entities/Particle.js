//  OOP CONCEPTS USED:
//    - Class with constructor and methods
//    - p5.Vector for position (this.pos) and velocity (this.vel)
//    - Physics: gravity applied as this.vel.y += 0.2 each frame
//
//  FACTORY FUNCTIONS (below the class):
//    createParticles()      → correct catch burst (RPS color)
//    createFailParticles()  → wrong form burst (red)
//    createHealParticles()  → heart pickup burst (pink)
// ============================================================

class Particle {

  constructor(x, y, type) {

    this.pos = createVector(x, y);

    this.vel = createVector(random(-3, 3), random(-5, -1));

    
    this.life = 255;          
    this.size = random(3, 8); 
    this.type = type;         

 
    this.tw = random(TWO_PI);
  }

  //  physics simulation — called every frame.
  update() {
  
    this.pos.add(this.vel);

  
    this.vel.y += 0.2;


    this.life -= 5;


    this.tw += 0.25;
  }

  show() {
    noStroke();

    const twinkle = (sin(this.tw) * 0.5 + 0.5) * 0.6 + 0.4;
    const s = this.size * twinkle;

    if      (this.type === "rock")     fill(150, 100, 80,  this.life);
    else if (this.type === "paper")    fill(255, 255, 255, this.life);
    else if (this.type === "scissors") fill(200, 200, 220, this.life);
    else if (this.type === "fail")     fill(255, 100, 100, this.life);
    else if (this.type === "heal")     fill(255, 120, 150, this.life);

    ellipse(this.pos.x, this.pos.y, s);

    // Specular highlight dot — gives a shiny, gem-like look
    fill(255, 255, 255, this.life * 0.35);
    ellipse(this.pos.x + 2, this.pos.y - 2, s * 0.45);
  }

  isDead() {
    return this.life <= 0;
  }
}

/**
 * Spawns 15 particles at (x, y) colored for a correct catch.
 * Type matches the object type so color is contextual.
 *
 * @param {number} x    - Burst origin X
 * @param {number} y    - Burst origin Y
 * @param {string} type - "rock", "paper", or "scissors"
 */
function createParticles(x, y, type) {
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(x, y, type));
  }
}

/**
 * Spawns 10 red particles at (x, y) for a wrong-form collision.
 *
 * @param {number} x - Burst origin X
 * @param {number} y - Burst origin Y
 */
function createFailParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(x, y, "fail"));
  }
}

/**
 * Spawns 14 pink particles at (x, y) for a heart pickup.
 *
 * @param {number} x - Burst origin X
 * @param {number} y - Burst origin Y
 */
function createHealParticles(x, y) {
  for (let i = 0; i < 14; i++) {
    particles.push(new Particle(x, y, "heal"));
  }
}
