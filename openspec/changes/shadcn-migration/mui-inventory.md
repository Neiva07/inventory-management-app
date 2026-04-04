# MUI Migration Inventory and Batch Plan

Generated for OpenSpec change `shadcn-migration` on `2026-02-23`.

## Scope

This inventory covers current usage of:

- `@mui/material`
- `@mui/icons-material`
- MUI X packages (`@mui/x-data-grid`, `@mui/x-date-pickers`)
- Related MUI coupling points used for migration planning (`@mui/material/styles`, `@mui/system`)

## Inventory Summary (Task 4.1)

### Counts

- Files with at least one MUI import: `63`
- `@mui/material`: `63` import statements across `62` files
- `@mui/icons-material` (subpath + barrel): `71` import statements across `28` files
- `@mui/x-data-grid`: `5` import statements across `5` files
- `@mui/x-date-pickers`: `9` import statements across `8` files
- `@mui/material/styles`: `7` import statements across `5` files (theme and styled coupling)
- `@mui/system`: `5` import statements across `5` files

### Directory / Category Breakdown

- App/root provider layer: `2` files (`src/app.tsx`, `src/home.tsx`)
- Shared components (`src/components`): `21` files
- Route shell/settings (`src/pages/routes*`): `6` files
- Onboarding flow (`src/pages/onboarding/*`): `10` files
- Feature pages/forms/lists (other `src/pages/*`): `24` files

### Highest-Frequency `@mui/material` Components (by import count)

- `Box` (47)
- `Typography` (40)
- `Button` (39)
- `Grid` (37)
- `TextField` (27)
- `Tooltip` (20)
- `Alert` (13)
- `IconButton` (13)
- `Paper` (12)
- `Card` / `CardContent` (11 each)
- `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` (10 each)
- `FormControl` (10)
- `Chip` (10)

## Detailed File Inventory (Task 4.1)

### App / Provider / Theme Coupling (special cases)

- `src/app.tsx`
  - Uses `@mui/material/styles` (`createTheme`, `ThemeProvider`)
  - Uses `@mui/x-date-pickers` providers (`LocalizationProvider`, `AdapterDateFns`)
  - Uses `@mui/system` (`Box`)
  - Contains MUI theme overrides including `MuiDataGrid`
- `src/home.tsx`
  - Uses MUI `Card`/`Typography`/layout primitives and several icons
  - Also includes hidden shadcn coexistence smoke render (already added in Phase 3)

### Shared Components (`src/components/*`)

- `src/components/CreateModeToggle.tsx`
- `src/components/CustomDataTable/index.tsx`
- `src/components/DeleteConfirmationDialog.tsx`
- `src/components/DuplicateItemDialog.tsx`
- `src/components/EnhancedAutocomplete.tsx`
- `src/components/FormActions.tsx`
- `src/components/GlobalKeyboardHelp.tsx`
- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker)
- `src/components/KeyboardFormShortcutsHelp.tsx`
- `src/components/KeyboardListHelperIcon.tsx`
- `src/components/KeyboardListPageKeyboardHelp.tsx`
- `src/components/OfflineIndicator.tsx`
- `src/components/PageTitle.tsx`
- `src/components/PaymentModal.tsx`
- `src/components/ProductUpdateModal.tsx`
- `src/components/ProductUpdateToggle.tsx`
- `src/components/PublicIdDisplay.tsx` (uses `styled` from `@mui/material/styles`)
- `src/components/SearchField.tsx`
- `src/components/TotalComissionDisplay.tsx`
- `src/components/TotalCostDisplay.tsx`
- `src/components/UpdateNotification.tsx`

### Route Shell / Navigation / Settings (`src/pages/routes/*`)

- `src/pages/routes/navbar.tsx` (high icon concentration)
- `src/pages/routes/Sidebar.tsx` (very high icon concentration + `useTheme`)
- `src/pages/routes/settings/index.tsx`
- `src/pages/routes/settings/organization/OrganizationPage.tsx`
- `src/pages/routes/settings/preferences/PreferencesPage.tsx`
- `src/pages/routes/settings/profile/ProfilePage.tsx`

### Onboarding Flow (`src/pages/onboarding/*`)

- `src/pages/onboarding/InviteTeamSetup.tsx`
- `src/pages/onboarding/OnboardingComplete.tsx`
- `src/pages/onboarding/OnboardingExitDialog.tsx`
- `src/pages/onboarding/OnboardingFlow.tsx`
- `src/pages/onboarding/OnboardingRouter.tsx`
- `src/pages/onboarding/OnboardingWelcome.tsx`
- `src/pages/onboarding/OrganizationSelection.tsx`
- `src/pages/onboarding/OrganizationSetup.tsx`
- `src/pages/onboarding/SampleDataSetup.tsx`
- `src/pages/onboarding/TaxDataSetup.tsx`

### Feature Pages / Forms / Lists (other `src/pages/*`)

- `src/pages/auth/Login.tsx`
- `src/pages/customer/customerForm.tsx`
- `src/pages/customer/customersList.tsx` (MUI X DataGrid search icon)
- `src/pages/inboundOrder/InboundOrderForm.tsx` (`@mui/system`)
- `src/pages/inboundOrder/InboundOrderFormHeader.tsx` (MUI X DatePicker)
- `src/pages/inboundOrder/InboundOrderFormLineItemForm.tsx`
- `src/pages/inboundOrder/InboundOrderFormLineItemList.tsx` (`@mui/system` + MUI X DataGrid)
- `src/pages/inboundOrder/InboundOrderList.tsx` (MUI X DatePicker)
- `src/pages/installmentPayment/InstallmentPaymentDetail.tsx`
- `src/pages/installmentPayment/InstallmentPaymentList.tsx` (MUI X DatePicker)
- `src/pages/order/OrderForm.tsx` (`@mui/system`)
- `src/pages/order/OrderFormHeader.tsx` (MUI X DatePicker)
- `src/pages/order/OrderFormLineItemForm.tsx`
- `src/pages/order/OrderFormLineItemList.tsx` (`@mui/system` + MUI X DataGrid)
- `src/pages/order/OrderList.tsx` (MUI X DatePicker)
- `src/pages/product/productForm.tsx`
- `src/pages/product/ProductList.tsx` (MUI X DataGrid)
- `src/pages/product/Variants.tsx`
- `src/pages/productCategory/productCategory.tsx`
- `src/pages/supplier/supplierForm.tsx`
- `src/pages/supplier/supplierList.tsx` (MUI X DataGrid search icon)
- `src/pages/supplierBill/SupplierBillDetail.tsx`
- `src/pages/supplierBill/SupplierBillList.tsx` (MUI X DatePicker)
- `src/pages/unit/Unit.tsx`

## Special Cases and Migration Constraints (Task 4.1)

### MUI X DataGrid (`@mui/x-data-grid`) - high complexity, defer from first batch

Files:

- `src/pages/customer/customersList.tsx`
- `src/pages/product/ProductList.tsx`
- `src/pages/supplier/supplierList.tsx`
- `src/pages/order/OrderFormLineItemList.tsx`
- `src/pages/inboundOrder/InboundOrderFormLineItemList.tsx`

Notes:

- Uses `DataGrid` types and utility exports (`GridColDef`, `GridCellParams`, `GridRowIdGetter`, `GridDeleteIcon`).
- `src/app.tsx` includes theme overrides for `MuiDataGrid`, which tightly couples table visuals to MUI theme.
- Should be treated as a dedicated later batch (or alternate grid library decision), not mixed into initial primitive migrations.

### MUI X Date Pickers (`@mui/x-date-pickers`) - high complexity, defer from first batch

Files:

- `src/app.tsx` (`LocalizationProvider`, `AdapterDateFns`)
- `src/components/InstallmentPlanModal.tsx`
- `src/pages/inboundOrder/InboundOrderFormHeader.tsx`
- `src/pages/inboundOrder/InboundOrderList.tsx`
- `src/pages/installmentPayment/InstallmentPaymentList.tsx`
- `src/pages/order/OrderFormHeader.tsx`
- `src/pages/order/OrderList.tsx`
- `src/pages/supplierBill/SupplierBillList.tsx`

Notes:

- Date pickers depend on global `LocalizationProvider` in `src/app.tsx`.
- Replacement options need an explicit decision (keep MUI X temporarily vs alternate picker library vs custom calendar wrappers).

### Theme / Styling Coupling (`@mui/material/styles`, `@mui/system`)

