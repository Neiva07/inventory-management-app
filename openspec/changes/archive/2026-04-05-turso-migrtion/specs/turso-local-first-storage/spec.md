## ADDED Requirements

### Requirement: Local Database is the Primary Runtime Store
The system SHALL use a local SQLite database (accessed through Drizzle repositories) as the primary source of truth for supported business entities.

#### Scenario: Read data while offline
- **WHEN** the device is offline and a user requests supported business data
- **THEN** the system MUST return data from the local database without requiring network access

#### Scenario: Commit writes while offline
- **WHEN** the device is offline and a user creates, updates, or deletes supported business data
- **THEN** the system MUST commit the write to the local database and mark the change as pending cloud sync

### Requirement: Firestore Data Path is Replaced for Runtime Operations
The application data layer SHALL execute runtime CRUD operations through the Turso/Drizzle data path rather than Firebase/Firestore APIs.

#### Scenario: Runtime operation invocation
- **WHEN** a model or repository operation is executed during normal app usage
- **THEN** the operation MUST use the Turso/Drizzle-backed repository implementation
