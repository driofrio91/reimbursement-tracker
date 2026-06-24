export interface ReferencePerson {
  id: string;
  displayName: string;
}

export interface ReferenceInsurer {
  id: string;
  name: string;
}

export interface ReimbursementReferenceData {
  people: ReferencePerson[];
  insurers: ReferenceInsurer[];
}

export interface ReferenceDataRepository {
  getReferenceData(): Promise<ReimbursementReferenceData>;
}

interface GetReimbursementReferenceDataUseCaseDependencies {
  referenceDataRepository: ReferenceDataRepository;
}

export async function getReimbursementReferenceDataUseCase(
  dependencies: GetReimbursementReferenceDataUseCaseDependencies,
): Promise<ReimbursementReferenceData> {
  return dependencies.referenceDataRepository.getReferenceData();
}
