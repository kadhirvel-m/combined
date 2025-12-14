import os
from google import genai
from google.genai import types

os.environ["GEMINI_API_KEY"] = "AIzaSyBpzH87B28vzi0dOfAZasd4sneg4rpCNfo"

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash", contents="""*Role:* You are a World-Class "Explorable Explanation" Designer and Senior Creative Developer. You blend the storytelling of Vox, the interactivity of Bret Victor, and the aesthetics of Apple.

*The Goal:*
Create a single-file HTML deep-dive into the topic: *Round Robin CPU Scheduling*.

*The User Journey (Strict Structure):*
You must follow this exact narrative flow. Do not deviate.

*1. The "Kitchen Table" Analogy (The Hook):*
* *Concept:* Before showing any jargon, explain the topic using a mundane, everyday metaphor.
* *Requirement:* Use large, editorial typography.
* Example: If the topic is "DNS Resolution," start with an analogy about a "Phonebook" or "Librarian," not IP addresses.
* Visual: Use a large SVG icon or Lucide icon that illustrates this metaphor.

*2. The "Toy Model" (The Interactive Core):*
* *Concept:* This is the heart of the page. You must build a *state-driven interactive simulator*.
* *The Rule:* "Show, Don't Tell." The user must manipulate controls to see the concept in action.
* *Logic Guidelines (Domain Agnostic):*
    * If Physics/Math: Build a Canvas/Three.js simulation where sliders control variables (Gravity, Velocity, Interest Rate) and update the visual immediately.
    * If History/Strategy: Build a "What If?" scenario. (e.g., "Manage the Roman Empire's Grain Supply" - sliders for Tax vs. Army).
    * If Literature/Philosophy: Build a "structure visualizer" (e.g., A Hero's Journey circle where dragging a slider moves the character through stages).
* *Tech Spec:* Use *GSAP* to animate the changes. Do not just snap to new values; tween them smoothly.

*3. The Technical Breakdown (The "Under the Hood"):*
* Now that the user has played with the toy, explain the real technical terms.
* Use a "Bento Grid" (CSS Grid) to show stats, formulas, or timeline dates.

*Technical Stack & Constraints:*
1.  *Single File:* Output raw HTML containing all CSS (Tailwind CDN) and JS.
2.  *Libraries:*
    * Tailwind CSS (Styling).
    * GSAP (Animation/Interactivity).
    * Three.js (ONLY if 3D is required for spatial topics).
    * Lucide Icons (Visuals).
3.  *Aesthetic:* "Cyber-Academic." Dark mode (bg-slate-950). High contrast text. Glassmorphism panels for controls.
4.  *Responsiveness:* The simulation must resize correctly on mobile.
5.  *No Placeholders:* Write the full JavaScript logic. If it's a simulation, write the physics loop. If it's a calculator, write the formula.

*Instruction:* Think deeply about the topic. First, invent the "Kitchen Table Analogy." Second, design the "Toy Model" mechanism. Then, write the code."""
)
print(response.text)
