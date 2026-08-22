import { readFile } from "node:fs/promises";

const ENV_FILE = ".vercel/.env.production.local";

const REQUIRED_ENV_NAMES = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

function normalizeEnvValue(value) {
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

function parseDotenv(content) {
  const values = new Map();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalizedLine = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separatorIndex = normalizedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = normalizedLine.slice(0, separatorIndex).trim();
    const value = normalizedLine.slice(separatorIndex + 1);

    if (name) {
      values.set(name, value);
    }
  }

  return values;
}

function validateRequiredValue(values, name) {
  const rawValue = values.get(name);
  const value = rawValue === undefined ? undefined : normalizeEnvValue(rawValue);

  if (!value) {
    console.error(`${name}: missing`);
    return false;
  }

  console.log(`${name}: present`);
  return true;
}

function validateUpstashUrl(values) {
  const rawValue = values.get("UPSTASH_REDIS_REST_URL");
  const value = rawValue === undefined ? undefined : normalizeEnvValue(rawValue);

  if (!value) {
    console.error("UPSTASH_REDIS_REST_URL: missing");
    return false;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    console.error("UPSTASH_REDIS_REST_URL: invalid");
    return false;
  }

  if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname) {
    console.error("UPSTASH_REDIS_REST_URL: invalid");
    return false;
  }

  console.log("UPSTASH_REDIS_REST_URL: valid");
  return true;
}

function validateUpstashToken(values) {
  const rawValue = values.get("UPSTASH_REDIS_REST_TOKEN");
  const value = rawValue === undefined ? undefined : normalizeEnvValue(rawValue);

  if (!value) {
    console.error("UPSTASH_REDIS_REST_TOKEN: missing");
    return false;
  }

  console.log("UPSTASH_REDIS_REST_TOKEN: present");
  return true;
}

async function main() {
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

await main();
