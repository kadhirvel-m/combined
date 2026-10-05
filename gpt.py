import os
import argparse
import logging
import time
import html
import re
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# --- Configurable defaults ---
DEFAULT_MODEL = "gemini-2.5-flash"
MAX_RETRIES = 3
RETRY_BACKOFF = 1.5  # multiplier
DEFAULT_OUTPUT = "explorable_explanation.html"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


def build_prompt(topic: str, material_ui: bool = True, require_threejs: bool = False) -> str:
    """
    Build the instruction prompt sent to the model.
    The prompt strictly requests a single-file HTML (no external assets except CDNs),
    Tailwind CDN, GSAP, Lucide icons, optional Three.js, mobile responsive, dark "Cyber-Academic"
    aesthetic and the exact narrative flow:
      1) Kitchen Table Analogy
      2) Toy Model (interactive)
      3) Technical Breakdown (bento grid)
    """
    safe_topic = html.escape(topic.strip())
    threejs_clause = (
        "Use Three.js ONLY if 3D spatial visualization is necessary for the topic. "
        "If you include Three.js, ensure the scene is lightweight and mobile-friendly."
        if require_threejs
        else "Do NOT include Three.js unless it's strictly required."
    )

    prompt = f"""
Role: You are a World-Class "Explorable Explanation" Designer and Senior Creative Developer.
Goal: Create a single-file HTML deep-dive into the topic: "{safe_topic}".

Important constraints (MUST follow exactly):
1. write me complete code to crate an interactive, stumilator for given topic ,where i can tuyep all and leart them in interactive way, there teach also how its works, compoents used etc

write .html file, use gsap or three.js
1. Single-file HTML only. All CSS and JS must be embedded or loaded via CDN (Tailwind CDN allowed).
2. Use Tailwind CSS via CDN. Emulate a Material UI look & feel (use Material-like spacing, typography, and components)
   while using Tailwind utility classes. Dark mode base: bg-slate-950, high-contrast text, glassmorphism controls.
3. Use GSAP for all animations and transitions. All state changes must tween smoothly.
4. Use Lucide icons for visuals. Include a large editorial SVG or Lucide icon for the Kitchen Table Analogy.
5. The page must be responsive and work well on mobile (touch-friendly controls).

7. If the topic is non-technical, adapt the Toy Model to a "What-If?" scenario manager (interactive story flow).


{threejs_clause}

Dev notes for the output:
- Output only the full HTML file. Do NOT output extra commentary or explanatory text.
- Use Tailwind CDN and GSAP CDN; include lucide icon CDN.
- Ensure JS code includes a minimal state manager, event listeners, and GSAP timelines or tweens.
- Include a short inline CSS block for glassmorphism and typography tweaks.
- Ensure the interactive part works generically for "any topic" by exposing:
    - `variables = {{ "A": 0.5, "B": 1.0, "C": 0.1 }}` mapping to sliders.
    - A `presets` array of named example states.
    - A `render()` function that updates visuals based on variables.
- Include a comment at top of HTML noting the topic and generation metadata.

Remember: the model must produce a real, runnable single-file HTML. Stay strict and complete.
"""
    return prompt.strip()


def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^\w\-_\. ]", "_", name).strip()
    if not name:
        return DEFAULT_OUTPUT
    if not name.lower().endswith(".html"):
        name = f"{name}.html"
    return name


def generate_content(
    topic: str,
    model: str = DEFAULT_MODEL,
    output_path: Optional[str] = None,
    require_threejs: bool = False,
    temperature: float = 0.0,
) -> str:
    """
    Generate the HTML content by calling the GenAI model.
    Retries on transient errors.
    Returns the HTML string on success and writes to output_path if provided.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

    client = genai.Client()  # relies on env var
    prompt = build_prompt(topic, material_ui=True, require_threejs=require_threejs)

    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info("Generating HTML (attempt %d) for topic: %s", attempt, topic)
            # NOTE: using the same style of API call as in the user's snippet.
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                # you can set other model params if supported by the client
                # e.g., temperature, max_output_tokens: (depends on SDK)
            )

            # Some SDKs return combined content; attempt to access text safely:
            html_text = ""
            if hasattr(response, "text") and response.text:
                html_text = response.text
            else:
                # Fallback: try to collect from response generative outputs
                html_text = str(response)

            # Basic sanity check
            if "<html" in html_text.lower() and "</html>" in html_text.lower():
                if output_path:
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(html_text)
                    logging.info("Wrote generated HTML to %s", output_path)
                return html_text

            # If response didn't include full html, but looks like big content, accept it after a warning:
            if len(html_text) > 200 and "<!doctype" in html_text.lower():
                if output_path:
                    with open(output_path, "w", encoding="utf-8") as f:
                        f.write(html_text)
                    logging.info("Wrote generated HTML to %s (doctype detected)", output_path)
                return html_text

            # Not valid - raise and retry
            raise ValueError("Model output did not contain a valid HTML document.")

        except Exception as exc:
            last_err = exc
            logging.warning("Attempt %d failed: %s", attempt, exc)
            sleep_time = (RETRY_BACKOFF ** attempt)
            logging.info("Retrying after %.1f seconds...", sleep_time)
            time.sleep(sleep_time)

    # Exhausted retries
    raise RuntimeError(f"Failed to generate valid HTML after {MAX_RETRIES} attempts. Last error: {last_err}")


def main():
    parser = argparse.ArgumentParser(description="Generate a single-file explorable HTML for any topic.")
    parser.add_argument("--topic", "-t", default=None, help="Topic to generate the explorable explanation for.")
    parser.add_argument("--output", "-o", default=None, help="Output HTML filename.")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model to use (default: {DEFAULT_MODEL}).")
    parser.add_argument("--threejs", action="store_true", help="Allow Three.js in the generated page (only if needed).")
    parser.add_argument("--temperature", type=float, default=0.0, help="Model temperature (0.0 for deterministic).")

    args = parser.parse_args()
    topic = args.topic
    # Prompt the user once at runtime when no topic was supplied via CLI.
    if not topic:
        topic = input("Enter the topic for the explorable explanation: ").strip()
        while not topic:
            print("A topic is required to generate the explorable explanation.")
            topic = input("Enter the topic for the explorable explanation: ").strip()

    out_file = sanitize_filename(args.output or topic)

    try:
        html_content = generate_content(
            topic=topic,
            model=args.model,
            output_path=out_file,
            require_threejs=args.threejs,
            temperature=args.temperature,
        )
        logging.info("Generation completed successfully. Output file: %s", out_file)
    except Exception as e:
        logging.error("Generation failed: %s", e)
        raise


if __name__ == "__main__":
    main()
