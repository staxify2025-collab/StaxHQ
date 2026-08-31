import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { appConfig } from "@/config/appConfig";
import { ContractDocument, Customer, Organization } from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface GeneratePdfOptions {
  document: ContractDocument;
  customer?: Customer;
  org?: Organization;
  watermark?: string;
}

export function generateContractPdf({
  document,
  customer,
  org,
  watermark,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const activeOrg = org || {
    name: appConfig.brand.name,
    address: appConfig.brand.address,
    phone: appConfig.brand.phone,
    email: appConfig.brand.email,
    defaultWatermark: appConfig.brand.defaultWatermark,
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Watermark (if present)
  const activeWatermark = watermark || document.watermarkText || activeOrg.defaultWatermark;
  if (activeWatermark) {
    doc.saveGraphicsState();
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(45);
    doc.setFont("helvetica", "bold");

    // Rotated centered watermark
    doc.text(activeWatermark, pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
    });
    doc.restoreGraphicsState();
  }

  // 2. Company Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(activeOrg.name.toUpperCase(), 20, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(activeOrg.address || "", 20, 28);
  doc.text(`Phone: ${activeOrg.phone || ""}  |  Email: ${activeOrg.email || ""}`, 20, 33);

  // Header Divider Rule
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.5);
  doc.line(20, 38, pageWidth - 20, 38);

  // 3. Document Title & Metadata
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(document.title, 20, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  const docDate = formatDate(document.createdAt);
  doc.text(`Document Reference: ${document.id.toUpperCase()}`, 20, 55);
  doc.text(`Date Issued: ${docDate}`, 20, 60);
  doc.text(`Status: ${document.status.toUpperCase().replace("_", " ")}`, 20, 65);

  // 4. Client Information Box
  if (customer) {
    const setupFee = customer.financials.setupFee || 0;
    const recurring = customer.financials.recurringAmount || 0;
    const cycle = customer.financials.billingCycle;
    const prod = customer.primaryProduct || "GovStax";

    const financialTermsText = setupFee > 0
      ? `Product / Platform: ${prod}\nOne-Time Build Fee: ${formatCurrency(setupFee)}\nOngoing Retainer: ${formatCurrency(recurring)} / ${cycle}\nYear 1 Total Investment: ${formatCurrency(customer.financials.totalContractValue)}\nPayment Status: ${customer.financials.paymentStatus.toUpperCase()}`
      : `Product / Platform: ${prod}\nRecurring Retainer: ${formatCurrency(recurring)} / ${cycle}\nTotal Contract Value: ${formatCurrency(customer.financials.totalContractValue)}\nPayment Status: ${customer.financials.paymentStatus.toUpperCase()}`;

    autoTable(doc, {
      startY: 72,
      margin: { left: 20, right: 20 },
      head: [["PREPARED FOR / CLIENT", "AGREEMENT FINANCIAL & PRODUCT TERMS"]],
      body: [
        [
          `${customer.name}\n${customer.contacts[0]?.name || "Executive Contact"} (${customer.contacts[0]?.title || "Client"})\n${customer.address?.street || ""}\n${customer.address?.city || ""}, ${customer.address?.state || ""} ${customer.address?.zip || ""}\nEmail: ${customer.contacts[0]?.email || "—"}`,
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
  const currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 80;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. SCOPE OF SERVICES & TERMS", 20, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const termsText =
    "This document certifies the binding commercial terms, service delivery standards, and operational agreements between StaxHQ and the designated Client organization. All services, software subscriptions, and maintenance retainers detailed herein shall be provided in accordance with standard enterprise service levels and municipal confidentiality guidelines.";
  
  const splitTerms = doc.splitTextToSize(termsText, pageWidth - 40);
  doc.text(splitTerms, 20, currentY + 6);

  // 6. Signature Block
  const sigY = currentY + 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("2. AUTHORIZED EXECUTION & DIGITAL SIGNATURE", 20, sigY);

  if (document.signatureData?.signedAt) {
    // Verified Signature Stamp
    doc.setDrawColor(16, 185, 129); // Emerald-500
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.roundedRect(20, sigY + 5, pageWidth - 40, 32, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(6, 95, 70); // Emerald-800
    doc.text("✓ VERIFIED DIGITAL SIGNATURE RECORD", 25, sigY + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Signer Name: ${document.signatureData.signerName}`, 25, sigY + 18);
    doc.text(`Signer Email: ${document.signatureData.signerEmail}`, 25, sigY + 23);
    doc.text(
      `Timestamp: ${formatDate(document.signatureData.signedAt)}  |  IP Address: ${document.signatureData.ipAddress || "Verified SSL Session"}`,
      25,
      sigY + 28
    );
    doc.text(`Audit Key: ${document.signatureData.auditLogId}`, 25, sigY + 33);
  } else {
    // Blank Signature Lines
    doc.setDrawColor(203, 213, 225);
    doc.line(20, sigY + 25, 95, sigY + 25);
    doc.line(pageWidth - 95, sigY + 25, pageWidth - 20, sigY + 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Signature (StaxHQ)", 20, sigY + 30);
    doc.text(`Authorized Signature (${customer?.name || "Client"})`, pageWidth - 95, sigY + 30);
  }

  // 7. Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated via StaxHQ Enterprise CRM  •  Page 1 of 1  •  Confidential & Proprietary`,
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  return doc;
}

export function downloadContractPdf(options: GeneratePdfOptions) {
  const doc = generateContractPdf(options);
  const safeTitle = options.document.title.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`${safeTitle}.pdf`);
}

export function printContractPdf(options: GeneratePdfOptions) {
  const doc = generateContractPdf(options);
  doc.autoPrint();
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl as unknown as string, "_blank");
}
