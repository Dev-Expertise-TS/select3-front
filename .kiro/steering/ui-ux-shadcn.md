---
inclusion: always
---
## UI/UX & shadcn Usage Guide

Purpose: Align UI components and interactions with a consistent UX baseline.

### Directories & Composition
- shadcn primitives: `src/components/ui/`
- Shared patterns (wrappers, composed controls): `src/components/shared/`
- Compose classes using `cn(...)`; avoid inline styles.

### Buttons & Inputs
- Use shared `Button`/`Input` for consistency.
- Provide loading/disabled states for async actions.
- Destructive actions require confirmation.

### Accessibility
- Provide ARIA roles/labels for interactive elements.
- Keyboard navigation (Arrow/Enter/Escape) for lists/menus.
- Maintain visible focus states.

### Interactions & Feedback
- Hover/active/disabled states consistent across components.
- Copy/async buttons should reflect success/failure (e.g., "Copied").
- Keep layout stable during updates (no jumpy reflows).

