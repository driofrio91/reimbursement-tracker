import { describe, expect, it } from "vitest";

import { normalizeUpstashEnvValue } from "@/lib/upstash-config";

describe("normalizeUpstashEnvValue", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeUpstashEnvValue("  https://example.upstash.io  ")).toBe(
      "https://example.upstash.io"
    );
  });

  it("strips one matching pair of surrounding double quotes", () => {
    expect(normalizeUpstashEnvValue(' "https://example.upstash.io" ')).toBe(
      "https://example.upstash.io"
    );
  });

  it("strips one matching pair of surrounding single quotes", () => {
    expect(normalizeUpstashEnvValue(" 'token-value' ")).toBe("token-value");
  });

  it("strips one matching pair of escaped surrounding double quotes", () => {
    expect(normalizeUpstashEnvValue(' \\"https://example.upstash.io\\" ')).toBe(
      "https://example.upstash.io"
    );
  });

  it("strips one matching pair of escaped surrounding single quotes", () => {
    expect(normalizeUpstashEnvValue(" \\'token-value\\' ")).toBe("token-value");
  });

  it("does not strip unmatched quotes", () => {
    expect(normalizeUpstashEnvValue('"https://example.upstash.io')).toBe(
      '"https://example.upstash.io'
    );
  });

  it("does not strip unmatched escaped quotes", () => {
    expect(normalizeUpstashEnvValue('\\"https://example.upstash.io')).toBe(
      '\\"https://example.upstash.io'
    );
  });
});
