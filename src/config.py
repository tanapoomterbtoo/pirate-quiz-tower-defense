import os

WIDTH, HEIGHT = 1280, 720
FPS = 60

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
YELLOW = (255, 255, 0)
RED = (255, 0, 0)
CYAN = (0, 255, 255)
ORANGE = (255, 140, 0)
GRAY = (150, 150, 150)
DARK_GRAY = (80, 80, 80)
BG_COLOR = (20, 20, 40)

# Sprite Target Dimensions (High-Res bounding boxes)
SIZE_PLAYER = (210, 280)
SIZE_MONSTER_SMALL = (210, 280)
SIZE_MONSTER_BIG = (260, 320)
SIZE_MONSTER_BOSS = (380, 380)
SIZE_BG = (1280, 720)

# Animation FPS Settings
ANIM_FPS = {
    "idle": 5,      # ยืนหายใจช้าๆ
    "walk": 5,      # เดินปกติ
    "attack": 12,   # โจมตีเร็วและดุดัน (คล้ายกับตอนที่ตั้งไว้ 10-12 ก่อนหน้านี้)
    "hurt": 12       # โดนตีเด้งกลับ
}

# Game Settings
SHUFFLE_QUESTIONS = True
PLAYER_BASE_DMG = 30  # ดาเมจพื้นฐานที่ผู้เล่นทำได้

# States
MAIN_MENU = 0
PLAYING = 1
GAME_OVER = 2
VICTORY = 3

# Audio Volume (0.0 to 1.0)
VOL_BGM = 0.1  # ลดเสียง Background Music ให้เบาลง
VOL_SFX = 1.0  # เสียง Effect ต่างๆ

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
IMG_DIR = os.path.join(ASSETS_DIR, "images")
BG_DIR = os.path.join(IMG_DIR, "backgrounds")
UI_DIR = os.path.join(IMG_DIR, "ui")
CHAR_DIR = os.path.join(IMG_DIR, "characters")
DATA_DIR = os.path.join(ASSETS_DIR, "data")
AUDIO_DIR = os.path.join(ASSETS_DIR, "audio")
