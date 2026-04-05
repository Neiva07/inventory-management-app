# Shadcn Migration Implementation Notes

## Baseline Snapshot (Task 1.1)

Captured at `2026-02-23T18:12:05Z` before dependency upgrades.

- Git branch: `shadcn-migration`
- Git HEAD: `3ddf481fa9714c948658a8399a60d3b2432e2143`
- Package manager: `pnpm@10.28.2`
- Baseline snapshot copies:
  - `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/baseline/package.json`
  - `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/baseline/pnpm-lock.yaml`
- SHA-256:
  - `package.json`: `6fc62bd79c55d29ced48f02f315ad239f6a227c4229f52427e8921e4459b6ba7`
  - `pnpm-lock.yaml`: `78e2ac56cb9d91e9acd768749a0cc5aebf6e620bd21e094013af5d6ce730e8ab`

### Current Core Versions (Baseline)

- `electron`: `24.4.0`
- `typescript`: `~4.8.0`
- `react`: `^18.2.0`
- `react-dom`: `^18.2.0`

### Current MUI Baseline (Reference)

- `@mui/material`: `^5.13.3`
- `@mui/icons-material`: `^5.13.3`
- `@mui/x-data-grid`: `^6.10.0`
- `@mui/x-date-pickers`: `^6.12.0`

## Target Stable Versions (Task 1.2)

Selected on `2026-02-23` using `npm view <pkg>@latest version` (stable-only target selection).

### Core Platform Targets

- `react`: `19.2.4`
- `react-dom`: `19.2.4`
- `electron`: `40.6.0`
- `typescript`: `5.9.3`

### Key Supporting Tooling Targets (Phase 1 planning set)

- `@electron-forge/cli`: `7.11.1`
- `@electron-forge/plugin-webpack`: `7.11.1`
- `@electron-forge/plugin-auto-unpack-natives`: `7.11.1`
- `@electron-forge/maker-squirrel`: `7.11.1`
- `@electron-forge/maker-zip`: `7.11.1`
- `@electron-forge/maker-deb`: `7.11.1`
- `@electron-forge/maker-rpm`: `7.11.1`
- `@electron-forge/publisher-github`: `7.11.1`
- `@types/react`: `19.2.14`
- `@types/react-dom`: `19.2.3`
- `eslint`: `9.39.3` (pinned to latest compatible v9 because `eslint-plugin-import@2.31.0` does not yet declare ESLint 10 support)
- `@typescript-eslint/parser`: `8.56.1`
- `@typescript-eslint/eslint-plugin`: `8.56.1`
- `ts-loader`: `9.5.4`
- `ts-node`: `10.9.2`
- `fork-ts-checker-webpack-plugin`: `9.1.0`

Notes:
- Exact package upgrades in `package.json` may be staged across Tasks 2.1 and 2.2 to resolve peer constraints.
- Additional support packages may be added to the target list during Task 2.2 if compatibility requires it.
- The absolute latest stable ESLint available on `2026-02-23` was `10.0.1`, but Phase 1 uses `9.39.3` for compatibility with the current ESLint plugin stack.

## Implementation Progress Notes

- Task 2.1 completed: upgraded `react`, `react-dom`, `electron`, and `typescript` in `package.json` and refreshed `pnpm-lock.yaml`.
- Task 2.2 completed: upgraded Electron Forge 7.x, React type packages, `@typescript-eslint` 8.x, `ts-loader`, and `fork-ts-checker-webpack-plugin`; pinned ESLint to compatible `9.39.3`.
- Task 2.3 completed (config compatibility updates):
  - Added `/Users/lucas/Projects/inventory-management-app/eslint.config.cjs` as an ESLint 9 flat-config bridge for the existing `.eslintrc.json`.
  - Added generated/build directory ignores in flat config (`.webpack`, `dist`, `out`, etc.) to avoid linting bundled artifacts.
  - Added `/Users/lucas/Projects/inventory-management-app/.npmrc` with `node-linker=hoisted` to satisfy Electron Forge 7 + pnpm requirements.
- Task 2.4 partial:
- Task 2.4 completed:
  - `pnpm exec tsc --noEmit` initially failed under TypeScript 5.9 with two implicit-`any` errors in `/Users/lucas/Projects/inventory-management-app/src/model/suppliers.ts`.
  - Fixed both by explicitly typing `deletedAt: null as number | null`.
  - `pnpm exec tsc --noEmit` now passes.
  - Resolved Electron runtime startup binary issue after hoisted reinstall by running `node node_modules/electron/install.js` (Electron postinstall download had been skipped by pnpm build-script approval behavior).
- Current expected peer warnings after Task 2.2:
  - `@mui/x-data-grid` and `@mui/x-date-pickers` do not declare React 19 support yet.
  - `react-text-mask` does not declare React 19 support.
