import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Centurion 100Cr Engine | Revenue Milestone Prediction",
    template: "%s | Centurion 100Cr Engine",
  },
  description:
    "Calculate your path to ₹100 Crore ARR. Revenue milestone prediction platform for Indian SaaS founders.",
  keywords: [
    "SaaS",
    "revenue",
    "ARR",
    "startup",
    "India",
    "founder",
    "100 crore",
  ],
  authors: [{ name: "100Cr Engine Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Centurion 100Cr Engine",
    title: "Centurion 100Cr Engine",
    description: "Calculate your path to ₹100 Crore ARR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050A10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-centurion-dark font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
