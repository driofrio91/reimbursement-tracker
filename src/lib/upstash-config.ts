export function normalizeUpstashEnvValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  let normalized = value.trim();
  const first = normalized[0];
  const last = normalized[normalized.length - 1];

  if (
    normalized.length >= 2 &&
    ((first === '"' && last === '"') || (first === "'" && last === "'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  if (
    normalized.length >= 4 &&
    ((normalized.startsWith('\\"') && normalized.endsWith('\\"')) ||
      (normalized.startsWith("\\'") && normalized.endsWith("\\'")))
  ) {
    normalized = normalized.slice(2, -2).trim();
  }

  return normalized;
}

export function getUpstashRedisConfig(): { url: string; token: string } {
  const url = normalizeUpstashEnvValue(process.env.UPSTASH_REDIS_REST_URL);
  const token = normalizeUpstashEnvValue(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!url?.startsWith("https://")) {
    throw new Error(
      "Invalid Upstash Redis configuration: UPSTASH_REDIS_REST_URL must start with https://."
    );
  }

  if (!token) {
    throw new Error(
      "Invalid Upstash Redis configuration: UPSTASH_REDIS_REST_TOKEN is required."
    );
  }

  return { url, token };
}
