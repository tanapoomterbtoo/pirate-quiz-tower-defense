// Configuration settings matching the Python version
const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 60;

// Dimensions matching SIZE_PLAYER, SIZE_MONSTER_SMALL, etc.
const SIZE_PLAYER = { width: 210, height: 280 };
const SIZE_MONSTER_SMALL = { width: 210, height: 280 };
const SIZE_MONSTER_BIG = { width: 260, height: 320 };
const SIZE_MONSTER_BOSS = { width: 300, height: 340 };

// Animation FPS settings
const ANIM_FPS = {
    "idle": 5,
    "walk": 5,
    "attack": 12,
    "hurt": 12
};

// Game Settings
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

// Player configurations mapping player ID to their directories and animation profiles
const PLAYER_PROFILES = {
    "player1": { charName: "player/Player1", animFolder: "custom", animAction: "slash_128", frameCount: 6 },
    "player2": { charName: "player/Player2", animFolder: "custom", animAction: "slash_128", frameCount: 6 },
    "player3": { charName: "player/Player3", animFolder: "custom", animAction: "slash_128", frameCount: 6 },
    "player4": { charName: "player/Player4", animFolder: "standard", animAction: "slash", frameCount: 6 },
    "player5": { charName: "player/Player5", animFolder: "custom", animAction: "slash_oversize", frameCount: 6 },
    "player6": { charName: "player/Player6", animFolder: "custom", animAction: "slash_128", frameCount: 6 }
};

function getPlayerProfile() {
    const params = new URLSearchParams(window.location.search);
    const pVal = params.get("player") || params.get("character") || "player1";
    let key = pVal.trim().toLowerCase();
    
    // Support numeric values directly e.g. player=1, player=2
    if (key === "1") key = "player1";
    if (key === "2") key = "player2";
    if (key === "3") key = "player3";
    if (key === "4") key = "player4";
    if (key === "5") key = "player5";
    if (key === "6") key = "player6";
    
    return PLAYER_PROFILES[key] || PLAYER_PROFILES["player1"];
}

const activePlayerProfile = getPlayerProfile();

