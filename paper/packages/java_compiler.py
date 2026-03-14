"""Legacy local compiler helper.

Security policy now requires sandboxed worker execution for all untrusted code.
This module intentionally never executes user code locally.
"""

from typing import Dict


def execute_java_code(code: str, timeout: int = 7) -> Dict[str, str]:
    return {
        "output": "",
        "error": (
            "Local Java execution is disabled by security policy. "
            "Use the isolated compiler worker endpoint."
        ),
        "status": "blocked",
    }
