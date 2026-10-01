# 06 — 리소스 생성·재개 절차

[목차](README.ko.md) · **기준일: 2026-10-01 오후 최종 코어 실패와 중앙 진단 복구. 아래 예시는 실제 실행 결과와 구분한다.**

**현재 상태:** `discovery-core-resume-20261001-1530`은 16:14:43에 최종 Failed로 끝났다. 지역 용량을 해결하기 전 같은 `create`를 반복하지 않는다. Feature 등록과 중앙 진단 복구는 완료됐고, Bookshelf quota 요청은 접수됐지만 실제 한도 미반영 상태다.

## 저녁 교차 리전 경로 — 기존 단일 리전 예제와 구분

**최신 완료 상태:** Workspace는 22:52:51, 검증 모델·Project 등 자식은 23:18:23 KST에 Succeeded다. 이후 실제 입력·계산 실행과 별도 사설 재조회도 성공했다. 두 GPT-5.4는 **Global Standard 250,000 TPM씩**, 총 500,000 TPM이다. 아래의 이전 quota 차단 절은 이 후속 사용자 할당 변경과 성공으로 대체한다. 이미 생성된 core를 다시 제출하지 말고 [최종 결과](../../artifacts/discovery-korea-final-result-20261001.json)를 확인한다.

**Discovery home은 `swedencentral`로 고정하고 target compute만 `koreacentral`로 변경한다.** 기존 RG `rg-discovery-hol-20260930`을 유지하고 새 이름을 사용한다. 같은 이름의 기존 자원을 이동하거나 기존 Workspace의 생성 태그를 수정하지 않는다.

| 단계 | 입력 / 실제 범위 |
|---|---|
| Korea 기반 신규 생성 | [cross-region-foundation.bicepparam](../../infra/cross-region-foundation.bicepparam): 새 VNet·관리 ID·Storage·ACR·Blob PE·DNS link. 기존 DNS zone/관리자 역할은 NoChange |
| Korea 컴퓨트 | [discovery-core.koreacentral.bicepparam](../../infra/discovery-core.koreacentral.bicepparam), [컴퓨트 전용 payload](../../artifacts/discovery-korea-compute-template-20261001.json): `sc-discovery-hol-kc`와 `cpulab`만 쓰기 |
| Workspace·검증 모델·Project | 전체 core와 별도 단계. 신규 GPT-5.4 quota 조건을 충족하기 전 제출하지 않음 |
| Bookshelf | 기존 운영 quota 조건을 만족한 뒤 별도 생성 |

기반 배포는 **21:05:23 KST Succeeded**이며 새 지원 자원은 Korea Central에서 확인됐다. 기반 템플릿은 초기 생성용이다. 확장된 VNet에 내부 3-subnet 모듈을 재적용하지 말고 필요한 자원만 별도 검증해 변경한다. 기존 `blob:sync`의 클라이언트/스토리지 이름도 이전 Sweden 환경용이므로 새 저장소 동기화에 그대로 사용하지 않는다.

컴퓨트 배포도 **21:28:45 KST Succeeded**로 종료됐다. 실제 Supercomputer·cpulab·AKS·시스템/사용자 VMSS 모두 Succeeded이며 시스템 2대, 사용자 0대(min 0/max 1)다. 이미 완료한 생성 요청을 다시 제출하지 않는다. [최종 결과](../../artifacts/discovery-korea-deployment-result-20261001.json)를 확인한다.

기존 core를 컴파일한 뒤 symbolic resource 중 `identity`(existing), `supercomputer`, `cpuPool`과 해당 출력만 보존한 payload를 사용했다. 원본 identity map·region tag·min 0/max 1은 유지했다. `location=swedencentral`이며 생성 태그 `discovery.overridemrgregion=koreacentral`이 실제 target을 정한다. 내부 구독용 Key Vault 태그도 포함한다. [검증/미리 보기 증거](../../artifacts/discovery-korea-compute-proof-20261001.json)를 확인하며, 부분 payload를 전체 배포 성공으로 해석하지 않는다.

