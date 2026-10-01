# 04 — 아키텍처·지원 리전·데이터 위치

[목차](README.ko.md) · **기준일: 2026-10-01 문서·구독 메타데이터 확인. 실제 배포 성공과는 별개다.**

## 논리 구조

```text
Discovery Studio / API / CLI
  └─ Workspace / Project / Discovery Engine
      ├─ Foundry Agent Service + 모델 배포
      ├─ Bookshelf
      │   ├─ AI Search: 문서 추출 / enrichment
      │   ├─ Supercomputer + 임베딩 모델: 색인 작업
      │   ├─ Azure SQL Database: 지식 그래프 / 벡터 KB
      │   └─ Container Apps + 모델: 검색 실행 / 응답
      ├─ Supercomputer → AKS → VM/VMSS 노드 풀
      │   └─ ACR 이미지의 Tool 실행
      ├─ Cosmos DB: Workspace / Project 관리형 상태
      └─ Storage Container / Asset → Blob Storage의 실제 파일
```

화살표는 논리적 의존 관계이며 실제 호출 순서나 모든 배포의 자원 개수를 확정하지 않는다. `Storage Container/Asset`은 참조 리소스이며 실제 파일을 자동 복사하는 저장소가 아니다.

상세 그림은 [기존 아키텍처 문서](../architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.ko.md)를 참고한다.

## 구성 서비스와 지역 제약

| 구성요소 | 역할 | 한국 중부 관련 판단 |
|---|---|---|
| Microsoft Discovery | Workspace/Project/Engine, Bookshelf, Supercomputer 등 제품 계층 | 한국 중부는 home 리전이 아님. 공식 교차 리전 절차의 target compute로 사용 |
| Foundry / Azure OpenAI | 에이전트·cognition·검증·Bookshelf 모델 | Foundry 프로젝트와 Agent Service는 한국 중부 지원. 모델/버전/도구/배포 유형은 별도 확인 |
| Container Apps | Workspace/agent 환경, Bookshelf 검색 | 기반 서비스 자체는 한국 중부 지원. E 계열 메모리 프로파일은 지원 ACA 리전에서 제공되지만 실제 용량은 별도 |
| AKS, VM, VMSS | 시스템·도구·색인 노드 | 기반 서비스 자체는 한국 중부 지원. SKU/zone/quota/실제 할당 가능성은 별도 |
| Cosmos DB | Workspace/Project 관련 관리형 저장 | 기반 서비스는 한국 중부 지원. Discovery가 만든 DB 위치를 임의로 변경하는 것은 다른 문제 |
| AI Search / SQL DB | 문서 처리 / 그래프·벡터 KB | 기본 서비스는 한국 중부 지원. Hyperscale/zone redundancy 등 세부 구성은 추가 확인 |
| Blob Storage | 원본·입력·출력 파일 | 한국 중부 StorageV2 SKU 목록에서 Standard LRS/ZRS/GRS/GZRS 등을 확인 |
| ACR | 커스텀 도구 이미지 | 한국 중부 지원 |
| Azure NetApp Files | 선택적 HPC 파일 저장 | 기본 계정 리소스는 한국 중부 지원. volume/SKU/용량 조건은 별도 |
| Entra ID/RBAC/관리 ID | 인증과 권한 | 전역/디렉터리 서비스와 리전 관리 ID가 혼합됨 |
| VNet/NSP/Private Link/DNS | 데이터·관리 자원 네트워크 보호 | 일반 Azure 지원과 Discovery 전용 제약을 구분 |
| Key Vault/DES/Log Analytics | 키, 선택적 CMK, 로그·진단 | 기본 서비스와 전용 cluster/CMK 구성의 조건을 구분 |

Provider 등록 목록이 곧 실제 배포 BOM은 아니다. 예를 들어 `Microsoft.Web`이나 `Microsoft.MachineLearningServices`가 선행 등록됐다는 이유만으로 모든 배포에 해당 인스턴스가 있다고 쓰지 않는다.

