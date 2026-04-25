import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const amountSchema = z
  .string()
  .trim()
  .min(1, "El importe es obligatorio.")
  .transform((value) => value.replace(",", "."))
  .refine((value) => !Number.isNaN(Number(value)), "El importe debe ser un numero valido.")
  .transform((value) => Number(value))
  .refine((value) => value > 0, "El importe debe ser mayor que cero.");

export const createServiceFormSchema = z.object({
  serviceDate: z.string().trim().regex(datePattern, "La fecha del servicio es obligatoria."),
  description: z.string().trim().min(1, "El concepto es obligatorio."),
  actualAmount: amountSchema,
  invoiceBilledAmount: amountSchema,
  invoiceExpectedAmount: amountSchema,
  personId: z.string().trim().min(1, "La persona es obligatoria."),
  insurerId: z.string().trim().min(1, "La aseguradora es obligatoria."),
  policyHolderName: z.string().trim().min(1, "El titular es obligatorio."),
  attended: z.boolean(),
  notes: z.string().trim().optional(),
});

export type CreateServiceFormInput = z.infer<typeof createServiceFormSchema>;

export interface CreateServiceFormValues {
  serviceDate: string;
  description: string;
  actualAmount: string;
  invoiceBilledAmount: string;
  invoiceExpectedAmount: string;
  personId: string;
  insurerId: string;
  policyHolderName: string;
  attended: boolean;
  notes: string;
}

export interface CreateServiceFormState {
  errors: Partial<Record<keyof CreateServiceFormValues | "form", string>>;
  values: CreateServiceFormValues;
}

export const initialCreateServiceFormValues: CreateServiceFormValues = {
  serviceDate: "",
  description: "",
  actualAmount: "",
  invoiceBilledAmount: "55",
  invoiceExpectedAmount: "49.5",
  personId: "",
  insurerId: "",
  policyHolderName: "",
  attended: true,
  notes: "",
};

export const initialCreateServiceFormState: CreateServiceFormState = {
  errors: {},
  values: initialCreateServiceFormValues,
};

export function getCreateServiceFormValues(formData: FormData): CreateServiceFormValues {
  return {
    serviceDate: getString(formData, "serviceDate"),
    description: getString(formData, "description"),
    actualAmount: getString(formData, "actualAmount"),
    invoiceBilledAmount: getString(formData, "invoiceBilledAmount"),
    invoiceExpectedAmount: getString(formData, "invoiceExpectedAmount"),
    personId: getString(formData, "personId"),
    insurerId: getString(formData, "insurerId"),
    policyHolderName: getString(formData, "policyHolderName"),
    attended: formData.get("attended") === "on",
    notes: getString(formData, "notes"),
  };
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
