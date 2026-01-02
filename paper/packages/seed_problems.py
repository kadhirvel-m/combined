
import os
import json
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_problems")

_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase credentials")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

PROBLEMS = [
    {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "slug": "positive-negative",
        "title": "Positive, Negative, or Zero",
        "difficulty": "Easy",
        "description": """
# Check Number Sign

Write a function `check_sign(n)` that takes an integer `n` and returns:
- `"Positive"` if `n > 0`
- `"Negative"` if `n < 0`
- `"Zero"` if `n == 0`

### Example 1
**Input:** `n = 10`
**Output:** `"Positive"`

### Example 2
**Input:** `n = -5`
**Output:** `"Negative"`
        """,
        "boilerplate_code": "def check_sign(n):\n    # Write your code here\n    pass",
        "function_name": "check_sign",
        "companies": ["Easy", "Basics"],
        "test_cases": [
            {"input_json": [10], "expected_output_json": "Positive"},
            {"input_json": [-5], "expected_output_json": "Negative"},
            {"input_json": [0], "expected_output_json": "Zero"},
            {"input_json": [100], "expected_output_json": "Positive", "is_hidden": True},
            {"input_json": [-999], "expected_output_json": "Negative", "is_hidden": True}
        ]
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "slug": "voting-eligibility",
        "title": "Voting Eligibility",
        "difficulty": "Easy",
        "description": """
# Voting Eligibility

Write a function `can_vote(age)` that checks if a person is eligible to vote.
- If `age >= 18`, return `"Eligible to Vote"`
- Otherwise, return `"Not Eligible"`

### Example 1
**Input:** `age = 20`
**Output:** `"Eligible to Vote"`
        """,
        "boilerplate_code": "def can_vote(age):\n    pass",
        "function_name": "can_vote",
        "companies": ["Easy", "Civics"],
        "test_cases": [
            {"input_json": [20], "expected_output_json": "Eligible to Vote"},
            {"input_json": [15], "expected_output_json": "Not Eligible"},
            {"input_json": [18], "expected_output_json": "Eligible to Vote"},
        ]
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "slug": "vowel-consonant",
        "title": "Vowel or Consonant",
        "difficulty": "Medium",
        "description": "Check if character is 'Vowel' or 'Consonant'. Case insensitive.",
        "boilerplate_code": "def check_char(c):\n    pass",
        "function_name": "check_char",
        "companies": ["Medium", "String"],
        "test_cases": [
            {"input_json": ["a"], "expected_output_json": "Vowel"},
            {"input_json": ["B"], "expected_output_json": "Consonant"},
            {"input_json": ["E"], "expected_output_json": "Vowel"},
        ]
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "slug": "quadrant-check",
        "title": "Quadrant Finder",
        "difficulty": "Medium",
        "description": "Given x, y, return 'I', 'II', 'III', 'IV', 'X-Axis', 'Y-Axis', or 'Origin'.",
        "boilerplate_code": "def find_quadrant(x, y):\n    pass",
        "function_name": "find_quadrant",
        "companies": ["Medium", "Math"],
        "test_cases": [
            {"input_json": [1, 1], "expected_output_json": "I"},
            {"input_json": [-1, -1], "expected_output_json": "III"},
            {"input_json": [0, 5], "expected_output_json": "Y-Axis"},
        ]
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440005",
        "slug": "electricity-bill",
        "title": "Electricity Bill Calculator",
        "difficulty": "Hard",
        "topics": ["Math", "Conditional Logic", "Real World"],
        "description": """# Electricity Bill Calculator

You are given the number of electricity units consumed by a household. Calculate the total bill amount based on the following tiered pricing structure:

- **First 100 units**: Free (no charge)
- **Next 100 units (101-200)**: $5 per unit
- **Units above 200**: $10 per unit

After calculating the base amount, add a **10% tax** on the total bill.

Return the final bill amount as a **float**.

**Note:** If the total units consumed is 100 or less, the bill is $0.00 (no tax applied on zero amount).""",
        "examples": [
            {
                "input": "units = 50",
                "output": "0.0",
                "explanation": "50 units fall within the free tier (first 100 units). Base amount = $0. Tax = 10% of $0 = $0. Total = $0.0"
            },
            {
                "input": "units = 150",
                "output": "275.0",
                "explanation": "First 100 units = $0 (free). Next 50 units (101-150) = 50 × $5 = $250. Base amount = $250. Tax = 10% of $250 = $25. Total = $275.0"
            },
            {
                "input": "units = 250",
                "output": "1100.0",
                "explanation": "First 100 units = $0 (free). Next 100 units (101-200) = 100 × $5 = $500. Remaining 50 units (201-250) = 50 × $10 = $500. Base amount = $1000. Tax = 10% of $1000 = $100. Total = $1100.0"
            }
        ],
        "constraints": [
            "0 <= units <= 10^6",
            "The return value must be a float",
            "Tax is always 10% of the total base amount",
            "If base amount is 0, return 0.0 (not 0)"
        ],
        "hints": [
            "Start by breaking down the problem into tiers: 0-100, 101-200, and 201+.",
            "Use conditional statements to calculate the cost for each tier separately.",
            "Remember that units in the first tier (0-100) are completely free, so only calculate cost for units ABOVE 100.",
            "For the second tier, the cost is for units between 101 and 200, which is min(units - 100, 100) × $5.",
            "For the third tier, only units above 200 are charged at $10 each: max(0, units - 200) × $10.",
            "Don't forget to apply the 10% tax at the end: total = base_amount × 1.1"
        ],
        "follow_up": "Can you solve this problem in O(1) time complexity without using any loops or recursion?",
        "boilerplate_code": "def calculate_bill(units: int) -> float:\n    # Your code here\n    pass",
        "function_name": "calculate_bill",
        "companies": ["Utility Corp", "Smart Grid Inc", "Energy Solutions"],
        "test_cases": [
            # Visible test cases
            {"input_json": [50], "expected_output_json": 0.0},
            {"input_json": [150], "expected_output_json": 275.0},
            {"input_json": [250], "expected_output_json": 1100.0},
            # Hidden test cases - edge cases
            {"input_json": [0], "expected_output_json": 0.0, "is_hidden": True},
            {"input_json": [100], "expected_output_json": 0.0, "is_hidden": True},
            {"input_json": [101], "expected_output_json": 5.5, "is_hidden": True},
            {"input_json": [200], "expected_output_json": 550.0, "is_hidden": True},
            {"input_json": [201], "expected_output_json": 561.0, "is_hidden": True},
            {"input_json": [500], "expected_output_json": 3850.0, "is_hidden": True},
            {"input_json": [1000], "expected_output_json": 8850.0, "is_hidden": True},
            {"input_json": [1], "expected_output_json": 0.0, "is_hidden": True},
            {"input_json": [99], "expected_output_json": 0.0, "is_hidden": True}
        ]
    }
]

