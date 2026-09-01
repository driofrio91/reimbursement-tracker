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

  if (
    normalized.length >= 4 &&
    ((normalized.startsWith('\\"') && normalized.endsWith('\\"')) ||
      (normalized.startsWith("\\'") && normalized.endsWith("\\'")))
  ) {
    normalized = normalized.slice(2, -2).trim();
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

function yesNo(value) {
  return value ? "yes" : "no";
}

function classifyCodePoint(codePoint) {
  if (codePoint === undefined) {
    return "0";
  }

  if ((codePoint >= 0x00 && codePoint <= 0x1f) || codePoint === 0x7f) {
    return "1";
  }

  if (
    codePoint === 0x20 ||
    codePoint === 0x09 ||
    codePoint === 0x0a ||
    codePoint === 0x0d
  ) {
    return "2";
  }

  if (codePoint >= 0x30 && codePoint <= 0x39) {
    return "3";
  }

  if (
    (codePoint >= 0x41 && codePoint <= 0x5a) ||
    (codePoint >= 0x61 && codePoint <= 0x7a)
  ) {
    return "4";
  }

  if (codePoint <= 0x7e) {
    return "5";
  }

  return "6";
}

function getBoundaryCodePoints(value) {
  const codePoints = [...value].map((character) => character.codePointAt(0));

  return {
    first: codePoints[0],
    last: codePoints[codePoints.length - 1],
  };
}

function getUrlParseDiagnostics(value) {
  if (!value) {
    return {
      hostnamePresent: "not-checked",
      protocolCategory: "not-checked",
      urlParseResult: "not-checked",
    };
  }

  try {
    const parsedUrl = new URL(value);
    const protocolCategory =
      parsedUrl.protocol === "https:"
        ? "https"
        : parsedUrl.protocol === "http:"
          ? "http"
          : "other";

    return {
      hostnamePresent: yesNo(Boolean(parsedUrl.hostname)),
      protocolCategory,
      urlParseResult: "success",
    };
  } catch {
    return {
      hostnamePresent: "not-checked",
      protocolCategory: "not-checked",
      urlParseResult: "failure",
    };
  }
}

function reportUpstashUrlDiagnostics(rawValue, normalizedValue) {
  const rawValueFound = rawValue !== undefined;
  const rawText = rawValueFound ? rawValue : "";
  const trimmedRawText = rawText.trimStart();
  const { first, last } = getBoundaryCodePoints(rawText);
  const urlDiagnostics = getUrlParseDiagnostics(normalizedValue);

  console.error("UPSTASH_REDIS_REST_URL diagnostics:");
  console.error(`  raw value found: ${yesNo(rawValueFound)}`);
  console.error(
    `  empty after normalization: ${yesNo(!normalizedValue)}`
  );
  console.error(
    `  starts with normal quote: ${yesNo(trimmedRawText.startsWith('"') || trimmedRawText.startsWith("'"))}`
  );
  console.error(
    `  starts with escaped quote: ${yesNo(trimmedRawText.startsWith('\\"') || trimmedRawText.startsWith("\\'"))}`
  );
  console.error(
    `  starts with assignment prefix: ${yesNo(trimmedRawText.startsWith("UPSTASH_REDIS_REST_URL="))}`
  );
  console.error(
    `  contains control characters: ${yesNo(/[\u0000-\u001F\u007F]/u.test(rawText))}`
  );
  console.error(`  first code point category: ${classifyCodePoint(first)}`);
  console.error(`  last code point category: ${classifyCodePoint(last)}`);
  console.error(`  URL parse result: ${urlDiagnostics.urlParseResult}`);
  console.error(`  protocol category: ${urlDiagnostics.protocolCategory}`);
  console.error(`  hostname present: ${urlDiagnostics.hostnamePresent}`);
}

function reportInvalidUpstashUrl(reason, rawValue, normalizedValue) {
  console.error(`UPSTASH_REDIS_REST_URL: ${reason}`);
  reportUpstashUrlDiagnostics(rawValue, normalizedValue);
}

export function validateUpstashUrl(values) {
  const rawValue = values.UPSTASH_REDIS_REST_URL;

  if (rawValue === undefined) {
    reportInvalidUpstashUrl("missing", rawValue, undefined);
    return false;
  }

  const value = rawValue === undefined ? undefined : normalizeEnvValue(rawValue);

  if (!value) {
    reportInvalidUpstashUrl("empty after normalization", rawValue, value);
    return false;
  }

  if (/[\u0000-\u001F\u007F]/u.test(value)) {
    reportInvalidUpstashUrl("contains control characters", rawValue, value);
    return false;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    reportInvalidUpstashUrl("invalid URL format", rawValue, value);
    return false;
  }

  if (parsedUrl.protocol !== "https:") {
    reportInvalidUpstashUrl("protocol must be HTTPS", rawValue, value);
    return false;
  }

  if (!parsedUrl.hostname) {
    reportInvalidUpstashUrl("hostname missing", rawValue, value);
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
