---
outline: deep
---

# SISSA VPN

Use SISSA VPN to access internal resources (for example FAST remote machines) when you are outside the SISSA network.

::: important
You need an active SISSA account and 2FA enabled.
:::

::: important
You cannot be connected to another VPN at the same time.
:::

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

## FAST Machine Management

At the moment, the two available machines are:

1. Penelope
2. Telemaco

## Connect To FAST Machines

You can connect either from a terminal or from VS Code.

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

The machines run Rocky Linux. To check OS details:

```sh
cat /etc/os-release
```

For Python projects, create isolated environments with `micromamba` or `uv`.

You do not have root permissions on these machines.

To check whether a system package already exists:

```sh
spack find package_name
```

To load an available package:

```sh
spack load package_name
```

If a package is missing, ask in the `fast_servers` channel.


## Transfer Files

Use `rsync` to transfer files between local and remote machines.

Upload from local to remote (run on your local machine):

```sh
rsync -avz --progress --update /path/to/local/storage/ user@remote.host:/path/to/save/
```

Download from remote to local (run on your local machine):

```sh
rsync -avz --progress --update user@remote.host:/path/to/copy/ /path/to/local/storage/
```

Full documentation:

https://download.samba.org/pub/rsync/rsync.1

## Troubleshooting

- If VPN login fails, verify your SISSA password and 2FA status.
- If SSH fails, confirm VPN is connected and host name is correct.
- If you need access support, contact ITCS (VPN issues) or write in `fast_servers` (machine access and packages).

