# Architecture, RBAC Matrix and MVP Scope

## Stack
Next.js (App Router, TypeScript) · next-intl (ar default RTL / en) · Tailwind + shadcn/ui · Supabase (Postgres, Auth, private Storage, RLS, pg_cron) · Zod + React Hook Form · PWA (Serwist).

## Security model
1. RLS on every table (see `0001_foundation.sql`); `hospital_id` on every tenant row.
2. `has_perm(hospital, permission, department?)` drives all policies. Roles only bundle permissions.
3. Server actions re-validate input (Zod) and call `log_audit()` for sensitive reads (patient view, file view, export).
4. Service-role key used only in server-side workers (escalation, notifications), never in the browser.
5. Ministry admins get aggregate views only (no patient-level policy exists for them).
6. Files: private bucket, path `{hospital_id}/{patient_id}/...`, access only via short-lived signed URLs issued after a permission check.

## RBAC matrix (system templates, editable per hospital)
| Permission | Hosp. Admin | Dept Head | Consultant/Doctor | Nurse | Auditor |
|---|---|---|---|---|---|
| view/create/edit_patient | ✔ | ✔ | ✔ | view | – |
| create_consultation | ✔ | ✔ | ✔ | ✔ | – |
| accept/close_consultation | ✔ | ✔ | ✔ | – | – |
| manage_roster, replace_on_call_doctor | ✔ | ✔ | – | – | – |
| view/manage_attendance | ✔ | ✔ | – | – | – |
| ward rounds, operations | ✔ | ✔ | ✔ | create round | – |
| view_reports | ✔ | ✔ | – | – | ✔ |
| manage_users, manage_settings | ✔ | – | – | – | – |
| view_audit_logs | ✔ | – | – | – | ✔ |

## Core workflows
- **Consultation:** create → `current_oncall(dept)` resolves target → notification → opened → accepted/declined → arrived → in_progress → completed → closed. Each change writes `consultation_status_history` and a timeline event.
- **Escalation:** pg_cron job (every minute) compares elapsed time with `escalation_rules` per hospital/department/urgency, then notifies backup, supervisor, dept head.
- **Replacement:** insert into `duty_replacements` (audited); `current_oncall` honours it immediately.

## Folder structure
```
src/app/[locale]/(auth)/login
src/app/[locale]/(app)/{dashboard,patients,consultations,roster,wards,attendance}
src/app/[locale]/admin/{hospitals,departments,users,settings,audit}
src/lib/{supabase,authz,audit,notifications/adapters,i18n}
src/components/ui
supabase/{migrations,seed,tests}
docs/{DATABASE,API,SECURITY,DEPLOYMENT}.md
```

## Environment variables (.env.example)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server only), NEXT_PUBLIC_DEFAULT_LOCALE=ar, APP_TIMEZONE=Africa/Tripoli, WEBPUSH_VAPID_PUBLIC/PRIVATE, SMS_PROVIDER=mock

## MVP
Phase 1 (foundation, auth, branding, RBAC) → Phase 2 (patients, beds, timeline) → Phase 3 (roster, consultations, notifications, escalation). Later phases: schema stubs and adapters only until built.
