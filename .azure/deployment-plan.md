# Discovery lab deployment plan

Status: Deployed — core and direct runtime; external gates remain

## Final verified state — 2026-10-01T14:32:22Z

New Korea-runtime Workspace, five-child model/data/Project deployment, and
runtime Tool/assets all Succeeded. Actual cognition and validation model are
GlobalStandard capacity 250 each, total 500,000 TPM, with old Sweden capacity
1 preserved. Subscription GPT-5.4 total is 501,000 TPM, leaving 2,499,000 TPM.
No Data Zone deployment was submitted.

Real Discovery tool operation 792ae74bbb5d419b861cf0505adb9217 synchronized
five original synthetic inputs and computed two cases on Korea cpulab.
Independent operation 5d8604fa785b42a18e5a86e2841e3fa1 read the persisted
files with matching hashes. Both are Succeeded in the service operation list
with the expected nodepool. Actual output contracts pass both ranking checks.
The first failed gzip-inline attempt is preserved; explicit decompression
fixed it without changing the container image or weakening private storage.
Final active/pending jobs are zero.
At 23:37 KST, live AKS GET also confirms cpulab automatically returned to
zero nodes while two system nodes remain; no manual scale operation was used.

Bookshelf quota remains insufficient; Defender's extra subnet-join permission
was not approved. Do not treat direct runtime success as an autonomous
Bookshelf-backed research result or full governance compliance.

Repository is now junwoojeong100/microsoft-discovery-labs, still Private.
Documentation is under docs/labs, docs/architecture, docs/reports.
GitHub Pages creation returned HTTP 422 because the current private-repo
plan is ineligible. Build and gated workflow are prepared without making
private history public or purchasing a plan. Local directory rename is the
last step after all active work is finished.

Final evidence: artifacts/discovery-korea-final-result-20261001.json and
docs/reports/EXECUTION-REPORT.ko.md. Earlier instructions below are historical.

## Additional user-requested runtime verification

The user asked to perform the actual file/tool work in this session rather
than defer it. The supported Discovery data-plane computeUsage GET succeeds.
The known synthetic image was imported to the Korea ACR by digest; no
credential or source-code rebuild was needed.

At 2026-10-01T14:15:34Z, ARM validation and Incremental what-if succeeded
for exactly three new resources: thermal-ranking-kc, and thermaldata-kc's
labinputs/runoutputs assets. No existing resource, permission, network, or
policy changes are included. Evidence:
`artifacts/discovery-korea-runtime-{template,parameters,validation,whatif,proof}-20261001.json`.
Submit `discovery-korea-runtime-20261001` once with those validated inputs.

After Project and Tool success, run the documented stable 2026-06-01 API
against the existing cpulab only, with 1 CPU (max 2), 2 GiB (max 4), 0 GPU,
one replica and a 30-minute per-run timeout. Synchronize five original
synthetic inputs through the private Discovery mounts, refuse mismatched
existing files, compute two ranking cases, then independently read outputs.
Three mounted-file/hash/conflict tests pass; source image digest is unchanged.
This is a direct Discovery tool execution, not a Bookshelf/Engine claim.

Defender policy subnet read/join changes were separately presented for
approval. User was unavailable; do not grant that role or change the policy.

## Final model-allocation decision — supersedes the Data Zone alternative

The user explicitly chose to change new cognition to 250,000 TPM and asked
for this exact setting in the documentation. The final two new deployments
are both GlobalStandard: cognition `gpt-5.4` capacity 250 and validation
`gpt-5-4` capacity 250 (model gpt-5.4 version 2026-03-05). Total 500,000 TPM.
Wait for/read the user's saved cognition value before submitting children.
The old Sweden model remains capacity 1.

The user's final save is now verified: cognition is Succeeded with both
sku.capacity and currentCapacity 250, token limit 250,000 TPM, updated
2026-10-01T13:58:45Z. Target GlobalStandard usage is 251/3000 units,
leaving 2,749,000 TPM before validation-model creation. The user also
explicitly confirmed completion. Proceed with the final GlobalStandard
payload only after its refreshed ARM validation and what-if finish.

DataZoneStandard was only catalog/ARM validated; no creation request for it
was submitted. Do not execute that obsolete payload. Recompile the final
GlobalStandard source and parameters and validate the released quota.
This decision supersedes the historical fallback discussion below.

Final child validation completed at 2026-10-01T14:00:11Z. Submit exactly
one Incremental `discovery-korea-children-20261001` using
`artifacts/discovery-korea-children-template-20261001.json` and
`artifacts/discovery-korea-children-parameters-20261001.json`.
Both are the recompiled GlobalStandard payload, not the Data Zone preview.

## 21:48 KST resumption — new Korea-runtime Workspace

The user explicitly requested continuation after reducing the old
`aif-dwsp-foundry-ym5ffvaa/gpt-5.4` deployment to capacity 1 (1,000 TPM,
Succeeded, updated 2026-10-01T12:46:15Z). Preserve that new setting:
the earlier instructions to restore 3,000,000 TPM are historical and
superseded. Do not delete the old Foundry project or resize its model.

Live target readiness now passes for core: GlobalStandard GPT-5.4 has
2,999,000 TPM unallocated. This observed cross-region release is consistent
with the current subscription-level Global Standard shared quota system;
do not assume each location endpoint represents an independent pool.
Bookshelf operational quota remains insufficient and its stage stays gated.

Reuse `sc-discovery-hol-kc`, cpulab, Korea VNet/identity/storage/registry,
and the Sweden Central home RG without reapplying their creation templates.
Create `discoveryholjunwookc` using only the compiled Workspace definition,
with identity and Supercomputer declared existing. Keep its original
supercomputer association and all three Korea subnet references.
Creation-time tags remain `discovery.overridemrgregion=koreacentral`,
`SkipAssociateKeyVaultToNsp=true`, and `NetworkIsolation=true`.

The historical `discovery-workspace-evening-20261001-1953` deployment is
still Running on the old, differently named Workspace. Do not cancel or
write that resource. It is not an overlapping PUT to the new Workspace.
Monitor new quota allocations rather than restoring the old model.

Validate each stage independently and record actual proof:

