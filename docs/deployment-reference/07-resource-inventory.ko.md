# 07 — 현재 리소스 그룹과 리소스 목록

[목차](README.ko.md) · [상태·블로커](01-current-state.ko.md) · **조회 기준: 2026-10-02 21:21 KST**

> 작성자 환경의 현재 Azure 자원 목록이다. 신규 고객의 기본 구성이나 삭제 승인 목록이 아니다. 자동 갱신되지 않는 시각 고정 스냅샷이며, 원본 응답·연락처·자격증명은 이 문서에 포함하지 않았다.

## 먼저 볼 결론

- **Home은 Sweden Central, Target compute는 Korea Central**이다. 리소스 그룹의 위치만으로 내부 실행 위치나 삭제 가능 여부를 판단하지 않는다.

- 관련 **리소스 그룹 8개**, 관리 API/Resource Graph 기준 **리소스 95개**가 남아 있다. 이 중 94개는 Discovery 범위, 1개는 조직 공통 Log Analytics다. 실제 Foundry 모델 배포 2개는 아래 별도 표로 구분한다.

- 공용 랩 RG에 남은 Sweden 자원 **21개는 Home 제어·소유 관계 객체**다. 현재 Korea 경로용 13개와 요청에 따라 남긴 과거 Home 8개로 나뉜다.

- 이전 Sweden 실행 자원은 정리됐고 이전 관리 RG 두 개는 비어 있다. Home 객체·관리 RG·MOBO Broker·Korea 자원·공유 DNS·조직 로그는 보존했다.

- Bookshelf, `thermal-evidence` KB와 색인 전용 풀 `indexlab`은 이 실습에 아직 구성되지 않았다. 이 목록은 KB 기반 에이전트·Engine 종단간 실습의 완료 선언이 아니다.

<a id="group-overview"></a>
## 리소스 그룹 전체 보기

| 리소스 그룹 | 그룹 위치 | ARM 자원 수 | 역할 / 보존 이유 |
| --- | --- | --- | --- |
| `rg-discovery-hol-20260930` | Sweden Central | 30 | 공용 랩 RG. Home 제어 객체, Korea 고객 관리 자원, 공유 DNS가 함께 있음 |
| `mrg-dwsp-discoveryholjunwookc-bdnxfq` | Sweden Central | 53 | 현재 Workspace의 관리 RG. 그룹은 Home, 내부 실행 자원은 Korea |
| `mrg-dscmp-sc-discovery-hol-kc-a13wxu` | Sweden Central | 4 | 현재 Supercomputer의 관리 RG. 그룹은 Home, 내부 AKS·로그는 Korea |
| `MC_mrg-dscmp-sc-discovery-hol-kc-a13wxu_aks-dscmp-a13wxu_koreacentral` | Korea Central | 6 | Korea AKS가 관리하는 노드·네트워크 인프라 |
| `ME_mrg-dwsp-discoveryholjunwookc-bdnxfq_mrg-dwsp-discoveryholjunwookc-bdnxfq_koreacentral` | Korea Central | 1 | Korea Container Apps 환경이 관리하는 실행 인프라 |
| `mrg-dwsp-discoveryholjunwoosc-ym5ffv` | Sweden Central | 0 | 이전 Home Workspace가 소유하는 빈 관리 RG. 보존 |
| `mrg-dscmp-sc-discovery-hol-b6wiwf` | Sweden Central | 0 | 이전 Home Supercomputer가 소유하는 빈 관리 RG. 보존 |
| `McapsGovernance` | West US 2 | 1 | 조직 공통 로그. Discovery 전용 자원이 아니므로 별도 보존 |

**구분 주의:** 관리 RG와 같은 이름의 Container Apps 환경이 있을 수 있다. RG는 Home의 컨테이너이고, `Microsoft.App/managedEnvironments`는 Korea에서 실행되는 별도 자원이다. `Global`인 DNS 자원도 연결 대상과 소유 관계로 구분한다.

<a id="home-resources"></a>
## 1. 공용 랩 RG: `rg-discovery-hol-20260930`

### 1-1. 현재 Korea 실행 경로를 관리하는 Home — 13개

