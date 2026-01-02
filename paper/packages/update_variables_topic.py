
import os
import json
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tunex_update")

# Load env variables from the root .env file
# Try multiple paths to be safe
potential_env_paths = [
    os.path.join(os.path.dirname(__file__), '..', '.env'),
    os.path.join(os.getcwd(), '.env')
]

for path in potential_env_paths:
    if os.path.exists(path):
        load_dotenv(path)
        logger.info(f"Loaded env from {path}")
        break

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials. Ensure .env is loaded correctly.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def update_topic():
    TOPIC_ID = "062fefb1-d5df-48c6-8d15-101492adc14e"
    logger.info(f"Updating topic {TOPIC_ID}...")

    # 1. Delete existing chapters for this topic
    logger.info("Deleting old chapters...")
    supabase.table('lcoding_topic_chapters').delete().eq('topic_id', TOPIC_ID).execute()

    # 2. Define new chapters
    chapters_data = [
        # Chapter 1: What is a Variable?
        {
            'chapter_number': 1,
            'chapter_type': 'concept',
            'title': 'What is a Variable?',
            'content': {
                'subtitle': 'Your First Building Block',
                'description': 'A variable is a named container that stores data in your program. Think of it as a labeled box where you can put values and retrieve them later.',
                'blocks': [
                    {
                        'type': 'text',
                        'content': 'In Python, creating a variable is simple — you just assign a value to a name using the `=` operator. No type declarations needed!'
                    },
                    {
                        'type': 'code',
                        'title': 'Creating Variables',
                        'id': 'var_msg_intro',
                        'default_code': '# Creating variables in Python is simple\nname = "Alice"\nage = 25\nheight = 5.8\nis_student = True\n\n# Print them out\nprint("Name:", name)\nprint("Age:", age)\nprint("Height:", height)\nprint("Is Student:", is_student)'
                    },
                    {
                        'type': 'split',
                        'left': {
                            'title': 'Dynamic Typing',
                            'content': 'Python is **dynamically typed** — you don\'t need to declare the type of a variable. Python figures it out automatically based on the value you assign.'
                        },
                        'right': {
                            'type': 'code_static',
                            'title': 'Variables as Labels',
                            'content': 'unlike some languages where variables are like fixed boxes, Python variables are more like *labels* or sticky notes attached to objects in memory.\n\nWhen you write `x = 10`, you creating an integer object 10 and attaching the label `x` to it.'
                        }
                    },
                    {
                        'type': 'mental_model',
                        'title': 'Real Life Analogy: Smartphone Contacts',
                        'text': 'Think of variables like **contacts in your phone**.\n\nYou don\'t memorize your best friend\'s phone number (the data). Instead, you save it under their name (the variable).\n\nWhen you want to call them, you just use their name. If they change their number, you just update the contact, and the name stays the same.',
                        'examples': ['Mom = 555-0199', 'Pizza_Place = 555-0100']
                    },
                    {
                        'type': 'code',
                        'title': 'Reassigning Variables',
                        'id': 'var_reassign',
                        'default_code': '# This is perfectly valid in Python!\nx = 10      # x points to integer 10\nprint(x, type(x))\n\nx = "hello"  # Now x points to string "hello"\nprint(x, type(x))\n\nx = [1, 2, 3]  # Now x points to a list\nprint(x, type(x))'
                    }
                ]
            }
        },
        # Chapter 2: Variable Naming Rules
        {
            'chapter_number': 2,
            'chapter_type': 'concept',  # Using concept with blocks to show rules clearly
            'title': 'Variable Naming Rules',
            'content': {
                'description': 'Python has strict rules for naming variables. Breaking these rules will cause a SyntaxError.',
                'blocks': [
                    {
                        'type': 'cards',
                        'title': 'The Rules You Must Follow',
                        'items': [
                            {
                                'title': 'Start with Letter or _',
                                'value': 'Required',
                                'icon': 'ri-check-line',
                                'tags': ['Valid: name, _count']
                            },
                            {
                                'title': 'No Special Characters',
                                'value': 'Forbidden',
                                'icon': 'ri-close-line',
                                'tags': ['Invalid: my-var, cost$']
                            },
                            {
                                'title': 'No Spaces Allowed',
                                'value': 'Use underscore',
                                'icon': 'ri-space',
                                'tags': ['Use: my_var or myVar']
                            }
                        ]
                    },
                    {
                        'type': 'code',
                        'title': 'Valid vs Invalid Names',
                        'id': 'var_rules',
                        'default_code': '# VALID variable names\nuser_name = "John"\nuserName = "John"\n_private = "secret"\ncount1 = 100\nMAX_SIZE = 1000\n\n# INVALID - uncomment to see errors!\n# 1count = 100     # Can\'t start with number\n# my-name = "John" # Hyphens not allowed\n# my name = "John" # Spaces not allowed\n\nprint("All valid names work!")\nprint(user_name, userName, _private, count1, MAX_SIZE)'
                    },
                    {
                        'type': 'callout',
                        'variant': 'warning',
                        'title': 'Reserved Keywords',
                        'text': 'Python has 35 reserved keywords like `if`, `else`, `for`, `while`, `class`, `def`, `import`, etc. You **cannot** use these as variable names!'
                    }
                ]
            }
        },
        # Chapter 3: Naming Conventions (PEP 8)
        {
            'chapter_number': 3,
            'chapter_type': 'concept',
            'title': 'Naming Conventions (PEP 8)',
            'content': {
                'subtitle': 'Write Code Like a Pro',
                'description': 'While Python allows many valid names, professionals follow PEP 8 — Python\'s official style guide. Following conventions makes your code readable and professional.',
                'blocks': [
                    {
                        'type': 'split',
                        'left': {
                            'title': 'snake_case for Variables',
                            'content': 'Use **lowercase letters with underscores** between words. This is the standard for variable and function names.'
                        },
                        'right': {
                            'type': 'code_static',
                            'content': '# GOOD\nuser_name = "Alice"\ntotal_count = 100\n\n# BAD\nusername = "Alice"\nTotalCount = 100'
                        }
                    },
                    {
                        'type': 'code',
                        'title': 'Example Code',
                        'id': 'var_convention',
                        'default_code': '# GOOD - snake_case (recommended)\nuser_name = "Alice"\ntotal_count = 100\nis_valid = True\n\n# BAD - harder to read\nusername = "Alice"  # OK but less clear\nTotalCount = 100    # Wrong convention\nIsValid = True      # This is for classes\n\nprint(user_name, total_count, is_valid)'
                    },
                    {
                        'type': 'pro_tip',
                        'title': 'Self-Documenting Code',
                        'text': 'Good variable names act as documentation. If someone reads `user_email`, they know exactly what it contains. If they see `x`, they have no idea!'
                    }
                ]
            }
        },
        # Chapter 4: Variable Assignment
        {
            'chapter_number': 4,
            'chapter_type': 'concept',
            'title': 'Variable Assignment',
            'content': {
                'subtitle': 'Multiple Ways to Assign',
                'description': 'Python offers several elegant ways to assign values to variables. These shortcuts make your code cleaner and more Pythonic.',
                'blocks': [
                    {
                        'type': 'code',
                        'title': 'Assignment Techniques',
                        'id': 'var_assign_tech',
                        'default_code': '# Basic assignment\nname = "Alice"\n\n# Multiple assignment (same value)\nx = y = z = 0\nprint(f"x={x}, y={y}, z={z}")\n\n# Multiple assignment (different values)\na, b, c = 1, 2, 3\nprint(f"a={a}, b={b}, c={c}")\n\n# Swap values (Pythonic way!)\na, b = b, a\nprint(f"After swap: a={a}, b={b}")\n\n# Unpack from a list\nfirst, second, third = [10, 20, 30]\nprint(f"first={first}, second={second}, third={third}")'
                    },

                ]
            }
        },
        # Chapter 5: Common Mistakes
        {
            'chapter_number': 5,
            'chapter_type': 'mistakes',
            'title': 'Common Mistakes',
            'content': {
                'mistakes': [
                    {
                        'name': 'Using Undefined Variables',
                        'desc': 'Trying to use a variable before assigning a value to it.',
                        'fix': 'x = 10\nprint(x) # Define before use',
                        'icon': 'ri-question-mark'
                    },
                    {
                        'name': 'Case Sensitivity',
                        'desc': 'Python treats \'name\' and \'Name\' as different variables.',
                        'fix': 'name = "Alice"\nprint(name) # Match exact case',
                        'icon': 'ri-font-size'
                    },
                    {
                        'name': 'Reserved Keywords',
                        'desc': 'Using Python keywords like \'class\', \'if\', \'for\' as variable names.',
                        'fix': 'class_name = "Python"\n# Use descriptive names',
                        'icon': 'ri-error-warning-fill'
                    }
                ]
            }
        },
        # Chapter 6: Practice Problems
        {
            'chapter_number': 6,
            'chapter_type': 'interview', # reusing interview layout for practice list
            'title': 'Practice Problems',
            'content': {
                'layout': 'practice_list',
                'questions': [
                    {
                        'q': 'Variable Swap',
                        'company': 'Easy',
                        'tag': 'Basics',
                        'problem_id': 'p_var_swap', # Placeholder ID
                        'icon': 'ri-code-line'
                    },
                    {
                        'q': 'Check Variable Type',
                        'company': 'Easy',
                        'tag': 'Types',
                        'problem_id': 'p_var_type', # Placeholder ID
                        'icon': 'ri-question-line'
                    },
                    {
                        'q': 'Variable Calculator',
                        'company': 'Medium',
                        'tag': 'Arithmetic',
                        'problem_id': 'p_var_calc', # Placeholder ID
                        'icon': 'ri-calculator-line'
                    }
                ]
            }
        },
        # Chapter 7: Mastery Check
        {
            'chapter_number': 7,
            'chapter_type': 'quiz',
            'title': 'Mastery Check',
            'content': {
                'questions': [
                    {
                        'q': 'Which of these is a valid Python variable name?',
                        'opts': ['2fast', 'my-var', '_count'],
                        'correct': 2,
                        'why': 'Variable names cannot start with a number (2fast) or contain hyphens (my-var). They CAN start with an underscore (_count).'
                    },
                    {
                        'q': 'What happens if you run `x = 10` then `x = "hello"`?',
                        'opts': ['Error: Type mismatch', 'x changes from int to string', 'x keeps both values'],
                        'correct': 1,
                        'why': 'Python is dynamically typed, so you can reassign variables to values of different types.'
                    },
                    {
                        'q': 'Which is the correct PEP 8 convention for variables?',
                        'opts': ['camelCase', 'snake_case', 'PascalCase'],
                        'correct': 1,
                        'why': 'PEP 8 recommends snake_case (lowercase with underscores) for variable names.'
                    },
                    {
                        'q': 'What is the value of x after: `x = 5; x += 2`?',
                        'opts': ['52', '7', 'Error'],
                        'correct': 1,
                        'why': 'x += 2 is shorthand for x = x + 2, so 5 + 2 = 7.'
                    }
                ]
            }
        }
    ]

    for ch in chapters_data:
        ch['topic_id'] = TOPIC_ID
        supabase.table('lcoding_topic_chapters').insert(ch).execute()
        logger.info(f"Inserted Chapter {ch['chapter_number']}: {ch['title']}")

    logger.info("Content update completed successfully!")

if __name__ == "__main__":
    update_topic()
