import { Customer, ContractDocument, ActivityNote, CalendarEvent, UserProfile, Organization, AppNotification, ContractTemplate, Invoice, ProjectCard, BankTransaction } from "@/types/crm";

export const initialOrganizations: Organization[] = [
  {
    id: "stax",
    name: "Staxify",
    shortName: "Staxify",
    logoUrl: "/stax-logo.png",
    address: "100 Innovation Way, Suite 400, Birmingham, AL 35203",
    phone: "(205) 555-0199",
    email: "operations@staxify.com",
    website: "https://staxify.com",
    taxId: "XX-XXXXXXX",
    defaultWatermark: "CONFIDENTIAL",
    isDemo: false,
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: "demo-org",
    name: "StaxHQ Demo Sandbox",
    shortName: "Demo CRM",
    address: "777 Showcase Blvd, Demo City, CA 94105",
    phone: "(800) 555-DEMO",
    email: "demo@staxhq.com",
    website: "https://demo.staxhq.com",
    taxId: "DEMO-9999",
    defaultWatermark: "DEMO SAMPLE",
    isDemo: true,
    createdAt: Date.now() - 10 * 86400000,
  },
];

export const initialTeamMembers: UserProfile[] = [
  {
    uid: "user-1",
    displayName: "Admin Operator",
    email: "admin@staxhq.com",
    role: "admin",
    orgId: "stax",
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    uid: "user-2",
    displayName: "Sarah Jenkins",
    email: "sarah@staxhq.com",
    role: "admin",
    orgId: "stax",
    createdAt: Date.now() - 45 * 86400000,
  },
  {
    uid: "user-3",
    displayName: "Marcus Vance",
    email: "marcus@staxhq.com",
    role: "employee",
    orgId: "stax",
    createdAt: Date.now() - 30 * 86400000,
  },
];

