# 06 — 리소스 생성·재개 절차

[목차](README.ko.md) · **기준일: 2026-10-01. 아래는 실행 참고용이며 이번 문서 작성에서 실행하지 않았다.**

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
| Bookshelf/색인 풀 | 전체 가이드 [L03](../../MICROSOFT-DISCOVERY-LAB.ko.md#l03) | 위 템플릿들이 Bookshelf/`indexlab`까지 자동 생성하지 않음 |

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
az deployment group show --name discovery-workspace-20261001 \
  --subscription "$SUBSCRIPTION_ID" --resource-group "$RESOURCE_GROUP" \
  --query "{state:properties.provisioningState,error:properties.error}"
az deployment operation group list --name discovery-workspace-20261001 \
  --subscription "$SUBSCRIPTION_ID" --resource-group "$RESOURCE_GROUP" \
  --query "[?properties.provisioningState=='Failed'].properties"
```

명령의 배포 이름은 조사하려는 **실제 실행 이름**으로 바꾼다. 상위 `Running`/`Accepted`만 보지 말고 correlation ID로 Activity Log와 MRG 하위 작업을 확인한다.

| 증상 | 필요한 대응 |
|---|---|
| `AKSCapacityHeavyUsage` / `ManagedEnvironmentCapacityHeavyUsageError` | 지역 용량 지원 확인. 같은 요청 반복·vCPU quota 증액을 자동 해결책으로 삼지 않음 |
| `IncompatibleDelegations` | 기존 위임 서브넷을 전체 VNet PUT으로 재작성하지 않음 |
| Storage 403 | 실제 public access, 정책, DNS, 데이터 역할을 구분해 확인 |
| GA Tool 요청의 버전 필드 오류 | `2026-06-01`에서는 `properties.version`; 정의는 `properties.definitionContent` |
| MRG `PolicyDeployment_*` 실패 | 중앙 진단 대상/조직 정책을 확인. 본체의 직접 실패 원인과 구분 |
| CLI 명령 미지원·MSAL 오류 | 문서화된 다른 읽기 경로 또는 정상 재로그인. 실패 응답을 0/무제한/성공으로 바꾸지 않음 |

코어가 성공하면 `gpt-5-4`, `thermalhol`, `cpulab`과 실제 연결을 확인한다. 그 다음 Bookshelf/색인 풀/KB를 준비한다. [가이드 L00–L09](../../MICROSOFT-DISCOVERY-LAB.ko.md#l00)의 단계별 완료 기준을 적용한다.

## 6. 종료와 증거

- resource 생성 성공과 KB 색인 성공, 실제 도구 실행, Engine 검증은 별도다.
- 실제 도구의 operation ID, `nodepoolId`, 로그, 출력 Asset과 원본 JSON을 보존한다. 로컬 reference JSON을 실행 결과로 바꾸지 않는다.
- Blob 파일 검사는 `npm run blob:sync`, 계산 JSON 내용 검사는 `scripts/verify_ranking.py`의 별도 역할이다. 후자는 `execution_verified: false`를 의도적으로 출력한다.
- 입력 동기화 이후 사설 VM을 할당 해제하고 power state를 확인한다. Engine Stop이나 min=0만으로 모든 비용이 사라지지 않는다.
- 실패한 Workspace/Supercomputer의 MRG 비용, Storage/ACR/Private Endpoint/로그를 점검한다.
- 보존할 데이터를 확인하고 **삭제 승인을 받은 정확한 자원만** 정리한다. 이 참고 자료에는 자동 RG 삭제 명령을 제공하지 않는다.
- 구독 scope의 first-party 역할/custom role은 RG 삭제로 사라지지 않으며 다른 환경이 사용할 수 있다.

상세 정리 기준: [L09](../../MICROSOFT-DISCOVERY-LAB.ko.md#l09). 새 실행 결과에는 시각, scope, 성공/실패/미실행 구분과 실제 응답을 남기되 토큰·비밀·개인 연락처는 저장하지 않는다.
