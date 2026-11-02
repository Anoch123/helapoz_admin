
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { BASICSYSTEMDATA } from "@/lib/constants/helper-constants";

export const metadata: Metadata = {
  title: BASICSYSTEMDATA.appName,
  description: BASICSYSTEMDATA.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-mono tabular-nums ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
