import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import dotenv from "dotenv";

const ENV_FILE = ".vercel/.env.production.local";

const REQUIRED_ENV_NAMES = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

export function normalizeEnvValue(value) {
  let normalized = value.trim();
  const first = normalized[0];
  const last = normalized[normalized.length - 1];

  if (
    normalized.length >= 2 &&
    ((first === '"' && last === '"') || (first === "'" && last === "'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

export function parseDotenv(content) {
  return dotenv.parse(content);
}

function validateRequiredValue(values, name) {
  const rawValue = values[name];
  const value = rawValue === undefined ? undefined : normalizeEnvValue(rawValue);

  if (!value) {
    console.error(`${name}: missing`);
    return false;
  }

  console.log(`${name}: present`);
  return true;
}

function reportInvalidUpstashUrl(reason) {
  console.error(`UPSTASH_REDIS_REST_URL: ${reason}`);
}

export function validateUpstashUrl(values) {
  const rawValue = values.UPSTASH_REDIS_REST_URL;

  if (rawValue === undefined) {
    reportInvalidUpstashUrl("missing");
    return false;
  }

  const value = rawValue === undefined ? undefined : normalizeEnvValue(rawValue);

  if (!value) {
    reportInvalidUpstashUrl("empty after normalization");
    return false;
  }

  if (/[\u0000-\u001F\u007F]/u.test(value)) {
    reportInvalidUpstashUrl("contains control characters");
    return false;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    reportInvalidUpstashUrl("invalid URL format");
    return false;
  }

  if (parsedUrl.protocol !== "https:") {
    reportInvalidUpstashUrl("protocol must be HTTPS");
    return false;
  }

  if (!parsedUrl.hostname) {
    reportInvalidUpstashUrl("hostname missing");
    return false;
  }

  console.log("UPSTASH_REDIS_REST_URL: valid");
  return true;
}

function validateUpstashToken(values) {
  const rawValue = values.UPSTASH_REDIS_REST_TOKEN;
  const value = rawValue === undefined ? undefined : normalizeEnvValue(rawValue);

  if (!value) {
    console.error("UPSTASH_REDIS_REST_TOKEN: missing");
    return false;
  }

  console.log("UPSTASH_REDIS_REST_TOKEN: present");
  return true;
}

export async function main() {
  let content;

  try {
    content = await readFile(ENV_FILE, "utf8");
  } catch {
    console.error(`${ENV_FILE}: missing`);
    process.exitCode = 1;
    return;
  }

  const values = parseDotenv(content);
  const genericRequiredNames = REQUIRED_ENV_NAMES.filter(
    (name) => !name.startsWith("UPSTASH_REDIS_REST_")
  );
  const results = [
    ...genericRequiredNames.map((name) => validateRequiredValue(values, name)),
    validateUpstashUrl(values),
    validateUpstashToken(values),
  ];

  if (results.includes(false)) {
    process.exitCode = 1;
    return;
  }

  console.log("Production environment readiness: valid");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
