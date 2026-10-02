# Microsoft Discovery 설치·운영 참고 자료

**자원 목록: 2026-10-03 05:45 KST · quota 최종 조회: 2026-10-02 22:15 KST · 작성자 환경의 실제 기록**

> **적용 범위: 작성자 환경의 운영 기록.** 새 고객·파트너 환경의 공통 절차는 [실습 가이드 L00](../labs/MICROSOFT-DISCOVERY-LAB.ko.md#l00)에서 시작합니다. 이 참고 자료의 구독·리소스 이름·정책·승인 내역은 고객 기본값이 아니며, 명령을 그대로 복사하지 않습니다. “현재”는 각 표·절에 적힌 관측 시각 기준입니다.

## 현재 결론

**기반 인프라와 직접 CPU 계산은 준비됐지만, KB 기반 연구 흐름은 아직 완료하지 못했습니다.** Home은 Sweden Central, 실행은 Korea Central입니다. 환경 준비 체크 H01–H06 중 4개 충족은 약 67%이며, 전체 실습이나 작업시간의 완료율은 아닙니다.

| 구분 | 확인한 결과 | 해석 |
|---|---|---|
| 준비 완료 | Workspace·Project·Supercomputer·모델·데이터·도구 | 연구에 사용할 기반. 에이전트·Engine 종단간 성공과는 다름 |
| 실제 실행 확인 | 입력 5개, 직접 CPU 계산 결과 2개, 독립 파일 재조회 | 직접 API 경로의 성공이며 L04–L07 완료를 대신하지 않음 |
| 현재 차단 | 22:15 조회에서도 mini/embedding 가용 990,000/780,000 TPM. GA 생성 오류의 요구는 각 2,000,000 TPM | Bookshelf·KB·색인 재개 조건 미충족 |
| 정리 완료 | 이전 Sweden 실행 자원에 이어 과거 Home 8개·빈 관리 RG 2개 정리 | 현재 Korea용 Home 13개와 Korea·공유 자원은 보존 |
| 남은 실행 | KB 색인 → 에이전트·도구 호출 → Engine 검증·피드백 → 운영 확인 | [남은 작업 표](01-current-state.ko.md#remaining-work)의 완료 조건으로 판정 |

근거는 [운영 현황 요약](../../artifacts/discovery-operator-status-20261002.json)에 관측 시각·판정 범위와 함께 남겼습니다. 로컬 문서 검사 통과를 Azure 실습 완료로 계산하지 않습니다.

**현재 생성된 자원을 찾을 때는 [07 — 현재 리소스 그룹과 리소스 목록](07-resource-inventory.ko.md)을 먼저 봅니다.** 관련 RG 6개와 ARM 자원 87개의 이름·위치·역할, 별도 모델 배포 2개를 정리했습니다. 과거 Home 8개와 빈 관리 RG 2개는 삭제 이력으로 분리했습니다. [10-03 삭제·보존 확인](../../artifacts/discovery-home-cleanup-20261003.json)은 기존 실행·quota 기록과 별도의 관측입니다.

**바로 보기:** [현재 자원 목록](07-resource-inventory.ko.md#group-overview) · [현재 남아 있는 이슈와 재개 조건](01-current-state.ko.md#open-issues) · [통합 문제 목록](#incident-index) · [누락 관측 보완](../reports/EXECUTION-REPORT.ko.md#incident-supplement). 값은 관측 시각 기준이며 실행 직전에 다시 확인합니다.

## 주제별 문서

| 문서 | 확인할 내용 |
|---|---|
| [01 — 현재 상태와 블로커](01-current-state.ko.md) | 최신 상태, 미해결 이슈별 영향·재개 조건, 명시적으로 분리한 과거 실패 기록 |
| [02 — 모델 quota와 제출한 신청](02-model-quota.ko.md) | 정확한 증액 계산, 총한도와 추가량, 생성 최소치와 운영 목표, 중복 신청 방지 |
| [03 — AKS·VM quota와 지역 용량](03-compute-capacity.ko.md) | 독립 검토 결과, vCPU 산술, SKU/zone 제약, 미제출 지원요청 초안 |
| [04 — 아키텍처·지원 리전·데이터 위치](04-architecture-regions.ko.md) | 구성 서비스, 공식 운영 리전, 한국 중부 저장소와 국내 처리의 차이 |
| [05 — 네트워크·권한·사설 데이터 접근](05-network-identity-data.ko.md) | 조직 정책·신원별 역할·사설 Blob 경로와 `disableLocalAuth` 키 조회 관측의 해석 |
| [06 — 리소스 생성·재개 절차](06-resume-runbook.ko.md) | 기존 환경 보존, 템플릿 순서, 읽기/미리 보기 명령, 중단·완료·정리 기준 |
| [07 — 현재 리소스 그룹과 리소스 목록](07-resource-inventory.ko.md) | 실제 남아 있는 RG·자원 전체 표, Home/Target/공유 역할, 과거 Home 삭제 이력, 실제 모델 배포 |

**권장 읽기 순서:** 현재 자원 목록 → 현재 남은 이슈 → 아래 통합 목록 → 해당 주제 문서 → 재개 절차.

## 다른 환경에서 이 사례를 참고하는 방법

1. **증상과 계층을 맞춥니다.** 접근 승인, quota, 지역 용량, 권한, 사설 연결, 실제 실행 문제를 구분합니다.
2. **당시 시도와 결과를 함께 읽습니다.** 실패 후의 성공, 과거 한도, 삭제된 자원을 현재 상태로 혼동하지 않습니다.
3. **원인·판정 방법만 재사용합니다.** 구독·리소스 ID, 승인 범위, 이전 환경용 스크립트를 그대로 실행하지 않습니다.
4. **재개는 자신의 환경에서 다시 검증합니다.** 사전검증 통과, 실제 생성, 색인·검색, 최종 연구 결과는 각각 별도 증거가 필요합니다.

고객·파트너가 처음 따라가는 절차는 [공통 실습 가이드](../labs/MICROSOFT-DISCOVERY-LAB.ko.md)에 있습니다. 이 참고 자료를 고객 설치 지시서로 대체하지 않습니다.

<a id="incident-index"></a>
## 통합 문제 목록

**해결**은 확인한 대상과 범위의 결과입니다. **대체 경로 완료**를 기존 리전 용량 회복으로, **관측**을 배포 실패 원인으로, **알림 해제**를 실제 패치로 바꾸어 해석하지 않습니다.

| ID | 문제·관측 | 대응과 확인 결과 | 현재 분류 / 상세 |
|---|---|---|---|
| I01 | `DefaultFeature=Pending`과 실제 서비스 접근의 차이 | 필수 리소스 유형·GET·모델 quota를 분리해 readiness 확인 | 접근 확인 완료 · [실행 보고서](../reports/EXECUTION-REPORT.ko.md#initial-deployment-lessons) |
| I02 | VNet 전체 갱신의 `IncompatibleDelegations` | 기존 서브넷을 재작성하지 않고 child subnet만 추가 | 해결 · [네트워크](05-network-identity-data.ko.md) |
| I03 | Storage 파일 접근 403 | 상위 정책의 public access 변경 확인 후 PE/DNS·VNet 내부 클라이언트 사용 | 사설 런타임 경로 해결, 노트북 직접 경로 미검증 · [네트워크](05-network-identity-data.ko.md) |
| I04 | `AllowBringYourOwnPublicIpAddress` 미등록 | feature와 Network provider 등록·전파 확인 | 해결 · [등록 경과](05-network-identity-data.ko.md) |
| I05 | Sweden AKS/Container Apps 용량 부족 | vCPU quota와 지역 capacity를 분리. 저녁 재시도도 실패했고 Korea 런타임은 별도 성공 | 대체 경로 완료, Sweden 용량 회복 미확인 · [용량](03-compute-capacity.ko.md) |
| I06 | 검증 모델의 `ParentResourceNotReady` | Failed Workspace 아래 child 생성이 거절됨. 부모 Succeeded 후 자식을 생성하는 순서로 분리 | 원인 확인, 새 Korea 자식 배포 완료 · [저녁 재시도](../reports/EXECUTION-REPORT.ko.md#incident-supplement) |
| I07 | 기존 Workspace 저녁 재시도의 상태 충돌 | 과거 Running 스냅샷을 terminal Failed로 보완. 실제 오류 target은 `containerAppsEnvironment`, code는 `Conflict` | 이전 환경 실패 유지, 무조건 재시도 금지 · [보완 기록](../reports/EXECUTION-REPORT.ko.md#incident-supplement) |
| I08 | GPT-5.4 최대 할당으로 신규 quota 소진 | 사용자 최종 할당을 확인하고 cognition/검증 배포를 각각 250,000 TPM로 구성 | 새 환경 해결 · [모델 할당](02-model-quota.ko.md) |
| I09 | “복원” 기록명과 실제 GET-only 동작 불일치 | 20:38 기록은 이미 capacity 3000인 상태의 조회 4회이며 PATCH 0회. RP reset 원인도 이 기록으로 확정하지 않음 | 관측 의미 정정 · [보완 기록](../reports/EXECUTION-REPORT.ko.md#incident-supplement) |
| I10 | `disableLocalAuth=true`로 키 조회 거절 | 30개 반복 관측은 부모 배포 correlation과 일치하지 않음. 키 인증을 켜거나 권한을 확대하지 않음 | 배포 원인으로 미확정 · [키 조회 관측](05-network-identity-data.ko.md#key-auth-observation) |
| I11 | 공통 Log Analytics 대상 RG/workspace 누락 | 기존 정책 3개로 필요한 대상만 복구, 해당 진단 정책 Compliant | 설정 해결, 실제 로그 유입 미검증 · [진단 복구](../reports/EXECUTION-REPORT.ko.md#central-diagnostics) |
| I12 | Defender 정책 ID의 subnet join 부족 | 두 전용 서브넷에 read/join만 부여 | 해결 · [정책 복구](../reports/EXECUTION-REPORT.ko.md#policy-addon-recovery) |
| I13 | 구형 AKS API의 `maxSurge`/`maxUnavailable` 충돌과 ETag 412 | preview API의 애드온 전용 변경과 정확한 If-Match 값 사용. 기존 설정 보존·설치 정책 Compliant | 해결, 같은 구형 요청 반복 금지 · [정책 복구](../reports/EXECUTION-REPORT.ko.md#policy-addon-recovery) |
| I14 | Tool GA 버전 필드·gzip inline 실행 오류 | `properties.version` 사용, gzip 명시 해제 후 실제 작업과 별도 읽기 성공 | 해결 · [초기 개선](../reports/EXECUTION-REPORT.ko.md#initial-deployment-lessons), [실제 실행](../reports/EXECUTION-REPORT.ko.md#korea-runtime) |
| I15 | Bookshelf 문서 200k와 실제 생성 요구 2M TPM 불일치 | small 생성만 요청했으나 provider quota 검증에서 거절. Bookshelf/소유 MRG 미생성 확인 | **현재 차단** · [생성 실패](../reports/EXECUTION-REPORT.ko.md#bookshelf-create-quota) |
| I16 | Private 저장소 Pages 422·원본 HTML 링크·PDF 로컬 경로 | 승인된 Public 전환·Actions 게시·github.io 링크·PDF 로컬 경로 제외 | 해결 · [게시 경과](../reports/EXECUTION-REPORT.ko.md) |
| I17 | 이전 Sweden 구성과 현재 Korea 구성의 구분 | 10-02 실행 자원 정리 후 10-03 과거 Home 8개·빈 관리 RG 2개 추가 정리. 현재 87개 보존 확인 | 과거 구성 정리 완료, 청구액 별도 확인 · [현재 자원 목록](07-resource-inventory.ko.md) |

빈 오류 목록, ARM validate/what-if 성공, 내부 AKS 하나의 Succeeded만으로 전체 배포 성공을 주장하지 않습니다. 반복 호출은 같은 문제로 묶고, 실제 자원·실습에 영향을 확인한 문제와 원인 미확정 관측을 위에 구분했습니다.

## 다음 실행에서 먼저 기억할 것

아래에서 별도로 시각을 적은 자원·quota 현황을 제외한 정책·기능 검증 값은 기존 **09:10 KST 기록**입니다. 리소스 목록 갱신을 다른 검증의 재실행으로 해석하지 않습니다.

| 구분 | 기준일에 확인한 사실 |
|---|---|
| 서비스 접근 | Discovery 활성화 확인. `DefaultFeature=Pending`만으로 접근 실패를 판정하지 않음 |
| 실제 환경 | 10-03 05:45 확인: 현재 Korea 경로의 Home/Target·공유 자원 87개 유지. 과거 Home 8개와 빈 관리 RG 2개 삭제 확인 |
| 해결된 등록 | `AllowBringYourOwnPublicIpAddress` 및 `Microsoft.Network` Registered. 별도 Microsoft 승인 대기 없이 등록 완료 |
| 컴퓨트 | 현재 시스템 노드 2대, cpulab 0대/min 0/max 1. 색인 전용 풀과 실제 색인은 미구성·미실행 |
| 모델 신청 | 22:15 재조회에서도 mini/embedding 총한도 각 1,000,000 TPM, 가용 990,000/780,000 TPM. GA 생성 오류의 요구는 각 2M TPM. **접수와 승인·반영은 다름** |
| 중앙 진단 해결 | 기존 정책 3개로 복구 성공. West US 2 중앙 workspace 연결 완료, 해당 Discovery 계정의 진단 정책 Compliant 확인. 실제 로그 유입은 미검증 |
| 정책 애드온 | 활성화 및 해당 설치 정책 Compliant 재확인. 전체 구독 준수를 의미하지 않음 |
| 데이터 | 기존 사설 VM 검증과 별도로 Korea Discovery 런타임에서도 입력 5개·결과 2개 저장 및 독립 재조회 성공 |
| 한국 중부 | Discovery control plane은 Sweden Central, 실제 관리 런타임은 Korea Central. 지원되는 교차 리전 구성 |
| 개발 의존성 | `lodash-es` High/Medium 알림은 `dismissed/fix_started`지만 lockfile은 4.17.23, 패치 버전은 4.18.0. **해제와 패치 완료는 다름** |

<a id="operator-commands"></a>
## 운영 명령의 경계

아래는 운영자와 문서 기여자를 위한 안내입니다. 환경 입력을 검토하지 않은 상태에서 Azure 실행 명령을 사용하지 않습니다.

| 명령 | 실행 범위 |
|---|---|
| `npm test`, `npm run check:guides`, `npm run build:architecture`, `npm run check:site` | 로컬 문서·데이터 검사. Azure 호출·변경 없음 |
| `npm run readiness` / `-- --require core` | 설정된 구독의 읽기 전용 접근·신규 할당 quota 검사. 로컬 결과 JSON 갱신 |
| `npm run preflight` | 기본은 조회. 등록·접근 신청·RG 생성 플래그는 변경 작업 |
| `npm run tool:run` | 실제 Discovery 작업·파일 쓰기·과금. 실행 범위를 먼저 승인 |
| `npm run blob:sync` | **퇴역한 Sweden VM·Storage 이름을 고정한 과거 재현용 경로. 현재 환경에서 실행하지 않음** |
| `npm run video` | 보존된 초기 접근 점검을 설명하는 역사적 영상 생성. 현재 환경·전체 실습의 성공 시연이 아님 |

## 정보의 신뢰 범위

- **실측:** Azure 응답, 배포 상태, 실제 업로드/읽기, 공식 신청 완료 화면.
- **문서:** 인용한 Microsoft 공개 문서의 지원 범위와 권장 구성.
- **가정:** 아직 선택·생성하지 않은 색인 SKU의 수요 산술. 현재 시스템 노드 2대는 실측값입니다.
- **미완료/미검증:** Bookshelf quota 반영·생성, KB 색인·에이전트·Engine 종단간 실행, 다중 사용자 검증, 노트북 직접 사설 접근, 실제 로그 유입, 최종 청구액·보존 비용 확인. 승인된 이전 실행 자원 정리는 완료했습니다.

`Registered`, 목록 GET 성공, ARM `Accepted`, 모델 quota 여유, 이미지 build 성공 중 어느 하나도 전체 환경의 성공을 대신하지 않습니다. 제어 평면 권한, 데이터 평면 권한, 네트워크 연결, 사용자 브라우저 로그인도 별도로 확인합니다.

## 원본 자료

- [활성 범위 설정](../../config/lab.json)
- [전체 한국어 실습 가이드](../labs/MICROSOFT-DISCOVERY-LAB.ko.md)
- [상세 아키텍처와 버전 의존성](../architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md)
- [날짜별 실제 실행 보고서](../reports/EXECUTION-REPORT.ko.md)
- [개인 연락처를 제외한 quota 접수 기록](../../artifacts/discovery-model-quota-requests-20261001.json)
- [미문서화 관측의 최소 요약](../../artifacts/discovery-incident-supplement-20261002.json)
- [현재 이슈 읽기 전용 재조회](../../artifacts/discovery-current-issues-20261002.json)
- [자원 정리·현재 quota·남은 작업 요약](../../artifacts/discovery-operator-status-20261002.json)
- [과거 Home 삭제·현재 자원 보존 확인](../../artifacts/discovery-home-cleanup-20261003.json)
- [증거 파일의 보존·재생성 기준](../../artifacts/README.md)

새 관측 요약에는 원본 파일명·SHA-256과 필요한 사실만 남기고 사용자 계정·토큰·키·원본 응답 전체는 포함하지 않았습니다. 기존 미추적 원본 파일은 로컬에 보존하며 일괄 커밋하지 않습니다. Pages에서는 정리된 문서만 제공하고 raw artifacts는 제외합니다. 이 문서의 명령은 저장소 루트에서 실행하는 예시이며, **변경 명령은 별도 승인과 검증 후에만** 사용합니다.
