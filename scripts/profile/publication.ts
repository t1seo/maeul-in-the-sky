import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp, rename, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

export type PublicationFile = { readonly source: string; readonly destination: string };
type Prepared = PublicationFile & { readonly directory: string; readonly existed: boolean };

function missing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

export async function publishCapture(
  files: readonly PublicationFile[],
  validate: () => Promise<void>,
  replace: typeof rename = rename,
): Promise<void> {
  if (new Set(files.map((file) => resolve(file.destination))).size !== files.length)
    throw new Error('Capture destinations must be distinct.');
  await validate();
  const prepared: Prepared[] = [];
  const published: Prepared[] = [];
  let preserveBackups = false;
  try {
    for (const file of files) {
      await mkdir(dirname(file.destination), { recursive: true });
      const previous = await lstat(file.destination).catch((error: unknown) => {
        if (missing(error)) return undefined;
        throw error;
      });
      if (previous && !previous.isFile())
        throw new Error('Capture destinations must be regular files, not links or directories.');
      const directory = await mkdtemp(join(dirname(file.destination), '.maeul-publish-'));
      const next = { ...file, directory, existed: previous !== undefined };
      prepared.push(next);
      await copyFile(file.source, join(directory, 'next'), constants.COPYFILE_EXCL);
      if (next.existed)
        await copyFile(file.destination, join(directory, 'previous'), constants.COPYFILE_EXCL);
    }
    for (const file of prepared) {
      await replace(join(file.directory, 'next'), file.destination);
      published.push(file);
    }
  } catch (error) {
    const rollback = await Promise.allSettled(
      published
        .reverse()
        .map((file) =>
          file.existed
            ? replace(join(file.directory, 'previous'), file.destination)
            : rm(file.destination, { force: true }),
        ),
    );
    const failures = rollback.filter((result) => result.status === 'rejected');
    if (failures.length) {
      preserveBackups = true;
      throw new AggregateError(
        [error, ...failures.map((failure) => failure.reason)],
        `Publication rollback failed; recover originals from ${prepared.map((file) => file.directory).join(', ')}.`,
        { cause: error },
      );
    }
    throw error;
  } finally {
    if (!preserveBackups)
      await Promise.allSettled(
        prepared.map((file) => rm(file.directory, { recursive: true, force: true })),
      );
  }
}
