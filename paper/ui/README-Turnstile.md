Cloudflare Turnstile Integration

What changed
- Added Turnstile human verification to `login.html` and `signup.html`.
- The widget renders inside each form and the token is sent as `cf_turnstile_response` in the JSON payload to your API.
- The Cloudflare API script is included on each page.

Configure your site key
1) Create a Turnstile site in your Cloudflare dashboard.
2) Copy the Site Key.
3) Replace `YOUR_TURNSTILE_SITE_KEY` in both files:
   - `login.html`
   - `signup.html`

Backend verification (required)
- Your API must validate the token server‑side before accepting the login/signup.
- Verify by POSTing to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with:
  - `secret`: your Turnstile secret key
  - `response`: the token received as `cf_turnstile_response`
  - (optional) `remoteip`: the end user IP

Example (Node/Express)
```js
import fetch from 'node-fetch';

async function verifyTurnstileToken(token, ip) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip || ''
    })
  });
  const data = await res.json();
  return !!data.success;
}
```

Expected request bodies (from the UI)
- Login: `{ email, password, cf_turnstile_response }`
- Signup: `{ email, password, cf_turnstile_response }`

Notes
- If you serve these pages from multiple hosts, add those origins to your Turnstile site settings.
- If you need to switch to invisible or managed mode, keep the payload key (`cf_turnstile_response`) the same.

