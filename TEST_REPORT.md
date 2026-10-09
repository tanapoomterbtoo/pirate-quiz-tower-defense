# รายงานทดสอบระบบข้อสอบและ UI/UX

วันที่ตรวจ: 9 ตุลาคม 2026 (Asia/Bangkok)

## สถานะและขอบเขต

ตรวจโดยผู้พัฒนา/agent บน macOS ARM64 ด้วย Node 25.8.2 และ Playwright 1.56.1 รวมการตรวจหน้าจอผ่าน ego-browser ไม่มีผู้ทดสอบภายนอก ไม่มีเครื่อง Android/iPhone จริง และไม่เชื่อม LMS จริง จึง **ไม่ใช่ผล usability test กับผู้เรียน** และไม่ใช่การรับรอง production ทั้งระบบ

## บั๊กที่ยืนยันก่อนแก้

Regression เริ่มต้น 5 เทสต์: ผ่าน 1 และล้มเหลว 4 เทสต์ ได้แก่ข้อความตัวเลขกำกวม ขอบ tolerance 0.05 ข้อมูลข้อเขียนหายเมื่อโหลด Admin และข้อเขียนตอบผ่าน selectChoice ได้

Regression เพิ่มเติมของ Admin ยืนยันล้มเหลวทั้งสองกรณีก่อนแก้: บันทึกข้อมูลคลังเดิมระหว่างโหลดคลังใหม่จนเลือกชื่อไฟล์ผิด และไม่สามารถกำหนดหมวดวิชาให้ข้อ PISA ที่เพิ่มใหม่ได้ (`artifacts/admin-extra-regression-before.log`)

การสุ่ม fallback ก่อนแก้เลือกแบคทีเรียเพียง 2 จาก 3 ข้อ และพบสถานการณ์แยกกัน 98/100 รอบ การสุ่มคลังจริงก่อนแก้ 1,000 รอบผ่าน เพราะข้อมูลวิทย์ปัจจุบันมีสถานการณ์ละข้อและไทยไม่มีสถานการณ์ แต่โค้ดเดิมไม่รองรับกลุ่มหลายข้อในสองวิชานี้

## สิ่งที่แก้และตรวจ

- `ExamCore` เป็นกติกาส่วนกลางของเกม หน้าสรุป callback และ validation ของ Admin
- `id` ถาวรและ `subject` อยู่ใน JSON; fallback สร้างจาก JSON พร้อมสถานการณ์ทุกวิชา
- เลือกสถานการณ์ครบชุด สลับ Fisher–Yates ตรวจข้อมูลก่อนเริ่ม และรองรับโหลดล้มเหลวแยกรายไฟล์/timeout 5 วินาที
- Numeric grammar ต้องเหลือตัวเลขเต็มหนึ่งค่า คง tolerance `< 0.05` และคงคำตอบ/นโยบายหน่วยเดิม
- ป้องกันส่งซ้ำ ช่องทางผิดประเภท IME และ popup บัง; คะแนน/คำตอบ/รหัสข้อสอบตรงรอบจริง
- Admin มีแบบฟอร์มข้อเขียน รักษาฟิลด์ที่ไม่รู้จัก validation แยกประเภท พรีวิวตรงประเภท และ revision ของข้อมูลที่ยังไม่บันทึก แยกการส่งออกข้อสอบกับสถานการณ์ รักษาการแก้ระหว่างรอเซฟ และป้องกันสลับคลังระหว่างบันทึก
- Admin ยกเลิกผลโหลดที่อาจทับการแก้ระหว่างรอ network ใช้ชื่อคลังที่โหลดสำเร็จในการตั้งชื่อไฟล์ และไม่เปิดตัวเลือกเซฟระหว่างโหลด; เปลี่ยนหมวดวิชา/แทนข้อ PISA ได้ผ่านแบบฟอร์ม พร้อมตรวจ 5/5/5 และพรีวิวเป็นโหมดสอบรวม
- นำเข้าสถานการณ์จากไฟล์หรือ drag/drop ได้ รักษาฟิลด์เสริมและความสัมพันธ์กับข้อสอบ
- HUD ของสอบรวมแสดงวิชาปัจจุบันและจำนวนข้อ ตรวจขอบ 10→11 / 20→21 และช่วงบอส
- ข้อเขียน wrap บนจอแคบ มี label/error ที่อ่านได้ focus ชัด ไม่เลื่อนกรอบเกมหรือแย่ง focus หลังผู้เล่นกด Tab และ feedback แสดงด้วยข้อความและสี พร้อมไม่ทับไอเทม
- เปิดภาพขยายด้วย keyboard/ปิด Esc, focus trap ของสถานการณ์และมินิเกม, เล่นแนวตั้งต่อได้
- พรีวิวทั้งสองขนาดรักษา ID และฟิลด์เสริม; ตัวแสดงสูตรอัปเดตเป็น KaTeX 0.18.2 และ audit dependency ผ่าน
- เมื่อ storage ใช้ไม่ได้ ปิดการเปิดสถานการณ์อัตโนมัติ แต่ยังเปิดอ่านด้วยปุ่มได้

