---
outline: deep
---

# <img src="/logos/applelogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> MacOS

macOS is Apple's Unix-based operating system, built on Darwin and the BSD family. It offers a polished graphical desktop, but underneath it ships a full Unix shell (zsh by default) with the same core tools found on Linux, such as `ls`, `cd`, and `grep`. Most developer setup happens in the Terminal, and Homebrew is the package manager that fills the gap Apple leaves for command-line software.

## Terminal

The Terminal is where you install tools and run commands. Open it with **Cmd + Space**, type `Terminal`, and press Enter.

Common commands:

- `pwd`: Print the path of the current folder.
- `ls`: List the contents of the current folder. Add `-la` to include hidden files and details.
- `cd <folder>`: Change directory. `cd ..` goes up one level and `cd ~` returns to your home folder.
- `mkdir -p <folder>`: Create a folder, including any missing parent folders.
- `cp <src> <dest>` / `mv <src> <dest>`: Copy or move a file or folder.
- `rm <file>`: Delete a file. `rm -rf <folder>` deletes a folder and everything inside it, so use it carefully.
- `cat <file>`: Print the contents of a file.
- `open .`: Open the current folder in Finder.
- `man <command>`: Show the manual page for a command.
- `clear`: Clear the terminal screen.
- `Ctrl + R`: Search through your command history.

The default shell is **zsh**. Its configuration lives in `~/.zshrc`, which reloads every time you open a new terminal window.

## Homebrew

Homebrew (`brew`) is the de-facto package manager for macOS. Apple does not provide a way to install most command-line tools and open-source software, so Homebrew fills that gap by installing, updating, and removing packages from a single command.

### Installation

1. Install the Xcode Command Line Tools, which provide the compilers and headers Homebrew relies on:

```bash
xcode-select --install
```

2. Run the Homebrew installer:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

3. Follow the on-screen "Next steps" to add `brew` to your shell. On Apple Silicon it installs under `/opt/homebrew`; on Intel Macs it uses `/usr/local`.

### Essential Commands

- Install a command-line tool or library: `brew install <formula>`
- Install a graphical application: `brew install --cask <app>`
- Search for a package: `brew search <term>`
- Show details about a package: `brew info <formula>`
- List installed packages: `brew list`
- Update Homebrew and its package definitions: `brew update`
- Upgrade every outdated package: `brew upgrade`
- Upgrade a single package: `brew upgrade <formula>`
- Show outdated packages: `brew outdated`
- Uninstall a package: `brew uninstall <formula>`
- Remove old downloads and versions: `brew cleanup`
- Check for common problems: `brew doctor`
- Manage background services: `brew services list` / `brew services start <formula>`

::: tip
Prefer `brew install` over downloading installers manually whenever a package is available: Homebrew keeps everything updatable from one place and removes it cleanly later.
:::

::: info
If a Homebrew package fails to build or install, run `brew doctor` first, then check the package page at https://formulae.brew.sh/. Re-running `xcode-select --install` resolves many compiler-related failures.
:::

## Installing Apps Manually

Not every app is available on Homebrew. When you download software directly, pick the build that matches your Mac and prefer the standard macOS formats.

macOS runs on two CPU families, and download pages usually label their builds by architecture:

- **Apple Silicon** (M1, M2, M3, M4, ...): choose the `arm64` / `aarch64` build.
- **Intel** (older Macs): choose the `x64` / `x86_64` / `amd64` build.

Make sure you'll always select the Apple Silicon version, since it's what it is supported by FAST Computing's Macbooks.

### File formats

| Format | What it is | How to install |
| --- | --- | --- |
| `.dmg` | Disk image — the most common macOS installer | Double-click to mount, drag the app into **Applications**, then eject the disk |
| `.pkg` | Installer package | Double-click and follow the **Installer** wizard (it may ask for your password) |
| `.zip` | Compressed archive, usually containing a `.app` | Double-click to unzip, then drag the `.app` into **Applications** |
| `.app` | The application bundle itself | Move it into **Applications** |

`.dmg` is the usual, safest choice for a graphical application, and `.pkg` is used when the app needs to place files in specific system locations. Avoid source archives (`.tar.gz`, `.zip` of raw source) unless the project expects them; Homebrew handles those for you.

When a vendor publishes a checksum, verify the download before opening it:

```bash
shasum -a 256 ~/Downloads/<file>.dmg
```

### Gatekeeper and first launch

macOS blocks apps that are not notarized by Apple, showing a message like *"cannot be opened because the developer cannot be verified."* Approve it once under **System Settings > Privacy & Security** (click **Open Anyway**). Only do this for software you trust.

Prefer `brew install --cask <app>` when the app is available: it downloads the correct build, installs it, and keeps it updatable.

## Architectures and Environments

The `arm64` vs `x86_64` split is not limited to app downloads: it also decides which prebuilt dependencies your development environments can use. 

### Why the environment file changes

Conda and micromamba resolve packages from binaries that are built per platform and architecture. The relevant subdirs are:

