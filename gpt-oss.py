"""
Generate a single-file "Explorable Explanation" HTML for any topic.
Usage: run this script, enter the title/topic when prompted. The script:
  1) asks the model to produce a short plan (Kitchen Table Analogy + Toy Model design + Tech breakdown)
  2) sends that plan back (preserving reasoning_details) and asks the model to emit the full single-file HTML
  3) saves the HTML to disk and prints the filename

This follows the two-call pattern you showed (preserve reasoning_details between calls).
Adapt the OpenAI client args (base_url, api_key) to your environment.
"""

from openai import OpenAI
import os
import re
import sys
import json
from pathlib import Path

# Configure client (edit or export OPENROUTER_API_KEY environment variable)
client = OpenAI(
    base_url=os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
    api_key=os.environ.get("OPENROUTER_API_KEY", "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")
)

def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9\- ]+", "", s)
    s = re.sub(r"\s+", "-", s).strip("-")
    return s or "explorable"

def plan_for_topic(topic: str):
    """
    First API call: ask for a concise plan (Kitchen Table Analogy, Toy Model design, Tech breakdown skeleton).
    We enable reasoning like your example.
    """
    system_prompt = (
        "You are a World-Class 'Explorable Explanation' Designer and Senior Creative Developer. "
        "You blend the storytelling of Vox, the interactivity of Bret Victor, and the aesthetics of Apple. "
        "You must follow a strict narrative flow and technical constraints described to users. "
        "Be concise and focused."
    )

    user_prompt = (
        f"I will give you a topic/title. Produce a short plan (max 350 words) containing three sections:\n\n"
        "1) Kitchen Table Analogy: a single, clear everyday metaphor for the topic (1-2 short paragraphs).\n\n"
        "2) Toy Model (Interactive Core) design: Describe the interactive simulator the final HTML should include. "
        "Specify controls, their ranges/units, the visual/animation approach, and any formulas or physics loops required. "
        "State whether Three.js is needed (YES/NO). Mention GSAP usage explicitly and how animations should tween.\n\n"
        "3) Technical Breakdown (Under the Hood): A short 'Bento Grid' outline of the exact stats/formulas/code pieces that "
        "must appear in the final HTML (list 4-6 grid items like 'Formula: ...', 'Control: slider X range', 'Responsiveness notes').\n\n"
        f"Do NOT produce the final HTML yet — only the plan. Topic: \"{topic}\""
    )

    resp = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        extra_body={"reasoning": {"enabled": True}}
    )

    choice = resp.choices[0].message
    return choice  # this is a message object with .content and possibly .reasoning_details

def html_from_plan(topic: str, plan_message):
    """
    Second API call: pass back the plan message (with reasoning_details preserved) and instruct the model
    to write the complete single-file HTML according to the strict requirements.
    """
    system_prompt = (
        "You are a World-Class 'Explorable Explanation' Designer and Senior Creative Developer. "
        "Now produce the FULL SINGLE-FILE HTML for the given topic using the plan supplied. "
        "Follow these constraints EXACTLY:\n\n"
        "1) Single-file HTML only. Include Tailwind CDN for styling, GSAP for animations, Lucide icons. "
        "Include Three.js only if the plan required it. All CSS must be in the file (Tailwind CDN ok).\n\n"
        "2) Page structure MUST follow exactly: (A) Kitchen Table Analogy hook with large editorial typography and an SVG/Lucide icon; "
        "(B) Toy Model interactive core — a state-driven simulator with controls (sliders/toggles) in glassmorphism panels. "
        "Use GSAP to tween all state changes. Write full JS for the simulation (physics loop or logic as required). "
        "(C) Technical Breakdown: a responsive CSS Grid 'Bento Grid' with the stats/formulas/timeline.\n\n"
        "3) Aesthetic: dark mode (bg-slate-950), glassmorphism control panels, high-contrast text, mobile responsive, and use Tailwind utility classes. "
        "Components should be accessible (labels for inputs) and resize for mobile. No external placeholders.\n\n"
        "4) Do NOT include any commentary or explanation outside the HTML file. The assistant's entire response must be only the HTML content.\n\n"
        "5) Ensure the JS is complete and functional: import GSAP via CDN and use it for animations; if physics are required, write the physics loop. "
        "If the plan recommended Three.js, include it and a simple 3D scene; otherwise, keep canvas 2D or DOM-based visuals.\n\n"
        "6) Name the page title and a top H1 using the provided topic.\n\n"
        "Now use the plan provided in the assistant message to write the exact single-file HTML. Topic: " + topic
    )

    # Recreate the messages array as per your example, preserving reasoning_details if present
    assistant_msg = {
        "role": "assistant",
        "content": plan_message.content
    }
    if hasattr(plan_message, "reasoning_details") and plan_message.reasoning_details is not None:
        assistant_msg["reasoning_details"] = plan_message.reasoning_details

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Topic: \"{topic}\" — use the plan below to generate the HTML."},
        assistant_msg,
        {"role": "user", "content": "Now generate the full single-file HTML exactly as required. Output only the HTML file content."}
    ]

    resp2 = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        extra_body={"reasoning": {"enabled": True}}
    )

    # The model should return the HTML as the assistant message content
    html_message = resp2.choices[0].message
    return html_message

def save_html(content: str, filename: str) -> Path:
    out = Path(filename)
    out.write_text(content, encoding="utf-8")
    return out

def main():
    topic = input("Enter the topic/title for the explorable page: ").strip()
    if not topic:
        print("Topic required. Exiting.")
        sys.exit(1)

    print("[1/3] Requesting plan from model...")
    plan_msg = plan_for_topic(topic)

    # Optional: print plan summary (uncomment to see)
    # print("PLAN:\n", plan_msg.content)

    print("[2/3] Asking model to generate final HTML (preserving reasoning)...")
    html_msg = html_from_plan(topic, plan_msg)

    html_content = html_msg.content

    # Some models wrap HTML in markdown fences; strip them if present
    if html_content.startswith("```html"):
        html_content = re.sub(r"^```html\s*", "", html_content, flags=re.IGNORECASE)
        html_content = re.sub(r"\s*```$", "", html_content, flags=re.IGNORECASE)

    filename = slugify(topic) + ".html"
    outpath = save_html(html_content, filename)

    print(f"[3/3] Saved HTML to: {outpath.resolve()}")
    print("Open this file in your browser to view the explorable page.")

if __name__ == "__main__":
    main()
