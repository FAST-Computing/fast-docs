---
outline: deep
---

# marinAI — Overview

marinAI is a parametric marine-propeller design application for naval architects iterating on radial blade geometry. It is built from two repositories: **marinAI-backend** (FastAPI service: Bézier math, blade construction, 3D export) and **marinAI-frontend** (Next.js UI: interactive curve editing, 3D STL viewer, 2D section viewer, downloads).

## What marinAI Is

marinAI is a parametric marine-propeller design loop:

1. Represent six blade properties as functions of normalized radius:
   - `chord`
   - `pitch`
   - `rake`
   - `skew`
   - `camber`
   - `thickness`
2. Let the user shape those functions by dragging Bézier control points.
3. Recompute curves on the backend whenever control points change.
4. Build a three-dimensional propeller blade from the curves.
5. Render the propeller in the browser.
6. Export CAD and tabular artifacts:
   - STL for visualization, printing, and mesh use
   - IGES for CAD exchange
   - Project-table CSV or ZIP files
   - Three-dimensional section-point CSV files
7. Protect the design backend with Keycloak authentication.

The intended users are naval architects and propeller designers iterating on radial blade geometry. The application combines an engineering backend with a highly interactive visual frontend.

## System Architecture

### High-level flow

```text
Browser / Next.js frontend
        |
        | HTTPS requests with Keycloak bearer tokens
        v
FastAPI backend (/v1)
        |
        |-- Bézier math with NumPy/SciPy
        |-- Blade construction with BladeX
        |-- CAD/mesh export with pythonOCC
        |
        v
Responses:
- JSON control points and curves
- STL/IGES files
- CSV/ZIP section data
```

Authentication involves Keycloak in two complementary places:

```text
Browser
  |
  | 1. OIDC sign-in through the frontend's own NextAuth/Keycloak integration
  v
Frontend Next.js server
  - Maintains an Auth.js session
  - Refreshes Keycloak access tokens
  - Exposes the current access token through /api/session-token
  |
  | 2. Sends the access token as Authorization: Bearer <token>
  v
FastAPI backend
  - Verifies the token against the Keycloak realm JWKS
  - Does not perform the browser login itself
  - Does not need the Keycloak client secret
```

### Repository responsibilities

| Concern | Backend | Frontend |
|---|---|---|
| Bézier interpolation and fitting | Yes | No; it displays server results |
| Blade geometry construction | Yes, through BladeX | No |
| STL/IGES generation | Yes, through pythonOCC and BladeX | No; it renders/downloads results |
| Interactive curve editing | No | Yes, through draggable Plotly panels |
| 3D visualization | No | Yes, through vtk.js |
| User login and session management | No | Yes, through NextAuth/Keycloak |
| Token validation | Yes, through Keycloak JWKS | Indirectly, by supplying tokens |
| File downloads | Serves generated files | Uses authenticated `fetch`, then browser Blob URLs |

## End-to-End Workflows

**A. Design from scratch** — open the app; the route guard sends an unauthenticated visitor to internal `/login`, then Keycloak OIDC returns to the workspace. The tutorial may appear, default curves load and auto-render, control-point drags refresh curves, **Update Render** regenerates the STL, the sections view stays synchronized, and STL/IGES/CSV artifacts can be exported.

**B. Start from a project CSV** — open **Import CSV**, upload a project-table CSV and optionally a control-point CSV, review the fitted or directly supplied Bézier curves, reset history as needed, render, and export.

**C. Export for CAD or analysis** — use STL for browser visualization or mesh workflows; parametric IGES for CAD handoff; `tabella_progetto.csv` or ZIP for radial property tables; `sections_points3d.csv` for upper/lower three-dimensional section coordinates.

**D. Reset and undo safely** — reset reloads backend defaults and rerenders; undo and redo traverse up to 50 snapshots without affecting browser navigation; CSV import clears the snapshot history. Blade snapshot slots (5 by default, up to 8, optionally named) are separate from undo history and last only for the current session.