export const demoCustomers: Customer[] = [
  {
    id: "cust-1",
    orgId: "demo-org",
    name: "Town of Rehobeth",
    primaryProduct: "GovStax",
    type: "customer",
    status: "active",
    industry: "Municipal Government",
    website: "https://rehobethal.gov",
    address: {
      street: "5449 County Road 203",
      city: "Rehobeth",
      state: "AL",
      zip: "36301",
    },
    contacts: [
      {
        id: "c-1",
        name: "Mayor John Abernathy",
        title: "Mayor / City Executive",
        email: "mayor@rehobethal.gov",
        phone: "(334) 555-0142",
        isPrimary: true,
      },
      {
        id: "c-2",
        name: "Eleanor Vance",
        title: "City Clerk & Treasurer",
        email: "evance@rehobethal.gov",
        phone: "(334) 555-0145",
        isPrimary: false,
      },
    ],
    financials: {
      totalContractValue: 7500, // $2,500 build + $5,000 year 1
      setupFee: 2500, // $2,500 one-time build fee
      recurringAmount: 5000, // $5,000 / year ongoing
      billingCycle: "annually",
      paymentStatus: "current",
      startDate: Date.now() - 180 * 86400000,
      nextRenewalDate: Date.now() + 185 * 86400000,
    },
    projects: [
      {
        id: "proj-1",
        name: "GovStax Municipal Work Order & Dispatch",
        description: "Primary municipal work order dispatch, council meeting agendas, and citizen request routing.",
        status: "live",
        productsUsed: ["GovStax Core", "Citizen Request Portal", "Billing Sync"],
        activeUsersCount: 14,
        leadEngineer: "Marcus Vance",
        updatedAt: Date.now() - 2 * 86400000,
      },
    ],
    tags: ["GovStax", "Municipal", "Government", "Annual Contract", "Key Account"],
    notesCount: 4,
    documentsCount: 3,
    createdAt: Date.now() - 180 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: "cust-2",
    orgId: "demo-org",
    name: "Metro Public Utility Authority",
    primaryProduct: "StaxEcho",
    type: "customer",
    status: "active",
    industry: "Utilities & Infrastructure",
    website: "https://metropublicutility.org",
    address: {
      street: "1200 Powerline Rd",
      city: "Birmingham",
      state: "AL",
      zip: "35205",
    },
    contacts: [
      {
        id: "c-3",
        name: "Robert Henderson",
        title: "VP Operations",
        email: "rhenderson@metroutility.org",
        phone: "(205) 555-9011",
        isPrimary: true,
      },
    ],
    financials: {
      totalContractValue: 135000,
      setupFee: 15000,
      recurringAmount: 10000,
      billingCycle: "monthly",
      paymentStatus: "current",
      startDate: Date.now() - 90 * 86400000,
      nextRenewalDate: Date.now() + 275 * 86400000,
    },
    projects: [
      {
        id: "proj-2",
        name: "StaxEcho Smart Grid Dispatch",
        status: "live",
        productsUsed: ["StaxEcho Incident Dispatch", "SMS Alert Engine"],
        activeUsersCount: 38,
        updatedAt: Date.now() - 5 * 86400000,
      },
    ],
    tags: ["StaxEcho", "Commercial", "Utility", "Enterprise"],
    notesCount: 2,
    documentsCount: 2,
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: "cust-3",
    orgId: "demo-org",
    name: "Tri-County Regional Medical Center",
    primaryProduct: "Company Pulse",
    type: "prospect",
    status: "proposal_sent",
    industry: "Healthcare",
    website: "https://tricountymed.health",
    address: {
      street: "800 Health Parkway",
      city: "Montgomery",
      state: "AL",
      zip: "36104",
    },
    contacts: [
      {
        id: "c-4",
        name: "Dr. Amanda Wright",
        title: "Chief Information Officer",
        email: "awright@tricountymed.health",
        phone: "(334) 555-3882",
        isPrimary: true,
      },
    ],
    financials: {
      totalContractValue: 85000,
      setupFee: 10000,
      recurringAmount: 6250,
      billingCycle: "monthly",
      paymentStatus: "pending",
      nextRenewalDate: Date.now() + 30 * 86400000,
    },
    projects: [],
    tags: ["Company Pulse", "Healthcare", "High Priority Lead", "Q3 Target"],
    notesCount: 3,
    documentsCount: 1,
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
];

export const demoContracts: ContractDocument[] = [
  // 1. Company Vault & Compliance Assets
  {
    id: "doc-vault-1",
    orgId: "demo-org",
    scope: "company_vault",
    title: "Form W-9 (Request for Taxpayer ID & Certification)",
    type: "tax_w9",
    status: "official_record",
    fileName: "Staxify_Official_Form_W9_2026.pdf",
    fileSizeBytes: 312500,
    watermarkText: "ORIGINAL RECORD",
    signatureRequired: false,
    contentHtml: "Official signed IRS Form W-9 for Staxify LLC. Includes Employer Identification Number (EIN), corporate address, and officer signature for vendor onboarding.",
    templateType: "w9_summary",
    createdAt: Date.now() - 220 * 86400000,
    updatedAt: Date.now() - 220 * 86400000,
  },
  {
    id: "doc-vault-2",
    orgId: "demo-org",
    scope: "company_vault",
    title: "LLC Certificate of Formation & Articles of Organization",
    type: "llc_legal",
    status: "official_record",
    fileName: "Staxify_LLC_Articles_Of_Organization.pdf",
    fileSizeBytes: 1450000,
    watermarkText: "FILED & ACTIVE",
    signatureRequired: false,
    contentHtml: "State of Alabama Secretary of State stamped Certificate of Formation and standard LLC Operating Agreement.",
    createdAt: Date.now() - 365 * 86400000,
    updatedAt: Date.now() - 365 * 86400000,
  },
  {
    id: "doc-vault-3",
    orgId: "demo-org",
    scope: "company_vault",
    title: "Commercial General Liability Insurance (COI)",
    type: "insurance",
    status: "official_record",
    fileName: "Staxify_COI_Liability_Policy_2026.pdf",
    fileSizeBytes: 420000,
    watermarkText: "CURRENT POLICY",
    signatureRequired: false,
    contentHtml: "ACORD 25 Certificate of Liability Insurance with $2,000,000 aggregate coverage for municipal and enterprise IT deployments.",
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 60 * 86400000,
  },

  // 2. Standard Blank Templates
  {
    id: "doc-tmpl-1",
    orgId: "demo-org",
    scope: "template",
    title: "Standard Master Services Agreement (Blank Template)",
    type: "agreement",
    status: "draft",
    fileName: "Staxify_Standard_MSA_Template.pdf",
    fileSizeBytes: 215000,
    watermarkText: "STANDARD TEMPLATE",
    signatureRequired: true,
    templateType: "msa",
    contentHtml: "Standard boilerplate Master Services Agreement governing software licenses, SLAs, payment terms, and confidentiality.",
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 90 * 86400000,
  },
  {
    id: "doc-tmpl-2",
    orgId: "demo-org",
    scope: "template",
    title: "Standard Mutual Non-Disclosure Agreement (NDA)",
    type: "nda",
    status: "draft",
    fileName: "Staxify_Mutual_NDA_Template.pdf",
    fileSizeBytes: 165000,
    watermarkText: "DRAFT TEMPLATE",
    signatureRequired: true,
    templateType: "nda",
    contentHtml: "Standard mutual confidentiality and trade secret protection agreement for enterprise prospect evaluations.",
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 90 * 86400000,
  },

  // 3. Client-Specific Executed Agreements
  {
    id: "doc-1",
    orgId: "demo-org",
    scope: "client_contract",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    title: "Master Services Agreement (MSA) - 2026",
    type: "agreement",
    status: "signed",
    fileName: "Rehobeth_MSA_Signed_2026.pdf",
    fileSizeBytes: 245190,
    watermarkText: "SIGNED & EXECUTED",
    signatureRequired: true,
    templateType: "msa",
    signatureData: {
      signerName: "John Abernathy",
      signerEmail: "mayor@rehobethal.gov",
      signedAt: Date.now() - 175 * 86400000,
      ipAddress: "68.102.44.12",
      auditLogId: "AUD-REH-98421",
    },
    createdAt: Date.now() - 180 * 86400000,
    updatedAt: Date.now() - 175 * 86400000,
  },
  {
    id: "doc-2",
    orgId: "demo-org",
    scope: "client_contract",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    title: "Service Level Agreement (SLA) & Support Schedule",
    type: "sla",
    status: "signed",
    fileName: "Rehobeth_SLA_Schedule_A.pdf",
    fileSizeBytes: 184200,
    watermarkText: "SIGNED & EXECUTED",
    signatureRequired: true,
    signatureData: {
      signerName: "John Abernathy",
      signerEmail: "mayor@rehobethal.gov",
      signedAt: Date.now() - 174 * 86400000,
      ipAddress: "68.102.44.12",
      auditLogId: "AUD-REH-98422",
    },
    createdAt: Date.now() - 180 * 86400000,
    updatedAt: Date.now() - 174 * 86400000,
  },
  {
    id: "doc-3",
    orgId: "demo-org",
    scope: "client_contract",
    customerId: "cust-3",
    customerName: "Tri-County Regional Medical Center",
    title: "Enterprise Deployment Proposal & Statement of Work",
    type: "proposal",
    status: "sent_for_signature",
    fileName: "TriCounty_SOW_Proposal_Draft.pdf",
    fileSizeBytes: 412000,
    watermarkText: "CONFIDENTIAL",
    signatureRequired: true,
    templateType: "sow",
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
];

export const demoNotes: ActivityNote[] = [
  {
    id: "note-1",
    orgId: "demo-org",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    authorId: "user-1",
    authorName: "Admin Operator",
    content: "Met with @Sarah Jenkins and Mayor Abernathy. Council unanimously approved our Q3 software updates and annual maintenance retainer. All systems operating at 100% capacity.",
    taggedUserIds: ["user-2"],
    category: "meeting",
    attachments: [],
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: "note-2",
    orgId: "demo-org",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    authorId: "user-2",
    authorName: "Sarah Jenkins",
    content: "Uploaded the counter-signed Master Services Agreement. Verified financial billing is set to $4,000 monthly auto-invoice via direct ACH.",
    taggedUserIds: [],
    category: "contract",
    attachments: [{ name: "Rehobeth_MSA_Signed_2026.pdf", url: "#", sizeBytes: 245190 }],
    createdAt: Date.now() - 175 * 86400000,
  },
  {
    id: "note-3",
    orgId: "demo-org",
    customerId: "cust-3",
    customerName: "Tri-County Regional Medical Center",
    authorId: "user-1",
    authorName: "Admin Operator",
    content: "Sent formal proposal to Dr. Amanda Wright. Scheduled demo review call with their IT director @Marcus Vance for next Thursday.",
    taggedUserIds: ["user-3"],
    category: "call_log",
    attachments: [],
    createdAt: Date.now() - 4 * 86400000,
  },
];

export const demoCalendarEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    orgId: "demo-org",
    title: "Town of Rehobeth - Council Review & Demo",
    description: "Quarterly review with Mayor Abernathy and council members on work order system stats.",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    start: Date.now() + 24 * 3600000, // tomorrow
    end: Date.now() + 25 * 3600000,
    attendeeUserIds: ["user-1", "user-2"],
    type: "meeting",
    syncStatus: "synced",
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: "evt-2",
    orgId: "demo-org",
    title: "Tri-County Health - Technical Scope Review",
    description: "Deep dive with CIO Dr. Amanda Wright and network infrastructure leads.",
    customerId: "cust-3",
    customerName: "Tri-County Regional Medical Center",
    start: Date.now() + 72 * 3600000, // in 3 days
    end: Date.now() + 73.5 * 3600000,
    attendeeUserIds: ["user-1", "user-3"],
    type: "demo",
    syncStatus: "synced",
    createdAt: Date.now() - 1 * 86400000,
  },
  {
    id: "evt-3",
    orgId: "demo-org",
    title: "Metro Utility - Monthly Performance Sync",
    description: "Review smart metering uptime and dispatch ticket volume.",
    customerId: "cust-2",
    customerName: "Metro Public Utility Authority",
    start: Date.now() + 120 * 3600000, // in 5 days
    end: Date.now() + 121 * 3600000,
    attendeeUserIds: ["user-1"],
    type: "meeting",
    syncStatus: "synced",
    createdAt: Date.now() - 3 * 86400000,
  },
];

