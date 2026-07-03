export const SLOW_PAGINATED_QUERY_WARNING_THRESHOLD_MS = 750;

interface SlowDbQueryWarningInput {
  operation: string;
  startedAtMs: number;
  thresholdMs?: number;
  metadata?: Record<string, boolean | number | string | null | undefined>;
}

export function warnIfSlowPaginatedQuery(input: SlowDbQueryWarningInput): number {
  const thresholdMs = input.thresholdMs ?? SLOW_PAGINATED_QUERY_WARNING_THRESHOLD_MS;
  const durationMs = Date.now() - input.startedAtMs;

  if (durationMs <= thresholdMs) {
    return durationMs;
  }

  console.warn("[db-query] Slow paginated query", {
    operation: input.operation,
    durationMs,
    thresholdMs,
    ...input.metadata,
  });

  return durationMs;
}