- Task 2.5 completed (validation run + documented results):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes after adding pnpm hoisted linker config and repairing install state.
  - `pnpm run verify:migration` ✅ passes (`verify:core-flows` and `verify:offline-sync` both pass).
  - `pnpm start` smoke check ✅ launches Electron app and renderer dev server after installing Electron binary; manual stop performed after launch confirmation.
  - `pnpm lint` ❌ fails with a large pre-existing lint backlog under ESLint 9 + `@typescript-eslint` 8 (source issues, not generated bundles).
- Validation blocker discovered and resolved during Task 2.5:
  - `pnpm exec electron-forge package` initially failed because Forge 7 requires pnpm hoisting (`node-linker=hoisted`), which is now configured via project `.npmrc`.
  - Re-install after linker switch initially failed with a pnpm lockfile integrity error (`@libsql/darwin-x64@0.5.22` missing entry).
  - Resolved by moving `node_modules` aside and regenerating install state with a fresh `pnpm install` using regenerated `pnpm-lock.yaml`.
- Lint status after ESLint 9 migration:
  - ESLint now runs via flat config, but it reports a large pre-existing source lint backlog under newer `@typescript-eslint`/ESLint rules (hundreds of errors).
  - This is separate from the typecheck result and should be handled as a focused lint-cleanup effort or configuration adjustment.
- Runtime note observed during `pnpm start` smoke checks:
  - App startup logs environment variables to stdout (including sensitive env keys/values present in the environment). This appears unrelated to the dependency upgrade but is a security/privacy risk worth a follow-up change.
  - Follow-up completed during migration work: removed the `console.log(...process.env)` startup log from `/Users/lucas/Projects/inventory-management-app/src/index.ts`.
- Task 3.1 completed (Tailwind v4+ foundation installed):
  - Added `tailwindcss@4.2.1`, `@tailwindcss/postcss@4.2.1`, `postcss@8.5.6`, `tw-animate-css@1.4.0`, and `shadcn@3.8.5`.
  - Verified Tailwind major version is v4 and no `tailwindcss@3` entries remain in `pnpm-lock.yaml`.
- Task 3.2 completed (renderer CSS pipeline integration):
  - Added `/Users/lucas/Projects/inventory-management-app/postcss.config.mjs`.
  - Updated `/Users/lucas/Projects/inventory-management-app/webpack.renderer.config.ts` CSS rule to include `postcss-loader`.
  - Replaced `/Users/lucas/Projects/inventory-management-app/src/index.css` with Tailwind v4 imports and shadcn-compatible CSS variables/theme tokens while preserving global body layout styling.
- Task 3.3 completed (shadcn configuration):
  - Added `/Users/lucas/Projects/inventory-management-app/components.json` configured to target `src/components/ui` and `src/lib/utils`.
- Task 3.4 completed (foundation primitives and utilities):
  - Added `/Users/lucas/Projects/inventory-management-app/src/lib/utils.ts` (`cn` helper).
  - Added seed shadcn-style primitives under `/Users/lucas/Projects/inventory-management-app/src/components/ui/` (`button`, `input`, `textarea`, `card`, `badge`) plus barrel exports.
