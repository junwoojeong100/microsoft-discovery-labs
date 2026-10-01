# Microsoft Discovery Labs 실습 자료

[English](README.md) · **한국어**

Microsoft Discovery 실습 가이드와 Azure 아키텍처 자료입니다. **2026-10-01 실제 Azure 배포 결과**를 반영해 국문·영문의 절차와 완료 기준을 함께 개정했습니다.

## 시작하기

| 문서 | GitHub에서 읽기 | 다른 형식 |
|---|---|---|
| 핵심 기능 실습 가이드 | [가이드 읽기](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md) | [PDF](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.pdf) · [HTML](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.html) |
| Azure 아키텍처와 버전 의존성 | [아키텍처 읽기](docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md) | SVG 그림 3개와 Mermaid 원본 포함 |
| 다음 배포를 위한 주제별 참고 자료 | [참고 자료 목차](docs/deployment-reference/README.ko.md) | 현재 상태·quota·용량·리전·네트워크·재개 절차 |

실습 가이드는 **기본 실습 10개와 확장 실습 2개**로 구성됩니다. Workspace/Project, 데이터·파일, Bookshelf, 에이전트·버전, 계산 도구, Discovery Engine, 사람의 피드백, 협업·RBAC, 추적성·비용, Hybrid/MCP 도구를 다룹니다. 각 실습은 **목표 → 실행 → 완료 기준** 순서로 진행합니다.

아키텍처 문서는 API 버전, 모델 revision, SKU, 런타임 버전을 구분합니다. 공개되지 않은 내부 버전을 추정하지 않고, 서비스 간 의존성과 변경 시 영향을 설명합니다.

GitHub에서는 Markdown 또는 PDF를 선택하세요. HTML 가이드는 `docs/labs/`, 아키텍처는 `docs/architecture/`, 실행 보고서는 `docs/reports/`에 정리했습니다.

## GitHub Pages 게시

