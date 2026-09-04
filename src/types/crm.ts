export type CustomerType = 'customer' | 'prospect' | 'partner';
export type CustomerStatus = 'lead' | 'contacted' | 'proposal_sent' | 'active' | 'churned';
export type BillingCycle = 'monthly' | 'annually' | 'quarterly' | 'one-time';
export type PaymentStatus = 'current' | 'pending' | 'overdue' | 'paid';
export type DocumentScope = 'company_vault' | 'client_contract' | 'template';
export type DocumentType = 
  | 'agreement' 
  | 'proposal' 
  | 'nda' 
  | 'sla' 
  | 'invoice' 
  | 'tax_w9' 
  | 'llc_legal' 
  | 'insurance' 
  | 'memo' 
  | 'custom';
export type DocumentStatus = 'draft' | 'sent_for_signature' | 'signed' | 'official_record' | 'expired';
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
  renewalDayOfMonth?: number; // e.g. 15 (15th of each month / year)
  nextRenewalDate?: number;
  autoInvoicing?: boolean;
  startDate?: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'reminder_sent' | 'overdue' | 'paid' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  orgId: string;
  invoiceNumber: string; // e.g. "INV-2026-001"
  customerId: string;
  customerName: string;
  issueDate: number;
  dueDate: number;
  status: InvoiceStatus;
  billingCycle: BillingCycle;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  remitTo: string;
  sentAt?: number;
  paidAt?: number;
  reminderSentAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type ExpenseCategory = 
  | 'owner_draw' 
  | 'ai_apis' 
  | 'cloud_infra' 
  | 'dev_tools' 
  | 'legal_admin' 
  | 'contractors' 
  | 'office_travel' 
  | 'revenue_inflow' 
  | 'other';

export type TransactionType = 'debit' | 'credit';

export interface BankTransaction {
  id: string;
  orgId: string;
  date: number; // timestamp in ms
  description: string;
  payeeClean: string; // e.g. "Vercel Inc."
  amount: number; // always positive magnitude
  type: TransactionType; // 'debit' (spending/draw) | 'credit' (inflow/deposit)
  category: ExpenseCategory;
  partnerName?: string; // e.g. "JOSH", "Admin Operator", "Split 50/50"
  memo?: string;
  isRecurring?: boolean;
  importedAt: number;
  sourceFile?: string;
}

export interface PartnerEquitySummary {
  partnerName: string;
  totalDrawsYtd: number;
  drawCount: number;
  recentDraws: BankTransaction[];
  targetSharePercent?: number; // e.g. 50%
}

export type ProjectStage = 
  | 'theory' 
  | 'not_started' 
  | 'in_progress' 
  | 'needs_attention' 
  | 'completed';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectNoteItem {
  id: string;
  authorId?: string;
  authorName: string;
  content: string;
  createdAt: number;
}

export interface ProjectAssignee {
  name: string;
  email?: string;
  avatar?: string;
}

export interface ProjectCard {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  stage: ProjectStage;
  priority: ProjectPriority;
  assignees: ProjectAssignee[];
  customerId?: string;
  customerName?: string;
  tags: string[];
  tasks: ProjectTaskItem[];
  notes: ProjectNoteItem[];
  progressPercentage?: number;
  targetLaunchDate?: number;
  createdAt: number;
  updatedAt: number;
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

export type SignaturePlacement = 'dual' | 'single_client' | 'none';

export interface ContractTemplate {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  productTag?: string; // e.g. "GovStax", "Company Pulse", "All"
  category: 'agreement' | 'nda' | 'sow' | 'memo' | 'w9_summary' | 'custom';
  defaultWatermark: WatermarkOption;
  signaturePlacement: SignaturePlacement;
  scopeAndTermsText: string;
  additionalProvisions?: string;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ContractDocument {
  id: string;
  orgId: string;
  scope?: DocumentScope;
  customerId?: string; // Optional for company vault assets
  customerName?: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  contentHtml?: string; // For custom body / notes
  templateType?: 'msa' | 'nda' | 'sow' | 'memo' | 'w9_summary' | 'custom';
  templateData?: Record<string, any>;
  isGenerated?: boolean;
  watermarkText?: string;
  signatureRequired: boolean;
  signaturePlacement?: SignaturePlacement;
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

export type WatermarkOption = 
  | "NONE" 
  | "CONFIDENTIAL" 
  | "DRAFT" 
  | "FOR REVIEW ONLY" 
  | "INTERNAL USE ONLY" 
  | "STAXIFY";

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
  reminderMinutes?: number; // 0, 15, 30, 60, 120, 1440
  reminded?: boolean;
  googleEventId?: string;
  syncStatus?: 'synced' | 'local_only';
  createdAt: number;
}

export type NotificationType = 
  | 'mention' 
  | 'contract_signed' 
  | 'contract_sent'
  | 'contract_pending' 
  | 'invoice_created'
  | 'invoice_overdue'
  | 'urgent_alert' 
  | 'customer_milestone' 
  | 'system';

export interface AppNotification {
  id: string;
  orgId: string;
  recipientUserId: string; // e.g. "usr-admin-1", "all", or specific user uid
  senderUserId?: string;
  senderName?: string;
  type: NotificationType;
  title: string;
  messageSnippet: string;
  targetUrl?: string; // e.g. "/customers/cust-1", "/documents"
  customerId?: string;
  customerName?: string;
  documentId?: string;
  read: boolean;
  createdAt: number;
}
