import { BankTransaction, ExpenseCategory, TransactionType } from "@/types/crm";

interface ParsedTransactionRow {
  date: number;
  description: string;
  payeeClean: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  partnerName?: string;
  memo?: string;
  isRecurring?: boolean;
}

/**
 * Smart Auto-Categorization Pattern Matcher
 * Core Rule: Debits are business purchases / OpEx (AI, Cloud, Dev Tools, Office, Admin, or Other Purchases).
 * Only explicit draws/distributions route to 'owner_draw'.
 */
export function categorizeBankDescription(
  desc: string,
  isCredit: boolean
): { category: ExpenseCategory; payeeClean: string; partnerName?: string; isRecurring?: boolean } {
  const d = desc.toLowerCase();

  // 0. Revenue / Credits / Deposits
  if (isCredit) {
    let clean = cleanPayeeName(desc);
    if (d.includes("atm cash deposit") || d.includes("cash deposit")) clean = "ATM Cash Deposit";
    else if (d.includes("stripe")) clean = "Stripe Client Payments";
    else if (d.includes("wire")) clean = "Wire Transfer Inflow";
    else if (d.includes("interest")) clean = "Bank Interest Earned";

    return {
      category: "revenue_inflow",
      payeeClean: clean,
      partnerName: undefined,
      isRecurring: false,
    };
  }

  // 1. AI & APIs (ChatGPT, OpenAI, Mountain View AI charges, Anthropic/Claude, Midjourney, etc.)
  if (
    d.includes("openai") ||
    d.includes("chatgpt") ||
    d.includes("chat gpt") ||
    d.includes("mountain view") || // OpenAI / ChatGPT Plus subscriptions frequently post as Mountain View CA
    d.includes("anthropic") ||
    d.includes("claude") ||
    d.includes("elevenlabs") ||
    d.includes("11labs") ||
    d.includes("replicate") ||
    d.includes("huggingface") ||
    d.includes("hugging face") ||
    d.includes("deepseek") ||
    d.includes("perplexity") ||
    d.includes("midjourney") ||
    d.includes("runpod") ||
    d.includes("groq") ||
    d.includes("together ai") ||
    d.includes("cohere") ||
    d.includes("mistral") ||
    d.includes("stability ai")
  ) {
    let clean = "OpenAI (ChatGPT)";
    if (d.includes("anthropic") || d.includes("claude")) clean = "Anthropic (Claude)";
    else if (d.includes("elevenlabs") || d.includes("11labs")) clean = "ElevenLabs";
    else if (d.includes("replicate")) clean = "Replicate AI";
    else if (d.includes("perplexity")) clean = "Perplexity AI";
    else if (d.includes("deepseek")) clean = "DeepSeek";
    else if (d.includes("midjourney")) clean = "Midjourney";
    else if (d.includes("runpod")) clean = "RunPod GPU";
    else if (d.includes("groq")) clean = "Groq Inc.";
    else if (d.includes("huggingface") || d.includes("hugging face")) clean = "Hugging Face";
    else if (d.includes("cohere")) clean = "Cohere AI";
    else if (d.includes("mistral")) clean = "Mistral AI";
    else if (d.includes("openai") || d.includes("chatgpt") || d.includes("mountain view")) clean = "OpenAI (ChatGPT)";
    else clean = cleanPayeeName(desc);

    return {
      category: "ai_apis",
      payeeClean: clean,
      partnerName: undefined,
      isRecurring: true,
    };
  }

  // 2. Cloud & Infrastructure (Google Cloud, GCP, Vercel, AWS, Supabase, Cloudflare, Twilio, etc.)
  if (
    d.includes("google cloud") ||
    d.includes("google*cloud") ||
    d.includes("gcp") ||
    d.includes("650- google") ||
    d.includes("650-2530000") ||
    d.includes("vercel") ||
    d.includes("aws") ||
    d.includes("amazon web") ||
    d.includes("supabase") ||
    d.includes("cloudflare") ||
    d.includes("firebase") ||
    d.includes("twilio") ||
    d.includes("resend") ||
    d.includes("digitalocean") ||
    d.includes("namecheap") ||
    d.includes("godaddy") ||
    d.includes("render.com") ||
    d.includes("railway") ||
    d.includes("heroku") ||
    d.includes("hetzner") ||
    d.includes("postmark") ||
    d.includes("sendgrid")
  ) {
    let clean = cleanPayeeName(desc);
    if (d.includes("google cloud") || d.includes("google*cloud") || d.includes("gcp") || d.includes("650- google") || d.includes("650-2530000")) clean = "Google Cloud Platform";
    else if (d.includes("vercel")) clean = "Vercel Inc.";
    else if (d.includes("aws") || d.includes("amazon web")) clean = "Amazon Web Services (AWS)";
    else if (d.includes("supabase")) clean = "Supabase";
    else if (d.includes("cloudflare")) clean = "Cloudflare";
    else if (d.includes("firebase")) clean = "Google Firebase";
    else if (d.includes("twilio")) clean = "Twilio";
    else if (d.includes("resend")) clean = "Resend";
    else if (d.includes("digitalocean")) clean = "DigitalOcean";
    else if (d.includes("namecheap")) clean = "Namecheap Domains";
    else if (d.includes("godaddy")) clean = "GoDaddy";

    return {
      category: "cloud_infra",
      payeeClean: clean,
      partnerName: undefined,
      isRecurring: true,
    };
  }

  // 3. Developer Tools & Software SaaS (Cursor, GitHub, Google Workspace, Google Services, Notion, Figma, Slack, etc.)
  if (
    d.includes("cursor") ||
    d.includes("anysphere") ||
    d.includes("github") ||
    d.includes("gitlab") ||
    d.includes("google *workspace") ||
    d.includes("google workspace") ||
    d.includes("www.google.co") ||
    d.includes("google.com") ||
    d.includes("google *") ||
    d.includes("google") ||
    d.includes("gsuite") ||
    d.includes("notion") ||
    d.includes("figma") ||
    d.includes("slack") ||
    d.includes("linear") ||
    d.includes("loom") ||
    d.includes("zoom") ||
    d.includes("docker") ||
    d.includes("atlassian") ||
    d.includes("jira") ||
    d.includes("confluence") ||
    d.includes("jetbrains") ||
    d.includes("sentry") ||
    d.includes("postman") ||
    d.includes("microsoft") ||
    d.includes("office 365") ||
    d.includes("msft") ||
    d.includes("adobe") ||
    d.includes("canva") ||
    d.includes("webflow") ||
    d.includes("zapier") ||
    d.includes("make.com") ||
    d.includes("intercom") ||
    d.includes("hubspot")
  ) {
    let clean = cleanPayeeName(desc);
    if (d.includes("cursor") || d.includes("anysphere")) clean = "Cursor AI";
    else if (d.includes("github")) clean = "GitHub";
    else if (d.includes("google *workspace") || d.includes("google workspace") || d.includes("gsuite")) clean = "Google Workspace";
    else if (d.includes("www.google.co") || d.includes("google.com") || d.includes("google")) clean = "Google Services";
    else if (d.includes("notion")) clean = "Notion Labs";
    else if (d.includes("figma")) clean = "Figma";
    else if (d.includes("slack")) clean = "Slack";
    else if (d.includes("linear")) clean = "Linear";
    else if (d.includes("loom")) clean = "Loom";
    else if (d.includes("docker")) clean = "Docker";
    else if (d.includes("microsoft") || d.includes("msft")) clean = "Microsoft 365";
    else if (d.includes("adobe")) clean = "Adobe";

    return {
      category: "dev_tools",
      payeeClean: clean,
      partnerName: undefined,
      isRecurring: true,
    };
  }

  // 4. Legal, Admin, State Filings & Bank Fees
  if (
    d.includes("secretary of state") ||
    d.includes("sec of state") ||
    d.includes("registered agent") ||
    d.includes("legalzoom") ||
    d.includes("franchise tax") ||
    d.includes("bank fee") ||
    d.includes("service fee") ||
    d.includes("service charge") ||
    d.includes("maintenance fee") ||
    d.includes("monthly fee") ||
    d.includes("wire fee") ||
    d.includes("treasury") ||
    d.includes("dept of revenue") ||
    d.includes("department of revenue") ||
    d.includes("irs") ||
    d.includes("cpa") ||
    d.includes("accounting")
  ) {
    let clean = cleanPayeeName(desc);
    if (d.includes("sec of state") || d.includes("secretary of state")) clean = "Secretary of State";
    else if (d.includes("bank fee") || d.includes("service fee") || d.includes("service charge")) clean = "Bank Service Fee";
    return {
      category: "legal_admin",
      payeeClean: clean,
      partnerName: undefined,
      isRecurring: d.includes("fee") || d.includes("agent"),
    };
  }

  // 5. Contractors & Payroll
  if (
    d.includes("upwork") ||
    d.includes("fiverr") ||
    d.includes("contractor") ||
    d.includes("gusto") ||
    d.includes("deel") ||
    d.includes("freelance") ||
    d.includes("rippling") ||
    d.includes("adp") ||
    d.includes("paychex") ||
    d.includes("remote.com") ||
    d.includes("toptal")
  ) {
    let clean = cleanPayeeName(desc);
    if (d.includes("upwork")) clean = "Upwork";
    else if (d.includes("fiverr")) clean = "Fiverr";
    else if (d.includes("gusto")) clean = "Gusto";
    return {
      category: "contractors",
      payeeClean: clean,
      partnerName: undefined,
      isRecurring: false,
    };
  }

  // 6. Office, Hardware, Travel & Meals
  if (
    d.includes("apple") ||
    d.includes("best buy") ||
    d.includes("staples") ||
    d.includes("office depot") ||
    d.includes("amazon") ||
    d.includes("delta") ||
    d.includes("american air") ||
    d.includes("united air") ||
    d.includes("southwest") ||
    d.includes("uber") ||
    d.includes("lyft") ||
    d.includes("hotel") ||
    d.includes("airbnb") ||
    d.includes("marriott") ||
    d.includes("hilton") ||
    d.includes("starbucks") ||
    d.includes("restaurant") ||
    d.includes("doordash") ||
    d.includes("grubhub") ||
    d.includes("chevron") ||
    d.includes("shell") ||
    d.includes("exxon") ||
    d.includes("waffle house") ||
    d.includes("usps") ||
    d.includes("fedex") ||
    d.includes("ups")
  ) {
    return {
      category: "office_travel",
      payeeClean: cleanPayeeName(desc),
      partnerName: undefined,
      isRecurring: false,
    };
  }

  // 7. Owner Draw / Equity Distribution (STRICT: Only when explicitly stated as a draw/distribution)
  if (
    d.includes("owner draw") ||
    d.includes("partner draw") ||
    d.includes("equity draw") ||
    d.includes("equity distribution") ||
    d.includes("member distribution") ||
    d.includes("owner distribution") ||
    d.includes("partner distribution") ||
    d.includes("capital distribution")
  ) {
    let partnerName = "JOSH";
    if (d.includes("admin") || d.includes("operator")) {
      partnerName = "Admin Operator";
    } else if (d.includes("split")) {
      partnerName = "Split 50/50";
    }

    return {
      category: "owner_draw",
      payeeClean: `Owner Draw (${partnerName})`,
      partnerName,
      isRecurring: false,
    };
  }

  // 8. General Purchases & Other Operating Expenses
  // If it is a debit, it is a business purchase / operating expense.
  return {
    category: "other",
    payeeClean: cleanPayeeName(desc),
    partnerName: undefined,
    isRecurring: false,
  };
}

/**
 * Clean noisy bank descriptions into clean company/payee names
 */
export function cleanPayeeName(raw: string): string {
  let cleaned = raw
    .replace(/\b\d{4,}\b/g, "") // remove long numeric codes
    .replace(/\*+/g, " ") // replace asterisks
    .replace(/\b(pinned|signature|pos debit|pos|purchase|ach|debit card|direct dep|tfr|transfer to|transfer from|online banking|auth|recur payment|recur pymt|seq#)\b/gi, "")
    .replace(/\b\d{2}\/\d{2}\b/g, "") // remove dates like 08/01
    .replace(/\b(ca|ny|al|tx|fl|de|wa|us|usa)\b/gi, "") // remove state/country suffixes
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) cleaned = raw.trim();

  // Title case
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Parses raw CSV string into BankTransaction items
 */
export function parseBankCsv(
  csvContent: string,
  orgId: string,
  sourceFileName?: string
): BankTransaction[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Parse header line to determine column indices
  const headerLine = lines[0];
  const headers = splitCsvLine(headerLine).map((h) => h.toLowerCase().trim().replace(/["']/g, ""));

  let dateIdx = headers.findIndex((h) => h.includes("date"));
  let descIdx = headers.findIndex((h) => h.includes("desc") || h.includes("payee") || h.includes("name") || h.includes("memo"));
  let amountIdx = headers.findIndex((h) => h === "amount" || h.includes("amt"));
  let debitIdx = headers.findIndex((h) => h.includes("debit") || h.includes("withdrawal") || h.includes("charge"));
  let creditIdx = headers.findIndex((h) => h.includes("credit") || h.includes("deposit") || h.includes("inflow"));

  // Fallback default index positions if headers are generic
  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1 && debitIdx === -1) amountIdx = 2;

  const results: BankTransaction[] = [];
  const now = Date.now();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const columns = splitCsvLine(rawLine).map((c) => c.trim().replace(/^["']|["']$/g, ""));

    if (columns.length < 2) continue;

    const dateStr = columns[dateIdx] || "";
    const rawDesc = columns[descIdx] || "Bank Transaction";

    let dateTimestamp = Date.parse(dateStr);
    if (isNaN(dateTimestamp)) {
      dateTimestamp = now - i * 86400000;
    }

    let rawAmount = 0;
    let isCredit = false;

    if (debitIdx !== -1 && creditIdx !== -1) {
      const debitVal = parseFloat(columns[debitIdx]?.replace(/[^0-9.-]/g, "") || "0");
      const creditVal = parseFloat(columns[creditIdx]?.replace(/[^0-9.-]/g, "") || "0");
      if (creditVal > 0) {
        rawAmount = creditVal;
        isCredit = true;
      } else {
        rawAmount = Math.abs(debitVal);
        isCredit = false;
      }
    } else if (amountIdx !== -1) {
      const parsedVal = parseFloat(columns[amountIdx]?.replace(/[^0-9.-]/g, "") || "0");
      rawAmount = Math.abs(parsedVal);
      // In many bank exports, negative is debit and positive is credit
      isCredit = parsedVal > 0;
    }

    if (rawAmount === 0) continue;

    const { category, payeeClean, partnerName, isRecurring } = categorizeBankDescription(
      rawDesc,
      isCredit
    );

    const tx: BankTransaction = {
      id: `tx-${now}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      orgId,
      date: dateTimestamp,
      description: rawDesc,
      payeeClean,
      amount: Math.round(rawAmount * 100) / 100,
      type: isCredit ? "credit" : "debit",
      category,
      partnerName,
      isRecurring,
      importedAt: now,
      sourceFile: sourceFileName || "bank-statement.csv",
    };

    results.push(tx);
  }

  return results;
}

/**
 * Split CSV line respecting quoted strings with commas
 */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
