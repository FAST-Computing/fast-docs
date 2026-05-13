---
outline: deep
---

# <img src="/logos/uvlogo.svg" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> uv

uv is designed to be a drop-in replacement for almost every major tool in the Python development lifecycle.

- Manages and installs multiple Python versions automatically.
- Provides full project management with a universal lockfile (`uv.lock`) for reproducible builds.
- It can run and install Python-based CLI tools in isolated environments.
- Creates and manages virtual environments at lightning speed.
- Handles package uploads and distribution.

::: info
**When to use:** uv is designed exclusively for Python-based projects and backends, as its dependency management is scoped strictly to the Python ecosystem.
:::

## Installation

::: code-group

```sh [Linux]
curl -LsSf https://astral.sh/uv/install.sh | sh
```
:::

## Essential Commands

You may find all the easy-to-understand, essential commands and usage at the following link: https://docs.astral.sh/uv/