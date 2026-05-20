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


## Core Workflow

::: warning
Don't "brainlessly" run following commands. Replace placeholder values inside `<>` first.
:::

### Project Management

#### Create

::: code-group
```sh [New project]
# Create project with a ready-to-use pyproject.toml
uv init <project_name>
```
```sh [Current folder]
# Turn current directory into a uv-managed project
uv init
```
```sh [Library package]
# Create package-style layout instead of plain app skeleton
uv init --lib <project_name>
```
:::

If the project already exists, you can install the dependencies recorded in `pyproject.toml` and `uv.lock`:

```sh
uv sync
```

::: tip
`uv run <command>` auto-uses project environment, so manual activation is often not needed.
:::

#### Dependencies

::: code-group
```sh [Add]
# Add runtime dependency and update lockfile
uv add <package_name>
```
```sh [Add dev dependency]
# Good for linters, formatters, test tools
uv add --dev <package_name>
```
```sh [Remove]
# Remove dependency from project metadata and lockfile
uv remove <package_name>
```
```sh [Upgrade one package]
# Refresh specific dependency to newer compatible version
uv lock --upgrade-package <package_name>
```
```sh [Upgrade all]
# Re-resolve full lockfile against latest allowed versions
uv lock --upgrade
```
:::

If the lockfile already exists and you only want to install exact locked versions again:

```sh
uv sync --frozen
```

#### Run

::: code-group
```sh [Python script]
# Run code inside uv-managed environment
uv run python <script_name>.py
```
```sh [Module]
# Useful for package entry points and tools
uv run python -m <module_name>
```
```sh [Pytest]
# Example: test execution without manual activation
uv run pytest
```
```
:::

### Python Versions

::: code-group
```sh [Install Python]
# Download and register Python version for local use
uv python install 3.11
```
```sh [List available]
# Show discoverable and installed Python versions
uv python list
```
```sh [Pin version]
# Write preferred interpreter version into .python-version
uv python pin 3.11
```
:::

::: tip
Pinned Python version helps teams keep the same interpreter across machines.
:::

### Virtual Environments

::: code-group
```sh [Default .venv]
# Create local virtual environment in current project
uv venv
```
```sh [Custom path]
# Create environment with custom folder name
uv venv <env_name>
```
```sh [Specific Python]
# Build environment with exact interpreter version
uv venv --python 3.11
```
:::

To activate manually:

```sh
source .venv/bin/activate
```

To leave the environment:

```sh
deactivate
```

### Tools

`uv tool` installs Python CLI apps in isolated environments, similar to `pipx`.

::: code-group
```sh [Install tool]
# Install CLI globally without polluting project deps
uv tool install <tool_name>
```
```sh [Run once]
# Download if needed, run, then reuse cached environment later
uvx <tool_name>
```
```sh [Upgrade tool]
# Refresh installed CLI tool to newer version
uv tool upgrade <tool_name>
```
```sh [Remove tool]
# Uninstall previously installed CLI tool
uv tool uninstall <tool_name>
```
:::

### pip-Compatible Commands

`uv pip` becomes useful when you need fast `pip`-style commands inside an existing virtual environment.

::: code-group
```sh [Install]
# Install package into active environment
uv pip install <package_name>
```
```sh [Remove]
# Uninstall package from active environment
uv pip uninstall <package_name>
```
```sh [List]
# Show installed packages in active environment
uv pip list
```
```sh [Freeze]
# Export exact installed versions
uv pip freeze > requirements.txt
```
:::

## Example Flow

```sh
uv init myapp
cd myapp
uv python pin 3.11
uv add fastapi uvicorn
uv add --dev pytest ruff
uv run main.py
```

Official reference: https://docs.astral.sh/uv/