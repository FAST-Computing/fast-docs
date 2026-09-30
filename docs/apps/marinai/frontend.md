---
outline: deep
---

# marinAI — Frontend

The marinAI frontend is a Next.js single-page propeller-design workspace. It never performs propeller mathematics or CAD generation itself: it orchestrates [backend](./backend) calls and visualizes their results through draggable Bézier panels, a 3D STL viewer, and a 2D sections view.

## Overview

The frontend is a Next.js single-page propeller-design workspace.

Its responsibilities are:

- Authenticate the user through Keycloak-backed Auth.js.
- Display six draggable Bézier parameter panels.
- Send curve edits to the backend.
- Render the generated propeller STL in 3D.
- Display derived 2D airfoil sections and section statistics.
- Support undo, redo, reset, CSV import, randomization, and exports.
- Save and recall named blade snapshots.
- Surface in-app release notes through the navbar notifications menu.
- Provide an onboarding tutorial.
- Attach fresh bearer tokens to backend requests.
- Download binary artifacts through authenticated browser Blob URLs.

The frontend never performs propeller mathematics or CAD generation itself. It orchestrates backend calls and visualizes their results.

## Tech Stack & Environment

From `package.json`:

| Layer | Important packages |
|---|---|
| Framework | Next.js ^16.2.9, React 19, React DOM 19 |
| UI | Material UI 9, Material Icons 9, Emotion 11 |
| Design system | `@fast-computing/fast-graphics` ^1.8.0 |
| Curve plots | plotly.js-dist-min ^3.3.0 and react-plotly.js ^2.6.0 bindings |
| 3D rendering | @kitware/vtk.js ^37.0.4 |
| Icons | lucide-react ^1.48.0 (navbar/sidebar/profile icons) |
| Release notes | react-markdown ^10.1.0 + remark-gfm ^4.0.1 (notification popover bodies) |
| Authentication | NextAuth/Auth.js 5 beta 32 (`next-auth` ^5.0.0-beta.32) |
| Fonts | @next/font ^14.2.15 (code imports `next/font/google`) |
| Language/tooling | TypeScript ^5.6.3, Webpack ^5.97.1 + css-loader/style-loader/ts-loader |

The frontend README's theme-installation instruction says to install fast-graphics 1.6.1 (`npm install @fast-computing/fast-graphics@1.6.1`), while `package.json` requires `^1.8.0`. That version mismatch is another stale-documentation issue. The README's `create-tag.yml` / `NEXT_PUBLIC_APP_VERSION` workflow reference is also stale (no such workflow in the repo).

The configured npm scripts are:

```text
npm run dev
npm run build
npm run start
npm run lint
```

Frontend operation:

1. Install dependencies with `npm ci`.
2. Provide an npm registry token for the private FAST graphics package if required.
3. Configure the ignored local environment file.
4. Ensure the backend is reachable at `NEXT_PUBLIC_API_URL`.
5. Run the development server and open the configured Next.js port.

The checked-in frontend README documents `NEXT_PUBLIC_API_URL` + `NEXT_PUBLIC_APP_VERSION` (default `http://localhost:8000`, example `v0.1.0`) plus the `NPM_TOKEN`/`.npmrc` theme install. It does not cover the current Keycloak, session-secret, base-path, logout-redirect, or release-tag requirements.

## Directory Structure

Important current paths include:

