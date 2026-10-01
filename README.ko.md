# Microsoft Discovery 실습 자료

[English](README.md) · **한국어**

Microsoft Discovery 실습 가이드와 Azure 아키텍처 자료입니다. **2026-10-01 실제 Azure 배포 결과**를 반영해 국문·영문의 절차와 완료 기준을 함께 개정했습니다.

## 시작하기

| 문서 | GitHub에서 읽기 | 다른 형식 |
|---|---|---|
| 핵심 기능 실습 가이드 | [가이드 읽기](MICROSOFT-DISCOVERY-LAB.ko.md) | [PDF](MICROSOFT-DISCOVERY-LAB.ko.pdf) · [HTML](MICROSOFT-DISCOVERY-LAB.ko.html) |
| Azure 아키텍처와 버전 의존성 | [아키텍처 읽기](MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md) | SVG 그림 3개와 Mermaid 원본 포함 |
| 다음 배포를 위한 주제별 참고 자료 | [참고 자료 목차](docs/deployment-reference/README.ko.md) | 현재 상태·quota·용량·리전·네트워크·재개 절차 |

실습 가이드는 **기본 실습 10개와 확장 실습 2개**로 구성됩니다. Workspace/Project, 데이터·파일, Bookshelf, 에이전트·버전, 계산 도구, Discovery Engine, 사람의 피드백, 협업·RBAC, 추적성·비용, Hybrid/MCP 도구를 다룹니다. 각 실습은 **목표 → 실행 → 완료 기준** 순서로 진행합니다.

아키텍처 문서는 API 버전, 모델 revision, SKU, 런타임 버전을 구분합니다. 공개되지 않은 내부 버전을 추정하지 않고, 서비스 간 의존성과 변경 시 영향을 설명합니다.

GitHub에서는 Markdown 또는 PDF를 선택하세요. HTML은 저장소를 다운로드하거나 복제한 뒤 열면 상대 경로로 연결된 그림까지 볼 수 있습니다.

## 실행 상태

**서비스 사용 활성화는 확인됐지만 전체 실습은 미완료입니다.** 이전 `InvalidResourceType` 문제는 해소됐습니다. 네트워크·Storage·Registry·사설 Blob 연결·Discovery 데이터 참조·digest 고정 CPU Tool을 생성했습니다. Supercomputer는 Sweden Central의 **`AKSCapacityHeavyUsage`**로 실패했습니다. 별도로 검증한 Workspace-only 시도도 내부 Container Apps가 같은 지역 AKS 용량에 의존해 실패했습니다.

Bookshelf는 gpt-5-mini·임베딩 quota 증액이 필요합니다. **사설 Blob은 후속 작업에서 원격 VM 경로를 마련해 입력 5개 업로드·읽기 해시 일치까지 확인**했습니다. 이 경로가 로컬 브라우저에 VPN을 제공하는 것은 아닙니다. 에이전트·색인·실제 계산·Discovery Engine의 **종단간 실행은 미검증**입니다. [초기 워크로드 상태](artifacts/discovery-execution-20261001.json), [사설 입력 검증](artifacts/discovery-private-blob-sync.json), [날짜별 실행 보고서](EXECUTION-REPORT.ko.md)를 구분해 확인하세요.

## 현재 실습 환경 (2026-10-01)

