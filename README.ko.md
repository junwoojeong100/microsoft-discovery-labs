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

제공 데이터는 합성 데이터입니다. 로컬 계산과 문서 확인은 **Azure 실행 증거가 아닙니다**. 대상 계정에서 Discovery의 전체 실습을 완료하지 않았으며, Azure 배포와 실제 기능 실행 영상은 보류된 상태입니다.

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
- `tests/`: 데이터·정답·문서 일치·범위·패키징 확인 코드입니다.

## 이전 접근 점검

[실행 보고서](EXECUTION-REPORT.ko.html), `artifacts/azure-preflight.json`, [이전 요약 영상](artifacts/watch-summary.html)은 이전의 Azure 접근 점검 기록입니다. **Discovery 핵심 기능의 성공 시연이나 현재 가이드의 실습 완료 증거가 아닙니다.**

`npm run preflight`는 Azure에 실제 읽기 요청을 합니다. 등록·접근 신청·리소스 그룹 생성 플래그는 변경 작업을 수행하므로 **로컬 문서 빌드 절차에는 포함하지 않습니다**.