```text
marinAI-frontend/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx                # Composes Sidebar + Navbar + SnapshotRail + StlViewer/SectionsView
│   ├── globals.css
│   ├── login/route.ts            # Internal login entry point (GET -> 302 Keycloak URL)
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth handlers (GET+POST)
│       ├── logout/route.ts
│       ├── session-token/route.ts
│       └── user/route.ts         # Profile endpoint (name/email/username only)
├── src/
│   ├── auth.ts
│   ├── proxy.ts                  # Route guard (protects only /); no middleware.ts
│   ├── constants/
│   │   ├── propeller.ts          # datasets, panel sizes, MAX_HISTORY=50, SNAPSHOT_SLOTS=5, NAVBAR_HEIGHT=64, SIDEBAR_RIGHT_EDGE=116
│   │   └── tutorial.ts           # 9-step TOUR_STEPS + STORAGE_KEY
│   ├── hooks/
│   │   ├── usePropellerData.ts   # init/curves/upload (debounce 300ms)
│   │   ├── useSectionsData.ts    # parallel points3d + tabella refresh
│   │   ├── useHistory.ts         # undo/redo stack (cap 50)
│   │   ├── useSnapshots.ts       # session-only named blade snapshots (BladeSnapshot + WebP preview)
│   │   ├── useNotifications.ts   # loads/parses public/notifications.md, tracks seen ids
│   │   ├── usePanelInteraction.ts
│   │   └── useDebouncedCallback.ts
│   ├── types/
│   │   ├── propeller.ts          # PlotKey, AllPoints/Curves, HistorySnapshot, BladeSnapshot, PanelStates
│   │   ├── notifications.ts      # NotificationTag + Notification
│   │   ├── sections.ts
│   │   ├── next-auth.d.ts
│   │   └── vtk.d.ts
│   ├── utils/
│   │   ├── auth.ts               # token cache + authorizedFetch
│   │   ├── basePath.ts           # NEXT_PUBLIC_BASE_PATH + withBasePath() helper
│   │   ├── notifications.ts      # parseNotifications() markdown parser
│   │   ├── points.ts             # clone/bounds/randomize
│   │   ├── parseSections.ts      # points3d + tabella parsing/merging
│   │   └── layout.ts
│   ├── env.d.ts
│   └── main.tsx                  # Legacy Vite entry, unused by App Router (excluded in tsconfig)
├── components/
│   ├── Navbar.tsx                # Fixed 64px header: title, undo/redo, render, 3D/sections toggle,
│   │                             # color, blades stepper, import/export, guide, NotificationsMenu, ProfileMenu
│   ├── ProfileMenu.tsx           # Account popover (GET /api/user + logout)
│   ├── NotificationsMenu.tsx     # Bell button + release-notes popover (unread badge, markdown body)
│   ├── Sidebar.tsx               # Left dock: 6 parameter toggles + reset/randomize tab
│   ├── SnapshotRail.tsx          # Bottom-center snapshot slots (1-8, default 5, session-only, named)
│   ├── SnapshotNameDialog.tsx    # Asks for a label before saving a snapshot slot
│   ├── PlotPanel.tsx
│   ├── DraggablePlot.tsx
│   ├── StlViewer.tsx             # vtk.js viewer + capturePreview() for snapshots
│   ├── SectionsView.tsx
│   ├── Tutorial.tsx              # FastTour wrapper (9 steps)
│   ├── CsvImportDialog.tsx
│   ├── SectionDownloadDialog.tsx
│   └── SpinningPropeller.tsx
├── types/plotdata.ts             # Legacy PlotDataDict, unused
├── public/                       # marinai-icon.png, fast logos, marinAI_Logo.png, icons/{6 params}.png,
│                                 # notifications.md (release-notes source for NotificationsMenu)
├── Dockerfile                    # 3-stage node:22-alpine (deps/build/runner, standalone output)
├── .trivyignore.yaml             # License exceptions for sharp transitive binaries
├── next.config.js                # standalone + BASE_PATH (non-public) + styledComponents
├── package.json
├── tsconfig.json                 # excludes src/main.tsx
├── tsconfig.tsbuildinfo          # Tracked generated-file state
├── AGENTS.md                     # Boilerplate only, no project rules
├── CLAUDE.md
├── CHANGELOG.md                  # Stale: stops before auth/proxy/sections/snapshot work
└── .env.example
```

