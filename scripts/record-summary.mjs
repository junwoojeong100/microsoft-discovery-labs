import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const artifacts = resolve(root, 'artifacts');
const report = JSON.parse(await readFile(resolve(artifacts, 'azure-preflight.json'), 'utf8'));
if (report.outcome !== 'blocked' || report.defaultFeatureState !== 'Pending' || report.discoveryLabsExecuted !== false) {
  throw new Error('This storyboard describes a verified Pending access gate. Update it if the real Azure result has changed.');
}
if (!report.recording?.startsWith('artifacts/runs/') || report.recording.includes('..')) {
  throw new Error('The source must be an actual recorded run inside artifacts/runs');
}
const narrationDir = resolve(artifacts, 'narration');
const rawDir = resolve(artifacts, 'raw/summary');
const frameDir = resolve(artifacts, 'summary-frames');
await Promise.all([narrationDir, rawDir, frameDir].map((path) => mkdir(path, { recursive: true })));

const card = (heading, body) => `<div class="card"><h2>${heading}</h2>${body}</div>`;
const scenes = [
  {
    title: '가이드는 완성 · 클라우드 실습은 승인 대기',
    subtitle: '실제로 확인된 결과와, 아직 실행하지 못한 핵심 기능을 구분합니다.',
    label: '결과부터 확인',
    html: `<div class="grid">${card('완성한 자료', '<p class="big green">15개 절</p><p>한국어 가이드 · 합성 데이터<br>도구 코드 · 재현 자동화</p>')}${card('실제 Azure 작업', '<p class="big">등록·신청</p><p>Provider 등록 완료<br>사용 승인 요청 제출</p>')}${card('핵심 기능 실습', '<p class="big amber">미실행</p><p>DefaultFeature: Pending<br>Microsoft 측 승인 필요</p>')}</div><div class="wide warn">이 영상은 완료 시연이 아니라, 실습 가이드와 실제 Azure 접근 점검의 요약입니다.</div>`,
    narration: [
      '마이크로소프트 디스커버리 실습 가이드는 완성했습니다.',
      '다만 실제 클라우드의 핵심 기능 실습은 서비스 사용 승인 대기로 진행하지 못했습니다.',
      '이 영상에서는 준비한 실습 내용과 실제 애저에서 확인한 결과를 분명하게 구분합니다.',
    ],
    source: '실제 실행 보고서 · artifacts/azure-preflight.json',
  },
  {
    title: 'Discovery의 핵심은 근거 기반 연구의 반복',
    subtitle: '2026년 6월 2일 클라우드 서비스 GA · 데스크톱 앱은 Preview',
    label: '제품 개념 설명',
    html: '<img class="architecture" src="/architecture.svg" alt="Discovery architecture">',
    narration: [
      '디스커버리 클라우드는 이천이십육년 유월 이일에 일반 공개되었습니다.',
      '개별 질문에 답하는 챗봇을 넘어, 근거 검색과 전문 에이전트, 계산 도구, 검증 작업을 연결합니다.',
      '연구자는 방향과 판단 기준을 정하고, 디스커버리 엔진이 작업의 의존관계와 결과를 관리합니다.',
    ],
    source: '공식 GA 발표 + Microsoft Learn: Discovery Engine / Studio',
  },
  {
    title: '시나리오: 가상의 방열판 소재 8개 비교',
    subtitle: '자체 작성한 TXT 문서 4개 + CSV · 실제 고객 데이터나 실험 결과가 아닙니다.',
    label: '로컬 정답 기준',
    html: `<table><thead><tr><th>후보</th><th>기대 점수</th><th>핵심 판단</th></tr></thead><tbody><tr><td>DELTA</td><td class="green">68.6</td><td>1위 · 제약조건 모두 충족</td></tr><tr><td>ALPHA</td><td class="green">67.8</td><td>2위 · 제약조건 모두 충족</td></tr><tr><td>GAMMA</td><td>탈락</td><td>최신 정정값 175 적용</td></tr><tr><td>ZETA</td><td class="amber">검토 필요</td><td>부식 결과 누락 ≠ 통과</td></tr></tbody></table><div class="wide">원가 상한을 5 → 3 USD/kg으로 바꾸면 DELTA만 적격입니다.</div>`,
    narration: [
      '실습 데이터는 가상의 방열판 소재 여덟 개입니다.',
      '열전도율과 밀도, 원가, 재활용 함량, 부식 결과를 동시에 평가합니다.',
      '로컬 기준 계산의 상위 두 후보는 델타와 알파입니다.',
      '감마는 최신 정정값을 적용해 탈락하고, 제타는 시험 근거가 없어 검토가 필요합니다.',
      '이 수치는 실습의 정답 기준이며, 애저에서 실행한 결과가 아닙니다.',
    ],
    source: '합성 입력: data/ · 로컬 계산: scripts/score_materials.py',
  },
  {
    title: 'Bookshelf → 전문 에이전트 → 실제 계산 도구',
    subtitle: '가이드에는 클릭 경로, 입력 프롬프트, 기대 결과, 실패 판정 기준을 제공합니다.',
    label: '가이드 설명 · 클라우드 미실행',
    html: `<div class="grid">${card('1. Bookshelf', '<p>TXT 문서 색인<br>최신 근거·충돌·결측 확인<br>원문 인용을 직접 검증</p>')}${card('2. 전문 에이전트', '<p>EvidenceAnalyst<br>ComputeAnalyst<br>ResearchReviewer</p>')}${card('3. CPU 계산 도구', '<p>결정적 Python 계산<br>실행 ID · 실제 로그<br>Storage Asset의 JSON</p>')}</div><div class="wide warn">에이전트가 “계산했습니다”라고 답해도, 실제 실행 ID와 산출물이 없으면 성공이 아닙니다.</div>`,
    narration: [
      '첫 번째 핵심 실습은 북셸프에 문서를 색인하고, 실제 원문 인용을 확인하는 것입니다.',
      '다음으로 근거 분석과 계산, 독립 검토를 담당하는 에이전트를 만듭니다.',
      '계산 도구는 슈퍼컴퓨터의 씨피유 노드에서 실행하고, 실제 작업 아이디와 로그, 제이슨 파일로 성공을 확인합니다.',
      '현재 이 클라우드 단계들은 아직 실행하지 않았습니다.',
    ],
    source: '가이드 Lab 1~3 · Microsoft Learn: Bookshelf / Agents / Tools',
  },
  {
    title: 'Discovery Engine: 의존관계와 검증 기준',
    subtitle: 'Task를 먼저 만들고 Engine을 시작합니다. Chat 문맥이 자동 전달되지는 않습니다.',
    label: '가이드 설명 · 클라우드 미실행',
    html: `<div class="flow">${card('T1 · 근거 지도', '<p>8개 후보 · 문서 인용<br>GAMMA 정정<br>ZETA 결측</p>')}<div class="arrow">→</div>${card('T2 · 도구 실행', '<p>실제 CPU 계산<br>실행 ID · JSON<br>점수와 제약 검증</p>')}<div class="arrow">→</div>${card('T3 · 독립 검토', '<p>근거와 계산 대조<br>탈락·결측 설명<br>한계와 사람의 검토</p>')}</div><div class="wide"><span class="green">사람의 피드백</span> → 원가 상한 수정 → 새 실행 ID → 변경 전후 결과 보존</div>`,
    narration: [
      '디스커버리 엔진 실습에서는 근거 지도, 실제 계산, 독립 검토 작업을 순서와 의존관계로 연결합니다.',
      '각 작업에는 성공을 판단할 수 있는 구체적인 검증 요건을 넣습니다.',
      '이후 사람이 원가 상한을 수정하면 새 작업으로 다시 평가하고, 이전 결과와 비교합니다.',
      '채팅과 작업의 문맥은 분리되므로 필요한 조건을 작업에도 명시해야 합니다.',
    ],
    source: '가이드 Lab 4~5 · Microsoft Learn: Build shared sessions with cognition',
  },
  {
    type: 'evidence',
    title: '실제 Azure 실행 원본',
    subtitle: '',
    label: '실제 Azure 증거',
    html: '',
    narration: [
      '지금은 플레이라이트 헤드리스로 실제 애저에 요청한 원본 녹화입니다.',
      '화면은 포털이 아니라 실제 응답을 보여주는 로컬 증거 뷰어입니다.',
      '지정 계정의 구독을 확인하고, 디스커버리 사용 승인 요청을 제출했습니다.',
      '응답은 펜딩, 즉 서비스 측 승인 대기였습니다.',
      '워크스페이스 조회는 두 공식 에이피아이 버전 모두 리소스 유형 오류로 실패했습니다.',
    ],
    source: `실제 원본 녹화 재생 · ${report.runId}`,
  },
  {
    title: '중단 사유는 비용이 아니라 서비스 측 승인',
    subtitle: '사용자의 비용 허용은 반영했습니다. Microsoft의 allow-list 승인을 대신할 수는 없습니다.',
    label: '실제 상태와 비용',
    html: `<div class="grid">${card('Provider', '<p class="big green">Registered</p><p>등록 요청과 상태 확인 완료</p>')}${card('DefaultFeature', '<p class="big amber">Pending</p><p>Microsoft 측 검토 필요</p>')}${card('유료 인프라 생성', '<p class="big">0개</p><p>Workspace · Bookshelf<br>Supercomputer 미생성</p>')}</div><div class="wide warn">승인 후에는 상시 인프라 과금에 주의합니다. Engine 중지 ≠ 모든 Azure 과금 중지.</div>`,
    narration: [
      '사용자가 비용 발생을 허용했지만, 현재의 중단 사유는 비용이 아니라 서비스 측 승인입니다.',
      '프로바이더 등록은 완료되었고, 사용 승인 요청은 대기 상태입니다.',
      '불필요한 과금을 막기 위해 유료 디스커버리 인프라는 생성하지 않았습니다.',
      '승인 후에는 엔진을 중지하더라도 북셸프와 관리 인프라의 고정비가 남을 수 있다는 점을 확인해야 합니다.',
    ],
    source: '실제 ARM 응답 · 공식 Discovery quota / Bookshelf 문서',
  },
  {
    title: '재개 순서와 전달 파일',
    subtitle: '현재 상태를 숨기지 않고, 승인 후 같은 가이드에서 이어갈 수 있도록 구성했습니다.',
    label: '다음 필수 단계',
    html: `<div class="grid">${card('1. Microsoft 승인', '<p>구독 활성화 요청<br>DefaultFeature 승인 확인<br>Provider 변경 전파</p>')}${card('2. 환경 준비', '<p>정상 MFA 로그인<br>IAM · 모델 quota 확인<br>최소 실습 인프라 구성</p>')}${card('3. 핵심 실습 재개', '<p>Lab 0~6 실행<br>클라우드 증거 수집<br>실제 기능 영상 녹화</p>')}</div><div class="wide small">가이드: docs/labs/MICROSOFT-DISCOVERY-LAB.ko.html<br>실행 보고서: docs/reports/EXECUTION-REPORT.ko.html<br>요약 영상과 실제 응답: artifacts/</div>`,
    narration: [
      '재개하려면 먼저 마이크로소프트 담당자를 통해 구독 승인을 받아야 합니다.',
      '정상 로그인과 권한, 모델 할당량을 확인한 뒤 가이드의 실습을 진행하면 됩니다.',
      '한국어 가이드, 합성 데이터와 도구 코드, 실제 실행 보고서, 원본 증거와 이 요약 영상을 함께 저장했습니다.',
    ],
    source: '실행 보고서의 승인 요청 정보 · 정상 승인·인증 절차만 사용',
  },
];

