import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, 'site');
const config = JSON.parse(await readFile(resolve(root, 'config/lab.json'), 'utf8'));
const documents = ['README.md', 'README.ko.md'];
for (const folder of ['docs/labs', 'docs/architecture', 'docs/reports', 'docs/deployment-reference']) {
  for (const name of await readdir(resolve(root, folder))) {
    if (name.endsWith('.md')) documents.push(`${folder}/${name}`);
  }
}
const sitePath = name => name === 'README.md' ? 'index.html'
  : name === 'README.ko.md' ? 'index.ko.html' : name.replace(/\.md$/, '.html');
const replacements = [
  [config.account, 'lab-user@example.invalid'],
  [config.subscriptionId, '00000000-0000-0000-0000-000000000000'],
  [config.tenantId, '11111111-1111-1111-1111-111111111111'],
  [config.subscriptionName, 'Example lab subscription'],
];
// This documented first-party app ID is a product constant, not a tenant object ID.
const publicControlPlaneAppId = '92c174ac-8e41-4815-a1b7-d81b19ab03ce';
function sanitize(text) {
  for (const [value, placeholder] of replacements) text = text.replaceAll(value, placeholder);
  return text
    .replace(/\b[a-z0-9._%+-]+@[a-z0-9.-]*onmicrosoft\.com\b/gi, 'lab-user@example.invalid')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      id => id.toLowerCase() === publicControlPlaneAppId ? id : '00000000-0000-0000-0000-000000000000')
    .replace(/\b[a-f0-9]{29,38}\b/gi, '[operation-id]')
    .replace(/\brg-discovery-hol-\d{8}\b/g, 'rg-discovery-lab')
    .replace(/\b(?:aif|srch|cosmos|mi|law|nsp|mrg|mobr|cae|app)-d[a-z0-9-]+(?:junwoosc|junwookc|bdnxfqaa|ym5ffvaa|bdnxfq|ym5ffv)[a-z0-9-]*\b/gi, 'example-managed-resource')
    .replace(/\b[a-z0-9-]*(?:junwoosc|junwookc|bdnxfqaa|ym5ffvaa)[a-z0-9-]*\b/gi, 'example-lab-resource');
}
function targetFor(href, source, destination) {
  if (/^https?:/.test(href)) {
    const url = new URL(href);
    if (url.hostname === 'portal.azure.com') return 'https://portal.azure.com/';
    if (url.hostname === 'studio.discovery.microsoft.com') return 'https://studio.discovery.microsoft.com/';
    if (url.hostname.endsWith('.services.ai.azure.com')) return 'https://ai.azure.com/';
    return sanitize(href);
  }
  if (/^(?:#|mailto:)/.test(href)) return sanitize(href);
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('/')) throw new Error(`Unexpected link scheme in ${source}: ${href}`);
  const [path, fragment = ''] = href.split('#', 2);
  const resolved = relative(root, resolve(root, dirname(source), path));
  if (documents.includes(resolved)) {
    return relative(dirname(destination), sitePath(resolved)) + (fragment ? `#${fragment}` : '');
  }
  if (resolved.startsWith('assets/')) return relative(dirname(destination), resolved) + (fragment ? `#${fragment}` : '');
  if (extname(resolved) === '.html' && documents.includes(resolved.replace(/\.html$/, '.md'))) {
    return relative(dirname(destination), sitePath(resolved.replace(/\.html$/, '.md'))) + (fragment ? `#${fragment}` : '');
  }
  return relative(dirname(destination), 'evidence.html');
}
const css = `:root{font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif;line-height:1.75;color:#18344e;background:#edf3fa}*{box-sizing:border-box}body{margin:0}header{background:#102c47;color:white;padding:18px max(5vw,20px)}header a{color:#e5f0ff;margin-right:24px}main{max-width:1120px;margin:auto;padding:32px;background:white;min-height:90vh}h1,h2,h3{line-height:1.4;text-wrap:balance}h2{margin-top:2em;border-top:1px solid #dbe5ef;padding-top:1em}p,li,td{overflow-wrap:anywhere}img{max-width:100%;height:auto}.notice{background:#fff5dc;border-left:4px solid #bd841d;padding:14px 18px}.tables{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{border:1px solid #dbe5ef;padding:10px;text-align:left;vertical-align:top}th{background:#edf4fc}pre{background:#102c47;color:#eef5ff;padding:18px;white-space:pre-wrap;overflow-wrap:anywhere;border-radius:7px}code{font-size:.88em}a{color:#146bb0}a[id]{scroll-margin-top:18px}@media(max-width:640px){main{padding:20px}h1{font-size:1.8rem}}@media print{header,.notice{display:none}main{padding:0}a{color:inherit}}`;
function page(language, title, content, prefix) {
  return `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${title}</title><style>${css}</style></head><body><header><a href="${prefix}index.html">Microsoft Discovery Labs</a><a href="${prefix}docs/labs/MICROSOFT-DISCOVERY-LAB.${language}.html">${language === 'ko' ? '고객·파트너 실습' : 'Customer lab'}</a><a href="${prefix}docs/deployment-reference/README.ko.html">${language === 'ko' ? '설치·운영 사례' : 'Deployment records (KO)'}</a><a href="${prefix}index.html">English</a><a href="${prefix}index.ko.html">한국어</a></header><main><p class="notice">${language === 'ko' ? '공개용 문서입니다. 계정·구독·환경 이름은 예시로 대체했습니다. 원본 실행 증거, 구성 파일 및 PDF는 이 사이트에 게시하지 않습니다.' : 'Public documentation edition. Account, subscription, and environment names are replaced with examples. Raw execution evidence, configuration files, and PDFs are not published here.'}</p>${content}</main></body></html>\n`;
}
await mkdir(output, { recursive: true });
await writeFile(resolve(output, '.nojekyll'), '');
const emitted = [];
for (const source of documents) {
  const destination = sitePath(source);
  const prefix = relative(dirname(destination), '.') + '/';
  const language = source.includes('.ko.') ? 'ko' : 'en';
  const text = sanitize(await readFile(resolve(root, source), 'utf8'));
  const renderer = new marked.Renderer();
  const link = renderer.link;
  const image = renderer.image;
  const table = renderer.table;
  renderer.link = function (token) {
    return link.call(this, { ...token, href: targetFor(token.href, source, destination) });
  };
  renderer.image = function (token) {
    return image.call(this, { ...token, href: targetFor(token.href, source, destination) });
  };
  renderer.table = function (token) { return `<div class="tables">${table.call(this, token)}</div>`; };
  const title = text.split('\n').find(line => line.startsWith('# '))?.slice(2) ?? 'Microsoft Discovery Labs';
  const html = page(language, title.replaceAll('&', '&amp;').replaceAll('<', '&lt;'), marked.parse(text, { renderer, gfm: true }), prefix);
  await mkdir(dirname(resolve(output, destination)), { recursive: true });
  await writeFile(resolve(output, destination), html);
  emitted.push(destination);
}
const assetDirectory = resolve(output, 'assets');
await mkdir(assetDirectory, { recursive: true });
for (const name of await readdir(resolve(root, 'assets'))) {
  if (!name.endsWith('.svg')) continue;
  const svg = await readFile(resolve(root, 'assets', name), 'utf8');
  if (/<script\b|javascript:/i.test(svg)) throw new Error(`Unexpected active SVG content: ${name}`);
  await copyFile(resolve(root, 'assets', name), resolve(assetDirectory, name));
  emitted.push(`assets/${name}`);
}
await writeFile(resolve(output, 'evidence.html'), page('en', 'Pages publication boundary', `<h1>Pages publication boundary</h1><p>This GitHub repository is public. The Pages site includes only curated documentation and excludes raw Azure responses, identity records, configuration files, infrastructure sources and PDF downloads. Excluding files from this site does not make the repository or its committed history private.</p><p>GitHub 저장소는 공개 상태입니다. Pages에는 정리된 문서만 게시하며 원본 Azure 응답·ID·설정·인프라 소스·PDF는 포함하지 않습니다. 사이트에서 제외해도 저장소와 커밋 이력이 비공개가 되는 것은 아닙니다.</p><p><a href="index.html">Back to the lab index</a></p>`, './'));
emitted.push('evidence.html');
await writeFile(resolve(output, 'manifest.json'), JSON.stringify({ generatedAt: new Date().toISOString(), files: emitted.sort(), rawArtifactsPublished: false, repositoryVisibilityChanged: false }, null, 2) + '\n');
for (const filename of emitted.filter(name => name.endsWith('.html'))) {
  const content = await readFile(resolve(output, filename), 'utf8');
  for (const [value] of replacements) if (content.includes(value)) throw new Error(`Unredacted account context in ${filename}`);
  if (/-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----|\beyJ[\w-]+\.[\w-]+\.[\w-]+|\/Users\/|\/var\/folders\//.test(content)) {
    throw new Error(`Unexpected private content in ${filename}`);
  }
}
console.log(JSON.stringify({ output: relative(root, output), documents: documents.length, files: emitted.length, rawArtifactsPublished: false }, null, 2));
