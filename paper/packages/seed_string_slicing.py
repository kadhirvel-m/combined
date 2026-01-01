
import os
import json
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tunex_seed_strings")

# Load env
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def seed_string_indexing():
    TOPIC_ID = "3e231b7f-d838-430b-8647-9a30767a75c6"
    logger.info(f"Seeding content for Topic ID: {TOPIC_ID}")

    # Clear existing content just in case
    supabase.table('lcoding_topic_chapters').delete().eq('topic_id', TOPIC_ID).execute()

    chapters_data = [
        # Chapter 1: Concept
        {
            'chapter_number': 1,
            'chapter_type': 'concept',
            'title': 'The Address System',
            'content': {
                'subtitle': 'Zero-Based Indexing',
                'description': 'Strings are ordered sequences. Every character has a specific "address" called an index, starting from 0.',
                'code_title': 'Accessing Characters',
                'code_snippet': 'word = "Python"\nprint(word[0])  # P\nprint(word[1])  # y',
                'code_output': 'P\ny',
                'mental_model': {
                    'title': 'Mental Model: Apartment Mailboxes',
                    'text': 'Think of a string as a row of mailboxes. The first mailbox is #0, the second is #1, and so on.'
                }
            }
        },
        # Chapter 2: Syntax
        {
            'chapter_number': 2,
            'chapter_type': 'syntax',
            'title': 'The Syntax',
            'content': {
                'description': 'Square brackets [] are the key to unlocking strings.',
                'syntax_block': 'string_variable[index]',
                'components': [
                    {'name': 'string', 'desc': 'The variable holding text'},
                    {'name': '[ ]', 'desc': 'Square brackets operator'},
                    {'name': 'index', 'desc': 'Integer position (0, 1, 2...)'}
                ],
                'tips': [
                    {'title': 'Start at Zero!', 'text': 'The first character is ALWAYS at index 0, not 1.'},
                    {'title': 'Integers Only', 'text': 'Indices must be integers. You cannot use floats like 1.5.'}
                ]
            }
        },
        # Chapter 3: Negative Indexing (Using 'range' layout style)
        {
            'chapter_number': 3,
            'chapter_type': 'range', 
            'title': 'Negative Indexing',
            'content': {
                'description': 'Python has a superpower: counting from the end! -1 is the last character.',
                'variations': [
                    {'code': 'word[-1]', 'meaning': 'Last character (n)', 'note': 'Start from end'},
                    {'code': 'word[-2]', 'meaning': 'Second to last (o)', 'note': 'Steps back'},
                    {'code': 'word[-6]', 'meaning': 'First character (P)', 'note': 'Wraps around'}
                ],
                'editor_id': 0,
                'default_code': 'text = "Super"\nprint(text[-1]) # Try accessing "S" using negative index!'
            }
        },
        # Chapter 4: Slicing (Sequences style)
        {
            'chapter_number': 4,
            'chapter_type': 'sequences',
            'title': 'String Slicing',
            'content': {
                'description': 'Extract a substring using the colon : operator.',
                'sections': [
                    {
                        'title': 'Basic Slice [start:end]',
                        'text': 'Grabs characters from start up to (but NOT including) end.',
                        'editor_id': 1,
                        'default_code': 'name = "Jason Bourne"\nfirst_name = name[0:5]\nprint(first_name)'
                    },
                    {
                        'title': 'Shortcuts',
                        'text': 'Omit start to start from 0. Omit end to go to the very end.',
                        'editor_id': 2,
                        'default_code': 'text = "DataScience"\nprint(text[:4])   # Data\nprint(text[4:])   # Science'
                    }
                ],
                'use_cases': ['Extracting dates', 'Parsing file extensions', 'Splitting names']
            }
        },
         # Chapter 5: Step Slicing
        {
            'chapter_number': 5,
            'chapter_type': 'nested', # Reusing nested layout for "Advanced"
            'title': 'The Step Argument',
            'content': {
                'description': 'You can add a third number to skip characters: [start:end:step].',
                'editor_id': 3,
                'default_code': 'alphabet = "abcdefgh"\n# Every 2nd letter\nprint(alphabet[::2])\n\n# REVERSE string using -1 step!\nprint(alphabet[::-1])',
                'warning': {
                    'title': 'Slicing Trick',
                    'text': 'Using [::-1] is the Pythonic way to reverse a string instantly.'
                }
            }
        },
        # Chapter 6: Immutability (Concept style)
        {
            'chapter_number': 6,
            'chapter_type': 'concept',
            'title': 'Immutability',
            'content': {
                'subtitle': 'Strings Cannot Change',
                'description': 'Once created, a string cannot be modified in place. You cannot do `s[0] = "A"`.',
                'code_title': 'The Error',
                'code_snippet': 's = "cat"\ns[0] = "b"  # ERROR!\n# Must create NEW string:\n# s = "b" + s[1:]',
                'code_output': 'TypeError: \'str\' object does not support item assignment',
                'mental_model': {
                    'title': 'Mental Model: Stone Tablet',
                    'text': 'Strings are carved in stone. To change them, you must carve a completely new stone.'
                }
            }
        },
        # Chapter 7: Mistakes
        {
            'chapter_number': 7,
            'chapter_type': 'mistakes',
            'title': 'Common Mistakes',
            'content': {
                'mistakes': [
                    {'name': 'IndexError', 'desc': 'Accessing index 10 in a 5-char string.', 'fix': 'Check len(s) first', 'icon': 'ri-error-warning-fill'},
                    {'name': 'Off-by-one', 'desc': 'Thinking slice [0:5] includes index 5.', 'fix': 'It stops BEFORE the end', 'icon': 'ri-ruler-2-line'},
                    {'name': 'Assignment', 'desc': 'Trying s[0] = "x".', 'fix': 'Create new string instead', 'icon': 'ri-spam-line'}
                ]
            }
        },
        # Chapter 8: Walkthrough
        {
            'chapter_number': 8,
            'chapter_type': 'walkthrough',
            'title': 'Walkthrough: Extract Domain',
            'content': {
                'problem_title': 'Parse Email Domain',
                'description': 'Get the company name from an email address using slicing/index.',
                'steps': [
                    {'title': 'Find @', 'text': 'Get index of the @ symbol.'},
                    {'title': 'Slice', 'text': 'Take everything AFTER that index.'}
                ],
                'editor_id': 5,
                'default_code': 'email = "contact@tunex.c"\nat_index = email.find("@")\n\n# Start after @, go to end\ndomain = email[at_index + 1 :]\nprint(f"Domain: {domain}")'
            }
        },
        # Chapter 9: Interview
        {
            'chapter_number': 9,
            'chapter_type': 'interview',
            'title': 'Interview Questions',
            'content': {
                'subtitle': 'String manipulation is #1 in interviews.',
                'questions': [
                    {'company': 'Meta', 'icon': 'ri-facebook-fill', 'color': '#0668E1', 'tag': 'Strings', 'q': '"Reverse a string without using any built-in function (slicing allowed)."'},
                    {'company': 'Amazon', 'icon': 'ri-amazon-fill', 'color': '#FF9900', 'tag': 'Parsing', 'q': '"Extract the product ID from a URL string."'},
                    {'company': 'Google', 'icon': 'ri-google-fill', 'color': '#4285F4', 'tag': 'Palindrome', 'q': '"Check if a string is a palindrome using slicing."'}
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
                    {'q': 'If s="Python", what is s[1]?', 'opts': ['P', 'y', 't'], 'correct': 1, 'why': 'Index 0 is P, Index 1 is y'},
                    {'q': 'What does s[-1] return?', 'opts': ['First char', 'Last char', 'Error'], 'correct': 1, 'why': '-1 always refers to the last character'},
                    {'q': 'What does s[1:4] include?', 'opts': ['Indices 1, 2, 3', 'Indices 1, 2, 3, 4', 'Indices 0, 1, 2, 3'], 'correct': 0, 'why': 'Start inclusive (1), End exclusive (4)'},
                    {'q': 'How to reverse a string?', 'opts': ['s.reverse()', 's[::-1]', 's[-1:1]'], 'correct': 1, 'why': '[::-1] slices with step -1 (backwards)'},
                    {'q': 'Can you change s[0]?', 'opts': ['Yes', 'No, strings are immutable', 'Only if it is empty'], 'correct': 1, 'why': 'Strings are immutable in Python'}
                ]
            }
        }
    ]

    for ch in chapters_data:
        ch['topic_id'] = TOPIC_ID
        supabase.table('lcoding_topic_chapters').insert(ch).execute()
        logger.info(f"Inserted Chapter {ch['chapter_number']}: {ch['title']}")

    logger.info("Seed for String Indexing completed!")

if __name__ == "__main__":
    seed_string_indexing()
