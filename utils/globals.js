
//  Every variable that is SHARED across multiple files is here

//  game state: "menu" "playing" "gameover" "tutorial" "highscores"                  
let gameState = "menu";

//  CORE ENTITIES
let player;           // player instance
let objects    = [];  // fallingObject instances
let particles  = [];  // particle instances
let popups     = [];  // pop up instances



//  PLAYER STATS
let score      = 0;
let maxHp      = 6;   // max hp
let hp         = 6;   // current hp
let streak     = 0;   // streak
let bestStreak = 0;   // highest streak reached
let multiplier = 1;   // current score multiplier

//  SPEED SETTINGS
const BASE_SPEED = 1.8;  // default fall speed for objects
const MAX_SPEED  = 6;    // max speed
let   currentSpeed = BASE_SPEED;


//  SPAWN SYSTEM
let spawnTimer     = 0;       // frames since last spawn
let nextObjectType = "rock";  // next preview (at hud)

// Chance (0–1) of spawning a heart when HP is below max
const HEART_CHANCE = 0.10;

//  VISUAL / FX STATE
let cnv;            
let stars    = [];  
let gridOffset = 0;

let shakeMag   = 0; 
let flashWhite = 0; 
let flashRed   = 0; 

// player motion trail 
let playerTrail = [];
const MAX_TRAIL = 18;

// Areas where scanline post-FX should NOT draw (like tutorial panel)
let fxExcludeRects = [];

//  PAUSE STATE
let paused          = false;
let resumeBtn       = null;  
let pauseRestartBtn = null;   
let pauseQuitBtn    = null;  



//  TIMER & HIGH SCORES
let gameStartTime = 0;   // millis() value 
let gameDuration  = 0;   // duration
let highScores    = [];  // array of score, duration, date

//  UI BUTTON REGISTRIES
let menuButtons = [];  // Buttons on the main menu
let formButtons = [];  // Rock / Paper / Scissors buttons in-game


//  GAME OVER FX
let goScan = 0; // scan
