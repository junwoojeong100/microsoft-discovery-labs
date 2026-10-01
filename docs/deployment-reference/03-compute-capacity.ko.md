# 03 — AKS·VM quota와 지역 용량

[목차](README.ko.md) · **기준일: 2026-10-01 독립 에이전트 검토와 실제 배포 오류 기록**

## 결론

**현재 Small·CPU 실습 계획에서 선제적으로 VM vCPU나 AKS 클러스터 수 quota를 올려야 한다는 근거는 없다.** 관측된 배포 실패는 quota 소진이 아니라 `AKSCapacityHeavyUsage` 계열이었다. 필요한 조치는 **지역 서비스 용량·구독별 배포 제한 확인을 위한 지원요청**이며, 숫자 한도 증액과 구분한다.

지원 리전, 서비스 사용 승인, quota, SKU/zone 허용, 실제 할당 용량은 서로 다른 조건이다. 현재 가용 용량이 회복됐는지는 과거 오류만으로 알 수 없으므로 재개 시 다시 확인한다.

## 오후 재시도에서 확인한 현재 용량 블로커

`AllowBringYourOwnPublicIpAddress` 등록과 `Microsoft.Network` 전파를 확인한 뒤 기존 코어를 한 번 재시도했다. **15:46:52 KST의 새 하위 AKS 요청도 `AKSCapacityHeavyUsage`로 실패**했다. 이는 오전 오류의 단순 재인용이 아니다. 새 correlation ID는 **`cf91439f-960e-430a-96af-798274d51c89`**다.

15:52에는 상위 `discovery-core-resume-20261001-1530`이 **Running**, Supercomputer가 **Accepted**였다. 최종 성공/실패는 아직 확정하지 않는다. 네트워크 feature 미등록은 해결됐으나 지역 용량 문제는 남아 있으며, 이번 요청이 진행 중일 때 추가 배포를 중첩하지 않는다.

오후 재확인에서도 지역 vCPU 2/100, Dsv6 0/100, Esv6 0/100, Container Apps 환경 수 1/50였다. [새 실제 오류](../../artifacts/discovery-resume-activity-failures-20261001.json), [리소스 상태](../../artifacts/discovery-resume-snapshot-20261001-1552.json), [한도](../../artifacts/discovery-resume-compute-limits-20261001.json), [사용량](../../artifacts/discovery-resume-compute-usage-20261001.json)을 구분해 본다.

## 독립 검토의 조회값

아래 표는 Sweden Central, 2026-10-01 약 14:10 KST의 이전 독립 검토다. 지정한 실습 구독/테넌트의 Azure CLI 및 공식 quota/usage API로 확인했다. 오후에 다시 확인한 항목과 모든 과거 행이 동시에 재조회된 것으로 혼동하지 않는다.

| 항목 | 사용량 | 한도 | 여유 |
|---|---:|---:|---:|
| Total Regional vCPUs | 2 | 100 | 98 |
| StandardDsv6Family | 0 | 100 | 100 |
| StandardEsv6Family | 0 | 100 | 100 |
| Standard Basv2 계열 | 2 | 100 | 98 |
| AKS ManagedClusters | 0 | 50 | 50 |
| Container Apps ManagedEnvironmentCount | 1 | 50 | 49 |

할당 해제된 Blob 클라이언트 VM도 2 vCPU로 집계됐다. **deallocate는 컴퓨트 과금 중단이지 quota 반환과 동일하지 않다.** quota를 확보하려고 데이터 보존·삭제 승인 없이 VM을 삭제하지 않는다.

East US와 UK South도 독립 검토에서 quota 여유가 확인됐지만 실제 생성은 하지 않았다. 다른 리전의 성공을 보장하는 결과가 아니다. Container Apps 환경 수가 충분하다는 사실만으로 모든 전용 프로파일/GPU quota까지 검증됐다고 주장하지 않는다.

## 실습 수요 계산

