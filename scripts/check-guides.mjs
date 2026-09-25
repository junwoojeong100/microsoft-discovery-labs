import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const outputDir = resolve(root, 'artifacts/guide-review');
await mkdir(outputDir, { recursive: true });
const results = [];
const networkRequests = [];
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
await context.route(/^https?:\/\//, async (route) => {
  networkRequests.push(route.request().url());
  await route.abort('blockedbyclient');
});

async function inspect(page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    const brokenAnchors = [...document.querySelectorAll('a[href^="#"]')]
      .filter((anchor) => !document.getElementById(anchor.getAttribute('href').slice(1)))
      .map((anchor) => anchor.getAttribute('href'));
    const brokenImages = [...document.images].filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.getAttribute('src'));
    const body = document.querySelector('main').cloneNode(true);
    body.querySelectorAll('.edition-links').forEach((element) => element.remove());
    return {
      language: document.documentElement.lang,
      sections: document.querySelectorAll('h2').length,
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      brokenAnchors,
      brokenImages,
      pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      localLinks: [...document.querySelectorAll('a[href]')].map((anchor) => anchor.href)
        .filter((url) => url.startsWith('file:')),
      tocOpen: document.getElementById('toc').open,
      deletedTextNodes: document.querySelectorAll('del,s').length,
      languageOrder: [...document.querySelectorAll('[data-language]')].map((element) => element.dataset.language),
      bodyHasHangul: /\p{Script=Hangul}/u.test(body.textContent),
    };
  });
}

try {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const language of ['en', 'ko']) {
    const filename = `MICROSOFT-DISCOVERY-LAB.${language}`;
    await page.setViewportSize({ width: 1600, height: 1000 });
    await page.emulateMedia({ media: 'screen' });
    await page.goto(pathToFileURL(resolve(root, `${filename}.html`)).href);
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
    const desktop = await inspect(page);
    assert.equal(desktop.language, language);
    assert.equal(desktop.sections, 18);
    assert.deepEqual(desktop.duplicateIds, []);
    assert.deepEqual(desktop.brokenAnchors, []);
    assert.deepEqual(desktop.brokenImages, []);
    assert.equal(desktop.pageOverflow, false);
    assert.equal(desktop.tocOpen, true);
    assert.equal(desktop.deletedTextNodes, 0, 'Procedure contains unintended strikethrough');
    assert.deepEqual(desktop.languageOrder, ['en', 'ko']);
    if (language === 'en') assert.equal(desktop.bodyHasHangul, false, 'English guide contains Korean body text');
    for (const url of new Set(desktop.localLinks)) {
      const target = new URL(url);
      target.hash = '';
      await access(fileURLToPath(target));
    }
    await page.screenshot({ path: resolve(outputDir, `${language}-cover.png`) });
    await page.locator('#l06').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(outputDir, `${language}-engine.png`) });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    const mobile = await inspect(page);
    assert.equal(mobile.pageOverflow, false);
    assert.equal(mobile.tocOpen, false);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: resolve(outputDir, `${language}-mobile.png`) });

    await page.emulateMedia({ media: 'print' });
    await page.setViewportSize({ width: 680, height: 1123 });
    const print = await inspect(page);
    assert.equal(print.pageOverflow, false);
    const pdf = await page.pdf({
      path: resolve(root, `${filename}.pdf`),
      format: 'A4',
      printBackground: true,
      tagged: true,
      outline: true,
      displayHeaderFooter: true,
      margin: { top: '17mm', right: '15mm', bottom: '18mm', left: '15mm' },
      headerTemplate: '<div style="font-family:Arial,sans-serif;font-size:8px;width:100%;text-align:center;color:#526a80">Microsoft Discovery | 2026-09-25</div>',
      footerTemplate: '<div style="font-family:Arial,sans-serif;font-size:8px;width:100%;text-align:center;color:#526a80"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
    assert.ok(pdf.subarray(0, 5).equals(Buffer.from('%PDF-')));
    assert.ok(pdf.length > 50000, 'PDF is unexpectedly small');
    const pdfText = pdf.toString('latin1');
    const pages = [...pdfText.matchAll(/\/Type\s*\/Page\b/g)].length;
    assert.ok(pages > 0, 'PDF page objects were not found');
    assert.ok(/\/Outlines\b/.test(pdfText), 'PDF section bookmarks are missing');
    const localFileLinks = [...pdfText.matchAll(/\/URI\s*\((file:[^)]*)\)/g)].length;
    assert.equal(localFileLinks, 0, 'PDF contains machine-specific local file links');
    const markdown = await readFile(resolve(root, `${filename}.md`), 'utf8');
    results.push({
      language, sections: desktop.sections, officialSources: [...markdown.matchAll(/^\[S\d{2}\]: /gm)].length,
      localLinksChecked: new Set(desktop.localLinks).size,
      desktopOverflow: desktop.pageOverflow, mobileOverflow: mobile.pageOverflow,
      printOverflow: print.pageOverflow, pdfPages: pages, pdfBytes: pdf.length,
      pdfBookmarks: true, pdfLocalFileLinks: localFileLinks,
    });
  }

  await page.emulateMedia({ media: 'screen' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto(`${pathToFileURL(resolve(root, 'MICROSOFT-DISCOVERY-LAB.en.html')).href}#l04`);
  await page.locator('[data-language="ko"]').click();
  await page.waitForURL('**/MICROSOFT-DISCOVERY-LAB.ko.html#l04');
  assert.equal(await page.locator('html').getAttribute('lang'), 'ko');
  await page.locator('[data-language="en"]').click();
  await page.waitForURL('**/MICROSOFT-DISCOVERY-LAB.en.html#l04');
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.deepEqual(errors, []);
  assert.deepEqual(networkRequests, []);
} finally {
  await context.close();
  await browser.close();
}

const report = {
  checkedAt: new Date().toISOString(),
  scope: 'Local bilingual guide, link, layout, language-switch, and PDF verification only',
  azureOperationsPerformed: false,
  azureEndToEndValidated: false,
  languageSwitchPreservesLab: true,
  externalNetworkRequests: networkRequests.length,
  editions: results,
};
await writeFile(resolve(outputDir, 'validation.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
