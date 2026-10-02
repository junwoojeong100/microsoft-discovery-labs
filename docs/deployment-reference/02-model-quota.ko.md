# 02 — 모델 quota와 제출한 신청

[목차](README.ko.md) · **기준일: 2026-10-01. 조회값과 신청 상태는 배포 직전에 재확인한다.**

## 08:29 KST 실제 생성 검증 — 200,000 TPM 안내만으로는 생성 불가

사용자 요청에 따라 `indexSize=small`인 Bookshelf의 **생성만** 제출했다. ARM validate·what-if는 통과했지만 실제 provider는 **생성 단계부터** `gpt-5-mini`와 `text-embedding-3-small`에 각각 `RequiredCapacity:2000`, 즉 **2,000,000 TPM**를 요구하며 거절했다. 가용량은 각각 capacity 990 / 780이며 부족분은 아래 표와 같다.

[실제 생성 응답](../../artifacts/discovery-bookshelf-create-result-20261002.json)을 우선한다. 생성 how-to의 모델당 200,000 TPM 안내는 이 환경의 실제 생성 동작과 일치하지 않는다. 현재 쿼타에서는 **Bookshelf 자체도 생성되지 않았으며**, 색인·운영만 미룬다고 해결되지 않는다. 아래의 이전 문서 기준/운영 계획 설명과 구분한다.

**09:10 KST 읽기 전용 재확인:** mini/embedding 가용량은 여전히 **990,000 / 780,000 TPM**, 생성 부족분은 **1,010,000 / 1,220,000 TPM**다. [현재 스냅샷](../../artifacts/discovery-current-issues-20261002.json)에 남겼으며, 아래 04:20 조회와 값이 같아도 관측 시각은 다르다. 문서 보완 중 새 증액 신청이나 생성 재시도는 하지 않았다.

## 2026-10-02 후속 재확인

**04:20 KST 재조회:** 사용자가 TPM 증설 신청 완료를 확인했지만 실제 한도는 아직 바뀌지 않았다. Korea Central의 GlobalStandard 기준이다. 아래 목표는 생성 최소치가 아니라 **새 Bookshelf에 추가 할당할 실습 운영 계획값**이며, 다른 배포의 기존 할당을 보존한 계산이다.

| 모델 | 현재 미할당 TPM | 실습 운영 목표 TPM | 부족분 TPM |
|---|---:|---:|---:|
| `gpt-5-mini` | 990,000 | 2,000,000 | **1,010,000** |
| `text-embedding-3-small` | 780,000 | 2,000,000 | **1,220,000** |
| `gpt-5.2` | 2,990,000 | 2,000,000 | **0 — 충분** |

부족한 두 모델의 현재 총한도는 각각 **1,000,000 TPM**, 기존 할당은 각각 **10,000 / 220,000 TPM**다. 따라서 필요한 최소 새 총한도는 **gpt-5-mini 2,010,000 TPM**, **text-embedding-3-small 2,220,000 TPM**다. 여유를 포함해 이미 요청한 **각 총 3,000,000 TPM**는 아직 반영되지 않았다.

[최신 조회와 계산](../../artifacts/discovery-policy-addon-result-20261002.json)의 `bookshelf.quotas`에 API thousand-TPM 단위를 환산해 기록했다. 신청 완료와 Microsoft 승인·실제 한도 반영은 구분한다. 기존 신청을 중복 제출하거나 다른 배포를 축소·삭제하지 않았으며 Bookshelf 생성은 계속 보류한다. 저장소 Public 전환이나 정책 애드온 복구는 Azure 모델 quota를 변경하지 않는다.

## 최종 실습 할당 — 사용자 지정

| 배포 | 용도 | 모델 / 버전 | 배포 유형 | 할당 TPM / capacity |
|---|---|---|---|---:|
| `gpt-5.4` | Workspace 자동 cognition | `gpt-5.4` / `2026-03-05` | **Global Standard** | **250,000 / 250** |
| `gpt-5-4` | Discovery 검증 | `gpt-5.4` / `2026-03-05` | **Global Standard** | **250,000 / 250** |
| 합계 | 새 Korea-runtime Workspace | 동일 모델의 별도 배포 2개 | Global Standard | **500,000 / 500** |

사용자가 새 cognition 할당을 250,000 TPM으로 수정하고 문서에도 반영하도록 지정했다. 과거 최대 할당 2,999,000 TPM과 검토했던 DataZoneStandard 대안은 최종 목표가 아니다. **Data Zone 대안은 생성 요청하지 않았다.** 실제 저장값과 후속 생성 결과는 실행 보고서의 마지막 확인 시각을 따른다. 기존 Sweden 모델 1,000 TPM를 유지하면 이 세 배포의 구독 총할당은 501,000 TPM이며, 다른 새 할당이 없다면 총 3,000,000 중 2,499,000 TPM가 남는다.

