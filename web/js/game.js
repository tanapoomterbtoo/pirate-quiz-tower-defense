class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.state = STATE_MAIN_MENU;
        this.lastTime = 0;
        
        // Background images
        this.bgSky = new Image();
        this.bgSky.src = `${IMG_PATH}/backgrounds/bg_sky.png`;
        
        this.bgIslands = new Image();
        this.bgIslands.src = `${IMG_PATH}/backgrounds/bg_islands.png`;
        
        this.bgDeck = new Image();
        this.bgDeck.src = `${IMG_PATH}/backgrounds/bg_deck.png`;
        
        // Load Audio Files
        this.audioBgm = new Audio(`${AUDIO_PATH}/bgm.wav`);
        this.audioBgm.loop = true;
        this.audioBgm.volume = VOL_BGM;
        
        this.sounds = {
            "hit": new Audio(`${AUDIO_PATH}/hit.wav`),
            "shoot": new Audio(`${AUDIO_PATH}/shoot.wav`),
            "wrong": new Audio(`${AUDIO_PATH}/wrong.wav`)
        };
        
        // Set volume for SFX
        for (let key in this.sounds) {
            this.sounds[key].volume = VOL_SFX;
        }

        // Enemy Sequence will be dynamically generated in resetGame
        this.enemySequence = [];

        // DOM elements cache
        this.menuOverlay = document.getElementById("menu-overlay");
        this.gameoverOverlay = document.getElementById("gameover-overlay");
        this.victoryOverlay = document.getElementById("victory-overlay");
        this.topHud = document.getElementById("top-hud");
        this.quizPanel = document.getElementById("quiz-panel");
        this.questionText = document.getElementById("question-text");
        this.btnMute = document.getElementById("btn-mute");
        this.muteWaves = document.getElementById("sound-waves");
        this.muteX = document.getElementById("mute-x");
        this.badgeDoubleDamage = document.getElementById("double-damage-badge");
        this.gameContainer = document.getElementById("game-container");
        this.isMuted = false;
        
        // Revive DOM elements cache
        this.reviveOverlay = document.getElementById("revive-overlay");
        this.btnUseRevive = document.getElementById("btn-use-revive");
        
        // Set up DOM references for inventory buttons
        this.itemButtons = {
            "Telescope": document.getElementById("item-telescope"),
            "Repair Kit": document.getElementById("item-repair"),
            "Cannonball": document.getElementById("item-cannonball")
        };

        // Display user score on the main menu
        const scoreDisplay = document.getElementById("user-score-display");
        if (scoreDisplay) {
            scoreDisplay.innerText = window.USER_SCORE !== undefined ? window.USER_SCORE : 100;
        }

        this.resetGame();
        
        // Start game loop animation
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    playSound(name) {
        if (this.isMuted) return; // Ignore sound effects when muted
        if (this.sounds[name]) {
            // Clone audio element to allow overlapping sound effects
            const clone = this.sounds[name].cloneNode();
            clone.volume = VOL_SFX;
            clone.play().catch(e => console.log("Sound play prevented: " + e));
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audioBgm.muted = this.isMuted;
        
        if (this.isMuted) {
            this.muteWaves.classList.add("hidden");
            this.muteX.classList.remove("hidden");
        } else {
            this.muteWaves.classList.remove("hidden");
            this.muteX.classList.add("hidden");
        }
    }

    resetGame() {
        this.player = new PiratePlayer(250, FLOOR_Y);
        this.playerHpBar = new HealthBar(175, 300, 150, 20); // y coordinates updated relative to player height dynamically in update
        
        this.currentQIdx = 0;
        this.wave = 1;
        
        this.questionPool = [...QUESTIONS];
        
        // Generate dynamic enemy sequence: 5 Easy and 5 Middle shuffled, with Boss at the end
        const activeTiers = [];
        for (let i = 0; i < 5; i++) {
            activeTiers.push("Easy");
            activeTiers.push("Middle");
        }
        this.shuffleArray(activeTiers);
        activeTiers.push("Boss");
        
        this.enemySequence = activeTiers;
        this.currentEnemyIdx = 0;
        
        // Allocate items based on USER_SCORE from previous system
        const score = window.USER_SCORE !== undefined ? window.USER_SCORE : 100;
        let telescopeCount = 0;
        let repairCount = 0;
        let cannonballCount = 0;
        let reviveCount = 0;
        
        if (score >= 80 && score <= 100) {
            telescopeCount = 2;
            repairCount = 2;
            cannonballCount = 1;
            reviveCount = 1;
        } else if (score >= 70) {
            telescopeCount = 1;
            repairCount = 1;
            cannonballCount = 1;
            reviveCount = 0;
        } else if (score > 60) {
            telescopeCount = 1;
            repairCount = 1;
            cannonballCount = 0;
            reviveCount = 0;
        } else {
            telescopeCount = 0;
            repairCount = 0;
            cannonballCount = 0;
            reviveCount = 0;
        }

        this.items = {
            "Telescope": { count: telescopeCount },
            "Repair Kit": { count: repairCount },
            "Cannonball": { count: cannonballCount },
            "Revive": { count: reviveCount }
        };
        this.doubleDamage = false;
        
        this.monster = null;
        this.monsterHpBar = new HealthBar(0, 0, 150, 20);
        
        this.combatState = "idle";
        this.pendingDmg = 0;
        this.hitApplied = false;
        
        this.particles = [];
        this.dmgTexts = [];
        this.screenShake = 0.0;
        this.bossWarningTriggered = false;
        this.answersLog = [];
        
        // Hide revive overlay if showing
        if (this.reviveOverlay) {
            this.reviveOverlay.classList.add("hidden");
        }
        
        // Reset inventory UI states
        this.updateItemUI();
        
        this.spawnEnemy();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    startGame() {
        this.state = STATE_PLAYING;
        this.menuOverlay.classList.add("hidden");
        this.topHud.classList.remove("hidden");
        this.quizPanel.classList.remove("hidden");
        
        // Play BGM after user click gesture (prevents browser autoplay block)
        this.audioBgm.play().catch(e => console.log("BGM playback prevented: " + e));
        
        this.loadQuestion();
    }

    restartGame() {
        this.resetGame();
        this.state = STATE_PLAYING;
        
        this.gameoverOverlay.classList.add("hidden");
        this.victoryOverlay.classList.add("hidden");
        this.topHud.classList.remove("hidden");
        this.quizPanel.classList.remove("hidden");
        
        this.loadQuestion();
    }

    getMonsterSet() {
        let mSet = window.MONSTER_SET || "Monster_Set1";
        if (mSet === "mixed") {
            const sets = ["Monster_Set1", "Monster_Set2", "Monster_Set3"];
            mSet = sets[Math.floor(Math.random() * sets.length)];
        }
        return mSet;
    }

    triggerBossWarning() {
        const warningEl = document.getElementById("boss-warning-overlay");
        if (warningEl) {
            warningEl.classList.remove("hidden");
            this.playSound("wrong");
            this.screenShake = 15.0;
            this.spawnParticles({ x: WIDTH / 2, y: HEIGHT / 2 }, 40, "#ff3b30");
            
            // Play pulsing siren sounds
            let flashCount = 0;
            const flashInterval = setInterval(() => {
                this.screenShake = 8.0;
                this.playSound("shoot");
                flashCount++;
                if (flashCount >= 4) clearInterval(flashInterval);
            }, 600);

            setTimeout(() => {
                warningEl.classList.add("hidden");
            }, 3000);
        }
    }

    spawnEnemy() {
        if (this.currentQIdx >= 25) {
            this.monster = new Monster(1000, FLOOR_Y, this.getMonsterSet(), "Boss");
            this.monsterHpBar.currentHp = null;
            return;
        }

        if (this.currentEnemyIdx >= this.enemySequence.length) {
            this.monster = new Monster(1000, FLOOR_Y, this.getMonsterSet(), "Easy");
            this.monsterHpBar.currentHp = null;
            return;
        }
        
        const tier = this.enemySequence[this.currentEnemyIdx];
        this.currentEnemyIdx += 1;
        
        this.monster = new Monster(1000, FLOOR_Y, this.getMonsterSet(), tier);
        this.monsterHpBar.currentHp = null;
    }

    loadQuestion() {
        if (this.currentQIdx >= this.questionPool.length) {
            this.state = STATE_VICTORY;
            this.victoryOverlay.classList.remove("hidden");
            this.topHud.classList.add("hidden");
            this.quizPanel.classList.add("hidden");
            
            // Show submit/redirect button if callback_url is set
            const btnSubmit = document.getElementById("btn-submit-victory");
            if (btnSubmit && window.CALLBACK_URL) {
                btnSubmit.classList.remove("hidden");
            }
            return;
        }

        // Force spawn the boss for the final 5 questions!
        if (this.currentQIdx >= 25 && this.monster && this.monster.tier !== "Boss") {
            this.monster = new Monster(1000, FLOOR_Y, this.getMonsterSet(), "Boss");
            this.monsterHpBar.currentHp = null;
        }

        if (this.currentQIdx >= 25 && !this.bossWarningTriggered) {
            this.bossWarningTriggered = true;
            this.triggerBossWarning();
        }

        this.wave = Math.floor(this.currentQIdx / 10) + 1;

        const qData = this.questionPool[this.currentQIdx];
        this.currentQText = qData.q;
        this.correctAns = qData.c[qData.a];

        this.questionText.innerText = this.currentQText;

        // Render answers onto HTML buttons
        for (let i = 0; i < 4; i++) {
            const btn = document.getElementById(`choice-${i}`);
            btn.innerText = qData.c[i];
            btn.disabled = false;
            btn.classList.remove("correct", "wrong");
        }

        // Show double damage indicator
        if (this.doubleDamage) {
            this.badgeDoubleDamage.classList.remove("hidden");
        } else {
            this.badgeDoubleDamage.classList.add("hidden");
        }
    }

    spawnParticles(pos, count, color, type = "normal") {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(pos.x, pos.y, color, type));
        }
    }

    updateItemUI() {
        if (!this.items) return;
        
        const telescopeNameEl = this.itemButtons["Telescope"].querySelector(".item-name");
        const repairNameEl = this.itemButtons["Repair Kit"].querySelector(".item-name");
        const cannonballNameEl = this.itemButtons["Cannonball"].querySelector(".item-name");
        
        if (telescopeNameEl) telescopeNameEl.innerText = `กล้องส่องทางไกล (${this.items["Telescope"].count})`;
        if (repairNameEl) repairNameEl.innerText = `กล่องพยาบาล (${this.items["Repair Kit"].count})`;
        if (cannonballNameEl) cannonballNameEl.innerText = `กระสุนปืนใหญ่ (${this.items["Cannonball"].count})`;
        
        this.itemButtons["Telescope"].disabled = (this.items["Telescope"].count <= 0);
        this.itemButtons["Repair Kit"].disabled = (this.items["Repair Kit"].count <= 0);
        this.itemButtons["Cannonball"].disabled = (this.items["Cannonball"].count <= 0);
        
        if (this.btnUseRevive) {
            this.btnUseRevive.innerText = `ชุบชีวิต (เหลืออีก ${this.items["Revive"].count})`;
            this.btnUseRevive.disabled = (this.items["Revive"].count <= 0);
        }
    }

    useItem(name) {
        if (this.state !== STATE_PLAYING || this.combatState !== "idle") return;
        if (this.items[name].count <= 0) return;

        const btn = this.itemButtons[name];
        
        if (name === "Telescope") {
            const choices = [0, 1, 2, 3];
            const qData = this.questionPool[this.currentQIdx];
            const wrongIndices = choices.filter(idx => qData.c[idx] !== this.correctAns);
            
            const activeWrongIndices = wrongIndices.filter(idx => {
                const choiceBtn = document.getElementById(`choice-${idx}`);
                return choiceBtn && !choiceBtn.disabled;
            });
            
            this.shuffleArray(activeWrongIndices);
            const toDisable = activeWrongIndices.slice(0, 2);
            toDisable.forEach(idx => {
                const choiceBtn = document.getElementById(`choice-${idx}`);
                if (choiceBtn) choiceBtn.disabled = true;
            });
            
            this.items["Telescope"].count -= 1;
            this.updateItemUI();
        } 
        else if (name === "Repair Kit") {
            const healAmount = 30;
            const prevHp = this.player.hp;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
            const actualHealed = this.player.hp - prevHp;
            
            if (actualHealed > 0) {
                this.dmgTexts.push(new DamageText(this.player.xFloat, this.player.yFloat - 80, -actualHealed, "#4cd964"));
                this.spawnParticles({ x: this.player.xFloat, y: this.player.yFloat + 40 }, 30, "#4cd964", "heal");
            }
            
            this.items["Repair Kit"].count -= 1;
            this.updateItemUI();
        } 
        else if (name === "Cannonball") {
            this.doubleDamage = true;
            this.badgeDoubleDamage.classList.remove("hidden");
            this.items["Cannonball"].count -= 1;
            this.updateItemUI();
        }
    }

    useRevive() {
        if (this.items["Revive"].count <= 0) return;
        
        this.items["Revive"].count -= 1;
        this.player.hp = this.player.maxHp;
        
        this.dmgTexts.push(new DamageText(this.player.xFloat, this.player.yFloat - 80, -this.player.maxHp, "#4cd964"));
        this.spawnParticles({ x: this.player.xFloat, y: this.player.yFloat }, 50, "#4cd964");
        this.playSound("hit");
        
        this.reviveOverlay.classList.add("hidden");
        this.topHud.classList.remove("hidden");
        this.quizPanel.classList.remove("hidden");
        
        this.currentQIdx += 1;
        this.combatState = "idle";
        this.loadQuestion();
    }

    declineRevive() {
        this.reviveOverlay.classList.add("hidden");
        this.state = STATE_GAME_OVER;
        this.gameoverOverlay.classList.remove("hidden");
        this.topHud.classList.add("hidden");
        this.quizPanel.classList.add("hidden");
    }



    selectChoice(choiceIdx) {
        if (this.state !== STATE_PLAYING || this.combatState !== "idle") return;

        // Log the answer choice index selected by the student
        if (this.answersLog) {
            this.answersLog.push(choiceIdx);
        }

        const qData = this.questionPool[this.currentQIdx];
        const selectedText = qData.c[choiceIdx];
        const selectedBtn = document.getElementById(`choice-${choiceIdx}`);

        // Disable all choices during animation
        for (let i = 0; i < 4; i++) {
            document.getElementById(`choice-${i}`).disabled = true;
        }

        if (selectedText === this.correctAns) {
            selectedBtn.classList.add("correct");
            this.playSound("shoot");
            
            // Set double damage hit flag
            this.hitIsDouble = this.doubleDamage;
            
            this.pendingDmg = PLAYER_BASE_DMG * (this.doubleDamage ? 2 : 1);
            this.doubleDamage = false;
            this.badgeDoubleDamage.classList.add("hidden");
            
            this.player.triggerAttack();
            this.combatState = "player_attack";
            this.hitApplied = false;
            
            // Hide UI panel and mute button during player attack
            this.quizPanel.classList.add("hidden");
            this.btnMute.classList.add("hidden");
        } else {
            selectedBtn.classList.add("wrong");
            // Highlight the correct one
            for (let i = 0; i < 4; i++) {
                if (qData.c[i] === this.correctAns) {
                    document.getElementById(`choice-${i}`).classList.add("correct");
                }
            }
            
            this.playSound("wrong");
            
            // Monster deals damage
            const dmgMap = { "small": 10, "big": 20, "boss": 30 };
            this.pendingDmg = dmgMap[this.monster.mType] || 10;
            
            this.monster.triggerAttack();
            this.combatState = "monster_attack";
            this.hitApplied = false;
            
            // Hide UI panel and mute button during monster attack
            this.quizPanel.classList.add("hidden");
            this.btnMute.classList.add("hidden");
        }
    }

    update(dt) {
        // Character updates
        this.player.update(dt);
        this.monster.update(dt);
        
        // Particle updates
        this.particles.forEach(p => p.update(dt));
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Damage texts updates
        this.dmgTexts.forEach(t => t.update(dt));
        this.dmgTexts = this.dmgTexts.filter(t => t.alpha > 0);
        
        // Screen shake decay
        if (this.screenShake > 0) {
            this.screenShake -= 20.0 * dt;
            if (this.screenShake < 0) this.screenShake = 0;
            
            // Apply screen shake to game container element using CSS
            if (this.screenShake > 0) {
                this.gameContainer.classList.add("screen-shake");
            } else {
                this.gameContainer.classList.remove("screen-shake");
            }
        } else {
            this.gameContainer.classList.remove("screen-shake");
        }

        // Align Health Bar coordinates dynamically
        // Player HP Bar sits slightly above player bounding box
        const pScale = Math.min(SIZE_PLAYER.height / 64, SIZE_PLAYER.width / 64);
        const pDrawH = 64 * pScale;
        this.playerHpBar.x = this.player.xFloat - 75;
        this.playerHpBar.y = this.player.yFloat - (pDrawH / 2) - 40;

        // Monster HP Bar sits slightly above monster bounding box
        const monsterSize = this.monster.mType === "boss" ? SIZE_MONSTER_BOSS : 
                            (this.monster.mType === "big" ? SIZE_MONSTER_BIG : SIZE_MONSTER_SMALL);
        const mScale = Math.min(monsterSize.height / 64, monsterSize.width / 64);
        const mDrawH = 64 * mScale;
        this.monsterHpBar.x = this.monster.xFloat - 75;
        this.monsterHpBar.y = this.monster.yFloat - (mDrawH / 2) - 40;

        // Combat Animation State Machine
        if (this.combatState === "player_attack") {
            // Apply hit impact when player weapon triggers swing mid-point
            if (this.player.hitTriggered && !this.hitApplied) {
                this.playSound("hit");
                this.monster.triggerHurt();
                
                if (this.hitIsDouble) {
                    this.spawnParticles({ x: this.monster.xFloat, y: this.monster.yFloat }, 45, null, "fire");
                    this.screenShake = 15.0; // stronger shake for double damage!
                } else {
                    this.spawnParticles({ x: this.monster.xFloat, y: this.monster.yFloat }, 20, "#ff8c00", "normal");
                }
                
                this.monster.hp -= this.pendingDmg;
                this.dmgTexts.push(new DamageText(this.monster.xFloat, this.monster.yFloat - 60, this.pendingDmg, "#ffd700"));
                
                this.hitApplied = true;
            }
            
            if (this.player.actionFinished) {
                if (this.monster.hp <= 0) {
                    this.spawnParticles({ x: this.monster.xFloat, y: this.monster.yFloat }, 50, "#ff0000");
                    this.spawnEnemy();
                }
                this.currentQIdx += 1;
                this.loadQuestion();
                this.combatState = "idle";
                
                // Restore UI panel and mute button
                this.quizPanel.classList.remove("hidden");
                this.btnMute.classList.remove("hidden");
            }
        } 
        else if (this.combatState === "monster_attack") {
            // Apply hit impact when monster weapon triggers swing mid-point
            if (this.monster.hitTriggered && !this.hitApplied) {
                this.playSound("hit");
                this.player.triggerHurt();
                
                this.screenShake = this.monster.mType === "boss" ? 10.0 : 5.0;
                this.spawnParticles({ x: this.player.xFloat, y: this.player.yFloat }, 20, "#ff0000");
                
                this.player.hp -= this.pendingDmg;
                this.dmgTexts.push(new DamageText(this.player.xFloat, this.player.yFloat - 60, this.pendingDmg, "#ff3b30"));
                
                this.hitApplied = true;
            }
            
            // End monster attack phase
            if (this.monster.actionFinished) {
                if (this.player.hp <= 0) {
                    if (this.items["Revive"] && this.items["Revive"].count > 0) {
                        this.reviveOverlay.classList.remove("hidden");
                        this.topHud.classList.add("hidden");
                        this.quizPanel.classList.add("hidden");
                    } else {
                        this.state = STATE_GAME_OVER;
                        this.gameoverOverlay.classList.remove("hidden");
                        this.topHud.classList.add("hidden");
                        this.quizPanel.classList.add("hidden");
                        
                        // Show submit/redirect button if callback_url is set
                        const btnSubmit = document.getElementById("btn-submit-gameover");
                        if (btnSubmit && window.CALLBACK_URL) {
                            btnSubmit.classList.remove("hidden");
                        }
                    }
                } else {
                    // Progress to the next question (skip the wrong one)
                    this.currentQIdx += 1;
                    this.combatState = "idle";
                    this.loadQuestion();
                    
                    // Restore UI panel and mute button
                    this.quizPanel.classList.remove("hidden");
                    this.btnMute.classList.remove("hidden");
                }
            }
        }
    }

    drawParallaxBackground() {
        const timeMs = Date.now();
        const shakeX = (Math.random() - 0.5) * this.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * this.screenShake * 2;

        const baseX = 0;
        const baseY = -10;

        // Layer 1: Sky (Very slow movements)
        const skyX = baseX + Math.sin(timeMs / 4000.0) * 10 + shakeX;
        const skyY = baseY + Math.cos(timeMs / 5000.0) * 5 + shakeY;
        if (this.bgSky.complete && this.bgSky.naturalWidth > 0) {
            this.ctx.drawImage(this.bgSky, skyX, skyY, WIDTH, HEIGHT);
        }

        // Layer 2: Islands (Medium speed movements)
        const islX = baseX + Math.sin(timeMs / 3000.0) * 20 + shakeX;
        const islY = baseY + Math.cos(timeMs / 4000.0) * 10 + shakeY;
        if (this.bgIslands.complete && this.bgIslands.naturalWidth > 0) {
            this.ctx.drawImage(this.bgIslands, islX, islY, WIDTH, HEIGHT);
        }

        // Layer 3: Ship Deck (Static floor, only movements on screen shake)
        const deckX = baseX + shakeX;
        const deckY = baseY + shakeY + 20; // 20px Y offset to align deck floor correctly
        if (this.bgDeck.complete && this.bgDeck.naturalWidth > 0) {
            this.ctx.drawImage(this.bgDeck, deckX, deckY, WIDTH, HEIGHT);
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        
        // 1. Draw Environment background
        this.drawParallaxBackground();
        
        if (this.state === STATE_PLAYING) {
            // Draw Wave & Question text centered at the top of the canvas (matching Python version)
            this.ctx.save();
            this.ctx.font = "bold 32px 'Cinzel', serif";
            this.ctx.fillStyle = "#ffffff";
            this.ctx.textAlign = "center";
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            const subjName = window.SUBJECT_NAME || "คณิตศาสตร์";
            this.ctx.fillText(`วิชา: ${subjName}   คำถามที่: ${this.currentQIdx + 1}/30`, WIDTH / 2, 45);
            this.ctx.restore();

            // 2. Draw Characters
            this.player.draw(this.ctx);
            this.monster.draw(this.ctx);
            
            // 3. Draw HP Bars
            this.playerHpBar.draw(this.ctx, this.player.hp, this.player.maxHp, 0.016);
            this.monsterHpBar.draw(this.ctx, this.monster.hp, this.monster.maxHp, 0.016);
            
            // 4. Draw combat particles
            this.particles.forEach(p => p.draw(this.ctx));
            
            // 5. Draw flying damage popups
            this.dmgTexts.forEach(t => t.draw(this.ctx));
        }
    }

    gameLoop(time) {
        // Calculate delta time in seconds
        let dt = (time - this.lastTime) / 1000.0;
        this.lastTime = time;
        
        // Cap dt to prevent huge step jumps (e.g. background tab suspension)
        if (dt > 0.1) dt = 0.1;
        
        if (this.state === STATE_PLAYING) {
            this.update(dt);
        }
        
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    submitExamResults() {
        const callbackUrl = window.CALLBACK_URL;
        if (!callbackUrl) {
            alert("ไม่พบลิงก์ส่งผลสอบกลับระบบหลัก");
            return;
        }
        
        // Calculate correct answers count
        let correctCount = 0;
        this.answersLog.forEach((ans, idx) => {
            const qData = this.questionPool[idx];
            if (qData && ans === qData.a) {
                correctCount++;
            }
        });

        let redirectTarget;
        try {
            redirectTarget = new URL(callbackUrl, window.location.origin);
        } catch(e) {
            console.error("Invalid callback URL", e);
            alert("ลิงก์ส่งผลสอบกลับระบบหลักไม่ถูกต้อง");
            return;
        }

        redirectTarget.searchParams.set("student_id", window.STUDENT_ID);
        redirectTarget.searchParams.set("token", window.EXAM_TOKEN);
        redirectTarget.searchParams.set("score", correctCount);
        redirectTarget.searchParams.set("answers", JSON.stringify(this.answersLog));
        redirectTarget.searchParams.set("status", this.state === STATE_VICTORY ? "victory" : "gameover");

        window.location.href = redirectTarget.toString();
    }
}

// Global functions linked to HTML click handlers
let gameInstance = null;

async function initWebGame() {
    await initQuestions();
    gameInstance = new Game();
}

function startGame() {
    if (gameInstance) gameInstance.startGame();
}

function restartGame() {
    if (gameInstance) gameInstance.restartGame();
}

function selectChoice(idx) {
    if (gameInstance) gameInstance.selectChoice(idx);
}

function useItem(name) {
    if (gameInstance) gameInstance.useItem(name);
}



function toggleMute() {
    if (gameInstance) gameInstance.toggleMute();
}

function useRevive() {
    if (gameInstance) gameInstance.useRevive();
}

function declineRevive() {
    if (gameInstance) gameInstance.declineRevive();
}

function submitExamResults() {
    if (gameInstance) gameInstance.submitExamResults();
}

// Run initializer on window load
window.addEventListener("load", initWebGame);
