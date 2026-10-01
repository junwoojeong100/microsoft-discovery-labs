# Microsoft Discovery 배포 참고 자료

**기준일: 2026-10-01 · 한국어 · 대화, 실제 실행 기록, 공식 문서 및 독립 검토 요약**

다음 리소스 생성·재개 때 필요한 정보를 주제별로 모았다. 최초 읽기 전용 검토 이후 **코어의 16:14 최종 실패, 16:21 리소스 상태, 16:26 중앙 진단 복구와 후속 quota 조회**를 반영했다. 값은 표시된 시각의 관측이며 실행 직전에 다시 확인한다.

## 주제별 문서

| 문서 | 확인할 내용 |
|---|---|
| [01 — 현재 상태와 블로커](01-current-state.ko.md) | 실제 구독/RG, 성공·실패·미생성 자원, Foundry와 Discovery 프로젝트 구분 |
| [02 — 모델 quota와 제출한 신청](02-model-quota.ko.md) | 정확한 증액 계산, 총한도와 추가량, 생성 최소치와 운영 목표, 중복 신청 방지 |
| [03 — AKS·VM quota와 지역 용량](03-compute-capacity.ko.md) | 독립 검토 결과, vCPU 산술, SKU/zone 제약, 미제출 지원요청 초안 |
| [04 — 아키텍처·지원 리전·데이터 위치](04-architecture-regions.ko.md) | 구성 서비스, 공식 운영 리전, 한국 중부 저장소와 국내 처리의 차이 |
| [05 — 네트워크·권한·사설 데이터 접근](05-network-identity-data.ko.md) | 조직 정책, 9개 서브넷, 신원별 역할, 검증된 사설 Blob 클라이언트 |
| [06 — 리소스 생성·재개 절차](06-resume-runbook.ko.md) | 기존 환경 보존, 템플릿 순서, 읽기/미리 보기 명령, 중단·완료·정리 기준 |

**권장 읽기 순서:** 01 → 04 → 02·03 → 05 → 06.

## 다음 실행에서 먼저 기억할 것

| 구분 | 기준일에 확인한 사실 |
|---|---|
| 서비스 접근 | Discovery 활성화 확인. `DefaultFeature=Pending`만으로 접근 실패를 판정하지 않음 |
| 실제 환경 | Workspace·Supercomputer·코어 배포 모두 `Failed`. 하위 AKS 용량 오류가 남아 전체 실습은 미완료 |
| 해결된 등록 | `AllowBringYourOwnPublicIpAddress` 및 `Microsoft.Network` Registered. 별도 Microsoft 승인 대기 없이 등록 완료 |
| 컴퓨트 | Small·단일 색인 노드 계획에서는 선제적 VM quota 증액 근거 없음. 지역 AKS/Container Apps 용량 오류는 별도 |
| 모델 신청 | 각 총 3,000,000 TPM 신청은 접수됐지만 15:53 실제 총한도는 여전히 각 1,000,000 TPM. **접수와 승인·반영은 다름** |
| 중앙 진단 해결 | 기존 정책 3개로 복구 성공. West US 2 중앙 workspace 연결 완료, 해당 Discovery 계정의 진단 정책 Compliant 확인. 실제 로그 유입은 미검증 |
| 데이터 | TXT 4개·CSV 1개를 사설 VM에서 업로드하고 읽기 해시 검증. VM은 할당 해제 |
| 한국 중부 | Blob Storage 자체는 지원. Discovery 전체 제품의 공식 운영 리전에는 포함되지 않음 |

## 정보의 신뢰 범위

- **실측:** Azure 응답, 배포 상태, 실제 업로드/읽기, 공식 신청 완료 화면.
- **문서:** 인용한 Microsoft 공개 문서의 지원 범위와 권장 구성.
- **가정:** 시스템 풀 노드 수, 아직 선택하지 않은 색인 SKU에 대한 용량 산술.
- **미검증:** quota 승인·반영, 다른 리전의 실제 배포 성공, Studio 프로젝트 사용, 색인·에이전트·Engine 실행.

`Registered`, 목록 GET 성공, ARM `Accepted`, 모델 quota 여유, 이미지 build 성공 중 어느 하나도 전체 환경의 성공을 대신하지 않는다. 제어 평면 권한, 데이터 평면 권한, 네트워크 연결, 사용자 브라우저 로그인도 별도로 확인한다.

## 원본 자료

- [활성 범위 설정](../../config/lab.json)
- [전체 한국어 실습 가이드](../labs/MICROSOFT-DISCOVERY-LAB.ko.md)
- [상세 아키텍처와 버전 의존성](../architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md)
- [날짜별 실제 실행 보고서](../reports/EXECUTION-REPORT.ko.md)
- [개인 연락처를 제외한 quota 접수 기록](../../artifacts/discovery-model-quota-requests-20261001.json)

토큰, 비밀번호, 개인 키, 신청인의 회사 이메일·주소 등 연락처는 이 참고 자료에 저장하지 않는다. 이 문서의 명령은 저장소 루트에서 실행하는 예시이며, **변경 명령은 별도 승인과 검증 후에만** 사용한다.