There is no `components/Toolbar.tsx`, `components/BottomRightOverlay.tsx`, `components/TopRightControls.tsx`, or `components/ViewModeToggle.tsx` — those roles were consolidated into `Navbar.tsx` (+ `ProfileMenu.tsx`, `NotificationsMenu.tsx`) and `SnapshotRail.tsx` (+ `SnapshotNameDialog.tsx`). There is no `src/middleware.ts` or root `middleware.ts`; the guard lives in `src/proxy.ts`.

`src/main.tsx` is legacy. It mounts a nonexistent `./pages/App`, but the actual application uses the Next.js App Router through `src/app/page.tsx`. It is explicitly excluded in `tsconfig.json` (`exclude: ["node_modules","src/main.tsx"]`) and should eventually be removed to avoid confusion.

## Authentication & SSO Flow

The current working tree has moved toward the frontend acting as its own OIDC client rather than relying on an external portal.

### Login

The internal route `src/app/login/route.ts`:

1. Reads an optional `callbackUrl`, defaulting to `/`.
2. Calls `signIn("keycloak", { redirectTo: callbackUrl, redirect: false })`.
3. Receives the generated Keycloak authorization URL.
4. Returns HTTP 302 with that URL in `Location`.

The route guard in `src/proxy.ts` protects only `/` (plus `//` edge) and redirects unauthenticated/errored requests to the internal `/login` route while preserving the requested callback URL. Other paths pass through; the matcher skips `api`, `_next/static`, `_next/image`, `favicon.ico`, `images`, and `videos`.

### NextAuth session

`src/auth.ts` configures:

- Keycloak provider
- JWT session strategy
- Host trust
- Access-token, refresh-token, expiration, ID-token, name, email, and username propagation
- Session exposure through `accessToken`, `idToken`, `error`, and `username`
- Token refresh beginning 60 seconds before expiration
- Deduplicated concurrent refresh attempts
- Self-healing behavior for transient token-endpoint failures
- Permanent `RefreshAccessTokenError` only for unrecoverable refresh failures such as invalid grants or expired refresh tokens

The `src/app/api/auth/[...nextauth]/route.ts` exposes the generated GET and POST handlers.

### Session-token endpoint

`src/app/api/session-token/route.ts` returns either:

```json
{
  "accessToken": "<token>",
  "reason": null
}
```

or HTTP 401 with:

```json
{
  "accessToken": null,
  "reason": "no_session"
}
```

or:

```json
{
  "accessToken": null,
  "reason": "refresh_failed"
}
```

This distinction lets the client decide whether to retry or redirect to login.

### Profile endpoint

The `src/app/api/user/route.ts` returns only identity information:

```json
{
  "name": "...",
  "email": "...",
  "username": "..."
}
```

It deliberately avoids exposing tokens merely to display a user profile.

### Logout

The current logout route:

1. Reads the Auth.js session before clearing cookies.
2. Uses the session ID token for Keycloak RP-initiated logout when available.
3. Falls back to a configured post-logout URL or the application root.
4. Clears every matching Auth.js session-cookie variant, including chunked variants.
5. Preserves the `secure` cookie attribute behavior for `__Secure-` and `__Host-` cookies.
6. Supports both GET and POST.

Without RP-initiated logout, Keycloak could retain an SSO session and silently log the user back in, so the ID-token flow is significant.

### Browser token cache and retry

`src/utils/auth.ts` implements an in-memory access-token cache with:

- Expiry decoding from the JWT payload.
- A 60-second refresh window matching the server callback.
- Single-flight `/api/session-token` requests.
- Limited retries for network or 5xx failures.
- Fallback to the last known token so transient failures become backend 401s rather than tokenless 403s.
- `clearCachedToken` after a backend 401.
- Exactly one retry with a refreshed token.
- A guarded single redirect to login when renewal has failed.

`authorizedFetch` is now the standard backend-call wrapper. An older `authHeader` helper remains exported but is no longer used by the main page or data hooks.

## State, Hooks & Data Flow

### Page-level state

`src/app/page.tsx` owns the main application state, including:

