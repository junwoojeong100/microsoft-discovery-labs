import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { marked } from 'marked';

const root = fileURLToPath(new URL('..', import.meta.url));
const guides = Object.fromEntries(await Promise.all(['ko', 'en'].map(async (language) => [
  language, await readFile(resolve(root, `docs/labs/MICROSOFT-DISCOVERY-LAB.${language}.md`), 'utf8'),
])));
const expectedSections = [
  's00', 's01', 's02', ...Array.from({ length: 10 }, (_, i) => `l${String(i).padStart(2, '0')}`),
  'e01', 'e02', 'a01', 'a02', 'a03',
];
const reference = JSON.parse(execFileSync('python3', [
  resolve(root, 'scripts/score_materials.py'), '--input', resolve(root, 'data/materials.csv'),
], { encoding: 'utf8' }));

function blocks(text, language) {
  return [...text.matchAll(new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\\n\`\`\``, 'g'))].map((match) => match[1]);
}

function section(text, id) {
  const begin = text.indexOf(`<a id="${id}"></a>`);
  assert.ok(begin >= 0, `Missing section: ${id}`);
  const end = text.indexOf('<a id="', begin + 1);
  return text.slice(begin, end === -1 ? undefined : end);
}

function coverage(text) {
  return [...text.matchAll(/^\| (C\d{2}) \| [^|]+ \| ([^|]+) \|/gm)].map((match) => ({
    id: match[1], labs: match[2].match(/\b[LE]\d{2}\b/g),
  }));
}

function sources(text) {
  return Object.fromEntries([...text.matchAll(/^\[(S\d{2})\]: (\S+)$/gm)].map((match) => [match[1], match[2]]));
}

function taskGraph(text) {
  return [...text.matchAll(/^\| ([RT]\d) \| (.+)$/gm)].map((match) => {
    const cells = match[2].split('|').map((value) => value.trim()).filter(Boolean);
    return {
      id: match[1],
      parent: cells.length === 3 ? cells[0] : null,
      dependencies: (cells.length === 3 ? cells[1] : cells[0]).match(/\bT\d\b/g) ?? [],
    };
  });
}

