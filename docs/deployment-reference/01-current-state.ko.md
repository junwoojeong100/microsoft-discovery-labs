# 01 — 현재 상태와 블로커

[목차](README.ko.md) · **리소스 현황: 2026-10-02 21:21 KST · quota 재조회: 22:15 KST. 정책·실행은 각각의 관측 시각을 구분한다.**

> **작성자 환경의 시각 고정 기록이다.** 아래 실제 이름은 신규 고객의 설정 예시가 아니다. 새로운 구성은 [가이드 L00](../labs/MICROSOFT-DISCOVERY-LAB.ko.md#l00)의 환경값부터 정한다.

**현재 자원:** Home은 Sweden Central, 실행 자원은 Korea Central이다. 관련 RG 8개와 ARM 자원 95개, 실제 모델 배포 2개의 이름·위치·역할은 [현재 리소스 목록](07-resource-inventory.ko.md)에 정리했다. 이전 Sweden 실행 자원은 승인된 범위에서 정리했으며, **Home 객체와 두 빈 관리 RG는 보존**했다. 공용 랩 RG의 Sweden 자원 21개를 남은 실행 자원으로 오해해 삭제하지 않는다.

**기존 차단 확인, 09:10 KST:** 당시 Korea Workspace·Supercomputer·AKS는 Succeeded, 정책 애드온은 활성화/Compliant, Bookshelf는 0개였다. 08:29 생성 요청의 mini·embedding 각 2M TPM 요구와 09:07–09:10 한도 미반영은 [당시 이슈 증거](../../artifacts/discovery-current-issues-20261002.json), [모델별 부족분](02-model-quota.ko.md)을 따른다. 이번 자원 목록 갱신은 quota 승인이나 전체 정책·실습을 다시 검증한 것이 아니다.

**22:15 KST 후속 조회:** Bookshelf는 여전히 0개이며, mini/embedding 한도도 각각 1,000,000 TPM로 미반영이다. [운영 현황 요약](../../artifacts/discovery-operator-status-20261002.json)에 기존 할당·부족분·완료 경계를 기록했다. 이 조회로 정책 준수나 실제 연구 실행까지 재검증한 것은 아니다.

## 진행 현황을 읽는 기준

**환경 준비도는 H01–H06 중 4개 충족, 약 67%다.** 같은 가중치의 체크 항목 수이며 전체 실습 진행률·소요시간·고객 환경 재현 성공률이 아니다.

| 준비 항목 | 현재 판정 | 남은 확인 |
|---|---|---|
| H01 — Workspace·Project | 준비 완료 | 연구자 화면·접속 확인은 H06과 구분 |
| H02 — 필수 모델 | 준비 완료 | 두 GPT-5.4 배포 각 250,000 TPM 유지 |
| H03 — Bookshelf·KB·색인 | 미완료 | 생성 차단 해소 후 색인 Succeeded 필요 |
| H04 — 입력·Asset | 준비 완료 | 입력 5개와 데이터 참조, 이전 독립 재조회 증거 |
| H05 — 계산 풀·도구 | 준비 완료 | 직접 CPU 실행 성공. 에이전트 경유 실행은 미검증 |
| H06 — 연구자 접근·권한 | 일부 구성, 완료 미확인 | 사용자별 Studio·사설 파일 접근, KB 권한 확인 |

<a id="remaining-work"></a>
## 남아 있는 작업과 완료 조건

| 순서 | 작업 | 선행조건 / 지금 가능한 범위 | 완료로 표시할 증거 |
|---|---|---|---|
| 1 | Bookshelf 생성 차단 해소 | 기존 증액 신청의 실제 반영 또는 지원되는 서비스 측 조건 정정. [API 실험·지원 문의 준비 상태](02-model-quota.ko.md#bookshelf-recovery-review) 확인. 중복 신청·기존 타 프로젝트 축소 금지 | 두 모델에 필요한 미할당 TPM 또는 정식 생성 조건을 실제 조회로 확인 |
| 2 | 연구자 접속·권한 확인 | 기존 Korea 환경의 Studio·Blob 경로는 지금 확인 가능. 미생성 KB 권한은 생성 후 확인 | 실제 사용자별 접속·파일 읽기/쓰기, 필요한 역할과 사설 DNS 경로 |
| 3 | 색인 풀 준비 | SKU·메모리·지역 용량·비용 계획은 지금 확인 가능. 생성은 별도 승인 범위에서 수행 | 승인된 `indexlab`과 실제 노드 풀 상태 |
| 4 | Bookshelf·KB·원본 연결·색인 | 1번 해소, 부모 Succeeded와 2–3번의 필요한 조건 충족 | `thermal-evidence` v1, TXT 4개 원본 연결, 색인 Succeeded |
| 5 | 전문 에이전트·도구 호출 | 모델·지시문 준비와 KB 연결·실행 완료를 구분. 근거 실습은 4번 이후 | 에이전트 3개, 원문 인용, 실제 파일 작업과 에이전트 경유 CPU 실행 |
| 6 | Engine·조건 변경 검증 | 근거·도구 준비와 앞 단계 결과 확인 | R0/T1/T2/T3 및 T4/T5의 실제 실행·검증 의견·출력 연결 |
| 7 | 운영 마무리 | 협업을 선택했다면 별도 사용자 필요. 실행 이력과 관측 시각 보존 | 로그 실제 유입, 권한 경계, 결과 재현성, 최종 청구·보존 상태 |

개발 의존성 패치와 선택 확장 E01/E02는 위 환경 준비도와 별도로 관리한다. 고객 공통 절차는 [실습 가이드](../labs/MICROSOFT-DISCOVERY-LAB.ko.md), 이 환경의 재개 입력은 [운영 runbook](06-resume-runbook.ko.md)을 사용한다.

**10-01 23:32 KST 코어 실행 기록:** home은 Sweden Central, runtime은 Korea Central이다. 새 Workspace·Project·검증 모델·Supercomputer·cpulab이 모두 **Succeeded**이며 두 GPT-5.4 배포는 **각 Global Standard 250,000 TPM**이다. 합성 입력 5개와 계산 결과 2개의 실제 CPU 실행·별도 작업 재조회도 성공했다. 당시 남은 것은 Bookshelf 운영 quota, 승인되지 않은 별도 정책 애드온 권한, KB 기반 자율 연구였다. 이후 정책 복구는 위 후속 결과를 따른다. [실행 보고서](../reports/EXECUTION-REPORT.ko.md), [교차 리전 절차](06-resume-runbook.ko.md)를 따른다. 이전 Sweden 단일 리전의 상세 실패 기록은 문서 뒤쪽의 날짜별 이력으로 분리했다.

## 활성 배포 범위

| 항목 | 값 |
|---|---|
| 구독 이름 | `ME-MngEnvMCAP757124-junwoojeong-1` |
| 구독 ID | `51531604-2337-4c05-bc05-3c3d4ff154e5` |
| 테넌트 ID | `46e9cdaa-fed3-4131-aa28-c1fc8a8a043a` |
| 리소스 그룹 | `rg-discovery-hol-20260930` |
| Discovery home 리전 | `swedencentral` |
| 신규 target compute 리전 | `koreacentral` |
| 실습 태그 | `microsoft-discovery-core-hol` |

계정 정보의 기준은 [config/lab.json](../../config/lab.json)이다. 과거 기록의 `rg-discovery-hol-20260925`와 혼동하지 않는다. 새로운 환경을 만들 때는 구독/RG뿐 아니라 전역 고유 이름, CIDR, 템플릿 매개변수, 스크립트의 리소스 이름도 함께 검토한다.

## 현재 주요 리소스

| 대상 | 마지막 확인 상태 / 완료 범위 |
|---|---|
| 새 Workspace `discoveryholjunwookc` | **Succeeded**, control plane Sweden Central / 관리 런타임 Korea Central |
| 새 Supercomputer `sc-discovery-hol-kc` / 실제 AKS | **Succeeded**, AKS Korea Central. 시스템 노드 2대, cpulab 0대/min 0/max 1 |
| 검증 모델·Project·실제 CPU 실행 | 10-01 최종 실행에서 성공 확인. 새 GPT-5.4 두 배포 각 250,000 TPM, 입력 5개·결과 2개 저장·독립 재조회 |
| 정책 애드온 | `enabled=true`, 해당 설치 정책 **Compliant** 재확인 |
| Bookshelf / KB / 색인 풀 | Bookshelf 미생성, KB·색인 풀도 미구성. KB는 Bookshelf의 하위 자원이고 색인 풀은 Supercomputer의 별도 자원. 색인·검색 미실행 |
| 이전 Sweden Home / 실행 자원 | `discoveryholjunwoosc` / `sc-discovery-hol` 등 과거 Home 메타데이터는 보존. 연결됐던 실행 자원은 정리했고 두 이전 관리 RG의 내부 자원은 0개 |
| Pages | 문서 게시 완료. 증거·설정 원본은 사이트에서 제외 |

<a id="open-issues"></a>
## 현재 남아 있는 이슈

**관측 시각:** R01의 가용 quota는 22:15 KST 재조회, R04의 자원 현황은 21:21 KST 조회다. R02·R03·R05의 세부 실행·패치 검증은 기존 기록을 따른다. 실행 자원 정리는 별도 사용자 승인으로 수행했고, 이번 문서 갱신에서는 읽기 전용 조회만 했다. 이 갱신으로 정책 준수·색인·검색·의존성 패치까지 새로 검증했다고 해석하지 않는다.

| ID / 분류 | 남은 항목과 영향 | 재개·완료 조건 |
|---|---|---|
| R01 **생성 차단** | Bookshelf mini/embedding 가용 **990,000 / 780,000 TPM**, 실제 생성 요구 각 **2,000,000 TPM**. 각각 **1,010,000 / 1,220,000 TPM** 부족 | Microsoft 증액의 실제 반영 또는 서비스 측 생성 검증 조건 정정 후 다시 조회·validate/what-if. 신청 중복 제출·기존 모델 축소로 우회하지 않음 |
| R02 **후속 구성·실행 보류** | Bookshelf·KB·색인 풀 미구성, KB 기반 에이전트·Discovery Engine 종단간 실행 미완료 | R01 해소 및 부모 Succeeded 후 구성. 사용자 요청은 **생성만**이므로 색인·검색·운영은 별도 시작 승인 이후 수행 |
| R03 **개발 의존성 패치 미확인** | `lodash-es` High/Medium 알림은 `dismissed`, 이유 `fix_started`, `fixedAt=null`. lockfile은 **4.17.23**, 알림의 패치 버전은 **4.18.0** | 영향 검토·의존성 갱신·회귀 확인 후 실제 패치 완료 판정. 열린 알림 0건을 해결 완료로 해석하지 않음 |
| R04 **실행 자원 정리 완료·비용 확인 필요** | 이전 Sweden 실행 자원 66개와 전용 하위 항목을 포함한 80개 부재 확인. Home·관리 RG·Korea·공유 자원은 보존 | [현재 자원 목록](07-resource-inventory.ko.md)을 사용. 빈 관리 RG나 Home을 추가 삭제하지 않으며, 실제 청구액·소프트 삭제 보존 비용은 별도 확인 |
| R05 **추가 검증 필요** | 노트북의 직접 사설 Blob/Studio 경로, 다중 사용자 권한 경계, 중앙 로그 실제 유입·과거 누락 복구는 미검증 | 각 경로의 실제 접속·역할 테스트·로그 도착 증거 필요. 성공한 사설 런타임 도구 실행이나 진단 설정 Compliant로 대신하지 않음 |

**해결된 항목:** Pages 게시·HTML 링크, 승인된 두 서브넷 read/join, 정책 애드온 활성화, Korea 컴퓨트 경로, 이전 Sweden 실행 자원 정리. Sweden 리전의 과거 capacity 실패는 새 Korea 작업을 현재 차단하는 문제로 표시하지 않는다. 기본 정책의 구형 API와 preview fallback 호환성 문제는 복구 이력을 유지하며 같은 구형 변경 요청을 반복하지 않는다.

보안 알림의 상태는 [High 알림](https://github.com/junwoojeong100/microsoft-discovery-labs/security/dependabot/2), [Medium 알림](https://github.com/junwoojeong100/microsoft-discovery-labs/security/dependabot/1)과 위 시각의 [재조회 스냅샷](../../artifacts/discovery-current-issues-20261002.json)을 따른다. 실제 악용 가능성 분석은 이 문서 작업에서 수행하지 않았다.

## 2026-10-01 오후 Sweden 환경 — 과거 리소스별 결과

| 구성요소 | 이름 / 마지막 확인 결과 |
|---|---|
| VNet | `vnet-discovery-hol`, `10.80.0.0/16`, 후속 클라이언트까지 서브넷 9개 |
| Discovery 관리 ID | `id-discovery-hol`, 필요한 범위에 역할 할당 |
| 고객 Storage | `stdiscoveryholjunwoosc`, Standard LRS, `Succeeded`, 공개 네트워크·공유 키·익명 Blob 비활성 |
| Blob 컨테이너 | `discoveryinputs`, `discoveryoutputs` 생성 |
| 사설 Blob 연결 | `pe-discovery-blob`, 승인 및 생성 성공. DNS 관측값 `10.80.8.4` |
| 사설 데이터 클라이언트 | `vm-discovery-blob-client`, `Standard_B2als_v2`, 검증 후 `PowerState/deallocated` |
| 원본 파일 | 합성 TXT 4개·CSV 1개 업로드/읽기 SHA-256 일치. 재실행은 동일 파일 재사용 |
| Discovery 데이터 참조 | `thermaldata`, `evidencepack`, `candidatecsv`: `Succeeded` |
| ACR / 도구 | `acrdiscoveryholjunwoosc`, build `dt1` 성공, `thermal-ranking` version `1.0.0` 등록 성공 |
| Network feature | `AllowBringYourOwnPublicIpAddress`와 `Microsoft.Network`: `Registered`, 오후 등록·전파 완료 |
| 오후 코어 배포 | `discovery-core-resume-20261001-1530`: **16:14:43 KST 최종 Failed** |
| Supercomputer | `sc-discovery-hol`: `Failed`, 16:21 GET으로 재확인 |
| Workspace | `discoveryholjunwoosc`: `Failed` |
| Discovery 하위 자원 | `cpulab`, `gpt-5-4`, `thermalhol`: 마지막 조회에서 미생성 |
| Bookshelf / 색인 풀 | Bookshelf와 `indexlab` 미생성 |
| 연구 실행 | 색인, 연구 에이전트, 실제 Supercomputer 도구 실행, Engine, 다중 사용자 권한 실습 미실행 |
| 중앙 진단 | `McapsGovernance/mcaps4c05bc053c3d4ff154e5-la` 생성 및 `setByPolicy-MCAPSGovernance` 연결 완료; 정책 복구 3건 Succeeded |

도구 이미지의 관측 digest:

```text
acrdiscoveryholjunwoosc.azurecr.io/thermal-ranking@sha256:0051d5db6c367812c22073d807da54b469ecbcc58edb7cfaf0dbce5e78514ad1
```

이미지 build·Tool 등록·실제 도구 실행은 서로 다른 완료 기준이다.

## 2026-10-01 오후 — Foundry 프로젝트만 있던 과거 상태

| 구분 | 관측 상태 |
|---|---|
| Foundry 계정 | `aif-dwsp-foundry-ym5ffvaa`: `Succeeded` |
| Foundry 프로젝트 | **Discovery Default Project** / `discoverydefaultprojectym5ffvaa`: `Succeeded` |
| 자동 cognition 모델 | Foundry 배포 `gpt-5.4`, revision `2026-03-05`, GlobalStandard capacity 250 관측 |
| Discovery 검증 모델 | 별도 Chat Model Deployment `gpt-5-4`는 미생성 |
| Discovery 실습 Project | Workspace 아래 `thermalhol`은 미생성 |

Foundry의 기본 프로젝트가 있다고 Discovery의 연구 실습이 준비된 것은 아니다. 자동 cognition 배포를 별도의 검증 배포로 간주하거나, quota 화면을 찾기 위해 중복 Foundry 프로젝트를 만들지 않는다.

## 2026-10-01 오후의 블로커 — 과거 기록

아래 행은 당시 실패 환경의 원인을 보존한다. 현재 남은 항목은 위 R01–R05를 따르며, Project·CPU 풀이 지금도 미생성이라고 해석하지 않는다.

| 항목 | 확인한 원인 / 다음 조치 |
|---|---|
| AKS/Container Apps 배포 | Feature 등록 이후인 **15:46:52**에도 새 하위 AKS가 `AKSCapacityHeavyUsage` 반환. 기존 Workspace의 `ManagedEnvironmentCapacityHeavyUsageError`도 남음. [지원 확인](03-compute-capacity.ko.md) 필요 |
| Bookshelf 운영 모델 용량 | **신청 접수 후에도 실제 한도 미반영**. gpt-5-mini/embedding 잔여 990,000/780,000 TPM로 실습 운영 목표 각 2,000,000 TPM 미달. [요청 추적](02-model-quota.ko.md) |
| 후속 Studio·연구 실행 | Project/검증 모델/CPU 풀 미생성. 정상 로그인·프로젝트 열기·색인·계산·Engine 미검증. 현재 AKS 생성 오류의 원인으로 판정한 것은 아님 |

**중앙 진단 대상 누락은 해결됐다.** 기존 조직 정책과 기존 관리 ID를 사용해 중앙 RG·workspace·Discovery 계정의 진단 설정만 복구했다. 정책 정의·권한은 변경하지 않았다. [실제 복구 증거](../../artifacts/discovery-governance-recovery-20261001.json)와 [로그·메트릭·목적지](../../artifacts/discovery-governance-diagnostic-setting-20261001.json)를 확인한다. 후속 [16:30:10 KST 평가](../../artifacts/discovery-governance-compliance-20261001.json)에서 **해당 계정의 진단 정책은 Compliant**였다. 전체 구독의 모든 정책이나 실제 로그 유입을 검증한 것은 아니다.

확인된 주요 실패 식별자:

| 대상 | 식별자 |
|---|---|
| 오후 재시도, 15:46:52 하위 AKS 실패 | correlation `cf91439f-960e-430a-96af-798274d51c89` |
| Supercomputer 생성 | correlation `75d88d20-5dd2-4963-b2b1-00dc4b1039e4` |
| Workspace 생성 | correlation `e08e90c5-299f-4552-a354-697e0da7df45` |
| Workspace 내부 AKS 용량 오류 | request `0ea9a155-9803-4e6c-85fd-b8ed67a02502` |

원래 `discovery-core-20261001` 배포는 중복 쓰기를 막기 위해 취소했다. 별도 `discovery-workspace-20261001` 배포는 약 55분 뒤 실패했다. **배포 취소는 생성된 자원 삭제가 아니며, 이미 시작된 하위 작업을 즉시 중단한다고 보장하지 않는다.**

오후의 `discovery-core-resume-20261001-1530`은 별도 한 번의 재시도다. 15:52의 Running/Accepted를 거쳐 **16:14:43에 최종 Failed**로 종료됐다. 원인은 하위 AKS 용량 오류이며 추가 재시도는 하지 않았다. 이번에는 terminal `Failed` 갱신의 `Conflict`를 관측하지 않았으며, 향후 해당 오류가 발생할 때만 승인된 삭제·재생성 경로를 검토한다.

## 남아 있는 비용

이전 Sweden 실행 자원은 정리됐지만 **현재 Korea의 AKS·관리형 서비스·저장소와 조직 공통 로그는 유지**한다. Bookshelf 미생성이나 Engine 미실행이 비용 0을 뜻하지 않는다. 빈 관리 RG 컨테이너 자체에는 별도 사용 요금이 없다.

이전 사설 클라이언트 VM과 OS 디스크도 삭제됐다. 앞의 할당 해제 기록은 과거 상태이며, 현재 자원은 [21:21 목록](07-resource-inventory.ko.md)을 따른다. 정리는 일반 삭제 경로로 진행했고 강제 purge나 보존 정책 변경은 하지 않았다. 실제 청구액과 서비스별 소프트 삭제 보존 비용은 이번 자원 목록 조회로 확인하지 않았다.

중앙 Log Analytics와 공유 `McapsGovernance` RG는 현재 Korea 진단 경로가 사용하므로 보존한다. 로그 수집·보관 비용은 별도로 확인하며 임의로 관리 RG나 공유 구독 역할을 삭제하지 않는다.

## 증거와 시간 차이

- [09:10 현재 이슈](../../artifacts/discovery-current-issues-20261002.json), [저녁 재시도·원인 미확정 관측 보완](../../artifacts/discovery-incident-supplement-20261002.json), [Bookshelf 실제 생성 실패](../../artifacts/discovery-bookshelf-create-result-20261002.json).
- [16:14 코어 최종 실패](../../artifacts/discovery-resume-deployment-20261001.json), [16:21 상태](../../artifacts/discovery-resume-snapshot-20261001-1621.json), [중앙 진단 복구](../../artifacts/discovery-governance-recovery-20261001.json), [복구 후 quota](../../artifacts/discovery-governance-readiness-20261001.json).
- [15:52 시각 고정 상태](../../artifacts/discovery-resume-snapshot-20261001-1552.json), [15:53 quota](../../artifacts/discovery-resume-readiness-20261001-1553.json), [새 AKS 실패](../../artifacts/discovery-resume-activity-failures-20261001.json).
- [Network feature 등록](../../artifacts/discovery-resume-network-feature-registration-20261001.json), [Provider 전파](../../artifacts/discovery-resume-network-provider-20261001.json), [오후 상위 배포 상태](../../artifacts/discovery-resume-current-deployment-20261001.json).
- [초기 워크로드 스냅샷](../../artifacts/discovery-execution-20261001.json): 사설 클라이언트 추가 전 기록이므로 당시 서브넷은 8개.
- [최초 사설 업로드](../../artifacts/discovery-private-blob-upload-20261001.json), [재실행 읽기 검증](../../artifacts/discovery-private-blob-sync.json), [VM 할당 해제](../../artifacts/discovery-blob-client-state-20261001.json): 후속 9번째 서브넷/클라이언트 단계.
- [Foundry 기본 프로젝트](../../artifacts/discovery-foundry-default-project-20261001.json)
- [Supercomputer 용량 오류](../../artifacts/discovery-core-capacity-failures-20261001.json), [Workspace 용량 오류](../../artifacts/discovery-workspace-capacity-20261001.json)
- [진단 정책 실패](../../artifacts/discovery-workspace-governance-20261001.json), [Studio 로그인 관측](../../artifacts/discovery-studio-headless-20261001.json)
