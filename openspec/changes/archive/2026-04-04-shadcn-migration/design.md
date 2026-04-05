## Context

This Electron desktop app uses Electron Forge (webpack plugin), React 18, TypeScript 4.8, and a broad MUI 5 footprint (including `@mui/x-data-grid` and `@mui/x-date-pickers`) across many pages and shared components. The renderer currently has no Tailwind or shadcn setup, and `src/app.tsx` centralizes MUI theming plus MUI date localization providers.

The requested migration has three phases:
1. Upgrade core platform dependencies first (TypeScript, React, Electron, and required supporting tooling).
2. Add a modern shadcn + Tailwind foundation and establish `src/components/ui` as the canonical home for new UI primitives.
3. Replace MUI components incrementally with user approval before each replacement batch.

Constraints:
- The app must remain runnable during the migration.
- Tailwind v3 is explicitly not acceptable; Tailwind must be a current major (v4+ at implementation time).
- MUI replacement is user-reviewed/approved and should not be executed as a big-bang rewrite.
- This is a desktop app, so Electron main/preload and renderer compatibility matter as much as React UI code.

## Goals / Non-Goals

**Goals:**
- Upgrade core runtime/tooling dependencies to current stable versions available at implementation start, with explicit compatibility validation.
- Preserve critical app startup behavior (Electron launch, renderer boot, auth routing, local DB bootstrap/sync runtime).
- Introduce a production-ready shadcn/Tailwind foundation in `src/components/ui` that coexists with current MUI code.
- Define and enforce an approval-gated workflow for MUI-to-shadcn replacement batches.
- Produce implementation tasks that allow phased execution with rollback points.

**Non-Goals:**
- Full MUI removal in the first implementation pass.
- Visual redesign beyond what is necessary for framework/component migration.
- Re-architecting routing, data syncing, or domain logic unrelated to dependency/UI migration.
- Bundler migration (for example, Electron Forge webpack to a different toolchain) unless a blocking compatibility issue forces it and is explicitly approved.

## Decisions

### 1. Use a phased migration with checkpoints, not a big-bang rewrite

The change will be implemented in three phases (platform upgrade, shadcn/Tailwind foundation, component replacement) with validation between phases.

Why:
- Isolates failures (runtime/tooling vs styling vs component behavior).
- Keeps the app releasable during the migration.
- Matches the user's request to review/approve component replacement work.

Alternative considered:
- One-pass migration (upgrade + new UI stack + component rewrites together). Rejected because it creates a very large regression surface and makes rollback difficult.

### 2. Target latest stable versions at implementation time, with explicit version recording

Exact target versions will be selected during implementation after checking upstream stable releases and compatibility notes. The migration will prefer stable (non-prerelease) versions and record selected versions in the implementation notes/PR.

Why:
- The requirement is "most up to date possible."
- Exact version numbers change frequently and should be validated at implementation time, not frozen in the spec artifact.

Alternative considered:
- Pinning to currently known versions from memory. Rejected because it risks being stale and contradicting the user's request.

### 3. Keep Electron Forge + webpack during the dependency upgrade phase

The initial upgrade will preserve the current Electron Forge + webpack architecture and only make the minimal configuration changes required for compatibility.

Why:
- Limits change scope while upgrading Electron/React/TypeScript.
- Reduces the number of interacting migrations happening at once.

Alternative considered:
- Simultaneous migration to a different Electron build toolchain. Rejected as a separate architectural change with its own risk profile.

### 4. Introduce shadcn/Tailwind as a parallel UI foundation under `src/components/ui`

The project will add Tailwind (current major version, v4+) and shadcn tooling/configuration, and generated shadcn components will live under `src/components/ui` (plus supporting utilities such as `src/lib/utils` as needed).

Why:
- Aligns with the existing `src/components` structure.
- Enables incremental adoption without disrupting current MUI-based screens.
- Creates a clear home for new or migrated primitives.

Alternative considered:
- Replacing MUI directly without a foundation phase. Rejected because it would duplicate patterns and slow future migrations.

### 5. Maintain MUI and shadcn coexistence until replacement completion

MUI providers/components will remain in place while shadcn primitives are introduced and adopted incrementally. MUI packages will only be removed after the import graph is migrated (or reduced to approved exceptions).

