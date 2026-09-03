# Role-aware home · 2026-08-24

Presentation-only portal layer. No new queries, writes, grants or RLS changes.

- Participant keeps the existing `Min reise` presentation.
- Multiple operational roles get one combined action-first home.
- Narrow operational roles get VÍA, SER or VIDA wording tied to their existing scope.
- Project owner / observer / evaluator without operational role gets an aggregate-first home: participant-linked tasks are removed from the rendered queue and participant/check-in entry points are hidden from primary navigation.
- Aggregate-only roles must also avoid being invited into individual participant/staff form cards they cannot open. The form catalogue should filter by existing role/capability/scope presentation rules while direct URL/RLS/AAL2 denial remains the security boundary.
- Role/AAL changes should trigger a complete role-aware UI refresh so stale navigation from a previous assurance/session state is not left visible.
- Keep the presentation layer framework-neutral and driven by capability/scope state so the same rules can later be reused in an installable/PWA/native-app shell without duplicating authorization logic.
- This is UX minimisation, not an authorization boundary; Supabase RLS/capabilities remain the security boundary.
