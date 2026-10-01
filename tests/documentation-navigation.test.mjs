import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
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

test('English guides contain no Korean body text beyond translation links', async () => {
  for (const name of ['docs/labs/MICROSOFT-DISCOVERY-LAB.en.md', 'docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.en.md']) {
    const source = await readFile(resolve(root, name), 'utf8');
    const body = source.replace(/\[한국어\]\([^)]+\)/g, '');
    assert.equal(/\p{Script=Hangul}/u.test(body), false, `${name}: mixed-language body`);
  }
});
