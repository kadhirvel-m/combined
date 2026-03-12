# Incident Response Runbook

## Scope
This runbook covers security events emitted by the API and persisted in:
- `security_events` for raw telemetry
- `security_incidents` for triaged incidents

## Roles
- `IC` (Incident Commander): owns severity and timeline decisions.
- `Ops`: handles containment and infrastructure changes.
- `App`: applies code/config remediations.
- `Comms`: drafts stakeholder and user communication.

## Severity Model
- `critical`: active exploitation, data exposure, or auth bypass.
- `high`: credible abuse with elevated impact.
- `warning`: suspicious activity requiring triage.
- `info`: informational signal.

## Triage SLA Targets
- `critical`: acknowledge <= 5 minutes, mitigate <= 30 minutes.
- `high`: acknowledge <= 15 minutes, mitigate <= 2 hours.
- `warning`: acknowledge <= 60 minutes, mitigate <= 1 business day.

## Standard Flow
1. Detect via `/api/admin/security/events` and `/api/admin/security/metrics`.
2. Open/confirm incident in `security_incidents`.
3. Set incident to `acknowledged` and assign owner.
4. Contain blast radius:
   - Revoke affected refresh-token families.
   - Enable stricter thresholds if active abuse is ongoing.
   - Disable vulnerable tool route if prompt/tool abuse is suspected.
5. Eradicate root cause with code/config fix.
6. Validate with targeted replay and logs.
7. Set incident to `resolved` or `false_positive`.
8. Complete post-incident notes in `response_note`.

## Evidence Checklist
- Event IDs and timestamps.
- Request path, method, client IP, user IDs/emails.
- Relevant payload fragments and risk score snapshots.
- Mitigation actions and exact completion time.

## Post-Incident Review
- Capture `MTTD` and `MTTR` from `/api/admin/security/metrics`.
- Identify detection/control gaps and add follow-up tasks.
- Update this runbook if decision logic changed.
