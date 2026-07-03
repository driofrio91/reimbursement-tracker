export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export interface PaginationOptions {
  defaultPageSize?: number;
  maxPageSize?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_MAX_PAGE_SIZE = 50;

export function resolvePagination(input: PaginationInput = {}, options: PaginationOptions = {}): Pagination {
  const defaultPageSize = toPositiveInteger(options.defaultPageSize) ?? DEFAULT_PAGE_SIZE;
  const maxPageSize = toPositiveInteger(options.maxPageSize) ?? DEFAULT_MAX_PAGE_SIZE;
  const effectiveDefaultPageSize = Math.min(defaultPageSize, maxPageSize);
  const page = toPositiveInteger(input.page) ?? DEFAULT_PAGE;
  const requestedPageSize = toPositiveInteger(input.pageSize) ?? effectiveDefaultPageSize;
  const pageSize = Math.min(requestedPageSize, maxPageSize);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function buildPaginationMetadata(pagination: Pagination, totalItems: number): PaginationMetadata {
  const safeTotalItems = Math.max(0, Math.trunc(totalItems));
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / pagination.pageSize));
  const page = Math.min(pagination.page, totalPages);

  return {
    page,
    pageSize: pagination.pageSize,
    totalItems: safeTotalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export function clampPaginationToTotalItems(pagination: Pagination, totalItems: number): Pagination {
  const metadata = buildPaginationMetadata(pagination, totalItems);

  return {
    ...pagination,
    page: metadata.page,
    skip: (metadata.page - 1) * pagination.pageSize,
  };
}

function toPositiveInteger(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const integer = Math.trunc(value);

  return integer > 0 ? integer : undefined;
}
