import pygame
import os
from src.config import *

def load_ui_image(name, size):
    path = os.path.join(UI_DIR, name)
    try:
        img = pygame.image.load(path).convert_alpha()
        return pygame.transform.smoothscale(img, size)
    except Exception:
        return None

class UIElement:
    def __init__(self, x, y, w, h, text, font, bg_color, hover_color, text_color):
        self.rect = pygame.Rect(x, y, w, h)
        self.text = text
        self.font = font
        self.bg_color = bg_color
        self.hover_color = hover_color
        self.text_color = text_color
        self.is_hovered = False
        self.disabled = False
        
        self.bg_image = load_ui_image("button_bg.png", (w, h))
        
    def draw(self, surface):
        if self.bg_image and not self.disabled:
            img = self.bg_image.copy()
            if self.is_hovered:
                # Darken slightly on hover
                img.fill((200, 200, 200), special_flags=pygame.BLEND_RGB_MULT)
            surface.blit(img, self.rect)
        else:
            # Fallback
            shadow_rect = self.rect.copy()
            shadow_rect.y += 4
            pygame.draw.rect(surface, BLACK, shadow_rect, border_radius=10)
            
            color = DARK_GRAY if self.disabled else (self.hover_color if self.is_hovered else self.bg_color)
            pygame.draw.rect(surface, color, self.rect, border_radius=10)
            pygame.draw.rect(surface, WHITE, self.rect, 2, border_radius=10)
        
        text_color = DARK_GRAY if self.disabled else self.text_color
        text_surf = self.font.render(self.text, True, text_color)
        text_rect = text_surf.get_rect(center=self.rect.center)
        surface.blit(text_surf, text_rect)
        
    def check_hover(self, pos):
        self.is_hovered = self.rect.collidepoint(pos)

class QuizBox:
    def __init__(self, x, y, w, h):
        self.rect = pygame.Rect(x, y, w, h)
        self.bg_image = load_ui_image("quiz_box.png", (w, h))
        
    def draw(self, surface, text, font):
        if self.bg_image:
            surface.blit(self.bg_image, self.rect)
        else:
            pygame.draw.rect(surface, DARK_GRAY, self.rect, border_radius=15)
            pygame.draw.rect(surface, WHITE, self.rect, 3, border_radius=15)
            
        text_surf = font.render(text, True, WHITE)
        surface.blit(text_surf, text_surf.get_rect(center=self.rect.center))

class HealthBar:
    def __init__(self, x, y, w, h):
        self.rect = pygame.Rect(x, y, w, h)
        self.current_hp = None
        
    def draw(self, surface, hp, max_hp, dt=0):
        if self.current_hp is None:
            self.current_hp = hp
            
        if self.current_hp > hp:
            self.current_hp -= (self.current_hp - hp) * 5 * dt
            if self.current_hp < hp: self.current_hp = hp
        elif self.current_hp < hp:
            self.current_hp += (hp - self.current_hp) * 5 * dt
            if self.current_hp > hp: self.current_hp = hp
            
        # Pirate Theme Colors
        WOOD_COLOR = (92, 64, 51)
        GOLD_COLOR = (218, 165, 32)
        INNER_BG = (40, 20, 20)
        
        # 1. Draw Wooden Backboard
        backboard_rect = self.rect.inflate(16, 16)
        pygame.draw.rect(surface, WOOD_COLOR, backboard_rect, border_radius=4)
        
        # 2. Draw Gold Outer Border
        pygame.draw.rect(surface, GOLD_COLOR, backboard_rect, 3, border_radius=4)
        
        # 3. Draw Iron Rivets at corners
        for dx in [-1, 1]:
            for dy in [-1, 1]:
                rx = backboard_rect.centerx + dx * (backboard_rect.w//2 - 5)
                ry = backboard_rect.centery + dy * (backboard_rect.h//2 - 5)
                pygame.draw.circle(surface, (50, 50, 50), (int(rx), int(ry)), 3)
                pygame.draw.circle(surface, (20, 20, 20), (int(rx), int(ry)), 3, 1)
        
        # 4. Draw Inner Background (Empty Bar)
        pygame.draw.rect(surface, INNER_BG, self.rect)
        
        # 5. Draw Health Fill with Gloss Effect
        if self.current_hp > 0:
            ratio = self.current_hp / max_hp
            # Vibrant health colors
            color = (50, 205, 50) if ratio > 0.5 else (255, 215, 0) if ratio > 0.25 else (220, 20, 60)
            fill_rect = pygame.Rect(self.rect.x, self.rect.y, int(self.rect.w * ratio), self.rect.h)
            pygame.draw.rect(surface, color, fill_rect)
            
            # Gloss highlight (top half of the bar)
            if fill_rect.w > 0:
                glare_rect = pygame.Rect(self.rect.x, self.rect.y, fill_rect.w, self.rect.h // 2)
                glare_surf = pygame.Surface((glare_rect.w, glare_rect.h), pygame.SRCALPHA)
                glare_surf.fill((255, 255, 255, 50))
                surface.blit(glare_surf, glare_rect)
                
        # 6. Draw Inner Gold Border
        pygame.draw.rect(surface, GOLD_COLOR, self.rect, 2)

class DamageText(pygame.sprite.Sprite):
    def __init__(self, x, y, amount, font, color=RED):
        super().__init__()
        prefix = "-" if amount > 0 else "+"
        self.text = f"{prefix}{abs(amount)}"
        self.font = font
        self.color = color
        self.alpha = 255
        
        self.base_surf = self.font.render(self.text, True, self.color)
        self.outline_surf = self.font.render(self.text, True, BLACK)
        self.create_image()
        
        self.rect = self.image.get_rect(center=(x, y))
        self.y_float = float(self.rect.y)
        self.scale = 2.0 # Start huge for JRPG pop effect
        
    def create_image(self):
        w, h = self.base_surf.get_width(), self.base_surf.get_height()
        self.orig_image = pygame.Surface((w + 4, h + 4), pygame.SRCALPHA)
        for dx, dy in [(-2, -2), (2, -2), (-2, 2), (2, 2)]:
            self.orig_image.blit(self.outline_surf, (2 + dx, 2 + dy))
        self.orig_image.blit(self.base_surf, (2, 2))
        self.image = self.orig_image.copy()
        
    def update(self, dt):
        self.y_float -= 80 * dt # Drift upwards
        self.rect.y = int(self.y_float)
        
        # Scaling pop effect
        if self.scale > 1.0:
            self.scale -= 5 * dt
            if self.scale < 1.0: 
                self.scale = 1.0
                
            new_w = max(1, int(self.orig_image.get_width() * self.scale))
            new_h = max(1, int(self.orig_image.get_height() * self.scale))
            self.image = pygame.transform.smoothscale(self.orig_image, (new_w, new_h))
            self.image.set_alpha(int(self.alpha))
            self.rect = self.image.get_rect(center=self.rect.center)
            
        else:
            self.alpha -= 200 * dt
            if self.alpha <= 0:
                self.kill()
            else:
                self.image.set_alpha(int(self.alpha))
