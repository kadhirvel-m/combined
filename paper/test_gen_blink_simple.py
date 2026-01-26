
import requests
import json

API_URL = "http://localhost:8000/api/blink/generate"
# Assuming we can run this without auth or with a fake token if user_id defaults to placeholder
payload = {
    "topic": "Test Topic",
    "note_content": "This is a test note content for generating a blink illustration."
}

try:
    print(f"Testing {API_URL}...")
    # Just checking if endpoint exists and accepts request (might fail on key but should return 500 or 4xx, not 404)
    # Actually we want to see if it's reachable.
    response = requests.post(API_URL, json=payload, timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
