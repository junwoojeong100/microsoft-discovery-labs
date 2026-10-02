# Microsoft Discovery Labs

**English** · [한국어](README.ko.md)

Guides for customers and partners to configure Microsoft Discovery in their own Azure environment and practice **evidence retrieval → real computation → review → constraint changes**.

> **Learning material under validation.** This is not a deployment package with a fully validated research workflow. Check each lab's entry conditions and proceed only when its actual results meet the pass criteria. Environment-specific successes and failures belong to the separate deployment reference below.

## 1. Customers and partners: start the lab

| Purpose | First document | Next step |
|---|---|---|
| Configure a new environment | [Hands-on guide](docs/labs/MICROSOFT-DISCOVERY-LAB.en.md) | Read S00 → prepare your values, permissions and budget in L00 → L01–L03 |
| Use an environment prepared by an administrator | [Researcher entry check](docs/labs/MICROSOFT-DISCOVERY-LAB.en.md#s00) | Obtain and verify H01–H06 → L04–L07 → L09 |
| Understand Azure components and dependencies | [Architecture](docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.en.md) | Start with the overall and Bookshelf diagrams |

**Reading formats:** [Published HTML](https://junwoojeong100.github.io/microsoft-discovery-labs/docs/labs/MICROSOFT-DISCOVERY-LAB.en.html) · [PDF](docs/labs/MICROSOFT-DISCOVERY-LAB.en.pdf) · [GitHub Pages home](https://junwoojeong100.github.io/microsoft-discovery-labs/).

The guide contains ten core labs, L00–L09, and two extensions, E01–E02. L08 collaboration checks require another user. Every lab follows **Goal → Before you start → Steps → Pass criteria**. For an Azure-free review of the data and reference calculation, use S02 and only the local calculation step in L05.

## 2. Deployment operators: learn from an actual installation

**Shared lab procedures and environment-specific installation records are separate.** The following Korean references document what was attempted, what succeeded or failed, and what remains. Reuse the reasoning and diagnostic methods, not another environment's resource names, IDs or approvals.

| Question | Reference |
|---|---|
| What is ready, and what remains? | [Current status and remaining work](docs/deployment-reference/01-current-state.ko.md) |
| Which resources currently exist? | [Resource groups and inventory](docs/deployment-reference/07-resource-inventory.ko.md) |
| What was tried, and what was learned? | [Actual execution history](docs/reports/EXECUTION-REPORT.ko.md) |
| How do I investigate an issue or resume work? | [Deployment reference index](docs/deployment-reference/README.ko.md) |

These records are not a prerequisite for taking the customer lab. Use them as a separate troubleshooting and operational-learning path.

## Before running commands

**Do not run environment-specific configuration unchanged.** For a new environment, first select your account, tenant, subscription, names, regions and network in L00. Shell variables do not automatically update `config/lab.json`, Bicep defaults, `.bicepparam` files or values embedded in scripts.

Local documentation and data checks do not change Azure. Azure execution scripts can affect permissions, resources and billing; review the [operational command boundaries, Korean](docs/deployment-reference/README.ko.md#operator-commands) before using them.

Service enablement, RBAC, model quota, regional capacity and private connectivity are separate requirements. Do not free quota by deleting another project's deployments or bypass network errors by disabling organizational policy. Failed deployments can still incur costs; use L09 even after a partial run.

## Local documentation build

For documentation contributors: use Node.js 22+ and Python 3. Browser/PDF checks and architecture-diagram rendering also require an installed Google Chrome.

```bash
npm ci
npm run check:guides
npm run build:architecture
npm test
npm run check:site
```

`check:guides` builds both HTML editions, checks links/layout/language switching, and generates PDFs. Markdown, Mermaid and the English SVG are editable sources; builds refresh HTML/PDF and derived diagrams. Review screenshots/logs are reproducible local output. This workflow neither provisions Azure nor verifies cloud lab completion.

## Document and file boundaries

| Location | Purpose |
|---|---|
| `docs/labs/` | Shared customer/partner procedures and pass criteria in English and Korean |
| `docs/architecture/`, `assets/` | Documentation-based reference architecture and diagrams, not a live deployment inventory |
| `docs/deployment-reference/`, `docs/reports/` | Installation attempts, current progress, troubleshooting and remaining work for a specific environment, in Korean |
| `artifacts/` | Dated execution evidence and historical media, not customer procedures or an automatic current-state verdict |
| `data/`, `scripts/score_materials.py`, `scripts/verify_ranking.py` | Synthetic inputs, local reference calculation and actual-output content checks; content checks do not prove execution location |
| `tools/thermal-ranking/` | CPU Action tool example |
| `config/`, `infra/`, Azure execution scripts | Environment-specific operational inputs requiring review/adaptation, not a finished generic installer |
| `tests/` | Data, documentation parity, commands, links and packaging checks |

## GitHub Pages publication

**The repository and its committed history are public.** Pages publishes curated documents with example account identifiers. Raw Azure evidence, configuration, infrastructure sources and PDFs are excluded **from the Pages site only**; use this repository for those sources. Identifier replacement does not replace configuring commands for your own environment.

`npm run check:site` builds and checks the public `site/`. Pages uses GitHub Actions; with repository variable `PAGES_ENABLED=true`, **Publish lab documentation** publishes relevant changes on `main`. Editing or building locally does not update the published site.
