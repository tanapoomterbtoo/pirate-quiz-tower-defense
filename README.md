# 🏴‍☠️ Pirate Quiz Tower Defense Game

A JRPG-style hybrid Trivia and Tower Defense game built using **Python/Pygame** and also available as a standalone **Web (HTML5/JS)** version. Players take on the role of a pirate ship commander, answering trivia questions to attack waves of enemies and defend their ship from oncoming attacks.

---

## 🎮 Game Overview

- **Theme:** Pirate & Naval Combat ⛵
- **Core Loop:** 
  - **Correct Answer:** Attacks the current monster.
  - **Incorrect Answer:** The monster attacks your ship.
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
- **Web Version:** Fully playable in any modern web browser without any installation required!

---

## 📁 Project Structure

Here is an overview of the codebase organization:

```text
├── main.py                          # Game entry point (Python/Pygame)
├── requirements.txt                 # Project dependencies list
├── Pirate Quiz Tower Defense Spec.md # Original Thai design specification
├── assets/                          # Game assets and data files
│   ├── audio/                       # Sound effects and BGM (bgm.wav, hit.wav, shoot.wav, wrong.wav)
│   ├── data/                        # Trivia database (questions.json)
│   └── images/                      # Character, background, and UI images
│       ├── backgrounds/             # Parallax layers (bg_sky, bg_islands, bg_deck)
│       ├── characters/              # Player and monster animated frames
│       └── ui/                      # Customizable UI assets
├── src/                             # Game source code (Python)
│   ├── __init__.py                  # Package initialization
│   ├── config.py                    # Constants, color palette, dimensions, FPS, and paths
│   ├── entities.py                  # Character and monster Sprite classes (LPC frame sheet animation loader)
│   ├── game_loop.py                 # Core Game class controlling state machines, events, and rendering
│   ├── quiz_data.py                 # Helper to load and shuffle the question dataset
│   └── ui.py                        # UI rendering elements (Buttons, Health bars, Damage text)
├── web/                             # Web version of the game (HTML5/JS)
│   ├── index.html                   # Web application entry point
│   ├── style.css                    # Web styles and layout
│   └── js/                          # Javascript logic (config, entities, game, quiz)
└── venv/                            # Python virtual environment (ignored)
```

---

## 🛠️ Requirements & Installation

This game can be played in two ways:

### Option A: Play the Web Version (Recommended & Easy)
Simply open `web/index.html` in any modern web browser, or serve it using a local server:
```bash
# Using Python to start a local server
python3 -m http.server 8000
# Then visit http://localhost:8000/web/ in your browser
```

### Option B: Run the Python/Pygame Version
This requires **Python 3.8+** and **Pygame**.

#### 1. Set Up Virtual Environment (Recommended)
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

#### 2. Install Dependencies
Install the required libraries listed in [requirements.txt](file:///Users/tanapoomrueangphaisan/Documents/game_kaow/requirements.txt):

```bash
pip install -r requirements.txt
```

#### 3. Run the Game
Execute the main script to start playing:

```bash
python main.py
```

---

## 🕹️ How to Play

1. **Start Screen:** Click anywhere on the menu overlay to begin.
2. **Answering Questions:** Click on one of the 4 choice buttons at the bottom.
3. **Using Items:** Click on the item buttons (Telescope, Repair Kit, or Cannonball) at the top-left to apply their effects immediately. Each item can be used **once** per game.
4. **Skipping Questions:** If you're stuck, click the **Skip** button at the top-right (maximum of 3 skips allowed).
5. **Winning/Losing:**
   - **Victory 🏆:** Defeat all waves and clear all questions.
   - **Game Over 💥:** Your ship HP drops to 0. Click anywhere to restart.

---

## 🔧 Game Configuration (Python)

You can customize the Python version settings by editing [src/config.py](file:///Users/tanapoomrueangphaisan/Documents/game_kaow/src/config.py):
* `WIDTH`, `HEIGHT`: Window resolution (Default: `1280x720`).
* `FPS`: Refresh rate (Default: `60`).
* `FLOOR_Y`: Vertical position of the floor/deck level (Default: `700`).
* `SHUFFLE_QUESTIONS`: Set to `True` or `False` to toggle question scrambling.
* `PLAYER_BASE_DMG`: Base damage dealt by the player (Default: `30`).
* `VOL_BGM` / `VOL_SFX`: Adjust audio volumes.

---

## ⚙️ Web Version Configuration & API Parameters

The Web version (`web/index.html`) can be customized and integrated with external systems using **URL parameters**. These parameters control the subject being tested, the monster set used, and the starting helper items given to the player.

### 1. Subject Parameter (`subject`)
Specifies the subject test and loads the corresponding questions and character sprites.
* **Math (คณิตศาสตร์):** `?subject=math` or `?subject=คณิตศาสตร์`
  * Loads: `math.json`
  * Monster Set: `Monster_Set1`
* **Science (วิทยาศาสตร์):** `?subject=science` or `?subject=วิทยาศาสตร์`
  * Loads: `science.json`
  * Monster Set: `Monster_Set2`
* **Thai Language (ภาษาไทย):** `?subject=thai` or `?subject=ภาษาไทย`
  * Loads: `thai.json`
  * Monster Set: `Monster_Set3`
* **Comprehensive Exam (สอบรวม):** `?subject=exam` or `?subject=สอบรวม` or `?subject=รวมวิชา`
  * Loads: `exam.json` (Mixed questions)
  * Monster Set: Randomly mixes sprites from `Monster_Set1`, `Monster_Set2`, and `Monster_Set3` for each spawn.

### 2. Prior Score Parameter (`score`)
Determines the helper items granted to the player at start based on their performance in the previous system.
* **Score 80 - 100:** Full inventory:
  * 🔭 Telescope (ตัดช้อย) x2
  * 🔧 Repair Kit (เพิ่มเลือด) x2
  * 💣 Heavy Cannonball (เพิ่มพลังโจมตี) x1
  * ✨ Revive (ชุบชีวิตเมื่อ HP = 0) x1
* **Score 70 - 79:** Reduced inventory (No Revive):
  * 🔭 Telescope x1
  * 🔧 Repair Kit x1
  * 💣 Heavy Cannonball x1
  * ✨ Revive x0
* **Score 61 - 69:** Minimal inventory (No Cannonball, No Revive):
  * 🔭 Telescope x1
  * 🔧 Repair Kit x1
  * 💣 Heavy Cannonball x0
  * ✨ Revive x0
* **Score 60 or below:** No inventory items:
  * All items set to 0. Buttons are disabled and grayed out.

*Default fallback: If no `score` is provided in the URL, it defaults to `100` (full items).*

---

## 👾 Custom Combat Mechanics (Web)

* **Wrong Answer Penalty:** Answering a question incorrectly results in taking damage and immediately skipping that question to load the next one.
* **Monster Hit Points:**
  * **Easy (Small):** 60 HP (takes 2 hits of 30 damage to die)
  * **Middle (Big):** 90 HP (takes 3 hits of 30 damage to die)
  * **Boss:** 150 HP (takes 5 hits of 30 damage to die). Appears automatically for the final 5 questions (questions 26 - 30).
* **Monster Spawning:** 5 Easy and 5 Middle monsters are shuffled and spawned randomly during the first 25 questions. The Boss always spawns for the final 5 questions.