**모델 별도 차단:** Korea Central quota API에서도 GPT-5.4 GlobalStandard가 3,000/3,000 단위, 미할당 0 TPM으로 관측됐다. 기존 `gpt-5.4`의 3,000,000 TPM를 임의 축소하지 않는다. DataZoneStandard 잔여 300,000 TPM만으로 자동 cognition과 별도 검증 모델의 전체 조건을 충족한다고 가정하지 않는다.

**10-01 당시 별도 정책 작업:** 새 AKS는 성공했지만 기존 Defender의 Azure Policy 애드온 자동 배포는 `LinkedAuthorizationFailed`였다. 정책 관리 ID에 새 `aksSubnet`의 join 권한이 없었으며 Discovery용 UAMI의 역할 누락과는 다른 문제였다. 이후 승인·복구 결과는 다음 절을 따른다. ARM 사전 검증이 성공해도 자동 정책의 후속 배포 전체가 성공한다는 보장은 아니다. [실패 및 보존 범위](../reports/EXECUTION-REPORT.ko.md)를 참고한다.

### 2026-10-02 정책 애드온 복구 완료 — 기존 풀 설정 유지

[policy-subnet-access.bicep](../../infra/policy-subnet-access.bicep)은 기존 Defender 정책 관리 ID에 전용 `aksSubnet`과 `supercomputerNodepoolSubnet`의 **read/join 두 동작만** 부여한다. [Korea 매개변수](../../infra/policy-subnet-access.koreacentral.bicepparam)는 실제 VNet과 정책 principal을 고정한다. 사용자 승인 후 **03:34 KST에 적용 완료**했다. 구독/VNet 전체 역할 부여나 기존 정책 수정·예외는 추가하지 않았다.

권한 적용 전 ARM validate와 Incremental what-if는 역할 정의 1개·서브넷 역할 할당 2개만 Create였다. 이미 적용된 상태에서는 이를 다시 만들지 않는다. 아래 명령은 배포가 아닌 읽기 전용 재검증이다. 증거 파일은 해당 소스와 매개변수를 컴파일한 결과이며, 소스를 수정했다면 다시 컴파일해야 한다.

```bash
az deployment group validate \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --resource-group rg-discovery-hol-20260930 \
  --name discovery-policy-subnet-access-20261002 \
  --template-file artifacts/discovery-policy-subnet-access-template-20261002.json \
  --parameters @artifacts/discovery-policy-subnet-access-parameters-20261002.json

az deployment group what-if \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --resource-group rg-discovery-hol-20260930 \
  --name discovery-policy-subnet-access-20261002 \
  --template-file artifacts/discovery-policy-subnet-access-template-20261002.json \
  --parameters @artifacts/discovery-policy-subnet-access-parameters-20261002.json \
  --mode Incremental
```

