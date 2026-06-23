export interface ResolvedAnnualLimitsHistoryYear {
  selectedHistoryYear: number;
  previousHistoryYear: number;
  nextHistoryYear: number;
  isNextDisabled: boolean;
}

export function resolveAnnualLimitsHistoryYear(rawHistoryYear: string | undefined, currentYear: number): ResolvedAnnualLimitsHistoryYear {
  const fallback = currentYear - 1;

  if (!rawHistoryYear) {
    return buildResolvedYear(fallback, currentYear);
  }

  const parsed = Number(rawHistoryYear);

  if (!Number.isInteger(parsed) || parsed >= currentYear) {
    return buildResolvedYear(fallback, currentYear);
  }

  return buildResolvedYear(parsed, currentYear);
}

function buildResolvedYear(selectedHistoryYear: number, currentYear: number): ResolvedAnnualLimitsHistoryYear {
  return {
    selectedHistoryYear,
    previousHistoryYear: selectedHistoryYear - 1,
    nextHistoryYear: selectedHistoryYear + 1,
    isNextDisabled: selectedHistoryYear + 1 >= currentYear,
  };
}
