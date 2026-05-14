---
outline: deep
---

# <img src="/logos/dbmatelogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> dbmate

dbmate is a lightweight database migration tool designed to manage schema changes in a safe, repeatable, version-controlled way.

Instead of manually editing production databases, dbmate allows you to define schema changes as migration files that can be applied or reverted consistently across all environments.

---

## Why Use dbmate?

Imagine adding a new column manually:

```sql
ALTER TABLE users ADD COLUMN phone TEXT;
```

That works once.

But:

- what happens on staging?
- what happens in production?
- what if another developer forgets this change?
- what if you need to revert?

dbmate solves this by treating schema changes like source code.

Each migration is a versioned SQL file.

---

## Installation

dbmate can be used either as a locally installed CLI tool or as a Docker container.

::: code-group

```sh [npm]
npm install -g dbmate
```

```sh [Docker]
docker pull ghcr.io/amacneil/dbmate:latest
```

:::

Verify installation:

::: code-group

```sh [npm]
dbmate --version
```

```sh [Docker]
docker run --rm ghcr.io/amacneil/dbmate:latest --version
```

:::

If installed via npm, dbmate can be used directly from your terminal.

## Docker Setup

If you prefer containerized tooling, dbmate can also be executed through Docker without installing anything locally.

### Docker Run

```sh
docker run --rm \
  -v $(pwd)/db:/db \
  --network host \
  -e DATABASE_URL="postgres://app_user:strongpassword@localhost:5432/company_app?sslmode=disable" \
  ghcr.io/amacneil/dbmate:latest up
```

Explanation:

- `--rm` → removes container after execution
- `-v $(pwd)/db:/db` → mounts local migration folder
- `DATABASE_URL` → PostgreSQL connection string
- `up` → applies pending migrations

---

### Docker Compose (Temporary Service)

Add this service only when needed:

```yaml
services:
  dbmate:
    image: ghcr.io/amacneil/dbmate:latest
    container_name: dbmate
    restart: "no"
    volumes:
      - ./db:/db
    environment:
      DATABASE_URL: postgres://app_user:strongpassword@db:5432/company_app?sslmode=disable
    depends_on:
      - db
```

After use, it is common to comment it out:

```yaml
# dbmate:
#   image: ghcr.io/amacneil/dbmate:latest
#   container_name: dbmate
#   restart: "no"
#   volumes:
#     - ./db:/db
#   environment:
#     DATABASE_URL: postgres://app_user:strongpassword@db:5432/company_app?sslmode=disable
#   depends_on:
#     - db
```

Because dbmate is not a long-running application service.

:::warning
Docker is often preferred in team environments because it avoids requiring local CLI installation and guarantees consistent tooling versions.
:::

---

## Migration Folder Structure

dbmate creates migrations inside:

```text
db/migrations/
```

Example:

```text
db/
└── migrations/
    ├── 20260514103000_create_users.sql
    ├── 20260514120000_add_roles.sql
```

Each migration file contains:

```sql
-- migrate:up

SQL TO APPLY

-- migrate:down

SQL TO REVERT
```

---

## Creating a New Migration

Generate a migration file:

```sh
npx dbmate new create_users
```

```sh
docker run --rm \
  -v $(pwd)/db:/db \
  ghcr.io/amacneil/dbmate:latest new create_users
```

Result:

```text
db/migrations/20260514103000_create_users.sql
```

Example content:

```sql
-- migrate:up

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

-- migrate:down

DROP TABLE users;
```

---

## Applying Migrations

Run all pending migrations:

```sh
npx dbmate up
```

```sh
docker run --rm \
  -v $(pwd)/db:/db \
  --network host \
  -e DATABASE_URL="postgres://app_user:strongpassword@localhost:5432/company_app?sslmode=disable" \
  ghcr.io/amacneil/dbmate:latest up
```

Equivalent Docker Compose:

```sh
docker compose run --rm dbmate up
```

This:

- checks migration history
- applies only missing migrations
- updates migration tracking table

---

## Rolling Back

Undo the most recent migration:

```sh
npx dbmate down
```

```sh
docker compose run --rm dbmate down
```

Equivalent Docker:

```sh
docker run --rm ... down
```

This executes the SQL under:

```sql
-- migrate:down
```

for the latest migration.

---

## Migration Tracking

dbmate automatically creates:

```text
schema_migrations
```

inside your database.

This tracks already applied migrations.

Example:

| version |
|--------|
| 20260514103000 |
| 20260514120000 |

This prevents duplicate execution.

---

## Check Status

Shows pending/applied migrations:

```sh
dbmate status
```

---

## Dump Current Schema

Export current schema snapshot:

```sh
dbmate dump
```

Useful for:

- schema documentation
- CI validation
- backups of structure

Docker:

```sh
docker compose run --rm dbmate dump
```

---

## Best Practices

- one logical schema change per migration
- always write both `up` and `down`
- never edit already applied migrations
- create new migrations instead
- test migrations locally first
- keep migrations in version control
- use clear names (`add_user_roles`, not `fix_stuff`)
- backup production before major migrations