| Subdir | Platform |
| --- | --- |
| `linux-64` | x86_64 Linux — the old Arch Linux setup |
| `linux-aarch64` | ARM64 Linux |
| `osx-64` | Intel macOS |
| `osx-arm64` | Apple Silicon macOS |

An environment YAML pinned to `linux-64` or `x86_64` will not resolve on `osx-arm64`, so the same project often needs a separate file per architecture.

### Practical rules

- Keep one environment file per architecture and name it clearly (`*_amd.yml` / `*_arm.yml`). There is no built-in arm/amd selector for environment files, so the choice of file is manual (see below).
- Never copy a `conda`/`micromamba` environment, a `.venv`, or a `node_modules` folder between machines of different architectures. Recreate them from the YAML or lockfile instead.
- Python packages: `uv` and `pip` select the matching wheel automatically, but a package that only publishes an `x86_64` wheel may need to build from source or be swapped for an alternative.
- Prefer [uv](../package-managers/uv) for pure-Python projects, and reach for [micromamba](../package-managers/micromamba) when you need non-Python or compiled dependencies (VTK, OpenCASCADE, and similar).

### Creating and maintaining the two files

**Is it automatic? Partly.** Conda and micromamba never choose between `*_amd.yml` and `*_arm.yml` for you — the solver only resolves packages for the machine it is running on, and you pass the file explicitly:

```bash
micromamba create -f marinai_arm.yml   # Apple Silicon
micromamba create -f marinai_amd.yml   # x86_64 Linux or Intel macOS
```

What *is* automatic is the build selection **inside** a file. If the YAML lists packages without build strings (`numpy=2.2.2` rather than `numpy=2.2.2=py311h5b1c_0`), micromamba downloads the correct build for the current architecture on its own. A file only stops being portable when it pins build strings, points at a channel with no `osx-arm64` build, or requests a package that does not exist for ARM.

Because of that, the recommended way to create the ARM file is to export the working x86_64 environment without build pins and then test it on the Mac — not to hand-edit a copy:

```bash
# Export from the working x86_64 environment:
micromamba env export -n <env_name> --no-builds > environment_arm.yml

# --from-history is stricter: it exports only the packages you explicitly
# asked for, letting the solver re-resolve every transitive dependency.

# Check whether a package even exists for Apple Silicon before committing to it:
micromamba search <package> --platform osx-arm64
```

If a package has no `osx-arm64` build, replace it with an alternative or drop its pin so the solver can pick a compatible version.

You can also resolve a file for the other machine up front:

```bash
micromamba create -n <env_name> -f environment.yml --platform osx-arm64
```

::: warning
The environment itself is architecture-specific and must not be committed or copied between machines. The `.yml` (or a lockfile) is the portable artifact — recreate the environment on each machine from it.
:::

### Docker

Container images are architecture-specific as well: build or pull `linux/amd64` for Intel and CI, and `linux/arm64` for Apple Silicon. The [marinAI deployment docs](../../apps/marinai/deployment) document this split, with separate AMD64 and ARM64 image workflows.

::: tip
If micromamba resolves the wrong platform, set `CONDA_SUBDIR=osx-arm64` before creating the environment and keep it consistent for every later `install`.
:::

## Everyday Basics

Useful system shortcuts and commands:

- **Cmd + Space**: Open Spotlight to launch apps and search files.
- **Cmd + Tab**: Switch between open applications.
- **Cmd + Q**: Quit the active application.
- **Cmd + Shift + .**: Show or hide hidden files in Finder.
- **Cmd + Shift + 3 / 4 / 5**: Take a screenshot (full screen, selection, or the screenshot toolbar).
- `sw_vers`: Show the macOS version.
- `uname -a`: Show kernel and architecture details.
- **Apple menu > About This Mac**: View model, chip, memory, and storage.

## MacBook Hardware Tips

Care for the machine and the battery lasts for years. A few habits cover almost everything:

- **Leave it plugged in at your desk.** Keeping a MacBook connected to power does **not** damage the battery. macOS manages charging for you and, after learning your routine, may deliberately hold the charge around 80% (Optimized Battery Charging) when the laptop stays plugged in for long stretches. That is expected behavior, not a fault — there is no need to unplug it to "save" the battery.
- **Heat is the real enemy, not charging.** A battery ages fastest when it runs hot. Avoid direct sunlight, hot cars, and soft surfaces such as beds or cushions that block the vents. On fanless MacBook Airs, heavy sustained workloads make it warm and throttle — that is normal, but give it airflow.
- **Check battery health** under **System Settings > Battery > Battery Health**, or from the Terminal (command shown below).
- **Clean the screen with a soft, lint-free cloth**, lightly dampened with water: a 70% isopropyl alcohol wipe is also fine on standard glass, but avoid abrasive or ammonia-based cleaners.
- **Handle the ports gently.** Pull cables out by the connector, not the cord, and do not rest heavy objects on plugged-in cables.
- **Keep liquids away.** Liquid damage is expensive and is not covered by the standard warranty: even a small spill can destroy the logic board.
- **Back up with Time Machine** to an external drive or a network location, so a hardware failure or an accidental deletion is recoverable.
