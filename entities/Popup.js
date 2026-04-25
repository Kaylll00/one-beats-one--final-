//  Defines two popup classes and the updatePopups() manager.
//  OOP CONCEPTS USED:
//    - Two separate classes with distinct visual behaviors
//    - Shared interface: both classes implement update(), show(), dead()
//    - updatePopups() treats both types polymorphically via this interface
// ============================================================



//  CLASS: Popup
class Popup {

  /**
   * @param {number}   x      
   * @param {number}   y       
   * @param {string}   message 
   * @param {p5.Color} col    
   */
  constructor(x, y, message, col) {
    this.x            = x;
    this.y            = y;
    this.message      = message;
    this.col          = col;
    this.alpha        = 255;    
    this.fadeOutTimer = 0;      
  }


  update() {
    // map() linearly interpolates alpha from 255 → 0 over 60 frames
    this.alpha = map(this.fadeOutTimer, 0, 60, 255, 0);

    this.y -= 0.8;

    this.fadeOutTimer++;
  }

  show() {
    push();
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    textFont("Courier New");
    textSize(16);
    textAlign(CENTER, CENTER);
    text(this.message, this.x, this.y);
    pop();
  }


  dead() {
    return this.fadeOutTimer >= 60;
  }
}



// MultiplierPopup
class MultiplierPopup {

  /**
   * @param {number} mult - up to 8
   * @param {number} x    - Starting X position 
   * @param {number} y    - Starting Y position
   */
  constructor(mult, x, y) {
    this.mult  = mult;
    this.text  = mult + "x";  

    this.x     = x;
    this.y     = y;
    this.vy    = -1.0;               
    this.vx    = random(-0.25, 0.25);

    this.life  = 255;
    this.scale = 0.7;  
    this.tw    = random(TWO_PI); 
  }

  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.life -= 6;
    this.scale = min(1.25, this.scale + 0.03); // grow until capped at 1.25
    this.tw   += 0.2;
  }

  //  Draws the glow + large multiplier text with wobble.
  show() {
    push();
    textAlign(CENTER, CENTER);
    textFont("Courier New");

    const a     = this.life;
    const wob   = sin(this.tw) * 1.5; 
    const isMax = this.mult >= 8;      

    // Glow behind the text
    const glowSize  = (isMax ? 165 : 135) * this.scale;
    const glowAlpha = isMax ? a * 0.40 : a * 0.30;
    drawGlow(this.x, this.y, glowSize, color(255, 230, 120, glowAlpha));

    // Text with outline
    fill(255, 245, 170, a);
    stroke(40, 30, 10, a * (isMax ? 0.50 : 0.38));
    strokeWeight(isMax ? 4 : 3);
    textSize(52 * this.scale);
    text(this.text, this.x + wob, this.y);

    pop();
  }

  dead() {
    return this.life <= 0;
  }
}

function updatePopups() {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];

    // Defensive: skip malformed entries instead of crashing
    if (!p || typeof p.update !== "function") {
      popups.splice(i, 1);
      continue;
    }

    try {
      p.update();
      p.show();
      if (p.dead()) popups.splice(i, 1); 
    } catch (e) {
      console.error("popup render error", e);
      popups.splice(i, 1); 
    }
  }
}
