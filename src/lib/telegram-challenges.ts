import { createHash, randomBytes } from "node:crypto";

export function createChallengeToken() {
  return randomBytes(32).toString("base64url");
}

export function hashChallengeToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isChallengeExpired(expiresAt: string, now = new Date()) {
  return now.getTime() >= new Date(expiresAt).getTime();
}
