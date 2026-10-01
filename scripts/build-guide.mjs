import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { marked } from 'marked';

const root = fileURLToPath(new URL('..', import.meta.url));
const documents = [
  {
    filename: 'MICROSOFT-DISCOVERY-LAB.en.md',
    language: 'en',
    title: 'Microsoft Discovery Core Capabilities Hands-on Guide',
    label: '10 core labs + 2 extensions',
    banner: 'Execution-informed guide · Matching Korean/English criteria · See the execution report for blocked and completed stages',
    tocLabel: 'Contents',
    printLabel: 'Print / PDF',
  },
  {
    filename: 'MICROSOFT-DISCOVERY-LAB.ko.md',
    language: 'ko',
    title: 'Microsoft Discovery 핵심 기능 실습 가이드',
    label: '핵심 10개 Lab + 확장 2개',
    banner: '실제 배포 경험 반영 · 국문/영문 동일 실습 기준 · 성공/차단 단계는 실행 보고서에서 확인',
    tocLabel: '목차',
    printLabel: '인쇄 / PDF',
  },
  {
    filename: 'EXECUTION-REPORT.ko.md',
    language: 'ko',
    title: 'Microsoft Discovery 실제 실행 보고서',
    label: '실제 Azure 배포와 차단 원인',
    banner: '리소스 생성·실행 성공·차단 상태를 분리해 기록합니다. 과거 기록은 날짜를 구분해 읽으세요.',
    tocLabel: '목차',
    printLabel: '인쇄 / PDF',
  },
];

async function buildDiagrams() {
  const english = await readFile(resolve(root, 'assets/discovery-architecture.svg'), 'utf8');
  const labels = new Map([
    ['Microsoft Discovery hands-on architecture', 'Microsoft Discovery 실습 아키텍처'],
    ['A researcher uses Discovery Studio. A workspace contains a project with specialized agents and the Discovery Engine. Agents use Bookshelf and a supercomputer. Evidence and results are persisted to Azure Storage.', '연구자는 Discovery Studio에서 전문 에이전트와 Discovery Engine을 사용합니다. 에이전트는 Bookshelf와 Supercomputer에 연결되며 근거와 결과는 Azure Storage에 보존됩니다.'],
    ['Microsoft Discovery | Evidence-driven scientific workflow', 'Microsoft Discovery | 근거 기반 연구 흐름'],
    ['Researcher', '연구자'],
    ['Human review', '사람의 검토'],
    ['Workspace / Project / Shared session', '워크스페이스 / 프로젝트 / 공유 세션'],
    ['Tasks + dependencies + validation + feedback', '작업 + 의존관계 + 검증 + 피드백'],
    ['Grounded findings', '근거 기반 분석'],
    ['Tool execution', '실제 도구 실행'],
    ['Quality gates', '품질 검증'],
    ['Foundry models', 'Foundry 모델'],
    ['Workspace deployments', 'Workspace 모델 배포'],
    ['Task validation model', '작업 검증 모델'],
    ['Private documents + LazyGraphRAG', '문서 + LazyGraphRAG'],
    ['Citations and evidence conflicts', '원문 인용과 근거 충돌'],
    ['Supercomputer + CPU tool', 'Supercomputer + CPU 도구'],
    ['Deterministic ranking, logs, run ID', '결정적 계산 · 로그 · 실행 ID'],
    ['No GPU required for this exercise', '이 실습은 GPU 불필요'],
    ['Azure Storage / Governance', 'Azure Storage / 거버넌스'],
    ['Inputs, outputs, provenance, managed identity', '입출력 · 출처 · 관리 ID'],
    ['RBAC + network isolation + cost review', 'RBAC · 네트워크 격리 · 비용 확인'],
  ]);
  let korean = english.replace(
    'font-family:Arial,sans-serif;',
    'font-family:Arial,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;',
  );
  for (const [source, target] of labels) {
    if (!korean.includes(source)) throw new Error(`Diagram source label is missing: ${source}`);
    korean = korean.replaceAll(source, target);
  }
  await Promise.all([
    writeFile(resolve(root, 'assets/discovery-architecture.en.svg'), english),
    writeFile(resolve(root, 'assets/discovery-architecture.ko.svg'), korean),
  ]);
}

