# 🏴‍☠️ เกมตอบคำถามโจรสลัดป้องกันเรือ (Pirate Quiz Tower Defense)

เกมแนวไฮบริด JRPG ผสม **Trivia + Tower Defense** แบบ **Standalone Web (HTML5 / JS / Canvas)**  
ผู้เล่นเป็นผู้บัญชาการเรือโจรสลัด ตอบคำถามวิชาการเพื่อยิงปืนใหญ่ ปกป้องเรือจากมอนสเตอร์ทะเล

---

## 🎮 ภาพรวม (Game Overview)

| หัวข้อ | รายละเอียด |
|--------|------------|
| ธีม | โจรสลัด / รบทางเรือ |
| ตอบถูก | เรือโจมตีมอนสเตอร์ |
| ตอบผิด | มอนสเตอร์โจมตีเรือ แล้วข้ามไปข้อถัดไป |
| เป้าหมาย | ผ่านคำถามทั้งหมด (โดยทั่วไป 30 ข้อ) แบ่ง 3 ระลอก + บอสช่วงท้าย |

---

## ✨ ฟีเจอร์หลัก (Features)

### เกมผู้เล่น
- โหลดข้อสอบตามวิชา: `math` / `science` / `thai` / `exam`
- **สถานการณ์ (Scenario)** แยกจากโจทย์ — อ่านผ่านปุ่ม «อ่านสถานการณ์» (popup เต็มกรอบเกม)
- ฉากหลังพาราแลกซ์ 3 ชั้น + ดาดฟ้าตามวิชา + ท้องฟ้าตามช่วงเวลา (`scene`)
- Combat state machine (โจมตี / โดนตี / อนุภาค / damage text / screen shake)
- ไอเทม: กล้องส่องทางไกล · กล่องพยาบาล · กระสุนปืนใหญ่ (x2) · Revive
- รองรับ HTML ในโจทย์/ตัวเลือก (ตาราง, รูป, `<br>`) + **KaTeX** (`$...$` / `$$...$$`)
- ซูมรูปประกอบในโจทย์
- เลย์เอาต์ตัวเลือกยาว / รูปแผนภูมิ (เช่น ข้อ 23) แบบ 1 คอลัมน์ + เลื่อนพาเนลได้
- Hotkey ตอบ: `1–4` / Numpad / `A–D` · `Esc` ปิดสถานการณ์
- เสียง BGM (`bgm.mp3`) + SFX · ปุ่มปิดเสียงใช้ได้ระหว่างต่อสู้
- เชื่อม LMS ผ่าน URL (`score`, `callback_url`, ฯลฯ)

### ระบบหลังบ้าน (Admin)
- แก้ข้อสอบ + **แท็บสถานการณ์** แยกไฟล์
- พรีวิว **หน้าเกมจริง** ใน iframe (`index.html?adminPreview=1`) ซิงก์โจทย์แบบเรียลไทม์
- ขยายพรีวิวเต็มจอ · เปิดสถานการณ์ในพรีวิว
- นำเข้า/ส่งออก JSON · ลากวางไฟล์ · บันทึกทับไฟล์เดิม (File System Access API เมื่อรองรับ)
- KaTeX live + เครื่องมือแทรกสูตร

---

## 📁 โครงสร้างโปรเจกต์

```text
├── assets/
│   ├── audio/                 # bgm.mp3, hit.wav, shoot.wav, wrong.wav
│   ├── data/
│   │   ├── math.json          # ข้อสอบรายวิชา
│   │   ├── science.json
│   │   ├── thai.json
│   │   ├── exam.json
│   │   └── scenarios/         # สถานการณ์แยกตามวิชา
│   │       ├── math.json
│   │       ├── science.json
│   │       ├── thai.json
│   │       └── exam.json
│   └── images/
│       ├── backgrounds/       # sky (เช้า/เย็น/ค่ำ), islands, deck ตามวิชา
│       ├── characters/        # player + Monster_Set1/2/3
│       ├── questions/         # รูปประกอบโจทย์ (เช่น math/)
│       └── ui/
└── web/
    ├── index.html             # หน้าเกมหลัก
    ├── admin.html             # ระบบหลังบ้าน
    ├── admin-preview.html     # (legacy helper — พรีวิวหลักใช้เกมจริง)
    ├── style.css
    └── js/
        ├── config.js          # ค่าคงที่ / ขนาด / ฟอนต์
        ├── entities.js        # สไปรต์, HP bar, particles
        ├── game.js            # ลูปเกม, combat, adminPreview
        └── quiz.js            # โหลดข้อสอบ + scenarios + LMS params
```