Why:
- `@mui/x-date-pickers` and `@mui/x-data-grid` are used across multiple screens and may require deliberate replacement choices.
- Coexistence allows focused conversion batches and easier rollback.

Alternative considered:
- Immediate MUI package removal after shadcn setup. Rejected because it would break a large portion of the app immediately.

### 6. Require explicit approval before each component replacement batch

Before converting a batch (for example shared form controls, navigation, dialogs, or a specific feature page), the implementation must present the planned mapping and wait for user approval.

Why:
- The user explicitly wants to approve replacement work.
- UI migrations involve trade-offs (visual parity, interaction changes, component API changes).

Alternative considered:
- Autonomous migration across all MUI usages. Rejected due to user preference and regression risk.

### 7. Validate each phase with compile/run + targeted regression checks

Each phase will include repeatable validation (lint/typecheck/build and app startup smoke checks, plus existing verification scripts where applicable).

Why:
- The repo includes offline sync/core flow verification scripts that can catch regressions unrelated to UI.
- Dependency upgrades can silently break Electron or bundler behavior before UI issues are visible.

Alternative considered:
- Single end-of-project validation only. Rejected because it delays detection and complicates root-cause analysis.

## Risks / Trade-offs

- [React/Electron/tooling compatibility mismatch] -> Mitigation: upgrade in small commits, verify peer dependency constraints, and keep Electron Forge + webpack stable initially.
- [Tailwind v4 integration may require build pipeline changes with current webpack setup] -> Mitigation: implement Tailwind in a dedicated phase after runtime upgrades and validate CSS pipeline independently.
- [MUI X components (DataGrid/DatePicker) may not have drop-in shadcn equivalents] -> Mitigation: treat them as explicit migration decisions with approved replacements (for example wrapper components or alternate libraries) before conversion.
- [Visual regressions during component replacement] -> Mitigation: batch migrations, preserve layout/behavior parity goals, and require user approval before each batch.
- [Long-lived mixed UI stack increases maintenance burden] -> Mitigation: define migration batches and exit criteria (import inventory shrinking, package removal conditions).
- [Latest-version targeting can move during implementation] -> Mitigation: freeze exact versions at implementation start of Phase 1 and document them.

## Migration Plan

1. Baseline and safety checks
   - Create a migration baseline (current dependency snapshot, lockfile, and known passing scripts).
   - Record critical flows to smoke test after each phase (app launch, login route, home route, core CRUD pages, sync/bootstrap behavior).

2. Phase 1: Platform/runtime/tooling upgrade
   - Upgrade `typescript`, `react`, `react-dom`, `electron`, and required build/lint/type packages.
   - Update Electron Forge/webpack configuration only as needed for compatibility.
   - Fix compile/runtime breakages and re-run validation.

3. Phase 2: shadcn + Tailwind foundation
   - Add Tailwind (current major, v4+) and integrate into renderer CSS pipeline.
   - Add shadcn configuration and supporting utilities.
   - Create `src/components/ui` and seed foundational primitives used by upcoming migrations.
   - Confirm coexistence with existing MUI theme/providers and pages.

4. Phase 3: MUI-to-shadcn replacement (approval-gated)
   - Generate/import inventory of MUI usages and group into migration batches.
   - Present first proposed batch and mapping to the user for approval.
   - Migrate approved batch, validate, and repeat.
   - Remove MUI packages only after approved migration completion and import inventory is clear (or approved exceptions remain).

5. Rollback strategy
   - Keep phase boundaries in separate commits/PR-sized checkpoints.
   - If a phase fails validation, revert only that phase’s commits and preserve completed prior phases.

## Open Questions

- What exact stable versions of Electron, React, ReactDOM, TypeScript, and Electron Forge plugins will be targeted at implementation start?
- Will Tailwind v4+ require additional webpack/PostCSS loader changes beyond the current `style-loader` + `css-loader` setup?
- What replacements will be used for `@mui/x-data-grid` and `@mui/x-date-pickers` (retain temporarily, wrap, or replace with alternative libraries)?
- Should `src/app.tsx` keep MUI `ThemeProvider` during the coexistence period, or should shared tokens be moved early to CSS variables and consumed by both stacks?
- Do any packaging/signing/publisher constraints require pinning Electron below the absolute latest stable release?
