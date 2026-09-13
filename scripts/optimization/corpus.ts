import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

export type Specimen = {
  readonly name: string;
  readonly svg: string;
  readonly mode: 'dark' | 'light';
  readonly provenance: string;
};

export async function initialCorpus(): Promise<Specimen[]> {
  const paths = [
    'preview-dark.svg',
    'preview-light.svg',
    'preview-max.svg',
    'preview-max-light.svg',
  ];
  return paths.map((name) => {
    const path = `.github/assets/${name}`;
    return {
      name: name.slice(0, -4),
      svg: execFileSync('git', ['show', `HEAD:${path}`], {
        encoding: 'utf8',
        maxBuffer: 4 * 1024 * 1024,
      }),
      mode: name.includes('light') ? 'light' : 'dark',
      provenance: `HEAD:${path} (checked-in before features)`,
    };
  });
}

export async function fileCorpus(paths: readonly string[]): Promise<Specimen[]> {
  return Promise.all(
    paths.map(
      async (path) =>
        ({
          name:
            path
              .split('/')
              .at(-1)
              ?.replace(/\.svg$/, '') ?? path,
          svg: await readFile(path, 'utf8'),
          mode: path.includes('light') ? 'light' : 'dark',
          provenance: path,
        }) satisfies Specimen,
    ),
  );
}
