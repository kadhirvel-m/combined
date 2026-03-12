# Security SLOs and Chaos Drills

## Core Security SLOs
- SLO-1: `MTTD` <= 15 minutes for `critical` and `high` incidents.
- SLO-2: `MTTR` <= 120 minutes for `critical` incidents.
- SLO-3: 100% of `alert.*` events create an incident row.
- SLO-4: 100% of compiler execution requests use isolated worker when configured.
- SLO-5: 0 successful requests that violate LLM guardrail/tool policy.

## KPI Source
Use `/api/admin/security/metrics` with a rolling window (`window_days`) for:
- incident counts by status and severity
- MTTD/MTTR in seconds and minutes
- alert/event volume trends
- top alert types

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
   - Verify inline fallback policy respects `COMPILER_INLINE_EXECUTION_ENABLED`.
4. RAG trust drill:
   - Attempt upload with invalid or oversized payload.
   - Verify trust validator blocks and emits alert telemetry.

## Drill Exit Criteria
- Incident created with correct severity.
- Alert surfaces in admin logs in < 60 seconds.
- Runbook owner acknowledges and resolves within SLO target.
- Follow-up actions documented and assigned.
