
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
import logging
from functools import lru_cache
import os
from dotenv import load_dotenv
from typing import Optional

# Setup similar logging/client retrieval as main.py or just re-implement simple one
# For a package, it's better to accept the client or get it from env.

router = APIRouter(prefix="/api/tunex", tags=["tunex"])

# Load env for standalone usage if needed, but typically main.py handles it.
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for reading if we want full access, or Anon.

def get_supabase() -> Client:
    from supabase import create_client
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Database configuration missing")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.get("/topics/{topic_id}/full")
async def get_topic_full(topic_id: str):
    """
    Get topic metadata and all chapters with full content.
    """
    supabase = get_supabase()
    
    # Mock Data Injection for Demo
    if topic_id == "1668cfdf-e56c-4c78-9107-e739bcbd6766":
        return {
            "id": topic_id,
            "title": "What is Python & Why Companies Use It",
            "description": "Discover the origins, philosophy, and massive industry adoption that makes Python the #1 language in the world.",
            "chapters": [
                {
                    "id": "c1",
                    "chapter_number": 1,
                    "title": "The Genesis of Python",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "text",
                                "title": "A Hobby Project That Conquered the World",
                                "content": "Python was conceived in the late 1980s by **Guido van Rossum** at CWI in the Netherlands as a successor to the ABC programming language. Its implementation began in December 1989. Guido wanted a language that was distinct for its readability and simplicity."
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "Why 'Python'?",
                                "text": "It wasn't named after the snake! Guido was a big fan of 'Monty Python's Flying Circus'. He wanted a name that was short, unique, and slightly mysterious."
                            },
                            {
                                "type": "split",
                                "left": {
                                    "title": "The Philosophy: Zen of Python",
                                    "content": "Python follows a core philosophy called 'The Zen of Python' (PEP 20). Key principles include:\n\n1. **Beautiful is better than ugly.**\n2. **Explicit is better than implicit.**\n3. **Simple is better than complex.**\n4. **Readability counts.**\n\nThis focus on readability is why Python code often looks like executable pseudocode."
                                },
                                "right": {
                                    "type": "code_static",
                                    "content": "import this\n\n# Try running this in your terminal!\n# It prints the 19 guiding principles of Python."
                                }
                            }
                        ]
                    }
                },
                {
                    "id": "c2",
                    "chapter_number": 2,
                    "title": "The Interview Superpower",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "text",
                                "title": "Why Use Python in Coding Interviews?",
                                "content": "In a 45-minute technical interview, **speed is everything**. You are judged on your problem-solving logic, not your ability to write boilerplate code. Python is the gold standard for interviews because it lets you write logic straight away."
                            },
                            {
                                "type": "split",
                                "left": {
                                    "title": "Less Typing, More Thinking",
                                    "content": "Compare reading a file in Java versus Python. In Python, it's a one-liner. In Java, you need imports, class definitions, try-catch blocks, and buffered readers. \n\n**Advantage:** You spend less time fighting syntax and more time solving the algorithm."
                                },
                                "right": {
                                    "type": "code_static",
                                    "content": "# Java\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello\");\n  }\n}\n\n# Python\nprint(\"Hello\")"
                                }
                            },
                            {
                                "type": "callout",
                                "variant": "success",
                                "title": "Built-in Superpowers",
                                "text": "Python's standard library ('Batteries Included') is insanely powerful. Need a heap? `heapq`. Need a hash map? `dict`. Need permutations? `itertools`. You don't have to implement these from scratch."
                            }
                        ]
                    }
                },
                {
                    "id": "c3",
                    "chapter_number": 3,
                    "title": "Key Features & Advantages",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "carousel",
                                "items": [
                                    {
                                        "title": "Interpreted & Dynamic",
                                        "desc": "No compilation step. Variables don't need explicit type declarations. Rapid prototyping is effortless.",
                                        "code_id": "feat_dyn",
                                        "default_code": "x = 10      # It's an integer\nprint(type(x))\n\nx = \"Hello\" # Now it's a string\nprint(type(x))"
                                    },
                                    {
                                        "title": "Memory Management",
                                        "desc": "Python uses automatic garbage collection. You don't need to manually allocate and free memory like in C/C++.",
                                        "code_id": "feat_mem",
                                        "default_code": "import sys\n\na = []\nb = a\n# Python tracks references automatically\nprint(sys.getrefcount(a))"
                                    },
                                    {
                                        "title": "Huge Ecosystem",
                                        "desc": "PyPI (Python Package Index) has over 400,000 packages. If you want to do it, there's a library for it.",
                                        "code_id": "feat_lib",
                                        "default_code": "# No installation here, but imagine:\n# import pandas as pd\n# import numpy as np\n# import torch\nprint(\"Libraries for everything!\")"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "id": "c4",
                    "chapter_number": 4,
                    "title": "Careers & Salaries",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "text",
                                "title": "Where Can Python Take You?",
                                "content": "Python is a general-purpose language, meaning it's used everywhere. Here are the top domains and average US salaries (2024 data)."
                            },
                            {
                                "type": "cards",
                                "title": "High-Paying Fields",
                                "items": [
                                    {
                                        "title": "Data Scientist",
                                        "value": "$120k - $180k+",
                                        "icon": "ri-brain-line",
                                        "tags": ["TensorFlow", "PyTorch", "Pandas"]
                                    },
                                    {
                                        "title": "Backend Engineer",
                                        "value": "$115k - $160k",
                                        "icon": "ri-server-line",
                                        "tags": ["Django", "FastAPI", "Flask"]
                                    },
                                    {
                                        "title": "DevOps / SRE",
                                        "value": "$130k+",
                                        "icon": "ri-cloud-windy-line",
                                        "tags": ["Ansible", "Docker", "Scripting"]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "id": "c5",
                    "chapter_number": 5,
                    "title": "Who Uses Python?",
                    "chapter_type": "interview",
                    "content": {
                        "layout": "company_grid",
                        "questions": [
                            {
                                "company": "Google",
                                "icon": "ri-google-fill",
                                "color": "#4285F4",
                                "tag_short": "Search & AI",
                                "use_case": "Python is used for system building, code review tools, and extensive AI/ML research.",
                                "problem_id": "p_google"
                            },
                            {
                                "company": "Netflix",
                                "icon": "ri-netflix-fill",
                                "color": "#E50914",
                                "tag_short": "Streaming",
                                "use_case": "Uses Python for its recommendation engine and content distribution network.",
                                "problem_id": "p_netflix"
                            },
                            {
                                "company": "Instagram",
                                "icon": "ri-instagram-line",
                                "color": "#E1306C",
                                "tag_short": "Social",
                                "use_case": "Runs the world's largest deployment of the Django web framework.",
                                "problem_id": "p_insta"
                            },
                            {
                                "company": "NASA",
                                "icon": "ri-rocket-line",
                                "color": "#0B3D91",
                                "tag_short": "Science",
                                "use_case": "Analyzes observational data from the James Webb Space Telescope.",
                                "problem_id": "p_nasa"
                            },
                            {
                                "company": "Spotify",
                                "icon": "ri-spotify-fill",
                                "color": "#1DB954",
                                "tag_short": "Music",
                                "use_case": "Used for backend services and data analysis to personalize music.",
                                "problem_id": "p_spotify"
                            }
                        ]
                    }
                },
                {
                    "id": "c6",
                    "chapter_number": 6,
                    "title": "Mastery Check",
                    "chapter_type": "quiz",
                    "content": {
                        "questions": [
                            {
                                "q": "Who created Python?",
                                "opts": ["Elon Musk", "Guido van Rossum", "Dennis Ritchie"],
                                "correct": 1,
                                "why": "Guido started Python as a hobby project in 1989."
                            },
                            {
                                "q": "Why is Python preferred in interviews?",
                                "opts": ["It runs faster", "It has less boilerplate & high readability", "It is statically typed"],
                                "correct": 1,
                                "why": "Less syntax means you can focus on the algorithm, not the code."
                            },
                            {
                                "q": "Which of these is NOT a Python web framework?",
                                "opts": ["Django", "React", "FastAPI"],
                                "correct": 1,
                                "why": "React is a JavaScript library. Django and FastAPI are Python frameworks."
                            }
                        ]
                    }
                }
            ]
        }

    # 1. Get Topic Metadata
    topic_res = supabase.table("lcoding_topics").select("id, title, order_index").eq("id", topic_id).execute()
    if not topic_res.data:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    topic = topic_res.data[0]
    
    # 2. Get Chapters (Sorted)
    chapters_res = supabase.table("lcoding_topic_chapters")\
        .select("id, chapter_number, chapter_type, title, content")\
        .eq("topic_id", topic_id)\
        .order("chapter_number")\
        .execute()
        
    return {
        "id": topic["id"],
        "title": topic["title"],
        "description": topic.get("description", ""),
        "chapters": chapters_res.data
    }