[코어 템플릿](../../infra/discovery-core.bicep)의 시스템 SKU는 D4s_v6, `cpulab`은 D4s_v6 min 0/max 1이다. **시스템 풀의 실제 노드 수는 미확인**이다. AKS가 생성되지 않았으므로 관례적인 노드 수를 실측값이나 최대값으로 쓰지 않는다.

```text
regional 필요량 = 기존 클라이언트 2
                + 시스템 노드 수 S × 4
                + cpulab 노드 수 C × 4
                + 색인 노드 수 I × 색인 SKU vCPU
```

아래는 **S=3, C=1, I=1이라는 가정**이다. 클라이언트 2 vCPU를 포함하며, SQL/Container Apps/모델 서비스의 CPU와 같은 quota 집계라고 가정하지 않는다.

| 색인 SKU | 색인 vCPU | regional 합계 | Dsv6 합계 | Esv6 합계 | 현재 100 한도 대비 최소 증액 |
|---|---:|---:|---:|---:|---|
| `Standard_E20s_v6` | 20 | 38 | 16 | 20 | 없음 |
| `Standard_D48s_v6` | 48 | 66 | 64 | 0 | 없음 |
| `Standard_E64s_v6` | 64 | 82 | 16 | 64 | 없음 |
| `Standard_D128s_v6` | 128 | 146 | 144 | 0 | regional +46, Dsv6 +44 |
| `Standard_E96s_v6` | 96 | 114 | 16 | 96 | regional +14 |
| `Standard_D192s_v6` | 192 | 210 | 208 | 0 | regional +110, Dsv6 +108 |

이 표는 quota 계산 예시이지 실제로 요청·승인받은 수량이 아니다. 실제 시스템 풀 크기, 동시 실행, autoscale 최대치, 다른 VM 사용량을 확정한 뒤 여유분까지 산정한다.

**주의:** E96의 96 vCPU만 보고 “100 이내라 충분하다”고 판단하면 안 된다. 색인 중에도 AKS 시스템 풀이 필요하다. 현재 클라이언트 2 + 최소 시스템 노드 1대의 4 + E96만 합쳐도 102다. 사용자 CPU 풀을 0으로 줄이는 것만으로 이 계산에서 시스템 풀까지 제외할 수는 없다.

## 색인 SKU 문서 차이

| 티어 | quota 개념 문서 | Bookshelf how-to |
|---|---|---|
| Small | D48s_v6, 48 vCPU / 192 GB | E20s_v6, 20 vCPU / 160 GB |
| Medium | D128s_v6, 128 vCPU / 512 GB | E64s_v6, 64 vCPU / 512 GB |
| Large | D192s_v6, 192 vCPU / 768 GB | E96s_v6, 96 vCPU / 768 GB |

두 공개 문서는 서로 다른 SKU를 안내한다. 이들 SKU가 모든 Discovery 배포 버전에서 서로 대체 가능하다고 검증한 것은 아니다. 실제 UI/서비스 버전·메모리 요구를 확인한다. 현재 템플릿에는 `indexlab`이 없으며 실제 색인 SKU는 아직 결정·배포하지 않았다.

조회한 D/E v6 후보에는 **Sweden Central zone 2의 `NotAvailableForSubscription`** 제한이 있었다. zone 1/3에 해당 제한이 없다는 메타데이터만으로 실제 할당 성공이 보장되지는 않는다. 이 zone 제한과 관측된 AKS 서비스 용량 오류의 관계도 지원팀 확인 대상이다.

## 실제 실패와 필요한 지원요청

- Supercomputer 하위 AKS: `AKSCapacityHeavyUsage` 반복.
- Workspace 하위 Container Apps: `ManagedEnvironmentCapacityHeavyUsageError` 안에 같은 AKS 오류 포함.
- `deployCompute=false`로 Workspace만 생성해도 내부 Container Apps가 AKS 기반이므로 같은 문제를 피하지 못했다.
- `quotaId=Internal_2014-09-01`이 관측됐다. 이 문자열만으로 우선순위·EA 여부·실패 원인을 확정하지 않고, 구독 유형별 제한을 지원팀에 확인한다.

