class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.state = STATE_MAIN_MENU;
        this.lastTime = 0;
        
        // Parse subject and scene/sean parameters to load matching backgrounds
        const urlParams = new URLSearchParams(window.location.search);
        
        // Subject to deck mapping
        const sub = urlParams.get("subject") || "math";
        const normSub = sub.trim().toLowerCase();
        let deckFile = "bg_deck_Math.png";
        if (normSub === "science" || normSub === "วิทยาศาสตร์") {
            deckFile = "bg_deck_Sci.png";
        } else if (normSub === "thai" || normSub === "ภาษาไทย") {
            deckFile = "bg_deck_Thailang.png";
        }
        
        // Scene to sky mapping (supporting both 'scene' and 'sean')
        const scene = urlParams.get("scene") || urlParams.get("sean") || "morning";
        const normScene = scene.trim().toLowerCase();
        let skyFile = "bg_sky_Morning.png";
        if (normScene === "evening" || normScene === "เย็น") {
            skyFile = "bg_sky_Evening.png";
        } else if (normScene === "night" || normScene === "กลางคืน" || normScene === "ค่ำ") {
            skyFile = "bg_sky_night.png";
        }

        // Background images
        this.bgSky = new Image();
        this.bgSky.src = `${IMG_PATH}/backgrounds/${skyFile}`;
        
        this.bgIslands = new Image();
        this.bgIslands.src = `${IMG_PATH}/backgrounds/bg_islands.png`;
        
        this.bgDeck = new Image();
        this.bgDeck.src = `${IMG_PATH}/backgrounds/${deckFile}`;
        
        // Load Audio Files
        this.audioBgm = new Audio(`${AUDIO_PATH}/bgm.mp3`);
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
        this.lastSeenScenario = "";
        
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
        
        if (score >= 80) {
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

        // Resolve scenario from system registry (scenarioId) or legacy embedded text
        const resolved = (typeof resolveScenarioForQuestion === "function")
            ? resolveScenarioForQuestion(qData)
            : { scenario: "", question: qData.q || "", scenarioKey: "" };
        const scenario = resolved.scenario || "";
        const question = resolved.question || qData.q || "";
        const scenarioKey = resolved.scenarioKey || scenario;

        // Handle question image display
        // - showImg: true  → show immediately
        // - otherwise hide behind toggle button
        // - if question HTML already has an <img>, skip the separate container to avoid double display
        const imgContainer = document.getElementById("question-img-container");
        const imgEl = document.getElementById("question-img");
        const btnToggleImg = document.getElementById("btn-toggle-img");
        const hasInlineQuestionImg = /<img\s/i.test(question);
        if (imgContainer && imgEl) {
            if (qData.img && qData.img.trim() !== "" && !hasInlineQuestionImg) {
                imgEl.src = qData.img;
                const showNow = qData.showImg === true || qData.showImg === "true";
                if (showNow) {
                    imgEl.classList.remove("hidden");
                    imgContainer.classList.remove("hidden");
                    if (btnToggleImg) {
                        btnToggleImg.classList.add("hidden");
                    }
                } else {
                    imgEl.classList.add("hidden");
                    imgContainer.classList.remove("hidden");
                    if (btnToggleImg) {
                        btnToggleImg.classList.remove("hidden");
                        btnToggleImg.innerText = "🖼️ แสดงภาพประกอบ";
                    }
                }
            } else {
                imgContainer.classList.add("hidden");
                imgEl.src = "";
                if (btnToggleImg) btnToggleImg.classList.remove("hidden");
            }
        }

        this.currentScenario = scenario;
        this.currentScenarioKey = scenarioKey;
        const btnScenario = document.getElementById("btn-open-scenario");
        if (btnScenario) {
            if (scenario) {
                btnScenario.classList.remove("hidden");
                // Auto-open only when enabled (localStorage) and scenario is new
                const autoOpen = isAutoScenarioEnabled();
                if (autoOpen && this.lastSeenScenario !== scenarioKey) {
                    this.lastSeenScenario = scenarioKey;
                    setTimeout(() => {
                        if (typeof openScenarioOverlay === "function") {
                            openScenarioOverlay();
                        }
                    }, 100);
                } else if (!autoOpen) {
                    // Still mark as seen so flipping auto-open later mid-run does not spam
                    this.lastSeenScenario = scenarioKey;
                }
            } else {
                btnScenario.classList.add("hidden");
                this.lastSeenScenario = "";
            }
        }

        // Render question text as HTML to support tables (do not inject <br> inside tags)
        this.questionText.innerHTML = (typeof formatHtmlPreserveTags === "function")
            ? formatHtmlPreserveTags(question)
            : String(question || "").replace(/>\s+</g, "><").replace(/\n/g, "<br>");
        // Enable zoom popup for images inside the question stem only
        if (typeof bindZoomableQuestionImages === "function") {
            bindZoomableQuestionImages(this.questionText);
        }

        // Reset scroll position of the question box
        const quizBox = document.querySelector(".quiz-box");
        if (quizBox) {
            quizBox.scrollTop = 0;
        }

        // Render answers onto HTML buttons and detect if we need a 1-column layout
        let isLongChoice = false;
        const grid = document.querySelector(".choices-grid");
        
        for (let i = 0; i < 4; i++) {
            const btn = document.getElementById(`choice-${i}`);
            const choiceHtml = qData.c[i] || "";
            btn.innerHTML = choiceHtml;
            btn.disabled = false;
            btn.classList.remove("correct", "wrong");
            // Answer-choice images must NOT open the zoom popup
            if (typeof disableZoomOnChoiceImages === "function") {
                disableZoomOnChoiceImages(btn);
            }
            
            // Long / multi-line answers (e.g. math Q3 with <br>) use 1-column so text is not clipped
            const plainLen = String(choiceHtml).replace(/<[^>]+>/g, "").length;
            if (plainLen > 35 || /<br\s*\/?>/i.test(choiceHtml) || /<table/i.test(choiceHtml) || /<img/i.test(choiceHtml)) {
                isLongChoice = true;
            }
        }

        if (grid) {
            if (isLongChoice) {
                grid.classList.add("long-choices");
            } else {
                grid.classList.remove("long-choices");
            }
        }

        // Apply split layout if question is very long or has images
        let isLongQuestion = false;
        if (question.length > 250 || (question.match(/<img/g) || []).length >= 1) {
            isLongQuestion = true;
        }

        const quizPanel = document.getElementById("quiz-panel");
        if (quizPanel) {
            if (isLongQuestion) {
                quizPanel.classList.add("split-layout");
            } else {
                quizPanel.classList.remove("split-layout");
            }
            // Roomier/denser layout when answers are multi-line (prevents ง being cut by frame)
            if (isLongChoice) {
                quizPanel.classList.add("has-long-choices");
            } else {
                quizPanel.classList.remove("has-long-choices");
            }
            // Always start scrolled to top for each question
            quizPanel.scrollTop = 0;
        }

        // Render equations using KaTeX if available
        if (window.renderMathInElement) {
            try {
                renderMathInElement(this.questionText, {
                    delims: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false}
                    ]
                });
                for (let i = 0; i < 4; i++) {
                    const btn = document.getElementById(`choice-${i}`);
                    renderMathInElement(btn, {
                        delims: [
                            {left: "$$", right: "$$", display: true},
                            {left: "$", right: "$", display: false}
                        ]
                    });
                }
            } catch (e) {
                console.warn("Math rendering failed", e);
            }
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

        const setCount = (badgeId, nameElText, count) => {
            const badge = document.getElementById(badgeId);
            if (badge) badge.textContent = String(count);
        };

        // Keep names clean; show quantity on the gold badge (compact HUD on mobile)
        const telescopeNameEl = this.itemButtons["Telescope"]?.querySelector(".item-name");
        const repairNameEl = this.itemButtons["Repair Kit"]?.querySelector(".item-name");
        const cannonballNameEl = this.itemButtons["Cannonball"]?.querySelector(".item-name");
        if (telescopeNameEl) telescopeNameEl.innerText = "กล้องส่องทางไกล";
        if (repairNameEl) repairNameEl.innerText = "กล่องพยาบาล";
        if (cannonballNameEl) cannonballNameEl.innerText = "กระสุนปืนใหญ่";

        setCount("count-telescope", null, this.items["Telescope"].count);
        setCount("count-repair", null, this.items["Repair Kit"].count);
        setCount("count-cannonball", null, this.items["Cannonball"].count);

        if (this.itemButtons["Telescope"]) {
            this.itemButtons["Telescope"].disabled = (this.items["Telescope"].count <= 0);
        }
        if (this.itemButtons["Repair Kit"]) {
            this.itemButtons["Repair Kit"].disabled = (this.items["Repair Kit"].count <= 0);
        }
        if (this.itemButtons["Cannonball"]) {
            this.itemButtons["Cannonball"].disabled = (this.items["Cannonball"].count <= 0);
        }

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
            const wrongIndices = choices.filter(idx => idx !== qData.a);
            
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
            
            if (prevHp >= this.player.maxHp) {
                // HP is full, don't consume the item
                return;
            }
            
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
            const actualHealed = this.player.hp - prevHp;
            
            if (actualHealed > 0) {
                this.dmgTexts.push(new DamageText(this.player.xFloat, this.player.yFloat - 80, -actualHealed, "#4cd964"));
                this.spawnParticles({ x: this.player.xFloat, y: this.player.yFloat + 40 }, 30, "#4cd964", "heal");
                this.items["Repair Kit"].count -= 1;
                this.updateItemUI();
            }
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
        
        // Show submit/redirect button if callback_url is set
        const btnSubmit = document.getElementById("btn-submit-gameover");
        if (btnSubmit && window.CALLBACK_URL) {
            btnSubmit.classList.remove("hidden");
        }
    }



    selectChoice(choiceIdx) {
        if (this.state !== STATE_PLAYING || this.combatState !== "idle") return;
        if (!this.questionPool || this.currentQIdx >= this.questionPool.length) return;

        const selectedBtn = document.getElementById(`choice-${choiceIdx}`);
        // Ignore clicks on disabled options (e.g. eliminated by Telescope)
        if (selectedBtn && selectedBtn.disabled) return;

        // Log the answer choice index selected by the student
        if (this.answersLog) {
            this.answersLog.push(choiceIdx);
        }

        const qData = this.questionPool[this.currentQIdx];

        // Disable all choices during animation
        for (let i = 0; i < 4; i++) {
            document.getElementById(`choice-${i}`).disabled = true;
        }

        if (choiceIdx === qData.a) {
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

            // Hide quiz during attack animation; keep mute reachable
            this.quizPanel.classList.add("hidden");
        } else {
            selectedBtn.classList.add("wrong");
            // Highlight the correct one
            for (let i = 0; i < 4; i++) {
                if (i === qData.a) {
                    document.getElementById(`choice-${i}`).classList.add("correct");
                }
            }
            
            // Keep double-damage buff until the next correct answer (do not waste Cannonball on a wrong answer)
            
            this.playSound("wrong");
            // Monster deals damage
            const dmgMap = { "small": 10, "big": 20, "boss": 30 };
            this.pendingDmg = dmgMap[this.monster.mType] || 10;
            
            this.monster.triggerAttack();
            this.combatState = "monster_attack";
            this.hitApplied = false;

            // Hide quiz during attack animation; keep mute reachable
            this.quizPanel.classList.add("hidden");
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

                // Restore quiz only if still playing (not victory / game over)
                if (this.state === STATE_PLAYING) {
                    this.quizPanel.classList.remove("hidden");
                }
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

                    if (this.state === STATE_PLAYING) {
                        this.quizPanel.classList.remove("hidden");
                    }
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
            this.ctx.font = "bold 32px " + FONT_HEADER;
            this.ctx.fillStyle = "#ffffff";
            this.ctx.textAlign = "center";
            this.ctx.shadowColor = "#000000";
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            const subjName = window.SUBJECT_NAME || "คณิตศาสตร์";
            const qNum = (typeof this.previewDisplayIndex === "number")
                ? this.previewDisplayIndex + 1
                : this.currentQIdx + 1;
            const qTotal = (typeof this.previewDisplayTotal === "number")
                ? this.previewDisplayTotal
                : this.questionPool.length;
            this.ctx.fillText(`วิชา: ${subjName}   คำถามที่: ${qNum}/${qTotal}`, WIDTH / 2, 45);
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

function isAdminPreviewMode() {
    try {
        return new URLSearchParams(window.location.search).get("adminPreview") === "1";
    } catch (e) {
        return false;
    }
}

/**
 * Apply a single question payload from Admin iframe (pixel-identical game UI).
 */
function applyAdminPreviewPayload(p) {
    if (!isAdminPreviewMode() || !gameInstance || !p) return;

    const PREVIEW_SCEN_ID = "__admin_preview_scenario__";
    const hasScen = !!(p.scenario && String(p.scenario).trim());

    // Register / clear temporary scenario used only for this preview frame
    if (typeof SCENARIOS_BY_ID === "object" && SCENARIOS_BY_ID) {
        if (hasScen) {
            SCENARIOS_BY_ID[PREVIEW_SCEN_ID] = {
                id: PREVIEW_SCEN_ID,
                title: "preview",
                body: p.scenario
            };
            window.SCENARIOS_BY_ID = SCENARIOS_BY_ID;
        } else if (SCENARIOS_BY_ID[PREVIEW_SCEN_ID]) {
            delete SCENARIOS_BY_ID[PREVIEW_SCEN_ID];
        }
    }

    const qObj = {
        q: p.question || "",
        c: Array.isArray(p.choices) ? p.choices.slice(0, 4) : ["", "", "", ""],
        a: (typeof p.answerIndex === "number" && p.answerIndex >= 0) ? p.answerIndex : 0,
        img: p.img || "",
        showImg: p.showImg === true || p.showImg === "true",
        scenarioId: hasScen ? PREVIEW_SCEN_ID : null
    };
    while (qObj.c.length < 4) qObj.c.push("");

    // Keep a long pool so combat/victory logic never ends the preview session
    QUESTIONS.length = 0;
    for (let i = 0; i < 40; i++) {
        QUESTIONS.push({
            q: qObj.q,
            c: qObj.c.slice(),
            a: qObj.a,
            img: qObj.img,
            showImg: qObj.showImg,
            scenarioId: qObj.scenarioId
        });
    }

    gameInstance.questionPool = QUESTIONS.map((q) => ({
        q: q.q,
        c: q.c.slice(),
        a: q.a,
        img: q.img,
        showImg: q.showImg,
        scenarioId: q.scenarioId
    }));
    gameInstance.currentQIdx = 0;
    gameInstance.combatState = "idle";
    gameInstance.state = STATE_PLAYING;
    gameInstance.doubleDamage = false;
    gameInstance.previewDisplayIndex = (typeof p.index === "number") ? p.index : 0;
    gameInstance.previewDisplayTotal = (typeof p.total === "number" && p.total > 0)
        ? p.total
        : QUESTIONS.length;

    // Scenario auto-open control
    if (p.forceOpenScenario && hasScen) {
        gameInstance.lastSeenScenario = "";
    } else {
        gameInstance.lastSeenScenario = hasScen ? PREVIEW_SCEN_ID : "";
    }

    // Ensure playing HUD visible
    if (gameInstance.menuOverlay) gameInstance.menuOverlay.classList.add("hidden");
    if (gameInstance.gameoverOverlay) gameInstance.gameoverOverlay.classList.add("hidden");
    if (gameInstance.victoryOverlay) gameInstance.victoryOverlay.classList.add("hidden");
    if (gameInstance.reviveOverlay) gameInstance.reviveOverlay.classList.add("hidden");
    if (gameInstance.topHud) gameInstance.topHud.classList.remove("hidden");
    if (gameInstance.quizPanel) gameInstance.quizPanel.classList.remove("hidden");

    // Load UI (may auto-open scenario only when lastSeen cleared + auto enabled)
    const prevAuto = (() => {
        try { return localStorage.getItem("autoScenario"); } catch (e) { return null; }
    })();
    if (p.forceOpenScenario) {
        try { localStorage.setItem("autoScenario", "1"); } catch (e) { /* ignore */ }
    } else {
        try { localStorage.setItem("autoScenario", "0"); } catch (e) { /* ignore */ }
    }

    gameInstance.loadQuestion();

    // Restore user's auto-scenario preference
    try {
        if (prevAuto === null) localStorage.removeItem("autoScenario");
        else localStorage.setItem("autoScenario", prevAuto);
    } catch (e) { /* ignore */ }

    if (p.forceOpenScenario && hasScen) {
        setTimeout(() => {
            if (typeof openScenarioOverlay === "function") openScenarioOverlay();
        }, 80);
    } else if (typeof closeScenarioOverlay === "function") {
        closeScenarioOverlay();
    }

    // Soft-highlight the correct answer for editors (does not start combat)
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`choice-${i}`);
        if (!btn) continue;
        btn.classList.toggle("correct", i === qObj.a);
        btn.classList.remove("wrong");
        btn.disabled = false;
    }

    if (gameInstance.quizPanel) gameInstance.quizPanel.scrollTop = 0;
}