- Task 3.5 completed (coexistence validation with MUI):
  - Added hidden dev-only smoke render component `/Users/lucas/Projects/inventory-management-app/src/components/ui/ShadcnFoundationSmoke.tsx`.
  - Wired hidden smoke render into `/Users/lucas/Projects/inventory-management-app/src/home.tsx` so shadcn components mount under the existing MUI provider stack during dev.
  - Validation results after Tailwind/shadcn integration:
    - `pnpm exec tsc --noEmit` ✅ passes.
    - `pnpm exec electron-forge package` ✅ passes.
    - `pnpm start` ✅ launches Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`) and was manually stopped after launch confirmation.
- Task 3.6 completed (import conventions documented):
  - Added `/Users/lucas/Projects/inventory-management-app/src/components/ui/README.md` documenting canonical import patterns and migration guidance.
- Task 4.1 completed (MUI usage inventory):
  - Generated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with file inventory, package counts, and special-case analysis (`@mui/x-data-grid`, `@mui/x-date-pickers`, theme/system coupling).
- Task 4.2 completed (migration batch grouping):
  - Documented proposed batch sequence prioritizing shared/core components first and deferring MUI X date-picker/data-grid migrations.
- Task 4.3 completed (first batch mapping + risks):
  - Documented recommended first replacement batch scope, per-component MUI->shadcn/core mapping, required new shadcn primitives, and explicit risks.
- Task 5.1 completed (Batch 1 implementation - approved shared components):
  - Replaced internal MUI imports/usages with shadcn/core/Tailwind in:
    - `/Users/lucas/Projects/inventory-management-app/src/components/PageTitle.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/SearchField.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/FormActions.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/DeleteConfirmationDialog.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/DuplicateItemDialog.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/OfflineIndicator.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/TotalCostDisplay.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/TotalComissionDisplay.tsx`
  - Kept exported component APIs stable so existing pages/forms continue importing the same shared components.
  - Added shadcn wrappers under `/Users/lucas/Projects/inventory-management-app/src/components/ui/`:
    - `tooltip.tsx`
    - `dialog.tsx`
    - `alert-dialog.tsx`
- Task 5.2 completed (Batch 1 validation + documented differences):
  - `pnpm exec tsc --noEmit` ✅ passes after Batch 1 changes.
  - `pnpm exec electron-forge package` ✅ passes after adding Radix dialog/tooltip dependencies.
  - `pnpm start` ✅ launches Electron app after resolving non-code issues:
    - `EADDRINUSE` on renderer dev-server port `3026` caused one failed startup attempt due to a stale Node process; resolved by killing the stale listener.
    - Running `pnpm add` for Radix packages re-triggered pnpm build-script blocking for Electron, so `node node_modules/electron/install.js` was run again to restore the local Electron binary.
  - Targeted UI behavior validation in this session is limited to compile/package/startup smoke (no interactive UI automation harness exists in repo). Manual checks for affected dialogs/actions on CRUD pages are still recommended before release.
  - Intentional implementation differences:
    - Batch 1 now uses `lucide-react` icons instead of `@mui/icons-material` in migrated shared components.
    - `DeleteConfirmationDialog` uses shadcn `AlertDialog` (more semantically aligned for destructive confirmation) instead of generic MUI `Dialog`.
- Task 5.3 completed (inventory refresh after Batch 1):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-1 counts and remaining shared-component MUI inventory.
- Task 5.4 completed (next batch proposal prepared for approval):
  - Proposed next batch focused on keyboard-help dialogs + toggle components (shared layer), excluding MUI X and autocomplete/table-heavy components.
- Repeat Batch 2 completed under the existing Tasks 5.1-5.4 loop (keyboard help + toggles):
  - Replaced internal MUI imports/usages with shadcn/core/Tailwind in:
    - `/Users/lucas/Projects/inventory-management-app/src/components/KeyboardListHelperIcon.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/KeyboardListPageKeyboardHelp.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/KeyboardFormShortcutsHelp.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/GlobalKeyboardHelp.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/CreateModeToggle.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/ProductUpdateToggle.tsx`
  - Added `/Users/lucas/Projects/inventory-management-app/src/components/ui/switch.tsx` (Radix-based shadcn-style switch primitive) and `@radix-ui/react-switch`.
  - Preserved public component props, including `ListPageKeyboardHelperIcon` `size`/`color` props via internal class mapping.
- Repeat Batch 2 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches Electron app and renderer dev server (`Output Available: http://localhost:9026`, `Launched Electron app`); manually stopped after launch confirmation.
  - As with prior dependency additions, `pnpm add` ignored Electron build scripts and required re-running `node node_modules/electron/install.js` before the startup smoke.
- Repeat Batch 2 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-2 counts and remaining shared-component MUI list.
  - Prepared next proposed batch focused on `PublicIdDisplay`, `PaymentModal`, and `ProductUpdateModal`, while deferring `InstallmentPlanModal`, `EnhancedAutocomplete`, `CustomDataTable`, and `UpdateNotification`.
- Repeat Batch 3 completed under the existing Tasks 5.1-5.4 loop (shared dialog forms + public ID display):
  - Replaced internal MUI imports/usages with shadcn/core/Tailwind in:
    - `/Users/lucas/Projects/inventory-management-app/src/components/PublicIdDisplay.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/PaymentModal.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/components/ProductUpdateModal.tsx`
  - Preserved exported component props/business logic while swapping dialog/form/layout primitives from MUI to shadcn/core/Tailwind.
  - No new Radix/shadcn dependencies were required for Batch 3 (reused primitives from earlier batches).
  - Intentional implementation differences:
    - `PublicIdDisplay` now uses a local fixed-position copied-feedback message (Tailwind-styled) instead of MUI `Snackbar`.
    - `PaymentModal` uses a native `<select>` (styled with Tailwind) instead of MUI `Select`.
    - `ProductUpdateModal` numeric rows/layout were rebuilt with Tailwind flex/grid wrappers while preserving calculation/update behavior.
- Repeat Batch 3 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manually stopped after launch confirmation.
  - Operational note: Forge UI appeared stalled at the renderer-dev-server launch spinner for ~24s, but startup completed successfully and Electron launched.
- Repeat Batch 3 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-3 counts and the remaining shared-component MUI list (`CustomDataTable`, `EnhancedAutocomplete`, `InstallmentPlanModal`, `UpdateNotification`).
  - Prepared next recommended batch focused on `UpdateNotification` only, deferring `CustomDataTable`, `EnhancedAutocomplete`, and `InstallmentPlanModal` due to grid/autocomplete/date-picker strategy complexity.
- Repeat Batch 4 completed under the existing Tasks 5.1-5.4 loop (update notification):
  - Replaced internal MUI `Snackbar`/`Alert` usage in `/Users/lucas/Projects/inventory-management-app/src/components/UpdateNotification.tsx` with a local fixed-position notification stack built with Tailwind styling, `components/ui/button`, and `lucide-react` icons.
  - Preserved update event listeners and user actions (`downloadUpdate`, `installUpdate`) while keeping explicit error dismiss behavior.
  - No new shadcn primitives or dependencies were added.