export const demoNotifications: AppNotification[] = [
  {
    id: "notif-1",
    orgId: "demo-org",
    recipientUserId: "all",
    senderUserId: "user-2",
    senderName: "Sarah Jenkins",
    type: "mention",
    title: "Mentioned you in Town of Rehobeth",
    messageSnippet: "Uploaded the counter-signed Master Services Agreement. Verified financial billing is set to $4,000 monthly auto-invoice.",
    targetUrl: "/customers/cust-1",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    documentId: "doc-1",
    read: false,
    createdAt: Date.now() - 25 * 60000, // 25 mins ago
  },
  {
    id: "notif-2",
    orgId: "demo-org",
    recipientUserId: "all",
    senderUserId: "system",
    senderName: "Signature Engine",
    type: "contract_signed",
    title: "Contract Executed & Digitally Signed",
    messageSnippet: "Mayor John Abernathy completed verified digital signature on Master Services Agreement (MSA) - 2026.",
    targetUrl: "/documents",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    documentId: "doc-1",
    read: false,
    createdAt: Date.now() - 2 * 3600000, // 2 hours ago
  },
  {
    id: "notif-3",
    orgId: "demo-org",
    recipientUserId: "all",
    senderUserId: "user-1",
    senderName: "Admin Operator",
    type: "urgent_alert",
    title: "Urgent SLA Update: Metro Utility",
    messageSnippet: "Smart grid dispatch uptime exceeded SLA benchmark. Maintenance review scheduled with VP Operations.",
    targetUrl: "/customers/cust-2",
    customerId: "cust-2",
    customerName: "Metro Public Utility Authority",
    read: true,
    createdAt: Date.now() - 24 * 3600000, // 1 day ago
  },
  {
    id: "notif-4",
    orgId: "demo-org",
    recipientUserId: "all",
    senderUserId: "system",
    senderName: "Document Vault",
    type: "system",
    title: "Company W-9 & Insurance COI Verified",
    messageSnippet: "2026 Commercial Liability Policy (COI) and signed Form W-9 are archived in the Company Vault.",
    targetUrl: "/documents",
    read: true,
    createdAt: Date.now() - 48 * 3600000, // 2 days ago
  },
];

