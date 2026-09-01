import { afterEach, describe, expect, it, vi } from "vitest";

import {
  normalizeEnvValue,
  parseDotenv,
  validateUpstashUrl,
} from "../../scripts/validate-production-env.mjs";

describe("validate-production-env", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses production env files with dotenv semantics", () => {
    const values = parseDotenv(`
DATABASE_URL="postgres://user:pass@example.test/db#fragment"
AUTH_SECRET='secret#not-a-comment'
UPSTASH_REDIS_REST_URL="https://example.upstash.io"
UPSTASH_REDIS_REST_TOKEN=token
`);

    expect(values.DATABASE_URL).toBe("postgres://user:pass@example.test/db#fragment");
    expect(values.AUTH_SECRET).toBe("secret#not-a-comment");
    expect(values.UPSTASH_REDIS_REST_URL).toBe("https://example.upstash.io");
  });

  it("preserves value normalization after dotenv parsing", () => {
    expect(normalizeEnvValue(`  "https://example.upstash.io"  `)).toBe(
      "https://example.upstash.io"
    );
  });

  it("normalizes escaped surrounding quotes after dotenv parsing", () => {
    const values = parseDotenv(`
UPSTASH_REDIS_REST_URL=\\"https://example.upstash.io\\"
UPSTASH_REDIS_REST_TOKEN=\\'token-value\\'
`);

    expect(normalizeEnvValue(values.UPSTASH_REDIS_REST_URL)).toBe(
      "https://example.upstash.io"
    );
    expect(normalizeEnvValue(values.UPSTASH_REDIS_REST_TOKEN)).toBe("token-value");
  });

  it("accepts HTTPS Upstash REST URLs without printing the value", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(
      validateUpstashUrl({
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      })
    ).toBe(true);

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("UPSTASH_REDIS_REST_URL: valid");
  });

  it("reports safe diagnostic categories for invalid Upstash URLs", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(validateUpstashUrl({ UPSTASH_REDIS_REST_URL: "http://example.test" })).toBe(
      false
    );

    expect(log).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "UPSTASH_REDIS_REST_URL: protocol must be HTTPS"
    );
  });

  it("accepts escaped quoted HTTPS Upstash REST URLs without printing the value", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(
      validateUpstashUrl({
        UPSTASH_REDIS_REST_URL: '\\"https://example.upstash.io\\"',
      })
    ).toBe(true);

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("UPSTASH_REDIS_REST_URL: valid");
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining("example.upstash.io"));
  });

  it("rejects Upstash URLs that contain control characters", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(
      validateUpstashUrl({
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io\u0007",
      })
    ).toBe(false);

    expect(error).toHaveBeenCalledWith(
      "UPSTASH_REDIS_REST_URL: contains control characters"
    );
  });
});
