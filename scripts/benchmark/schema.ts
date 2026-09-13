import { z } from 'zod';

const bytes = z.number().int().nonnegative();
const metricSchema = z.object({
  rawBytes: bytes,
  gzipBytes: bytes,
  sha256: z.string(),
  elements: bytes,
  cssTargets: bytes,
  cssKeyframes: bytes,
  smilElements: bytes,
  duplicateIds: z.array(z.string()),
  danglingReferences: z.array(z.string()),
  externalReferences: z.array(z.string()),
  unsupportedSelectors: z.array(z.string()),
  scripts: bytes,
  eventHandlers: bytes,
  viewBox: z.string(),
  title: z.string(),
  description: z.string(),
});
export const benchmarkReportSchema = z.object({
  schemaVersion: z.literal(1),
  createdAt: z.iso.datetime(),
  source: z.object({
    revision: z.string(),
    historical: z.boolean(),
    dirty: z.boolean(),
    sourceSha256: z.string(),
    harnessSha256: z.string(),
    changedDuringRun: z.boolean(),
  }),
  environment: z.object({
    node: z.string(),
    v8: z.string(),
    platform: z.string(),
    arch: z.string(),
    osRelease: z.string(),
    cpuModel: z.string(),
    logicalCpus: bytes,
    totalMemory: bytes,
    timingKey: z.string(),
    timingCaveat: z.string(),
    dependencies: z.record(z.string(), z.string()),
  }),
  config: z.object({
    warmup: bytes,
    iterations: z.number().int().positive(),
    options: z.object({
      title: z.string(),
      width: z.number(),
      height: z.number(),
      density: z.number(),
      hemisphere: z.enum(['north', 'south']),
    }),
    gzipLevel: z.literal(9),
    timingScope: z.string(),
    percentileMethod: z.string(),
  }),
  fixtures: z
    .array(
      z.object({
        name: z.enum(['empty', 'mixed', 'full']),
        dataSha256: z.string(),
        metadata: z.object({
          username: z.string(),
          year: z.number(),
          fromDate: z.string(),
          toDate: z.string(),
          days: bytes,
          weeks: bytes,
          contributions: bytes,
          activeDays: bytes,
        }),
        samples: z.array(
          z.object({ milliseconds: z.number().nonnegative(), heapUsed: bytes, rss: bytes }),
        ),
        timing: z.object({ medianMs: z.number().nonnegative(), p95Ms: z.number().nonnegative() }),
        memory: z.object({
          startingHeap: bytes,
          peakObservedHeap: bytes,
          endingHeap: bytes,
          peakObservedRss: bytes,
        }),
        outputs: z.object({ dark: metricSchema, light: metricSchema }),
        artifacts: z.object({
          data: z.string(),
          darkSvg: z.string(),
          lightSvg: z.string(),
          darkPng: z.string(),
          lightPng: z.string(),
        }),
      }),
    )
    .length(3),
});
export type BenchmarkReport = z.infer<typeof benchmarkReportSchema>;
export type BenchmarkFixtureResult = BenchmarkReport['fixtures'][number];
