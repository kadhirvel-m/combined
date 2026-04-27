# WhatsApp REST API Server (Powered by Baileys)

A robust, feature-rich REST API wrapper built on top of the [Baileys](https://github.com/WhiskeySockets/Baileys) WhatsApp Web library. This service allows you to interact programmatically with WhatsApp by sending various types of messages (text, media, interactive) through standard HTTP requests.

## 🚀 Features

- **Session Management:** Persistent Multi-Device authentication stored locally (`baileys_auth_info`).
- **Media Support:** Send images, videos, audio (including voice notes), documents, and stickers.
- **Interactive Messages:** Send polls, lists, and button messages.
- **Location & Contacts:** Share geo-locations and vCard contacts.
- **Message Reactions:** React to specific messages with emojis.
- **Web UI:** A built-in web interface for easy testing and interaction.
- **DNS Bypass:** Custom DNS resolution to Meta's IPs to bypass network-level WhatsApp blocks (e.g., `ECONNRESET`).

## 📋 Prerequisites

- **Node.js** `>= 20.0.0`
- **Yarn** or **npm**

## 🛠 Installation & Setup

1. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run example
   # or
   npx tsx ./Example/example.ts
   ```

3. **Authentication:**
   - Upon first startup, the server will generate a QR code.
   - A `qr.html` file will be created and automatically opened in your default browser.
   - Scan the QR code using the "Linked Devices" feature in your WhatsApp mobile app.
   - Once authenticated, credentials are saved securely in the `baileys_auth_info/` directory.

## 📡 API Endpoints

The server runs on `http://localhost:3000` by default. 

**Note on `jid`:** The `jid` (Jabber ID) represents the recipient. For standard phone numbers, format it as `CountryCode+PhoneNumber@s.whatsapp.net` (e.g., `1234567890@s.whatsapp.net`).

---

### 1. Check Connection Status
**Endpoint:** `GET /api/status`  
Checks if the underlying Baileys socket is connected.

**Response:**
```json
{
  "connected": true,
  "timestamp": "2026-04-27T10:00:00.000Z"
}
```

---

### 2. Send Text Message
**Endpoint:** `POST /api/send-message`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "Hello from the API!"
}
```

---

### 3. Send Image
**Endpoint:** `POST /api/send-image`  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `jid`: `1234567890@s.whatsapp.net`
- `caption`: (Optional) "Here is an image"
- `image`: [File]

---

### 4. Send Video
**Endpoint:** `POST /api/send-video`  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `jid`: `1234567890@s.whatsapp.net`
- `caption`: (Optional) "Check out this video"
- `video`: [File]

---

### 5. Send Audio / Voice Note
**Endpoint:** `POST /api/send-audio`  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `jid`: `1234567890@s.whatsapp.net`
- `ptt`: `true` (Set to "true" to send as a Voice Note, otherwise standard audio)
- `audio`: [File]

---

### 6. Send Document
**Endpoint:** `POST /api/send-document`  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `jid`: `1234567890@s.whatsapp.net`
- `caption`: (Optional) "Document description"
- `fileName`: (Optional) "report.pdf" (Defaults to uploaded file name)
- `mimetype`: (Optional) "application/pdf" (Defaults to application/octet-stream)
- `document`: [File]

---

### 7. Send Sticker
**Endpoint:** `POST /api/send-sticker`  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `jid`: `1234567890@s.whatsapp.net`
- `sticker`: [WebP File]

---

### 8. Send Poll
**Endpoint:** `POST /api/send-poll`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "name": "What is your favorite color?",
  "options": ["Red", "Green", "Blue"]
}
```

---

### 9. Send Interactive List
**Endpoint:** `POST /api/send-list`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "title": "Main Menu",
  "description": "Please choose an option to continue.",
  "buttonText": "View Options",
  "options": ["Support", "Sales", "Info"]
}
```

---

### 10. Send Interactive Buttons (Quick Replies)
**Endpoint:** `POST /api/send-buttons`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "text": "Are you attending the event?",
  "options": ["Yes", "No", "Maybe"]
}
```

---

### 11. Send Location
**Endpoint:** `POST /api/send-location`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "name": "Golden Gate Bridge",
  "address": "San Francisco, CA"
}
```

---

### 12. Send Contact (vCard)
**Endpoint:** `POST /api/send-contact`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "contactName": "John Doe",
  "contactNumber": "1234567890"
}
```

---

### 13. Send Reaction
**Endpoint:** `POST /api/send-reaction`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "jid": "1234567890@s.whatsapp.net",
  "messageId": "MESSAGE_ID_HERE",
  "emoji": "👍"
}
```

## 🌐 Web Interface

A visual web interface is served at `http://localhost:3000/`. You can use this interface to test all the endpoints mentioned above directly from your browser without needing tools like Postman or cURL.

## 🛠 Architecture & Custom Fixes

- **DNS Override:** Due to regional ISP blocking or TLS handshake issues with WhatsApp Web, the `dns.lookup` method is overridden in `example.ts` to hardcode the resolution of `web.whatsapp.com` to `57.144.211.32`. This ensures stable connectivity.
- **Logging:** Powered by `pino`. Logs are streamed both to the console (formatted via `pino-pretty`) and saved sequentially to `wa-logs.txt` for debugging.

## 🧹 Cleanup

Media files uploaded to the server for sending (images, videos, audio, etc.) are temporarily saved in the `uploads/` directory using `multer`. After the message is dispatched to WhatsApp, the server automatically unlinks (deletes) the file to prevent storage bloat.
