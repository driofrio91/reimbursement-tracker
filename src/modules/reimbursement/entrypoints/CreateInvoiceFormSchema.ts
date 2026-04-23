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

export const createInvoiceFormSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "El numero de factura es obligatorio."),
  invoiceDate: z.string().trim().regex(datePattern, "La fecha de factura es obligatoria."),
  amount: amountSchema,
  issuerName: z.string().trim().min(1, "El emisor es obligatorio."),
  issuerTaxId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type CreateInvoiceFormInput = z.infer<typeof createInvoiceFormSchema>;

export interface CreateInvoiceFormValues {
  invoiceNumber: string;
  invoiceDate: string;
  amount: string;
  issuerName: string;
  issuerTaxId: string;
  notes: string;
}

export interface CreateInvoiceFormNotification {
  type: "success" | "error";
  message: string;
  nonce: number;
}

export interface CreateInvoiceFormState {
  errors: Partial<Record<keyof CreateInvoiceFormValues | "form", string>>;
  values: CreateInvoiceFormValues;
  notification?: CreateInvoiceFormNotification;
}

export const initialCreateInvoiceFormValues: CreateInvoiceFormValues = {
  invoiceNumber: "",
  invoiceDate: "",
  amount: "",
  issuerName: "",
  issuerTaxId: "",
  notes: "",
};

export const initialCreateInvoiceFormState: CreateInvoiceFormState = {
  errors: {},
  values: initialCreateInvoiceFormValues,
};

export function getCreateInvoiceFormValues(formData: FormData): CreateInvoiceFormValues {
  return {
    invoiceNumber: getString(formData, "invoiceNumber"),
    invoiceDate: getString(formData, "invoiceDate"),
    amount: getString(formData, "amount"),
    issuerName: getString(formData, "issuerName"),
    issuerTaxId: getString(formData, "issuerTaxId"),
    notes: getString(formData, "notes"),
  };
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
