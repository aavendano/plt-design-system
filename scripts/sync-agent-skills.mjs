#!/usr/bin/env node
/**
 * Selectively import one pinned Agent-OS development skill.
 * --check is fully offline; --sync fetches exactly the manifest's files.
 * No Agent-OS Python or Node runtime dependency is installed.
 */
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const lockFile = resolve(root, '.agents/skill-dependencies.json');
const mode = process.argv[2] || '--check';

const digest = (data) => createHash('sha256').update(data).digest('hex');
const safeRelative = (value) =>
  typeof value === 'string' && value.length > 0 &&
  !value.startsWith('/') && !value.includes('\\') &&
  value.split('/').every((part) => part && part !== '.' && part !== '..');

async function verifyRuntimeBoundary() {
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  for (const group of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const name of Object.keys(pkg[group] || {})) {
      if (name === 'agents-os' || name === '@aavendano/agents-os') {
        throw new Error('Agent-OS cannot be an npm runtime/build dependency');
      }
    }
  }
}

async function main() {
  if (!['--check', '--sync'].includes(mode)) {
    throw new Error('Usage: node scripts/sync-agent-skills.mjs [--check|--sync]');
  }
  const lock = JSON.parse(await readFile(lockFile, 'utf8'));
  if (lock.schemaVersion !== 1 || !Array.isArray(lock.dependencies) || lock.dependencies.length !== 1) {
    throw new Error('Expected exactly one declared skill dependency (v1)');
  }
  const spec = lock.dependencies[0];
  if (spec.name !== 'functional-visual-testing' ||
      spec.source?.repository !== 'aavendano/agents-os' ||
      spec.source?.path !== '.agents/skills/functional-visual-testing' ||
      spec.destination !== '.agents/skills/functional-visual-testing' ||
      !/^[a-f0-9]{40}$/.test(spec.source.ref) ||
      !spec.files || typeof spec.files !== 'object') {
    throw new Error('Unexpected skill source, destination, or unpinned ref');
  }
  const entries = Object.entries(spec.files);
  if (entries.length === 0) throw new Error('Empty skill file manifest');
  await verifyRuntimeBoundary();
  for (const [relative, expected] of entries) {
    if (!safeRelative(relative) || !/^[a-f0-9]{64}$/.test(expected)) {
      throw new Error(`Invalid manifest file or digest: ${relative}`);
    }
    const destination = resolve(root, spec.destination, relative);
    if (!destination.startsWith(resolve(root, spec.destination) + sep)) {
      throw new Error(`Destination escaped skill root: ${relative}`);
    }
    if (mode === '--sync') {
      const path = `${spec.source.path}/${relative}`;
      const url = `https://api.github.com/repos/${spec.source.repository}/contents/${path}?ref=${spec.source.ref}`;
      const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'plt-skill-import' };
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error(`GitHub source unavailable: ${relative} (HTTP ${response.status})`);
      const payload = await response.json();
      if (payload.type !== 'file' || payload.encoding !== 'base64') {
        throw new Error(`Unexpected source payload: ${relative}`);
      }
      const buffer = Buffer.from(payload.content.replace(/\s/g, ''), 'base64');
      if (digest(buffer) !== expected) throw new Error(`Source digest mismatch: ${relative}`);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, buffer);
    }
    const local = await readFile(destination);
    if (digest(local) !== expected) throw new Error(`Imported skill drift: ${relative}`);
  }
  console.log(`Verified ${spec.name} (${entries.length} files) from ${spec.source.ref}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
