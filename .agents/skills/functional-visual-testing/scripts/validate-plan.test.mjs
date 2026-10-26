import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePlan } from './validate-plan.mjs';

const plan = () => ({
  schemaVersion: 1,
  id: 'picker',
  source: 'contracts/picker.md',
  runner: { kind: 'playwright', command: 'npm test', testFile: 'tests/picker.spec.ts' },
  fixtures: ['liquid', 'astro'],
  policy: { mutations: 'fixture-only', baselineUpdates: 'human-approval' },
  scenarios: [{
    id: 'selection',
    criterion: 'Selection updates price',
    setup: 'Demo fixture',
    actions: ['Select a variant'],
    assertions: ['Selected price updates'],
    visual: { checkpoint: 'selected', comparison: 'peer', reference: 'liquid', viewports: [{ width: 640, height: 900 }] },
    evidence: ['test-output', 'screenshot'],
  }],
});

test('valid plan', () => assert.deepEqual(validatePlan(plan()), []));
test('duplicate scenario rejected', () => {
  const p = plan();
  p.scenarios.push({ ...p.scenarios[0] });
  assert.match(validatePlan(p).join('\n'), /duplicate scenario ID/);
});
test('baseline and mutation governance fail closed', () => {
  const p = plan();
  p.policy.mutations = 'production';
  p.policy.baselineUpdates = 'automatic';
  p.scenarios[0].visual.reference = '';
  assert.equal(validatePlan(p).length, 3);
});
test('malformed viewports rejected', () => {
  const p = plan();
  p.scenarios[0].visual.viewports = [{ width: 0, height: 900 }];
  assert.match(validatePlan(p).join('\n'), /positive integer/);
});