아래 자원은 Sweden에 표시되지만 현재 Korea 구성에 필요하다. 예를 들어 Discovery Supercomputer는 제어 객체이고, 실제 계산은 뒤의 Korea AKS/VMSS에서 수행된다.

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `thermaldata-kc` | Discovery Storage Container | Sweden Central | 실제 Blob 계정을 가리키는 Home 측 저장소 참조 | Succeeded |
| `thermaldata-kc/candidatecsv` | Discovery Storage Asset | Sweden Central | 입력·출력 파일 경로를 나타내는 Home 메타데이터 | Succeeded |
| `thermaldata-kc/evidencepack` | Discovery Storage Asset | Sweden Central | 입력·출력 파일 경로를 나타내는 Home 메타데이터 | Succeeded |
| `thermaldata-kc/labinputs` | Discovery Storage Asset | Sweden Central | 입력·출력 파일 경로를 나타내는 Home 메타데이터 | Succeeded |
| `thermaldata-kc/runoutputs` | Discovery Storage Asset | Sweden Central | 입력·출력 파일 경로를 나타내는 Home 메타데이터 | Succeeded |
| `sc-discovery-hol-kc` | Discovery Supercomputer | Sweden Central | 실제 AKS와 노드 풀을 관리하는 Home 제어 객체 | Succeeded |
| `sc-discovery-hol-kc/cpulab` | Discovery Node pool | Sweden Central | CPU 작업 풀의 Home 측 정의. 실제 VMSS와는 다른 리소스 | Succeeded |
| `thermal-ranking-kc` | Discovery Tool | Sweden Central | 컨테이너 이미지와 실행 동작을 정의하는 Home 메타데이터 | Succeeded |
| `discoveryholjunwookc` | Discovery Workspace | Sweden Central | 연구 환경의 Home 제어 객체. 실행 서비스는 별도의 관리 RG에 배치 | Succeeded |
| `discoveryholjunwookc/gpt-5-4` | Discovery 모델 참조 | Sweden Central | 에이전트·검증에서 사용할 모델 배포의 Home 측 정의 | Succeeded |
| `discoveryholjunwookc/thermalhol` | Discovery Project | Sweden Central | 실습·권한·작업을 구분하는 프로젝트 경계 | Succeeded |
| `mobr-dscmp-sc-discovery-hol-kc-a13wxu` | MOBO Broker | Sweden Central | Discovery가 관리 자원을 소유·운영하기 위한 관계 객체. 개별 삭제하지 않음 | Succeeded |
| `mobr-dwsp-discoveryholjunwookc-bdnxfq` | MOBO Broker | Sweden Central | Discovery가 관리 자원을 소유·운영하기 위한 관계 객체. 개별 삭제하지 않음 | Succeeded |

### 1-2. 과거 Home 메타데이터 — 8개

**현재 실행에는 사용하지 않는다.** Home을 삭제하지 않는다는 요청에 따라 남겼다. 이전 Storage·ACR·모델·네트워크는 정리됐으므로 이 메타데이터의 과거 연결로 작업을 다시 실행하지 않는다. `Succeeded` 표시는 메타데이터 상태일 뿐, 폐기된 실행 경로가 작동한다는 의미가 아니다.

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `thermaldata` | Discovery Storage Container | Sweden Central | 실제 Blob 계정을 가리키는 Home 측 저장소 참조 | Succeeded; 과거 Home 보존 / 실행 경로 폐기 |
| `thermaldata/candidatecsv` | Discovery Storage Asset | Sweden Central | 입력·출력 파일 경로를 나타내는 Home 메타데이터 | Succeeded; 과거 Home 보존 / 실행 경로 폐기 |
| `thermaldata/evidencepack` | Discovery Storage Asset | Sweden Central | 입력·출력 파일 경로를 나타내는 Home 메타데이터 | Succeeded; 과거 Home 보존 / 실행 경로 폐기 |
| `sc-discovery-hol` | Discovery Supercomputer | Sweden Central | 실제 AKS와 노드 풀을 관리하는 Home 제어 객체 | Failed; 과거 Home 보존 / 실행 경로 폐기 |
| `thermal-ranking` | Discovery Tool | Sweden Central | 컨테이너 이미지와 실행 동작을 정의하는 Home 메타데이터 | Succeeded; 과거 Home 보존 / 실행 경로 폐기 |
| `discoveryholjunwoosc` | Discovery Workspace | Sweden Central | 연구 환경의 Home 제어 객체. 실행 서비스는 별도의 관리 RG에 배치 | Failed; 과거 Home 보존 / 실행 경로 폐기 |
| `mobr-dscmp-sc-discovery-hol-b6wiwf` | MOBO Broker | Sweden Central | Discovery가 관리 자원을 소유·운영하기 위한 관계 객체. 개별 삭제하지 않음 | Succeeded; 과거 Home 보존 / 실행 경로 폐기 |
| `mobr-dwsp-discoveryholjunwoosc-ym5ffv` | MOBO Broker | Sweden Central | Discovery가 관리 자원을 소유·운영하기 위한 관계 객체. 개별 삭제하지 않음 | Succeeded; 과거 Home 보존 / 실행 경로 폐기 |

