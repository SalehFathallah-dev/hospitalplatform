# Hospital Communication & Clinical Operations Platform

Status: Phase 1 foundation + first slice of Phase 3 (consultation request with on-call routing). Not production-ready.

## Setup
1. Create a Supabase project (check Ministry data-residency policy first). Copy `.env.example` to `.env.local`.
2. Apply `supabase/migrations/0001 to 0010 (in order), then edit and run `supabase/seed/bootstrap_hospital.sql` once to create the first hospital and administrator.
3. Run `supabase/tests/isolation.sql` and confirm `PASS`.
4. Enable pg_cron and schedule `run_escalations()` (see end of 0002).
5. `npm install && npm run dev`.

## Implemented
Operating rooms and operations (conflict-checked scheduling, team, notes as append-only addenda, cancellation reasons), analytics (response times, by department/hour, OR utilization, workload) with audited CSV export and print-to-PDF. Ward rounds (append-only entries), shift handover with automatic snapshot, private clinical file storage (content-sniffed JPG/PNG/PDF, RLS-checked 60-second signed URLs, every view audited). Patient registry (MRN generation, duplicate detection, search), admission/transfer/discharge with bed history, bed board, patient timeline, attendance with presence board, in-app alerts with acknowledgement, operational stats and permission-controlled CSV export, ward/room/bed admin. Operating rooms and operations (conflict-checked scheduling, team, notes as append-only addenda, cancellation reasons), analytics (response times, by department/hour, OR utilization, workload) with audited CSV export and print-to-PDF. Ward rounds (append-only entries), shift handover with automatic snapshot, private clinical file storage (content-sniffed JPG/PNG/PDF, RLS-checked 60-second signed URLs, every view audited). Patient registry (MRN generation, duplicate warning, search), admission/transfer/discharge, ward-bed board with status, patient timeline with location history, attendance with presence board, tightened audit writes (clients cannot forge audit rows). Admin portal (wards/rooms/beds, departments, staff accounts with anti-escalation checks, duty roster with doctor replacement and on-call-now view). Consultation lifecycle (accept, decline, arrive, start, complete, close, notes) enforced by `transition_consultation`; inbox and detail screens with auto-refresh. Auth (email/password), ar/en with RTL, dashboard, consultation request (atomic: authorization, on-call routing, history, timeline, in-app notification, audit), configurable escalation worker, hash-chained audit log, RLS isolation.

## Not yet implemented
Branding/logo upload and onboarding wizard, attachments, ward rounds, handover, operations, attendance UI, reports, offline sync, OCR/voice, real push/SMS adapters. Notifications use a mock adapter and never report delivery.

## Tests
`npm test` runs unit tests. `supabase/tests/isolation.sql` must print PASS after migrations.

## Known gaps (honest list)
No real push/SMS delivery; no offline queue or PWA manifest/service worker; no attachments, ward rounds, handover, operating rooms, OCR/voice, PDF reports, hospital branding/logo upload, MFA, session/device management, or geofencing. Not security-reviewed; do not use with real patient data before an independent review.

## Documentation
`docs/DATABASE.md`, `docs/API.md`, `docs/SECURITY.md` (read the "not yet done" list before any real use), `docs/DEPLOYMENT.md`, `docs/USER_GUIDE.md`, `docs/ADMIN_GUIDE.md`.

## Offline and push
Consultation requests are saved on the device first and sent idempotently; a banner shows pending/rejected items and nothing is dropped silently. Push uses Web Push (VAPID); `sent` means accepted by the push service, `delivered` means the device confirmed. iOS needs the app on the Home Screen.

## Note on `_parallel_session/`
A second build session wrote files for a different schema into this folder. They were set aside, not deleted, and are not compiled or applied. See `_parallel_session/README.md`.

Admin: setup checklist, hospital settings/branding colour, escalation-rule editor, audit viewer with chain verification.

## AI features (Phase 6) - what is and is not real
- **OCR review workflow is real; OCR itself is not connected.** `src/lib/ai/adapters.ts` ships a mock adapter that extracts nothing and the UI says so. Output is always a draft marked "AI-generated draft - requires clinician review"; only a clinician with `edit_patient` can confirm it, and original/extracted/final/confirmer/time are stored.
- **Voice dictation** uses the browser speech API, only fills a textarea (nothing is saved until the doctor submits), and is OFF until an administrator enables it, because audio may leave the hospital.
- Not built: clinical summary generation, handover summarization, missing-information prompts. No automated diagnosis or treatment suggestions exist and none are planned for the MVP.