- `src/app.tsx`: global `ThemeProvider`, `createTheme`, component overrides (including `MuiDataGrid`)
- `src/pages/routes/Sidebar.tsx`: `useTheme`
- `src/components/PublicIdDisplay.tsx`: `styled(...)` usage with theme tokens
- `src/pages/order/*` and `src/pages/inboundOrder/*`: `@mui/system` `Box` imports in form/line-item flows

### Icon Concentration / Navigation Shell

- `src/pages/routes/Sidebar.tsx` imports ~20 icon subpaths (largest concentration)
- `src/pages/routes/navbar.tsx` imports ~11 icon subpaths
- Navigation/icon-heavy files are good candidates for a dedicated shell/navigation batch after shared primitives stabilize

## Proposed Migration Batches (Task 4.2)

Recommended order keeps shared/core replacements first and defers MUI X-heavy work:

1. **Batch 1 (Shared Core Wrappers / Displays / Actions)**
   - Shared components with high reuse and low-to-medium behavior risk
   - No MUI X (`DataGrid`, `DatePicker`) replacements
2. **Batch 2 (Shared Dialogs + Keyboard Help + Toggle/Modal primitives)**
   - Dialog-heavy shared components and toggles that require shadcn dialog/switch primitives
3. **Batch 3 (App Shell + Navigation + Home)**
   - `Navbar`, `Sidebar`, `home.tsx`, route/settings shell layout pieces
4. **Batch 4 (Form/List pages without MUI X replacement)**
   - Regular forms and pages that mainly use Button/Grid/TextField/Box/Typography
5. **Batch 5 (Date Picker Strategy + Migration)**
   - MUI X DatePicker decisions and migrations (including provider treatment in `src/app.tsx`)
6. **Batch 6 (Data Grid Strategy + Migration + Theme cleanup)**
   - MUI X DataGrid pages and `MuiDataGrid` theme override removal/refactor
7. **Batch 7 (Final MUI removal / exceptions)**
   - Remove unused MUI packages, document any approved exceptions

## First Proposed Batch: Scope, Mapping, and Risks (Task 4.3)

### Batch 1 Scope (recommended)

Focus on shared/core components that unlock broad page coverage without touching MUI X:

- `src/components/PageTitle.tsx`
- `src/components/SearchField.tsx`
- `src/components/FormActions.tsx`
- `src/components/DeleteConfirmationDialog.tsx`
- `src/components/DuplicateItemDialog.tsx`
- `src/components/OfflineIndicator.tsx`
- `src/components/TotalCostDisplay.tsx`
- `src/components/TotalComissionDisplay.tsx`

Why this batch:

- High leverage shared components:
  - `PageTitle` is used across many list/detail/form pages.
  - `DeleteConfirmationDialog` is reused broadly across CRUD flows.
  - `FormActions` is reused across core form headers.
- Avoids immediate `DataGrid` / `DatePicker` replacement decisions.
- Stays inside shared component layer, matching the requested approval-gated workflow.

### Batch 1 Replacement Mapping

#### `src/components/PageTitle.tsx`

- Current MUI usage: `Box`, `Typography`
- Proposed replacement:
  - semantic `<div>`/`<h1>` with Tailwind classes
  - keep `ListPageKeyboardHelperIcon` integration unchanged for this batch (coexistence allowed)
- Required new `components/ui` additions: none (can use plain markup + existing Tailwind tokens)
- Risk: low (layout/typography parity only)

#### `src/components/SearchField.tsx`

- Current MUI usage: `TextField`, `InputAdornment`, `SearchIcon`
- Proposed replacement:
  - `components/ui/input` + inline leading icon wrapper
  - `lucide-react` `Search` icon
- Required new `components/ui` additions: optional `InputWithIcon` helper (or keep local markup)
- Risk: low-medium (spacing/focus ring parity and IME behavior)

#### `src/components/FormActions.tsx`

- Current MUI usage: `Box`, `Stack`, `Tooltip`, `IconButton`, `Button`, icons
- Proposed replacement:
  - Tailwind layout wrappers (`div`, flex gap)
  - `components/ui/button` (`outline`, `destructive`, `ghost/icon`)
  - shadcn `Tooltip`
  - `lucide-react` icons (`Trash2`, `Ban`, `CheckCircle2`, `HelpCircle`, `ArrowLeft`)
- Required new `components/ui` additions:
  - `tooltip`
  - optional button variants (`warning`, `success`) or class-based styling in `FormActions`
- Risk: medium (button color semantics and tooltip behavior parity)

#### `src/components/DeleteConfirmationDialog.tsx`