**다음은 지원요청 초안이며 아직 제출하지 않았다.** 모델 TPM 증액 두 건의 접수와 별개다.

```text
제목: Sweden Central AKS/Container Apps creation blocked by capacity errors

Subscription: 51531604-2337-4c05-bc05-3c3d4ff154e5
Region: swedencentral
Resource group: rg-discovery-hol-20260930

Microsoft Discovery Supercomputer creation failed with AKSCapacityHeavyUsage.
Correlation: 75d88d20-5dd2-4963-b2b1-00dc4b1039e4

After registering AllowBringYourOwnPublicIpAddress and re-registering
Microsoft.Network, one core retry was accepted at 2026-10-01 06:43:48 UTC.
Its backing AKS write failed again at 06:46:52 UTC with AKSCapacityHeavyUsage.
Latest correlation: cf91439f-960e-430a-96af-798274d51c89
Deployment: discovery-core-resume-20261001-1530
At 06:52 UTC, the parent was Running and the Supercomputer was Accepted;
the final outcome was not yet known.

Workspace-only creation also failed at its Container Apps managed environment
with ManagedEnvironmentCapacityHeavyUsageError / AKSCapacityHeavyUsage.
Correlation: e08e90c5-299f-4552-a354-697e0da7df45
Underlying request: 0ea9a155-9803-4e6c-85fd-b8ed67a02502

Observed quota headroom: regional vCPU 2/100, Dsv6 0/100, Esv6 0/100,
AKS clusters 0/50, Container Apps environments 1/50.

Please verify current regional allocation capacity, subscription eligibility
or placement restrictions, the observed zone-2 SKU restriction, and a
supported recovery path or alternative Discovery production region.
This is not a request to increase ordinary VM vCPU quota.
```

## 읽기 전용 재확인

```bash
SUBSCRIPTION_ID='51531604-2337-4c05-bc05-3c3d4ff154e5'
LOCATION='swedencentral'

az vm list-usage --subscription "$SUBSCRIPTION_ID" --location "$LOCATION" \
  --query "[?name.value=='cores' || name.value=='StandardDsv6Family' || name.value=='StandardEsv6Family'].{name:name.value,used:currentValue,limit:limit}" \
  --output json

az quota list \
  --subscription "$SUBSCRIPTION_ID" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/providers/Microsoft.ContainerService/locations/$LOCATION" \
  --output json
az quota usage list \
  --subscription "$SUBSCRIPTION_ID" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/providers/Microsoft.ContainerService/locations/$LOCATION" \
  --output json

az rest --method get --subscription "$SUBSCRIPTION_ID" \
  --url "https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/providers/Microsoft.ContainerService/locations/$LOCATION/usages?api-version=2026-07-01"
```

`az aks list-usage`는 이 환경의 CLI에서 지원되지 않았으므로 사용하지 않는다. API version은 실행 전에 현재 공급자 사양도 확인한다. `az quota` 확장의 인증 오류와 quota 부족은 별개이며, 오류나 빈 값을 “0/무제한”으로 해석하지 않는다. 위의 `az vm list-usage`와 ARM usage API는 조사 당시 동작을 확인한 대체 경로다.

## 근거

- [AKS 용량 오류 원인·대응](https://learn.microsoft.com/troubleshoot/azure/azure-kubernetes/error-codes/akscapacityheavyusage-error)
- [AKS quota/SKU/리전](https://learn.microsoft.com/azure/aks/quotas-skus-regions)
- [VM vCPU quota](https://learn.microsoft.com/azure/virtual-machines/quotas)
- [Discovery quota 계획](https://learn.microsoft.com/azure/microsoft-discovery/concept-quota-reservation)
- [Bookshelf 생성·색인](https://learn.microsoft.com/azure/microsoft-discovery/how-to-index-bookshelf-knowledgebase)
- [실제 Supercomputer 오류](../../artifacts/discovery-core-capacity-failures-20261001.json), [실제 Workspace 오류](../../artifacts/discovery-workspace-capacity-20261001.json)
