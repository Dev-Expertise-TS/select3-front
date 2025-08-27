---
inclusion: always
---
## Commit & Pull Request Guidelines (Conventional Commits)

Purpose: Standardize commit messages and PRs for clear history and reliable automation.

### Conventional Commits
- Format: `type(scope): subject`
- Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `style`, `build`, `ci`, `revert`
- Scopes (examples): `app`, `api`, `features`, `ui`, `shared`, `lib`, `types`, `config`, `tests`
- Subject: lower-case, imperative, max ~72 chars (no trailing period)
- Body (optional): what/why (wrap at 72)
- Footer (optional): `BREAKING CHANGE: ...`, `Closes #123`

Examples:
- `feat(ui): add shadcn-style button and input`
- `refactor(route): replace [sabre_paragon] with [sabre]`
- `fix(api): avoid or(...) for comma inputs in hotel search`

### PR Title & Description
- Title mirrors the main commit (Conventional). Example: `feat(hotels): benefits manager drag & drop`
- Description sections:
  - Context: why
  - Changes: what (bullets)
  - Screenshots/Recordings: if UI
  - Risks/Trade-offs
  - Checklist (below)

### PR Checklist (copy into PR)
- [ ] Follows Conventional Commits
- [ ] Code under correct `src/**` path
- [ ] Types safe (no `any`, proper guards)
- [ ] Dates/defaultValue guarded
- [ ] UI uses shared primitives; accessible
- [ ] Server-only logic remains in `src/lib/**` (server)
- [ ] `pnpm build` passes; tests (if changed) pass