1. Workspace only: ARM validate/Incremental what-if must contain exactly
   one new Workspace, no existing resource changes or deletions.
2. After the parent is Succeeded, create its `gpt-5-4` validation model with
   the separately validated non-provisioned SKU, capacity 250, version
   2026-03-05, plus the new
   `thermaldata-kc` storage reference/assets and `thermalhol` Project.
   Do not re-PUT the successful parent, Supercomputer, or customer storage.
3. Verify real managed-runtime regions, current model allocations,
   managed-resource failures, and persisted Discovery child states.
   Report data/image transfer and end-to-end research separately.

The previous stage outcomes below remain historical evidence, not a current
claim that the released GPT-5.4 quota is still unavailable.

Workspace-only validation completed at 2026-10-01T12:51:10Z. Submit one
Incremental deployment named `discovery-korea-workspace-20261001` using
`artifacts/discovery-korea-workspace-template-20261001.json` and
`artifacts/discovery-korea-workspace-parameters-20261001.json`.
This validation does not yet authorize child creation before parent success.

### 22:52 KST parent success and independent validation-model quota

The new Workspace reached Succeeded at 2026-10-01T13:52:51Z. During its
provisioning the user separately raised the new cognition to capacity 2999
(2,999,000 TPM). Activity Log confirms the signed-in user as the actor,
latest model write at 22:30:59 KST, not this agent or the Discovery service.
The old Sweden model remains capacity 1. GlobalStandard is therefore
3,000/3,000 again; the final quota gate correctly prevented child submission.

Preserve both existing allocations. Official Discovery quota guidance
supports DataZoneStandard as the alternate non-provisioned deployment type;
its current separate GPT-5.4 quota is 0/300 units. Select 250 units there
for the new validation model, retaining model/version/deployment name.
The default source SKU remains GlobalStandard; only the explicit Korea
parameters use DataZoneStandard. This is not a PTU reservation or a claim
of equivalent routing/RPM. Existing cognition is never re-PUT or resized.

A choice was presented via ask_user, which reported user unavailable rather
than approval. The non-destructive new-model alternative follows the user's
standing request to continue resource creation and preserves their observed
manual max setting. No unavailable confirmation is used to justify reducing
either model. Recompile and revalidate the revised five-child payload,
including actual model catalog/SKU support and separate quota, before use.

## Latest verified outcome — 2026-10-01T12:32:43Z

The Korea support and compute stages completed successfully. Foundation:
21:05:23 KST; compute: 21:28:45 KST. Supercomputer, cpulab, actual AKS, and
both backing VMSS are Succeeded. Discovery home and its MRG remain Sweden
Central; the AKS, node RG, VMSS, and new customer support resources are in
Korea Central. System nodes: 2, min 2/max 3; user pool: 0, min 0/max 1.

New Workspace/Foundry/model/Project creation was not submitted: the target
GPT-5.4 GlobalStandard quota has no free TPM. The existing 3,000,000 TPM
allocation is preserved. Confirmation to reallocate 500,000 TPM was
unavailable; do not silently reduce the existing model.

A separate Defender policy-addon deployment failed with
LinkedAuthorizationFailed because its existing policy identity lacks
subnet join on the new aksSubnet. This did not fail the compute deployment.
No additional roles, policy exceptions, or direct managed-AKS changes were
made for that issue. Record it rather than claiming complete compliance.
Old Sweden cleanup was handed to the user; no agent deletion occurred.

Final evidence: `artifacts/discovery-korea-deployment-result-20261001.json`
and the current execution report. No creation or cleanup operation remains
running from this task. Do not replay the completed initial-network template.

## Korea Central target-compute request

The user explicitly requires the Discovery home region to remain Sweden
Central. `config/lab.json.location` and every Discovery resource location
remain `swedencentral`; `targetComputeLocation` is `koreacentral`.
The official cross-region guide requires the creation-time tag
`discovery.overridemrgregion=koreacentral` on Workspace/Supercomputer (and
Bookshelf if a later stage is authorized). Managed resource groups stay
in the home region; their actual regional resources use the target.
The live subscription reports `Internal_2014-09-01` and Microsoft management.
Set the documented Microsoft-owned-subscription tag
`SkipAssociateKeyVaultToNsp=true` on new managed Discovery roots only.

Use the existing subscription and lab resource group from section 2.
New customer resources use distinct `-kc`/`junwookc` names. Preserve the
old Workspace, Foundry account and its maximum GPT-5.4 allocation, storage,
ACR, network, identity, and governance resources. The user separately
requested another agent to delete the old Sweden compute configuration;
that agent exclusively owns the old Supercomputer and its managed group.
Do not race or broaden its deletion.

Preparation:

- `infra/cross-region-foundation.bicepparam`: Korea Central support
  infrastructure, using existing modules and dedicated endpoint/link names.
  Initial creation only; do not replay the three-subnet VNet module over
  an expanded live network.
- `infra/discovery-core.koreacentral.bicepparam`: Sweden Central Discovery
  resources with Korea Central managed runtime, using new names.
- Use an isolated compute-only payload compiled from the core template.
  Do not submit the full core template until the Workspace model gate passes.
- The live Korea Central GPT-5.4 GlobalStandard usage currently reports
  3,000/3,000 units, with zero unallocated TPM. DataZoneStandard has 300 units;
  this does not prove automatic cognition provisioning can use that SKU.
  Preserve the existing allocation rather than silently reducing it.
- Bookshelf remains separately blocked by model quota; no Bookshelf
  infrastructure is authorized by this stage.

Foundation-only validation completed at 2026-10-01T12:01:18Z. This status
initially authorized the new support infrastructure only. Its deployment
reached Succeeded at 2026-10-01T12:05:23Z. Compute-only validation subsequently
completed at 2026-10-01T12:07:37Z; the two-resource compute stage is now
validated as well. Workspace and model creation remain separately blocked.

- [x] Bicep compilation and 22 focused tests.
- [x] Azure authentication, exact subscription/home/target, and ownership.
- [x] Korea Central VM SKU, regional/family quota, network feature and roles.
- [x] ARM provider validation and inherited policy checks.
- [x] Incremental what-if: 21 intended creates, no modifications/deletions.
- [x] Timestamped evidence recorded in section 7.

The original user request authorizes new target-compute infrastructure.
The subscription/scope confirmation tool was attempted but reported the
user unavailable; it is not recorded as new affirmative approval. The
separate destructive cleanup is blocked on its required exact-scope
confirmation, so no old resource deletion is included here.
The user subsequently chose to perform Sweden cleanup manually. Do not
delete anything on their behalf. They explicitly requested Korea creation
to continue without stopping.

The validated `artifacts/discovery-korea-compute-template-20261001.json`
was submitted with the compiled Korea core parameters under deployment name
`discovery-korea-compute-20261001` and reached Succeeded. Its only writes
were the new `sc-discovery-hol-kc` and its `cpulab`. Do not submit the full
core template while the independent Workspace/model gate remains blocked.

The prior validation sections below are historical and do not authorize
the new region or payload.

## 19:53 KST retry — compute stage only

The user explicitly requested another creation attempt and maximum feasible
TPM for new required model deployments. No existing deployment is active.
This validation applies only to the existing Supercomputer and cpulab;
Workspace, chat model, Bookshelf, and project stages remain separately gated.

The existing cognition gpt-5.4 deployment now uses all 3,000,000 GlobalStandard
TPM. Preserve that explicit user setting. Do not start the old full-core
template expecting free GPT-5.4 quota, reduce existing allocations silently,
or create duplicate Bookshelf models in the wrong Foundry account.

The compute-only ARM template is generated from the current compiled
infra/discovery-core.bicep, retaining identity, supercomputer, and cpuPool
definitions unchanged. It cannot write Workspace, model, Storage, VNet,
or RBAC resources. It reuses the same identity, subnets, tags, D4s_v6 SKU,
LoadBalancer egress, and min-0/max-1 CPU pool.

Validation proof for this stage:

- Bicep compilation succeeded.
- ARM provider validation succeeded.
- Incremental what-if contains only the existing Supercomputer modification
  and one cpulab create; no resource deletions.
- The workload-identity map is present in the generated payload even though
  what-if omits empty identity values and service-populated response fields.
- Network feature and Microsoft.Network remain Registered.
- Regional vCPU quota is 2/100 and Dsv6 is 0/100; existing service roles remain.
- The full readiness check is blocked for new GPT-5.4 allocations (0 free)
  and Bookshelf operational quota, neither of which this compute stage uses.
- Azure regional allocation capacity is not guaranteed by validation; record
  the actual retry result rather than assuming the prior capacity error is fixed.
- Evidence: artifacts/discovery-compute-evening-{template,validation,whatif}-20261001.json.

Submit exactly one compute-stage deployment named
discovery-compute-evening-20261001-1953 and inspect the actual operation history.
No deletion, policy exception, region migration, or duplicate model creation.

### Additional validated stage — required gpt-5-4 validation model

The GA Discovery ChatModelDeployment contract supports modelVersion,
skuName, and capacity. Official Discovery quota guidance supports
DataZoneStandard as an alternative to GlobalStandard.

To preserve the existing 3,000,000-TPM GlobalStandard cognition deployment,
use the independent DataZoneStandard GPT-5.4 quota for the mandatory gpt-5-4
validation model. Live quota and modelCapacities both report 300 capacity
units available, equivalent to 300,000 TPM. The regional catalog confirms
support for gpt-5.4 version 2026-03-05 and this SKU.

ARM validate and Incremental what-if succeeded for exactly one create:
Microsoft.Discovery/workspaces/discoveryholjunwoosc/chatModelDeployments/gpt-5-4.
No parent Workspace PUT, existing model update, role, or network change is
included. The failed parent still creates runtime uncertainty; preserve any
service rejection rather than claiming validation proves creation.

Evidence: artifacts/discovery-validation-model-evening-{template,validation,whatif}-20261001.json
and artifacts/discovery-evening-validation-model-capacity-20261001.json.
Use the name discovery-validation-model-20261001-2000 for this one attempt.
This intentional SKU selection must remain explicit in the run report; it is
not a PTU purchase or a claim that the two deployment types have identical RPM.

### Validated parent Workspace retry

The validation-model create was rejected with ParentResourceNotReady: the
existing Workspace must be Succeeded before Discovery child resources can
be created. This was not a quota or unsupported-SKU rejection.

Retry the existing Workspace once using the unchanged Workspace definition
from the compiled core template, preserving its existing empty supercomputer
association list. ARM validation and Incremental what-if succeeded with
exactly one Workspace modification and no creates/deletes or direct model,
network, storage, or RBAC writes. This is separate from the active compute
deployment and does not write the Supercomputer.

Use discovery-workspace-evening-20261001-1953. The existing managed Foundry
account and cognition deployment are reused; after the RP operation, verify
the cognition model still has the requested 3,000,000 TPM because managed
resource reconciliation is not fully represented by ARM what-if.

Evidence: artifacts/discovery-workspace-evening-{template,validation,whatif}-20261001.json.
Do not retry Discovery model creation until the actual parent state permits it.

### Cognition maximum reconciliation

The Workspace RP reset gpt-5.4 to 250,000 TPM at 20:09:41 KST; the actor was
the Discovery application 92c174ac-8e41-4815-a1b7-d81b19ab03ce, not the user.
The model operation itself is Succeeded. Restore the user-requested maximum
using the published Cognitive Services Deployments_Update PATCH contract
(2026-09-01, PatchResourceTagsAndSku), which was verified against the live
GET endpoint and official REST specification. The current CLI create command
cannot preserve the RAI/upgrade options, so it is not used for this update.

Recheck the current quota, use the model ETag, send only sku.name/capacity,
and verify the model, guardrail, upgrade policy, and other settings are
unchanged. Do not allocate that released GlobalStandard quota to a new model.
Recheck the maximum again after the Workspace RP reaches a terminal state
in case it reconciles the default capacity more than once.

The core retry reached terminal Failed at 2026-10-01 16:14:43 KST.
That earlier result is historical; it does not establish the outcome of the
new, user-requested compute-only attempt.

2026-10-01 15:30 KST follow-up: the user requested resource creation from the
hands-on guide and a complete record of restrictions. Reuse the same lab
subscription, RG, region, names, identity, and private-network configuration.
Do not delete failed resources or duplicate the paid stack in another region.

The Workspace and the retried Supercomputer are Failed. The parent deployment
also reached Failed after a new AKSCapacityHeavyUsage error in its backing AKS.
Revalidation of the compiled core template and incremental what-if passed;
those results did not prove regional service capacity.
The documented LoadBalancer prerequisite
Microsoft.Network/AllowBringYourOwnPublicIpAddress was registered successfully;
Microsoft.Network re-registration also completed. Both were independently
read back as Registered. The one authorized bounded core retry has been
submitted as discovery-core-resume-20261001-1530. Do not add overlapping PUTs
or treat it as Bookshelf or end-to-end success. A terminal-state conflict was
not observed on this Supercomputer retry; deletion still requires approval.

Bookshelf model quota remains insufficient. Its two existing increase requests
were submitted at 13:41 KST, but approval has not appeared in the quota values.
Do not submit duplicates or create Bookshelf infrastructure yet. The private
Blob client remains deallocated. Data-plane use is a separate completion gate.

## Independent governance recovery — configuration repaired

All three targeted remediations reached Succeeded with one successful
deployment each and zero failed deployments: RG at 16:21:45, workspace at
16:23:41, and the single Discovery account's diagnostics at 16:26:08 KST.
Actual GETs confirm the exact central workspace ID, WestUS2, PerGB2018,
30-day retention, allLogs enabled, and AllMetrics enabled. Evidence:
`artifacts/discovery-governance-recovery-20261001.json`.

The lab Workspace MRG's re-evaluation completed. The single Discovery-managed
Foundry account's EnableCognitiveServicesDiagnostics policy is Compliant,
evaluated at 2026-10-01 16:30:10 KST. This is not a claim that every policy in
the subscription is compliant. Log arrival and historical-log recovery have
not been verified. The core remains blocked.

The 16:10 KST follow-up asks whether the missing central diagnostic destination
can be fixed directly. Live reads confirm the entire McapsGovernance RG is
absent, the exact central workspace is absent, and no matching soft-deleted
workspace is available for recovery.

The existing enforced MCAPSGovDeployPolicies initiative already includes
NewResourceGroupDeploy and NewLogAnalyticsWorkspaceDeploy. Both are
NonCompliant on this subscription. Their unchanged defaults specify
McapsGovernance, WestUS2, the subscription-derived workspace name
mcaps4c05bc053c3d4ff154e5-la, PerGB2018, and 30-day retention. This is the
organization's central log destination, not a second Discovery workload stack.
Ingestion/storage charges can apply after logging starts.

The assignment's existing system-assigned identity has unconditional inherited
Owner. No new roles, policy assignments, exclusions, or policy edits are needed.
No active remediation of these references was found. The source Foundry
account currently has no diagnostic settings. The two Discovery-managed
workspaces are not policy-equivalent replacements for the central destination.

Apply only these three sequential remediation references:

1. NewResourceGroupDeploy at the selected subscription scope. Its policy
   targets only the subscription resource and creates one governance RG.
2. NewLogAnalyticsWorkspaceDeploy at the selected subscription scope, after
   the RG succeeds. Verify actual workspace name, region, SKU, and retention.
3. EnableCognitiveServicesDiagnostics at the single
   aif-dwsp-foundry-ym5ffvaa resource scope. Preserve the existing policy's
   allLogs/AllMetrics and exact central destination; do not remediate the
   entire management group or unrelated subscription resources.

Verify a successful remediation is backed by actual resource/settings GETs,
not merely a zero-deployment or Accepted remediation status. Policy
compliance refresh and actual log arrival are separate verification gates.
The old failed policy deployment remains historical evidence.

## 1. Scope and authorization

The earlier user request authorized prerequisite remediation at 11:14 KST.
The private Blob client phase has completed. Quota forms were subsequently
submitted with the user's explicit approval; do not submit duplicate requests.
The 15:30 KST request authorizes resuming the existing lab's creation while
preserving its resources and recording any remaining restrictions.

Execute the existing Microsoft Discovery hands-on guide and improve it using
observed deployment results, as requested on 2026-10-01. Reuse existing lab
resources. Do not delete resources, change unrelated infrastructure, or commit
credentials.

## 2. Azure context

- Subscription: `51531604-2337-4c05-bc05-3c3d4ff154e5`
- Resource group: `rg-discovery-hol-20260930`
- Region: `swedencentral`
- Confirm these settings against the repository configuration and live Azure
  state before making changes.

## 3. Deployment recipe

Inspect and reuse the repository's existing Bicep and Azure CLI/ARM workflow.
Do not introduce azd or replace existing infrastructure unnecessarily.

Templates: `infra/expand-network.bicep`, `infra/identity.bicep`, `infra/access.bicep`,
`infra/lab-foundation.bicep`, and `infra/discovery-core.bicep`.

## 4. Resources and dependencies

Recipe: Azure CLI and Bicep, incremental deployment.

1. Reuse the existing RG, VNet, three subnets, and UAMI. Add the four missing
   dedicated subnets from L01 using child-resource PUTs, without rewriting the
   original three. The legacy inline-VNet template is for initial creation only.
2. Assign the verified Discovery control-plane service principal
   `ab0c1c51-8ec2-4121-948e-5deaf0b9b262` only the documented subscription Reader
   and two-action NSP Perimeter Joiner roles.
3. Create LRS Blob storage with shared keys and anonymous access disabled,
   private access, CORS, two containers, and scoped Blob data roles.
   Create a Basic ACR with admin/anonymous access disabled and scoped AcrPull.
4. Provision the core Discovery path: one D4s_v6 Supercomputer, `cpulab`
   (min 0/max 1), Workspace, `gpt-5-4`, `thermaldata`, and `thermalhol`.
5. Bookshelf and `indexlab` are a separate blocked phase, not a prerequisite
   for the independent core deployment. Do not deploy their fixed-cost
   infrastructure until the model quota gate passes.

Observed blockers: Global Standard gpt-5-mini has 990,000 TPM remaining and
text-embedding-3-small has 780,000 TPM remaining; Bookshelf needs 2,000,000
TPM of each. The quota API does not support this Cognitive Services scope
(`BadRequest`); the documented increase process is a Foundry quota request.
No unrelated deployment will be deleted to free quota.

## 5. Safety and cost controls

Keep private-network defaults, use the smallest supported lab configuration,
verify required permissions and quotas, and record partial failures explicitly.
Do not silently fall back to public access or provision unrelated resources.

The new Workspace will keep `NetworkIsolation=true` for managed resources and
explicitly enable the authenticated Discovery public endpoint, as in the
official Studio quickstart. This is not `NetworkIsolation=false`. The old,
failed private-only request remains historical evidence; no existing
Workspace access setting is being weakened. No Preview Workbench tags.
Storage's original selected-IP design was overridden by inherited policy.
The revised source explicitly disables public access and adds a dedicated
Blob Private Endpoint/DNS path. Do not exempt or disable organizational policy.

## 6. Execution and documentation

Validate prerequisites, provision incrementally, verify real resource state,
and update both language editions and directly related generated outputs.

## 7. Validation proof

2026-10-01T14:15:34Z: additional runtime support passed Bicep compilation,
ARM provider validation, exact three-create Incremental what-if assertions,
image digest verification, and three mounted-file tests. No deletes,
existing-resource writes, RBAC changes or customer-storage network changes.
Proof is `artifacts/discovery-korea-runtime-proof-20261001.json`.

2026-10-01T14:00:11Z: final child stage validated through azure-validate.

- Workspace independent GET and ARM deployment are Succeeded; its completed
  timestamp is 2026-10-01T13:52:51Z. Existing identity/compute/storage are reused.
- The user confirmed the new cognition change. ARM sku/current capacity are
  250 and actual token limit 250,000 TPM, Succeeded. Target GlobalStandard
  allocation is 251/3000 units: 2,749,000 TPM remains before the new model.
- Final Bicep/parameters compile, and 31 targeted infrastructure/guide/reference
  tests pass. Model version/SKU/capacity are explicit.
- Refreshed ARM validate and Incremental what-if both Succeeded. Parsed
  assertions confirm exactly five creates in Sweden Central: new gpt-5-4,
  thermaldata-kc, its two assets, and thermalhol. No modifications/deletions.
- Validation model is gpt-5.4 version 2026-03-05, GlobalStandard capacity 250.
  The payload cannot write existing cognition, parent Workspace, compute,
  customer Storage/VNet, or RBAC. Data references are not file copies.
- Expected new Workspace model total is 500,000 TPM. Including the unchanged
  old 1,000 TPM, remaining quota is expected to be 2,499,000 TPM; verify live.
- DataZoneStandard was considered and prevalidated but never submitted;
  the explicit user decision reverted it before any new child creation.
- Evidence: `artifacts/discovery-korea-children-{template,parameters,validation,whatif,proof}-20261001.json`
  and `artifacts/discovery-korea-cognition-user-allocation-20261001.json`.

2026-10-01T12:51:10Z: new Korea-runtime Workspace validated through
azure-validate.

- Fresh core readiness returned exit 0 and 2,999,000 free GPT-5.4 TPM at the
  Korea target endpoint. Bookshelf readiness remains false.
- Current account/tenant/subscription match the configured scope. The new
  Workspace name is absent; the existing Korea Supercomputer is Succeeded.
  All five required Korea UAMI roles are visible and unconditional.
- Current core Bicep and parameter compilation succeeded. The Workspace-only
  payload retains the identity and Supercomputer as existing declarations;
  no old or successful parent resource writes are included.
- ARM provider validation returned Succeeded. Parsed Incremental what-if
  asserts exactly one Create for discoveryholjunwookc, zero modifications
  or deletions. Home, target tag, internal-subscription tag, network isolation,
  three target subnet IDs, and existing Supercomputer association all match.
- 22 targeted helper/infrastructure tests pass. No policy exemption or
  public customer-storage change is introduced.
- Evidence: `artifacts/discovery-korea-workspace-{template,parameters,validation,whatif,proof,readiness,before,identity-roles}-20261001.json`.

2026-10-01T12:32:43Z: post-deployment verification completed.

- Independent ARM GETs and both deployment results are Succeeded.
- Discovery Supercomputer/cpulab and MRG location: `swedencentral`.
  MRG managedBy matches the new parent after case-normalizing the ARM ID.
- Actual AKS, node RG, both D4s_v6 VMSS, VNet, storage, ACR, and Blob PE:
  `koreacentral`. VMSS capacities are exactly system 2 and user 0.
- New managed-identity roles were read again after provisioning and verified
  against exact expected scopes. Private storage, PE approval, private DNS,
  DNS link, and ACR disabled admin/anonymous access were verified.
- Actual `npm run readiness -- --require core` exercised the changed target
  path and correctly returned exit 2 for zero free GPT-5.4 TPM. This is a
  model-stage blocker, not a compute failure or a swallowed CLI error.
- 46 focused infrastructure/helper/guide/reference/navigation tests passed.
  `npm run check:guides` passed, including local links, both language
  editions, desktop/mobile/print layout, and regenerated PDFs.
- No new Workspace was present; the prior model remains Succeeded with
  capacity 3000. No data/image transfer or end-to-end investigation was run.
- The two Failed policy deployment records describe the same Azure Policy
  addon attempt by principal 02e03d89-915c-4be6-a882-ebde1beda2e4, not two
  failed compute deployments. Missing action:
  Microsoft.Network/virtualNetworks/subnets/join/action on the new aksSubnet.
- Evidence and individual collection timestamps are indexed by
  `artifacts/discovery-korea-deployment-result-20261001.json`.

2026-10-01T12:07:37Z: Korea Central compute-only stage validated through
azure-validate.

- Foundation terminal state is Succeeded. Actual Korea VNet has eight
  Succeeded subnets with default outbound disabled. Storage is Succeeded,
  public access Disabled, shared keys/anonymous Blob false. Blob PE is
  Approved/Succeeded and its new DNS link is Completed.
- All five new UAMI roles are visible with null conditions and their
  intended RG/resource scopes, including AcrPull before workload creation.
- `az deployment group validate` for the compute-only compiled payload
  returned Succeeded. Incremental `what-if` returned exactly two creates:
  `sc-discovery-hol-kc` and its `cpulab`; zero modifications/deletions.
- Both Discovery resource locations are `swedencentral`. The Supercomputer
  has the `koreacentral` override, `NetworkIsolation=true`, and the
  Microsoft-owned-subscription Key Vault tag. Subnets point only to the new
  Korea VNet. The payload retains the workload-identity map omitted by
  what-if. CPU min/max remain 0/1 and SKU D4s_v6.
- The payload cannot write a Workspace, model, old compute, storage, VNet,
  or role assignment. Its identity declaration is existing/read-only.
- Evidence: `artifacts/discovery-korea-compute-{template,validation,whatif,proof}-20261001.json`
  and `artifacts/discovery-korea-{identity-roles,network,private-endpoint,storage,dns-link}-20261001.json`.

2026-10-01T12:01:18Z: Korea Central support-infrastructure stage validated
through azure-validate.

- `node --test tests/lab-support.test.mjs tests/infrastructure.test.mjs`:
  all 22 passed, including unchanged single-region defaults and the explicit
  Sweden home/Korea target distinction.
- `az bicep build` and `az bicep build-params` succeeded for the foundation
  and core. The reused VNet module reports a local BCP081 type-data warning
  for its existing API version; live ARM provider validation succeeded.
- `az deployment group validate` with the compiled foundation template,
  generated parameters, explicit subscription, existing RG, and Incremental
  mode returned Succeeded, error null.
- `az deployment group what-if` returned Succeeded. Parsed assertions:
  exactly 21 creates inside the selected RG, all under the new resource
  names or their intended scoped roles/new DNS link; no modifications or
  deletions. Existing administrator role and global Blob DNS zone are
  NoChange. All new non-global resource locations are `koreacentral`.
- Existing lab RG and Discovery locations remain `swedencentral`.
  Discovery/Network are Registered; LoadBalancer feature is Registered.
  Korea Central total regional vCPUs and StandardDsv6Family are each 0/100.
  D4s_v6 has only a zone-2 restriction; no zone is requested.
- The deploying principal has inherited Owner; existing Discovery service
  Reader/NSP Joiner remain assigned. New identity grants are the existing
  documented scoped pattern, not subscription Owner/Contributor.
- Inherited policy assignments and deny-policy references were inspected;
  no policy exemption or policy change is proposed. ARM policy validation
  accepted the payload.
- Evidence: `artifacts/discovery-korea-foundation-{template,parameters,validation,whatif,proof}-20261001.json`,
  `artifacts/discovery-korea-inherited-policies-20261001.json`, and
  `artifacts/discovery-korea-deny-policy-definitions-20261001.json`.
- An isolated core payload preserves only the existing identity declaration,
  Supercomputer, and CPU pool, with the workload-identity map and both
  creation-time tags intact. It still requires its own ARM validation and
  what-if after the target foundation exists.

2026-10-01 16:14:43 KST core retry terminal result:

- discovery-core-resume-20261001-1530 reached Failed, with
  ResourceDeploymentFailure targeting sc-discovery-hol.
- Correlation remains cf91439f-960e-430a-96af-798274d51c89.
- The CLI wait exited nonzero on failure, so the final deployment and operation
  results were explicitly retrieved and saved rather than treating the wait
  result as success.
- Evidence: `artifacts/discovery-resume-deployment-20261001.json` and
  `artifacts/discovery-resume-operations-20261001.json`.

2026-10-01 15:52 KST execution follow-up:

- The actual core retry began at 15:43:48 KST. Parent deployment Running,
  Supercomputer Accepted, Workspace Failed, cpulab/indexlab/gpt-5-4/thermalhol
  HTTP 404, and Bookshelf listing empty.
- A new managed-cluster write failed at 15:46:52 KST with
  AKSCapacityHeavyUsage, correlation cf91439f-960e-430a-96af-798274d51c89.
  Feature registration did not resolve Azure regional capacity.
- The 15:53 quota refresh still fails Bookshelf operational readiness.
  Shared diagnostics policy failure remains a separate governance issue.
- Evidence: `artifacts/discovery-resume-snapshot-20261001-1552.json`,
  `artifacts/discovery-resume-readiness-20261001-1553.json`,
  `artifacts/discovery-resume-current-deployment-20261001.json`, and
  `artifacts/discovery-resume-activity-failures-20261001.json`.
- A read-only terminal-state waiter tracks the one existing deployment.
  It did not submit additional retries, cancel, delete, or change regions;
  it has since exited on the terminal failure recorded above.

2026-10-01 afternoon core-resume preflight:

- `npm run readiness` returns 2 for the full lab: core access/model quota
  passes, while Bookshelf remains blocked. GPT-5.4 has 2,750,000 TPM
  unallocated; gpt-5-mini and embedding have 990,000 and 780,000 TPM.
- `az bicep build --file infra/discovery-core.bicep` succeeded. The compiled
  payload still contains the intended workload identity; what-if omits
  empty identity-map values and service-populated properties.
- `az deployment group validate` succeeded for all eight Discovery resources
  using the exact compiled template, `deployCompute=true`, and Incremental
  mode. Evidence: `artifacts/discovery-resume-validation-20261001.json`.
- The incremental what-if has three creates, two modifications, three
  unchanged Discovery resources, and no resource deletions. All other
  resources are Ignore. The three creates are cpulab, gpt-5-4, and thermalhol;
  the modifications are the existing failed Supercomputer and Workspace.
  Evidence: `artifacts/discovery-resume-whatif-20261001.json`.
- Live role checks confirm the deployer has inherited Owner and RG-scoped
  Discovery Platform Administrator. Required UAMI and control-plane roles
  remain present; no new role assignments are needed.
- Regional vCPU allocation is 2/100; Dsv6 and Esv6 are each 0/100. Managed
  Environment Count is 1/50. These limits do not measure Azure's available
  regional service capacity.
- Standard_D4s_v6 is restricted in zone 2 for this subscription; the existing
  template does not select a zone. The existing managed Container Apps
  environment still records ManagedEnvironmentCapacityHeavyUsageError.
- The documented AllowBringYourOwnPublicIpAddress network feature initially
  returned NotRegistered. Its registration immediately returned Registered,
  Microsoft.Network re-registration completed, and a separate read confirmed
  both Registered. No third-party approval was required for this feature in
  this subscription. Evidence:
  `artifacts/discovery-resume-network-feature-registration-20261001.json` and
  `artifacts/discovery-resume-network-provider-20261001.json`.

2026-10-01 private-client follow-up validation:

- `az bicep build --file infra/blob-client.bicep` passed without schema errors.
- Live `az deployment group validate` and `what-if` passed for the existing
  lab RG, selected Ubuntu image, VM SKU, and task-specific public key.
- Parsed the preview and asserted exactly five creates (NSG, subnet, NIC,
  VM, and Storage-scoped role), no other changes, no public IP, no password,
  and system-assigned managed identity.
- Static RBAC review confirms the VM receives only Storage Blob Data
  Contributor on the lab account, not the Discovery platform/network roles.
- Eleven shared-helper tests and six private-client tests passed, covering
  private DNS enforcement, read-back hashes, reuse, and refusal to overwrite
  different existing data.
- Proof: `artifacts/discovery-blob-client-validation-20261001.json` and
  `artifacts/discovery-blob-client-whatif-20261001.json`.

2026-10-01T00:24:38Z: azure-validate completed for the first stage.

- Bicep compilation: `expand-network.bicep`, `access.bicep`,
  `lab-foundation.bicep`, and `discovery-core.bicep` compile.
- `az deployment group validate --template-file infra/expand-network.bicep`
  passed against the selected RG. What-if contains exactly four new subnet
  resources and no updates or deletions.
- `az deployment sub validate --template-file infra/access.bicep` passed.
  What-if contains exactly the two documented role assignments and one
  two-action custom role, all creates.
- Parsed both validation/what-if JSON responses and asserted their success and
  exact allowed change counts.
- Inherited policy assignment lookup returned no assignments for the RG.
- Static role review: Blob roles are scoped to the lab storage account,
  AcrPull to the lab registry, Network Contributor to the lab VNet,
  Managed Identity Operator to the lab identity, and Discovery persona roles
  to the lab RG. Only the first-party NSP/Reader permissions are subscription
  scoped as required by the service.
- Evidence: `artifacts/discovery-{access,network-expansion}-{validation,whatif}-20261001.json`.

2026-10-01T00:34:22Z: foundation validation completed.

- Network and NSP/Reader deployments reached `Succeeded`; live read-back
  confirmed all seven expected subnets and both required control-plane roles.
- `npm run readiness -- --require core` passed against live ARM, with separate
  Bookshelf quota failures preserved. Eleven scope/quota unit tests passed.
- `az deployment group validate` and `what-if` for `lab-foundation.bicep`
  passed after a transient ARM connection timeout was resolved by a fresh
  successful connectivity probe and retry.
- What-if was parsed: exactly 12 creates, no modification/deletion; storage
  default deny, shared keys disabled, and anonymous blobs disabled asserted.
- Evidence: `artifacts/discovery-foundation-{validation,whatif}-20261001.json`.

2026-10-01T00:37:06Z: core ARM validation completed.

- Foundation deployment succeeded. Live storage read-back confirms LRS,
  default deny, shared keys/anonymous blobs disabled. ACR Basic has both admin
  and anonymous access disabled. All five intended UAMI roles are visible.
- Core ARM validation and what-if passed; exactly eight Discovery creates,
  no changes/deletes. `NetworkIsolation=true`, authenticated Workspace public
  access, and CPU min 0/max 1 were asserted from the preview.
- Evidence: `artifacts/discovery-core-{validation,whatif}-20261001.json`.
- Client Blob listing still returns `403 AuthorizationFailure`; investigate
  client egress/firewall propagation without opening the account to all
  networks. This is not a claim that L01/L02 data-plane pass criteria passed.

Read-only preparation confirmed: subscription and tenant match; the lab
administrator has unconditional inherited Owner; the service principal exists;
all queried dependency providers are Registered; Workspace GET succeeds.
Regional, Dsv6, and Esv6 vCPU quotas are 100 with usage 0. D4s_v6 is available
regionally with a zone-2 restriction; no zone is requested by this template.
GPT-5.4 Global Standard quota has 3,000,000 TPM available. Bicep compilation of
the network/access/foundation and eight existing scope-guard tests succeeded.
The Discovery GA schemas were cross-checked against the official quickstart
and Azure/azure-rest-api-specs because the MCP schema catalog lacks these types.
Run ARM validation and review what-if before each deployment stage.

Initial inline-VNet expansion failed read-only provider validation with
`IncompatibleDelegations` on the existing agent subnet (tracking ID
`6d093c02-0dd1-4ff5-b5a1-a67b3b6d8e7c`). No PUT was issued. Use the surgical
child-subnet template instead and revalidate; do not treat this failure as a
successful deployment or retry the full VNet blindly.

Additional observed gates and corrections:

- Activity Log identified management-group policy
`StorageAccount_PublicNetwork_Modify` under `MCAPSGovDeployPolicies`, which
set Storage public access to Disabled during the successful deployment.
The earlier RG-only policy listing was insufficient; it did not prove the
absence of inherited policy. Keep policy enabled and use private access.
- Supercomputer child AKS requests at 00:42:00Z and 00:47:37Z failed with
`AKSCapacityHeavyUsage` in Sweden Central, despite sufficient VM quota.
Correlation: `75d88d20-5dd2-4963-b2b1-00dc4b1039e4`.
Do not alter managed AKS settings or change regions by partially mixing
this same-region stack. Preserve evidence; evaluate a complete alternate-
region deployment separately if the capacity gate remains blocked.
- ACR task `dt1` succeeded and produced image
`sha256:0051d5db6c367812c22073d807da54b469ecbcc58edb7cfaf0dbce5e78514ad1`.
- GA Tool ARM validation requires `properties.version`, not the Preview
documentation example's `definitionContentVersion`. Corrected the Bicep
and both guides; corrected validation/what-if now pass.
- Private Blob endpoint/DNS Bicep compilation, ARM validation, and what-if
pass. Check the exact change set before applying these independent
prerequisites. Client access still requires an approved VNet path.

2026-10-01T00:55:56Z: independent Tool/private-access stages validated.

- Parsed and asserted exactly one new Tool, GA `properties.version=1.0.0`,
the observed immutable ACR digest, two actions, and GPU 0.
- Parsed and asserted exactly five new private-access resources: storage PE
subnet, endpoint, zone, VNet link, and zone group. No existing Blob private
DNS zone was returned in this subscription. No existing resources deleted.
- Private access depends on the existing Storage/VNet, not successful AKS
allocation; it can be prepared while the core regional capacity gate waits.
- Revalidated the private-only foundation source. Its what-if contains the
intended old client-IP rule removal plus unresolved identity references
and omitted provider-default properties. Do not reapply all those resources
to reconcile one unused firewall rule; remove only the exact rule created
by this session, then read back the Storage configuration.

Supported staged recovery after four observed AKS allocation failures:

- The official GA Workspace schema and TypeSpec both declare
`supercomputerIds` optional. Validate a separate `deployCompute=false`
phase rather than treating an unavailable Supercomputer as ready.
- Before any separate Workspace create, cancel only the original named ARM
deployment to avoid overlapping writes. This is not resource deletion and
does not guarantee termination of the underlying provider operation.
- Workspace-only mode is explicit, leaves compute outputs null, and cannot
satisfy the full L01, Bookshelf indexing, or CPU-execution pass criteria.
- No Workspace currently exists, so this mode will not clear an existing
Workspace's compute links. Validate and preview before creating it.

2026-10-01T01:08:09Z: Workspace-only stage validated.

- Original `discovery-core-20261001` ARM deployment is `Canceled`; its CLI
completed with the expected canceled status. Already-created resources
and the service-managed retry state are retained, not reported as deleted.
- Bicep and live provider validation passed with `deployCompute=false`.
- Re-read the existing Storage Container mount protocol (`BlobfuseCaching`)
and pinned it to avoid a spurious overwrite during resume.
- Final parsed what-if contains exactly Workspace, `gpt-5-4`, and Project
creates, no other changes. The Workspace listing was empty before this.
- Evidence: `artifacts/discovery-workspace-{validation,whatif}-20261001.json`
and `artifacts/discovery-core-cancelled-20261001.json`.

## 8. Deployment results

Network expansion, control-plane access, Storage/ACR foundation, private Blob
endpoint/DNS, Discovery Storage Container/Assets, and the digest-pinned Tool
are deployed and verified. The original core ARM deployment is Canceled;
Supercomputer subsequently reported Failed following regional AKS capacity
errors. No CPU pool was created.

Workspace-only deployment reached `Failed` after roughly 55 minutes. Its
Container Apps environment failed with `ManagedEnvironmentCapacityHeavyUsageError`
caused by `AKSCapacityHeavyUsage` (request
`0ea9a155-9803-4e6c-85fd-b8ed67a02502`). Thus omitting Supercomputer does not
bypass the region's shared AKS capacity limit. Its managed resources include
Search/Cosmos/Foundry/Storage and the auto cognition GPT-5.4 deployment. An
inherited governance diagnostic deployment failed because its shared central
Log Analytics workspace does not exist. This is recorded, not automatically
remediated outside the lab scope; it is separate from the confirmed capacity
root cause. The actual service-assigned Foundry Owner role on the MRG was
verified rather than adding a redundant Foundry User role.

Bookshelf remains blocked by model quota. The follow-up VM provides a verified
private Blob upload/read-back path; direct local-browser access is separate. Neither agent/Engine nor actual
Supercomputer tool execution has been performed.

Playwright headless reached the normal Microsoft Studio sign-in page. No
interactive sign-in or credential/cookie extraction was performed. Final
token-free inventory is `artifacts/discovery-execution-20261001.json`.

## 9. Private Blob client follow-up

- Add one `Standard_B2als_v2` Ubuntu 24.04 VM in the existing lab VNet,
  a dedicated `10.80.9.0/24` subnet, private NIC, and deny-all inbound NSG.
  No public IP, SSH ingress, VPN gateway, or Bastion.
- Use VM Run Command as the authenticated management path. The VM's new
  system-assigned identity gets Blob Data Contributor on only the lab Storage
  account; it does not inherit the Discovery UAMI's platform/network rights.
- Keep default outbound disabled. The Storage service endpoint supports VM
  agent Storage traffic; validate Run Command response delivery in practice.
- Use Python standard library and IMDS for private-DNS resolution, keyless
  upload, and read-back SHA-256 verification of the five existing synthetic
  input files. Do not silently overwrite different existing contents.
- Deallocate the VM after verification; OS disk remains billable and the
  client can be started again for further lab file operations.
- Live CLI fallback checked SKU, 2 vCPU/4 GiB, no regional restrictions,
  100 unused regional/Basv2 vCPUs, and Ubuntu image `24.04.202609040`.
  The installed Compute MCP exposes no list-skus/list-images/check-quota
  operations, so its documented CLI fallbacks were used.
- Published VM retail price: USD 0.0389/hour, excluding OS disk and other
  resources. No increased quota or new-region paid stack is assumed approved.
- A task-specific SSH bootstrap key was created only in the session folder,
  private file mode 0600. Only its public key was passed to Azure; the unused
  private key is removed after the completed deployment.
- Legitimate Discovery delegated API token acquisition succeeded for the
  expected tenant. This does not log the Studio browser in.

Follow-up execution proof:

- VM deployment succeeded; guest agent Ready, private address `10.80.9.4`,
  no public IP. The VM identity's Storage-account-only data role was verified.
- `npm run blob:sync` uploaded all five synthetic inputs via private DNS
  `10.80.8.4`; each was read back with a matching source SHA-256 and Azure
  request ID. A second live run reused all five without overwriting.
- VM deallocation was verified at `2026-10-01T02:47:20Z`.
- The existing `Discovery Default Project` was verified Succeeded. No
  duplicate Foundry project or quota request was created.
- User-owned quota submission is pending confirmation; the latest service
  response still reports one million TPM limits for each required model.
