
import os
import json
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tunex_seed_if_else")

# Load env
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def seed_if_else_content():
    TOPIC_ID = "5bcddd7a-8c23-4645-a613-619010248db3"
    logger.info(f"Seeding CONTENT for Topic ID: {TOPIC_ID}")

    # Clear existing content
    try:
        supabase.table('lcoding_topic_chapters').delete().eq('topic_id', TOPIC_ID).execute()
        logger.info("Cleared existing chapters.")
    except Exception as e:
        logger.warning(f"Could not clear chapters (might be empty): {e}")

    chapters_data = [
        # Chapter 1: The Gatekeeper
        {
            'chapter_number': 1,
            'chapter_type': 'concept',
            'title': 'The Gatekeeper',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'title': 'Making Decisions',
                        'content': 'Code isn\'t always a straight line. Sometimes you need to make a decision: **"If this condition is true, do THIS. Otherwise, skip it."**\n\nThe `if` statement is your program\'s gatekeeper.'
                    },
                    {
                        'type': 'split',
                        'left': {
                            'title': 'Anatomy of an If',
                            'content': '1. The keyword `if`.\n2. A condition that evaluates to True/False.\n3. A colon `:`. \n4. **Indented code** (the body).'
                        },
                        'right': {
                            'type': 'code_static',
                            'content': 'age = 20\n\nif age >= 18:\n    print("Vote!")\n    print("Drive!")\n\nprint("Done") # Runs regardless'
                        }
                    },
                    {
                        'type': 'callout',
                        'variant': 'warning',
                        'title': 'Indentation Matters',
                        'text': 'In Python, whitespace is part of the syntax. You MUST indent the code inside the if block (usually 4 spaces).'
                    },
                    {
                        'type': 'code',
                        'id': 201,
                        'title': 'Check the Password',
                        'default_code': 'password = "sesame"\n\nif password == "sesame":\n    print("Open Sesame!")'
                    }
                ]
            }
        },
        # Chapter 2: The Fork (Else) (Graded Difficulty - Placement Focus)
        {
            'chapter_number': 2,
            'chapter_type': 'concept',
            'title': 'The Fork in the Road',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'content': 'What if the condition is False? Use `else` to specify an alternative path.\nThe `else` block has NO condition. It catches everything that fails the `if` check.'
                    },
                    {
                         'type': 'carousel',
                         'items': [
                            {
                                'title': 'Level 1: Odd or Even? (Easy)',
                                'desc': 'Check if a number is divisible by 2.',
                                'code_id': 202,
                                'default_code': 'num = 7\n\nif num % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")'
                            },
                            {
                                'title': 'Level 2: Shopping Discount (Medium)',
                                'desc': 'Logic: If bill > $1000, 10% off. Else 0% off. Calculate Final.',
                                'code_id': 204,
                                'default_code': 'bill = 1200\n\nif bill > 1000:\n    discount = bill * 0.10\n    final = bill - discount\n    print(f"Discount: {discount}, Pay: {final}")\nelse:\n    print(f"No Discount. Pay: {bill}")'
                            },
                             {
                                'title': 'Level 3: Leap Year Logic (Infosys/Wipro)',
                                'desc': 'Difficulty: High. A year is leap if div by 4, UNLESS div by 100 but not 400.',
                                'code_id': 205,
                                'default_code': '# Challenge: Logic Heirarchy\nyear = 2100\n\nif (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):\n    print("Leap Year")\nelse:\n    print("Not a Leap Year")'
                            }
                         ]
                    }
                ]
            }
        },
        # Chapter 3: Multiple Choices (Elif) (Graded Difficulty - Placement Focus)
        {
            'chapter_number': 3,
            'chapter_type': 'concept',
            'title': 'Multiple Choices (Elif)',
            'content': {
                'blocks': [
                    {
                        'type': 'text',
                        'title': 'More than two options?',
                        'content': 'Use `elif` (short for "else if") to check multiple conditions in sequence.'
                    },
                    {
                         'type': 'carousel',
                         'items': [
                            {
                                'title': 'Level 1: Traffic Light (Easy)',
                                'desc': 'Standard sequential check.',
                                'code_id': 206,
                                'default_code': 'light = "yellow"\n\nif light == "red":\n    print("Stop")\nelif light == "yellow":\n    print("Slow")\nelif light == "green":\n    print("Go")\nelse:\n    print("Panic!")'
                            },
                            {
                                'title': 'Level 2: Simple Calculator (Amazon)',
                                'desc': 'Perform +, -, *, / based on operator string. Handle "Invalid Operator".',
                                'code_id': 207,
                                'default_code': 'a = 10\nb = 5\nop = "*"\n\nif op == "+":\n    print(a + b)\nelif op == "-":\n    print(a - b)\nelif op == "*":\n    print(a * b)\nelif op == "/":\n    print(a / b)\nelse:\n    print("Invalid Operator")'
                            },
                            {
                                'title': 'Level 3: FizzBuzz Logic (Google)',
                                'desc': 'Print "Fizz" (div by 3), "Buzz" (div by 5), "FizzBuzz" (div by both).',
                                'code_id': 208,
                                'default_code': '# TRICKY: Order matters! Check both first.\nnum = 15\n\nif num % 3 == 0 and num % 5 == 0:\n    print("FizzBuzz")\nelif num % 3 == 0:\n    print("Fizz")\nelif num % 5 == 0:\n    print("Buzz")\nelse:\n    print(num)'
                            }
                         ]
                    }
                ]
            }
        },
        # Chapter 4: Common Mistakes
        {
            'chapter_number': 4,
            'chapter_type': 'mistakes', 
            'title': 'Bug Hunter',
            'content': {
                'mistakes': [
                    {
                        'name': 'Missing Colon',
                        'desc': 'Forgetting the colon at the end of the if line.',
                        'fix': 'if x > 5:  # <-- Don\'t forget!'
                    },
                    {
                        'name': 'Indentation Error',
                        'desc': 'Not indenting the body code correctly.',
                        'fix': 'if True:\n    print("Indented")'
                    },
                    {
                        'name': 'Assignment vs Equality',
                        'desc': 'Using = (assign) instead of == (compare).',
                        'fix': 'if x == 10:'
                    }
                ]
            }
        },
        # Chapter 5: Placement Questions
        {
            'chapter_number': 5,
            'chapter_type': 'interview',
            'title': 'Placement Questions',
            'content': {
                'questions': [
                    {
                        'company': 'TCS Digital',
                        'tag': 'Logic',
                        'q': 'Given a credit score X, determine eligibility: >750 (Auto-Approve), 650-750 (Review), <650 (Reject).',
                        'color': '#ef4444',
                        'icon': 'ri-building-line'
                    },
                    {
                        'company': 'Amazon',
                        'tag': 'Optimization',
                        'q': 'Find the second largest number among three variables a, b, c without using sorting.',
                         'color': '#FF9900',
                        'icon': 'ri-amazon-fill'
                    },
                    {
                         'company': 'Microsoft',
                         'tag': 'Triangle',
                         'q': 'Given 3 sides, check if they form a valid triangle (sum of any two > third) AND determine if Equilateral, Isosceles, or Scalene.',
                          'color': '#00A4EF',
                        'icon': 'ri-microsoft-fill'
                    }
                ]
            }
        },
        # Chapter 6: Practice Questions (List Layout)
        {
            'chapter_number': 6,
            'chapter_type': 'interview', # reusing interview type
            'title': 'Practice Questions',
            'content': {
                'layout': 'practice_list', # Flag to trigger vertical layout
                'questions': [
                    {
                        'company': 'Easy',
                        'tag': 'Basic Logic',
                        'q': 'Write a program to input a number and print "Positive" if it is greater than 0, "Negative" if less than 0, and "Zero" otherwise.',
                        'problem_id': '550e8400-e29b-41d4-a716-446655440001'
                    },
                    {
                        'company': 'Easy',
                        'tag': 'Age Check',
                        'q': 'Take a user\'s age as input. If age >= 18, print "Eligible to Vote", otherwise print "Not Eligible".',
                        'problem_id': '550e8400-e29b-41d4-a716-446655440002'
                    },
                    {
                        'company': 'Medium',
                        'tag': 'Vowel Check',
                        'q': 'Input a single character. Check if it is a Vowel (a, e, i, o, u) or a Consonant. Handle capital letters too!',
                        'problem_id': '550e8400-e29b-41d4-a716-446655440003'
                    },
                    {
                        'company': 'Medium',
                        'tag': 'Coordinates',
                        'q': 'Given x and y inputs, determining which quadrant (I, II, III, IV) the point lies in, or if it lies on an axis.',
                        'problem_id': '550e8400-e29b-41d4-a716-446655440004'
                    },
                    {
                        'company': 'Hard',
                        'tag': 'Electricity Bill',
                        'q': 'Calculate bill: Unit < 100: Free. 100-200: $5/unit. >200: $10/unit. Add 10% tax on total.',
                        'problem_id': '550e8400-e29b-41d4-a716-446655440005'
                    }
                ]
            }
        },
        # Chapter 7: Mastery Quiz
        {
            'chapter_number': 7,
            'chapter_type': 'quiz',
            'title': 'Mastery Check',
            'content': {
                'questions': [
                    {
                        'q': 'What is the output of "if not True:"?',
                        'opts': ['True', 'False', 'Error'],
                        'correct': 1,
                        'why': 'not True evaluates to False.'
                    },
                    {
                        'q': 'Which operator checks for inequality?',
                        'opts': ['<>', '!=', '!=='],
                        'correct': 1,
                        'why': '!= is the standard inequality operator.'
                    },
                    {
                        'q': 'In "if x:" x is False if it is...',
                        'opts': ['Example string', 'Non-zero number', 'Empty list []'],
                        'correct': 2,
                        'why': 'Empty sequences (lists, strings, tuples) are Falsy.'
                    },
                    {
                        'q': 'Can you nest an if statement inside another?',
                        'opts': ['Yes, unlimited depth', 'No', 'Max 3 levels'],
                        'correct': 0,
                        'why': 'Nesting is allowed but too much makes code hard to read.'
                    },
                    {
                        'q': 'What keyword is used for "else if"?',
                        'opts': ['elseif', 'else if', 'elif'],
                        'correct': 2,
                        'why': 'Python uses the unique keyword "elif".'
                    }
                ]
            }
        }
    ]

    try:
        for ch in chapters_data:
            ch['topic_id'] = TOPIC_ID
            supabase.table('lcoding_topic_chapters').insert(ch).execute()
            logger.info(f"Inserted Chapter {ch['chapter_number']}: {ch['title']}")
    except Exception as e:
        logger.error(f"Error seeding: {e}")

    logger.info("Seeding If/Else Completed!")

if __name__ == "__main__":
    seed_if_else_content()
