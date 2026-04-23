export type ServiceStatus = "REGISTERED" | "SUBMITTED" | "REIMBURSED";

export interface Service {
  id: string;
  serviceDate: Date;
  description: string;
  actualAmount: number;
  currency: string;
  personId: string;
  personName: string;
  insurerId: string;
  insurerName: string;
  policyHolderName: string;
  attended: boolean;
  status: ServiceStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewService {
  serviceDate: Date;
  description: string;
  actualAmount: number;
  currency: string;
  personId: string;
  insurerId: string;
  policyHolderName: string;
  attended: boolean;
  status: ServiceStatus;
  notes?: string | null;
}
