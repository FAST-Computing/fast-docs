---
outline: deep
---

# marinAI — Glossary

Terms used across the marinAI documentation.

- **r/R:** Normalized radial station, from hub toward tip.
- **Bézier control point:** A draggable point shaping a parametric curve.
- **Bernstein polynomial:** Basis function used to evaluate Bézier curves.
- **RMSE:** Root-mean-square fitting error reported for CSV-derived curves.
- **Chord:** Section width distribution, normalized by diameter.
- **Pitch:** Axial advance per revolution, normalized by diameter.
- **Rake:** Axial section offset, normalized by diameter.
- **Skew:** Angular section offset, normally in degrees.
- **Camber:** Section mean-line curvature relative to chord.
- **Thickness:** Maximum section thickness relative to chord.
- **BladeX:** External blade/propeller geometry library.
- **pythonOCC:** Python bindings for OpenCASCADE CAD operations.
- **STL:** Triangulated mesh format used for visualization and manufacturing workflows.
- **IGES:** CAD boundary-representation exchange format.
- **Tabella progetto:** Section-property project table exported as CSV or ZIP.
- **JWKS:** JSON Web Key Set used to obtain Keycloak public signing keys.
- **RS256:** RSA signature algorithm used for the validated access tokens.
- **Auth.js/NextAuth:** Frontend authentication/session framework.
- **OIDC:** OpenID Connect login protocol layered on OAuth 2.
- **RP-initiated logout:** Logout flow that also terminates the Keycloak SSO session using an ID-token hint.
- **HTTP 422:** Validation or invalid-geometry client error used by the current backend.
- **Degenerate tip plate:** Zero-thickness closure section used at the blade tip.
- **Navbar:** Fixed 64px header consolidating title, history, render, view toggle, color, blades, import/export, guide, notifications, and profile.
- **BladeSnapshot / SnapshotRail:** Session-only named blade states with WebP previews (5 slots default, 1–8 allowed); distinct from the 50-step undo history.
- **Notification:** A release-notes entry parsed from `public/notifications.md` and shown in the navbar bell popover; read state lives in `localStorage`.
- **Base path:** Optional subpath deployment. `NEXT_PUBLIC_BASE_PATH` (browser, via `withBasePath()`) and `BASE_PATH` (Next routing/proxy) select the public and server prefixes respectively.
