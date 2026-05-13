---
outline: deep
---

# <img src="/logos/micromambalogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> Micromamba

Micromamba is a statically linked C++ executable that provides the full power of the Conda ecosystem without needing a pre-installed Python "base" environment. Unlike pip, uv and other package managers, Conda can manage libraries written in C, C++, or R, which is vital for machine learning and AI work.


::: info
**When to use:** Micromamba is preferred for projects requiring polyglot or non-Python dependencies; for repositories strictly focused on the Python ecosystem, [uv](uv) remains the optimized choice.
:::


## Installation

### Arch Linux

**1. Download from AUR using `yay`**

```bash
yay micromamba-bin
```

**2. Initialization**

```bash
micromamba shell init -s bash
```

::: info
If step 2 fails, run this before running the same step again:
`export MAMBA_ROOT_PREFIX=~/micromamba`
:::

**3. Verify**

```bash
source ~/.bashrc
micromamba --version
```


## Core Workflow

::: warning
Don't "brainlessly" run the following commands, since you need to replace the <> values.
:::

### Environment Management

- `micromamba create --name <env_name> python=<python_version>`: Create an environment
- `micromamba activate <env_name>`: Activate an environment
- `micromamba deactivate`: Deactivate the current environment
- `micromamba env list`: List all environments
- `micromamba env remove --name <env_name>`: Remove an environment
- `micromamba env export > <filename>.yml`: Environment export to a `.yml` file
- `micromamba env create -f <filename>.yml`: Build an environment from a `.yml` file

### Package Management

- `micromamba install <package_name>`: Install a package
- `micromamba install <package_name=version_number>`: Install a specific package version
- `micromamba list`: List installed packages
- `micromamba update <package_name>`: Update a package
- `micromamba search <package_name>`: Search for a package
- `micromamba clean --all`: Clean up cache to save space

___

::: tip
Micromamba also allows you to run a command inside an environment without activating it first:
```bash
micromamba run -n <env_name> python <script_name>.py
```
:::