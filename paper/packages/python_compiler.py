import sys
import subprocess
import tempfile
import os

def execute_python_code(code: str, timeout: int = 5) -> dict:
    """
    Executes Python code in a separate process and returns the output.
    
    Args:
        code (str): The Python code to execute.
        timeout (int): Timeout in seconds.
        
    Returns:
        dict: A dictionary containing 'output', 'error', and 'status'.
    """
    # Create a temporary file to store the code
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name
    except Exception as e:
        return {"output": "", "error": f"System Error: Failed to create temporary file: {str(e)}", "status": "error"}

    try:
        # Execute the code
        result = subprocess.run(
            [sys.executable, temp_file_path],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        return {
            "output": result.stdout,
            "error": result.stderr,
            "status": "success" if result.returncode == 0 else "error"
        }
    except subprocess.TimeoutExpired:
        return {
            "output": "",
            "error": f"Execution timed out after {timeout} seconds.",
            "status": "timeout"
        }
    except Exception as e:
        return {
            "output": "",
            "error": f"Execution failed: {str(e)}",
            "status": "error"
        }
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass
