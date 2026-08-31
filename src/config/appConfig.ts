export interface CompanyBranding {
  name: string;
  shortName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId?: string;
  primaryColor: string;
  defaultWatermark: string;
  watermarkOptions: string[];
}

export const appConfig: {
  brand: CompanyBranding;
  demoBrand: CompanyBranding;
  defaultProducts: string[];
} = {
  defaultProducts: [
    "GovStax",
    "Company Pulse",
    "StaxEcho",
    "TenantAgent",
    "Custom Software Build",
  ],
  brand: {
    name: "Staxify",
    shortName: "Staxify",
    tagline: "Layered Intelligence",
    logoUrl: "/stax-logo.png",
    address: "100 Innovation Way, Suite 400, Birmingham, AL 35203",
    phone: "(205) 555-0199",
    email: "operations@staxify.com",
    website: "https://staxify.com",
    primaryColor: "#4f46e5", // Indigo-600
    defaultWatermark: "CONFIDENTIAL",
    watermarkOptions: [
      "CONFIDENTIAL",
      "DRAFT",
      "SIGNED & EXECUTED",
      "FOR REVIEW ONLY",
      "INTERNAL USE ONLY",
    ],
  },
  demoBrand: {
    name: "StaxHQ (Demo Org)",
    shortName: "Demo CRM",
    tagline: "Live Client Presentation & Sandbox Environment",
    address: "777 Showcase Blvd, Demo City, CA 94105",
    phone: "(800) 555-DEMO",
    email: "demo@staxhq.com",
    website: "https://demo.staxhq.com",
    primaryColor: "#059669", // Emerald-600
    defaultWatermark: "DEMO SAMPLE",
    watermarkOptions: [
      "DEMO SAMPLE",
      "CONFIDENTIAL DEMO",
      "SAMPLE AGREEMENT",
      "NOT FOR EXECUTION",
    ],
  },
};
