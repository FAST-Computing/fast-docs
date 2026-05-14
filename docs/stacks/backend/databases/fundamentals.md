---
outline: deep
---

# <img src="/logos/database.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> Database Fundamentals

### What is a Database?

A **database** is an organized collection of structured information stored electronically.
Unlike simple files or spreadsheets, a database is designed to efficiently store, retrieve, update, and protect data even when applications grow large.

---

### What is a DBMS?

A **DBMS (Database Management System)** is the software that manages databases.

It acts as the intermediary between your application and the stored data.

Instead of manually editing files, your application asks the DBMS to:

- store new data
- retrieve existing data
- update records
- delete information
- enforce access permissions
- maintain consistency
- handle concurrent users safely
- recover from failures

PostgresSQL is just a DBMS, but there are many others like MySQL, SQLite, SQL Server, Oracle.

---

### What is SQL?

**SQL (Structured Query Language)** is the standard language used to communicate with relational databases.

SQL allows you to describe *what* you want, while the DBMS decides *how* to execute it efficiently.

Example:

```sql
SELECT * FROM users;
```

This means:

> "Retrieve every row from the users table."

SQL is declarative, meaning you describe the result you want rather than the exact implementation steps.

---

### DBMS + SQL Relationship

Application → SQL Query → DBMS → Database Storage

Example:

Your application sends:

```sql
INSERT INTO customers (name, email)
VALUES ('Alice', 'alice@company.com');
```

The DBMS:

- validates syntax
- checks permissions
- verifies constraints
- writes the data safely
- updates indexes
- confirms success

---

### Relational Databases

PostgreSQL is a **Relational DBMS (RDBMS)**.

"Relational" means data is organized into related tables.

Example:

**users**

| id | name |
|----|------|
| 1  | Alice |

**orders**

| id | user_id | total |
|----|---------|-------|
| 5  | 1       | 120€  |

The `user_id` links the order to the user.

This creates structured relationships between entities.

---

### Core Concepts

**Table**  
A collection of structured records.

Like a spreadsheet sheet.

---

**Row (Record)**  
One individual entry.

Example:

```text
1 | Alice | alice@company.com
```

---

**Column (Field)**  
A specific type of information.

Examples:

- id
- email
- created_at
- salary

---

**Primary Key**  
A unique identifier for each row.

Example:

```sql
id UUID PRIMARY KEY
```

---

**Foreign Key**  
A reference to data in another table.

Example:

```sql
user_id REFERENCES users(id)
```

This enforces valid relationships.

---