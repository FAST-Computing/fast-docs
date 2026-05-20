---
outline: deep
---

# <img src="/logos/micromambalogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> Micromamba

Micromamba is a statically linked C++ executable that provides the full power of the Conda ecosystem without needing a pre-installed Python "base" environment. Unlike pip, uv and other package managers, Conda can manage libraries written in C, C++, or R, which is vital for machine learning and AI work.


::: info
**When to use:** Micromamba is preferred for projects requiring polyglot or non-Python dependencies; for repositories strictly focused on the Python ecosystem, [uv](uv) remains the optimized choice.
:::


## Installation

::: code-group

```sh [Arch Linux]
yay micromamba-bin
```
:::

## Initialize and Verify

```sh
micromamba shell init -s bash
```

::: info
If the command above fails, run this before repeating the same step again:
`export MAMBA_ROOT_PREFIX=~/micromamba`
:::


```sh
source ~/.bashrc
micromamba --version
```

If you need activation support only for current shell session, you can load shell hook manually instead:

```sh
eval "$(micromamba shell hook -s bash)"
micromamba activate <env_name>
```

## Channels

Micromamba pulls packages from channels. In practice, many scientific and data packages are commonly installed from `conda-forge`.

```sh
micromamba config append channels conda-forge
micromamba config set channel_priority strict
```

::: tip
Strict channel priority helps keep dependency resolution more predictable.
:::


## Core Workflow

::: warning
Don't "brainlessly" run the following commands, since you need to replace the <> values.
:::

### Environment Management

#### Create
::: code-group
```sh [Standard]
# The basics: environment creation
micromamba create --name <env_name> python=3.11
```
```sh [Create and install packages]
# You can target specific packages, versions and channels (like conda-forge)
micromamba create -n <env_name> -c conda-forge python=3.11 <packages>
```
```sh [Build from YAML]
# Environments can be built given an existing .yml file
# NOTE: You can specify the environment name adding "-n <env_name>".
micromamba create -f <filename>.yml
```
```sh [Local]
# Keep the environment physically inside the project folder 
# (like a .venv) instead of Micromamba's central registry.
# NOTE: To activate this later, you will need to point to the path: 
#   micromamba activate ./env
micromamba create -p ./env python=3.11 <packages>
```
:::

Example `environment.yml`:

```yaml
name: myenv
channels:
	- conda-forge
dependencies:
	- python=3.11
	- numpy
	- pip
```

Once created, don't forget to always activate your environment:
```sh
micromamba activate <env_name>
```

::: tip
Micromamba also allows you to run a command inside an environment without activating it first:
```sh
micromamba run -n <env_name> python <script_name>.py
```
:::

At some point, you may also want to temporarily "quit" your environment:
```sh
micromamba deactivate
```

#### Delete

::: code-group
```sh [Standard]
# Remove the environment. Cleanly
micromamba env remove -n <env_name>
```
```sh [By name]
# You can target the environment either by its name or its directory path
micromamba env remove -p ./env_folder
```
:::

::: tip
Alternatively, you can skip the word `env` entirely by utilizing the standard package removal command paired with the `--all` flag (which instructs Micromamba to strip away all packages, wiping out the environment).
:::


#### Extra
::: code-group
```sh [Environment List]
# For the sake of clarity, better check the existing ones
micromamba env list
```
```sh [Export to YAML]
# As they can be imported, environments can be also exported to .yml files
micromamba env export > environment.yml
```
:::


### Package Management

::: code-group
```sh [Install]
# Install a package. Or more, just list them
# You can optionally specify their version (<package_name=version_number>)
micromamba install <package_name>
```
```sh [Remove]
# Remove a package from the environment
micromamba remove <package_name>
```
```sh [Update]
# Update a package. Better than reinstalling it
micromamba update <package_name>
```
```sh [Search]
# Search for packages and channels
micromamba search <package_name>
```
```sh [List]
# Gives a list of all the packages in the environment
micromamba list
```
```sh [Cache]
# Installing packages builds up cache. Give it a flush, sometimes
micromamba clean --all
```
:::
