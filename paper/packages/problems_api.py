
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Any, Optional
import json
import logging
from .python_compiler import execute_python_code
from .tunex_router import get_supabase

router = APIRouter(prefix="/api/tunex", tags=["problems"])
logger = logging.getLogger("problems_api")

class Example(BaseModel):
    input: str           # Display string like "nums = [2,7,11,15], target = 9"
    output: str          # Display string like "[0,1]"
    explanation: Optional[str] = None

class Problem(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    boilerplate_code: str
    function_name: str
    companies: List[str] = []
    likes: int = 0
    # Enhanced LeetCode-style fields
    examples: List[dict] = []        # Array of {input, output, explanation}
    constraints: List[str] = []      # Array of constraint strings
    hints: List[str] = []            # Array of progressive hints
    follow_up: Optional[str] = None  # Optional optimization question
    topics: List[str] = []           # Related topics like "Array", "Math"

class TestCaseResult(BaseModel):
    passed: bool
    input: Any
    expected: Any
    output: Any
    error: Optional[str] = None
    is_hidden: bool = False

class RunResponse(BaseModel):
    status: str
    total_tests: int
    passed_tests: int
    results: List[TestCaseResult]
    compile_error: Optional[str] = None

@router.get("/problems/{id}")
async def get_problem(id: str):
    supabase = get_supabase()

    # MOCK DATA FOR DEMO
    mocks = {
        "p_google": {
            "id": "p_google", "title": "Google Search Algorithm", "difficulty": "Hard",
            "companies": ["Google", "DeepMind"], "function_name": "search",
            "description": "Implement a simplified search ranking algorithm. Given a list of documents and a query, rank them by relevance score.",
            "boilerplate_code": "def search(docs, query):\n    # Your code here\n    pass"
        },
        "p_netflix": {
            "id": "p_netflix", "title": "Movie Recommendation", "difficulty": "Medium",
            "companies": ["Netflix", "Hulu"], "function_name": "recommend",
            "description": "Given a user's watch history and a list of movies, recommend the next top 3 movies based on genre similarity.",
            "boilerplate_code": "def recommend(history, movies):\n    # Your code here\n    pass"
        },
        "p_insta": {
            "id": "p_insta", "title": "Instagram Feed", "difficulty": "Medium",
            "companies": ["Meta", "Instagram"], "function_name": "feed_gen",
            "description": "Design an algorithm to generate a user's feed sorted by timestamp and engagement score.",
            "boilerplate_code": "def feed_gen(posts):\n    # Your code here\n    pass"
        },
        "p_nasa": {
            "id": "p_nasa", "title": "Asteroid Tracking", "difficulty": "Hard",
            "companies": ["NASA", "SpaceX"], "function_name": "track",
            "description": "Analyze a stream of coordinate data to predict an asteroid's trajectory.",
            "boilerplate_code": "def track(data):\n    # Your code here\n    pass"
        },
        "p_spotify": {
            "id": "p_spotify", "title": "Playlist Shuffle", "difficulty": "Easy",
            "companies": ["Spotify", "Apple Music"], "function_name": "shuffle",
            "description": "Implement a shuffle algorithm that ensures no two similar songs are played back-to-back.",
            "boilerplate_code": "def shuffle(playlist):\n    # Your code here\n    pass"
        }
    }
    
    if id in mocks:
        return mocks[id]

    res = supabase.table("lcoding_problems").select("*").eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    problem = res.data[0]
    return problem

@router.post("/problems/{id}/run")
async def run_problem(id: str, code: dict = Body(...)):
    user_code = code.get("code", "")
    supabase = get_supabase()
    
    # 1. Fetch Problem & Test Cases
    p_res = supabase.table("lcoding_problems").select("function_name").eq("id", id).execute()
    if not p_res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    func_name = p_res.data[0]['function_name']
    
    tc_res = supabase.table("lcoding_test_cases").select("*").eq("problem_id", id).order("order_index").execute()
    test_cases = tc_res.data
    
    if not test_cases:
        return {"status": "error", "error": "No test cases found for this problem."}

    # 2. Build Test Harness
    # We serialize test cases safely into the script
    inputs = [tc['input_json'] for tc in test_cases]
    expecteds = [tc['expected_output_json'] for tc in test_cases]
    
    harness = f"""
import json
import sys

# User Code
{user_code}

# Test Harness
def run_tests():
    inputs = {json.dumps(inputs)}
    expecteds = {json.dumps(expecteds)}
    results = []
    
    passed_count = 0
    
    for i in range(len(inputs)):
        args = inputs[i]
        expected = expecteds[i]
        
        try:
            # Check if user defined the function
            if '{func_name}' not in globals():
                results.append({{"passed": False, "error": "Function '{func_name}' not defined"}})
                continue
                
            # Call function
            # If args is a list, unpack it. If it's a single value acting as list wrapper, handle it.
            # We assume input_json is ALWAYS a list of arguments e.g. [1, 2] for add(1, 2)
            if isinstance(args, list):
                output = {func_name}(*args)
            else:
                output = {func_name}(args)
            
            # Compare output (basic equality)
            passed = (output == expected)
            if passed:
                passed_count += 1
                
            results.append({{
                "passed": passed,
                "output": output,
                "expected": expected,
                "input": args
            }})
            
        except Exception as e:
            results.append({{"passed": False, "error": str(e)}})
            
    print(json.dumps(results))

if __name__ == "__main__":
    run_tests()
"""

    # 3. Execute
    exec_res = execute_python_code(harness, timeout=5)
    
    if exec_res['status'] != 'success':
        return {
            "status": "compile_error",
            "compile_error": exec_res['error'] or exec_res['output'], # Output might contain traceback
            "total_tests": len(test_cases),
            "passed_tests": 0,
            "results": []
        }
        
    # 4. Parse Results
    try:
        raw_results = json.loads(exec_res['output'])
    except json.JSONDecodeError:
         return {
            "status": "runtime_error",
            "compile_error": "Failed to parse test output: " + exec_res['output'],
            "total_tests": len(test_cases),
            "passed_tests": 0,
            "results": []
        }

    # 5. Format & Hide Private Tests
    final_results = []
    passed_count = 0
    for idx, res in enumerate(raw_results):
        tc = test_cases[idx]
        is_hidden = tc.get('is_hidden', False)
        
        result_entry = {
            "passed": res['passed'],
            "is_hidden": is_hidden,
            "error": res.get('error')
        }
        
        if res['passed']:
            passed_count += 1
            
        if not is_hidden:
            result_entry['input'] = tc['input_json']
            result_entry['expected'] = tc['expected_output_json']
            result_entry['output'] = res.get('output')
        else:
            # Mask details for hidden tests
            result_entry['input'] = "[Hidden]"
            result_entry['expected'] = "[Hidden]"
            result_entry['output'] = "[Hidden]"
            if res.get('error'):
                # We might want to show error type but not local vars
                result_entry['error'] = "Runtime Error in hidden test"
                
        final_results.append(result_entry)
        
    return {
        "status": "success",
        "total_tests": len(test_cases),
        "passed_tests": passed_count,
        "results": final_results
    }
