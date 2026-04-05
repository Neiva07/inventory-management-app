## Why

The project was started about three years ago, and core platform dependencies (Electron, React, TypeScript, UI libraries, and styling tooling) are now significantly behind current standards. This migration is needed to reduce upgrade risk over time, unlock modern tooling (including current Tailwind/shadcn patterns), and create a maintainable path away from MUI.

## What Changes

- Upgrade core platform/runtime dependencies to current stable versions, starting with TypeScript, React, and Electron (plus required supporting package updates).
- Update project build/tooling configuration as needed to support those upgrades and keep the app running on current development and production environments.
- Introduce a new `components/ui` library as the canonical home for shadcn-based UI primitives/components using the latest supported shadcn setup and modern Tailwind (no Tailwind v3).
- Establish the Tailwind/shadcn foundation (configuration, styling tokens, component generator/setup, and shared UI patterns) so new UI work lands in `components/ui`.
- Begin phased component replacement from MUI to shadcn/core-based components, with explicit user review/approval before replacement work proceeds across screens/components.
- **BREAKING**: Dependency major-version upgrades may require code changes across renderer, Electron main/preload, build configuration, and UI component APIs.
- **BREAKING**: UI component migrations may change visual behavior, styling, and component contracts where MUI-specific APIs are removed.

## Capabilities

### New Capabilities

- `platform-runtime-upgrade`: Defines requirements for upgrading Electron, React, TypeScript, and related tooling to current stable supported versions while preserving app functionality.
- `shadcn-ui-foundation`: Defines requirements for a new `components/ui` shadcn-based component library and modern Tailwind setup (current major version, not Tailwind v3).
- `mui-to-shadcn-migration-workflow`: Defines requirements for incremental MUI-to-shadcn component replacement with approval gates and phased rollout expectations.

### Modified Capabilities

- None (no existing OpenSpec capability specs are present yet).

## Impact

- Affected code: Electron app entrypoints (main/preload), renderer React app, shared UI components, styling/theme files, and package/build configuration.
- Affected dependencies: `electron`, `react`, `react-dom`, `typescript`, MUI packages, and new shadcn/Tailwind-related tooling.
- Affected systems: local development workflow, CI/build pipeline, packaging/distribution, and UI regression testing/QA.
- Process impact: component replacement phase will require user approval checkpoints before broad MUI-to-shadcn conversions are executed.
