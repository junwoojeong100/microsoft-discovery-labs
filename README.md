# Microsoft Discovery Labs

**English** · [한국어](README.ko.md)

Hands-on guides and Azure architecture documentation for Microsoft Discovery. The guides were revised using **actual Azure deployment results on 2026-10-01**, with matched English/Korean procedures and pass criteria.

## Start here

| Document | Read on GitHub | Other formats |
|---|---|---|
| Core capabilities hands-on guide | [Read the guide](docs/labs/MICROSOFT-DISCOVERY-LAB.en.md) | [PDF](docs/labs/MICROSOFT-DISCOVERY-LAB.en.pdf) · [HTML](https://junwoojeong100.github.io/microsoft-discovery-labs/docs/labs/MICROSOFT-DISCOVERY-LAB.en.html) |
| Azure architecture and version dependencies | [Read the architecture](docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.en.md) | Three SVG diagrams with Mermaid source included |
| Provisioning reference notes (Korean) | [Topic index](docs/deployment-reference/README.ko.md) | [Current issues](https://junwoojeong100.github.io/microsoft-discovery-labs/docs/deployment-reference/01-current-state.ko.html#open-issues) · [Incident index](https://junwoojeong100.github.io/microsoft-discovery-labs/docs/deployment-reference/README.ko.html#incident-index) |

The hands-on guide covers **10 core labs and 2 extensions**: workspaces/projects, data and files, Bookshelf, agents and versions, compute tools, the Discovery Engine, human feedback, collaboration/RBAC, traceability, cost, and Hybrid/MCP tools. Each lab follows **Goal → Steps → Pass criteria**.

The architecture document separates API versions, model revisions, SKUs, and runtime versions. It explains cross-service dependencies and change impacts without inventing unpublished internal versions.

Use the Markdown or PDF links on GitHub. HTML editions are under `docs/labs/`, with architecture under `docs/architecture/` and run reports under `docs/reports/`.

## GitHub Pages

Repository: [junwoojeong100/microsoft-discovery-labs](https://github.com/junwoojeong100/microsoft-discovery-labs) is **public**. **[Read the published documentation on GitHub Pages](https://junwoojeong100.github.io/microsoft-discovery-labs/)**. The first publication completed on 2026-10-02 KST after the user requested the visibility change; no paid plan was required.

`npm run check:site` builds and checks a curated `site/` with working HTML links. Account identifiers are replaced with examples; raw Azure artifacts, configuration, infrastructure sources and PDFs are excluded **from the Pages site only**. The repository and its committed history are public. Pages uses **GitHub Actions** with repository variable **`PAGES_ENABLED=true`**; **Publish lab documentation** publishes relevant pushes to `main` and can also be run manually.

## Execution status

**Bookshelf creation-only attempt, 2026-10-02 08:29 KST:** The real provider rejected even the small creation request because `gpt-5-mini` and `text-embedding-3-small` each require **2,000,000 TPM at creation**. The how-to's 200,000 TPM threshold and successful ARM preview were insufficient. No Bookshelf or owned managed resource group was created; indexing/search were not started. See the [actual failure](artifacts/discovery-bookshelf-create-result-20261002.json).

**Latest: Workspace, validation model, Project and direct synthetic CPU runs succeeded.** Both new GPT-5.4 deployments use **Global Standard 250,000 TPM each**, totaling **500,000 TPM**. Five inputs and two ranking outputs were saved through the Korea private runtime and independently read back by a second successful Discovery operation. See the [final execution report](docs/reports/EXECUTION-REPORT.ko.md). Bookshelf quota remains outstanding. The approved subnet grants and Azure Policy add-on activation are complete; the target cluster's add-on installation policy is **Compliant**. A full autonomous investigation is not claimed.

**Earlier compute-only result, 21:32 KST:** Discovery home remained Sweden Central and target compute moved to Korea Central. The new Supercomputer, cpulab, and actual Korea AKS/VMSS were Succeeded at **21:28:45 KST**. Workspace creation was still quota-blocked at that point; the later successful resumption above supersedes that blocker.

The afternoon results and existing-environment table below describe the previous single-region Sweden Central run. Use the [foundation parameters](infra/cross-region-foundation.bicepparam), [Discovery parameters](infra/discovery-core.koreacentral.bicepparam), and [resumption notes](docs/deployment-reference/06-resume-runbook.ko.md) for the cross-region path. **Deleting the existing lab RG would also delete the new Korea resources.**

**The central diagnostic configuration was repaired on the afternoon of 2026-10-01, but the full lab remains incomplete.** The single core retry after service/network enablement reached **terminal Failed at 16:14:43 KST**. At 16:21, both Workspace and Supercomputer were Failed, with a new backing AKS `AKSCapacityHeavyUsage` error confirmed.

**Regional service capacity and Bookshelf operational quota remain the main blockers.** After the logging repair, available `gpt-5-mini` and embedding quota still measured **990,000 / 780,000 TPM**; the submitted 3,000,000 TPM total requests have not appeared in the limits. Three narrowly scoped remediations of existing organizational policies successfully created the central RG/workspace and the Discovery account's diagnostic settings. Actual log arrival, laptop Blob connectivity, and **end-to-end research execution remain unverified**. See the [terminal workload snapshot](artifacts/discovery-resume-snapshot-20261001-1621.json), [diagnostic recovery evidence](artifacts/discovery-governance-recovery-20261001.json), and [execution report](docs/reports/EXECUTION-REPORT.ko.md).

## Current lab (2026-10-01)

The [lab resource group](https://portal.azure.com/#@46e9cdaa-fed3-4131-aa28-c1fc8a8a043a/resource/subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/rg-discovery-hol-20260930/overview) remains **`rg-discovery-hol-20260930` / Sweden Central**. In `config/lab.json`, `location` denotes home and `targetComputeLocation=koreacentral` denotes the new runtime region. The table below describes the retained previous environment; historical `20260925` examples are not the active target.

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
| Supercomputer / deployment | `sc-discovery-hol` Failed / afternoon core deployment terminal Failed; backing AKS capacity failure |
| Workspace | `discoveryholjunwoosc` is `Failed`; managed-resource isolation retained, no linked compute or usable Project |
| Central diagnostics | `McapsGovernance/mcaps4c05bc053c3d4ff154e5-la` connected; the account's diagnostic policy is Compliant. Policy defaults: West US 2, pay-as-you-go, 30-day retention |

The user has scoped data-plane roles; UAMI roles are scoped to the lab RG, Storage, Registry, VNet, and identity. Only the documented first-party control-plane Reader/NSP Joiner assignments are subscription-wide. No organizational policy was disabled. Failed deployments can leave billable resources; see L09 before cleanup.

## Readiness and resumption

The new browser-free check makes **read-only Azure requests** and saves token-free evidence. Default full readiness returns exit `2` for the observed Bookshelf quota shortfall. `--require core` checks only core access/model quota, not successful deployment or lab execution.

Model quota is checked in `targetComputeLocation`, falling back to `location` only for older single-region configurations without that field. Core readiness can also be blocked by unavailable new GPT-5.4 quota. This is separate from the Supercomputer-only stage, which creates no models.

```bash
npm run readiness
npm run readiness -- --require core
```

[L01](docs/labs/MICROSOFT-DISCOVERY-LAB.en.md#l01) provides staged Bicep `what-if`/deployment commands, private-storage setup, and an explicitly incomplete Workspace-only recovery path. [L05](docs/labs/MICROSOFT-DISCOVERY-LAB.en.md#l05) uses the **observed GA Tool contract `properties.version`** and an image digest. The old [Workspace attempt payload](infra/workspace-create.json) and [three-subnet template](infra/main.bicep) remain historical/initial-creation inputs, not templates to blindly reapply to the expanded environment.

[L02](docs/labs/MICROSOFT-DISCOVERY-LAB.en.md#l02) includes the administrator path to start the prepared private VM, verify inputs with `npm run blob:sync`, and deallocate it. [A01](docs/labs/MICROSOFT-DISCOVERY-LAB.en.md#a01) distinguishes AKS regional capacity from model TPM increases and identifies the existing Foundry **Discovery Default Project** for quota navigation.

## Local build

```bash
npm ci
npm run build:guide
npm test
npm run check:guides
npm run build:architecture
npm run check:site
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
- `docs/labs/`, `docs/architecture/`, `docs/reports/`: Organized guides, architecture, and execution reports.
- `scripts/run-discovery-tool.mjs`: Bounded real Discovery execution and independent private-file readback; `npm run tool:run` performs Azure changes.
- `scripts/build-site.mjs`: Curated publication build; never uploads raw `artifacts/` or credentials.
- `tests/`: Data, expected-result, guide-parity, scope, and packaging checks.

## Earlier access attempt

The [execution report](https://junwoojeong100.github.io/microsoft-discovery-labs/docs/reports/EXECUTION-REPORT.ko.html) separates the new deployment from the earlier 2026-09-25 access attempt. `artifacts/azure-preflight.json`, the [2026-09-30 registration evidence](artifacts/discovery-registration-followup-20260930.json), and the [earlier summary recording (MP4)](artifacts/microsoft-discovery-summary.ko.mp4) are historical. The recording is **not a successful Discovery feature demo**.

These historical artifacts are in Korean. `npm run preflight` makes real Azure read requests; its registration, access-request, and resource-group flags perform changes. It is intentionally **not part of the local documentation build**.
