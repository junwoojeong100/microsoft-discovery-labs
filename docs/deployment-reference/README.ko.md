# Microsoft Discovery 배포 참고 자료

**최근 상태 확인: 2026-10-02 09:10 KST · 한국어 · 실제 실행 기록과 읽기 전용 재조회**

**현재 차단 항목은 Bookshelf 생성 quota다.** Korea 런타임의 Workspace·Supercomputer·AKS는 Succeeded이고 정책 애드온은 활성화/Compliant다. 이전 Sweden 자원의 실패 이력과 현재 Korea 환경을 구분한다. 문서 보완 과정에서는 Azure 리소스를 변경하거나 색인·검색을 실행하지 않았다.

**바로 보기:** [현재 남아 있는 이슈와 재개 조건](01-current-state.ko.md#open-issues) · [통합 문제 목록](#incident-index) · [누락 관측 보완](../reports/EXECUTION-REPORT.ko.md#incident-supplement). 값은 관측 시각 기준이며 실행 직전에 다시 확인한다.

## 주제별 문서

| 문서 | 확인할 내용 |
|---|---|
| [01 — 현재 상태와 블로커](01-current-state.ko.md) | 최신 상태, 미해결 이슈별 영향·재개 조건, 명시적으로 분리한 과거 실패 기록 |
| [02 — 모델 quota와 제출한 신청](02-model-quota.ko.md) | 정확한 증액 계산, 총한도와 추가량, 생성 최소치와 운영 목표, 중복 신청 방지 |
| [03 — AKS·VM quota와 지역 용량](03-compute-capacity.ko.md) | 독립 검토 결과, vCPU 산술, SKU/zone 제약, 미제출 지원요청 초안 |
| [04 — 아키텍처·지원 리전·데이터 위치](04-architecture-regions.ko.md) | 구성 서비스, 공식 운영 리전, 한국 중부 저장소와 국내 처리의 차이 |
| [05 — 네트워크·권한·사설 데이터 접근](05-network-identity-data.ko.md) | 조직 정책·신원별 역할·사설 Blob 경로와 `disableLocalAuth` 키 조회 관측의 해석 |
| [06 — 리소스 생성·재개 절차](06-resume-runbook.ko.md) | 기존 환경 보존, 템플릿 순서, 읽기/미리 보기 명령, 중단·완료·정리 기준 |

**권장 읽기 순서:** 현재 남은 이슈 → 아래 통합 목록 → 해당 주제 문서 → 재개 절차.

<a id="incident-index"></a>
## 통합 문제 목록

**해결**은 확인한 대상과 범위의 결과다. **대체 경로 완료**를 기존 리전 용량 회복으로, **관측**을 배포 실패 원인으로, **알림 해제**를 실제 패치로 바꾸어 해석하지 않는다.

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

빈 오류 목록, ARM validate/what-if 성공, 내부 AKS 하나의 Succeeded만으로 전체 배포 성공을 주장하지 않는다. 반복 호출은 같은 문제로 묶고, 실제 자원·실습에 영향을 확인한 문제와 원인 미확정 관측을 위에 구분했다.

## 다음 실행에서 먼저 기억할 것

| 구분 | 기준일에 확인한 사실 |
|---|---|
| 서비스 접근 | Discovery 활성화 확인. `DefaultFeature=Pending`만으로 접근 실패를 판정하지 않음 |
| 실제 환경 | 새 Korea Workspace·Supercomputer·AKS Succeeded. 이전 Sweden Workspace·Supercomputer는 Failed 상태로 남음 |
| 해결된 등록 | `AllowBringYourOwnPublicIpAddress` 및 `Microsoft.Network` Registered. 별도 Microsoft 승인 대기 없이 등록 완료 |
| 컴퓨트 | 현재 시스템 노드 2대, cpulab 0대/min 0/max 1. 색인 전용 풀과 실제 색인은 미구성·미실행 |
| 모델 신청 | 09:07–09:10 재조회에서도 mini/embedding 총한도 각 1,000,000 TPM, 가용 990,000/780,000 TPM. 실제 생성 요구는 각 2M TPM. **접수와 승인·반영은 다름** |
| 중앙 진단 해결 | 기존 정책 3개로 복구 성공. West US 2 중앙 workspace 연결 완료, 해당 Discovery 계정의 진단 정책 Compliant 확인. 실제 로그 유입은 미검증 |
| 정책 애드온 | 활성화 및 해당 설치 정책 Compliant 재확인. 전체 구독 준수를 의미하지 않음 |
| 데이터 | 기존 사설 VM 검증과 별도로 Korea Discovery 런타임에서도 입력 5개·결과 2개 저장 및 독립 재조회 성공 |
| 한국 중부 | Discovery control plane은 Sweden Central, 실제 관리 런타임은 Korea Central. 지원되는 교차 리전 구성 |
| 개발 의존성 | `lodash-es` High/Medium 알림은 `dismissed/fix_started`지만 lockfile은 4.17.23, 패치 버전은 4.18.0. **해제와 패치 완료는 다름** |

## 정보의 신뢰 범위

- **실측:** Azure 응답, 배포 상태, 실제 업로드/읽기, 공식 신청 완료 화면.
- **문서:** 인용한 Microsoft 공개 문서의 지원 범위와 권장 구성.
- **가정:** 아직 선택·생성하지 않은 색인 SKU의 수요 산술. 현재 시스템 노드 2대는 실측값이다.
- **미완료/미검증:** Bookshelf quota 반영·생성, KB 색인·에이전트·Engine 종단간 실행, 다중 사용자 검증, 노트북 직접 사설 접근, 실제 로그 유입, 잔존 자원 정리와 비용 확인.

`Registered`, 목록 GET 성공, ARM `Accepted`, 모델 quota 여유, 이미지 build 성공 중 어느 하나도 전체 환경의 성공을 대신하지 않는다. 제어 평면 권한, 데이터 평면 권한, 네트워크 연결, 사용자 브라우저 로그인도 별도로 확인한다.

## 원본 자료

- [활성 범위 설정](../../config/lab.json)
- [전체 한국어 실습 가이드](../labs/MICROSOFT-DISCOVERY-LAB.ko.md)
- [상세 아키텍처와 버전 의존성](../architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md)
- [날짜별 실제 실행 보고서](../reports/EXECUTION-REPORT.ko.md)
- [개인 연락처를 제외한 quota 접수 기록](../../artifacts/discovery-model-quota-requests-20261001.json)
- [미문서화 관측의 최소 요약](../../artifacts/discovery-incident-supplement-20261002.json)
- [현재 이슈 읽기 전용 재조회](../../artifacts/discovery-current-issues-20261002.json)

새 관측 요약에는 원본 파일명·SHA-256과 필요한 사실만 남기고 사용자 계정·토큰·키·원본 응답 전체는 포함하지 않았다. 기존 미추적 원본 파일은 로컬에 보존하며 일괄 커밋하지 않는다. Pages에서는 정리된 문서만 제공하고 raw artifacts는 제외한다. 이 문서의 명령은 저장소 루트에서 실행하는 예시이며, **변경 명령은 별도 승인과 검증 후에만** 사용한다.
