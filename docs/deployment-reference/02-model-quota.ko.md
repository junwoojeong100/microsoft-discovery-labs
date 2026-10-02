# 02 — 모델 quota와 제출한 신청

[목차](README.ko.md) · **최신 quota 확인: 2026-10-02 22:15 KST. 이전 할당·신청·생성 시도는 각 절의 관측 시각 기준입니다.**

> **작성자 환경의 quota 기록입니다.** 아래 잔여량·요청 총한도는 고객 공통값이 아닙니다. 새 환경의 계산 원칙은 [가이드 A01](../labs/MICROSOFT-DISCOVERY-LAB.ko.md#a01)을 따릅니다.

**후속 확인, 2026-10-02 22:15 KST:** 두 모델의 총한도는 여전히 각 1,000,000 TPM이며 가용량은 mini 990,000 / embedding 780,000 TPM입니다. GA 생성 요구를 충족하지 못했고 Bookshelf는 0개입니다. [운영 현황 요약](../../artifacts/discovery-operator-status-20261002.json)을 따릅니다. 아래의 요청·슬라이더 변경 기록은 각 절의 과거 시각을 보존합니다.

**정리 이후 구분:** 사용자 승인으로 이전 Sweden 실행 자원과 그 Foundry 배포를 정리했습니다. 현재 Korea의 두 GPT-5.4 배포는 각 250,000 TPM입니다. 아래의 이전 Sweden 1,000 TPM 보존·구독 합계 501,000 TPM 설명은 정리 전 기록이며 현재 배포 목록이 아닙니다.

<a id="bookshelf-recovery-review"></a>
## 우리 쪽 설정으로 해결할 수 있었습니까?

**확인한 범위에서는 낮은 quota로 native Bookshelf를 생성하는 지원 경로를 찾지 못했습니다.** 아래는 작성자 환경의 조사·실험 결과이며, 고객 공통 가이드에 추가할 설치 단계가 아닙니다.

| 검토·시도 | 확인한 결과 | 재사용할 판단 |
|---|---|---|
| 작은 Bookshelf를 생성만 하고 색인 보류 | GA 실제 생성에서 두 모델 각 2M TPM 요구 | 문서의 200k 안내나 사전검증 성공으로 생성 가능성을 확정하지 않음 |
| 모델·TPM·SKU 변경, 기존 Foundry 연결 | 확인한 공개 GA/Preview 생성 계약에 해당 override가 없음. `managedResourceGroup`, `managedOnBehalfOfConfiguration`, `bookshelfUri`는 읽기 전용 | 임의 매개변수·태그나 로컬 readiness 기준 변경으로 provider 검증을 해제하지 않음 |
| 공식 문서의 `2026-02-01-preview` 경로 | 사용자 승인으로 **1회만** 생성 요청. **10-02 17:16:17 KST Failed**, GA와 동일하게 두 모델 각각 `RequiredCapacity:2000` | Preview 전환은 이 환경의 해결책이 아니었음. 동일 요청 반복 금지 |
| 기존 할당 모두 반환 | 총한도 자체가 각 1M TPM이므로 모두 반환해도 2M에 미달 | 다른 프로젝트의 정상 배포를 줄이거나 삭제하지 않음 |
| 기능 등록·서비스 측 경로 | 공개된 낮은-quota 기능은 확인하지 못함. 개발용 feature는 변경하지 않음 | 공개 계약에 없는 옵션은 지원팀의 확인 없이는 사용하지 않음 |

Preview 시도 후에도 Bookshelf와 해당 소유 관리 RG는 각각 0개였고, Korea Workspace·두 GPT-5.4 배포는 그대로였습니다. 색인·검색은 시작하지 않았습니다. [공식 네트워크 강화 배포 예제](https://learn.microsoft.com/azure/microsoft-discovery/how-to-deploy-network-hardened-stack#bookshelf)와 [공개 생성 계약](https://github.com/Azure/azure-rest-api-specs/blob/main/specification/discovery/Discovery.Management.Shared/control-plane.tsp)을 확인했지만, 계약이나 예제 자체를 낮은 quota의 실행 성공 근거로 사용하지 않습니다. 실험 결과와 원본 해시는 [운영 현황 요약](../../artifacts/discovery-operator-status-20261002.json)에 보존했습니다.

**지원 문의는 별도 경로입니다.** 기존 Foundry quota 증액 신청과 구분해 **Microsoft Discovery → Bookshelf / Graph RAG**에 생성 문서 200k와 provider 2M의 차이를 문의하는 초안을 준비했습니다. 이 제품 지원 문의는 **미제출**이며 제출 승인을 받지 않았습니다. 서비스 측 지원 설정·검증 조건 정정이나 실제 quota 반영을 확인해야 다음 생성 시도를 결정할 수 있습니다.

## 2026-10-02 08:29 KST 실제 생성 검증 — 200,000 TPM 안내만으로는 생성 불가

사용자 요청에 따라 `indexSize=small`인 Bookshelf의 **생성만** 제출했습니다. ARM validate·what-if는 통과했지만 실제 provider는 **생성 단계부터** `gpt-5-mini`와 `text-embedding-3-small`에 각각 `RequiredCapacity:2000`, 즉 **2,000,000 TPM**를 요구하며 거절했습니다. 가용량은 각각 capacity 990 / 780이며 부족분은 아래 표와 같습니다.

[실제 생성 응답](../../artifacts/discovery-bookshelf-create-result-20261002.json)을 우선합니다. 생성 how-to의 모델당 200,000 TPM 안내는 이 환경의 실제 생성 동작과 일치하지 않습니다. 현재 쿼타에서는 **Bookshelf 자체도 생성되지 않았으며**, 색인·운영만 미룬다고 해결되지 않습니다. 아래의 이전 문서 기준/운영 계획 설명과 구분합니다.

**09:10 KST 읽기 전용 재확인:** mini/embedding 가용량은 여전히 **990,000 / 780,000 TPM**, 생성 부족분은 **1,010,000 / 1,220,000 TPM**입니다. [현재 스냅샷](../../artifacts/discovery-current-issues-20261002.json)에 남겼으며, 아래 04:20 조회와 값이 같아도 관측 시각은 다릅니다. 문서 보완 중 새 증액 신청이나 생성 재시도는 하지 않았습니다.

## 2026-10-02 후속 재확인

**04:20 KST 재조회:** TPM 증설 신청은 접수됐지만 실제 한도는 아직 바뀌지 않았습니다. Korea Central의 GlobalStandard 조회입니다. 당시 아래 수치는 **새 Bookshelf의 운영 계획값**으로 사용했습니다. 이후 08:29 생성 요청에서도 mini·embedding의 같은 2M 조건이 요구됐습니다. 다른 배포의 기존 할당을 보존한 계산입니다.

| 모델 | 현재 미할당 TPM | 실습 운영 목표 TPM | 부족분 TPM |
|---|---:|---:|---:|
| `gpt-5-mini` | 990,000 | 2,000,000 | **1,010,000** |
| `text-embedding-3-small` | 780,000 | 2,000,000 | **1,220,000** |
| `gpt-5.2` | 2,990,000 | 2,000,000 | **0 — 충분** |

부족한 두 모델의 현재 총한도는 각각 **1,000,000 TPM**, 기존 할당은 각각 **10,000 / 220,000 TPM**입니다. 따라서 필요한 최소 새 총한도는 **gpt-5-mini 2,010,000 TPM**, **text-embedding-3-small 2,220,000 TPM**입니다. 여유를 포함해 이미 요청한 **각 총 3,000,000 TPM**는 아직 반영되지 않았습니다.

[04:20 조회와 계산](../../artifacts/discovery-policy-addon-result-20261002.json)의 `bookshelf.quotas`에 API thousand-TPM 단위를 환산해 기록했습니다. 신청 완료와 Microsoft 승인·실제 한도 반영은 구분합니다. 이 시각에는 생성이 보류됐으며 이후 시도 결과는 문서 상단을 따릅니다. 기존 신청을 중복 제출하거나 다른 배포를 축소·삭제하지 않았습니다. 저장소 Public 전환이나 정책 애드온 복구는 Azure 모델 quota를 변경하지 않습니다.

## 최종 실습 할당 — 사용자 지정

| 배포 | 용도 | 모델 / 버전 | 배포 유형 | 할당 TPM / capacity |
|---|---|---|---|---:|
| `gpt-5.4` | Workspace 자동 cognition | `gpt-5.4` / `2026-03-05` | **Global Standard** | **250,000 / 250** |
| `gpt-5-4` | Discovery 검증 | `gpt-5.4` / `2026-03-05` | **Global Standard** | **250,000 / 250** |
| 합계 | 새 Korea-runtime Workspace | 동일 모델의 별도 배포 2개 | Global Standard | **500,000 / 500** |

사용자가 새 cognition 할당을 250,000 TPM으로 수정하고 문서에도 반영하도록 지정했습니다. 과거 최대 할당 2,999,000 TPM과 검토했던 DataZoneStandard 대안은 최종 목표가 아닙니다. **Data Zone 대안은 생성 요청하지 않았습니다.** 실제 저장값과 후속 생성 결과는 실행 보고서의 마지막 확인 시각을 따릅니다. 기존 Sweden 모델 1,000 TPM를 유지하면 이 세 배포의 구독 총할당은 501,000 TPM이며, 다른 새 할당이 없다면 총 3,000,000 중 2,499,000 TPM가 남습니다.

**22:58:45 KST 저장 확인:** 새 cognition은 `Succeeded`, `sku.capacity=currentCapacity=250`, 실제 token rate limit **250,000 TPM**입니다. 검증 모델 생성 전 총할당은 기존 Sweden 1,000 + 새 cognition 250,000 = **251,000 TPM**, 미할당은 **2,749,000 TPM**로 확인했습니다. [사용자가 저장한 실제 값](../../artifacts/discovery-korea-cognition-user-allocation-20261001.json)을 근거로 후속 검증 모델을 생성합니다.

공식 역할별 표는 cognition 250,000 + 검증 200,000 TPM를 최소로 제시하지만, 같은 문서의 중요 안내는 각 250,000씩 총 500,000 TPM 확보를 요구합니다. 이 실습은 그 보수적인 기준을 사용합니다. **일반 모델 생성의 1,000 TPM 최소 단위와 Discovery 운영 준비 기준은 다릅니다.**

## 21:46 이후 — GPT-5.4 할당 반환, 새 Workspace 재개

기존 `aif-dwsp-foundry-ym5ffvaa/gpt-5.4`가 **3,000,000 → 1,000 TPM**으로 저장된 것을 ARM에서 확인했습니다. `Succeeded`, 실제 token rate limit 1,000 TPM, 수정 시각 **21:46:15 KST**입니다. 이 변경을 되돌리거나 기존 Foundry 프로젝트를 삭제하지 않습니다.

이후 Korea Central quota 조회도 **할당 1,000 / 총한도 3,000,000 / 미할당 2,999,000 TPM**으로 바뀌었고, core readiness가 통과했습니다. 총쿼타가 증가한 것이 아니라 기존 모델의 할당분이 반환된 것입니다. 새 Workspace의 cognition 250,000 + 검증 250,000 TPM를 확보할 수 있어 **21:48 사용자 요청으로 생성 단계를 재개**했습니다. 이전의 총 3,500,000 TPM 증액 안내는 기존 3,000,000 TPM 할당을 그대로 유지하는 경우에만 필요합니다.

[현재 Foundry quota 문서](https://learn.microsoft.com/azure/foundry/foundry-models/quotas-limits)는 전환된 모델의 Global Standard를 **구독 내 모든 리전의 같은 모델·버전이 공유하는 pool**로 설명합니다. 전환되지 않은 모델은 지역별일 수 있으므로 Quota 화면의 **Scope=Global/Data Zone/리전명**을 확인합니다. 이번 GPT-5.4는 실제로 Sweden 배포의 축소가 Korea 조회의 잔여량에도 반영됐습니다. 위치별 API 경로만 보고 독립 quota라고 단정하지 않습니다.

기존 Foundry 프로젝트는 계정의 모델 배포와 다른 리소스입니다. quota를 반환하려면 **모델 배포의 TPM 할당**을 조정합니다. 프로젝트 삭제로 모델 quota가 반환된다고 가정하지 않습니다. 1,000 TPM은 기존 Sweden Discovery 운영에 매우 낮으므로 그 환경을 계속 사용할 때는 별도로 계획합니다.

증거: [축소된 기존 모델](../../artifacts/discovery-korea-workspace-old-model-20261001.json), [재개 직전 target readiness](../../artifacts/discovery-korea-workspace-readiness-20261001.json). 아래 표와 19:48 절은 이전 시각의 기록입니다. Bookshelf 두 모델의 quota 부족은 별개로 남습니다.

## 단위와 범위

- TPM은 분당 토큰 한도이며 모델의 입력 context 길이와 다릅니다.
- API의 `currentValue`는 이 조회에서 **배포에 할당된 quota**입니다. 실제 추론 트래픽이 그만큼 발생했다는 뜻이 아닙니다.
- `Count`만 보고 단위를 판단하지 않습니다. 응답 설명이 `One Thousand Tokens Per Minute` / `Tokens Per Minute (thousands)`이면 값에 1,000을 곱합니다.
- `Global Standard`, `Data Zone Standard`, PTU, Batch는 같은 quota가 아닙니다.
- 프로젝트를 추가로 만든다고 독립 quota가 새로 생기지 않습니다. 구독·모델·배포 유형 및 해당 quota의 지역 범위를 확인합니다.

## 마지막 증액 계산

**2026-10-01 15:53 KST 재조회에서도 아래 값이 그대로였습니다.** Sweden Central, Global Standard 기준이며, **Bookshelf 운영 준비를 위해 모델별 2,000,000 TPM를 추가 할당할 수 있게 확보**하는 계산입니다. [시각 고정 실제 응답](../../artifacts/discovery-resume-readiness-20261001-1553.json)에는 코어 점검 통과와 Bookshelf 점검 실패가 따로 있습니다.

| 모델 | 현재 총한도 TPM | 기존 할당 TPM | 현재 잔여 TPM | 최소 추가 증액 TPM | 최소 새 총한도 TPM |
|---|---:|---:|---:|---:|---:|
| `gpt-5-mini` | 1,000,000 | 10,000 | 990,000 | 1,010,000 | 2,010,000 |
| `text-embedding-3-small` | 1,000,000 | 220,000 | 780,000 | 1,220,000 | 2,220,000 |

```text
필요한 새 총한도 = 기존 할당 + 추가로 확보할 할당량
최소 증액량 = max(0, 필요한 새 총한도 - 현재 총한도)
```

총한도를 2,000,000 TPM로만 바꾸면 기존 할당 때문에 추가 2,000,000 TPM를 확보할 수 없습니다. 여유를 포함한 실제 요청은 **각 총 3,000,000 TPM**, 즉 기존 한도 대비 각각 **+2,000,000 TPM**이었습니다.

| 입력란 의미 | 실제 요청값 |
|---|---:|
| 새로운 총한도, TPM | 3,000,000 |
| 새로운 총한도, kTPM | 3000 |
| 추가량을 묻는 경우, TPM | 2,000,000 |

`gpt-5-mini`를 이름이 비슷한 `gpt-5.4-mini`로 바꾸지 않습니다.

## 생성 최소치와 운영 목표는 다릅니다

공식 문서에 단계별 수치 차이가 있으므로 하나의 숫자를 모든 단계의 필수값으로 취급하지 않습니다.

| 모델 | Bookshelf how-to의 생성 단계 | 색인/검색 운영 안내 |
|---|---|---|
| `text-embedding-3-small` | 200,000 TPM | 색인 시작 전 2,000,000 TPM |
| `gpt-5.2` | 200,000 TPM | 검색 권장 2,000,000 TPM |
| `gpt-5-mini` | 200,000 TPM | 검색 권장 10,000,000 TPM; quota 개념 문서는 Bookshelf 최소 계획값으로 2,000,000 TPM 제시 |

위 표는 공개 문서의 안내값입니다. **08:29의 실제 생성 요청에서는 작은 Bookshelf도 mini·embedding 각각 2,000,000 TPM를 요구했습니다.** 따라서 이 환경에서는 두 모델의 2M 조건을 운영 계획으로만 취급하거나 200k로 생성 가능하다고 단정하지 않습니다. 총 3,000,000 TPM 요청도 대규모 검색의 모든 권장 성능을 보장하지 않으며, 생성 성공과 실제 색인·검색 성공은 계속 별도로 확인합니다.

Workspace의 `gpt-5.4`도 별도입니다. 공식 중요 안내의 총 500,000 TPM 준비 기준을 사용했으며, 자동 cognition 모델과 `gpt-5-4` 검증 배포를 구분합니다. 위 최종 할당 표대로 두 배포에 각 250,000 TPM를 사용합니다. 이미 생성된 모델을 재사용할 때는 기존 할당을 중복 계산하거나 같은 모델을 다시 만들지 않습니다.

## 19:48 후속 — 기존 GPT-5.4 슬라이더 최대치 적용

`aif-dwsp-foundry-ym5ffvaa`의 기존 배포 `gpt-5.4`는 **250,000 → 최대 3,000,000 TPM**으로 저장됐으며 ARM의 Succeeded/currentCapacity와 실제 rateLimits를 확인했습니다. 모델 버전·GlobalStandard·가드레일·업그레이드 정책·사설 연결은 유지됐습니다. [변경 전후 증거](../../artifacts/discovery-foundry-tpm-update-20261001.json)를 참고합니다.

19:48 당시 GPT-5.4는 **할당 3,000,000 / 총한도 3,000,000 / 미할당 0 TPM**이었습니다. 아래 15:53·16시대의 2,750,000 TPM 잔여도 과거 값입니다. 이후 21:46 할당 축소와 재개 상태는 문서 상단을 따릅니다.

이 Foundry 계정에는 기존 GPT-5.4 한 개만 있었고 Bookshelf의 두 모델 배포는 없었습니다. 이들 모델을 임의로 새로 만들지 않았으며, [후속 quota 조회](../../artifacts/discovery-foundry-tpm-usage-20261001.json)에서도 두 모델의 총한도 1,000,000 TPM와 잔여 990,000 / 780,000 TPM는 바뀌지 않았습니다.

## 이미 제출한 요청 — 중복 제출 금지

| 모델 | 유형 | 요청 총한도 | 제출 관측 시각 KST | 확인 범위 |
|---|---|---:|---|---|
| `gpt-5-mini` | Global Standard | 3,000,000 TPM | 2026-10-01 13:41:03 | 공식 양식 접수 완료 화면 |
| `text-embedding-3-small` | Global Standard | 3,000,000 TPM | 2026-10-01 13:41:49 | 공식 양식 접수 완료 화면 |

[접수 기록](../../artifacts/discovery-model-quota-requests-20261001.json)에 두 건의 확인 결과가 있습니다. **접수 완료이며, Microsoft 승인·실제 한도 반영은 미확인**입니다. 화면에 별도 접수번호는 표시되지 않았습니다.

15:53의 실제 조회에서는 두 모델의 총한도가 여전히 각 **1,000,000 TPM**였습니다. 따라서 **해당 조회값에는 증액이 반영되지 않았습니다**. 승인 회신의 증거는 없으며 중복 제출하지 않습니다. 당시 GPT-5.4의 미할당 2,750,000 TPM와 GPT-5.2의 2,990,000 TPM는 해당 사전 점검을 통과했습니다. 이후 GPT-5.4 할당 변경과 혼동하지 않습니다.

16시대 중앙 진단 복구 이후의 [재조회](../../artifacts/discovery-governance-readiness-20261001.json)도 같은 수치였습니다. 진단 저장소 생성이 모델 quota를 늘리거나 Bookshelf 운영 준비를 완료시키지는 않습니다.

선택한 Global Standard 모델에는 별도 리전 입력란이 표시되지 않아 **사용 리전 Sweden Central을 신청 사유에 명시**했습니다. 이를 별도의 지역별 quota가 실제 승인됐다는 증거로 해석하지 않습니다. 양식은 통상 다음 영업일, 경우에 따라 2영업일 처리를 안내했지만 승인이나 처리 기한을 보장하지 않습니다.

이후에는 회신과 실제 한도를 확인하고 기존 요청을 추적합니다. 사용자의 별도 승인 없이 같은 요청을 다시 제출하거나 다른 모델 배포를 삭제해 quota를 확보하지 않습니다. 신청인의 이름·회사 이메일·주소는 이 문서에 보관하지 않습니다.

## Foundry quota 화면

기존 [Foundry 프로젝트 증거](../../artifacts/discovery-foundry-default-project-20261001.json):

- 계정: `aif-dwsp-foundry-ym5ffvaa`
- 표시 이름: **Discovery Default Project**
- 프로젝트: `discoverydefaultprojectym5ffvaa`
- 관측 상태: `Succeeded`

이는 Discovery 실습 Project `thermalhol`과 다릅니다. 포털에서 안 보이면 먼저 **올바른 디렉터리와 구독**을 선택합니다. 바로 새 프로젝트를 만들지 않습니다.

공식 안내 경로: **New Foundry → 해당 프로젝트 → Manage → Quota → Token per minute → Request quota**. 단순 배포별 TPM 재할당과 구독 quota 증액 요청은 다른 작업이며, PTU 구매로 바꾸지 않습니다.

## 읽기 전용 재확인

저장소 루트에서 실행합니다. 아래는 작성자 환경의 **Korea Central target**을 다시 조회하는 예시입니다. 조회 위치만으로 quota pool의 독립성을 판단하지 말고 Foundry의 Scope도 확인합니다. Azure는 변경하지 않지만 `readiness`는 로컬 증거 JSON을 갱신하므로 이전 결과는 필요 시 먼저 보관합니다.

```bash
npm run readiness
npm run readiness -- --require core

TARGET_COMPUTE_LOCATION='koreacentral'
az cognitiveservices usage list \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --location "$TARGET_COMPUTE_LOCATION" \
  --query "[?name.value=='OpenAI.GlobalStandard.gpt-5-mini' || name.value=='OpenAI.GlobalStandard.text-embedding-3-small'].{metric:name.value,limit:limit,allocated:currentValue,description:name.localizedValue}" \
  --output json
```

`readiness` 종료 코드: `0` 선택한 접근/모델 quota 검사 통과, `2` 부족, `1` 조회·인증 오류. **물리 용량, VM quota, 역할 전파, 배포 성공, Studio 로그인까지 검증하지 않습니다.** 기존 모델의 재사용 여부도 사람이 확인해야 합니다.

모델 quota는 위 `az cognitiveservices usage list`를 사용합니다. 이 환경에서 Cognitive Services scope의 `az quota list`는 `BadRequest`를 반환했으며, 이를 무제한/미사용으로 해석하지 않습니다.

## 근거

- [Discovery quota 계획](https://learn.microsoft.com/azure/microsoft-discovery/concept-quota-reservation)
- [Bookshelf 생성·색인 how-to](https://learn.microsoft.com/azure/microsoft-discovery/how-to-index-bookshelf-knowledgebase)
- [Foundry quota 관리](https://learn.microsoft.com/azure/foundry/how-to/quota)
- [구독 공유 quota와 Scope 확인](https://learn.microsoft.com/azure/foundry/foundry-models/quotas-limits)
- [마지막 모델 quota 조회 기록](../../artifacts/discovery-model-quota-followup-20261001.json)
