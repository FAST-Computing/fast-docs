---
outline: deep
---

# <img src="/logos/database.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> How to Create Your First Database

This page explains how to design and create a first relational database using SQL, starting from basic concepts and moving toward practical table design best practices.

A database should not only store data, but store it in a way that is:

- easy to query
- easy to maintain
- flexible for future changes

A good database structure makes the application simpler.

---

## Creating a Database

```sql
CREATE DATABASE company_app;
```

Then connect to it:

```sh
psql -U postgres -d company_app
```

---

## Creating Your First Table

For example, let's create a `users` table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### What this means

- `id` uniquely identifies each user
- `name` and `surname` are required
- `email` must be unique
- `created_at` stores when the row was created

::: warning
Best Practice: Most tables should have a dedicated **Primary Key**, commonly named `id`.

A primary key uniquely identifies each record in the table and allows other tables to reference it safely through relationships.

Common choices are:

- sequential integers (`SERIAL`, `BIGSERIAL`)
- UUIDs (`UUID DEFAULT gen_random_uuid()`)

UUIDs are often preferred in distributed or enterprise systems because they avoid collisions across systems and are harder to guess externally.
:::

---

## Choosing Columns

Add a column when the information belongs directly to that entity.

Good example:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT
);
```

Here, `phone` belongs directly to the user.

Bad example:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  order_name TEXT,
  order_date DATE
);
```

Orders do not belong directly inside the users table. They should have their own table!

---

## When to Create a New Table

Create a new table when the data represents a separate entity.

Examples:

- users
- roles
- locations
- orders
- products

Prefer multiple focused tables instead of one oversized table, especially when representing different entities:

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id)
);
```

This avoids duplicated location data and makes future changes easier.

---

## Relationships Between Tables

### One-to-Many

One location can have many orders.

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location_id UUID REFERENCES locations(id)
);
```

Each order belongs to one location.

---

### Many-to-Many

Use a junction table when multiple records can be connected to multiple other records.

Example:

- one user can have many roles
- one role can belong to many users

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

This is more flexible than storing a single `role` column in `users`.

Even if today each user has only one role, a many-to-many structure makes future refactors easier.

---

## When to Use an Enum

Use an enum when the possible values are fixed and rarely change.

Example:

```sql
CREATE TYPE order_type AS ENUM (
  'product',
  'service',
  'digital'
);
```

Then use it in a table:

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type order_type NOT NULL
);
```

Enums are good for values controlled by the system. Avoid enums when values may be managed by users or change often.

For example, this is better as a table:

```sql
CREATE TABLE job_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);
```

Instead of:

```sql
CREATE TYPE job_role AS ENUM ('driver', 'manager', 'operator');
```

Use a table when you may later need:

- custom labels
- translations
- permissions
- descriptions
- active/inactive state
- sorting
- extra metadata

:::warning
When building a new database structure, always think to future improvements and refactors.
:::

---

## Common Constraints

Constraints protect your data.

### NOT NULL

Use when a value is required:

```sql
name TEXT NOT NULL
```

### UNIQUE

Use when a value cannot be duplicated:

```sql
email TEXT UNIQUE NOT NULL
```

### CHECK

Use for simple validation:

```sql
salary NUMERIC CHECK (salary >= 0)
```

### DEFAULT

Use when PostgreSQL should automatically provide a value:

```sql
created_at TIMESTAMPTZ DEFAULT NOW()
```

---

## Soft Delete vs Hard Delete

Hard delete:

```sql
DELETE FROM users WHERE id = '...';
```

This removes the row permanently.

Soft delete:

```sql
UPDATE users
SET active = FALSE
WHERE id = '...';
```

Soft delete is often better for business applications because historical data remains available.

---

## Database Example

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Best Practices

- use plural table names: `users`, `orders`, `locations`
- use `id` as the primary key
- prefer UUIDs over sequential integers when appropriate
- use `NOT NULL` when data is required
- use `UNIQUE` for emails, codes, and identifiers
- use foreign keys instead of duplicated text fields
- use junction tables for many-to-many relations
- use enums only for stable system values
- use separate tables for values that may grow or need metadata
- avoid deleting business data unless necessary
- design for future growth, not only the immediate use case
- normalize duplicated data into separate tables when possible