async function probe(path) {
  const { stdout } = await exec('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'json', path,
  ], { timeout: 30000 });
  return JSON.parse(stdout).format;
}

const livePath = resolve(root, report.recording);
const liveDuration = Number((await probe(livePath)).duration);
let timeline = 0;
for (let index = 0; index < scenes.length; index++) {
  const scene = scenes[index];
  scene.index = index;
  scene.total = scenes.length;
  scene.audio = resolve(narrationDir, `scene-${index + 1}.aiff`);
  const textPath = resolve(narrationDir, `scene-${index + 1}.txt`);
  await writeFile(textPath, scene.narration.join('\n'), 'utf8');
  await exec('say', ['-v', 'Yuna', '-r', '175', '-f', textPath, '-o', scene.audio], { timeout: 120000 });
  scene.audioDuration = Number((await probe(scene.audio)).duration);
  scene.duration = Math.max(scene.audioDuration + 1.2, scene.type === 'evidence' ? liveDuration + 0.5 : 12);
  scene.start = timeline;
  const characters = scene.narration.reduce((sum, text) => sum + text.length, 0);
  let start = 0;
  scene.captions = scene.narration.map((text) => {
    const duration = scene.audioDuration * text.length / characters;
    const caption = { text, start, end: start + duration };
    start += duration;
    return caption;
  });
  timeline += scene.duration;
}

