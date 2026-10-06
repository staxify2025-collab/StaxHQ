"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Printer, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  CreditCard, 
  FileText, 
  Smartphone, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  Globe, 
  Edit3, 
  Check, 
  RotateCcw,
  Database,
  Code2,
  Cpu,
  Layers,
  MapPin
} from "lucide-react";

interface FlyerData {
  headerBadgeTitle: string;
  headerBadgeSub: string;
  heroTag: string;
  heroHeadline: string;
  heroDescription: string;
  
  // Pillars
  p1Title: string;
  p1Desc: string;
  p1Tag: string;
  
  p2Title: string;
  p2Desc: string;
  p2Tag: string;
  
  p3Title: string;
  p3Desc: string;
  p3Tag: string;
  
  // Capabilities
  cap1Title: string;
  cap1Desc: string;
  cap2Title: string;
  cap2Desc: string;
  cap3Title: string;
  cap3Desc: string;
  cap4Title: string;
  cap4Desc: string;
  
  // Comparison Matrix
  comp1Req: string;
  comp1Legacy: string;
  comp1Staxify: string;
  
  comp2Req: string;
  comp2Legacy: string;
  comp2Staxify: string;
  
  comp3Req: string;
  comp3Legacy: string;
  comp3Staxify: string;
  
  comp4Req: string;
  comp4Legacy: string;
  comp4Staxify: string;
  
  // CTA
  ctaTag: string;
  ctaHeadline: string;
  ctaDesc: string;
  founder1Title: string;
  founder1Email: string;
  founder2Title: string;
  founder2Email: string;
  website: string;
  location: string;
}

const DEFAULT_FLYER_DATA: FlyerData = {
  headerBadgeTitle: "YOUR LOCAL ALABAMA TECH PARTNER",
  headerBadgeSub: "Based in South East AL • Face-to-Face Support",
  heroTag: "HIGH-VELOCITY CUSTOM SOFTWARE & AI",
  heroHeadline: "Custom Software Built Right Here in Alabama.",
  heroDescription: "Eliminate repetitive paperwork, replace outdated legacy software, and empower your team with tailored web applications and AI-driven cloud automation.",
  
  // Pillar 1
  p1Title: "Custom Customer Apps",
  p1Desc: "Custom web apps, PWAs, client portals, and real-time operational workflows built to your exact business specifications in weeks, not months.",
  p1Tag: "Rapid Working MVP",
  
  // Pillar 2
  p2Title: "AI Data Migrations",
  p2Desc: "Automated data extraction and pipeline modernization. Transition messy spreadsheets and legacy databases into high-speed real-time cloud architectures.",
  p2Tag: "Zero-Downtime Pipeline",
  
  // Pillar 3
  p3Title: "GovStax Municipal Suite",
  p3Desc: "Turnkey civic platforms with 24/7 online bill pay, 3-1-1 citizen service tracking, public records archives, and 100% DOJ ADA Title II certified legal protection.",
  p3Tag: "Certified WCAG 2.2 AA",

  // Key Capabilities
  cap1Title: "Custom Business Apps & Portals",
  cap1Desc: "Tailored customer portals, internal CRM/ERP dashboards, and mobile-ready progressive web apps.",
  cap2Title: "AI-Powered Data Modernization",
  cap2Desc: "Automated legacy database extraction, intelligent data cleaning, and real-time Firestore cloud synchronization.",
  cap3Title: "Automated Invoicing & Financials",
  cap3Desc: "Auto-calculating retainers, multi-year recurring billing schedules, and 1-click digital dispatch.",
  cap4Title: "Local Face-to-Face Engineering",
  cap4Desc: "Direct partnership with local Alabama senior architects and founders — zero offshore lag or agency runaround.",

  // Comparison Matrix
  comp1Req: "Delivery Timeline",
  comp1Legacy: "❌ 6 to 12 months with endless scope delays",
  comp1Staxify: "⚡ Interactive Working MVP in 2 to 4 Weeks",

  comp2Req: "Team & Accountability",
  comp2Legacy: "❌ Outsourced offshore devs & junior staff",
  comp2Staxify: "🇺🇸  AL Local Techs • In-Person Collaboration",

  comp3Req: "AI & Cloud Architecture",
  comp3Legacy: "❌ Outdated WordPress plugins & fragile databases",
  comp3Staxify: "🧠 Next-Gen Cloud, Real-Time Sync & AI Automation",

  comp4Req: "Support & Relationship",
  comp4Legacy: "❌ Expensive change orders & ticketing queues",
  comp4Staxify: "🤝 Direct Founder Access, Ongoing Strategic Care",

  // CTA
  ctaTag: "FREE DISCOVERY & PROTOTYPE SESSION",
  ctaHeadline: "Ready to Build or Modernize? Let's Talk.",
  ctaDesc: "Schedule a zero-obligation discovery session. We'll analyze your workflows and build an interactive working prototype tailored specifically to your organization at no cost.",
  founder1Title: "Jeff Norris — Co-Founder",
  founder1Email: "jeff@staxifytech.com",
  founder2Title: "Josh Jackson — Co-Founder",
  founder2Email: "jjackson@staxifytech.com",
  website: "staxifytech.com",
  location: "Alabama"
};

