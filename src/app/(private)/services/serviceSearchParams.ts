import { PaginationInput } from "@/modules/reimbursement/application/Pagination";

import { parseNumberQueryParam } from "../_utils/searchParams";

export interface ServicesPageSearchParams {
  page?: string | string[];
  pageSize?: string | string[];
}

export function parseServicesPagination(searchParams: ServicesPageSearchParams): PaginationInput {
  return {
    page: parseNumberQueryParam(searchParams.page),
    pageSize: parseNumberQueryParam(searchParams.pageSize),
  };
}
