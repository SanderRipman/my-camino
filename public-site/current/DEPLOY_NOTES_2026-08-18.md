# Public deploy notes – 2026-08-18

## Confirmed mobile footer-scroll defect

The current public Netlify deploy `6a818fb0563075817cf6ffdd` reports iframe height with `document.documentElement.scrollHeight`. In the Wix embed this value is contaminated by the iframe's oversized initial viewport, so short internal pages can report the container height back to Wix and leave a large blank scroll tail below the real footer. The home page largely hides the defect because its real content is long.

The source-parity candidate fixes this in `site.js` by measuring the bottom of real non-fixed body children instead of the document/viewport scroll height.

## Temporary Wix mitigation

Wix custom embed `8862699b-b4ba-4a55-b43e-f7e81715f719` is an ESSENTIAL, reversible runtime mitigation for navigation scroll-to-top and iframe/wrapper resizing. Revision 5 is active as of 2026-08-18, but it cannot fully correct an inflated child height report. Do not keep layering path-specific magic heights into Wix unless needed as a short emergency fallback.

## Deployment gate

The corrected child source is not yet public because the available Netlify deploy connector currently hands off to `npx @netlify/mcp`, while the execution container has no external DNS/network access to npm or the Netlify MCP proxy. Do not treat repeated CLI timeouts as a source-code failure.

Preferred next deployment path: finish Git source parity (including assets), connect/reconcile the public Netlify project to that controlled Git source, validate preview on mobile + desktop, then switch production atomically with the existing deploy retained as rollback.

## Source-parity delta – 2026-08-18

Git source parity is now complete for the archived candidate. The 12 previously missing WebP assets were rehydrated from the immutable Netlify deploy `6a818fb0563075817cf6ffdd` by GitHub Actions and were accepted only after exact byte-size and SHA-256 verification against `SOURCE_PARITY_MANIFEST_2026-08-18.json`. Independent Git read-back confirms the expected asset blob identities and sizes.

The next public gate is therefore no longer source recovery. It is a controlled non-production preview from Git, followed by mobile QA at 320/360/390/412 px, tablet and desktop, with rollback to deploy `6a818fb0563075817cf6ffdd` retained. New UX work is isolated in stacked draft PR #42 and must not be confused with the source-parity baseline in PR #39.
