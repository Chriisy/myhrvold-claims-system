import { z } from "zod";

// Customer Information Schema
export const customerInfoSchema = z.object({
  customerName: z.string()
    .min(1, "Kunde navn er påkrevd")
    .max(100, "Kunde navn kan ikke være lengre enn 100 tegn"),
  customerNumber: z.string().optional(),
  customerContact: z.string().optional(),
  customerEmail: z.string()
    .email("Ugyldig e-postadresse")
    .optional()
    .or(z.literal("")),
  customerPhone: z.string()
    .regex(/^(\+47)?[0-9\s-]{8,15}$/, "Ugyldig telefonnummer")
    .optional()
    .or(z.literal("")),
  customerAddress: z.string().optional(),
});

// Product Information Schema
export const productInfoSchema = z.object({
  productName: z.string()
    .min(1, "Produktnavn er påkrevd")
    .max(100, "Produktnavn kan ikke være lengre enn 100 tegn"),
  productNumber: z.string().optional(),
  productModel: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyPeriod: z.enum(["1year", "2years", "3years", "5years"]).optional(),
  supplier: z.string()
    .min(1, "Leverandør er påkrevd")
    .max(100, "Leverandør kan ikke være lengre enn 100 tegn"),
  supplierReferenceNumber: z.string().optional(),
});

// Issue Description Schema
export const issueDescriptionSchema = z.object({
  issueType: z.enum(["warranty", "claim", "service_callback", "extended_warranty"], {
    required_error: "Sakstype er påkrevd",
  }),
  issueDescription: z.string()
    .min(1, "Kort beskrivelse er påkrevd")
    .max(500, "Beskrivelse kan ikke være lengre enn 500 tegn"),
  detailedDescription: z.string()
    .max(2000, "Detaljert beskrivelse kan ikke være lengre enn 2000 tegn")
    .optional(),
  urgencyLevel: z.enum(["low", "normal", "high", "critical"]).default("normal"),
});

// Business Fields Schema
export const businessFieldsSchema = z.object({
  technicianName: z.string()
    .min(1, "Tekniker navn er påkrevd"),
  department: z.enum(["oslo", "bergen", "trondheim", "stavanger", "kristiansand", "nord_norge", "innlandet"]),
  evaticJobNumber: z.string().optional(),
  msJobNumber: z.string().optional(),
});

// Custom Line Item Schema
export const customLineItemSchema = z.object({
  id: z.string(),
  description: z.string()
    .min(1, "Beskrivelse er påkrevd")
    .max(200, "Beskrivelse kan ikke være lengre enn 200 tegn"),
  quantity: z.number()
    .min(0, "Antall kan ikke være negativt")
    .max(1000, "Antall kan ikke overstige 1000"),
  unitPrice: z.number()
    .min(0, "Enhetspris kan ikke være negativ")
    .max(100000, "Enhetspris kan ikke overstige 100,000 NOK"),
});

// Cost Breakdown Schema
export const costBreakdownSchema = z.object({
  workHours: z.number()
    .min(0, "Arbeidstimer kan ikke være negative")
    .max(100, "Arbeidstimer kan ikke overstige 100")
    .default(0),
  hourlyRate: z.number()
    .min(0, "Timelønn kan ikke være negativ")
    .max(5000, "Timelønn kan ikke overstige 5000 NOK")
    .default(1250),
  overtime50Hours: z.number()
    .min(0, "Overtid 50% timer kan ikke være negative")
    .max(50, "Overtid 50% timer kan ikke overstige 50")
    .default(0),
  overtime100Hours: z.number()
    .min(0, "Overtid 100% timer kan ikke være negative")
    .max(50, "Overtid 100% timer kan ikke overstige 50")
    .default(0),
  customLineItems: z.array(customLineItemSchema).default([]),
  travelHours: z.number()
    .min(0, "Reisetimer kan ikke være negative")
    .max(24, "Reisetimer kan ikke overstige 24")
    .default(0),
  travelDistanceKm: z.number()
    .min(0, "Reiseavstand kan ikke være negativ")
    .max(2000, "Reiseavstand kan ikke overstige 2000 km")
    .default(0),
  vehicleCostPerKm: z.number()
    .min(0, "Kjøretøykostnad per km kan ikke være negativ")
    .max(50, "Kjøretøykostnad per km kan ikke overstige 50 NOK")
    .default(7.5),
  partsCost: z.number()
    .min(0, "Delekostnad kan ikke være negativ")
    .max(1000000, "Delekostnad kan ikke overstige 1,000,000 NOK")
    .default(0),
  consumablesCost: z.number()
    .min(0, "Forbruksmateriell kostnad kan ikke være negativ")
    .max(100000, "Forbruksmateriell kostnad kan ikke overstige 100,000 NOK")
    .default(0),
  externalServicesCost: z.number()
    .min(0, "Ekstern tjeneste kostnad kan ikke være negativ")
    .max(500000, "Ekstern tjeneste kostnad kan ikke overstige 500,000 NOK")
    .default(0),
});