저장소 [junwoojeong100/microsoft-discovery-labs](https://github.com/junwoojeong100/microsoft-discovery-labs)는 **Public**입니다. **[GitHub Pages에서 게시된 문서 읽기](https://junwoojeong100.github.io/microsoft-discovery-labs/)**. 사용자 요청으로 공개 전환한 뒤 2026-10-02 KST에 첫 게시를 완료했으며 유료 요금제로 변경하지 않았습니다.

`npm run check:site`는 HTML 링크를 갖춘 공개용 `site/`를 생성·확인합니다. 계정 식별자는 예시로 치환하고 원본 Azure 증거·설정·인프라 소스·PDF는 **Pages 사이트에서만 제외**합니다. 저장소와 커밋 이력은 공개 상태입니다. Pages source는 **GitHub Actions**, 저장소 변수는 **`PAGES_ENABLED=true`**이며 **Publish lab documentation**이 `main`의 관련 변경을 자동 게시합니다. 수동 실행도 가능합니다.

## 실행 상태

**최신: Workspace·검증 모델·Project와 실제 합성 CPU 작업을 완료했습니다.** 새 GPT-5.4 배포 두 개는 **각 Global Standard 250,000 TPM**, 합계 **500,000 TPM**입니다. 입력 5개와 계산 결과 2개를 Korea 사설 런타임에서 저장하고 별도 성공한 Discovery 작업으로 다시 읽었습니다. [최종 실행 보고서](docs/reports/EXECUTION-REPORT.ko.md)를 확인하세요. Bookshelf quota와 별도 정책 애드온 권한 승인은 남아 있으며, 자율 연구 전체를 완료했다고 주장하지 않습니다.

**이전 컴퓨트 단계 기록, 21:32 KST:** Discovery home은 Sweden Central로 유지하고 target compute만 Korea Central로 변경했습니다. 새 Supercomputer·cpulab과 실제 Korea AKS·VMSS는 **21:28:45 KST Succeeded**였습니다. 당시 Workspace는 quota 때문에 보류했으며, 위 최신 생성 성공이 그 차단 상태를 대체합니다.

아래 오후 결과와 기존 환경 표는 이전 Sweden Central 단일 리전 실행 기록입니다. 현재 교차 리전 입력은 [기반 매개변수](infra/cross-region-foundation.bicepparam), [Discovery 매개변수](infra/discovery-core.koreacentral.bicepparam), [재개 절차](docs/deployment-reference/06-resume-runbook.ko.md)를 사용합니다. **기존 RG 전체를 삭제하면 새 Korea 리소스도 삭제됩니다.**

**2026-10-01 오후, 중앙 진단 설정 오류는 해결했지만 전체 실습은 미완료입니다.** 서비스 활성화와 네트워크 feature 등록 후 진행한 코어 재시도는 **16:14:43에 최종 Failed**로 끝났습니다. 16:21 조회에서도 Workspace·Supercomputer가 모두 Failed였으며, 새 하위 AKS의 `AKSCapacityHeavyUsage`가 확인됐습니다.

**남은 핵심 블로커는 지역 서비스 용량과 Bookshelf 운영 quota입니다.** 중앙 로그 복구 후에도 gpt-5-mini·임베딩 잔여량은 **990,000 / 780,000 TPM**이며, 각 총 3,000,000 TPM 신청은 아직 한도에 반영되지 않았습니다. 기존 조직 정책을 범위 제한해 실행한 중앙 RG·Log Analytics·Discovery 진단 설정 복구 3건은 모두 성공했습니다. 실제 로그 유입, 노트북의 직접 Blob 경로, **종단간 연구 실행은 미검증**입니다. [코어 최종 상태](artifacts/discovery-resume-snapshot-20261001-1621.json), [중앙 진단 복구 증거](artifacts/discovery-governance-recovery-20261001.json), [실행 보고서](docs/reports/EXECUTION-REPORT.ko.md)를 확인하세요.

## 현재 실습 환경 (2026-10-01)

[실습 리소스 그룹](https://portal.azure.com/#@46e9cdaa-fed3-4131-aa28-c1fc8a8a043a/resource/subscriptions/51531604-2337-4c05-bc05-3c3d4ff154e5/resourceGroups/rg-discovery-hol-20260930/overview)은 **`rg-discovery-hol-20260930` / Sweden Central**을 유지합니다. `config/lab.json`의 `location`은 home, `targetComputeLocation=koreacentral`은 신규 런타임 영역입니다. 아래 표는 보존한 기존 환경이며 과거 `20260925` 예시는 현재 배포 대상이 아닙니다.

| 구성요소 | 현재 구성 |
|---|---|
| VNet/UAMI | `vnet-discovery-hol`(`10.80.0.0/16`), `id-discovery-hol` 재사용 |
| 서브넷 | 전용 9개: 기존 3개 보존, 실습 4개, `storagePeSubnet`, `blobClientSubnet` |
| Storage | `stdiscoveryholjunwoosc`, LRS, 공유 키·익명 Blob 비활성, 정책에 따른 공개 네트워크 비활성 |
| 사설 접근 | `pe-discovery-blob` 승인, Private DNS `10.80.8.4`, VNet link 완료 |
| Registry/Tool | Basic `acrdiscoveryholjunwoosc`, ACR task `dt1` 및 Tool `thermal-ranking` v1.0.0 성공 |
| 데이터 참조·파일 | `thermaldata`, `evidencepack`, `candidatecsv`; 후속 작업에서 TXT 4개·CSV 1개 업로드와 SHA-256 읽기 검증 완료 |
| 사설 데이터 클라이언트 | `vm-discovery-blob-client`, 공개 IP/SSH 인바운드 없음, 검증 후 할당 해제 |
| 네트워크 feature | `AllowBringYourOwnPublicIpAddress` 및 `Microsoft.Network` 모두 Registered |
| Supercomputer / 배포 | `sc-discovery-hol` Failed / 오후 코어 배포 최종 Failed; 하위 AKS 용량 실패 |
| Workspace | `discoveryholjunwoosc`는 `Failed`; 관리 리소스 격리 유지, 연결 컴퓨트·사용 가능한 Project 없음 |
| 중앙 진단 | `McapsGovernance/mcaps4c05bc053c3d4ff154e5-la` 연결 완료, 해당 계정의 진단 정책 Compliant. 정책 기본 West US 2, 종량제, 보존 30일 |

사용자에게 필요한 데이터 역할, UAMI에는 실습 RG·Storage·Registry·VNet·자기 ID 범위의 역할을 부여했습니다. 공식 first-party control-plane의 Reader/NSP Joiner만 문서에 따라 구독 scope입니다. 조직 정책을 해제하지 않았습니다. 실패한 배포에도 유료 리소스가 남을 수 있으므로 정리 전에 L09를 확인하세요.

## 사전 점검과 재개

새 점검은 브라우저 없이 **읽기 전용 Azure 요청**을 수행하고 토큰 없는 증거를 저장합니다. 기본 전체 점검은 Bookshelf quota 부족 시 종료 코드 `2`를 반환합니다. `--require core`는 코어의 접근·모델 quota 검사이며 배포·실습 성공 검사가 아닙니다.

모델 quota는 `targetComputeLocation`에서 확인하며, 이 필드가 없는 기존 단일 리전 설정만 `location`을 사용합니다. 현재 core 검사도 신규 GPT-5.4 할당 부족으로 차단될 수 있습니다. 모델을 생성하지 않는 Supercomputer 단계와 구분합니다.

```bash
npm run readiness
npm run readiness -- --require core
```

[L01](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md#l01)에 단계별 Bicep 미리 보기/배포, 사설 Storage, 미완료 상태를 명시한 Workspace-only 재개 경로를 추가했습니다. [L05](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md#l05)는 **실제 GA Tool 계약 `properties.version`**과 image digest를 사용합니다. 과거 [Workspace 요청 본문](infra/workspace-create.json)과 [3개 서브넷 템플릿](infra/main.bicep)은 과거/초기 생성용이며 확장된 환경에 무작정 재배포하지 않습니다.

[L02](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md#l02)는 준비된 사설 VM을 시작해 `npm run blob:sync`로 입력을 검증하고 할당 해제하는 관리자 경로를 포함합니다. [A01](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md#a01)은 AKS 지역 용량과 모델 TPM 증액을 구분하고, 실제 존재하는 Foundry **Discovery Default Project**에서 quota 화면으로 들어가는 방법을 설명합니다.

## 로컬 빌드

```bash
npm ci
npm run build:guide
npm test
npm run check:guides
npm run build:architecture
npm run check:site
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
- `docs/labs/`, `docs/architecture/`, `docs/reports/`: 정리한 가이드·아키텍처·실행 보고서입니다.
- `scripts/run-discovery-tool.mjs`: 실제 Discovery 도구 실행과 별도 사설 파일 재조회. `npm run tool:run`은 Azure 변경 작업입니다.
- `scripts/build-site.mjs`: 원본 `artifacts/`와 인증 정보를 제외한 공개용 사이트 빌드입니다.
- `tests/`: 데이터·정답·문서 일치·범위·패키징 확인 코드입니다.

## 이전 접근 점검

[실행 보고서](docs/reports/EXECUTION-REPORT.ko.html)는 최신 배포와 2026-09-25의 과거 접근 시도를 구분합니다. `artifacts/azure-preflight.json`, [2026-09-30 등록 기록](artifacts/discovery-registration-followup-20260930.json), [이전 요약 영상](artifacts/watch-summary.html)은 과거 자료입니다. 영상은 **Discovery 핵심 기능의 성공 시연이 아닙니다.**

`npm run preflight`는 Azure에 실제 읽기 요청을 합니다. 등록·접근 신청·리소스 그룹 생성 플래그는 변경 작업을 수행하므로 **로컬 문서 빌드 절차에는 포함하지 않습니다**.
