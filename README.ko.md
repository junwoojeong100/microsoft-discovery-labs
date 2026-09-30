# Microsoft Discovery 실습 자료

[English](README.md) · **한국어**

**2026-09-25에 확인한 공식 문서**를 바탕으로 작성한 Microsoft Discovery 실습 가이드와 Azure 아키텍처 자료입니다.

## 시작하기

| 문서 | GitHub에서 읽기 | 다른 형식 |
|---|---|---|
| 핵심 기능 실습 가이드 | [가이드 읽기](MICROSOFT-DISCOVERY-LAB.ko.md) | [PDF](MICROSOFT-DISCOVERY-LAB.ko.pdf) · [HTML](MICROSOFT-DISCOVERY-LAB.ko.html) |
| Azure 아키텍처와 버전 의존성 | [아키텍처 읽기](MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md) | SVG 그림 3개와 Mermaid 원본 포함 |

실습 가이드는 **기본 실습 10개와 확장 실습 2개**로 구성됩니다. Workspace/Project, 데이터·파일, Bookshelf, 에이전트·버전, 계산 도구, Discovery Engine, 사람의 피드백, 협업·RBAC, 추적성·비용, Hybrid/MCP 도구를 다룹니다. 각 실습은 **목표 → 실행 → 완료 기준** 순서로 진행합니다.

아키텍처 문서는 API 버전, 모델 revision, SKU, 런타임 버전을 구분합니다. 공개되지 않은 내부 버전을 추정하지 않고, 서비스 간 의존성과 변경 시 영향을 설명합니다.

GitHub에서는 Markdown 또는 PDF를 선택하세요. HTML은 저장소를 다운로드하거나 복제한 뒤 열면 상대 경로로 연결된 그림까지 볼 수 있습니다.

## 실행 상태

제공 데이터는 합성 데이터입니다. 로컬 계산과 문서 확인은 **Azure 실행 증거가 아닙니다**. **2026-09-30에 네트워크 기반과 Workspace용 관리 ID를 배포**했습니다. 실제 Discovery Workspace 생성 요청은 **HTTP 404 `InvalidResourceType`**으로 실패했습니다. Discovery 전체 실습과 실제 기능 실행 영상은 여전히 차단된 상태입니다.

## 생성된 기반 환경 (2026-09-30)

