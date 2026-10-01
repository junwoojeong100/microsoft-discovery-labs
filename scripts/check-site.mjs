import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const site = resolve(root, 'site');
const manifest = JSON.parse(await readFile(resolve(site, 'manifest.json'), 'utf8'));
const allowedFiles = new Set([...manifest.files, 'manifest.json', '.nojekyll']);
async function assertCurated(directory = '') {
  for (const entry of await readdir(resolve(site, directory), { withFileTypes: true })) {
    const path = directory ? `${directory}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await assertCurated(path);
    else assert.ok(allowedFiles.has(path), `Unlisted publication file: ${path}`);
  }
}
await assertCurated();
for (const directory of ['artifacts', 'config', 'infra', 'node_modules', '.azure', '.git']) {
  await assert.rejects(access(resolve(site, directory)), { code: 'ENOENT' });
}
const errors = [];
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const filename = resolve(site, `.${pathname.endsWith('/') ? pathname + 'index.html' : pathname}`);
  if (!filename.startsWith(site + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(filename);
    response.writeHead(200, { 'Content-Type': extname(filename) === '.svg' ? 'image/svg+xml' : 'text/html; charset=utf-8' });
    response.end(body);
  } catch (error) {
    if (error.code !== 'ENOENT') errors.push(error.message);
    response.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
  }
});
await new Promise((accept, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', accept); });
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
let context;
try {
  assert.equal((await fetch(origin)).status, 200);
  browser = await chromium.launch({ headless: true, channel: 'chrome' });
  context = await browser.newContext();
  await context.route(/^https?:\/\//, route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  let checkedLinks = 0;
  for (const name of manifest.files.filter(name => name.endsWith('.html'))) {
    const response = await page.goto(`${origin}/${name}`);
    assert.equal(response.status(), 200, name);
    const links = await page.locator('a[href],img[src]').evaluateAll(nodes => nodes.map(node => ({
      url: node.href || node.src, image: node.tagName === 'IMG',
      loaded: node.tagName !== 'IMG' || node.complete && node.naturalWidth > 0,
    })));
    for (const link of links) {
      if (!link.url.startsWith(origin)) continue;
      const url = new URL(link.url);
      const target = resolve(site, `.${url.pathname}`);
      await access(target);
      if (url.hash) {
        const html = await readFile(target, 'utf8');
        assert.ok(html.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${name}: missing anchor ${url}`);
      }
      assert.equal(link.loaded, true, `${name}: broken image`);
      checkedLinks++;
    }
  }
  for (const width of [1600, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${origin}/docs/labs/MICROSOFT-DISCOVERY-LAB.ko.html`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ documents: manifest.files.filter(name => name.endsWith('.html')).length, checkedLinks, rawArtifactsPublished: false, desktopAndMobileOverflow: false }, null, 2));
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  await new Promise((accept, reject) => server.close(error => error ? reject(error) : accept()));
}
