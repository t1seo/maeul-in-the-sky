import { createServer } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { z } from 'zod';
import { fetchContributions } from '../../src/api/client.js';
import { createSnapshot, parseSnapshot } from '../../src/core/settings/parse.js';
import { serializeSnapshot } from '../../src/core/settings/serialize.js';
import { activityResponse } from './activity-fixtures.js';

const requests: { readonly body: string; readonly authorization: string | undefined }[] = [];
const server = createServer(async (request, response) => {
  request.setEncoding('utf8');
  let body = '';
  for await (const chunk of request) body += String(chunk);
  requests.push({ body, authorization: request.headers.authorization });
  response.setHeader('content-type', 'application/json');
  response.end(JSON.stringify(activityResponse()));
});
let endpoint = '';

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new TypeError('Expected a loopback port');
  endpoint = `http://127.0.0.1:${address.port}/graphql`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

it('acquires and exports activity through native HTTP without sending fixture credentials', async () => {
  // Given a real loopback GraphQL fixture and the normal authenticated adapter interface.
  const token = 'fixture-credential-must-stay-local';
  // When data is acquired through the public adapter and exported as a snapshot.
  const data = await fetchContributions('octocat', 2024, token, { endpoint });
  const serialized = serializeSnapshot(createSnapshot(data, {}, { kind: 'github' }));
  // Then one bounded request preserves evidence without transmitting or exporting credentials.
  expect(requests).toHaveLength(1);
  expect(requests[0]?.authorization).toBeUndefined();
  expect(requests[0]?.body).not.toContain(token);
  const raw: unknown = JSON.parse(requests[0]?.body ?? 'null');
  const request = z.object({ query: z.string() }).parse(raw);
  expect(request.query.match(/month\d{2}: contributionsCollection/g)).toHaveLength(12);
  expect(parseSnapshot(serialized).activity?.months).toHaveLength(12);
  expect(parseSnapshot(serialized).activity?.months[0]?.commits).toBe(8);
  expect(serialized).not.toContain(token);
});
