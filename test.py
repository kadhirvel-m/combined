import requests
from dotenv import load_dotenv
import json

load_dotenv()

API_KEY = "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"

def chatbot(message):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "openai/gpt-oss-20b:free",
        "messages": [{"role": "user", "content": message}],
        "stream": True
    }

    with requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        data=json.dumps(payload),
        stream=True
    ) as response:
        for line in response.iter_lines():
            if line:
                decoded = line.decode("utf-8")
                if decoded.startswith("data: "):
                    data = decoded[len("data: "):]
                    if data.strip() == "[DONE]":
                        break
                    try:
                        content = json.loads(data)["choices"][0]["delta"].get("content", "")
                        print(content, end="", flush=True)
                    except:
                        pass
        print()  # newline after completion

print("🤖 Streaming Chatbot (type 'exit' to quit)\n")

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("Chatbot: Goodbye!")
        break

    print("Chatbot:", end=" ", flush=True)
    chatbot(user_input)
    print()
