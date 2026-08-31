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

  return (
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
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </TenantProvider>
  );
}