### 1-3. Korea 고객 관리 실행 자원 — 7개

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `acrdiscoveryholjunwookc` | ACR | Korea Central | 실제 계산 도구의 컨테이너 이미지를 보관 | Succeeded |
| `stdiscoveryholjunwookc-89fe6eea-2358-4928-ae55-33f55a10d627` | Event Grid 시스템 토픽 | Korea Central | 연결된 Storage의 이벤트를 전달하는 전용 시스템 토픽 | Succeeded |
| `id-discovery-hol-kc` | 관리 ID | Korea Central | 현재 Workspace·Supercomputer 및 실습 데이터 접근에 사용하는 고객 관리 ID | 미표시 |
| `pe-discovery-blob-kc.nic.e8b49e3d-0faa-40dc-a900-56336ab60efb` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `pe-discovery-blob-kc` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |
| `vnet-discovery-hol-kc` | VNet | Korea Central | Korea 실행 자원과 사설 연결을 배치하는 네트워크 | Succeeded |
| `stdiscoveryholjunwookc` | Storage 계정 | Korea Central | 합성 입력과 계산 결과를 보관하는 실습용 Blob 계정 | Succeeded |

### 1-4. 공유 DNS — 2개

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `privatelink.blob.core.windows.net` | Private DNS Zone | Global | 공유 Blob DNS 영역. Korea 레코드·링크가 사용하므로 영역 자체를 보존 | Succeeded |
| `privatelink.blob.core.windows.net/discovery-lab-kc` | Private DNS VNet Link | Global | 공유 Blob DNS와 현재 Korea VNet의 연결 | Succeeded |

<a id="workspace-runtime"></a>
## 2. Korea Workspace 관리 실행 자원 — 53개