async function initWebGame() {
    const btnStart = document.getElementById("btn-start");
    const adminPreview = isAdminPreviewMode();
    if (adminPreview) {
        document.documentElement.classList.add("admin-preview");
        document.body.classList.add("admin-preview-mode");
        document.documentElement.style.fontSize = "16px";
    }
    try {
        await initQuestions();
        if (!QUESTIONS || QUESTIONS.length === 0) {
            throw new Error("ไม่พบคำถามในระบบ");
        }
        
        // Preload heavy background and character images
        const assetsToPreload = [
            `${IMG_PATH}/backgrounds/bg_deck_Math.png`,
            `${IMG_PATH}/backgrounds/bg_sky_Morning.png`,
            `${IMG_PATH}/characters/player_idle.png`,
            `${IMG_PATH}/characters/kraken_idle.png`
        ];
        
        await Promise.all(assetsToPreload.map(src => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // Continue on error to avoid soft lock
                img.src = src;
            });
        }));
        
        gameInstance = new Game();
        if (btnStart) {
            btnStart.disabled = false;
            btnStart.innerText = "ออกเรือ & เริ่มเล่น";
        }
        // Soft warning if residual mock content slipped into the pool
        const mockCount = QUESTIONS.filter(q => (q.q || "").includes("Mock") || (q.q || "").includes("คำถามจำลอง")).length;
        if (mockCount > 0) {
            console.warn(`พบคำถามจำลอง ${mockCount} ข้อ — ควรอัปเดตไฟล์ข้อสอบก่อนใช้งานจริง`);
            const sub = document.querySelector(".game-subtitle");
            if (sub) {
                sub.insertAdjacentHTML(
                    "afterend",
                    `<p id="mock-warning" style="color:#ff8a80;margin:0.8rem 0 0;font-size:1rem;">⚠ ชุดข้อสอบนี้ยังมีคำถามจำลอง ${mockCount} ข้อ ควรอัปเดตก่อนสอบจริง</p>`
                );
            }
        }

        // Admin live preview: auto-enter playing UI (muted), wait for postMessage payloads
        if (adminPreview) {
            gameInstance.isMuted = true;
            if (gameInstance.audioBgm) gameInstance.audioBgm.muted = true;
            if (gameInstance.muteWaves) gameInstance.muteWaves.classList.add("hidden");
            if (gameInstance.muteX) gameInstance.muteX.classList.remove("hidden");
            gameInstance.startGame();
            // Stop BGM even if startGame tried to play
            try {
                gameInstance.audioBgm.pause();
                gameInstance.audioBgm.muted = true;
            } catch (e) { /* ignore */ }

            window.addEventListener("message", (e) => {
                if (!e.data || e.data.type !== "admin-preview-update") return;
                applyAdminPreviewPayload(e.data.payload || {});
            });
            try {
                window.parent && window.parent.postMessage({ type: "admin-preview-ready" }, "*");
            } catch (e) { /* ignore */ }
            // Retry handshake (parent may bind late)
            setTimeout(() => {
                try { window.parent && window.parent.postMessage({ type: "admin-preview-ready" }, "*"); } catch (e) {}
            }, 300);
        }
    } catch (e) {
        console.error(e);
        if (btnStart) {
            btnStart.disabled = true;
            btnStart.innerText = "โหลดคำถามไม่สำเร็จ";
        }
        if (!adminPreview) {
            alert("ไม่สามารถโหลดคำถามได้: " + (e.message || e));
        }
    }
}

