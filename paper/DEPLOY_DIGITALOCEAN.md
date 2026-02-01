# Deploying PaperX to DigitalOcean

This guide explains how to deploy the PaperX application to DigitalOcean App Platform.

## Prerequisites

- A DigitalOcean account.
- A GitHub account with this repository pushed to it.
- Your `.env` file values ready to copy.

## Option 1: Quick Deploy via Control Panel (Recommended)

1.  **Log in to DigitalOcean** and go to the **Apps** section.
2.  Click **Create App**.
3.  **Choose Source**: Select **GitHub**.
4.  **Select Repository**: Choose `kadhirvel-m/PaperX-Flash` (ensure you have granted DigitalOcean permission to access it).
5.  **Source Directory**: Leave as `/`.
6.  **Autodeploy**: Check "Autodeploy code changes" if desired.
7.  Click **Next**.

### Resources Configuration

8.  DigitalOcean should detect the `Dockerfile`.
9.  **Service Name**: You can name it `paperx-api`.
10. **HTTP Port**: Set this to `10000`.
11. **Plan**: Select **Basic** or **Pro**. The **Basic** plan ($5/mo) is usually sufficient for testing.
12. Click **Next**.

### Environment Variables

13. This is the **most important step**. You need to add your environment variables here.
14. Click **Edit** next to Environment Variables.
15. Add the keys and values from your local `.env` file. You can "Bulk Edit" and paste the contents of your `.env` file (excluding comments).
    *   `SUPABASE_URL`
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `SUPABASE_ANON_KEY`
    *   `OPENAI_API_KEY`
    *   `GEMINI_API_KEY`
    *   `SERPAPI_API_KEY`
    *   ...and any others from your `.env`.
16. **Important**: Add the following explicitly if not present:
    *   `PORT=10000`
    *   `HOST=0.0.0.0`
    *   `FORCE_SINGLE_WORKER=true`
17. Click **Save**.
18. Click **Next**.

> [!WARNING]
> If you encounter an error about "deploying action __pycache__", it means DigitalOcean is trying to deploy your cache files. 
> 1. Ensure you have added the `.dockerignore` file included in this update.
> 2. Run `git rm -r --cached .` and `git add .` then commit to clean up your git index if `__pycache__` was accidentally committed.
> 3. Push the changes to GitHub.


### Review and Deploy

19. Select your **Region** (e.g., Bangalore, Singapore, New York).
20. Click **Create Resources**.

## Option 2: Deploy using `app.yaml` (Advanced)

If you have the `doctl` CLI installed, you can deploy using the included `app.yaml`.

1.  **Update `app.yaml`**:
    *   Edit `app.yaml` to include your actual repository name if it differs using `repo: <your-username>/PaperX-Flash`.
2.  **Create App**:
    ```bash
    doctl apps create --spec app.yaml
    ```
3.  **Set Secrets**:
    Since `app.yaml` has placeholders for secrets, you must go to the DigitalOcean Dashboard > Apps > [Your App] > Settings > Component > Environment Variables and update the values for your API keys.

## Verifying Deployment

1.  Once building finishes (can take 5-10 minutes due to Playwright browsers), you will see a green "Healthy" status.
2.  Click the **Live App** URL provided by DigitalOcean.
3.  Navigate to `/health` to verify the API is running (should return `{"status": "ok"}`).
4.  Navigate to `/docs` to see the API documentation.
5.  Navigate to `/ui/index.html` to see the frontend.

---

## WebRTC (Group Call) reliability: TURN is required

If you're seeing issues like:

- Audio/screen share works only sometimes
- It starts working after many refreshes
- Console logs show `ICE candidate error` / `Peer connection failed`

…that usually means users are behind NAT/mobile/corporate networks where **STUN-only** WebRTC fails.

### Important: DigitalOcean App Platform cannot host TURN

TURN needs **UDP** (and often a wide relay port range). DigitalOcean **App Platform does not support UDP services**, so you must run TURN separately:

- Option A (recommended): a small DigitalOcean Droplet running **coturn**
- Option B: a managed TURN provider (Twilio / Xirsys / etc.)

### Option A: coturn on a Droplet (recommended)

1. Create an Ubuntu Droplet (Basic is fine) and attach a static IP if possible.
2. Point a DNS record to it (example: `turn.yourdomain.com`).
3. Install coturn:

```bash
sudo apt-get update
sudo apt-get install -y coturn
```

4. Create/edit `/etc/turnserver.conf` (minimal working config):

```conf
listening-port=3478
tls-listening-port=5349

fingerprint
lt-cred-mech

# Replace with your public IP or DNS name
realm=turn.yourdomain.com

# Create credentials (example)
user=paperx:CHANGE_ME_STRONG_PASSWORD

# Relay port range (must be opened in firewall)
min-port=49152
max-port=65535

# Good defaults
no-multicast-peers
no-cli
```

5. Enable/start coturn:

```bash
sudo sed -i 's/#TURNSERVER_ENABLED=0/TURNSERVER_ENABLED=1/' /etc/default/coturn
sudo systemctl enable coturn
sudo systemctl restart coturn
sudo systemctl status coturn --no-pager
```

6. Firewall: open these ports on the Droplet firewall (and `ufw` if you use it):

- `3478` TCP + UDP (TURN)
- `5349` TCP (TURN over TLS)
- `49152-65535` UDP (relay traffic)

### Wire TURN into PaperX (App Platform env vars)

In DigitalOcean App Platform → **Settings** → **Environment Variables**, add:

- `PAPERX_TURN_URLS=turn:turn.yourdomain.com:3478?transport=udp,turns:turn.yourdomain.com:5349?transport=tcp`
- `PAPERX_TURN_USERNAME=paperx`
- `PAPERX_TURN_CREDENTIAL=CHANGE_ME_STRONG_PASSWORD`

Recommended to make behavior deterministic:

- `PAPERX_REQUIRE_TURN=true`

After redeploy, `/api/rtc-config` should return `turnConfigured: true` and clients should connect reliably.

### Notes

- You may still see occasional `ICE candidate error` warnings for STUN; that’s normal. With TURN configured, the call should still connect.
- For the highest success rate on restrictive networks, expose TURN-TLS on port **443** (optional). That requires configuring coturn to listen on 443 and ensuring nothing else is using that port on the TURN host.