## Discovery의 공식 운영 리전

| 리전 | 코드 |
|---|---|
| East US | `eastus` |
| Sweden Central | `swedencentral` |
| UK South | `uksouth` |

당시 구독의 `Microsoft.Discovery` 메타데이터는 **East US 2도 표시**했다. 그러나 공식 known-issues 문서는 지원하지 않는 지역이 포털/템플릿에 표시될 수 있음을 경고하고 위 세 곳을 운영 지원 리전으로 안내한다. **목록에 표시되는 것만으로 전체 스택 지원·배포 성공을 보장하지 않는다.**

이 목록은 Discovery **home/control plane**의 위치다. 일반 AKS·Storage 가용성만으로 Discovery home을 한국 중부로 바꿀 수는 없지만, 공식 교차 리전 배포는 home을 지원 리전에 유지하고 런타임을 별도 target으로 배치한다. target에서도 실제 용량·모델 quota·정책을 확인해야 한다.

## Sweden Central home / Korea Central target

[공식 교차 리전 배포](https://learn.microsoft.com/azure/microsoft-discovery/how-to-deploy-across-regions)에 따라 현재 구성은 다음과 같이 분리한다.

| 대상 | 배치 |
|---|---|
| Discovery Workspace·Supercomputer·Bookshelf·Project·Tool·Storage Container | **Sweden Central** |
| Discovery가 소유한 관리 리소스 그룹(MRG) 메타데이터 | **Sweden Central** |
| MRG 내부의 AKS·Foundry·런타임·저장소 등 지역 자원 | **Korea Central** |
| 새 고객 VNet·서브넷·관리 ID·Storage·ACR·Private Endpoint | **Korea Central** |
| 기존 조직 공통 진단 목적지 | 기존 정책의 **West US 2** 유지 |

`config/lab.json.location=swedencentral`을 유지하며 `targetComputeLocation=koreacentral`을 추가했다. 새 Workspace·Supercomputer에는 **생성 시** `discovery.overridemrgregion=koreacentral`을 적용한다. 이 구독은 ARM에서 `Internal_2014-09-01`로 확인돼 Microsoft 소유 구독용 `SkipAssociateKeyVaultToNsp=true`도 적용한다. 이 태그를 일반 고객 구독에 무조건 복사하지 않는다. 기존 Discovery 자원의 태그를 수정하는 방식은 리전 이동 절차가 아니다.

Korea Central은 공식 Foundry 프로젝트 지원 리전이다. 실제 새 컴퓨트 MRG `mrg-dscmp-sc-discovery-hol-kc-a13wxu`는 Sweden Central에 있고, 그 안의 AKS·NSP·Log Analytics·수집 규칙은 Korea Central에서 관측됐다. **MRG 위치만 보고 런타임이 Sweden Central이라고 판단하거나 삭제하면 안 된다.** 프로비저닝 성공 여부는 별도로 [실행 보고서](../reports/EXECUTION-REPORT.ko.md)에서 확인한다.

## 한국 중부 저장과 국내 처리를 구분하기

Azure의 **한국 중부(Korea Central, `koreacentral`)는 서울**, **한국 남부(Korea South, `koreasouth`)는 부산**이다.

| 목적 | 판단 |
|---|---|
| 한국 중부에 독립적인 Blob 원본/보관본 저장 | 지원 |
| Korea Central 리전 내부 복제 | LRS/ZRS 기준으로 검토 |
| GRS/GZRS 지리적 복제 | 보조 리전도 확인. 한국 중부의 짝 리전은 한국 남부 |
| Discovery home까지 한국 중부에 배포 | 현재 공식 home 지원 범위 밖 |
| 지원 home + Korea Central target의 고객 저장소·런타임 | 공식 교차 리전 절차 사용. 실제 연결·quota·동작 검증은 별도 |
| 원본은 한국에 두고 허용된 부분만 해외 작업 저장소로 복사 | 설계 검토 가능하나 국외 데이터 복사·처리가 발생 |

**기존 파일은 Sweden Central 저장소에 보존했다.** 새 `stdiscoveryholjunwookc`는 Korea Central에 생성했지만, 저장소 생성이 기존 Blob·Tool 이미지의 복사를 뜻하지는 않는다.

**중앙 진단의 별도 위치:** 16시대 복구에서 기존 조직 정책이 지정한 **West US 2**에 `McapsGovernance/mcaps4c05bc053c3d4ff154e5-la`를 생성하고 Discovery 관리 Foundry 계정의 진단 로그·메트릭을 보내도록 구성했다. 이는 Discovery 작업 스택의 리전 변경이나 West US 2의 Discovery 제품 지원을 뜻하지 않는다. 하지만 진단 데이터까지 모두 Sweden Central에만 머문다는 보장도 할 수 없다. 실제 로그 유입 확인과 과거 누락분 복구는 별도이며, [검증한 구성](../../artifacts/discovery-governance-recovery-20261001.json)을 참고한다.

공식 표준 구성을 사용하면 선택한 지원 리전에 운영·작업용 데이터가 생성되는 것을 전제로 한다. 모든 원본을 영구 이전해야 한다는 뜻은 아니지만, 그래프·벡터·문서 조각·작업 상태·결과까지 한국에만 머문다고 보장할 수 없다.

## 네트워크와 데이터 레지던시의 차이

- 일반 Azure Private Link에는 교차 리전 연결 기능이 있다. 이것만으로 Discovery의 모든 교차 리전 구성이 지원된다고 추론하지 않는다.
- 단일 리전 네트워크 안내의 같은 리전 조건과 공식 교차 리전 절차를 구분한다. 새 고객·관리 런타임용 Private Endpoint는 target에 배치하되, Discovery API 진입점의 별도 네트워크 조건까지 자동 충족했다고 주장하지 않는다.
- Foundry Agent Service 자체의 다른 리전 데이터 연결 지원도 Discovery 제품의 관리형 배포 계약과 동일하지 않다.
- **Private Link는 사설 연결이지 국내 처리 보장이 아니다.**
- 현재 요청한 **Global Standard** 모델의 추론은 다른 Azure 리전에서 처리될 수 있다.
- Data Zone APAC도 한국 한 나라에 고정된 처리가 아니다. Standard/Regional Provisioned는 지원되는 모델에 대해 Azure geography를 기준으로 하므로 특정 서울 리전 고정과도 구분한다.

따라서 **원본·파생 데이터·추론을 모두 국내로 제한해야 한다면 현재 Discovery 기본 구성으로 그 요건을 충족한다고 보장할 수 없다.** 조직의 허용 범위와 서비스별 저장·처리·백업 위치를 먼저 결정한다.

## 근거

- [Discovery 아키텍처](https://learn.microsoft.com/azure/microsoft-discovery/overview-service-architecture)
- [Discovery 교차 리전 배포](https://learn.microsoft.com/azure/microsoft-discovery/how-to-deploy-across-regions)
- [지원 리전 관련 known issue](https://learn.microsoft.com/azure/microsoft-discovery/known-issues)
- [Discovery Storage 구성](https://learn.microsoft.com/azure/microsoft-discovery/concept-storage-account)
- [Discovery 네트워크 제한](https://learn.microsoft.com/azure/microsoft-discovery/concept-network-security)
- [Azure 리전 목록](https://learn.microsoft.com/azure/reliability/regions-list), [Storage 복제](https://learn.microsoft.com/azure/storage/common/storage-redundancy)
- [Foundry 지역 지원](https://learn.microsoft.com/azure/foundry/reference/region-support), [모델 처리 위치](https://learn.microsoft.com/azure/foundry/foundry-models/concepts/deployment-types)
- [일반 Private Link의 global reach](https://learn.microsoft.com/azure/private-link/private-link-overview)
