// Offscreen canvas for sprite color tinting (e.g. hurt red flash)
const tintCanvas = document.createElement("canvas");
const tintCtx = tintCanvas.getContext("2d");

// LPC Animation loader helper
function loadFrameImages(charName, folder, action, direction, count) {
    const frames = [];
    for (let i = 1; i <= count; i++) {
        const img = new Image();
        img.src = `${CHAR_PATH}/${charName}/${folder}/${action}/${direction}/${i}.png`;
        frames.push(img);
    }
    return frames;
}

// Utility to draw rounded rectangles
function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

// HealthBar UI component
class HealthBar {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.currentHp = null;
    }

    draw(ctx, hp, maxHp, dt) {
        if (this.currentHp === null) {
            this.currentHp = hp;
        }

        // Interpolate health bar changes smoothly
        if (this.currentHp > hp) {
            this.currentHp -= (this.currentHp - hp) * 5 * dt;
            if (this.currentHp < hp) this.currentHp = hp;
        } else if (this.currentHp < hp) {
            this.currentHp += (hp - this.currentHp) * 5 * dt;
            if (this.currentHp > hp) this.currentHp = hp;
        }

        const WOOD_COLOR = "#5c4033";
        const GOLD_COLOR = "#daa520";
        const INNER_BG = "#281414";

        ctx.save();
        const padX = 8;
        const padY = 8;

        // 1. Draw Wooden Backboard
        ctx.fillStyle = WOOD_COLOR;
        drawRoundRect(ctx, this.x - padX, this.y - padY, this.w + padX * 2, this.h + padY * 2, 4, true, false);

        // 2. Draw Gold Outer Border
        ctx.strokeStyle = GOLD_COLOR;
        ctx.lineWidth = 3;
        drawRoundRect(ctx, this.x - padX, this.y - padY, this.w + padX * 2, this.h + padY * 2, 4, false, true);

        // 3. Draw Iron Rivets
        ctx.fillStyle = "#323232";
        ctx.strokeStyle = "#141414";
        ctx.lineWidth = 1;
        const corners = [
            { x: this.x - padX + 5, y: this.y - padY + 5 },
            { x: this.x + this.w + padX - 5, y: this.y - padY + 5 },
            { x: this.x - padX + 5, y: this.y + this.h + padY - 5 },
            { x: this.x + this.w + padX - 5, y: this.y + this.h + padY - 5 }
        ];
        corners.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // 4. Draw Inner Background (Empty Bar)
        ctx.fillStyle = INNER_BG;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // 5. Draw Health Fill
        if (this.currentHp > 0) {
            const ratio = this.currentHp / maxHp;
            const fillW = this.w * ratio;
            const color = ratio > 0.5 ? "#32cd32" : (ratio > 0.25 ? "#ffd700" : "#dc143c");
            
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, fillW, this.h);

            // Gloss highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(this.x, this.y, fillW, this.h / 2);
        }

        // 6. Draw Inner Gold Border
        ctx.strokeStyle = GOLD_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.restore();
    }
}

// Particle Effect
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.floor(Math.random() * 5) + 4; // 4 to 8
        this.velX = (Math.random() - 0.5) * 500; // random speed x
        this.velY = Math.random() * -300 - 50; // upward launch
        this.life = Math.random() * 0.4 + 0.3; // 0.3 to 0.7 seconds
        this.maxLife = this.life;
    }

    update(dt) {
        this.velY += 500 * dt; // Gravity
        this.x += this.velX * dt;
        this.y += this.velY * dt;
        this.life -= dt;
    }

    draw(ctx) {
        if (this.life > 0) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life / this.maxLife;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }
}

// Damage Text Popups
class DamageText {
    constructor(x, y, amount, color = "#ff3b30") {
        const prefix = amount > 0 ? "-" : "+";
        this.text = `${prefix}${Math.abs(amount)}`;
        this.color = color;
        this.x = x;
        this.y = y;
        this.alpha = 1.0;
        this.scale = 2.0; // Start huge for JRPG pop effect
        this.timer = 0;
    }

