
import os
import json
import logging
from uuid import uuid4
from dotenv import load_dotenv
from supabase import create_client, Client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tunex_seed")

# Load env
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def seed_python_for_loop():
    logger.info("Starting seed for Python For Loop...")

    # 1. Create/Get Language
    lang_q = supabase.table('lcoding_languages').select('*').eq('name', 'Python').execute()
    if lang_q.data:
        lang_id = lang_q.data[0]['id']
    else:
        lang_res = supabase.table('lcoding_languages').insert({
            'name': 'Python',
            'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg'
        }).execute()
        lang_id = lang_res.data[0]['id']
    logger.info(f"Language ID: {lang_id}")

    # 2. Create/Get Level (NEW STRUCTURE)
    level_q = supabase.table('lcoding_levels').select('*').eq('language_id', lang_id).eq('title', 'Beginner').execute()
    if level_q.data:
        level_id = level_q.data[0]['id']
    else:
        level_res = supabase.table('lcoding_levels').insert({
            'language_id': lang_id,
            'title': 'Beginner',
            'order_index': 1
        }).execute()
        level_id = level_res.data[0]['id']
    logger.info(f"Level ID: {level_id}")

    # 3. Create/Get Section (Linked to Level now)
    sect_q = supabase.table('lcoding_sections').select('*').eq('level_id', level_id).eq('title', 'Fundamentals').execute()
    if sect_q.data:
        sect_id = sect_q.data[0]['id']
    else:
        sect_res = supabase.table('lcoding_sections').insert({
            'level_id': level_id,
            'title': 'Fundamentals',
            'order_index': 1
        }).execute()
        sect_id = sect_res.data[0]['id']
    logger.info(f"Section ID: {sect_id}")

    # 3. Create/Update Topic
    topic_q = supabase.table('lcoding_topics').select('*').eq('section_id', sect_id).eq('title', 'The for Loop').execute()
    if topic_q.data:
        topic_id = topic_q.data[0]['id']
        # Optionally update content if needed, but we're moving to chapters
    else:
        topic_res = supabase.table('lcoding_topics').insert({
            'section_id': sect_id,
            'title': 'The for Loop',
            'order_index': 1
        }).execute()
        topic_id = topic_res.data[0]['id']
    logger.info(f"Topic ID: {topic_id}")

    # 4. Insert Chapters (Delete existing first to ensure clean state)
    supabase.table('lcoding_topic_chapters').delete().eq('topic_id', topic_id).execute()

    chapters_data = [
        # Chapter 1: Concept
        {
            'chapter_number': 1,
            'chapter_type': 'concept',
            'title': 'What is a for loop?',
            'content': {
                'subtitle': 'The "Repeat" Machine',
                'description': 'Imagine you have a stack of 10 papers to sign. You don\'t sign them all at once. You take one, sign it, place it in the "done" pile, and repeat until the stack is empty. That is a loop.',
                'code_title': 'Your First Loop',
                'code_snippet': 'for i in range(5):\n    print("Hello")',
                'code_output': 'Hello\nHello\nHello\nHello\nHello',
                'mental_model': {
                    'title': 'Mental Model',
                    'text': 'Think of a for loop as a robot arm that picks up one item at a time from a conveyor belt, processes it, and moves to the next.'
                }
            }
        },
        # Chapter 2: Syntax
        {
            'chapter_number': 2,
            'chapter_type': 'syntax',
            'title': 'The Syntax',
            'content': {
                'description': 'How to write a for loop in Python.',
                'syntax_block': 'for <variable> in <sequence>:\n    # code to repeat',
                'components': [
                    {'name': 'for', 'desc': 'Keyword to start the loop'},
                    {'name': 'variable', 'desc': 'Holds the current item (e.g. i, item)'},
                    {'name': 'in', 'desc': 'Links variable to sequence'},
                    {'name': 'sequence', 'desc': 'List, range, or string to loop over'}
                ],
                'tips': [
                    {'title': 'Mental Model: The Loop Variable', 'text': 'The variable (i) is just a placeholder. It automatically updates to the next value in every iteration.'},
                    {'title': 'Indentation Matters!', 'text': 'Everything inside the loop MUST be indented (usually 4 spaces).'}
                ]
            }
        },
        # Chapter 3: Range
        {
            'chapter_number': 3,
            'chapter_type': 'range',
            'title': 'The range() Function',
            'content': {
                'description': 'Generating sequences of numbers on the fly.',
                'variations': [
                    {'code': 'range(5)', 'meaning': '0, 1, 2, 3, 4', 'note': 'Starts at 0, stops BEFORE 5'},
                    {'code': 'range(2, 6)', 'meaning': '2, 3, 4, 5', 'note': 'Starts at 2, stops BEFORE 6'},
                    {'code': 'range(0, 10, 2)', 'meaning': '0, 2, 4, 6, 8', 'note': 'Steps by 2'}
                ],
                'editor_id': 0,
                'default_code': '# Try different range() values\nfor i in range(1, 6):\n    print(i)'
            }
        },
        # Chapter 4: Sequences
        {
            'chapter_number': 4,
            'chapter_type': 'sequences',
            'title': 'Looping Through Sequences',
            'content': {
                'description': 'Loops aren\'t just for numbers. You can loop through lists and strings.',
                'sections': [
                    {
                        'title': 'Lists',
                        'text': 'Iterate through each item in a list.',
                        'editor_id': 1,
                        'default_code': 'fruits = ["apple", "banana", "cherry"]\n\nfor fruit in fruits:\n    print(f"I like {fruit}")'
                    },
                    {
                        'title': 'Strings',
                        'text': 'Iterate through each character in a string.',
                        'editor_id': 2,
                        'default_code': '# Loop through string\nword = "Python"\n\nfor char in word:\n    print(char)'
                    }
                ],
                'use_cases': ['Count vowels/consonants', 'Check for palindrome', 'Find specific characters']
            }
        },
         # Chapter 5: Nested Loops
        {
            'chapter_number': 5,
            'chapter_type': 'nested',
            'title': 'Nested Loops',
            'content': {
                'description': 'A loop inside another loop. The inner loop runs completely for each iteration of the outer loop.',
                'editor_id': 3,
                'default_code': '# Multiplication Table (Nested loop)\nfor i in range(1, 4):\n    for j in range(1, 4):\n        print(f"{i} x {j} = {i*j}")',
                'warning': {
                    'title': 'Warning: O(n²)',
                    'text': 'Nested loops multiply iterations. A loop of 100 inside another loop of 100 = 10,000 iterations.'
                }
            }
        },
        # Chapter 6: Keywords
        {
            'chapter_number': 6,
            'chapter_type': 'keywords',
            'title': 'break & continue',
            'content': {
                'description': 'Control your loop\'s behavior.',
                'keywords': [
                    {'name': 'break', 'tag': 'STOP', 'desc': 'Exits the loop immediately.', 'code': 'if i == 5:\n    break'},
                    {'name': 'continue', 'tag': 'SKIP', 'desc': 'Skips current iteration.', 'code': 'if i == 2:\n    continue'}
                ],
                'editor_id': 4,
                'default_code': '# Find first even number and stop\nnumbers = [1, 3, 5, 8, 9, 10]\n\nfor num in numbers:\n    if num % 2 == 0:\n        print(f"Found even: {num}")\n        break'
            }
        },
        # Chapter 7: Mistakes
        {
            'chapter_number': 7,
            'chapter_type': 'mistakes',
            'title': 'Common Mistakes',
            'content': {
                'mistakes': [
                    {'name': 'Off-by-one error', 'desc': 'range(5) gives 0-4, NOT 1-5.', 'fix': 'Use range(1, 6) for 1 to 5', 'icon': 'ri-error-warning-fill'},
                    {'name': 'Modifying List', 'desc': 'Never remove items from a list you\'re looping.', 'fix': 'Use list comprehension', 'icon': 'ri-delete-bin-2-fill'},
                    {'name': 'Missing Colon', 'desc': 'The line must end with :', 'fix': 'for i in range(5):', 'icon': 'ri-cursor-text'}
                ]
            }
        },
        # Chapter 8: Walkthrough
        {
            'chapter_number': 8,
            'chapter_type': 'walkthrough',
            'title': 'Solved Problem Walkthrough',
            'content': {
                'problem_title': 'Find Maximum Number',
                'description': 'Find the largest number in a list without using max().',
                'steps': [
                    {'title': 'Initialize', 'text': 'Assume the first number is the max.'},
                    {'title': 'Loop', 'text': 'Check every other number.'},
                    {'title': 'Compare', 'text': 'If current number > max, update max.'}
                ],
                'editor_id': 5,
                'default_code': '# Find maximum number (Walkthrough)\nnumbers = [3, 7, 2, 9, 4]\nmax_val = numbers[0]  # Assume first is max\n\nfor num in numbers:\n    if num > max_val:\n        max_val = num  # Found bigger!\n\nprint(f"Max value is: {max_val}")'
            }
        },
        # Chapter 9: Interview
        {
            'chapter_number': 9,
            'chapter_type': 'interview',
            'title': 'Interview Questions',
            'content': {
                'subtitle': 'How top companies ask about for loops.',
                'questions': [
                    {'company': 'Google', 'icon': 'ri-google-fill', 'color': '#4285F4', 'tag': 'Array', 'q': '"Find the second largest element in an array using a single pass."'},
                    {'company': 'Amazon', 'icon': 'ri-amazon-fill', 'color': '#FF9900', 'tag': 'HashMap', 'q': '"Loop through a list and count the frequency of each element."'},
                    {'company': 'Microsoft', 'icon': 'ri-microsoft-fill', 'color': '#00A4EF', 'tag': 'Pattern', 'q': '"Print a right-angled triangle pattern using nested loops."'},
                    {'company': 'Spotify', 'icon': 'ri-spotify-fill', 'color': '#1DB954', 'tag': 'Backend', 'q': '"Iterate through pagination tokens to fetch all API results."'}
                ]
            }
        },
        # Chapter 10: Quiz
        {
            'chapter_number': 10,
            'chapter_type': 'quiz',
            'title': 'Mastery Check',
            'content': {
                'questions': [
                    {'q': 'What does range(5) produce?', 'opts': ['1,2,3,4,5', '0,1,2,3,4', '0,1,2,3,4,5'], 'correct': 1, 'why': 'range(5) starts at 0 and stops before 5'},
                    {'q': 'What is the step in range(0, 10, 2)?', 'opts': ['0', '10', '2'], 'correct': 2, 'why': 'The third argument is step - it jumps by 2'},
                    {'q': 'What does "break" do?', 'opts': ['Skips current iteration', 'Exits the loop immediately', 'Does nothing'], 'correct': 1, 'why': 'break exits the entire loop, continue skips current iteration'},
                    {'q': 'How to loop with index AND value?', 'opts': ['for i, v in list:', 'for i, v in enumerate(list):', 'for i in len(list):'], 'correct': 1, 'why': 'enumerate() returns (index, value) tuples'},
                    {'q': 'Time complexity of nested loops?', 'opts': ['O(n)', 'O(n²)', 'O(log n)'], 'correct': 1, 'why': 'Two nested n-loops = n × n = O(n²)'}
                ]
            }
        }
    ]

    for ch in chapters_data:
        ch['topic_id'] = topic_id
        supabase.table('lcoding_topic_chapters').insert(ch).execute()
        logger.info(f"Inserted Chapter {ch['chapter_number']}: {ch['title']}")

    logger.info("Seed completed successfully!")

if __name__ == "__main__":
    seed_python_for_loop()