- Repeat Batch 4 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ startup smoke considered successful: the interactive Forge session returned `ELIFECYCLE` early, but renderer dev server (`127.0.0.1:3026`) and Electron processes were running and the app window launched; stale processes were manually cleaned up after verification.
- Repeat Batch 4 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-4 counts and the remaining shared-component MUI list (`CustomDataTable`, `EnhancedAutocomplete`, `InstallmentPlanModal`).
  - Prepared next recommended batch focused on `EnhancedAutocomplete` only, deferring `CustomDataTable` and `InstallmentPlanModal`.
- Repeat Batch 5 completed under the existing Tasks 5.1-5.4 loop (shared autocomplete wrapper):
  - Replaced `/Users/lucas/Projects/inventory-management-app/src/components/EnhancedAutocomplete.tsx` (MUI `Autocomplete` + `TextField`) with a local generic combobox/listbox implementation using Tailwind styling, `components/ui/input`, and `lucide-react` icons.
  - Preserved the wrapper API used by existing pages/forms (`single`/`multiple`, `getOptionLabel`, `isOptionEqualToValue`, `renderTags`, `onChange`, `onNextField`, `onPreviousField`, `onOpen`, `onClose`).
  - Reused the existing `useAutocompleteKeyboard` hook for keyboard shortcut behavior and field navigation integration.
  - No new dependencies or shadcn primitives were added.
  - Follow-up fix applied during the same batch: adjusted open/close state guards and single-select close behavior to avoid restoring stale labels after selection.
- Repeat Batch 5 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes (including after the close-behavior follow-up fix).
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manually stopped after launch confirmation.
  - Operational note: Forge remained on the renderer-dev-server spinner longer than usual (~29s) before reporting launch completion.
  - Validation scope remains compile/package/startup smoke only; manual interaction checks are especially important for this batch because `EnhancedAutocomplete` is behavior-sensitive and heavily reused.
- Repeat Batch 5 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-5 counts and the remaining shared-component MUI list (`CustomDataTable`, `InstallmentPlanModal`).
  - Prepared next recommended batch focused on `CustomDataTable` only, deferring `InstallmentPlanModal` to the date-picker strategy batch.
- Repeat Batch 6 completed under the existing Tasks 5.1-5.4 loop (shared table wrapper):
  - Replaced `/Users/lucas/Projects/inventory-management-app/src/components/CustomDataTable/index.tsx` (MUI table/pagination/loading wrapper) with a TanStack Table + shadcn/core/Tailwind implementation while preserving the existing `CustomDataTable` wrapper props and ref API.
  - Added shadcn `table` primitive at `/Users/lucas/Projects/inventory-management-app/src/components/ui/table.tsx` and exported it from `/Users/lucas/Projects/inventory-management-app/src/components/ui/index.ts`.
  - Added `@tanstack/react-table`.
  - Preserved keyboard navigation and focus restoration integration (`useTableNavigation`, `restoreFocusToSelectedRow`, `onFocusFirstRow`) and external/manual pagination callbacks.
  - Shadcn generator path issue encountered: `pnpm dlx shadcn@latest add table` generated `table.tsx` under `node_modules/src/components/ui/table.tsx`; file was manually relocated/ported into `/Users/lucas/Projects/inventory-management-app/src/components/ui/table.tsx` with project-correct imports.
- Repeat Batch 6 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manually stopped after launch confirmation.
  - Because `pnpm add @tanstack/react-table` ignored Electron build scripts again, `node node_modules/electron/install.js` was run before the startup smoke.
  - Validation scope remains compile/package/startup smoke only; manual checks are recommended across list screens using `CustomDataTable` (selection, keyboard navigation, pagination, double-click edit flows).
- Repeat Batch 6 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-6 counts and the remaining shared-component MUI list (`InstallmentPlanModal` only).
  - Prepared the `InstallmentPlanModal` date-picker strategy approval gate as the next shared-component replacement decision.
- Repeat Batch 7 completed under the existing Tasks 5.1-5.4 loop (shared installment planner + full date-picker migration):
  - Replaced `/Users/lucas/Projects/inventory-management-app/src/components/InstallmentPlanModal.tsx` MUI material + MUI X `DatePicker` UI with shadcn/core/Tailwind equivalents while preserving installment planning calculations and submit payload shape.
  - Added shadcn date-picker building blocks to `/Users/lucas/Projects/inventory-management-app/src/components/ui/`:
    - `popover.tsx`
    - `calendar.tsx`
  - Exported the new primitives from `/Users/lucas/Projects/inventory-management-app/src/components/ui/index.ts`.
  - Added `@radix-ui/react-popover` and `react-day-picker` to the project dependencies for shadcn date-picker composition.
  - Implemented local `DateField` popover/calendar controls in `InstallmentPlanModal` for the start date and per-row due dates (replacing MUI X text-field-based pickers).
  - Preserved row lock behavior (`dueDate`, `amount`, `paymentMethod`) when users edit generated installments.
  - Shadcn generator path issue also occurred for this batch:
    - `pnpm dlx shadcn@latest add popover calendar` generated files under `node_modules/src/components/ui/*` in this repo, so `popover.tsx` and `calendar.tsx` were manually relocated/ported into `/Users/lucas/Projects/inventory-management-app/src/components/ui/` with project-correct imports.
