#!/usr/bin/env node
/**
 * Single source of truth for the README.
 *
 * The repo root README.md is authoritative: it is what GitHub renders. The
 * published package needs its own copy inside packages/react-simile-timeline,
 * because that copy is what ships in the npm tarball and renders on npmjs.com
 * (a symlink does not work — pnpm pack drops symlinked files, which is how the
 * missing-README bug that 1.0.2 fixed would return).
 *
 * This script copies the root README into the package. Run it after editing
 * the root README:
 *
 *   pnpm sync:readme
 *
 * With --check it copies nothing and instead exits non-zero when the two files
 * differ, so CI fails on drift rather than shipping a stale package README.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const source = join(root, 'README.md');
const target = join(root, 'packages', 'react-simile-timeline', 'README.md');

const check = process.argv.includes('--check');
const sourceText = readFileSync(source, 'utf8');

let targetText = '';
try {
  targetText = readFileSync(target, 'utf8');
} catch {
  // Missing target is a drift the check should catch and the sync should fix.
}

if (check) {
  if (sourceText !== targetText) {
    console.error(
      'README drift: packages/react-simile-timeline/README.md is out of sync ' +
        'with the root README.md.\nRun `pnpm sync:readme` and commit the result.'
    );
    process.exit(1);
  }
  console.log('README in sync.');
} else {
  if (sourceText === targetText) {
    console.log('README already in sync.');
  } else {
    writeFileSync(target, sourceText);
    console.log('Synced root README.md -> packages/react-simile-timeline/README.md');
  }
}
