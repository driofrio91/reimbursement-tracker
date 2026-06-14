export interface PersonAnnualReimbursementLimit {
  id: string;
  insuranceHolderPersonId: string;
  insurerId: string;
  year: number;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewPersonAnnualReimbursementLimit {
  insuranceHolderPersonId: string;
  insurerId: string;
  year: number;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
}