Home 관리 RG: `mrg-dwsp-discoveryholjunwookc-bdnxfq`. 실제 서비스는 Korea, 전용 DNS는 Global이다.

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `app-dwsp-cogloop-bdnxfqaa` | Container App | Korea Central | Cognition 실행 서비스. 자원 존재가 Engine 연구 실행 완료를 뜻하지 않음 | Succeeded |
| `func-dwsp-copilot-bdnxfqaa` | Container App | Korea Central | Discovery Copilot 서비스 워크로드 | Succeeded |
| `mrg-dwsp-discoveryholjunwookc-bdnxfq` | Container Apps 환경 | Korea Central | Workspace 서비스 실행 환경. 이름이 관리 RG와 같아도 별도의 Target 리소스 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa` | Foundry 계정 | Korea Central | 모델 배포와 Foundry 프로젝트를 호스팅하는 계정 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa/discoverydefaultprojectbdnxfqaa` | Foundry Project | Korea Central | Foundry 기능을 사용하는 프로젝트. Discovery Project와는 별도 객체 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa/thermalholbdnxfqaa` | Foundry Project | Korea Central | Foundry 기능을 사용하는 프로젝트. Discovery Project와는 별도 객체 | Succeeded |
| `cosmos-dwsp-agentthread-bdnxfqaa` | Cosmos DB | Korea Central | 에이전트 대화·스레드 서비스용 관리형 Cosmos DB | Succeeded |
| `cosmos-dwsp-database-bdnxfqaa` | Cosmos DB | Korea Central | Workspace 서비스 데이터용 관리형 Cosmos DB | Succeeded |
| `stdwspfoundrybdnxfqaa-f446f6d2-dac2-4629-9d63-ee96f40c1774` | Event Grid 시스템 토픽 | Korea Central | 연결된 Storage의 이벤트를 전달하는 전용 시스템 토픽 | Succeeded |
| `stdwspfuncqbdnxfqaa-a640816f-9655-44a5-b602-ae61fb455d1b` | Event Grid 시스템 토픽 | Korea Central | 연결된 Storage의 이벤트를 전달하는 전용 시스템 토픽 | Succeeded |
| `stdwspwbkbdnxfqaa-c53c0180-ad88-4744-b8f0-9b92be705a9a` | Event Grid 시스템 토픽 | Korea Central | 연결된 Storage의 이벤트를 전달하는 전용 시스템 토픽 | Succeeded |
| `discovery-logs-dcr` | Data Collection Rule | Korea Central | 해당 관리형 서비스의 로그 수집 규칙 | Succeeded |
| `mi-dwsp-identity-bdnxfqaa` | 관리 ID | Korea Central | 대상 서비스가 Azure 자원에 접근할 때 사용하는 ID | 미표시 |
| `law-dwsp-customlogs-bdnxfqaa` | Log Analytics | Korea Central | 해당 스택 또는 조직 공통 로그를 저장하는 공간 | Succeeded |
| `srch-dwsp-foundry-bdnxfqaa` | AI Search | Korea Central | Workspace/Foundry 검색 지원용. 미생성 Bookshelf의 전용 Search가 아님 | succeeded |
| `stdwspfoundrybdnxfqaa` | Storage 계정 | Korea Central | 해당 Workspace 또는 실습에서 사용하는 실제 저장소 | Succeeded |
| `stdwspfuncqbdnxfqaa` | Storage 계정 | Korea Central | 해당 Workspace 또는 실습에서 사용하는 실제 저장소 | Succeeded |
| `stdwspwbkbdnxfqaa` | Storage 계정 | Korea Central | 해당 Workspace 또는 실습에서 사용하는 실제 저장소 | Succeeded |

<details>
<summary>전용 Private Endpoint·NIC·DNS·NSP 35개 펼치기</summary>


| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `aif-dwsp-foundry-bdnxfqaa-aiservices-pe.nic.a34eff70-6444-412c-b231-ec6966265322` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `cosmos-dwsp-agentthread-bdnxfqaa-cosmosdb-p.nic.1686535e-88fe-4626-9cb2-df3ee733376b` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `srch-dwsp-foundry-bdnxfqaa-search-pe.nic.bfae05e3-b620-46e1-ba58-ef178a4134a1` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-blob-pe.nic.d7709e68-14fb-4168-bfd1-f0677acc1274` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-file-pe.nic.f92fde8c-6b0f-4d43-a3dd-3c2fcd5032a9` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-queue-pe.nic.db109397-d7e3-4d9d-894a-b34d0a854a20` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-table-pe.nic.6473b6b5-af81-44e5-8c16-ae0954e26484` | NIC | Korea Central | Private Endpoint가 관리하는 네트워크 인터페이스. 부모와 함께 관리 | Succeeded |
| `nsp-discoveryholjunwookc-bdnxfqaa` | NSP | Korea Central | 해당 관리형 서비스의 네트워크 보안 경계 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa.privatelink.cognitiveservices.azure.com` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa.privatelink.openai.azure.com` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa.privatelink.services.ai.azure.com` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `cosmos-dwsp-agentthread-bdnxfqaa-koreacentral.privatelink.documents.azure.com` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `cosmos-dwsp-agentthread-bdnxfqaa.privatelink.documents.azure.com` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `srch-dwsp-foundry-bdnxfqaa.privatelink.search.windows.net` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.blob.core.windows.net` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.file.core.windows.net` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.queue.core.windows.net` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.table.core.windows.net` | Private DNS Zone | Global | 대상 서비스의 사설 이름 해석을 위한 DNS 영역 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa.privatelink.cognitiveservices.azure.com/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa.privatelink.openai.azure.com/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa.privatelink.services.ai.azure.com/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `cosmos-dwsp-agentthread-bdnxfqaa-koreacentral.privatelink.documents.azure.com/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `cosmos-dwsp-agentthread-bdnxfqaa.privatelink.documents.azure.com/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `srch-dwsp-foundry-bdnxfqaa.privatelink.search.windows.net/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.blob.core.windows.net/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.file.core.windows.net/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.queue.core.windows.net/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `stdwspfoundrybdnxfqaa.privatelink.table.core.windows.net/vnetlink-mrg-dwsp-discoveryholjunwookc-bdnxfq` | Private DNS VNet Link | Global | DNS 영역을 Korea VNet에 연결 | Succeeded |
| `aif-dwsp-foundry-bdnxfqaa-aiservices-pe` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |
| `cosmos-dwsp-agentthread-bdnxfqaa-cosmosdb-pe` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |
| `srch-dwsp-foundry-bdnxfqaa-search-pe` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-blob-pe` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-file-pe` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-queue-pe` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |
| `stdwspfoundrybdnxfqaa-storage-table-pe` | Private Endpoint | Korea Central | 대상 Storage·Foundry·Search·Cosmos 서비스의 사설 접속점 | Succeeded |

