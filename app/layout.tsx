import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SCHOOL_NAME || "School Management System",
  description: process.env.NEXT_PUBLIC_SCHOOL_TAGLINE || "A comprehensive school management solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${sora.variable} font-sans antialiased`}
      >
        <Sidebar>{children}</Sidebar>
        <Toaster position="top-right" toastOptions={{
          style: {
            borderRadius: '12px',
            fontFamily: 'var(--font-sans)',
          }
        }} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
