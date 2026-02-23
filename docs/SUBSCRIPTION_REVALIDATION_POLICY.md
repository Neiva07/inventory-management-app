# Subscription Revalidation Policy (Deferred Implementation)

## Scope

This document captures subscription validation expectations for the Turso migration. Enforcement is intentionally out of scope for the current migration implementation.

## Baseline Policy

- Users receive offline access to paid features during their active entitlement period.
- Users must complete at least one successful online check-in per month.
- Failure to revalidate within the monthly window places the account in grace handling defined by the future entitlement system.

## Planned Entitlement Model

A future implementation will use signed entitlement payloads containing:

- Subject (`user_id`)
- Organization scope (`organization_id`)
- Plan type (monthly/annual/etc.)
- `term_expires_at` (billing period validity)
- `check_in_by` (offline revalidation deadline)
- `issued_at` and token id

## Future Enforcement States

- `active`: term valid and check-in current.
- `grace`: term valid, check-in overdue but inside grace window.
- `expired`: term expired or grace exhausted; paid capabilities are restricted.

## Security Considerations (Future)

- Persist a trusted server timestamp to reduce local clock tampering impact.
- Require periodic signature/key rotation support.
- Log revalidation outcomes for auditability.

## Why Deferred

The current migration focuses on replacing persistence architecture (Firestore to Turso + Drizzle) and maintaining business flow integrity. Subscription enforcement will be delivered as a dedicated follow-up change after data path stabilization.

