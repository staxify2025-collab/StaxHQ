"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { TenantProvider, useTenant } from "@/lib/firebase/tenantContext";
import { AiChatDrawer } from "@/components/ai/AiChatDrawer";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useTenant();

  const isPublicPage = pathname === "/login" || pathname?.startsWith("/sign/");

  useEffect(() => {
    if (!isPublicPage && !isAuthenticated) {
      router.push("/login");
    }
  }, [isPublicPage, isAuthenticated, router]);

  if (isPublicPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        Checking authentication...
      </div>
    );
  }

  // Standalone dedicated pages (e.g. printable cardstock marketing flyer)
  if (pathname === "/flyer") {
    return (
      <main className="min-h-screen w-full bg-slate-900 print:bg-white print:p-0 print:m-0 print:w-full">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground print:block print:bg-white print:p-0 print:m-0">
      {/* Sidebar */}
      <div className="print:hidden">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 print:block print:w-full print:m-0 print:p-0">
        <div className="print:hidden">
          <TopHeader />
        </div>
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full">
          {children}
        </main>
      </div>

      {/* Floating AI Copilot Assistant */}
      <div className="print:hidden">
        <AiChatDrawer />
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </TenantProvider>
  );
}