function startGame() {
    if (!gameInstance) return;
    if (!QUESTIONS || QUESTIONS.length === 0) {
        alert("ยังไม่มีคำถามในระบบ");
        return;
    }
    gameInstance.startGame();
}

function restartGame() {
    if (gameInstance) gameInstance.restartGame();
}

function selectChoice(idx) {
    // In admin preview, only show selection highlight — no combat / question advance
    if (isAdminPreviewMode() && gameInstance) {
        for (let i = 0; i < 4; i++) {
            const btn = document.getElementById(`choice-${i}`);
            if (!btn) continue;
            btn.classList.remove("wrong");
            btn.classList.toggle("correct", i === idx || i === (gameInstance.questionPool[gameInstance.currentQIdx] || {}).a);
        }
        return;
    }
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

function openImageZoomModal(src) {
    const modal = document.getElementById("image-zoom-modal");
    const modalImg = document.getElementById("zoom-modal-img");
    if (!modal || !modalImg || !src) return;
    modalImg.src = src;
    modal.classList.add("active");
}

function zoomQuestionImage() {
    const imgEl = document.getElementById("question-img");
    if (imgEl && imgEl.src && !imgEl.classList.contains("hidden")) {
        openImageZoomModal(imgEl.src);
    }
}

/** Zoom any question/scenario image (not answer-choice images) */
function zoomQuestionImageFrom(el) {
    if (!el || !el.src) return;
    // Safety: never zoom images that live inside a choice button
    if (el.closest && el.closest(".btn-choice, .choices-grid, .mock-preview-btn-choice")) {
        return;
    }
    openImageZoomModal(el.src);
}

/**
 * Make every <img> inside a question/scenario container zoomable on click.
 * Skips anything nested under .btn-choice.
 */
function bindZoomableQuestionImages(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll("img").forEach((img) => {
        if (img.closest(".btn-choice, .choices-grid")) return;
        img.classList.add("zoomable-q-img");
        img.style.cursor = "zoom-in";
        // Prefer property handler so we don't stack multiple listeners on re-render
        img.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            zoomQuestionImageFrom(img);
        };
    });
}

