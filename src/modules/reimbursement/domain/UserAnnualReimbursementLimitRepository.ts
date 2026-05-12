import {
  NewUserAnnualReimbursementLimit,
  UserAnnualReimbursementLimit,
} from "@/modules/reimbursement/domain/UserAnnualReimbursementLimit";

export interface UserAnnualReimbursementLimitRepository {
  getByUserIdAndYear(userId: string, year: number): Promise<UserAnnualReimbursementLimit | null>;
  create(limit: NewUserAnnualReimbursementLimit): Promise<UserAnnualReimbursementLimit>;
}
