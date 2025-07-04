export interface ClaimCustomer {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface ClaimProduct {
  name: string;
  serialNumber: string;
  purchaseDate: string;
  warranty: string;
  supplier: string;
}

export interface ClaimIssue {
  type: string;
  description: string;
  urgency: string;
}

export interface ClaimFile {
  name: string;
  size: string;
  type: string;
}

export interface ClaimTimelineEvent {
  date: string;
  action: string;
  user: string;
  status: string;
}

export interface Claim {
  id: string;
  status: string;
  customer: ClaimCustomer;
  product: ClaimProduct;
  issue: ClaimIssue;
  technician: string;
  createdDate: string;
  lastUpdated: string;
  files: ClaimFile[];
  timeline: ClaimTimelineEvent[];
}