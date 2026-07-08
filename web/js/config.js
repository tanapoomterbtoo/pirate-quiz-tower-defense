// Configuration settings matching the Python version
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 60;

// Dimensions matching SIZE_PLAYER, SIZE_MONSTER_SMALL, etc.
const SIZE_PLAYER = { width: 210, height: 280 };
const SIZE_MONSTER_SMALL = { width: 210, height: 280 };
const SIZE_MONSTER_BIG = { width: 260, height: 320 };
const SIZE_MONSTER_BOSS = { width: 380, height: 380 };

// Animation FPS settings
const ANIM_FPS = {
    "idle": 5,
    "walk": 5,
    "attack": 12,
    "hurt": 12
};

// Game Settings
const SHUFFLE_QUESTIONS = true;
const PLAYER_BASE_DMG = 30;

// Character Floor level (Y coordinate for feet)
const FLOOR_Y = 560; // Slightly higher as requested (was 600)

// Volume (0.0 to 1.0)
const VOL_BGM = 0.1;
const VOL_SFX = 0.8;

// Assets directories paths relative to web/index.html
const ASSETS_PATH = "../assets";
const AUDIO_PATH = `${ASSETS_PATH}/audio`;
const IMG_PATH = `${ASSETS_PATH}/images`;
const CHAR_PATH = `${IMG_PATH}/characters`;

// Game states constants
const STATE_MAIN_MENU = "MAIN_MENU";
const STATE_PLAYING = "PLAYING";
const STATE_GAME_OVER = "GAME_OVER";
const STATE_VICTORY = "VICTORY";
