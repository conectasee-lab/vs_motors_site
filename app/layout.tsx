import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialAndMap from "@/components/SocialAndMap";
import SocialAndMapGate from "@/components/SocialAndMapGate";
import FooterGate from "@/components/FooterGate";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import SmoothScroll from "@/components/SmoothScroll";
import MetaPixel from "@/components/MetaPixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VS Motors",
  description: "Seminovos e usados em jundiaí e região",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <MetaPixel />
        <Header />
        <main className="min-h-screen flex-1">{children}</main>
        <SocialAndMapGate>
          <SocialAndMap />
        </SocialAndMapGate>
        <FooterGate>
          <Footer />
        </FooterGate>
        <FloatingWhatsAppButton />
      </body>
    </html>
  );
}
