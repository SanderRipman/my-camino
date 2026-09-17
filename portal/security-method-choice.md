# Participant security method choice

Decision note, 2026-09-17.

For protected participant steps, the intended UX is one concise choice surface with two equivalent methods when both are technically and legally verified:

- **BankID**
- **Authenticator**

The choice must appear only at the point where stronger authentication is actually required, not during the initial basic profile step.

Do not imply different data access if both methods satisfy the same protected-step assurance policy. If a future implementation gives different assurance/access, explain only the concrete difference at the choice point.

BankID must remain feature-gated until the preprod/provider/client/callback/claim mapping has been physically verified. Do not expose a dead BankID action in ordinary Early-UAT.
