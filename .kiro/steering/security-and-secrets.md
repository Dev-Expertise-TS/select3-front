---
inclusion: always
---
## Security & Secrets Handling

Purpose: Prevent accidental leakage of secrets and keep deployments safe.

### Secrets & Environment
- Never expose service-role keys in client code.
- Access Supabase service client only in `src/lib/supabase/server.ts`.
- Read secrets from env; never hardcode.

### Logging & Errors
- Avoid logging secrets or PII.
- Wrap DB/remote errors with user-friendly messages.

### Dependencies
- Prefer maintained, audited packages.
- Remove unused deps; avoid duplicate libraries.

### Reviews
- PRs introducing env usage must document variable names and scope.
- Ensure `pnpm build` passes with env fallbacks (dev/CI).