/** Ensure answer images cannot open the zoom modal */
function disableZoomOnChoiceImages(rootEl) {
    if (!rootEl) return;
    rootEl.querySelectorAll("img").forEach((img) => {
        img.onclick = null;
        img.removeAttribute("onclick");
        img.style.cursor = "default";
        img.style.pointerEvents = "none";
    });
}

function closeZoomModal() {
    const modal = document.getElementById("image-zoom-modal");
    if (modal) {
        modal.classList.remove("active");
    }
}

function toggleQuestionImage() {
    const imgEl = document.getElementById("question-img");
    const btn = document.getElementById("btn-toggle-img");
    if (imgEl && btn) {
        const isHidden = imgEl.classList.toggle("hidden");
        btn.innerText = isHidden ? "🖼️ แสดงภาพประกอบ" : "🖼️ ซ่อนภาพประกอบ";
    }
}

const AUTO_SCENARIO_KEY = "autoScenario";

function isAutoScenarioEnabled() {
    try {
        // Default ON when key is missing
        return localStorage.getItem(AUTO_SCENARIO_KEY) !== "0";
    } catch (e) {
        return true;
    }
}

function setAutoScenarioEnabled(enabled) {
    try {
        localStorage.setItem(AUTO_SCENARIO_KEY, enabled ? "1" : "0");
    } catch (e) {
        /* ignore quota / private mode */
    }
}

