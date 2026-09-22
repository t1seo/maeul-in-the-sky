import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

export const MODEL_COLLECTIONS = ['', 'nature', 'village'] as const;
const HASH = z.string().regex(/^[a-f0-9]{64}$/u);
const LOCAL_FILE = z
  .string()
  .regex(/^(?:[\w-]+\/)*[\w.-]+$/u)
  .refine((value) => value.split('/').every((part) => part !== '.' && part !== '..'));
const HTTPS = z.url().refine((value) => new URL(value).protocol === 'https:');
const MODEL = z.object({
  id: z.string().regex(/^[\w-]+$/u),
  file: LOCAL_FILE.refine((value) => value.endsWith('.glb')),
  node: z.string().min(1).optional(),
  nodes: z.array(z.object({ name: z.string().min(1) })).optional(),
  bytes: z
    .number()
    .int()
    .positive()
    .max(12 * 1024 * 1024),
  sha256: HASH,
  source: z.object({
    creator: z.string().min(1),
    originalTitle: z.string().min(1).optional(),
    modelUrl: HTTPS,
    downloadUrl: HTTPS,
    license: z.enum(['CC0-1.0', 'CC-BY-3.0', 'CC-BY-4.0']),
    licenseUrl: HTTPS,
    licenseFile: LOCAL_FILE,
    sha256: HASH,
    disclosure: z.string().min(1).optional(),
    licenseEvidence: z.string().min(1).optional(),
    licenseEvidenceUrl: HTTPS.optional(),
  }),
  modifications: z.array(z.string().min(1)).min(1),
});
const MANIFEST = z.object({ version: z.literal(1), models: z.array(MODEL).min(1) });
const GLTF = z.object({
  asset: z.object({ version: z.literal('2.0') }),
  buffers: z
    .array(z.object({ byteLength: z.number().positive(), uri: z.never().optional() }))
    .length(1),
  images: z
    .array(z.object({ bufferView: z.number().int().nonnegative(), uri: z.never().optional() }))
    .optional(),
  extensionsRequired: z.array(z.never()).optional(),
  nodes: z.array(z.object({ name: z.string().optional() })).optional(),
});
export type ModelRecord = z.infer<typeof MODEL>;
export type InventoryModel = ModelRecord & {
  readonly key: string;
  readonly manifest: string;
  readonly relativeFile: string;
  readonly relativeLicenseFile: string;
};

export class AuthoredInventoryError extends Error {
  constructor(
    readonly file: string,
    readonly detail: string,
  ) {
    super(`${file}: ${detail}`);
    this.name = 'AuthoredInventoryError';
  }
}

export function parseModelManifest(value: unknown, collection: string): readonly InventoryModel[] {
  const manifest = [collection, 'manifest.json'].filter(Boolean).join('/');
  const result = MANIFEST.safeParse(value);
  if (!result.success) throw new AuthoredInventoryError(manifest, result.error.message);
  const ids = new Set<string>();
  return result.data.models.map((model) => {
    if (ids.has(model.id))
      throw new AuthoredInventoryError(manifest, `Duplicate model ID ${model.id}`);
    ids.add(model.id);
    return {
      ...model,
      key: `${collection || 'wildlife'}/${model.id}`,
      manifest,
      relativeFile: [collection, model.file].filter(Boolean).join('/'),
      relativeLicenseFile: [collection, model.source.licenseFile].filter(Boolean).join('/'),
    };
  });
}

export function readModelInventory(modelsRoot: string): readonly InventoryModel[] {
  return MODEL_COLLECTIONS.flatMap((collection) => {
    const value: unknown = JSON.parse(
      readFileSync(join(modelsRoot, collection, 'manifest.json'), 'utf8'),
    );
    return parseModelManifest(value, collection);
  });
}

export function assertModelBytes(
  bytes: Buffer,
  model: Pick<InventoryModel, 'bytes' | 'sha256' | 'relativeFile' | 'node' | 'nodes'>,
) {
  const fail = (detail: string): never => {
    throw new AuthoredInventoryError(model.relativeFile, detail);
  };
  if (bytes.length !== model.bytes || bytes.length < 28) fail('Invalid packaged byte length');
  if (createHash('sha256').update(bytes).digest('hex') !== model.sha256)
    fail('Invalid SHA-256 checksum');
  if (
    bytes.readUInt32LE(0) !== 0x46546c67 ||
    bytes.readUInt32LE(4) !== 2 ||
    bytes.readUInt32LE(8) !== bytes.length
  )
    fail('Invalid GLB header');
  const end = 20 + bytes.readUInt32LE(12);
  if (
    end + 8 > bytes.length ||
    bytes.readUInt32LE(16) !== 0x4e4f534a ||
    bytes.readUInt32LE(end + 4) !== 0x004e4942 ||
    end + 8 + bytes.readUInt32LE(end) !== bytes.length
  )
    fail('Invalid GLB chunks');
  const value: unknown = JSON.parse(bytes.subarray(20, end).toString('utf8'));
  const result = GLTF.safeParse(value);
  if (!result.success) return fail('GLB must embed every resource and require no external decoder');
  if (model.node && !result.data.nodes?.some((node) => node.name === model.node))
    fail(`Missing named node ${model.node}`);
  for (const expected of model.nodes ?? []) {
    if (!result.data.nodes?.some((node) => node.name === expected.name))
      fail(`Missing named collection node ${expected.name}`);
  }
  return result.data;
}

function glbFiles(root: string, prefix = ''): string[] {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap((entry) => {
    const file = [prefix, entry.name].filter(Boolean).join('/');
    if (entry.isDirectory()) return glbFiles(root, file);
    return entry.isFile() && entry.name.endsWith('.glb') ? [file] : [];
  });
}

export function verifyModelInventory(modelsRoot: string): readonly InventoryModel[] {
  const models = readModelInventory(modelsRoot);
  const files = new Map<string, string>();
  for (const model of models) {
    const previous = files.get(model.relativeFile);
    if (previous && previous !== model.sha256)
      throw new AuthoredInventoryError(model.relativeFile, 'Conflicting manifest checksums');
    files.set(model.relativeFile, model.sha256);
    assertModelBytes(readFileSync(join(modelsRoot, model.relativeFile)), model);
    if (readFileSync(join(modelsRoot, model.relativeLicenseFile), 'utf8').trim().length === 0)
      throw new AuthoredInventoryError(model.relativeLicenseFile, 'Missing license text');
  }
  for (const file of glbFiles(modelsRoot)) {
    if (!files.has(file))
      throw new AuthoredInventoryError(file, 'GLB is missing from the provenance manifests');
  }
  return models;
}

export function verifyCreditFiles(modelsRoot: string): void {
  const credits = readFileSync(join(modelsRoot, 'CREDITS.md'), 'utf8');
  for (const match of credits.matchAll(/\]\(([^)]+)\)/gu)) {
    const file = match[1];
    if (file.startsWith('https://')) continue;
    if (!LOCAL_FILE.safeParse(file).success)
      throw new AuthoredInventoryError('CREDITS.md', `Invalid local source notice path ${file}`);
    if (readFileSync(join(modelsRoot, file)).length === 0)
      throw new AuthoredInventoryError(file, 'Empty linked source notice');
  }
}