- Repeat Batch 7 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manually validated and then stale Forge processes were cleaned up.
  - One `pnpm start` attempt failed with `EADDRINUSE` on `127.0.0.1:3026` due to a stale Forge/dev-server process from a prior session; rerun succeeded after killing the stale listeners (non-code issue).
  - Validation scope remains compile/package/startup smoke only; manual interaction checks are recommended for installment planning flows (date edits, interval changes, per-row overrides).
- Repeat Batch 7 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-7 counts.
  - Shared component MUI migration milestone reached: `/Users/lucas/Projects/inventory-management-app/src/components/*` no longer imports `@mui/*`.
  - Prepared the next recommended approval gate for page-level `@mui/x-date-pickers` migration + `src/app.tsx` provider cleanup (excluding `@mui/x-data-grid` strategy work).
- Repeat Batch 8 completed under the existing Tasks 5.1-5.4 loop (page-level date pickers + app provider cleanup):
  - Replaced the remaining page-level MUI X `DatePicker` usage with the shadcn-style `DatePickerField` wrapper (`Popover` + `Calendar`) in:
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderFormHeader.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderFormHeader.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/installmentPayment/InstallmentPaymentList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/supplierBill/SupplierBillList.tsx`
  - Removed the MUI date-picker provider wrapper (`LocalizationProvider`, `AdapterDateFns`) from `/Users/lucas/Projects/inventory-management-app/src/app.tsx`.
  - Added `/Users/lucas/Projects/inventory-management-app/src/components/ui/date-picker-field.tsx` and exported it via `/Users/lucas/Projects/inventory-management-app/src/components/ui/index.ts`.
  - `DatePickerField` intentionally uses a real read-only `<input>` trigger to preserve existing focus-navigation hooks that call `querySelector('input')` on filter/form refs.
  - Applied a narrow locale type cast in the new wrapper due `react-day-picker@9` locale typing vs current repo TS module-resolution constraints (without changing tsconfig/module resolution settings during this batch).
- Repeat Batch 8 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manually validated and stale Forge processes were cleaned up after the smoke check.
  - One `pnpm start` attempt failed with `EADDRINUSE` on `127.0.0.1:3026` due to a stale Forge/dev-server process from a prior session; rerun succeeded after killing the stale listeners (non-code issue).
  - Validation scope remains compile/package/startup smoke only; manual interaction checks are recommended for date-filter-heavy list pages and order/inbound form header date editing.
- Repeat Batch 8 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-8 counts.
  - Date-picker migration milestone reached: `@mui/x-date-pickers` imports in `/Users/lucas/Projects/inventory-management-app/src/` are now `0`, and the app-level MUI date-picker provider wrapper was removed from `/Users/lucas/Projects/inventory-management-app/src/app.tsx`.
  - Prepared the next recommended approval gate for `@mui/x-data-grid` strategy + first migration slice (five DataGrid files plus `MuiDataGrid` theme override coupling in `/Users/lucas/Projects/inventory-management-app/src/app.tsx`).
- Repeat Batch 9 completed under the existing Tasks 5.1-5.4 loop (DataGrid strategy + migration slice):
  - Replaced the remaining true MUI X `DataGrid` usages in:
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderFormLineItemList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderFormLineItemList.tsx`
    with the shared TanStack/shadcn `CustomDataTable` (client-side paginated inside each component).
  - Preserved line-item deletion flows and row identity behavior (`productID + variant.unit.id`) in both line-item lists.
  - Replaced `@mui/x-data-grid` `GridDeleteIcon` with `lucide-react` `Trash2` in the line-item action column.
  - Removed residual `@mui/x-data-grid` icon imports (`GridSearchIcon`) from list pages already using `CustomDataTable`:
    - `/Users/lucas/Projects/inventory-management-app/src/pages/customer/customersList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/product/ProductList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/supplier/supplierList.tsx`
    by swapping to `lucide-react` `Search`.
  - Removed stale `MuiDataGrid` theme override coupling from `/Users/lucas/Projects/inventory-management-app/src/app.tsx`:
    - deleted the custom `MuiDataGrid` theme override block
    - deleted the local `declare module '@mui/material/styles'` augmentation that existed only to type that override
- Repeat Batch 9 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manual smoke completed and Forge processes cleaned up.
  - Startup smoke showed IndexedDB lock warnings in one run (`...IndexedDB/http_localhost_3026.../LOCK`) after launch, consistent with local dev profile/process contention rather than a compile/runtime regression; app still launched successfully.
