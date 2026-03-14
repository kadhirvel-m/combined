# Security SLOs and Chaos Drills

## Core Security SLOs
- Default policy: TuneX Python/Java execution is sandbox-only; compiler worker is mandatory.
- SLO-1: `MTTD` <= 15 minutes for `critical` and `high` incidents.
- SLO-2: `MTTR` <= 120 minutes for `critical` incidents.
- SLO-3: 100% of `alert.*` events create an incident row.
- SLO-4: 100% of compiler execution requests use isolated worker (no inline fallback).
- SLO-5: 0 successful requests that violate LLM guardrail/tool policy.

## KPI Source
Use `/api/admin/security/metrics` with a rolling window (`window_days`) for:
- incident counts by status and severity
- MTTD/MTTR in seconds and minutes
- alert/event volume trends
- top alert types

## CRIT-04 Rollout Flags
- `SUPABASE_USER_SCOPED_DB_ENABLED` (default `false`): enables user-scoped DB client mode for canary endpoints.
- `SUPABASE_USER_SCOPED_DB_CANARY_ENDPOINTS` (default `/api/projects*,/api/teacher/profile/me,/api/teacher/me/status,/api/teacher/connections*,/api/teacher/notes/mine,/api/teacher/academics/mine`): comma-separated endpoint paths migrated first (supports `*` suffix for prefix matching).
- `SUPABASE_USER_SCOPED_DB_ALLOW_FALLBACK` (default `true`): when user-scoped client fails, fallback to service-role to preserve availability.
- `SUPABASE_SERVICE_ROLE_AUDIT_ENABLED` (default `true`): emits warning telemetry when service-role is used in authenticated user routes.
- `SUPABASE_SERVICE_ROLE_ENFORCE_ENABLED` (default `false`): blocks service-role use for canary endpoints (enable only after validation).

## CRIT-03 JWT Verification Flags
- `AUTH_VERIFY_SIGNATURE` (default `true`): enables cryptographic JWT signature verification path.
- `AUTH_JWT_SECRET` (preferred) or `SUPABASE_JWT_SECRET` (fallback): HS256 secret for local token signature verification.
- If no local JWT secret is configured, token validity is verified via Supabase Auth (`auth.get_user(token)`) and issuer/audience checks remain enforced.

Phase 2 canary routes migrated:
- `/api/projects/{project_id}/apply`
- `/api/projects/{project_id}/applications`
- `/api/projects/{project_id}/applications/me`
- `/api/projects/{project_id}/applications/{application_id}`
- `PATCH /api/projects/{project_id}/applications/{application_id}`

Phase 3 canary routes migrated:
- `/api/teacher/me/status`
- `/api/teacher/connections`
- `/api/teacher/connections/{connection_id}/messages`
- `/api/teacher/notes/mine`
- `/api/teacher/academics/mine`

## Error Budgets
- MTTD budget breach: if weekly average exceeds 15 minutes twice, trigger staffing/escalation review.
- MTTR budget breach: if weekly average exceeds 120 minutes once for critical incidents, run immediate retro.

## Chaos Exercise Cadence
Run monthly controlled drills:
1. Auth abuse simulation:
   - Repeated invalid refresh attempts from one IP.
   - Verify abuse scoring blocks and incident generation.
2. Prompt injection simulation:
   - Submit blocked patterns to LLM-facing endpoints.
   - Verify `prompt-injection-detected` telemetry and deny behavior.
3. Compiler isolation failure drill:
   - Temporarily deny worker connectivity.
   - Verify compiler endpoints fail closed (503) and never run code inline.
4. RAG trust drill:
   - Attempt upload with invalid or oversized payload.
   - Verify trust validator blocks and emits alert telemetry.

## Drill Exit Criteria
- Incident created with correct severity.
- Alert surfaces in admin logs in < 60 seconds.
- Runbook owner acknowledges and resolves within SLO target.
- Follow-up actions documented and assigned.
