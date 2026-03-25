import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Resume Tailor",
  description: "Tailor your resume for any job with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${dmSans.variable} h-full antialiased font-sans`}
      >
        <body className="min-h-full flex flex-col bg-white text-slate-900 selection:bg-blue-100 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