async function buildDocument(document) {
  const { filename, language, title, label, banner, tocLabel, printLabel } = document;
  const markdown = await readFile(resolve(root, filename), 'utf8');
  let index = 0;
  const headings = [];
  const renderer = new marked.Renderer();
  const renderLink = renderer.link;
  const renderTable = renderer.table;
  const renderParagraph = renderer.paragraph;
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const section = depth === 2 ? /^([SLEA]\d{2})\b/.exec(text)?.[1].toLowerCase() : undefined;
    const id = section ? `heading-${section}` : `section-${++index}`;
    if (depth === 2) headings.push({ id: section ?? id, text });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  renderer.link = function (token) {
    const target = documents.find((item) => item.filename === token.href);
    const html = renderLink.call(this, target ? { ...token, href: token.href.replace(/\.md$/, '.html') } : token);
    return /^S\d{2}$/.test(token.text) ? `<sup class="citation">[${html}]</sup>` : html;
  };
  renderer.table = function (token) {
    return `<div class="table-scroll">${renderTable.call(this, token)}</div>`;
  };
  renderer.paragraph = function (token) {
    const editionLinks = token.tokens.filter((item) => item.type === 'link');
    const isEditionSwitcher = editionLinks.length === 2
      && editionLinks.every((item) => /^MICROSOFT-DISCOVERY-LAB\.(ko|en)\.(md|html)$/.test(item.href))
      && token.tokens.every((item) => item.type === 'link' || item.type === 'text' && /^[\s·]*$/.test(item.text));
    const html = renderParagraph.call(this, token);
    return isEditionSwitcher ? `<div class="edition-links">${html}</div>` : html;
  };
  const content = marked.parse(markdown, { renderer, gfm: true });
  const toc = headings.map(({ id, text }) => `<a href="#${id}">${text}</a>`).join('\n');
  const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
  <style>
    :root{font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#15314a;background:#f3f6fa;font-size:16px;line-height:1.8}
    *{box-sizing:border-box}body{margin:0}aside{position:fixed;inset:0 auto 0 0;width:282px;background:#102c47;padding:28px 20px;overflow:auto;color:#fff}
    aside b{display:block;font-size:21px;margin-bottom:12px}aside a{display:block;color:#dbe9f8;text-decoration:none;padding:6px 0;font-size:13px;line-height:1.5}
    aside .label{font-size:14px;color:#bbd1e8}summary{cursor:pointer;font-weight:700;margin:16px 0 9px}.languages{display:flex;gap:12px;margin:15px 0}
    .languages a{border:1px solid #7894ae;border-radius:6px;padding:5px 10px;font-size:14px}.languages a[aria-current]{background:#e8f1fc;color:#102c47;font-weight:700}
    button{font:inherit;color:#e4effa;background:none;border:1px solid #7894ae;border-radius:6px;padding:6px 10px;cursor:pointer}
    main{max-width:1240px;margin-left:282px;padding:38px 52px 90px;background:white;min-height:100vh}
    h1{font-size:37px;line-height:1.35;letter-spacing:-1px;text-wrap:balance}h2{font-size:27px;border-top:1px solid #dfe7ef;padding-top:24px;margin-top:40px}
    h3{font-size:21px;margin-top:30px}h4{font-size:18px}a{color:#1264ab}a[id]{display:block;scroll-margin-top:15px}img{max-width:100%;height:auto}
    p,li{overflow-wrap:anywhere}:lang(ko) p,:lang(ko) li{word-break:keep-all}.citation{font-size:.75em;white-space:nowrap;margin-left:.16em}.table-scroll{max-width:100%;overflow-x:auto;margin:18px 0}
    table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #dbe5ef;text-align:left;padding:10px 12px;vertical-align:top;overflow-wrap:anywhere}th{background:#edf4fc}
    code{background:#eef3f8;border-radius:4px;padding:2px 4px;font-family:ui-monospace,Menlo,monospace;font-size:.88em;overflow-wrap:anywhere}
    pre{background:#102c47;color:#e9f2ff;border-radius:10px;padding:19px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}
    pre code{background:none;color:inherit;padding:0}blockquote{border-left:4px solid #d09321;background:#fff7e5;margin:20px 0;padding:7px 20px}
    .banner{background:#e9f1fc;border:1px solid #cdddf0;border-radius:10px;padding:12px 16px;font-size:14px}.skip{position:absolute;left:-10000px}.skip:focus{left:300px;top:8px;background:white;z-index:2}
    @media(max-width:1000px){aside{position:static;width:auto;padding:20px}main{margin:0;padding:24px 20px}h1{font-size:30px}h2{font-size:24px}aside .languages{margin:12px 0}}
    @media print{
      :root{font-size:10pt;line-height:1.6;background:white}aside,.banner,.skip,.edition-links{display:none}main{margin:0;padding:0;max-width:none;min-height:0}
      h1{font-size:25pt}h2{font-size:18pt;margin-top:23pt;padding-top:12pt}h3{font-size:13pt}h1,h2,h3,h4{break-after:avoid-page}
      .table-scroll{overflow:visible}table{font-size:8.3pt}thead{display:table-header-group}tr{break-inside:avoid}th,td{padding:6pt}
      pre,blockquote,img{break-inside:avoid}pre{font-size:8pt}a{color:#15314a}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
  </style>
</head>
<body>
  <a class="skip" href="#main">${language === 'ko' ? '본문으로 이동' : 'Skip to content'}</a>
  <aside><b>Microsoft Discovery</b><span class="label">${label}</span>
    <nav class="languages" aria-label="${language === 'ko' ? '언어 선택' : 'Language'}">
      <a href="MICROSOFT-DISCOVERY-LAB.en.html" data-language="en"${filename.includes('LAB.en') ? ' aria-current="page"' : ''}>English</a>
      <a href="MICROSOFT-DISCOVERY-LAB.ko.html" data-language="ko"${filename.includes('LAB.ko') ? ' aria-current="page"' : ''}>한국어</a>
    </nav>
    <button id="print" type="button">${printLabel}</button>
    <details id="toc" open><summary>${tocLabel}</summary><nav aria-label="${tocLabel}">${toc}</nav></details>
  </aside>
  <main id="main"><div class="banner">${banner}</div>${content}</main>
  <script>
    document.getElementById('print').addEventListener('click', () => window.print());
    const media = matchMedia('(max-width: 1000px)');
    const adjustToc = () => { document.getElementById('toc').open = !media.matches; };
    adjustToc();
    media.addEventListener('change', adjustToc);
    document.querySelectorAll('[data-language]').forEach(link => link.addEventListener('click', () => {
      const hash = /^#[slea][0-9]{2}$/.test(location.hash) ? location.hash : '';
      link.href = 'MICROSOFT-DISCOVERY-LAB.' + link.dataset.language + '.html' + hash;
    }));
  </script>
</body>
</html>`;
  await writeFile(resolve(root, filename.replace(/\.md$/, '.html')), html);
  console.log(`${filename}: ${headings.length} sections, ${markdown.length} source characters`);
}

await buildDiagrams();
await Promise.all(documents.map(buildDocument));