// Refund Information Schema
export const refundInfoSchema = z.object({
  refundedWorkCost: z.number()
    .min(0, "Refundert arbeidskostnad kan ikke være negativ")
    .default(0),
  refundedTravelCost: z.number()
    .min(0, "Refundert reisekostnad kan ikke være negativ")
    .default(0),
  refundedVehicleCost: z.number()
    .min(0, "Refundert kjøretøykostnad kan ikke være negativ")
    .default(0),
  refundedPartsCost: z.number()
    .min(0, "Refundert delekostnad kan ikke være negativ")
    .default(0),
  refundedOtherCost: z.number()
    .min(0, "Refundert annen kostnad kan ikke være negativ")
    .default(0),
  creditNoteNumber: z.string().optional(),
  refundDateReceived: z.string().optional(),
  workCostRefunded: z.boolean().default(false),
  travelCostRefunded: z.boolean().default(false),
  vehicleCostRefunded: z.boolean().default(false),
  partsCostRefunded: z.boolean().default(false),
  otherCostRefunded: z.boolean().default(false),
});

// Notes Schema
export const notesSchema = z.object({
  internalNotes: z.string()
    .max(1000, "Interne notater kan ikke være lengre enn 1000 tegn")
    .optional(),
  customerNotes: z.string()
    .max(1000, "Kunde notater kan ikke være lengre enn 1000 tegn")
    .optional(),
});

// Complete Claim Form Schema
export const claimFormSchema = z.object({
  ...customerInfoSchema.shape,
  ...productInfoSchema.shape,
  ...issueDescriptionSchema.shape,
  ...businessFieldsSchema.shape,
  ...costBreakdownSchema.shape,
  ...refundInfoSchema.shape,
  ...notesSchema.shape,
}).superRefine((data, ctx) => {
  // Custom validation: Travel cost calculation
  const expectedTravelCost = data.travelHours * data.hourlyRate + 
                             data.travelDistanceKm * data.vehicleCostPerKm;
  
  if (data.refundedTravelCost > expectedTravelCost) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Refundert reisekostnad kan ikke overstige kalkulert reisekostnad",
      path: ["refundedTravelCost"],
    });
  }

  // Custom validation: Work cost calculation
  const expectedWorkCost = data.workHours * data.hourlyRate;
  
  if (data.refundedWorkCost > expectedWorkCost) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Refundert arbeidskostnad kan ikke overstige kalkulert arbeidskostnad",
      path: ["refundedWorkCost"],
    });
  }

  // Custom validation: Parts cost
  if (data.refundedPartsCost > data.partsCost) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Refundert delekostnad kan ikke overstige faktisk delekostnad",
      path: ["refundedPartsCost"],
    });
  }

  // Custom validation: Email or phone required for customer contact
  if (!data.customerEmail && !data.customerPhone && data.customerContact) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "E-post eller telefon er påkrevd når kontaktperson er oppgitt",
      path: ["customerEmail"],
    });
  }
});

export type ClaimFormData = z.infer<typeof claimFormSchema>;

// Utility function to get default form values
export const getDefaultClaimFormValues = (): ClaimFormData => ({
  // Customer info
  customerName: "",
  customerNumber: "",
  customerContact: "",
  customerEmail: "",
  customerPhone: "",
  customerAddress: "",
  
  // Product info
  productName: "",
  productNumber: "",
  productModel: "",
  serialNumber: "",
  purchaseDate: "",
  warrantyPeriod: undefined,
  supplier: "",
  supplierReferenceNumber: "",
  
  // Issue description
  issueType: "warranty",
  issueDescription: "",
  detailedDescription: "",
  urgencyLevel: "normal",
  
  // Business fields
  technicianName: "",
  department: "oslo",
  evaticJobNumber: "",
  msJobNumber: "",
  
  // Cost breakdown
  workHours: 0,
  hourlyRate: 1250,
  overtime50Hours: 0,
  overtime100Hours: 0,
  customLineItems: [],
  travelHours: 0,
  travelDistanceKm: 0,
  vehicleCostPerKm: 7.5,
  partsCost: 0,
  consumablesCost: 0,
  externalServicesCost: 0,
  
  // Refund info
  refundedWorkCost: 0,
  refundedTravelCost: 0,
  refundedVehicleCost: 0,
  refundedPartsCost: 0,
  refundedOtherCost: 0,
  creditNoteNumber: "",
  refundDateReceived: "",
  workCostRefunded: false,
  travelCostRefunded: false,
  vehicleCostRefunded: false,
  partsCostRefunded: false,
  otherCostRefunded: false,
  
  // Notes
  internalNotes: "",
  customerNotes: "",
});