- Control points for all six properties
- Interpolated curves
- STL object URL
- Blade count, defaulting to five (clamped 3–7 in page and navbar)
- Diameter display, defaulting to one meter
- Editable project title, defaulting to `Untitled project`
- Three-dimensional versus sections view (`sectionsN` default 25; 3D-points download uses fixed `n_sections=12`)
- Section counts and export-dialog state (`sectionNValue` default 12)
- CSV-import dialog state
- Rendering and IGES-export indicators
- Snapshot slots (`useSnapshots(SNAPSHOT_SLOTS=5)`, `savingIndex` while capturing, optional user label)
- Tutorial replay state
- Snackbar error state
- Model color
- Panel drag clamp `SIDEBAR_RIGHT_EDGE=116` keeps floating panels clear of the left dock

The page composes specialized hooks rather than implementing every workflow inline.

### Propeller data hook

`usePropellerData`:

- Fetches `/v1/curves/init` on startup.
- Splits each property’s `control` and `curve` data.
- Updates one backend curve after local control-point edits.
- Debounces curve updates by 300 milliseconds.
- Imports project and optional control-point CSV files.
- Exposes `applyAllPoints` for replacing every property simultaneously.
- Stores raw imported CSV points separately.
- Reports errors through the page-level snackbar.

The backend currently does not return `num_blades` or `diameter` metadata from `/curves/init`, so those frontend fields remain unchanged during reset.

### Sections-data hook

`useSectionsData`:

- Sends the same request body to:
  - `/v1/sections/points3d`
  - `/v1/sections`
- Parses both CSV responses.
- Merges geometry and tabular statistics by radius.
- Supports silent background refresh after rendering.
- Maintains separate loading and refreshing indicators.

Because both responses are generated from the same request body, their station counts and radius ranges stay consistent.

### History, panels, and debouncing

`useHistory`:

- Snapshots control points and curves.
- Supports undo and redo.
- Resets on CSV import.
- Caps history at 50 snapshots (`MAX_HISTORY=50` in `src/constants/propeller.ts`).

`useSnapshots`:

- Session-only in-memory blade snapshots (`BladeSnapshot{points, curves, preview, name?, savedAt}`).
- Starts with `SNAPSHOT_SLOTS=5` slots; the rail allows 1–8 via add/remove (minimum 1).
- Previews are WebP data URLs from `StlViewer.capturePreview()` (256 px wide); a reload clears them (kept out of localStorage).
- Saving opens `SnapshotNameDialog` for an optional label; the label shows as the slot tooltip and falls back to the slot number.

`usePanelInteraction`:

- Tracks panel visibility, position, z-order, and control-point-editor state.
- Supports dragging floating panels.
- Anchors right-side panels on mount.
- Integrates with the tutorial’s temporary panel behavior.

`useDebouncedCallback`:

- Prevents every pointer movement from issuing a backend request.
- Always invokes the latest callback after the delay.

### Bounds and randomization

`computeBounds` derives `start_r` and `end_r` from the minimum and maximum control-point x values across all properties. It falls back to `0.25` and `1.0` when no points exist.

The newer `randomizeAllPoints` preserves each control point’s radial x position and replaces y values using smooth generated profiles. It includes multiple chord-planform families, monotonic thickness decay, gradual pitch variation, tip-biased skew, small rake growth, and small camber growth. Camber and thickness are clamped to nonnegative values so randomized designs pass backend validation.

Randomization calls both `applyAllPoints` and `updateRender` without awaiting either before continuing. This is fire-and-forget concurrency, so curve refresh and STL regeneration proceed in parallel rather than in a strictly ordered sequence.

### Notifications

`useNotifications` powers the navbar bell:

- Fetches `public/notifications.md` (via `withBasePath`) with `cache: "no-store"`, sharing a module-level cache and a single in-flight request across consumers.
- Parses it with `parseNotifications()` and reports `notifications`, `loading`, `error`, `unreadCount`, `unreadIds`, and `markAllSeen`.
- Read state persists in `localStorage` under `marinai.notificationsSeen` (a JSON array of notification ids).

