import pygame
import os
import math
import random
from src.config import *

def scale_keep_aspect_ratio(image, max_size):
    """Scales image proportionally to fit inside max_size without stretching."""
    img_rect = image.get_rect()
    target_w, target_h = max_size
    
    scale_w = target_w / img_rect.width
    scale_h = target_h / img_rect.height
    scale = min(scale_w, scale_h)
    
    new_w = int(img_rect.width * scale)
    new_h = int(img_rect.height * scale)
    # ใช้ pygame.transform.scale ธรรมดาแทน smoothscale เพื่อรักษาความคมชัดของ Pixel Art
    return pygame.transform.scale(image, (new_w, new_h))

def load_lpc_animation(char_name, max_size):
    """Loads separated Universal LPC frames from subdirectories, supporting 128x128 oversize weapon frames."""
    frames = {"idle": [], "walk": [], "attack": [], "hurt": []}
    
    is_player = (char_name == "player")
    facing = "right" if is_player else "left"
    
    def load_sequence(base_dir, action, direction):
        seq = []
        path = os.path.join(base_dir, action, direction)
        if os.path.exists(path):
            files = sorted([f for f in os.listdir(path) if f.endswith('.png')], key=lambda x: int(x.split('.')[0]))
            for f in files:
                img = pygame.image.load(os.path.join(path, f)).convert_alpha()
                if max_size:
                    # Fix scale based on standard 64x64 LPC body size so 128x128 frames stay proportional
                    scale = min(max_size[0] / 64.0, max_size[1] / 64.0)
                    new_w = int(img.get_width() * scale)
                    new_h = int(img.get_height() * scale)
                    img = pygame.transform.scale(img, (new_w, new_h))
                seq.append(img)
        return seq

    def get_best_sequence(action_names, direction):
        for act in action_names:
            # Check custom folder first (for oversize weapons like slash_128)
            seq = load_sequence(os.path.join(CHAR_DIR, char_name, "custom"), act, direction)
            if seq: return seq
            # Check standard folder
            seq = load_sequence(os.path.join(CHAR_DIR, char_name, "standard"), act, direction)
            if seq: return seq
        return []

    try:
        frames["idle"] = get_best_sequence(["idle", "walk"], facing)
        frames["walk"] = get_best_sequence(["walk"], facing)
        frames["attack"] = get_best_sequence(["slash_oversize", "tool_whip", "slash_128", "1h_slash", "slash", "combat"], facing)
        
        hurt_seq = get_best_sequence(["hurt"], "up")
        if not hurt_seq:
            hurt_seq = get_best_sequence(["hurt"], "down")
        frames["hurt"] = hurt_seq
            
    except Exception as e:
        print(f"Warning: Failed to load LPC frames for {char_name}. {e}")
        
    # Ensure we always have idle and walk
    if not frames["idle"] and frames["walk"]: frames["idle"] = frames["walk"]
    if not frames["walk"] and frames["idle"]: frames["walk"] = frames["idle"]
        
    # Fallback for missing animations
    for state in ["idle", "walk", "attack", "hurt"]:
        if not frames[state]:
            surf = pygame.Surface(max_size, pygame.SRCALPHA)
            color = RED if state == "hurt" else (pygame.BLEND_PREMULTIPLIED if char_name == "player" else GREEN)
            pygame.draw.rect(surf, color, (0, 0, max_size[0], max_size[1]), border_radius=10)
            font = pygame.font.Font(None, 24)
            text = font.render(f"LPC:{char_name}", True, WHITE)
            surf.blit(text, text.get_rect(center=(max_size[0]//2, max_size[1]//2)))
            frames[state] = [surf] * 6
            
    return frames

class AnimatedEntity(pygame.sprite.Sprite):
    def __init__(self, x, y, char_name, max_size):
        super().__init__()
        
        # คืนค่าจุดศูนย์กลางให้อยู่ที่ center ของภาพเพื่อป้องกันบัคภาพอาวุธใหญ่กระโดด
        # คำนวณระยะจากจุด center ลงมาที่ปลายเท้าของ LPC sprite ปกติ (28 พิกเซลเมื่อยังไม่ขยาย)
        scale = min(max_size[0] / 64.0, max_size[1] / 64.0)
        feet_offset = 28 * scale
        
        self.base_x = float(x)
        self.base_y = float(y) - feet_offset # y ที่ส่งเข้ามาคือพื้น (Floor) ลบด้วยระยะเท้าจะได้ Center
        self.x_float = self.base_x
        self.y_float = self.base_y
        
        self.action_phase = "idle" 
        self.state = "idle"
        self.timer = 0
        self.action_finished = False
        self.hit_triggered = False
        
        self.frames = load_lpc_animation(char_name, max_size)
        self.frame_idx = 0
        self.frame_timer = 0
        
        self.image = self.frames[self.state][self.frame_idx]
        self.rect = self.image.get_rect(center=(int(self.x_float), int(self.y_float)))
        
    def trigger_attack(self):
        self.action_phase = "move_forward"
        self.state = "walk"
        self.timer = 0
        self.frame_idx = 0
        self.frame_timer = 0
        self.action_finished = False
        self.hit_triggered = False
        
    def trigger_hurt(self):
        self.action_phase = "hurt"
        self.state = "hurt"
        self.timer = 0
        self.frame_idx = 0
        self.frame_timer = 0
        self.action_finished = False
        
    def update(self, dt):
        self.frame_timer += dt
        
        # ดึงค่า FPS ตามท่าทางปัจจุบันจาก config
        current_fps = ANIM_FPS.get(self.state, 8)
        
        if self.frame_timer >= 1.0 / current_fps:
            self.frame_timer = 0
            self.frame_idx += 1
            
            # Check if slash animation is done looping once
            if self.action_phase == "slashing" and self.frame_idx >= len(self.frames["attack"]):
                self.action_phase = "move_back"
                self.state = "walk"
                self.frame_idx = 0
                
        # Clamp frame_idx to prevent IndexError on state changes
        self.frame_idx = self.frame_idx % len(self.frames[self.state])
        
        self.image = self.frames[self.state][self.frame_idx]
        self.rect = self.image.get_rect(center=self.rect.center)
            
        if self.action_phase == "idle":
            self.state = "idle"
            time_ms = pygame.time.get_ticks()
            self.y_float = self.base_y + math.sin(time_ms / 400.0) * 2
            self.x_float = self.base_x
            
        elif self.action_phase == "move_forward":
            self.state = "walk"
            # Increased dash distance to 600 so they walk all the way to the opponent
            dash_dist = 600.0 if getattr(self, 'is_player', False) else -600.0
            speed = 1200.0 * dt
            
            target_x = self.base_x + dash_dist
            dir_x = 1 if target_x > self.x_float else -1
            self.x_float += speed * dir_x
            
            if (dir_x == 1 and self.x_float >= target_x) or (dir_x == -1 and self.x_float <= target_x):
                self.x_float = target_x
                self.action_phase = "slashing"
                self.state = "attack"
                self.frame_idx = 0
                
        elif self.action_phase == "slashing":
            self.state = "attack"
            # Trigger hit in the middle of the animation dynamically (works for 6-frame sword or 8-frame whip)
            impact_frame = len(self.frames["attack"]) // 2
            if self.frame_idx == impact_frame and not self.hit_triggered:
                self.hit_triggered = True
            
        elif self.action_phase == "move_back":
            self.state = "walk"
            speed = 1200.0 * dt
            target_x = self.base_x
            dir_x = 1 if target_x > self.x_float else -1
            self.x_float += speed * dir_x
            
            if (dir_x == 1 and self.x_float >= target_x) or (dir_x == -1 and self.x_float <= target_x):
                self.x_float = target_x
                self.action_phase = "idle"
                self.state = "idle"
                self.action_finished = True
                
        elif self.action_phase == "hurt":
            self.state = "hurt"
            self.timer += dt
            
            # Smooth JRPG knockback effect
            knockback = -30 if getattr(self, 'is_player', False) else 30
            progress = min(1.0, self.timer / 0.5)
            # Smoothly bounce back and return
            t = math.sin(progress * math.pi) 
            self.x_float = self.base_x + (knockback * t)
            
            shake_offset = random.uniform(-5, 5) if self.timer < 0.2 else 0
            self.y_float = self.base_y + shake_offset
            
            if self.timer >= 0.5: 
                self.action_phase = "idle"
                self.state = "idle"
                self.action_finished = True
                self.x_float = self.base_x
                self.y_float = self.base_y

        # Apply calculated float coordinates back to the rect
        self.rect.centerx = int(self.x_float)
        self.rect.centery = int(self.y_float)

    def draw(self, surface):
        if self.state == "hurt":
            # กระพริบตัวแดงทุกๆ 0.05 วินาทีตอนโดนตี
            if int(self.timer * 20) % 2 == 0:
                tinted = self.image.copy()
                # เพิ่มสีแดงเข้าไปในภาพโดยไม่กระทบกับความโปร่งใส (Alpha)
                tinted.fill((150, 0, 0), special_flags=pygame.BLEND_RGB_ADD)
                surface.blit(tinted, self.rect)
            else:
                surface.blit(self.image, self.rect)
        else:
            surface.blit(self.image, self.rect)

class PiratePlayer(AnimatedEntity):
    def __init__(self, x, y):
        super().__init__(x, y, "player", SIZE_PLAYER)
        self.is_player = True
        self.max_hp = 100
        self.hp = self.max_hp

class Monster(AnimatedEntity):
    def __init__(self, x, y, m_type):
        size = SIZE_MONSTER_SMALL
        if m_type == "big":
            size = SIZE_MONSTER_BIG
        elif m_type == "boss":
            size = SIZE_MONSTER_BOSS
            
        super().__init__(x, y, m_type, size)
        self.is_player = False
        self.m_type = m_type
        
        if m_type == "small":
            self.max_hp = 30    # โดน 1 ทีตาย (ถ้าตี 30)
        elif m_type == "big":
            self.max_hp = 90    # โดน 3 ทีตาย
        else: # boss
            self.max_hp = 150   # โดน 5 ทีตาย
            
        self.hp = self.max_hp

class Particle(pygame.sprite.Sprite):
    def __init__(self, x, y, color):
        super().__init__()
        size = random.randint(4, 8)
        self.image = pygame.Surface((size, size))
        self.image.fill(color)
        self.rect = self.image.get_rect(center=(x, y))
        self.vel_x = random.uniform(-250, 250)
        self.vel_y = random.uniform(-250, 50)
        self.life = random.uniform(0.3, 0.7)
        self.x_float = float(x)
        self.y_float = float(y)
        
    def update(self, dt):
        self.vel_y += 500 * dt # Gravity
        self.x_float += self.vel_x * dt
        self.y_float += self.vel_y * dt
        self.rect.x = int(self.x_float)
        self.rect.y = int(self.y_float)
        
        self.life -= dt
        if self.life <= 0:
            self.kill()