---

## 🛠️ วิธีรัน

แนะนำเปิดผ่าน local server (ไม่เปิด `file://` โดยตรง เพราะ `fetch` JSON อาจติด CORS):

```bash
# จากรากโปรเจกต์
python3 -m http.server 8000
```

| หน้า | URL |
|------|-----|
| เกม | http://localhost:8000/web/ |
| คณิตศาสตร์ | http://localhost:8000/web/?subject=math |
| Admin | http://localhost:8000/web/admin.html |

---

## 🕹️ วิธีเล่น

1. กด **ออกเรือ & เริ่มเล่น**
2. ถ้ามีสถานการณ์ → กด **อ่านสถานการณ์** (หรือเปิดอัตโนมัติถ้าเปิดตัวเลือกไว้)
3. ตอบตัวเลือก ก–ง (หรือคีย์ `1–4` / `A–D`)
4. ใช้ไอเทมมุมบนซ้ายเมื่อจำเป็น
5. ชนะเมื่อผ่านครบชุดข้อ · แพ้เมื่อ HP เรือเป็น 0 (อาจมี Revive ตามคะแนน)

**มือถือ:** แนะนำแนวนอน — โหมดแนวตั้งจะเตือนให้หมุนจอ

---

## ⚙️ URL Parameters

### 1) วิชา (`subject`)

| ค่า | ไฟล์ข้อสอบ | มอนสเตอร์ | ดาดฟ้า |
|-----|------------|----------|--------|
| `math` / `คณิตศาสตร์` | `math.json` | Monster_Set1 | Math |
| `science` / `วิทยาศาสตร์` | `science.json` | Monster_Set2 | Sci |
| `thai` / `ภาษาไทย` | `thai.json` | Monster_Set3 | Thai |
| `exam` / `สอบรวม` | `exam.json` | คละชุด | Math (ค่าเริ่ม) |

สถานการณ์โหลดคู่กันจาก `assets/data/scenarios/{subject}.json`

### 2) ช่วงเวลาท้องฟ้า (`scene` หรือ `sean`)

| ค่า | ภาพ |
|-----|-----|
| `morning` (ค่าเริ่ม) | `bg_sky_Morning.png` |
| `evening` / `เย็น` | `bg_sky_Evening.png` |
| `night` / `กลางคืน` / `ค่ำ` | `bg_sky_night.png` |

### 3) คะแนนก่อนหน้า (`score`) → ไอเทมเริ่มเกม

| คะแนน | กล้อง | กล่องพยาบาล | กระสุน | Revive |
|--------|------|-------------|--------|--------|
| 80–100 | 2 | 2 | 1 | 1 |
| 70–79 | 1 | 1 | 1 | 0 |
| 61–69 | 1 | 1 | 0 | 0 |
| ≤60 | 0 | 0 | 0 | 0 |

ไม่ระบุ `score` → ถือว่า **100**

### 4) สกินผู้เล่น (`player` / `character`)

- `?player=1` … `?player=6` (ค่าเริ่ม = 1)

### 5) LMS / Callback

| พารามิเตอร์ | ความหมาย |
|-------------|----------|
| `student_id` | รหัสนักเรียน |
| `token` / `session_token` | โทเคนรอบสอบ |
| `callback_url` | URL ขากลับหลังจบเกม |

เมื่อมี `callback_url` จะมีปุ่มส่งผล — รีไดเรกต์ประมาณ:

```text
[callback_url]?student_id=...&token=...&score=...&answers=[...]&status=victory|gameover
```