export const initialTemplates: ContractTemplate[] = [
  {
    id: "tpl-govstax-msa",
    orgId: "stax",
    title: "GovStax Master Services Agreement (MSA)",
    description: "Standard municipal software subscription, build fee, SLA, and maintenance terms.",
    productTag: "GovStax",
    category: "agreement",
    defaultWatermark: "STAXIFY",
    signaturePlacement: "dual",
    scopeAndTermsText: `This Master Services Agreement ("Agreement") confirms the operational deployment, software subscription, and maintenance terms between Staxify and {{customer_name}} (located at {{address}}).

1. PLATFORM SCOPE & DELIVERABLES: Staxify shall deploy and license {{product_name}} for municipal operations, including administrative workflows, public records access, automated notifications, and quarterly feature updates.

2. COMMERCIAL INVESTMENT: Client agrees to the one-time implementation and setup fee of {{setup_fee}}, plus an ongoing {{billing_cycle}} software service retainer of {{recurring_amount}}, representing a total investment of {{total_investment}}.

3. SERVICE LEVEL & SLA: Standard business hours support with emergency 99.9% uptime SLA and automated nightly encrypted backups.

4. CONFIDENTIALITY & GOVERNANCE: All municipal records and operational intelligence remain the sole property of {{customer_name}}.`,
    isDefault: true,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 30 * 86400000,
  },
  {
    id: "tpl-companypulse-msa",
    orgId: "stax",
    title: "Company Pulse Master Services Agreement (MSA)",
    description: "Enterprise operational pulse platform, executive dashboards, and team seats.",
    productTag: "Company Pulse",
    category: "agreement",
    defaultWatermark: "STAXIFY",
    signaturePlacement: "dual",
    scopeAndTermsText: `This Master Services Agreement confirms the enterprise deployment of {{product_name}} for {{customer_name}}.

1. PLATFORM DELIVERABLES: Dedicated company workspace, real-time KPI dashboards, executive pulse alerts, team chat integration, and automated reporting.

2. FINANCIAL TERMS: Implementation build fee: {{setup_fee}}. Ongoing recurring subscription: {{recurring_amount}} billed {{billing_cycle}}.

3. DATA SECURITY & OWNERSHIP: Enterprise-grade encryption at rest and in transit. All company metrics remain strictly confidential.`,
    isDefault: true,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 25 * 86400000,
  },
  {
    id: "tpl-nda",
    orgId: "stax",
    title: "Mutual Non-Disclosure Agreement (NDA)",
    description: "Confidentiality and trade secret protection for prospect discussions.",
    productTag: "All",
    category: "nda",
    defaultWatermark: "CONFIDENTIAL",
    signaturePlacement: "dual",
    scopeAndTermsText: `This Mutual Non-Disclosure Agreement is entered into between Staxify and {{customer_name}} regarding proprietary business technology, architecture specifications, and commercial discussions for {{product_name}}.

Each party agrees to hold all disclosed trade secrets, product roadmaps, and proprietary source materials in strict confidence for a period of three (3) years from {{date}}.`,
    isDefault: true,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 20 * 86400000,
  },
  {
    id: "tpl-sow",
    orgId: "stax",
    title: "Statement of Work (SOW) & Technical Scope",
    description: "Specific milestones, deployment phases, and acceptance criteria.",
    productTag: "All",
    category: "sow",
    defaultWatermark: "DRAFT",
    signaturePlacement: "single_client",
    scopeAndTermsText: `This Statement of Work specifies technical milestones, cloud configuration, and acceptance criteria for {{customer_name}}.

Milestone 1: Environment provisioning, tenant isolation, and initial data ingestion (Build Fee: {{setup_fee}}).
Milestone 2: User training, workflow validation, and production deployment for {{product_name}}.
Milestone 3: Ongoing operational SLA support (Retainer: {{recurring_amount}} / {{billing_cycle}}).`,
    isDefault: true,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 15 * 86400000,
  },
  {
    id: "tpl-memo",
    orgId: "stax",
    title: "Official Executive Memorandum",
    description: "Executive announcements, policy notices, and project addendums.",
    productTag: "All",
    category: "memo",
    defaultWatermark: "INTERNAL USE ONLY",
    signaturePlacement: "none",
    scopeAndTermsText: `MEMORANDUM: Official operational update regarding {{customer_name}} and {{product_name}} deployment schedules. Issued on {{date}} by Staxify Executive Operations.`,
    isDefault: true,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },
];

