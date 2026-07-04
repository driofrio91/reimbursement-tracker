import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { PrismaInvoiceRepository } from "@/modules/reimbursement/infrastructure/PrismaInvoiceRepository";
import { PrismaServiceRepository } from "@/modules/reimbursement/infrastructure/PrismaServiceRepository";

describe("Prisma pagination ordering", () => {
  it("uses a unique tie-breaker for paginated services", async () => {
    const prisma = {
      reimbursableService: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaClient;
    const repository = new PrismaServiceRepository(prisma);

    await repository.listPaginated({ page: 1, pageSize: 10, skip: 0, take: 10 });

    expect(prisma.reimbursableService.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ serviceDate: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      }),
    );
  });

  it("uses a unique tie-breaker for paginated invoices", async () => {
    const prisma = {
      invoice: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaClient;
    const repository = new PrismaInvoiceRepository(prisma);

    await repository.searchPaginated({}, { page: 1, pageSize: 10, skip: 0, take: 10 });

    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      }),
    );
  });
});