- Repeat Batch 9 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-9 counts.
  - MUI X milestone reached: `@mui/x-data-grid` imports in `/Users/lucas/Projects/inventory-management-app/src/` are now `0`; together with Batch 8, all MUI X usage in `src/` is removed.
  - Prepared the next recommended approval gate for list-page MUI material controls cleanup (pages already using migrated shared shadcn table/date-picker wrappers).
- Repeat Batch 10 completed under the existing Tasks 5.1-5.4 loop (list-page MUI material controls cleanup):
  - Replaced MUI material layout/control usage in the approved list pages:
    - `/Users/lucas/Projects/inventory-management-app/src/pages/customer/customersList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/product/ProductList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/supplier/supplierList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/installmentPayment/InstallmentPaymentList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/supplierBill/SupplierBillList.tsx`
  - Replaced page layout wrappers (`Grid`, `Box`) with Tailwind `<div>` grids/flex layouts where in scope.
  - Replaced list action buttons/tooltips (`Button`, `Tooltip`, `IconButton`) with shadcn `Button` + shadcn `Tooltip` primitives.
  - Replaced installment-payment list MUI icons (`Visibility`, `Payment`, `Refresh`) with `lucide-react` icons (`Eye`, `CreditCard`, `RefreshCw`).
  - Replaced supplier-bill and installment-payment list MUI `Box` status chips with Tailwind `<div>` badges.
  - Updated `/Users/lucas/Projects/inventory-management-app/src/components/SearchField.tsx` to `forwardRef` and support `autoFocus` so list pages could reuse it while preserving focus-navigation hooks that query the wrapped input element.
- Repeat Batch 10 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manual smoke completed and Forge processes were cleaned up.
  - Startup smoke still shows the recurring quota/IndexedDB lock warnings in local dev runs; app launch succeeded and this remains an environment/profile contention issue rather than a build/type regression.
- Repeat Batch 10 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-10 counts (`MUI files: 42 -> 35`, `@mui/material`: `46 -> 39`).
  - Approved list-page cleanup milestone reached: the seven list pages in Batch 10 no longer import `@mui/*`.
  - Prepared the next recommended approval gate for core CRUD/order/inbound form page cleanup (excluding onboarding/auth/navigation shell).

## Phase Validation Checklist (Task 1.3)

Run after each phase (Platform Upgrade, shadcn/Tailwind Foundation, each approved MUI replacement batch, final cleanup).

### Automated Checks

- `pnpm lint`
- `pnpm exec tsc --noEmit` (or equivalent typecheck command if a dedicated script is added)
- `pnpm run verify:core-flows`
- `pnpm run verify:offline-sync`
- `pnpm run verify:migration`
- `pnpm run package` (or `pnpm run make` if packaging validation is required for the phase)

### App Startup / Runtime Smoke Checks

- Start app in dev mode (`pnpm start`) and confirm Electron launches
- Confirm renderer loads without fatal startup/runtime errors
- Confirm auth providers initialize and login route renders (`#/login`)
- Confirm app root/home route renders for authenticated flow
- Confirm database bootstrap completes (no startup bootstrap failure in console)
- Confirm sync runtime starts without dependency-related crashes

### Key UI / Feature Flow Checks (manual smoke)

- Navigation shell renders (navbar/sidebar)
- At least one CRUD list page loads: products, suppliers, customers, orders
- At least one form page loads and basic form controls render/accept input
- Onboarding route still mounts (`OnboardingRouter`) without startup regressions
- Date picker and data-grid dependent screens still render (until replaced)
- Toast notifications and update notification UI still mount

### Batch-Specific Checks (for MUI replacement batches)

- Verify only approved batch scope changed
- Confirm primary actions/keyboard flows in migrated components still work
- Document any intentional visual/behavior differences approved for the batch

## Rollback Checkpoint (Task 1.4)

Created rollback branch boundary before dependency upgrades:

- Branch: `codex/shadcn-migration-baseline`
- Points to: `3ddf481fa9714c948658a8399a60d3b2432e2143`

This branch preserves the pre-upgrade baseline so platform upgrade work can be reverted independently from later phases.
- Repeat Batch 11 completed under the existing Tasks 5.1-5.4 loop (core form pages: CRUD + order/inbound forms):
  - Replaced remaining MUI material layout/control usage in the approved form pages:
    - `/Users/lucas/Projects/inventory-management-app/src/pages/customer/customerForm.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/product/productForm.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/product/Variants.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/supplier/supplierForm.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/productCategory/productCategory.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/unit/Unit.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderForm.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderFormLineItemForm.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderFormHeader.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderForm.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderFormLineItemForm.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderFormHeader.tsx`
  - Added `/Users/lucas/Projects/inventory-management-app/src/components/ui/form-compat.tsx`, a shadcn-backed compatibility layer used to migrate large form pages off MUI imports with minimal behavioral churn (`Box`, `Grid`, `FormControl`, `TextField`, `Typography`, `Tooltip`, `Button`, `IconButton`, `Divider`).
  - Rewrote `/Users/lucas/Projects/inventory-management-app/src/pages/productCategory/productCategory.tsx` and `/Users/lucas/Projects/inventory-management-app/src/pages/unit/Unit.tsx` directly to shadcn/Tailwind cards/forms/lists, replacing the old MUI `Paper/List/Menu` UI with inline row actions.
  - Replaced residual MUI `Grid`/`Box` wrappers in order/inbound headers and line-item entry forms with Tailwind layout wrappers while preserving `react-hook-form` bindings and keyboard/focus refs.
