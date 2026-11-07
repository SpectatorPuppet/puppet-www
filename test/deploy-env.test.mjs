import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deployProblems } from '../src/lib/deploy-env.mjs';

const good = { SITE_URL: 'https://brand.test', APP_URL: 'https://account.brand.test', TASKS_APP_URL: 'https://tasks.brand.test', CONTACT_EMAIL: 'hello@brand.test' };

test('local and preview builds need no settings', () => {
  assert.deepEqual(deployProblems({}), []);
  assert.deepEqual(deployProblems({ CF_PAGES: '1', CF_PAGES_BRANCH: 'dev' }), []);
});

test('a production Pages build needs every link setting', () => {
  const problems = deployProblems({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main', SITE_URL: 'https://example.com', APP_URL: 'http://account.brand.test' });
  assert.deepEqual(problems, ['SITE_URL still points at an example domain', 'APP_URL must start with https://', 'TASKS_APP_URL is not set', 'CONTACT_EMAIL is not set']);
  assert.deepEqual(deployProblems({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main', ...good }), []);
});
