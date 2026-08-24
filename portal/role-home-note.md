# Role-aware home · 2026-08-24

Presentation-only portal layer. No new queries, writes, grants or RLS changes.

- Participant keeps the existing `Min reise` presentation.
- Multiple operational roles get one combined action-first home.
- Narrow operational roles get VÍA, SER or VIDA wording tied to their existing scope.
- Project owner / observer / evaluator without operational role gets an aggregate-first home: participant-linked tasks are removed from the rendered queue and participant/check-in entry points are hidden from primary navigation.
- This is UX minimisation, not an authorization boundary; Supabase RLS/capabilities remain the security boundary.
