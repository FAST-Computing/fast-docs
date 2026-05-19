---
outline: deep
---

# SISSA VPN

Use SISSA VPN to access internal resources (High-Performance Computing) when you are outside the SISSA network.

> [!IMPORTANT] 
You need an active SISSA account and 2FA enabled. You cannot be connected to another VPN at the same time.


## Installation

Install **Cisco Secure Client** following the official SISSA instructions:

https://www.itcs.sissa.it/services/network/internal/vpnclient-win

If you are unsure which installer to use for your OS, check with ITCS before proceeding.

## Connect To SISSA VPN

1. Open Cisco Secure Client.
2. In the VPN address field, enter `vpn.sissa.it/sso`.
3. Click **Connect**.
4. Complete SISSA login and 2FA (password + phone code/app confirmation).

When the connection is active, you can access internal hosts via SSH.

## Connect to HPC

Currently, there are two available HPCs, **Penelope** and **Telemaco**. You can connect either from a terminal or from VS Code.

### Option 1: Terminal (SSH)

Use:

```sh
ssh your_name@machine_name.ma.sissa.it
```

Example:

```sh
ssh mrossi@penelope.ma.sissa.it
```

Useful commands:

```sh
passwd   # change your password
exit     # logout from remote shell
```

### Option 2: VS Code (recommended for coding)

1. Install these extensions:
	- **Remote - SSH**
	- **Remote Explorer**
2. Open **Remote Explorer** from the left sidebar.
3. Add a new SSH target with:

```sh
ssh your_name@machine_name.ma.sissa.it
```

4. Select the host and click Connect.

After first setup, the host will appear in the SSH targets list so you can reconnect quickly.

::: tip
Use `/home/$(whoami)/storage` as your main working directory on remote machines.
:::

## Environment Management

The HPC machines run Rocky Linux. If you need to confirm the system version, run:

```sh
cat /etc/os-release
```

For Python projects, use isolated environments. Prefer `micromamba` or `uv`.

::: warning
You do not have root permissions on these machines.
:::

Before installing anything manually, check whether the package is already available through `spack`:

```sh
spack find package_name
```

If it is available, load it with:

```sh
spack load package_name
```

If the package you need is not available, ask in the `fast_servers` channel.


## Transfer Files

Use `rsync` to move files between your local machine and the HPC systems. It is usually the safest choice because it is resumable and efficient.

Upload from local to remote. Run this on your local machine:

```sh
rsync -avz --progress --update /path/to/local/storage/ user@remote.host:/path/to/save/
```

Download from remote to local. Run this on your local machine:

```sh
rsync -avz --progress --update user@remote.host:/path/to/copy/ /path/to/local/storage/
```

Replace the example paths with your own local and remote directories.

Full `rsync` documentation: https://download.samba.org/pub/rsync/rsync.1

## Troubleshooting

- If VPN login fails, verify your SISSA password and 2FA status.
- If SSH fails, confirm VPN is connected and host name is correct.
- If you need access support, contact ITCS (VPN issues) or ask for help in the `fast_servers` Slack channel (machine access and packages).

