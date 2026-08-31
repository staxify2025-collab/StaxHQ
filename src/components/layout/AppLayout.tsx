"use client";

import React from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { TenantProvider } from "@/lib/firebase/tenantContext";
import { AiChatDrawer } from "@/components/ai/AiChatDrawer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Floating AI Copilot Assistant */}
        <AiChatDrawer />
      </div>
    </TenantProvider>
  );
}
