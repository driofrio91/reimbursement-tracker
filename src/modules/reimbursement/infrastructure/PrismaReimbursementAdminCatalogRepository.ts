import { Prisma, PrismaClient } from "@prisma/client";

import {
  AdminCatalogError,
  InsurerAdminRecord,
  PersonAdminRecord,
  ReimbursementAdminCatalogRepository,
} from "@/modules/reimbursement/application/AdminCatalogUseCases";

export class PrismaReimbursementAdminCatalogRepository implements ReimbursementAdminCatalogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listPeople(): Promise<PersonAdminRecord[]> {
    const people = await this.prisma.person.findMany({
      orderBy: [{ isActive: "desc" }, { displayName: "asc" }],
    });

    return people.map((person) => ({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      displayName: person.displayName,
      documentNumber: person.documentNumber,
      notes: person.notes,
      isActive: person.isActive,
    }));
  }

  async createPerson(input: {
    firstName: string;
    lastName: string;
    displayName: string;
    documentNumber?: string;
    notes?: string;
  }): Promise<PersonAdminRecord> {
    try {
      const person = await this.prisma.person.create({
        data: {
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          displayName: input.displayName.trim(),
          documentNumber: input.documentNumber?.trim() || null,
          notes: input.notes?.trim() || null,
          isActive: true,
        },
      });

      return {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        displayName: person.displayName,
        documentNumber: person.documentNumber,
        notes: person.notes,
        isActive: person.isActive,
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AdminCatalogError("PERSON_DISPLAY_NAME_IN_USE", "El displayName ya esta en uso.");
      }

      throw error;
    }
  }

  async updatePerson(input: {
    personId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    documentNumber?: string;
    notes?: string;
    isActive: boolean;
  }): Promise<PersonAdminRecord | null> {
    try {
      const result = await this.prisma.person.updateMany({
        where: { id: input.personId },
        data: {
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          displayName: input.displayName.trim(),
          documentNumber: input.documentNumber?.trim() || null,
          notes: input.notes?.trim() || null,
          isActive: input.isActive,
        },
      });

      if (result.count === 0) {
        return null;
      }

      const person = await this.prisma.person.findUnique({ where: { id: input.personId } });

      if (!person) {
        return null;
      }

      return {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        displayName: person.displayName,
        documentNumber: person.documentNumber,
        notes: person.notes,
        isActive: person.isActive,
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AdminCatalogError("PERSON_DISPLAY_NAME_IN_USE", "El displayName ya esta en uso.");
      }

      throw error;
    }
  }

  async setPersonActive(personId: string, isActive: boolean): Promise<PersonAdminRecord | null> {
    const result = await this.prisma.person.updateMany({
      where: { id: personId },
      data: { isActive },
    });

    if (result.count === 0) {
      return null;
    }

    const person = await this.prisma.person.findUnique({ where: { id: personId } });
    if (!person) {
      return null;
    }

    return {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      displayName: person.displayName,
      documentNumber: person.documentNumber,
      notes: person.notes,
      isActive: person.isActive,
    };
  }

  async listInsurers(): Promise<InsurerAdminRecord[]> {
    const insurers = await this.prisma.insurer.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return insurers.map((insurer) => ({
      id: insurer.id,
      name: insurer.name,
      code: insurer.code,
      notes: insurer.notes,
      isActive: insurer.isActive,
    }));
  }

  async createInsurer(input: { name: string; code: string; notes?: string }): Promise<InsurerAdminRecord> {
    try {
      const insurer = await this.prisma.insurer.create({
        data: {
          name: input.name.trim(),
          code: input.code.trim().toUpperCase(),
          notes: input.notes?.trim() || null,
          isActive: true,
        },
      });

      return {
        id: insurer.id,
        name: insurer.name,
        code: insurer.code,
        notes: insurer.notes,
        isActive: insurer.isActive,
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AdminCatalogError("INSURER_CODE_IN_USE", "El codigo de aseguradora ya existe.");
      }

      throw error;
    }
  }

  async updateInsurer(input: {
    insurerId: string;
    name: string;
    code: string;
    notes?: string;
    isActive: boolean;
  }): Promise<InsurerAdminRecord | null> {
    try {
      const result = await this.prisma.insurer.updateMany({
        where: { id: input.insurerId },
        data: {
          name: input.name.trim(),
          code: input.code.trim().toUpperCase(),
          notes: input.notes?.trim() || null,
          isActive: input.isActive,
        },
      });

      if (result.count === 0) {
        return null;
      }

      const insurer = await this.prisma.insurer.findUnique({ where: { id: input.insurerId } });
      if (!insurer) {
        return null;
      }

      return {
        id: insurer.id,
        name: insurer.name,
        code: insurer.code,
        notes: insurer.notes,
        isActive: insurer.isActive,
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AdminCatalogError("INSURER_CODE_IN_USE", "El codigo de aseguradora ya existe.");
      }

      throw error;
    }
  }

  async setInsurerActive(insurerId: string, isActive: boolean): Promise<InsurerAdminRecord | null> {
    const result = await this.prisma.insurer.updateMany({
      where: { id: insurerId },
      data: { isActive },
    });

    if (result.count === 0) {
      return null;
    }

    const insurer = await this.prisma.insurer.findUnique({ where: { id: insurerId } });
    if (!insurer) {
      return null;
    }

    return {
      id: insurer.id,
      name: insurer.name,
      code: insurer.code,
      notes: insurer.notes,
      isActive: insurer.isActive,
    };
  }

  async isInsurerInUse(insurerId: string): Promise<boolean> {
    const [services, invoices, annualLimits] = await Promise.all([
      this.prisma.reimbursableService.count({ where: { insurerId } }),
      this.prisma.invoice.count({ where: { insurerId } }),
      this.prisma.personAnnualReimbursementLimit.count({ where: { insurerId } }),
    ]);

    return services > 0 || invoices > 0 || annualLimits > 0;
  }
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