[실습 리소스 그룹](https://portal.azure.com/#@46e9cdaa-fed3-4131-aa28-c1fc8a8a043a/resource/subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/rg-discovery-hol-20260930/overview), `config/lab.json`, 양 언어 가이드가 모두 **`rg-discovery-hol-20260930` / Sweden Central**을 사용합니다. 과거 `20260925` 예시는 현재 배포 대상이 아닙니다.

| 구성요소 | 현재 구성 |
|---|---|
| VNet/UAMI | `vnet-discovery-hol`(`10.80.0.0/16`), `id-discovery-hol` 재사용 |
| 서브넷 | 전용 9개: 기존 3개 보존, 실습 4개, `storagePeSubnet`, `blobClientSubnet` |
| Storage | `stdiscoveryholjunwoosc`, LRS, 공유 키·익명 Blob 비활성, 정책에 따른 공개 네트워크 비활성 |
| 사설 접근 | `pe-discovery-blob` 승인, Private DNS `10.80.8.4`, VNet link 완료 |
| Registry/Tool | Basic `acrdiscoveryholjunwoosc`, ACR task `dt1` 및 Tool `thermal-ranking` v1.0.0 성공 |
| 데이터 참조·파일 | `thermaldata`, `evidencepack`, `candidatecsv`; 후속 작업에서 TXT 4개·CSV 1개 업로드와 SHA-256 읽기 검증 완료 |
| 사설 데이터 클라이언트 | `vm-discovery-blob-client`, 공개 IP/SSH 인바운드 없음, 검증 후 할당 해제 |
| Workspace | `discoveryholjunwoosc`는 `Failed`; 관리 리소스 격리 유지, 연결 컴퓨트·사용 가능한 Project 없음 |

사용자에게 필요한 데이터 역할, UAMI에는 실습 RG·Storage·Registry·VNet·자기 ID 범위의 역할을 부여했습니다. 공식 first-party control-plane의 Reader/NSP Joiner만 문서에 따라 구독 scope입니다. 조직 정책을 해제하지 않았습니다. 실패한 배포에도 유료 리소스가 남을 수 있으므로 정리 전에 L09를 확인하세요.

## 사전 점검과 재개

새 점검은 브라우저 없이 **읽기 전용 Azure 요청**을 수행하고 토큰 없는 증거를 저장합니다. 기본 전체 점검은 Bookshelf quota 부족 시 종료 코드 `2`를 반환합니다. `--require core`는 코어의 접근·모델 quota 검사이며 배포·실습 성공 검사가 아닙니다.

```bash
npm run readiness
npm run readiness -- --require core
```

[L01](MICROSOFT-DISCOVERY-LAB.ko.md#l01)에 단계별 Bicep 미리 보기/배포, 사설 Storage, 미완료 상태를 명시한 Workspace-only 재개 경로를 추가했습니다. [L05](MICROSOFT-DISCOVERY-LAB.ko.md#l05)는 **실제 GA Tool 계약 `properties.version`**과 image digest를 사용합니다. 과거 [Workspace 요청 본문](infra/workspace-create.json)과 [3개 서브넷 템플릿](infra/main.bicep)은 과거/초기 생성용이며 확장된 환경에 무작정 재배포하지 않습니다.

[L02](MICROSOFT-DISCOVERY-LAB.ko.md#l02)는 준비된 사설 VM을 시작해 `npm run blob:sync`로 입력을 검증하고 할당 해제하는 관리자 경로를 포함합니다. [A01](MICROSOFT-DISCOVERY-LAB.ko.md#a01)은 AKS 지역 용량과 모델 TPM 증액을 구분하고, 실제 존재하는 Foundry **Discovery Default Project**에서 quota 화면으로 들어가는 방법을 설명합니다.

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
- `config/lab.json`: 현재 계정·구독·리전·RG의 명시적 범위입니다.
- `scripts/azure-readiness.mjs`: 서비스 접근과 모델 quota를 분리하고 천 단위 TPM을 정확히 처리합니다.
- `infra/`: 단계별 네트워크·역할·기반·Discovery 코어·사설 Blob·digest 고정 Tool Bicep입니다.
- `tests/`: 데이터·정답·문서 일치·범위·패키징 확인 코드입니다.

## 이전 접근 점검

[실행 보고서](EXECUTION-REPORT.ko.html)는 최신 배포와 2026-09-25의 과거 접근 시도를 구분합니다. `artifacts/azure-preflight.json`, [2026-09-30 등록 기록](artifacts/discovery-registration-followup-20260930.json), [이전 요약 영상](artifacts/watch-summary.html)은 과거 자료입니다. 영상은 **Discovery 핵심 기능의 성공 시연이 아닙니다.**

`npm run preflight`는 Azure에 실제 읽기 요청을 합니다. 등록·접근 신청·리소스 그룹 생성 플래그는 변경 작업을 수행하므로 **로컬 문서 빌드 절차에는 포함하지 않습니다**.
