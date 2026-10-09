// Quiz data loader with solid local fallbacks in case of CORS (file:// protocol)
let QUESTIONS = [];
/** @type {Array<{id:string,title:string,body:string,images?:string[],order?:number}>} */
let SCENARIOS = [];
/** @type {Record<string, {id:string,title:string,body:string,images?:string[],order?:number}>} */
let SCENARIOS_BY_ID = {};

// Canonical fallback bundle is generated from the editable JSON banks.
const FALLBACK_MATH = window.FALLBACK_DATA.math;
const FALLBACK_SCIENCE = window.FALLBACK_DATA.science;
const FALLBACK_THAI = window.FALLBACK_DATA.thai;
const FALLBACK_EXAM = window.FALLBACK_DATA.exam;
const FALLBACK_PISA = window.FALLBACK_DATA.pisa;
const FALLBACK_PISA_SCENARIOS = window.FALLBACK_DATA.pisaScenarios;

// Helper to determine active subject config via URL params
function getSubjectConfig() {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get("subject") || "math";
    const norm = sub.trim().toLowerCase();
    
    if (norm === "science" || norm === "วิทยาศาสตร์") {
        return {
            file: "science.json",
            set: "Monster_Set2",
            name: "วิทยาศาสตร์",
            fallback: FALLBACK_SCIENCE,
            literacy: ["ด้านวิทยาศาสตร์ (Science Competency)"]
        };
    } else if (norm === "thai" || norm === "ภาษาไทย") {
        return {
            file: "thai.json",
            set: "Monster_Set3",
            name: "ภาษาไทย",
            fallback: FALLBACK_THAI,
            literacy: ["ด้านการอ่าน (Reading Literacy)"]
        };
    } else if (norm === "exam" || norm === "สอบรวม" || norm === "รวมวิชา") {
        return {
            file: "exam.json",
            set: "mixed",
            name: "สอบรวม",
            fallback: FALLBACK_EXAM,
            literacy: [
                "ด้านการอ่าน (Reading Literacy)",
                "ด้านคณิตศาสตร์ (Mathematical Literacy)",
                "ด้านวิทยาศาสตร์ (Science Competency)"
            ]
        };
    } else {
        return {
            file: "math.json",
            set: "Monster_Set1",
            name: "คณิตศาสตร์",
            fallback: FALLBACK_MATH,
            literacy: ["ด้านคณิตศาสตร์ (Mathematical Literacy)"]
        };
    }
}

const subjectConfig = getSubjectConfig();
window.MONSTER_SET = subjectConfig.set;
window.SUBJECT_NAME = subjectConfig.name;

function applyMenuLiteracy() {
    const list = document.querySelector(".literacy-list");
    if (!list) return;
    const items = Array.isArray(subjectConfig.literacy) ? subjectConfig.literacy : [];
    list.innerHTML = items.map((label) => `<li>${label}</li>`).join("");
    list.classList.toggle("literacy-list-single", items.length === 1);
}
window.applyMenuLiteracy = applyMenuLiteracy;
applyMenuLiteracy();

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

function normalizeQuestionList(list) {
    return list.map(q => ExamCore.normalizeQuestion(q));
}
const checkTextAnswer = ExamCore.checkTextAnswer;
window.checkTextAnswer = checkTextAnswer;

let RAW_EXAM_BANK = null;

const LOAD_WARNINGS = [];
function reportLoadWarning(message) {
    LOAD_WARNINGS.push(message);
    console.warn(message);
    const el = document.getElementById("data-load-status");
    if (el) { el.textContent = "ใช้คลังสำรอง: " + LOAD_WARNINGS.join(" · "); el.classList.remove("hidden"); }
}
async function loadJsonBank(file, fallback, validate) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await fetch(`${ASSETS_PATH}/data/${file}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        validate(data);
        return data;
    } catch (error) {
        reportLoadWarning(`${file} (${error.message})`);
        validate(fallback);
        return structuredClone(fallback);
    } finally { clearTimeout(timeout); }
}
async function loadExamRawBank() {
    if (RAW_EXAM_BANK) return RAW_EXAM_BANK;
    const subjects = ["pisa", "math", "science", "thai"];
    const pairs = await Promise.all(subjects.map(async subject => {
        const [questions, scenarios] = await Promise.all([
            loadJsonBank(`${subject}.json`, window.FALLBACK_DATA[subject], data => {
                ExamCore.validateQuestions(data);
                if (subject === "pisa" && (data.length !== 15 || ["math", "science", "thai"].some(s => data.filter(q => q.subject === s).length !== 5))) throw new Error("PISA ต้องมี 15 ข้อ วิชาละ 5 ข้อ");
            }),
            loadJsonBank(`scenarios/${subject}.json`, window.FALLBACK_DATA[subject + "Scenarios"], ExamCore.validateScenarios)
        ]);
        ExamCore.validateQuestions(questions, scenarios);
        return [questions, scenarios];
    }));
    RAW_EXAM_BANK = {pisaQ:pairs[0][0], pisaS:pairs[0][1], mathQ:pairs[1][0], mathS:pairs[1][1], sciQ:pairs[2][0], sciS:pairs[2][1], thaiQ:pairs[3][0], thaiS:pairs[3][1]};
    return RAW_EXAM_BANK;
}
const clusterAndShuffleQuestions = ExamCore.clusterAndShuffleQuestions;
const sampleExamFromBank = ExamCore.sampleExamFromBank;
window.clusterAndShuffleQuestions = clusterAndShuffleQuestions;

async function initDynamicExam() {
    const bank = await loadExamRawBank();
    const result = sampleExamFromBank(bank);
    indexScenarios(result.scenarios);
    QUESTIONS = normalizeQuestionList(result.questions);
    window.QUESTIONS = QUESTIONS;
    console.log(`Generated dynamic exam: ${QUESTIONS.length} questions (15 fixed PISA + 15 sampled).`);
}

function refreshExamQuestionsIfDynamic() {
    const isExamMode = subjectConfig.file === "exam.json";
    const isAdmin = new URLSearchParams(window.location.search).get("adminPreview") === "1";
    if (isExamMode && !isAdmin && RAW_EXAM_BANK) {
        const result = sampleExamFromBank(RAW_EXAM_BANK);
        indexScenarios(result.scenarios);
        QUESTIONS = normalizeQuestionList(result.questions);
        window.QUESTIONS = QUESTIONS;
        console.log(`Refreshed dynamic exam questions for new session.`);
    }
}
window.refreshExamQuestionsIfDynamic = refreshExamQuestionsIfDynamic;

// Asynchronously load questions + scenarios, falling back to local list on failure/CORS
async function initQuestions() {
    const isAdmin = new URLSearchParams(window.location.search).get("adminPreview") === "1";
    if (subjectConfig.file === "exam.json" && !isAdmin) {
        await initDynamicExam();
        return;
    }

    const subject = subjectConfig.file.replace(".json", "");
    const [questions, scenarios] = await Promise.all([
        loadJsonBank(subjectConfig.file, window.FALLBACK_DATA[subject], ExamCore.validateQuestions),
        loadJsonBank(`scenarios/${subject}.json`, window.FALLBACK_DATA[subject + "Scenarios"], ExamCore.validateScenarios)
    ]);
    ExamCore.validateQuestions(questions, scenarios);
    indexScenarios(scenarios);
    QUESTIONS = normalizeQuestionList(questions);
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
