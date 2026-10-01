# Microsoft Discovery

**English** · [한국어](README.ko.md)

Hands-on guides and Azure architecture documentation for Microsoft Discovery. The guides were revised using **actual Azure deployment results on 2026-10-01**, with matched English/Korean procedures and pass criteria.

## Start here

| Document | Read on GitHub | Other formats |
|---|---|---|
| Core capabilities hands-on guide | [Read the guide](MICROSOFT-DISCOVERY-LAB.en.md) | [PDF](MICROSOFT-DISCOVERY-LAB.en.pdf) · [HTML](MICROSOFT-DISCOVERY-LAB.en.html) |
| Azure architecture and version dependencies | [Read the architecture](MICROSOFT-DISCOVERY-ARCHITECTURE.en.md) | Three SVG diagrams with Mermaid source included |
| Provisioning reference notes (Korean) | [Topic index](docs/deployment-reference/README.ko.md) | Dated state, quota, capacity, regions, networking, and resumption notes |

The hands-on guide covers **10 core labs and 2 extensions**: workspaces/projects, data and files, Bookshelf, agents and versions, compute tools, the Discovery Engine, human feedback, collaboration/RBAC, traceability, cost, and Hybrid/MCP tools. Each lab follows **Goal → Steps → Pass criteria**.

The architecture document separates API versions, model revisions, SKUs, and runtime versions. It explains cross-service dependencies and change impacts without inventing unpublished internal versions.

Use the Markdown or PDF links on GitHub. To view the HTML edition locally, download or clone the repository so its relative image links remain available.

## Execution status

**As of 2026-10-01 15:52 KST, the full lab is not complete.** Service enablement, `AllowBringYourOwnPublicIpAddress` registration, and provider propagation are resolved. The existing core was retried once, but **a new backing AKS request failed with `AKSCapacityHeavyUsage` at 15:46:52 KST**. The parent deployment is `Running`, the Supercomputer is `Accepted`, and the existing Workspace is `Failed`; these are not interchangeable completion states.

Bookshelf's operational readiness target still exceeds available `gpt-5-mini` and embedding quota: **990,000 / 780,000 TPM** at 15:53 KST. Requests for 3,000,000 TPM total per model were submitted but have not appeared in the limits. The shared diagnostics policy's missing central Log Analytics target also needs separate remediation. Prior private-VM upload/read-back checks covered all five inputs, but laptop Blob connectivity and **end-to-end research execution remain unverified**. See the [current resource snapshot](artifacts/discovery-resume-snapshot-20261001-1552.json) and [dated blocker/action/evidence report](EXECUTION-REPORT.ko.md).

## Current lab (2026-10-01)

The [lab resource group](https://portal.azure.com/#@46e9cdaa-fed3-4131-aa28-c1fc8a8a043a/resource/subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/rg-discovery-hol-20260930/overview), `config/lab.json`, and both guides now consistently use **`rg-discovery-hol-20260930` / Sweden Central**. Historical `20260925` examples are not the active deployment target.

| Component | Current configuration |
|---|---|
| VNet/UAMI | Reused `vnet-discovery-hol` (`10.80.0.0/16`) and `id-discovery-hol` |
| Subnets | Nine dedicated subnets: original three retained, four lab subnets, `storagePeSubnet`, and `blobClientSubnet` |
| Storage | `stdiscoveryholjunwoosc`, LRS, no shared keys/anonymous blobs, public network disabled by policy |
| Private access | Approved `pe-discovery-blob`; private DNS `10.80.8.4`; VNet link completed |
| Registry/tool | Basic `acrdiscoveryholjunwoosc`; ACR task `dt1` and Tool `thermal-ranking` v1.0.0 succeeded |
| Data references/files | `thermaldata`, `evidencepack`, `candidatecsv`; follow-up uploaded four TXT files/one CSV and verified SHA-256 read-back |
| Private data client | `vm-discovery-blob-client`, no public IP/inbound SSH; deallocated after verification |
| Network feature | `AllowBringYourOwnPublicIpAddress` and `Microsoft.Network` both Registered |
| Supercomputer / deployment | `sc-discovery-hol` Accepted / afternoon core deployment Running; backing AKS capacity failure observed |
| Workspace | `discoveryholjunwoosc` is `Failed`; managed-resource isolation retained, no linked compute or usable Project |

The user has scoped data-plane roles; UAMI roles are scoped to the lab RG, Storage, Registry, VNet, and identity. Only the documented first-party control-plane Reader/NSP Joiner assignments are subscription-wide. No organizational policy was disabled. Failed deployments can leave billable resources; see L09 before cleanup.

## Readiness and resumption

The new browser-free check makes **read-only Azure requests** and saves token-free evidence. Default full readiness returns exit `2` for the observed Bookshelf quota shortfall. `--require core` checks only core access/model quota, not successful deployment or lab execution.

```bash
npm run readiness
npm run readiness -- --require core
```

[L01](MICROSOFT-DISCOVERY-LAB.en.md#l01) provides staged Bicep `what-if`/deployment commands, private-storage setup, and an explicitly incomplete Workspace-only recovery path. [L05](MICROSOFT-DISCOVERY-LAB.en.md#l05) uses the **observed GA Tool contract `properties.version`** and an image digest. The old [Workspace attempt payload](infra/workspace-create.json) and [three-subnet template](infra/main.bicep) remain historical/initial-creation inputs, not templates to blindly reapply to the expanded environment.

[L02](MICROSOFT-DISCOVERY-LAB.en.md#l02) includes the administrator path to start the prepared private VM, verify inputs with `npm run blob:sync`, and deallocate it. [A01](MICROSOFT-DISCOVERY-LAB.en.md#a01) distinguishes AKS regional capacity from model TPM increases and identifies the existing Foundry **Discovery Default Project** for quota navigation.

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
- `config/lab.json`: Explicit active account/subscription/region/RG scope.
- `scripts/azure-readiness.mjs`: Separate service-access and model-quota gates, including thousand-TPM unit handling.
- `infra/`: Staged network, access, foundation, Discovery core, private Blob access, and digest-pinned Tool Bicep.
- `tests/`: Data, expected-result, guide-parity, scope, and packaging checks.

## Earlier access attempt

The [execution report](EXECUTION-REPORT.ko.html) separates the new deployment from the earlier 2026-09-25 access attempt. `artifacts/azure-preflight.json`, the [2026-09-30 registration evidence](artifacts/discovery-registration-followup-20260930.json), and the [earlier summary recording](artifacts/watch-summary.html) are historical. The recording is **not a successful Discovery feature demo**.

These historical artifacts are in Korean. `npm run preflight` makes real Azure read requests; its registration, access-request, and resource-group flags perform changes. It is intentionally **not part of the local documentation build**.
