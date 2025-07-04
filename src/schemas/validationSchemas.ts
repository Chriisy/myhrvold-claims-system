import { z } from 'zod';

// Schema for claim form validation
export const claimSchema = z.object({
  // Customer information
  customerName: z.string().min(1, "Kundenavn er påkrevd"),
  customerNumber: z.string().min(1, "Kundenummer er påkrevd"),
  customerContact: z.string().optional(),
  customerEmail: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  
  // Product information
  productName: z.string().min(1, "Produktnavn er påkrevd"),
  productModel: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  supplier: z.string().min(1, "Leverandør er påkrevd"),
  
  // Issue details
  issueType: z.enum(['warranty', 'claim', 'service_callback', 'extended_warranty'], {
    required_error: "Type problem er påkrevd"
  }),
  issueDescription: z.string().min(10, "Problembeskrivelse må være minst 10 tegn"),
  detailedDescription: z.string().optional(),
  urgencyLevel: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  
  // Business fields
  technicianName: z.string().min(1, "Tekniker navn er påkrevd"),
  department: z.enum(['oslo', 'bergen', 'trondheim', 'stavanger', 'kristiansand', 'nord_norge', 'innlandet']),
  evaticJobNumber: z.string().optional(),
  msJobNumber: z.string().optional(),
  
  // Cost breakdown
  workHours: z.number().min(0, "Arbeidstimer kan ikke være negativ").default(0),
  hourlyRate: z.number().min(0, "Timelønn kan ikke være negativ").default(1250),
  travelHours: z.number().min(0, "Reisetimer kan ikke være negativ").default(0),
  travelDistanceKm: z.number().min(0, "Reiseavstand kan ikke være negativ").default(0),
  vehicleCostPerKm: z.number().min(0, "Kjøretøykostnad kan ikke være negativ").default(7.5),
  partsCost: z.number().min(0, "Delekostnad kan ikke være negativ").default(0),
  consumablesCost: z.number().min(0, "Forbruksmateriell kan ikke være negativ").default(0),
  externalServicesCost: z.number().min(0, "Eksterne tjenester kan ikke være negativ").default(0),
  travelCost: z.number().min(0, "Reisekostnad kan ikke være negativ").default(0),
  
  // Refund breakdown
  refundedWorkCost: z.number().min(0, "Refundert arbeid kan ikke være negativ").default(0),
  refundedTravelCost: z.number().min(0, "Refundert reise kan ikke være negativ").default(0),
  refundedVehicleCost: z.number().min(0, "Refundert kjøretøy kan ikke være negativ").default(0),
  refundedPartsCost: z.number().min(0, "Refunderte deler kan ikke være negativ").default(0),
  refundedOtherCost: z.number().min(0, "Andre refusjoner kan ikke være negativ").default(0),
  creditNoteNumber: z.string().optional(),
  refundDateReceived: z.string().optional(),
  
  // Refund status
  workCostRefunded: z.boolean().default(false),
  travelCostRefunded: z.boolean().default(false),
  vehicleCostRefunded: z.boolean().default(false),
  partsCostRefunded: z.boolean().default(false),
  otherCostRefunded: z.boolean().default(false),
  
  // Notes
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
}).refine((data) => {
  // At least one job number is required
  return data.evaticJobNumber || data.msJobNumber;
}, {
  message: "Enten Evatic jobbnummer eller MS-nummer må fylles ut",
  path: ["evaticJobNumber"]
}).refine((data) => {
  // Refunded amounts cannot exceed costs
  const workCost = data.workHours * data.hourlyRate;
  return data.refundedWorkCost <= workCost;
}, {
  message: "Refundert arbeid kan ikke overstige arbeidskostnad",
  path: ["refundedWorkCost"]
});

// Schema for supplier email form
export const supplierEmailSchema = z.object({
  supplierEmail: z.string().email("Ugyldig e-postadresse").min(1, "E-postadresse er påkrevd"),
  language: z.enum(['no', 'en']).default('no'),
});

export type ClaimFormData = z.infer<typeof claimSchema>;
export type SupplierEmailFormData = z.infer<typeof supplierEmailSchema>;