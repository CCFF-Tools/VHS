import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "VHS Ops Flow",
  description: "Data Is Beautiful dashboard for VHS tape digitization",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${plexMono.variable} font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
