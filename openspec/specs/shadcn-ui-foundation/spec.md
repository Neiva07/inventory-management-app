## ADDED Requirements

### Requirement: Modern Tailwind foundation is installed for the renderer
The system SHALL add Tailwind CSS to the renderer UI stack using the latest stable major version available at implementation time, and SHALL NOT use Tailwind CSS v3.

#### Scenario: Tailwind major version requirement is enforced
- **WHEN** Tailwind is added or updated as part of this change
- **THEN** the installed `tailwindcss` package major version is 4 or greater
- **THEN** no Tailwind v3 dependency remains in the project dependency graph for the renderer styling setup

### Requirement: Tailwind styles are integrated into the Electron renderer build pipeline
The system SHALL configure the current Electron Forge + webpack renderer pipeline to process and load the Tailwind-based global styles required by shadcn components.

#### Scenario: Renderer loads Tailwind-generated styles
- **WHEN** the application renderer starts after the shadcn/Tailwind foundation phase
- **THEN** the global stylesheet containing Tailwind directives/utilities is processed successfully by the renderer build pipeline
- **THEN** shadcn components rendered in the app receive the expected Tailwind-based styling classes

### Requirement: shadcn component foundation is configured under `src/components/ui`
The system SHALL configure shadcn tooling and project conventions so generated shadcn components are created under `src/components/ui` and supporting utilities are available for shared usage.

#### Scenario: shadcn component generation target is established
- **WHEN** the shadcn foundation phase is complete
- **THEN** the project contains the configuration and supporting files required to add current shadcn components
- **THEN** generated shadcn components are placed in `src/components/ui` by project convention
- **THEN** shared utility support (for example class merging and variant helpers, if required by generated components) is available

### Requirement: Foundation components coexist with existing MUI-based screens
The system SHALL allow shadcn-based components and existing MUI-based components/providers to coexist in the same application during the migration period.

#### Scenario: Mixed UI stacks render during migration
- **WHEN** a screen renders with existing MUI providers while importing a shadcn-based component from `src/components/ui`
- **THEN** the screen compiles and renders without requiring immediate removal of MUI providers or packages
- **THEN** shadcn foundation setup does not break existing MUI-only screens

### Requirement: Foundation establishes a reusable migration target for future replacements
The system SHALL provide a documented and consistent import path/pattern for newly migrated shared UI primitives so future MUI replacements converge on the same `src/components/ui` layer.

#### Scenario: Shared primitive migration uses canonical import path
- **WHEN** a developer migrates a shared UI primitive from MUI to the new foundation
- **THEN** the replacement is implemented or wrapped under `src/components/ui` (or approved supporting utility modules)
- **THEN** consuming code imports from the canonical project UI layer instead of adding ad hoc per-feature component copies
