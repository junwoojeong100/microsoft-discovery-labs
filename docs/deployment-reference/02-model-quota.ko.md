# 02 — 모델 quota와 제출한 신청

[목차](README.ko.md) · **기준일: 2026-10-01. 조회값과 신청 상태는 배포 직전에 재확인한다.**

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

따라서 위 증액 계산은 **단순 ARM 생성만의 최소치가 아니라 실습 운영 계획값**이다. 총 3,000,000 TPM 요청도 대규모 검색의 모든 권장 성능을 보장하지 않는다. 실제 서비스 버전·배포 설정·부하에 따라 다시 산정한다.

Workspace의 `gpt-5.4`도 별도다. 공식 중요 안내의 총 500,000 TPM 준비 기준을 사용했으며, 자동 cognition 모델과 `gpt-5-4` 검증 배포를 구분한다. 이미 생성된 모델을 재사용할 때는 기존 할당을 중복 계산하거나 같은 모델을 다시 만들지 않는다.

## 이미 제출한 요청 — 중복 제출 금지

| 모델 | 유형 | 요청 총한도 | 제출 관측 시각 KST | 확인 범위 |
|---|---|---:|---|---|
| `gpt-5-mini` | Global Standard | 3,000,000 TPM | 2026-10-01 13:41:03 | 공식 양식 접수 완료 화면 |
| `text-embedding-3-small` | Global Standard | 3,000,000 TPM | 2026-10-01 13:41:49 | 공식 양식 접수 완료 화면 |

[접수 기록](../../artifacts/discovery-model-quota-requests-20261001.json)에 두 건의 확인 결과가 있다. **접수 완료이며, Microsoft 승인·실제 한도 반영은 미확인**이다. 화면에 별도 접수번호는 표시되지 않았다.

15:53의 실제 조회에서는 두 모델의 총한도가 여전히 각 **1,000,000 TPM**였다. 따라서 **조회값에는 증액이 아직 반영되지 않았다**. 승인 회신을 받았다고 주장하지 않으며 중복 제출하지 않는다. GPT-5.4의 미할당 2,750,000 TPM와 GPT-5.2의 2,990,000 TPM는 각각 현재 사전 점검을 통과한다.

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
- [마지막 모델 quota 조회 기록](../../artifacts/discovery-model-quota-followup-20261001.json)
