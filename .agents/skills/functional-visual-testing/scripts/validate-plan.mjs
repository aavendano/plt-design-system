#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function validatePlan(plan) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const object = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
  const strings = (value) => Array.isArray(value) && value.length > 0 && value.every(nonempty);

  if (!object(plan)) return ['plan: expected JSON object'];
  if (plan.schemaVersion !== 1) fail('schemaVersion', 'expected 1');
  if (!nonempty(plan.id)) fail('id', 'required non-empty string');
  if (!nonempty(plan.source)) fail('source', 'required non-empty string');
  if (!object(plan.runner)) {
    fail('runner', 'required object');
  } else {
    for (const key of ['kind', 'command', 'testFile']) {
      if (!nonempty(plan.runner[key])) fail(`runner.${key}`, 'required non-empty string');
    }
  }
  if (!strings(plan.fixtures)) fail('fixtures', 'expected non-empty string array');
  if (!object(plan.policy)) {
    fail('policy', 'required object');
  } else {
    if (!['read-only', 'fixture-only'].includes(plan.policy.mutations)) {
      fail('policy.mutations', 'expected read-only or fixture-only');
    }
    if (plan.policy.baselineUpdates !== 'human-approval') {
      fail('policy.baselineUpdates', 'must require human-approval');
    }
  }
  if (!Array.isArray(plan.scenarios) || plan.scenarios.length === 0) {
    fail('scenarios', 'expected non-empty array');
  } else {
    const ids = new Set();
    plan.scenarios.forEach((scenario, index) => {
      const p = `scenarios[${index}]`;
      if (!object(scenario)) return fail(p, 'expected object');
      for (const key of ['id', 'criterion', 'setup']) {
        if (!nonempty(scenario[key])) fail(`${p}.${key}`, 'required non-empty string');
      }
      if (nonempty(scenario.id)) {
        if (ids.has(scenario.id)) fail(`${p}.id`, 'duplicate scenario ID');
        ids.add(scenario.id);
      }
      for (const key of ['actions', 'assertions', 'evidence']) {
        if (!strings(scenario[key])) fail(`${p}.${key}`, 'expected non-empty string array');
      }
      const visual = scenario.visual;
      if (!object(visual)) return fail(`${p}.visual`, 'required object');
      if (!nonempty(visual.checkpoint)) fail(`${p}.visual.checkpoint`, 'required non-empty string');
      if (!['baseline', 'peer', 'observation'].includes(visual.comparison)) {
        fail(`${p}.visual.comparison`, 'expected baseline, peer or observation');
      }
      if (visual.comparison !== 'observation' && !nonempty(visual.reference)) {
        fail(`${p}.visual.reference`, 'required baseline/peer identifier');
      }
      if (!Array.isArray(visual.viewports) || visual.viewports.length === 0) {
        fail(`${p}.visual.viewports`, 'expected non-empty array');
      } else {
        visual.viewports.forEach((viewport, i) => {
          if (!object(viewport) || !Number.isInteger(viewport.width) || viewport.width <= 0 ||
              !Number.isInteger(viewport.height) || viewport.height <= 0) {
            fail(`${p}.visual.viewports[${i}]`, 'expected positive integer width and height');
          }
        });
      }
    });
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node validate-plan.mjs <plan.json>');
    process.exitCode = 2;
  } else {
    try {
      const errors = validatePlan(JSON.parse(readFileSync(file, 'utf8')));
      if (errors.length) {
        for (const error of errors) console.error(error);
        process.exitCode = 1;
      } else {
        console.log(`Visual test plan valid: ${file}`);
      }
    } catch (error) {
      console.error(`Cannot validate ${file}: ${error.message}`);
      process.exitCode = 2;
    }
  }
}
