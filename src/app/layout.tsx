import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Lora } from "next/font/google";
import { PRODUCT_NAME } from "@/lib/config";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: `Pricing · ${PRODUCT_NAME}`,
  description: `Plans and prices for ${PRODUCT_NAME}, read live from Stripe. Built on One.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable} ${lora.variable}`}>
        {children}
      </body>
    </html>
  );
}
