"""Legacy local compiler helper.

Security policy now requires sandboxed worker execution for all untrusted code.
This module intentionally never executes user code locally.
"""

def execute_python_code(code: str, timeout: int = 5) -> dict:
    """
    Executes Python code in a separate process and returns the output.
    
    Args:
        code (str): The Python code to execute.
        timeout (int): Timeout in seconds.
        
    Returns:
        dict: A dictionary containing 'output', 'error', and 'status'.
    """
    return {
        "output": "",
        "error": (
            "Local Python execution is disabled by security policy. "
            "Use the isolated compiler worker endpoint."
        ),
        "status": "blocked",
    }
