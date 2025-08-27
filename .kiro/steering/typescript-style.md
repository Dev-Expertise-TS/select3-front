---
inclusion: always
---
## TypeScript Style & Safety Guide

Purpose: Enforce strict and readable TypeScript across the codebase.

### Types & Inference
- No `any`. Prefer `unknown` with narrowing.
- Public APIs/types exported with explicit annotations.
- Avoid ambient type mutations and global declarations.

### Naming
- Functions are verbs; variables are nouns.
- Prefer full words over abbreviations.
- Intentional unused variables are prefixed with `_`.

### Inputs & Dates
- Inputs `defaultValue`: always pass a string via `String(value ?? '')`.
- Construct `Date` only from `string | number | Date`; guard before use.

### Control Flow
- Use guard clauses; minimize deep nesting.
- Handle error/edge cases first.

### Comments
- Add comments for non-obvious logic; explain WHY, not HOW.
- Avoid `@ts-ignore`; if unavoidable, use `@ts-expect-error` with a reason.

### Utilities
- Use safe deep access helpers (e.g., `deepGet`) and type guards.
- Keep server-only logic out of client modules.

