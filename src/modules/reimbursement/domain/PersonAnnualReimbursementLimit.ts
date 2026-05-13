export interface PersonAnnualReimbursementLimit {
  id: string;
  personId: string;
  insurerId: string;
  year: number;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewPersonAnnualReimbursementLimit {
  personId: string;
  insurerId: string;
  year: number;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
}
