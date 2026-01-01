
import os
import json
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tunex_seed_strings_dynamic")

# Load env
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def seed_string_indexing_dynamic():
    TOPIC_ID = "3e231b7f-d838-430b-8647-9a30767a75c6"
    logger.info(f"Seeding DYNAMIC content for Topic ID: {TOPIC_ID}")

    # Clear existing content
    supabase.table('lcoding_topic_chapters').delete().eq('topic_id', TOPIC_ID).execute()

    chapters_data = [
        # Chapter 1: The Concept (Custom Split Layout)
        {
            'chapter_number': 1,
            'chapter_type': 'concept', # Using 'concept' type but with dynamic blocks content
            'title': 'The Address System',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'content': 'Strings in Python are not just text; they are **ordered sequences**. Every character has a specific "address" called an **index**.'
                    },
                    {
                        'type': 'split',
                        'left': {
                            'title': 'Zero-Based Indexing',
                            'content': 'Python starts counting at **0**. The first character is at index 0, the second at 1, and so on.\n\nThink of it like an offset: how far are you from the start?'
                        },
                        'right': {
                            'type': 'code_static',
                            'content': 's = "PYTHON"\n\nprint(s[0])  # P\nprint(s[1])  # Y\nprint(s[5])  # N'
                        }
                    },
                    {
                        'type': 'callout',
                        'variant': 'warning',
                        'title': 'Common Pitfall',
                        'text': 'Attempting to access an index that doesn\'t exist (like index 10 in a 6-letter word) will crash your program with an IndexError.'
                    }
                ]
            }
        },
        # Chapter 2: Interactive Syntax (Text + Editor)
        {
            'chapter_number': 2,
            'chapter_type': 'concept',
            'title': 'Accessing Characters',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'title': 'Try it yourself',
                        'content': 'Use square brackets `[]` to access characters. Try to access the letter "R" in the word "SUPER".'
                    },
                    {
                        'type': 'code',
                        'id': 101,
                        'title': 'Playground',
                        'default_code': 'word = "SUPER"\n\n# The letter R is at index 4 (0,1,2,3,4)\nprint(word[4])'
                    }
                ]
            }
        },
        # Chapter 3: Negative Indexing (Visual explain)
        {
            'chapter_number': 3,
            'chapter_type': 'concept',
            'title': 'Negative Indexing',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'content': 'Python allows you to count from the end using negative numbers. `-1` is always the last character.'
                    },
                    {
                        'type': 'split',
                        'left': {
                            'title': 'Why use it?',
                            'content': 'It is extremely useful when you don\'t know the length of the string but need the last character (like a file extension or a trailing punctuation).'
                        },
                        'right': {
                            'type': 'code_static',
                            'content': 'filename = "image.png"\n\nprint(filename[-1]) # g\nprint(filename[-3]) # p'
                        }
                    },
                    {
                        'type': 'code',
                        'id': 102,
                        'title': 'Negative Indexing Challenge',
                        'default_code': 'text = "Python is awesome"\n# Print the last character using negative index\nprint(text[...])'
                    }
                ]
            }
        },
        # Chapter 4: Slicing Masterclass
        {
            'chapter_number': 4,
            'chapter_type': 'concept',
            'title': 'Slicing',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'title': 'The Colon Operator',
                        'content': 'You can extract a sub-part of a string using `[start:stop]`. Note that **stop is exclusive**.'
                    },
                    {
                        'type': 'callout',
                        'variant': 'info',
                        'title': 'Memory Trick',
                        'text': 'Think of the indices as pointing BETWEEN the characters. The slice happens there.'
                    },
                    {
                        'type': 'code',
                        'id': 103,
                        'title': 'Slice It',
                        'default_code': 's = "0123456789"\n\nprint(s[0:3])   # 012\nprint(s[2:5])   # 234\nprint(s[:3])    # Start to 3\nprint(s[3:])    # 3 to End'
                    }
                ]
            }
        },
        # Chapter 5: Advanced Slicing (Step)
        {
            'chapter_number': 5,
            'chapter_type': 'concept',
            'title': 'Advanced Slicing',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'content': 'slicing supports a stride: `[start:step:step]`'
                    },
                    {
                        'type': 'code',
                        'id': 104,
                        'title': 'Reversing a String',
                        'default_code': 's = "Reverse Me"\n\n# The Pythonic way to reverse\nprint(s[::-1])'
                    }
                ]
            }
        }
    ]

    try:
        # First delete explicitly to avoid stale chapters
        supabase.table('lcoding_topic_chapters').delete().eq('topic_id', TOPIC_ID).execute()
        
        for ch in chapters_data:
            ch['topic_id'] = TOPIC_ID
            supabase.table('lcoding_topic_chapters').insert(ch).execute()
            logger.info(f"Inserted Chapter {ch['chapter_number']}: {ch['title']}")
    except Exception as e:
        logger.error(f"Error seeding: {e}")
        try: 
            import pprint
            pprint.pprint(e.args)
        except: pass


    logger.info("Dynamic Seed for String Indexing completed!")

if __name__ == "__main__":
    seed_string_indexing_dynamic()