function syncAutoScenarioCheckbox() {
    const chk = document.getElementById("chk-auto-scenario");
    if (chk) chk.checked = isAutoScenarioEnabled();
}

function onAutoScenarioToggle(el) {
    setAutoScenarioEnabled(!!(el && el.checked));
}

function onScenarioBackdropClick(event) {
    // Close only when clicking the dimmed backdrop, not the parchment
    if (event && event.target && event.target.id === "scenario-overlay") {
        closeScenarioOverlay();
    }
}

function openScenarioOverlay() {
    const overlay = document.getElementById("scenario-overlay");
    const content = document.getElementById("scroll-content");
    if (overlay && content && gameInstance && gameInstance.currentScenario) {
        content.innerHTML = (typeof formatHtmlPreserveTags === "function")
            ? formatHtmlPreserveTags(gameInstance.currentScenario)
            : String(gameInstance.currentScenario || "").replace(/>\s+</g, "><").replace(/\n/g, "<br>");
        overlay.classList.remove("hidden");
        syncAutoScenarioCheckbox();
        // Images inside scenario parchment should also zoom (not answer choices)
        bindZoomableQuestionImages(content);
        // Trigger KaTeX rendering inside the overlay if present
        if (window.renderMathInElement) {
            try {
                renderMathInElement(content, {
                    delims: [
                        {left: "$$", right: "$$", display: true},
                        {left: "$", right: "$", display: false}
                    ]
                });
            } catch (e) {
                console.warn("Math rendering error in overlay", e);
            }
        }
    }
}

