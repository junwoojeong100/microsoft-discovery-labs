import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = fileURLToPath(new URL('..', import.meta.url));
const documents = Object.fromEntries(await Promise.all(['ko', 'en'].map(async (language) => [
  language, await readFile(resolve(root, `docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.${language}.md`), 'utf8'),
])));
const evidence = JSON.parse(await readFile(resolve(root, 'artifacts/discovery-architecture-evidence.json'), 'utf8'));
const blockList = (text, language) =>
  [...text.matchAll(new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\\n\`\`\``, 'g'))].map((match) => match[1]);
const references = (text) =>
  Object.fromEntries([...text.matchAll(/^\[(R\d{2})\]: (\S+)$/gm)].map((match) => [match[1], match[2]]));
const rowIds = (text, prefix) =>
  [...text.matchAll(new RegExp(`^\\| (${prefix}\\d{2}) \\|`, 'gm'))].map((match) => match[1]);

function topology(definition) {
  return {
    orientation: /^graph (TB|LR)$/m.exec(definition)?.[1],
    nodes: [...definition.matchAll(/^\s*([A-Z][A-Z0-9_]*)\["/gm)].map((match) => match[1]),
    groups: [...definition.matchAll(/^\s*subgraph ([A-Z][A-Z0-9_]*)\[/gm)].map((match) => match[1]),
    edges: [...definition.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s+(-->|==>|-\.->)\|[^|]+\|\s+([A-Z][A-Z0-9_]*)$/gm)]
      .map((match) => ({ source: match[1], type: match[2], target: match[3] })),
  };
}

test('architecture editions align on sections, service rows, versions, and impacts', () => {
  const anchors = (text) => [...text.matchAll(/<a id="([a-z]+)"><\/a>/g)].map((match) => match[1]);
  const expected = ['reading', 'architecture', 'bookshelf', 'services', 'versions', 'security', 'impact', 'observe', 'sources'];
  for (const text of Object.values(documents)) assert.deepEqual(anchors(text), expected);
  for (const [prefix, count] of [['D', 15], ['V', 9], ['I', 12]]) {
    const ids = Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`);
    assert.deepEqual(rowIds(documents.ko, prefix), ids);
    assert.deepEqual(rowIds(documents.en, prefix), ids);
  }
});

test('all diagrams have matching topology, declared endpoints and explicit edge labels', () => {
  const ko = blockList(documents.ko, 'mermaid').map(topology);
  const en = blockList(documents.en, 'mermaid').map(topology);
  assert.equal(ko.length, 3);
  assert.deepEqual(ko, en);
  for (const graph of en) {
    assert.ok(graph.nodes.length >= 8);
    assert.equal(new Set(graph.nodes).size, graph.nodes.length);
    assert.ok(graph.edges.length >= 8);
    for (const edge of graph.edges) {
      assert.ok(graph.nodes.includes(edge.source));
      assert.ok(graph.nodes.includes(edge.target));
    }
  }
  assert.ok(en[0].edges.some((edge) => edge.source === 'HPC' && edge.target === 'ACR' && edge.type === '-.->'));
  assert.ok(en[1].edges.some((edge) => edge.source === 'SEARCH' && edge.target === 'SQL'));
  assert.ok(en[2].edges.some((edge) => edge.source === 'CMK' && edge.target === 'LOG'));
});

test('architecture references resolve correctly in both languages', () => {
  assert.deepEqual(references(documents.ko), references(documents.en));
  assert.equal(Object.keys(references(documents.en)).length, 27);
  for (const [language, text] of Object.entries(documents)) {
    const urls = references(text);
    assert.equal(/(?:\[R\d{2}\]){2,}/.test(text), false);
    for (const match of text.matchAll(/\[(R\d{2})\]/g)) assert.ok(urls[match[1]]);
    marked.walkTokens(marked.lexer(text), (token) => {
      assert.notEqual(token.type, 'del', `${language}: unintended deletion markup`);
      if (token.type === 'link' && /^R\d{2}$/.test(token.text)) {
        assert.equal(token.href, urls[token.text]);
      }
    });
  }
});

test('version values remain classified rather than inventing a live runtime BOM', () => {
  assert.equal(evidence.azureOperationsPerformed, false);
  assert.equal(evidence.publicTemplate.commitPinned, false);
  assert.equal(evidence.publicTemplate.modelVersionExplicitlySet, false);
  assert.match(evidence.publicTemplate.sha256, /^[0-9a-f]{64}$/);
  const versions = [...new Set(evidence.publicTemplate.resourceApiVersions.map((value) => value.split('@')[1]))];
  const terms = [
    '2026-02-01-preview', 'gpt-5.4', 'gpt-5-4', 'gpt-5.2', 'gpt-5-mini', 'text-embedding-3-small',
    'modelVersion', 'versionUpgradeOption', 'currentKubernetesVersion', 'currentOrchestratorVersion',
    'nodeImageVersion', 'keyVersion', 'diskEncryptionSetId', 'Gen5', 'S1', 'E4', 'E8', 'E16',
    'GlobalStandard', 'DataZoneStandard', 'Standard_GRS', 'Standard_LRS', 'TLS1_2',
    evidence.publicTemplate.sha256,
  ];
  for (const text of Object.values(documents)) {
    for (const term of [...versions, ...terms]) assert.ok(text.includes(term), `Missing version/evidence term: ${term}`);
    assert.equal(/(?:AKS|Kubernetes).{0,30}\b1\.\d+\.\d+\b/.test(text), false, 'Unobserved Kubernetes patch pin');
  }
});

test('inspection commands match, parse as Bash, and contain only approved read operations', () => {
  const ko = blockList(documents.ko, 'bash');
  const en = blockList(documents.en, 'bash');
  assert.deepEqual(ko, en);
  assert.equal(en.length, 3);
  const allowed = [
    'az resource list', 'az resource show', 'az cognitiveservices account deployment list',
    'az aks show', 'az aks nodepool list',
  ];
  for (const source of en) {
    execFileSync('bash', ['-n'], { input: source, encoding: 'utf8' });
    const commands = source.split('\n').filter((line) => line.startsWith('az '));
    for (const command of commands) {
      assert.ok(allowed.some((prefix) => command.startsWith(`${prefix} `)), command);
      const full = source.slice(source.indexOf(command)).split(/\n\n/)[0];
      assert.ok(full.includes('--subscription "$SUBSCRIPTION_ID"'));
    }
    assert.equal(/\baz\b[\s\S]*\b(get-credentials|upgrade|create|delete|update|register)\b/.test(source), false);
  }
});

test('architecture cross-links point to existing Markdown companions', async () => {
  for (const [language, text] of Object.entries(documents)) {
    const directory = dirname(resolve(root, `docs/architecture/MICROSOFT-DISCOVERY-ARCHITECTURE.${language}.md`));
    const links = [];
    marked.walkTokens(marked.lexer(text), token => {
      if ((token.type === 'link' || token.type === 'image') && !/^(https?:|#)/.test(token.href)) links.push(token.href);
    });
    for (const link of links) {
      await access(resolve(directory, link.split('#')[0]));
    }
  }
});
