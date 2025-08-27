---
inclusion: always
---
## Testing Guidelines (Vitest + Testing Library)

Purpose: Provide fast, reliable tests with clear boundaries between layers.

### Test Layers & Folders
- `src/tests/unit/**` — pure functions, hooks with no IO
- `src/tests/integration/**` — components with minimal mocking, data-access adapters
- `src/tests/e2e/**` — optional (e.g., Playwright)

### Principles
- Tests must be deterministic; avoid network and real time.
- Prefer black-box assertions (user-facing behavior) over implementation details.
- Keep unit tests fast (<100ms each) and independent.

### React Component Tests
- Use Testing Library; assert on roles/labels/text over test IDs.
- Simulate user flows (keyboard, mouse) instead of calling internals.
- Mock only external boundaries (e.g., fetch, Supabase).

### Data & State
- Use minimal fixtures; co-locate reusable factories in `src/tests/_fixtures`.
- For date/time, freeze timers; avoid timezone flakiness.

### Coverage & CI
- Focus on critical paths (features, reducers, API handlers) over 100% coverage.
- Run unit/integration on PR; e2e on main or nightly.

### Commands
- `pnpm test` — run tests once
- `pnpm test:watch` — watch mode
- `pnpm test:ui` — Vitest UI

