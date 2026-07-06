# 🏴‍☠️ Pirate Quiz Tower Defense Game

A JRPG-style hybrid Trivia and Tower Defense game built using **Python** and **Pygame**. Players take on the role of a pirate ship commander, answering trivia questions to attack waves of enemies and defend their ship from oncoming attacks.

---

## 🎮 Game Overview

- **Theme:** Pirate & Naval Combat ⛵
- **Core Loop:** 
  - **Correct Answer:** Attacks the current monster.
  - **Incorrect Answer or Time's Up:** The monster attacks your ship.
- **Goal:** Survive 30 questions across **3 increasingly difficult waves**, defeating all small enemies, big enemies, and the Final Boss without your ship's health falling to 0!

---

## ✨ Features

- **Trivia Engine:** Loads 30 questions dynamically from [questions.json](file:///Users/tanapoomrueangphaisan/Documents/game_kaow/assets/data/questions.json).
- **Parallax Backgrounds:** Multi-layered horizontal parallax background (Sky, Islands, and Ship Deck) that reacts with JRPG-style screen shakes upon taking heavy damage.
- **Turn-based Combat State Machine:** Features full animated actions for attacks, hit/hurt states, JRPG knockback, and custom particle explosions.
- **Dynamic Damage Popups:** JRPG-style floating damage text with smooth scaling, outline, and fading.
- **Helper Items:**
  - **🔭 Telescope (ตัดตัวเลือก):** Removes 2 incorrect options from the current question.
  - **🔧 Repair Kit (ซ่อมแซมเรือ):** Instantly heals your ship's HP by +30 (up to a max of 100).
  - **💣 Heavy Cannonball (กระสุนเพลิง):** Causes the next correct answer to deal **double damage** (2x) to the enemy.
- **Skip System:** Allows skipping up to 3 questions per game.
- **Audio & Sound System:** Immersive pirate background music (BGM) and custom sound effects (SFX) for hits, gunshots, and wrong answers.

---

## 📁 Project Structure

Here is an overview of the codebase organization:

```text
├── main.py                          # Game entry point
├── requirements.txt                 # Project dependencies list
├── Pirate Quiz Tower Defense Spec.md # Original Thai design specification
├── assets/                          # Game assets and data files
│   ├── audio/                       # Sound effects and BGM (bgm.wav, hit.wav, shoot.wav, wrong.wav)
│   ├── data/                        # Trivia database (questions.json)
│   └── images/                      # Character, background, and UI images
│       ├── backgrounds/             # Parallax layers (bg_sky, bg_islands, bg_deck)
│       ├── characters/              # Player and monster animated frames
│       └── ui/                      # Customizable UI assets
├── src/                             # Game source code
│   ├── __init__.py                  # Package initialization
│   ├── config.py                    # Constants, color palette, dimensions, FPS, and paths
│   ├── entities.py                  # Character and monster Sprite classes (LPC frame sheet animation loader)
│   ├── game_loop.py                 # Core Game class controlling state machines, events, and rendering
│   ├── quiz_data.py                 # Helper to load and shuffle the question dataset
│   └── ui.py                        # UI rendering elements (Buttons, Health bars, Damage text)
└── venv/                            # Python virtual environment (ignored)
```

---

## 🛠️ Requirements & Installation

This game requires **Python 3.8+** and **Pygame**.

### 1. Set Up Virtual Environment (Recommended)
Navigate to the root directory and initialize the virtual environment:

```bash
# Create a virtual environment
python3 -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows (CMD)
# venv\Scripts\activate.bat

# Activate on Windows (PowerShell)
# .\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
Install the required libraries listed in [requirements.txt](file:///Users/tanapoomrueangphaisan/Documents/game_kaow/requirements.txt):

```bash
pip install -r requirements.txt
```

### 3. Run the Game
Execute the main script to start playing:

```bash
python main.py
```

---

## 🕹️ How to Play

1. **Start Screen:** Click anywhere on the menu overlay to begin.
2. **Answering Questions:** Click on one of the 4 choice buttons at the bottom.
   - You have a limited time (indicated by the timer above the question box). If the timer reaches 0, you automatically take damage from the enemy.
3. **Using Items:** Click on the item buttons (Telescope, Repair Kit, or Cannonball) at the top-left to apply their effects immediately. Each item can be used **once** per game.
4. **Skipping Questions:** If you're stuck, click the **Skip** button at the top-right (maximum of 3 skips allowed).
5. **Winning/Losing:**
   - **Victory 🏆:** Defeat all waves and clear all questions.
   - **Game Over 💥:** Your ship HP drops to 0. Click anywhere to restart.

---

## 🔧 Game Configuration

You can customize the game settings by editing [src/config.py](file:///Users/tanapoomrueangphaisan/Documents/game_kaow/src/config.py):
* `WIDTH`, `HEIGHT`: Window resolution (Default: `1280x720`).
* `FPS`: Refresh rate (Default: `60`).
* `SHUFFLE_QUESTIONS`: Set to `True` or `False` to toggle question scrambling.
* `PLAYER_BASE_DMG`: Base damage dealt by the player (Default: `30`).
* `VOL_BGM` / `VOL_SFX`: Adjust audio volumes.
