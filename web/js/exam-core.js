/* Shared question rules. Browser globals and Node tests use the same implementation. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    root.ExamCore = api;
})(typeof window === 'object' ? window : globalThis, function () {
    'use strict';
    const thaiDigits = '๐๑๒๓๔๕๖๗๘๙';
    const text = value => String(value ?? '').replace(/[๐-๙]/g, d => thaiDigits.indexOf(d)).trim();
    const compact = value => text(value).toLowerCase().replace(/\s+/g, '');
    const numberPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;
    // Unit correctness is deliberately not graded; only this explicit vocabulary is removable.
    const unitPattern = /(กิโลเมตรต่อชั่วโมง|กม\.?\/ชม\.?|km\/h|kph|กิโลเมตร|กม\.?|kilometers?|km|ลิตร|liters?|เซด|zeds?|เซนต์)/gi;
    const prefixPattern = /^(?:ตอบ|คือ|ประมาณ|เท่ากับ|จ่าย|ความเร็ว|ระยะทาง|ระยะ|ควรเติม|อย่างน้อย|เติม|น้ำมัน)\s*/;
    const suffixPattern = /\s*(?:ครับ|ค่ะ|คะ|นะ)$/;
    function numericText(value) {
        let s = text(value);
        if (!s || s.length > 512) return null;
        let previous;
        do { previous = s; s = s.replace(prefixPattern, '').replace(suffixPattern, '').trim(); } while (s !== previous);
        // Units may follow a value, including repeated units, but cannot join pieces of a number.
        const match = s.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(.*)$/);
        if (!match) return null;
        const remainder = match[2].replace(unitPattern, '').trim();
        return remainder === '' && numberPattern.test(match[1]) && Number.isFinite(Number(match[1])) ? match[1] : null;
    }
    function decimalParts(value) {
        let s = String(value);
        // Convert canonical finite targets written in exponent notation to plain decimals.
        if (/e/i.test(s)) {
            const [coefficient, exponent] = s.toLowerCase().split('e');
            const negative = coefficient.startsWith('-');
            const bare = coefficient.replace(/^[+-]/, '');
            const point = (bare.indexOf('.') < 0 ? bare.length : bare.indexOf('.')) + Number(exponent);
            const digits = bare.replace('.', '');
            s = (negative ? '-' : '') + (point <= 0 ? '0.' + '0'.repeat(-point) + digits : point >= digits.length ? digits + '0'.repeat(point - digits.length) : digits.slice(0, point) + '.' + digits.slice(point));
        }
        const [whole, fraction = ''] = s.replace(/^[+-]/, '').split('.');
        return { value: BigInt((whole || '0') + fraction) * (s.startsWith('-') ? -1n : 1n), scale: fraction.length };
    }
    function withinTolerance(value, target) {
        const a = decimalParts(value), b = decimalParts(target), scale = Math.max(a.scale, b.scale, 2);
        const diff = a.value * 10n ** BigInt(scale - a.scale) - b.value * 10n ** BigInt(scale - b.scale);
        return (diff < 0n ? -diff : diff) < 5n * 10n ** BigInt(scale - 2);
    }
    function checkTextAnswer(input, question) {
        if (!question || !text(input) || text(input).length > 512) return false;
        const targets = [question.targetNumber, ...(question.targetNumbers || [])].filter(Number.isFinite);
        const accepted = Array.isArray(question.answers) ? question.answers : [];
        const parsed = numericText(input);
        if (targets.length) {
            // A listed answer never bypasses numeric grammar for numeric questions.
            if (parsed === null) return false;
            if (accepted.some(a => compact(a) === compact(input))) return true;
            return targets.some(target => withinTolerance(parsed, target));
        }
        return accepted.some(a => compact(a) !== '' && compact(a) === compact(input));
    }
    function normalizeQuestion(q) {
        if (!q || typeof q !== 'object' || Array.isArray(q)) throw new Error('ข้อมูลข้อสอบต้องเป็น object');
        return { ...q, type: q.type ?? 'choice', c: q.c ?? ['', '', '', ''], a: q.a ?? 0,
            img: q.img ?? '', showImg: q.showImg === true || q.showImg === 'true', scenarioId: q.scenarioId || null,
            unit: q.unit ?? '', placeholder: q.placeholder ?? '', answers: q.answers ?? [],
            targetNumbers: q.targetNumbers ?? [], targetNumber: q.targetNumber ?? null, correctDisplay: q.correctDisplay ?? '' };
    }
    function validateScenarios(list) {
        if (!Array.isArray(list)) throw new Error('สถานการณ์ต้องเป็น array');
        const ids = new Set();
        list.forEach((s, i) => {
            if (!s || typeof s.id !== 'string' || !s.id.trim() || ids.has(s.id) || typeof s.body !== 'string' || !s.body.trim()) throw new Error(`สถานการณ์ ${i + 1}: id ซ้ำ/ว่าง หรือเนื้อหาไม่ถูกต้อง`);
            if (s.images !== undefined && (!Array.isArray(s.images) || s.images.some(x => typeof x !== 'string'))) throw new Error(`สถานการณ์ ${s.id}: images ไม่ถูกต้อง`);
            ids.add(s.id);
        });
        return list;
    }
    function validateQuestions(list, scenarios, { requireIds = true } = {}) {
        if (!Array.isArray(list) || !list.length) throw new Error('ไม่พบข้อสอบในคลัง');
        const ids = new Set(), scenarioIds = scenarios && new Set(validateScenarios(scenarios).map(s => s.id));
        list.forEach((q, i) => {
            const fail = message => { const error = new Error(`ข้อ ${i + 1}: ${message}`); error.questionIndex = i; throw error; };
            if (!q || typeof q !== 'object' || Array.isArray(q)) fail('ข้อมูลต้องเป็น object');
            if (requireIds && (typeof q.id !== 'string' || !q.id.trim() || ids.has(q.id))) fail('รหัสข้อสอบว่างหรือซ้ำ');
            ids.add(q.id);
            if (typeof q.q !== 'string' || !q.q.trim()) fail('ข้อความโจทย์ว่าง');
            if (q.scenarioId != null && (typeof q.scenarioId !== 'string' || (scenarioIds && !scenarioIds.has(q.scenarioId)))) fail('ไม่พบสถานการณ์อ้างอิง');
            if (q.img !== undefined && typeof q.img !== 'string') fail('ลิงก์ภาพต้องเป็นข้อความ');
            if (q.showImg !== undefined && ![true, false, 'true', 'false'].includes(q.showImg)) fail('showImg ไม่ถูกต้อง');
            for (const field of ['unit', 'placeholder', 'correctDisplay']) if (q[field] !== undefined && typeof q[field] !== 'string') fail(`${field} ต้องเป็นข้อความ`);
            if (!['choice', 'input'].includes(q.type ?? 'choice')) fail('ประเภทข้อสอบไม่ถูกต้อง');
            if (q.type === 'input') {
                if (q.targetNumber != null && !Number.isFinite(q.targetNumber)) fail('ค่าเป้าหมายไม่ถูกต้อง');
                if (q.targetNumbers !== undefined && (!Array.isArray(q.targetNumbers) || q.targetNumbers.some(n => !Number.isFinite(n)))) fail('รายการค่าเป้าหมายไม่ถูกต้อง');
                if (q.answers !== undefined && (!Array.isArray(q.answers) || q.answers.some(a => typeof a !== 'string' || !a.trim()))) fail('รายการคำตอบไม่ถูกต้อง');
                if (!Number.isFinite(q.targetNumber) && !(q.targetNumbers || []).length && !(q.answers || []).length) fail('ต้องกำหนดคำตอบข้อเขียน');
            } else if (!Array.isArray(q.c) || q.c.length !== 4 || q.c.some(c => typeof c !== 'string' || !c.trim()) || !Number.isInteger(q.a) || q.a < 0 || q.a > 3) fail('ต้องมี 4 ตัวเลือกและเฉลย index 0–3');
        });
        return list;
    }
    function groups(questions) {
        const result = [], byId = new Map();
        for (const q of questions) {
            if (!q.scenarioId) result.push([q]);
            else if (byId.has(q.scenarioId)) byId.get(q.scenarioId).push(q);
            else { const group = [q]; byId.set(q.scenarioId, group); result.push(group); }
        }
        return result;
    }
    function shuffle(list, random = Math.random) {
        const result = [...list];
        for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
        return result;
    }
    function clusterAndShuffleQuestions(questions, random = Math.random) { return shuffle(groups(questions), random).flat(); }
    function sampleGroups(questions, count, random = Math.random) {
        const candidates = groups(questions), memo = new Map();
        function ways(i, left) {
            if (!left) return 1;
            if (left < 0 || i === candidates.length) return 0;
            const key = `${i}:${left}`;
            if (!memo.has(key)) memo.set(key, ways(i + 1, left) + ways(i + 1, left - candidates[i].length));
            return memo.get(key);
        }
        if (!ways(0, count)) throw new Error(`ไม่สามารถเลือกครบสถานการณ์ให้ได้ ${count} ข้อ`);
        const selected = [];
        for (let i = 0, left = count; left && i < candidates.length; i++) {
            const take = ways(i + 1, left - candidates[i].length), skip = ways(i + 1, left);
            if (random() * (take + skip) < take) { selected.push(...candidates[i]); left -= candidates[i].length; }
        }
        return selected;
    }
    function sampleExamFromBank(bank, random = Math.random) {
        const {pisaQ, pisaS, mathQ, mathS, sciQ, sciS, thaiQ, thaiS = []} = bank;
        const allScenarios = [...pisaS, ...mathS, ...sciS, ...thaiS];
        validateScenarios(allScenarios);
        for (const [list, subject] of [[mathQ, 'math'], [sciQ, 'science'], [thaiQ, 'thai']]) {
            if (!Array.isArray(list) || list.some(q => q?.subject !== subject)) throw new Error(`คลัง ${subject}: หมวดวิชาไม่ถูกต้อง`);
        }
        validateQuestions([...pisaQ, ...mathQ, ...sciQ, ...thaiQ], allScenarios);
        if (pisaQ.length !== 15 || ['math', 'science', 'thai'].some(subject => pisaQ.filter(q => q.subject === subject).length !== 5)) throw new Error('PISA ต้องมี 15 ข้อ วิชาละ 5 ข้อ');
        const mathGroups = groups(mathQ), threes = mathGroups.filter(g => g.length === 3), twos = mathGroups.filter(g => g.length === 2);
        if (!threes.length || !twos.length) throw new Error('คณิตศาสตร์ต้องมีสถานการณ์ 3 ข้อและ 2 ข้อ');
        const selectedMath = [...threes[Math.floor(random() * threes.length)], ...twos[Math.floor(random() * twos.length)]];
        const questions = ['math', 'science', 'thai'].flatMap((subject, i) => clusterAndShuffleQuestions([
            ...pisaQ.filter(q => q.subject === subject),
            ...(i === 0 ? selectedMath : sampleGroups(i === 1 ? sciQ : thaiQ, 5, random))
        ], random));
        if (questions.length !== 30 || new Set(questions.map(q => q.id)).size !== 30) throw new Error('ชุดสอบไม่ครบ 30 ข้อหรือมีข้อซ้ำ');
        const needed = new Set(questions.map(q => q.scenarioId).filter(Boolean));
        return { questions, scenarios: allScenarios.filter(s => needed.has(s.id)) };
    }
    function isCorrect(answer, q) { return q.type === 'input' ? checkTextAnswer(answer, q) : Number.isInteger(answer) && answer === q.a; }
    function countCorrect(answers, questions) { return answers.reduce((sum, answer, i) => sum + Number(!!questions[i] && isCorrect(answer, questions[i])), 0); }
    function correctLabel(q) {
        const label = text(q.correctDisplay || q.answers?.[0] || (q.targetNumber ?? ''));
        return q.unit && !label.endsWith(q.unit) ? `${label} ${q.unit}` : label;
    }
    function inputHint(q) {
        const targets = [q.targetNumber, ...(q.targetNumbers || [])].filter(Number.isFinite);
        if (targets.length) {
            const lowTarget = Math.min(...targets), highTarget = Math.max(...targets);
            const margin = Math.max(5, Math.round(Math.max(Math.abs(lowTarget), Math.abs(highTarget)) * .15));
            return `🔭 ค่าตัวเลขคำตอบอยู่ระหว่าง ${Math.floor((lowTarget - margin) / 5) * 5} ถึง ${Math.ceil((highTarget + margin) / 5) * 5}${q.unit ? ' ' + q.unit : ''}`;
        }
        return q.correctDisplay ? `🔭 คำตอบขึ้นต้นด้วย “${q.correctDisplay.slice(0, 2)}…”` : '🔭 ตรวจสอบคำตอบและหน่วยให้ตรงกับโจทย์';
    }
    function resultUrl(callback, base, {studentId, token, answers, questions, status}) {
        const url = new URL(callback, base);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('ลิงก์ส่งผลต้องเป็น HTTP หรือ HTTPS');
        if (!['victory', 'gameover'].includes(status)) throw new Error('ยังไม่จบรอบสอบ');
        if (answers.length > questions.length || questions.some(q => !q.id) || new Set(questions.map(q => q.id)).size !== questions.length) throw new Error('ข้อมูลผลสอบไม่ถูกต้อง');
        url.searchParams.set('student_id', studentId); url.searchParams.set('token', token);
        url.searchParams.set('score', countCorrect(answers, questions)); url.searchParams.set('answers', JSON.stringify(answers));
        url.searchParams.set('question_ids', JSON.stringify(questions.map(q => q.id))); url.searchParams.set('status', status);
        return url.toString();
    }
    return {text, numericText, checkTextAnswer, normalizeQuestion, validateQuestions, validateScenarios, groups, shuffle, sampleGroups, clusterAndShuffleQuestions, sampleExamFromBank, isCorrect, countCorrect, correctLabel, inputHint, resultUrl};
});
