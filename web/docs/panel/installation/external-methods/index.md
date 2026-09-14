---
description: Install the Calagopus panel using platform-specific methods for TrueNAS SCALE and Unraid, which bundle the Panel and Wings in a single container.
---

# External Installation Methods

These methods install Calagopus through a specific NAS or homelab platform's own app system, bundling the Panel and Wings together, instead of following the generic [Docker](../docker.md), [Package Manager](../pkgmanager.md), or [Binary](../binary.md) installation guides.

::: info Homelab-oriented
Game servers are CPU- and RAM-intensive workloads that compete with your NAS's other duties. These setups are well suited for homelab use. For production hosting, consider running Wings on a dedicated machine connected to a standalone Panel instead, see the [main installation guide](../index.md).
:::

Choose your platform:

::::tabs
=== TrueNAS SCALE
See the [TrueNAS SCALE Installation](./truenas.md) guide. Install Calagopus directly from the TrueNAS Community Apps catalog, no manual Docker setup required. Includes Wings in the same container.

=== Unraid
See the [Unraid Installation](./unraid.md) guide. Install Calagopus from a Community Applications template. Includes Wings in the same container.
::::
