"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  FileText, 
  DollarSign, 
  Building2, 
  MessageSquare,
  CornerDownLeft
} from "lucide-react";
import { useTenant } from "@/lib/firebase/tenantContext";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
}

export function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const { customers, contracts, notes, activeOrg } = useTenant();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: `Hello! I'm your ${activeOrg.shortName || "StaxHQ"} AI Assistant. Ask me anything about your active customers (like Town of Rehobeth), contract values, renewals, or team notes.`,
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      if (lower.includes("rehobeth") || lower.includes("town")) {
        const rehobeth = customers.find((c) =>
          c.name.toLowerCase().includes("rehobeth")
        );
        if (rehobeth) {
          reply = `**Town of Rehobeth Summary:**\n- **Status**: ${rehobeth.status.toUpperCase()} (${rehobeth.type})\n- **Contract Value**: ${formatCurrency(rehobeth.financials.totalContractValue)} (${formatCurrency(rehobeth.financials.recurringAmount)}/${rehobeth.financials.billingCycle})\n- **Primary Contact**: ${rehobeth.contacts[0]?.name || "N/A"} (${rehobeth.contacts[0]?.email || ""})\n- **Deployments**: ${rehobeth.projects.length > 0 ? rehobeth.projects[0].name : "No active projects"}\n- **Latest Update**: City council approved maintenance retainer.`;
        } else {
          reply = `I couldn't locate a customer named 'Town of Rehobeth' in the current workspace.`;
        }
      } else if (lower.includes("financial") || lower.includes("contract value") || lower.includes("revenue") || lower.includes("mrr")) {
        const totalValue = customers.reduce(
          (acc, c) => acc + (c.financials.totalContractValue || 0),
          0
        );
        const monthlyRecurring = customers.reduce(
          (acc, c) =>
            acc +
            (c.financials.billingCycle === "monthly"
              ? c.financials.recurringAmount
              : c.financials.recurringAmount / 12),
          0
        );
        reply = `**Financial & Revenue Overview:**\n- **Total Contract Portfolio**: ${formatCurrency(totalValue)}\n- **Estimated MRR**: ${formatCurrency(monthlyRecurring)}\n- **Active Accounts**: ${customers.filter((c) => c.status === "active").length}\n- **Signed Documents**: ${contracts.filter((d) => d.status === "signed").length} executed agreements.`;
      } else if (lower.includes("renewal") || lower.includes("expire")) {
        reply = `**Upcoming Account Renewals:**\n${customers
          .filter((c) => c.financials.nextRenewalDate)
          .map(
            (c) =>
              `- **${c.name}**: Renews on ${formatDate(c.financials.nextRenewalDate)} (${formatCurrency(c.financials.recurringAmount)} / ${c.financials.billingCycle})`
          )
          .join("\n") || "No upcoming renewals scheduled."}`;
      } else if (lower.includes("contract") || lower.includes("document") || lower.includes("signed")) {
        reply = `**Documents & Contract Repository:**\nTotal Documents: ${contracts.length}\n- Signed: ${contracts.filter((d) => d.status === "signed").length}\n- Sent for Signature: ${contracts.filter((d) => d.status === "sent_for_signature").length}\n- Drafts: ${contracts.filter((d) => d.status === "draft").length}`;
      } else {
        reply = `Based on your CRM data for **${activeOrg.name}**, you have **${customers.length} total customer records** and **${contracts.length} documents** on file. Would you like a breakdown of a specific customer (e.g. Town of Rehobeth) or financial summaries?`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Sparkles className="h-5 w-5 animate-spin-slow" />
          <span className="font-semibold text-sm">AI Copilot</span>
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[550px] rounded-2xl bg-card border border-border/80 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">
                  {activeOrg.shortName || "StaxHQ"} AI Assistant
                </h3>
                <p className="text-[11px] text-white/80">
                  Natural Language CRM Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line shadow-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                <span>Analyzing CRM records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 border-t border-border/60 bg-card/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSend("Tell me about Town of Rehobeth")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Town of Rehobeth
            </button>
            <button
              onClick={() => handleSend("What are our total financials?")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Revenue Summary
            </button>
            <button
              onClick={() => handleSend("Show upcoming contract renewals")}
              className="shrink-0 px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Renewals
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border/80 bg-card flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about clients, revenue, contracts..."
              className="flex-1 bg-muted/50 border border-input rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
