import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { appConfig } from "@/config/appConfig";
import { ContractDocument, Customer, Organization, Invoice } from "@/types/crm";
import { formatCurrency, formatDate, replaceMergeTags } from "@/lib/utils";

export interface GeneratePdfOptions {
  document: ContractDocument;
  customer?: Customer;
  org?: Organization;
  watermark?: string;
  customBody?: string;
}

export interface GenerateInvoicePdfOptions {
  invoice: Invoice;
  customer?: Customer;
  org?: Organization;
  watermark?: string;
}

/**
 * Draws standard company official letterhead & watermarking
 */
function applyLetterheadAndWatermark(
  doc: jsPDF,
  org: Organization | undefined,
  watermarkText?: string
): { pageWidth: number; pageHeight: number; startContentY: number } {
  const activeOrg = org || {
    id: "stax",
    name: appConfig.brand.name,
    address: appConfig.brand.address,
    phone: appConfig.brand.phone,
    email: appConfig.brand.email,
    website: appConfig.brand.website,
    taxId: appConfig.brand.taxId || "XX-XXXXXXX",
    defaultWatermark: appConfig.brand.defaultWatermark,
    createdAt: Date.now(),
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Watermark
  const activeWatermark = (watermarkText || activeOrg.defaultWatermark || "NONE").toUpperCase();
  if (activeWatermark === "STAXIFY") {
    doc.saveGraphicsState();
    const cx = pageWidth / 2;
    const cy = pageHeight / 2;

    const rx = 44;
    const ry = 24;
    doc.setLineWidth(0.6);

    // Layer 1 (Top diamond - Soft Cyan/Sky-Blue)
    const y1 = cy - 30;
    doc.setDrawColor(186, 230, 253); // Soft Sky-200 (RGB 186, 230, 253)
    doc.line(cx, y1 - ry, cx + rx, y1);
    doc.line(cx + rx, y1, cx, y1 + ry);
    doc.line(cx, y1 + ry, cx - rx, y1);
    doc.line(cx - rx, y1, cx, y1 - ry);

    // Layer 2 (Middle diamond - Soft Indigo/Purple)
    const y2 = cy - 10;
    doc.setDrawColor(199, 210, 254); // Soft Indigo-200 (RGB 199, 210, 254)
    doc.line(cx, y2 - ry, cx + rx, y2);
    doc.line(cx + rx, y2, cx, y2 + ry);
    doc.line(cx, y2 + ry, cx - rx, y2);
    doc.line(cx - rx, y2, cx, y2 - ry);

    // Layer 3 (Bottom diamond - Soft Violet/Magenta)
    const y3 = cy + 10;
    doc.setDrawColor(233, 213, 255); // Soft Purple-200 (RGB 233, 213, 255)
    doc.line(cx, y3 - ry, cx + rx, y3);
    doc.line(cx + rx, y3, cx, y3 + ry);
    doc.line(cx, y3 + ry, cx - rx, y3);
    doc.line(cx - rx, y3, cx, y3 - ry);

    // Vertical edge connector struts (Soft Lavender)
    doc.setDrawColor(216, 224, 250);
    doc.line(cx - rx, y1, cx - rx, y3);
    doc.line(cx + rx, y1, cx + rx, y3);
    doc.line(cx, y1 + ry, cx, y3 + ry);
    doc.line(cx, y1 - ry, cx, y3 - ry);

    // Centered Brand Watermark Text in Stylized Soft Slate-Indigo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(38);
    doc.setTextColor(190, 202, 235);
    doc.text("STAXIFY", cx, cy + 3, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(175, 192, 228);
    doc.text("L A Y E R E D   I N T E L L I G E N C E", cx, cy + 11, { align: "center" });

    doc.restoreGraphicsState();
  } else if (activeWatermark && activeWatermark !== "NONE") {
    doc.saveGraphicsState();
    doc.setTextColor(228, 233, 242);
    doc.setFontSize(44);
    doc.setFont("helvetica", "bold");
    doc.text(activeWatermark, pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
    });
    doc.restoreGraphicsState();
  }

  // 2. Company Official Letterhead Header (Staxify with Capitalized S)
  const brandDisplayName =
    activeOrg.name.toLowerCase() === "staxify" || activeOrg.name.toLowerCase() === "stax"
      ? "Staxify"
      : activeOrg.name;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(brandDisplayName, 20, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(99, 102, 241); // Indigo-500
  doc.text("L A Y E R E D   I N T E L L I G E N C E", 20, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(
    activeOrg.address || "100 Innovation Way, Suite 400, Birmingham, AL 35203",
    20,
    30
  );
  doc.text(
    `Phone: ${activeOrg.phone || "(205) 555-0199"}  |  Email: ${
      activeOrg.email || "operations@staxify.com"
    }  |  Web: ${activeOrg.website || "staxify.com"}`,
    20,
    34
  );

  // Header Divider Rule
  doc.setDrawColor(99, 102, 241); // Indigo
  doc.setLineWidth(0.8);
  doc.line(20, 38, pageWidth - 20, 38);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${brandDisplayName} Corporate Hub  •  Document Ref: Official  •  Confidential & Proprietary`,
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  return { pageWidth, pageHeight, startContentY: 48 };
}

/**
 * Letterhead Memo / Executive Notice
 */
export function generateLetterheadMemoPdf({
  document,
  customer,
  org,
  watermark,
  customBody,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { pageWidth, startContentY } = applyLetterheadAndWatermark(
    doc,
    org,
    watermark || document.watermarkText
  );

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(document.title || "EXECUTIVE MEMORANDUM", 20, startContentY);

  // Meta Table
  const recipientName =
    customer?.contacts[0]?.name ||
    customer?.name ||
    document.templateData?.recipient ||
    "All Designated Parties";
  const subject =
    document.templateData?.subject ||
    document.title ||
    "Corporate Operational Notice";

  autoTable(doc, {
    startY: startContentY + 6,
    margin: { left: 20, right: 20 },
    theme: "plain",
    body: [
      ["TO:", recipientName],
      ["FROM:", `${org?.name || "Staxify"} Executive Operations`],
      ["DATE:", formatDate(document.createdAt)],
      ["SUBJECT:", subject],
    ],
    styles: { fontSize: 9.5, cellPadding: 2, textColor: [51, 65, 85] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 25 } },
  });

  const bodyY = (doc as any).lastAutoTable.finalY + 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, bodyY - 4, pageWidth - 20, bodyY - 4);

  // Body content
  const memoText =
    customBody ||
    document.contentHtml ||
    document.templateData?.body ||
    "This official memorandum serves as formal notification regarding corporate procedures, operational standards, or account agreements. All terms and directives outlined herein have been authorized by corporate administration and remain in effect until revised.";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  const splitText = doc.splitTextToSize(memoText, pageWidth - 40);
  doc.text(splitText, 20, bodyY + 4);

  // Closing Sign-off
  const signY = bodyY + 4 + splitText.length * 5 + 15;
  if (signY < 240) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Sincerely,", 20, signY);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${org?.name || "Staxify"} Executive Leadership`,
      20,
      signY + 12
    );
  }

  return doc;
}

/**
 * Standard Mutual NDA Template
 */
export function generateNdaPdf({
  document,
  customer,
  org,
  watermark,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { pageWidth, startContentY } = applyLetterheadAndWatermark(
    doc,
    org,
    watermark || document.watermarkText
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text("MUTUAL NON-DISCLOSURE AGREEMENT (NDA)", 20, startContentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Effective Date: ${formatDate(document.createdAt)}  |  Ref: ${document.id.toUpperCase()}`,
    20,
    startContentY + 6
  );

  const clientName = customer?.name || document.customerName || "[Counterparty Organization]";

  const ndaOverview = `This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between ${
    org?.name || "Staxify LLC"
  } and ${clientName} ("Party" or collectively "Parties") for the purpose of preventing the unauthorized disclosure of Confidential Information as defined below.`;

  const splitIntro = doc.splitTextToSize(ndaOverview, pageWidth - 40);
  doc.text(splitIntro, 20, startContentY + 14);

  autoTable(doc, {
    startY: startContentY + 28,
    margin: { left: 20, right: 20 },
    theme: "striped",
    head: [["SECTION", "TERMS & OBLIGATIONS"]],
    body: [
      [
        "1. Confidential Information",
        "Includes all technical data, trade secrets, software architecture, municipal workflows, financial records, customer databases, and proprietary roadmaps disclosed by either Party.",
      ],
      [
        "2. Non-Disclosure Obligations",
        "Each Party agrees to hold and maintain Confidential Information in strictest confidence for a period of three (3) years from disclosure.",
      ],
      [
        "3. Permitted Disclosures",
        "Information is exempt if it becomes publicly known through no breach, is independently developed, or is required by court order / public records law.",
      ],
      [
        "4. Return of Materials",
        "Upon written request, each Party shall destroy or return all copies of tangible materials containing Confidential Information.",
      ],
    ],
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { fontSize: 8.5, cellPadding: 3.5, textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 45, fontStyle: "bold" } },
  });

  const sigY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("AUTHORIZED EXECUTION", 20, sigY);

  if (document.signatureData?.signedAt) {
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(20, sigY + 4, pageWidth - 40, 26, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(6, 95, 70);
    doc.text("✓ VERIFIED DIGITAL SIGNATURE RECORD", 25, sigY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Signer: ${document.signatureData.signerName} (${document.signatureData.signerEmail})`,
      25,
      sigY + 15
    );
    doc.text(
      `Executed: ${formatDate(document.signatureData.signedAt)}  |  IP: ${
        document.signatureData.ipAddress || "Verified SSL"
      }`,
      25,
      sigY + 20
    );
  } else {
    doc.setDrawColor(203, 213, 225);
    doc.line(20, sigY + 20, 95, sigY + 20);
    doc.line(pageWidth - 95, sigY + 20, pageWidth - 20, sigY + 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Authorized Signer (${org?.name || "Staxify"})`, 20, sigY + 25);
    doc.text(`Authorized Signer (${clientName})`, pageWidth - 95, sigY + 25);
  }

  return doc;
}

/**
 * Company Form W-9 & Tax Info Summary Sheet
 */
export function generateW9SummaryPdf({
  document,
  org,
  watermark,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { startContentY } = applyLetterheadAndWatermark(
    doc,
    org,
    watermark || document.watermarkText || "ORIGINAL RECORD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text("TAXPAYER IDENTIFICATION & VENDOR ONBOARDING SHEET", 20, startContentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Official Vendor Information for Direct ACH, Municipal Vendor Registration & 1099/W-9 Filings",
    20,
    startContentY + 6
  );

  const activeOrg = org || {
    name: "Staxify LLC",
    address: "100 Innovation Way, Suite 400, Birmingham, AL 35203",
    taxId: "84-3921890",
    phone: "(205) 555-0199",
    email: "operations@staxify.com",
    website: "staxify.com",
    createdAt: Date.now(),
    id: "stax",
  };

  autoTable(doc, {
    startY: startContentY + 12,
    margin: { left: 20, right: 20 },
    theme: "grid",
    head: [["TAX IDENTIFICATION FIELD", "OFFICIAL CORPORATE VALUE"]],
    body: [
      ["Legal Entity Name", activeOrg.name],
      ["Business / DBA Name", "Staxify Layered Intelligence / StaxHQ"],
      ["Federal Tax ID / EIN", activeOrg.taxId || "84-3921890"],
      ["Federal Tax Classification", "Limited Liability Company (LLC) - Partnership / Corporation"],
      ["Principal Business Address", activeOrg.address || "100 Innovation Way, Suite 400, Birmingham, AL 35203"],
      ["Remittance Email", activeOrg.email || "finance@staxify.com"],
      ["Accounts Receivable Contact", "Executive Finance & Billing Department"],
      ["Exempt Payee Code", "Exempt from Backup Withholding under FATCA"],
    ],
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { fontSize: 9, cellPadding: 3.5, textColor: [30, 41, 59] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
  });

  const certY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("OFFICER CERTIFICATION", 20, certY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const certText =
    "Under penalties of perjury, I certify that: (1) The number shown on this form is our correct taxpayer identification number, and (2) We are not subject to backup withholding, and (3) We are a U.S. entity authorized to conduct business.";
  const splitCert = doc.splitTextToSize(certText, doc.internal.pageSize.getWidth() - 40);
  doc.text(splitCert, 20, certY + 5);

  const signY = certY + 5 + splitCert.length * 4.5 + 8;
  doc.setDrawColor(203, 213, 225);
  doc.line(20, signY + 15, 95, signY + 15);
  doc.setFontSize(8);
  doc.text("Authorized Corporate Officer Signature", 20, signY + 20);
  doc.text(`Date Certified: ${formatDate(Date.now())}`, 20, signY + 25);

  return doc;
}

/**
 * Master Services Agreement (MSA) / General Contract PDF
 */
export function generateContractPdf({
  document,
  customer,
  org,
  watermark,
  customBody,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const { pageWidth, startContentY } = applyLetterheadAndWatermark(
    doc,
    org,
    watermark || document.watermarkText
  );

  // 3. Document Title & Metadata
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(document.title, 20, startContentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);

  const docDate = formatDate(document.createdAt);
  doc.text(`Document Reference: ${document.id.toUpperCase()}`, 20, startContentY + 6);
  doc.text(`Date Issued: ${docDate}`, 20, startContentY + 11);
  doc.text(
    `Status: ${document.status.toUpperCase().replace(/_/g, " ")}`,
    20,
    startContentY + 16
  );

  // 4. Client Information Box
  if (customer) {
    const setupFee = customer.financials.setupFee || 0;
    const recurring = customer.financials.recurringAmount || 0;
    const cycle = customer.financials.billingCycle;
    const prod = customer.primaryProduct || "GovStax";

    const financialTermsText =
      setupFee > 0
        ? `Product / Platform: ${prod}\nOne-Time Build Fee: ${formatCurrency(
            setupFee
          )}\nOngoing Retainer: ${formatCurrency(
            recurring
          )} / ${cycle}\nYear 1 Total Investment: ${formatCurrency(
            customer.financials.totalContractValue
          )}\nPayment Status: ${customer.financials.paymentStatus.toUpperCase()}`
        : `Product / Platform: ${prod}\nRecurring Retainer: ${formatCurrency(
            recurring
          )} / ${cycle}\nTotal Contract Value: ${formatCurrency(
            customer.financials.totalContractValue
          )}\nPayment Status: ${customer.financials.paymentStatus.toUpperCase()}`;

    autoTable(doc, {
      startY: startContentY + 22,
      margin: { left: 20, right: 20 },
      head: [["PREPARED FOR / CLIENT", "AGREEMENT FINANCIAL & PRODUCT TERMS"]],
      body: [
        [
          `${customer.name}\n${customer.contacts[0]?.name || "Executive Contact"} (${
            customer.contacts[0]?.title || "Client"
          })\n${customer.address?.street || ""}\n${customer.address?.city || ""}, ${
            customer.address?.state || ""
          } ${customer.address?.zip || ""}\nEmail: ${
            customer.contacts[0]?.email || "—"
          }`,
          financialTermsText,
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229], // Indigo-600
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [30, 41, 59],
      },
    });
  }

  // 5. Standard Agreement / Scope Section
  const currentY = (doc as any).lastAutoTable
    ? (doc as any).lastAutoTable.finalY + 8
    : startContentY + 25;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. SCOPE OF SERVICES & TERMS", 20, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const rawTermsText =
    customBody ||
    document.templateData?.scopeAndTermsText ||
    document.contentHtml ||
    "This document certifies the binding commercial terms, service delivery standards, and operational agreements between Staxify and {{customer_name}}. All services, software subscriptions ({{product_name}}), and maintenance retainers detailed herein shall be provided in accordance with standard enterprise service levels and municipal confidentiality guidelines.";

  const termsText = replaceMergeTags(rawTermsText, customer);
  const splitTerms = doc.splitTextToSize(termsText, pageWidth - 40);
  doc.text(splitTerms, 20, currentY + 5);

  // 6. Signature Block
  const sigPlacement = document.signaturePlacement || (document.signatureRequired ? "dual" : "none");

  if (sigPlacement !== "none") {
    const sigY = currentY + 5 + splitTerms.length * 4.2 + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("2. AUTHORIZED EXECUTION & DIGITAL SIGNATURE", 20, sigY);

    if (document.signatureData?.signedAt) {
      // Verified Signature Stamp
      doc.setDrawColor(16, 185, 129); // Emerald-500
      doc.setFillColor(236, 253, 245); // Emerald-50
      doc.roundedRect(20, sigY + 4, pageWidth - 40, 28, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(6, 95, 70); // Emerald-800
      doc.text("✓ VERIFIED DIGITAL SIGNATURE RECORD", 25, sigY + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Signer Name: ${document.signatureData.signerName}`, 25, sigY + 15);
      doc.text(`Signer Email: ${document.signatureData.signerEmail}`, 25, sigY + 19);
      doc.text(
        `Timestamp: ${formatDate(document.signatureData.signedAt)}  |  IP: ${
          document.signatureData.ipAddress || "Verified SSL Session"
        }`,
        25,
        sigY + 23
      );
    } else {
      // Blank Signature Lines
      doc.setDrawColor(203, 213, 225);

      if (sigPlacement === "dual") {
        // Staxify Left
        doc.line(20, sigY + 22, 95, sigY + 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Authorized Signature (${org?.name || "Staxify"})`, 20, sigY + 27);

        // Client Right
        doc.line(pageWidth - 95, sigY + 22, pageWidth - 20, sigY + 22);
        doc.text(
          `Authorized Signature (${customer?.name || document.customerName || "Client"})`,
          pageWidth - 95,
          sigY + 27
        );
      } else {
        // Single Client Right
        doc.line(pageWidth - 95, sigY + 22, pageWidth - 20, sigY + 22);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Authorized Client Signature (${customer?.name || document.customerName || "Client"})`,
          pageWidth - 95,
          sigY + 27
        );
      }
    }
  }

  return doc;
}

/**
 * Universal Dispatcher for PDF Generation
 */
export function generateUniversalDocumentPdf(options: GeneratePdfOptions): jsPDF {
  const tType = options.document.templateType;
  const dType = options.document.type;

  if (tType === "memo" || dType === "memo") {
    return generateLetterheadMemoPdf(options);
  }
  if (tType === "nda" || dType === "nda") {
    return generateNdaPdf(options);
  }
  if (tType === "w9_summary" || dType === "tax_w9") {
    return generateW9SummaryPdf(options);
  }
  return generateContractPdf(options);
}

/**
 * Generates an in-memory Blob URL for previewing in iframes
 */
export function getDocumentPdfBlobUrl(options: GeneratePdfOptions): string {
  const doc = generateUniversalDocumentPdf(options);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

export function downloadContractPdf(options: GeneratePdfOptions) {
  const doc = generateUniversalDocumentPdf(options);
  const safeTitle = (options.document.title || "document").replace(
    /[^a-zA-Z0-9_-]/g,
    "_"
  );
  doc.save(`${safeTitle}.pdf`);
}

export function printContractPdf(options: GeneratePdfOptions) {
  const doc = generateUniversalDocumentPdf(options);
  doc.autoPrint();
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl as unknown as string, "_blank");
}

/**
 * Generates Official Invoice PDF with subtle watermark & Remit to Staxify LLC
 */
export function generateInvoicePdf(options: GenerateInvoicePdfOptions): jsPDF {
  const { invoice, customer, org, watermark } = options;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const { pageWidth, startContentY } = applyLetterheadAndWatermark(
    doc,
    org,
    watermark || "STAXIFY"
  );

  let currentY = startContentY + 5;

  // Header Title & Status Banner
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("OFFICIAL INVOICE", 50, currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const statusColor =
    invoice.status === "paid"
      ? [22, 101, 52] // green
      : invoice.status === "overdue"
      ? [185, 28, 28] // red
      : [79, 70, 229]; // indigo

  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(
    `STATUS: ${invoice.status.toUpperCase().replace("_", " ")}`,
    pageWidth - 50,
    currentY,
    { align: "right" }
  );

  currentY += 18;

  // Metadata Box (Invoice #, Issue Date, Due Date, Terms)
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(50, currentY, pageWidth - 100, 52, 4, 4, "FD");

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE NUMBER", 65, currentY + 18);
  doc.text("ISSUE DATE", 195, currentY + 18);
  doc.text("PAYMENT DUE DATE", 325, currentY + 18);
  doc.text("BILLING CYCLE", 445, currentY + 18);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoiceNumber, 65, currentY + 36);
  doc.text(formatDate(invoice.issueDate), 195, currentY + 36);
  doc.text(formatDate(invoice.dueDate), 325, currentY + 36);
  doc.text((invoice.billingCycle || "annually").toUpperCase(), 445, currentY + 36);

  currentY += 68;

  // Bill-To Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text("BILLED TO / CLIENT ENTITY:", 50, currentY);

  currentY += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.customerName || customer?.name || "Client Entity", 50, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const contact = customer?.contacts[0];
  if (contact) {
    currentY += 12;
    doc.text(`Attn: ${contact.name}${contact.title ? ` (${contact.title})` : ""}`, 50, currentY);
    currentY += 12;
    doc.text(`Email: ${contact.email}  |  Phone: ${contact.phone || "N/A"}`, 50, currentY);
  }

  if (customer?.address?.street) {
    currentY += 12;
    doc.text(
      `${customer.address.street}, ${customer.address.city || ""}, ${customer.address.state || "AL"} ${customer.address.zip || ""}`,
      50,
      currentY
    );
  }

  currentY += 18;

  // Line Items Table
  const tableRows = (invoice.lineItems || []).map((item, idx) => [
    idx + 1,
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.amount),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["#", "Deliverable / Scope Description", "Qty", "Unit Rate", "Total Amount"]],
    body: tableRows,
    margin: { left: 50, right: 50 },
    theme: "grid",
    headStyles: {
      fillColor: [79, 70, 229], // Indigo
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: [30, 41, 59],
      fontSize: 8.5,
    },
    columnStyles: {
      0: { cellWidth: 25, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 35, halign: "center" },
      3: { cellWidth: 80, halign: "right" },
      4: { cellWidth: 85, halign: "right", fontStyle: "bold" },
    },
  });

  // @ts-ignore
  const finalY = doc.lastAutoTable?.finalY || currentY + 120;
  let totalsY = finalY + 15;

  // Totals Breakdown
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Subtotal Amount:", pageWidth - 190, totalsY);
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(invoice.subtotal), pageWidth - 50, totalsY, { align: "right" });

  totalsY += 14;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Estimated Tax (0.00%):", pageWidth - 190, totalsY);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(invoice.tax || 0), pageWidth - 50, totalsY, { align: "right" });

  totalsY += 16;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1.5);
  doc.line(pageWidth - 200, totalsY - 4, pageWidth - 50, totalsY - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("TOTAL BALANCE DUE:", pageWidth - 190, totalsY + 8);
  doc.text(formatCurrency(invoice.total), pageWidth - 50, totalsY + 8, { align: "right" });

  // Payment Remittance Box
  const remitBoxY = totalsY + 30;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(50, remitBoxY, pageWidth - 100, 75, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.text("OFFICIAL PAYMENT REMITTANCE INSTRUCTIONS", 65, remitBoxY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Please remit all payments directly to: ${invoice.remitTo || "Staxify LLC"}`, 65, remitBoxY + 30);
  doc.text("Remittance Address: 121 Stax Way, Suite 400, Birmingham, AL 35203", 65, remitBoxY + 44);
  doc.text("For ACH / Wire Routing or Municipal Purchase Orders, contact billing@staxifytech.com", 65, remitBoxY + 58);

  // Paid in Full Stamp if applicable
  if (invoice.status === "paid") {
    doc.saveGraphicsState();
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(2);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(pageWidth - 210, remitBoxY + 15, 150, 42, 6, 6, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(22, 101, 52);
    doc.text("✓ PAID IN FULL", pageWidth - 135, remitBoxY + 32, { align: "center" });

    doc.setFontSize(8);
    doc.text(
      invoice.paidAt ? formatDate(invoice.paidAt) : "THANK YOU FOR YOUR BUSINESS",
      pageWidth - 135,
      remitBoxY + 46,
      { align: "center" }
    );
    doc.restoreGraphicsState();
  }

  return doc;
}

export function downloadInvoicePdf(options: GenerateInvoicePdfOptions) {
  const doc = generateInvoicePdf(options);
  const safeName = (options.invoice.invoiceNumber || "Invoice").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${safeName}_${options.invoice.customerName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);
}

export function printInvoicePdf(options: GenerateInvoicePdfOptions) {
  const doc = generateInvoicePdf(options);
  doc.autoPrint();
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl as unknown as string, "_blank");
}

