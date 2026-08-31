export type CustomerType = 'customer' | 'prospect' | 'partner';
export type CustomerStatus = 'lead' | 'contacted' | 'proposal_sent' | 'active' | 'churned';
export type BillingCycle = 'monthly' | 'annually' | 'quarterly' | 'one-time';
export type PaymentStatus = 'current' | 'pending' | 'overdue' | 'paid';
export type DocumentType = 'agreement' | 'proposal' | 'nda' | 'sla' | 'invoice' | 'custom';
export type DocumentStatus = 'draft' | 'sent_for_signature' | 'signed' | 'expired';
export type NoteCategory = 'general' | 'call_log' | 'meeting' | 'urgent' | 'contract';
export type EventType = 'meeting' | 'demo' | 'block' | 'milestone';
export type UserRole = 'admin' | 'employee';

export interface Organization {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  defaultWatermark?: string;
  isDemo?: boolean;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  orgId: string;
  role: UserRole;
  createdAt: number;
}

export interface ContactPerson {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface FinancialRecord {
  totalContractValue: number;
  setupFee?: number; // One-time build / onboarding fee
  recurringAmount: number;
  billingCycle: BillingCycle;
  paymentStatus: PaymentStatus;
  nextRenewalDate?: number;
  startDate?: number;
}

export interface ProjectDeployment {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'onboarding' | 'live' | 'paused';
  productsUsed: string[];
  activeUsersCount: number;
  leadEngineer?: string;
  updatedAt: number;
}

export interface Customer {
  id: string;
  orgId: string;
  name: string; // e.g. "Town of Rehobeth"
  primaryProduct?: string; // e.g. "GovStax", "Company Pulse", "StaxEcho"
  type: CustomerType;
  status: CustomerStatus;
  industry?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  contacts: ContactPerson[];
  financials: FinancialRecord;
  projects: ProjectDeployment[];
  tags: string[];
  notesCount?: number;
  documentsCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ContractDocument {
  id: string;
  orgId: string;
  customerId: string;
  customerName?: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  contentHtml?: string; // For built-in contracts / templates
  watermarkText?: string;
  signatureRequired: boolean;
  signatureData?: {
    signerName: string;
    signerEmail: string;
    signatureImageBase64?: string;
    signedAt: number;
    ipAddress?: string;
    auditLogId: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface ActivityNote {
  id: string;
  orgId: string;
  customerId: string;
  customerName?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  taggedUserIds: string[];
  category: NoteCategory;
  attachments: {
    name: string;
    url: string;
    sizeBytes: number;
  }[];
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  start: number; // unix timestamp in ms
  end: number; // unix timestamp in ms
  allDay?: boolean;
  location?: string;
  attendeeUserIds: string[];
  type: EventType;
  googleEventId?: string;
  syncStatus?: 'synced' | 'local_only';
  createdAt: number;
}
