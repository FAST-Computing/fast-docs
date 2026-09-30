---
outline: deep
---

# marinAI — Backend

The marinAI backend is a FastAPI application ("Parametric Propeller API"). It owns all engineering math and CAD generation: Bézier curve interpolation and fitting, parametric blade construction with BladeX, and STL/IGES export with pythonOCC. The [API reference](./api-reference) documents every endpoint; [deployment](./deployment) covers running it.

## Overview

The backend is a FastAPI application named **“Parametric Propeller API.”**

Its main responsibilities are:

- Supply default Bézier control points and curves.
- Recompute a curve when control points are edited.
- Fit cubic Bézier curves to an uploaded propeller table.
- Optionally use an uploaded control-point table directly.
- Build parametric blade geometry.
- Generate STL and IGES propeller artifacts.
- Serve previously generated export files.
- Generate section-property CSV and 3D section-point CSV outputs.
- Validate geometry and return client errors for physically invalid input.
- Require Keycloak authentication for all business endpoints.

The public health endpoint is intentionally left unauthenticated.

## Tech Stack & Environment

The environment is defined by `marinai_amd.yml` (pinned, x86_64) and `marinai_arm.yml` (minimal, ARM64), using conda environment `marinai_env` and Python 3.10. The old single `marinai.yml` no longer exists; the backend README still references it and is stale on this point. Docker builds select the file via the `CONDA_ENV_FILE` build arg (see [Run, Test, Deploy](./deployment#run-test-deploy)).

| Layer | Important packages |
|---|---|
| Web framework | FastAPI 0.116.1, Starlette 0.47.3, Uvicorn 0.35.0 |
| Request validation | Pydantic 2.11.9, Pydantic Core 2.33.2 |
| File uploads | python-multipart 0.0.20 |
| Authentication | PyJWT with cryptography support 2.10.1, python-dotenv 1.0.1 |
| Numerical calculation | NumPy 2.2.2, SciPy 1.15.1 (pinned in `_amd`; floating in `_arm`) |
| Plotting/offline diagnostics | Matplotlib 3.10.0 |
| CAD geometry | pythonOCC-core 7.8.1.1 (conda) + OCCT 7.8.1 (`_amd` pinned; `_arm` floating `pythonocc-core`) |
| VTK-related conda packages | VTK 9.2.6, including VTK IO FFmpeg packages (`_amd` only; `_arm` omits VTK) |
| Blade modeling | BladeX, installed separately from its Git repository (both env files) |

The repository pins PyJWT with cryptography support because authentication depends on `PyJWKClient` and RS256 verification.

An important environment hazard is the unrelated legacy PyPI package named `jwt`, especially version 1. Although neither `marinai_amd.yml` nor `marinai_arm.yml` lists it, that package uses the same top-level `jwt` module name as PyJWT and can shadow PyJWT. If installed, `from jwt import PyJWKClient` can fail and prevent application startup. The repository README now warns against installing it.

## Directory Structure

```text
marinAI-backend/
├── app.py
├── Dockerfile                # Micromamba build; ARG CONDA_ENV_FILE selects _amd/_arm
├── marinai_amd.yml           # Pinned x86_64 env (python 3.10.13, OCC/VTK/numpy/fastapi stack)
├── marinai_arm.yml           # Minimal floating ARM64 env (python=3.10, no VTK/scipy/pyjwt pins)
├── .env.example
├── .gitignore
├── README.md                 # Stale: still references marinai.yml, test.py/test_api.sh, check_env
├── CHANGELOG.md              # Stale: stops before Keycloak/sections/UUID/validation/Docker work
├── package-lock.json     # Nearly empty stub; this is not a Node project
├── .github/workflows/        # image_amd64_creation (tags v*-amd), image_arm64_creation, pr_tester (Trivy)
├── core/
│   ├── auth/
│   │   ├── deps.py       # Keycloak bearer-token dependency
│   │   └── schemas.py    # Typed JWT payload
│   ├── exceptions.py     # InvalidGeometryError
│   ├── schemas/
│   │   ├── models.py     # API data models and validation
│   │   └── constants.py  # Parameter keys, defaults, radii
│   ├── services/
│   │   ├── blade_builder.py
│   │   ├── curves.py
│   │   ├── exporter.py
│   │   └── fitting.py
│   └── utils/
│       ├── domain/
│       │   ├── bezier.py
│       │   └── blade_geometry.py
│       ├── io/
│       │   ├── csv_reader.py
│       │   └── control_points.py
│       └── plotting/
│           └── bezier_plots.py
├── routers/
│   └── v1/
│       ├── health.py
│       ├── curves.py
│       ├── exports.py
│       └── sections.py
├── scripts/
│   ├── build_bezier.py
│   ├── build_bezier_interactive.py
│   └── plot_default.py
└── data/
    ├── csv/
    ├── iges/
    └── marinAI_Logo.png
```

## Data Model (Pydantic)

### Six radial properties

Each blade is described by six scalar properties sampled along normalized radius, `r/R`.

| Property | Frontend/UI meaning | Backend key |
|---|---|---|
| Chord | Blade width/area distribution, normalized as `c/D` | `chord` |
| Pitch | Axial advance per revolution, normalized as `P/D`; affects thrust and angle of attack | `pitch` |
| Rake | Axial section position, normalized as `z/D`; affects root stress and cavitation behavior | `rake` |
| Skew | Angular section offset in degrees; spreads load and can reduce noise/vibration | `skew` |
| Camber | Mean-line curvature relative to chord, `f/c`; affects sectional lift | `camber` |
| Thickness | Maximum section thickness relative to chord, `t/c`; affects strength and cavitation | `thickness` |

In the API model, each property is a list of `{x, y}` control points:

- `x` is normally a normalized radial station.
- `y` is the property value at that station.

Pydantic accepts variable-length point lists. The backend does not require all six properties to have the same number of control points.

### Canonical constants

Important backend constants live in `core/schemas/constants.py`.

- `PLOT_KEYS`: `chord`, `pitch`, `rake`, `skew`, `camber`, `thickness`
- `N_CURVE_POINTS`: `100`
- Default 12-station `RADII`:
  - `0.25`
  - `0.35`
  - `0.4`
  - `0.5`
  - `0.6`
  - `0.7`
  - `0.8`
  - `0.85`
  - `0.9`
  - `0.95`
  - `0.975`
  - `1.0`

The fixed `RADII` array is used for STL and parametric IGES generation. Section-table endpoints instead use a user-controlled number of linearly spaced stations between `start_r` and `end_r`.

The default starting design has four control points per property:

- Skew ranges from `-10` to `11`, so negative values are legitimate for skew.
- Camber defaults to zero at all four control points.
- Thickness declines from root to tip.
- Chord, pitch, and rake have smooth nonzero defaults.

`INITIAL_POINTS` is backend state and the frontend’s `/curves/init` reset source.

### `ParametricInput` validation

`ParametricInput` contains:

- Six control-point lists
- `start_r`, default `0.25`
- `end_r`, default `1.0`
- `n_sections`, default `12`
- `n_blades`, default `5`
- `filename`, default `blade.iges`
- `include_control_points`, default `false`

The current validation rules are:

- `start_r >= 0`
- `start_r < end_r`
- `n_sections >= 2`
- `3 <= n_blades <= 7`
- Every camber control point must satisfy `y >= 0`
- Every thickness control point must satisfy `y >= 0`

The camber/thickness rule is important. A Bézier curve remains inside the convex hull of its control points, so nonnegative camber and thickness control points prevent their interpolated properties from becoming negative. This turns a previously common invalid-geometry failure into an early FastAPI 422 validation error.

Validation does not prohibit negative chord, pitch, rake, or skew control points. Skew, in particular, can legitimately be negative. The UI clamps dragged x values to `[0.25, 1.0]` and clamps camber/thickness y to `>= 0` in `DraggablePlot`, but it still permits nonmonotonic x ordering; `np.interp` assumes suitable x ordering, so malformed or highly nonmonotonic control-point x values remain a potential source of incorrect interpolation rather than a guaranteed validation error.

## The Math: Bézier Curves

### General Bézier implementation

`core/utils/domain/bezier.py` implements Bézier curves of arbitrary order using Bernstein polynomials.

For control points \(P_0 \dots P_n\) and parameter \(t\):

```text
B(t) = sum(C(n,i) * (1-t)^(n-i) * t^i * P_i)
```

Important methods include:

- `get_points(n_points)`: sample the curve.
- `evaluate(t)`: evaluate supplied parameter values.
- `plot(ax, ...)`: draw curves and annotate endpoints.
- `compute_property(radii)`: linearly interpolate sampled Bézier values onto requested radii.
- `from_curve(x, y, order)`: solve a least-squares system for interior control points while holding endpoints fixed.

The production API does **not** always use cubic curves, even where surrounding comments say “cubic.” `interpolate_curve` constructs a Bézier whose order equals one less than the number of supplied control points. Thus:

- Four points produce a cubic curve.
- More or fewer points produce a different-degree curve.
- Fewer than two points are returned unchanged.

The CSV fitting path is specifically cubic, but the direct curve-update path is arbitrary-order interpolation.

### CSV fitting

`core/services/fitting.py` fits one cubic Bézier per property:

1. Read `Radii (adim)` and the six project-table properties.
2. Fix the first control point to the first data point.
3. Fix the last control point to the last data point.
4. Parameterize the data chordwise from cumulative arc length.
5. Use `scipy.optimize.least_squares` to solve for the two interior control points.
6. Constrain interior-point x coordinates to remain within the data’s x range.
7. Sample 100 points along the fitted curve.
8. Return fitted control points, sampled curve points, raw data, and RMSE.

If the caller supplies control points directly through the optional control-point CSV, the service skips fitting for those properties and reports `rmse: 0.0`.

The fitter assumes the input rows are in a usable radial order. It does not explicitly sort or validate monotonic x values.

### Composite Bézier support and caveats

The codebase supports `CompositeBezier` objects for offline or experimental use, including:

- Multiple segments
- Per-segment ranges
- A central control-point list
- A segment mapping
- JSON persistence with `{key}_x`, `{key}_y`, and optional `{key}_mapping`

The live API curve path does not consume composite mappings. It treats supplied control points as one Bézier object.

`CompositeBezier.from_curve` defaults `orders` to a cubic per segment when it is omitted:

```python
if orders is None:
    orders = [3] * (len(x_ranges) - 1)
```

An earlier version had `if orders == None: orders == [3]` (a comparison, not an assignment), which left `orders` as `None` and crashed any caller that did not pass it. Callers may still pass `orders` explicitly, and the offline interactive script does so.

## Services

### From control points to a `BladeX.Blade`

`build_blade_from_input` performs these steps:

1. Convert each property’s control points into a `Bezier`.
2. Evaluate all six properties at the requested radii.
3. Build airfoil sections from thickness and camber distributions.
4. Construct a `BladeX.Blade` from:
   - Sections
   - Radii
   - Chord lengths
   - Rake
   - Pitch
   - Skew angles

The function returns two values; its docstring was updated to match:

```text
blade, props
```

### Section construction

`build_sections` uses a NACA baseline profile and reshapes it per radius using the requested maximum thickness and camber.

Important details:

- The API’s parametric path uses NACA baseline digits `'5407'`.
- `build_sections` itself defaults to `'2408'`.
- One offline script explicitly uses `'2408'` with constant 8% thickness and 2% camber.
- Values between `-1e-12` and zero are clamped to zero to absorb floating-point edge effects.
- Materially negative camber or thickness raises `InvalidGeometryError`.
- The final tip station becomes a zero-thickness degenerate plate.

The Fincantieri-style `generate_radii` distribution concentrates stations near the tip using successively smaller intervals. It is used by legacy/global-property flows, not by the fixed 12-station STL path.

### BladeX coordinate ordering and the section-radius fix

BladeX’s cylindrical section generation iterates sections and radii in reverse. Consequently:

```text
blade_coordinates_up[0]  -> tip / largest radius
blade_coordinates_up[-1] -> root / smallest radius
```

The current `/v1/sections/points3d` implementation explicitly compensates by pairing coordinate index `idx` with `r[::-1][idx]`. Therefore the first `radius` column now contains the actual radial station for those coordinates. The offline `plot_default.py` script contains the same ordering assumption and reverses coordinate arrays before surface plotting.

This replaces the older mirrored-label behavior in which coordinate blocks were labeled with the opposite end’s radius. The frontend parser was changed at the same time to consume the corrected first column directly.

### STL and IGES generation

The newest STL path no longer calls BladeX’s `Propeller.tmp_stl`; it uses a local OCC implementation that mirrors that behavior while exposing more meshing control.

For STL:

1. Build the parametric blade.
2. Add a cylindrical shaft with radius `250` and height `300`.
3. Construct a `Propeller` with the requested blade count.
4. Sew each blade’s upper, lower, root, and tip faces with a `1e-2` sewing tolerance.
5. Mesh with linear deflection `0.02` and angular deflection `0.3`.
6. Write a binary STL.
7. Copy it to `EXPORT_DIR/<uuid>.stl`.
8. Return a relative `/v1/exports/<uuid>.stl` URL.

For parametric IGES:

1. Build the same blade and propeller.
2. Sew each blade’s upper, lower, root, and tip faces with a `1e-2` tolerance and collect them with the shaft into a single compound, written with `IGESControl_Writer` (IGES is B-Rep, so no meshing). This mirrors the STL writer and deliberately avoids BladeX’s `Propeller.shape`/`Blade.generate_solid`, which sews at `1e-7` and hard-casts the result to a `TopoDS_Shell` — a geometry-dependent crash (`Standard_TypeMismatch`) whenever the faces do not close into one shell.
3. Copy it to `EXPORT_DIR/<uuid>.iges`.
4. Return a relative `/v1/exports/<uuid>.iges` URL.

For CSV-based global IGES:

1. Read global properties from an uploaded CSV (one value per table row).
2. Generate Fincantieri-style radii.
3. Fit one composite Bézier per property to the table and resample the properties onto the generated radii (mirroring the interactive editor’s global flow). Previously the raw per-row arrays were passed straight to `build_sections` alongside the longer generated radii, causing an `IndexError`.
4. Build sections and a `Blade`, then call `blade.build()` (transforms + OCC faces), rotate 180 degrees about z, and write the IGES with `blade.export_iges(..., include_le_curves=True)`.
5. Copy the artifact into `EXPORT_DIR` and return a `FileResponse` from there, so removing the temporary build directory cannot delete the file mid-stream. The download name is preserved.

### Export-file handling

Generated STL, parametric IGES, and CSV-to-IGES artifacts use UUID filenames under a local export directory.

- The directory is configurable via `EXPORT_DIR` (default `/tmp/exports`), so deployments can point it at persistent storage.
- A best-effort retention sweep (`EXPORT_RETENTION_HOURS`, default `24`) runs before each new export and deletes older files, so the directory cannot grow without bound.
- The downloader sanitizes the requested filename with `os.path.basename`, preventing straightforward directory traversal. Missing files return 404.
- Downloads are authenticated but not scoped per user; anyone possessing a UUID URL can download that export (UUIDs are unguessable, but this remains a design caveat).
- With the default `/tmp` location, restarting or clearing `/tmp` still invalidates returned URLs — point `EXPORT_DIR` at persistent storage for durable links.
