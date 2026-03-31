---
name: db-queries
description: "Use when: adding or modifying PostgreSQL access logic, schema changes, or query patterns."
---

# Database Query Skill

## Goals
- Use parameterized queries with pg.
- Read DB connection settings from environment variables.
- Enforce MD5 password storage in the database.

## Checklist
- Use a shared pg Pool.
- Use $1, $2 placeholders for parameters.
- Wrap DB calls in try/catch and return correct HTTP codes.
- Keep schema changes in backend/database/schema.sql.
