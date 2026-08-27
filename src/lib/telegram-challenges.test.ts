import { describe, expect, it } from "vitest";
import { createChallengeToken, hashChallengeToken, isChallengeExpired } from "./telegram-challenges";

describe("telegram challenges", () => {
  it("creates a non-reversible token and matching hash", () => {
    const token = createChallengeToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(hashChallengeToken(token)).toHaveLength(64);
    expect(hashChallengeToken(token)).toBe(hashChallengeToken(token));
  });

  it("detects expired challenges at the exact expiry boundary", () => {
    const expiry = "2099-01-01T00:00:00.000Z";
    expect(isChallengeExpired(expiry, new Date("2098-12-31T23:59:59.999Z"))).toBe(false);
    expect(isChallengeExpired(expiry, new Date(expiry))).toBe(true);
  });
});
