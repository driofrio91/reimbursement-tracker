export interface CreateServiceInput {
  serviceDate: Date;
  description: string;
  actualAmount: number;
  personId: string;
  insurerId: string;
  policyHolderName: string;
  attended?: boolean;
  notes?: string;
}

export interface CreateServiceResult {
  id: string;
}