새 [리소스 그룹 `rg-discovery-hol-20260930`](https://portal.azure.com/#@46e9cdaa-fed3-4131-aa28-c1fc8a8a043a/resource/subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/rg-discovery-hol-20260930/overview)은 `config/lab.json`에 지정된 구독의 **Sweden Central**에 있습니다. VNet `vnet-discovery-hol`(`10.80.0.0/16`)과 UAMI `id-discovery-hol`을 포함합니다. VNet에는 `default` 서브넷 없이 **정확히 3개**의 서브넷이 있습니다.

| 서브넷 | CIDR | 설정 |
|---|---|---|
| `workspaceSubnet` | `10.80.3.0/24` | `Microsoft.App/environments` 위임, `Microsoft.Storage` 엔드포인트 |
| `privateEndpointSubnet` | `10.80.4.0/24` | 위임 없음, Private Endpoint 네트워크 정책 활성화 |
| `agentSubnet` | `10.80.5.0/24` | `Microsoft.App/environments` 위임, `Microsoft.Storage` 엔드포인트 |

세 서브넷 모두 VM의 기본 아웃바운드 액세스를 비활성화했습니다. NAT Gateway, NSG, Private Endpoint, VPN, 컴퓨트, Storage account는 생성하지 않았으며, 이번 배포에서 UAMI에 역할을 부여하지 않았습니다. 서브넷을 나누는 것만으로 서브넷 간 트래픽이 차단되지는 않습니다.

실제 서브넷/UAMI ID와 API `2026-06-01`을 사용해 Workspace `discoveryholjunwoosc`에 `PUT` 생성 요청을 보냈지만 프로비저닝 전에 거부됐습니다. `Microsoft.Discovery`는 `Registered`이지만 `DefaultFeature`는 여전히 `Pending`이고, `workspaces` 리소스 유형도 보이지 않습니다. **생성된 `Microsoft.Discovery/*` 리소스는 없습니다.** 배포를 진행하려면 Microsoft 측에서 이 구독의 Discovery 사용을 활성화해야 합니다.

후속 확인에서는 미등록 의존 공급자 6개를 추가 등록해 공식 목록의 **25개 모두 `Registered`**임을 확인했습니다. 그러나 등록 후 Workspace 목록을 다시 조회한 결과, `2026-06-01`과 `2026-02-01-preview` API 모두 **HTTP 404 `InvalidResourceType`**을 반환했습니다. [최신 등록·접근 기록](artifacts/discovery-registration-followup-20260930.json)에 조회 결과와 요청 ID를 보존했습니다. [공식 빠른 시작의 사전 요구 사항](https://learn.microsoft.com/ko-kr/azure/microsoft-discovery/quickstart-infrastructure?tabs=portal#prerequisites)과 가이드 L00에 따라, 사용 승인 조건이 충족되지 않은 상태에서 추가 리소스 생성이나 역할 할당은 진행하지 않았습니다.

Sweden Central은 East US, UK South와 함께 [공식 생산 지원 리전](https://learn.microsoft.com/azure/microsoft-discovery/quickstart-infrastructure)입니다. 리전을 지정하지 않는 Workspace 목록 조회도 `InvalidResourceType`으로 실패했으므로, 현재 증거는 미지원 리전보다 구독·서비스 활성화 문제를 가리킵니다. 모델·VM quota가 충분하다는 뜻은 아니며, 접근 활성화 후 별도로 확인해야 합니다.

[요청 본문](infra/workspace-create.json)은 **생성 시도용이며 완성된 배포 템플릿이 아닙니다**. 네트워크 격리를 유지하고 공개 접근을 끄며, Supercomputer는 연결하지 않았습니다. 전체 가이드 구성에는 전용 서브넷 4개 추가, Supercomputer, Bookshelf, 저장소, RBAC/NSP 역할, 모델·VM quota, 클라이언트 연결이 더 필요합니다. 사용 승인을 받는 것만으로 이 요청이 완전한 실행 환경이 되지는 않습니다.

[네트워크 IaC](infra/main.bicep), [매개변수](infra/main.bicepparam), [관리 ID IaC](infra/identity.bicep)를 보존했습니다. 원본 `config/lab.json`과 과거 가이드 예시는 **20260925** 리소스 그룹을 유지하므로, 새 **20260930** 네트워크에는 새 매개변수 파일을 사용하세요. 다음 명령은 각 배포를 미리 보기만 하며 리소스를 생성하지 않습니다.

```bash
az deployment sub what-if \
  --name discovery-network-20260930 \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --location swedencentral \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam

az deployment group what-if \
  --name discovery-identity-20260930 \
  --subscription 51531604-2337-4c05-bc05-3c3d4ff154e5 \
  --resource-group rg-discovery-hol-20260930 \
  --template-file infra/identity.bicep
```

실행 기록: [네트워크 배포](artifacts/discovery-network-deployment-20260930.json), [실제 네트워크 상태](artifacts/discovery-network-state-20260930.json), [관리 ID 배포](artifacts/discovery-identity-deployment-20260930.json), [실제 Workspace 요청·응답](artifacts/discovery-workspace-create-20260930.json), [서비스 접근 상태](artifacts/discovery-access-20260930.json), [리소스 목록](artifacts/discovery-resource-inventory-20260930.json). 인증 토큰은 포함하지 않았습니다.

## 로컬 빌드

```bash
npm ci
npm run build:guide
npm test
npm run check:guides
npm run build:architecture
```

Node.js 22 이상, Python 3을 사용합니다. 브라우저 확인에는 설치된 Google Chrome이 필요합니다.

- `build:guide`: 분리된 영문·국문 HTML과 언어별 그림을 생성합니다.
- `check:guides`: headless Chrome으로 링크·레이아웃·언어 전환·PDF를 확인합니다.
- `build:architecture`: 아키텍처 그림을 로컬에서 해석하고 렌더링합니다.

이 명령들은 Azure를 호출하거나 변경하지 않습니다. Mermaid는 문서 작성 도구의 의존성이며, Microsoft Discovery 제품의 의존성이 아닙니다.

## 파일 구성

- `data/`: 직접 작성한 합성 TXT/CSV 입력 데이터입니다. 실제 연구 데이터는 없습니다.
- `scripts/score_materials.py`: 로컬 기준 계산기입니다. 클라우드 실행을 증명하지 않습니다.
- `scripts/verify_ranking.py`: `--case baseline` 또는 `--case cost3`으로 내려받은 원본 계산 파일의 모든 필드를 검사합니다. 실행 위치는 확인할 수 없어 `execution_verified: false`를 출력합니다.
- `tools/thermal-ranking/`: 기본 CPU Action 도구 템플릿입니다. E01은 기본 도구를 바꾸지 않고 별도의 Hybrid 도구를 만드는 절차입니다.
- `config/lab.json`: 최초 실습 환경의 계정·구독 범위입니다.
- `infra/`: 네트워크·관리 ID Bicep과 지정 범위에서 실패한 Workspace 생성 시도용 요청 본문입니다.
- `tests/`: 데이터·정답·문서 일치·범위·패키징 확인 코드입니다.

## 이전 접근 점검

[실행 보고서](EXECUTION-REPORT.ko.html), `artifacts/azure-preflight.json`, [이전 요약 영상](artifacts/watch-summary.html)은 이전의 Azure 접근 점검 기록입니다. **Discovery 핵심 기능의 성공 시연이나 현재 가이드의 실습 완료 증거가 아닙니다.**

`npm run preflight`는 Azure에 실제 읽기 요청을 합니다. 등록·접근 신청·리소스 그룹 생성 플래그는 변경 작업을 수행하므로 **로컬 문서 빌드 절차에는 포함하지 않습니다**.
