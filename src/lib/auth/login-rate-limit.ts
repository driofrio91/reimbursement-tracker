import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (redis) {
    return redis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

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

  redis = new Redis({ url, token });
  return redis;
}

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATIONS_MINUTES = [1, 5, 10, 20, 60]; // Progressive lockout

function getFailedLoginKey(identifier: string): string {
  return `failed_login:${identifier}`;
}

function getLockoutKey(identifier: string): string {
  return `lockout:${identifier}`;
}

function getLockoutLevelKey(identifier: string): string {
  return `lockout_level:${identifier}`;
}

export async function isLockedOut(identifier: string): Promise<number | null> {
  const ttl = await getRedis().ttl(getLockoutKey(identifier));
  return ttl > 0 ? ttl : null;
}

export async function recordFailedLogin(identifier: string): Promise<void> {
  const key = getFailedLoginKey(identifier);
  const redis = getRedis();
  const attempts = await redis.incr(key);

  // Set expiry on first attempt (1 hour window)
  if (attempts === 1) {
    await redis.expire(key, 60 * 60);
  }

  // Lock out after max attempts
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    // Get current lockout level and increment
    const levelKey = getLockoutLevelKey(identifier);
    const currentLevel = ((await redis.get(levelKey)) as number) ?? 0;
    const newLevel = Math.min(currentLevel + 1, LOCKOUT_DURATIONS_MINUTES.length);

    const lockoutMinutes = LOCKOUT_DURATIONS_MINUTES[newLevel - 1];
    const lockoutSeconds = lockoutMinutes * 60;

    await redis.set(getLockoutKey(identifier), "1", { ex: lockoutSeconds });
    await redis.set(levelKey, newLevel, { ex: 60 * 60 * 24 }); // Level persists 24h
    await redis.del(key); // Clear failed attempts counter
  }
}

export async function clearFailedLogins(identifier: string): Promise<void> {
  const redis = getRedis();
  await redis.del(getFailedLoginKey(identifier));
  await redis.del(getLockoutLevelKey(identifier));
}
