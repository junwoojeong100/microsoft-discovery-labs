import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const mermaidRoot = resolve(root, 'node_modules/mermaid/dist');
const reviewDir = resolve(root, 'artifacts/architecture-review');
await mkdir(reviewDir, { recursive: true });
const names = ['discovery-platform', 'discovery-bookshelf', 'discovery-security'];
const packageInfo = JSON.parse(await readFile(resolve(root, 'node_modules/mermaid/package.json'), 'utf8'));
const rendererHtml = `<!doctype html><html lang="en"><meta charset="utf-8">
<title>Local Discovery architecture rendering</title>
<style>body{margin:0;background:white;font-family:Arial,"Apple SD Gothic Neo",sans-serif}main{padding:20px;width:1600px}svg{display:block;margin:auto}</style>
<main></main>
<script type="module">
import mermaid from '/mermaid/mermaid.esm.min.mjs';
mermaid.initialize({
  startOnLoad:false, securityLevel:'strict', htmlLabels:false, markdownAutoWrap:false, theme:'base',
  themeVariables:{fontFamily:'Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',fontSize:'18px',primaryColor:'#e8f1ff',primaryTextColor:'#18344e',primaryBorderColor:'#3974a6',lineColor:'#597a97',clusterBkg:'#f5f8fc',clusterBorder:'#a6bdd2'},
  flowchart:{curve:'linear',nodeSpacing:38,rankSpacing:55,padding:18,wrappingWidth:320,minNodeWidth:200,useMaxWidth:true}
});
window.mermaid = mermaid;
window.rendererReady = true;
</script></html>`;

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405);
    response.end('Method not allowed');
    return;
  }
  const path = new URL(request.url, 'http://127.0.0.1').pathname;
  if (path === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(rendererHtml);
    return;
  }
  if (!path.startsWith('/mermaid/')) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const filename = resolve(mermaidRoot, path.slice('/mermaid/'.length));
  if (!filename.startsWith(`${mermaidRoot}${sep}`)) {
    response.writeHead(403);
    response.end('Outside renderer assets');
    return;
  }
  try {
    const content = await readFile(filename);
    const type = extname(filename) === '.json' ? 'application/json' : 'text/javascript; charset=utf-8';
    response.writeHead(200, { 'Content-Type': type });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      response.writeHead(404);
      response.end('Renderer asset not found');
    } else {
      console.error(`Renderer asset error: ${error.message}`);
      response.writeHead(500);
      response.end('Renderer asset error');
    }
  }
});
await new Promise((accept, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', accept);
});
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
let context;
const externalRequests = [];
const rendered = [];
try {
  assert.equal((await fetch(origin)).status, 200);
  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  context = await browser.newContext({ viewport: { width: 1640, height: 1200 } });
  await context.route(/^https?:\/\//, async (route) => {
    if (new URL(route.request().url()).origin !== origin) {
      externalRequests.push(route.request().url());
      await route.abort('blockedbyclient');
    } else {
      await route.continue();
    }
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(origin);
  await page.waitForFunction(() => window.rendererReady === true);
  for (const language of ['ko', 'en']) {
    const markdown = await readFile(resolve(root, `MICROSOFT-DISCOVERY-ARCHITECTURE.${language}.md`), 'utf8');
    const diagrams = [...markdown.matchAll(/```mermaid\n([\s\S]*?)\n```/g)].map((match) => match[1]);
    assert.equal(diagrams.length, names.length);
    for (const [index, definition] of diagrams.entries()) {
      const id = `discovery_${language}_${index}`;
      const result = await page.evaluate(async ({ definition, id, language }) => {
        await window.mermaid.parse(definition);
        const output = await window.mermaid.render(id, definition);
        document.querySelector('main').innerHTML = output.svg;
        await document.fonts.ready;
        const svg = document.querySelector('main svg');
        svg.setAttribute('lang', language);
        const viewBox = svg.viewBox.baseVal;
        const pixelWidth = Math.ceil(viewBox.width);
        const pixelHeight = Math.ceil(viewBox.height);
        svg.setAttribute('width', String(pixelWidth));
        svg.setAttribute('height', String(pixelHeight));
        svg.style.removeProperty('max-width');
        const inverseRoot = svg.getScreenCTM().inverse();
        const outside = [...svg.querySelectorAll('text')].filter((text) => {
          const box = text.getBBox();
          const transform = inverseRoot.multiply(text.getScreenCTM());
          const corners = [
            [box.x, box.y], [box.x + box.width, box.y],
            [box.x, box.y + box.height], [box.x + box.width, box.y + box.height],
          ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(transform));
          return corners.some((point) => point.x < viewBox.x - 3 || point.y < viewBox.y - 3
            || point.x > viewBox.x + viewBox.width + 3 || point.y > viewBox.y + viewBox.height + 3);
        }).map((text) => text.textContent);
        const source = new XMLSerializer().serializeToString(svg);
        const embedded = new Image();
        embedded.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
        await embedded.decode();
        return {
          svg: source,
          width: viewBox.width,
          height: viewBox.height,
          nodes: svg.querySelectorAll('.node').length,
          textLabels: svg.querySelectorAll('text').length,
          foreignObjects: svg.querySelectorAll('foreignObject').length,
          pixelWidth,
          pixelHeight,
          embeddedWidth: embedded.naturalWidth,
          embeddedHeight: embedded.naturalHeight,
          outside,
        };
      }, { definition, id, language });
      assert.ok(result.width > 0 && result.height > 0 && result.nodes > 0);
      assert.deepEqual(result.outside, [], `${language} ${names[index]} contains cropped labels`);
      assert.equal(result.foreignObjects, 0, 'Use portable SVG text labels, not embedded HTML');
      assert.ok(result.textLabels >= result.nodes);
      assert.equal(result.embeddedWidth, result.pixelWidth, 'SVG has an unreadable default intrinsic width');
      assert.equal(result.embeddedHeight, result.pixelHeight);
      const asset = `assets/${names[index]}.${language}.svg`;
      await writeFile(resolve(root, asset), result.svg);
      await page.locator('main svg').screenshot({ path: resolve(reviewDir, `${names[index]}.${language}.png`) });
      rendered.push({
        language, asset, width: result.width, height: result.height,
        nodes: result.nodes, textLabels: result.textLabels, croppedLabels: result.outside.length,
        foreignObjects: result.foreignObjects,
        embeddedWidth: result.embeddedWidth,
        embeddedHeight: result.embeddedHeight,
      });
    }
  }
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(externalRequests, []);
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  await new Promise((accept, reject) => server.close((error) => error ? reject(error) : accept()));
}

const report = {
  checkedAt: new Date().toISOString(),
  scope: 'Local Mermaid parsing and rendering; no Azure resource inventory or mutation',
  renderer: { package: 'mermaid', version: packageInfo.version, productDependency: false },
  azureOperationsPerformed: false,
  externalNetworkRequests: externalRequests.length,
  diagrams: rendered,
};
await writeFile(resolve(reviewDir, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
