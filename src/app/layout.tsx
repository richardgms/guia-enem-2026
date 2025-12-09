import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Poppins } from "next/font/google"; // Changed from localFont to google font
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Guia ENEM 2026",
  description: "Seu cronograma completo e interativo para conquistar a aprovação.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
