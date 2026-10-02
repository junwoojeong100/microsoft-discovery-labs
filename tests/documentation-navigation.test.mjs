import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = fileURLToPath(new URL('..', import.meta.url));
const english = await readFile(resolve(root, 'README.md'), 'utf8');
const korean = await readFile(resolve(root, 'README.ko.md'), 'utf8');

function links(text) {
  const result = [];
  marked.walkTokens(marked.lexer(text), (token) => {
    if (token.type === 'link') result.push({ text: token.text, href: token.href });
  });
  return result;
}

test('README defaults to English and links to a separate Korean page', () => {
  assert.match(english, /^# Microsoft Discovery Labs\n/);
  assert.ok(links(english).some((link) => link.href === 'README.ko.md' && link.text === '한국어'));
  const withoutLanguageLink = english.replace('[한국어](README.ko.md)', '');
  assert.equal(/\p{Script=Hangul}/u.test(withoutLanguageLink), false);
  const primaryDocs = links(english).filter((link) => /\/MICROSOFT-DISCOVERY-(LAB|ARCHITECTURE)\./.test(link.href));
  assert.ok(primaryDocs.length >= 4);
  assert.ok(primaryDocs.every((link) => link.href.includes('.en.')));
});

test('Korean entry links back to English and selects Korean documents', () => {
  assert.match(korean, /^# Microsoft Discovery Labs 실습 자료\n/);
  assert.ok(links(korean).some((link) => link.href === 'README.md' && link.text === 'English'));
  const primaryDocs = links(korean).filter((link) => /\/MICROSOFT-DISCOVERY-(LAB|ARCHITECTURE)\./.test(link.href));
  assert.ok(primaryDocs.length >= 4);
  assert.ok(primaryDocs.every((link) => link.href.includes('.ko.')));
  for (const heading of korean.matchAll(/^## (.+)$/gm)) {
    assert.ok(/\p{Script=Hangul}/u.test(heading[1]));
  }
  assert.ok(!korean.includes('Both editions share'));
  assert.ok(!english.includes('## Local build /'));
});

test('entry-page links and local build instructions stay valid', async () => {
  const commands = (text) => [...text.matchAll(/```bash\n([\s\S]*?)\n```/g)].map((match) => match[1]);
  assert.deepEqual(commands(english), commands(korean));
  for (const text of [english, korean]) {
    for (const link of links(text)) {
      if (!/^(https?:|#|mailto:)/.test(link.href)) {
        await access(resolve(root, link.href.split('#')[0]));
      }
    }
  }
});

test('entry pages separate customer procedures from environment-specific deployment records', () => {
  for (const text of [english, korean]) {
    assert.ok(links(text).some(link => link.href === 'docs/deployment-reference/README.ko.md'));
    assert.ok(links(text).some(link => link.href === 'docs/reports/EXECUTION-REPORT.ko.md'));
    assert.ok(links(text).some(link => link.href === 'docs/deployment-reference/07-resource-inventory.ko.md'));
    assert.ok(!text.includes('2026-10-02 09:10 KST'));
    assert.ok(!text.includes('990,000'));
    assert.ok(!text.includes('Korea Central runtime'));
  }
});

test('both entry pages link to the live Pages site without claiming repository privacy', () => {
  const url = 'https://junwoojeong100.github.io/microsoft-discovery-labs/';
  for (const text of [english, korean]) {
    assert.ok(links(text).some((link) => link.href === url));
    assert.ok(text.includes('PAGES_ENABLED=true'));
  }
  assert.ok(english.includes('The repository and its committed history are public.'));
  assert.ok(korean.includes('저장소와 커밋 이력은 공개 상태입니다.'));
  assert.ok(!english.includes('Pages is not live'));
  assert.ok(!korean.includes('Pages는 아직 공개되지 않았습니다'));
});

test('repository HTML links open existing GitHub Pages documents rather than raw files', async () => {
  const base = 'https://junwoojeong100.github.io/microsoft-discovery-labs/';
  const documents = [
    'README.md', 'README.ko.md',
    'docs/labs/MICROSOFT-DISCOVERY-LAB.en.md',
    'docs/labs/MICROSOFT-DISCOVERY-LAB.ko.md',
    'docs/reports/EXECUTION-REPORT.ko.md',
  ];
  let checked = 0;
  for (const name of documents) {
    for (const { href } of links(await readFile(resolve(root, name), 'utf8'))) {
      if (!/\.html(?:[?#]|$)/.test(href)) continue;
      assert.ok(href.startsWith(base), `${name}: unpublished HTML link ${href}`);
      const path = href.slice(base.length).split(/[?#]/)[0];
      if (path !== 'evidence.html') {
        const source = path === 'index.html' ? 'README.md'
          : path === 'index.ko.html' ? 'README.ko.md' : path.replace(/\.html$/, '.md');
        await access(resolve(root, source));
      }
      checked++;
    }
  }
  assert.ok(checked >= 8);
});

test('English guides contain no Korean body text beyond translation links', async () => {
  for (const name of ['docs/labs/MICROSOFT-DISCOVERY-LAB.en.md', 'docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.en.md']) {
    const source = await readFile(resolve(root, name), 'utf8');
    const body = source.replace(/\[한국어\]\([^)]+\)/g, '');
    assert.equal(/\p{Script=Hangul}/u.test(body), false, `${name}: mixed-language body`);
  }
});

test('emphasis markup renders rather than leaking asterisks into customer-visible text', async () => {
  const documents = ['README.md', 'README.ko.md'];
  for (const directory of ['docs/labs', 'docs/architecture', 'docs/deployment-reference', 'docs/reports']) {
    for (const name of await readdir(resolve(root, directory))) {
      if (name.endsWith('.md')) documents.push(`${directory}/${name}`);
    }
  }
  for (const name of documents) {
    const text = await readFile(resolve(root, name), 'utf8');
    marked.walkTokens(marked.lexer(text), token => {
      if (token.type === 'text' && !token.tokens) {
        assert.ok(!token.text.includes('**'), `${name}: unrendered emphasis ${token.text}`);
      }
    });
  }
});