const files = new Map([
  ['/', { type: 'text/html; charset=utf-8', data: await readFile(resolve(root, 'video/summary.html')) }],
  ['/architecture.svg', { type: 'image/svg+xml', data: await readFile(resolve(root, 'assets/discovery-architecture.svg')) }],
  ['/live.webm', { type: 'video/webm', data: await readFile(livePath) }],
]);
const server = createServer((request, response) => {
  const file = files.get(request.url);
  if (!file) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range ?? '');
  if (match) {
    const start = Number(match[1]);
    const end = Math.min(match[2] ? Number(match[2]) : file.data.length - 1, file.data.length - 1);
    if (start > end) {
      response.writeHead(416, { 'Content-Range': `bytes */${file.data.length}` });
      response.end();
      return;
    }
    response.writeHead(206, {
      'Content-Type': file.type, 'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${file.data.length}`, 'Accept-Ranges': 'bytes',
    });
    response.end(file.data.subarray(start, end + 1));
  } else {
    response.writeHead(200, { 'Content-Type': file.type, 'Content-Length': file.data.length, 'Accept-Ranges': 'bytes' });
    response.end(file.data);
  }
});
await new Promise((accept, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', accept);
});
const url = `http://127.0.0.1:${server.address().port}`;
if (!(await fetch(url)).ok) throw new Error('Local recording server is not responsive');

