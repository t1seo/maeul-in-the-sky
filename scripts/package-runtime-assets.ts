import { cp, mkdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const dist = join(root, 'dist');

await mkdir(dist, { recursive: true });
await copyFile(require.resolve('@resvg/resvg-wasm/index_bg.wasm'), join(dist, 'resvg.wasm'));
await cp(join(root, 'assets/fonts'), join(dist, 'fonts'), { recursive: true });
await cp(join(root, 'assets/licenses'), join(dist, 'licenses'), { recursive: true });
await cp(join(root, 'docs/demo'), join(dist, 'demo'), { recursive: true });
