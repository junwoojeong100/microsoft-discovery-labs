import { execFile } from 'node:child_process';
import { promisify, parseArgs } from 'node:util';
import { mkdir, readFile, writeFile, stat, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  discoveryGate, providerSummary, publicView, redact, safeArmUrl, selectAccount, validateConfig,
} from './lab-support.mjs';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const { values: flags } = parseArgs({
  options: {
    register: { type: 'boolean', default: false },
    'request-access': { type: 'boolean', default: false },
    'create-resource-group': { type: 'boolean', default: false },
  },
});
const config = JSON.parse(await readFile(resolve(root, 'config/lab.json'), 'utf8'));
validateConfig(config);
const guide = await readFile(resolve(root, 'MICROSOFT-DISCOVERY-LAB.ko.md'));
const guideStat = await stat(resolve(root, 'MICROSOFT-DISCOVERY-LAB.ko.html'));
const runId = new Date().toISOString().replaceAll(/[:.]/g, '-');
const runDir = resolve(root, 'artifacts/runs', runId);
const rawDir = resolve(root, 'artifacts/raw', runId);
await mkdir(runDir, { recursive: true });
await mkdir(rawDir, { recursive: true });

const report = {
  runId,
  startedAt: new Date().toISOString(),
  automation: 'Playwright Chromium headless; real Azure ARM requests via APIRequestContext',
  viewer: 'Local evidence viewer; NOT Azure Portal or Discovery Studio',
  guideSha256: createHash('sha256').update(guide).digest('hex'),
  guideHtmlPreparedAt: guideStat.mtime.toISOString(),
  scope: config,
  approvedOperations: flags,
  outcome: 'in_progress',
  discoveryLabsExecuted: false,
  createdResources: [],
  requests: [],
};
let browser;
let context;
let page;
let video;
let token;
let exitCode = 0;

