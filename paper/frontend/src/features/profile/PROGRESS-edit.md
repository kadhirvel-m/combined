# profile_edit.html → React (in progress)

Preview route: `src/app/(site)/react-preview/profile_edit/page.tsx` → http://localhost:3000/react-preview/profile_edit
Scratch: `/private/tmp/claude-501/-Users-kadhirvel-m-Documents-combined-paper/3180b12b-93d6-4df4-bf8b-d39ef5979ffc/scratchpad/profile-edit/`
Original loads only `config.js` (API base, fetch/cookie/CSRF shim, theme; TuNe AI widget disabled) and dotlottie-wc. 0 dead classes (prebuilt tailwind.css).

## Layout / chrome
- [ ] `<title>` "Edit Profile — Paper", description "Edit your profile details, photo, and resume."
- [ ] Full-screen loader (#pageLoader, lottie 848055f4…lF6845uqpU.lottie 300×300), fades on load (0.4s) then display:none after 450ms
- [ ] Fixed gradient backdrop `-z-10 from-transparent to-brand-50/40 dark:to-night-700/20` (needs a stacking-context wrapper)
- [ ] Body: font-display bg-white text-slate-900 / dark bg-night-900 text-slate-200; headings inherit body colour (no #1e1e2f)
- [ ] Own sticky header (NOT SiteHeader): "Back" link → /profile.html (arrow_back icon), "Save Changes" (type=button → form.requestSubmit()), "Sign Out" (svg + text)
- [ ] Sign Out: `localStorage.removeItem('px_token')` (no /logout call) → `login.html`
- [ ] h1 "Edit Profile"; grid lg:12 cols: left col-span-4 card, right col-span-8 details form
- [ ] Material icons: Google `.material-symbols-rounded` (loaded after tailwind.css) wins over `text-[18px]` → icons 24px, weight 400

## Left card (photo & resume)
- [ ] Avatar 16×16 gradient + shadow-neon; initials (first letters of first 2 words, upper; 'U'); img (profile_image_url) hides initials
- [ ] #email (or '—'), #name (or '—'); overflow-wrap:anywhere
- [ ] imageForm: label "Profile image", file input accept image/png,image/jpeg,image/webp; hint "Select an image, then click **Save Changes**."; hidden submit; "View current" link (profile_image_url, target _blank) shown only if set
- [ ] Selecting an image previews it in the avatar immediately (object URL)
- [ ] resumeForm: label "Resume (PDF/DOC)", accept application/pdf,.doc,.docx; hint; "View current" (resume_url)
- [ ] "Your email is used for account and contact; it may be visible on your profile."
- [ ] imageForm / resumeForm submit → preventDefault → details form requestSubmit

## Details form (#detailsForm; inputs/textarea/select width:100%, min-width:0 incl. checkboxes)
- [ ] Basic Info: Full name (text), Phone (tel, placeholder 9876543210, maxlength 10, pattern [0-9]{10}), Headline, Location, Date of Birth (date), Email (email, disabled, bg-white/50)
- [ ] Links (md:3 cols, type=url → native typeMismatch validation): LinkedIn, GitHub, LeetCode, Portfolio, Website, Twitter, Instagram, Medium (+ placeholders)
- [ ] About: Bio (textarea 3), Specializations (comma separated), Technologies, Skills, Certifications, Languages, Interests (md:col-span-2), Achievements/Experience/Publications/Project Info textareas
- [ ] Experience list (+ "Add experience"): Title * (required), Employment type select ('', Full-time, Part-time, Internship, Freelance, Contract, Self-employed, Apprenticeship), Company / Organization, Company logo URL (url), Location, Location type ('', Onsite, Remote, Hybrid), Start date * (required date), End date, "Currently here" (checked → end date cleared + disabled + opacity-60), Description, attachments (Title, URL (url), Type link/document/video/image/presentation, Remove), "Attachment" button, "Remove experience" (→ refreshAssociations)
- [ ] Education list (+ "Add education"): Institution * (required select; options from GET /api/colleges; "Select college"), Degree/Department/Batch cascade selects (disabled until parent chosen; GET /api/colleges/{id}), Section (A–Z), Current Semester (number 1–12), Registration No., Grade / GPA, Activities & societies, Highlights; "Remove education" (→ refreshAssociations)
  - initial values matched by name (college/degree lower-case, department upper-case, batch "from-to"); unmatched → unselected
  - hidden values: school/degree/department/batch_range/college_id/degree_id/department_id/batch_id with the original's exact transitions (department_id is NOT cleared when degree is cleared; batch_id is only ever data.batch_id)
  - stale college-detail responses ignored (request id + current value check)
  - college change completion → refreshAssociations
- [ ] Certifications (+ "Add certification"): Certification * (required), Issuing organization, Issue date, Expiration date, "Does not expire" (clears + disables expiry), Credential ID, Credential URL (url), Notes, "Remove certification"
- [ ] Portfolio Projects (+ "Add project" → refreshAssociations): Project name * (required), Linked experience / Linked education selects (options = saved rows with id; labels snapshot at refresh time: title || 'Experience', school || 'Education'; sticky initial association re-applied on every refresh), Start/End date, Project URL (url), Description, Tech stack, Team, "Remove project" (no refresh)
- [ ] Publications (+ "Add publication"): Title * (required), Publisher / Journal, Publication date, Authors, Publication URL (url), Abstract / Summary, "Remove publication"
- [ ] "Cancel" link → /profile.html
- [ ] #status line (hidden until first submit)
- [ ] Enter in a text field does NOT submit (form has no submit button; many implicit-submission-blocking fields)

## Data / API
- [ ] Load: GET /api/profile/me (401 → login.html; ok → body); else GET /api/me (401 → login.html; body.profile || body; JSON error → stop). Network error → uncaught (loader still hides)
- [ ] Field fill: `data.x || ''`; specializations array → join(', '); value sanitisation as the DOM does (date/url/number/text)
- [ ] Save (Save Changes → requestSubmit → native validation → submit):
  - loader shown opaque (inline opacity 1) until 450ms after completion, then display:none
  - status shown; if image chosen: "⏳ Uploading profile image…" → POST /api/profile/upload (FormData kind=image, file); fail → "❌ {detail || 'Image upload failed'}" stop
  - if resume chosen: "⏳ Uploading resume…" → POST /api/profile/upload (kind=resume); fail → "❌ {detail || 'Resume upload failed'}" stop
  - PUT /api/profile/me JSON payload (exact key order; untrimmed `value || null` for basic fields; phone digits only; specializations list; experiences/education_entries/certification_entries/portfolio_projects/publication_entries collected with the original rules)
  - ok → "✔ Profile updated" → location.href = academicas.html; else "❌ {detail || 'Update failed'}"
  - thrown error → console.error, status unchanged
- [ ] Auth headers: `Bearer <px_token>` (shim → sentinel → stripped) — reuse `profileAuthHeaders()`
- Storage keys: `px_token` (read for auth, removed on sign-out), `px_theme` (theme init). No URL params.

## Verification states (compare-page.mjs)
- [ ] data light / dark / mobile / mobile-dark (full page)
- [ ] empty profile; error (500s)
- [ ] loading (loader), saving (loader + status)
- [ ] add rows (each section) + attachment; currently-here / no-expiry toggles
- [ ] education cascade change; project association options
- [ ] validation (invalid url / pattern / required) → focus + validationMessage
- [ ] save PUT body identical (data + edits), upload failure / PUT failure status
- [ ] /profile.html still ~0.06%

## Next step
Build: types/api → lib/editForm.ts (state + reducer + payload) → components → preview route.