The markdown format: one `## Title` section per notice, followed by an HTML-comment metadata block `id: … | date: YYYY-MM-DD | version: x.y.z | tag: feature|fix|info|breaking`, then the Markdown body. Sections missing `id` or title are skipped; entries are sorted newest-first by date. `NotificationTag` is `feature | fix | info | breaking`, which drives the chip colour in the popover.

## Components

### Curve editing

`Sidebar` is a left floating dock: six 64px parameter toggles (`/icons/${dataset}.png`) plus a narrow tab below with Reset (`RotateCcw`) and Randomize (`Dices`). All buttons share the busy-disabled state.

`PlotPanel`:

- Shows a draggable floating panel per property.
- Displays parameter-specific physical explanations.
- Shows loading, initialization-error, and no-data states.
- Contains a numeric X/Y control-point editor.
- Delegates curve rendering and manipulation to `DraggablePlot`.

`DraggablePlot`:

- Uses Plotly for curves and draggable control points.
- Uses axis labels with engineering units.
- Uses a local Lagrange preview while interacting.
- Sends durable changes to the backend after interaction settles.
- Avoids update loops by distinguishing programmatic plot updates from genuine user edits.
- Only reapplies annotations when they actually differ, avoiding Plotly relayout feedback loops.
- Uses refs to avoid stale closures in asynchronous Plotly handlers.

### Three-dimensional view

`StlViewer` implements a resilient vtk.js pipeline:

- Generic render window and trackball camera.
- STL reader.
- Optional Windowed-Sinc smoothing.
- Point-normal computation.
- Actor/mapper lifecycle management.
- Resize handling without triggering invalid premature renders.
- Load tokens and disposal guards to avoid race conditions from rapid STL changes.
- An explicit three-light camera-following rig.
- Polished-metal-style Blinn-Phong material parameters.
- Theme-selected model color and background.
- Render-only-when-ready behavior to avoid `No input!` errors.

Current smoothing defaults are 20 iterations and a `0.005` pass band. `StlViewer` also exposes `capturePreview(maxWidth=256, quality=0.9)` (WebP, render scale 0.4) used for snapshot-slot thumbnails. The old `topInset` prop and its camera-panning logic were removed; the model is centred with a plain `resetCamera()`.

### Sections view

`SectionsView`:

- Projects 3D upper and lower section points onto a section-aligned 2D frame.
- Reconstructs upper, lower, mean-line, and chord information.
- Normalizes coordinates by chord.
- Corrects y-axis orientation when necessary.
- Detects reversed leading/trailing-edge orientation from maximum-thickness location.
- Uses Plotly for airfoil overlays and section statistics.
- Parses backend CSV into tip-to-hub ordered section profiles.

The parser consumes the corrected first-column radius directly. It no longer applies the old `start + end − label` transformation.

### Navbar, snapshots, and view controls

There is no separate `Toolbar` / `BottomRightOverlay` / `TopRightControls` / `ViewModeToggle` component — all of those roles now live in `Navbar.tsx` (+ `ProfileMenu.tsx`) and `SnapshotRail.tsx`.

`Navbar` is a fixed 64px header (`NAVBAR_HEIGHT=64`, `CONTROL_HEIGHT=44`) with logical groups:

- Left: app icon + editable project title, Undo/Redo (`Undo2`/`Redo2`, gated by `canUndo`/`canRedo`), Update Render (`Play`).
- Center: 3D/Sections segmented toggle (`FastSegmentedToggle`, `data-tour="toolbar-toggle"`).
- Right: model-color picker, blades stepper (3–7, `Minus`/`Plus`), CSV import, Export dropdown (IGES / STL / Sections CSV / 3D points), Guide (`BookOpen`, hidden below 1540px), `NotificationsMenu` (bell + unread badge), and `ProfileMenu`.
- All controls share one `busy = loadingInit || isRendering || isExportingIges || sectionsLoading || importingCsv` disabled state (export menu also auto-closes while busy).

