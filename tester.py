import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.environ.get("OPENROUTER_API_KEY"),
)

MODEL = "openai/gpt-oss-120b"

def ask_once(messages):
    resp = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        extra_body={"reasoning": {"enabled": True}}
    )
    return resp.choices[0].message.content.strip()

messages = [
    {"role": "user", "content": "Teach me Deterministic Finite Automata in very detail with an example"},
    {"role": "user", "content": "Are you sure? Think carefully."}
]

print(ask_once(messages))