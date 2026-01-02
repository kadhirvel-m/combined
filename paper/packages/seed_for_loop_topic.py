"""
Seed script for "for loop" topic - Matching the exact reference content
Run with: python packages/seed_for_loop_topic.py
"""

import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_for_loop_topic")

_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

TOPIC_ID = "c30bb135-1029-493c-82e3-5ab5edde3ae4"

CHAPTERS = [
    {
        "chapter_number": 1,
        "title": "What is a for loop?",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "content": "A `for` loop lets you **repeat code** for each item in a sequence - like going through a list one by one."
                },
                {
                    "type": "static_code",
                    "title": "YOUR FIRST FOR LOOP:",
                    "code": "for i in range(3):\n    print(\"Hello\")",
                    "output": "Hello\nHello\nHello"
                },
                {
                    "type": "callout",
                    "variant": "info",
                    "title": "Think of it like this:",
                    "text": "You have a stack of papers. You pick up each paper, read it, put it down, then pick up the next one. A for loop does exactly that with data."
                }
            ]
        }
    },
    {
        "chapter_number": 2,
        "title": "The Syntax",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "syntax_breakdown",
                    "code": "for variable in sequence:\n    # code to repeat",
                    "parts": [
                        {"keyword": "for", "desc": "Keyword that starts the loop"},
                        {"keyword": "variable", "desc": "Name you give to each item (like i, num, item)"},
                        {"keyword": "in", "desc": "Keyword that connects variable to sequence"},
                        {"keyword": "sequence", "desc": "What you're looping through (list, range, string)"}
                    ]
                },
                {
                    "type": "mental_model",
                    "title": "Mental Model: The Loop Variable",
                    "text": "The variable (like `i`) is just a **temporary container** that holds a different value each time the loop runs:",
                    "examples": ["Loop 1: i = 0", "Loop 2: i = 1", "Loop 3: i = 2"],
                    "note": "You can name it anything: i, x, item, fruit — Python doesn't care!"
                },
                {
                    "type": "warning_box",
                    "title": "Critical: Indentation Matters!",
                    "text": "In Python, **indentation tells Python what code belongs inside the loop**. Use 4 spaces (or Tab).",
                    "correct": "for i in range(3):\n    print(i)  # 4 spaces\n    print(\"done\")",
                    "wrong": "for i in range(3):\nprint(i)  # No indent!\n# IndentationError!"
                }
            ]
        }
    },
    {
        "chapter_number": 3,
        "title": "The range() Function",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "content": "`range()` generates a sequence of numbers. It's the most common way to control how many times a loop runs."
                },
                {
                    "type": "range_forms",
                    "forms": [
                        {"syntax": "range(stop)", "desc": "→ 0 to stop-1"},
                        {"syntax": "range(start, stop)", "desc": "→ start to stop-1"},
                        {"syntax": "range(start, stop, step)", "desc": "→ start to stop-1, jumping by step"}
                    ]
                },
                {
                    "type": "range_examples",
                    "examples": [
                        {"input": "range(5)", "output": "0, 1, 2, 3, 4"},
                        {"input": "range(1, 6)", "output": "1, 2, 3, 4, 5"},
                        {"input": "range(0, 10, 2)", "output": "0, 2, 4, 6, 8"}
                    ]
                },
                {
                    "type": "code",
                    "id": "range_demo",
                    "title": "Try it yourself",
                    "default_code": "# Try different range() values\nfor i in range(1, 6):\n    print(i)"
                }
            ]
        }
    },
    {
        "chapter_number": 4,
        "title": "Looping Through Sequences",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "section",
                    "icon": "ri-list-check",
                    "title": "Lists",
                    "text": "You can loop through any list. Each iteration gives you the next item."
                },
                {
                    "type": "code",
                    "id": "loop_list",
                    "title": "Loop through a list",
                    "default_code": "fruits = [\"apple\", \"banana\", \"cherry\"]\n\nfor fruit in fruits:\n    print(f\"I like {fruit}\")"
                },
                {
                    "type": "pro_tip",
                    "title": "Pro Tip: enumerate()",
                    "text": "Need the index too? Use `enumerate()`",
                    "code": "for index, fruit in enumerate(fruits):\n    print(f\"{index}: {fruit}\")"
                },
                {
                    "type": "section",
                    "icon": "ri-text",
                    "title": "Strings",
                    "text": "Strings are sequences of characters. You can loop through each character just like a list."
                },
                {
                    "type": "code",
                    "id": "loop_string",
                    "title": "Loop through a string",
                    "default_code": "word = \"Python\"\n\nfor char in word:\n    print(char)"
                },
                {
                    "type": "use_cases",
                    "title": "Common use cases:",
                    "items": [
                        "Count vowels/consonants in a word",
                        "Check if string is palindrome",
                        "Find specific characters"
                    ]
                }
            ]
        }
    },
    {
        "chapter_number": 5,
        "title": "Nested Loops",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "content": "A loop inside another loop. The inner loop runs completely for each iteration of the outer loop."
                },
                {
                    "type": "code",
                    "id": "nested_pattern",
                    "title": "Star pattern",
                    "default_code": "# Simple star pattern\nfor i in range(1, 5):\n    print(\"*\" * i)"
                },
                {
                    "type": "callout",
                    "variant": "warning",
                    "title": "Warning: O(n²)",
                    "text": "Nested loops multiply iterations. A loop of 100 inside another loop of 100 = 10,000 iterations. Interviewers watch for this!"
                }
            ]
        }
    },
    {
        "chapter_number": 6,
        "title": "break, continue, pass",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "content": "Control your loop's behavior with these special keywords."
                },
                {
                    "type": "keyword_cards",
                    "keywords": [
                        {
                            "name": "break",
                            "tag": "STOP",
                            "tag_color": "#EF4444",
                            "desc": "Exits the loop immediately. No more iterations.",
                            "code": "for i in range(10):\n    if i == 5:\n        break  # Stops at 5\n    print(i)  # Prints 0,1,2,3,4"
                        },
                        {
                            "name": "continue",
                            "tag": "SKIP",
                            "tag_color": "#F59E0B",
                            "desc": "Skips the current iteration and moves to the next one.",
                            "code": "for i in range(5):\n    if i == 2:\n        continue  # Skip 2\n    print(i)  # Prints 0,1,3,4"
                        },
                        {
                            "name": "pass",
                            "tag": "NOTHING",
                            "tag_color": "#6B7280",
                            "desc": "Does nothing. Used as a placeholder when syntax requires a statement.",
                            "code": "for i in range(5):\n    pass  # TODO: implement later"
                        }
                    ]
                },
                {
                    "type": "code",
                    "id": "break_continue",
                    "title": "Try break & continue",
                    "default_code": "# Find first even number and stop\nnumbers = [1, 3, 5, 8, 9, 10]\n\nfor num in numbers:\n    if num % 2 == 0:\n        print(f\"Found even: {num}\")\n        break"
                }
            ]
        }
    },
    {
        "chapter_number": 7,
        "title": "Common Mistakes",
        "chapter_type": "mistakes",
        "content": {
            "mistakes": [
                {
                    "name": "Off-by-one error",
                    "icon": "ri-close-circle-fill",
                    "desc": "range(5) gives 0,1,2,3,4 — NOT 1,2,3,4,5",
                    "fix": "Use range(1, 6) for 1 to 5"
                },
                {
                    "name": "Modifying list while iterating",
                    "icon": "ri-close-circle-fill",
                    "desc": "Never remove() items from a list you're looping through",
                    "fix": "Use list comprehension instead"
                },
                {
                    "name": "Forgetting the colon",
                    "icon": "ri-close-circle-fill",
                    "desc": "The line must end with :",
                    "fix": "for i in range(5):"
                }
            ]
        }
    },
    {
        "chapter_number": 8,
        "title": "Solved Problem Walkthrough",
        "chapter_type": "walkthrough",
        "content": {
            "problem": {
                "title": "Find the Maximum Element",
                "desc": "Given a list of numbers, find and return the largest number.",
                "example": "Input: [3, 7, 2, 9, 4] → Output: 9"
            },
            "steps": [
                {
                    "title": "Step 1: Understand the Problem",
                    "text": "We need to compare all elements and track the biggest one we've seen."
                },
                {
                    "title": "Step 2: Plan the Approach",
                    "items": [
                        "Assume the first element is the maximum",
                        "Loop through remaining elements",
                        "If current element > max, update max",
                        "Return max after loop ends"
                    ]
                },
                {
                    "title": "Step 3: Write the Code",
                    "code_id": "find_max",
                    "default_code": "# Find maximum number (Walkthrough)\nnumbers = [3, 7, 2, 9, 4]\nmax_val = numbers[0]  # Assume first is max\n\nfor num in numbers:\n    if num > max_val:\n        max_val = num  # Found bigger!\n\nprint(f\"Max value is: {max_val}\")"
                },
                {
                    "title": "Step 4: Trace Through",
                    "trace": [
                        {"num": 3, "max": 3, "updated": False},
                        {"num": 7, "max": 7, "updated": True},
                        {"num": 2, "max": 7, "updated": False},
                        {"num": 9, "max": 9, "updated": True},
                        {"num": 4, "max": 9, "updated": False}
                    ]
                },
                {
                    "title": "Step 5: Complexity Analysis",
                    "items": [
                        "**Time:** O(n) — we visit each element once",
                        "**Space:** O(1) — only one variable max_val"
                    ]
                }
            ],
            "takeaway": "This pattern — \"track the best value while looping\" — appears in many problems: find min, find second largest, find first occurrence, etc."
        }
    },
    {
        "chapter_number": 9,
        "title": "Interview Questions",
        "chapter_type": "interview",
        "content": {
            "layout": "company_cards",
            "questions": [
                {
                    "company": "Google",
                    "role": "Software Engineer II",
                    "icon": "ri-google-fill",
                    "color": "#4285F4",
                    "tag": "Array",
                    "question": "Find the second largest element in an array using a single pass."
                },
                {
                    "company": "Amazon",
                    "role": "SDE - I",
                    "icon": "ri-amazon-fill",
                    "color": "#FF9900",
                    "tag": "HashMap",
                    "question": "Loop through a list and count the frequency of each element."
                },
                {
                    "company": "Microsoft",
                    "role": "Frontend",
                    "icon": "ri-microsoft-fill",
                    "color": "#00A4EF",
                    "tag": "Pattern",
                    "question": "Print a right-angled triangle pattern using nested loops."
                },
                {
                    "company": "Spotify",
                    "role": "Backend",
                    "icon": "ri-spotify-fill",
                    "color": "#1DB954",
                    "tag": "String",
                    "question": "Check if a string is a palindrome using a for loop."
                }
            ],
            "tips": [
                "Always state the **time complexity** - nested loops = O(n²)",
                "Use `enumerate()` when you need both index and value",
                "Use `break` to exit early when condition is found",
                "Consider **edge cases**: empty list, single element, all same values"
            ]
        }
    },
    {
        "chapter_number": 10,
        "title": "Quick Quiz",
        "chapter_type": "quiz",
        "content": {
            "questions": [
                {
                    "q": "What does range(5) produce?",
                    "opts": ["1,2,3,4,5", "0,1,2,3,4", "0,1,2,3,4,5"],
                    "correct": 1,
                    "why": "range(5) starts at 0 and stops before 5"
                },
                {
                    "q": "What is the step in range(0, 10, 2)?",
                    "opts": ["0", "10", "2"],
                    "correct": 2,
                    "why": "The third argument is step - it jumps by 2"
                },
                {
                    "q": "What does \"break\" do?",
                    "opts": ["Skips current iteration", "Exits the loop immediately", "Does nothing"],
                    "correct": 1,
                    "why": "break exits the entire loop, continue skips current iteration"
                },
                {
                    "q": "How to loop with index AND value?",
                    "opts": ["for i, v in list:", "for i, v in enumerate(list):", "for i in len(list):"],
                    "correct": 1,
                    "why": "enumerate() returns (index, value) tuples"
                },
                {
                    "q": "Time complexity of nested loops?",
                    "opts": ["O(n)", "O(n²)", "O(log n)"],
                    "correct": 1,
                    "why": "Two nested n-loops = n × n = O(n²)"
                }
            ]
        }
    }
]

def seed():
    logger.info(f"Seeding chapters for topic: {TOPIC_ID}")
    
    try:
        supabase.table("lcoding_topic_chapters").delete().eq("topic_id", TOPIC_ID).execute()
        logger.info("Cleared existing chapters")
    except Exception as e:
        logger.warning(f"Could not clear chapters: {e}")
    
    for chapter in CHAPTERS:
        chapter_data = {
            "topic_id": TOPIC_ID,
            "chapter_number": chapter["chapter_number"],
            "title": chapter["title"],
            "chapter_type": chapter["chapter_type"],
            "content": chapter["content"]
        }
        
        try:
            supabase.table("lcoding_topic_chapters").insert(chapter_data).execute()
            logger.info(f"Inserted Chapter {chapter['chapter_number']}: {chapter['title']}")
        except Exception as e:
            logger.error(f"Failed to insert chapter: {e}")
            
    logger.info("Seeding complete!")

if __name__ == "__main__":
    seed()