**22:58:45 KST 저장 확인:** 새 cognition은 `Succeeded`, `sku.capacity=currentCapacity=250`, 실제 token rate limit **250,000 TPM**다. 검증 모델 생성 전 총할당은 기존 Sweden 1,000 + 새 cognition 250,000 = **251,000 TPM**, 미할당은 **2,749,000 TPM**로 확인했다. [사용자가 저장한 실제 값](../../artifacts/discovery-korea-cognition-user-allocation-20261001.json)을 근거로 후속 검증 모델을 생성한다.

공식 역할별 표는 cognition 250,000 + 검증 200,000 TPM를 최소로 제시하지만, 같은 문서의 중요 안내는 각 250,000씩 총 500,000 TPM 확보를 요구한다. 이 실습은 그 보수적인 기준을 사용한다. **일반 모델 생성의 1,000 TPM 최소 단위와 Discovery 운영 준비 기준은 다르다.**

## 21:46 이후 — GPT-5.4 할당 반환, 새 Workspace 재개

기존 `aif-dwsp-foundry-ym5ffvaa/gpt-5.4`가 **3,000,000 → 1,000 TPM**으로 저장된 것을 ARM에서 확인했다. `Succeeded`, 실제 token rate limit 1,000 TPM, 수정 시각 **21:46:15 KST**다. 이 변경을 되돌리거나 기존 Foundry 프로젝트를 삭제하지 않는다.

이후 Korea Central quota 조회도 **할당 1,000 / 총한도 3,000,000 / 미할당 2,999,000 TPM**으로 바뀌었고, core readiness가 통과했다. 총쿼타가 증가한 것이 아니라 기존 모델의 할당분이 반환된 것이다. 새 Workspace의 cognition 250,000 + 검증 250,000 TPM를 확보할 수 있어 **21:48 사용자 요청으로 생성 단계를 재개**했다. 이전의 총 3,500,000 TPM 증액 안내는 기존 3,000,000 TPM 할당을 그대로 유지하는 경우에만 필요하다.

