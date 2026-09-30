---
outline: deep
---

# marinAI — Deployment

How to run marinAI locally, how the Docker/CI images are built, and the full backend + frontend configuration reference.

## Run, Test, Deploy

From the repository README (stale: it still says `marinai.yml`), the intended setup is:

```bash
# x86_64 (pinned/reproducible)
conda env create -f marinai_amd.yml
# ARM64 (minimal/floating)
conda env create -f marinai_arm.yml
conda activate marinai_env
# BladeX is already in the _amd pip section; for _arm install it explicitly:
pip install git+https://github.com/mathLab/BladeX.git
```

Then copy `.env.example` to `.env`, populate Keycloak values, and run:

```bash
uvicorn app:app --reload
```

The default local service is available at port 8000. FastAPI also exposes interactive documentation under `/docs` and `/redoc`.

Operational notes:

- CORS currently permits only local frontend origins:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - `http://localhost:3000`
- Credentials, methods, and headers are broadly allowed.
- Deployed frontend origins must be added before non-local browser use.
- `git diff --check` was clean for the reviewed backend tree.
- No dedicated backend test suite is present.

Backend run checklist:

1. Create and activate the conda environment from `marinai_amd.yml` (x86_64) or `marinai_arm.yml` (ARM64).
2. Install BladeX separately if using `_arm`.
3. Copy `.env.example` to ignored `.env`.
4. Populate Keycloak URL and realm.
5. Run Uvicorn from the repository root.
6. Use `/docs` for interactive API documentation.

### Docker and CI Images

- `Dockerfile` is a single micromamba 2.3.2 build: installs `git` + `libgl1`, installs `${CONDA_ENV_FILE}` into `base`, copies the repo, exposes 8000, runs `uvicorn app:app --host 0.0.0.0 --port 8000`.
- `.github/workflows/image_amd64_creation.yml` builds `linux/amd64` with `CONDA_ENV_FILE=marinai_amd.yml` on tags `v*-amd` (`:latest-amd` floating tag).
- `.github/workflows/image_arm64_creation.yml` builds `linux/arm64` with `CONDA_ENV_FILE=marinai_arm.yml`.
- `.github/workflows/pr_tester.yml` is Trivy scanning only — there is still no backend test suite.

Local browser use requires one of the configured CORS origins. Production requires additional frontend origins and persistent export storage.

## Scripts & Sample Data

The `scripts/` directory contains development and legacy tools, not production API code.

| Script | Purpose | Current caveat |
|---|---|---|
| `build_bezier.py` | Batch blade generation from control-point JSON | Expects ignored `blades/control_points_composite.json`; sample paths may not exist |
| `build_bezier_interactive.py` | Interactive matplotlib Bézier editor | GUI/profiling-oriented; supports global-property and control-point initialization |
| `plot_default.py` | Offline 2D/3D/default-propeller plots | Input construction fixed: it now copies the `Point` lists from `INITIAL_POINTS` instead of reconstructing them with `Point(**p)` |

Both build scripts and the CSV→IGES service now use the current BladeX API (`blade.build()` to create the OCC faces, then `blade.export_iges(...)`); the older `apply_transformations()`/`generate_iges_blade()` calls no longer exist upstream. The unused `exporter.blade_to_compound` / `generate_stl_from_blade` helpers still reference the removed `_generate_upper_face` method and are dead code.

The backend README’s script documentation is stale. It mentions a `test.py` and `test_api.sh` that are not present as described, references `python -m scripts.check_env` where `scripts/check_env.py` is absent, omits `POST /v1/propeller/parametric/iges`, and does not accurately describe the current scripts. Its JSON control-point example (7-point `chord_x/y/mapping`) also does not match the current 4-point-per-property `INITIAL_POINTS` with no mapping.

## Configuration Reference

### Backend

| Variable | Required | Purpose |
|---|---|---|
| `KEYCLOAK_URL` | Yes | Keycloak server base URL |
| `KEYCLOAK_REALM` | Yes | Token-issuing realm |
| `KEYCLOAK_CLIENT_ID` | Only when audience verification is enabled | Expected audience |
| `KEYCLOAK_VERIFY_AUDIENCE` | No | Defaults to `false`; enables audience checking when `true` |

The backend uses no Keycloak client secret.

### Frontend

The tracked `.env.example` currently defines:

```text
BASE_PATH
NEXT_PUBLIC_BASE_PATH
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_VERSION
AUTH_SECRET
KEYCLOAK_URL
KEYCLOAK_REALM
KEYCLOAK_CLIENT_ID
KEYCLOAK_CLIENT_SECRET
POST_LOGOUT_REDIRECT_URL
```

It no longer contains the older external-portal (`NEXT_PUBLIC_AUTH_LOGIN_URL`) or cookie-domain variables. The example currently includes nonblank `NEXT_PUBLIC_API_URL=http://localhost:8000` and nonblank local-network `KEYCLOAK_URL=http://192.168.1.244:9090`, while leaving `BASE_PATH`, `NEXT_PUBLIC_BASE_PATH`, `AUTH_SECRET`, realm, client, secret, and redirect values blank. The ignored local `.env.local` file is not documented here.

The frontend uses `KEYCLOAK_CLIENT_SECRET` only in server-side Auth.js provider and refresh-token operations. It must not be exposed as a public `NEXT_PUBLIC_` variable.

`NEXT_PUBLIC_APP_VERSION` is included in `.env.example` (currently blank); it drives the version footer in the notifications popover and is used for release tagging. When unset, `page.tsx` falls back to `v${packageJson.version}` (`v1.0.0`). `BASE_PATH` and `NEXT_PUBLIC_BASE_PATH` support subpath deployment. Browser code reads `NEXT_PUBLIC_BASE_PATH` through `src/utils/basePath.ts` (`withBasePath()`), while `next.config.js` and the proxy use the non-public `BASE_PATH` for routing. Note the split: `Dockerfile` only bakes `NEXT_PUBLIC_API_URL` (+ unused `NEXT_PUBLIC_AUTH_URL`) via `API_URL`/`AUTH_URL` build args — Keycloak and base-path vars must be supplied at runtime, not baked in.
