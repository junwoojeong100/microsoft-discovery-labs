# 01 — 현재 상태와 블로커

[목차](README.ko.md) · **기준일: 2026-10-01. 현재 상태를 보장하는 실시간 조회 결과가 아니다.**

## 활성 배포 범위

| 항목 | 값 |
|---|---|
| 구독 이름 | `ME-MngEnvMCAP757124-junwoojeong-1` |
| 구독 ID | `51531604-2337-4c05-bc05-3c3d4ff154e5` |
| 테넌트 ID | `46e9cdaa-fed3-4131-aa28-c1fc8a8a043a` |
| 리소스 그룹 | `rg-discovery-hol-20260930` |
| 리전 | `swedencentral` |
| 실습 태그 | `microsoft-discovery-core-hol` |

계정 정보의 기준은 [config/lab.json](../../config/lab.json)이다. 과거 기록의 `rg-discovery-hol-20260925`와 혼동하지 않는다. 새로운 환경을 만들 때는 구독/RG뿐 아니라 전역 고유 이름, CIDR, 템플릿 매개변수, 스크립트의 리소스 이름도 함께 검토한다.

## 리소스별 결과

| 구성요소 | 이름 / 마지막 확인 결과 |
|---|---|
| VNet | `vnet-discovery-hol`, `10.80.0.0/16`, 후속 클라이언트까지 서브넷 9개 |
| Discovery 관리 ID | `id-discovery-hol`, 필요한 범위에 역할 할당 |
| 고객 Storage | `stdiscoveryholjunwoosc`, Standard LRS, `Succeeded`, 공개 네트워크·공유 키·익명 Blob 비활성 |
| Blob 컨테이너 | `discoveryinputs`, `discoveryoutputs` 생성 |
| 사설 Blob 연결 | `pe-discovery-blob`, 승인 및 생성 성공. DNS 관측값 `10.80.8.4` |
| 사설 데이터 클라이언트 | `vm-discovery-blob-client`, `Standard_B2als_v2`, 검증 후 `PowerState/deallocated` |
| 원본 파일 | 합성 TXT 4개·CSV 1개 업로드/읽기 SHA-256 일치. 재실행은 동일 파일 재사용 |
| Discovery 데이터 참조 | `thermaldata`, `evidencepack`, `candidatecsv`: `Succeeded` |
| ACR / 도구 | `acrdiscoveryholjunwoosc`, build `dt1` 성공, `thermal-ranking` version `1.0.0` 등록 성공 |
| Supercomputer | `sc-discovery-hol`: `Failed` |
| Workspace | `discoveryholjunwoosc`: `Failed` |
| Discovery 하위 자원 | `cpulab`, `gpt-5-4`, `thermalhol`: 마지막 조회에서 미생성 |
| Bookshelf / 색인 풀 | Bookshelf와 `indexlab` 미생성 |
| 연구 실행 | 색인, 연구 에이전트, 실제 Supercomputer 도구 실행, Engine, 다중 사용자 권한 실습 미실행 |

도구 이미지의 관측 digest:

```text
acrdiscoveryholjunwoosc.azurecr.io/thermal-ranking@sha256:0051d5db6c367812c22073d807da54b469ecbcc58edb7cfaf0dbce5e78514ad1
```

이미지 build·Tool 등록·실제 도구 실행은 서로 다른 완료 기준이다.

## Foundry 프로젝트는 있지만 Discovery 실습 프로젝트는 없다

| 구분 | 관측 상태 |
|---|---|
| Foundry 계정 | `aif-dwsp-foundry-ym5ffvaa`: `Succeeded` |
| Foundry 프로젝트 | **Discovery Default Project** / `discoverydefaultprojectym5ffvaa`: `Succeeded` |
| 자동 cognition 모델 | Foundry 배포 `gpt-5.4`, revision `2026-03-05`, GlobalStandard capacity 250 관측 |
| Discovery 검증 모델 | 별도 Chat Model Deployment `gpt-5-4`는 미생성 |
| Discovery 실습 Project | Workspace 아래 `thermalhol`은 미생성 |

Foundry의 기본 프로젝트가 있다고 Discovery의 연구 실습이 준비된 것은 아니다. 자동 cognition 배포를 별도의 검증 배포로 간주하거나, quota 화면을 찾기 위해 중복 Foundry 프로젝트를 만들지 않는다.

## 남은 블로커

| 항목 | 확인한 원인 / 다음 조치 |
|---|---|
| AKS/Container Apps 배포 | `AKSCapacityHeavyUsage`, `ManagedEnvironmentCapacityHeavyUsageError`. [컴퓨트 용량 검토](03-compute-capacity.ko.md)에 따라 지원 확인 후 재개 |
| Bookshelf 모델 용량 | 두 모델의 증액 **신청 접수만 확인**. [요청 기록과 실제 한도 반영](02-model-quota.ko.md)을 재확인 |
| Studio 사용 | headless에서는 정상 로그인 화면까지 확인. 사용자 브라우저의 로그인·프로젝트 열기 성공은 별도 |
| 공통 진단 정책 | `mcapsgovernance/mcaps4c05bc053c3d4ff154e5-la` 대상 누락. 조직 관리자 확인 대상이며, 확인된 지역 용량 실패의 직접 원인과 구분 |

확인된 주요 실패 식별자:

| 대상 | 식별자 |
|---|---|
| Supercomputer 생성 | correlation `75d88d20-5dd2-4963-b2b1-00dc4b1039e4` |
| Workspace 생성 | correlation `e08e90c5-299f-4552-a354-697e0da7df45` |
| Workspace 내부 AKS 용량 오류 | request `0ea9a155-9803-4e6c-85fd-b8ed67a02502` |

원래 `discovery-core-20261001` 배포는 중복 쓰기를 막기 위해 취소했다. 별도 `discovery-workspace-20261001` 배포는 약 55분 뒤 실패했다. **배포 취소는 생성된 자원 삭제가 아니며, 이미 시작된 하위 작업을 즉시 중단한다고 보장하지 않는다.**

## 남아 있는 비용

실패한 배포에서도 Search, Cosmos DB, Foundry, Storage, Private Endpoint, Log Analytics/NSP 등 MRG 자원이 생성됐다. Bookshelf 미생성이나 Engine 미실행이 비용 0을 뜻하지 않는다.

사설 클라이언트 VM은 할당 해제로 컴퓨트 과금을 줄였지만 OS 디스크는 유지된다. 할당 해제된 VM의 vCPU가 quota 사용량에 포함될 수도 있으므로 과금과 quota 반환을 구분한다. 임의로 MRG나 공유 구독 역할을 삭제하지 않는다.

## 증거와 시간 차이

- [초기 워크로드 스냅샷](../../artifacts/discovery-execution-20261001.json): 사설 클라이언트 추가 전 기록이므로 당시 서브넷은 8개.
- [최초 사설 업로드](../../artifacts/discovery-private-blob-upload-20261001.json), [재실행 읽기 검증](../../artifacts/discovery-private-blob-sync.json), [VM 할당 해제](../../artifacts/discovery-blob-client-state-20261001.json): 후속 9번째 서브넷/클라이언트 단계.
- [Foundry 기본 프로젝트](../../artifacts/discovery-foundry-default-project-20261001.json)
- [Supercomputer 용량 오류](../../artifacts/discovery-core-capacity-failures-20261001.json), [Workspace 용량 오류](../../artifacts/discovery-workspace-capacity-20261001.json)
- [진단 정책 실패](../../artifacts/discovery-workspace-governance-20261001.json), [Studio 로그인 관측](../../artifacts/discovery-studio-headless-20261001.json)
