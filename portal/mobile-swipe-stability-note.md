# Mobile swipe stability objective

2026-09-17 physical pre-flight feedback:

- A visually present primary tab must never be skipped by a single horizontal page swipe.
- The content transition must not render a detached preview/landing frame that flashes before the canonical destination view is active.
- Prefer a stable canonical view switch over decorative slide animation.
- The top navigation remains natively horizontally scrollable; page navigation is owned by the portal workspace gesture layer.
