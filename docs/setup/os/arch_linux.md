---
outline: deep
---

# <img src="/logos/archlogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> Arch Linux

Arch Linux is a "Do It Yourself" Linux distribution, so its most useful commands focus heavily on package management and system maintenance. While standard Linux commands like `ls`, `cd`, and `grep` apply, the soul of Arch lies in other system-specific utilities.


## yay

`yay` is a popular helper for Arch Linux. It simplifies the process of installing software from the Arch User Repository (AUR) by automating the manual steps of cloning, building, and resolving dependencies.

Since yay is an AUR package itself, you cannot install it via `pacman` directly on a fresh Arch install. You must build it manually once.

### Installation

1. Install Prerequisites

```bash
sudo pacman -S --needed base-devel git
```

2. Clone and Build

```bash
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```

### Essential Commands

- Updates: `yay`
- Installing Packages: `yay -S package_name`
- Searching: `yay -Ss search_term`
- Removing Packages: `yay -Rns package_name`
- Clean cached build files: `yay -Sc`
- Remove orphan/unneeded dependencies: `yay -Yc`
- System stats: `yay -Ps`


::: info
If a package fails to build, check the package page on https://aur.archlinux.org/. Often, other users have posted a fix in the comments.
:::