const PRESETS: Record<string, { name: string; data: Partial<FlyerData> }> = {
  universal: {
    name: "Standard Business Flyer (South East AL)",
    data: DEFAULT_FLYER_DATA,
  },
  govstax: {
    name: "GovStax Civic & Municipal Focus",
    data: {
      ...DEFAULT_FLYER_DATA,
      headerBadgeTitle: "DOJ ADA TITLE II & WCAG 2.2 AA",
      headerBadgeSub: "100% Certified Legal Compliance",
      heroHeadline: "Upgrade Your Town's Digital Services in Minutes with GovStax.",
      heroDescription: "Empower citizens with 24/7 online bill pay, 3-1-1 concern reporting, and accessible public records — with zero IT maintenance and guaranteed DOJ accessibility compliance.",
      p1Title: "24/7 Resident Bill Pay",
      p1Desc: "Seamless online payment portal for water, utility bills, permits, and business licenses.",
      p2Title: "Turnkey Setup in Minutes",
      p2Desc: "Automated onboarding configures town departments, forms, and council meeting archives into an interactive portal.",
      p3Title: "Guaranteed ADA Compliance",
      p3Desc: "Meets federal DOJ Title II rules out-of-the-box. Protects your town from digital accessibility lawsuits."
    }
  }
};