- `answers` = ลำดับตัวเลือกที่กดจริง (0=ก … 3=ง) สำหรับตรวจซ้ำฝั่งเซิร์ฟเวอร์

### 6) โหมดพรีวิว Admin (ภายในระบบ)

```text
web/index.html?adminPreview=1&subject=math
```

ใช้โดย `admin.html` ฝัง iframe — ไม่ใช่โหมดเล่นของนักเรียน

### 7) ตัวอย่างรวม

```text
http://localhost:8000/web/?subject=math&scene=evening&score=85&player=3&student_id=STD_009&token=SECURE123&callback_url=https://lms.example/certificate
```

---

## 📜 รูปแบบข้อมูล

### ข้อสอบ `assets/data/{subject}.json`

อาร์เรย์ของอ็อบเจ็กต์:

```json
{
  "q": "ข้อความโจทย์ (รองรับ HTML / ตาราง / รูป / LaTeX)",
  "c": ["ตัวเลือก ก", "ข", "ค", "ง"],
  "a": 0,
  "img": "",
  "showImg": false,
  "scenarioId": "fitd-fitness"
}
```

| ฟิลด์ | ความหมาย |
|-------|----------|
| `q` | โจทย์ (ไม่ต้องฝังสถานการณ์ซ้ำถ้าใช้ `scenarioId`) |
| `c` | ตัวเลือก 4 ข้อ (HTML ได้) |
| `a` | ดัชนีเฉลย `0–3` |
| `img` | path รูปเสริม (ถ้าว่างและไม่มี `<img>` ในโจทย์ = ไม่แสดง) |
| `showImg` | `true` = แสดงรูปทันที / ไม่ใช่ = ปุ่มสลับแสดง-ซ่อน |
| `scenarioId` | ผูกกับ id ในไฟล์ scenarios |

### สถานการณ์ `assets/data/scenarios/{subject}.json`

```json
{
  "id": "bacteria",
  "title": "การแพร่พันธุ์ของแบคทีเรีย",
  "body": "เนื้อหา HTML ได้\n<table>...</table>",
  "images": [],
  "order": 1
}
```

---

## 🖥️ Admin (`web/admin.html`)

1. เลือกวิชา → โหลดข้อสอบ + สถานการณ์  
2. แท็บ **ข้อสอบ** — แก้โจทย์ / ตัวเลือก / เฉลย / `scenarioId` / รูป  
3. แท็บ **สถานการณ์** — CRUD สถานการณ์ระบบ  
4. พรีวิวขวา = **เกมจริง** (ซิงก์ขณะพิมพ์)  
5. บันทึก: ดาวน์โหลด JSON หรือบันทึกทับไฟล์เดิม (ถ้ารองรับ File System Access)

---

## 👾 กลไกต่อสู้ (สรุป)

| เหตุการณ์ | ผล |
|-----------|-----|
| ตอบถูก | ดาเมจฐาน 30 (x2 ถ้าใช้กระสุน) |
| ตอบผิด | รับดาเมจตามมอนสเตอร์ แล้วไปข้อถัดไป |
| Easy | 60 HP |
| Middle | 90 HP |
| Boss | 150 HP — ช่วงข้อท้าย (เช่น 26–30) + เอฟเฟกต์เตือนบอส |

---

## 🔧 เทคโนโลยี

- HTML5 · CSS3 · Vanilla JS · Canvas 2D  
- [KaTeX](https://katex.org/) (CDN)  
- Google Fonts: Cinzel · Kanit · Outfit  

ไม่ต้อง build / ไม่มี backend ในตัว — วางบน static host หรือ LMS ที่เสิร์ฟไฟล์ได้

---

## 📝 หมายเหตุ

- โฟลเดอร์เอกสารต้นทางข้อสอบ (เช่น Word) **ไม่ได้ติด repo** โดยตั้งใจ — ใช้เฉพาะ JSON ใน `assets/data/`  
- หลังแก้ `style.css` เกมใช้ query `?v=` บนลิงก์ CSS เพื่อลดปัญหาแคช  
- ทดสอบบนเบราว์เซอร์สมัยใหม่ (Chrome / Edge / Safari / Firefox)
