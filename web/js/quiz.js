// Quiz data loader with solid local fallbacks in case of CORS (file:// protocol)
let QUESTIONS = [];

// Fallback questions for Math (คณิตศาสตร์)
const FALLBACK_MATH = [
    {
        "q": "Mock Math Question 1?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 2?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 3?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 4?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 5?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 6?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 7?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 8?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 9?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 10?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 11?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 12?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 13?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 14?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 15?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 16?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 17?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 18?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 19?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 20?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 21?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 22?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 23?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 24?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 25?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 26?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 27?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 28?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 29?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Math Question 30?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    }
];

// Fallback questions for Science (วิทยาศาสตร์)
const FALLBACK_SCIENCE = [
    {
        "q": "Mock Science Question 1?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 2?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 3?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 4?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 5?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 6?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 7?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 8?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 9?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 10?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 11?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 12?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 13?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 14?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 15?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 16?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 17?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 18?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 19?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 20?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 21?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 22?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 23?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 24?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 25?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 26?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 27?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 28?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 29?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    },
    {
        "q": "Mock Science Question 30?",
        "c": [
            "Choice A",
            "Choice B",
            "Choice C",
            "Choice D"
        ],
        "a": 0
    }
];

// Fallback questions for Thai (ภาษาไทย)
const FALLBACK_THAI = [
    {
        "q": "Mock Thai Question 1?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 2?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 3?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 4?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 5?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 6?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 7?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 8?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 9?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 10?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 11?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 12?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 13?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 14?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 15?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 16?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 17?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 18?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 19?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 20?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 21?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 22?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 23?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 24?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 25?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 26?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 27?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 28?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 29?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    },
    {
        "q": "Mock Thai Question 30?",
        "c": [
            "Choice ก",
            "Choice ข",
            "Choice ค",
            "Choice ง"
        ],
        "a": 0
    }
];

// Fallback questions for Exam (สอบรวม) - dynamically mixed from the other three sets
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

// Asynchronously load questions from JSON, falling back to local list on failure/CORS
async function initQuestions() {
    try {
        const response = await fetch(`${ASSETS_PATH}/data/${subjectConfig.file}`);
        if (!response.ok) throw new Error("Network status not OK");
        QUESTIONS = await response.json();
        console.log(`Successfully loaded questions for ${subjectConfig.name} from ${subjectConfig.file}.`);
    } catch (e) {
        console.warn(`Could not fetch ${subjectConfig.file} (CORS or missing file), using fallback data:`, e);
        QUESTIONS = [...subjectConfig.fallback];
    }
    
    // Translate mock questions and choices to Thai at runtime
    QUESTIONS = QUESTIONS.map((q) => {
        let newQ = q.q;
        if (newQ.includes("Mock")) {
            newQ = newQ.replace("Mock Math Question", "คำถามคณิตศาสตร์จำลองที่")
                       .replace("Mock Science Question", "คำถามวิทยาศาสตร์จำลองที่")
                       .replace("Mock Thai Question", "คำถามภาษาไทยจำลองที่")
                       .replace("Mock Question", "คำถามจำลองที่");
        }
        
        const newC = q.c.map(choice => {
            if (choice.includes("Choice")) {
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
        
        return { ...q, q: newQ, c: newC };
    });
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