</details>

<a id="compute-runtime"></a>
## 3. Korea Supercomputer 관리 실행 자원 — 4개

Home 관리 RG: `mrg-dscmp-sc-discovery-hol-kc-a13wxu`. 아래 실제 자원은 Korea Central에 있다.

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `aks-dscmp-a13wxu` | AKS | Korea Central | Supercomputer 작업을 실행하는 실제 Kubernetes 클러스터 | Succeeded |
| `sc-discovery-hol-kc-aks-dcr` | Data Collection Rule | Korea Central | 해당 관리형 서비스의 로그 수집 규칙 | Succeeded |
| `nsp-sc-discovery-hol-kc-a13wxu` | NSP | Korea Central | 해당 관리형 서비스의 네트워크 보안 경계 | Succeeded |
| `sc-discovery-hol-kc-loganalytics` | Log Analytics | Korea Central | 해당 스택 또는 조직 공통 로그를 저장하는 공간 | Succeeded |

## 4. Korea AKS 인프라 — 6개

Target 인프라 RG: `MC_mrg-dscmp-sc-discovery-hol-kc-a13wxu_aks-dscmp-a13wxu_koreacentral`. AKS가 관리하는 자원이며 임의로 노드 VMSS나 네트워크를 개별 삭제하지 않는다.

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `aks-cpulab-21384680-vmss` | VM Scale Set | Korea Central | AKS가 관리하는 실제 노드 실행 자원. 개별 수동 삭제하지 않음 | Succeeded |
| `aks-system-33633578-vmss` | VM Scale Set | Korea Central | AKS가 관리하는 실제 노드 실행 자원. 개별 수동 삭제하지 않음 | Succeeded |
| `azurepolicy-aks-dscmp-a13wxu` | 관리 ID | Korea Central | AKS Azure Policy 애드온의 관리 ID | 미표시 |
| `kubernetes` | Load Balancer | Korea Central | 해당 실행 환경이 관리하는 네트워크 트래픽 처리 자원 | Succeeded |
| `aks-agentpool-39329025-nsg` | NSG | Korea Central | AKS 노드 네트워크에 적용되는 접근 제어 | Succeeded |
| `24aefdcf-4aa5-4469-8764-2930e1700176` | Public IP | Korea Central | AKS 네트워크가 관리하는 공인 IP. 실제 사용 방식은 클러스터 설정을 따름 | Succeeded |

## 5. Korea Container Apps 인프라 — 1개

Target 인프라 RG: `ME_mrg-dwsp-discoveryholjunwookc-bdnxfq_mrg-dwsp-discoveryholjunwookc-bdnxfq_koreacentral`.

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `capp-svc-lb` | Load Balancer | Korea Central | 해당 실행 환경이 관리하는 네트워크 트래픽 처리 자원 | Succeeded |