## ชุดทดสอบและหลักฐาน

| ชั้นทดสอบ | ขอบเขต |
|---|---|
| Node | schema, IDs, references, ภาพในโจทย์/สถานการณ์, fallback ตรงต้นฉบับ, grading, tolerance, callback, loader และกราฟมินิเกม |
| สุ่ม 10,000 รอบ | seed `20261009`; 30 ข้อ, PISA 15, วิชาละ 10, ไม่มีข้อซ้ำ, สถานการณ์ครบ/ติดกันและลำดับในกลุ่มตรงต้นฉบับ |
| Browser | Chromium/Firefox/WebKit; โหมดและ alias, IME/hotkeys/ส่งซ้ำ, ไอเทม, revive, restart 20 รอบพร้อมตรวจ animation loop เดียว/ล้าง timer บอส, popup, โหลดเสีย/ช้า/หาย, storage/CDN/image/audio ล้มเหลว |
| เล่นจริงอัตโนมัติ | กดตอบผ่าน UI พร้อม animation ครบ 30 ข้อจนชนะ และตอบผิดจนแพ้ก่อนครบ ตรวจ callback เต็มรอบและบางส่วน |
| เนื้อหา | render ครบ 135 ข้อจากทุกคลัง ตรวจข้อความและปุ่มที่เข้าถึงด้วยการเลื่อน |
| Responsive | 1920×1080, 1280×720, 1024×768, 844×390, 390×844; ลด viewport จำลองคีย์บอร์ดมือถือ และขยายตัวอักษร 200% |
| Visual | baseline 21 ภาพที่ตรวจด้วยตาบน Chromium/macOS; เมนู ปรนัย ข้อเขียน error/hint/ถูก/ผิด กราฟ popup revive ชนะ/แพ้ มือถือ มินิเกม Admin ตาราง/สูตร/หน่วยยาวและตัวเลือกกราฟ |

ผลจำนวนเทสต์สุดท้ายอยู่ในส่วน “ผลรันล่าสุด” ด้านล่าง

- ภาพก่อนแก้: `artifacts/before/`
- ภาพหลังแก้ที่ตรวจ: `artifacts/` และ `artifacts/visual-candidates/`
- ภาพ baseline ที่ตรวจแล้ว: `tests/e2e/visual-baselines/chromium/`
- ผลรัน/trace/screenshot: `playwright-report/`, `test-results/`
- log: `artifacts/unit-final.log`, `artifacts/final-browsers.log`, `artifacts/verification-browsers.log`, `artifacts/final-gameplay.log`, `artifacts/fallback-final.log`, `artifacts/audit-final.log`
- ความถี่รายข้อ: `artifacts/sampling-frequency.json` (รายงานประกอบ ไม่ใช้เกณฑ์ความถี่สุ่มทำให้ CI ล้ม)
- log รอบตรวจรับล่าสุด: `artifacts/acceptance-final.log`, `artifacts/admin-completion.log` (18 functional ผ่าน; visual พบความต่างที่คาดไว้จากช่องหมวดวิชา ซึ่งตรวจภาพและรับ baseline ใหม่แล้ว)
- trace/diff ของข้อค้นพบที่แก้แล้ว: `artifacts/full-run-evidence/` และ `artifacts/verification-evidence/`

