---
outline: deep
---

# <img src="/logos/postgreslogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> PostgreSQL

PostgreSQL is an advanced **Relational Database Management System (RDBMS)** designed for applications that require consistency, scalability, performance, and long-term reliability. It is ideal for applications that need secure data storage, complex relationships between entities, transactional consistency, and the ability to scale from small internal tools to large production platforms without changing database technology.

A **Database** is the organized collection of your data.  
A **Table** is like a spreadsheet containing structured records.  
A **Row** is a single record (e.g., one customer).  
A **Column** defines the type of information stored (e.g., email, created_at, salary).

## Installation

::: code-group

```sh [Arch Linux]
yay postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl start postgresql
```

```sh [Docker]```

Check https://hub.docker.com/_/postgres to select the best release
If you're undecided, the best thing is always to take the last LTS (Long-Term Support) or the latest

Run a docker-compose with that image or run single container with that image with. Docker usually have a dedicated 5432 port to be used.

```sh
docker run --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=my_database \
  -p 5432:5432 \
  -d postgres:16
```

## First Usage

```sh
sudo -u postgres psql
```

Create a database:

```sql
CREATE DATABASE <nome_db>;
```

Create a new user:

```sql
CREATE USER app_user WITH PASSWORD 'strongpassword';
```

Grant permissions:

```sql
GRANT ALL PRIVILEGES ON DATABASE company_data TO app_user;
```

Exit:

```sql
\q
```

Connect with your new user:

```sh
psql -U app_user -d company_data -h localhost
```

## Basic Example

Create a table:

```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Insert data:

```sql
INSERT INTO employees (name, email)
VALUES ('Alice Smith', 'alice@company.com');
```

Query data:

```sql
SELECT * FROM employees;
```