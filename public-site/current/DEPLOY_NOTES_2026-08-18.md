# Public deploy notes – 2026-08-18

## Confirmed mobile footer-scroll defect

The current public Netlify deploy `6a818fb0563075817cf6ffdd` reports iframe height with `document.documentElement.scrollHeight`. In the Wix embed this value is contaminated by the iframe's oversized initial viewport, so short internal pages can report the container height back to Wix and leave a large blank scroll tail below the real footer. The home page largely hides the defect because its real content is long.

The source-parity candidate fixes this in `site.js` by measuring the bottom of real non-fixed body children instead of the document/viewport scroll height.

## Temporary Wix mitigation

Wix custom embed `8862699b-b4ba-4a55-b43e-f7e81715f719` is an ESSENTIAL, reversible runtime mitigation for navigation scroll-to-top and iframe/wrapper resizing. Revision 5 is active as of 2026-08-18, but it cannot fully correct an inflated child height report. Do not keep layering path-specific magic heights into Wix unless needed as a short emergency fallback.

## Deployment gate

The corrected child source is not yet public because the available Netlify deploy connector currently hands off to `npx @netlify/mcp`, while the execution container has no external DNS/network access to npm or the Netlify MCP proxy. Do not treat repeated CLI timeouts as a source-code failure.

Preferred next deployment path: finish Git source parity (including assets), connect/reconcile the public Netlify project to that controlled Git source, validate preview on mobile + desktop, then switch production atomically with the existing deploy retained as rollback.
