# 01 — 현재 상태와 블로커

[목차](README.ko.md) · **최신 상태 확인: 2026-10-02 09:10 KST. 아래 과거 기록은 날짜를 구분한다.**

**현재:** Korea 런타임 Workspace·Supercomputer·AKS는 Succeeded이며 정책 애드온은 활성화/Compliant다. **Bookshelf는 0개**다. 08:29 생성 요청에서 서비스가 mini·embedding 각각 2M TPM를 요구해 거절했고, 09:07–09:10 재조회도 한도 미반영이다. [현재 이슈 증거](../../artifacts/discovery-current-issues-20261002.json), [모델별 부족분](02-model-quota.ko.md), [통합 문제 목록](README.ko.md#incident-index)을 참고한다.

**10-01 23:32 KST 코어 실행 기록:** home은 Sweden Central, runtime은 Korea Central이다. 새 Workspace·Project·검증 모델·Supercomputer·cpulab이 모두 **Succeeded**이며 두 GPT-5.4 배포는 **각 Global Standard 250,000 TPM**이다. 합성 입력 5개와 계산 결과 2개의 실제 CPU 실행·별도 작업 재조회도 성공했다. 당시 남은 것은 Bookshelf 운영 quota, 승인되지 않은 별도 정책 애드온 권한, KB 기반 자율 연구였다. 이후 정책 복구는 위 후속 결과를 따른다. [실행 보고서](../reports/EXECUTION-REPORT.ko.md), [교차 리전 절차](06-resume-runbook.ko.md)를 따른다. 아래 표는 이전 Sweden 단일 리전 실행의 시각 고정 기록이다.

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
| Bookshelf / KB / 색인 풀 | Bookshelf 미생성, 부모에 의존하는 KB·색인 풀도 미구성. 색인·검색 미실행 |
| 이전 Sweden Workspace / Supercomputer | `discoveryholjunwoosc` / `sc-discovery-hol` 모두 **Failed** 상태로 남음. 새 Korea 환경 실패와 구분 |
| Pages | 문서 게시 완료. 증거·설정 원본은 사이트에서 제외 |

<a id="open-issues"></a>
## 현재 남아 있는 이슈

**기준: 2026-10-02 09:10 KST.** 차단 원인, 후속 작업, 추가 검증, 정리 필요를 분리한다. 이 문서 보완에서는 자원 생성·삭제·권한 변경·색인·검색·의존성 패치를 하지 않았다.

| ID / 분류 | 남은 항목과 영향 | 재개·완료 조건 |
|---|---|---|
| R01 **생성 차단** | Bookshelf mini/embedding 가용 **990,000 / 780,000 TPM**, 실제 생성 요구 각 **2,000,000 TPM**. 각각 **1,010,000 / 1,220,000 TPM** 부족 | Microsoft 증액의 실제 반영 또는 서비스 측 생성 검증 조건 정정 후 다시 조회·validate/what-if. 신청 중복 제출·기존 모델 축소로 우회하지 않음 |
| R02 **후속 구성·실행 보류** | Bookshelf·KB·색인 풀 미구성, KB 기반 에이전트·Discovery Engine 종단간 실행 미완료 | R01 해소 및 부모 Succeeded 후 구성. 사용자 요청은 **생성만**이므로 색인·검색·운영은 별도 시작 승인 이후 수행 |
| R03 **개발 의존성 패치 미확인** | `lodash-es` High/Medium 알림은 `dismissed`, 이유 `fix_started`, `fixedAt=null`. lockfile은 **4.17.23**, 알림의 패치 버전은 **4.18.0** | 영향 검토·의존성 갱신·회귀 확인 후 실제 패치 완료 판정. 열린 알림 0건을 해결 완료로 해석하지 않음 |
| R04 **잔존 자원·비용 정리 필요** | 기존 Sweden Workspace·Supercomputer는 Failed 상태로 남음. 하위 상시 서비스·디스크 등 비용 0을 보장하지 않음 | 소유 관계·데이터·공유 자원·청구액을 확인하고 승인된 범위만 정리. 랩 RG 전체나 새 Korea 환경은 삭제하지 않음 |
| R05 **추가 검증 필요** | 노트북의 직접 사설 Blob/Studio 경로, 다중 사용자 권한 경계, 중앙 로그 실제 유입·과거 누락 복구는 미검증 | 각 경로의 실제 접속·역할 테스트·로그 도착 증거 필요. 성공한 사설 런타임 도구 실행이나 진단 설정 Compliant로 대신하지 않음 |

**해결된 항목:** Pages 게시·HTML 링크, 승인된 두 서브넷 read/join, 정책 애드온 활성화, Korea 컴퓨트 경로. Sweden 리전의 과거 capacity 실패는 새 Korea 작업을 현재 차단하는 문제로 표시하지 않는다. 기본 정책의 구형 API와 preview fallback 호환성 문제는 복구 이력을 유지하며 같은 구형 변경 요청을 반복하지 않는다.

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

실패한 배포에서도 Search, Cosmos DB, Foundry, Storage, Private Endpoint, Log Analytics/NSP 등 MRG 자원이 생성됐다. Bookshelf 미생성이나 Engine 미실행이 비용 0을 뜻하지 않는다.

사설 클라이언트 VM은 할당 해제로 컴퓨트 과금을 줄였지만 OS 디스크는 유지된다. 할당 해제된 VM의 vCPU가 quota 사용량에 포함될 수도 있으므로 과금과 quota 반환을 구분한다. 임의로 MRG나 공유 구독 역할을 삭제하지 않는다.

중앙 Log Analytics는 기존 조직 정책대로 **West US 2 / PerGB2018 / 보존 30일**, 별도 일일 cap 없이 생성됐다. 로그 수집·보관 비용을 별도로 확인하며 공유 `McapsGovernance` RG를 실습 종료와 함께 삭제하지 않는다.

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