export const demoInvoices: Invoice[] = [
  {
    id: "inv-1",
    orgId: "stax",
    invoiceNumber: "INV-2026-001",
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    issueDate: Date.now() - 5 * 86400000,
    dueDate: Date.now() + 25 * 86400000,
    status: "draft",
    billingCycle: "annually",
    lineItems: [
      {
        id: "li-1",
        description: "GovStax Municipal Platform Setup & Custom Ingestion",
        quantity: 1,
        unitPrice: 2575.69,
        amount: 2575.69,
      },
      {
        id: "li-2",
        description: "GovStax Annual Enterprise Software License & SLA Retainer",
        quantity: 1,
        unitPrice: 4911.87,
        amount: 4911.87,
      },
    ],
    subtotal: 7487.56,
    tax: 0,
    total: 7487.56,
    notes: "Official municipal software agreement. Standard 30-day payment terms.",
    remitTo: "Staxify LLC",
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: "inv-2",
    orgId: "stax",
    invoiceNumber: "INV-2026-002",
    customerId: "cust-2",
    customerName: "Metro Public Utility Authority",
    issueDate: Date.now() - 25 * 86400000,
    dueDate: Date.now() + 5 * 86400000,
    status: "sent",
    billingCycle: "monthly",
    lineItems: [
      {
        id: "li-3",
        description: "GovStax Utility Core Subscription (Monthly Active Seats)",
        quantity: 1,
        unitPrice: 1250.0,
        amount: 1250.0,
      },
    ],
    subtotal: 1250.0,
    tax: 0,
    total: 1250.0,
    notes: "Monthly smart grid dispatch retainer.",
    remitTo: "Staxify LLC",
    sentAt: Date.now() - 20 * 86400000,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 20 * 86400000,
  },
  {
    id: "inv-3",
    orgId: "stax",
    invoiceNumber: "INV-2026-003",
    customerId: "cust-3",
    customerName: "City of Dothan - Public Works",
    issueDate: Date.now() - 45 * 86400000,
    dueDate: Date.now() - 15 * 86400000,
    status: "paid",
    billingCycle: "quarterly",
    lineItems: [
      {
        id: "li-4",
        description: "GovStax Municipal Fleet Tracking License (Q1)",
        quantity: 1,
        unitPrice: 3450.0,
        amount: 3450.0,
      },
    ],
    subtotal: 3450.0,
    tax: 0,
    total: 3450.0,
    notes: "Paid in full via ACH Direct Deposit.",
    remitTo: "Staxify LLC",
    sentAt: Date.now() - 40 * 86400000,
    paidAt: Date.now() - 18 * 86400000,
    createdAt: Date.now() - 45 * 86400000,
    updatedAt: Date.now() - 18 * 86400000,
  },
];

