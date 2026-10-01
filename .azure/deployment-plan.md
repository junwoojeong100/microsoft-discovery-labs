# Discovery lab deployment plan

Status: Blocked

Status checked on 2026-10-01 at 15:52 KST. The previously validated single
retry is already running; this is not permission to start another deployment.

2026-10-01 15:30 KST follow-up: the user requested resource creation from the
hands-on guide and a complete record of restrictions. Reuse the same lab
subscription, RG, region, names, identity, and private-network configuration.
Do not delete failed resources or duplicate the paid stack in another region.

The existing Workspace is Failed. The Supercomputer is now Accepted after a
single retry, and the parent deployment is Running. Its backing AKS returned a
new AKSCapacityHeavyUsage error at 15:46:52 KST. No terminal result is claimed.
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
  It does not submit additional retries, cancel, delete, or change regions.

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
