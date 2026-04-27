# WhatsApp REST API

FastAPI-based REST API for sending WhatsApp messages via Baileys.

## Quick Start

### 1. Install Python dependencies

```bash
pip install -r api/requirements.txt
```

### 2. Start the Baileys backend (terminal 1)

```bash
npm run example
```

Scan the QR code to authenticate. The Express server runs on **port 3000**.

### 3. Start the FastAPI server (terminal 2)

```bash
uvicorn api.whatsapp_api:app --reload --port 8000
```

### 4. Open the API docs

Visit **http://localhost:8000/docs** for the interactive Swagger UI.

---

## Endpoints

| Method | Endpoint | Body Type | Description |
|--------|----------|-----------|-------------|
| `GET` | `/` | — | Health check |
| `GET` | `/status` | — | WhatsApp connection status |
| `POST` | `/send/text` | JSON | Send text message |
| `POST` | `/send/image` | Form/File | Send image + caption |
| `POST` | `/send/video` | Form/File | Send video + caption |
| `POST` | `/send/audio` | Form/File | Send audio / voice note |
| `POST` | `/send/document` | Form/File | Send document (PDF, etc.) |
| `POST` | `/send/sticker` | Form/File | Send sticker (WebP) |
| `POST` | `/send/poll` | JSON | Send a poll |
| `POST` | `/send/list` | JSON | Send interactive list |
| `POST` | `/send/location` | JSON | Send GPS location |
| `POST` | `/send/contact` | JSON | Send contact card |
| `POST` | `/send/reaction` | JSON | React to a message |
| `POST` | `/send/button-reply` | JSON | Send button reply |

---

## Example Usage (curl)

### Send Text

```bash
curl -X POST http://localhost:8000/send/text \
  -H "Content-Type: application/json" \
  -d '{"jid": "919876543210@s.whatsapp.net", "text": "Hello from FastAPI!"}'
```

### Send Image

```bash
curl -X POST http://localhost:8000/send/image \
  -F "jid=919876543210@s.whatsapp.net" \
  -F "caption=Check this out" \
  -F "image=@/path/to/photo.jpg"
```

### Send Location

```bash
curl -X POST http://localhost:8000/send/location \
  -H "Content-Type: application/json" \
  -d '{"jid": "919876543210@s.whatsapp.net", "latitude": 13.0827, "longitude": 80.2707, "name": "Chennai"}'
```

### Send Poll

```bash
curl -X POST http://localhost:8000/send/poll \
  -H "Content-Type: application/json" \
  -d '{"jid": "919876543210@s.whatsapp.net", "name": "Lunch?", "options": ["Pizza", "Burger", "Salad"]}'
```

---

## FastAPI from Python (httpx / requests)

```python
import httpx

# Send text
httpx.post("http://localhost:8000/send/text", json={
    "jid": "919876543210@s.whatsapp.net",
    "text": "Hello from Python!"
})

# Send image
with open("photo.jpg", "rb") as f:
    httpx.post("http://localhost:8000/send/image", data={
        "jid": "919876543210@s.whatsapp.net",
        "caption": "Nice pic"
    }, files={"image": f})
```
