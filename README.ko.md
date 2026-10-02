# Microsoft Discovery Labs 실습 자료

[English](README.md) · **한국어**

고객·파트너가 자신의 Azure 환경에서 Microsoft Discovery를 구성하고, **근거 검색 → 실제 계산 → 결과 검토 → 조건 변경**을 실습하기 위한 자료입니다.

> **검증 중인 학습 자료입니다.** 전체 연구 흐름의 검증이 끝난 배포 패키지는 아닙니다. 각 Lab의 시작 조건을 확인하고, 실제 결과가 완료 기준을 만족했을 때 다음 단계로 진행하세요. 특정 환경의 성공·실패 기록은 아래 설치·운영 참고 자료에서 따로 다룹니다.

## 1. 고객·파트너: 실습 시작하기

| 목적 | 먼저 읽을 문서 | 다음 단계 |
|---|---|---|
| 처음부터 환경 구성 | [실습 가이드](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md) | S00에서 범위 확인 → L00의 환경값·권한·비용 준비 → L01–L03 |
| 준비된 환경에서 연구 실습 | [연구자 시작 체크](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md#s00) | 관리자에게 H01–H06을 받아 확인 → L04–L07 → L09 |
| Azure 구성요소와 의존성 이해 | [아키텍처](docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md) | 전체 구조·Bookshelf 그림부터 확인 |

**읽기 형식:** [게시된 HTML](https://junwoojeong100.github.io/microsoft-discovery-labs/docs/labs/MICROSOFT-DISCOVERY-LAB.ko.html) · [PDF](docs/labs/MICROSOFT-DISCOVERY-LAB.ko.pdf) · [GitHub Pages 시작 페이지](https://junwoojeong100.github.io/microsoft-discovery-labs/).

가이드는 L00–L09의 기본 실습 10개와 E01–E02의 확장 실습 2개로 구성됩니다. L08 협업 검증에는 별도 사용자가 필요합니다. 각 실습은 **목표 → 시작 조건 → 실행 → 완료 기준**을 따릅니다. Azure 없이 자료와 계산 기준만 보려면 S02와 L05의 로컬 계산 단계만 사용하세요.

## 2. 설치·운영 담당자: 실제 사례 참고하기

**공통 실습 절차와 특정 환경의 설치 기록을 구분합니다.** 아래 문서는 실제로 시도한 일, 성공·실패한 범위, 남은 작업을 조사하는 참고 자료입니다. 다른 환경에서는 원인과 확인 방법을 참고하되, 리소스 이름·ID·승인 내역을 그대로 사용하지 마세요.

| 알고 싶은 것 | 읽을 문서 |
|---|---|
| 진행 현황과 남은 작업 | [현재 상태·남은 작업](docs/deployment-reference/01-current-state.ko.md) |
| 현재 남아 있는 리소스 | [리소스 그룹·자원 목록](docs/deployment-reference/07-resource-inventory.ko.md) |
| 시도 순서와 배운 점 | [실제 실행 이력](docs/reports/EXECUTION-REPORT.ko.md) |
| 원인을 조사하거나 작업을 재개하려면 | [설치·운영 참고 자료 목차](docs/deployment-reference/README.ko.md) |

고객 실습을 진행할 때 이 기록을 읽어야 할 필요는 없습니다. 문제가 생겼을 때 해당 원인과 근거를 찾아보는 별도 경로입니다.

## 실행 전 주의사항

**환경별 설정을 그대로 실행하지 마세요.** 신규 환경은 가이드 L00에서 계정·테넌트·구독·이름·리전·네트워크를 먼저 정합니다. 쉘 변수를 설정해도 `config/lab.json`, Bicep 기본값, `.bicepparam`, 스크립트 내부 값이 자동 변경되지는 않습니다.

문서·데이터의 로컬 검사는 Azure를 변경하지 않습니다. 반면 Azure 실행 스크립트는 권한·리소스·과금에 영향을 줄 수 있으므로 [운영 명령의 경계](docs/deployment-reference/README.ko.md#operator-commands)를 먼저 확인하세요.

서비스 사용 승인, RBAC, 모델 quota, 지역 용량, 사설 연결은 별도 조건입니다. 모델 quota 부족을 다른 프로젝트의 배포 삭제로 해결하거나, 네트워크 오류를 조직 정책 해제로 우회하지 않습니다. 실패한 배포도 비용을 남길 수 있으므로 부분 진행 후에도 L09를 확인하세요.

## 로컬 문서 빌드

문서 기여자용 절차입니다. Node.js 22 이상과 Python 3이 필요하며, 브라우저·PDF·아키텍처 그림 확인에는 설치된 Google Chrome이 필요합니다.

```bash
npm ci
npm run check:guides
npm run build:architecture
npm test
npm run check:site
```

`check:guides`는 국문·영문 HTML을 빌드하고 링크·레이아웃·언어 전환을 검사한 뒤 PDF를 생성합니다. 문서는 Markdown, 그림은 Mermaid와 영문 SVG가 편집 원본입니다. HTML·PDF와 파생 그림은 빌드로 갱신하며 검사 화면·로그는 재생성 가능한 로컬 출력입니다. 이 절차는 Azure 환경을 구성하거나 실습 성공을 검증하지 않습니다.

한국어 문서의 설명문은 실습 가이드와 같은 **`입니다`·`합니다`체**로 작성합니다. 코드·명령·리소스 이름·원문 인용은 문체 통일을 위해 변경하지 않습니다.

## 문서와 파일의 역할

| 위치 | 용도 |
|---|---|
| `docs/labs/` | 고객·파트너용 공통 실습 절차와 완료 기준, 국문·영문 |
| `docs/architecture/`, `assets/` | 공식 문서 기반 참조 구조와 그림. 실제 배포 목록과 구분 |
| `docs/deployment-reference/`, `docs/reports/` | 특정 환경의 설치 시도·진행 현황·문제 해결·남은 작업, 한국어 |
| `artifacts/` | 날짜가 있는 실행 근거와 역사적 매체. 고객 실습 절차나 현재 상태의 자동 판정값이 아님 |
| `data/`, `scripts/score_materials.py`, `scripts/verify_ranking.py` | 합성 입력, 로컬 기준 계산, 실제 출력의 내용 검사. 내용 검사는 실행 위치를 증명하지 않음 |
| `tools/thermal-ranking/` | CPU Action 도구 예제 |
| `config/`, `infra/`, Azure 실행 스크립트 | 환경별 검토·수정이 필요한 운영 입력. 완성된 범용 설치 도구가 아님 |
| `tests/` | 데이터·문서 일치·명령·링크·패키징 검사 |

## GitHub Pages 게시

**저장소와 커밋 이력은 공개 상태입니다.** Pages에는 정리된 문서만 게시하며 계정 식별자는 예시로 치환합니다. 원본 Azure 증거·설정·인프라 소스·PDF는 **Pages 사이트에서만 제외**되므로 필요한 소스는 이 저장소에서 확인하세요. 식별자 치환은 명령을 자신의 환경에 맞게 설정하는 과정을 대신하지 않습니다.

`npm run check:site`로 공개용 `site/`를 생성·확인합니다. Pages source는 GitHub Actions이며, 저장소 변수 `PAGES_ENABLED=true`일 때 **Publish lab documentation**이 `main`의 관련 변경을 게시합니다. 로컬 문서 수정·빌드만으로 게시 내용이 바뀌지는 않습니다.