function closeScenarioOverlay() {
    const overlay = document.getElementById("scenario-overlay");
    if (overlay) {
        overlay.classList.add("hidden");
    }
}

// Answer hotkeys: 1–4 / numpad 1–4 / A–D (when playing and not typing)
window.addEventListener("keydown", (e) => {
    if (!gameInstance || gameInstance.state !== STATE_PLAYING) return;
    if (gameInstance.combatState !== "idle") return;

    // Ignore when focus is in form fields
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || (e.target && e.target.isContentEditable)) {
        return;
    }

    // Escape closes scenario overlay
    if (e.code === "Escape") {
        const overlay = document.getElementById("scenario-overlay");
        if (overlay && !overlay.classList.contains("hidden")) {
            closeScenarioOverlay();
            e.preventDefault();
        }
        return;
    }

    // Do not answer while scenario is open
    const scenarioOpen = document.getElementById("scenario-overlay");
    if (scenarioOpen && !scenarioOpen.classList.contains("hidden")) return;

    const map = {
        Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3,
        Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3,
        KeyA: 0, KeyB: 1, KeyC: 2, KeyD: 3
    };
    if (e.code in map && typeof selectChoice === "function") {
        e.preventDefault();
        selectChoice(map[e.code]);
    }
});

// Dynamic root font size scaling for perfect responsiveness across computer & mobile screens
function resizeGame() {
    const container = document.getElementById("game-container");
    if (!container) return;
    const width = container.clientWidth;
    // Base design width is 1280px. Standard font size is 16px.
    // Scale font size proportionally: 16px * (width / 1280) = width / 80
    // We cap it at minimum 9.5px to keep text legible on ultra-small screens
    const baseFontSize = Math.max(9.5, width / 80);
    document.documentElement.style.fontSize = baseFontSize + "px";
}