let browser;
let context;
let video;
const rawPath = resolve(rawDir, 'summary.webm');
try {
  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  context = await browser.newContext({
    viewport: { width: 1600, height: 900 }, locale: 'ko-KR',
    recordVideo: { dir: rawDir, size: { width: 1600, height: 900 } },
  });
  const page = await context.newPage();
  video = page.video();
  await page.goto(url);
  await page.waitForFunction(() => typeof window.present === 'function');
  for (const scene of scenes) {
    await page.evaluate((value) => window.present(value), scene);
    const layout = await page.evaluate(() => {
      const main = document.querySelector('main');
      const caption = document.querySelector('#caption');
      return { contentFits: main.scrollHeight <= main.clientHeight, captionFits: caption.scrollHeight <= 94 };
    });
    if (!layout.contentFits || !layout.captionFits) {
      throw new Error(`Scene ${scene.index + 1} overflows the recording viewport: ${JSON.stringify(layout)}`);
    }
    await page.screenshot({ path: resolve(frameDir, `${String(scene.index + 1).padStart(2, '0')}.png`) });
    console.log(`Recording ${scene.index + 1}/${scenes.length}: ${scene.duration.toFixed(1)}s`);
    await page.waitForTimeout(Math.ceil(scene.duration * 1000));
  }
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  await new Promise((accept, reject) => server.close((error) => error ? reject(error) : accept()));
}
await rename(await video.path(), rawPath);

const output = resolve(artifacts, 'microsoft-discovery-summary.ko.mp4');
const audioFilters = scenes.map((scene, index) =>
  `[${index + 1}:a]aresample=48000,aformat=channel_layouts=stereo,apad,atrim=duration=${scene.duration.toFixed(4)}[a${index}]`);
audioFilters.push(`${scenes.map((_, index) => `[a${index}]`).join('')}concat=n=${scenes.length}:v=0:a=1[narration]`);
await exec('ffmpeg', [
  '-y', '-loglevel', 'error', '-i', rawPath,
  ...scenes.flatMap((scene) => ['-i', scene.audio]),
  '-filter_complex', audioFilters.join(';'),
  '-map', '0:v:0', '-map', '[narration]',
  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart',
  '-shortest', output,
], { timeout: 240000, maxBuffer: 2 * 1024 * 1024 });