export const initialProjects: ProjectCard[] = [
  {
    id: "proj-1",
    orgId: "stax",
    title: "GovStax",
    description: "Municipal intelligence engine, council agenda crawler, work order dispatch, and citizen request hub.",
    stage: "in_progress",
    priority: "high",
    assignees: [
      { name: "JOSH" },
      { name: "Sarah", email: "sjanejack@gmail.com" },
      { name: "Josh Norris", email: "jnorris@staxifytech.com" }
    ],
    customerId: "cust-1",
    customerName: "Town of Rehobeth",
    tags: ["GovStax", "Municipal", "AI Crawler", "Core Platform"],
    tasks: [
      { id: "t-1", text: "Municipal work order dispatch integration", completed: true },
      { id: "t-2", text: "Council agenda AI parser and auto-indexer", completed: true },
      { id: "t-3", text: "Citizen portal live rollout & SSO verification", completed: false }
    ],
    notes: [
      { id: "n-1", authorName: "Josh", content: "Completed the crawler and indexing pipeline. Next up is citizen request routing.", createdAt: Date.now() - 3 * 86400000 }
    ],
    progressPercentage: 67,
    targetLaunchDate: Date.now() + 14 * 86400000,
    createdAt: Date.now() - 40 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
  {
    id: "proj-2",
    orgId: "stax",
    title: "SPANLINK",
    description: "Real-time edge hardware bridge and IoT telemetry streaming pipeline.",
    stage: "in_progress",
    priority: "high",
    assignees: [
      { name: "JOSH" }
    ],
    tags: ["SPANLINK", "Infrastructure", "Telemetry", "Hardware Bridge"],
    tasks: [
      { id: "t-4", text: "Bridge protocol handshake validation", completed: true },
      { id: "t-5", text: "Real-time telemetry stream ingest & socket sync", completed: false }
    ],
    notes: [
      { id: "n-2", authorName: "Josh", content: "Latency tests looking solid under 45ms. Moving to staging gateway.", createdAt: Date.now() - 2 * 86400000 }
    ],
    progressPercentage: 50,
    targetLaunchDate: Date.now() + 21 * 86400000,
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: "proj-3",
    orgId: "stax",
    title: "RESTORE PRO",
    description: "Disaster recovery, field incident inspection logs, and insurance claims processing platform.",
    stage: "in_progress",
    priority: "high",
    assignees: [
      { name: "Josh Norris", email: "jnorris@staxifytech.com" }
    ],
    tags: ["RESTORE PRO", "Disaster Recovery", "Insurance Claims", "Mobile Hub"],
    tasks: [
      { id: "t-6", text: "Field incident report photo uploader", completed: true },
      { id: "t-7", text: "Automated claim PDF generation & dispatch", completed: true },
      { id: "t-8", text: "Insurer webhook listener & claim payout tracker", completed: false }
    ],
    notes: [
      { id: "n-3", authorName: "Josh Norris", content: "Claims PDF export tested and verified. Ready for beta pilot.", createdAt: Date.now() - 4 * 86400000 }
    ],
    progressPercentage: 66,
    targetLaunchDate: Date.now() + 30 * 86400000,
    createdAt: Date.now() - 25 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    id: "proj-4",
    orgId: "stax",
    title: "COMMUNITY CONNECT",
    description: "Public engagement portal, SMS emergency broadcasts, and municipal community calendars.",
    stage: "in_progress",
    priority: "medium",
    assignees: [
      { name: "Josh Norris", email: "jnorris@staxifytech.com" }
    ],
    tags: ["COMMUNITY CONNECT", "Portal", "Public Safety", "Engagement"],
    tasks: [
      { id: "t-9", text: "Community notification SMS broadcast engine", completed: true },
      { id: "t-10", text: "Event calendar sync for local government", completed: false }
    ],
    notes: [
      { id: "n-4", authorName: "Josh Norris", content: "SMS carrier validation ongoing with Twilio/Telnyx.", createdAt: Date.now() - 5 * 86400000 }
    ],
    progressPercentage: 50,
    targetLaunchDate: Date.now() + 45 * 86400000,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
  {
    id: "proj-5",
    orgId: "stax",
    title: "SENIOR CARE \"TELS\" PROJECT",
    description: "Assisted living facility shift automation, compliance auditing, and emergency dispatch.",
    stage: "not_started",
    priority: "low",
    assignees: [
      { name: "JOSH" }
    ],
    tags: ["SENIOR CARE", "TELS", "Healthcare", "Compliance"],
    tasks: [
      { id: "t-11", text: "HIPAA compliant data flow review", completed: false },
      { id: "t-12", text: "Facility shift schedule & emergency alert dispatch", completed: false }
    ],
    notes: [
      { id: "n-5", authorName: "Josh", content: "Initial scoping session scheduled for next week.", createdAt: Date.now() - 6 * 86400000 }
    ],
    progressPercentage: 0,
    targetLaunchDate: Date.now() + 60 * 86400000,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 6 * 86400000,
  },
  {
    id: "proj-6",
    orgId: "stax",
    title: "STAX ECHO - VOICE AI DISPATCH",
    description: "Inbound voice AI phone agent for municipal 311 requests and utility dispatching.",
    stage: "theory",
    priority: "medium",
    assignees: [
      { name: "Josh Norris", email: "jnorris@staxifytech.com" }
    ],
    tags: ["Theory", "Voice AI", "LLM", "Inbound Call Center"],
    tasks: [
      { id: "t-13", text: "Evaluate WebRTC latency with streaming voice models", completed: false },
      { id: "t-14", text: "Prototype SIP trunk telephony bridge", completed: false }
    ],
    notes: [
      { id: "n-6", authorName: "Josh", content: "Explored prompt-to-speech pipelines. High interest from municipal clients.", createdAt: Date.now() - 7 * 86400000 }
    ],
    progressPercentage: 0,
    targetLaunchDate: Date.now() + 90 * 86400000,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
  },
  {
    id: "proj-7",
    orgId: "stax",
    title: "BIRMINGHAM CIVIC AUDIT INTEGRATION",
    description: "County clerk and municipal budget ingestion data connector.",
    stage: "needs_attention",
    priority: "urgent",
    assignees: [
      { name: "JOSH" },
      { name: "Sarah", email: "sjanejack@gmail.com" }
    ],
    tags: ["Civic Audit", "GovStax", "Urgent Bug", "Data Pipeline"],
    tasks: [
      { id: "t-15", text: "Fix schema mismatch on council budget export", completed: false },
      { id: "t-16", text: "Re-sync county clerk data connector webhook", completed: false }
    ],
    notes: [
      { id: "n-7", authorName: "Sarah", content: "URGENT: Budget PDF parsing failed on multi-column table format from 2025 records. Need patch.", createdAt: Date.now() - 1 * 86400000 }
    ],
    progressPercentage: 20,
    targetLaunchDate: Date.now() + 5 * 86400000,
    createdAt: Date.now() - 12 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  },
  {
    id: "proj-8",
    orgId: "stax",
    title: "ENTERPRISE CONTRACT SIGNATURE ENGINE",
    description: "In-browser verified canvas signature, audit logging, and automated watermark stamping.",
    stage: "completed",
    priority: "high",
    assignees: [
      { name: "Admin Operator" },
      { name: "JOSH" }
    ],
    tags: ["Core Hub", "Digital Signature", "E-Sign", "Audit Log"],
    tasks: [
      { id: "t-17", text: "Canvas drawing and signature capture", completed: true },
      { id: "t-18", text: "Dual signature certificate & PDF watermark stamping", completed: true },
      { id: "t-19", text: "Direct public signing portal routing", completed: true }
    ],
    notes: [
      { id: "n-8", authorName: "Admin", content: "Shipped to production. Works across desktop and tablet with instant audit certificates.", createdAt: Date.now() - 10 * 86400000 }
    ],
    progressPercentage: 100,
    targetLaunchDate: Date.now() - 5 * 86400000,
    createdAt: Date.now() - 50 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
];

export const demoProjects: ProjectCard[] = [
  ...initialProjects.map((p) => ({ ...p, orgId: "demo-org" }))
];

export const initialBankTransactions: BankTransaction[] = [
  {
    id: "tx-1",
    orgId: "stax",
    date: Date.now() - 4 * 86400000,
    description: "TRANSFER TO JOSH *DISTRIBUTION",
    payeeClean: "Josh Norris",
    amount: 2500.0,
    type: "debit",
    category: "owner_draw",
    partnerName: "JOSH",
    memo: "Monthly Partner Equity Distribution",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-2",
    orgId: "stax",
    date: Date.now() - 4 * 86400000,
    description: "TRANSFER TO ADMIN *DISTRIBUTION",
    payeeClean: "Admin Operator",
    amount: 2500.0,
    type: "debit",
    category: "owner_draw",
    partnerName: "Admin Operator",
    memo: "Monthly Partner Equity Distribution",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-3",
    orgId: "stax",
    date: Date.now() - 6 * 86400000,
    description: "OPENAI *API PAYMENTS CA",
    payeeClean: "OpenAI",
    amount: 142.50,
    type: "debit",
    category: "ai_apis",
    isRecurring: true,
    memo: "GovStax municipal LLM indexing & parser usage",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-4",
    orgId: "stax",
    date: Date.now() - 8 * 86400000,
    description: "VERCEL INC *PRO TEAM HOSTING",
    payeeClean: "Vercel Inc.",
    amount: 40.00,
    type: "debit",
    category: "cloud_infra",
    isRecurring: true,
    memo: "Next.js production web deployment",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-5",
    orgId: "stax",
    date: Date.now() - 10 * 86400000,
    description: "GOOGLE *WORKSPACE STAXIFY",
    payeeClean: "Google Workspace",
    amount: 36.00,
    type: "debit",
    category: "dev_tools",
    isRecurring: true,
    memo: "Team email and storage (3 seats)",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-6",
    orgId: "stax",
    date: Date.now() - 12 * 86400000,
    description: "GITHUB *ORGANIZATION TEAM",
    payeeClean: "GitHub",
    amount: 21.00,
    type: "debit",
    category: "dev_tools",
    isRecurring: true,
    memo: "Code repositories & CI/CD runner minutes",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-7",
    orgId: "stax",
    date: Date.now() - 15 * 86400000,
    description: "CURSOR *PRO AI EDITOR",
    payeeClean: "Cursor AI",
    amount: 40.00,
    type: "debit",
    category: "dev_tools",
    isRecurring: true,
    memo: "Developer AI environment license",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-8",
    orgId: "stax",
    date: Date.now() - 18 * 86400000,
    description: "ACH DEPOSIT *CITY OF DOTHAN Q1",
    payeeClean: "City of Dothan - Public Works",
    amount: 3450.00,
    type: "credit",
    category: "revenue_inflow",
    memo: "Quarterly municipal GovStax fleet license payment",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-9",
    orgId: "stax",
    date: Date.now() - 22 * 86400000,
    description: "AWS CLOUD *INFRASTRUCTURE USAGE",
    payeeClean: "Amazon Web Services",
    amount: 88.40,
    type: "debit",
    category: "cloud_infra",
    isRecurring: true,
    memo: "Vector store database and serverless lambdas",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-10",
    orgId: "stax",
    date: Date.now() - 25 * 86400000,
    description: "TWILIO *SMS API & DISPATCH",
    payeeClean: "Twilio",
    amount: 65.20,
    type: "debit",
    category: "cloud_infra",
    isRecurring: true,
    memo: "Municipal emergency alert messaging",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-11",
    orgId: "stax",
    date: Date.now() - 28 * 86400000,
    description: "ALABAMA SEC OF STATE *ANNUAL FILING",
    payeeClean: "Alabama Secretary of State",
    amount: 100.00,
    type: "debit",
    category: "legal_admin",
    isRecurring: false,
    memo: "Annual business entity reporting fee",
    importedAt: Date.now() - 2 * 86400000,
    sourceFile: "august-bank-statement.csv"
  },
  {
    id: "tx-12",
    orgId: "stax",
    date: Date.now() - 35 * 86400000,
    description: "TRANSFER TO JOSH *DISTRIBUTION Q2",
    payeeClean: "Josh Norris",
    amount: 1500.0,
    type: "debit",
    category: "owner_draw",
    partnerName: "JOSH",
    memo: "Q2 Mid-Year Profit Distribution",
    importedAt: Date.now() - 30 * 86400000,
    sourceFile: "july-bank-statement.csv"
  },
  {
    id: "tx-13",
    orgId: "stax",
    date: Date.now() - 35 * 86400000,
    description: "TRANSFER TO ADMIN *DISTRIBUTION Q2",
    payeeClean: "Admin Operator",
    amount: 1500.0,
    type: "debit",
    category: "owner_draw",
    partnerName: "Admin Operator",
    memo: "Q2 Mid-Year Profit Distribution",
    importedAt: Date.now() - 30 * 86400000,
    sourceFile: "july-bank-statement.csv"
  },
];

export const demoBankTransactions: BankTransaction[] = [
  ...initialBankTransactions.map((tx) => ({ ...tx, orgId: "demo-org" }))
];




