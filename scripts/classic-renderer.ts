import { createHash } from 'node:crypto';
import { cp, readFile } from 'node:fs/promises';

const archivedFiles = [
  ['browser.js', '44e02537900ec9d8a0f58b492ca4f4ba5ed7145f149929804c84272b725ae458'],
  ['browser.js.map', '94b2f49819ded6d13244f9e8a0cfca9c1a1340dbcdcfbaed6e4754cbb310f3f2'],
  ['browser.d.ts', 'bdf3ca4dd0ef62d12d3587503681a20a1aed054f8adf48608515490b2078e748'],
] as const;

export async function copyClassicRenderer(): Promise<void> {
  const source = new URL('../assets/versions/classic/', import.meta.url);
  for (const [name, expected] of archivedFiles) {
    const bytes = await readFile(new URL(name, source));
    if (createHash('sha256').update(bytes).digest('hex') !== expected) {
      throw new Error(`The preserved classic renderer has changed: ${name}`);
    }
  }
  await cp(source, new URL('../docs/demo/versions/classic/', import.meta.url), {
    recursive: true,
  });
}
