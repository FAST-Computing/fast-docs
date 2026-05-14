---
outline: deep
---

# WireGuard

Use WireGuard when you need to connect securely to your FAST working machine from outside the office (for example, while working from home).

## Installation

Install WireGuard from the official website:

https://www.wireguard.com/install/

::: important
Your laptop and your working machine cannot be connected to Cisco (SISSA VPN) at the same time. Use only one VPN connection at a time.
:::

::: important
Request your personal `wg.conf` file in the `fast_vpn` Slack channel.
:::

## Connect With WireGuard

1. Open the WireGuard app.
2. Import your `wg.conf` file.
3. Activate the tunnel.

When the tunnel is active, you can connect to your remote machine as usual (for example via SSH or VS Code Remote - SSH).

## Troubleshooting

- If the tunnel does not start, verify that you imported the correct `wg.conf` file.
- If connection is unstable, disconnect other VPN clients and reconnect.
- If access still fails, ask for support in the `fast_vpn` Slack channel.
