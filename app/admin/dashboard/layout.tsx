import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-dash-numeric",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className={spaceGrotesk.variable}>{children}</div>;
}