function timestamp(seconds, separator = ',') {
  const milliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor(milliseconds / 60000) % 60;
  const wholeSeconds = Math.floor(milliseconds / 1000) % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(wholeSeconds).padStart(2, '0')}${separator}${String(milliseconds % 1000).padStart(3, '0')}`;
}
const cues = scenes.flatMap((scene) => scene.captions.map((caption) => ({
  text: caption.text, start: scene.start + caption.start, end: scene.start + caption.end,
})));
await writeFile(resolve(artifacts, 'microsoft-discovery-summary.ko.srt'),
  cues.map((cue, index) => `${index + 1}\n${timestamp(cue.start)} --> ${timestamp(cue.end)}\n${cue.text}\n`).join('\n'));
await writeFile(resolve(artifacts, 'microsoft-discovery-summary.ko.vtt'),
  `WEBVTT\n\n${cues.map((cue) => `${timestamp(cue.start, '.')} --> ${timestamp(cue.end, '.')}\n${cue.text}\n`).join('\n')}`);
await writeFile(resolve(artifacts, 'microsoft-discovery-summary-transcript.ko.txt'),
  scenes.map((scene) => `[${timestamp(scene.start, '.')}]\n${scene.title}\n${scene.narration.join('\n')}\n`).join('\n'));
const metadata = {
  output: relative(root, output),
  status: 'Guide and authentic Azure access-check summary; core Discovery labs blocked',
  sourceRunId: report.runId,
  sourceRecording: report.recording,
  narration: { method: 'Local macOS text-to-speech', voice: 'Yuna', language: 'ko-KR' },
  subtitles: 'Korean on-screen captions plus sidecar SRT/VTT; sentence timing estimated from narration length',
  chapters: scenes.map((scene) => ({ title: scene.title, start: scene.start, duration: scene.duration })),
  media: await probe(output),
};
await writeFile(resolve(artifacts, 'video-metadata.json'), JSON.stringify(metadata, null, 2));
const chapterLinks = scenes.map((scene) =>
  `<button data-start="${scene.start.toFixed(3)}">${timestamp(scene.start, '.').slice(0, 8)} · ${scene.title}</button>`).join('\n');
await writeFile(resolve(artifacts, 'watch-summary.html'), `<!doctype html><html lang="ko"><meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1"><title>Microsoft Discovery 실습 요약</title>
  <style>body{max-width:1120px;margin:35px auto;padding:0 22px;font:17px/1.7 -apple-system,"Apple SD Gothic Neo",sans-serif;color:#18344e;background:#f1f5fa}
  video{width:100%;border-radius:12px;background:#071627}button{display:block;width:100%;padding:13px 17px;text-align:left;border:1px solid #ccdae8;background:white;font:inherit;cursor:pointer}
  .notice{padding:17px 23px;background:#fff0cf;border-radius:10px}a{color:#1264ab}</style>
  <h1>Microsoft Discovery 실습 가이드 · 실제 Azure 접근 점검</h1>
  <p class="notice"><b>핵심 클라우드 실습은 Microsoft 측 승인 대기로 미완료입니다.</b><br>이 영상은 가이드 설명과 실제 ARM 요청 기록이며, Discovery Studio 완료 시연이 아닙니다.</p>
  <video id="video" controls preload="metadata" poster="summary-frames/01.png">
  <source src="microsoft-discovery-summary.ko.mp4" type="video/mp4">
  <track kind="subtitles" src="microsoft-discovery-summary.ko.vtt" srclang="ko" label="한국어"></video>
  <p><a href="../docs/labs/MICROSOFT-DISCOVERY-LAB.ko.html">실습 가이드</a> · <a href="../docs/reports/EXECUTION-REPORT.ko.html">실행 보고서</a> · <a href="microsoft-discovery-summary.ko.mp4" download>MP4 저장</a></p>
  <h2>구간 바로가기</h2>${chapterLinks}
  <script>document.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{const video=document.getElementById('video');video.currentTime=Number(button.dataset.start);video.scrollIntoView({behavior:'smooth',block:'center'});video.play();}));</script></html>`);
console.log(JSON.stringify({ output: metadata.output, durationSeconds: metadata.media.duration, chapters: scenes.length }));
