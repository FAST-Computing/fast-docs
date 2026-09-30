---
outline: deep
---

# marinAI — API Reference

All business endpoints live under `/v1` and require Keycloak authentication. The only public endpoint is the health check. Request and response shapes are defined by the [backend data model](./backend#data-model-pydantic).

## API Reference (v1)

All business endpoints require authentication. The only public endpoint is the health check.

### Health

```text
GET /v1/
```

Response:

```json
{
  "message": "Parametric Propeller API - running",
  "supported_versions": ["/v1"]
}
```

### Default curves

```text
GET /v1/curves/init
```

Returns an object with six entries:

```json
{
  "chord": {
    "control": [{"x": 0.25, "y": 0.03}],
    "curve": [{"x": 0.25, "y": 0.03}]
  }
}
```

The frontend uses this both on initial load and for reset.

The response model also permits optional `num_blades` and `diameter` metadata in the frontend type, but the current backend response does not provide them. The frontend therefore retains its existing blade-count and diameter values after reset.

### Curve upload and fitting

```text
POST /v1/curves/upload
Content-Type: multipart/form-data
```

Fields:

- `csv_file`: required project-table CSV
- `cp_file`: optional control-point CSV

Behavior:

- Rejects a missing or non-`.csv` project file with 400.
- Rejects a non-`.csv` control-point file with 400.
- Uses uploaded control points directly where supplied.
- Fits cubic Bézier curves elsewhere.
- Converts processing failures into HTTP 500.
- Returns radii, raw data, fitted control points, interpolated curves, and RMSE values.

### Curve recomputation

```text
POST /v1/curves/{dataset}
Content-Type: application/json
```

Request:

```json
{
  "controlPoints": [
    {"x": 0.25, "y": 0.03}
  ]
}
```

Response:

```json
{
  "curvePoints": [
    {"x": 0.25, "y": 0.03}
  ]
}
```

The `{dataset}` path variable is validated against `PLOT_KEYS`: `chord`, `pitch`, `rake`, `skew`, `camber`, `thickness`. An unknown name returns HTTP 404 with the list of valid parameters, so `/v1/curves/anything` no longer behaves like `/v1/curves/chord`. The interpolation itself is the same regardless of dataset (the math only depends on the control points).

### CSV-to-IGES propeller generation

```text
POST /v1/propeller/iges
Content-Type: multipart/form-data
```

Fields:

- `csv_file`: required global-properties CSV
- `start_r`: default `0.25`
- `end_r`: default `1.0`
- `filename`: default `blade.iges`

Validation:

- CSV filename is required and must end in `.csv`.
- Radial bounds must satisfy `0.0 <= start_r < end_r`.
- Output names without `.igs` or `.iges` receive `.iges`.

`InvalidGeometryError` is allowed to propagate to the 422 handler. Other failures become HTTP 500.

### Parametric STL generation

```text
POST /v1/propeller/stl
Content-Type: application/json
```

The request is a full `ParametricInput` object. The endpoint always uses the backend’s fixed 12-station `RADII`, not the client’s `n_sections`.

Successful response:

```json
{
  "stl_url": "/v1/exports/<uuid>.stl"
}
```

### Parametric IGES generation

```text
POST /v1/propeller/parametric/iges
Content-Type: application/json
```

The request is again a full `ParametricInput` object. Successful response:

```json
{
  "iges_url": "/v1/exports/<uuid>.iges"
}
```

The backend README endpoint table does not yet list this newer endpoint.

### Export download

```text
GET /v1/exports/{filename}
```

The endpoint serves STL, IGES/IGS, or generic files from `EXPORT_DIR` (default `/tmp/exports`). Missing files return 404.

### Section table

```text
POST /v1/sections
Content-Type: application/json
```

The request is a `ParametricInput` object. The response depends on `include_control_points`:

- `false`: CSV named `tabella_progetto.csv`
- `true`: ZIP named `tabella_progetto.zip`, containing:
  - `tabella_progetto.csv`
  - `control_points.csv`

The section table uses a dynamically generated `np.linspace(start_r, end_r, n_sections)` range, unlike the fixed STL radii.

Control-point CSV columns are:

```text
parameter,cp_index,cp_x,cp_y
```

### Three-dimensional section points

```text
POST /v1/sections/points3d
Content-Type: application/json
```

The endpoint:

1. Builds the parametric blade.
2. Calls `apply_transformations`.
3. Writes upper and lower points for each section.
4. Uses the corrected true section radius in the first column.

CSV columns are:

```text
radius,side,index,x,y,z
```

`side` is either `upper` or `lower`. Coordinate rows are emitted tip-first because BladeX stores them tip-to-hub.

### Error behavior

| Situation | Current HTTP status |
|---|---|
| Missing bearer credentials | 403 from FastAPI’s `HTTPBearer` behavior |
| Invalid/expired bearer token | 401 |
| Token without `sub` | 401 |
| Pydantic request validation failure | 422 |
| Negative camber/thickness geometry | 422 |
| Missing export file | 404 |
| Unknown `{dataset}` on curve update | 404 |
| Invalid upload extension or radial bounds | 400 |
| Unhandled CSV or geometry-processing failure | 500 |

The distinction between a missing token and an invalid token matters. The frontend’s retry logic is designed around receiving 401 for supplied-token problems.

## Authentication (Keycloak)

### Configuration

The backend reads these variables from the process environment or local `.env`:

| Variable | Purpose |
|---|---|
| `KEYCLOAK_URL` | Keycloak server base URL |
| `KEYCLOAK_REALM` | Realm issuing access tokens |
| `KEYCLOAK_CLIENT_ID` | Client ID used only when audience verification is enabled |
| `KEYCLOAK_VERIFY_AUDIENCE` | `true` or `false`; default `false` |

A local `.env` file exists but is ignored by Git. Only `.env.example` is tracked. The example supplies no credential values.

Import-time behavior is strict:

- Missing `KEYCLOAK_URL` or `KEYCLOAK_REALM` raises `RuntimeError`.
- `KEYCLOAK_VERIFY_AUDIENCE=true` without `KEYCLOAK_CLIENT_ID` raises `RuntimeError`.

This means the backend intentionally refuses to start without usable Keycloak configuration.

### Verification model

`core/auth/deps.py`:

1. Loads dotenv configuration.
2. Builds the issuer as `{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM}`.
3. Builds the JWKS URL as `{issuer}/protocol/openid-connect/certs`.
4. Uses FastAPI `HTTPBearer`.
5. Uses PyJWT `PyJWKClient` with cached keys and a one-hour lifespan.
6. Decodes bearer tokens using RS256.
7. Verifies issuer always.
8. Verifies audience only when explicitly enabled.
9. Requires a `sub` claim.
10. Returns a typed `UserPayload`.
11. Converts other token problems to HTTP 401.

`UserPayload` permits unknown extra claims through Pydantic `extra="allow"`, while requiring `sub` and `exp` and optionally carrying `preferred_username`, `email`, and `aud`.

Router-level dependencies protect:

- `routers/v1/curves.py`
- `routers/v1/exports.py`
- `routers/v1/sections.py`

Only `routers/v1/health.py` remains public.

The backend never needs `KEYCLOAK_CLIENT_SECRET`. It validates presented access tokens using public realm keys; it does not exchange authorization codes or refresh tokens.

## CSV Formats

### Project-table CSV

Expected headers:

```text
Radii (adim),Chord lengths,Skew angles,Pitch,Rake,Camber,Thickness
```

Sample project tables include Fincantieri-style and GBI-style datasets. The parser expects exact header strings and converts every field to floating-point numbers.

### Control-point CSV

Expected headers:

```text
parameter,cp_index,cp_x,cp_y
```

Unknown parameters are ignored. Indexes are sorted per parameter. If a property has override points, its RMSE is reported as zero.

### Exported section CSV

Generated headers are:

```text
Radii (adim),Chord lengths,Skew angles,Pitch,Rake,Camber,Thickness
```

Values are formatted with `%.15g`.

### Profile-coordinate CSV

`sections_properties.csv` contains literal Python-style coordinate arrays in quoted fields:

```text
Radii (adim),X upper coordinates,Y upper coordinates,X lower coordinates,Y lower coordinates
```

The legacy reader (`read_sections_properties`) parses those fields with `ast.literal_eval`, scales them by chord, constructs custom profiles, and normalizes chord length. This format is offline-only; the live API does not accept it.

### Global-properties sample caveat

The checked-in `data/csv/global_properties.csv` currently contains only:

```text
Radii (adim),Chord lengths,Pitch,Rake,Skew angles
```

It does **not** contain the `Camber` and `Thickness` columns required by `read_global_properties` / `read_project_csv`. Consequently, that specific sample cannot be used directly with the CSV-to-IGES global-properties reader or the project-curve fitter in its present form — use `tabella_progetto_FC.csv` or `tabella_progetto_GBI.csv` (canonical 7-column headers) instead.

### Control-point JSON format

Offline control-point JSON (`save/load_control_points`) uses keys such as:

```text
chord_x
chord_y
chord_mapping
pitch_x
pitch_y
...
```

Mappings identify composite Bézier segments. C1 continuity across segments is not automatic and must be enforced manually.

`load_control_points` currently expects all six standard properties to be present. A JSON file missing one of those keys raises a key error. The live `POST /v1/curves/{dataset}` API uses `CurveRequest{controlPoints}` with no mapping field — composite mappings are offline-only.
