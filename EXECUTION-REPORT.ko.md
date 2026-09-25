# Microsoft Discovery 실제 실행 보고서

**가이드는 완성했지만, Azure 핵심 기능 실습은 Microsoft 측 사용 승인 대기로 미완료다.**

실행일: 2026-09-25 KST. 지정 계정과 구독으로 실제 Azure에 접근했다. 사용자의 “사용 승인, 비용 좀 나와도 돼”라는 추가 허용을 반영해 Provider 등록과 정상적인 feature 사용 승인 신청까지 수행했다. **비용 허용과 Microsoft 서비스 팀의 구독 승인은 다른 조건**이다.

## 1. 실제로 확인된 결과

| 항목 | 결과 | 근거 |
|---|---|---|
| 지정 계정·테넌트·구독 | 일치, 구독 Enabled | Azure CLI 계정 확인 및 실제 ARM 구독 GET 200 |
| Microsoft.Discovery Provider | **Registered** | Provider POST 200 후 재조회 |
| Microsoft.Discovery/DefaultFeature | **Pending** | 사용 승인 POST 200 후 실제 GET 응답 |
| Workspace API `2026-06-01` | **404 / InvalidResourceType** | 실제 ARM 응답 |
| 공식 이전 API `2026-02-01-preview` | **404 / InvalidResourceType** | 대체 버전으로 읽기 전용 교차 확인 |
| 필수 Discovery 리소스 유형 | workspaces / supercomputers / bookshelves 안 보임 | Provider resourceTypes 실제 목록 |
| Portal UI 로그인 | 보안 키·지문·PIN 인증 필요 단계 | Playwright headless의 Microsoft 로그인 화면 |
| 새 실습 RG·Workspace·Bookshelf·Supercomputer | **생성하지 않음** | 접근 gate 실패로 생성 단계에 진입하지 않음 |
| Bookshelf 색인·에이전트·도구·Engine 실행 | **미실행** | Discovery 데이터 평면 환경을 만들 수 없음 |

`DefaultFeature`의 `Pending`은 제품 팀 승인 필요 상태다. 사용자가 비용을 허용해도 이를 `Registered`로 임의 변경할 수 없다. 다른 개발용·실험용 feature를 켜거나 인증을 우회하지 않았다.

### 현재 구독에 남은 변경

- `Microsoft.Discovery` Provider 등록
- `Microsoft.Discovery/DefaultFeature` 사용 승인 요청: `Pending`

유료 실습 인프라, 모델 배포, 커스텀 역할, 역할 할당은 만들지 않았다. 승인 요청은 취소하지 않았으며, 전용 실습 RG도 생성 전이다. **구독 전체의 기존 청구가 0원이라는 뜻은 아니다.** 이번 작업이 시작한 유료 리소스 배포가 없다는 의미다.

## 2. 증거 파일