โฟลเดอร์ artifacts/report เป็นไฟล์ในเครื่องที่ไม่ติด Git; baseline และโค้ดทดสอบติด Git เพื่อให้รันซ้ำได้

ภาพเปรียบเทียบซ่อน canvas **เฉพาะตอนถ่ายภาพ** โดยไม่ mask DOM ที่อยู่ด้านหน้า และ mask iframe เคลื่อนไหวในภาพ Admin การตรวจภาพเกมจริงและการเล่นพร้อม animation ทำแยกกัน ห้ามอัปเดต baseline เพื่อกลบความต่างที่ยังไม่ได้ตรวจ

## การรันซ้ำ

```sh
npm ci
npx playwright install chromium firefox webkit
npm test
npm run fallback:check
npm run test:e2e
```

Playwright เปิด server ที่พอร์ต 8766 เอง ข้อมูลทั้งหมดเป็น fixture ในเครื่อง callback ถูก intercept เป็นหน้า Mock LMS ไม่ส่งข้อมูลนักเรียนไปข้างนอก

CI บน Linux รัน Node และ browser functional tests ทั้งสาม engine ภาพ baseline ชุดนี้เป็น macOS จึงตรวจ visual regression ในสภาพแวดล้อม macOS เดิม หากจะเพิ่ม baseline ของ Linux ต้องตรวจภาพใหม่ก่อนรับเข้า Git

## ข้อจำกัดและสิ่งที่ต้องตรวจภายนอกก่อนใช้งานจริง

- [ ] Android Chrome และ iOS Safari บนเครื่องจริง โดยเฉพาะ keyboard/visual viewport, safe-area และหมุนจอ
- [ ] ผู้เรียน/ผู้ดูแลที่ไม่ได้พัฒนาระบบทำภารกิจโดยไม่มีผู้ชี้ปุ่ม บันทึกจุดลังเล การกดผิด และภารกิจที่ไม่สำเร็จ
- [ ] LMS จริงอ่าน `question_ids` และคำตอบปน string/index ได้ ตรวจคะแนนซ้ำจาก **เวอร์ชันคลังเดียวกับรอบสอบ**
- [ ] ขีดจำกัดความยาว URL ของ LMS/proxy จริง: transport ยังเป็น GET คำตอบภาษาไทยยาวอาจทำให้ URL ยาว แม้ mock round-trip ผ่าน
- [ ] ทบทวนเฉลยดีวีดี: `(52.50 - 10) / 2.50 × 3.20 = 54.4` แต่ระบบยังรับ `54` และ `54.4` ตามนโยบายเดิม
- [x] เปิดเกมผ่าน `file://` และตรวจ fallback ทั้งสาม engine แล้ว; HTTP server ยังเป็นเส้นทางหลักสำหรับ Admin/iframe
- [ ] File System Access API กับ native picker/สิทธิ์เขียนไฟล์จริง: เทสต์จำลอง picker, writable, ยกเลิกและ write error; export/import ตรวจไฟล์จริงแล้ว
- [ ] Native IME บนเครื่องจริง: เทสต์อัตโนมัติส่ง composition events และตรวจป้องกัน Enter ระหว่าง composition
- [ ] การใช้งาน screen reader จริงและ zoom ของ browser 200% (การทดสอบอัตโนมัติขยายข้อความ ไม่เทียบเท่า zoom/assistive technology ทุกแบบ)

บน macOS/WebKit การทดสอบเลื่อน focus ผ่านปุ่มใช้ `Alt+Tab` ตามการนำทาง Safari; Chromium/Firefox ใช้ `Tab` ส่วน Enter ส่งคำตอบและ Esc ปิด popup ตรวจทั้งสาม engine

## ภารกิจ usability ที่ส่งต่อให้ผู้ทดสอบภายนอก

