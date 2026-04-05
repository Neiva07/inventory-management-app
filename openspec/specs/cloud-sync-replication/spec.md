## ADDED Requirements

### Requirement: Opportunistic Cloud Replication
The system SHALL synchronize locally committed pending changes to the cloud Turso database whenever online connectivity is available.

#### Scenario: Sync after connectivity returns
- **WHEN** the app has pending local changes and connectivity becomes available
- **THEN** the system MUST attempt to replicate pending changes to the cloud database

#### Scenario: Offline period with pending writes
- **WHEN** the app remains offline after local writes are committed
- **THEN** the system MUST preserve pending changes locally until a later successful sync attempt

### Requirement: Sync Retry Behavior
The system SHALL retry failed sync attempts after transient connectivity or service failures.

#### Scenario: Sync attempt fails transiently
- **WHEN** a sync attempt fails due to transient network or remote availability issues
- **THEN** the system MUST keep pending changes intact and retry synchronization on subsequent online opportunities

### Requirement: Sync State Visibility
The system SHALL provide a sync state indicator that reflects whether data is synced, pending, or blocked by errors.

#### Scenario: Pending sync state
- **WHEN** one or more local changes are awaiting cloud replication
- **THEN** the system MUST expose a pending sync state that is available for UI/status reporting
