export interface PersonAdminRecord {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  documentNumber: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface InsurerAdminRecord {
  id: string;
  name: string;
  code: string;
  notes: string | null;
  isActive: boolean;
}

export interface ReimbursementAdminCatalogRepository {
  listPeople(): Promise<PersonAdminRecord[]>;
  createPerson(input: {
    firstName: string;
    lastName: string;
    displayName: string;
    documentNumber?: string;
    notes?: string;
  }): Promise<PersonAdminRecord>;
  updatePerson(input: {
    personId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    documentNumber?: string;
    notes?: string;
    isActive: boolean;
  }): Promise<PersonAdminRecord | null>;
  setPersonActive(personId: string, isActive: boolean): Promise<PersonAdminRecord | null>;

  listInsurers(): Promise<InsurerAdminRecord[]>;
  createInsurer(input: { name: string; code: string; notes?: string }): Promise<InsurerAdminRecord>;
  updateInsurer(input: {
    insurerId: string;
    name: string;
    code: string;
    notes?: string;
    isActive: boolean;
  }): Promise<InsurerAdminRecord | null>;
  setInsurerActive(insurerId: string, isActive: boolean): Promise<InsurerAdminRecord | null>;
  isInsurerInUse(insurerId: string): Promise<boolean>;
}

export class AdminCatalogError extends Error {
  constructor(
    readonly code:
      | "PERSON_NOT_FOUND"
      | "PERSON_DISPLAY_NAME_IN_USE"
      | "INSURER_NOT_FOUND"
      | "INSURER_CODE_IN_USE"
      | "INSURER_IN_USE",
    message: string,
  ) {
    super(message);
    this.name = "AdminCatalogError";
  }
}

export async function listPeopleUseCase(dependencies: { catalogRepository: Pick<ReimbursementAdminCatalogRepository, "listPeople"> }) {
  return dependencies.catalogRepository.listPeople();
}

export async function createPersonUseCase(
  input: {
    firstName: string;
    lastName: string;
    displayName: string;
    documentNumber?: string;
    notes?: string;
  },
  dependencies: {
    catalogRepository: Pick<ReimbursementAdminCatalogRepository, "createPerson">;
  },
) {
  return dependencies.catalogRepository.createPerson(input);
}

export async function updatePersonUseCase(
  input: {
    personId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    documentNumber?: string;
    notes?: string;
    isActive: boolean;
  },
  dependencies: {
    catalogRepository: Pick<ReimbursementAdminCatalogRepository, "updatePerson">;
  },
) {
  const updated = await dependencies.catalogRepository.updatePerson(input);

  if (!updated) {
    throw new AdminCatalogError("PERSON_NOT_FOUND", "No se encontro la persona.");
  }

  return updated;
}

export async function setPersonActiveStatusUseCase(
  input: {
    personId: string;
    isActive: boolean;
  },
  dependencies: {
    catalogRepository: Pick<ReimbursementAdminCatalogRepository, "setPersonActive">;
  },
) {
  const updated = await dependencies.catalogRepository.setPersonActive(input.personId, input.isActive);

  if (!updated) {
    throw new AdminCatalogError("PERSON_NOT_FOUND", "No se encontro la persona.");
  }

  return updated;
}

export async function listInsurersUseCase(dependencies: { catalogRepository: Pick<ReimbursementAdminCatalogRepository, "listInsurers"> }) {
  return dependencies.catalogRepository.listInsurers();
}

export async function createInsurerUseCase(
  input: {
    name: string;
    code: string;
    notes?: string;
  },
  dependencies: {
    catalogRepository: Pick<ReimbursementAdminCatalogRepository, "createInsurer">;
  },
) {
  return dependencies.catalogRepository.createInsurer(input);
}

export async function updateInsurerUseCase(
  input: {
    insurerId: string;
    name: string;
    code: string;
    notes?: string;
    isActive: boolean;
  },
  dependencies: {
    catalogRepository: Pick<ReimbursementAdminCatalogRepository, "updateInsurer">;
  },
) {
  const updated = await dependencies.catalogRepository.updateInsurer(input);

  if (!updated) {
    throw new AdminCatalogError("INSURER_NOT_FOUND", "No se encontro la aseguradora.");
  }

  return updated;
}

export async function setInsurerActiveStatusUseCase(
  input: {
    insurerId: string;
    isActive: boolean;
  },
  dependencies: {
    catalogRepository: Pick<ReimbursementAdminCatalogRepository, "setInsurerActive" | "isInsurerInUse">;
  },
) {
  if (!input.isActive) {
    const inUse = await dependencies.catalogRepository.isInsurerInUse(input.insurerId);
    if (inUse) {
      throw new AdminCatalogError("INSURER_IN_USE", "No se puede desactivar una aseguradora en uso.");
    }
  }

  const updated = await dependencies.catalogRepository.setInsurerActive(input.insurerId, input.isActive);

  if (!updated) {
    throw new AdminCatalogError("INSURER_NOT_FOUND", "No se encontro la aseguradora.");
  }

  return updated;
}
