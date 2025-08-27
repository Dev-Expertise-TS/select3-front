---
inclusion: always
---
## API Contracts (Responses, Errors, Status Codes, Caching)

Purpose: Establish consistent API response shapes, error handling, and caching guidelines.

### Route Location
- App Router only: `src/app/api/**/route.ts`
- Export HTTP method handlers (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`)

### Response Shape
- Success (JSON):
  - `{ "success": true, "data": <payload>, "meta"?: { ... } }`
- Error (JSON):
  - `{ "success": false, "error": "<message>", "code"?: "<app_error_code>", "details"?: { ... } }`
- Avoid leaking raw DB errors; map to user-friendly messages and optional `code`.

### Status Codes
- 200 OK — successful GET
- 201 Created — resource created
- 204 No Content — successful with no body (e.g., delete)
- 400 Bad Request — validation errors, malformed input
- 401 Unauthorized — missing/invalid auth
- 403 Forbidden — authenticated but not allowed
- 404 Not Found — resource missing
- 409 Conflict — uniqueness or state conflict
- 422 Unprocessable Entity — semantic validation failed
- 429 Too Many Requests — rate limited
- 500 Internal Server Error — unexpected

### Validation
- Validate input early; return 400/422 with actionable `error` text.
- Never trust client input; sanitize and guard types.

### Caching & Revalidation
- GET endpoints: prefer cache headers or Next revalidation where applicable.
  - Static-ish data: `revalidate` with a sane TTL (e.g., 60–300s)
  - Dynamic data: `cache: 'no-store'`
- Mutation endpoints (POST/PATCH/DELETE):
  - Use `revalidatePath('/affected/route')` or `revalidateTag('...')` right after successful write.
  - Return 201/204 as applicable; do not cache mutation responses.

### Pagination & Meta
- For list endpoints, include `meta` with `{ count, page, pageSize }` where useful.

### Security
- Do not include secrets in responses.
- Rate-limit sensitive endpoints.
- Normalize payloads (`null` vs empty arrays) per schema expectations.