def seed():
    logger.info("Seeding Problems...")
    
    # 1. Clear Tables
    try:
        supabase.table("lcoding_test_cases").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("lcoding_problems").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    except Exception as e:
        logger.warning(f"Could not clear: {e} (Maybe tables don't exist yet)")
        # If we can't clear, we likely can't insert. But let's verify.
        
    for p in PROBLEMS:
        # Insert Problem
        p_data = {k: v for k, v in p.items() if k != "test_cases"}
        
        try:
            supabase.table("lcoding_problems").insert(p_data).execute()
            logger.info(f"Inserted Problem: {p['title']}")
            
            # Insert Test Cases
            tcs = p['test_cases']
            for idx, tc in enumerate(tcs):
                tc_data = {
                    "problem_id": p['id'],
                    "input_json": tc['input_json'],
                    "expected_output_json": tc['expected_output_json'],
                    "is_hidden": tc.get('is_hidden', False),
                    "order_index": idx
                }
                supabase.table("lcoding_test_cases").insert(tc_data).execute()
                
        except Exception as e:
            logger.error(f"Failed to insert {p['title']}: {e}")
            print(f"CRITICAL: Failed to seed. Make sure 'lcoding_problems' table exists! Run SQL manually if needed.")

if __name__ == "__main__":
    seed()
