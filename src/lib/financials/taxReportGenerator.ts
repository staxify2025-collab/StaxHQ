import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BankTransaction, Organization } from "@/types/crm";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TaxReportData {
  org?: Organization;
  year: number;
  totalInflows: number;
  totalOpEx: number;
  totalOwnerDraws: number;
  netRetained: number;
  categoryBreakdown: { [category: string]: number };
  partnerDraws: { [partner: string]: number };
  transactions: BankTransaction[];
}

export function exportTaxReportPdf(data: TaxReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const orgName = data.org?.name || "Staxify LLC";

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(orgName, 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Operating P&L & Partner Equity Distribution Statement (${data.year})`, 14, 24);

  const genDate = `Generated: ${formatDate(Date.now())}`;
  doc.text(genDate, pageWidth - 14 - doc.getTextWidth(genDate), 24);

  let currentY = 45;

  // Executive Summary Section
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. Executive Financial & Tax Summary", 14, currentY);
  currentY += 4;

  const summaryBody = [
    ["Gross Realized Revenue (Inflows & Client Deposits)", formatCurrency(data.totalInflows)],
    ["Total Operating Expenses (OpEx)", `(${formatCurrency(data.totalOpEx)})`],
    ["Net Operating Income (Gross Profit Before Draws)", formatCurrency(data.totalInflows - data.totalOpEx)],
    ["Total Partner Equity Draws & Distributions", `(${formatCurrency(data.totalOwnerDraws)})`],
    ["Net Retained Free Cash", formatCurrency(data.netRetained)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Financial Metric", "Amount (USD)"]],
    body: summaryBody,
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      1: { halign: "right", fontStyle: "bold" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Partner Distribution Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. Partner Equity & Owner Draw Schedule", 14, currentY);
  currentY += 4;

  const partnerEntries = Object.entries(data.partnerDraws);
  const partnerBody = partnerEntries.map(([partner, amount]) => {
    const pct = data.totalOwnerDraws > 0 ? Math.round((amount / data.totalOwnerDraws) * 100) : 0;
    return [partner, `${pct}%`, formatCurrency(amount)];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Partner Name", "Share of Total Draws", "YTD Distribution Amount"]],
    body: partnerBody.length > 0 ? partnerBody : [["No partner draws recorded", "0%", "$0.00"]],
    theme: "striped",
    headStyles: {
      fillColor: [109, 40, 217], // purple-700
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      2: { halign: "right", fontStyle: "bold" },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Operating Expenses Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. Operating Expenses by IRS Tax Category", 14, currentY);
  currentY += 4;

  const catNames: { [key: string]: string } = {
    ai_apis: "AI & LLM APIs (OpenAI, Anthropic, ElevenLabs)",
    cloud_infra: "Cloud Hosting, Telephony & Infrastructure (Vercel, AWS, Twilio)",
    dev_tools: "Software, Developer Tools & Subscriptions (GitHub, Cursor, Google)",
    legal_admin: "Legal, Registration Fees & Bank Service Charges",
    contractors: "Contractor Labor & External Development",
    office_travel: "Office Hardware, Travel & Meals",
    other: "Other General Operating Expenses",
  };

  const opexBody = Object.entries(data.categoryBreakdown)
    .filter(([cat]) => cat !== "owner_draw" && cat !== "revenue_inflow")
    .map(([cat, amount]) => [catNames[cat] || cat, formatCurrency(amount)]);

  autoTable(doc, {
    startY: currentY,
    head: [["Tax Expense Category", "Total Deductible Spend"]],
    body: opexBody.length > 0 ? opexBody : [["No operating expenses recorded", "$0.00"]],
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      1: { halign: "right", fontStyle: "bold" },
    },
  });

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Report prepared from Staxify Operating Ledger. Intended for IRS Form 1065 / 1120S Schedule K-1 and state tax preparation.",
    14,
    doc.internal.pageSize.getHeight() - 10
  );

  doc.save(`staxify-tax-report-${data.year}.pdf`);
}

export function exportTaxReportCsv(data: TaxReportData) {
  const rows = [
    ["STAXIFY TAX & OPERATING LEDGER REPORT"],
    [`Year: ${data.year}`],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ["EXECUTIVE FINANCIAL SUMMARY"],
    ["Metric", "Amount (USD)"],
    ["Gross Realized Revenue (Inflows)", data.totalInflows.toFixed(2)],
    ["Total Operating Expenses (OpEx)", (-data.totalOpEx).toFixed(2)],
    ["Net Operating Income", (data.totalInflows - data.totalOpEx).toFixed(2)],
    ["Total Owner Draws", (-data.totalOwnerDraws).toFixed(2)],
    ["Net Retained Free Cash", data.netRetained.toFixed(2)],
    [],
    ["PARTNER OWNER DRAWS SCHEDULE"],
    ["Partner Name", "Total Draws YTD (USD)"],
    ...Object.entries(data.partnerDraws).map(([p, amt]) => [p, amt.toFixed(2)]),
    [],
    ["EXPENSES BY CATEGORY"],
    ["Category", "Amount (USD)"],
    ...Object.entries(data.categoryBreakdown).map(([c, amt]) => [c, amt.toFixed(2)]),
    [],
    ["ITEMIZED TRANSACTIONS"],
    ["Date", "Payee", "Description", "Type", "Category", "Partner", "Amount (USD)", "Memo"],
    ...data.transactions.map((tx) => [
      new Date(tx.date).toISOString().split("T")[0],
      `"${(tx.payeeClean || "").replace(/"/g, '""')}"`,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      tx.type,
      tx.category,
      tx.partnerName || "",
      tx.amount.toFixed(2),
      `"${(tx.memo || "").replace(/"/g, '""')}"`,
    ]),
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `staxify-tax-ledger-${data.year}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
