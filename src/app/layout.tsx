import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StaxHQ — Enterprise Client, Contract & Financial CRM",
  description:
    "Purpose-built B2B CRM, Document & E-Signature Hub, and Financial Management Platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
