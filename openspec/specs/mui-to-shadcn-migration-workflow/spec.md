## ADDED Requirements

### Requirement: MUI replacement SHALL proceed in explicit, approval-gated batches
The system SHALL execute MUI-to-shadcn component replacement as incremental batches, and SHALL require user approval before implementation begins for each batch.

#### Scenario: Batch approval is required before replacement work
- **WHEN** a replacement batch is proposed (for example shared dialogs, form controls, navigation, or a page-level migration)
- **THEN** the implementation presents the planned scope and component mapping to the user
- **THEN** no replacement code for that batch is applied until the user approves proceeding

### Requirement: Replacement planning SHALL include an inventory of current MUI usage
The system SHALL produce and maintain a migration inventory of current MUI usage categories (including `@mui/material`, `@mui/icons-material`, and MUI X packages) to prioritize and scope replacement batches.

#### Scenario: Migration inventory is used to define a batch
- **WHEN** the first replacement batch is being planned
- **THEN** the implementation references an inventory of MUI imports/usages in the codebase
- **THEN** the proposed batch identifies the targeted components/files and the intended replacement approach

### Requirement: MUI and shadcn components SHALL coexist during migration
The system SHALL support mixed usage of MUI and shadcn/core components across the app until the approved migration batches are complete.

#### Scenario: Partial migration does not require full MUI removal
- **WHEN** one approved batch has been migrated but other screens still import MUI components
- **THEN** the remaining MUI-based screens continue to compile and run
- **THEN** MUI dependencies remain installed until their remaining usages are removed or explicitly deferred

### Requirement: Shared/core component replacements are prioritized before broad page rewrites
The system SHALL prioritize replacement of shared/core UI building blocks (for example buttons, dialogs, form controls, layout primitives, and reusable shared components) before large-scale page-by-page rewrites, unless the user approves a different order for a specific batch.

#### Scenario: First batch targets shared/core primitives
- **WHEN** the first replacement batch is proposed
- **THEN** the batch primarily targets shared/core components or wrappers that unlock multiple pages
- **THEN** any proposed page-level rewrites outside that scope are called out for explicit approval

### Requirement: MUI package removal SHALL be gated by import elimination or approved exceptions
The system SHALL NOT remove MUI packages from project dependencies until the codebase no longer depends on them, except where the user explicitly approves retaining or deferring specific MUI X features.

#### Scenario: Dependency removal follows migration completion
- **WHEN** MUI package removal is proposed
- **THEN** the implementation verifies remaining imports/usages for the targeted MUI packages
- **THEN** packages are removed only after usages are eliminated or documented as approved exceptions

### Requirement: Replacement batches preserve critical behavior for approved scope
The system SHALL preserve the approved batch’s core behaviors (interaction flow, keyboard accessibility expectations already implemented, and form/list actions) unless behavior changes are explicitly included in the batch approval.

#### Scenario: Approved batch keeps behavior stable
- **WHEN** an approved replacement batch is implemented
- **THEN** migrated components provide the same primary user actions as the replaced MUI components within that batch scope
- **THEN** any intentional behavior differences are documented and confirmed in the approval for that batch
