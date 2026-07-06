import pygame
import sys
import random
import math
import os
from src.config import *
from src.quiz_data import QUESTIONS
from src.ui import UIElement, HealthBar, QuizBox, DamageText
from src.entities import PiratePlayer, Monster, Particle

def load_bg_image(name, size):
    path = os.path.join(BG_DIR, name)
    try:
        img = pygame.image.load(path).convert_alpha()
        return pygame.transform.smoothscale(img, size)
    except Exception:
        surf = pygame.Surface(size)
        surf.fill(BG_COLOR)
        return surf

class Game:
    def __init__(self):
        pygame.init()
        pygame.mixer.init() # Audio system
        
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Pirate Quiz Tower Defense")
        self.clock = pygame.time.Clock()
        self.state = MAIN_MENU
        
        self.font_large = pygame.font.Font(None, 74)
        self.font_medium = pygame.font.Font(None, 48)
        self.font_small = pygame.font.Font(None, 32)
        
        # Load layered parallax background
        self.bg_sky = load_bg_image("bg_sky.png", SIZE_BG)
        self.bg_islands = load_bg_image("bg_islands.png", SIZE_BG)
        self.bg_deck = load_bg_image("bg_deck.png", SIZE_BG)
        
        # Audio setup
        self.sounds = {}
        for s_name in ["hit.wav", "shoot.wav", "wrong.wav"]:
            key = s_name.split(".")[0]
            path = os.path.join(AUDIO_DIR, s_name)
            try:
                snd = pygame.mixer.Sound(path)
                snd.set_volume(VOL_SFX)
                self.sounds[key] = snd
            except Exception:
                self.sounds[key] = None
                
        try:
            pygame.mixer.music.load(os.path.join(AUDIO_DIR, "bgm.wav"))
            pygame.mixer.music.set_volume(VOL_BGM)
            pygame.mixer.music.play(-1)
        except Exception:
            pass
        
        self.reset_game()
        
    def reset_game(self):
        # Y position now represents the floor (feet), set to 600 for the deck level
        self.ship = PiratePlayer(250, 600)
        self.ship_hp_bar = HealthBar(175, HEIGHT//2 - 100, 150, 20)
        
        self.current_q_idx = 0
        self.wave = 1
        
        self.question_pool = list(QUESTIONS)
        if SHUFFLE_QUESTIONS:
            random.shuffle(self.question_pool)
        
        self.enemy_sequence = [
            "small", "small", "big", "small", "small", "big", "boss",
            "small", "big", "small", "boss",
            "big", "big", "boss", "boss"
        ] * 3 
        self.current_enemy_idx = 0
        
        self.items = {
            "Telescope": {"used": False},
            "Repair Kit": {"used": False},
            "Cannonball": {"used": False}
        }
        self.double_damage = False
        self.skip_count = 3
        
        self.monster = None
        self.monster_hp_bar = HealthBar(0, 0, 150, 20)
        
        self.combat_state = "idle" 
        self.pending_dmg = 0
        
        self.particles = pygame.sprite.Group()
        self.dmg_texts = pygame.sprite.Group()
        self.screen_shake = 0.0
        
        self.quiz_box = QuizBox(100, HEIGHT - 300, WIDTH - 200, 80)
        
        self.init_ui()
        self.spawn_enemy()
        self.load_question()
        
    def play_sound(self, name):
        if self.sounds.get(name):
            self.sounds[name].play()
            
    def spawn_particles(self, pos, count, color):
        for _ in range(count):
            self.particles.add(Particle(pos[0], pos[1], color))
        
    def init_ui(self):
        self.choice_buttons = []
        for i in range(2):
            for j in range(2):
                x = 240 + j * 420
                y = HEIGHT - 200 + i * 80
                btn = UIElement(x, y, 380, 60, "", self.font_small, GRAY, WHITE, BLACK)
                self.choice_buttons.append(btn)
                
        self.item_buttons = []
        for i, item in enumerate(self.items.keys()):
            x = 30 + i * 180
            y = 20
            btn = UIElement(x, y, 160, 50, item, self.font_small, CYAN, WHITE, BLACK)
            self.item_buttons.append(btn)
            
        # Skip Button
        self.skip_btn = UIElement(WIDTH - 150, 20, 120, 50, f"Skip ({self.skip_count})", self.font_small, ORANGE, WHITE, BLACK)
            
    def load_question(self):
        if self.current_q_idx >= len(self.question_pool):
            self.state = VICTORY
            return
            
        self.wave = (self.current_q_idx // 10) + 1
        q_data = self.question_pool[self.current_q_idx]
        self.current_q_text = q_data["q"]
        self.correct_ans = q_data["c"][q_data["a"]]
        self.question_timer = q_data.get("time", 15.0)
        self.max_question_time = self.question_timer
        
        for i, btn in enumerate(self.choice_buttons):
            btn.text = q_data["c"][i]
            btn.disabled = False
            
    def spawn_enemy(self):
        e_type = self.enemy_sequence[self.current_enemy_idx]
        self.current_enemy_idx += 1
        
        # Spawn at the exact same floor level (600)
        self.monster = Monster(1000, 600, e_type)
        self.monster_hp_bar.rect.centerx = self.monster.base_x
        
    def update(self, dt):
        mouse_pos = pygame.mouse.get_pos()
        
        if self.state == PLAYING:
            self.ship.update(dt)
            self.monster.update(dt)
            self.particles.update(dt)
            self.dmg_texts.update(dt)
            
            if self.screen_shake > 0:
                self.screen_shake -= 20 * dt
                if self.screen_shake < 0:
                    self.screen_shake = 0
            
            # HP Bar updates
            self.ship_hp_bar.rect.y = self.ship.rect.top - 40
            self.monster_hp_bar.rect.y = self.monster.rect.top - 40
            
            # Combat State Machine
            if self.combat_state == "idle":
                self.question_timer -= dt
                if self.question_timer <= 0:
                    self.play_sound("wrong")
                    self.pending_dmg = {"small": 10, "big": 20, "boss": 30}[self.monster.m_type]
                    self.monster.trigger_attack()
                    self.combat_state = "monster_attack"
                    self.hit_applied = False
                    self.question_timer = getattr(self, 'max_question_time', 15.0) # Reset เวลาให้ใหม่หลังจากโดนตี
                else:
                    for btn in self.choice_buttons + self.item_buttons + [self.skip_btn]:
                        btn.check_hover(mouse_pos)
            
            elif self.combat_state == "player_attack":
                if self.ship.hit_triggered and not self.hit_applied:
                    self.play_sound("hit")
                    self.monster.trigger_hurt()
                    self.spawn_particles(self.monster.rect.center, 20, ORANGE)
                    self.monster.hp -= self.pending_dmg
                    self.dmg_texts.add(DamageText(self.monster.rect.centerx, self.monster.rect.top - 20, self.pending_dmg, self.font_medium))
                    self.hit_applied = True
                    
                if self.ship.action_finished:
                    if self.monster.hp <= 0:
                        self.spawn_particles(self.monster.rect.center, 50, RED)
                        self.spawn_enemy()
                    self.current_q_idx += 1
                    self.load_question()
                    self.combat_state = "idle"
                    
            elif self.combat_state == "monster_attack":
                if self.monster.hit_triggered and not self.hit_applied:
                    self.play_sound("hit")
                    self.ship.trigger_hurt()
                    self.screen_shake = 10.0 if self.monster.m_type == "boss" else 5.0
                    self.spawn_particles(self.ship.rect.center, 20, RED)
                    self.ship.hp -= self.pending_dmg
                    self.dmg_texts.add(DamageText(self.ship.rect.centerx, self.ship.rect.top - 20, self.pending_dmg, self.font_medium))
                    self.hit_applied = True
                    
                if self.monster.action_finished:
                    if self.ship.hp <= 0:
                        self.state = GAME_OVER
                    # Wait for player to answer next, so don't progress question yet
                    self.combat_state = "idle"
                    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
                
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                if self.state == MAIN_MENU:
                    self.state = PLAYING
                elif self.state in (GAME_OVER, VICTORY):
                    self.reset_game()
                    self.state = PLAYING
                elif self.state == PLAYING and self.combat_state == "idle":
                    self.handle_ui_clicks()
                            
    def handle_ui_clicks(self):
        # Items
        for btn in self.item_buttons:
            if btn.is_hovered and not self.items[btn.text]["used"]:
                if btn.text == "Telescope":
                    wrong = [b for b in self.choice_buttons if b.text != self.correct_ans and not b.disabled]
                    if len(wrong) >= 2:
                        for b in random.sample(wrong, 2):
                            b.disabled = True
                    self.items["Telescope"]["used"] = True
                    btn.disabled = True
                elif btn.text == "Repair Kit":
                    self.ship.hp = min(self.ship.max_hp, self.ship.hp + 30)
                    self.dmg_texts.add(DamageText(self.ship.rect.centerx, self.ship.rect.top - 20, -30, self.font_medium, GREEN))
                    self.spawn_particles(self.ship.rect.center, 30, GREEN)
                    self.items["Repair Kit"]["used"] = True
                    btn.disabled = True
                elif btn.text == "Cannonball":
                    self.double_damage = True
                    self.items["Cannonball"]["used"] = True
                    btn.disabled = True
                    
        # Questions
        for btn in self.choice_buttons:
            if btn.is_hovered and not btn.disabled:
                if btn.text == self.correct_ans:
                    self.play_sound("shoot")
                    self.pending_dmg = PLAYER_BASE_DMG * 2 if self.double_damage else PLAYER_BASE_DMG
                    self.double_damage = False
                    self.ship.trigger_attack()
                    self.combat_state = "player_attack"
                    self.hit_applied = False
                else:
                    self.play_sound("wrong")
                    self.pending_dmg = {"small": 10, "big": 20, "boss": 30}[self.monster.m_type]
                    self.monster.trigger_attack()
                    self.combat_state = "monster_attack"
                    self.hit_applied = False
                    self.question_timer = getattr(self, 'max_question_time', 15.0) # Reset เวลาให้ใหม่เมื่อตอบผิดด้วย
                    
        # Skip Question
        if self.skip_btn.is_hovered and not getattr(self.skip_btn, 'disabled', False):
            if self.skip_count > 0:
                self.play_sound("shoot") # Use a click sound or just use shoot for now
                self.current_q_idx += 1
                self.skip_count -= 1
                self.skip_btn.text = f"Skip ({self.skip_count})"
                if self.skip_count <= 0:
                    self.skip_btn.disabled = True
                    self.skip_btn.color = DARK_GRAY # ทำให้ปุ่มเป็นสีเทาเมื่อใช้หมด
                self.load_question()

    def draw_centered_text(self, text, font, color, y_offset=0):
        shadow_surf = font.render(text, True, BLACK)
        shadow_rect = shadow_surf.get_rect(center=(WIDTH//2, HEIGHT//2 + y_offset + 3))
        self.screen.blit(shadow_surf, shadow_rect)
        
        surf = font.render(text, True, color)
        rect = surf.get_rect(center=(WIDTH//2, HEIGHT//2 + y_offset))
        self.screen.blit(surf, rect)

    def draw_parallax_background(self):
        time_ms = pygame.time.get_ticks()
        
        shake_x = random.uniform(-self.screen_shake, self.screen_shake)
        shake_y = random.uniform(-self.screen_shake, self.screen_shake)
        
        # Center the background image exactly on the screen window
        # คุณสามารถแก้ไขตัวเลขด้านหลังเพื่อขยับภาพเองได้ เช่น (WIDTH - SIZE_BG[0]) // 2 + 50
        base_x = (WIDTH - SIZE_BG[0]) // 2
        base_y = (HEIGHT - SIZE_BG[1]) // 2 -10
        
        sky_x = base_x + math.sin(time_ms / 4000.0) * 10 + shake_x
        sky_y = base_y + math.cos(time_ms / 5000.0) * 5 + shake_y
        self.screen.blit(self.bg_sky, (sky_x, sky_y))
        
        isl_x = base_x + math.sin(time_ms / 3000.0) * 20 + shake_x
        isl_y = base_y + math.cos(time_ms / 4000.0) * 10 + shake_y
        self.screen.blit(self.bg_islands, (isl_x, isl_y))
        
        # ปรับพิกัดเฉพาะ bg_deck ให้เลื่อนลงมา
        # bg_deck เป็นพื้นดิน ควรอยู่นิ่งๆ กับที่ (เคลื่อนไหวแค่ตอนโดนจอระเบิด/shake)
        deck_offset_y = 20 
        deck_x = base_x + shake_x
        deck_y = base_y + shake_y + deck_offset_y
        self.screen.blit(self.bg_deck, (deck_x, deck_y))

    def draw(self):
        self.draw_parallax_background()
        
        if self.state == MAIN_MENU:
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 180))
            self.screen.blit(overlay, (0,0))
            self.draw_centered_text("Pirate Quiz Tower Defense", self.font_large, WHITE, -50)
            self.draw_centered_text("Click anywhere to Start", self.font_medium, GRAY, 50)
            
        elif self.state == GAME_OVER:
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((100, 0, 0, 150))
            self.screen.blit(overlay, (0,0))
            self.draw_centered_text("GAME OVER", self.font_large, RED, -50)
            self.draw_centered_text("Click anywhere to Restart", self.font_medium, GRAY, 50)
            
        elif self.state == VICTORY:
            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 100, 0, 150))
            self.screen.blit(overlay, (0,0))
            self.draw_centered_text("VICTORY!", self.font_large, GREEN, -50)
            self.draw_centered_text("You defeated all 3 waves! Click to Restart", self.font_medium, GRAY, 50)
            
        elif self.state == PLAYING:
            # Shake offset for UI and characters (optional, but let's just shake backgrounds for simplicity/performance)
            self.ship.draw(self.screen)
            self.ship_hp_bar.draw(self.screen, self.ship.hp, self.ship.max_hp, 0.016) # Approximate dt for UI draw
            
            self.monster.draw(self.screen)
            self.monster_hp_bar.draw(self.screen, self.monster.hp, self.monster.max_hp, 0.016)
            
            self.particles.draw(self.screen)
            self.dmg_texts.draw(self.screen)
            
            wave_txt = self.font_medium.render(f"Wave: {self.wave}   Question: {self.current_q_idx + 1}/30", True, WHITE)
            self.screen.blit(wave_txt, wave_txt.get_rect(center=(WIDTH//2, 40)))
            
            for btn in self.item_buttons:
                btn.draw(self.screen)
                
            if self.double_damage:
                dmg_txt = self.font_small.render("2x DAMAGE ACTIVE!", True, YELLOW)
                self.screen.blit(dmg_txt, (30, 80))
                
            if self.combat_state == "idle":
                timer_color = RED if self.question_timer <= 5 else WHITE
                timer_txt = self.font_medium.render(f"Time: {max(0, int(self.question_timer))}", True, timer_color)
                self.screen.blit(timer_txt, timer_txt.get_rect(center=(WIDTH//2, HEIGHT - 330)))
                
                self.quiz_box.draw(self.screen, self.current_q_text, self.font_medium)
                for btn in self.choice_buttons:
                    btn.draw(self.screen)
                self.skip_btn.draw(self.screen)
                
        pygame.display.flip()
        
    def run(self):
        while True:
            dt = self.clock.tick(FPS) / 1000.0 # Delta time in seconds
            self.handle_events()
            self.update(dt)
            self.draw()
