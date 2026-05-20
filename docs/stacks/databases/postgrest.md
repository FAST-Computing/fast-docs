---
outline: deep
---

# <img src="/logos/postgreslogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> PostgREST

PostgREST is a lightweight web server that automatically turns your PostgreSQL database into a fully functional REST API.

Instead of manually building backend CRUD endpoints like:

- `GET /users`
- `POST /orders`
- `PATCH /products/:id`

PostgREST generates them directly from your database schema.
PostgREST works by inspecting your PostgreSQL schema and exposing tables, views, and stored procedures as HTTP endpoints.

---

## Why Use PostgREST?

Without PostgREST, building a backend usually means:

- creating a web server
- defining routes
- writing SQL queries manually
- validating permissions
- handling serialization
- maintaining CRUD logic

With PostgREST:

- your database becomes your backend
- schema changes automatically reflect in APIs
- filtering, pagination, sorting, and joins come built-in
- PostgreSQL roles can directly control API access
- no custom CRUD boilerplate required

It dramatically reduces backend complexity.

---

## Docker Setup

A minimal Docker Compose setup:

```yaml
services:
  db:
    image: postgres:16
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: strongpassword
      POSTGRES_DB: company_app
    ports:
      - "5432:5432"

  postgrest:
    image: postgrest/postgrest:v14.1
    container_name: postgrest_api
    restart: always
    environment:
      PGRST_DB_URI: postgres://app_user:strongpassword@db:5432/company_app?sslmode=disable
      PGRST_DB_ANON_ROLE: app_user
      PGRST_DB_SCHEMAS: public
      PGRST_DB_PLAN_ENABLED: "true"
      PGRST_DB_AGGREGATES_ENABLED: "true"
      PGRST_JWT_SECRET: your_super_long_secret_key_here
      PGRST_JWT_SECRET_IS_BASE64: "false"
    ports:
      - "5000:3000"
    depends_on:
      - db
```

---

## Environment Variables Explained

### Database Connection

```yaml
PGRST_DB_URI
```

Connection string to PostgreSQL.

Example:

```text
postgres://app_user:strongpassword@db:5432/company_app
```

Format:

```text
postgres://USER:PASSWORD@HOST:PORT/DATABASE
```

---

### Anonymous Role

```yaml
PGRST_DB_ANON_ROLE
```

Default PostgreSQL role used when requests are unauthenticated.

Example:

```yaml
PGRST_DB_ANON_ROLE: readonly_user
```

This role must exist in PostgreSQL.

---

### Exposed Schemas

```yaml
PGRST_DB_SCHEMAS
```

Defines which schemas PostgREST can expose.

Example:

```yaml
PGRST_DB_SCHEMAS: public
```

Multiple schemas:

```yaml
PGRST_DB_SCHEMAS: public,api,analytics
```

---

### Query Planning

```yaml
PGRST_DB_PLAN_ENABLED
```

Enables execution plan inspection for debugging query performance.

```yaml
"true"
```

Optional but useful in development.

---

### Aggregates

```yaml
PGRST_DB_AGGREGATES_ENABLED
```

Allows aggregate queries like:

- count
- sum
- avg
- min
- max

Example:

```yaml
"true"
```

---

### JWT Authentication

```yaml
PGRST_JWT_SECRET
```

Secret used to validate JWT tokens.

If your frontend/backend generates JWTs, PostgREST can validate them and map claims to PostgreSQL roles.

Example:

```yaml
PGRST_JWT_SECRET: very_long_secure_secret
```

---

## Available APIs

Suppose you have this table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);
```

PostgREST automatically exposes:

---

### Get All Records

```http
GET /users
```

Example:

```bash
curl http://localhost:5000/users
```

---

### Get One Record

```http
GET /users?id=eq.<uuid>
```

Example:

```bash
curl "http://localhost:5000/users?id=eq.123"
```

---

### Insert

```http
POST /users
```

Example:

```bash
curl http://localhost:5000/users \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com"
  }'
```

---

### Update

```http
PATCH /users?id=eq.<uuid>
```

Example:

```bash
curl http://localhost:5000/users?id=eq.123 \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith"
  }'
```

---

### Delete

```http
DELETE /users?id=eq.<uuid>
```

Example:

```bash
curl http://localhost:5000/users?id=eq.123 \
  -X DELETE
```

---

## Filtering

PostgREST supports filtering directly in query parameters.

Equal:

```http
/users?name=eq.Alice
```

Not equal:

```http
/users?name=neq.Alice
```

Greater than:

```http
/orders?total=gt.100
```

Less than:

```http
/orders?total=lt.500
```

IN list:

```http
/users?id=in.(1,2,3)
```

LIKE:

```http
/users?name=like.*Ali*
```

---

## Sorting

Ascending:

```http
/users?order=name.asc
```

Descending:

```http
/users?order=created_at.desc
```

---

## Pagination

Limit:

```http
/users?limit=20
```

Offset:

```http
/users?offset=40
```

Combined:

```http
/users?limit=20&offset=40
```

---

## Selecting Specific Columns

Instead of returning all columns:

```http
/users
```

Select specific fields:

```http
/users?select=id,name
```

---

## Relationships / Joins

If foreign keys exist:

```sql
location_id UUID REFERENCES locations(id)
```

You can fetch related data:

```http
/orders?select=*,locations(*)
```

This behaves similarly to SQL joins.

---

## Stored Procedures (RPC)

Functions can be exposed as endpoints.

Example SQL:

```sql
CREATE FUNCTION me()
RETURNS TABLE (
  id UUID,
  name TEXT
)
AS $$
  SELECT id, name
  FROM users
$$ LANGUAGE sql;
```

Available at:

```http
POST /rpc/me
```

Example:

```bash
curl http://localhost:5000/rpc/me -X POST
```

---

## Authentication Example

Authenticated request:

```bash
curl http://localhost:5000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

PostgREST validates the token and applies PostgreSQL permissions.

---

## Best Practices

- never expose PostgreSQL superusers
- create dedicated API roles
- restrict anonymous access
- use JWT authentication
- expose only required schemas
- use views for safe public APIs
- move complex business logic into SQL functions
- rely on PostgreSQL permissions instead of app-side hacks

---

## Architecture Example

```text
Frontend App
     ↓
PostgREST API
     ↓
PostgreSQL
```

No traditional backend required for many use cases.