<a id="empty-managed-groups"></a>
## 6. 이전 Home의 빈 관리 RG — 내부 자원 0개

| 보존한 관리 RG | 관리 주체 | 현재 처리 |
| --- | --- | --- |
| `mrg-dwsp-discoveryholjunwoosc-ym5ffv` | `discoveryholjunwoosc` | 내부 실행 자원은 정리. Home 소유 관계와 RG 자체는 유지 |
| `mrg-dscmp-sc-discovery-hol-b6wiwf` | `sc-discovery-hol` | 내부 실행 자원은 정리. Home 소유 관계와 RG 자체는 유지 |

빈 RG 컨테이너 자체에는 별도 사용 요금이 없다. 관리 RG가 비어 있다는 이유만으로 보존 중인 Home 객체와 분리해 추가 삭제하지 않는다. 이 문서에서는 별도 청구 내역이나 소프트 삭제 보존 비용을 조회하지 않았다.

## 7. 조직 공통 로그 — 1개

아래 자원은 현재 Korea Foundry 진단 경로가 사용하는 조직 공통 자원이다. Discovery 실습만의 삭제 대상으로 취급하지 않는다.

| 이름 | 종류 | 위치 | 역할 / 설명 | 상태 / 구분 |
| --- | --- | --- | --- | --- |
| `mcaps4c05bc053c3d4ff154e5-la` | Log Analytics | West US 2 | 해당 스택 또는 조직 공통 로그를 저장하는 공간 | Succeeded |

<a id="model-deployments"></a>
## 8. 실제 Foundry 모델 배포 — 별도 조회 2개

계정은 `aif-dwsp-foundry-bdnxfqaa`이며 생성 위치는 Korea Central이다. Home의 `discoveryholjunwookc/gpt-5-4` 정의와 아래 Foundry 모델 배포는 서로 다른 리소스다.

| 배포 이름 | 모델 / 버전 | 배포 유형 | 할당 TPM | 용도 | 상태 |
| --- | --- | --- | --- | --- | --- |
| `gpt-5.4` | `gpt-5.4` / 2026-03-05 | GlobalStandard | 250,000 | Cognition | Succeeded |
| `gpt-5-4` | `gpt-5.4` / 2026-03-05 | GlobalStandard | 250,000 | 작업 검증 | Succeeded |

두 배포의 할당은 합계 **500,000 TPM**이다. 할당량은 실제 소비 토큰 수가 아니다. `GlobalStandard`의 모델 처리 범위를 리소스의 Korea 위치만으로 국내에 한정됐다고 해석하지 않는다.

## 조회 범위와 사용 시 주의

- Azure 관리 API의 RG/자원 목록과 Resource Graph를 대조하고, Foundry 모델 배포는 별도로 조회했다. Resource Graph에는 짧은 반영 지연이 있을 수 있다.

- 이 문서의 수량은 위 8개 RG에 한정한다. 구독의 다른 Foundry 실습, 모든 Blob 파일·데이터베이스 객체·DNS 레코드·역할 할당·에이전트의 전체 목록은 아니다.

- 자원 설명은 관리 역할을 설명한다. `Succeeded`만으로 네트워크 접속, 색인·검색, 에이전트·Engine 실행까지 성공했다고 표시하지 않는다.

- 이전 VM·Storage·ACR를 참조하는 과거 재현용 스크립트는 폐기된 Sweden 실행 경로에 사용할 수 없다. 현재 경로는 `config/lab.json`의 Korea runtime 항목을 따른다.

- 실제 리소스 이름을 확인할 때는 이 Markdown 원문을 사용한다. Pages 공개본은 기존 게시 정책에 따라 환경 이름·식별자가 예시로 치환될 수 있다.

- 상태의 `미표시`는 조회 응답에 provisioning state가 없었다는 뜻이며, 실패나 미생성 판정이 아니다.

## 관련 문서

- [현재 상태와 블로커](01-current-state.ko.md)
- [아키텍처·리전·데이터 위치](04-architecture-regions.ko.md)
- [실행·재개 절차](06-resume-runbook.ko.md)
- [공식 교차 리전 배치 기준](https://learn.microsoft.com/azure/microsoft-discovery/how-to-deploy-across-regions)