    update(dt) {
        this.timer += dt;
        this.y -= 80 * dt; // Drift upwards
        
        if (this.scale > 1.0) {
            this.scale -= 5 * dt;
            if (this.scale < 1.0) this.scale = 1.0;
        } else {
            this.alpha -= 0.8 * dt; // Fade out
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.font = `bold ${Math.round(28 * this.scale)}px 'Outfit', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = this.alpha;

        // Draw black outline
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4 * this.scale;
        ctx.strokeText(this.text, this.x, this.y);

        // Draw filled text
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Animated LPC Entity base class
class AnimatedEntity {
    constructor(x, y, charName, maxSize) {
        this.charName = charName;
        this.maxSize = maxSize;

        // Calculate feet alignment offset based on LPC standards (28 pixels on 64px scale)
        const scale = Math.min(maxSize.width / 64, maxSize.height / 64);
        this.feetOffset = 28 * scale;

        this.baseX = x;
        this.baseY = y - this.feetOffset;
        this.xFloat = this.baseX;
        this.yFloat = this.baseY;

        this.actionPhase = "idle"; // idle, move_forward, slashing, move_back, hurt
        this.state = "idle";      // idle, walk, attack, hurt
        this.timer = 0;
        this.actionFinished = false;
        this.hitTriggered = false;

        this.frameIdx = 0;
        this.frameTimer = 0;

        // Load LPC frames configuration
        this.frames = {
            "idle": [],
            "walk": [],
            "attack": [],
            "hurt": []
        };
        this.loadAnimations();
    }

    loadAnimations() {
        const isPlayer = (this.charName === "player");
        const facing = isPlayer ? "right" : "left";

        // Load Idle & Walk sequences
        this.frames["idle"] = loadFrameImages(this.charName, "standard", "idle", facing, 2);
        this.frames["walk"] = loadFrameImages(this.charName, "standard", "walk", facing, 9);
        this.frames["hurt"] = loadFrameImages(this.charName, "standard", "hurt", "up", 6);

        // Load Attacks based on character type
        if (isPlayer) {
            this.frames["attack"] = loadFrameImages("player", "custom", "tool_whip", "right", 8);
        } else {
            if (this.charName === "small") {
                this.frames["attack"] = loadFrameImages("small", "custom", "slash_128", "left", 6);
            } else if (this.charName === "big") {
                this.frames["attack"] = loadFrameImages("big", "custom", "slash_128", "left", 6);
            } else if (this.charName === "boss") {
                this.frames["attack"] = loadFrameImages("boss", "custom", "slash_oversize", "left", 6);
            }
        }
    }

    triggerAttack() {
        this.actionPhase = "move_forward";
        this.state = "walk";
        this.timer = 0;
        this.frameIdx = 0;
        this.frameTimer = 0;
        this.actionFinished = false;
        this.hitTriggered = false;
    }

    triggerHurt() {
        this.actionPhase = "hurt";
        this.state = "hurt";
        this.timer = 0;
        this.frameIdx = 0;
        this.frameTimer = 0;
        this.actionFinished = false;
    }

    update(dt) {
        this.frameTimer += dt;
        
        // Fetch current anim fps setting
        const currentFps = ANIM_FPS[this.state] || 8;
        if (this.frameTimer >= 1.0 / currentFps) {
            this.frameTimer = 0;
            this.frameIdx++;
            
            // Check slash loop once
            if (this.actionPhase === "slashing" && this.frameIdx >= this.frames["attack"].length) {
                this.actionPhase = "move_back";
                this.state = "walk";
                this.frameIdx = 0;
            }
        }

        const animFrames = this.frames[this.state];
        if (animFrames.length > 0) {
            this.frameIdx = this.frameIdx % animFrames.length;
        }

        // Action Phase State Machine
        if (this.actionPhase === "idle") {
            this.state = "idle";
            const timeMs = Date.now();
            // Gentle breathing sway
            this.yFloat = this.baseY + Math.sin(timeMs / 400.0) * 2;
            this.xFloat = this.baseX;
        } 
        else if (this.actionPhase === "move_forward") {
            this.state = "walk";
            const dashDist = this.isPlayer ? 600.0 : -600.0;
            const speed = 1200.0 * dt;
            const targetX = this.baseX + dashDist;
            const dirX = targetX > this.xFloat ? 1 : -1;
            
            this.xFloat += speed * dirX;
            if ((dirX === 1 && this.xFloat >= targetX) || (dirX === -1 && this.xFloat <= targetX)) {
                this.xFloat = targetX;
                this.actionPhase = "slashing";
                this.state = "attack";
                this.frameIdx = 0;
            }
        } 
        else if (this.actionPhase === "slashing") {
            this.state = "attack";
            const attackFrames = this.frames["attack"].length;
            const impactFrame = Math.floor(attackFrames / 2);
            if (this.frameIdx === impactFrame && !this.hitTriggered) {
                this.hitTriggered = true;
            }
        } 
        else if (this.actionPhase === "move_back") {
            this.state = "walk";
            const speed = 1200.0 * dt;
            const targetX = this.baseX;
            const dirX = targetX > this.xFloat ? 1 : -1;
            
            this.xFloat += speed * dirX;
            if ((dirX === 1 && this.xFloat >= targetX) || (dirX === -1 && this.xFloat <= targetX)) {
                this.xFloat = targetX;
                this.actionPhase = "idle";
                this.state = "idle";
                this.actionFinished = true;
            }
        } 
        else if (this.actionPhase === "hurt") {
            this.state = "hurt";
            this.timer += dt;
            
            // JRPG Smooth knockback bounce
            const knockback = this.isPlayer ? -30 : 30;
            const progress = Math.min(1.0, this.timer / 0.5);
            const t = Math.sin(progress * Math.PI);
            this.xFloat = this.baseX + (knockback * t);

            // Shake y for impact feel
            const shakeOffset = this.timer < 0.2 ? (Math.random() - 0.5) * 10 : 0;
            this.yFloat = this.baseY + shakeOffset;

            if (this.timer >= 0.5) {
                this.actionPhase = "idle";
                this.state = "idle";
                this.actionFinished = true;
                this.xFloat = this.baseX;
                this.yFloat = this.baseY;
            }
        }
    }

    draw(ctx) {
        const animFrames = this.frames[this.state];
        if (!animFrames || animFrames.length === 0) return;

        const img = animFrames[this.frameIdx];
        if (img && img.complete && img.naturalWidth > 0) {
            const scale = Math.min(this.maxSize.width / 64, this.maxSize.height / 64);
            const drawW = img.naturalWidth * scale;
            const drawH = img.naturalHeight * scale;
            const drawX = this.xFloat - drawW / 2;
            const drawY = this.yFloat - drawH / 2;

            if (this.state === "hurt" && Math.floor(this.timer * 20) % 2 === 0) {
                // Perfect red flash composition using offscreen canvas to isolate composite operation
                tintCanvas.width = drawW;
                tintCanvas.height = drawH;
                tintCtx.clearRect(0, 0, drawW, drawH);
                
                // Draw sprite on the offscreen canvas
                tintCtx.drawImage(img, 0, 0, drawW, drawH);
                
                // Overlay solid red on top of the sprite's opaque pixels
                tintCtx.globalCompositeOperation = "source-atop";
                tintCtx.fillStyle = "rgba(180, 0, 0, 0.65)";
                tintCtx.fillRect(0, 0, drawW, drawH);
                
                // Draw original image on main canvas
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
                
                // Overlay the red tint on main canvas
                ctx.save();
                ctx.drawImage(tintCanvas, drawX, drawY);
                ctx.restore();
            } else {
                ctx.drawImage(img, drawX, drawY, drawW, drawH);
            }
        }
    }
}

// PiratePlayer character class
class PiratePlayer extends AnimatedEntity {
    constructor(x, y) {
        super(x, y, "player", SIZE_PLAYER);
        this.isPlayer = true;
        this.maxHp = 100;
        this.hp = this.maxHp;
    }
}

// Monster character class
class Monster extends AnimatedEntity {
    constructor(x, y, mType) {
        let size = SIZE_MONSTER_SMALL;
        if (mType === "big") size = SIZE_MONSTER_BIG;
        if (mType === "boss") size = SIZE_MONSTER_BOSS;

        super(x, y, mType, size);
        this.isPlayer = false;
        this.mType = mType;

        if (mType === "small") {
            this.maxHp = 30;
        } else if (mType === "big") {
            this.maxHp = 90;
        } else { // boss
            this.maxHp = 150;
        }
        this.hp = this.maxHp;
    }
}
