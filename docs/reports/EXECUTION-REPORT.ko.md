# Microsoft Discovery 실제 실행 보고서

**2026-10-01: Discovery 사용 활성화 후 실제 리소스 생성을 진행하고 실습 가이드를 수정했다. 전체 연구 실습은 아직 완료되지 않았다.**

구독 `51531604-2337-4c05-bc05-3c3d4ff154e5`, 테넌트 `46e9cdaa-fed3-4131-aa28-c1fc8a8a043a`, RG `rg-discovery-hol-20260930`과 **Discovery home Sweden Central**을 유지했다. 초기 단일 리전 실행에서는 기존 네트워크·UAMI를 재사용했고, 저녁 교차 리전 실행에서는 Korea Central 전용 지원 자원을 추가했다. 다른 프로젝트의 자원·정책·모델 배포를 삭제하지 않았다.

## 2026-10-01 23:32 KST — Workspace·Project·실제 CPU 실행 완료

**새 코어 리소스 생성과 실제 합성 파일·도구 실행을 완료했다.** Discovery home은 **Sweden Central**, 관리 런타임·Foundry·AKS·Blob·ACR은 **Korea Central**이다. 아래 이전 절의 Workspace quota 차단은 당시 기록이며, 현재 Workspace와 Project는 Succeeded다.

| 단계 | 최종 상태 / 완료 시각 KST |
|---|---|
| `discovery-korea-workspace-20261001` | **Succeeded · 22:52:51**, 새 Workspace `discoveryholjunwookc` |
| `discovery-korea-children-20261001` | **Succeeded · 23:18:23**, 검증 모델·데이터 참조·Asset 2개·Project |
| `discovery-korea-runtime-20261001` | **Succeeded · 23:19:27**, 전용 `thermal-ranking-kc` Tool·입출력 mount Asset |
| 실제 업로드·계산 작업 | **Succeeded · 23:24:52**, `792ae74bbb5d419b861cf0505adb9217` |
| 별도 작업의 영속 파일 재조회 | **Succeeded · 23:25:50**, `5d8604fa785b42a18e5a86e2841e3fa1` |

**Workspace:** <https://studio.discovery.microsoft.com/workspaces/discoveryholjunwookc>

**실습 Project:** `thermalhol`

**새 Foundry Project endpoint:** <https://aif-dwsp-foundry-bdnxfqaa.services.ai.azure.com/api/projects/thermalholbdnxfqaa>

### 확정한 모델 할당

| 배포 | 용도 | 모델 / 버전 | SKU | 실제 할당 |
|---|---|---|---|---:|
| `gpt-5.4` | 자동 cognition | `gpt-5.4` / `2026-03-05` | **GlobalStandard** | **250,000 TPM** |
| `gpt-5-4` | Discovery 검증 | `gpt-5.4` / `2026-03-05` | **GlobalStandard** | **250,000 TPM** |

둘 다 Succeeded이며 rateLimits와 capacity 250을 확인했다. **새 Workspace 합계는 500,000 TPM**다. 보존한 기존 Sweden 모델 1,000 TPM까지 구독 할당은 **501,000 TPM**, 총한도 3,000,000 중 미할당은 **2,499,000 TPM**다.

진행 도중 사용자가 새 cognition을 2,999,000 TPM로 높인 기록을 발견해 검증 모델 제출 전 quota 검사를 중단했다. 이후 사용자가 최종적으로 **250,000 TPM**를 지정하고 **22:58:45 KST에 저장한 값**을 확인한 뒤 생성했다. DataZoneStandard는 대안으로 검토·사전 검증만 했으며 **실제 생성하지 않았다**. 기존 모델이나 프로젝트를 삭제하지 않았고 사용자 변경을 임의로 되돌리지 않았다. [최종 모델](../../artifacts/discovery-korea-final-models-20261001.json), [실제 quota](../../artifacts/discovery-korea-final-model-quota-20261001.json)를 참고한다.

### 이번에 완료한 실제 파일·도구 작업

기존 이미지의 SHA-256 digest를 유지해 Korea ACR로 import하고 별도 Tool `thermal-ranking-kc`를 등록했다. GA 데이터 평면 **`2026-06-01`**과 기존 `cpulab`을 사용했다. 브라우저의 가상 화면이나 로컬 계산을 클라우드 실행으로 대체하지 않았다.

첫 실제 작업은 TXT 4개·CSV 1개를 새 Korea Blob 입력 경로에 저장하고, `baseline`과 `cost3` 계산 결과 JSON을 `discoveryoutputs/compute/lab-korea-20261001-v2/`에 남겼다. **두 번째 독립 작업은 read-only input mount에서 같은 7개 파일을 다시 읽어 모든 SHA-256이 첫 작업과 일치함을 확인했다.** 기존에 다른 내용이 있는 파일은 덮어쓰지 않는 구현이다. 공유 키·SAS·공개 Storage 접근을 사용하지 않았고 별도 VM이나 추가 RBAC를 만들지 않았다.

공식 operation 목록에서 두 작업의 Succeeded와 실제 `sc-discovery-hol-kc/nodePools/cpulab` 배정을 재확인했다. 최종 computeUsage는 **activeJobs=0, pendingJobs=0**이다. **23:37 KST에는 cpulab이 자동으로 0대까지 축소됐고 시스템 노드 2대는 유지**된 것을 확인했다. 수동 스케일 변경은 하지 않았다. CPU 요청 1/max 2, 메모리 2Gi/max 4Gi, GPU 0, replica 1, 작업당 30분 제한을 사용했다.

[초기 작업 `8faa084217154c7eab9260629acf93ef`](../../artifacts/discovery-tool-lab-korea-20261001-sync-and-rank.json)는 gzip inline 파일이 런타임에서 자동 해제되지 않아 Python `Non-UTF-8` 오류로 Failed였다. 문서 계약의 gzip+base64는 유지하고 `.gz`를 명시적으로 해제한 뒤 재실행해 해결했다. 실패 기록을 삭제하거나 성공으로 바꾸지 않았다.

다운로드한 실제 JSON의 모든 필드는 로컬 검증기로 비교했으며 baseline 적격 3개, cost3 적격 1개가 일치했다. 그 검증기의 `execution_verified:false`는 내용 검증과 실행 출처를 분리하기 위한 정상 출력이다. **클라우드 실행 출처는 별도의 실제 operation·로그·nodepool 증거로 확인했다.**

| 증거 | 파일 |
|---|---|
| 최종 결과·지역·모델·완료 경계 | [최종 검증](../../artifacts/discovery-korea-final-result-20261001.json) |
| Workspace / 자식 배포 | [Workspace](../../artifacts/discovery-korea-workspace-deployment-20261001.json) · [모델·Project](../../artifacts/discovery-korea-children-deployment-20261001.json) |
| 실제 업로드·계산 / 독립 읽기 | [첫 성공 작업](../../artifacts/discovery-tool-lab-korea-20261001-v2-sync-and-rank.json) · [별도 재조회](../../artifacts/discovery-tool-lab-korea-20261001-v2-verify-files.json) |
| 서버의 실행 출처 / 남은 작업 수 | [operations](../../artifacts/discovery-korea-runtime-operations-20261001.json) · [computeUsage](../../artifacts/discovery-korea-runtime-compute-20261001.json) |
| 실제 계산 결과 | [baseline](../../artifacts/discovery-korea-ranking-baseline-20261001.json) · [cost3](../../artifacts/discovery-korea-ranking-cost3-20261001.json) |

### 남은 외부 조건과 검증하지 않은 기능

- **Bookshelf:** gpt-5-mini / embedding 총한도는 여전히 각각 1,000,000 TPM, 미할당은 990,000 / 780,000 TPM다. 기존 증액 요청을 중복 제출하지 않았다. Microsoft 승인·한도 반영이 필요하다.
- **Defender 정책 애드온:** 기존 정책 관리 ID에 새 두 컴퓨트 서브넷의 최소 read/join 권한을 추가하는 승인을 요청했지만 응답을 받지 못했다. **권한·정책 예외를 임의 변경하지 않았다.** 이것은 성공한 직접 Tool 실행과 별개의 거버넌스 미완료 항목이다.
- Bookshelf 색인·KB 기반 에이전트·자율 Discovery Engine 조사·다중 사용자 실습 전체는 실행하지 않았다. 이번 성공 범위는 코어 프로비저닝과 직접 CPU 도구/사설 파일 경로다.
- 사용자 풀이 자동 축소돼도 시스템 노드·디스크·Storage·ACR·Private Endpoint·로그 비용은 남는다.

