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

  function getErrorOutput(error: { mock: { calls: unknown[][] } }) {
    return error.mock.calls.map((call) => String(call[0])).join("\n");
  }

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

    expect(
      validateUpstashUrl({
        UPSTASH_REDIS_REST_URL:
          "http://redis-token@example.upstash.io/path?token=secret-token",
      })
    ).toBe(false);

    const output = getErrorOutput(error);

    expect(log).not.toHaveBeenCalled();
    expect(output).toContain("UPSTASH_REDIS_REST_URL: protocol must be HTTPS");
    expect(output).toContain("raw value found: yes");
    expect(output).toContain("empty after normalization: no");
    expect(output).toContain("starts with normal quote: no");
    expect(output).toContain("starts with escaped quote: no");
    expect(output).toContain("starts with assignment prefix: no");
    expect(output).toContain("contains control characters: no");
    expect(output).toContain("first code point category:");
    expect(output).toContain("last code point category:");
    expect(output).toContain("URL parse result: success");
    expect(output).toContain("protocol category: http");
    expect(output).toContain("hostname present: yes");
    expect(output).not.toContain(
      "http://redis-token@example.upstash.io/path?token=secret-token"
    );
    expect(output).not.toContain("example.upstash.io");
    expect(output).not.toContain("redis-token");
    expect(output).not.toContain("secret-token");
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

    const output = getErrorOutput(error);

    expect(output).toContain(
      "UPSTASH_REDIS_REST_URL: contains control characters"
    );
    expect(output).toContain("contains control characters: yes");
    expect(output).not.toContain("example.upstash.io");
  });

  it("reports assignment and quote diagnostics without exposing the raw value", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(
      validateUpstashUrl({
        UPSTASH_REDIS_REST_URL:
          'UPSTASH_REDIS_REST_URL=\\"https://example.upstash.io\\"',
      })
    ).toBe(false);

    const output = getErrorOutput(error);

    expect(output).toContain("UPSTASH_REDIS_REST_URL: invalid URL format");
    expect(output).toContain("raw value found: yes");
    expect(output).toContain("starts with assignment prefix: yes");
    expect(output).toContain("URL parse result: failure");
    expect(output).not.toContain("https://example.upstash.io");
    expect(output).not.toContain("example.upstash.io");
  });
});
