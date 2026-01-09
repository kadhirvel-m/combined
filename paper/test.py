user_prompt = f"""
You will compose comprehensive, exam-ready Markdown notes for the topic "{topic}".

Context:
{context}

Instructions:
- Create DETAILED, THOROUGH notes - students need complete understanding for exams.
- Use the source context as foundation, but ADD your expert knowledge to fill gaps and provide complete coverage.
- Normalize section titles only lightly (e.g., "Applications" vs. "Use Cases" pick one).
- Include the compulsory sections even if they were not present in sources.
- Generate at least one mermaid diagram if suitable (e.g., flow of algorithm, hierarchy, pipeline).
- Build a final '## CITATIONS' mapping labels [GFG], [TPT], [Scaler], [Wiki], [TP] to URLs you used.
- Inline-cite like: "... property ... [GFG]" or "... step ... [Wiki]" after the sentence.
 - Bold important keywords/terms and symbols (e.g., Î¸, Î³, Î±, Îµ-greedy, key definitions) with **...** consistently; avoid over-bolding.

MANDATORY SECTIONS TO INCLUDE (if applicable to the topic):
- **TL;DR / Quick Summary**: Bullet points for quick revision
- **Introduction**: Comprehensive overview with context and importance
- **Need / Why It Is Required**: What problem does it solve? Why was it developed?
- **Definition / Core Concept**: Clear, precise technical definition of the "{topic}"

TARGET LENGTH: 1000-2000 words for comprehensive exam preparation.

Start with '# {topic}' and then the sections in a logical order.
"""
    # Use safe runner to support both CLI and FastAPI contexts
    result = _run_assistant_blocking(assistant, user_prompt)
    content = result.messages[-1].content
    notes_logger.info("generate_notes_markdown:success", extra={"topic": topic, "length": len(content)})
    return content