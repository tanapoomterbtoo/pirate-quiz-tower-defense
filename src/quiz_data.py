import os
import json
from src.config import DATA_DIR

def load_questions():
    path = os.path.join(DATA_DIR, "questions.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {path}: {e}. Returning fallback data.")
        return [
            {"q": "Error loading questions.json", "c": ["A", "B", "C", "D"], "a": 0}
        ] * 30

QUESTIONS = load_questions()