ให้ผู้ทดสอบเริ่มเกม อ่านสถานการณ์ กลับมาตอบปรนัยและข้อเขียน ลองส่งว่าง ใช้ไอเทม อ่านผล และเริ่มใหม่ โดยไม่ชี้ปุ่ม ส่วนผู้ดูแลให้แทนข้อ PISA ด้วยข้อเขียน พรีวิวสองขนาด ส่งออก/นำเข้าข้อสอบและสถานการณ์ แล้วเปิดกลับ ตรวจว่ารหัสและเกณฑ์คำตอบครบ บันทึกภารกิจสำเร็จ/ไม่สำเร็จ เวลาที่ใช้ จุดลังเลและการกดผิด แยกปัญหาการอ่าน/ทำภารกิจ (P1) กับช่องไฟ/ตกแต่ง (P2) ยังไม่ได้ดำเนินการกับผู้ทดสอบภายนอก

## ภาพและ callback ที่เปิดตรวจได้

- ก่อนแก้ [เกม](artifacts/before/game.png) / [Admin](artifacts/before/admin.png)
- หลังแก้ [เกม](artifacts/game-final-live.png) / [Admin ข้อเขียน](artifacts/visual-candidates/admin-input.png)
- เล่นครบจริง [ชนะ 30/30](artifacts/gameplay-evidence/test-results/system-complete-real-exam--202ac-oss-every-wave-and-callback-chromium/actual-victory.png) / [แพ้ก่อนครบ](artifacts/gameplay-evidence/test-results/system-real-exam-loses-ear-e0e05-s-an-aligned-partial-result-chromium/actual-gameover.png)
- Mock LMS [รอบครบ](artifacts/gameplay-evidence/test-results/system-complete-real-exam--202ac-oss-every-wave-and-callback-chromium/mock-callback.json) / [รอบบางส่วน](artifacts/gameplay-evidence/test-results/system-real-exam-loses-ear-e0e05-s-an-aligned-partial-result-chromium/mock-callback.json)

## ผลรันล่าสุด

- Node: **25/25 ผ่าน** รวมการสุ่ม 10,000 รอบด้วย seed `20261009`
- Browser: **109 กรณีไม่ซ้ำผ่านเมื่อรวมรอบตรวจรับและรอบเล่นจริง** บน Chromium/Firefox/WebKit; visual 21 ภาพนับเป็นหนึ่งกรณี
- รอบตรวจรับ 103 กรณี: 102 ผ่าน และ 1 เริ่มไม่ได้เพราะไฟล์ `game.js` จาก local server เกิด `net::ERR_CONNECTION_RESET` (ยืนยันจาก trace ไม่มี assertion ด้าน postMessage ทำงานในรอบนั้น) รันทดสอบ postMessage ซ้ำครบสาม engine **3/3 ผ่าน** โดยไม่แก้โค้ดหรือเพิ่ม retry อัตโนมัติ ดู `artifacts/acceptance-final.log`, `artifacts/postmessage-verification.log` และ `artifacts/acceptance-evidence/`
- ภาพ visual **21/21 ผ่าน** หลังตรวจความต่างของฟอร์มหมวดวิชา Admin ด้วยตาและรับ baseline สองภาพที่เปลี่ยน
- เล่น Exam จนชนะ/แพ้ด้วย animation จริง: **6/6 ผ่าน** บนสาม engine ก่อนรอบตรวจรับล่าสุด; หลังจากนั้นแก้เฉพาะ Admin ไม่มีการเปลี่ยนกติกาเกม
- fallback ตรง JSON, syntax ของ JavaScript และ Admin inline script, `git diff --check` ผ่าน; dependency audit **0 vulnerabilities**

ผล browser นับรวมกรณีไม่ซ้ำระหว่างรอบตรวจรับและรอบเล่นจริง ไม่รวมการรันซ้ำหรือการเก็บภาพ candidate เป็นจำนวนเทสต์เพิ่ม CI เพิ่มแล้วแต่ยังไม่ได้รันบน GitHub; ผลทั้งหมดข้างต้นรันในเครื่องนี้
