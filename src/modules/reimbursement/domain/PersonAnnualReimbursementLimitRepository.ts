import {
  NewPersonAnnualReimbursementLimit,
  PersonAnnualReimbursementLimit,
} from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimit";

export interface PersonAnnualReimbursementLimitRepository {
  getByPersonInsurerYear(personId: string, insurerId: string, year: number): Promise<PersonAnnualReimbursementLimit | null>;
  create(limit: NewPersonAnnualReimbursementLimit): Promise<PersonAnnualReimbursementLimit>;
  upsertForPersonInsurerYear(personId: string, insurerId: string, year: number): Promise<PersonAnnualReimbursementLimit>;
  applyDelta(personId: string, insurerId: string, year: number, delta: number): Promise<PersonAnnualReimbursementLimit>;
  setAccumulated(personId: string, insurerId: string, year: number, accumulated: number): Promise<PersonAnnualReimbursementLimit>;
}
