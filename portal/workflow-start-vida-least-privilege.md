# START_VIDA least-privilege boundary

`START_VIDA` is an operational transition from SER to VIDA. It must remain callable only by capabilities already tied to operational program/SER responsibility (`manage_tasks` or `edit_ser`). Project-level `manage_program` alone must not authorize the transition.

The UI already hides the action from `project_owner`; this source-level rule closes the matching direct-API path. The transition still requires AAL2, current SER stage, an active participant context and a named VIDA owner. This change grants no new capability and changes no public intake, RLS policy, consent flow or participant-data visibility.
