# 05 — 네트워크·권한·사설 데이터 접근

[목차](README.ko.md) · **기준일: 2026-10-01 실제 확인. 주소·역할·정책은 재개 전에 다시 확인한다.**

## 서로 다른 네트워크 설정

| 설정 | 의미 |
|---|---|
| Discovery `NetworkIsolation=true` | 관리 리소스의 네트워크 하드닝을 요청하는 설정 |
| Workspace `publicNetworkAccess=Enabled` | 인증된 Studio/REST 서비스 진입점 허용. 관리 저장소의 공개 접근과 다름 |
| Blob `publicNetworkAccess=Disabled` | 고객 Blob의 공개 네트워크 경로 차단 |
| Blob `allowBlobPublicAccess=false` | 익명 Blob 공개 금지 |
| Blob `allowSharedKeyAccess=false` | 공유 키 인증 비활성 |
| 서브넷 `defaultOutboundAccess=false` | VM의 암시적 기본 egress 비활성. 모든 아웃바운드 경로를 차단한다는 뜻은 아님 |
| Supercomputer `outboundType=LoadBalancer` | 서비스의 명시적 egress 방식. 완전한 private-only 통신을 보장하는 설정이 아님 |

Workspace가 `Failed`인 상태에서 설정값만 보고 모든 관리 자원의 하드닝·실행이 완료됐다고 주장하지 않는다.

사설 Blob 클라이언트에 공개 IP가 없다는 사실을 전체 Supercomputer에도 공개 IP가 없다는 뜻으로 확대하지 않는다. 기본 `LoadBalancer` egress가 조직 정책에 막히면 지원되는 별도 라우팅/egress 설계를 검토한다. 임의 정책 해제나 검증되지 않은 네트워크 속성 변경으로 우회하지 않는다.

## LoadBalancer feature 등록 — 오후 후속 작업에서 해결

`Microsoft.Network/AllowBringYourOwnPublicIpAddress`는 Discovery 활성화 및 Provider 등록과 별개다. 2026-10-01 오후 조회에서는 `NotRegistered`였고, 현재 계정의 상속 Owner 권한으로 등록 요청을 보내 즉시 **`Registered`**를 받았다. 이어 `Microsoft.Network`를 재등록하고 두 상태를 독립적으로 다시 확인했다.

이 구독에서는 별도 Microsoft 승인 대기가 필요하지 않았다. 다만 **사용자의 동의와 Azure RBAC 권한은 별개**이며 다른 구독에서도 즉시 승인된다는 보장은 없다. 이 등록이 공개 접근을 금지하는 조직 정책, AKS 지역 용량, 모델 quota 제한을 해제하지는 않는다.

다음은 읽기 전용 확인이다. 이미 등록돼 있다면 다시 요청하지 않는다.

```bash
az feature show --namespace Microsoft.Network \
  --name AllowBringYourOwnPublicIpAddress \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --query "{name:name,state:properties.state}"
az provider show --namespace Microsoft.Network \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --query "{namespace:namespace,state:registrationState}"
```

