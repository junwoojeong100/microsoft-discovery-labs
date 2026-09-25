# Microsoft Discovery hands-on guides / 실습 가이드

**2026-09-25 기준, 국문·영문에 동일한 Lab ID·데이터·정답 기준을 적용한 가이드입니다.** 10개 기본 Lab과 2개 확장 Lab이 Workspace/Project, 데이터·파일, Bookshelf, 에이전트·버전, 실제 계산 도구, Discovery Engine, 사람의 피드백, 협업·RBAC, 추적성·비용, Hybrid/MCP 확장을 다룹니다.

**Both editions share the same lab IDs, data, expected results, and official sources.** Follow Goal → Steps → Pass criteria. The guides distinguish cloud GA from Preview extensions, documented behavior from unresolved documentation conflicts, and local reference calculations from actual Azure execution.

| Language | Read | Source |
|---|---|---|
| 한국어 | [HTML](MICROSOFT-DISCOVERY-LAB.ko.html) · [PDF](MICROSOFT-DISCOVERY-LAB.ko.pdf) | [Markdown](MICROSOFT-DISCOVERY-LAB.ko.md) |
| English | [HTML](MICROSOFT-DISCOVERY-LAB.en.html) · [PDF](MICROSOFT-DISCOVERY-LAB.en.pdf) | [Markdown](MICROSOFT-DISCOVERY-LAB.en.md) |

현재 요청은 **가이드만 개정**하는 범위입니다. Azure 배포·실제 실행 영상은 보류되어 있으며, 이 계정에서 클라우드 종단간 검증을 완료했다는 주장은 하지 않습니다.

This revision is **guide-only**. Azure deployment and actual feature-execution recording are paused; end-to-end execution in this account is not claimed.

## Azure architecture / Azure 기반 아키텍처

가이드 재점검을 마친 뒤 추가한 별도 문서입니다. 실제 구독 인벤토리가 아닌 공식 문서 기반 구조이며, 서비스·모델 revision·API·SKU·런타임 버전과 미확인 값을 구분합니다.

These separate pages were added after the guide review. They distinguish documented service dependencies, API/model/SKU/runtime versions, deployment-specific unknowns, and cross-service change impacts.

| Language | Architecture and dependency page |
|---|---|
| 한국어 | [Markdown](MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md) |
| English | [Markdown](MICROSOFT-DISCOVERY-ARCHITECTURE.en.md) |

각 문서에는 전체 구조, Bookshelf 색인/검색, 조건부 네트워크·CMK의 그림 3개와 Mermaid 원본이 있습니다. / Each page includes three rendered diagrams and their Mermaid source.

## Local build / 로컬 빌드

```bash
npm ci
npm run build:guide
npm test
npm run check:guides
npm run build:architecture
```

`build:guide`는 HTML·국문/영문 그림을 생성합니다. `check:guides`는 설치된 **Google Chrome**의 headless 모드로 링크·레이아웃·언어 전환을 확인하고, 책갈피가 있으며 작성 PC의 로컬 파일 링크가 없는 PDF를 생성합니다. 이 명령들은 Azure를 호출하거나 변경하지 않습니다.

`build:guide` generates HTML and localized diagrams. `check:guides` uses an installed **Google Chrome** in headless mode to verify links, layout, and language switching and to export bookmarked PDFs without machine-specific local file links. These commands do not call or modify Azure.

`build:architecture`는 로컬 Mermaid 렌더러로 6개의 SVG를 생성·검증합니다. Mermaid는 문서 작성 도구의 의존성이며 Microsoft Discovery 제품의 의존성이 아닙니다.

`build:architecture` locally parses/renders the six architecture SVGs. Mermaid is a documentation-tool dependency, not a Microsoft Discovery product dependency.

## Files / 파일

- `data/`: Original synthetic TXT/CSV inputs; no real research data.
- `scripts/score_materials.py`: Deterministic local reference calculator; not proof of cloud execution.
- `scripts/verify_ranking.py`: Checks every field of the downloaded raw result with `--case baseline` or `--case cost3`; deliberately reports `execution_verified: false`.
- `tools/thermal-ranking/`: Action-only CPU tool template. E01 explains a separate Hybrid variant without changing the baseline.
- `config/lab.json`: Account/subscription scope for the original environment.
- `tests/`: Data, expected-result, guide-parity, scope, and packaging checks.

## Earlier access attempt / 이전 접근 점검

The [Korean execution report](EXECUTION-REPORT.ko.html), `artifacts/azure-preflight.json`, and the [earlier summary recording](artifacts/watch-summary.html) describe the earlier access attempt. They are **not a successful Discovery feature demo or validation of this revised guide**.

이전 기록은 Provider 등록 및 사용 승인 대기와 접근 점검을 담습니다. 현재 가이드의 실습 완료 영상으로 취급하지 않습니다. `npm run preflight`는 Azure에 실제 읽기 요청을 하며, 등록·접근 신청·RG 생성 플래그는 변경 작업을 하므로 **로컬 가이드 빌드 절차에는 포함하지 않습니다**.