첫 `ReEvaluateCompliance` 작업은 배포 0개인 평가 대기 상태에서 취소했고, 같은 AKS 한 개에 `ExistingNonCompliant`로 재적용했다. 권한 오류는 넘었지만 기본 정책의 **`2021-07-01` API**가 기존 `maxSurge=1` / `maxUnavailable=25%` 설정을 거절했다. 두 값을 함께 사용하는 것은 [문서화된 preview fallback](https://learn.microsoft.com/azure/aks/upgrade-aks-node-pools-rolling#maxunavailable-fallback-preview)이다. 이를 해결하려고 노드풀 업그레이드 전략을 임의 변경하지 않는다.

같은 애드온 활성화만 **`2026-02-02-preview` SDK**로 별도 검증해 **04:17 KST에 Succeeded**로 완료했다. writable 요청의 유일한 변경은 `addonProfiles.azurepolicy.enabled=true`다. 최신 ETag와 설정 일치를 재확인하고 정확한 ETag 값을 `If-Match`에 넣어 동시 변경 덮어쓰기를 방지했다. `maxSurge`, `maxUnavailable`, 노드 수·한도, 다른 애드온·네트워크와 실제 아웃바운드 IP가 모두 보존됐다.

최종 활성화 요청의 Succeeded, 실제 `addonProfiles.azurepolicy.enabled=true`, **해당 설치 정책의 최신 Compliant**를 모두 확인했다. 정책 평가 시각은 04:21:33 KST이며 04:32에 재조회했다. 실패한 기본 정책 remediation은 성공으로 바꾸거나 삭제하지 않는다. 이미 활성화된 클러스터에 이전 실패 요청을 반복하지 말고 [최종 결과](../../artifacts/discovery-policy-addon-result-20261002.json)를 확인한다. 전체 구독의 정책 준수나 Bookshelf 운영 완료를 의미하지 않는다.

### 실제 파일·도구 실행 재현

새 `config/lab.json.runtime`은 Korea 환경의 `thermalhol`, `thermal-ranking-kc`, `cpulab`, `thermaldata-kc`를 명시한다. 아래 명령은 **실제 클라우드 작업을 제출**한다. 입력 5개를 기존과 비교하고 다른 내용은 덮어쓰지 않는다. 출력 경로와 로컬 증거를 구분하려면 새 run ID를 사용한다.

```bash
RUN_ID="lab-korea-$(date -u +%Y%m%d%H%M%S)"
npm run tool:run -- --phase sync-and-rank --run-id "$RUN_ID"
npm run tool:run -- --phase verify-files --run-id "$RUN_ID"
```

첫 명령은 기존 사설 mount와 관리 ID로 입력 저장·계산을 수행하고, 두 번째는 별도 작업의 read-only mount에서 영속 파일을 읽는다. GPU 0, replica 1, CPU 1/max 2, 메모리 2Gi/max 4Gi, 30분 제한이다. 로컬 로그에 토큰을 저장하지 않는다. API의 gzip inline 파일은 컨테이너에서 명시적으로 해제한다. 초기 gzip 실패와 수정된 성공을 구분한 [실제 실행 기록](../reports/EXECUTION-REPORT.ko.md)을 참고한다.

**수동 정리:** 사용자가 직접 삭제하기로 했다. 이전 Supercomputer `sc-discovery-hol`과 그 전용 `mrg-dscmp-sc-discovery-hol-b6wiwf`만 후보이며 부모 Discovery 리소스를 먼저 삭제하는 경로를 사용한다. **새 `-kc` Supercomputer/MRG, 기존 랩 RG 전체, Workspace MRG, Foundry 모델, 데이터, 공통 `McapsGovernance`는 삭제하지 않는다.** 새 컴퓨트 MRG가 Sweden Central에 표시되는 것은 정상이다.

이하 기본 명령은 이전 단일 리전 경로의 참고 예제다. 새 배포에는 위 매개변수·검증된 단계 payload와 실제 배포 이름을 사용한다.

## 실행 전 중단 조건

- 현재 디렉터리/구독/RG가 [활성 설정](../../config/lab.json)과 다르면 중단한다.
- 리전의 제품 지원, 실제 용량, 필요한 모델·VM quota 중 선택한 단계의 선행조건이 해결되지 않으면 그 단계와 의존 단계는 생성하지 않는다.
- 진행 중인 동일 자원 배포가 있으면 겹치는 PUT을 보내지 않는다.
- `what-if`에 예상 밖 삭제·역할 확대·공개 접근 전환·기존 데이터 변경이 있으면 중단한다.
- 기존 모델 quota 요청을 확인하기 전 같은 요청을 다시 제출하지 않는다.

## 1. 범위와 현재 상태 확인 — 읽기 전용

같은 Bash 세션에서 저장소 루트 기준으로 실행한다.

```bash
SUBSCRIPTION_ID='51531604-2337-4c05-bc05-3c3d4ff154e5'
RESOURCE_GROUP='rg-discovery-hol-20260930'
LOCATION='swedencentral'

az account show --subscription "$SUBSCRIPTION_ID" \
  --query "{subscription:id,tenant:tenantId,state:state,user:user.name}"
az group show --name "$RESOURCE_GROUP" --subscription "$SUBSCRIPTION_ID" \
  --query "{id:id,location:location,tags:tags}"
az deployment group list --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --query "[].{name:name,state:properties.provisioningState}"
az resource list --resource-group "$RESOURCE_GROUP" \
  --subscription "$SUBSCRIPTION_ID" \
  --query "[].{name:name,type:type,location:location}"
```

단순 resource 목록에 없는 상세 상태는 해당 자원의 GET으로 확인한다. 이전 실패 증거와 최신 결과를 서로 덮어쓰거나 혼동하지 않는다. 구독 정책·로그 대상은 RG 상위 관리 그룹까지 확인한다.

## 2. 선행조건 분리

| 검사 | 통과 기준 |
|---|---|
| 서비스 활성화 | 필수 Discovery resource type과 Workspace 목록 GET 확인. `DefaultFeature=Pending` 하나로 실패 처리하지 않음 |
| LoadBalancer feature | `AllowBringYourOwnPublicIpAddress`와 `Microsoft.Network` 모두 Registered. [오후 등록 결과](05-network-identity-data.ko.md) 확인 |
| 모델 quota | [02의 기존 신청](02-model-quota.ko.md)을 추적하고 실제 한도·남은 할당량 확인 |
| 컴퓨트 | [03의 VM/AKS/ACA 수량·SKU·용량](03-compute-capacity.ko.md)을 각각 확인 |
| 정책·역할 | 조직 정책 유지, 실제 identity/object ID와 역할 scope, 전파 상태 확인 |
| 데이터 | 사설 DNS·데이터 역할·실제 Blob 읽기, 입력 5개와 Asset 경로 확인 |
| UI | Studio의 정상 사용자 로그인과 실제 프로젝트 열기 확인 |

```bash
npm run readiness
npm run readiness -- --require core
```

이 명령은 **접근 및 신규 모델 할당용 quota**만 검사하고 로컬 증거 파일을 갱신한다. 반환 코드 `0`도 Workspace의 `Succeeded`를 의미하지 않는다. 이미 배포한 모델의 할당을 재사용하는 상황은 별도로 판단한다.

## 3. 템플릿별 사용 순서와 주의점

| 단계 | 템플릿 / scope | 주요 입력·조건 |
|---|---|---|
| 신규 초기 기반만 | [main.bicep](../../infra/main.bicep), [main.bicepparam](../../infra/main.bicepparam) / 구독 | RG/VNet/원래 3개 서브넷. **기존 9개 서브넷 환경에 재적용 금지** |
| 신규 관리 ID만 | [identity.bicep](../../infra/identity.bicep) / RG | 기존 ID는 재사용. 새 identity로 임의 교체하지 않음 |
| 서비스 권한 | [access.bicep](../../infra/access.bicep) / 구독 | 검증한 `discoveryControlPlaneObjectId`. 기존 동일 명칭 custom role의 GUID/범위를 먼저 확인 |
| 네트워크 확장 | [expand-network.bicep](../../infra/expand-network.bicep) / RG | 기존 3개를 건드리지 않고 4개 child subnet 추가 |
| Storage/ACR/역할 | [lab-foundation.bicep](../../infra/lab-foundation.bicep) / RG | `administratorObjectId`. 기존 public-IP 인수는 현재 템플릿에 없음; Storage는 private-only |
| 고객 Blob PE/DNS | [storage-private-access.bicep](../../infra/storage-private-access.bicep) / RG | 기존 zone이 VNet에 연결돼 있으면 실제 `existingBlobPrivateDnsZoneId`로 재사용. 동일 namespace 중복 link 금지 |
| 관리자 데이터 클라이언트 | [blob-client.bicep](../../infra/blob-client.bicep) / RG | 공개 SSH 부트스트랩 키만 `sshPublicKey`에 전달. **개인 키 금지**. 현재 VM은 이미 준비됨 |
| Discovery 코어 | [discovery-core.bicep](../../infra/discovery-core.bicep) / RG | 기본 `deployCompute=true`. 용량 해결·미리 보기 확인 후 실행 |
| Tool 등록 | [tool.bicep](../../infra/tool.bicep) / RG | 실제 ACR `imageDigest`, GA `properties.version` 사용 |
| Bookshelf/색인 풀 | 전체 가이드 [L03](../labs/MICROSOFT-DISCOVERY-LAB.ko.md#l03) | 위 템플릿들이 Bookshelf/`indexlab`까지 자동 생성하지 않음 |

권한 설정의 Graph 명령은 `--subscription`을 받지 않는다. 필요한 경우에만 아래처럼 **로컬 CLI 문맥**을 명시적으로 바꾸고 계정/테넌트를 다시 확인한다. 이 과정이 역할을 자동 부여하지는 않는다.

```bash
az account set --subscription "$SUBSCRIPTION_ID"
az account show --query "{subscription:id,tenant:tenantId,user:user.name}"
ADMIN_OBJECT_ID=$(az ad signed-in-user show --query id -o tsv)
CONTROL_PLANE_OBJECT_ID=$(az ad sp show \
  --id 92c174ac-8e41-4815-a1b7-d81b19ab03ce --query id -o tsv)
```

현재 템플릿과 `blob:sync`에는 이 실습의 이름·CIDR 기본값이 있다. 새 환경은 해당 값과 `config/lab.json`을 일관되게 조정한다. 리전 이동은 기존 자원의 `location`만 바꾸는 작업이 아니며, VNet/Storage/identity/Workspace와 데이터 이동을 함께 계획한다.

특히 현재 `main.bicep`의 허용 리전은 `swedencentral`로 제한돼 있다. 제품의 공식 운영 리전 세 곳과 이 실습 템플릿의 허용값은 다르다. 다른 지원 리전을 선택하면 새 환경의 정책·용량을 먼저 확인하고, 템플릿 허용값과 매개변수도 함께 검토한다.

## 4. 검증 → 미리 보기 → 승인된 단계만 적용

다음 예시는 코어의 **검증과 미리 보기만** 수행한다.

```bash
az bicep build --file infra/discovery-core.bicep --stdout > /dev/null
az deployment group validate \
  --name discovery-core-review \
  --subscription "$SUBSCRIPTION_ID" --resource-group "$RESOURCE_GROUP" \
  --template-file infra/discovery-core.bicep
az deployment group what-if \
  --name discovery-core-review \
  --subscription "$SUBSCRIPTION_ID" --resource-group "$RESOURCE_GROUP" \
  --template-file infra/discovery-core.bicep
```

모든 선행조건과 차이를 확인하고 승인을 받은 단계만 해당 `what-if`를 `create`로 바꿔 실행한다. RG 배포는 Incremental을 유지하고 Complete/삭제 모드를 사용하지 않는다. 예상하지 않은 차이를 “기본값이기 때문”이라며 일괄 무시하지 않는다.

**실제 관측에서 확인한 주의점:**

- `reference()` 때문에 생기는 principal ID 차이는 미해석 식에 의한 표시 차이일 수 있지만, 실제 ID/역할/scope를 읽어 비교한다.
- Policy의 modify가 템플릿 요청값을 바꿀 수 있다. `validate`/`what-if` 성공 후에도 실제 값을 GET한다.
- Discovery 리소스 태그에는 생성 후 변경 불가라는 제약이 있다. 생성 전에 확정한다.
- `deployCompute=false`는 명시적인 준비 모드이지 지역 AKS capacity의 우회책이 아니다. 기존 Workspace의 `supercomputerIds`를 비우므로 연결된 환경에 함부로 적용하지 않는다.

## 5. 부분 실패를 조사하고 성공을 재조회

```bash
az deployment group show --name discovery-core-resume-20261001-1530 \
  --subscription "$SUBSCRIPTION_ID" --resource-group "$RESOURCE_GROUP" \
  --query "{state:properties.provisioningState,error:properties.error}"
az deployment operation group list --name discovery-core-resume-20261001-1530 \
  --subscription "$SUBSCRIPTION_ID" --resource-group "$RESOURCE_GROUP" \
  --query "[?properties.provisioningState=='Failed'].properties"
```

명령의 배포 이름은 조사하려는 **실제 실행 이름**으로 바꾼다. 상위 `Running`/`Accepted`만 보지 말고 correlation ID로 Activity Log와 MRG 하위 작업을 확인한다.

| 증상 | 필요한 대응 |
|---|---|
| `AKSCapacityHeavyUsage` / `ManagedEnvironmentCapacityHeavyUsageError` | 지역 용량 지원 확인. 같은 요청 반복·vCPU quota 증액을 자동 해결책으로 삼지 않음 |
| terminal `Failed`의 `Conflict` 또는 상태 오류 | 반복 PUT 중단. 원인 해결 후 삭제 승인을 받은 실패 Discovery 리소스만 새 이름으로 재생성. 정상 RG·Storage·데이터는 보존 |
| `IncompatibleDelegations` | 기존 위임 서브넷을 전체 VNet PUT으로 재작성하지 않음 |
| Storage 403 | 실제 public access, 정책, DNS, 데이터 역할을 구분해 확인 |
| GA Tool 요청의 버전 필드 오류 | `2026-06-01`에서는 `properties.version`; 정의는 `properties.definitionContent` |
| MRG `PolicyDeployment_*` 실패 | 과거 실패 이력과 현재 설정을 구분. 중앙 진단은 기존 정책 3개로 복구 완료했으므로 실제 workspace/진단 GET과 새 remediation 결과를 확인 |
| CLI 명령 미지원·MSAL 오류 | 문서화된 다른 읽기 경로 또는 정상 재로그인. 실패 응답을 0/무제한/성공으로 바꾸지 않음 |

코어가 성공하면 `gpt-5-4`, `thermalhol`, `cpulab`과 실제 연결을 확인한다. 그 다음 Bookshelf/색인 풀/KB를 준비한다. [가이드 L00–L09](../labs/MICROSOFT-DISCOVERY-LAB.ko.md#l00)의 단계별 완료 기준을 적용한다.

**중앙 진단 재복구 원칙:** [05의 실제 범위](05-network-identity-data.ko.md)를 따른다. 기존 조직 정책에 RG/workspace 생성 규칙이 있으면 해당 구독의 필요한 reference만 순서대로 복구하고, 진단 설정은 대상 리소스 하나로 제한한다. 관리 그룹 전체 initiative를 재적용하거나 다른 workspace로 목적지를 바꾸거나 새로운 Owner 역할을 부여하지 않는다. West US 2 중앙 로그 목적지는 조직 정책의 값이며 Discovery 작업 리전 변경이 아니다.

## 6. 종료와 증거

- resource 생성 성공과 KB 색인 성공, 실제 도구 실행, Engine 검증은 별도다.
- 실제 도구의 operation ID, `nodepoolId`, 로그, 출력 Asset과 원본 JSON을 보존한다. 로컬 reference JSON을 실행 결과로 바꾸지 않는다.
- Blob 파일 검사는 `npm run blob:sync`, 계산 JSON 내용 검사는 `scripts/verify_ranking.py`의 별도 역할이다. 후자는 `execution_verified: false`를 의도적으로 출력한다.
- 입력 동기화 이후 사설 VM을 할당 해제하고 power state를 확인한다. Engine Stop이나 min=0만으로 모든 비용이 사라지지 않는다.
- 실패한 Workspace/Supercomputer의 MRG 비용, Storage/ACR/Private Endpoint/로그를 점검한다.
- 보존할 데이터를 확인하고 **삭제 승인을 받은 정확한 자원만** 정리한다. 이 참고 자료에는 자동 RG 삭제 명령을 제공하지 않는다.
- 공유 `McapsGovernance` RG/중앙 Log Analytics는 실습 RG 정리에서 제외한다. 로그 수집·보관 비용과 `Do Not Delete` 태그를 별도로 확인한다.
- 구독 scope의 first-party 역할/custom role은 RG 삭제로 사라지지 않으며 다른 환경이 사용할 수 있다.

상세 정리 기준: [L09](../labs/MICROSOFT-DISCOVERY-LAB.ko.md#l09). 새 실행 결과에는 시각, scope, 성공/실패/미실행 구분과 실제 응답을 남기되 토큰·비밀·개인 연락처는 저장하지 않는다.
