// Quiz data loader with solid local fallbacks in case of CORS (file:// protocol)
let QUESTIONS = [];
/** @type {Array<{id:string,title:string,body:string,images?:string[],order?:number}>} */
let SCENARIOS = [];
/** @type {Record<string, {id:string,title:string,body:string,images?:string[],order?:number}>} */
let SCENARIOS_BY_ID = {};

// Fallback questions for Math (คณิตศาสตร์)
const FALLBACK_MATH = [
    {
        "q": "สถานการณ์ “FitD Fitness”\nฟิตเนสแห่งหนึ่ง มีรายละเอียดค่าบริการ ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รายการ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Plan A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Plan B</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าสมัครสมาชิกรายปี</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">6,000 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไม่เสียค่าสมาชิกรายปี</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าเข้ารายเดือน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,500 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,700 บาท</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าเทรนเนอร์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สำหรับ 3 ชั่วโมงแรก คิดค่าบริการ 3,000 บาทโดยชั่วโมงต่อไปคิดค่าบริการ ชั่วโมงละ 500 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงละ 750 บาท</td></tr></table>\nหมายเหตุ เศษของนาทีจะคิดเป็น 1 ชั่วโมง\n\nข้อ 1. ถ้าวินต้องการใช้บริการฟิตเนสแห่งนี้เป็นระยะเวลา 1 ปี แล้ววินควรเลือก PLAN ใดจึงเสียค่าบริการถูกกว่า และถูกกว่ากี่บาท",
        "c": [
            "PLAN A เพราะ ประหยัดกว่า PLAN B 8,400 บาท",
            "PLAN A เพราะ ประหยัดกว่า PLAN B 7,400 บาท",
            "PLAN B เพราะ ประหยัดกว่า PLAN A 8,400 บาท",
            "PLAN B เพราะ ประหยัดกว่า PLAN A 7,400 บาท"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “FitD Fitness”\nฟิตเนสแห่งหนึ่ง มีรายละเอียดค่าบริการ ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รายการ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Plan A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Plan B</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าสมัครสมาชิกรายปี</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">6,000 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไม่เสียค่าสมาชิกรายปี</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าเข้ารายเดือน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,500 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,700 บาท</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าเทรนเนอร์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สำหรับ 3 ชั่วโมงแรก คิดค่าบริการ 3,000 บาทโดยชั่วโมงต่อไปคิดค่าบริการ ชั่วโมงละ 500 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงละ 750 บาท</td></tr></table>\nหมายเหตุ เศษของนาทีจะคิดเป็น 1 ชั่วโมง\n\nข้อ 2. ถ้าวินไม่ต้องการสมัครสมาชิกรายปี แล้ววินควรใช้บริการอย่างมากกี่เดือน จึงจะคุ้มค่า",
        "c": [
            "3 เดือน",
            "4 เดือน",
            "5 เดือน",
            "6 เดือน"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “FitD Fitness”\nฟิตเนสแห่งหนึ่ง มีรายละเอียดค่าบริการ ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รายการ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Plan A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Plan B</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าสมัครสมาชิกรายปี</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">6,000 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไม่เสียค่าสมาชิกรายปี</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าเข้ารายเดือน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,500 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,700 บาท</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าเทรนเนอร์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สำหรับ 3 ชั่วโมงแรก คิดค่าบริการ 3,000 บาทโดยชั่วโมงต่อไปคิดค่าบริการ ชั่วโมงละ 500 บาท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงละ 750 บาท</td></tr></table>\nหมายเหตุ เศษของนาทีจะคิดเป็น 1 ชั่วโมง\n\nข้อ 3. การบริการของเทรนเนอร์ทั้ง 2 PLAN มีความเหมาะสมกับจำนวนชั่วโมงให้บริการ ตรงกับข้อใด\nPLAN A เหมาะกับการให้บริการ มากกว่า 6 ชั่วโมงขึ้นไป\nPLAN B เหมาะกับการให้บริการ ไม่เกิน 5 ชั่วโมงแรก\nPLAN A เหมาะกับการให้บริการ ไม่เกิน 5 ชั่วโมงแรก\nPLAN B เหมาะกับการให้บริการ มากกว่า 6 ชั่วโมงขึ้นไป\nPLAN A เหมาะกับการให้บริการ ตั้งแต่ 6 ชั่วโมงขึ้นไป\nPLAN B เหมาะกับการให้บริการ น้อยกว่า 5 ชั่วโมงแรก\nPLAN A เหมาะกับการให้บริการ น้อยกว่า 5 ชั่วโมงแรก\nPLAN B เหมาะกับการให้บริการ ตั้งแต่ 6 ชั่วโมงขึ้นไป",
        "c": [
            "PLAN A เหมาะกับการให้บริการ มากกว่า 6 ชั่วโมงขึ้นไป<br>PLAN B เหมาะกับการให้บริการ ไม่เกิน 5 ชั่วโมงแรก",
            "PLAN A เหมาะกับการให้บริการ ไม่เกิน 5 ชั่วโมงแรก<br>PLAN B เหมาะกับการให้บริการ มากกว่า 6 ชั่วโมงขึ้นไป",
            "PLAN A เหมาะกับการให้บริการ ตั้งแต่ 6 ชั่วโมงขึ้นไป<br>PLAN B เหมาะกับการให้บริการ น้อยกว่า 5 ชั่วโมงแรก",
            "PLAN A เหมาะกับการให้บริการ น้อยกว่า 5 ชั่วโมงแรก<br>PLAN B เหมาะกับการให้บริการ ตั้งแต่ 6 ชั่วโมงขึ้นไป"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “การแพร่พันธุ์ของแบคทีเรีย”\nแบคทีเรียเป็นสิ่งมีชีวิตที่สืบพันธุ์โดยไม่อาศัยเพศ ใช้การแพร่พันธุ์ด้วยการแบ่งเซลล์ของตนเองจึงทำให้แบคทีเรียเซลล์ใหม่มีลักษณะเหมือนเซลล์เดิม ซึ่งแบคทีเรียแต่ละสายพันธุ์จะมีอัตราการแพร่พันธุ์ที่แตกต่างกัน จากการทดลองในห้องทดลองแห่งหนึ่งพบว่าแบคทีเรียสายพันธุ์ที่ศึกษามีจำนวนในแต่ละชั่วโมงเป็นดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สายพันธุ์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนแบคทีเรีย (ร้อยเซลล์) ขณะเวลาต่าง ๆ</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">เริ่มต้น</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 1</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 2</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 3</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">12</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">20</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">28</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">B</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">9</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">16</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">25</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">C</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">8</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">16</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">32</td></tr></table>\n\nข้อ 4. นักวิจัยคนใดเขียนรายงานสรุปจำนวนแบคทีเรียในชั่วโมงที่ 4 ไม่ถูกต้อง",
        "c": [
            "อัลเบิร์ตรายงานว่าจำนวนแบคทีเรียสายพันธุ์ A น้อยกว่าสายพันธุ์ C อยู่ 28 เซลล์",
            "ชาร์ลรายงานว่าจำนวนแบคทีเรียสายพันธุ์ A และสายพันธุ์ B มีจำนวนเท่ากัน",
            "มารีรายงานว่าจำนวนแบคทีเรียสายพันธุ์ C มีจำนวนมากที่สุด",
            "โรซาลินด์รายงานว่าจำนวนแบคทีเรียรวมทุกสายพันธ์มีจำนวน 13,600 เซลล์"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “การแพร่พันธุ์ของแบคทีเรีย”\nแบคทีเรียเป็นสิ่งมีชีวิตที่สืบพันธุ์โดยไม่อาศัยเพศ ใช้การแพร่พันธุ์ด้วยการแบ่งเซลล์ของตนเองจึงทำให้แบคทีเรียเซลล์ใหม่มีลักษณะเหมือนเซลล์เดิม ซึ่งแบคทีเรียแต่ละสายพันธุ์จะมีอัตราการแพร่พันธุ์ที่แตกต่างกัน จากการทดลองในห้องทดลองแห่งหนึ่งพบว่าแบคทีเรียสายพันธุ์ที่ศึกษามีจำนวนในแต่ละชั่วโมงเป็นดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สายพันธุ์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนแบคทีเรีย (ร้อยเซลล์) ขณะเวลาต่าง ๆ</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">เริ่มต้น</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 1</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 2</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 3</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">12</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">20</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">28</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">B</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">9</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">16</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">25</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">C</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">8</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">16</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">32</td></tr></table>\n\nข้อ 5. หากแบคทีเรียทั้ง 3 สายพันธุ์มีลักษณะการแพร่พันธุ์ที่คงตามรูปแบบข้างต้นต่อไปเรื่อย ๆ แล้วต้องใช้เวลาอย่างน้อยกี่ชั่วโมงแบคทีเรียทุกสายพันธุ์จึงจะมีจำนวนเกิน 5,000 เซลล์",
        "c": [
            "5 ชั่วโมง",
            "6 ชั่วโมง",
            "7 ชั่วโมง",
            "8 ชั่วโมง"
        ],
        "a": 1,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “การแพร่พันธุ์ของแบคทีเรีย”\nแบคทีเรียเป็นสิ่งมีชีวิตที่สืบพันธุ์โดยไม่อาศัยเพศ ใช้การแพร่พันธุ์ด้วยการแบ่งเซลล์ของตนเองจึงทำให้แบคทีเรียเซลล์ใหม่มีลักษณะเหมือนเซลล์เดิม ซึ่งแบคทีเรียแต่ละสายพันธุ์จะมีอัตราการแพร่พันธุ์ที่แตกต่างกัน จากการทดลองในห้องทดลองแห่งหนึ่งพบว่าแบคทีเรียสายพันธุ์ที่ศึกษามีจำนวนในแต่ละชั่วโมงเป็นดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สายพันธุ์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนแบคทีเรีย (ร้อยเซลล์) ขณะเวลาต่าง ๆ</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">เริ่มต้น</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 1</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 2</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชั่วโมงที่ 3</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">12</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">20</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">28</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">B</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">9</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">16</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">25</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">C</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">8</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">16</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">32</td></tr></table>\n\nข้อ 6. หากเริ่มเพาะแบคทีเรียแต่ละสายพันธุ์จำนวน 400 เซลล์ที่เวลาต่างกัน ดังนี้\nแบคทีเรียสายพันธุ์ A เริ่มเพาะเมื่อ 12:00\nแบคทีเรียสายพันธุ์ B เริ่มเพาะเมื่อ 13:00\nแบคทีเรียสายพันธุ์ C เริ่มเพาะเมื่อ 15:00\nถ้าต้องการใช้แบคทีเรียในการศึกษาอย่างน้อยสายพันธุ์ละ 10,000 เซลล์ ณ เวลาดังข้อใดจะมีจำนวนแบคทีเรียในแต่ละสายพันธุ์เพียงพอสำหรับศึกษาตามที่ระบุ",
        "c": [
            "เวลา 18:00 มีเพียงสายพันธุ์ A ที่มีจำนวนเพียงพอสำหรับศึกษา",
            "เวลา 20:00 มีเพียงสายพันธุ์ B ที่มีจำนวนเพียงพอสำหรับศึกษา",
            "เวลา 22:00 เฉพาะสายพันธุ์ B และสายพันธุ์ C ที่มีจำนวนเพียงพอสำหรับศึกษา",
            "เวลา 00:00 เฉพาะสายพันธุ์ A และสายพันธุ์ C ที่มีจำนวนเพียงพอสำหรับศึกษา"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ร้านเจลาโต้”\n<img src=\"../assets/images/questions/math/image1.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nประตูพื้นที่สำหรับนั่งเคาน์เตอร์พื้นที่สำหรับให้บริการประตูพื้นที่สำหรับนั่งเคาน์เตอร์พื้นที่สำหรับให้บริการแบบแปลนร้านเจลาโต้ของคุณเต้ เป็นดังนี้\nกำหนดให้ รูปสี่เหลี่ยมจัตุรัสแต่ละรูปในช่องตาราง แทน 1.5 เมตร x 1.5 เมตร\n\nข้อ 7. ถ้าคุณเต้ต้องการปูกระเบื้องพื้นที่บริเวณสีขาว ต้องใช้กระเบื้องอย่างน้อยกี่แผ่น หากกระเบื้องมีขนาด50 เซนติเมตร x 50 เซนติเมตร",
        "c": [
            "33 แผ่น",
            "82 แผ่น",
            "324 แผ่น",
            "819 แผ่น"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ร้านเจลาโต้”\n<img src=\"../assets/images/questions/math/image1.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nประตูพื้นที่สำหรับนั่งเคาน์เตอร์พื้นที่สำหรับให้บริการประตูพื้นที่สำหรับนั่งเคาน์เตอร์พื้นที่สำหรับให้บริการแบบแปลนร้านเจลาโต้ของคุณเต้ เป็นดังนี้\nกำหนดให้ รูปสี่เหลี่ยมจัตุรัสแต่ละรูปในช่องตาราง แทน 1.5 เมตร x 1.5 เมตร\n\nข้อ 8. จากแบบการวางโต๊ะเดิมในร้านมีลักษณะ ดังรูป\n<img src=\"../assets/images/questions/math/image3.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nพื้นที่สำหรับนั่งประตูโต๊ะ Aโต๊ะ Cโต๊ะ Bโต๊ะ Eโต๊ะ Dโต๊ะ Gโต๊ะ Fพื้นที่สำหรับนั่งประตูโต๊ะ Aโต๊ะ Cโต๊ะ Bโต๊ะ Eโต๊ะ Dโต๊ะ Gโต๊ะ F\nถ้าคุณเต้ต้องการจัดผังการวางโต๊ะใหม่ โดยมีเงื่อนไข ดังนี้\nมีโต๊ะคู่เหลือเพียงคู่เดียว ส่วนที่เหลือแยกเป็นโต๊ะเดี่ยว\nโต๊ะเดี่ยวแต่ละตัวต้องอยู่ห่างจากโต๊ะตัวอื่น อย่างน้อย 1.5 เมตร\nแล้วคุณเต้ต้องจัดโต๊ะตามขั้นตอนในข้อใดต่อไปนี้ จึงจะสอดคล้องกับเงื่อนไขข้างต้น",
        "c": [
            "โต๊ะ B เลื่อนไปทางซ้าย 1.5 เมตร โต๊ะ E เลื่อนไปทางขวา 1.5 เมตร    และโต๊ะ F เลื่อนไปทางซ้าย 1.5 เมตร",
            "โต๊ะ C เลื่อนไปลง 1.5 เมตร โต๊ะ E เลื่อนไปทางขวา 1.5 เมตร          และโต๊ะ F เลื่อนไปทางซ้าย 3 เมตร",
            "โต๊ะ B เลื่อนไปทางซ้าย 3 เมตร โต๊ะ E เลื่อนไปทางขวา 3 เมตร    และโต๊ะ F เลื่อนไปทางซ้าย 1.5 เมตร",
            "โต๊ะ B เลื่อนไปทางซ้าย 1.5 เมตร   และโต๊ะ F เลื่อนไปทางซ้าย 1.5 เมตรแล้วเลื่อนขึ้น 1.5 เมตร"
        ],
        "a": 2,
        "img": "../assets/images/questions/math/image3.png",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ร้านเจลาโต้”\n<img src=\"../assets/images/questions/math/image1.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nประตูพื้นที่สำหรับนั่งเคาน์เตอร์พื้นที่สำหรับให้บริการประตูพื้นที่สำหรับนั่งเคาน์เตอร์พื้นที่สำหรับให้บริการแบบแปลนร้านเจลาโต้ของคุณเต้ เป็นดังนี้\nกำหนดให้ รูปสี่เหลี่ยมจัตุรัสแต่ละรูปในช่องตาราง แทน 1.5 เมตร x 1.5 เมตร\n\nข้อ 9. จากภาพมุมมอง 3 มิติ ของเคาน์เตอร์ ที่กำหนดให้\n<img src=\"../assets/images/questions/math/image5.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nข้อใดแสดงภาพมุมมองต่าง ๆ ได้ถูกต้อง",
        "c": [
            "<table style=\"width:100%;border-collapse:collapse;margin:0;\"><tr><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image6.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านบน</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image7.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านหน้า</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image8.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านข้าง</div></td></tr></table>",
            "<table style=\"width:100%;border-collapse:collapse;margin:0;\"><tr><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image9.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านบน</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image7.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านหน้า</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image8.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านข้าง</div></td></tr></table>",
            "<table style=\"width:100%;border-collapse:collapse;margin:0;\"><tr><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image9.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านบน</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image7.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านหน้า</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image10.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านข้าง</div></td></tr></table>",
            "<table style=\"width:100%;border-collapse:collapse;margin:0;\"><tr><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image6.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านบน</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image11.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านหน้า</div></td><td style=\"border:1px solid #7c673d;padding:4px;text-align:center;background:#fff;\"><img src=\"../assets/images/questions/math/image10.png\" style=\"max-height:80px;vertical-align:middle;margin:2px;background:#fff;padding:3px;border-radius:3px;\" /><div style=\"font-size:0.75em;\">มุมมองด้านข้าง</div></td></tr></table>"
        ],
        "a": 0,
        "img": "../assets/images/questions/math/image5.png",
        "showImg": false
    },
    {
        "q": "สถานการณ์ \"พลังงานแสงอาทิตย์\"\nหลายครอบครัวในประเทศไทย เลือกติดตั้งแผงโซลาร์เซลล์บนหลังคาบ้าน เพื่อผลิตไฟฟ้าจากพลังงานแสงอาทิตย์ สำหรับใช้ในบ้าน เพราะช่วยลดค่าไฟและลดการปล่อยก๊าซเรือนกระจก แต่การติดตั้งโซลาร์เซลล์นั้นจำเป็นต้องพิจารณาปัจจัยหลายด้าน เช่น พื้นที่ติดตั้ง ขนาดของแผง ระยะห่างเพื่อความปลอดภัย งบประมาณในการลงทุน โดยครอบครัวของสมชายมีแผนติดตั้งแผงโซลาร์เซลล์บนหลังคาบ้านจึงปรึกษากับวิศวกรให้สำรวจพื้นที่และจัดทำแผนผังหลังคา แสดงพื้นที่เป็นมุมมองจากด้านบน ในมาตราส่วน 1 : 200 เซนติเมตร ดังตาราง\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ส่วนของหลังคา</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ความกว้างในแผนผัง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ความยาวในแผนผัง</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หลังคาบ้าน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">6 เซนติเมตร</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">7 เซนติเมตร</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หลังคาโรงรถ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4 เซนติเมตร</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5 เซนติเมตร</td></tr></table>\nจากการสำรวจ วิศวกรแนะนำให้ติดตั้งแผงโซลาร์เซลล์เฉพาะบริเวณ หลังคาบ้าน เนื่องจากหลังคาโรงรถมีเงาบดบังในช่วงบ่าย ส่งผลทำให้ประสิทธิภาพการผลิตไฟฟ้าลดลง และมีข้อมูลสำหรับการติดตั้ง ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รายการ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ข้อมูล</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ขนาดแผงโซลาร์เซลล์ ต่อแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1 เมตร × 1.6 เมตร</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ระยะห่างจากขอบหลังคา</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อย่างน้อย 0.5 เมตร ทุกด้าน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ระยะห่างระหว่างแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อย่างน้อย 0.2 เมตร ทุกด้าน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">กำลังการผลิตไฟฟ้า ต่อแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">400 วัตต์</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ราคา ต่อแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5,500 บาท</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าติดตั้งโซลาร์เซลล์ เหมาจ่าย</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">25,000</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าไฟฟ้าเฉลี่ย</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4 บาท ต่อ หน่วย (1 หน่วย = 1,000 วัตต์)</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนชั่วโมงแสงแดดที่ได้รับเฉลี่ยต่อวัน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4 ชั่วโมง</td></tr></table>\nหมายเหตุ\n1. แผงโซลาร์เซลล์ทุกแผงสามารถผลิตไฟฟ้าได้เต็มกำลังตลอดช่วงเวลาที่ได้รับแสงแดดเฉลี่ย\n2. พลังงานไฟฟ้าที่ผลิตได้จากแผงโซลาร์เซลล์ในแต่ละวัน ถูกนำไปใช้ภายในบ้านได้ทั้งหมด    โดยไม่มีพลังงานไฟฟ้าส่วนเกินเหลือทิ้ง\n3. อัตราค่าไฟฟ้าคงที่ตลอดระยะเวลาที่พิจารณา\n\nข้อ 10. ถ้าสมชายติดตั้งแผงโซลาร์เซลล์บนหลังคาบ้านให้ได้จำนวนมากที่สุด ตามเงื่อนไขที่วิศวกรกำหนด นายสมชายจะต้องใช้เวลาประมาณกี่เดือน จึงจะประหยัดค่าไฟฟ้าสะสมได้เท่ากับเงินที่จ่ายสำหรับการติดตั้งแผงโซลาร์เซลล์\n<img src=\"../assets/images/questions/math/image12.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />",
        "c": [
            "ประมาณ 29 เดือน",
            "ประมาณ 31 เดือน",
            "ประมาณ 33 เดือน",
            "ประมาณ 35 เดือน"
        ],
        "a": 1,
        "img": "../assets/images/questions/math/image12.png",
        "showImg": false
    },
    {
        "q": "สถานการณ์ \"พลังงานแสงอาทิตย์\"\nหลายครอบครัวในประเทศไทย เลือกติดตั้งแผงโซลาร์เซลล์บนหลังคาบ้าน เพื่อผลิตไฟฟ้าจากพลังงานแสงอาทิตย์ สำหรับใช้ในบ้าน เพราะช่วยลดค่าไฟและลดการปล่อยก๊าซเรือนกระจก แต่การติดตั้งโซลาร์เซลล์นั้นจำเป็นต้องพิจารณาปัจจัยหลายด้าน เช่น พื้นที่ติดตั้ง ขนาดของแผง ระยะห่างเพื่อความปลอดภัย งบประมาณในการลงทุน โดยครอบครัวของสมชายมีแผนติดตั้งแผงโซลาร์เซลล์บนหลังคาบ้านจึงปรึกษากับวิศวกรให้สำรวจพื้นที่และจัดทำแผนผังหลังคา แสดงพื้นที่เป็นมุมมองจากด้านบน ในมาตราส่วน 1 : 200 เซนติเมตร ดังตาราง\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ส่วนของหลังคา</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ความกว้างในแผนผัง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ความยาวในแผนผัง</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หลังคาบ้าน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">6 เซนติเมตร</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">7 เซนติเมตร</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หลังคาโรงรถ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4 เซนติเมตร</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5 เซนติเมตร</td></tr></table>\nจากการสำรวจ วิศวกรแนะนำให้ติดตั้งแผงโซลาร์เซลล์เฉพาะบริเวณ หลังคาบ้าน เนื่องจากหลังคาโรงรถมีเงาบดบังในช่วงบ่าย ส่งผลทำให้ประสิทธิภาพการผลิตไฟฟ้าลดลง และมีข้อมูลสำหรับการติดตั้ง ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รายการ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ข้อมูล</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ขนาดแผงโซลาร์เซลล์ ต่อแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1 เมตร × 1.6 เมตร</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ระยะห่างจากขอบหลังคา</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อย่างน้อย 0.5 เมตร ทุกด้าน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ระยะห่างระหว่างแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อย่างน้อย 0.2 เมตร ทุกด้าน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">กำลังการผลิตไฟฟ้า ต่อแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">400 วัตต์</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ราคา ต่อแผง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5,500 บาท</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าติดตั้งโซลาร์เซลล์ เหมาจ่าย</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">25,000</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค่าไฟฟ้าเฉลี่ย</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4 บาท ต่อ หน่วย (1 หน่วย = 1,000 วัตต์)</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนชั่วโมงแสงแดดที่ได้รับเฉลี่ยต่อวัน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">4 ชั่วโมง</td></tr></table>\nหมายเหตุ\n1. แผงโซลาร์เซลล์ทุกแผงสามารถผลิตไฟฟ้าได้เต็มกำลังตลอดช่วงเวลาที่ได้รับแสงแดดเฉลี่ย\n2. พลังงานไฟฟ้าที่ผลิตได้จากแผงโซลาร์เซลล์ในแต่ละวัน ถูกนำไปใช้ภายในบ้านได้ทั้งหมด    โดยไม่มีพลังงานไฟฟ้าส่วนเกินเหลือทิ้ง\n3. อัตราค่าไฟฟ้าคงที่ตลอดระยะเวลาที่พิจารณา\n\nข้อ 11. นายสมชายต้องการซื้อที่ดินเพื่อปลูกบ้าน โดยต้องการที่ดินที่มีพื้นที่ใช้สอยมากที่สุด ถ้านายหน้าขายที่ดินแห่งหนึ่งได้ทำการเสนอขายที่ดิน 3 แปลง ในราคาเดียวกัน ซึ่งจัดทำแผนผังที่ดินโดยใช้มาตราส่วนเดียวกับแผนผังหลังคา และที่ดินแต่ละแปลงมีรูปร่างดังนี้\n<img src=\"../assets/images/questions/math/image13.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">B</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">C</td></tr></table>\nกำหนดให้ แต่ละช่องเป็นสี่เหลี่ยมจัตุรัสยาวด้านละ 1 เซนติเมตร\nแล้วนายสมชายควรซื้อที่ดินแปลงใดมากที่สุด เพราะเหตุใด",
        "c": [
            "แปลง A เพราะมีขนาดพื้นที่มากที่สุด คือ 90 ตารางเมตร",
            "แปลง B เพราะมีขนาดพื้นที่มากที่สุด คือ 86 ตารางเมตร",
            "แปลง C เพราะมีขนาดพื้นที่มากที่สุด คือ 92 ตารางเมตร",
            "แปลงใดก็ได้ เพราะมีขนาดพื้นที่เท่ากัน คือ 86 ตารางเมตร"
        ],
        "a": 0,
        "img": "../assets/images/questions/math/image13.png",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ระยะทางที่สั้นที่สุด”\n<img src=\"../assets/images/questions/math/image14.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nจากแผนภาพที่กำหนดให้\n\nข้อ 12. ระยะทางที่สั้นที่สุดจากบ้านไปโรงเรียนตรงกับข้อใด",
        "c": [
            "10 กิโลเมตร",
            "12 กิโลเมตร",
            "14 กิโลเมตร",
            "16 กิโลเมตร"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ระยะทางที่สั้นที่สุด”\n<img src=\"../assets/images/questions/math/image14.png\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nจากแผนภาพที่กำหนดให้\n\nข้อ 13. ถ้าครูท่านหนึ่งต้องเติมน้ำมันเพื่อไป – กลับระหว่างบ้านและโรงเรียนเป็นจำนวน 5 วัน ควรเติมน้ำมันอย่างน้อยกี่ลิตร (น้ำมัน 1 ลิตร ต่อระยะทาง 8 กิโลเมตร)",
        "c": [
            "5 ลิตร",
            "10 ลิตร",
            "15 ลิตร",
            "20 ลิตร"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “รถไฟฟ้า”\n<img src=\"../assets/images/questions/math/image15.jpeg\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nรถไฟฟ้าขบวนหนึ่งมีหน้าตัดเป็นรูปสี่เหลี่ยมมุมฉาก ที่มีความกว้าง 3 เมตร ความยาวขบวนละ60 เมตร และสูง 4 เมตร ซึ่งมีจำนวน 4 ตู้ต่อ 1 ขบวน\n\nข้อ 14. จากปริมาตรอากาศต่อ 1 คน อยู่ที่ประมาณ 6 ลิตรต่อนาที ถ้ารถไฟฟ้าใช้ระยะเวลาเดินทางจากต้นทางไปยังปลายทาง 30 นาที แล้วปริมาตรอากาศในรถไฟฟ้า 1 ตู้ จะเพียงพอต่อผู้โดยสารมากที่สุดกี่คน",
        "c": [
            "750 คน",
            "1,000 คน",
            "1,250 คน",
            "1,500 คน"
        ],
        "a": 1,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “รถไฟฟ้า”\n<img src=\"../assets/images/questions/math/image15.jpeg\" style=\"max-width:100%;max-height:280px;display:block;margin:10px auto;background:#fff;padding:8px;border-radius:6px;border:2px solid #7c673d;cursor:zoom-in;\" />\nรถไฟฟ้าขบวนหนึ่งมีหน้าตัดเป็นรูปสี่เหลี่ยมมุมฉาก ที่มีความกว้าง 3 เมตร ความยาวขบวนละ60 เมตร และสูง 4 เมตร ซึ่งมีจำนวน 4 ตู้ต่อ 1 ขบวน\n\nข้อ 15. ถ้านักเรียนและเพื่อนอีก 5 คน เดินทางโดยรถไฟฟ้าขบวนนี้ แต่ที่ว่างเหลืออยู่เพียง 3 ตู้ ตู้ละ 2 คน\nแล้วจะมีวิธีการจับคู่ทั้งหมดกี่วิธี",
        "c": [
            "3 วิธี",
            "6 วิธี",
            "12 วิธี",
            "15 วิธี"
        ],
        "a": 3,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ภารกิจพิชิตบอส”\nLegacy of Valor เป็นเกมสวมบทบาทออนไลน์แนวผจญภัยแฟนตาซี ที่ผู้เล่นรับบทเป็นผู้กล้าผู้ถูกเลือกให้สืบทอดพลังแห่งวีรชน โดยผู้เล่นสามารถออกสำรวจโลก ต่อสู้กับมอนสเตอร์ ทำภารกิจรายวัน(Daily Quest) เพื่อสะสมคริสตัล (Crystal) ซึ่งเป็นทรัพยากรสำคัญในการแลกไอเทมพิเศษต่าง ๆ ภายในเกม\nLegacy of Valor กำหนดกิจกรรมพิเศษ World Boss: Ancient Dragon ซึ่งมีบอสระดับตำนานที่ให้ผู้เล่นได้เข้าร่วมต่อสู้ โดยกิลด์ Hall of Legends ได้วางแผนส่งผู้เล่น 2 คนเข้าร่วมกิจกรรม ซึ่งข้อมูลผู้เล่นทั้ง 2 คน จาก กิลด์ Hall of Legends เป็นดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผู้เล่น</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัลสะสม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัลที่ได้รับจากภารกิจรายวัน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ปอง (Warrior)</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,400</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">150</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ปราย (Mage)</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">800</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">250</td></tr></table>\nเพื่อให้สามารถล่าบอสระดับตำนานได้ ผู้เล่นแต่ละอาชีพต้องเตรียมอุปกรณ์ตามที่กำหนด ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อุปกรณ์สำหรับ Warrior</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อุปกรณ์สำหรับ Mage</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไอเทม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัล</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไอเทม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัล</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ดาบราชันสงคราม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,500</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คทาแห่งภูติ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,000</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โล่ผู้พิทักษ์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,800</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชุดจอมเวท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,200</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ยาเพิ่มพลังโจมตี</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">700</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ยาเพิ่มพลังเวทย์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,200</td></tr></table>\nโดยนอกจากการร่วมภารกิจรายวันเพื่อสะสมคริสตัลแล้ว ผู้เล่นยังสามารถเติมเงินเพื่อแลก Point ได้ตามเงื่อนไขดังนี้\n1. เมื่อเติมเงิน 1 บาท จะได้รับ Point 10 แต้ม\n2. ปกติ ทุก ๆ Point 10 แต้ม สามารถแลกคริสตัลได้ 3 เม็ด\nสำหรับช่วงเวลาร่วมกิจกรรม World Boss: Ancient Dragon มีสิทธิพิเศษสำหรับผู้เล่น ดังนี้1. เมื่อเติมเงินได้รับ Point พิเศษอีก 50%\n2. ลด Point 20% สำหรับแลกคริสตัลได้ 3 เม็ด\n\nข้อ 16. ถ้ากิจกรรมพิเศษ World Boss: Ancient Dragon จะเปิดให้เข้าร่วมอีก 20 วัน แล้วผู้เล่นคนใดสามารถเตรียมอุปกรณ์ได้ครบตามที่กำหนด",
        "c": [
            "ปองและปรายสามารถเตรียมอุปกรณ์ได้ครบทั้งคู่",
            "ปองเตรียมอุปกรณ์ได้ครบ แต่ปรายเตรียมไม่ครบ",
            "ปรายเตรียมอุปกรณ์ได้ครบ แต่ปองเตรียมไม่ครบ",
            "ปองและปรายไม่สามารถเตรียมอุปกรณ์ได้ครบทั้งคู่"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ภารกิจพิชิตบอส”\nLegacy of Valor เป็นเกมสวมบทบาทออนไลน์แนวผจญภัยแฟนตาซี ที่ผู้เล่นรับบทเป็นผู้กล้าผู้ถูกเลือกให้สืบทอดพลังแห่งวีรชน โดยผู้เล่นสามารถออกสำรวจโลก ต่อสู้กับมอนสเตอร์ ทำภารกิจรายวัน(Daily Quest) เพื่อสะสมคริสตัล (Crystal) ซึ่งเป็นทรัพยากรสำคัญในการแลกไอเทมพิเศษต่าง ๆ ภายในเกม\nLegacy of Valor กำหนดกิจกรรมพิเศษ World Boss: Ancient Dragon ซึ่งมีบอสระดับตำนานที่ให้ผู้เล่นได้เข้าร่วมต่อสู้ โดยกิลด์ Hall of Legends ได้วางแผนส่งผู้เล่น 2 คนเข้าร่วมกิจกรรม ซึ่งข้อมูลผู้เล่นทั้ง 2 คน จาก กิลด์ Hall of Legends เป็นดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผู้เล่น</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัลสะสม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัลที่ได้รับจากภารกิจรายวัน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ปอง (Warrior)</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,400</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">150</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ปราย (Mage)</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">800</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">250</td></tr></table>\nเพื่อให้สามารถล่าบอสระดับตำนานได้ ผู้เล่นแต่ละอาชีพต้องเตรียมอุปกรณ์ตามที่กำหนด ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อุปกรณ์สำหรับ Warrior</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อุปกรณ์สำหรับ Mage</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไอเทม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัล</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไอเทม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัล</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ดาบราชันสงคราม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,500</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คทาแห่งภูติ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,000</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โล่ผู้พิทักษ์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,800</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชุดจอมเวท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,200</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ยาเพิ่มพลังโจมตี</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">700</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ยาเพิ่มพลังเวทย์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,200</td></tr></table>\nโดยนอกจากการร่วมภารกิจรายวันเพื่อสะสมคริสตัลแล้ว ผู้เล่นยังสามารถเติมเงินเพื่อแลก Point ได้ตามเงื่อนไขดังนี้\n1. เมื่อเติมเงิน 1 บาท จะได้รับ Point 10 แต้ม\n2. ปกติ ทุก ๆ Point 10 แต้ม สามารถแลกคริสตัลได้ 3 เม็ด\nสำหรับช่วงเวลาร่วมกิจกรรม World Boss: Ancient Dragon มีสิทธิพิเศษสำหรับผู้เล่น ดังนี้1. เมื่อเติมเงินได้รับ Point พิเศษอีก 50%\n2. ลด Point 20% สำหรับแลกคริสตัลได้ 3 เม็ด\n\nข้อ 17. นนท์เป็นผู้เล่นใหม่เลือกเล่นอาชีพ Mage ซึ่งเหลือเวลาอีก 15 วันเท่านั้น ถ้านนท์ได้คริสตัลจากภารกิจรายวัน 300 เม็ด แล้วนนท์ควรเติมเงินอย่างน้อยที่สุดกี่บาท จึงสามารถเข้าร่วมล่าบอสระดับตำนานได้",
        "c": [
            "นนท์ต้องเติมเงินอย่างน้อย 200 บาท ก่อนช่วงเวลากิจกรรม World Boss: Ancient Dragon",
            "นนท์ต้องเติมเงินอย่างน้อย 350 บาท ก่อนช่วงเวลากิจกรรม World Boss: Ancient Dragon",
            "นนท์ต้องเติมเงินอย่างน้อย 120 บาท ในช่วงเวลากิจกรรม World Boss: Ancient Dragon",
            "นนท์ต้องเติมเงินอย่างน้อย 160 บาท ในช่วงเวลากิจกรรม World Boss: Ancient Dragon"
        ],
        "a": 3,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ภารกิจพิชิตบอส”\nLegacy of Valor เป็นเกมสวมบทบาทออนไลน์แนวผจญภัยแฟนตาซี ที่ผู้เล่นรับบทเป็นผู้กล้าผู้ถูกเลือกให้สืบทอดพลังแห่งวีรชน โดยผู้เล่นสามารถออกสำรวจโลก ต่อสู้กับมอนสเตอร์ ทำภารกิจรายวัน(Daily Quest) เพื่อสะสมคริสตัล (Crystal) ซึ่งเป็นทรัพยากรสำคัญในการแลกไอเทมพิเศษต่าง ๆ ภายในเกม\nLegacy of Valor กำหนดกิจกรรมพิเศษ World Boss: Ancient Dragon ซึ่งมีบอสระดับตำนานที่ให้ผู้เล่นได้เข้าร่วมต่อสู้ โดยกิลด์ Hall of Legends ได้วางแผนส่งผู้เล่น 2 คนเข้าร่วมกิจกรรม ซึ่งข้อมูลผู้เล่นทั้ง 2 คน จาก กิลด์ Hall of Legends เป็นดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผู้เล่น</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัลสะสม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัลที่ได้รับจากภารกิจรายวัน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ปอง (Warrior)</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,400</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">150</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ปราย (Mage)</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">800</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">250</td></tr></table>\nเพื่อให้สามารถล่าบอสระดับตำนานได้ ผู้เล่นแต่ละอาชีพต้องเตรียมอุปกรณ์ตามที่กำหนด ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อุปกรณ์สำหรับ Warrior</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">อุปกรณ์สำหรับ Mage</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไอเทม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัล</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไอเทม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คริสตัล</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ดาบราชันสงคราม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,500</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คทาแห่งภูติ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,000</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โล่ผู้พิทักษ์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,800</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ชุดจอมเวท</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">2,200</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ยาเพิ่มพลังโจมตี</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">700</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ยาเพิ่มพลังเวทย์</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">1,200</td></tr></table>\nโดยนอกจากการร่วมภารกิจรายวันเพื่อสะสมคริสตัลแล้ว ผู้เล่นยังสามารถเติมเงินเพื่อแลก Point ได้ตามเงื่อนไขดังนี้\n1. เมื่อเติมเงิน 1 บาท จะได้รับ Point 10 แต้ม\n2. ปกติ ทุก ๆ Point 10 แต้ม สามารถแลกคริสตัลได้ 3 เม็ด\nสำหรับช่วงเวลาร่วมกิจกรรม World Boss: Ancient Dragon มีสิทธิพิเศษสำหรับผู้เล่น ดังนี้1. เมื่อเติมเงินได้รับ Point พิเศษอีก 50%\n2. ลด Point 20% สำหรับแลกคริสตัลได้ 3 เม็ด\n\nข้อ 18. ปองควรเลือกดาบราชันสงครามในข้อใด ถ้าปองโจมตีทั้งหมด 70 ครั้ง แล้วจะโจมตีพลาดน้อยที่สุด",
        "c": [
            "ดาบราชันสงครามสีแดง มีโอกาสโจมตีเข้าเป้า 80%",
            "ดาบราชันสงครามสีน้ำเงิน ทุก ๆ การโจมตี 6 ครั้ง จะโจมตีเข้าเป้า 5 ครั้งเสมอ",
            "ดาบราชันสงครามสีเขียว การโจมตี 50 ครั้งแรก เข้าเป้าแน่นอน    แต่การโจมตีหลังจากนั้นจะเข้าเป้า 50%",
            "ดาบราชันสงครามสีเหลือง ทุก ๆ การโจมตีครั้งที่ 10, 20, 30, 40, …     จะเข้าเป้า 10, 9, 8, 7, …  ครั้งตามลำดับ"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ \"รีวิวสินค้า\"\nแพลตฟอร์มซื้อขายออนไลน์ ShopStar มีร้านเค้กจำนวนมากที่จำหน่ายเค้กสำหรับโอกาสต่าง ๆ เช่น วันเกิด งานเลี้ยง เทศกาลสำคัญ เพื่อช่วยให้ลูกค้าเลือกซื้อสินค้าได้อย่างมั่นใจทางแพลตฟอร์มจึงใช้ “คะแนนรีวิวสุทธิ” เป็นตัวชี้วัดคุณภาพการให้บริการของร้านค้า โดยอาศัยข้อมูลจากรีวิวของลูกค้าที่เคยซื้อสินค้า\nการคำนวณคะแนนรีวิวสุทธิ ในช่วงเวลา 3 เดือนล่าสุด มีเกณฑ์ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รีวิว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คะแนน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หรือ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">+1</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">0</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หรือ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">-1</td></tr></table>\nตลอดระยะเวลา 3 เดือน ร้านเค้กตัวอย่าง 4 ร้าน มีจำนวนโพสต์รีวิว ดังตาราง\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ร้านเค้ก</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 4 – 5  ดาว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 3 ดาว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 1 – 2  ดาว</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Sweet Bloom</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">278</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">53</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">238</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Cake Cottage</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">273</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">257</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Sugar House</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">273</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">48</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">240</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Cloud Cake</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">263</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">245</td></tr></table>\nเพื่อสร้างความเชื่อมั่นให้กับลูกค้า ทางแพลตฟอร์มจึงใช้ คะแนนรีวิวสุทธิเป็นตัวชี้วัดคุณภาพ ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คะแนนรีวิวสุทธิรวม 3 เดือน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ระดับร้าน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 20 คะแนนขึ้นไป</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Gold</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 10 ถึง 19 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Silver</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 5 ถึง 9 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Bronze</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ต่ำกว่า 5 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไม่ได้รับตรารับรอง และได้รับการแจ้งเตือนให้ปรับปรุงคุณภาพการให้บริการ</td></tr></table>\n\nข้อ 19. ถ้าแพลตฟอร์มซื้อขายออนไลน์ ShopStar จัดประกวด \"ShopStar Excellence Award\"เพื่อมอบรางวัลให้กับร้านค้าที่ให้บริการได้ยอดเยี่ยมที่สุดแห่งปี และมีการพัฒนาคุณภาพการบริการอย่างต่อเนื่อง โดยร้านค้าที่มีสิทธิ์เข้าชิงรางวัลนี้ต้องได้รับตรา ShopStar Silver หรือ ShopStar Gold แล้วร้านค้าใดควรได้รับรางวัล \"ShopStar Excellence Award\" และมีคะแนนรีวิวสุทธิเฉลี่ยต่อเดือนเท่าใด\n(คะแนนรีวิวสุทธิ = ผลรวมของคะแนนโพสต์รีวิวทั้งหมด)",
        "c": [
            "Sweet Bloom ควรได้รับรางวัล และมีคะแนนเฉลี่ย +13.33 ต่อเดือน",
            "Cake Cottage ควรได้รับรางวัล และมีคะแนนเฉลี่ย +14.33 ต่อเดือน",
            "Cloud Cake ควรได้รับรางวัล และมีคะแนนเฉลี่ย +11.67 ต่อเดือน",
            "Sugar House ควรได้รับรางวัล และมีคะแนนเฉลี่ย +9.67 ต่อเดือน"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ \"รีวิวสินค้า\"\nแพลตฟอร์มซื้อขายออนไลน์ ShopStar มีร้านเค้กจำนวนมากที่จำหน่ายเค้กสำหรับโอกาสต่าง ๆ เช่น วันเกิด งานเลี้ยง เทศกาลสำคัญ เพื่อช่วยให้ลูกค้าเลือกซื้อสินค้าได้อย่างมั่นใจทางแพลตฟอร์มจึงใช้ “คะแนนรีวิวสุทธิ” เป็นตัวชี้วัดคุณภาพการให้บริการของร้านค้า โดยอาศัยข้อมูลจากรีวิวของลูกค้าที่เคยซื้อสินค้า\nการคำนวณคะแนนรีวิวสุทธิ ในช่วงเวลา 3 เดือนล่าสุด มีเกณฑ์ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รีวิว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คะแนน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หรือ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">+1</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">0</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หรือ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">-1</td></tr></table>\nตลอดระยะเวลา 3 เดือน ร้านเค้กตัวอย่าง 4 ร้าน มีจำนวนโพสต์รีวิว ดังตาราง\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ร้านเค้ก</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 4 – 5  ดาว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 3 ดาว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 1 – 2  ดาว</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Sweet Bloom</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">278</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">53</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">238</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Cake Cottage</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">273</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">257</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Sugar House</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">273</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">48</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">240</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Cloud Cake</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">263</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">245</td></tr></table>\nเพื่อสร้างความเชื่อมั่นให้กับลูกค้า ทางแพลตฟอร์มจึงใช้ คะแนนรีวิวสุทธิเป็นตัวชี้วัดคุณภาพ ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คะแนนรีวิวสุทธิรวม 3 เดือน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ระดับร้าน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 20 คะแนนขึ้นไป</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Gold</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 10 ถึง 19 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Silver</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 5 ถึง 9 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Bronze</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ต่ำกว่า 5 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไม่ได้รับตรารับรอง และได้รับการแจ้งเตือนให้ปรับปรุงคุณภาพการให้บริการ</td></tr></table>\n\nข้อ 20. ร้านเค้ก Sweet Bloom ทำการเชิญชวนให้ลูกค้าเข้าร่วมกิจกรรม \"Review & Save\" ซึ่งเป็นกิจกรรมสำหรับลูกค้าที่รีวิวสินค้าเพื่อสะสม Review Point แลกรับส่วนลดในการซื้อครั้งถัดไป โดยทุก ๆ 100 Review Point สามารถแลกเป็น ส่วนลด 20 บาท ซึ่งให้ Review Point จากการรีวิวสินค้า ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">กิจกรรม</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Review Point</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ส่งรีวิวสินค้า</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">20</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ติดแท็ก \"รสชาติดี\"</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ติดแท็ก \"ตรงปก\"</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ติดแท็ก \"บรรจุภัณฑ์ดี\"</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ติดแท็ก \"จัดส่งรวดเร็ว\"</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">5</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">แนบรูปภาพ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">10</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">แนบวิดีโอ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">20</td></tr></table>\nวินต้องการซื้อเค้กวันเกิดราคา 460 บาท และมี Review Point สะสมอยู่แล้ว 320 คะแนน ถ้าวินมีเงิน 400 บาท และรีวิวสินค้า ทุกครั้ง ครบทุกกิจกรรม ตามตารางข้างต้น แล้ววินต้องรีวิวสินค้า อย่างน้อยกี่ครั้ง จึงจะสามารถใช้ส่วนลดซื้อเค้กได้โดยไม่ต้องเพิ่มเงินสด",
        "c": [
            "3 ครั้ง",
            "4 ครั้ง",
            "5 ครั้ง",
            "6 ครั้ง"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ \"รีวิวสินค้า\"\nแพลตฟอร์มซื้อขายออนไลน์ ShopStar มีร้านเค้กจำนวนมากที่จำหน่ายเค้กสำหรับโอกาสต่าง ๆ เช่น วันเกิด งานเลี้ยง เทศกาลสำคัญ เพื่อช่วยให้ลูกค้าเลือกซื้อสินค้าได้อย่างมั่นใจทางแพลตฟอร์มจึงใช้ “คะแนนรีวิวสุทธิ” เป็นตัวชี้วัดคุณภาพการให้บริการของร้านค้า โดยอาศัยข้อมูลจากรีวิวของลูกค้าที่เคยซื้อสินค้า\nการคำนวณคะแนนรีวิวสุทธิ ในช่วงเวลา 3 เดือนล่าสุด มีเกณฑ์ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">รีวิว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คะแนน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หรือ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">+1</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">0</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">หรือ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">-1</td></tr></table>\nตลอดระยะเวลา 3 เดือน ร้านเค้กตัวอย่าง 4 ร้าน มีจำนวนโพสต์รีวิว ดังตาราง\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ร้านเค้ก</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 4 – 5  ดาว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 3 ดาว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">โพสต์รีวิว 1 – 2  ดาว</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Sweet Bloom</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">278</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">53</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">238</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Cake Cottage</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">273</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">257</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Sugar House</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">273</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">48</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">240</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">Cloud Cake</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">263</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">245</td></tr></table>\nเพื่อสร้างความเชื่อมั่นให้กับลูกค้า ทางแพลตฟอร์มจึงใช้ คะแนนรีวิวสุทธิเป็นตัวชี้วัดคุณภาพ ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">คะแนนรีวิวสุทธิรวม 3 เดือน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ระดับร้าน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 20 คะแนนขึ้นไป</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Gold</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 10 ถึง 19 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Silver</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ตั้งแต่ 5 ถึง 9 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ShopStar Bronze</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ต่ำกว่า 5 คะแนน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ไม่ได้รับตรารับรอง และได้รับการแจ้งเตือนให้ปรับปรุงคุณภาพการให้บริการ</td></tr></table>\n\nข้อ 21. ร้าน Sweet Bloom ขายเค้ก 3 ขนาด ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ขนาดเค้ก</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">เส้นผ่านศูนย์กลาง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ราคาปกติ</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">เล็ก</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">12 เซนติเมตร</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">379 บาท</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">กลาง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">18 เซนติเมตร</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">629 บาท</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ใหญ่</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">24 เซนติเมตร</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">899 บาท</td></tr></table>\nหมายเหตุเค้กทุกขนาดมี ความสูงเท่ากัน\nบาสต้องการซื้อเค้กขนาดใหญ่ จากร้าน Sweet Bloom แต่ทางร้านแจ้งว่าเค้กขนาดใหญ่หมด ทางร้าน Sweet Bloom จึงเสนอทางเลือกเป็น “เค้กขนาดกลาง 1 ก้อน และเค้กขนาดเล็ก 1 ก้อน”ถ้าบาสต้องการได้รับปริมาณเค้กมากที่สุด โดยไม่ต้องจ่ายเงินเพิ่ม บาสควรตัดสินใจอย่างไร",
        "c": [
            "รับข้อเสนอของร้าน เพราะราคาปกติของเค้กที่ได้รับรวมกัน สูงกว่าราคาที่จ่าย",
            "รับข้อเสนอของร้าน เพราะเส้นผ่านศูนย์กลางรวมของเค้กทั้งสองก้อนมากกว่าเค้กขนาดใหญ่",
            "ปฏิเสธข้อเสนอ เพราะปริมาณเค้กที่ได้รับน้อยกว่าเค้กขนาดใหญ่ 1 ถาด",
            "ปฏิเสธข้อเสนอ เพราะเค้กแต่ละก้อนที่เสนอมาราคาไม่เท่ากับเค้กขนาดใหญ่    จึงไม่คุ้มที่จะเปลี่ยนสินค้า"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ \"สถาบันต้องใจ\"\nการสอบคัดเลือกเข้าศึกษาต่อระดับชั้นมัธยมศึกษาตอนปลาย นักเรียนจำนวนมากเลือกเข้าหาสถาบันกวดวิชา เพื่อเพิ่มโอกาสในการสอบเข้า หลายสถาบันนำระบบ AI วิเคราะห์ข้อมูลผลการเรียนและคะแนนสอบจำลอง (Predictive Analytics) มาประเมินโอกาสสอบติดของนักเรียน พร้อมเผยสถิติความแม่นยำผ่านการโฆษณา เพื่อสร้างความเชื่อมั่นให้กับผู้ปกครองและนักเรียน ดังนี้\nสถาบัน A โฆษณาว่า “นักเรียนที่ได้รับการประเมินว่าสอบติด มีโอกาสสอบติดจริง 90%”\nสถาบัน B โฆษณาว่า “นักเรียนที่สอบติดจริง 95% เคยได้รับการประเมินว่าสอบติด”\nนักเรียนกลุ่มหนึ่งกำลังตัดสินใจ เลือกเข้าสถาบันกวดวิชา แม้ว่าแต่ละสถาบันมีผลการประเมินว่าสอบติดในอัตราที่สูงมาก แต่จากข้อความโฆษณาเป็นการอ้างอิงข้อมูลของนักเรียนคนละกลุ่ม ทำให้ไม่สามารถเปรียบเทียบผลการสอบติดได้โดยตรง เพื่อหาข้อสรุป นักเรียนกลุ่มนี้ จึงรวบรวมข้อมูลผลการประเมินก่อนสอบ และผลสอบจริงของนักเรียนจากสถาบันกวดวิชาทั้งสองแห่ง จำนวนแห่งละ 200 คน\nข้อมูลเป็นดังตารางต่อไปนี้\nตารางที่ 1 : ข้อมูลของสถาบัน A (นักเรียนทั้งหมด 200 คน)\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลการสอบจริง ผลประเมิน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติดจริง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติดจริง</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">96</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">24</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">24</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">56</td></tr></table>\nตารางที่ 2 : ข้อมูลของสถาบัน B (นักเรียนทั้งหมด 200 คน)\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลการสอบจริง ผลประเมิน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติดจริง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติดจริง</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">114</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">46</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">6</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">34</td></tr></table>\n\nข้อ 22. ถ้านักเรียนได้รับผลประเมินจาก สถาบัน A ว่าสอบติด และจากสถาบัน B ว่าสอบไม่ติดแล้วนักเรียนควรเชื่อสถาบันใด",
        "c": [
            "เชื่อสถาบัน A เพราะ โอกาสของผลประเมินว่าสอบติด แล้วสอบติดจริงของสถาบัน A คือ 90%     สูงกว่า โอกาสของผลประเมินว่าสอบไม่ติด แล้วสอบไม่ติดจริงของสถาบัน B คือ 85%",
            "เชื่อสถาบัน A เพราะ โอกาสของผลประเมินว่าสอบติด แล้วสอบติดจริงของสถาบัน A คือ 80%     สูงกว่า โอกาสของผลประเมินว่าสอบไม่ติด แล้วสอบไม่ติดจริงของสถาบัน B คือ 72.5%",
            "เชื่อสถาบัน B เพราะ โอกาสของผลประเมินว่าสอบไม่ติด แล้วสอบไม่ติดจริงของสถาบัน B คือ    85% สูงกว่า โอกาสของผลประเมินว่าสอบติด แล้วสอบติดจริงของสถาบัน A คือ 80%",
            "เชื่อสถาบัน B เพราะ โอกาสของผลประเมินว่าสอบไม่ติด แล้วสอบไม่ติดจริงของสถาบัน B คือ    95% สูงกว่า โอกาสของผลประเมินว่าสอบติด แล้วสอบติดจริงของสถาบัน A คือ 80%"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ \"สถาบันต้องใจ\"\nการสอบคัดเลือกเข้าศึกษาต่อระดับชั้นมัธยมศึกษาตอนปลาย นักเรียนจำนวนมากเลือกเข้าหาสถาบันกวดวิชา เพื่อเพิ่มโอกาสในการสอบเข้า หลายสถาบันนำระบบ AI วิเคราะห์ข้อมูลผลการเรียนและคะแนนสอบจำลอง (Predictive Analytics) มาประเมินโอกาสสอบติดของนักเรียน พร้อมเผยสถิติความแม่นยำผ่านการโฆษณา เพื่อสร้างความเชื่อมั่นให้กับผู้ปกครองและนักเรียน ดังนี้\nสถาบัน A โฆษณาว่า “นักเรียนที่ได้รับการประเมินว่าสอบติด มีโอกาสสอบติดจริง 90%”\nสถาบัน B โฆษณาว่า “นักเรียนที่สอบติดจริง 95% เคยได้รับการประเมินว่าสอบติด”\nนักเรียนกลุ่มหนึ่งกำลังตัดสินใจ เลือกเข้าสถาบันกวดวิชา แม้ว่าแต่ละสถาบันมีผลการประเมินว่าสอบติดในอัตราที่สูงมาก แต่จากข้อความโฆษณาเป็นการอ้างอิงข้อมูลของนักเรียนคนละกลุ่ม ทำให้ไม่สามารถเปรียบเทียบผลการสอบติดได้โดยตรง เพื่อหาข้อสรุป นักเรียนกลุ่มนี้ จึงรวบรวมข้อมูลผลการประเมินก่อนสอบ และผลสอบจริงของนักเรียนจากสถาบันกวดวิชาทั้งสองแห่ง จำนวนแห่งละ 200 คน\nข้อมูลเป็นดังตารางต่อไปนี้\nตารางที่ 1 : ข้อมูลของสถาบัน A (นักเรียนทั้งหมด 200 คน)\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลการสอบจริง ผลประเมิน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติดจริง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติดจริง</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">96</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">24</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">24</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">56</td></tr></table>\nตารางที่ 2 : ข้อมูลของสถาบัน B (นักเรียนทั้งหมด 200 คน)\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลการสอบจริง ผลประเมิน</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติดจริง</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติดจริง</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">114</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">46</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">สอบไม่ติด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">6</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">34</td></tr></table>\n\nข้อ 23. ถ้าสถาบัน A ต้องการสร้างแผนภูมิวงกลมแสดงสัดส่วนนักเรียนที่ได้รับผลประเมินว่าสอบติดและสอบไม่ติดเทียบกับการสอบติดจริงและสอบไม่ติดจริง แล้วแผนภูมิวงกลมในข้อใดถูกต้อง\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ก.</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบติด”</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบไม่ติด”</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ข.</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบติด”</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบไม่ติด”</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ค.</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบติด”</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบไม่ติด”</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ง.</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\"></td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบติด”</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ผลประเมิน “สอบไม่ติด”</td></tr></table>",
        "c": [
            "<img src=\"../assets/images/questions/math/pie_q23_0.png\" style=\"max-width:100%;max-height:180px;display:block;margin:4px auto;background:#fff;padding:4px;border-radius:4px;\" />",
            "<img src=\"../assets/images/questions/math/pie_q23_1.png\" style=\"max-width:100%;max-height:180px;display:block;margin:4px auto;background:#fff;padding:4px;border-radius:4px;\" />",
            "<img src=\"../assets/images/questions/math/pie_q23_2.png\" style=\"max-width:100%;max-height:180px;display:block;margin:4px auto;background:#fff;padding:4px;border-radius:4px;\" />",
            "<img src=\"../assets/images/questions/math/pie_q23_3.png\" style=\"max-width:100%;max-height:180px;display:block;margin:4px auto;background:#fff;padding:4px;border-radius:4px;\" />"
        ],
        "a": 0,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ตู้หมุนไข่กาชาปอง”\nงานมหกรรมของเล่นแห่งหนึ่ง มีการจัดกิจกรรมหมุนกาชาปองคอลเลกชันพิเศษ โดยของรางวัลสูงสุด คือ ฟิกเกอร์ทองคำ ผู้ร่วมกิจกรรมสามารถเลือกหมุนได้ 2 วิธี ดังนี้\nหมุนจากตู้หน้างาน ภายในตู้มีไข่กาชาปอง 100 ลูก โดยมีไข่กาชาปองที่บรรจุฟิกเกอร์ทองคำเพียง 1 ลูก ค่าหมุนครั้งละ 50 บาท\nหมุนผ่านระบบออนไลน์ ระบบจะสุ่มของรางวัลใหม่ทุกครั้งที่กดหมุน โอกาสได้รับฟิกเกอร์ทองคำ คือ ร้อยละ 1 ค่าหมุนครั้งละ 40 บาท\n\nข้อ 24. วินเข้าร่วมงานมหกรรมของเล่น และพบว่าในตู้หมุนกาชาปองเหลือไข่กาชาปองอยู่เพียง 10 ลูกแต่ยังไม่มีผู้ใดได้รับฟิกเกอร์ทองคำ ถ้าวินมีเงิน 50 บาท วินควรเลือกช่องทางใดจึงจะมีโอกาสได้รับฟิกเกอร์ทองคำมากที่สุด และสมเหตุสมผลที่สุด",
        "c": [
            "หมุนผ่านระบบออนไลน์ เพราะ เสียเงินน้อยกว่า 10 บาท",
            "หมุนผ่านระบบออนไลน์ เพราะ หมุนจากตู้หน้างาน มีผู้เล่นหมุนไปแล้ว 90 ครั้ง แต่ยังไม่มีผู้ใด    ได้รับฟิกเกอร์ทองคำ แสดงว่าโอกาสที่วินจะหมุนแล้วไม่ได้ฟิกเกอร์ทองคำต้องเท่ากับ    ผู้เล่นก่อนหน้าแน่นอน",
            "หมุนตู้หน้าร้าน เพราะ มีโอกาสได้รับฟิกเกอร์ทองคำในการหมุนครั้งถัดไป 10% ซึ่งสูงกว่า     หมุนผ่านระบบออนไลน์ ที่มีโอกาส 1%",
            "หมุนตู้หน้าร้าน เพราะ มีโอกาสได้รับฟิกเกอร์ทองคำในการหมุนครั้งถัดไป 90% ซึ่งสูงกว่า    หมุนผ่านระบบออนไลน์ ที่มีโอกาส 1%"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ตู้หมุนไข่กาชาปอง”\nงานมหกรรมของเล่นแห่งหนึ่ง มีการจัดกิจกรรมหมุนกาชาปองคอลเลกชันพิเศษ โดยของรางวัลสูงสุด คือ ฟิกเกอร์ทองคำ ผู้ร่วมกิจกรรมสามารถเลือกหมุนได้ 2 วิธี ดังนี้\nหมุนจากตู้หน้างาน ภายในตู้มีไข่กาชาปอง 100 ลูก โดยมีไข่กาชาปองที่บรรจุฟิกเกอร์ทองคำเพียง 1 ลูก ค่าหมุนครั้งละ 50 บาท\nหมุนผ่านระบบออนไลน์ ระบบจะสุ่มของรางวัลใหม่ทุกครั้งที่กดหมุน โอกาสได้รับฟิกเกอร์ทองคำ คือ ร้อยละ 1 ค่าหมุนครั้งละ 40 บาท\n\nข้อ 25. ถ้านัทกล่าวกับนักเรียนว่า “เลือกหมุนผ่านระบบออนไลน์ดีกว่า เพราะหมุนครบ 100 ครั้ง เท่ากับว่ามีโอกาสได้รับฟิกเกอร์ทองคำครบ 100% แน่นอน และเสียเงินเพียง 4,000 บาท” แล้วนักเรียนเห็นด้วยหรือไม่",
        "c": [
            "เห็นด้วย เพราะ หมุนผ่านระบบออนไลน์ ยิ่งหมุนมาก โอกาสที่ได้ฟิกเกอร์ทองคำยิ่งมีมากขึ้น",
            "เห็นด้วย เพราะ หมุนผ่านระบบออนไลน์ มีโอกาสได้รับฟิกเกอร์ทองคำ 1% เมื่อหมุน 100 ครั้ง     โอกาสจะรวมกันได้ 100% พอดี",
            "ไม่เห็นด้วย เพราะ หมุนผ่านระบบออนไลน์แต่ละครั้ง เป็นอิสระต่อกัน โอกาสได้รับฟิกเกอร์ทองคำ    ในแต่ละครั้ง จึงเท่ากับร้อยละ 1 เสมอ",
            "ไม่เห็นด้วย เพราะ หมุนผ่านระบบออนไลน์แต่ละครั้ง ไม่เป็นอิสระต่อกัน โอกาสได้รับฟิกเกอร์    ทองคำในแต่ละครั้ง จึงเท่ากับร้อยละ 1 เสมอ"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ตู้หมุนไข่กาชาปอง”\nงานมหกรรมของเล่นแห่งหนึ่ง มีการจัดกิจกรรมหมุนกาชาปองคอลเลกชันพิเศษ โดยของรางวัลสูงสุด คือ ฟิกเกอร์ทองคำ ผู้ร่วมกิจกรรมสามารถเลือกหมุนได้ 2 วิธี ดังนี้\nหมุนจากตู้หน้างาน ภายในตู้มีไข่กาชาปอง 100 ลูก โดยมีไข่กาชาปองที่บรรจุฟิกเกอร์ทองคำเพียง 1 ลูก ค่าหมุนครั้งละ 50 บาท\nหมุนผ่านระบบออนไลน์ ระบบจะสุ่มของรางวัลใหม่ทุกครั้งที่กดหมุน โอกาสได้รับฟิกเกอร์ทองคำ คือ ร้อยละ 1 ค่าหมุนครั้งละ 40 บาท\n\nข้อ 26. หากตู้หมุนไข่กาชาปองหน้างานมีไข่สีต่าง ๆ ได้แก่ สีขาว สีเขียว สีเหลือง และสีแดงถ้าเกรทสุ่มไข่กาชาปองมา 2 ลูก โดยอาจได้ไข่สีเดียวกันหรือต่างกันได้ ซึ่งจากการจดบันทึกสีที่เกรทเคยสุ่มได้มาเป็นดังนี้ ขาวกับขาว, ขาวกับเขียว, ขาวกับแดง, เขียวกับเหลือง, เขียวกับแดง แล้วยังมีวิธีสุ่มสีไข่กาชาปองอีกกี่วิธีที่เกรทยังไม่เคยได้รับ",
        "c": [
            "2 วิธี ได้แก่ ขาวกับเหลือง, เหลืองกับแดง",
            "5 วิธี ได้แก่ ขาวกับเหลือง, เขียวกับเขียว, เหลืองกับเหลือง, เหลืองกับแดง, แดงกับแดง",
            "8 วิธี ได้แก่ ขาวกับเหลือง, เขียวกับขาว, เหลืองกับขาว, เหลืองกับเขียว, เหลืองกับแดง, แดงกับขาว,     แดงกับเขียว, แดงกับเหลือง",
            "11 วิธี ขาวกับเหลือง, เขียวกับขาว, เขียวกับเขียว, เหลืองกับขาว, เหลืองกับเขียว, เหลืองกับเหลือง,    เหลืองกับแดง, แดงกับขาว, แดงกับเขียว, แดงกับเหลือง, แดงกับแดง"
        ],
        "a": 1,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “ตู้หมุนไข่กาชาปอง”\nงานมหกรรมของเล่นแห่งหนึ่ง มีการจัดกิจกรรมหมุนกาชาปองคอลเลกชันพิเศษ โดยของรางวัลสูงสุด คือ ฟิกเกอร์ทองคำ ผู้ร่วมกิจกรรมสามารถเลือกหมุนได้ 2 วิธี ดังนี้\nหมุนจากตู้หน้างาน ภายในตู้มีไข่กาชาปอง 100 ลูก โดยมีไข่กาชาปองที่บรรจุฟิกเกอร์ทองคำเพียง 1 ลูก ค่าหมุนครั้งละ 50 บาท\nหมุนผ่านระบบออนไลน์ ระบบจะสุ่มของรางวัลใหม่ทุกครั้งที่กดหมุน โอกาสได้รับฟิกเกอร์ทองคำ คือ ร้อยละ 1 ค่าหมุนครั้งละ 40 บาท\n\nข้อ 27. ถ้าไข่กาชาปองสีต่าง ๆ มีจำนวนดังนี้ สีขาว 50 ลูก สีเขียว 30 ลูก สีเหลือง 10 ลูก และสีแดง 10 ลูก โดยฟิกเกอร์ทองคำอยู่ในไข่กาชาปองสีแดงเท่านั้น แล้วคนใดมีโอกาสสุ่มได้ฟิกเกอร์ทองคำมากที่สุด",
        "c": [
            "เคนสุ่มได้กาชาปองสีขาว สีเขียว และสีเหลืองอย่างละลูก",
            "ป๊อปสุ่มได้กาชาปองสีเหลือง 2 ลูก และสีแดง 1 ลูก",
            "โจอี้สุ่มได้กาชาปองสีเขียว สีเหลือง และสีแดงอย่างละลูก",
            "พอร์ชสุ่มได้กาชาปองสีขาว 1 ลูก และสีแดง 2 ลูก"
        ],
        "a": 3,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “Cell Broadcast”\nCell Broadcast เป็นการแจ้งเตือนเหตุฉุกเฉินและเหตุการณ์สำคัญต่าง ๆ ผ่านโทรศัพท์มือถือใช้การกระจายสัญญาณผ่านเสาส่งสัญญาณเครือข่าย โดยที่ไม่ต้องติดตั้งแอปพลิเคชั่น ไม่ต้องเชื่อมต่อกับอินเตอร์เน็ตและไม่ลงทะเบียนหรือเสียค่าใช้จ่ายใด ๆ\nจากตารางแสดงข้อมูลเกี่ยวกับแจ้งเตือน Cell Broadcast ในช่วงปี 10 ปีที่ผ่านมา ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ประเทศ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหว เมื่อเทียบกับสถานการณ์ทั้งหมด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหวที่ส่งให้ประชาชนครบทุกคน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">280</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">70%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">266</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">B</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">264</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">75%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">198</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">C</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">240</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">216</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">D</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">252</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">80%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">126</td></tr></table>\n\nข้อ 28. ประเทศใดเสี่ยงต่อการเกิดภัยพิบัติมากที่สุด",
        "c": [
            "ประเทศ A",
            "ประเทศ B",
            "ประเทศ C",
            "ประเทศ D"
        ],
        "a": 2,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “Cell Broadcast”\nCell Broadcast เป็นการแจ้งเตือนเหตุฉุกเฉินและเหตุการณ์สำคัญต่าง ๆ ผ่านโทรศัพท์มือถือใช้การกระจายสัญญาณผ่านเสาส่งสัญญาณเครือข่าย โดยที่ไม่ต้องติดตั้งแอปพลิเคชั่น ไม่ต้องเชื่อมต่อกับอินเตอร์เน็ตและไม่ลงทะเบียนหรือเสียค่าใช้จ่ายใด ๆ\nจากตารางแสดงข้อมูลเกี่ยวกับแจ้งเตือน Cell Broadcast ในช่วงปี 10 ปีที่ผ่านมา ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ประเทศ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหว เมื่อเทียบกับสถานการณ์ทั้งหมด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหวที่ส่งให้ประชาชนครบทุกคน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">280</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">70%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">266</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">B</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">264</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">75%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">198</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">C</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">240</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">216</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">D</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">252</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">80%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">126</td></tr></table>\n\nข้อ 29. ค่าเฉลี่ยของเปอร์เซ็นต์จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหวที่ส่งให้ประชาชนครบทุกคนของทั้ง 4 ประเทศตรงกับข้อใด",
        "c": [
            "75.5%",
            "77.5%",
            "79.5%",
            "81.5%"
        ],
        "a": 1,
        "img": "",
        "showImg": false
    },
    {
        "q": "สถานการณ์ “Cell Broadcast”\nCell Broadcast เป็นการแจ้งเตือนเหตุฉุกเฉินและเหตุการณ์สำคัญต่าง ๆ ผ่านโทรศัพท์มือถือใช้การกระจายสัญญาณผ่านเสาส่งสัญญาณเครือข่าย โดยที่ไม่ต้องติดตั้งแอปพลิเคชั่น ไม่ต้องเชื่อมต่อกับอินเตอร์เน็ตและไม่ลงทะเบียนหรือเสียค่าใช้จ่ายใด ๆ\nจากตารางแสดงข้อมูลเกี่ยวกับแจ้งเตือน Cell Broadcast ในช่วงปี 10 ปีที่ผ่านมา ดังนี้\n<table style=\"width:100%;border-collapse:collapse;margin:8px 0;\"><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">ประเทศ</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหว</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหว เมื่อเทียบกับสถานการณ์ทั้งหมด</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหวที่ส่งให้ประชาชนครบทุกคน</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">A</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">280</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">70%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">266</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">B</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">264</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">75%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">198</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">C</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">240</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">50%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">216</td></tr><tr><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">D</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">252</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">80%</td><td style=\"border:1px solid #7c673d;padding:6px 8px;text-align:center;vertical-align:middle;\">126</td></tr></table>\n\nข้อ 30. ถ้าต้องการเพิ่มเปอร์เซ็นต์จำนวนการเตือนภัยเกี่ยวกับสถานการณ์แผ่นดินไหวที่ส่งให้ประชาชนครบทุกคนของทั้ง 4 ประเทศเป็น 90% ควรเพิ่มจำนวนการเตือนภัยที่ถูกต้องรวมกันประมาณกี่ครั้ง",
        "c": [
            "124 ครั้ง",
            "125 ครั้ง",
            "129 ครั้ง",
            "130 ครั้ง"
        ],
        "a": 3,
        "img": "",
        "showImg": false
    }
];

const FALLBACK_SCIENCE = [
    {
        "q": "ข้อ 1. ข้อใดคือหน่วยมาตรฐานของแรงในระบบ SI",
        "c": [
            "จูล (J)",
            "วัตต์ (W)",
            "ปาสกาล (Pa)",
            "นิวตัน (N)"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "ข้อ 2. พืชสีเขียวสร้างอาหารโดยกระบวนการใด",
        "c": [
            "การหมัก",
            "การถ่ายทอดกระแสประสาท",
            "การสังเคราะห์ด้วยแสง",
            "การหายใจระดับเซลล์"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "ข้อ 3. สารใดเป็นตัวทำละลายหลักในเซลล์ของสิ่งมีชีวิต",
        "c": [
            "ไขมัน",
            "โปรตีน",
            "น้ำ",
            "น้ำตาล"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "ข้อ 4. ดาวเคราะห์ดวงใดอยู่ใกล้ดวงอาทิตย์ที่สุด",
        "c": [
            "ดาวศุกร์",
            "โลก",
            "ดาวพุธ",
            "ดาวอังคาร"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "ข้อ 5. การเปลี่ยนสถานะจากของแข็งเป็นของเหลวเรียกว่าอะไร",
        "c": [
            "การระเหย",
            "การกลั่นตัว",
            "การหลอมเหลว",
            "การระเหิด"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "ข้อ 6. อวัยวะใดทำหน้าที่กรองของเสียในเลือดของมนุษย์",
        "c": [
            "ตับ",
            "ตับอ่อน",
            "ไต",
            "ม้าม"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "ข้อ 7. ก๊าซใดมีสัดส่วนมากที่สุดในอากาศบรรยากาศ",
        "c": [
            "คาร์บอนไดออกไซด์",
            "ไนโตรเจน",
            "อาร์กอน",
            "ออกซิเจน"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 8. คลื่นแม่เหล็กไฟฟ้าชนิดใดตามองเห็นได้",
        "c": [
            "แสงที่ตามองเห็น",
            "คลื่นวิทยุ",
            "รังสีเอกซ์",
            "รังสีอินฟราเรด"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "ข้อ 9. สารพันธุกรรมหลักในนิวเคลียสของเซลล์คืออะไร",
        "c": [
            "ไขมัน",
            "โปรตีน",
            "RNA",
            "DNA"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "ข้อ 10. ถ้าแรงลัพธ์ที่กระทำต่อวัตถุเป็นศูนย์ วัตถุจะเป็นอย่างไร",
        "c": [
            "อุณหภูมิสูงขึ้น",
            "มวลลดลง",
            "เร่งความเร็วเสมอ",
            "หยุดนิ่งหรือเคลื่อนที่ด้วยความเร็วคงที่"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "ข้อ 11. ปฏิกิริยาเคมีแบบใดปล่อยพลังงานความร้อนออกมา",
        "c": [
            "ปฏิกิริยาดูดความร้อน",
            "ปฏิกิริยาคายความร้อน",
            "ปฏิกิริยาสะเทิน",
            "ปฏิกิริยารีดักชันอย่างเดียว"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 12. ระบบนิเวศประกอบด้วยส่วนใดบ้าง",
        "c": [
            "เฉพาะสิ่งมีชีวิต",
            "สิ่งมีชีวิตและสิ่งไม่มีชีวิตที่สัมพันธ์กัน",
            "เฉพาะพืชและสัตว์",
            "เฉพาะสิ่งไม่มีชีวิต"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 13. โลหะนำไฟฟ้าได้ดีเพราะมีอนุภาคใดเคลื่อนที่อิสระ",
        "c": [
            "นิวเคลียส",
            "อิเล็กตรอน",
            "นิวตรอน",
            "โปรตอน"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 14. ระบบหมุนเวียนเลือดของมนุษย์ หัวใจห้องใดสูบฉีดเลือดไปเลี้ยงร่างกาย",
        "c": [
            "หัวใจห้องล่างขวา",
            "หัวใจห้องล่างซ้าย",
            "หัวใจห้องบนขวา",
            "หัวใจห้องบนซ้าย"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 15. pH ของสารละลายที่เป็นกลางมีค่าประมาณเท่าใด",
        "c": [
            "7",
            "14",
            "0",
            "3"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "ข้อ 16. แผ่นดินไหวส่วนใหญ่เกิดจากอะไร",
        "c": [
            "ลมมรสุม",
            "น้ำขึ้นน้ำลง",
            "การหมุนของโลก",
            "การเคลื่อนที่ของแผ่นเปลือกโลก"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "ข้อ 17. เลนส์นูนใช้แก้สายตาแบบใด",
        "c": [
            "สายตาสั้น",
            "สายตายาว",
            "ตาบอดสี",
            "ต้อหิน"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 18. แบคทีเรียจัดอยู่ในอาณาจักรใดเป็นหลัก",
        "c": [
            "Animalia",
            "Monera (โปรแคริโอต)",
            "Plantae",
            "Fungi"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 19. พลังงานจลน์ขึ้นกับปัจจัยใด",
        "c": [
            "เฉพาะความหนาแน่น",
            "เฉพาะอุณหภูมิ",
            "มวลและความเร็ว",
            "เฉพาะสีของวัตถุ"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "ข้อ 20. โอโซนในบรรยากาศชั้นสตราโตสเฟียร์มีประโยชน์อย่างไร",
        "c": [
            "เพิ่มคาร์บอนไดออกไซด์",
            "ทำให้ฝนกรด",
            "ดูดกลืนรังสีอัลตราไวโอเลต",
            "ทำให้โลกร้อนขึ้นโดยตรง"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "ข้อ 21. ธาตุที่มีเลขอะตอมเท่ากับ 1 คือธาตุใด",
        "c": [
            "ฮีเลียม",
            "ไฮโดรเจน",
            "คาร์บอน",
            "ออกซิเจน"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "ข้อ 22. การถ่ายทอดลักษณะทางพันธุกรรมจากพ่อแม่สู่ลูกเป็นไปตามกฎของใคร",
        "c": [
            "เมนเดล",
            "ดาร์วิน",
            "ไอน์สไตน์",
            "นิวตัน"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "ข้อ 23. เสียงเดินทางในตัวกลางใดเร็วที่สุดโดยทั่วไป",
        "c": [
            "ของแข็ง",
            "สุญญากาศ",
            "อากาศ",
            "น้ำ"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "ข้อ 24. ส่วนใดของเซลล์พืชทำหน้าที่สร้างอาหาร",
        "c": [
            "คลอโรพลาสต์",
            "แวคิวโอล",
            "ผนังเซลล์",
            "ไมโทคอนเดรีย"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "ข้อ 25. การอนุรักษ์พลังงานหมายความว่าอย่างไร",
        "c": [
            "พลังงานสร้างขึ้นใหม่ได้เสมอ",
            "พลังงานมีเฉพาะความร้อน",
            "พลังงานสูญหายได้หมด",
            "พลังงานเปลี่ยนแปลงรูปได้แต่ปริมาณรวมคงที่"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "ข้อ 26. โรคโลหิตจางเกี่ยวข้องกับการขาดธาตุใดเป็นสำคัญ",
        "c": [
            "เหล็ก",
            "ไอโอดีน",
            "โซเดียม",
            "แคลเซียม"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "ข้อ 27. กระแสไฟฟ้ามีหน่วยวัดเป็นอะไร",
        "c": [
            "วัตต์",
            "โอห์ม",
            "โวลต์",
            "แอมแปร์"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "ข้อ 28. วัฏจักรน้ำขั้นตอนใดคือการเปลี่ยนไอน้ำเป็นหยดน้ำ",
        "c": [
            "การกลั่นตัว",
            "การซึม",
            "การระเหย",
            "การคายน้ำ"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "ข้อ 29. สัตว์กลุ่มใดมีกระดูกสันหลัง",
        "c": [
            "แมลง",
            "หอย",
            "ไส้เดือน",
            "ปลา"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "ข้อ 30. ข้อใดเป็นพลังงานหมุนเวียน",
        "c": [
            "แสงอาทิตย์",
            "น้ำมันดิบ",
            "ถ่านหิน",
            "ก๊าซธรรมชาติ"
        ],
        "a": 0,
        "img": ""
    }
];

const FALLBACK_THAI = [
    {
        "q": "1. ข้อใดกล่าวถึงจุดประสงค์ที่สำคัญที่สุดของทักษะความคล่องในการอ่าน",
        "c": [
            "สามารถอ่านออกเสียงได้ชัดเจนตามหลักภาษา",
            "สามารถถอดรหัสคำเพื่อนำไปใช้ในการจับใจความสำคัญของบทอ่านได้ถูกต้อง",
            "สามารถอ่านคำศัพท์ที่ยากในบทความได้ถูกต้อง",
            "สามารถอ่านบทความได้รวดเร็วมากที่สุด"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "2. ข้อใดคือลักษณะของประโยคที่เหมาะสมที่สุดในการฝึกอ่านคำและประโยคโดยอัตโนมัติในขั้นพื้นฐาน",
        "c": [
            "สัญวิทยาเชิงโครงสร้างสร้างความลักลั่นในคตินิยมร่วมสมัย",
            "แม้ว่าเขาจะดูเหมือนเป็นคนดี ทว่าในส่วนลึกแล้วไม่มีใครรู้",
            "ในแง่หนึ่ง... แต่ในอีกแง่หนึ่ง... ซึ่งอาจเป็นไปได้ว่า...",
            "แมวนอนหลับอยู่บนเก้าอี้สีแดงตัวเก่าหลังบ้าน"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "3. จากประโยคที่ว่า \"แม้เทคโนโลยีปัญญาประดิษฐ์จะเข้ามาทดแทนแรงงานในหลายภาคส่วน แต่ทักษะการคิดเชิงวิพากษ์ของ\nมนุษย์ยังคงเป็นสิ่งที่ทดแทนได้ยาก\" ถ้อยคำหรือวลีใดเป็นจุดสำคัญในการประมวลผลความหมายโดยรวมของประโยค",
        "c": [
            "แม้เทคโนโลยีปัญญาประดิษฐ์",
            "ในหลายภาคส่วน",
            "แต่ทักษะการคิดเชิงวิพากษ์ของมนุษย์",
            "ยังคงเป็นสิ่งที่ทดแทนได้ยาก"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "4. ประโยคใดไม่มีความสมเหตุสมผลมากที่สุด",
        "c": [
            "เพราะว่าเมื่อคืนนี้ฝนตกหนักมาก ถนนหน้าบ้านจึงแห้งสนิทและมีฝุ่นฟุ้งกระจาย",
            "วิ่งออกกำลังกายตอนเช้าช่วยให้ร่างกายแข็งแรง",
            "แสงแดดที่ร้อนจัดทำให้ก้อนน้ำแข็งละลายกลายเป็นไอ",
            "การดื่มน้ำสะอาดอย่างเพียงพอมีส่วนช่วยให้ผิวพรรณชุ่มชื้น"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "5. พฤติกรรมการอ่านของบุคคลใดที่ค้นหาเฉพาะข้อมูลที่ต้องการโดยไม่พิจารณาส่วนอื่นของบทอ่าน",
        "c": [
            "ปูอ่านคำนำและบทสรุปเพื่อหาใจความสำคัญของหนังสือ",
            "เตอ่านบทความตั้งแต่ต้นจนจบเพื่อวิเคราะห์เจตนาของผู้เขียน",
            "วีอ่านวรรณกรรมเยาวชนเพื่อความเพลิดเพลินในเวลาว่าง",
            "ดินไล่สายตาหาคำว่า \"สัดส่วนประชากร\" ในตารางสถิติเพื่อนำตัวเลขไปตอบคำถาม"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "6. หากต้องการทราบว่าบทความวิจัยตีพิมพ์ในปี พ.ศ. ใดจากบทอ่าน ควรใช้กลยุทธ์ใดในการอ่านมากที่สุด",
        "c": [
            "อ่านอย่างละเอียดทีละบรรทัดตั้งแต่หน้าแรกจนถึงหน้าสุดท้าย",
            "อ่านข้ามคำศัพท์ที่ยากแล้วลองเดาความหมายรวม ๆ",
            "กวาดสายตาอย่างรวดเร็ว เพื่อมองหาตัวเลขที่อยู่บริเวณหัวกระดาษหรือเชิงอรรถหน้าแรก",
            "อ่านเฉพาะย่อหน้าสุดท้ายที่มีสรุปผลการวิจัย"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "8. ข้อใดคือลักษณะที่แตกต่างของบทอ่านดิจิทัลที่มีหน้าจอสลับไปมากับสื่อสิ่งพิมพ์",
        "c": [
            "มีไฮเปอร์ลิงก์หรือเครื่องมือนำทางที่เปิดโอกาสให้ผู้อ่านเลือกเส้นทางการอ่านของตนเองได้",
            "มีขนาดตัวอักษรที่ใหญ่และชัดเจนกว่าสื่อสิ่งพิมพ์เสมอ",
            "มีการใช้ภาษาที่ถูกต้องตามหลักไวยากรณ์มากกว่าสื่อสิ่งพิมพ์",
            "มีเนื้อหาที่เป็นเนื้อเรื่องยาวต่อเนื่องโดยไม่มีการแบ่งย่อหน้า"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "9. หากค้นหาข้อมูลจากบทความออนไลน์ที่มีความยาว ควรนำเทคนิคการอ่านข้ามส่วนมาใช้เมื่อใดจึงจะเหมาะสมที่สุด",
        "c": [
            "เมื่อพบคำศัพท์ยากที่ไม่เคยเห็นมาก่อนในชีวิต",
            "เมื่อเริ่มรู้สึกเหนื่อยล้าและไม่อยากอ่านต่อ",
            "เมื่อต้องการประเมินความน่าเชื่อถือของแหล่งที่มาของข้อมูล",
            "เมื่ออ่านผ่านส่วนที่เนื้อหาไม่เกี่ยวข้องกับสิ่งที่เป็นข้อมูลเป้าหมาย"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "10. หากต้องการประเมินเบื้องต้นว่าบทความมีความเป็นปัจจุบันและเหมาะสมที่จะนำมาอ้างอิง องค์ประกอบใดที่ควรตรวจสอบ\nเป็นอันดับแรก",
        "c": [
            "รูปภาพประกอบ",
            "วันที่เผยแพร่หรือวันที่ปรับปรุงข้อมูลล่าสุด",
            "จำนวนหน้ากระดาษของบทความ",
            "ความยาวของบทความและจำนวนย่อหน้าทั้งหมด"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "12. ในการสืบค้นข้อมูลบนเว็บเบราว์เซอร์ที่มีการเปิดหลายแท็บ พฤติกรรมของบุคคลในข้อใดแสดงถึงทักษะการค้นหาและ\nเลือกบทอ่านที่เกี่ยวข้องได้เหมาะสมที่สุด",
        "c": [
            "ขิมเชื่อมโยงผลการค้นหาจากคำโปรยในแต่ละแท็บ แล้วเลือกเปิดเฉพาะแท็บที่เกี่ยวข้องกับหัวข้อที่ต้องการศึกษาเพื่อประหยัดเวลา",
            "โยโย่เปิดอ่านทุกแท็บอย่างละเอียดตั้งแต่ย่อหน้าแรกจนจบทีละแท็บตามลำดับ",
            "ทรัพย์สุ่มเลือกเปิดเพียงแท็บเดียวแล้วยึดข้อมูลจากแท็บนั้นเป็นหลักในการตอบคำถาม",
            "วินปิดแท็บที่มีข้อมูลขัดแย้งกับความเห็นของตนเองทิ้งไปทันที"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "13. ข้อใดคือความหมายของการสร้างตัวแทนความคิดในขณะที่อ่านบทความ",
        "c": [
            "การจดจำตัวอักษรทุกตัวในบทอ่านได้โดยไม่ต้องแปลความหมาย",
            "การสร้างภาพในใจเพื่อเชื่อมโยงสิ่งที่อ่านเข้ากับมโนทัศน์ของตนเองในการเข้าถึงความหมายแท้จริง",
            "การคัดลอกข้อความจากบทอ่านไปวางในกระดาษคำตอบโดยไม่มีการเปลี่ยนแปลงคำ",
            "การท่องจำข้อความได้ทั้งหมดโดยไม่ผิดเพี้ยนไปจากเดิม"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "14. \"ประชากรวัยแรงงานมีแนวโน้มลดลงอย่างต่อเนื่อง ส่งผลให้เกิดภาวะขาดแคลนกำลังคนในภาคอุตสาหกรรม\"\nจากข้อความข้างต้น ข้อใดคือการจับใจความที่ตรงกับข้อมูลและมีความหมายเดิมได้ถูกต้องที่สุด",
        "c": [
            "โรงงานอุตสาหกรรมปิดตัวลงเพราะคนไม่นิยมทำงานหนัก",
            "ประชากรในวัยเรียนมีจำนวนน้อยลงส่งผลกระทบต่อเศรษฐกิจ",
            "รัฐบาลจำเป็นต้องนำเข้าแรงงานต่างด้าวมาทดแทนคนในประเทศ",
            "คนทำงานลดลงทำให้โรงงานต่าง ๆ ขาดแคลนคนทำงาน"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "15. ข้อใดจำแนกประเภทของบทอ่านระหว่างแบบต่อเนื่องและแบบไม่ต่อเนื่องได้ถูกต้อง",
        "c": [
            "บทความสารคดีวิทยาศาสตร์ = ไม่ต่อเนื่อง / แผนภูมิแท่งแสดงยอดขาย = ต่อเนื่อง",
            "ประกาศนียบัตร = ต่อเนื่อง / จดหมายส่วนตัว = ไม่ต่อเนื่อง",
            "นิยายออนไลน์ = ต่อเนื่อง / ตารางสถิติและแผนผังเส้นทางรถไฟฟ้า = ไม่ต่อเนื่อง",
            "เรียงความวิชาการ = ไม่ต่อเนื่อง / คู่มือการใช้เครื่องซักผ้า = ต่อเนื่อง"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "17. “ยอดผู้ป่วยโควิด-19 ลดลงอย่างมีนัยสำคัญในเดือนกรกฎาคม โดยมีกราฟเส้นประกอบแต่กราฟเส้นแสดง\nหัวลูกศรพุ่งสูงขึ้นอย่างรวดเร็วในเดือนเดียวกัน” จากข้อความดังกล่าวข้อใดกล่าวถูกต้องที่สุด",
        "c": [
            "บทความชิ้นนี้มีความสมบูรณ์แบบในการนำเสนอข้อมูล",
            "เกิดข้อขัดแย้งย่อยภายในบทอ่านแบบผสมที่ผู้อ่านต้องตั้งคำถามและตรวจสอบความถูกต้องอีกครั้ง",
            "ตัวกราฟกับข้อความไม่จำเป็นต้องสัมพันธ์กัน ผู้อ่านเลือกเชื่ออย่างใดอย่างหนึ่งได้",
            "ระบบคอมพิวเตอร์ที่ประมวลผลหน้าจอทำงานผิดพลาด"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "18. “เกษตรกรเปลี่ยนมาปลูกพืชหมุนเวียนที่ใช้น้ำน้อยแทนการทำนาปรัง เนื่องจากปริมาณน้ำในอ่างเก็บน้ำวิกฤตที่สุดในรอบ\n10 ปี” จากข้อความดังกล่าว การคาดคะเนตามหลักเหตุและผลในข้อใดถูกต้องที่สุด",
        "c": [
            "วิกฤตภัยแล้งและการขาดแคลนน้ำเป็นสาเหตุหลักที่ส่งผลให้เกษตรกรต้องปรับเปลี่ยนพฤติกรรมการเพาะปลูก",
            "ปริมาณน้ำในอ่างเก็บน้ำลดลงเพราะเกษตรกรหันมาปลูกพืชหมุนเวียนมากขึ้น",
            "การปลูกพืชหมุนเวียนจะทำให้น้ำในอ่างเก็บน้ำเพิ่มสูงขึ้นในอนาคตทันที",
            "เกษตรกรชอบปลูกพืชหมุนเวียนมากกว่าการทำนาปรังเป็นทุนเดิมอยู่แล้ว"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "20. การตั้งชื่อเรื่องให้กับบทอ่านที่มีความยาวและข้อมูลซับซ้อน ควรคำนึงถึงสิ่งใดมากที่สุด",
        "c": [
            "การสุ่มนำคำศัพท์ที่ปรากฏบ่อยที่สุดมาตั้งเป็นชื่อเรื่อง",
            "การนำชื่อของผู้เขียนมาตั้งเป็นชื่อเรื่องเพื่อความเป็นเกียรติ",
            "การใช้คำโฆษณาที่เกินจริงเพื่อดึงดูดความสนใจโดยไม่สนใจเนื้อหาหลัก",
            "การสรุปย่อข้อความและสาระสำคัญภาพรวมทั้งหมดออกมารวบยอดเป็นใจความเดียว"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "21. บุคคลในข้อใดแสดงถึงการเชื่อมโยงสาระจากหลายส่วนเมื่ออ่านบทความวิชาการยาว 5 หน้าและแก้ไขข้อขัดแย้งย่อย\nภายในบทอ่านได้เหมาะสมที่สุด",
        "c": [
            "พัดลมอ่านเฉพาะหน้าแรกและหน้าสุดท้ายแล้วสรุปเนื้อหาทันที",
            "โต๊ะตรวจสอบข้อมูลสถิติในย่อหน้าที่ 2 เปรียบเทียบกับข้อสรุปในย่อหน้าสุดท้ายเพื่อหาข้อสรุปที่<br>สอดคล้องเชิงตรรกะ",
            "ส้มท่องจำข้อความส่วนที่ยากที่สุดเพื่อนำมาสรุปเนื้อหาทันที",
            "แจงขีดเส้นใต้คำศัพท์ทุกคำที่ไม่เข้าใจความหมายเพื่อนำมาค้นหาในอินเทอร์เน็ต"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "22. หากนาย A ประเมินบทความจากแหล่งข้อมูลเดียว แล้วพบว่า ผู้เขียนรายงานเฉพาะข้อดีของการใช้สารเคมีชนิดหนึ่ง\nโดยจงใจไม่เขียนรายงานผลวิจัยด้านความเป็นพิษต่อสิ่งแวดล้อม นาย A ควรตัดสินใจเกี่ยวกับความเป็นกลางของเนื้อหา\nอย่างไร",
        "c": [
            "เนื้อหามีความเป็นกลางเพราะให้ข้อมูลที่ชัดเจนในด้านที่ผู้เขียนเจตนานำเสนอ",
            "เนื้อหามีความถูกต้องเที่ยงตรงสมบูรณ์แบบเพราะอ้างอิงจากแหล่งข้อมูลเดียว",
            "ไม่สามารถประเมินได้จนกว่าผู้เขียนจะเปลี่ยนรูปแบบการจัดย่อหน้า",
            "เนื้อหาขาดความเป็นกลางและมีความลำเอียงเนื่องจากนำเสนอข้อมูลไม่ครบถ้วน"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "23. “บทความแนะนำผลิตภัณฑ์อาหารเสริมสุขภาพ เขียนโดย สมาคมผู้จัดจำหน่ายวิตามินแห่งประเทศไทย ”\nจากข้อความข้างต้น สามารถพิจารณาเจตนาของผู้เขียนได้อย่างไร",
        "c": [
            "ผู้เขียนอาจมีเจตนาแอบแฝงทางการค้ามากกว่าการให้ความรู้เชิงวิทยาศาสตร์ที่เป็นกลาง",
            "เชื่อถือได้ทันทีเพราะมีคำว่าสมาคมในนามของผู้เขียน",
            "บทความนี้เขียนขึ้นเพื่อความบันเทิงและสุนทรียภาพส่วนบุคคลเท่านั้น",
            "ผู้เขียนขาดความรู้และความเชี่ยวชาญเกี่ยวกับผลิตภัณฑ์อย่างสิ้นเชิง"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "25. การที่ผู้เขียนกล่าวถึงการอ้างอิงท้ายบทความ สามารถส่งผลต่อการสะท้อนความคิดเห็นของผู้อ่านได้อย่างไร",
        "c": [
            "ทำให้บทความอ่านยากขึ้นและไม่มีประโยชน์เชิงเนื้อหา",
            "เป็นรูปแบบที่บ่งบอกว่าเป็นบทอ่านประเภทการพรรณนาอารมณ์",
            "แสดงถึงความเป็นมืออาชีพและช่วยเพิ่มความน่าเชื่อถือของเนื้อหาที่นำเสนอ",
            "ช่วยทำให้ผู้อ่านไม่ต้องใช้ความรู้เดิมในการตีความบทอ่าน"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "26. พฤติกรรมของบุคคลในข้อใดแสดงถึงการใช้ความรู้และประสบการณ์จากชีวิตจริงเปรียบเทียบมุมมองความคิดเหมาะสมที่สุด",
        "c": [
            "ซันเชื่อทุกข้อความที่ผู้เขียนระบุไว้โดยไม่นำมาคิดเปรียบเทียบกับสิ่งที่ตนเองเคยเจอ",
            "ฝันนำประสบการณ์ตรงที่ตนเองเคยเรียนออนไลน์มาเปรียบเทียบกับข้ออ้างของผู้เขียนเพื่อประเมินข้อมูล<br>ตามความเป็นจริง",
            "ปั้นปฏิเสธเนื้อหาในบทความทั้งหมดเพราะผู้เขียนไม่มีคุณวุฒิสูงพอ",
            "จันทร์อ่านเฉพาะย่อหน้าที่ตรงกับความพึงพอใจส่วนตัวของตนเอง"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "28. หากอ่านกระดานสนทนาออนไลน์ที่มีผู้มาแสดงความคิดเห็นโต้แย้งกันเกี่ยวกับ \"ภาษีคาร์บอน\" ผู้อ่านควรให้ความสำคัญ\nเพื่อประเมินความน่าเชื่อถือของความคิดเห็นตามหลักการในข้อใดมากที่สุด",
        "c": [
            "จำนวนยอดผู้กดถูกใจของความคิดเห็นนั้น",
            "ความรุนแรงของถ้อยคำที่ใช้ในการโจมตีฝ่ายตรงข้าม",
            "ความยาวของข้อความที่พิมพ์ลงในกระดานสนทนา",
            "ความสมเหตุสมผลเชิงตรรกะและหลักฐานเป็นรูปธรรมที่รองรับความคิดเห็นนั้น"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "29. เมื่ออ่านบทความจาก 3 แหล่งข้อมูลในเวลาที่ต่างกัน แหล่งที่ 1 กล่าวว่า “กาแฟช่วยลดความเสี่ยงโรคหัวใจ”\nแหล่งที่ 2 กล่าวว่า “กาแฟไม่มีผลต่อโรคหัวใจ” และแหล่งที่ 3 กล่าวว่า “กาแฟกระตุ้นให้เกิดหัวใจเต้นผิดจังหวะ”\nขั้นตอนแรกในการพิจารณาข้อเท็จจริงจากแหล่งข้อมูลคืออะไร",
        "c": [
            "ด่วนสรุปทันทีว่าแหล่งข้อมูลทั้งหมดเป็นเรื่องโกหก",
            "การเปรียบเทียบและคัดแยกจุดที่ข้อมูลขัดแย้งกันออกมาอย่างชัดเจนในแต่ละประเด็น",
            "เลือกเชื่อแหล่งข้อมูลที่ 1 ทันทีเพราะตนเองชอบดื่มกาแฟ",
            "นำข้อความทั้ง 3 แหล่งมาผสมรวมกันโดยไม่แยกแยะรายละเอียด"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "30. ข้อใดกล่าวถึงแนวทางที่ดีที่สุดในการจัดการข้อขัดแย้งของข้อมูลจากหลายแหล่งได้เหมาะสมที่สุด",
        "c": [
            "การประเมินความน่าเชื่อถือของแหล่งข้อมูลแต่ละแหล่งที่มาเพื่อคัดกรองแหล่งที่น่าเชื่อถือที่สุด",
            "การจัดทำโพลสำรวจความคิดเห็นแล้วตัดสินตามเสียงข้างมาก",
            "การละทิ้งข้อมูลในส่วนที่ขัดแย้งกันทั้งหมดแล้วไม่นำมาคิดวิเคราะห์อีกต่อไป",
            "การนำข้อมูลทั้งหมดไปใส่ในโปรแกรมการวิเคราะห์ด้วยปัญญาประดิษฐ์"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "31. ข้อความในข้อใดมีความสมเหตุสมผลและน่าเชื่อถือมากที่สุดในเชิงวิชาการ",
        "c": [
            "สินค้าของเรารักษาโรคได้ทุกชนิดเพราะใช้สูตรลับโบราณที่สืบทอดกันมาพันปี",
            "จากการทดลองแบบสุ่มและมีกลุ่มควบคุมในกลุ่มตัวอย่าง 5,000 คน พบว่าอัตราการฟื้นตัวของกล้ามเนื้อเพิ่มขึ้น<br>อย่างมีนัยสำคัญทางสถิติที่ 0.25",
            "คิดว่าโครงการนี้ดีแน่นอนเพราะดารานักแสดงชื่อดังหลายคนร่วมกันโพสต์สนับสนุนในอินสตาแกรม",
            "นโยบายนี้ต้องประสบความสำเร็จอย่างแน่นอนเพราะไม่มีใครกล้าออกมาคัดค้านเลยสักคนเดียว"
        ],
        "a": 1,
        "img": ""
    },
    {
        "q": "32. พฤติกรรมของบุคคลในข้อใดแสดงถึงกระบวนการการจัดการภาระงานที่เหมาะที่สุด",
        "c": [
            "การสำรวจภาระงานทั้งหมด ตั้งเป้าหมายเวลา วางแผนวิธีกำหนดคำตอบ และคอยติดตามตรวจสอบความคืบหน้า<br>ของตนเองเป็นระยะ",
            "เริ่มต้นทำงานทันทีโดยไม่ตรวจสอบว่าคำสั่งกำหนดให้ปฏิบัติรูปแบบใด",
            "ใช้เวลากับการทำภาระงานแรกจนถึงเวลาเลิกงาน",
            "รอคัดลอกชิ้นงานจากเพื่อนรอบข้างเมื่อใกล้หมดเวลา"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "34. เมื่ออ่านนวนิยาย ทักษะการอ่านในข้อใดจะช่วยเข้าใจอารมณ์และแรงจูงใจที่ซ่อนอยู่ของตัวละครได้ดีที่สุด",
        "c": [
            "การอ่านจับใจความเฉพาะประโยคแรกของทุกย่อหน้า",
            "การตรวจสอบว่านวนิยายเรื่องนี้ใช้กระดาษประเภทใดในการตีพิมพ์",
            "การนับจำนวนคำสรรพนามที่ปรากฏในเนื้อเรื่อง",
            "การวิเคราะห์ถ้อยคำ วลี และบริบทแวดล้อมเพื่อตีความความหมายแฝง"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "36. หากพบข้อความพาดหัวข่าวในสื่อสาธารณะว่า “พบนวัตกรรมใหม่ กินผลไม้ชนิดนี้ช่วยรักษามะเร็งหายขาดได้ใน 3 วัน”\nบุคคลในข้อใดมีพฤติกรรมการอ่านที่ขาดวิจารณญาณ",
        "c": [
            "แบมกดปุ่มแบ่งปันข้อมูลนี้ไปยังกลุ่มสาธารณะทันทีเพราะเห็นว่าเป็นประโยชน์โดยไม่ได้ตรวจสอบความจริง",
            "แซมเปิดเว็บแท็บใหม่เพื่ออ่านตรวจสอบกับข้อมูลของกระทรวงสาธารณสุข",
            "แดนตั้งคำถามท้าทายความสมเหตุสมผลเชิงตรรกะว่ามะเร็งไม่สามารถหายขาดได้ใน 3 วัน",
            "แมนตรวจสอบชื่อผู้เขียนและแหล่งที่มาของสำนักข่าวก่อนนำไปเล่าให้ผู้อื่นฟัง"
        ],
        "a": 0,
        "img": ""
    },
    {
        "q": "37. ข้อใดกล่าวได้ถูกต้องที่สุดเกี่ยวกับประโยชน์ของการอ่านบทความในสถานการณ์ทางการศึกษา",
        "c": [
            "เพื่อความสนุกสนานเพลิดเพลินและผ่อนคลายอารมณ์ในยามว่าง",
            "เพื่อตรวจสอบความถูกต้องของสัญญาการว่าจ้างแรงงาน",
            "เพื่อความสะดวกรวดเร็วในการปฏิบัติตามคำสั่งของหัวหน้างาน",
            "เพื่อการสกัดเนื้อหาเชิงลึก ทำความเข้าใจมโนทัศน์ใหม่และนำข้อมูลไปใช้ในการเรียนรู้หรือสร้างองค์ความรู้ใหม่"
        ],
        "a": 3,
        "img": ""
    },
    {
        "q": "38. ข้อใดกล่าวเกี่ยวกับการอ่านในสถานการณ์ทางการงานอาชีพได้ถูกต้อง",
        "c": [
            "การอ่านข้อความแชทส่วนตัวจากเพื่อนร่วมรุ่นเพื่อไปงานเลี้ยงสังสรรค์",
            "การอ่านวรรณคดีเรื่องขุนช้างขุนแผนเพื่อวิเคราะห์คุณค่าทางวรรณศิลป์",
            "การอ่านคู่มือหรือคำสั่งปฏิบัติงานเพื่อตรวจเช็กขั้นตอนการเดินเครื่องจักรในโรงงานให้ถูกต้องและปลอดภัยทันที",
            "การอ่านป้ายประกาศรับบริจาคโลหิตที่ตั้งอยู่บริเวณห้างสรรพสินค้า"
        ],
        "a": 2,
        "img": ""
    },
    {
        "q": "40. บทความเรื่องพลังงานทดแทน สรุปได้ว่า “พลังงานลมดีที่สุด” ข้อใดกล่าวถึงการนำข้อมูลไปบูรณาการได้ถูกต้อง",
        "c": [
            "พลอยไม่เห็นด้วยกับบทความนี้เพราะแถวบ้านไม่มีลดพัด",
            "แพนอ่านบทความเรื่องพลังงานทดแทนและขีดเส้นใต้คำว่า “พลังงานลม” ด้วยปากกาไฮไลต์สีชมพู",
            "พิณนำข้อมูลเกี่ยวกับข้อดีและข้อจำกัดของพลังงานลมมาสร้างตารางสรุปเนื้อหาในการนำไปใช้ศึกษาต่อ",
            "พรรณาท่องจำทุกคำในบทความเพื่อเล่าให้เพื่อนในชั้นเรียนได้ฟัง"
        ],
        "a": 2,
        "img": ""
    }
];

const FALLBACK_EXAM = [
    ...FALLBACK_MATH.slice(0, 10),
    ...FALLBACK_SCIENCE.slice(0, 10),
    ...FALLBACK_THAI.slice(0, 10)
];

// Helper to determine active subject config via URL params
function getSubjectConfig() {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subject") || "math";
    const norm = sub.trim().toLowerCase();
    
    if (norm === "science" || norm === "วิทยาศาสตร์") {
        return { file: "science.json", set: "Monster_Set2", name: "วิทยาศาสตร์", fallback: FALLBACK_SCIENCE };
    } else if (norm === "thai" || norm === "ภาษาไทย") {
        return { file: "thai.json", set: "Monster_Set3", name: "ภาษาไทย", fallback: FALLBACK_THAI };
    } else if (norm === "exam" || norm === "สอบรวม" || norm === "รวมวิชา") {
        return { file: "exam.json", set: "mixed", name: "สอบรวม", fallback: FALLBACK_EXAM };
    } else {
        return { file: "math.json", set: "Monster_Set1", name: "คณิตศาสตร์", fallback: FALLBACK_MATH };
    }
}

const subjectConfig = getSubjectConfig();
window.MONSTER_SET = subjectConfig.set;
window.SUBJECT_NAME = subjectConfig.name;

function indexScenarios(list) {
    SCENARIOS = Array.isArray(list) ? list : [];
    SCENARIOS_BY_ID = {};
    SCENARIOS.forEach((s) => {
        if (s && s.id) SCENARIOS_BY_ID[s.id] = s;
    });
    window.SCENARIOS = SCENARIOS;
    window.SCENARIOS_BY_ID = SCENARIOS_BY_ID;
}

function getScenarioById(id) {
    if (!id) return null;
    return (window.SCENARIOS_BY_ID && window.SCENARIOS_BY_ID[id]) || SCENARIOS_BY_ID[id] || null;
}

/**
 * Convert plain newlines to <br> WITHOUT breaking HTML tables/tags.
 * (Naive .replace(/\n/g,"<br>") inserts <br> inside <table>… and creates empty cells/gaps.)
 */
function formatHtmlPreserveTags(raw) {
    if (raw == null || raw === "") return "";
    let s = String(raw);
    // Drop whitespace/newlines that sit between tags (safe for tables)
    s = s.replace(/>\s+</g, "><");
    // Newlines remaining are in plain text → turn into <br>
    s = s.replace(/\n/g, "<br>");
    return s;
}

/**
 * Resolve scenario text for a question.
 * Prefer scenarioId lookup; fall back to legacy embedded text before "ข้อ N".
 */
function resolveScenarioForQuestion(qData) {
    if (!qData) return { scenario: "", question: "", scenarioKey: "" };

    const scenObj = getScenarioById(qData.scenarioId);
    if (scenObj) {
        return {
            scenario: scenObj.body || "",
            question: qData.q || "",
            scenarioKey: scenObj.id,
            scenarioMeta: scenObj
        };
    }

    // Legacy: scenario embedded in q text before "ข้อ N"
    let scenario = "";
    let question = qData.q || "";
    const qMatch = question.match(/(^|\n|>)\s*(ข้อ\s*\d+\.?)/);
    if (qMatch) {
        const index = qMatch.index + qMatch[1].length;
        scenario = question.substring(0, index).trim();
        question = question.substring(index).trim();
    }
    return {
        scenario,
        question,
        scenarioKey: scenario || "",
        scenarioMeta: null
    };
}

// Asynchronously load questions + scenarios, falling back to local list on failure/CORS
async function initQuestions() {
    const qFile = subjectConfig.file; // e.g. math.json
    const scenFile = `scenarios/${qFile}`;

    try {
        const [qRes, sRes] = await Promise.all([
            fetch(`${ASSETS_PATH}/data/${qFile}`),
            fetch(`${ASSETS_PATH}/data/${scenFile}`).catch(() => null)
        ]);
        if (!qRes || !qRes.ok) throw new Error("Network status not OK for questions");
        QUESTIONS = await qRes.json();

        if (sRes && sRes.ok) {
            indexScenarios(await sRes.json());
            console.log(`Loaded ${SCENARIOS.length} scenarios from ${scenFile}`);
        } else {
            indexScenarios([]);
            console.warn(`No scenarios file at ${scenFile} (ok if subject has none)`);
        }
        console.log(`Successfully loaded questions for ${subjectConfig.name} from ${qFile}.`);
    } catch (e) {
        console.warn(`Could not fetch ${qFile} (CORS or missing file), using fallback data:`, e);
        QUESTIONS = [...subjectConfig.fallback];
        indexScenarios([]);
    }

    // Translate mock questions and choices to Thai at runtime
    QUESTIONS = QUESTIONS.map((q) => {
        let newQ = q.q || "";
        if (newQ.includes("Mock")) {
            newQ = newQ.replace("Mock Math Question", "คำถามคณิตศาสตร์จำลองที่")
                       .replace("Mock Science Question", "คำถามวิทยาศาสตร์จำลองที่")
                       .replace("Mock Thai Question", "คำถามภาษาไทยจำลองที่")
                       .replace("Mock Question", "คำถามจำลองที่");
        }

        const choices = Array.isArray(q.c) ? q.c : ["", "", "", ""];
        const newC = choices.map(choice => {
            if (typeof choice === "string" && choice.includes("Choice")) {
                return choice.replace("Choice A", "ตัวเลือก ก")
                             .replace("Choice B", "ตัวเลือก ข")
                             .replace("Choice C", "ตัวเลือก ค")
                             .replace("Choice D", "ตัวเลือก ง")
                             .replace("Choice ก", "ตัวเลือก ก")
                             .replace("Choice ข", "ตัวเลือก ข")
                             .replace("Choice ค", "ตัวเลือก ค")
                             .replace("Choice ง", "ตัวเลือก ง");
            }
            return choice;
        });

        return {
            ...q,
            q: newQ,
            c: newC,
            scenarioId: q.scenarioId || null,
            img: q.img || "",
            showImg: !!q.showImg
        };
    });

    window.QUESTIONS = QUESTIONS;
}

// Helper to determine score from previous system via URL parameter or external API
function getScoreFromAPI() {
    const params = new URLSearchParams(window.location.search);
    const scoreVal = params.get("score");
    if (scoreVal !== null) {
        const parsed = parseInt(scoreVal, 10);
        return isNaN(parsed) ? 100 : parsed;
    }
    return 100; // Default to 100 if not specified
}
window.USER_SCORE = getScoreFromAPI();

function getURLParameter(name, defaultValue = "") {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || defaultValue;
}
window.STUDENT_ID = getURLParameter("student_id", "unknown");
window.EXAM_TOKEN = getURLParameter("token") || getURLParameter("session_token") || "none";
window.CALLBACK_URL = getURLParameter("callback_url", "");