| 파일 | 내용 |
|---|---|
| `artifacts/azure-preflight.json` | 최신 실행의 계정 범위, 시각, 실제 HTTP 응답, gate 판정 |
| `artifacts/runs/2026-09-24T21-03-20-762Z/` | 최초 Provider 등록 실험과 실제 응답 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/` | 추가 사용 승인 신청, Pending, 두 API 버전의 오류 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/04-response.json` | 사용 승인 등록 요청 응답 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/05-response.json` | Pending 재확인 응답 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/07-response.json` | GA API 버전의 Workspace 접근 오류 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/08-response.json` | 이전 공식 API 버전의 동일 오류 |
| `artifacts/runs/2026-09-24T21-08-43-103Z/azure-preflight.webm` | 실제 API 실행 중 headless 화면 원본, 약 27초 |
| `artifacts/reference-ranking.json` | **로컬** 기준 계산; Azure 실행 결과가 아님 |
| `artifacts/reference-ranking-cost3.json` | **로컬** 비용 조건 변경 기준 계산 |

API 호출은 Playwright의 `APIRequestContext`로 실제 `management.azure.com`에 전송했다. 인증은 지정 계정의 기존 Azure CLI 세션을 사용했으며, 토큰은 메모리에만 보관했다. 녹화 화면은 **로컬 증거 뷰어**다. Azure Portal이나 Discovery Studio를 모방한 화면이 아니며, UI 실습 성공을 주장하지 않는다.

요약 영상은 가이드의 핵심 내용과 실제 Azure 접근 점검을 묶은 영상이다. Bookshelf나 Engine을 성공 실행한 시연 영상이 아니다. 인증 화면·비밀번호·토큰·쿠키는 영상에서 제외했다.

**영상:** [챕터형 재생 페이지](artifacts/watch-summary.html) · [MP4](artifacts/microsoft-discovery-summary.ko.mp4) · [한국어 SRT](artifacts/microsoft-discovery-summary.ko.srt). 길이 약 **3분 10초**, 1600×900, 한국어 음성과 화면 자막 포함. SRT/VTT 문장 타이밍은 음성 길이를 기준으로 추정했으며, 음성은 로컬 macOS Yuna TTS로 생성했다. 원본 Azure 실행 영상은 별도 WebM으로 보존했다.

## 3. 제공한 실습 자료

15개 절의 한국어 가이드, 브라우저용 HTML, 아키텍처 다이어그램, 자체 작성한 합성 TXT 4개와 CSV, 결정적 Python 계산기, CPU 도구 Dockerfile과 정의 템플릿, 계정 범위 검증·증거 기록·녹화 자동화를 제공한다.

로컬 기준 계산 결과는 다음과 같다.

| 조건 | 적격 후보와 점수 |
|---|---|
| 원가 상한 5 USD/kg | DELTA 68.6, ALPHA 67.8, THETA 60.8 |
| 원가 상한 3 USD/kg | DELTA 68.6만 적격 |

GAMMA는 최신 정정값 175로 탈락하고 ZETA는 근거 미확보 상태다. **이 표는 실습 정답 기준이며, 실제 Discovery에서 얻은 결과가 아니다.** 도구 이미지를 ACR에 빌드·업로드하거나 Discovery에 등록한 상태도 아니다.

## 4. 비용·할당량 사전 확인

사용자의 비용 허용을 반영해 최소 CPU 구성의 일부 단가와 할당량을 조사했다. 비용이 현재의 중단 사유는 아니다.

| 항목 | Sweden Central 조회 결과 |
|---|---|
| Linux D4s_v6, 일반 종량제 VM | 0.214 USD/시간/VM |
| Linux E20s_v6, 일반 종량제 VM | 1.407 USD/시간/VM |
| 지역 총 vCPU | 한도 100, 사용 0 |
| StandardDsv6Family | 한도 100, 사용 0 |
| StandardEsv6Family | 한도 100, 사용 0 |

출처: 2026-09-25 Azure MCP Retail Pricing과 해당 구독 `az quota list` / `az quota usage list` 실제 조회. Spot·Windows 단가는 제외했다.

**위 두 VM 가격은 전체 Discovery 견적이 아니다.** SQL Hyperscale, Search, ACA, Cosmos DB, 스토리지, 관리 인프라, 모델 토큰 등이 별도다. 논리적 quota가 남아 있다고 특정 SKU의 물리적 가용성이 보장되는 것도 아니다. 모델 quota와 전체 인프라 비용은 승인 후 확정해야 한다.

## 5. 승인 요청에 사용할 정보

Microsoft 담당자 또는 Azure 지원에 다음 내용을 전달하면 된다. 이 패키지는 메시지나 지원 티켓을 대신 발송하지 않았다.

```text
요청: Microsoft Discovery GA 실습용 구독 활성화 / allow-list 검토

Subscription: 51531604-2337-4c05-bc05-3c3d4ff154e5
Tenant: 46e9cdaa-fed3-4131-aa28-c1fc8a8a043a
Account: junwoojeong@MngEnvMCAP757124.onmicrosoft.com
Target region: Sweden Central

Microsoft.Discovery provider: Registered
Microsoft.Discovery/DefaultFeature: Pending
Requested feature at: 2026-09-24T21:08Z (2026-09-25 06:08 KST)
Workspace list:
  API 2026-06-01 -> 404 InvalidResourceType
  API 2026-02-01-preview -> 404 InvalidResourceType
Provider exposes only generic locations/operations/checkNameAvailability types.

Feature-state correlation ID:
c124962c-9e26-4835-9154-a33d112afb56

Purpose: Original synthetic training documents, one workspace/project,
Bookshelf indexing, bounded CPU tool, and Discovery Engine walkthrough.
No real customer research data and no GPU workload required.
```

## 6. 재개 순서

1. Microsoft 측 `DefaultFeature` 승인과 구독 활성화를 확인한다. `Pending`을 통과로 간주하지 않는다.
2. Provider를 다시 등록해 변경을 전파하고, 실제 필수 리소스 유형과 Workspace API 성공을 확인한다.
3. 사용자가 올바른 테넌트에서 정상 MFA·보안 키 로그인을 완료한다.
4. 모델 quota, IAM·NSP 관리자 작업, 네트워크, 전체 비용을 검토한다.
5. 가이드 Lab 0~6을 실제 실행하고 각 단계의 클라우드 증거를 추가한다.
6. 핵심 기능의 **실제 실행 영상**을 새로 녹화한다. 현재의 접근 점검 영상을 완료 시연으로 이름만 바꾸지 않는다.

읽기 전용 재확인:

```bash
npm run preflight
```

승인 반영 후에는 다음 명시적 실행으로 Provider를 다시 등록해 변경을 전파하고, 접근 gate를 통과한 경우에만 전용 RG를 생성한다.

```bash
npm run preflight -- --register --create-resource-group
```

관련 공식 문서: [Discovery 접근 선행조건](https://learn.microsoft.com/en-us/azure/microsoft-discovery/quickstart-infrastructure), [Azure feature Pending과 승인](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/preview-features).