test('both editions have identical stable section anchors and lab structure', () => {
  for (const [language, text] of Object.entries(guides)) {
    const anchors = [...text.matchAll(/<a id="([slea]\d{2})"><\/a>/g)].map((match) => match[1]);
    assert.deepEqual(anchors, expectedSections);
    assert.equal(new Set(anchors).size, anchors.length);
    const titles = [...text.matchAll(/^## ([SLEA]\d{2}) /gm)].map((match) => match[1].toLowerCase());
    assert.deepEqual(titles, anchors);
    const labels = language === 'ko'
      ? ['**목표:**', '**실행:**', '**완료 기준:**']
      : ['**Goal:**', '**Steps:**', '**Pass criteria:**'];
    for (const id of anchors.filter((item) => /^[le]/.test(item))) {
      for (const label of labels) assert.ok(section(text, id).includes(label), `${language} ${id}: ${label}`);
    }
  }
});

test('all twelve capability areas map to the same existing labs', () => {
  assert.deepEqual(coverage(guides.ko), coverage(guides.en));
  assert.deepEqual(coverage(guides.en).map((item) => item.id),
    Array.from({ length: 12 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`));
  for (const item of coverage(guides.en)) {
    assert.ok(item.labs.length > 0);
    for (const lab of item.labs) assert.ok(expectedSections.includes(lab.toLowerCase()));
  }
  assert.deepEqual(coverage(guides.en).find((item) => item.id === 'C02').labs, ['L02', 'L04', 'L06']);
});

test('the same 33 official references are used without unresolved source IDs', () => {
  assert.deepEqual(sources(guides.ko), sources(guides.en));
  assert.equal(Object.keys(sources(guides.en)).length, 33);
  for (const text of Object.values(guides)) {
    const references = sources(text);
    for (const match of text.matchAll(/\[(S\d{2})\]/g)) {
      assert.ok(references[match[1]], `Undefined source: ${match[1]}`);
    }
    for (const url of Object.values(references)) {
      assert.ok(['learn.microsoft.com', 'azure.microsoft.com'].includes(new URL(url).hostname));
    }
  }
});

test('rendered source labels resolve to their own URLs, not adjacent citation labels', () => {
  for (const [language, text] of Object.entries(guides)) {
    assert.equal(/(?:\[S\d{2}\]){2,}/.test(text), false, `${language}: ambiguous adjacent references`);
    const references = sources(text);
    let citations = 0;
    marked.walkTokens(marked.lexer(text), (token) => {
      if (token.type === 'link' && /^S\d{2}$/.test(token.text)) {
        citations++;
        assert.equal(token.href, references[token.text], `${language}: ${token.text} points to the wrong source`);
      }
    });

    assert.ok(citations >= 45, `${language}: too few rendered citations`);
  }
});

test('range notation does not turn the procedure into Markdown strikethrough', () => {
  for (const [language, text] of Object.entries(guides)) {
    marked.walkTokens(marked.lexer(text), (token) => {
      assert.notEqual(token.type, 'del', `${language}: unintended strikethrough in ${token.raw}`);
    });
  }
});

test('commands, scoring formula, and hybrid code fragment are identical', () => {
  assert.deepEqual(blocks(guides.ko, 'bash'), blocks(guides.en, 'bash'));
  const formula = (text) => blocks(text, 'text').find((value) => value.startsWith('score ='));
  assert.equal(formula(guides.ko), formula(guides.en));
  assert.ok(formula(guides.en).includes('cost_usd_kg / 5'));
  const koJson = blocks(guides.ko, 'json').map((value) => JSON.parse(value));
  const enJson = blocks(guides.en, 'json').map((value) => JSON.parse(value));
  assert.deepEqual(koJson, enJson);
  const hybrid = enJson.find((value) => Array.isArray(value.code_environments));
  assert.ok(hybrid);
  assert.equal(hybrid.code_environments[0].infra_node, 'worker');
  assert.equal(hybrid.code_environments[0].command, 'python "/{{scriptName}}"');
});

test('researcher handoff and evidence response contracts match without claiming arithmetic execution', () => {
  const handoffs = (text) => [...text.matchAll(/^\| (H\d{2}) \|/gm)].map((match) => match[1]);
  const expectedHandoffs = Array.from({ length: 6 }, (_, index) => `H${String(index + 1).padStart(2, '0')}`);
  for (const text of Object.values(guides)) {
    assert.deepEqual(handoffs(text), expectedHandoffs);
    const evidence = blocks(section(text, 'l04'), 'json').map((value) => JSON.parse(value))[0];
    assert.deepEqual(evidence, {
      candidate_count: 8,
      gamma_conductivity_w_mk: 175,
      missing_evidence: [{ candidate_id: 'ZETA', source_field: 'corrosion_status', observed_value: 'unknown' }],
      synthetic_data: true,
      arithmetic_verified: false,
    });
  }
});

test('follow-up configuration occurs between Stop and Start and both output cases are checked', () => {
  for (const text of Object.values(guides)) {
    const followup = section(text, 'l07');
    const stop = followup.indexOf('Stop');
    const tasks = followup.indexOf('| T4 |');
    const start = followup.indexOf('Start');
    assert.ok(stop >= 0 && stop < tasks && tasks < start);
    assert.ok(section(text, 'l05').includes('--case baseline'));
    assert.ok(followup.includes('--case cost3'));
    assert.ok(section(text, 'l05').includes('execution_verified: false'));
    assert.ok(section(text, 'l05').includes('nodepoolId'));
    const extension = section(text, 'e01');
    assert.ok(extension.includes('corrosion_status = "unknown"'));
    assert.ok(extension.includes('corrosion_result'));
    assert.ok(section(text, 'l05').includes('Definition content file'));
    assert.ok(section(text, 'l05').includes('Definition content version'));
    assert.ok(section(text, 'l05').includes('properties.definitionContent'));
  }
});

test('candidate decisions and scores agree with the executable reference', () => {
  for (const [language, text] of Object.entries(guides)) {
    const rows = [...section(text, 's02').matchAll(/^\| (ALPHA|BETA|GAMMA|DELTA|EPSILON|ZETA|ETA|THETA) \| (\w+) \| ([^|]+) \|/gm)];
    assert.equal(rows.length, reference.candidate_count);
    for (const [, id, status, detail] of rows) {
      const expected = reference.decisions.find((item) => item.candidate_id === id);
      assert.equal(status, expected.status, `${language} ${id}`);
      if (expected.score !== null) assert.equal(Number(detail.trim()), expected.score);
    }
    assert.ok(section(text, 'l05').includes('candidate_count=8'));
    assert.ok(section(text, 'l05').includes('eligible_count=3'));
    assert.ok(section(text, 'l07').includes('68.6'));
  }
});

test('task dependencies match across languages and remain acyclic', () => {
  const graph = taskGraph(guides.en);
  assert.deepEqual(taskGraph(guides.ko), graph);
  assert.deepEqual(graph, [
    { id: 'R0', parent: '—', dependencies: [] },
    { id: 'T1', parent: 'R0', dependencies: [] },
    { id: 'T2', parent: 'R0', dependencies: ['T1'] },
    { id: 'T3', parent: 'R0', dependencies: ['T1', 'T2'] },
    { id: 'T4', parent: null, dependencies: ['T3'] },
    { id: 'T5', parent: null, dependencies: ['T3', 'T4'] },
  ]);
  const visit = (id, path = []) => {
    assert.ok(!path.includes(id), `Cycle: ${[...path, id].join(' -> ')}`);
    const task = graph.find((item) => item.id === id);
    assert.ok(task, `Unknown dependency ${id}`);
    for (const dependency of task.dependencies) visit(dependency, [...path, id]);
  };
  graph.forEach((task) => visit(task.id));
});

test('early lab pass criteria do not require later labs to be complete', () => {
  for (const [language, text] of Object.entries(guides)) {
    const label = language === 'ko' ? '**완료 기준:**' : '**Pass criteria:**';
    for (let number = 0; number <= 7; number++) {
      const body = section(text, `l${String(number).padStart(2, '0')}`);
      const criterion = body.slice(body.indexOf(label)).split('\n\n')[0];
      for (const match of criterion.matchAll(/\bL(\d{2})\b/g)) {
        assert.ok(Number(match[1]) <= number, `Forward completion dependency in ${language} L${number}`);
      }
    }
  }
});

test('resource scope, tool actions, and referenced source files remain aligned', async () => {
  const config = JSON.parse(await readFile(resolve(root, 'config/lab.json'), 'utf8'));
  const tool = JSON.parse(await readFile(resolve(root, 'tools/thermal-ranking/tool-definition.template.json'), 'utf8'));
  for (const text of Object.values(guides)) {
    for (const value of [config.account, config.subscriptionId, config.tenantId, config.resourceGroup, config.location]) {
      assert.ok(text.includes(value), `Missing configured scope value: ${value}`);
    }
    for (const action of tool.actions) assert.ok(text.includes(action.name));
    for (const match of text.matchAll(/`((?:data|scripts|tools|config)\/[^`]+)`/g)) {
      await access(resolve(root, match[1]));
    }
  }
});

test('sensitive conceptual boundaries are explicit in both editions', () => {
  const terms = [
    '30 KB', 'GetResourceContext', 'PreviewResource', 'WriteResource', 'ShareResource',
    'Needs User Attention', 'Incomplete', 'kind: workflow', 'Copy from project',
    'Microsoft Discovery - User Messages', '500,000', '2,000,000', 'gpt-5-4', 'gpt-5.4',
    'Code Interpreter', 'https://learn.microsoft.com/api/mcp',
  ];
  for (const [language, text] of Object.entries(guides)) {
    for (const term of terms) assert.ok(text.includes(term), `${language}: ${term}`);
    assert.ok(section(text, 'a01').includes('temperature/top_p'));
    assert.ok(section(text, 'l07').includes('Stop'));
    assert.ok(section(text, 'l08').includes('Blob'));
  }
});

test('both editions preserve the observed deployment lessons and resumption commands', () => {
  for (const [language, text] of Object.entries(guides)) {
    for (const term of [
      'npm run readiness', '--require core', 'DefaultFeature=Pending',
      'IncompatibleDelegations', 'StorageAccount_PublicNetwork_Modify',
      'AKSCapacityHeavyUsage', 'properties.version', 'infra/tool.bicep',
      '990,000', '780,000', '2,010,000', '2,220,000',
      'infra/expand-network.bicep', 'infra/storage-private-access.bicep',
      'npm run blob:sync', 'vm-discovery-blob-client', 'Discovery Default Project',
      'discoverydefaultprojectym5ffvaa', '3,000,000',
    ]) assert.ok(text.includes(term), `${language}: missing observed lesson ${term}`);
  }
});

test('Graph identity commands use the selected tenant context rather than unsupported subscription flags', () => {
  for (const text of Object.values(guides)) {
    const setup = blocks(section(text, 'l01'), 'bash')
      .find((block) => block.includes('CONTROL_PLANE_OBJECT_ID='));
    assert.ok(setup.includes('az account set --subscription "$SUBSCRIPTION_ID"'));
    for (const command of setup.matchAll(/\$\(az ad ([\s\S]*?)\)/g)) {
      assert.ok(!command[1].includes('--subscription'));
    }
  }
});