### 저장소 정리와 GitHub Pages

GitHub 저장소를 **`junwoojeong100/microsoft-discovery-labs`**로 변경하고 origin을 갱신했다. Private 상태는 유지했다. 문서는 `docs/labs/`, `docs/architecture/`, `docs/reports/`로 옮겼고 기존 참고 자료는 `docs/deployment-reference/`에 둔다. 실행 증거 `artifacts/`는 별도로 유지한다.

공개용 사이트 빌드는 계정·구독 식별자를 예시로 치환하고 원본 `artifacts/`, `config/`, `infra/`, PDF를 제외한다. `npm run check:site`로 HTML 링크와 모바일/데스크톱을 확인하며 `.github/workflows/pages.yml`은 `PAGES_ENABLED=true`가 설정된 경우에만 게시한다.

**현재 Pages URL은 아직 게시되지 않았다.** GitHub API가 **HTTP 422, “Your current plan does not support GitHub Pages for this repository.”**로 거절했다. Private 저장소 요금제 업그레이드 또는 별도 공개 문서 저장소 승인이 필요하며, 임의 Public 전환·결제·새 공개 저장소 생성은 하지 않았다. 예정 주소를 실제 서비스 중인 링크로 표시하지 않는다.

원격에 먼저 반영된 Dependabot 업데이트를 보존해 병합한 뒤 정상 push했다. [실제 GitHub Actions 실행](https://github.com/junwoojeong100/microsoft-discovery-labs/actions/runs/36878682402)은 **build=success, deploy=skipped**다. 사이트 생성 성공과 실제 Pages 게시 성공을 구분한다.

## 2026-10-01 21:32 KST — Sweden home 유지, Korea 컴퓨트 생성 성공

**요청한 교차 리전 컴퓨트와 지원 인프라는 생성됐다.** Discovery home은 **Sweden Central**, target compute는 **Korea Central**이다. 새 Supercomputer·CPU pool과 실제 AKS·두 VMSS가 모두 **Succeeded**다. 이번 한국 중부 AKS 생성은 완료됐지만, Sweden Central 전체의 용량 문제가 해결됐다는 뜻은 아니다. **새 Workspace와 전체 연구 실습까지 완료한 것은 아니다.**

| 배포 | 최종 결과 / 완료 시각 KST |
|---|---|
| `discovery-korea-foundation-20261001` | **Succeeded · 21:05:23** |
| `discovery-korea-compute-20261001` | **Succeeded · 21:28:45** |

### 실제 리소스 위치와 상태

| 대상 | 실제 위치 / 결과 |
|---|---|
| 기존 RG `rg-discovery-hol-20260930` | **Sweden Central 유지**. 새 Korea 지원 자원도 이 RG에 있으므로 전체 삭제 금지 |
| Discovery `sc-discovery-hol-kc` | **Sweden Central · Succeeded** |
| Discovery 하위 `sc-discovery-hol-kc/cpulab` | **Sweden Central · Succeeded**, min 0 / max 1 |
| Discovery MRG `mrg-dscmp-sc-discovery-hol-kc-a13wxu` | **Sweden Central**. `managedBy`가 새 Supercomputer를 가리킴 |
| 내부 AKS `aks-dscmp-a13wxu` | **Korea Central · Succeeded** |
| AKS node RG `MC_mrg-dscmp-sc-discovery-hol-kc-a13wxu_aks-dscmp-a13wxu_koreacentral` | **Korea Central · Succeeded**, 실제 소유 AKS 확인 |
| 시스템 VMSS `aks-system-33633578-vmss` | **Korea Central · Succeeded**, D4s_v6 **2대**, 시스템 풀 min 2 / max 3 |
| 사용자 VMSS `aks-cpulab-21384680-vmss` | **Korea Central · Succeeded**, D4s_v6 **0대**, min 0 / max 1 |
| 새 VNet / UAMI | `vnet-discovery-hol-kc` / `id-discovery-hol-kc`, **Korea Central**. 전용 서브넷 8개 |
| 새 Storage / ACR | `stdiscoveryholjunwookc` / `acrdiscoveryholjunwookc`, **Korea Central · Succeeded** |
| Blob PE / DNS | `pe-discovery-blob-kc` Approved/Succeeded, 새 VNet link Completed, 사설 A 레코드 `10.80.8.4` |
| MRG 내부 NSP·Log Analytics·수집 규칙 | **Korea Central**, 기존 West US 2 공통 진단 목적지는 이동하지 않음 |

[새 Supercomputer 열기](https://portal.azure.com/#resource/subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/rg-discovery-hol-20260930/providers/Microsoft.Discovery/supercomputers/sc-discovery-hol-kc/overview)

### 적용한 교차 리전 계약

[Microsoft Learn의 교차 리전 절차](https://learn.microsoft.com/azure/microsoft-discovery/how-to-deploy-across-regions)에 따라 `location=swedencentral`을 유지하고 생성 시 **`discovery.overridemrgregion=koreacentral`**을 적용했다. 이 구독은 ARM의 `Internal_2014-09-01` 및 Microsoft 관리 테넌트로 확인돼 문서의 Microsoft 소유 구독용 **`SkipAssociateKeyVaultToNsp=true`**도 포함했다. `NetworkIsolation=true`와 workload identity map은 유지했다.

`config/lab.json`에 home과 target을 분리했고, Korea 전용 Bicep 매개변수와 신규 기반 템플릿을 추가했다. 기존 core를 컴파일한 뒤 **existing identity + Supercomputer + CPU pool만** 보존한 payload를 검증·배포했다. 모델 quota가 없는 상태에서 전체 core를 제출하지 않았다. 기반 what-if는 21개 생성, 컴퓨트 what-if는 2개 생성이며 둘 다 기존 자원 수정·삭제는 없었다. 실제 생성 후에도 home/target, 부모·MRG 소유 관계, AKS/VMSS 위치, 풀 제한, 역할과 사설 Storage 설정을 확인했다.

새 관리 ID의 Network Contributor, Managed Identity Operator, Discovery Platform Contributor, AcrPull, Storage Blob Data Contributor는 각각 필요한 새 자원 또는 실습 RG 범위에서 확인됐다. Storage 공개 접근·공유 키·익명 Blob과 ACR admin·anonymous pull은 비활성이다. **사용자 풀이 0대여도 시스템 노드 2대, 디스크, ACR, Private Endpoint, 로그 등 비용은 남는다.**

### 별도로 남은 제약

| 항목 | 실제 확인 / 남은 작업 |
|---|---|
| **신규 Workspace 모델 quota** | Korea Central quota API에서도 GPT-5.4 GlobalStandard는 **3,000,000 / 3,000,000 TPM**, 미할당 **0**. 새 cognition·검증 배포용 500,000 TPM 확보 전 `discoveryholjunwookc` 생성은 미제출 |
| 기존 모델 보존 | `aif-dwsp-foundry-ym5ffvaa/gpt-5.4`는 **Succeeded / 3,000,000 TPM** 유지. 가드레일·업그레이드 정책도 유지. 재배분 확인 요청에 응답이 없어 임의 축소하지 않음 |
| DataZoneStandard | 잔여 **300,000 TPM**은 별도 SKU다. 전체 500,000 TPM 조건이나 자동 cognition의 SKU 변경을 대신한다고 가정하지 않음 |
| Bookshelf | gpt-5-mini / embedding 미할당 **990,000 / 780,000 TPM**. 운영 기준 미달로 미생성 |
| **별도 Azure Policy 애드온 실패** | 기존 Defender의 자동 정책 배포가 `LinkedAuthorizationFailed`. 정책 관리 ID의 principal ID `02e03d89-915c-4be6-a882-ebde1beda2e4`에 **새 `aksSubnet`의 `Microsoft.Network/virtualNetworks/subnets/join/action` 권한이 없음** |
| 데이터·도구·연구 실행 | 새 Storage/ACR로 기존 파일·도구 이미지를 복사하지 않음. 새 Project·Bookshelf·Studio 연구·실제 Tool/Engine 실행은 미검증 |

정책 실패는 기존 구독 할당 **`Defender for Containers provisioning Azure Policy Addon for Kub`**의 별도 작업이다. `Policy-Update-aks-dscmp-a13wxu`와 상위 `PolicyDeployment_6833426721961857027` 두 Failed 기록은 **같은 정책 작업의 실패**이며 새 Supercomputer/AKS 생성 실패가 아니다. 당시 AKS 응답에는 `azurepolicy` 애드온이 없었다. 정책 관리 ID에는 Defender/Log Analytics 역할이 있지만 필요한 linked-subnet join 권한이 없어, 이 범위를 보완한 뒤 해당 정책을 다시 적용해야 한다. **추가 권한·정책 예외를 임의 부여하거나 관리 AKS를 직접 재구성하지 않았고 전체 정책 준수를 주장하지 않는다.**

### Sweden 정리 인계와 완료 경계

별도 에이전트가 기존 `sc-discovery-hol` 및 전용 `mrg-dscmp-sc-discovery-hol-b6wiwf`의 소유 관계를 확인했다. 이후 사용자가 **직접 삭제**하기로 했으므로 에이전트의 삭제는 **0건**이다. 기존 부모 Supercomputer를 먼저 삭제하는 경로를 안내했으며 사용자의 실제 수동 삭제 완료까지 확인한 것은 아니다.

**보존 대상:** 랩 RG 전체, 새 `-kc` Supercomputer/MRG, 기존 Workspace MRG `mrg-dwsp-discoveryholjunwoosc-ym5ffv`, Foundry 모델, 기존 데이터·네트워크와 공유 `McapsGovernance`. 특히 새 컴퓨트 MRG가 Sweden Central에 표시되는 것은 정상이며 삭제 이유가 아니다.

| 증거 | 파일 |
|---|---|
| 최종 검증 결과·범위·각 관측 시각 | [교차 리전 결과](../../artifacts/discovery-korea-deployment-result-20261001.json) |
| 성공한 실제 배포 | [기반](../../artifacts/discovery-korea-foundation-deployment-20261001.json) · [컴퓨트](../../artifacts/discovery-korea-compute-deployment-20261001.json) |
| 검증·정확한 쓰기 범위 | [기반 proof](../../artifacts/discovery-korea-foundation-proof-20261001.json) · [compute proof](../../artifacts/discovery-korea-compute-proof-20261001.json) |
| Discovery / 실제 AKS / 실제 VMSS | [Supercomputer](../../artifacts/discovery-korea-compute-resource-20261001.json) · [cpulab](../../artifacts/discovery-korea-cpulab-20261001.json) · [AKS](../../artifacts/discovery-korea-aks-current-20261001.json) · [VMSS](../../artifacts/discovery-korea-vmss-20261001.json) |
| quota와 기존 모델 보존 | [target readiness](../../artifacts/discovery-korea-readiness-20261001.json) · [기존 모델](../../artifacts/discovery-korea-preserved-model-20261001.json) |
| 별도 정책 실패 | [하위 배포](../../artifacts/discovery-korea-managed-deployments-20261001.json) · [정책 ID](../../artifacts/discovery-korea-policy-assignment-20261001.json) · [기존 역할](../../artifacts/discovery-korea-policy-network-roles-20261001.json) |
| 수동 정리 인계 | [삭제 범위 점검](../../artifacts/discovery-sweden-compute-cleanup-20261001-operation.json) |

## 2026-10-01 19:48 KST — 기존 Foundry 배포 TPM 최대치 확인

사용자가 지정한 **`aif-dwsp-foundry-ym5ffvaa`**에서 기존 배포 `gpt-5.4`의 TPM이 **250,000 → 3,000,000(12배)**으로 저장된 것을 확인했다. 첨부된 Contoso 화면은 예시로 확인됐으며 해당 계정은 변경하지 않았다.

실제 Discovery Foundry의 편집 패널에서 **슬라이더 3,000,000 / 최대 3,000,000 및 Saving 상태**를 관측했다. 공유 화면에서 이미 시작된 저장을 중복 제출하지 않고 완료를 기다린 뒤, 별도 ARM 조회로 `Succeeded`, `sku.capacity=3000`, `currentCapacity=3000`, **3,000,000 TPM / 30,000 RPM**을 확인했다. 직접 수행하지 않은 슬라이더·Save 클릭을 수행했다고 기록하지 않는다.

모델 `gpt-5.4` revision `2026-03-05`, GlobalStandard, 가드레일 `cogloopcontentfilter`, 업그레이드 정책 `OnceCurrentVersionExpired`는 유지됐다. 승인된 Private Endpoint와 네트워크 `defaultAction=Deny`도 그대로이며, 사설 연결이나 방화벽을 해제하지 않았다.

**이 계정의 기존 모델 배포는 한 개뿐이었다.** Bookshelf용 gpt-5-mini/embedding 배포는 없어 슬라이더 변경 대상으로 만들지 않았다. 해당 두 모델의 총 quota는 각각 1,000,000 TPM, 잔여는 990,000 / 780,000 TPM로 그대로다.

**최대 할당 후 주의:** GPT-5.4의 승인 quota 3,000,000 TPM를 기존 배포가 모두 할당받아 미할당 quota는 **0**이다. 나중에 별도 `gpt-5-4` 검증 배포를 추가하려면 명시적인 할당 재배분이나 quota 증액이 필요하다. `readiness`의 신규 할당 검사가 실패하더라도 이미 있는 모델 배포의 실패와 혼동하지 않는다. 실제 추론 부하나 전체 Discovery 실습 성공을 검증한 것은 아니다.

근거: [변경 전후·최대치·완료 경계](../../artifacts/discovery-foundry-tpm-update-20261001.json), [배포 실제 상태](../../artifacts/discovery-foundry-tpm-deployment-20261001.json), [공유 quota](../../artifacts/discovery-foundry-tpm-usage-20261001.json), [네트워크](../../artifacts/discovery-foundry-tpm-network-20261001.json).

## 2026-10-01 16:28 KST — 중앙 진단 설정 복구 완료

**중앙 Log Analytics 대상 누락에 따른 진단 설정 오류는 해결했다.** 남은 핵심 블로커는 **Sweden Central의 AKS/Container Apps 용량과 Bookshelf 운영 모델 quota**다. 앞서 진행 중이던 코어 재시도는 **16:14:43 KST에 최종 Failed**로 끝났다. 아래 15:52의 Running/Accepted는 당시 기록이며 현재 상태가 아니다.

### 원인과 최소 복구 범위

사용자의 16:10 후속 요청에 따라 조사한 결과, 중앙 워크스페이스뿐 아니라 **`McapsGovernance` 리소스 그룹 자체가 없었다**. 같은 이름의 복구 가능한 soft-deleted 워크스페이스도 없었다. 기존 Discovery MRG의 두 Log Analytics는 정상 존재하지만, 조직 정책이 정확한 중앙 workspace ID를 요구하므로 임의 대체하지 않았다.

관리 그룹의 기존 `MCAPSGovDeployPolicies`에는 누락된 RG와 워크스페이스를 생성하는 두 `deployIfNotExists` 규칙이 이미 있었고, 해당 구독은 두 규칙에 NonCompliant였다. 기존 정책 관리 ID의 상속 Owner 권한도 확인했다. **정책 정의·할당·예외·RBAC를 변경하지 않고** 다음 세 규칙만 순서대로 복구했다.

| 단계 | 적용 범위 | 실제 결과 / 완료 시각 KST |
|---|---|---|
| `NewResourceGroupDeploy` | 해당 구독의 누락된 중앙 RG | `McapsGovernance` 생성, **Succeeded · 16:21:45** |
| `NewLogAnalyticsWorkspaceDeploy` | 해당 구독의 지정 중앙 workspace | `mcaps4c05bc053c3d4ff154e5-la` 생성, **Succeeded · 16:23:41** |
| `EnableCognitiveServicesDiagnostics` | **`aif-dwsp-foundry-ym5ffvaa` 리소스 하나만** | `setByPolicy-MCAPSGovernance` 생성, **Succeeded · 16:26:08** |

세 remediation은 각각 **실제 배포 1개 / 성공 1개 / 실패 0개**다. 단순 Accepted나 배포 수 0의 Succeeded를 완료 증거로 삼지 않았다. 전체 관리 그룹·전체 initiative·다른 Cognitive Services 계정에 일괄 복구를 실행하지 않았다.

### 실제 저장소와 진단 설정 확인

| 항목 | GET으로 확인한 값 |
|---|---|
| 중앙 RG / workspace | `McapsGovernance` / `mcaps4c05bc053c3d4ff154e5-la`, 생성 Succeeded |
| 리전·과금·보존 | 기존 조직 정책 기본값 **West US 2 / PerGB2018 / 30일** |
| 수집 대상 | Discovery 관리 Foundry 계정 `aif-dwsp-foundry-ym5ffvaa` |
| 진단 프로필 | `setByPolicy-MCAPSGovernance` |
| 목적지 | 새 중앙 workspace의 **정확한 ARM ID**와 일치 |
| 로그·메트릭 | **`allLogs=true`, `AllMetrics=true`** |
| 비용 경계 | 정책 기본값 `dailyQuotaGb=-1` 유지. 수집·보관 종량제 비용 가능, 실제 누적 비용 미조회 |

이 중앙 저장소는 **조직의 공통 진단 대상**이며 Discovery 작업 스택을 West US 2로 옮긴 것이 아니다. 원본·입출력 Blob은 Sweden Central에 남는다. 다만 진단 로그는 정책에 따라 West US 2로 전송하도록 구성됐으므로 모든 데이터가 Sweden Central에만 머문다고 표현하지 않는다. 공유 RG의 `Do Not Delete` 태그를 유지했으며 실습 RG 정리와 함께 자동 삭제하지 않는다.

**완료 경계:** 리소스 생성, 진단 목적지, 로그/메트릭 활성화를 실제 확인했다. 실습 MRG 범위의 후속 재평가도 완료돼 **해당 Foundry 계정의 `EnableCognitiveServicesDiagnostics` 정책은 Compliant**로 확인됐다. [실제 평가 시각은 16:30:10 KST](../../artifacts/discovery-governance-compliance-20261001.json)다. 전체 구독의 모든 정책 준수, 실제 로그 유입, 과거 누락 로그의 소급 복구까지 확인한 것은 아니다. 과거 `PolicyDeployment_4802795780941947574`의 Failed 이력도 삭제하거나 성공으로 바꾸지 않았다.

### 남은 작업과 증거

코어 재시도 `discovery-core-resume-20261001-1530`은 Supercomputer 대상 `ResourceDeploymentFailure`로 종료됐다. 16:21의 재조회에서도 **Workspace와 Supercomputer 모두 Failed**, `cpulab`/`indexlab`/`gpt-5-4`/`thermalhol`은 404, Bookshelf 목록은 비어 있었다. 지역 용량은 중앙 로그 복구와 별개다. 복구 후 모델 quota 재조회에서도 gpt-5-mini/embedding의 잔여량은 **990,000 / 780,000 TPM**로 그대로였다.

| 증거 | 파일 |
|---|---|
| 복구 결과·정확한 범위·검증 경계 | [복구 요약](../../artifacts/discovery-governance-recovery-20261001.json) |
| 세 remediation 최종 결과 | [RG](../../artifacts/discovery-governance-rg-remediation-20261001.json) · [workspace](../../artifacts/discovery-governance-workspace-remediation-20261001.json) · [진단 설정](../../artifacts/discovery-governance-diagnostics-remediation-20261001.json) |
| 실제 생성·설정 GET | [RG](../../artifacts/discovery-governance-resource-group-20261001.json) · [workspace](../../artifacts/discovery-governance-workspace-20261001.json) · [로그·메트릭·목적지](../../artifacts/discovery-governance-diagnostic-setting-20261001.json) |
| 코어 최종 실패·하위 작업 | [최종 배포](../../artifacts/discovery-resume-deployment-20261001.json) · [operations](../../artifacts/discovery-resume-operations-20261001.json) |
| 16:21 코어 상태 / 복구 후 quota | [시각 고정 스냅샷](../../artifacts/discovery-resume-snapshot-20261001-1621.json) · [readiness](../../artifacts/discovery-governance-readiness-20261001.json) |

## 2026-10-01 15:52 KST — 현재 블로커와 재시도 상태

**다음은 15:52/15:53 KST 당시 기록이다.** 이후의 코어 최종 실패와 중앙 진단 복구는 위 절에서 확인한다. 이 시점에는 네트워크 feature 등록만 해결됐고 Discovery 환경 생성은 완료되지 않았다.

### 해결한 항목과 실제 변경

`Microsoft.Network/AllowBringYourOwnPublicIpAddress`가 `NotRegistered`인 것을 발견해 등록했다. 현재 계정에는 상속 Owner와 실습 RG의 Discovery Platform Administrator가 있으며, feature 등록은 즉시 **`Registered`**를 반환했다. 이어 `Microsoft.Network` 재등록·전파가 끝났고 독립 재조회에서도 **둘 다 Registered**였다. 이 구독에서는 별도 Microsoft 승인 대기가 없었다. 사용자 동의와 RBAC 권한은 별개이며, 다른 구독의 즉시 승인을 보장하는 것은 아니다.

Bicep 컴파일·ARM 검증·Incremental `what-if`와 기존 역할을 확인한 뒤 **15:43:48 KST에 기존 코어를 한 번만 재시도**했다. 배포 이름은 `discovery-core-resume-20261001-1530`이다. 새 역할 부여, 리소스 삭제, 다른 리전의 유료 스택 복제, 모델 quota 중복 신청은 하지 않았다. Storage 참조와 두 Asset은 재사용됐으며 실제 Blob 파일을 덮어쓴 작업이 아니다.

### 현재 차단 항목

| 구분 | 실제 근거와 영향 | 필요한 조치 |
|---|---|---|
| **핵심 블로커: 지역 AKS 용량** | **15:46:52 KST**, 새 재시도의 하위 AKS가 `AKSCapacityHeavyUsage`로 다시 실패. Feature 등록 이후의 새 오류이므로 과거 실패를 재인용한 것만이 아님 | Azure/Discovery 지원팀이 Sweden Central의 실제 할당 용량·구독 배치 제한을 확인해야 함. 일반 vCPU quota 증액으로 해결된다고 가정하지 않음 |
| **Bookshelf 운영 quota 부족** | `gpt-5-mini` 잔여 **990,000 TPM**, `text-embedding-3-small` 잔여 **780,000 TPM**. 실습 운영 계획값은 각각 **2,000,000 TPM** | 13:41에 제출한 각 총 **3,000,000 TPM** 요청을 추적하고 실제 반영 확인. Bookshelf와 색인 풀 생성은 보류 |
| **별도 거버넌스 실패** | Workspace MRG의 공통 진단 정책 배포가 중앙 Log Analytics `mcapsgovernance/mcaps4c05bc053c3d4ff154e5-la` 누락 오류로 여전히 `Failed` | 조직 관리자가 중앙 진단 대상·정책을 수정. AKS 용량 오류의 직접 원인으로 혼동하지 않음 |
| **후속 실습 완료 조건 미충족** | Workspace `Failed`, Project/검증 모델/CPU 풀이 404. 정상 Studio 프로젝트 접근, 색인·에이전트·계산·Engine 실행은 미검증 | 기반 성공 후 각 완료 기준을 별도로 확인. 로그인 실패가 현재 AKS 생성 실패의 원인이라는 뜻은 아님 |

Bookshelf의 2,000,000 TPM는 **이 실습의 운영 준비 기준**이다. 일부 how-to의 단순 생성 최소치 200,000 TPM와 다르며, Bookshelf 생성 API가 이번에 quota 오류를 반환한 것은 아니다. 미충족 운영 조건과 고정비를 고려해 생성하지 않은 것이다. 두 모델의 총한도는 여전히 각 1,000,000 TPM이며, 신청 접수와 승인·반영을 구분한다.

### 진행 중과 실패를 구분한 리소스 상태

| 대상 | 15:52 KST 조회 | 의미 |
|---|---|---|
| 오후 코어 ARM 배포 | **`Running`** | 상위 최종 결과는 아직 확정되지 않음. `error=null`도 하위 오류가 없다는 뜻은 아님 |
| `sc-discovery-hol` | **`Accepted`** | 오전 `Failed`에서 재요청을 수락한 상태. 성공한 Supercomputer가 아님 |
| `discoveryholjunwoosc` | **`Failed`** | 오전 Workspace 실패 상태 유지. 현재 배포의 Workspace 단계 성공을 확인한 것이 아님 |
| `cpulab`, `indexlab`, `gpt-5-4`, `thermalhol` | **HTTP 404** | 미생성 |
| Bookshelf 목록 | **HTTP 200, 빈 목록** | 미생성 |
| Storage/ACR/VNet/Blob PE/DNS link | **`Succeeded`** | 기존 기반 유지, VNet 서브넷 9개 |
| `thermaldata`, `evidencepack`, `candidatecsv`, `thermal-ranking` | **`Succeeded`** | 데이터 참조·도구 등록 성공. 파일 읽기나 실제 계산 실행을 대신하지 않음 |
| 사설 Blob 클라이언트 VM | **`PowerState/deallocated`** | 추가로 시작하지 않음. OS 디스크는 남음 |

새 재시도의 correlation ID는 **`cf91439f-960e-430a-96af-798274d51c89`**다. 실패 대상은 `mrg-dscmp-sc-discovery-hol-b6wiwf/aks-dscmp-b6wiwf`의 `Microsoft.ContainerService/managedClusters/write`다. 같은 리소스에 겹치는 새 배포를 추가하지 않았다. 기존 한 번의 요청은 종료 상태를 기다리며, 이 시점에 최종 실패·취소·성공을 임의로 확정하지 않는다.

### 블로커가 아닌 항목과 남은 제약

| 항목 | 현재 판정 |
|---|---|
| 서비스 사용 활성화 | 필수 Discovery 유형과 목록 GET 정상. `DefaultFeature=Pending`만으로 접근을 차단하지 않음 |
| Feature 등록·권한 | `AllowBringYourOwnPublicIpAddress`와 `Microsoft.Network` Registered. 배포자·UAMI·공식 control-plane 역할 확인. 추가 권한 확대 불필요 |
| VM/환경 수 quota | 지역 vCPU **2/100**, Dsv6 **0/100**, Esv6 **0/100**, Container Apps 환경 **1/50**. 실제 지역 가용 용량과 다른 지표 |
| 코어 모델 quota | GPT-5.4 미할당 **2,750,000 TPM**로 코어 사전 점검 통과. Bookshelf용 GPT-5.2도 **2,990,000 TPM**로 해당 점검 통과 |
| SKU/zone 제한 | `Standard_D4s_v6`는 Sweden Central **zone 2에 `NotAvailableForSubscription`**. 현재 템플릿은 zone을 지정하지 않으며, 이것이 AKS 오류의 원인이라는 증거는 없음 |
| Storage 네트워크 | 조직 정책에 따라 공개 접근 Disabled 유지. 사설 VM의 과거 파일 5개 업로드·읽기 검증은 완료했지만, 이번에는 파일을 다시 읽지 않았고 노트북의 직접 Blob 경로도 미검증 |
| Azure 도구 인증 | Azure MCP의 목록은 다른 테넌트를 가리켜 변경에 사용하지 않음. 가이드의 계정·테넌트·구독이 일치하는 CLI로만 작업 |
| terminal `Failed` 복구 | 일부 자원은 갱신 시 `Conflict`가 날 수 있으나 **이번 Supercomputer 재요청에서는 이 충돌을 관측하지 않음**. 발생 시 반복 PUT을 중단하고 실패 자원 삭제·재생성은 별도 승인 필요 |
| 비용·검증 범위 | 실패/진행 중 배포에도 MRG·Storage·ACR·PE·로그·디스크 비용이 남을 수 있음. 실제 누적 비용은 미조회. 전체 연구 실습 성공을 주장하지 않음 |

### 오후 실행 증거

| 기록 | 파일 |
|---|---|
| 15:52 리소스·하위 자원·Bookshelf 목록 | [시각 고정 스냅샷](../../artifacts/discovery-resume-snapshot-20261001-1552.json) |
| 15:53 접근·모델 quota | [시각 고정 readiness](../../artifacts/discovery-resume-readiness-20261001-1553.json) |
| Network feature / Provider | [등록 응답](../../artifacts/discovery-resume-network-feature-registration-20261001.json) · [전파 완료](../../artifacts/discovery-resume-network-provider-20261001.json) |
| 배포 전 검증 / 차이 | [ARM validate](../../artifacts/discovery-resume-validation-20261001.json) · [what-if](../../artifacts/discovery-resume-whatif-20261001.json) |
| 현재 상위 배포 / 자원별 진행 | [Running 조회](../../artifacts/discovery-resume-current-deployment-20261001.json) · [진행 내역](../../artifacts/discovery-resume-progress-20261001.json) |
| 새 AKS 실패 | [실제 Activity Log](../../artifacts/discovery-resume-activity-failures-20261001.json) |
| 기존 Workspace의 하위 오류 / 진단 정책 | [Managed Environment](../../artifacts/discovery-resume-environment-20261001.json) · [공통 진단 실패](../../artifacts/discovery-resume-governance-20261001.json) |
| 역할 / VM quota / 클라이언트 | [배포자](../../artifacts/discovery-resume-deployer-roles-20261001.json) · [서비스 역할](../../artifacts/discovery-resume-service-roles-20261001.json) · [한도](../../artifacts/discovery-resume-compute-limits-20261001.json) · [사용량](../../artifacts/discovery-resume-compute-usage-20261001.json) · [VM 상태](../../artifacts/discovery-resume-blob-client-20261001.json) |

다음으로 필요한 외부 조치는 **지역 용량 지원 확인**, **기존 모델 quota 요청 반영**, **조직 공통 진단 대상 복구**다. 지역 용량 지원요청은 아직 제출하지 않았으며 [지원요청 초안](../deployment-reference/03-compute-capacity.ko.md)에 새 correlation ID를 추가했다. 대체 리전 성공을 보장하거나 삭제·리전 이동을 이미 승인받았다고 해석하지 않는다.

## 2026-10-01 — 실제 배포와 차단 원인

이 절은 **오전부터 13:41까지의 과거 실행**을 보존한다. 다음 표는 **11:04 KST의 1차 배포 결과**이며 사설 데이터 클라이언트·파일 업로드 결과는 아래 후속 절에 별도로 기록한다. 중앙 진단과 코어 재시도의 최신 상태는 문서 상단과 구분한다.

| 단계 | 확인된 결과 | 완료 경계 |
|---|---|---|
| 서비스 활성화 | DiscoveryEnabled/DiscoveryPreview/PublicPreview Registered, Workspace GET 성공 | DefaultFeature Pending만으로 차단하면 잘못된 판정 |
| 네트워크 | 기존 3개 보존 + 실습용 4개 + Storage PE용 1개 = **서브넷 8개** | VNet `10.80.0.0/16`; 기본 VM 아웃바운드 비활성 |
| control-plane 역할 | 공식 SP에 구독 Reader + 2-action NSP Joiner | 일반 사용자에게 구독 권한을 확장한 것이 아님 |
| Storage/ACR/관리 ID | LRS Storage, Blob 컨테이너 2개, Basic ACR, 범위를 제한한 역할 생성 성공 | 공유 키·익명 Blob·ACR admin 비활성 |
| 사설 Blob 연결 | PE `pe-discovery-blob` Approved/Succeeded, DNS `10.80.8.4`, VNet link Completed | 로컬 클라이언트의 VPN/사설 경로는 별도 미검증 |
| Discovery 데이터 참조 | `thermaldata`, `evidencepack`, `candidatecsv` 생성 성공 | Blob 파일 업로드 성공을 의미하지 않음 |
| Tool 이미지·리소스 | ACR task `dt1` 성공, `thermal-ranking` version 1.0.0 Succeeded | 이미지 build/등록만 완료; Supercomputer 실행 아님 |
| Supercomputer | `sc-discovery-hol` 최종 `Failed`, 하위 AKS가 반복 `AKSCapacityHeavyUsage` | 실제 노드 풀·계산 실행 불가; 사용 승인 문제가 아님 |
| Workspace-only 재개 | `discoveryholjunwoosc` 최종 `Failed`; 내부 Container Apps도 지역 AKS 용량 부족 | `gpt-5-4`/Project/Studio 사용 준비 실패. 컴퓨트 제외가 지역 용량 우회책은 아님 |
| Bookshelf | 생성하지 않음 | gpt-5-mini/embedding quota 부족으로 고정비 인프라 생성 보류 |
| 에이전트·색인·Engine·협업 | 미실행 | 전체 실습 통과나 실제 기능 시연을 주장하지 않음 |

**Workspace 링크:** <https://studio.discovery.microsoft.com/workspaces/discoveryholjunwoosc>. ARM에 URL이 반환됐지만 Workspace는 실패 상태이며, 사용 가능한 프로젝트를 확인한 링크가 아니다.

당시 리소스별 HTTP 상태·프로비저닝 상태·시각은 [오전 상태 스냅샷](../../artifacts/discovery-execution-20261001.json)에 있다. **11:04 KST** 조회에서는 Workspace와 Supercomputer 모두 `Failed`, 별도 Chat Model Deployment/Project/CPU pool은 404였다. 오전 작업 종료 시에는 새 배포 요청이나 자동 재시도 작업을 추가로 남기지 않았다. 오후의 한 차례 재시도는 위 절과 구분한다.

**실제 Tool 이미지 digest:**

```text
acrdiscoveryholjunwoosc.azurecr.io/thermal-ranking@sha256:0051d5db6c367812c22073d807da54b469ecbcc58edb7cfaf0dbce5e78514ad1
```

### 후속 — 사설 입력 경로 해결과 quota 화면 안내

사용자가 다음 단계를 진행할 수 있도록 요청한 뒤, `vm-discovery-blob-client`를 실제 배포했다. `Standard_B2als_v2`(2 vCPU/4 GB), Ubuntu 24.04이며 공개 IP·SSH 인바운드·NAT/Bastion 없이 `blobClientSubnet`(`10.80.9.0/24`)에 배치했다. 따라서 **현재 VNet의 서브넷은 9개**다. VM 자체 관리 ID에는 실습 Storage 계정의 Blob Data Contributor만 부여했다.

**11:36:54 KST**에 VM Run Command를 통해 TXT 4개와 CSV 1개를 업로드하고, `10.80.8.4`로 해석된 사설 Blob 주소에서 다시 읽어 원본 SHA-256과 일치함을 확인했다. **11:44:04 KST** 재실행에서는 5개 모두 같은 파일로 판정해 덮어쓰지 않고 재사용했다. [첫 업로드 증거](../../artifacts/discovery-private-blob-upload-20261001.json)와 [최신 읽기 검증](../../artifacts/discovery-private-blob-sync.json)에 각 파일의 바이트 수·해시·Azure request ID가 있다. 키/SAS/토큰은 저장하지 않았다.

**11:47:20 KST**에 VM `PowerState/deallocated`를 확인했다. [VM 상태](../../artifacts/discovery-blob-client-state-20261001.json)를 보존했으며 OS 디스크는 남는다. 명시된 VM 종량제 단가는 USD 0.0389/시간이고 디스크 등은 별도다. 다시 파일을 준비하려면 가이드 L02의 `az vm start → npm run blob:sync → az vm deallocate`를 사용한다. 이는 **원격 VM의 사설 접근**이며 노트북 브라우저의 직접 Blob 접속이나 Studio 로그인을 대신하지 않는다.

Foundry ARM 조회에서 **`Discovery Default Project`**(`discoverydefaultprojectym5ffvaa`)가 기존 `aif-dwsp-foundry-ym5ffvaa` 아래 `Succeeded`인 것을 확인했다. [프로젝트 증거](../../artifacts/discovery-foundry-default-project-20261001.json)는 아직 생성되지 못한 Discovery 실습 Project `thermalhol`과 구분한다. 불필요한 Foundry 프로젝트를 새로 만들지 않고 해당 리소스 페이지를 사용자 브라우저에 열었다.

처음에는 사용자가 quota 신청을 직접 진행하기로 했으며, 당시 [모델 quota 응답](../../artifacts/discovery-model-quota-followup-20261001.json)은 두 모델의 총한도를 각각 1,000,000 TPM로 표시했다. 이후 사용자가 대행과 최종 제출을 명시적으로 승인했다.

**13:41 KST 후속:** Playwright headless로 공식 Microsoft 양식에 `gpt-5-mini`, `text-embedding-3-small`을 **각각 한 번씩 제출**했다. 두 요청 모두 Global Standard **총 3,000,000 TPM**이며 입력값은 `3000 kTPM`이다. 선택한 모델에는 별도 리전란이 없어 사용 리전 Sweden Central을 사유에 명시했다. 각 제출 후 **“Thanks! You've completed the request!” / “Your response was submitted.”**를 확인했다. [개인 연락처를 제외한 접수 기록](../../artifacts/discovery-model-quota-requests-20261001.json)을 보존했다.

**접수와 quota 승인은 다르다.** 화면에 접수번호는 표시되지 않았으며, 실제 한도 반영은 아직 검증하지 않았다. 완료 화면은 통상 다음 영업일, 경우에 따라 2영업일의 처리를 안내하지만 승인을 보장하지 않는다. AKS vCPU나 Container Apps 환경 수 한도 증액을 지역 서비스 용량 문제의 해결책으로 신청한 것은 아니다.

정상 Azure CLI 세션을 통해 Discovery API의 `access_as_user` 토큰 발급도 확인했다. 이는 토큰을 브라우저에 주입하거나 Studio의 사용자 인증을 우회했다는 뜻이 아니다. **Bookshelf quota 승인, AKS/Container Apps 지역 용량, 정상 Studio 로그인이 남아 있어 색인·에이전트·Engine은 여전히 미실행**이다.

### 발견한 문제와 반영한 개선

| 실제 관측 | 수정·대응 |
|---|---|
| 과거 가이드/config는 20260925, 실제 기반은 20260930 RG | 현재 config·양 언어 가이드의 활성 RG 통일; 과거 증거는 보존 |
| DefaultFeature는 Pending인데 서비스는 활성화 | 필수 resource type + 실제 GET + 단계별 모델 quota를 분리한 `npm run readiness` 추가 |
| 전체 VNet 갱신의 `IncompatibleDelegations` | 기존 서브넷을 재작성하지 않는 `infra/expand-network.bicep`으로 실제 배포 성공 |
| 문서의 역할 이름 `(Preview)`와 실제 표시 이름이 다름 | 라이브 역할 정의를 확인해 GUID로 할당; Blob/Registry/VNet/UAMI에 범위 제한 |
| Storage 생성은 성공했지만 클라이언트 파일 조회 403 | Activity Log에서 관리 그룹의 `StorageAccount_PublicNetwork_Modify` 확인. 템플릿을 private-only로 수정하고 PE/DNS 생성; 정책 우회 없음 |
| 공식 Tool 예제의 버전 필드가 GA 스키마와 다름 | 실제 ARM 검증에 맞춰 `properties.definitionContentVersion` 대신 `properties.version`; 수정 후 등록 성공 |
| vCPU quota가 충분해도 AKS 생성 실패 | `AKSCapacityHeavyUsage`를 quota와 구분해 기록. 같은 RG의 무의미한 재배포/리전 혼합 대신 명시적 Workspace-only 준비 모드 추가 |
| PDF에 로컬 증거 링크가 노트북의 절대 경로로 포함됨 | HTML 링크는 유지하고 PDF에서 로컬 파일 링크만 비활성화; 공식 URL·책갈피는 유지 |

### 용량·네트워크 차단 상태

**Bookshelf (오전 배포 전 Global Standard 스냅샷):** gpt-5-mini 잔여 **990,000 TPM**, text-embedding-3-small 잔여 **780,000 TPM**, 실습 운영 계획값은 **각 2,000,000 TPM**다. 기존 할당을 유지하려면 총한도는 각각 최소 **2,010,000 / 2,220,000 TPM**가 필요하다. 당시 GPT-5.4 잔여 3,000,000 TPM는 코어 준비 기준 500,000 TPM를 충족했다. 이 수치는 현재 잔여량 보장이 아니다. **13:41에는 두 증액 신청 접수를 완료했으며, 15:53 조회에서는 아직 한도에 반영되지 않았다.**

**AKS:** 관리 리소스 `mrg-dscmp-sc-discovery-hol-b6wiwf/aks-dscmp-b6wiwf`가 Sweden Central 용량 부족으로 반복 실패했다. correlation ID는 `75d88d20-5dd2-4963-b2b1-00dc4b1039e4`. 지역 총/Dsv6/Esv6 quota는 각각 100 vCPU, 당시 사용량 0이었다. [공식 오류 설명](https://learn.microsoft.com/troubleshoot/azure/azure-kubernetes/error-codes/akscapacityheavyusage-error)에 따라 지역 용량 문제로 분류했다. 관리 AKS를 직접 수정하거나 보안을 약화하지 않았다.

원래 `discovery-core-20261001` ARM 배포는 중복 Workspace 쓰기를 방지하기 위해 정상 취소했다. **취소는 리소스 삭제가 아니며 RP의 이미 시작된 작업까지 중단됐음을 보장하지 않는다.** GA에서 선택 사항인 `supercomputerIds`를 비우는 `deployCompute=false` 경로를 검증한 뒤 별도 Workspace 배포를 시작했다. 이는 컴퓨트 실습을 완료시키는 대체 구현이 아니다.

**Workspace 최종 실패:** 약 55분 뒤 `containerAppsEnvironment` 단계가 실패했다. MRG Managed Environment의 실제 오류는 `ManagedEnvironmentCapacityHeavyUsageError`이며 내부 원인은 같은 `AKSCapacityHeavyUsage`다. Workspace correlation ID는 `e08e90c5-299f-4552-a354-697e0da7df45`, 하위 AKS request ID는 `0ea9a155-9803-4e6c-85fd-b8ed67a02502`다. Supercomputer를 제외한 대체 경로도 같은 지역 용량에 막힌 것을 확인했으므로 무작정 다시 배포하거나 유료 스택을 다른 리전에 복제하지 않았다.

**Blob:** 최초에는 로컬 노트북의 사설 경로가 없어 차단됐다. 위 후속 작업에서 VNet 내부 VM 경로와 실제 업로드·읽기 검증을 완료했다. Storage 공개 네트워크는 계속 Disabled이며 로컬 노트북의 직접 접속은 별도다.

**조직 공통 진단 설정:** Workspace 관리 RG의 정책 배포 `PolicyDeployment_4802795780941947574`가 중앙 Log Analytics `mcapsgovernance/mcaps4c05bc053c3d4ff154e5-la`를 찾지 못해 실패했다. [실제 실패 응답](../../artifacts/discovery-workspace-governance-20261001.json)을 보존했다. 이는 별도 거버넌스 결함이며, 확인된 Workspace 최종 실패 원인은 위 Container Apps/AKS 용량 오류다. 공통 거버넌스 대상은 이번 실습 범위 밖이어서 새로 만들거나 정책을 해제하지 않았다.

**모델 구분:** Workspace MRG에서 자동 cognition 모델 `gpt-5.4`, revision `2026-03-05`, GlobalStandard capacity `250`(250,000 TPM)의 `Succeeded`를 확인했다. 이는 별도 Discovery Chat Model Deployment **`gpt-5-4`**와 Project가 준비됐다는 뜻이 아니다.

**사용자 데이터 권한:** MRG에서 서비스가 부여한 Foundry Owner가 이미 확인돼 Foundry User를 중복 추가하지 않았다. 일반 Owner와 Foundry 데이터 권한을 구분해 확인했다.

**Headless UI 확인:** 요청에 따라 Playwright headless로 실제 Workspace Studio URL에 접근했다. 정상 Microsoft 로그인 화면으로 이동했으며, 인증 정보 입력·쿠키/토큰 추출·로그인 우회는 하지 않았다. [관측 기록](../../artifacts/discovery-studio-headless-20261001.json)은 Studio에서 프로젝트를 열어 실습했다는 증거가 아니다. Computer Use는 사용하지 않았다.

### 비용과 남은 자원

새 Storage, Basic ACR, ACR Tasks, Private Endpoint/DNS와 관리 RG의 Log Analytics/NSP가 남는다. 후속 사설 클라이언트 VM은 할당 해제했지만 OS 디스크가 남는다. 실패·취소된 배포에도 이미 생성한 리소스는 남을 수 있다. **정확한 누적 청구액을 조회한 것은 아니며, 비용이 0이라고 주장하지 않는다.** Bookshelf, GPU, 공개 점프 서버, VPN Gateway는 생성하지 않았다.

Workspace가 준비되는 동안에도 MRG에 Search, Cosmos DB, Foundry, Storage와 Private Endpoint가 생성됐다. Bookshelf를 보류했다고 Workspace 관리 인프라의 상시 비용까지 없다는 뜻은 아니다.

`cpulab`의 목표는 min 0/max 1이지만 시스템 풀·상시 관리 서비스 비용까지 0으로 만드는 설정이 아니다. 연구 종료 시 가이드 L09를 따르고, 공유 가능성이 있는 구독 scope의 서비스 역할을 RG 삭제와 함께 무조건 제거하지 않는다.

### 재개 절차

1. `npm run readiness`와 현재 배포/하위 리소스 상태를 확인한다. `--require core` 통과는 전체 실습 통과가 아니다.
2. 지역 AKS/Container Apps 용량을 서비스 팀과 해결하거나, 전체 동일 리전 스택을 다른 지원 리전에 계획한다. 기존 리소스를 삭제하거나 다른 리전 자원을 무작정 연결하지 않는다. 중앙 진단 대상 누락도 조직 관리자에게 전달한다.
3. 재검증 후 배포를 재개하고 Workspace의 실제 `Succeeded`, `gpt-5-4`, Project `thermalhol`을 확인한 다음 정상 로그인으로 Studio 접근을 점검한다.
4. Bookshelf 모델 quota를 확보하고 준비된 사설 클라이언트에서 입력 5개를 재검증한다. 실제 Asset 연결·Bookshelf 색인 상태를 확인한다.
5. L04–L07/L09를 실제 실행하며 계산 원본, operation ID, 풀, 로그, 인용, 검증 이력을 수집한다. L08은 별도 테스트 사용자가 있을 때만 수행한다.

### 2026-10-01 증거

| 기록 | 파일 |
|---|---|
| 접근·quota | [discovery-readiness.json](../../artifacts/discovery-readiness.json) |
| 리소스별 실제 상태·미실행 경계 | [execution snapshot](../../artifacts/discovery-execution-20261001.json) |
| 서브넷 실제 배포 | [network expansion](../../artifacts/discovery-network-expansion-deployment-20261001.json) |
| control-plane 역할 배포 | [access deployment](../../artifacts/discovery-access-deployment-20261001.json) |
| Storage/Registry/역할 | [foundation deployment](../../artifacts/discovery-foundation-deployment-20261001.json) |
| Storage 정책 변경 근거 | [Activity Log](../../artifacts/discovery-storage-policy-20261001.json) |
| Private Endpoint/DNS | [private access deployment](../../artifacts/discovery-storage-private-deployment-20261001.json) |
| ACR cloud build | [build result](../../artifacts/discovery-tool-build-result-20261001.json) |
| Tool GA 필드 오류·수정 | [GA contract](../../artifacts/discovery-tool-ga-contract-20261001.json) |
| Tool 실제 등록 | [tool deployment](../../artifacts/discovery-tool-deployment-20261001.json) |
| AKS 용량 오류 | [capacity failures](../../artifacts/discovery-core-capacity-failures-20261001.json) |
| Workspace 최종 실패 | [workspace deployment](../../artifacts/discovery-workspace-deployment-20261001.json) |
| 내부 Container Apps 용량 오류 | [workspace capacity](../../artifacts/discovery-workspace-capacity-20261001.json) |
| 중앙 진단 대상 누락 | [governance policy deployment](../../artifacts/discovery-workspace-governance-20261001.json) |
| Studio headless 진입 확인 | [sign-in boundary](../../artifacts/discovery-studio-headless-20261001.json) |
| 사설 클라이언트 배포 | [private client deployment](../../artifacts/discovery-blob-client-deployment-20261001.json) |
| 실제 입력 업로드·읽기 검증 | [first upload](../../artifacts/discovery-private-blob-upload-20261001.json) · [idempotent recheck](../../artifacts/discovery-private-blob-sync.json) |
| VM 할당 해제 | [deallocated VM](../../artifacts/discovery-blob-client-state-20261001.json) |
| 기존 Foundry 프로젝트 | [Discovery Default Project](../../artifacts/discovery-foundry-default-project-20261001.json) |
| 모델 quota 신청 2건 접수 | [submission confirmations](../../artifacts/discovery-model-quota-requests-20261001.json) |
| 최초 코어 배포 취소 | [canceled parent](../../artifacts/discovery-core-cancelled-20261001.json) |
| 로컬 HTML/PDF 확인 | [guide validation](../../artifacts/guide-review/validation.json) |

아래는 **2026-09-25의 과거 접근 기록**이다. 당시의 Pending/404와 “생성하지 않음”은 현재 상태가 아니다. 원본 응답·영상의 증거 경계를 보존하기 위해 남긴다.

## 2026-09-25 — 과거 접근 점검

당시에는 서비스 승인 대기로 핵심 기능 실습을 실행하지 못했다. 비용 허용과 Microsoft 서비스 팀의 구독 승인은 서로 다른 조건이었다.

## 1. 실제로 확인된 결과

| 항목 | 결과 | 근거 |
|---|---|---|
| 지정 계정·테넌트·구독 | 일치, 구독 Enabled | Azure CLI 계정 확인 및 실제 ARM 구독 GET 200 |
| Microsoft.Discovery Provider | **Registered** | Provider POST 200 후 재조회 |
| Microsoft.Discovery/DefaultFeature | **Pending** | 사용 승인 POST 200 후 실제 GET 응답 |
| Workspace API `2026-06-01` | **404 / InvalidResourceType** | 실제 ARM 응답 |
| 공식 이전 API `2026-02-01-preview` | **404 / InvalidResourceType** | 대체 버전으로 읽기 전용 교차 확인 |
| 필수 Discovery 리소스 유형 | workspaces / supercomputers / bookshelves 안 보임 | Provider resourceTypes 실제 목록 |
| Portal UI 로그인 | 보안 키·지문·PIN 인증 필요 단계 | Playwright headless의 Microsoft 로그인 화면 |
| 새 실습 RG·Workspace·Bookshelf·Supercomputer | **생성하지 않음** | 접근 gate 실패로 생성 단계에 진입하지 않음 |
| Bookshelf 색인·에이전트·도구·Engine 실행 | **미실행** | Discovery 데이터 평면 환경을 만들 수 없음 |

`DefaultFeature`의 `Pending`은 제품 팀 승인 필요 상태다. 사용자가 비용을 허용해도 이를 `Registered`로 임의 변경할 수 없다. 다른 개발용·실험용 feature를 켜거나 인증을 우회하지 않았다.

### 2026-09-25 작업 직후 남은 변경

- `Microsoft.Discovery` Provider 등록
- `Microsoft.Discovery/DefaultFeature` 사용 승인 요청: `Pending`

유료 실습 인프라, 모델 배포, 커스텀 역할, 역할 할당은 만들지 않았다. 승인 요청은 취소하지 않았으며, 전용 실습 RG도 생성 전이다. **구독 전체의 기존 청구가 0원이라는 뜻은 아니다.** 이번 작업이 시작한 유료 리소스 배포가 없다는 의미다.

## 2. 증거 파일

| 파일 | 내용 |
|---|---|
| `artifacts/azure-preflight.json` | 최신 실행의 계정 범위, 시각, 실제 HTTP 응답, gate 판정 |
| `artifacts/runs/2026-09-24T21-03-20-762Z/` | 최초 Provider 등록 실험과 실제 응답 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/` | 추가 사용 승인 신청, Pending, 두 API 버전의 오류 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/04-response.json` | 사용 승인 등록 요청 응답 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/05-response.json` | Pending 재확인 응답 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/07-response.json` | GA API 버전의 Workspace 접근 오류 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/08-response.json` | 이전 공식 API 버전의 동일 오류 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/azure-preflight.webm` | 실제 API 실행 중 headless 화면 원본, 약 27초 |
| `artifacts/reference-ranking.json` | **로컬** 기준 계산; Azure 실행 결과가 아님 |
| `artifacts/reference-ranking-cost3.json` | **로컬** 비용 조건 변경 기준 계산 |

API 호출은 Playwright의 `APIRequestContext`로 실제 `management.azure.com`에 전송했다. 인증은 지정 계정의 기존 Azure CLI 세션을 사용했으며, 토큰은 메모리에만 보관했다. 녹화 화면은 **로컬 증거 뷰어**다. Azure Portal이나 Discovery Studio를 모방한 화면이 아니며, UI 실습 성공을 주장하지 않는다.

요약 영상은 가이드의 핵심 내용과 실제 Azure 접근 점검을 묶은 영상이다. Bookshelf나 Engine을 성공 실행한 시연 영상이 아니다. 인증 화면·비밀번호·토큰·쿠키는 영상에서 제외했다.

**영상:** [챕터형 재생 페이지](../../artifacts/watch-summary.html) · [MP4](../../artifacts/microsoft-discovery-summary.ko.mp4) · [한국어 SRT](../../artifacts/microsoft-discovery-summary.ko.srt). 길이 약 **3분 10초**, 1600×900, 한국어 음성과 화면 자막 포함. SRT/VTT 문장 타이밍은 음성 길이를 기준으로 추정했으며, 음성은 로컬 macOS Yuna TTS로 생성했다. 원본 Azure 실행 영상은 별도 WebM으로 보존했다.

## 3. 제공한 실습 자료

15개 절의 한국어 가이드, 브라우저용 HTML, 아키텍처 다이어그램, 자체 작성한 합성 TXT 4개와 CSV, 결정적 Python 계산기, CPU 도구 Dockerfile과 정의 템플릿, 계정 범위 검증·증거 기록·녹화 자동화를 제공한다.

로컬 기준 계산 결과는 다음과 같다.

| 조건 | 적격 후보와 점수 |
|---|---|
| 원가 상한 5 USD/kg | DELTA 68.6, ALPHA 67.8, THETA 60.8 |
| 원가 상한 3 USD/kg | DELTA 68.6만 적격 |

GAMMA는 최신 정정값 175로 탈락하고 ZETA는 근거 미확보 상태다. **이 표는 실습 정답 기준이며, 실제 Discovery에서 얻은 결과가 아니다.** 도구 이미지를 ACR에 빌드·업로드하거나 Discovery에 등록한 상태도 아니다.

## 4. 비용·할당량 사전 확인

사용자의 비용 허용을 반영해 최소 CPU 구성의 일부 단가와 할당량을 조사했다. 비용이 현재의 중단 사유는 아니다.

| 항목 | Sweden Central 조회 결과 |
|---|---|
| Linux D4s_v6, 일반 종량제 VM | 0.214 USD/시간/VM |
| Linux E20s_v6, 일반 종량제 VM | 1.407 USD/시간/VM |
| 지역 총 vCPU | 한도 100, 사용 0 |
| StandardDsv6Family | 한도 100, 사용 0 |
| StandardEsv6Family | 한도 100, 사용 0 |

출처: 2026-09-25 Azure MCP Retail Pricing과 해당 구독 `az quota list` / `az quota usage list` 실제 조회. Spot·Windows 단가는 제외했다.

**위 두 VM 가격은 전체 Discovery 견적이 아니다.** SQL Hyperscale, Search, ACA, Cosmos DB, 스토리지, 관리 인프라, 모델 토큰 등이 별도다. 논리적 quota가 남아 있다고 특정 SKU의 물리적 가용성이 보장되는 것도 아니다. 모델 quota와 전체 인프라 비용은 승인 후 확정해야 한다.

## 5. 승인 요청에 사용할 정보

Microsoft 담당자 또는 Azure 지원에 다음 내용을 전달하면 된다. 이 패키지는 메시지나 지원 티켓을 대신 발송하지 않았다.

```text
요청: Microsoft Discovery GA 실습용 구독 활성화 / allow-list 검토

Subscription: 51531604-2337-4c05-bc05-3c3d4ff154e5
Tenant: 46e9cdaa-fed3-4131-aa28-c1fc8a8a043a
Account: junwoojeong@MngEnvMCAP757124.onmicrosoft.com
Target region: Sweden Central

Microsoft.Discovery provider: Registered
Microsoft.Discovery/DefaultFeature: Pending
Requested feature at: 2026-09-24T21:08Z (2026-09-25 06:08 KST)
Workspace list:
  API 2026-06-01 -> 404 InvalidResourceType
  API 2026-02-01-preview -> 404 InvalidResourceType
Provider exposes only generic locations/operations/checkNameAvailability types.

Feature-state correlation ID:
c124962c-9e26-4835-9154-a33d112afb56

Purpose: Original synthetic training documents, one workspace/project,
Bookshelf indexing, bounded CPU tool, and Discovery Engine walkthrough.
No real customer research data and no GPU workload required.
```

## 6. 과거 재개 안내 — 현재 실행에는 위 2026-10-01 절차 사용

1. Microsoft 측 구독 활성화를 확인한다. **정정:** DefaultFeature Pending만으로 현재 서비스 접근을 차단하면 안 된다. 실제 필수 리소스 유형과 Workspace API 성공을 함께 확인한다.
2. Provider 변경 전파가 필요한 경우에만 관리자가 등록 절차를 수행한다. 등록만으로 사용 가능/배포 성공을 주장하지 않는다.
3. 사용자가 올바른 테넌트에서 정상 MFA·보안 키 로그인을 완료한다.
4. 모델 quota, IAM·NSP 관리자 작업, 네트워크, 전체 비용을 검토한다.
5. 가이드 Lab 0~6을 실제 실행하고 각 단계의 클라우드 증거를 추가한다.
6. 핵심 기능의 **실제 실행 영상**을 새로 녹화한다. 현재의 접근 점검 영상을 완료 시연으로 이름만 바꾸지 않는다.

읽기 전용 재확인:

```bash
npm run preflight
```

현재 RG는 이미 존재하므로 예전의 RG 생성 절차를 반복하지 않는다. `npm run preflight`는 이전 녹화형 점검이며, 빠른 읽기 전용 접근·quota 점검에는 `npm run readiness`를 사용한다.

관련 공식 문서: [Discovery 접근 선행조건](https://learn.microsoft.com/en-us/azure/microsoft-discovery/quickstart-infrastructure), [Azure feature Pending과 승인](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/preview-features).