/**
 * Ensure wheel / trackpad scrolls #quiz-panel even when the pointer is over
 * buttons or nested overflow:hidden choice cards (Q23 pies etc.).
 */
function bindQuizPanelScroll() {
    const panel = document.getElementById("quiz-panel");
    if (!panel || panel.dataset.scrollBound === "1") return;
    panel.dataset.scrollBound = "1";

    panel.addEventListener(
        "wheel",
        (e) => {
            if (panel.classList.contains("hidden")) return;
            const canScroll = panel.scrollHeight > panel.clientHeight + 1;
            if (!canScroll) return;

            const atTop = panel.scrollTop <= 0;
            const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
            // If nested element is trying to scroll, only take over when it can't
            let target = e.target;
            while (target && target !== panel) {
                if (target.scrollHeight > target.clientHeight + 1) {
                    const tTop = target.scrollTop <= 0;
                    const tBot = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
                    const goingDown = e.deltaY > 0;
                    if ((goingDown && !tBot) || (!goingDown && !tTop)) {
                        return; // let nested scroller handle it
                    }
                }
                target = target.parentElement;
            }

            const goingDown = e.deltaY > 0;
            if ((goingDown && atBottom) || (!goingDown && atTop)) {
                return;
            }
            panel.scrollTop += e.deltaY;
            e.preventDefault();
        },
        { passive: false }
    );
}

// Bind resize and load events
window.addEventListener("resize", resizeGame);
window.addEventListener("load", () => {
    resizeGame();
    bindQuizPanelScroll();
    initWebGame();
});