export default function FlyerPage() {
  const [flyerData, setFlyerData] = useState<FlyerData>(DEFAULT_FLYER_DATA);
  const [selectedPreset, setSelectedPreset] = useState<string>("universal");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = PRESETS[presetKey];
    if (preset) {
      setFlyerData({ ...DEFAULT_FLYER_DATA, ...preset.data });
    }
  };

  const handleFieldChange = (field: keyof FlyerData, value: string | null) => {
    if (value !== null) {
      setFlyerData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleReset = () => {
    setFlyerData(DEFAULT_FLYER_DATA);
    setSelectedPreset("universal");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 font-sans p-4 sm:p-6 print:p-0 print:bg-white print:m-0">
      {/* Strict CSS rules to eliminate browser margins, timestamp headers, and bottom URL footers */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: letter portrait;
          margin: 0 !important;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            height: 100% !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-canvas {
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            box-sizing: border-box !important;
            padding: 0.35in 0.45in !important;
            margin: 0 auto !important;
            overflow: hidden !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}} />

      {/* ========================================================================= */}
      {/* SCREEN-ONLY CONTROLS TOOLBAR */}
      {/* ========================================================================= */}
      <div className="max-w-[8.5in] mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-slate-800/95 backdrop-blur border border-slate-700 p-3.5 rounded-xl shadow-2xl text-white print:hidden">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-700/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {/* Preset Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Preset:</span>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-slate-900 border border-slate-600 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {Object.entries(PRESETS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>
          </div>

          {/* Edit Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              isEditing 
                ? "bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400" 
                : "bg-slate-700 hover:bg-slate-600 text-slate-200"
            }`}
          >
            {isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditing ? "Finish Editing" : "Edit Flyer Text"}</span>
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-rose-300 hover:bg-slate-700/60 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10.5px] font-bold text-emerald-400 uppercase tracking-wider">1-Page Card Stock</div>
            <div className="text-[9.5px] text-slate-400">8.5" × 11" US Letter</div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all inline-flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Flyer / PDF</span>
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="max-w-[8.5in] mx-auto mb-3 bg-amber-50 border border-amber-300 text-amber-950 px-3.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between print:hidden">
          <span>
            ✏️ <strong>Live Edit Mode:</strong> Click any text area below to customize headlines, descriptions, or contact emails before printing.
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-xs transition-colors cursor-pointer"
          >
            Done Editing
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8.5" x 11" CARD-STOCK PRINT CANVAS */}
      {/* ========================================================================= */}
      <div 
        className="print-canvas w-full max-w-[8.5in] mx-auto bg-white text-slate-900 shadow-2xl rounded-xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden box-border"
        style={{
          minHeight: "10.5in",
          maxHeight: "10.85in",
          printColorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* Top Decorative Indigo & Cyan Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0F1E36] via-[#3730A3] to-[#0284C7]" />

        {/* ----------------------------------------------------------------------- */}
        {/* UPPER BODY: LETTERHEAD, HERO, PILLARS, CAPABILITIES, COMPARISON MATRIX */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-3.5">
          
          {/* LETTERHEAD HEADER */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200">
            {/* Top Left: Staxify Logo & Layered Intelligence */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 overflow-hidden shrink-0">
                <img
                  src="/stax-logo.png"
                  alt="Staxify Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-2xl tracking-tight text-[#0F1E36]">
                    Staxify
                  </span>
                </div>
                <p className="text-[10px] text-[#0284C7] font-black tracking-widest uppercase">
                  Layered Intelligence
                </p>
              </div>
            </div>

            {/* Top Right: Local Tech Partner Badge */}
            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50/90 border border-indigo-200 rounded-lg text-indigo-950 text-right">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("headerBadgeTitle", e.currentTarget.textContent)}
                    className={`text-[10px] font-black leading-tight uppercase tracking-wider text-indigo-900 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.headerBadgeTitle}
                  </div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("headerBadgeSub", e.currentTarget.textContent)}
                    className={`text-[8.5px] font-bold text-indigo-700 leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.headerBadgeSub}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EXECUTIVE HERO VALUE PROPOSITION */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#0F1E36] via-[#1E1B4B] to-[#312E81] text-white rounded-xl shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("heroTag", e.currentTarget.textContent)}
                  className={`text-[10px] font-black uppercase tracking-widest text-amber-300 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                >
                  {flyerData.heroTag}
                </span>
              </div>
              <h1 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleFieldChange("heroHeadline", e.currentTarget.textContent)}
                className={`text-lg sm:text-[19px] font-black tracking-tight leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400 p-0.5 rounded" : ""}`}
              >
                {flyerData.heroHeadline}
              </h1>
              <p 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleFieldChange("heroDescription", e.currentTarget.textContent)}
                className={`text-xs sm:text-[12px] text-slate-200 font-medium leading-relaxed mt-1 ${isEditing ? "outline-dashed outline-1 outline-amber-400 p-0.5 rounded" : ""}`}
              >
                {flyerData.heroDescription}
              </p>
            </div>
          </div>

          {/* 3 CORE VALUE PILLARS (3-COLUMN GRID) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Pillar 1 */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h2 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("p1Title", e.currentTarget.textContent)}
                  className={`text-xs sm:text-[12px] font-black text-[#0F1E36] uppercase tracking-wide leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                >
                  {flyerData.p1Title}
                </h2>
                <p 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("p1Desc", e.currentTarget.textContent)}
                  className={`text-[10.5px] text-slate-600 mt-1.5 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                >
                  {flyerData.p1Desc}
                </p>
              </div>
              <div 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleFieldChange("p1Tag", e.currentTarget.textContent)}
                className={`mt-2 pt-2 border-t border-slate-200 flex items-center gap-1 text-[9.5px] font-black text-indigo-700 uppercase ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {flyerData.p1Tag}
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center mb-2">
                  <Database className="w-4 h-4" />
                </div>
                <h2 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("p2Title", e.currentTarget.textContent)}
                  className={`text-xs sm:text-[12px] font-black text-[#0F1E36] uppercase tracking-wide leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                >
                  {flyerData.p2Title}
                </h2>
                <p 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("p2Desc", e.currentTarget.textContent)}
                  className={`text-[10.5px] text-slate-600 mt-1.5 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                >
                  {flyerData.p2Desc}
                </p>
              </div>
              <div 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleFieldChange("p2Tag", e.currentTarget.textContent)}
                className={`mt-2 pt-2 border-t border-slate-200 flex items-center gap-1 text-[9.5px] font-black text-sky-700 uppercase ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {flyerData.p2Tag}
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("p3Title", e.currentTarget.textContent)}
                  className={`text-xs sm:text-[12px] font-black text-[#0F1E36] uppercase tracking-wide leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                >
                  {flyerData.p3Title}
                </h2>
                <p 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("p3Desc", e.currentTarget.textContent)}
                  className={`text-[10.5px] text-slate-600 mt-1.5 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                >
                  {flyerData.p3Desc}
                </p>
              </div>
              <div 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleFieldChange("p3Tag", e.currentTarget.textContent)}
                className={`mt-2 pt-2 border-t border-slate-200 flex items-center gap-1 text-[9.5px] font-black text-emerald-800 uppercase ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {flyerData.p3Tag}
              </div>
            </div>
          </div>

          {/* 4 CAPABILITIES GRID */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="text-[10.5px] font-black uppercase tracking-wider text-[#0F1E36] flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full-Stack Engineering & AI Automation Suite</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Capability 1 */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Code2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap1Title", e.currentTarget.textContent)}
                    className={`text-[11px] font-black text-[#0F1E36] leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap1Title}
                  </div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap1Desc", e.currentTarget.textContent)}
                    className={`text-[9.5px] text-slate-600 mt-0.5 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap1Desc}
                  </div>
                </div>
              </div>

              {/* Capability 2 */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap2Title", e.currentTarget.textContent)}
                    className={`text-[11px] font-black text-[#0F1E36] leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap2Title}
                  </div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap2Desc", e.currentTarget.textContent)}
                    className={`text-[9.5px] text-slate-600 mt-0.5 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap2Desc}
                  </div>
                </div>
              </div>

              {/* Capability 3 */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap3Title", e.currentTarget.textContent)}
                    className={`text-[11px] font-black text-[#0F1E36] leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap3Title}
                  </div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap3Desc", e.currentTarget.textContent)}
                    className={`text-[9.5px] text-slate-600 mt-0.5 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap3Desc}
                  </div>
                </div>
              </div>

              {/* Capability 4 */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap4Title", e.currentTarget.textContent)}
                    className={`text-[11px] font-black text-[#0F1E36] leading-tight ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap4Title}
                  </div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("cap4Desc", e.currentTarget.textContent)}
                    className={`text-[9.5px] text-slate-600 mt-0.5 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.cap4Desc}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COMPARISON MATRIX */}
          <div className="overflow-hidden border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[#0F1E36] uppercase text-[9px] font-black tracking-wider border-b border-slate-200">
                  <th className="p-2 border-r border-slate-200">Execution Factor</th>
                  <th className="p-2 border-r border-slate-200 text-rose-800">Traditional Agencies / Legacy IT</th>
                  <th className="p-2 text-indigo-900 font-black">Staxify (Layered Intelligence)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                <tr>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp1Req", e.currentTarget.textContent)}
                    className={`p-2 font-bold border-r border-slate-200 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp1Req}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp1Legacy", e.currentTarget.textContent)}
                    className={`p-2 border-r border-slate-200 text-rose-700 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp1Legacy}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp1Staxify", e.currentTarget.textContent)}
                    className={`p-2 text-indigo-900 font-black ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp1Staxify}
                  </td>
                </tr>
                <tr>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp2Req", e.currentTarget.textContent)}
                    className={`p-2 font-bold border-r border-slate-200 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp2Req}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp2Legacy", e.currentTarget.textContent)}
                    className={`p-2 border-r border-slate-200 text-slate-500 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp2Legacy}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp2Staxify", e.currentTarget.textContent)}
                    className={`p-2 text-indigo-900 font-black ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp2Staxify}
                  </td>
                </tr>
                <tr>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp3Req", e.currentTarget.textContent)}
                    className={`p-2 font-bold border-r border-slate-200 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp3Req}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp3Legacy", e.currentTarget.textContent)}
                    className={`p-2 border-r border-slate-200 text-slate-500 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp3Legacy}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp3Staxify", e.currentTarget.textContent)}
                    className={`p-2 text-indigo-900 font-black ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp3Staxify}
                  </td>
                </tr>
                <tr>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp4Req", e.currentTarget.textContent)}
                    className={`p-2 font-bold border-r border-slate-200 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp4Req}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp4Legacy", e.currentTarget.textContent)}
                    className={`p-2 border-r border-slate-200 text-slate-500 ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp4Legacy}
                  </td>
                  <td 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("comp4Staxify", e.currentTarget.textContent)}
                    className={`p-2 text-indigo-900 font-black ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.comp4Staxify}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CALL TO ACTION & FOUNDER CONTACT FOOTER BANNER */}
        {/* ----------------------------------------------------------------------- */}
        <div className="mt-3.5 p-3.5 sm:p-4 bg-gradient-to-br from-slate-950 via-[#0F1E36] to-[#1E1B4B] text-white rounded-xl shadow-xl flex items-center justify-between gap-4">
          
          <div className="space-y-1 flex-1">
            <div 
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleFieldChange("ctaTag", e.currentTarget.textContent)}
              className={`inline-block px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
            >
              {flyerData.ctaTag}
            </div>
            <h3 
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleFieldChange("ctaHeadline", e.currentTarget.textContent)}
              className={`text-sm sm:text-base font-black uppercase tracking-tight text-white ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
            >
              {flyerData.ctaHeadline}
            </h3>
            <p 
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleFieldChange("ctaDesc", e.currentTarget.textContent)}
              className={`text-[10px] sm:text-[10.5px] text-slate-300 leading-snug ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
            >
              {flyerData.ctaDesc}
            </p>

            {/* Direct Founder Contacts */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] border-t border-slate-800/80 mt-1.5">
              {/* Founder 1 */}
              <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("founder1Title", e.currentTarget.textContent)}
                    className={`font-bold text-white text-[10px] ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.founder1Title}
                  </div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("founder1Email", e.currentTarget.textContent)}
                    className={`text-indigo-300 text-[9.5px] font-mono ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.founder1Email}
                  </div>
                </div>
              </div>

              {/* Founder 2 */}
              <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("founder2Title", e.currentTarget.textContent)}
                    className={`font-bold text-white text-[10px] ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.founder2Title}
                  </div>
                  <div 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleFieldChange("founder2Email", e.currentTarget.textContent)}
                    className={`text-indigo-300 text-[9.5px] font-mono ${isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}`}
                  >
                    {flyerData.founder2Email}
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Website Footer Line */}
            <div className="pt-1 flex flex-wrap items-center justify-between text-[9.5px] text-slate-400">
              <span className="inline-flex items-center gap-1 text-slate-300">
                <Globe className="w-3 h-3 text-sky-400" />
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("website", e.currentTarget.textContent)}
                  className={isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}
                >
                  {flyerData.website}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleFieldChange("location", e.currentTarget.textContent)}
                  className={isEditing ? "outline-dashed outline-1 outline-amber-400" : ""}
                >
                  {flyerData.location}
                </span>
              </span>
            </div>
          </div>

          {/* Staxify Clean White Logo Card */}
          <div className="bg-white p-2.5 rounded-xl shadow-md flex flex-col items-center justify-center shrink-0 border border-slate-200 min-w-[125px] max-w-[140px] text-center">
            <div className="h-10 w-10 rounded-lg bg-slate-950 p-1 flex items-center justify-center text-white mb-1">
              <img
                src="/stax-logo.png"
                alt="Staxify"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-xs font-black text-slate-900 tracking-tight">Staxify</div>
            <div className="text-[8px] font-bold text-indigo-600 tracking-widest uppercase">Layered Intelligence</div>
          </div>

        </div>

      </div>

    </div>
  );
}
