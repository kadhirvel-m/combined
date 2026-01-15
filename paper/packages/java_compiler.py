import os
import re
import shutil
import subprocess
import tempfile
from typing import Dict, Optional


_CLASS_NAME_RE = re.compile(r"\bpublic\s+class\s+([A-Za-z_][A-Za-z0-9_]*)\b")
_FALLBACK_CLASS_RE = re.compile(r"\bclass\s+([A-Za-z_][A-Za-z0-9_]*)\b")


def _detect_main_class_name(code: str) -> str:
    """Best-effort extraction of Java public class name.

    If a public class exists, Java requires the filename to match it.
    """
    m = _CLASS_NAME_RE.search(code or "")
    if m:
        return m.group(1)

    m2 = _FALLBACK_CLASS_RE.search(code or "")
    if m2:
        return m2.group(1)

    return "Main"


def execute_java_code(code: str, timeout: int = 7) -> Dict[str, str]:
    """Compiles and runs Java code.

    Returns a dict compatible with the existing Python compiler UI:
    - output: runtime stdout
    - error: compile/runtime stderr
    - status: success | error | timeout

    Notes:
    - Requires JDK (javac/java) installed and available on PATH.
    - Uses a temp directory and deletes it afterward.
    """

    javac_path = shutil.which("javac")
    java_path = shutil.which("java")
    if not javac_path or not java_path:
        return {
            "output": "",
            "error": "Java compiler not found. Please install a JDK and ensure 'javac' and 'java' are on PATH.",
            "status": "error",
        }

    code = code or ""
    class_name = _detect_main_class_name(code)

    # If the user didn't provide a full class, wrap the snippet into a Main class.
    # Heuristic: no 'class' keyword => treat as statements for main().
    if "class" not in code:
        code = (
            "public class Main {\n"
            "    public static void main(String[] args) throws Exception {\n"
            + "\n".join("        " + line for line in code.splitlines())
            + "\n    }\n"
            "}\n"
        )
        class_name = "Main"

    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp(prefix="tunex-java-")
        java_file = os.path.join(temp_dir, f"{class_name}.java")

        with open(java_file, "w", encoding="utf-8") as f:
            f.write(code)

        try:
            compile_res = subprocess.run(
                [javac_path, "-encoding", "UTF-8", java_file],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            return {"output": "", "error": f"Compilation timed out after {timeout} seconds.", "status": "timeout"}

        if compile_res.returncode != 0:
            err = (compile_res.stderr or "") + ("\n" + compile_res.stdout if compile_res.stdout else "")
            return {"output": "", "error": err.strip() or "Compilation failed.", "status": "error"}

        try:
            run_res = subprocess.run(
                [java_path, "-Dfile.encoding=UTF-8", "-cp", temp_dir, class_name],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            return {"output": "", "error": f"Execution timed out after {timeout} seconds.", "status": "timeout"}

        return {
            "output": run_res.stdout or "",
            "error": run_res.stderr or "",
            "status": "success" if run_res.returncode == 0 else "error",
        }
    except Exception as e:
        return {"output": "", "error": f"Execution failed: {e}", "status": "error"}
    finally:
        if temp_dir and os.path.isdir(temp_dir):
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass
