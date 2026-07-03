import { describe, expect, it } from "vitest";

import {
  buildPaginationMetadata,
  clampPaginationToTotalItems,
  resolvePagination,
} from "@/modules/reimbursement/application/Pagination";

describe("Pagination", () => {
  it("uses safe defaults when query values are missing", () => {
    expect(resolvePagination()).toEqual({
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
    });
  });

  it("normalizes invalid page and page size values", () => {
    expect(resolvePagination({ page: -5, pageSize: Number.NaN })).toEqual({
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
    });
  });

  it("caps page size to the configured maximum", () => {
    expect(resolvePagination({ page: 3, pageSize: 500 }, { maxPageSize: 50 })).toEqual({
      page: 3,
      pageSize: 50,
      skip: 100,
      take: 50,
    });
  });

  it("builds metadata from total result count", () => {
    expect(buildPaginationMetadata(resolvePagination({ page: 2, pageSize: 10 }), 25)).toEqual({
      page: 2,
      pageSize: 10,
      totalItems: 25,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    });
  });

  it("clamps out-of-range metadata to the last available page", () => {
    expect(buildPaginationMetadata(resolvePagination({ page: 999, pageSize: 10 }), 25)).toEqual({
      page: 3,
      pageSize: 10,
      totalItems: 25,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: false,
    });
  });

  it("clamps query pagination to the last available page", () => {
    expect(clampPaginationToTotalItems(resolvePagination({ page: 999, pageSize: 10 }), 25)).toEqual({
      page: 3,
      pageSize: 10,
      skip: 20,
      take: 10,
    });
  });
});
