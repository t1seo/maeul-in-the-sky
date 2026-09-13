import assert from 'node:assert/strict';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'node:net';
import { httpRequest } from './helpers.js';

export const evidenceRoot = resolve('.orca/maeul-improvements/evidence/T09/manual');
export const secretCanary = 'preview-private-fixture-token';

export async function capture(
  name: string,
  url: string,
  options: Parameters<typeof httpRequest>[1],
  expectedStatus: number,
) {
  const response = await httpRequest(url, options);
  assert.equal(response.status, expectedStatus, `${name} HTTP status`);
  assert.ok(!response.body.includes(secretCanary), `${name} secret canary must be absent`);
  const environmentToken = process.env.GITHUB_TOKEN;
  if (environmentToken) {
    assert.ok(
      !JSON.stringify(response).includes(environmentToken),
      `${name} environment token must be absent`,
    );
  }
  assert.equal(response.headers['access-control-allow-origin'], undefined);
  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(resolve(evidenceRoot, `${name}.json`), JSON.stringify(response, null, 2));
  await appendFile(
    resolve(evidenceRoot, 'actions.jsonl'),
    `${JSON.stringify({ name, method: options?.method ?? 'GET', path: options?.path ?? '/', expectedStatus, actualStatus: response.status, at: new Date().toISOString() })}\n`,
  );
  return response;
}

export function requestBody(username = 'octocat') {
  return {
    path: '/api/preview',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, year: 2025, settings: { motion: 'off' } }),
  };
}

export async function verifyClosed(port: number): Promise<void> {
  const probe = createServer();
  await new Promise<void>((accept, reject) => {
    probe.once('error', reject);
    probe.listen(port, '127.0.0.1', accept);
  });
  await new Promise<void>((accept, reject) =>
    probe.close((error) => (error ? reject(error) : accept())),
  );
}
