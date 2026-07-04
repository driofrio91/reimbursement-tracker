export function getSingleQueryParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function parseNumberQueryParam(value: string | string[] | undefined): number | undefined {
  const singleValue = getSingleQueryParam(value);

  return singleValue ? Number(singleValue) : undefined;
}
