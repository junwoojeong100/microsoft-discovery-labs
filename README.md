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

The reference data is synthetic. Local calculations and document checks are **not proof of an Azure run**. End-to-end Discovery execution in the target account has not been completed; Azure deployment and actual feature-execution recording remain paused.

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
- `tests/`: Data, expected-result, guide-parity, scope, and packaging checks.

## Earlier access attempt

The [Korean execution report](EXECUTION-REPORT.ko.html), `artifacts/azure-preflight.json`, and the [earlier summary recording](artifacts/watch-summary.html) describe the earlier access attempt. They are **not a successful Discovery feature demo or validation of this revised guide**.

These historical artifacts are in Korean. `npm run preflight` makes real Azure read requests; its registration, access-request, and resource-group flags perform changes. It is intentionally **not part of the local documentation build**.
