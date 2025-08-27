---
inclusion: always
---
## TanStack Query Usage Guide (Client Data Fetching & Mutation)

Purpose: Use TanStack Query to enhance client-side interactions while keeping server-first patterns.

### When to Use
- Autocomplete/suggestions, popup lists, small client-side reads
- Optimistic or user-driven mutations with immediate UI feedback
- Avoid for core page data that can be fetched server-side

### Provider
- Wrap the app with `QueryClientProvider` in a client-only Providers component
- Reasonable defaults: `staleTime` (e.g., 60s), `retry` minimal, `refetchOnWindowFocus: false`
- Devtools (optional): include `ReactQueryDevtools` in Providers for local debugging

### Patterns
- useQuery: key includes input params (e.g., `['suggest', q]`), `enabled` guards, debounced inputs
- useMutation: onSuccess → `queryClient.invalidateQueries([...])` and/or local state update
- Keep Next revalidatePath/Tag for server caches; client invalidation complements server revalidation

### Project Query Keys (Conventions)
- Suggestions: `['suggest', q]`
- Benefits list (popup): `['benefits-list']`
  - Optionally scope by id/context: e.g., `['benefits-list', 'popup']`, `['benefits-list', sabreId]`

### Mutations (Project Examples)
- After saving hotel details or benefits mapping: invalidate `['benefits-list']` so the popup list reflects latest master data
- After any mutation that affects a specific list/detail: invalidate the narrow key instead of a global wildcard
- Combine with server-side `revalidatePath('/admin/...')` if the mutation affects server-rendered content

### Scoping & Keys
- Prefer list/detail-specific keys: e.g., `['benefits-list']`, `['benefits-list', sabreId]`
- Avoid global `invalidateQueries()` without keys; target only what changed


### Migration Checklist (Incremental)
1) Add Providers and (optionally) Devtools
2) Convert fetch-based suggestion/popup reads to `useQuery`
3) Convert save/delete actions to `useMutation` with targeted `invalidateQueries`
4) Keep server `revalidatePath/Tag` for pages/routes that render on the server
5) Verify debounce/abort behavior for fast-typing UIs (autocomplete)

### Do/Don't
- Do not expose service-role keys; still call server routes
- Do not over-cache dynamic/secret data; use `cache: 'no-store'` on server when needed
- Prefer small, focused query keys; avoid global invalidations when not necessary

