"""
Seed script to populate the "Variables & naming rules" topic with production-ready content.
Run with: python packages/seed_variables_topic.py
"""

import os
import json
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_variables_topic")

_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Topic ID from the URL
TOPIC_ID = "062fefb1-d5df-48c6-8d15-101492adc14e"

CHAPTERS = [
    {
        "chapter_number": 1,
        "title": "What is a Variable?",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "title": "Your First Building Block",
                    "content": """A **variable** is a named container that stores data in your program. Think of it as a labeled box where you can put values and retrieve them later.

In Python, creating a variable is simple — you just assign a value to a name using the `=` operator. No type declarations needed!"""
                },
                {
                    "type": "code",
                    "id": "var_intro",
                    "title": "Creating Variables",
                    "default_code": """# Creating variables in Python is simple
name = "Alice"
age = 25
height = 5.8
is_student = True

# Print them out
print("Name:", name)
print("Age:", age)
print("Height:", height)
print("Is Student:", is_student)"""
                },
                {
                    "type": "callout",
                    "variant": "info",
                    "title": "Dynamic Typing",
                    "text": "Python is **dynamically typed** — you don't need to declare the type of a variable. Python figures it out automatically based on the value you assign."
                },
                {
                    "type": "split",
                    "left": {
                        "title": "Variables as Labels",
                        "content": """Unlike some languages where variables are like fixed boxes, Python variables are more like **labels** or **sticky notes** attached to objects in memory.

When you write `x = 10`, you're creating an integer object `10` and attaching the label `x` to it.

This is why you can reassign variables to completely different types!"""
                    },
                    "right": {
                        "type": "code_static",
                        "content": """x = 10      # x points to integer 10
x = "hello"  # Now x points to string "hello"
x = [1, 2, 3]  # Now x points to a list

# This is perfectly valid in Python!"""
                    }
                }
            ]
        }
    },
    {
        "chapter_number": 2,
        "title": "Variable Naming Rules",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "title": "The Rules You Must Follow",
                    "content": """Python has **strict rules** for naming variables. Breaking these rules will cause a `SyntaxError`.

Follow these rules to keep your code error-free:"""
                },
                {
                    "type": "cards",
                    "title": "Naming Rules",
                    "items": [
                        {
                            "title": "Start with Letter or _",
                            "value": "Valid: name, _count",
                            "icon": "ri-checkbox-circle-fill",
                            "tags": ["Required"]
                        },
                        {
                            "title": "No Special Characters",
                            "value": "Invalid: my-var, cost$",
                            "icon": "ri-close-circle-fill",
                            "tags": ["Forbidden"]
                        },
                        {
                            "title": "No Spaces Allowed",
                            "value": "Use: my_var or myVar",
                            "icon": "ri-space",
                            "tags": ["Use underscore"]
                        }
                    ]
                },
                {
                    "type": "code",
                    "id": "naming_rules",
                    "title": "Valid vs Invalid Names",
                    "default_code": """# VALID variable names
user_name = "John"
userName = "John"
_private = "secret"
count1 = 100
MAX_SIZE = 1000

# INVALID - these will cause errors!
# 1count = 100     # Can't start with number
# my-name = "John" # Hyphens not allowed
# my name = "John" # Spaces not allowed
# class = "Python" # Reserved keyword

print("All valid names work!")
print(user_name, userName, _private, count1, MAX_SIZE)"""
                },
                {
                    "type": "callout",
                    "variant": "warning",
                    "title": "Reserved Keywords",
                    "text": "Python has 35 reserved keywords like `if`, `else`, `for`, `while`, `class`, `def`, `import`, etc. You **cannot** use these as variable names!"
                }
            ]
        }
    },
    {
        "chapter_number": 3,
        "title": "Naming Conventions (PEP 8)",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "title": "Write Code Like a Pro",
                    "content": """While Python allows many valid names, professionals follow **PEP 8** — Python's official style guide. Following conventions makes your code readable and professional."""
                },
                {
                    "type": "carousel",
                    "items": [
                        {
                            "title": "snake_case for Variables",
                            "desc": "Use lowercase letters with underscores between words. This is the standard for variable and function names.",
                            "code_id": "conv_snake",
                            "default_code": """# GOOD - snake_case (recommended)
user_name = "Alice"
total_count = 100
is_valid = True

# BAD - harder to read
username = "Alice"  # OK but less clear
TotalCount = 100    # Wrong convention
IsValid = True      # This is for classes

print(user_name, total_count, is_valid)"""
                        },
                        {
                            "title": "SCREAMING_CASE for Constants",
                            "desc": "Use ALL CAPS with underscores for values that should never change.",
                            "code_id": "conv_const",
                            "default_code": """# Constants - values that shouldn't change
MAX_CONNECTIONS = 100
API_KEY = "abc123xyz"
PI = 3.14159
DEFAULT_TIMEOUT = 30

print("Max connections:", MAX_CONNECTIONS)
print("Pi value:", PI)"""
                        },
                        {
                            "title": "Descriptive Names",
                            "desc": "Variable names should describe what they contain. Avoid single letters except in loops.",
                            "code_id": "conv_desc",
                            "default_code": """# BAD - What do these mean?
x = 25
t = 3600
n = "John Doe"

# GOOD - Self-documenting code
user_age = 25
timeout_seconds = 3600
customer_name = "John Doe"

print(f"{customer_name} is {user_age} years old")"""
                        }
                    ]
                },
                {
                    "type": "callout",
                    "variant": "success",
                    "title": "Pro Tip",
                    "text": "Good variable names act as documentation. If someone reads `user_email`, they know exactly what it contains. If they see `x`, they have no idea!"
                }
            ]
        }
    },
    {
        "chapter_number": 4,
        "title": "Variable Assignment",
        "chapter_type": "concept",
        "content": {
            "blocks": [
                {
                    "type": "text",
                    "title": "Multiple Ways to Assign",
                    "content": """Python offers several elegant ways to assign values to variables. These shortcuts make your code cleaner and more Pythonic."""
                },
                {
                    "type": "code",
                    "id": "assign_multi",
                    "title": "Assignment Techniques",
                    "default_code": """# Basic assignment
name = "Alice"

# Multiple assignment (same value)
x = y = z = 0
print(f"x={x}, y={y}, z={z}")

# Multiple assignment (different values)
a, b, c = 1, 2, 3
print(f"a={a}, b={b}, c={c}")

# Swap values (Pythonic way!)
a, b = b, a
print(f"After swap: a={a}, b={b}")

# Unpack from a list
first, second, third = [10, 20, 30]
print(f"first={first}, second={second}, third={third}")"""
                },
                {
                    "type": "split",
                    "left": {
                        "title": "Augmented Assignment",
                        "content": """Python supports shorthand operators that combine arithmetic with assignment:

- `+=` adds and assigns
- `-=` subtracts and assigns
- `*=` multiplies and assigns
- `/=` divides and assigns

These are cleaner than writing `x = x + 1`."""
                    },
                    "right": {
                        "type": "code_static",
                        "content": """count = 10

count += 5   # count = count + 5 → 15
count -= 3   # count = count - 3 → 12
count *= 2   # count = count * 2 → 24
count /= 4   # count = count / 4 → 6.0

print(count)  # Output: 6.0"""
                    }
                }
            ]
        }
    },
    {
        "chapter_number": 5,
        "title": "Common Mistakes",
        "chapter_type": "mistakes",
        "content": {
            "mistakes": [
                {
                    "name": "Using Undefined Variables",
                    "icon": "ri-error-warning-fill",
                    "desc": "Trying to use a variable before assigning a value to it.",
                    "fix": "print(x)  # Error!\nx = 10\nprint(x)  # Works!"
                },
                {
                    "name": "Case Sensitivity",
                    "icon": "ri-text-wrap",
                    "desc": "Python treats 'name' and 'Name' as different variables.",
                    "fix": "name = 'Alice'\nprint(name)  # Not Name or NAME"
                },
                {
                    "name": "Reserved Keywords",
                    "icon": "ri-lock-fill",
                    "desc": "Using Python keywords like 'class', 'if', 'for' as variable names.",
                    "fix": "class_ = 'Python'  # Add underscore\nfor_loop = 5        # Use descriptive name"
                }
            ]
        }
    },
    {
        "chapter_number": 6,
        "title": "Practice Problems",
        "chapter_type": "interview",
        "content": {
            "layout": "practice_list",
            "questions": [
                {
                    "q": "Variable Swap",
                    "company": "Easy",
                    "tag": "Basics",
                    "problem_id": "550e8400-e29b-41d4-a716-446655440001"
                },
                {
                    "q": "Check Variable Type",
                    "company": "Easy", 
                    "tag": "Types",
                    "problem_id": "550e8400-e29b-41d4-a716-446655440002"
                },
                {
                    "q": "Variable Calculator",
                    "company": "Medium",
                    "tag": "Arithmetic",
                    "problem_id": "550e8400-e29b-41d4-a716-446655440005"
                }
            ]
        }
    },
    {
        "chapter_number": 7,
        "title": "Mastery Check",
        "chapter_type": "quiz",
        "content": {
            "questions": [
                {
                    "q": "Which of these is a valid Python variable name?",
                    "opts": ["2fast", "my-var", "_count"],
                    "correct": 2,
                    "why": "Variable names can start with underscore or letter, but not numbers or special characters."
                },
                {
                    "q": "What naming style should you use for constants?",
                    "opts": ["snake_case", "camelCase", "SCREAMING_CASE"],
                    "correct": 2,
                    "why": "PEP 8 recommends ALL_CAPS with underscores for constant values."
                },
                {
                    "q": "What happens if you use a variable before assigning it?",
                    "opts": ["It becomes None", "NameError exception", "It becomes 0"],
                    "correct": 1,
                    "why": "Python raises a NameError when you try to use an undefined variable."
                },
                {
                    "q": "Which is the Pythonic way to swap a and b?",
                    "opts": ["temp=a; a=b; b=temp", "a, b = b, a", "swap(a, b)"],
                    "correct": 1,
                    "why": "Python's tuple unpacking allows elegant one-line swaps."
                }
            ]
        }
    }
]

def seed():
    logger.info(f"Seeding chapters for topic: {TOPIC_ID}")
    
    # 1. Clear existing chapters for this topic
    try:
        supabase.table("lcoding_topic_chapters").delete().eq("topic_id", TOPIC_ID).execute()
        logger.info("Cleared existing chapters")
    except Exception as e:
        logger.warning(f"Could not clear chapters: {e}")
    
    # 2. Insert new chapters
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
