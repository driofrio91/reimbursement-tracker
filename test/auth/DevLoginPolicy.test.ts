import { describe, expect, it } from "vitest";

import { canUseDevLogin, isDevLoginEmail } from "@/lib/auth/DevLoginPolicy";

describe("DevLoginPolicy", () => {
  it("detects local development login addresses", () => {
    expect(isDevLoginEmail("admin@local.test")).toBe(true);
    expect(isDevLoginEmail("ADMIN@LOCAL.TEST")).toBe(true);
    expect(isDevLoginEmail("user@example.com")).toBe(false);
  });

  it("always allows non local.test addresses", () => {
    expect(canUseDevLogin("operator@example.com", { nodeEnv: "production", allowDevLogin: "false" })).toBe(true);
  });

  it("blocks local.test addresses in production even if flag is true", () => {
    expect(canUseDevLogin("admin@local.test", { nodeEnv: "production", allowDevLogin: "true" })).toBe(false);
  });

  it("allows local.test addresses in development by default", () => {
    expect(canUseDevLogin("admin@local.test", { nodeEnv: "development" })).toBe(true);
  });

  it("blocks local.test addresses outside development when flag is missing", () => {
    expect(canUseDevLogin("admin@local.test", { nodeEnv: "test" })).toBe(false);
  });

  it("allows local.test addresses outside development only when explicit flag is true", () => {
    expect(canUseDevLogin("admin@local.test", { nodeEnv: "test", allowDevLogin: "true" })).toBe(true);
    expect(canUseDevLogin("admin@local.test", { nodeEnv: "test", allowDevLogin: "false" })).toBe(false);
  });
});