근거: [공식 문제 해결 절차](https://learn.microsoft.com/azure/microsoft-discovery/troubleshoot-microsoft-discovery#supercomputer-deployment-stalls-because-a-required-public-ip-feature-isnt-registered), [실제 등록 응답](../../artifacts/discovery-resume-network-feature-registration-20261001.json), [Provider 재등록 후 상태](../../artifacts/discovery-resume-network-provider-20261001.json). 이 기능의 최초 미등록을 과거 `AKSCapacityHeavyUsage`의 입증된 원인으로 바꾸어 해석하지 않는다.

## 중앙 진단 저장소 누락 — 기존 정책으로 복구 완료

16:10 후속 조사에서 지정 중앙 workspace뿐 아니라 `McapsGovernance` RG 자체가 없었고, 같은 이름의 soft-delete 복구 대상도 없었다. Discovery MRG의 자체 Log Analytics 두 개는 정상 존재하지만, 조직 정책의 중앙 목적지로 임의 대체하면 같은 준수 조건을 충족하지 않는다.

기존 `MCAPSGovDeployPolicies`의 다음 규칙만 순차 실행했다. 정책의 기존 관리 ID에 필요한 상속 Owner가 있어 새 권한 부여나 정책 변경은 없었다.

| 규칙 | 범위 | 결과 |
|---|---|---|
| `NewResourceGroupDeploy` | 현재 구독의 누락된 `McapsGovernance` | 16:21:45 Succeeded |
| `NewLogAnalyticsWorkspaceDeploy` | 현재 구독의 지정 중앙 workspace | 16:23:41 Succeeded |
| `EnableCognitiveServicesDiagnostics` | `aif-dwsp-foundry-ym5ffvaa` 리소스 하나 | 16:26:08 Succeeded |

각 작업은 **실제 배포 1 / 성공 1 / 실패 0**이었다. 중앙 workspace의 실제 값은 **West US 2, PerGB2018, 보존 30일, 일일 cap 없음**이며 기존 정책 기본값을 유지했다. 진단 프로필 `setByPolicy-MCAPSGovernance`의 workspace ID 일치와 **allLogs / AllMetrics 활성화**도 GET으로 확인했다. 전체 관리 그룹이나 다른 계정에 일괄 remediation을 실행하지 않았다.

아래는 읽기 전용 확인이다. 이미 복구된 자원을 다시 생성하거나 정책을 비활성화하지 않는다.

```bash
az monitor log-analytics workspace show \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --resource-group McapsGovernance \
  --workspace-name mcaps4c05bc053c3d4ff154e5-la \
  --query "{id:id,state:provisioningState,location:location,sku:sku.name,retentionInDays:retentionInDays}"
az monitor diagnostic-settings show \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --resource /subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/mrg-dwsp-discoveryholjunwoosc-ym5ffv/providers/Microsoft.CognitiveServices/accounts/aif-dwsp-foundry-ym5ffvaa \
  --name setByPolicy-MCAPSGovernance
```

후속 [16:30:10 KST 재평가](../../artifacts/discovery-governance-compliance-20261001.json)에서 **이 Foundry 계정의 진단 정책은 Compliant**로 확인됐다. 이전 Failed 배포 이력은 과거 기록으로 남는다. 전체 구독의 모든 정책 준수, 실제 로그 유입, 과거 누락 로그의 소급 복구까지 확인한 것은 아니다. 중앙 workspace는 공유 자원이며 종량제 비용이 발생할 수 있다. `Do Not Delete` 태그를 유지하고 실습 종료와 함께 삭제하지 않는다.

근거: [기존 정책 remediation 절차](https://learn.microsoft.com/azure/governance/policy/how-to/remediate-resources), [실제 복구 요약](../../artifacts/discovery-governance-recovery-20261001.json), [진단 설정 GET](../../artifacts/discovery-governance-diagnostic-setting-20261001.json).

## Storage 403의 실제 원인

처음에는 선택 IP를 허용한 Storage를 요청했지만, 관리 그룹 정책 **`StorageAccount_PublicNetwork_Modify`**가 생성 중 공개 접근을 Disabled로 바꿨다. RG 수준 정책 목록이 비어 있어도 상위 정책이 없다는 뜻은 아니다.

정책과 실제 GET을 확인한 뒤 템플릿을 private-only로 수정하고 Private Endpoint/DNS 및 VNet 내부 클라이언트를 만들었다. **방화벽을 전체 공개하거나 공유 키를 켜는 방식으로 오류를 숨기지 않았다.**

```bash
az storage account show \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --resource-group rg-discovery-hol-20260930 \
  --name stdiscoveryholjunwoosc \
  --query "{publicNetworkAccess:publicNetworkAccess,sharedKeys:allowSharedKeyAccess,anonymousBlob:allowBlobPublicAccess,networkRules:networkRuleSet}" \
  --output json
```

[정책 이벤트](../../artifacts/discovery-storage-policy-20261001.json)와 [사설 연결 배포](../../artifacts/discovery-storage-private-deployment-20261001.json)를 참고한다. `AuthorizationFailure`와 `AuthorizationPermissionMismatch`를 같은 원인으로 단정하지 말고 신원·역할·네트워크를 분리해 조사한다.

## 현재 9개 서브넷

VNet `vnet-discovery-hol`, `10.80.0.0/16`. 새 환경에서는 기존 네트워크와 중복되지 않는 대역을 선택한다.

| 서브넷 | CIDR | 목적 |
|---|---|---|
| `supercomputerNodepoolSubnet` | `10.80.1.0/24` | 도구/색인 노드 |
| `aksSubnet` | `10.80.2.0/24` | Supercomputer 시스템 |
| `workspaceSubnet` | `10.80.3.0/24` | Workspace, `Microsoft.App/environments` 위임 |
| `privateEndpointSubnet` | `10.80.4.0/24` | Workspace 관련 PE |
| `agentSubnet` | `10.80.5.0/24` | 에이전트, ACA 위임 |
| `searchSubnet` | `10.80.6.0/24` | Bookshelf 관련, ACA 위임 |
| `bookshelfPeSubnet` | `10.80.7.0/24` | Bookshelf PE |
| `storagePeSubnet` | `10.80.8.0/24` | 고객 Blob PE |
| `blobClientSubnet` | `10.80.9.0/24` | 관리자용 사설 Blob 클라이언트 |

Workspace/Bookshelf 인스턴스끼리 위임·PE 서브넷을 임의 공유하지 않는다. 전체 VNet의 inline subnet 배열을 다시 PUT하지 않고 새 child subnet만 추가했던 이유는 실제 `IncompatibleDelegations` 실패를 피하면서 기존 구성을 보존하기 위해서다.

## 신원별 역할

| 주체 | 필요한 범위와 역할 |
|---|---|
| Discovery 공식 control-plane SP | 구독의 Reader + 사용자 정의 Discovery NSP Perimeter Joiner |
| Discovery UAMI `id-discovery-hol` | 실습 RG의 Platform Contributor, VNet의 Network Contributor, 해당 UAMI의 Managed Identity Operator, 고객 Storage의 Blob Data Contributor, ACR의 AcrPull |
| 실습 운영 사용자 | 실습 RG의 Platform Administrator, 고객 Storage의 Blob 데이터 역할. 기존 Owner만으로 데이터 권한을 대신하지 않음 |
| Foundry 관리 자원 사용자 | 필요한 데이터 권한 확인. 이번에는 서비스가 MRG에 Foundry Owner를 부여해 Foundry User를 중복 추가하지 않음 |
| 사설 Blob VM의 자체 관리 ID | 고객 Storage 계정의 Blob Data Contributor만. Discovery 플랫폼/네트워크 권한 없음 |

공식 SP의 **애플리케이션 ID**는 `92c174ac-8e41-4815-a1b7-d81b19ab03ce`다. 역할 할당용 **테넌트 object ID**와 혼동하지 않는다. 새 앱/비밀을 만들지 말고 실제 SP를 확인한다.

NSP Joiner의 두 액션은 [access.bicep](../../infra/access.bicep)에 정의돼 있다. 문서의 역할 표시 이름에 `(Preview)`가 남아 있더라도 실제 구독에서는 빠질 수 있으므로 [검증한 역할 GUID](../../infra/lab-foundation.bicep)를 기준으로 확인한다. 구독 범위의 서비스 역할은 다른 Discovery 환경이 공유할 수 있다.

## 검증된 사설 Blob 클라이언트

- VM: `vm-discovery-blob-client`, B2als_v2 2 vCPU/4 GB, Ubuntu 24.04.
- 공개 IP 없음, 인바운드 전체 차단 NSG, 기본 outbound 비활성, Storage 서비스 엔드포인트.
- 관측된 VM 사설 주소 `10.80.9.4`, Blob PE 주소 `10.80.8.4`. 주소 자체는 미래 보장값이 아니다.
- Azure VM Run Command로 Python 표준 라이브러리와 VM의 IMDS 토큰을 사용. 키/SAS/사용자 토큰을 스크립트에 넣지 않는다.
- 기존 Blob은 같은 해시이면 재사용, 다르면 덮어쓰지 않고 실패. 5개 원본을 읽어 SHA-256 검증했다.

다음 명령은 **실제 Azure 작업과 과금**을 수반하며 VM 관리 권한이 있는 운영자만 수행한다. 사설 VM은 현재 할당 해제돼 있다.

```bash
SUBSCRIPTION_ID='51531604-2337-4c05-bc05-3c3d4ff154e5'
RESOURCE_GROUP='rg-discovery-hol-20260930'

az vm start --name vm-discovery-blob-client \
  --resource-group "$RESOURCE_GROUP" --subscription "$SUBSCRIPTION_ID"
npm run blob:sync
az vm deallocate --name vm-discovery-blob-client \
  --resource-group "$RESOURCE_GROUP" --subscription "$SUBSCRIPTION_ID"
```

`blob:sync`가 실패해도 VM의 비용·실행 상태를 정리한다. **마지막 deallocate 성공을 파일 동기화 성공으로 간주하지 않는다.** [최신 결과](../../artifacts/discovery-private-blob-sync.json)의 `outcome=verified`, 파일 5개, 원본 해시와 읽기 request ID를 확인한다.

현재 [전송 스크립트](../../scripts/sync-private-blobs.mjs)는 이 실습의 VM/Storage 이름과 `10.80.8.0/24`를 사용한다. 다른 환경의 이름·CIDR로 바꾸면 템플릿뿐 아니라 스크립트도 일치시켜야 한다. Run Command에는 이 저장소의 합성 입력만 전달하며 임의의 실제 고객 데이터를 전송하지 않는다.

**원격 VM 접근 성공은 로컬 브라우저의 VNet 연결 성공이 아니다.** 노트북에서 Blob 링크를 직접 열려면 승인된 VPN/ExpressRoute 등 별도 경로가 필요하다. CORS와 사용자 데이터 역할도 따로 확인한다.

## Studio·CLI 로그인 구분

Discovery API의 정상 `access_as_user` 토큰 발급은 확인했지만, 이것이 Studio 브라우저 로그인은 아니다. Playwright headless로는 정상 Microsoft 로그인 화면까지 확인했다. 비밀번호/MFA/보안 키는 사용자가 정상 절차로 처리하며, CLI 토큰·쿠키를 브라우저에 주입해 우회하지 않는다.

Azure MCP와 Azure CLI가 서로 다른 테넌트로 인증됐던 사례도 있었다. 다른 신원의 403을 실습 계정의 권한 부족으로 오인하지 말고 계정·테넌트·구독을 먼저 대조한다.

## 근거

- [Discovery 네트워크 구성](https://learn.microsoft.com/azure/microsoft-discovery/how-to-configure-network-security)
- [Discovery Blob 요구 사항](https://learn.microsoft.com/azure/microsoft-discovery/concept-storage-account)
- [VM Run Command](https://learn.microsoft.com/azure/virtual-machines/linux/run-command)
- [클라이언트 템플릿](../../infra/blob-client.bicep), [업로드 검증](../../artifacts/discovery-private-blob-upload-20261001.json), [할당 해제 기록](../../artifacts/discovery-blob-client-state-20261001.json)