- Repeat Batch 11 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manually stopped after launch confirmation.
  - Forge again spent ~30s on the renderer dev-server spinner before reporting launch completion (non-failure; observed behavior in this repo).
  - Startup smoke still shows the recurring local IndexedDB/quota lock warnings in the Electron profile after launch; app launch succeeded and this remains local profile contention noise.
- Repeat Batch 11 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-11 counts (`MUI files: 35 -> 23`, `@mui/material`: `39 -> 27`, `@mui/system`: `5 -> 3`).
  - Batch 11 milestone reached: approved CRUD/order/inbound form pages no longer import `@mui/*`.
  - Remaining MUI usage is now concentrated in app shell/home, auth, onboarding, settings/navigation shell, two detail pages, and the two line-item list pages with residual `Grid`/`Box` wrappers.
- Repeat Batch 12 completed under the existing Tasks 5.1-5.4 loop (residual core pages + app shell cleanup, non-onboarding):
  - Removed direct `@mui/*` imports from the approved residual non-onboarding pages:
    - `/Users/lucas/Projects/inventory-management-app/src/app.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/home.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/auth/Login.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/order/OrderFormLineItemList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/inboundOrder/InboundOrderFormLineItemList.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/installmentPayment/InstallmentPaymentDetail.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/supplierBill/SupplierBillDetail.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/routes/navbar.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/routes/Sidebar.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/routes/settings/index.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/routes/settings/organization/OrganizationPage.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/routes/settings/preferences/PreferencesPage.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/routes/settings/profile/ProfilePage.tsx`
  - Added `/Users/lucas/Projects/inventory-management-app/src/components/ui/icon-compat.tsx` (MUI-icon-name-compatible exports backed by `lucide-react`) to keep icon churn mechanical while removing `@mui/icons-material` imports from Batch 12 pages.
  - Expanded `/Users/lucas/Projects/inventory-management-app/src/components/ui/form-compat.tsx` to cover the remaining settings/detail-page MUI control surface (`Paper`, `Card`, `Alert`, `Chip`, `CircularProgress`, `Switch`, `FormGroup`, `FormControlLabel`, `InputLabel`, `Select`, `MenuItem`, `FormHelperText`, `Avatar`, table wrappers, `Fab`, and additional prop compatibility).
  - Rewrote `navbar`, `Sidebar`, `home`, and `settings/index` directly to shadcn/Tailwind layouts instead of routing them through the compat layer.
  - `OrganizationPage` follow-up:
    - Replaced MUI `Autocomplete` fields with native `<select>` controls (state/city).
    - Replaced local MUI confirm dialog usage with shared `/Users/lucas/Projects/inventory-management-app/src/components/DeleteConfirmationDialog.tsx`.
  - `src/app.tsx` follow-up:
    - Removed remaining global MUI theme/provider usage (`createTheme`, `ThemeProvider`) and `@mui/system/Box`.
    - App now uses plain layout wrappers; onboarding pages still on MUI will temporarily render without the previous custom MUI theme until their migration batch.
- Repeat Batch 12 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manual smoke completed and process stopped.
  - Startup smoke still emits recurring local IndexedDB lock warnings (`...IndexedDB/http_localhost_3026.../LOCK`) after launch, consistent with local dev profile contention rather than a migration regression.
  - Stopping `pnpm start` via `Ctrl+C` ends the pnpm wrapper with `ELIFECYCLE`, which is expected for an interrupted interactive dev session.
- Repeat Batch 12 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-12 counts (`MUI files: 23 -> 10`, `@mui/material`: `27 -> 10`, `@mui/icons-material`: `47 -> 7`, `@mui/material/styles`: `2 -> 0`, `@mui/system`: `3 -> 0`).
  - Batch 12 milestone reached: all remaining MUI usage in `/Users/lucas/Projects/inventory-management-app/src/` is now isolated to the onboarding flow (`src/pages/onboarding/*`).
  - Prepared the next recommended approval gate for onboarding flow migration (the final UI slice before package-level MUI cleanup/removal).
