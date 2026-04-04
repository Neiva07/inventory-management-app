# `components/ui` Foundation

This folder is the canonical home for shadcn-based UI primitives and wrappers used during the MUI migration.

## Import Conventions

- Prefer importing shared primitives from `components/ui/<component>` (explicit file import).
- Use `components/ui` barrel exports only for local convenience where circular dependencies are not a risk.
- Put shared styling/composition utilities in `src/lib` (for example `src/lib/utils.ts`) rather than duplicating helpers per component.
- Do not create page-specific shadcn copies outside `src/components/ui`; feature pages should compose primitives from this folder.

## Migration Guidance

- Keep MUI and shadcn components side-by-side during migration batches.
- Replace shared/core primitives first (buttons, inputs, dialogs, badges, cards, form wrappers) before page-by-page rewrites.
- Any intentional behavior or styling divergence from current MUI usage should be called out in the batch approval step.