async function azJson(args) {
  try {
    const { stdout } = await exec('az', [...args, '--output', 'json'], {
      encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 60000,
    });
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Azure CLI ${args.slice(0, 2).join(' ')} failed: ${redact(String(error.stderr || error.message)).slice(0, 1400)}`);
  }
}

async function show(title, state, detail) {
  await page.evaluate(({ title, state, text, stamp }) => {
    document.querySelector('#title').textContent = title;
    document.querySelector('#state').textContent = state;
    document.querySelector('#detail').textContent = text;
    document.querySelector('#stamp').textContent = stamp;
    const item = document.createElement('li');
    item.textContent = `${state} · ${title}`;
    document.querySelector('#history').prepend(item);
    const items = document.querySelectorAll('#history li');
    if (items.length > 5) items[items.length - 1].remove();
  }, {
    title, state, text: publicView(detail, config),
    stamp: `${new Date().toISOString()} | HEADLESS / LIVE AZURE ARM`,
  });
}

async function request(label, method, path, data, summarize = (body) => body) {
  await show(label, 'REQUEST', { method, path, note: '실제 Azure 요청 중. 인증 헤더는 표시·저장하지 않음.' });
  const response = await context.request.fetch(safeArmUrl(path, config), {
    method, data, timeout: 45000, maxRedirects: 0,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  const entry = redact({
    sequence: report.requests.length + 1,
    label, timestamp: new Date().toISOString(), method, path,
    status: response.status(),
    requestId: response.headers()['x-ms-request-id'] ?? null,
    correlationRequestId: response.headers()['x-ms-correlation-request-id'] ?? null,
    response: body,
  });
  report.requests.push(entry);
  await writeFile(resolve(runDir, `${String(entry.sequence).padStart(2, '0')}-response.json`), JSON.stringify(entry, null, 2));
  await show(label, `HTTP ${entry.status}`, summarize(body));
  await page.screenshot({ path: resolve(runDir, `${String(entry.sequence).padStart(2, '0')}-evidence.png`) });
  await page.waitForTimeout(1800);
  console.log(`${entry.sequence}. ${method} ${label}: HTTP ${entry.status}`);
  await response.dispose();
  return { status: entry.status, body };
}

function requireSuccess(result, label) {
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`${label}: HTTP ${result.status}; ${JSON.stringify(redact(result.body.error ?? result.body))}`);
  }
}

try {
  const accounts = await azJson(['account', 'list', '--all']);
  selectAccount(accounts, config);
  const credential = await azJson([
    'account', 'get-access-token', '--subscription', config.subscriptionId,
    '--resource', 'https://management.azure.com/',
  ]);
  if (credential.tenant !== config.tenantId || credential.subscription !== config.subscriptionId || !credential.accessToken) {
    throw new Error('Azure CLI returned a token for an unexpected tenant or subscription');
  }
  token = credential.accessToken;
  report.authentication = {
    method: 'Existing delegated Azure CLI session; token retained in memory only',
    accountVerified: true,
    studioLoginCompletedByThisScript: false,
  };
  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  context = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    recordVideo: { dir: rawDir, size: { width: 1600, height: 900 } },
    locale: 'ko-KR',
  });
  page = await context.newPage();
  video = page.video();
  report.browser = { headless: true, channel: 'chrome', version: browser.version() };
  await page.setContent(`<!doctype html><html lang="ko"><meta charset="utf-8"><title>Discovery Azure 실제 실행 증거</title>
    <style>
    *{box-sizing:border-box}body{margin:0;background:#0a1728;color:#edf5ff;font-family:-apple-system,"Apple SD Gothic Neo",sans-serif}
    header{height:106px;padding:26px 46px;border-bottom:1px solid #33506d;font-size:27px;font-weight:700}
    header span{float:right;font-size:18px;color:#92d9e9;padding-top:6px}
    main{display:grid;grid-template-columns:430px 1fr;gap:34px;padding:36px 46px}
    aside{padding:27px;border-radius:20px;background:#142d47}aside h2{font-size:24px;margin:0 0 23px}
    ul{padding:0;list-style:none}li{padding:11px 0;border-bottom:1px solid #2b465f;line-height:1.4;font-size:16px}
    section{min-width:0}h1{font-size:33px;margin:2px 0 18px}#state{color:#99e8cc;font-size:21px;font-weight:700}
    pre{height:495px;overflow:hidden;white-space:pre-wrap;word-break:break-word;background:#11273d;border:1px solid #3b5670;padding:24px;border-radius:18px;font:19px/1.55 ui-monospace,Menlo,monospace}
    .note{font-size:16px;line-height:1.5;color:#b9cddd}footer{position:absolute;bottom:24px;left:46px;right:46px;color:#a5bed4;font-size:17px}
    </style><header>Microsoft Discovery · 실제 Azure 사전 점검<span>PLAYWRIGHT HEADLESS</span></header>
    <main><aside><h2>실행 기록</h2><p class="note">로컬 증거 뷰어<br>Azure Portal / Studio 화면 아님</p><ul id="history"></ul>
    <p class="note">공식 ARM API의 실제 응답만 표시합니다.<br>가짜 리소스·가짜 성공 화면 없음.<br>계정·구독 식별자는 영상에서 가립니다.</p></aside>
    <section><div id="state"></div><h1 id="title"></h1><pre id="detail"></pre></section></main>
    <footer id="stamp"></footer></html>`);
  await show('지정 계정 확인 완료', 'AUTHENTICATED ARM', {
    account: config.account, subscriptionId: config.subscriptionId,
    region: config.location, paidDeployments: '없음',
    warning: 'ARM 인증과 Studio 브라우저 로그인은 서로 다른 상태입니다.',
  });
  await page.waitForTimeout(2000);

  const subscriptionPath = `/subscriptions/${config.subscriptionId}`;
  const providerPath = `${subscriptionPath}/providers/Microsoft.Discovery`;
  const subscription = await request(
    '대상 Azure 구독 조회', 'GET', `${subscriptionPath}?api-version=2022-12-01`, undefined,
    (body) => ({ subscriptionId: body.subscriptionId, displayName: body.displayName, state: body.state, tenantId: body.tenantId, error: body.error }),
  );
  requireSuccess(subscription, 'Subscription lookup');
  let provider = await request('Discovery Provider 조회', 'GET', `${providerPath}?api-version=2021-04-01`, undefined, providerSummary);
  requireSuccess(provider, 'Provider lookup');
  report.providerBefore = providerSummary(provider.body);

  if (flags.register) {
    const registration = await request('Discovery Provider 등록 요청', 'POST', `${providerPath}/register?api-version=2021-04-01`, {}, providerSummary);
    report.registrationAttempt = { status: registration.status, error: registration.body.error ?? null };
    if (registration.status >= 200 && registration.status < 300) {
      for (let attempt = 0; attempt < 6; attempt++) {
        provider = await request('등록 후 실제 상태 조회', 'GET', `${providerPath}?api-version=2021-04-01`, undefined, providerSummary);
        requireSuccess(provider, 'Provider state polling');
        if (provider.body.registrationState !== 'Registering') break;
        await page.waitForTimeout(5000);
      }
    }
  }
  report.providerAfter = providerSummary(provider.body);
  const features = await request(
    'Discovery 기능 승인 상태 조회', 'GET',
    `${subscriptionPath}/providers/Microsoft.Features/providers/Microsoft.Discovery/features?api-version=2021-07-01`,
    undefined, (body) => ({
      features: (body.value ?? []).map((item) => ({ name: item.name, state: item.properties?.state })),
      error: body.error,
    }),
  );
  requireSuccess(features, 'Feature state lookup');
  const defaultFeature = (features.body.value ?? []).find((item) => item.name === 'Microsoft.Discovery/DefaultFeature');
  report.defaultFeatureState = defaultFeature?.properties?.state ?? 'NotReturned';
  if (flags['request-access'] && ['NotRegistered', 'Unregistered'].includes(report.defaultFeatureState)) {
    const featurePath = `${subscriptionPath}/providers/Microsoft.Features/providers/Microsoft.Discovery/features/DefaultFeature`;
    const accessRequest = await request(
      'Discovery DefaultFeature 사용 승인 요청', 'POST',
      `${featurePath}/register?api-version=2021-07-01`, {},
    );
    report.accessRequest = { status: accessRequest.status, response: accessRequest.body };
    if (accessRequest.status >= 200 && accessRequest.status < 300) {
      for (let attempt = 0; attempt < 6; attempt++) {
        const feature = await request(
          '서비스 측 사용 승인 상태 확인', 'GET', `${featurePath}?api-version=2021-07-01`,
        );
        requireSuccess(feature, 'Access request status');
        report.defaultFeatureState = feature.body.properties?.state;
        if (report.defaultFeatureState !== 'Registering') break;
        await page.waitForTimeout(5000);
      }
      if (report.defaultFeatureState === 'Registered' && flags.register) {
        const refresh = await request(
          '승인 후 Provider 변경 전파', 'POST', `${providerPath}/register?api-version=2021-04-01`, {}, providerSummary,
        );
        requireSuccess(refresh, 'Provider refresh after feature approval');
      }
      provider = await request(
        '사용 승인 요청 후 Provider 재확인', 'GET', `${providerPath}?api-version=2021-04-01`, undefined, providerSummary,
      );
      requireSuccess(provider, 'Provider lookup after access request');
      report.providerAfter = providerSummary(provider.body);
    }
  }

  const workspaces = await request(
    '실제 Discovery Workspace API 접근 확인', 'GET',
    `${providerPath}/workspaces?api-version=2026-06-01`, undefined,
    (body) => ({ workspaces: (body.value ?? []).map((item) => ({ name: item.name, id: item.id })), error: body.error }),
  );
  if (workspaces.body.error?.code === 'InvalidResourceType') {
    const alternate = await request(
      '공식 이전 API 버전으로 원인 교차 확인', 'GET',
      `${providerPath}/workspaces?api-version=2026-02-01-preview`, undefined,
      (body) => ({ workspaceCount: body.value?.length, error: body.error }),
    );
    report.alternateApiProbe = { apiVersion: '2026-02-01-preview', status: alternate.status, response: alternate.body };
  }
  report.discoveryGate = discoveryGate(provider.body, workspaces);

  if (!report.discoveryGate.allowed) {
    report.outcome = 'blocked';
    report.blockers = [
      report.discoveryGate.reason,
      ...(report.registrationAttempt?.error ? [report.registrationAttempt.error] : []),
      ...(workspaces.body.error ? [workspaces.body.error] : []),
    ];
    exitCode = 2;
    await show('Discovery 핵심 실습: 선행조건 차단', 'BLOCKED / NOT EXECUTED', {
      registration: report.providerAfter.registrationState,
      defaultFeatureState: report.defaultFeatureState,
      missingResourceTypes: report.discoveryGate.missing,
      registrationError: report.registrationAttempt?.error,
      workspaceApiError: workspaces.body.error,
      paidResourcesCreated: 0,
      next: 'Microsoft 담당자에게 구독 활성화와 실제 오류 검토 요청. 승인 후 MFA·할당량·IAM 확인.',
    });
  } else {
    if (flags['create-resource-group']) {
      const groupPath = `${subscriptionPath}/resourcegroups/${config.resourceGroup}`;
      let group = await request('전용 실습 RG 존재 여부', 'GET', `${groupPath}?api-version=2021-04-01`);
      if (group.status === 404) {
        group = await request('전용 실습 RG 생성', 'PUT', `${groupPath}?api-version=2021-04-01`, {
          location: config.location, tags: { lab: config.labTag, purpose: 'training', runId },
        });
        requireSuccess(group, 'Resource group creation');
        report.createdResources.push({ id: group.body.id, type: 'Microsoft.Resources/resourceGroups' });
      } else {
        requireSuccess(group, 'Existing resource group check');
        if (group.body.tags?.lab !== config.labTag) {
          throw new Error('Refusing to modify an existing resource group that is not tagged for this lab');
        }
      }
      group = await request('실습 RG 생성 결과 재조회', 'GET', `${groupPath}?api-version=2021-04-01`);
      requireSuccess(group, 'Resource group verification');
      if (group.body.properties?.provisioningState !== 'Succeeded') {
        throw new Error('Resource group creation has not reached Succeeded');
      }
    }
    report.outcome = 'provider_gate_passed';
    await show('Provider 접근 확인 완료', 'PREFLIGHT ONLY', {
      gate: report.discoveryGate, createdResources: report.createdResources,
      discoveryLabsExecuted: false,
      next: 'Studio 인증, IAM, 모델·VM 할당량과 비용 확인 후 실제 인프라·핵심 기능 실습 진행.',
    });
  }
  await page.screenshot({ path: resolve(runDir, 'final-status.png') });
  await page.waitForTimeout(6500);
} catch (error) {
  report.outcome = 'error';
  report.error = redact(error.message);
  exitCode = 1;
  console.error(report.error);
  if (page && !page.isClosed()) {
    await show('사전 점검 오류', 'ERROR / NOT COMPLETED', { error: report.error });
    await page.screenshot({ path: resolve(runDir, 'error.png') });
  }
} finally {
  token = undefined;
  if (context) await context.close();
  if (browser) await browser.close();
  if (video) {
    const source = await video.path();
    const destination = resolve(runDir, 'azure-preflight.webm');
    await rename(source, destination);
    report.recording = relative(root, destination);
  }
  report.completedAt = new Date().toISOString();
  report.evidenceDirectory = relative(root, runDir);
  const text = JSON.stringify(redact(report), null, 2) + '\n';
  await writeFile(resolve(runDir, 'azure-preflight.json'), text);
  await writeFile(resolve(root, 'artifacts/azure-preflight.json'), text);
  console.log(JSON.stringify({
    outcome: report.outcome, createdResources: report.createdResources.length,
    evidenceDirectory: report.evidenceDirectory, recording: report.recording,
  }));
  process.exitCode = exitCode;
}
