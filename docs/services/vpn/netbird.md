# NetBird VPN

NetBird is the FAST VPN. It lets you securely access authorized FAST servers and internal services when working outside the office, using your **FAST Google Workspace account**. Access is granted to approved users and devices only.

## Getting started

Follow these steps **once per device**. You will need an Internet connection and your FAST Google Workspace account.

### 1. Install NetBird

**macOS and Linux**

Open a terminal and run the official installation script:

```bash
curl -fsSL https://pkgs.netbird.io/install.sh | sh
```

Check the installation:

```bash
netbird version
```

- [ ] `netbird version` prints a version number.

> If the installation fails or requires administrator privileges, contact FAST IT. Do not download clients from unofficial sources.

### 2. Connect to the FAST server

Start NetBird with the FAST **self-hosted** management server:

```bash
netbird up --management-url https://netbird.fastcomputing.net
```

If using the graphical client instead, select **Self-Hosted** (not NetBird Cloud), enter `https://netbird.fastcomputing.net`, and choose **Connect / Sign in**.

- [ ] The server address is `https://netbird.fastcomputing.net`.
- [ ] The browser-based sign-in opens.

### 3. Sign in with Google Workspace

In the browser, select **Sign in with Google** and use your **FAST Google Workspace account** (`@fastcomputing.net`). Complete any Google multi-factor authentication prompts.

- [ ] Google sign-in completes using your FAST account (not a personal Google account).

### 4. Wait for FAST IT approval

On first sign-in, NetBird may report that your organization requires **manual approval**. This is expected.

Contact FAST IT in the **`fast_vpn` Slack channel** and provide your FAST email address and device name. An administrator must:

1. Approve your NetBird user account.
2. Verify that the new device appears in NetBird.
3. Add the device to the appropriate access group.

**User approval and device access are separate steps.** A successful Google sign-in does not automatically grant access to internal resources.

- [ ] FAST IT has approved my user account.
- [ ] FAST IT has confirmed that my device is registered and in the correct group.

Once approved, connect again if necessary:

```bash
netbird up
```

### 5. Verify access

Check VPN status:

```bash
netbird status -d
```

Look for:

```text
Management: Connected
Signal: Connected
NetBird IP: 100.x.x.x
```

Then check your assigned internal resources:

```bash
netbird networks ls
```

If you have been authorized to access FAST internal machines, you should see a selected network with a domain such as:

```text
Domains: *.internal.fastcomputing.net
Status: Selected
```

Finally, test a resource you have permission to use. For example, if your account has SSH access to Kmer:

```bash
ssh YOUR_USERNAME@kmer.internal.fastcomputing.net
```

Replace `YOUR_USERNAME` with your FAST Linux username. **SSH permissions are separate from NetBird permissions.**

- [ ] `Management` and `Signal` are `Connected`.
- [ ] A NetBird IP is assigned.
- [ ] My authorized internal resources appear in `netbird networks ls`.
- [ ] I can access an internal resource I am authorized to use.

> For a meaningful remote-access test, connect from outside the FAST office network (for example, using a mobile hotspot).

## Everyday use

After the first setup, you normally only need these commands:

**Connect to FAST VPN**

```bash
netbird up
```

**Check connection status**

```bash
netbird status
```

For more detail:

```bash
netbird status -d
```

**Disconnect from FAST VPN**

```bash
netbird down
```

You do **not** need to reinstall NetBird or repeat Google sign-in every day. You may be prompted to sign in again if your session expires or your organization requires reauthentication. On supported systems, you can also connect and disconnect through the NetBird graphical app.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Google sign-in fails | Use your FAST Workspace account and complete MFA. |
| **Waiting for approval** | Ask FAST IT to approve your user account. |
| Device appears **Offline** | Run `netbird up`, then check `netbird status`. |
| `Management: Disconnected` | Check Internet access and the configured self-hosted server URL. |
| `Relays: Unavailable` | Retry on a working Internet connection; if it persists, contact FAST IT. |
| `No networks available` | Ask FAST IT to check whether your **device** is in the correct NetBird access group. |
| Internal hostname cannot be resolved | Check VPN status and assigned networks; on macOS, use `dscacheutil -q host -a name kmer.internal.fastcomputing.net` to test system name resolution. |
| SSH fails even though NetBird is connected | Check that you are authorized for the destination and are using the correct FAST Linux username. |

If a problem persists, post in the **`fast_vpn` Slack channel** with your operating system, device name, the resource you are trying to access, and the relevant command output:

```bash
netbird status -d
netbird networks ls
```

**Never share passwords, setup keys, tokens, or other credentials.**

## Links

- [FAST NetBird self-hosted dashboard](https://netbird.fastcomputing.net)
- [Official NetBird documentation](https://docs.netbird.io/)