`SnapshotRail` is a bottom-center slot bar (not bottom-right):

- 64px tiles (`TILE=64`), 1–8 slots (`MIN_SLOTS=1`, `MAX_SLOTS=8`), starting at 5 (`SNAPSHOT_SLOTS=5`).
- Click an empty slot to open `SnapshotNameDialog` and save a named snapshot (captures a WebP preview via `StlViewer`); click a filled slot for a Recall / Empty menu.
- The slot number sits in the corner; the saved name is the hover tooltip. The rail's `+`/`−` buttons add or remove slots at the end.
- Snapshots are session-only; a page reload clears them.

UI/theming note (current working tree): the floating docks and panels use a near-black translucent surface (`#080c0f` at 0.85 alpha) with hairline `#ffffff` borders instead of drop shadows; several navbar buttons dropped the `animated` prop; and the explicit `MuiTooltip` style override was removed from `selectedTheme`.

### Profile, guide, dialogs, and status UI

`ProfileMenu` (replacing the old `TopRightControls`) is an account button + popover:

- Fetches `${basePath}/api/user`, displays the best available display name (`name || username || email || "Signed in"`, `Loading…` while fetching) and secondary email.
- Offers a single Log out button (`onLogout` → `/api/logout`). No external-portal navigation.

`NotificationsMenu` is the bell button + `Popover`:

- Shows an unread `Badge` (`unreadCount`), fetches release notes via `useNotifications`, and renders each notice's Markdown body through `react-markdown` + `remark-gfm`.
- Opening the panel marks everything seen after a short delay (clearing the badge); unread rows stay highlighted for the session, and a "Mark all as read" action is available.
- The app version (`NEXT_PUBLIC_APP_VERSION`) is shown in the footer when set.

`Tutorial` (a `FastTour` wrapper, storage key `marinai.tutorialDone`) provides nine guided steps:

1. Welcome (`welcome`)
2. Parameter plots (`sidebar`)
3. Curve editing (`panel`)
4. View modes (`toolbar-toggle`)
5. CSV import (`toolbar-import`)
6. Update Render (`toolbar-render`)
7. Export (`toolbar-export`)
8. Blade snapshots (`snapshots`)
9. Completion (`done`)

It persists completion in local storage, supports manual replay, measures highlighted elements, responds to resizing/scrolling, and can temporarily reveal the chord panel.

`CsvImportDialog` accepts a required sections CSV and an optional control-point CSV. `SectionDownloadDialog` selects station count and whether to bundle control points into a ZIP file. `SpinningPropeller` supplies themed loading and export overlays. The 3D/sections switch is part of `Navbar` (a `FastSegmentedToggle`), not a separate `ViewModeToggle` component.

## Backend API Wiring

The frontend hardcodes backend API major version `v1` in its hooks, matching the backend router prefix.

| User action | Backend call |
|---|---|
| Initial load or reset | `GET /v1/curves/init` |
| Drag a control point | `POST /v1/curves/{dataset}` with `{controlPoints}` |
| Replace all points through Randomize | One `POST /v1/curves/{dataset}` per property |
| Import CSV | `POST /v1/curves/upload` with multipart `csv_file` and optional `cp_file` |
| Render propeller | `POST /v1/propeller/stl`, then authenticated `GET` of returned `stl_url` |
| Export IGES | `POST /v1/propeller/parametric/iges`, then authenticated `GET` of returned `iges_url` |
| Download section table | `POST /v1/sections`, then save CSV or ZIP Blob |
| Download 3D points | `POST /v1/sections/points3d`, then save CSV Blob |
| Refresh sections view | Parallel `POST /v1/sections/points3d` and `POST /v1/sections` |

Binary responses are always fetched with `authorizedFetch`, converted to Blobs, exposed through revocable object URLs, and downloaded through temporary anchor elements. The application avoids unauthenticated direct links because they cannot carry the required bearer token.
