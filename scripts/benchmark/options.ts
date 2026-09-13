import { parseArgs } from 'node:util';
import { z } from 'zod';

const integer = (minimum: number, maximum: number) =>
  z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(minimum).max(maximum));
const optionsSchema = z
  .object({
    warmup: integer(0, 10_000).default(20),
    iterations: integer(1, 10_000).default(100),
    output: z.string().min(1).default('.orca/maeul-improvements/evidence/T02/current.json'),
    baseline: z.string().min(1).optional(),
    check: z.boolean().default(false),
  })
  .refine((value) => !value.check || Boolean(value.baseline), {
    message: '--check requires --baseline',
    path: ['baseline'],
  });
export function parseBenchmarkArgs(args: string[]) {
  const { values } = parseArgs({
    args,
    allowPositionals: false,
    strict: true,
    options: {
      warmup: { type: 'string' },
      iterations: { type: 'string' },
      output: { type: 'string' },
      baseline: { type: 'string' },
      check: { type: 'boolean' },
    },
  });
  return optionsSchema.parse(values);
}
export type BenchmarkOptions = ReturnType<typeof parseBenchmarkArgs>;