[현재 Foundry quota 문서](https://learn.microsoft.com/azure/foundry/foundry-models/quotas-limits)는 전환된 모델의 Global Standard를 **구독 내 모든 리전의 같은 모델·버전이 공유하는 pool**로 설명한다. 전환되지 않은 모델은 지역별일 수 있으므로 Quota 화면의 **Scope=Global/Data Zone/리전명**을 확인한다. 이번 GPT-5.4는 실제로 Sweden 배포의 축소가 Korea 조회의 잔여량에도 반영됐다. 위치별 API 경로만 보고 독립 quota라고 단정하지 않는다.

기존 Foundry 프로젝트는 계정의 모델 배포와 다른 리소스다. quota를 반환하려면 **모델 배포의 TPM 할당**을 조정한다. 프로젝트 삭제로 모델 quota가 반환된다고 가정하지 않는다. 1,000 TPM은 기존 Sweden Discovery 운영에 매우 낮으므로 그 환경을 계속 사용할 때는 별도로 계획한다.

증거: [축소된 기존 모델](../../artifacts/discovery-korea-workspace-old-model-20261001.json), [재개 직전 target readiness](../../artifacts/discovery-korea-workspace-readiness-20261001.json). 아래 표와 19:48 절은 이전 시각의 기록이다. Bookshelf 두 모델의 quota 부족은 별개로 남는다.

## 단위와 범위

- TPM은 분당 토큰 한도이며 모델의 입력 context 길이와 다르다.
- API의 `currentValue`는 이 조회에서 **배포에 할당된 quota**다. 실제 추론 트래픽이 그만큼 발생했다는 뜻이 아니다.
- `Count`만 보고 단위를 판단하지 않는다. 응답 설명이 `One Thousand Tokens Per Minute` / `Tokens Per Minute (thousands)`이면 값에 1,000을 곱한다.
- `Global Standard`, `Data Zone Standard`, PTU, Batch는 같은 quota가 아니다.
- 프로젝트를 추가로 만든다고 독립 quota가 새로 생기지 않는다. 구독·모델·배포 유형 및 해당 quota의 지역 범위를 확인한다.

## 마지막 증액 계산

**2026-10-01 15:53 KST 재조회에서도 아래 값이 그대로였다.** Sweden Central, Global Standard 기준이며, **Bookshelf 운영 준비를 위해 모델별 2,000,000 TPM를 추가 할당할 수 있게 확보**하는 계산이다. [시각 고정 실제 응답](../../artifacts/discovery-resume-readiness-20261001-1553.json)에는 코어 점검 통과와 Bookshelf 점검 실패가 따로 있다.

| 모델 | 현재 총한도 TPM | 기존 할당 TPM | 현재 잔여 TPM | 최소 추가 증액 TPM | 최소 새 총한도 TPM |
|---|---:|---:|---:|---:|---:|
| `gpt-5-mini` | 1,000,000 | 10,000 | 990,000 | 1,010,000 | 2,010,000 |
| `text-embedding-3-small` | 1,000,000 | 220,000 | 780,000 | 1,220,000 | 2,220,000 |

```text
필요한 새 총한도 = 기존 할당 + 추가로 확보할 할당량
최소 증액량 = max(0, 필요한 새 총한도 - 현재 총한도)
```

총한도를 2,000,000 TPM로만 바꾸면 기존 할당 때문에 추가 2,000,000 TPM를 확보할 수 없다. 여유를 포함한 실제 요청은 **각 총 3,000,000 TPM**, 즉 기존 한도 대비 각각 **+2,000,000 TPM**이었다.

| 입력란 의미 | 실제 요청값 |
|---|---:|
| 새로운 총한도, TPM | 3,000,000 |
| 새로운 총한도, kTPM | 3000 |
| 추가량을 묻는 경우, TPM | 2,000,000 |

`gpt-5-mini`를 이름이 비슷한 `gpt-5.4-mini`로 바꾸지 않는다.

## 생성 최소치와 운영 목표는 다르다

공식 문서에 단계별 수치 차이가 있으므로 하나의 숫자를 모든 단계의 필수값으로 취급하지 않는다.

| 모델 | Bookshelf how-to의 생성 단계 | 색인/검색 운영 안내 |
|---|---|---|
| `text-embedding-3-small` | 200,000 TPM | 색인 시작 전 2,000,000 TPM |
| `gpt-5.2` | 200,000 TPM | 검색 권장 2,000,000 TPM |
| `gpt-5-mini` | 200,000 TPM | 검색 권장 10,000,000 TPM; quota 개념 문서는 Bookshelf 최소 계획값으로 2,000,000 TPM 제시 |

위 표는 공개 문서의 안내값이다. **08:29의 실제 생성 요청에서는 작은 Bookshelf도 mini·embedding 각각 2,000,000 TPM를 요구했다.** 따라서 이 환경에서는 두 모델의 2M 조건을 운영 계획으로만 취급하거나 200k로 생성 가능하다고 단정하지 않는다. 총 3,000,000 TPM 요청도 대규모 검색의 모든 권장 성능을 보장하지 않으며, 생성 성공과 실제 색인·검색 성공은 계속 별도로 확인한다.

Workspace의 `gpt-5.4`도 별도다. 공식 중요 안내의 총 500,000 TPM 준비 기준을 사용했으며, 자동 cognition 모델과 `gpt-5-4` 검증 배포를 구분한다. 위 최종 할당 표대로 두 배포에 각 250,000 TPM를 사용한다. 이미 생성된 모델을 재사용할 때는 기존 할당을 중복 계산하거나 같은 모델을 다시 만들지 않는다.

## 19:48 후속 — 기존 GPT-5.4 슬라이더 최대치 적용

`aif-dwsp-foundry-ym5ffvaa`의 기존 배포 `gpt-5.4`는 **250,000 → 최대 3,000,000 TPM**으로 저장됐으며 ARM의 Succeeded/currentCapacity와 실제 rateLimits를 확인했다. 모델 버전·GlobalStandard·가드레일·업그레이드 정책·사설 연결은 유지됐다. [변경 전후 증거](../../artifacts/discovery-foundry-tpm-update-20261001.json)를 참고한다.

19:48 당시 GPT-5.4는 **할당 3,000,000 / 총한도 3,000,000 / 미할당 0 TPM**이었다. 아래 15:53·16시대의 2,750,000 TPM 잔여도 과거 값이다. 이후 21:46 할당 축소와 재개 상태는 문서 상단을 따른다.

이 Foundry 계정에는 기존 GPT-5.4 한 개만 있었고 Bookshelf의 두 모델 배포는 없었다. 이들 모델을 임의로 새로 만들지 않았으며, [후속 quota 조회](../../artifacts/discovery-foundry-tpm-usage-20261001.json)에서도 두 모델의 총한도 1,000,000 TPM와 잔여 990,000 / 780,000 TPM는 바뀌지 않았다.

## 이미 제출한 요청 — 중복 제출 금지

| 모델 | 유형 | 요청 총한도 | 제출 관측 시각 KST | 확인 범위 |
|---|---|---:|---|---|
| `gpt-5-mini` | Global Standard | 3,000,000 TPM | 2026-10-01 13:41:03 | 공식 양식 접수 완료 화면 |
| `text-embedding-3-small` | Global Standard | 3,000,000 TPM | 2026-10-01 13:41:49 | 공식 양식 접수 완료 화면 |

[접수 기록](../../artifacts/discovery-model-quota-requests-20261001.json)에 두 건의 확인 결과가 있다. **접수 완료이며, Microsoft 승인·실제 한도 반영은 미확인**이다. 화면에 별도 접수번호는 표시되지 않았다.

15:53의 실제 조회에서는 두 모델의 총한도가 여전히 각 **1,000,000 TPM**였다. 따라서 **조회값에는 증액이 아직 반영되지 않았다**. 승인 회신을 받았다고 주장하지 않으며 중복 제출하지 않는다. GPT-5.4의 미할당 2,750,000 TPM와 GPT-5.2의 2,990,000 TPM는 각각 현재 사전 점검을 통과한다.

16시대 중앙 진단 복구 이후의 [재조회](../../artifacts/discovery-governance-readiness-20261001.json)도 같은 수치였다. 진단 저장소 생성이 모델 quota를 늘리거나 Bookshelf 운영 준비를 완료시키지는 않는다.

선택한 Global Standard 모델에는 별도 리전 입력란이 표시되지 않아 **사용 리전 Sweden Central을 신청 사유에 명시**했다. 이를 별도의 지역별 quota가 실제 승인됐다는 증거로 해석하지 않는다. 양식은 통상 다음 영업일, 경우에 따라 2영업일 처리를 안내했지만 승인이나 처리 기한을 보장하지 않는다.

이후에는 회신과 실제 한도를 확인하고 기존 요청을 추적한다. 사용자의 별도 승인 없이 같은 요청을 다시 제출하거나 다른 모델 배포를 삭제해 quota를 확보하지 않는다. 신청인의 이름·회사 이메일·주소는 이 문서에 보관하지 않는다.

## Foundry quota 화면

기존 [Foundry 프로젝트 증거](../../artifacts/discovery-foundry-default-project-20261001.json):

- 계정: `aif-dwsp-foundry-ym5ffvaa`
- 표시 이름: **Discovery Default Project**
- 프로젝트: `discoverydefaultprojectym5ffvaa`
- 관측 상태: `Succeeded`

이는 Discovery 실습 Project `thermalhol`과 다르다. 포털에서 안 보이면 먼저 **올바른 디렉터리와 구독**을 선택한다. 바로 새 프로젝트를 만들지 않는다.

공식 안내 경로: **New Foundry → 해당 프로젝트 → Manage → Quota → Token per minute → Request quota**. 단순 배포별 TPM 재할당과 구독 quota 증액 요청은 다른 작업이며, PTU 구매로 바꾸지 않는다.

## 읽기 전용 재확인

저장소 루트에서 실행한다. 아래 명령은 Azure를 변경하지 않는다. `readiness`는 로컬의 최신 증거 JSON을 갱신하므로 이전 결과를 보존해야 한다면 먼저 별도 보관한다.

```bash
npm run readiness
npm run readiness -- --require core

az cognitiveservices usage list \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --location swedencentral \
  --query "[?name.value=='OpenAI.GlobalStandard.gpt-5-mini' || name.value=='OpenAI.GlobalStandard.text-embedding-3-small'].{metric:name.value,limit:limit,allocated:currentValue,description:name.localizedValue}" \
  --output json
```

`readiness` 종료 코드: `0` 선택한 접근/모델 quota 검사 통과, `2` 부족, `1` 조회·인증 오류. **물리 용량, VM quota, 역할 전파, 배포 성공, Studio 로그인까지 검증하지 않는다.** 기존 모델의 재사용 여부도 사람이 확인해야 한다.

모델 quota는 위 `az cognitiveservices usage list`를 사용한다. 이 환경에서 Cognitive Services scope의 `az quota list`는 `BadRequest`를 반환했으며, 이를 무제한/미사용으로 해석하지 않는다.

## 근거

- [Discovery quota 계획](https://learn.microsoft.com/azure/microsoft-discovery/concept-quota-reservation)
- [Bookshelf 생성·색인 how-to](https://learn.microsoft.com/azure/microsoft-discovery/how-to-index-bookshelf-knowledgebase)
- [Foundry quota 관리](https://learn.microsoft.com/azure/foundry/how-to/quota)
- [구독 공유 quota와 Scope 확인](https://learn.microsoft.com/azure/foundry/foundry-models/quotas-limits)
- [마지막 모델 quota 조회 기록](../../artifacts/discovery-model-quota-followup-20261001.json)
