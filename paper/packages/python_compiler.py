import sys
import subprocess
import tempfile
import os

# SECURITY WARNING: This function executes arbitrary Python code supplied by the
# caller.  It relies solely on OS-level process isolation and a short timeout.
# An authenticated user could still:
#   - Read files accessible to the server process.
#   - Make outbound network requests.
#   - Consume CPU/memory up to the OS limits of the subprocess.
#
# Recommended hardening (in order of effectiveness):
#   1. Run the subprocess inside an isolated Docker container or gVisor sandbox.
#   2. Drop privileges (setuid/setgid) and apply seccomp/AppArmor/SELinux rules.
#   3. Use RestrictedPython or a purpose-built sandbox (e.g. Judge0) instead of
#      a bare subprocess.
#   4. Apply per-user rate limits and output-size caps before returning results.

def execute_python_code(code: str, timeout: int = 5) -> dict:
    """
    Executes Python code in a separate process and returns the output.

    .. warning::
        This runs *unsandboxed* user-supplied code.  Only expose this function
        to authenticated users, keep the timeout low, and consider adding OS-
        level sandboxing (see module-level comment above).

    Args:
        code (str): The Python code to execute.
        timeout (int): Timeout in seconds.

    Returns:
        dict: A dictionary containing 'output', 'error', and 'status'.
    """
    # Create a temporary file to store the code
    temp_file_path = None
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
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
