# ADR 0001: TanStack Form for client-side forms

## Status

Accepted

## Context

Post and reply forms in `apps/web` previously used ad-hoc `useState` with manual trim checks and HTML `required` attributes. The project already uses TanStack Query and TanStack Router. We need a form library that aligns with that stack and supports schema-driven validation as forms grow.

## Decision

Use `@tanstack/react-form` with Zod schemas for all post/reply form UIs in `apps/web`.

- **TanStack Form over react-hook-form**: Keeps the client stack consistent (Query, Router, Form) and shares similar headless, composable patterns.
- **Zod via Standard Schema**: TanStack Form accepts Zod schemas directly in `validators` without a separate adapter. Shared schemas live in `apps/web/src/lib/formSchemas.ts`.
- **Minimal abstractions**: No shared Input/Textarea field wrapper components. Each form uses `form.Field` render props inline. A tiny `FieldError` helper renders touched-field validation messages only.

## Consequences

- Form validation is centralized in Zod schemas; submit handlers no longer duplicate trim/required checks.
- Inline errors appear when a field is touched and invalid.
- Future forms should follow the same pattern: shared schema + inline `form.Field` + `FieldError`.