- Repeat Batch 13 completed under the existing Tasks 5.1-5.4 loop (onboarding flow migration, final UI slice):
  - Removed direct `@mui/*` imports from the onboarding flow pages:
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/InviteTeamSetup.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OnboardingComplete.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OnboardingExitDialog.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OnboardingFlow.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OnboardingRouter.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OnboardingWelcome.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OrganizationSelection.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OrganizationSetup.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/SampleDataSetup.tsx`
    - `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/TaxDataSetup.tsx`
  - Expanded `/Users/lucas/Projects/inventory-management-app/src/components/ui/form-compat.tsx` for onboarding widget coverage:
    - stepper/progress (`Stepper`, `Step`, `StepLabel`, `LinearProgress`)
    - tabs/list (`Tabs`, `Tab`, `List`, `ListItem`, `ListItemText`, `ListItemSecondaryAction`)
    - `Checkbox`
    - additional prop/sx compatibility (`Typography` variants + `paragraph`, `Button component=\"label\"`, `Alert icon`, `Chip color/variant/icon`, `FormHelperText sx`, etc.)
  - Expanded `/Users/lucas/Projects/inventory-management-app/src/components/ui/icon-compat.tsx` with onboarding icon mappings and partial `sx` support (`fontSize`, `color`, spacing) for low-churn visual parity.
  - Rewrote `/Users/lucas/Projects/inventory-management-app/src/pages/onboarding/OnboardingExitDialog.tsx` to shadcn `AlertDialog` primitives.
  - Replaced `OrganizationSetup` MUI `Autocomplete` state/city selectors with compat `Select` + `MenuItem` controls (native select behavior) to avoid introducing a new autocomplete compat layer for the final UI slice.
- Repeat Batch 13 validation (looped Task 5.2):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manual smoke completed and process stopped.
  - Startup smoke still shows recurring local IndexedDB lock warnings (`...IndexedDB/http_localhost_3026.../LOCK`) and a Clerk/url.parse deprecation warning after launch; app launch succeeded and these remain non-migration runtime noise.
  - Stopping `pnpm start` via `Ctrl+C` returns `ELIFECYCLE`, expected for an interrupted interactive dev session.
- Repeat Batch 13 inventory refresh + next approval proposal (looped Tasks 5.3-5.4):
  - Updated `/Users/lucas/Projects/inventory-management-app/openspec/changes/shadcn-migration/mui-inventory.md` with post-Batch-13 counts (`MUI files: 10 -> 0`, `@mui/material`: `10 -> 0`, `@mui/icons-material`: `7 -> 0`).
  - Final UI migration milestone reached: `/Users/lucas/Projects/inventory-management-app/src/` now has **zero direct `@mui/*` imports**.
  - Prepared the next recommended approval gate for package-level MUI cleanup/removal and final validation (dependency pruning + compat-shim rationalization).
- Task 6.1 completed (MUI decommissioning pre-check):
  - Confirmed `/Users/lucas/Projects/inventory-management-app/src/` has **zero direct `@mui/*` imports** after Batch 13 (`@mui/material`, `@mui/icons-material`, `@mui/material/styles`, `@mui/system`, MUI X all zero).
  - No approved MUI exceptions remain in runtime source code.
- Task 6.2 completed (dependency/package cleanup):
  - Removed MUI and Emotion packages from `/Users/lucas/Projects/inventory-management-app/package.json` and `/Users/lucas/Projects/inventory-management-app/pnpm-lock.yaml`:
    - `@mui/material`
    - `@mui/icons-material`
    - `@mui/x-data-grid`
    - `@mui/x-date-pickers`
    - `@emotion/react`
    - `@emotion/styled`
  - MUI theme/provider cleanup had already been completed in earlier batches (`src/app.tsx` and page migrations), so no additional theme/provider code removal was required in this task.
  - `pnpm remove` again reported ignored build scripts for `electron` / `msw`; existing workflow remained valid and startup smoke still passed afterward.
- Task 6.3 completed (final validation after dependency cleanup):
  - `pnpm exec tsc --noEmit` ✅ passes.
  - `pnpm run verify:migration` ✅ passes (`verify:core-flows`, `verify:offline-sync`).
  - `pnpm exec electron-forge package` ✅ passes.
  - `pnpm start` ✅ launches renderer dev server and Electron app (`Output Available: http://localhost:9026`, `Launched Electron app`); manual smoke completed and process stopped.
  - Observed known non-blocking runtime noise:
    - local IndexedDB lock warnings (`...IndexedDB/http_localhost_3026.../LOCK`) from local profile contention
    - Clerk/url.parse deprecation warning during startup
    - `ELIFECYCLE` when stopping `pnpm start` with `Ctrl+C` (expected for interrupted interactive dev session)
- Task 6.4 completed (final migration outcomes recorded):
  - UI migration outcome:
    - `/Users/lucas/Projects/inventory-management-app/src/` has **zero direct `@mui/*` imports**
    - MUI X (`@mui/x-data-grid`, `@mui/x-date-pickers`) fully removed from source and dependencies
  - Package cleanup outcome:
    - MUI + Emotion dependencies removed from manifest/lockfile
  - Remaining exceptions:
    - None in runtime source code (`src/`)
  - Follow-up work recommended (non-blocking):
    - Manual onboarding visual/interaction regression pass (compat-based widgets)
    - Gradual replacement/simplification of `form-compat` and `icon-compat` shims with direct shadcn/Tailwind components where long-term maintainability matters most
    - Separate lint backlog cleanup under ESLint 9 / `@typescript-eslint` 8
