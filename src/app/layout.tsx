import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "hyunscsv — Lightweight Web Spreadsheet",
  description:
    "A fast, lightweight web-based spreadsheet with Excel formula support, CSV & XLSX import/export. No installation required.",
  keywords: ["spreadsheet", "csv", "xlsx", "excel", "online", "lightweight"],
  authors: [{ name: "hyunscsv" }],
  openGraph: {
    title: "hyunscsv — Lightweight Web Spreadsheet",
    description:
      "A fast, lightweight web-based spreadsheet with Excel formula support.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
