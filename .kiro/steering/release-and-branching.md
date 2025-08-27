---
inclusion: always
---
## Release & Branching Policy

Purpose: Keep delivery predictable with clear branching and versioning.

### Branching
- `main` — protected; deployable at all times
- Feature branches — `feat/*`, `fix/*`, `chore/*`
- Hotfix branches — `hotfix/*` from `main`, PR back to `main`

### Pull Requests
- Small, focused PRs; pass build and tests
- Use PR checklist from commit-and-pr.mdc

### Versioning & Tags
- Semantic Versioning: `MAJOR.MINOR.PATCH`
- Tag releases as `vX.Y.Z` on `main`
- Changelog generated from Conventional Commits

### Release Flow
1. Merge approved PRs into `main`
2. Bump version; update CHANGELOG
3. Tag (`vX.Y.Z`) and push tag
4. CI builds artifacts and deploys

### Hotfix Flow
1. Branch `hotfix/<issue>` from `main`
2. Fix + tests; PR → `main`
3. Patch version bump; tag and deploy

