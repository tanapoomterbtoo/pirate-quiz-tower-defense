// Quiz data loader with a solid local fallback in case of CORS (file:// protocol)
let QUESTIONS = [];

// Fallback questions copied exactly from assets/data/questions.json
const FALLBACK_QUESTIONS = [
    {"q": "What is 2 + 2?", "c": ["3", "4", "5", "6"], "a": 1, "time": 5},
    {"q": "What is the capital of France?", "c": ["London", "Berlin", "Paris", "Madrid"], "a": 2},
    {"q": "Which is the largest planet?", "c": ["Earth", "Mars", "Saturn", "Jupiter"], "a": 3},
    {"q": "What color is a banana?", "c": ["Red", "Blue", "Yellow", "Green"], "a": 2},
    {"q": "How many legs does a spider have?", "c": ["6", "8", "10", "12"], "a": 1},
    {"q": "Which ocean is the largest?", "c": ["Atlantic", "Indian", "Arctic", "Pacific"], "a": 3},
    {"q": "What is the square root of 81?", "c": ["7", "8", "9", "10"], "a": 2},
    {"q": "What do bees produce?", "c": ["Milk", "Honey", "Silk", "Wax"], "a": 1},
    {"q": "How many continents are there?", "c": ["5", "6", "7", "8"], "a": 2},
    {"q": "Which direction does the sun rise?", "c": ["North", "South", "East", "West"], "a": 2},
    {"q": "What is the capital of Japan?", "c": ["Tokyo", "Seoul", "Beijing", "Bangkok"], "a": 0},
    {"q": "Which element has the symbol 'O'?", "c": ["Gold", "Oxygen", "Osmium", "Iron"], "a": 1},
    {"q": "Who wrote 'Hamlet'?", "c": ["Dickens", "Hemingway", "Shakespeare", "Tolkien"], "a": 2},
    {"q": "What is H2O commonly known as?", "c": ["Salt", "Sugar", "Air", "Water"], "a": 3},
    {"q": "Which planet is the Red Planet?", "c": ["Venus", "Mars", "Jupiter", "Uranus"], "a": 1},
    {"q": "What is 15 x 3?", "c": ["35", "40", "45", "50"], "a": 2},
    {"q": "What is the hardest natural substance?", "c": ["Gold", "Iron", "Quartz", "Diamond"], "a": 3},
    {"q": "How many states are in the USA?", "c": ["48", "49", "50", "51"], "a": 2},
    {"q": "Which animal is the king of the jungle?", "c": ["Tiger", "Lion", "Elephant", "Gorilla"], "a": 1},
    {"q": "What is the chemical symbol for Gold?", "c": ["Au", "Ag", "Fe", "Cu"], "a": 0},
    {"q": "Who painted the Mona Lisa?", "c": ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"], "a": 1},
    {"q": "What is the capital of Australia?", "c": ["Sydney", "Melbourne", "Brisbane", "Canberra"], "a": 3},
    {"q": "What is the speed of light? (approx)", "c": ["300,000 km/s", "150,000 km/s", "100,000 km/s", "50,000 km/s"], "a": 0},
    {"q": "Who developed the theory of relativity?", "c": ["Newton", "Galileo", "Einstein", "Tesla"], "a": 2},
    {"q": "What is the smallest country?", "c": ["Monaco", "Vatican City", "Nauru", "San Marino"], "a": 1},
    {"q": "Which element keeps bones strong?", "c": ["Iron", "Calcium", "Zinc", "Potassium"], "a": 1},
    {"q": "What is the largest desert?", "c": ["Gobi", "Arabian", "Sahara", "Antarctic"], "a": 3},
    {"q": "Who was the first person on the Moon?", "c": ["Gagarin", "Armstrong", "Aldrin", "Collins"], "a": 1},
    {"q": "What is 100 divided by 4?", "c": ["20", "25", "30", "35"], "a": 1},
    {"q": "How many days are in a leap year?", "c": ["364", "365", "366", "367"], "a": 2}
];

// Asynchronously load questions from JSON, falling back to local list on failure/CORS
async function initQuestions() {
    try {
        const response = await fetch(`${ASSETS_PATH}/data/questions.json`);
        if (!response.ok) throw new Error("Network status not OK");
        QUESTIONS = await response.json();
        console.log("Successfully loaded questions from JSON.");
    } catch (e) {
        console.warn("Could not fetch questions.json (CORS or missing file), using fallback data:", e);
        QUESTIONS = [...FALLBACK_QUESTIONS];
    }
}
