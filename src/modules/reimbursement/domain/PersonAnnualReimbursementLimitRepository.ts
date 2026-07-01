import {
  NewPersonAnnualReimbursementLimit,
  PersonAnnualReimbursementLimit,
} from "@/modules/reimbursement/domain/PersonAnnualReimbursementLimit";

export interface PersonAnnualLimitYearRow {
  insuranceHolderPersonId: string;
  insuranceHolderPersonName: string;
  insurerId: string;
  insurerName: string;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
}

export interface PersonAnnualLimitSnapshotKey {
  insuranceHolderPersonId: string;
  insurerId: string;
}

export interface PersonAnnualReimbursementLimitRepository {
  getByPersonInsurerYear(insuranceHolderPersonId: string, insurerId: string, year: number): Promise<PersonAnnualReimbursementLimit | null>;
  create(limit: NewPersonAnnualReimbursementLimit): Promise<PersonAnnualReimbursementLimit>;
  upsertForPersonInsurerYear(insuranceHolderPersonId: string, insurerId: string, year: number): Promise<PersonAnnualReimbursementLimit>;
  applyDelta(insuranceHolderPersonId: string, insurerId: string, year: number, delta: number): Promise<PersonAnnualReimbursementLimit>;
  setAccumulated(insuranceHolderPersonId: string, insurerId: string, year: number, accumulated: number): Promise<PersonAnnualReimbursementLimit>;
  zeroAccumulatedNotInYearSnapshot(year: number, activeKeys: PersonAnnualLimitSnapshotKey[]): Promise<number>;
  listByYear(year: number): Promise<PersonAnnualLimitYearRow[]>;
}
