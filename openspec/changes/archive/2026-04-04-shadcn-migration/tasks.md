## 1. Baseline and Planning

- [x] 1.1 Capture a baseline snapshot of current dependency versions (`package.json` + lockfile) and record current Electron/React/TypeScript versions in change notes.
- [x] 1.2 Identify and document exact target stable versions for `electron`, `react`, `react-dom`, and `typescript` (and key supporting tooling) at implementation start.
- [x] 1.3 Record a validation checklist for critical flows (app launch, auth/login route, home route, DB bootstrap, sync runtime, key CRUD pages) to run after each phase.
- [x] 1.4 Create a rollback checkpoint commit/branch boundary for the pre-migration baseline before applying upgrades.

## 2. Platform Runtime and Tooling Upgrade

- [x] 2.1 Upgrade `typescript`, `react`, `react-dom`, and `electron` to the selected stable target versions.
- [x] 2.2 Upgrade compatible supporting tooling/type packages required by the Electron Forge + webpack setup (forge plugins, loaders, eslint/types packages, ts tooling) to satisfy peer dependencies.
- [x] 2.3 Update project configuration code as needed for compatibility (`forge.config.ts`, webpack configs, tsconfig, renderer/main entrypoints) without changing the overall build architecture.
- [x] 2.4 Fix compile/type/runtime issues introduced by the dependency upgrades in Electron main, preload, and renderer code.
- [x] 2.5 Run phase validation (lint/typecheck/build/start app smoke checks and relevant verification scripts) and document results as the platform-upgrade checkpoint.

## 3. Tailwind and shadcn Foundation (`src/components/ui`)

- [x] 3.1 Add Tailwind CSS to the renderer using a current stable major version (v4+) and verify no Tailwind v3 dependency remains.
- [x] 3.2 Integrate Tailwind processing into the Electron Forge webpack renderer CSS pipeline and ensure the global stylesheet is loaded by the renderer.
- [x] 3.3 Initialize shadcn project configuration (including generator/config files and required utilities) targeting `src/components/ui`.
- [x] 3.4 Create the canonical UI foundation files (`src/components/ui/*` seed primitives and supporting utility modules such as class-merging helpers) needed for upcoming migrations.
- [x] 3.5 Verify shadcn foundation components render correctly alongside existing MUI providers/screens without breaking current pages.
- [x] 3.6 Document the canonical import conventions/patterns for shared UI primitives in `src/components/ui`.

## 4. MUI Migration Inventory and Approval Gate

- [x] 4.1 Generate an inventory of current MUI usage across `@mui/material`, `@mui/icons-material`, and MUI X packages (files, component categories, special cases).
- [x] 4.2 Group MUI usages into proposed migration batches (shared/core primitives first, then feature/page-level batches).
- [x] 4.3 Define replacement mappings and noted risks for the first proposed batch (including treatment of any MUI X dependencies in scope).
- [x] 4.4 Present the first batch scope + mapping to the user and pause for explicit approval before applying replacement code.

## 5. Approved Replacement Batch Execution (Repeatable)

- [x] 5.1 Implement the first user-approved replacement batch using `src/components/ui` primitives/wrappers while preserving approved behaviors.
- [x] 5.2 Validate the approved batch (compile/run + targeted flow checks for affected screens/components) and document any intentional behavior differences.
- [x] 5.3 Update the MUI usage inventory to reflect migrated and remaining imports after the batch.
- [x] 5.4 Prepare and present the next migration batch for user approval (repeat 5.1-5.3 per approved batch).

## 6. MUI Decommissioning and Final Validation

- [x] 6.1 Confirm remaining MUI imports/usages are removed or explicitly documented as approved exceptions before dependency removal.
- [x] 6.2 Remove no-longer-needed MUI dependencies/packages and clean up obsolete theme/provider code only after migration completion criteria are met.
- [x] 6.3 Run final validation across app startup, critical flows, and regression checks after dependency cleanup.
- [x] 6.4 Record final migration outcomes (selected versions, replaced component batches, remaining exceptions, and follow-up work).