- Current MUI usage: `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `Typography`
- Proposed replacement:
  - shadcn `AlertDialog` (destructive confirm flow fits better than generic `Dialog`)
  - `components/ui/button`
- Required new `components/ui` additions:
  - `alert-dialog`
- Risk: medium (focus restore differences, `disableRestoreFocus` parity, keyboard trap behavior)

#### `src/components/DuplicateItemDialog.tsx`

- Current MUI usage: dialog suite + `Box` + `Typography` + buttons
- Proposed replacement:
  - shadcn `Dialog` (not destructive-only; needs richer content)
  - `components/ui/button`
- Required new `components/ui` additions:
  - `dialog`
- Risk: medium (focus behavior, content layout parity, warning-style action variant)

#### `src/components/OfflineIndicator.tsx`

- Current MUI usage: `Chip`, `Tooltip`, icons
- Proposed replacement:
  - `components/ui/badge` (or dedicated status pill wrapper) + fixed-position container
  - shadcn `Tooltip`
  - `lucide-react` icons (`Wifi`, `WifiOff`)
- Required new `components/ui` additions:
  - `tooltip` (shared with `FormActions`)
- Risk: low (styling parity only; online/offline state logic unchanged)

#### `src/components/TotalCostDisplay.tsx`

- Current MUI usage: `Box`, `Typography`, `AttachMoney`
- Proposed replacement:
  - Tailwind layout wrappers + semantic text
  - `lucide-react` currency icon (or approved substitute)
- Required new `components/ui` additions: none
- Risk: low (display-only, animation preserved via existing React state)

#### `src/components/TotalComissionDisplay.tsx`

- Current MUI usage: `Box`, `Typography`, `PercentIcon`
- Proposed replacement:
  - Tailwind layout wrappers + semantic text
  - `lucide-react` `Percent` icon
- Required new `components/ui` additions: none
- Risk: low (display-only, animation preserved)

### MUI X Treatment for Batch 1 (explicit)

- **Out of scope** for Batch 1:
  - `@mui/x-data-grid`
  - `@mui/x-date-pickers`
  - `src/app.tsx` `LocalizationProvider` and `MuiDataGrid` theme overrides
- Rationale:
  - These require separate library/architecture decisions and broader page validation.

### Batch 1 Validation Focus (when approved)

- Compile/typecheck (`pnpm exec tsc --noEmit`)
- App startup smoke (`pnpm start`)
- CRUD flows that use shared confirmations/actions:
  - product, supplier, customer forms/lists
  - order and inbound order form headers
- Verify destructive dialogs and keyboard interactions remain equivalent (Esc/Enter/focus)

## Batch 1 Execution Update (Task 5.3)

Batch 1 was implemented by replacing internal MUI imports/usages with shadcn/core/Tailwind in the approved shared components while keeping their exported component APIs stable.

### Batch 1 Components Migrated

- `src/components/PageTitle.tsx`
- `src/components/SearchField.tsx`
- `src/components/FormActions.tsx`
- `src/components/DeleteConfirmationDialog.tsx`
- `src/components/DuplicateItemDialog.tsx`
- `src/components/OfflineIndicator.tsx`
- `src/components/TotalCostDisplay.tsx`
- `src/components/TotalComissionDisplay.tsx`

### New shadcn primitives added for Batch 1

- `src/components/ui/tooltip.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/alert-dialog.tsx`

### Post-Batch 1 Inventory Snapshot

Compared with the pre-Batch-1 inventory:

- Files with at least one MUI import: `63 -> 55` (`-8`)
- `@mui/material` import statements: `63 -> 59` (`-4`)
- `@mui/icons-material` import statements (subpath + barrel): `71 -> 62` (`-9`)
- `@mui/material/styles` import statements: `7 -> 3` (`-4`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: unchanged (`9`)
- `@mui/system`: unchanged (`5`)

### Remaining Shared Components Still Using MUI (post-Batch 1)

- `src/components/CreateModeToggle.tsx`
- `src/components/CustomDataTable/index.tsx`
- `src/components/EnhancedAutocomplete.tsx`
- `src/components/GlobalKeyboardHelp.tsx`
- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker)
- `src/components/KeyboardFormShortcutsHelp.tsx`
- `src/components/KeyboardListHelperIcon.tsx`
- `src/components/KeyboardListPageKeyboardHelp.tsx`
- `src/components/PaymentModal.tsx`
- `src/components/ProductUpdateModal.tsx`
- `src/components/ProductUpdateToggle.tsx`
- `src/components/PublicIdDisplay.tsx`
- `src/components/UpdateNotification.tsx`

## Next Proposed Batch (Task 5.4): Keyboard Help + Toggles

Recommended next batch scope (still avoiding MUI X and complex autocomplete/table replacements):

- `src/components/KeyboardListHelperIcon.tsx`
- `src/components/KeyboardListPageKeyboardHelp.tsx`
- `src/components/KeyboardFormShortcutsHelp.tsx`
- `src/components/GlobalKeyboardHelp.tsx`
- `src/components/CreateModeToggle.tsx`
- `src/components/ProductUpdateToggle.tsx`

### Why this batch next

- Reuses primitives already added in Batch 1 (`Button`, `Tooltip`, `Dialog`, `Badge`) and likely only adds:
  - `switch`
  - optional `label`
- Keeps work in the shared component layer
- Avoids `@mui/x-date-pickers` (`InstallmentPlanModal`) and `Autocomplete`/table complexity (`EnhancedAutocomplete`, `CustomDataTable`)

### Key Risks / Decisions for Batch 2

- Keyboard-help dialogs are large and text-dense, so spacing/scroll behavior parity matters.
- `KeyboardListHelperIcon` currently exposes MUI-style `size`/`color` props (`small|medium|large`, `primary|secondary|default`); the replacement should preserve those props even if implemented via class mapping.
- Toggle components (`CreateModeToggle`, `ProductUpdateToggle`) should preserve existing keyboard shortcut affordances and controlled behavior.

## Batch 2 Execution Update (repeat of Tasks 5.1-5.4)

Batch 2 was implemented by replacing internal MUI imports/usages with shadcn/core/Tailwind in the approved keyboard-help and toggle shared components, while keeping exported component APIs stable.

### Batch 2 Components Migrated

- `src/components/KeyboardListHelperIcon.tsx`
- `src/components/KeyboardListPageKeyboardHelp.tsx`
- `src/components/KeyboardFormShortcutsHelp.tsx`
- `src/components/GlobalKeyboardHelp.tsx`
- `src/components/CreateModeToggle.tsx`
- `src/components/ProductUpdateToggle.tsx`

### New shadcn primitives added for Batch 2

- `src/components/ui/switch.tsx`

### Post-Batch 2 Inventory Snapshot

Compared with the post-Batch-1 snapshot:

- Files with at least one MUI import: `55 -> 49` (`-6`)
- `@mui/material` import statements: `59 -> 53` (`-6`)
- `@mui/icons-material` import statements (subpath + barrel): `62 -> 58` (`-4`)
- `@mui/material/styles`: unchanged (`3`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: unchanged (`9`)
- `@mui/system`: unchanged (`5`)

### Remaining Shared Components Still Using MUI (post-Batch 2)

- `src/components/CustomDataTable/index.tsx`
- `src/components/EnhancedAutocomplete.tsx`
- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker)
- `src/components/PaymentModal.tsx`
- `src/components/ProductUpdateModal.tsx`
- `src/components/PublicIdDisplay.tsx`
- `src/components/UpdateNotification.tsx`

## Next Proposed Batch (post-Batch 2): Shared Dialog Forms + Public ID Display

Recommended next batch scope (still excluding table/autocomplete complexity and MUI X):

- `src/components/PublicIdDisplay.tsx`
- `src/components/PaymentModal.tsx`
- `src/components/ProductUpdateModal.tsx`

### Why this batch next

- Continues shrinking shared-component MUI usage without touching `DataGrid`, `DatePicker`, or autocomplete/table wrappers.
- Reuses dialog primitives already added in Batches 1-2 and mainly expands form-oriented shadcn primitives/wrappers (`alert`, `label`, `select`, `separator` if needed).
- Keeps change scope in shared components, preserving the incremental migration pattern.

### Out of Scope for next batch (explicit)

- `src/components/InstallmentPlanModal.tsx` (depends on `@mui/x-date-pickers`)
- `src/components/EnhancedAutocomplete.tsx` (high-complexity autocomplete behavior)
- `src/components/CustomDataTable/index.tsx` (table wrapper complexity / likely tied to broader grid strategy)
- `src/components/UpdateNotification.tsx` (snackbar/toast strategy decision; may require root-level toast integration changes)

### Key Risks / Decisions for the next batch

- `PaymentModal` uses select, alerts, and loading affordances; replacement should preserve validation feedback and disabled/loading behavior.
- `ProductUpdateModal` is a large, data-dense editing dialog with many numeric inputs and visual diff indicators; layout/scroll usability and focus behavior need verification.
- `PublicIdDisplay` currently uses `@mui/material/styles` `styled(...)`; replacement should preserve copy-to-clipboard behavior and visual affordance without relying on MUI theme tokens.

## Batch 3 Execution Update (repeat of Tasks 5.1-5.4)

Batch 3 was implemented by replacing internal MUI imports/usages with shadcn/core/Tailwind in the approved shared dialog-form components and public ID display, while keeping exported component APIs stable.

### Batch 3 Components Migrated

- `src/components/PublicIdDisplay.tsx`
- `src/components/PaymentModal.tsx`
- `src/components/ProductUpdateModal.tsx`

### Batch 3 Implementation Notes

- No new shadcn primitives were required; Batch 3 reused the dialog/button/input/tooltip primitives added in earlier batches.
- `PublicIdDisplay` no longer depends on `@mui/material/styles` `styled(...)`; it now uses Tailwind styling and shadcn `Tooltip`.
- `PaymentModal` and `ProductUpdateModal` now use shadcn `Dialog` primitives plus Tailwind/native form controls (including a native `<select>` in `PaymentModal`).

### Post-Batch 3 Inventory Snapshot

Compared with the post-Batch-2 snapshot:

- Files with at least one MUI import: `49 -> 46` (`-3`)
- `@mui/material` import statements: `53 -> 50` (`-3`)
- `@mui/icons-material` import statements (subpath + barrel): `58 -> 57` (`-1`)
- `@mui/material/styles`: `3 -> 2` (`-1`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: unchanged (`9`)
- `@mui/system`: unchanged (`5`)

### Remaining Shared Components Still Using MUI (post-Batch 3)

- `src/components/CustomDataTable/index.tsx`
- `src/components/EnhancedAutocomplete.tsx`
- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker)
- `src/components/UpdateNotification.tsx`

## Next Proposed Batch (post-Batch 3): Update Notification (toast strategy) [Recommended]

Recommended next batch scope:

- `src/components/UpdateNotification.tsx`

### Why this batch next

- It is the only remaining shared MUI component that is not tightly coupled to `DataGrid` or `DatePicker`.
- It lets us define the app's notification/toast pattern before broader page-level migrations.
- It keeps the next approval scope small while closing out another shared component.

### Out of Scope for next batch (explicit)

- `src/components/InstallmentPlanModal.tsx` (depends on `@mui/x-date-pickers`)
- `src/components/EnhancedAutocomplete.tsx` (autocomplete behavior parity is high-risk)
- `src/components/CustomDataTable/index.tsx` (table wrapper complexity and grid strategy coupling)

### Key Risks / Decisions for the next batch

- `UpdateNotification` currently uses stacked `Snackbar` + `Alert` combinations; the replacement should preserve update/download/install action flows and non-blocking visibility.
- We need to decide whether to:
  - use shadcn `Toast` primitives with a provider added near the app root, or
  - keep a local fixed-position notification implementation inside the component for now.
- Main-process update event subscriptions should remain stable (no duplicate listeners or lifecycle regressions).

## Batch 4 Execution Update (repeat of Tasks 5.1-5.4)

Batch 4 was implemented by replacing internal MUI `Snackbar`/`Alert` usage in the approved update notification component with a local shadcn/core/Tailwind notification stack.

### Batch 4 Components Migrated

- `src/components/UpdateNotification.tsx`

### Batch 4 Implementation Notes

- No new shadcn primitives or dependencies were added.
- The component now renders fixed-position notification cards (Tailwind-styled) using `components/ui/button` for actions and `lucide-react` icons.
- Update/download/install/error flows are preserved, including the explicit dismiss behavior for error notifications.

### Post-Batch 4 Inventory Snapshot

Compared with the post-Batch-3 snapshot:

- Files with at least one MUI import: `46 -> 45` (`-1`)
- `@mui/material` import statements: `50 -> 49` (`-1`)
- `@mui/icons-material` import statements (subpath + barrel): unchanged (`57`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: unchanged (`9`)
- `@mui/system`: unchanged (`5`)

### Remaining Shared Components Still Using MUI (post-Batch 4)

- `src/components/CustomDataTable/index.tsx`
- `src/components/EnhancedAutocomplete.tsx`
- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker)

## Next Proposed Batch (post-Batch 4): `EnhancedAutocomplete` only [Recommended]

Recommended next batch scope:

- `src/components/EnhancedAutocomplete.tsx`

### Why this batch next

- It is a high-leverage shared wrapper used across many forms/lists (customer, supplier, product, order, inbound order, supplier bill, installment payment screens).
- It is the last remaining shared component that is not directly coupled to `DataGrid` table rendering or the installment planning UI.
- Isolating it as a single-component batch keeps the review/approval scope manageable because behavior parity risk is high (keyboard navigation, highlight selection, generic typing).

### Out of Scope for next batch (explicit)

- `src/components/CustomDataTable/index.tsx` (table/pagination/focus navigation wrapper complexity)
- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker dependency and date-picker strategy decision)

### Key Risks / Decisions for the next batch

- `EnhancedAutocomplete` currently wraps MUI `Autocomplete` generics and keyboard behavior; replacing it likely requires a custom combobox pattern (`Popover` + `Command`/listbox primitives) and careful behavior parity checks.
- The existing `useAutocompleteKeyboard` hook integration must continue to support next/previous field navigation and selection behavior.
- The wrapper API should remain stable so calling pages do not need immediate rewrites.

## Batch 5 Execution Update (repeat of Tasks 5.1-5.4)

Batch 5 was implemented by replacing the shared `EnhancedAutocomplete` MUI wrapper with a local generic combobox/listbox implementation built with shadcn/core/Tailwind primitives while preserving the wrapper's caller-facing API used throughout the app.

### Batch 5 Components Migrated

- `src/components/EnhancedAutocomplete.tsx`

### Batch 5 Implementation Notes

- Removed dependency on MUI `Autocomplete`/`TextField` types and runtime components from the shared wrapper.
- Implemented a local generic combobox/listbox with:
  - `components/ui/input`
  - Tailwind listbox/dropdown styling
  - existing `useAutocompleteKeyboard` hook integration for field navigation and selection shortcuts
- Preserved key wrapper behaviors used by call sites:
  - single-select and multi-select modes
  - `getOptionLabel`
  - `isOptionEqualToValue`
  - `renderTags` (rendered as a selected-summary region)
  - `onNextField` / `onPreviousField`
  - `onOpen` / `onClose` / `onChange`
- Known implementation difference:
  - The replacement is a local listbox/combobox (not MUI's full-featured `Autocomplete`), so popup positioning/virtualization and some edge-case interaction behaviors differ. Manual UI verification is recommended on high-traffic forms/lists.

### Post-Batch 5 Inventory Snapshot

Compared with the post-Batch-4 snapshot:

- Files with at least one MUI import: `45 -> 44` (`-1`)
- `@mui/material` import statements: `49 -> 48` (`-1`)
- `@mui/icons-material` import statements (subpath + barrel): unchanged (`57`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: unchanged (`9`)
- `@mui/system`: unchanged (`5`)

### Remaining Shared Components Still Using MUI (post-Batch 5)

- `src/components/CustomDataTable/index.tsx`
- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker)

## Next Proposed Batch (post-Batch 5): `CustomDataTable` only [Recommended]

Recommended next batch scope:

- `src/components/CustomDataTable/index.tsx`

### Why this batch next

- It is the last high-leverage shared wrapper not blocked by the date-picker strategy decision.
- Many list pages depend on it, so migrating it unlocks broad MUI reduction without touching page-level `DataGrid` code yet.
- Keeping it isolated as a single batch makes keyboard/focus/pagination regression review manageable.

### Out of Scope for next batch (explicit)

- `src/components/InstallmentPlanModal.tsx` (depends on `@mui/x-date-pickers` and should be aligned with the date-picker strategy batch)

### Key Risks / Decisions for the next batch

- `CustomDataTable` has custom keyboard navigation, row focus restoration, selection behavior, pagination, and loading/empty states; these need behavior-parity validation across list screens.
- The current implementation uses MUI table primitives and theme tokens (`useTheme`); the replacement must preserve focus/selection affordances and sticky header behavior without relying on MUI theme context.
- Pagination UI can be migrated either to native controls + shadcn buttons/selects or a new shared table pagination wrapper; choose the smallest change that preserves current flows.

## Batch 6 Execution Update (repeat of Tasks 5.1-5.4)

Batch 6 was implemented by replacing the shared `CustomDataTable` MUI table wrapper with a TanStack Table + shadcn table primitive implementation while preserving the existing wrapper API used by list pages.

### Batch 6 Components Migrated

- `src/components/CustomDataTable/index.tsx`

### Batch 6 Supporting UI Additions / Dependency Changes

- Added shadcn `table` primitive to the project:
  - `src/components/ui/table.tsx`
  - exported via `src/components/ui/index.ts`
- Added dependency:
  - `@tanstack/react-table`

### Batch 6 Implementation Notes

- `CustomDataTable` now uses `@tanstack/react-table` (`useReactTable`, `getCoreRowModel`, `flexRender`) for row/header modeling.
- Replaced MUI `Table`, `TablePagination`, `Paper`, and loading UI with shadcn/core/Tailwind equivalents:
  - shadcn table primitives (`TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`)
  - shadcn `Button` + native `<select>` for pagination controls
  - `lucide-react` loading and pagination icons
- Preserved wrapper behaviors/API relied on by list pages:
  - row selection callbacks / row click / row double-click
  - keyboard navigation integration via `useTableNavigation`
  - `restoreFocusToSelectedRow` ref method
  - `onFocusFirstRow` and focus restoration behavior
  - external/manual pagination props (`page`, `pageSize`, `totalCount`, callbacks)
- shadcn generator note:
  - Running `pnpm dlx shadcn@latest add table` generated `table.tsx` in `node_modules/src/components/ui/table.tsx` in this repo; the file was manually relocated into `src/components/ui/table.tsx` and adjusted for project import paths.

### Post-Batch 6 Inventory Snapshot

Compared with the post-Batch-5 snapshot:

- Files with at least one MUI import: `44 -> 43` (`-1`)
- `@mui/material` import statements: `48 -> 47` (`-1`)
- `@mui/icons-material` import statements (subpath + barrel): unchanged (`57`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: unchanged (`9`)
- `@mui/system`: unchanged (`5`)

### Remaining Shared Components Still Using MUI (post-Batch 6)

- `src/components/InstallmentPlanModal.tsx` (MUI X DatePicker)

## Next Proposed Batch (post-Batch 6): `InstallmentPlanModal` (DatePicker Strategy Gate)

Only remaining shared component with MUI coupling:

- `src/components/InstallmentPlanModal.tsx`

### Why this is a strategy gate

- The modal mixes several MUI material primitives **and** `@mui/x-date-pickers` (`DatePicker`) in both the form header and per-row installment table.
- Replacing it cleanly requires deciding whether to:
  - fully migrate date picking to shadcn-compatible primitives now, or
  - keep MUI X date pickers temporarily while removing MUI material wrappers/layout around them.

### Key Risks / Decisions for the next batch

- Date editing parity is central to the installment planner (start date + per-installment due dates), so keyboard/date parsing behavior differences can affect core order flow logic.
- The modal also includes dense table-like editing UI; replacing both layout and date controls in one pass increases regression risk.
- This component should be aligned with the broader date-picker strategy for page-level `@mui/x-date-pickers` usage.

## Batch 7 Execution Update (repeat of Tasks 5.1-5.4)

Batch 7 was implemented by fully replacing `InstallmentPlanModal` (including MUI X `DatePicker`) with shadcn/core/Tailwind UI and shadcn-style date pickers built from `Popover` + `Calendar`.

### Batch 7 Components Migrated

- `src/components/InstallmentPlanModal.tsx`

### Batch 7 Supporting UI Additions / Dependency Changes

- Added shadcn date-picker building blocks to the project:
  - `src/components/ui/popover.tsx`
  - `src/components/ui/calendar.tsx`
  - exported via `src/components/ui/index.ts`
- Added dependencies used by the date picker composition:
  - `@radix-ui/react-popover`
  - `react-day-picker`
- shadcn generator note:
  - `pnpm dlx shadcn@latest add popover calendar` generated files under `node_modules/src/components/ui/*` in this repo; `popover.tsx` and `calendar.tsx` were manually relocated/ported into `src/components/ui/` and adjusted for project import paths.

### Batch 7 Implementation Notes

- Replaced MUI `Dialog`, layout/form controls, MUI tables, and MUI X `DatePicker` usage in `InstallmentPlanModal` with:
  - shadcn `Dialog`, `Button`, `Input`, `Table`, `Popover`, `Calendar`
  - Tailwind/native `<select>` controls for interval/payment-method fields
  - local `DateField` wrappers for start date and per-installment due date editing
- Preserved installment planning business logic and submitted payload shape:
  - row regeneration based on interval/unit/start date
  - per-row locking behavior when users edit due date / amount / payment method
  - `plannedPayments` payload still resolves payment method `{ id, label }`
- Known implementation difference:
  - Date entry now uses calendar popovers (selection-first UX) instead of MUI X text-input-style date pickers; manual flow checks are recommended for installment planning screens.

### Post-Batch 7 Inventory Snapshot

Compared with the post-Batch-6 snapshot:

- Files with at least one MUI import: `43 -> 42` (`-1`)
- `@mui/material` import statements: `47 -> 46` (`-1`)
- `@mui/icons-material` import statements (subpath + barrel): unchanged (`57`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: `9 -> 8` (`-1`)
- `@mui/system`: unchanged (`5`)

### Remaining Shared Components Still Using MUI (post-Batch 7)

- None. `src/components/*` no longer imports `@mui/*`.

## Next Proposed Batch (post-Batch 7): Page-Level Date Picker Migration + Provider Cleanup [Recommended]

Recommended next batch scope (page-level `@mui/x-date-pickers` usage + root provider coupling):

- `src/app.tsx` (MUI `LocalizationProvider` / `AdapterDateFns` coupling)
- `src/pages/inboundOrder/InboundOrderFormHeader.tsx`
- `src/pages/inboundOrder/InboundOrderList.tsx`
- `src/pages/installmentPayment/InstallmentPaymentList.tsx`
- `src/pages/order/OrderFormHeader.tsx`
- `src/pages/order/OrderList.tsx`
- `src/pages/supplierBill/SupplierBillList.tsx`

### Why this batch next

- It is the smallest coherent follow-up to Batch 7: remaining `@mui/x-date-pickers` usage is now only page-level screens plus the app-level provider.
- Completing this batch unlocks removal of MUI date-picker provider wiring in `src/app.tsx` and reduces MUI X dependency surface before the DataGrid strategy batch.
- The shared component date-picker pattern (`Popover` + `Calendar`) is now established and can be reused consistently.

### Out of Scope for next batch (explicit)

- `@mui/x-data-grid` pages and related grid strategy work
- Navigation/theme cleanup unrelated to date picker provider removal

### Key Risks / Decisions for the next batch

- Page-level date filters/forms may rely on text-entry parsing behavior from MUI X pickers; replacing them with popover calendars can change keyboard workflows.
- `src/app.tsx` currently combines MUI theme/provider responsibilities (including other MUI concerns), so date-picker provider cleanup must avoid breaking still-MUI pages.
- Some list screens may expect quick date range input interactions; we may need range-picker composition or paired start/end date fields rather than a simple single-date picker.

## Batch 8 Execution Update (repeat of Tasks 5.1-5.4)

Batch 8 was implemented by replacing the remaining page-level MUI X `DatePicker` usage with shadcn-style `Popover` + `Calendar` fields and removing the app-level MUI date-picker provider wrapper from `src/app.tsx`.

### Batch 8 Files Migrated

- `src/app.tsx` (removed `LocalizationProvider` / `AdapterDateFns` wrapper)
- `src/pages/inboundOrder/InboundOrderFormHeader.tsx`
- `src/pages/inboundOrder/InboundOrderList.tsx`
- `src/pages/installmentPayment/InstallmentPaymentList.tsx`
- `src/pages/order/OrderFormHeader.tsx`
- `src/pages/order/OrderList.tsx`
- `src/pages/supplierBill/SupplierBillList.tsx`

### Batch 8 Supporting UI Additions

- Added reusable shadcn-style date field wrapper:
  - `src/components/ui/date-picker-field.tsx`
  - exported via `src/components/ui/index.ts`
- `DatePickerField` preserves list/form focus navigation compatibility by rendering a real `<input>` trigger (read-only) while using `Popover` + `Calendar` for selection.

### Batch 8 Implementation Notes

- Replaced page-level MUI X `DatePicker` components with `DatePickerField` in:
  - list filters (`startDate`, `endDate`) for orders, inbound orders, installment payments, and supplier bills
  - form header date fields (`orderDate`, `dueDate`) for order and inbound order forms
- Preserved date state semantics (`Date | null`) and existing filter/query behavior.
- Enabled `allowClear` in list filter date fields for practical filter reset behavior (keyboard `Backspace/Delete` on focused field and popover clear action).
- Removed `@mui/x-date-pickers` provider coupling from `src/app.tsx`:
  - `LocalizationProvider`
  - `AdapterDateFns`
  - `adapterLocale={ptBRDateFns}`
- Type-system compatibility note:
  - `react-day-picker@9` locale typing conflicted with the `date-fns` locale export under the repo's current TypeScript module resolution, so `DatePickerField` applies a narrow cast when passing `pt-BR` locale into the shadcn `Calendar`.

### Post-Batch 8 Inventory Snapshot

Compared with the post-Batch-7 snapshot:

- Files with at least one MUI import: unchanged (`42`)
- `@mui/material` import statements: unchanged (`46`)
- `@mui/icons-material` import statements (subpath + barrel): unchanged (`57`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: unchanged (`5`)
- `@mui/x-date-pickers`: `8 -> 0` (`-8`)
- `@mui/system`: unchanged (`5`)

### Date Picker Migration Milestone (post-Batch 8)

- `@mui/x-date-pickers` imports in `src/`: **none**
- App-level MUI date-picker provider wrapper in `src/app.tsx`: **removed**

## Next Proposed Batch (post-Batch 8): DataGrid Strategy + First Migration Slice [Recommended]

Recommended next batch scope (MUI X DataGrid strategy and the pages tightly coupled to it):

- `src/app.tsx` (`MuiDataGrid` theme override cleanup/refactor planning)
- `src/pages/customer/customersList.tsx`
- `src/pages/product/ProductList.tsx`
- `src/pages/supplier/supplierList.tsx`
- `src/pages/order/OrderFormLineItemList.tsx`
- `src/pages/inboundOrder/InboundOrderFormLineItemList.tsx`

### Why this batch next

- `@mui/x-date-pickers` is now fully removed from `src/`, so the remaining major MUI X blocker is `@mui/x-data-grid`.
- These five files are the complete current `@mui/x-data-grid` usage set, and `src/app.tsx` still contains `MuiDataGrid` theme overrides.
- Resolving the DataGrid strategy is the highest-leverage step before broader MUI decommissioning (Task 6).

### Out of Scope for next batch (explicit)

- General page-form/layout migrations not tied to `DataGrid`
- Final MUI dependency removal / theme decommissioning beyond DataGrid-specific cleanup

### Key Risks / Decisions for the next batch

- Decide whether to:
  - keep MUI X `DataGrid` temporarily and defer replacement, or
  - migrate to a shared TanStack-based grid/table pattern (likely extending `CustomDataTable`) for these screens.
- `OrderFormLineItemList` and `InboundOrderFormLineItemList` are editing-heavy tables; behavior parity (keyboard navigation, inline actions, row selection) is riskier than list-only grids.
- `src/app.tsx` `MuiDataGrid` theme overrides cannot be removed until all MUI X grid consumers are migrated or explicitly kept as an exception.

## Batch 9 Execution Update (repeat of Tasks 5.1-5.4)

Batch 9 was implemented by eliminating the remaining `@mui/x-data-grid` usage in `src/`:

- migrating the two line-item editable grids to the existing TanStack/shadcn `CustomDataTable`
- removing `GridSearchIcon` imports from list pages (those pages were already using `CustomDataTable`)
- removing `MuiDataGrid` theme override coupling from `src/app.tsx`

### Batch 9 Files Migrated / Updated

- `src/app.tsx` (removed `MuiDataGrid` theme overrides and TS augmentation used for the custom `MuiDataGrid` key)
- `src/pages/customer/customersList.tsx` (`GridSearchIcon` -> `lucide-react` `Search`)
- `src/pages/product/ProductList.tsx` (`GridSearchIcon` -> `lucide-react` `Search`)
- `src/pages/supplier/supplierList.tsx` (`GridSearchIcon` -> `lucide-react` `Search`)
- `src/pages/order/OrderFormLineItemList.tsx` (`DataGrid` -> `CustomDataTable`)
- `src/pages/inboundOrder/InboundOrderFormLineItemList.tsx` (`DataGrid` -> `CustomDataTable`)

### Batch 9 Implementation Notes

- `OrderFormLineItemList` and `InboundOrderFormLineItemList` now use `CustomDataTable` with:
  - client-side pagination implemented in the component (`page`, `pageSize`, `slice(...)`)
  - `getRowId` preserved via `productID + variant.unit.id`
  - action column using a shadcn `Button` + `lucide-react` `Trash2`
  - existing `DeleteConfirmationDialog` flow preserved
- The list pages (`CustomerList`, `ProductList`, `SupplierList`) were already off MUI X grid rendering; this batch removed the remaining `@mui/x-data-grid` package dependency in `src/` by replacing only the search icon import.
- `src/app.tsx` no longer carries `MuiDataGrid` style overrides in the global MUI theme configuration, reducing stale theme coupling after grid migration.

### Post-Batch 9 Inventory Snapshot

Compared with the post-Batch-8 snapshot:

- Files with at least one MUI import: unchanged (`42`)
- `@mui/material` import statements: unchanged (`46`)
- `@mui/icons-material` import statements (subpath + barrel): unchanged (`57`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: `5 -> 0` (`-5`)
- `@mui/x-date-pickers`: unchanged (`0`)
- `@mui/system`: unchanged (`5`)

### MUI X Migration Milestone (post-Batch 9)

- `@mui/x-date-pickers` imports in `src/`: **0**
- `@mui/x-data-grid` imports in `src/`: **0**
- MUI X usage in `src/`: **fully removed**

## Next Proposed Batch (post-Batch 9): List-Page MUI Material Controls Cleanup [Recommended]

Recommended next batch scope (high-traffic pages already on shared shadcn table/date-picker wrappers, but still using MUI material layout/controls):

- `src/pages/customer/customersList.tsx`
- `src/pages/product/ProductList.tsx`
- `src/pages/supplier/supplierList.tsx`
- `src/pages/order/OrderList.tsx`
- `src/pages/inboundOrder/InboundOrderList.tsx`
- `src/pages/installmentPayment/InstallmentPaymentList.tsx`
- `src/pages/supplierBill/SupplierBillList.tsx`

### Why this batch next

- These pages already use migrated shared building blocks (`CustomDataTable`, `EnhancedAutocomplete`, `DeleteConfirmationDialog`, `DatePickerField`), so replacing the remaining MUI material controls is mostly page-shell/layout/action-button work.
- It removes a large amount of repetitive MUI usage (`Grid`, `TextField`, `Button`, `Tooltip`, `InputAdornment`) from the most-used list screens.
- It is a safer next step than jumping directly into app shell/navigation/theme decommissioning, because behavior changes stay local to page-level controls.

### Out of Scope for next batch (explicit)

- Navigation shell (`navbar`, `Sidebar`) and app-level theme/provider decommissioning beyond what was already done for MUI X
- Form pages and onboarding pages not in the listed list-page set

### Key Risks / Decisions for the next batch

- Keyboard shortcut/focus navigation parity on list pages depends on the current DOM structure (`querySelector('input')`, focus order across filters); replacements must keep compatible focusable elements.
- Action button layout/tooltip behavior should remain consistent with the keyboard-help shortcuts shown on each page.
- Some pages still use MUI `Box` for custom inline status chips/actions in table cells; decide whether to leave those temporary or replace them within the same batch.

## Batch 10 Execution Update (repeat of Tasks 5.1-5.4)

Batch 10 was implemented by removing the remaining MUI material controls/layout wrappers from the approved list pages while preserving the already-migrated shared wrappers (`CustomDataTable`, `EnhancedAutocomplete`, `DatePickerField`, dialogs).

### Batch 10 Files Migrated

- `src/pages/customer/customersList.tsx`
- `src/pages/product/ProductList.tsx`
- `src/pages/supplier/supplierList.tsx`
- `src/pages/order/OrderList.tsx`
- `src/pages/inboundOrder/InboundOrderList.tsx`
- `src/pages/installmentPayment/InstallmentPaymentList.tsx`
- `src/pages/supplierBill/SupplierBillList.tsx`

### Batch 10 Supporting Changes

- Updated `src/components/SearchField.tsx` to support:
  - `forwardRef` (wrapper div ref for focus-navigation compatibility)
  - `autoFocus` passthrough
- This allowed replacing list-page MUI `TextField + InputAdornment` search controls with the shared `SearchField` component without breaking keyboard/focus hooks that call `querySelector('input')`.

### Batch 10 Implementation Notes

- Replaced list-page MUI layout/action controls (`Grid`, `Button`, `Tooltip`, `TextField`, `InputAdornment`) with:
  - Tailwind layout wrappers (`div` grids/flex)
  - shadcn `Button`
  - shadcn `Tooltip` primitives
  - shared `SearchField`
- `InstallmentPaymentList`:
  - Replaced MUI `IconButton` + `Tooltip` + MUI icons with shadcn `Button` + shadcn `Tooltip` + `lucide-react` icons (`Eye`, `CreditCard`, `RefreshCw`)
  - Replaced MUI `Box` status chips and action cell layout with plain Tailwind `<div>`s
- `SupplierBillList`:
  - Replaced MUI `Box` status chip rendering and page layout with Tailwind `<div>`s
- The approved seven list pages now have no `@mui/*` imports.

### Post-Batch 10 Inventory Snapshot

Compared with the post-Batch-9 snapshot:

- Files with at least one MUI import: `42 -> 35` (`-7`)
- `@mui/material` import statements: `46 -> 39` (`-7`)
- `@mui/icons-material` import statements (subpath + barrel): `57 -> 56` (`-1`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: unchanged (`0`)
- `@mui/x-date-pickers`: unchanged (`0`)
- `@mui/system`: unchanged (`5`)

### List-Page Cleanup Milestone (post-Batch 10)

- Approved list pages (`customer/product/supplier/order/inbound-order/installment-payment/supplier-bill` lists) now use shadcn/core/Tailwind controls/layout wrappers.
- Remaining MUI usage in `src/pages` is concentrated in forms, onboarding, auth, details, and navigation/settings shell pages.

## Next Proposed Batch (post-Batch 10): Core Form Pages (CRUD + Order/Inbound Forms) [Recommended]

Recommended next batch scope (high-usage forms and form pages, excluding onboarding/auth/navigation shell):

- `src/pages/customer/customerForm.tsx`
- `src/pages/product/productForm.tsx`
- `src/pages/product/Variants.tsx`
- `src/pages/supplier/supplierForm.tsx`
- `src/pages/productCategory/productCategory.tsx`
- `src/pages/unit/Unit.tsx`
- `src/pages/order/OrderForm.tsx`
- `src/pages/order/OrderFormLineItemForm.tsx`
- `src/pages/order/OrderFormHeader.tsx` (follow-up MUI material cleanup after date picker migration)
- `src/pages/inboundOrder/InboundOrderForm.tsx`
- `src/pages/inboundOrder/InboundOrderFormLineItemForm.tsx`
- `src/pages/inboundOrder/InboundOrderFormHeader.tsx` (follow-up MUI material cleanup after date picker migration)

### Why this batch next

- These pages benefit from the shared components already migrated (`FormActions`, `SearchField`, `EnhancedAutocomplete`, `DatePickerField`, `CustomDataTable`).
- They represent the highest-frequency data-entry flows after list pages.
- Completing this batch significantly reduces MUI usage before tackling navigation/onboarding/settings shell pages.

### Out of Scope for next batch (explicit)

- Onboarding flow pages (`src/pages/onboarding/*`)
- Auth page (`src/pages/auth/Login.tsx`)
- Navigation/settings shell (`src/pages/routes/*`, `src/app.tsx`, `src/home.tsx`) beyond already-applied MUI X-related cleanup
- Detail pages (`InstallmentPaymentDetail`, `SupplierBillDetail`)

### Key Risks / Decisions for the next batch

- Form keyboard navigation wrappers and custom focus refs are widely used; replacing layout/inputs must preserve `react-hook-form` bindings and shortcut behavior.
- Order/inbound line-item form pages may still use MUI primitives for dense editing layouts; regression risk is higher than list-page cleanup.
- Some pages may rely on MUI `TextField` quirks (helper text spacing, select rendering) that need explicit Tailwind/shadcn parity work.

## Batch 11 Execution Update (repeat of Tasks 5.1-5.4)

Batch 11 was implemented by removing MUI material/layout/control imports from the approved core form pages (CRUD + order/inbound forms), using a mix of direct shadcn/Tailwind rewrites and a small shadcn-backed form compatibility layer for large form pages.

### Batch 11 Files Migrated

- `src/pages/customer/customerForm.tsx`
- `src/pages/product/productForm.tsx`
- `src/pages/product/Variants.tsx`
- `src/pages/supplier/supplierForm.tsx`
- `src/pages/productCategory/productCategory.tsx`
- `src/pages/unit/Unit.tsx`
- `src/pages/order/OrderForm.tsx`
- `src/pages/order/OrderFormLineItemForm.tsx`
- `src/pages/order/OrderFormHeader.tsx`
- `src/pages/inboundOrder/InboundOrderForm.tsx`
- `src/pages/inboundOrder/InboundOrderFormLineItemForm.tsx`
- `src/pages/inboundOrder/InboundOrderFormHeader.tsx`

### Batch 11 Supporting Changes

- Added `src/components/ui/form-compat.tsx` (shadcn-backed MUI-form compatibility shim) for high-volume form page migration with reduced regression risk.
- Rewrote `src/pages/productCategory/productCategory.tsx` and `src/pages/unit/Unit.tsx` to shadcn/Tailwind card/list layouts with inline row actions (replacing MUI `Paper`, `List`, `Menu`, `TextField`, etc.).

### Batch 11 Implementation Notes

- `customerForm`, `supplierForm`, `productForm`, and `Variants` now import form/layout controls from `components/ui/form-compat` instead of `@mui/material` while continuing to use migrated shared components (`EnhancedAutocomplete`, `FormActions`, `CreateModeToggle`, dialogs).
- `order` / `inboundOrder` form pages and line-item entry forms were cleaned up directly to Tailwind/shadcn wrappers (`Button`, `Tooltip`, `Input`) with `react-hook-form` behavior and keyboard-navigation refs preserved.
- `productCategory` / `Unit` pages now use shadcn `Card`, `Input`, `Textarea`, and `Button` primitives with Tailwind list rows; contextual MUI menus were replaced by explicit inline Edit/Delete action buttons.

### Post-Batch 11 Inventory Snapshot

Compared with the post-Batch-10 snapshot:

- Files with at least one MUI import: `35 -> 23` (`-12`)
- `@mui/material` import statements: `39 -> 27` (`-12`)
- `@mui/icons-material` import statements (subpath + barrel): `56 -> 47` (`-9`)
- `@mui/material/styles`: unchanged (`2`)
- `@mui/x-data-grid`: unchanged (`0`)
- `@mui/x-date-pickers`: unchanged (`0`)
- `@mui/system`: `5 -> 3` (`-2`)

### Core Form Cleanup Milestone (post-Batch 11)

- Approved Batch 11 form pages no longer import `@mui/*`.
- MUI usage is now concentrated outside those forms: app shell/home, auth, onboarding, navigation/settings shell, two detail pages, and two line-item list pages with residual layout wrappers.

## Next Proposed Batch (post-Batch 11): Residual Core Pages + App Shell Cleanup [Recommended]

Recommended next batch scope (remaining non-onboarding core pages plus app shell/home):

- `src/app.tsx`
- `src/home.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/order/OrderFormLineItemList.tsx` (residual `Grid`/`Box` wrappers only)
- `src/pages/inboundOrder/InboundOrderFormLineItemList.tsx` (residual `Grid`/`Box` wrappers only)
- `src/pages/installmentPayment/InstallmentPaymentDetail.tsx`
- `src/pages/supplierBill/SupplierBillDetail.tsx`
- `src/pages/routes/navbar.tsx`
- `src/pages/routes/Sidebar.tsx`
- `src/pages/routes/settings/index.tsx`
- `src/pages/routes/settings/organization/OrganizationPage.tsx`
- `src/pages/routes/settings/preferences/PreferencesPage.tsx`
- `src/pages/routes/settings/profile/ProfilePage.tsx`

### Why this batch next

- It clears the remaining non-onboarding product shell/navigation and detail flows before tackling the larger onboarding UI set.
- Two order/inbound line-item list pages are now low-risk cleanup (only residual MUI layout wrappers remain after the earlier DataGrid migration).
- Removing shell-level MUI usage next gives a clearer boundary before final onboarding migration and dependency removal tasks.

### Out of Scope for next batch (explicit)

- `src/pages/onboarding/*` (10 files)

### Key Risks / Decisions for the next batch

- `Sidebar`/`navbar` have a high icon concentration; icon swap churn should be kept mechanical and visually validated.
- `src/app.tsx` and `src/home.tsx` still carry app-shell/theme/layout concerns and should be changed carefully to avoid startup regressions.
- Detail pages may have status-chip/dialog rendering patterns that need targeted visual parity checks.

## Batch 12 Execution Update (repeat of Tasks 5.1-5.4)

Batch 12 was implemented by removing the remaining non-onboarding MUI usage from app shell/home, auth, route shell/settings, two detail pages, and the two order/inbound line-item list cleanup targets.

### Batch 12 Files Migrated

- `src/app.tsx`
- `src/home.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/order/OrderFormLineItemList.tsx`
- `src/pages/inboundOrder/InboundOrderFormLineItemList.tsx`
- `src/pages/installmentPayment/InstallmentPaymentDetail.tsx`
- `src/pages/supplierBill/SupplierBillDetail.tsx`
- `src/pages/routes/navbar.tsx`
- `src/pages/routes/Sidebar.tsx`
- `src/pages/routes/settings/index.tsx`
- `src/pages/routes/settings/organization/OrganizationPage.tsx`
- `src/pages/routes/settings/preferences/PreferencesPage.tsx`
- `src/pages/routes/settings/profile/ProfilePage.tsx`

### Batch 12 Supporting Changes

- Added `src/components/ui/icon-compat.tsx` to mechanically replace remaining `@mui/icons-material` imports in Batch 12 pages using `lucide-react`-backed exports with MUI-like names.
- Expanded `src/components/ui/form-compat.tsx` to cover the remaining settings/detail-page MUI control surface (`Paper`, `Card`, `Alert`, `Chip`, `Switch`, `Select`, `Avatar`, table wrappers, `Fab`, etc.) while keeping imports off `@mui/*`.
- Reused existing shared migrated components (`DeleteConfirmationDialog`, `CustomDataTable`, `SearchField`, shadcn primitives) instead of introducing new MUI exceptions.

### Batch 12 Implementation Notes

- `src/app.tsx`
  - Removed remaining MUI theme/provider usage (`createTheme`, `ThemeProvider`, `@mui/system/Box`) and converted app layout wrappers to Tailwind/plain `<div>`/`<main>`.
  - Note: onboarding pages still use MUI components, so they currently render without the previous custom MUI theme until the onboarding batch is migrated.
- `src/pages/routes/navbar.tsx` / `src/pages/routes/Sidebar.tsx`
  - Rebuilt from MUI AppBar/Drawer/List primitives to Tailwind + shadcn `Button` + `lucide-react` while preserving route navigation and collapsible sections.
- `src/pages/routes/settings/index.tsx`
  - Replaced MUI Tabs/Card shell with a simple shadcn/Tailwind tab button strip and card container.
- `src/pages/routes/settings/organization/OrganizationPage.tsx`
  - Replaced MUI `Autocomplete` fields with native `<select>` controls for city/state.
  - Replaced local MUI confirm dialog usage with shared `DeleteConfirmationDialog`.
- `src/pages/installmentPayment/InstallmentPaymentDetail.tsx`, `src/pages/supplierBill/SupplierBillDetail.tsx`, `src/pages/routes/settings/preferences/PreferencesPage.tsx`, `src/pages/routes/settings/profile/ProfilePage.tsx`
  - Switched from direct `@mui/material` imports to `src/components/ui/form-compat.tsx` and icon usages to `src/components/ui/icon-compat.tsx`.
- `src/pages/order/OrderFormLineItemList.tsx` / `src/pages/inboundOrder/InboundOrderFormLineItemList.tsx`
  - Removed residual MUI `Grid`/`Box` layout wrappers left behind after the earlier DataGrid migration.

### Post-Batch 12 Inventory Snapshot

Compared with the post-Batch-11 snapshot:

- Files with at least one MUI import: `23 -> 10` (`-13`)
- `@mui/material` import statements: `27 -> 10` (`-17`)
- `@mui/icons-material` import statements (subpath + barrel): `47 -> 7` (`-40`)
- `@mui/material/styles`: `2 -> 0` (`-2`)
- `@mui/x-data-grid`: unchanged (`0`)
- `@mui/x-date-pickers`: unchanged (`0`)
- `@mui/system`: `3 -> 0` (`-3`)

### Batch 12 Milestone (post-Batch 12)

- All remaining MUI usage in `src/` is now isolated to the onboarding flow (`src/pages/onboarding/*`).
- Non-onboarding app shell, auth, settings/navigation, detail pages, and order/inbound line-item list wrappers are off direct `@mui/*` imports.

## Next Proposed Batch (post-Batch 12): Onboarding Flow Migration [Recommended]

Remaining MUI-import files (all onboarding):

- `src/pages/onboarding/InviteTeamSetup.tsx`
- `src/pages/onboarding/OnboardingComplete.tsx`
- `src/pages/onboarding/OnboardingExitDialog.tsx`
- `src/pages/onboarding/OnboardingFlow.tsx`
- `src/pages/onboarding/OnboardingRouter.tsx`
- `src/pages/onboarding/OnboardingWelcome.tsx`
- `src/pages/onboarding/OrganizationSelection.tsx`
- `src/pages/onboarding/OrganizationSetup.tsx`
- `src/pages/onboarding/SampleDataSetup.tsx`
- `src/pages/onboarding/TaxDataSetup.tsx`

### Why this batch next

- It is the final UI migration slice required to eliminate `@mui/*` imports from `src/`.
- The remaining files are all within one feature area (onboarding), making behavior/visual validation easier to scope.
- After this batch, package-level MUI removal/cleanup work can proceed with much lower risk.

### Key Risks / Decisions for the next batch

- Onboarding flow uses dense step/wizard UI and many icons; visual regressions are likely without a dedicated manual pass.
- `OnboardingRouter` currently uses MUI `CircularProgress`; ensure the loading state remains obvious and centered after migration.
- The onboarding exit confirmation and organization/tax setup forms may need additional compat coverage or direct shadcn rewrites depending on complexity.

## Batch 13 Execution Update (repeat of Tasks 5.1-5.4)

Batch 13 was implemented by migrating the entire onboarding flow off direct `@mui/*` imports, completing the UI-side MUI migration across `src/`.

### Batch 13 Files Migrated (Onboarding Flow)

- `src/pages/onboarding/InviteTeamSetup.tsx`
- `src/pages/onboarding/OnboardingComplete.tsx`
- `src/pages/onboarding/OnboardingExitDialog.tsx`
- `src/pages/onboarding/OnboardingFlow.tsx`
- `src/pages/onboarding/OnboardingRouter.tsx`
- `src/pages/onboarding/OnboardingWelcome.tsx`
- `src/pages/onboarding/OrganizationSelection.tsx`
- `src/pages/onboarding/OrganizationSetup.tsx`
- `src/pages/onboarding/SampleDataSetup.tsx`
- `src/pages/onboarding/TaxDataSetup.tsx`

### Batch 13 Supporting Changes

- Expanded `src/components/ui/form-compat.tsx` with onboarding-specific MUI-compat coverage:
  - `Stepper`, `Step`, `StepLabel`, `LinearProgress`
  - `Tabs`, `Tab`
  - `List`, `ListItem`, `ListItemText`, `ListItemSecondaryAction`
  - `Checkbox`
  - additional `Typography`, `Button`, `Alert`, `Chip`, `FormControlLabel`, `FormHelperText`, `Select`, `sx` compatibility support
- Expanded `src/components/ui/icon-compat.tsx`:
  - Added onboarding-needed icon mappings and MUI-style named exports (`Warning`, `CheckCircle`, `DataObject`, `LocationOn`, `Security`, `Speed`, `Upload`, etc.)
  - Added partial `sx` support for icon `fontSize`/`color`/spacing props to preserve onboarding visual sizing/coloring with low churn.

### Batch 13 Implementation Notes

- Most onboarding files were migrated via import-path swaps to `components/ui/form-compat` and `components/ui/icon-compat` to keep business logic intact while removing MUI imports.
- `OnboardingExitDialog` was rewritten to use shadcn `AlertDialog` primitives directly instead of MUI `Dialog`.
- `OrganizationSetup`:
  - Replaced MUI `Autocomplete` state/city inputs with compat `Select` + `MenuItem` controls (native select behavior) to avoid introducing a heavier autocomplete compat layer for the final onboarding slice.
- This batch intentionally favors behavior preservation and migration momentum over pixel-perfect parity; a dedicated onboarding visual smoke pass is recommended.

### Post-Batch 13 Inventory Snapshot

Compared with the post-Batch-12 snapshot:

- Files with at least one MUI import: `10 -> 0` (`-10`)
- `@mui/material` import statements: `10 -> 0` (`-10`)
- `@mui/icons-material` import statements (subpath + barrel): `7 -> 0` (`-7`)
- `@mui/material/styles`: unchanged (`0`)
- `@mui/x-data-grid`: unchanged (`0`)
- `@mui/x-date-pickers`: unchanged (`0`)
- `@mui/system`: unchanged (`0`)

### Batch 13 Milestone (post-Batch 13)

- `src/` now has **zero direct `@mui/*` imports**.
- UI migration is functionally complete; remaining work is package-level cleanup, compat-shim rationalization, and final regression validation.

## Next Proposed Batch (post-Batch 13): MUI Package Cleanup + Final Validation [Recommended]

Recommended next batch scope (post-UI migration cleanup):

- Remove unused MUI dependencies from `package.json` and lockfile:
  - `@mui/material`
  - `@mui/icons-material`
  - `@mui/x-data-grid`
  - `@mui/x-date-pickers`
  - related MUI runtime deps if no longer referenced (`@emotion/*`, etc.) after verification
- Run dependency/install cleanup and verify no runtime import regressions remain
- Decide which compat shims remain temporary vs should be simplified:
  - `src/components/ui/form-compat.tsx`
  - `src/components/ui/icon-compat.tsx`
- Complete final validation pass (typecheck/package/startup + targeted manual onboarding smoke)
- Update tasks/checklists for final OpenSpec completion items

### Key Risks / Decisions for the next batch

- Some compat wrappers intentionally ignore advanced MUI `sx` nested selectors; final visual polish may require targeted rewrites rather than keeping compat indefinitely.
- Removing `@emotion/*` too early can break transitive imports if any hidden MUI usage exists outside `src/`; verify with code search/build before pruning.
- Onboarding UI now depends on compat behavior for stepper/tabs/list widgets; manual interaction checks should be part of the cleanup batch.

## MUI Decommissioning and Final Validation Update (Tasks 6.1-6.4)

### Task 6.1: Final MUI Usage Confirmation

- Confirmed `/Users/lucas/Projects/inventory-management-app/src/` has **zero direct `@mui/*` imports**:
  - `@mui/material`: `0`
  - `@mui/icons-material`: `0`
  - `@mui/material/styles`: `0`
  - `@mui/system`: `0`
  - `@mui/x-data-grid`: `0`
  - `@mui/x-date-pickers`: `0`
- No approved runtime exceptions were retained.

### Task 6.2: Dependency Removal

Removed from `/Users/lucas/Projects/inventory-management-app/package.json` and lockfile:

- `@mui/material`
- `@mui/icons-material`
- `@mui/x-data-grid`
- `@mui/x-date-pickers`
- `@emotion/react`
- `@emotion/styled`

Notes:

- Theme/provider cleanup had already been completed during earlier batches (`src/app.tsx` and feature/page migrations), so Task 6.2 focused on dependency pruning and verification.
- `pnpm remove` reported ignored build scripts for `electron` / `msw`, but subsequent package/startup validation passed without additional repair.

### Task 6.3: Final Validation (Post-Cleanup)

- `pnpm exec tsc --noEmit` ✅
- `pnpm run verify:migration` ✅ (`verify:core-flows`, `verify:offline-sync`)
- `pnpm exec electron-forge package` ✅
- `pnpm start` ✅ (`Output Available: http://localhost:9026`, `Launched Electron app`; manually stopped)

Known non-blocking runtime noise during startup smoke (unchanged from earlier batches):

- local IndexedDB lock warnings (`...IndexedDB/http_localhost_3026.../LOCK`) from local profile contention
- Clerk/url.parse deprecation warning
- `ELIFECYCLE` on manual `Ctrl+C` stop of the dev process

### Task 6.4: Final Outcomes

- UI migration complete across `src/` (no MUI imports remain)
- MUI + Emotion dependencies removed from the project manifest/lockfile
- Remaining runtime-source exceptions: **none**
- Recommended follow-up (outside the migration completion criteria):
  - manual onboarding visual/interaction pass
  - targeted replacement/simplification of compat shims (`form-compat`, `icon-compat`)
  - separate lint backlog cleanup
