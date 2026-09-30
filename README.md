# Microsoft Discovery

**English** · [한국어](README.ko.md)

Hands-on guides and Azure architecture documentation for Microsoft Discovery, based on official sources checked on **2026-09-25**.

## Start here

| Document | Read on GitHub | Other formats |
|---|---|---|
| Core capabilities hands-on guide | [Read the guide](MICROSOFT-DISCOVERY-LAB.en.md) | [PDF](MICROSOFT-DISCOVERY-LAB.en.pdf) · [HTML](MICROSOFT-DISCOVERY-LAB.en.html) |
| Azure architecture and version dependencies | [Read the architecture](MICROSOFT-DISCOVERY-ARCHITECTURE.en.md) | Three SVG diagrams with Mermaid source included |

The hands-on guide covers **10 core labs and 2 extensions**: workspaces/projects, data and files, Bookshelf, agents and versions, compute tools, the Discovery Engine, human feedback, collaboration/RBAC, traceability, cost, and Hybrid/MCP tools. Each lab follows **Goal → Steps → Pass criteria**.

The architecture document separates API versions, model revisions, SKUs, and runtime versions. It explains cross-service dependencies and change impacts without inventing unpublished internal versions.

Use the Markdown or PDF links on GitHub. To view the HTML edition locally, download or clone the repository so its relative image links remain available.

## Execution status

The reference data is synthetic. Local calculations and document checks are **not proof of an Azure run**. On **2026-09-30**, the network foundation and a Workspace managed identity were deployed. An actual Discovery Workspace creation request failed with **HTTP 404 `InvalidResourceType`**. End-to-end Discovery execution and actual feature-execution recording remain blocked.

## Deployed foundation (2026-09-30)

The new [resource group `rg-discovery-hol-20260930`](https://portal.azure.com/#@46e9cdaa-fed3-4131-aa28-c1fc8a8a043a/resource/subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/rg-discovery-hol-20260930/overview) is in **Sweden Central**, in the subscription identified by `config/lab.json`. It contains VNet `vnet-discovery-hol` (`10.80.0.0/16`) and UAMI `id-discovery-hol`. The VNet has **exactly three subnets**, with no `default` subnet:

| Subnet | CIDR | Configuration |
|---|---|---|
| `workspaceSubnet` | `10.80.3.0/24` | `Microsoft.App/environments` delegation; `Microsoft.Storage` endpoint |
| `privateEndpointSubnet` | `10.80.4.0/24` | No delegation; private-endpoint network policies enabled |
| `agentSubnet` | `10.80.5.0/24` | `Microsoft.App/environments` delegation; `Microsoft.Storage` endpoint |

All three subnets disable default VM outbound access. No NAT gateway, NSG, private endpoint, VPN, compute, or storage account was created; the UAMI has not been assigned roles by this deployment. Dedicated subnets alone do not filter traffic between them.

The actual `PUT` for Workspace `discoveryholjunwoosc`, using API `2026-06-01` and the real subnet/UAMI IDs, was rejected before provisioning. `Microsoft.Discovery` is `Registered`, but `DefaultFeature` remains `Pending` and the `workspaces` resource type is absent. **No `Microsoft.Discovery/*` resource was created.** Microsoft must enable the subscription for Discovery before deployment can proceed.

In the follow-up, the six missing dependency providers were registered, and **all 25 providers in the official list were confirmed `Registered`**. However, post-registration Workspace listing returned **HTTP 404 `InvalidResourceType`** for both API `2026-06-01` and `2026-02-01-preview`. The [latest registration and access evidence](artifacts/discovery-registration-followup-20260930.json) preserves the responses and request IDs. Following the [official quickstart prerequisites](https://learn.microsoft.com/en-us/azure/microsoft-discovery/quickstart-infrastructure?tabs=portal#prerequisites) and guide L00, no additional resources or role assignments were created while service enablement remained blocked.

Sweden Central is one of the [official production regions](https://learn.microsoft.com/azure/microsoft-discovery/quickstart-infrastructure), alongside East US and UK South. Region-independent Workspace listing also returned `InvalidResourceType`, pointing to subscription/service enablement rather than an unsupported region. This does not establish that model or VM quotas are sufficient; those prerequisites still need checking after access is enabled.

The [request payload](infra/workspace-create.json) is a **creation-attempt payload, not a complete deployment template**: it preserves network isolation, disables public access, and has no attached supercomputer. The full guide still needs four additional dedicated subnets, Supercomputer, Bookshelf, storage, RBAC/NSP roles, model/VM quotas, and client connectivity. Do not assume that approval alone makes this payload a complete working environment.

[Network IaC](infra/main.bicep), [its parameters](infra/main.bicepparam), and [identity IaC](infra/identity.bicep) are retained. The original `config/lab.json` and historical guide examples still name the **20260925** resource group; use the new parameter file for the **20260930** network. These commands preview the separate deployments without creating resources:

```bash
az deployment sub what-if \
  --name discovery-network-20260930 \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --location swedencentral \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam

az deployment group what-if \
  --name discovery-identity-20260930 \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --resource-group rg-discovery-hol-20260930 \
  --template-file infra/identity.bicep
```

Evidence: [network deployment](artifacts/discovery-network-deployment-20260930.json), [live network state](artifacts/discovery-network-state-20260930.json), [identity deployment](artifacts/discovery-identity-deployment-20260930.json), [actual Workspace request/response](artifacts/discovery-workspace-create-20260930.json), [service access state](artifacts/discovery-access-20260930.json), and [resource inventory](artifacts/discovery-resource-inventory-20260930.json). Authentication tokens are not included.

## Local build

```bash
npm ci
npm run build:guide
npm test
npm run check:guides
npm run build:architecture
```

Use Node.js 22+, Python 3, and an installed Google Chrome for the browser checks.

- `build:guide` generates the separate English and Korean HTML editions and localized diagrams.
- `check:guides` checks links, layout, language switching, and portable bookmarked PDFs in headless Chrome.
- `build:architecture` parses and renders the architecture diagrams locally.

These commands do not call or modify Azure. Mermaid is a documentation-tool dependency, not a Microsoft Discovery product dependency.

## Files

- `data/`: Original synthetic TXT/CSV inputs; no real research data.
- `scripts/score_materials.py`: Deterministic local reference calculator; not proof of cloud execution.
- `scripts/verify_ranking.py`: Checks every field of the downloaded raw result with `--case baseline` or `--case cost3`; deliberately reports `execution_verified: false`.
- `tools/thermal-ranking/`: Action-only CPU tool template. E01 explains a separate Hybrid variant without changing the baseline.
- `config/lab.json`: Account/subscription scope for the original environment.
- `infra/`: Network and identity Bicep plus the scoped, unsuccessful Workspace creation-attempt payload.
- `tests/`: Data, expected-result, guide-parity, scope, and packaging checks.

## Earlier access attempt

The [Korean execution report](EXECUTION-REPORT.ko.html), `artifacts/azure-preflight.json`, and the [earlier summary recording](artifacts/watch-summary.html) describe the earlier access attempt. They are **not a successful Discovery feature demo or validation of this revised guide**.

These historical artifacts are in Korean. `npm run preflight` makes real Azure read requests; its registration, access-request, and resource-group flags perform changes. It is intentionally **not part of the local documentation build**.
