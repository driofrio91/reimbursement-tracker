import { UserAnnualReimbursementLimit } from "@/modules/reimbursement/domain/UserAnnualReimbursementLimit";
import { UserAnnualReimbursementLimitRepository } from "@/modules/reimbursement/domain/UserAnnualReimbursementLimitRepository";

export class GetOrCreateUserAnnualReimbursementLimitUseCaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GetOrCreateUserAnnualReimbursementLimitUseCaseError";
  }
}

interface GetOrCreateUserAnnualReimbursementLimitUseCaseDependencies {
  repository: UserAnnualReimbursementLimitRepository;
}

const DEFAULT_ANNUAL_LIMIT_AMOUNT = 1500;
const DEFAULT_CURRENCY = "EUR";

export async function getOrCreateUserAnnualReimbursementLimitUseCase(
  userId: string,
  year: number,
  dependencies: GetOrCreateUserAnnualReimbursementLimitUseCaseDependencies,
): Promise<UserAnnualReimbursementLimit> {
  if (!userId.trim()) {
    throw new GetOrCreateUserAnnualReimbursementLimitUseCaseError("El usuario es obligatorio.");
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new GetOrCreateUserAnnualReimbursementLimitUseCaseError("El ano indicado no es valido.");
  }

  const existing = await dependencies.repository.getByUserIdAndYear(userId, year);

  if (existing) {
    return existing;
  }

  return dependencies.repository.create({
    userId,
    year,
    annualLimitAmount: DEFAULT_ANNUAL_LIMIT_AMOUNT,
    reimbursedAccumulated: 0,
    currency: DEFAULT_CURRENCY,
  });
}
