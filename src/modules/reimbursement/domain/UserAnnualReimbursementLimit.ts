export interface UserAnnualReimbursementLimit {
  id: string;
  userId: string;
  year: number;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUserAnnualReimbursementLimit {
  userId: string;
  year: number;
  annualLimitAmount: number;
  reimbursedAccumulated: number;
  currency: string;
}
